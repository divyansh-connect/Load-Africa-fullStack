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
    // Get the customer ID from the authenticated user
    let customer_id = req.user?.customer?.id;
    
    // If not directly attached by middleware, look it up from user ID
    if (!customer_id && req.user?.id) {
      const customer = await prisma.customer.findUnique({
        where: { user_id: req.user.id }
      });
      customer_id = customer?.id;
    }

    if (!customer_id) {
      return res.status(401).json({ success: false, message: 'Customer profile not found for this account.' });
    }

    const { status, search, vehicleType } = req.query;

    const whereClause = { customer_id, is_deleted: false };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { cargo_name: { contains: search, mode: 'insensitive' } }
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
          include: { 
            driver: { include: { user: true } }, 
            fleet_owner: { include: { user: true } }, 
            broker: true,
            vehicle: true
          }
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
        telemetry: true,
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

      if (status === 'CUSTOMER_ACCEPTED' || status === 'BOOKING_CONFIRMED') {
        await tx.quote.updateMany({
          where: { booking_id: id },
          data: { status: 'ACCEPTED' }
        });
      }

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

      // Auto-generate invoice and pay split if status becomes COMPLETED
      if (status === 'COMPLETED') {
        const existingInvoice = await tx.invoice.findFirst({
          where: { booking_id: id }
        });
        
        if (!existingInvoice) {
          const grandTotal = booking.quotes.length > 0 ? Number(booking.quotes[0].grand_total) : 0;
          const platformComm = grandTotal * 0.10;
          const payoutAmount = grandTotal * 0.90;

          const invoice = await tx.invoice.create({
            data: {
              invoice_no: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
              booking_id: id,
              customer_id: booking.customer_id,
              amount: grandTotal - platformComm,
              tax_amount: 0,
              total_amount: grandTotal,
              platform_commission: platformComm,
              payout_amount: payoutAmount,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
              status: 'PAID'
            }
          });

          // Create mock Payment confirmation
          await tx.payment.create({
            data: {
              invoice_id: invoice.id,
              amount: grandTotal,
              payment_method: 'CARD',
              transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'PAID'
            }
          });

          // Resolve Transporter to credit payout to their Wallet!
          const assignment = await tx.bookingAssignment.findFirst({
            where: { booking_id: id, status: 'ACTIVE' }
          });

          let payeeUserId = null;
          if (assignment) {
            if (assignment.fleet_owner_id) {
              const fleetOwner = await tx.fleetOwner.findUnique({
                where: { id: assignment.fleet_owner_id }
              });
              if (fleetOwner) payeeUserId = fleetOwner.user_id;
            } else if (assignment.driver_id) {
              const driver = await tx.driver.findUnique({
                where: { id: assignment.driver_id }
              });
              if (driver) payeeUserId = driver.user_id;
            }
          }

          if (payeeUserId) {
            let wallet = await tx.wallet.findFirst({
              where: { user_id: payeeUserId }
            });

            if (!wallet) {
              wallet = await tx.wallet.create({
                data: {
                  user_id: payeeUserId,
                  balance: 0,
                  pending_balance: 0
                }
              });
            }

            await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: { increment: payoutAmount }
              }
            });

            await tx.walletTransaction.create({
              data: {
                wallet_id: wallet.id,
                type: 'CREDIT',
                amount: payoutAmount,
                description: `Payout for load delivery (Booking ID: ${id.slice(0, 8)})`,
                reference_id: id
              }
            });
          }
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
