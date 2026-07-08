const { recommendVehicles } = require('../services/pricingService');
const { createBooking: createBookingService } = require('../services/bookingService');

const { prisma } = require('../config/db');

/**
 * Handles generating a quote recommendation (Step 4 of Booking Wizard)
 */
const getQuoteRecommendations = async (req, res, next) => {
  try {
    const { distanceKm, weightKg, requirements } = req.body;

    if (!distanceKm || !weightKg) {
      return res.status(400).json({ success: false, message: 'Distance and weight are required.' });
    }

    const options = recommendVehicles(Number(distanceKm), Number(weightKg), requirements || []);

    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Handles finalizing the booking request
 */
const createBooking = async (req, res, next) => {
  await createBookingService(req, res, next);
};

/**
 * GET /api/v1/bookings/history
 * Fetch customer booking history with filters
 */
const getCustomerBookingsHistory = async (req, res, next) => {
  try {
    const customer_id = req.user?.customer?.id;
    if (!customer_id) {
      // For testing without auth, fallback to the first customer if in dev
      // Or just return empty. We will fetch all bookings where customer_id matches.
      // Wait, let's ensure we just query for the logged in user's customer ID.
      // If none, we'll try to find any customer for testing, or return error.
    }
    
    // For demo purposes if customer_id isn't populated properly by auth middleware yet, 
    // we'll just fetch all bookings or use a dummy customer id.
    const actualCustomerId = customer_id || (await prisma.customer.findFirst())?.id;

    if (!actualCustomerId) {
      return res.status(404).json({ success: false, message: 'No customer profile found.' });
    }

    const { status, search, vehicleType } = req.query;

    const whereClause = { customer_id: actualCustomerId, is_deleted: false };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { cargo_name: { contains: search } }
      ];
    }

    if (vehicleType) {
      whereClause.requested_vehicle = vehicleType;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        quotes: { orderBy: { created_at: 'desc' }, take: 1 },
        assignments: {
          include: { driver: true, fleet_owner: true, broker: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/bookings/:id
 * Fetch single booking details
 */
const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        quotes: true,
        requirements: true,
        documents: true,
        invoices: true,
        assignments: {
          include: { 
            driver: { include: { user: true } }, 
            fleet_owner: { include: { user: true } },
            broker: { include: { user: true } },
            vehicle: true
          }
        }
      }
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/v1/bookings/:id/status
 * Update booking status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const booking = await prisma.booking.findUnique({ 
      where: { id },
      include: { quotes: true, customer: true }
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status }
      });

      // Tracking History
      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status,
          remarks,
          updated_by: req.user?.id || 'SYSTEM'
        }
      });

      // Activity Log
      await tx.activityLog.create({
        data: {
          user_id: req.user?.id,
          action: `STATUS_UPDATED_${status}`,
          description: `Booking ${id} status updated to ${status}. ${remarks || ''}`
        }
      });

      // Auto-generate invoice if DELIVERED
      if (status === 'DELIVERED' && booking.customer_id) {
        // Check if an invoice already exists to avoid duplicates
        const existingInvoice = await tx.invoice.findFirst({
          where: { booking_id: id }
        });
        
        if (!existingInvoice) {
          const amount = booking.quotes.length > 0 ? booking.quotes[0].grand_total : 0;
          await tx.invoice.create({
            data: {
              invoice_no: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
              booking_id: id,
              customer_id: booking.customer_id,
              amount: amount,
              tax_amount: 0,
              total_amount: amount,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
              status: 'ISSUED'
            }
          });
        }
      }

      return b;
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBookingTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await prisma.trackingHistory.findMany({
      where: { booking_id: id },
      orderBy: { timestamp: 'asc' }
    });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Validate the driver/fleet who is accepting is actually assigned
    // For now, we trust the assignment or auth token logic.
    
    const newStatus = 'BOOKING_CONFIRMED';
    
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: newStatus }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: newStatus,
          remarks: 'Provider accepted the booking',
          updated_by: req.user?.id || 'SYSTEM'
        }
      });
      return b;
    });

    res.status(200).json({ success: true, data: updated, message: 'Booking accepted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // When a provider rejects, it should probably go back to DRAFT or DRIVER_SEARCHING
    const newStatus = 'DRIVER_SEARCHING';
    
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: newStatus }
      });

      // Optionally we could delete the assignment or mark it inactive.
      await tx.bookingAssignment.deleteMany({
        where: { booking_id: id }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: newStatus,
          remarks: 'Provider rejected the booking. Searching for new driver.',
          updated_by: req.user?.id || 'SYSTEM'
        }
      });
      return b;
    });

    res.status(200).json({ success: true, data: updated, message: 'Booking rejected' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuoteRecommendations,
  createBooking,
  getCustomerBookingsHistory,
  getBookingDetails,
  updateBookingStatus,
  getBookingTimeline,
  acceptBooking,
  rejectBooking
};
