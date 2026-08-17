const { PrismaClient } = require('@prisma/client');
const mapService = require('./mapService');
const prisma = new PrismaClient();

class TrackingService {
  /**
   * Distance between two coordinates in meters (Haversine formula).
   */
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const toRadians = (deg) => (deg * Math.PI) / 180;
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  /**
   * Process incoming GPS telemetry from a driver device.
   * Performs unrealistic speed filtering, ETA updates, and geofence triggering.
   */
  async processLocationUpdate({ bookingId, driverId, lat, lng, speed, heading }) {
    try {
      // 1. Fetch current telemetry & booking info
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { telemetry: true }
      });

      if (!booking) throw new Error('Booking not found');

      // 2. Unrealistic Speed Validation
      if (booking.telemetry) {
        const lastLat = booking.telemetry.latitude;
        const lastLng = booking.telemetry.longitude;
        const lastUpdated = new Date(booking.telemetry.last_updated).getTime();
        const now = Date.now();
        const timeDiffSeconds = (now - lastUpdated) / 1000;

        if (timeDiffSeconds > 0) {
          const distanceMeters = this.calculateHaversineDistance(lastLat, lastLng, lat, lng);
          const calculatedSpeedKmH = (distanceMeters / timeDiffSeconds) * 3.6;

          // Reject if speed > 180km/h (likely GPS spoofing/glitch)
          if (calculatedSpeedKmH > 180) {
            console.warn(`[GPS Validation] Discarded impossible jump for driver ${driverId} on booking ${bookingId}. Speed: ${calculatedSpeedKmH} km/h`);
            return null; // Silently ignore the bad data
          }
        }
      }

      // 3. Geofence Check
      let statusUpdate = null;
      const GEOFENCE_RADIUS_METERS = 500; // 500 meters

      if (booking.status === 'DRIVER_EN_ROUTE' && booking.pickup_coords_lat && booking.pickup_coords_lng) {
        const distToPickup = this.calculateHaversineDistance(lat, lng, booking.pickup_coords_lat, booking.pickup_coords_lng);
        if (distToPickup <= GEOFENCE_RADIUS_METERS) {
          statusUpdate = 'ARRIVED_PICKUP';
        }
      } else if (booking.status === 'PICKED_UP' && booking.delivery_coords_lat && booking.delivery_coords_lng) {
        const distToDelivery = this.calculateHaversineDistance(lat, lng, booking.delivery_coords_lat, booking.delivery_coords_lng);
        if (distToDelivery <= GEOFENCE_RADIUS_METERS) {
          // Status updates to delivered when geofence triggers
          statusUpdate = 'DELIVERED'; 
        }
      }

      // Apply status update if geofence was triggered
      if (statusUpdate) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: statusUpdate }
        });
        
        // Log to tracking history
        await prisma.trackingHistory.create({
          data: {
            booking_id: bookingId,
            status: statusUpdate,
            lat,
            lng,
            remarks: `Auto-updated status to ${statusUpdate} via GPS geofence.`
          }
        });
        console.log(`[Geofence] Booking ${bookingId} auto-updated to ${statusUpdate}`);
      }

      // 4. Update Database
      const updatedTelemetry = await prisma.liveTrackingTelemetry.upsert({
        where: { booking_id: bookingId },
        create: {
          booking_id: bookingId,
          driver_id: driverId,
          latitude: lat,
          longitude: lng,
          completed_distance: 0, 
          remaining_distance: booking.estimated_distance || 0,
        },
        update: {
          latitude: lat,
          longitude: lng,
          last_updated: new Date()
          // Optionally here we would trigger mapService.getRoute() if we detected major deviation
        }
      });

      // Update a snapshot of coords on the booking model itself for fallback queries
      await prisma.booking.update({
        where: { id: bookingId },
        data: { current_latitude: lat, current_longitude: lng }
      });

      return {
        telemetry: updatedTelemetry,
        newStatus: statusUpdate || booking.status
      };
    } catch (error) {
      console.error('Error processing location update:', error.message);
      throw error;
    }
  }
}

module.exports = new TrackingService();
