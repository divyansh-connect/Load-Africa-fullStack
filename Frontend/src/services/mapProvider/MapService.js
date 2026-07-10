import { MapProviderConfig, MAP_PROVIDERS } from './MapProviderConfig';

export const MapService = {
  /**
   * Returns a standard marker icon configuration for the active map provider
   * @param {'TRUCK' | 'PICKUP' | 'DELIVERY'} type 
   * @param {number} heading - vehicle rotation in degrees
   * @returns {any} icon data suitable for active provider (Leaflet icon object or Google maps icon object)
   */
  getMarkerIcon: (type, heading = 0) => {
    const isGoogle = MapProviderConfig.provider === MAP_PROVIDERS.GOOGLE_MAPS;

    if (isGoogle) {
      // Google Maps spec icon structure
      let iconUrl = '';
      if (type === 'TRUCK') iconUrl = 'https://cdn-icons-png.flaticon.com/512/3208/3208753.png';
      else if (type === 'PICKUP') iconUrl = 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png';
      else iconUrl = 'https://cdn-icons-png.flaticon.com/512/1673/1673221.png';

      return {
        url: iconUrl,
        size: { width: 36, height: 36 },
        scaledSize: { width: 36, height: 36 },
        anchor: { x: 18, y: 18 },
        rotation: heading
      };
    }

    // Leaflet HTML/DivIcon configuration to support smooth rotation using CSS transform
    const L = window.L;
    if (!L) return null;

    if (type === 'TRUCK') {
      const truckSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" style="transform: rotate(${heading}deg); transition: transform 0.3s ease-out; width: 32px; height: 32px;">
          <path d="M19 16h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1m15 0a2.5 2.5 0 1 1-5 0m5 0a2.5 2.5 0 1 0-5 0M9 16H5v-2h4v2zm0 0a2.5 2.5 0 1 1-5 0m5 0a2.5 2.5 0 1 0-5 0M2 10V5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v5M6 10h8V7H6v3z"/>
        </svg>
      `;
      return L.divIcon({
        html: `<div class="truck-icon-container" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">${truckSvg}</div>`,
        className: 'custom-truck-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    }

    if (type === 'PICKUP') {
      const pickupSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="#064e3b" stroke-width="2" style="width: 30px; height: 30px;">
          <circle cx="12" cy="12" r="10" fill-opacity="0.2"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      `;
      return L.divIcon({
        html: `<div>${pickupSvg}</div>`,
        className: 'custom-pickup-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
    }

    // Delivery Icon
    const deliverySvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#7f1d1d" stroke-width="2" style="width: 30px; height: 30px;">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `;
    return L.divIcon({
      html: `<div>${deliverySvg}</div>`,
      className: 'custom-delivery-marker',
      iconSize: [30, 36],
      iconAnchor: [15, 36]
    });
  },

  /**
   * Helper to compute maps center and zoom level fits for coordinates list
   */
  getBounds: (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    const L = window.L;
    if (!L) return null;
    return L.latLngBounds(coordinates);
  }
};
