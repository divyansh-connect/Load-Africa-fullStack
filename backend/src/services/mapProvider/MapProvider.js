const OSMProvider = require('./OSMProvider.js');

// If we need GoogleMapsProvider in the future, we import it here
// const GoogleMapsProvider = require('./GoogleMapsProvider.js');

class MapProviderFactory {
  static getProvider() {
    const providerType = process.env.MAP_PROVIDER || 'OPEN_STREET_MAP';

    switch (providerType) {
      case 'GOOGLE_MAPS':
        // return new GoogleMapsProvider();
        throw new Error('Google Maps Provider not yet implemented');
      case 'OPEN_STREET_MAP':
      default:
        return new OSMProvider();
    }
  }
}

module.exports = MapProviderFactory;
