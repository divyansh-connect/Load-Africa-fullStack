import api from '../api';
import { socket } from '../../utils/socket';

const activeCallbacks = new Map();

export const TrackingService = {
  /**
   * Subscribes to real-time telemetry updates for a booking
   * @param {string} bookingId 
   * @param {Function} onUpdate - callback invoked with telemetry data 
   */
  subscribeToLiveLocation: (bookingId, onUpdate) => {
    if (!bookingId || !onUpdate) return;
    
    // Unsubscribe from any active callback first
    TrackingService.unsubscribeFromLiveLocation(bookingId);

    const eventName = `telemetry_updated_${bookingId}`;
    const listener = (data) => {
      onUpdate(data);
    };

    activeCallbacks.set(bookingId, { eventName, listener });
    socket.on(eventName, listener);
    
    console.log(`Subscribed to live location updates for Booking: ${bookingId}`);
  },

  /**
   * Unsubscribes from live telemetry updates
   * @param {string} bookingId 
   */
  unsubscribeFromLiveLocation: (bookingId) => {
    if (!bookingId) return;
    const active = activeCallbacks.get(bookingId);
    if (active) {
      socket.off(active.eventName, active.listener);
      activeCallbacks.delete(bookingId);
      console.log(`Unsubscribed from live location updates for Booking: ${bookingId}`);
    }
  },

  /**
   * Transmits current driver location to backend
   * @param {string} bookingId 
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} speed 
   * @param {number} heading 
   * @returns {Promise<any>}
   */
  sendDriverLocation: async (bookingId, latitude, longitude, speed = 0, heading = 0) => {
    try {
      const response = await api.post(`/driver/trips/${bookingId}/telemetry`, {
        latitude,
        longitude,
        speed,
        heading
      });
      return response.data;
    } catch (error) {
      console.error('Failed to transmit driver location:', error);
      throw error;
    }
  }
};
