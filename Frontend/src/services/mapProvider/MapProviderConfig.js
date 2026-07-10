export const MAP_PROVIDERS = {
  OPEN_STREET_MAP: 'OPEN_STREET_MAP',
  GOOGLE_MAPS: 'GOOGLE_MAPS'
};

export const MapProviderConfig = {
  provider: MAP_PROVIDERS.OPEN_STREET_MAP,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  routingUrl: 'https://router.project-osrm.org/route/v1',
  geocoderUrl: 'https://nominatim.openstreetmap.org',
  googleApiKey: '', // Place Google API key here later
};
