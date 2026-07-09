const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getQuoteRequests = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'QUOTE_REQUESTED'
      },
      include: {
        customer: { include: { user: true } },
        quotes: {
          where: { prepared_by: req.user.id }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitQuote = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      vehicle_rate,
      weight_charges,
      fuel_charges,
      insurance_charges,
      hazard_charge,
      discount
    } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const subtotal = Number(vehicle_rate || 0) + 
                     Number(weight_charges || 0) + 
                     Number(fuel_charges || 0) + 
                     Number(insurance_charges || 0) + 
                     Number(hazard_charge || 0) - 
                     Number(discount || 0);
    
    const broker_fee = subtotal * 0.05;
    const platform_fee = subtotal * 0.10;
    const tax = subtotal * 0.15; 
    const grand_total = subtotal + broker_fee + platform_fee + tax;

    const quote = await prisma.quote.create({
      data: {
        booking_id: bookingId,
        vehicle_rate: vehicle_rate || 0,
        weight_charges: weight_charges || 0,
        fuel_charges: fuel_charges || 0,
        insurance_charges: insurance_charges || 0,
        hazard_charge: hazard_charge || 0,
        platform_fee,
        broker_fee,
        tax,
        discount: discount || 0,
        grand_total,
        status: 'ISSUED',
        prepared_by: req.user.id
      }
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'QUOTE_PREPARED' }
    });

    res.status(201).json({ success: true, data: quote, message: 'Quote submitted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAssignedLoads = async (req, res) => {
  try {
    const broker = await prisma.broker.findUnique({
      where: { user_id: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        status: { notIn: ['DRAFT', 'QUOTE_REQUESTED', 'QUOTE_PREPARED'] }
      },
      include: {
        customer: { include: { user: true } },
        assignments: {
          include: {
            driver: { include: { user: true } },
            fleet_owner: { include: { user: true } },
            vehicle: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const mapped = bookings.map(b => {
      const activeAssignment = b.assignments.find(a => a.status === 'ACTIVE') || b.assignments[0] || null;
      return {
        ...b,
        assignment: activeAssignment ? {
          driver: activeAssignment.driver,
          fleet_owner: activeAssignment.fleet_owner,
          vehicle: activeAssignment.vehicle,
          status: activeAssignment.status
        } : null
      };
    });

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const broker = await prisma.broker.findUnique({
      where: { user_id: req.user.id }
    });

    const pendingQuotes = await prisma.quote.count({
      where: { prepared_by: req.user.id, status: 'ISSUED' }
    });

    const acceptedQuotes = await prisma.quote.count({
      where: { prepared_by: req.user.id, status: 'ACCEPTED' }
    });

    const activeBookings = broker ? await prisma.bookingAssignment.count({
      where: { 
        broker_id: broker.id, 
        booking: { status: { notIn: ['COMPLETED', 'CANCELLED', 'DELIVERED', 'CLOSED'] } } 
      }
    }) : 0;

    const completedBookings = broker ? await prisma.bookingAssignment.count({
      where: { 
        broker_id: broker.id, 
        booking: { status: 'COMPLETED' } 
      }
    }) : 0;

    const wallet = await prisma.wallet.findFirst({
      where: { user_id: req.user.id }
    });

    res.status(200).json({
      success: true,
      data: {
        pendingQuotes,
        acceptedQuotes,
        activeBookings,
        completedBookings,
        walletBalance: wallet ? Number(wallet.balance) : 0,
        pendingBalance: wallet ? Number(wallet.pending_balance) : 0
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCommissions = async (req, res) => {
  try {
    const commissions = await prisma.commission.findMany({
      where: { earned_by_user_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: commissions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const broker = await prisma.broker.findUnique({
      where: { user_id: req.user.id }
    });

    if (!broker) return res.status(200).json({ success: true, data: [] });

    const assignments = await prisma.bookingAssignment.findMany({
      where: { broker_id: broker.id },
      include: {
        booking: {
          include: { customer: { include: { user: true } } }
        }
      }
    });

    const customerMap = new Map();
    assignments.forEach(a => {
      if (a.booking.customer) {
        customerMap.set(a.booking.customer.id, a.booking.customer);
      }
    });

    res.status(200).json({ success: true, data: Array.from(customerMap.values()) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const assignFleet = async (req, res) => {
  try {
    const { id } = req.params;
    const { fleetOwnerId } = req.body;

    const broker = await prisma.broker.findUnique({
      where: { user_id: req.user.id }
    });
    if (!broker) return res.status(403).json({ success: false, message: 'Broker profile not found' });

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    await prisma.$transaction(async (tx) => {
      await tx.bookingAssignment.updateMany({
        where: { booking_id: id, status: 'ACTIVE' },
        data: { status: 'INACTIVE' }
      });

      await tx.bookingAssignment.create({
        data: {
          booking_id: id,
          fleet_owner_id: fleetOwnerId,
          broker_id: broker.id,
          assigned_by: req.user.id,
          status: 'PENDING'
        }
      });

      await tx.booking.update({
        where: { id },
        data: { status: 'BOOKING_CONFIRMED' }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: 'BOOKING_CONFIRMED',
          remarks: 'Broker assigned booking to Fleet Owner',
          updated_by: req.user.id
        }
      });
    });

    res.status(200).json({ success: true, message: 'Assigned to Fleet Owner successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const broker = await prisma.broker.findUnique({
      where: { user_id: req.user.id }
    });
    if (!broker) return res.status(403).json({ success: false, message: 'Broker profile not found' });

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    await prisma.$transaction(async (tx) => {
      await tx.bookingAssignment.updateMany({
        where: { booking_id: id, status: 'ACTIVE' },
        data: { status: 'INACTIVE' }
      });

      await tx.bookingAssignment.create({
        data: {
          booking_id: id,
          driver_id: driverId,
          broker_id: broker.id,
          assigned_by: req.user.id,
          status: 'PENDING'
        }
      });

      await tx.booking.update({
        where: { id },
        data: { status: 'DRIVER_ASSIGNED' }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: 'DRIVER_ASSIGNED',
          remarks: 'Broker assigned booking to Independent Driver',
          updated_by: req.user.id
        }
      });
    });

    res.status(200).json({ success: true, message: 'Assigned to Independent Driver successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getApprovedFleetOwners = async (req, res) => {
  try {
    const fleetOwners = await prisma.user.findMany({
      where: { role: 'FLEET_OWNER', status: 'ACTIVE' },
      include: { fleet_owner: true }
    });
    res.status(200).json({ success: true, data: fleetOwners });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getApprovedDrivers = async (req, res) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: 'DRIVER', status: 'ACTIVE' },
      include: { driver: { include: { profile: true } } }
    });
    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuoteRequests,
  submitQuote,
  getAssignedLoads,
  getDashboardStats,
  getCommissions,
  getCustomers,
  assignFleet,
  assignDriver,
  getApprovedFleetOwners,
  getApprovedDrivers
};
