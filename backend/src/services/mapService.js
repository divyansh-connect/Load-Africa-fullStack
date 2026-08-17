const MapProviderFactory = require('./mapProvider/MapProvider.js');

class MapService {
  constructor() {
    this.provider = MapProviderFactory.getProvider();
  }

  /**
   * Geocodes an address to get latitude and longitude.
   */
  async geocode(address) {
    return await this.provider.geocode(address);
  }

  /**
   * Retrieves the route between origin and destination, including distance, duration, and polyline.
   */
  async getRoute(origin, destination) {
    return await this.provider.getRoute(origin, destination);
  }

  /**
   * Retrieves distance and duration.
   */
  async getDistanceMatrix(origin, destination) {
    return await this.provider.getDistanceMatrix(origin, destination);
  }
}

module.exports = new MapService();
