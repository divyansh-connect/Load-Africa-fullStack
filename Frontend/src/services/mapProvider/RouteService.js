import axios from 'axios';
import { MapProviderConfig, MAP_PROVIDERS } from './MapProviderConfig';

export const RouteService = {
  /**
   * Calculates route path, distance, and duration between two points
   * @param {number} startLat 
   * @param {number} startLng 
   * @param {number} endLat 
   * @param {number} endLng 
   * @returns {Promise<{distanceKm: number, durationMinutes: number, polylineCoordinates: Array<[number, number]>}>}
   */
  getRoute: async (startLat, startLng, endLat, endLng) => {
    if (startLat === undefined || startLng === undefined || endLat === undefined || endLng === undefined) {
      throw new Error('Start and end coordinates are required');
    }

    if (MapProviderConfig.provider === MAP_PROVIDERS.GOOGLE_MAPS) {
      console.log('Using Google Maps Directions for:', startLat, startLng, 'to', endLat, endLng);
      // In production:
      // const res = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${MapProviderConfig.googleApiKey}`);
      // return parsed data...
      return {
        distanceKm: 15.5,
        durationMinutes: 25,
        polylineCoordinates: [
          [startLat, startLng],
          [endLat, endLng]
        ]
      };
    }

    try {
      // OSRM expects: longitude,latitude;longitude,latitude
      const url = `${MapProviderConfig.routingUrl}/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const response = await axios.get(url);

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        // OSRM coordinates are [longitude, latitude] -> convert to [latitude, longitude] for Leaflet
        const polylineCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        return {
          distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
          durationMinutes: parseFloat((route.duration / 60).toFixed(1)),
          polylineCoordinates
        };
      }
      throw new Error('No route found');
    } catch (error) {
      console.error('OSRM Routing Error:', error);
      // Fallback straight line polyline if service fails
      return {
        distanceKm: parseFloat((RouteService.calculateHaversineDistance(startLat, startLng, endLat, endLng)).toFixed(2)),
        durationMinutes: Math.round((RouteService.calculateHaversineDistance(startLat, startLng, endLat, endLng) / 60) * 60), // Assumes avg 60 km/h
        polylineCoordinates: [
          [startLat, startLng],
          [endLat, endLng]
        ]
      };
    }
  },

  /**
   * Helper to calculate straight-line (Haversine) distance in km
   */
  calculateHaversineDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
};
