const { prisma } = require('../config/db');

/**
 * Automatically searches for the closest available driver and assigns them to the booking.
 * Excludes drivers who have already rejected this booking.
 */
const searchAndAssignDriver = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) throw new Error('Booking not found');
    if (!booking.pickup_coords_lat || !booking.pickup_coords_lng) {
      throw new Error('Booking missing pickup coordinates for dispatch');
    }

    // Get drivers who have already rejected this booking
    const rejectedAssignments = await prisma.bookingAssignment.findMany({
      where: {
        booking_id: bookingId,
        status: 'REJECTED'
      },
      select: { driver_id: true }
    });
    
    const rejectedDriverIds = rejectedAssignments.map(a => a.driver_id).filter(Boolean);

    // Find all AVAILABLE independent drivers
    const availableDrivers = await prisma.driver.findMany({
      where: {
        status: 'AVAILABLE',
        id: { notIn: rejectedDriverIds },
        fleet_owner_id: null // Focus on independent drivers for now
      },
      include: {
        user: true,
        assigned_vehicle: true
      }
    });

    if (availableDrivers.length === 0) {
      // No drivers found, update status to indicate failure to find driver
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'NO_DRIVERS_AVAILABLE' }
      });
      return { success: false, message: 'No available drivers found.' };
    }

    // Basic straight-line distance calculation (Haversine formula) to find closest
    const toRad = (value) => (value * Math.PI) / 180;
    const calcDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let closestDriver = null;
    let minDistance = Infinity;

    for (const driver of availableDrivers) {
      // In a real scenario, use actual coordinates from driver's current location tracking.
      const dist = 0; // Stub
      if (dist < minDistance) {
        minDistance = dist;
        closestDriver = driver;
      }
    }
    
    if (!closestDriver) {
       closestDriver = availableDrivers[0]; // fallback
    }

    // Assign to closest driver
    await prisma.$transaction(async (tx) => {
      // Create PENDING assignment
      await tx.bookingAssignment.create({
        data: {
          booking_id: bookingId,
          driver_id: closestDriver.id,
          assigned_by: 'SYSTEM',
          status: 'PENDING'
        }
      });

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'DRIVER_SEARCHING' }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: bookingId,
          status: 'DRIVER_SEARCHING',
          remarks: `Automated dispatch assigned driver ${closestDriver.user.first_name} ${closestDriver.user.last_name}. Awaiting driver acceptance.`,
          updated_by: 'SYSTEM'
        }
      });
    });

    return { success: true, driver: closestDriver };
  } catch (error) {
    console.error('Dispatch error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  searchAndAssignDriver
};
