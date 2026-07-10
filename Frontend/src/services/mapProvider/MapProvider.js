import { MapProviderConfig, MAP_PROVIDERS } from './MapProviderConfig';
import { MapService } from './MapService';
import { RouteService } from './RouteService';
import { GeocodeService } from './GeocodeService';
import { TrackingService } from './TrackingService';

export const MapProvider = {
  config: MapProviderConfig,
  providers: MAP_PROVIDERS,
  map: MapService,
  route: RouteService,
  geocode: GeocodeService,
  tracking: TrackingService
};

export default MapProvider;
