import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapProvider } from '../../services/mapProvider/MapProvider';
import { Focus, Maximize2, Minimize2, Navigation } from 'lucide-react';

// Sub-component to handle map actions like fitBounds and manual centering
function MapController({ bounds, centerTrigger, currentCoords }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        const leafletBounds = MapProvider.map.getBounds(bounds);
        if (leafletBounds) {
          map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (err) {
        console.error('Error fitting bounds:', err);
      }
    } else if (currentCoords) {
      map.setView([currentCoords.lat, currentCoords.lng], 14);
    }
  }, [bounds, centerTrigger, map]);

  return null;
}

export default function LoadAfricaMap({
  pickupCoords,
  deliveryCoords,
  currentCoords,
  routePolyline,
  heading = 0,
  driverName = 'Driver',
  speed = 0,
  height = '400px',
  isDarkMode = false,
  status = ''
}) {
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse polyline if it's stored as a JSON string
  let parsedPolyline = [];
  if (routePolyline) {
    if (typeof routePolyline === 'string') {
      try {
        parsedPolyline = JSON.parse(routePolyline);
      } catch (e) {
        console.error('Failed to parse polyline string:', e);
      }
    } else if (Array.isArray(routePolyline)) {
      parsedPolyline = routePolyline;
    }
  }

  // Build bounds array to fit everything
  const bounds = [];
  if (pickupCoords?.lat && pickupCoords?.lng) bounds.push([pickupCoords.lat, pickupCoords.lng]);
  if (deliveryCoords?.lat && deliveryCoords?.lng) bounds.push([deliveryCoords.lat, deliveryCoords.lng]);
  if (currentCoords?.lat && currentCoords?.lng) bounds.push([currentCoords.lat, currentCoords.lng]);

  const defaultCenter = bounds.length > 0 ? bounds[0] : [-26.2041, 28.0473]; // Default to Johannesburg
  const defaultZoom = bounds.length > 1 ? 10 : 13;

  const handleRecenter = () => {
    setCenterTrigger(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom filter style for Leaflet dark mode simulation if requested
  const tileStyle = isDarkMode 
    ? { filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' } 
    : {};

  const pickupIcon = MapProvider.map.getMarkerIcon('PICKUP');
  const deliveryIcon = MapProvider.map.getMarkerIcon('DELIVERY');
  const truckIcon = MapProvider.map.getMarkerIcon('TRUCK', heading);

  return (
    <div 
      className={`relative rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer
          url={MapProvider.config.tileUrl}
          attribution={MapProvider.config.attribution}
          eventHandlers={{
            add: (e) => {
              // Apply dark mode styling to tile container elements directly
              if (isDarkMode && e.target._container) {
                e.target._container.style.filter = 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)';
              }
            }
          }}
        />

        {/* Map Controller for bound adjustments */}
        <MapController 
          bounds={bounds} 
          centerTrigger={centerTrigger}
          currentCoords={currentCoords} 
        />

        {/* Pickup Marker */}
        {pickupCoords?.lat && pickupCoords?.lng && pickupIcon && (
          <Marker 
            position={[pickupCoords.lat, pickupCoords.lng]} 
            icon={pickupIcon}
          />
        )}

        {/* Delivery Marker */}
        {deliveryCoords?.lat && deliveryCoords?.lng && deliveryIcon && (
          <Marker 
            position={[deliveryCoords.lat, deliveryCoords.lng]} 
            icon={deliveryIcon}
          />
        )}

        {/* Driver / Truck Marker */}
        {currentCoords?.lat && currentCoords?.lng && truckIcon && (
          <Marker 
            position={[currentCoords.lat, currentCoords.lng]} 
            icon={truckIcon}
          />
        )}

        {/* Route Path Polyline */}
        {parsedPolyline && parsedPolyline.length > 0 && (
          <Polyline 
            positions={parsedPolyline} 
            color="#f59e0b" 
            weight={4.5} 
            opacity={0.8}
            dashArray={status === 'DELIVERED' || status === 'COMPLETED' ? '' : '5, 10'}
          />
        )}
      </MapContainer>

      {/* Map Control Buttons Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl shadow-md transition-all active:scale-95"
          title="Recenter and Fit Bounds"
        >
          <Focus className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl shadow-md transition-all active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Live HUD info widget if active tracking */}
      {currentCoords ? (
        <div className="absolute top-4 left-4 z-[1000] bg-slate-950/80 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 shadow-lg text-[10px] sm:text-xs font-semibold flex items-center gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-slate-350 uppercase">Live GPS Tracking</span>
          </div>
          <div className="border-l border-white/20 pl-4">
            <p className="text-slate-450 uppercase text-[9px] font-bold">Speed</p>
            <p className="text-sm font-black mt-0.5">{Math.round(speed)} km/h</p>
          </div>
          {heading !== undefined && (
            <div className="border-l border-white/20 pl-4">
              <p className="text-slate-450 uppercase text-[9px] font-bold">Heading</p>
              <p className="text-sm font-black mt-0.5">{Math.round(heading)}°</p>
            </div>
          )}
        </div>
      ) : status === 'DRIVER_ASSIGNED' ? (
        <div className="absolute top-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-amber-500/35 shadow-lg text-[10px] sm:text-xs font-semibold flex items-center gap-3 animate-pulse">
          <div className="h-2.5 w-2.5 bg-amber-500 rounded-full animate-ping" />
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase">Awaiting Driver Confirmation</p>
            <p className="text-[9px] text-slate-400 font-sans font-medium mt-0.5 font-light">Dispatched to transporter. Live GPS tracking pending acceptance.</p>
          </div>
        </div>
      ) : status && status !== 'DRAFT' && status !== 'QUOTE_REQUESTED' && status !== 'QUOTE_PREPARED' ? (
        <div className="absolute top-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-rose-500/30 shadow-lg text-[10px] sm:text-xs font-semibold flex items-center gap-3 animate-pulse">
          <div className="h-2.5 w-2.5 bg-rose-500 rounded-full" />
          <div>
            <p className="text-[10px] font-bold text-rose-400 uppercase">Location Unavailable</p>
            <p className="text-[9px] text-slate-400 font-sans font-medium mt-0.5">Showing last known path coordinate</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
