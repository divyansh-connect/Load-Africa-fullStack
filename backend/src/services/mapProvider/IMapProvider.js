/**
 * Interface definition for Map Providers.
 * All providers (OSM, Google Maps, etc.) must implement these methods to ensure
 * business logic can switch providers seamlessly without code changes.
 */
class IMapProvider {
  /**
   * Geocodes an address into latitude and longitude.
   * @param {string} address - The human-readable address.
   * @returns {Promise<{ lat: number, lng: number }>}
   */
  async geocode(address) {
    throw new Error('Method not implemented.');
  }

  /**
   * Gets a route between two coordinates.
   * @param {{ lat: number, lng: number }} origin - Starting point.
   * @param {{ lat: number, lng: number }} destination - Ending point.
   * @returns {Promise<{ distance: number, duration: number, polyline: string }>}
   */
  async getRoute(origin, destination) {
    throw new Error('Method not implemented.');
  }

  /**
   * Calculates the distance and duration matrix between an origin and destination.
   * @param {{ lat: number, lng: number }} origin 
   * @param {{ lat: number, lng: number }} destination 
   * @returns {Promise<{ distance: number, duration: number }>}
   */
  async getDistanceMatrix(origin, destination) {
    throw new Error('Method not implemented.');
  }
}

module.exports = IMapProvider;
