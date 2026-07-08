const { prisma } = require('../config/db');

// Helper to get actual driver ID (assuming auth middleware sets it)
const getDriverId = async (req) => {
  if (req.user?.driver?.id) return req.user.driver.id;
  // Fallback for dev without strict auth
  const driver = await prisma.driver.findFirst();
  return driver ? driver.id : null;
};

const getAvailableLoads = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(404).json({ success: false, message: 'Driver profile not found' });

    // In a real app, we would match based on driver's assigned vehicle type and location.
    // For now, fetch bookings where status = DRIVER_SEARCHING
    const loads = await prisma.booking.findMany({
      where: {
        status: 'DRIVER_SEARCHING',
        is_deleted: false,
        // Optional: exclude loads this driver already applied to
        applications: {
          none: { driver_id: driverId }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: loads });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const applyForLoad = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const driverId = await getDriverId(req);
    
    if (!driverId) return res.status(404).json({ success: false, message: 'Driver profile not found' });

    // Check if booking is still available
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status !== 'DRIVER_SEARCHING') {
      return res.status(400).json({ success: false, message: 'Load is no longer available' });
    }

    // Create Application and Update Booking Status to DRIVER_APPLIED
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.driverApplication.create({
        data: {
          booking_id: bookingId,
          driver_id: driverId,
          status: 'APPLIED'
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'DRIVER_APPLIED' }
      });

      await tx.trackingHistory.create({
        data: { booking_id: bookingId, status: 'DRIVER_APPLIED', remarks: 'Driver applied for load' }
      });
      
      await tx.activityLog.create({
        data: { action: 'DRIVER_APPLIED', description: `Driver applied for booking ${bookingId}` }
      });

      return app;
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getActiveTrip = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    
    // An active trip is an assigned booking that is not completed or cancelled
    const activeTrip = await prisma.bookingAssignment.findFirst({
      where: {
        driver_id: driverId,
        booking: {
          status: {
            in: ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'LOADING', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERED', 'POD_UPLOADED']
          }
        }
      },
      include: {
        booking: {
          include: { customer: true, quotes: true }
        }
      }
    });

    res.status(200).json({ success: true, data: activeTrip ? activeTrip.booking : null });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTripStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, remarks } = req.body;
    const driverId = await getDriverId(req);

    // Ensure driver is assigned to this booking
    const assignment = await prisma.bookingAssignment.findFirst({
      where: { booking_id: bookingId, driver_id: driverId }
    });

    if (!assignment) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this trip' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status }
      });

      await tx.trackingHistory.create({
        data: { booking_id: bookingId, status, remarks: remarks || `Driver marked as ${status}` }
      });

      return b;
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDriverHistory = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    const history = await prisma.bookingAssignment.findMany({
      where: {
        driver_id: driverId,
        booking: {
          status: {
            in: ['COMPLETED', 'CLOSED', 'CANCELLED']
          }
        }
      },
      include: { booking: true },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ success: true, data: history.map(h => h.booking) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDriverDashboard = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    // Real metrics
    const completedCount = await prisma.bookingAssignment.count({
      where: { driver_id: driverId, booking: { status: 'COMPLETED' } }
    });
    
    // For demo, just returning basic data
    res.status(200).json({
      success: true, 
      data: {
        completedTrips: completedCount,
        rating: 4.8,
        earnings: completedCount * 1500, // mock calculation
        walletBalance: 2500,
        status: 'ONLINE'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitKYC = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    const { license, pdp, id_document } = req.body;

    if (!driverId) return res.status(404).json({ success: false, message: 'Driver profile not found' });

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        license,
        pdp,
        id_document,
        status: 'UNDER_REVIEW'
      }
    });

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: true }
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    
    res.status(200).json({
      success: true,
      data: {
        first_name: driver.user.first_name || '',
        last_name: driver.user.last_name || '',
        email: driver.user.email,
        phone: driver.user.phone || '',
        avatar: driver.user.avatar || '',
        bank_details: driver.user.bank_details || {}
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const driverId = await getDriverId(req);
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const { first_name, last_name, phone, bank_details } = req.body;

    await prisma.user.update({
      where: { id: driver.user_id },
      data: {
        first_name: first_name !== undefined ? first_name : undefined,
        last_name: last_name !== undefined ? last_name : undefined,
        phone: phone !== undefined ? phone : undefined,
        bank_details: bank_details !== undefined ? bank_details : undefined,
      }
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAvailableLoads,
  applyForLoad,
  getActiveTrip,
  updateTripStatus,
  getDriverHistory,
  getDriverDashboard,
  submitKYC,
  getProfile,
  updateProfile
};
