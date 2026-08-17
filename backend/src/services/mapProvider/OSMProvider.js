const IMapProvider = require('./IMapProvider.js');

class OSMProvider extends IMapProvider {
  constructor() {
    super();
    this.routingUrl = 'https://router.project-osrm.org/route/v1/driving';
    this.geocoderUrl = 'https://nominatim.openstreetmap.org';
  }

  async geocode(address) {
    try {
      const url = new URL(`${this.geocoderUrl}/search`);
      url.searchParams.append('q', address);
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', '1');

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'LoadAfricaApp/1.0' }
      });
      
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      throw new Error('Address not found');
    } catch (error) {
      console.error('OSM Geocode Error:', error.message);
      throw error;
    }
  }

  async getRoute(origin, destination) {
    try {
      const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      const url = new URL(`${this.routingUrl}/${coords}`);
      url.searchParams.append('overview', 'full');
      url.searchParams.append('geometries', 'geojson');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
          polyline: JSON.stringify(route.geometry.coordinates.map(coord => [coord[1], coord[0]])) // Convert to [lat, lng]
        };
      }
      throw new Error('No route found');
    } catch (error) {
      console.error('OSM Routing Error:', error.message);
      throw error;
    }
  }

  async getDistanceMatrix(origin, destination) {
    try {
      const routeData = await this.getRoute(origin, destination);
      return {
        distance: routeData.distance,
        duration: routeData.duration
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OSMProvider;
