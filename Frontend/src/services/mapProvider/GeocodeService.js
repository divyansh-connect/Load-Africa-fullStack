import axios from 'axios';
import { MapProviderConfig, MAP_PROVIDERS } from './MapProviderConfig';

export const GeocodeService = {
  /**
   * Geocodes an address to latitude and longitude
   * @param {string} address 
   * @returns {Promise<{lat: number, lng: number, displayName: string}>}
   */
  geocode: async (address) => {
    if (!address) throw new Error('Address is required');

    if (MapProviderConfig.provider === MAP_PROVIDERS.GOOGLE_MAPS) {
      // Mock Google Maps Geocoding API
      console.log('Using Google Maps Geocoding API for:', address);
      // In production, you would fetch:
      // const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MapProviderConfig.googleApiKey}`);
      // return { lat: res.data.results[0].geometry.location.lat, lng: res.data.results[0].geometry.location.lng };
      return { lat: -26.2041, lng: 28.0473, displayName: address }; // Default to Johannesburg mock
    }

    // Default to OpenStreetMap Nominatim
    try {
      const url = `${MapProviderConfig.geocoderUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'LoadAfricaLogisticsApp' }
      });

      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name
        };
      }
      throw new Error('Address not found');
    } catch (error) {
      console.error('Nominatim Geocoding Error:', error);
      throw error;
    }
  },

  /**
   * Reverse geocodes latitude and longitude to an address
   * @param {number} lat 
   * @param {number} lng 
   * @returns {Promise<string>}
   */
  reverseGeocode: async (lat, lng) => {
    if (lat === undefined || lng === undefined) throw new Error('Coordinates are required');

    if (MapProviderConfig.provider === MAP_PROVIDERS.GOOGLE_MAPS) {
      console.log('Using Google Maps Reverse Geocoding for:', lat, lng);
      return `Mock Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    try {
      const url = `${MapProviderConfig.geocoderUrl}/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'LoadAfricaLogisticsApp' }
      });

      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Nominatim Reverse Geocoding Error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
};
