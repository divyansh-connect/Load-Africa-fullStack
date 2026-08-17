import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, MapPin, Truck, Phone, Star, Info, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { bookingService } from '../../services/bookingService';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_URL.replace('/api/v1', '');

import LoadAfricaMap from '../../components/ui/LoadAfricaMap';

export default function Tracking() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [driver, setDriver] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveLoad();
  }, []);

  const fetchActiveLoad = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getCustomerBookingsHistory();
      if (res.success && res.data) {
        // Find the first active booking that has an assignment
        const active = res.data.find(b => 
          ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'LOADING', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERED', 'POD_UPLOADED'].includes(b.status) &&
          b.assignments && b.assignments.length > 0
        );
        
        if (active) {
          // Fetch detailed single booking to populate all fields
          const detailsRes = await bookingService.getBookingDetails(active.id);
          if (detailsRes.success && detailsRes.data) {
            const bookingDetails = detailsRes.data;
            setLoad(bookingDetails);
            setTelemetry(bookingDetails.telemetry);
            const assignment = bookingDetails.assignments?.find(a => a.status === 'ACTIVE') || bookingDetails.assignments?.[0];
            if (assignment?.driver) {
              setDriver(assignment.driver);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!load) return;

    // Connect socket
    const socket = io(SOCKET_URL);
    socket.emit('join_booking', load.id);

    socket.on('location_update', (data) => {
      console.log('Real-time telemetry update:', data);
      setTelemetry({
        latitude: data.lat,
        longitude: data.lng,
        speed: data.speed,
        heading: data.heading,
        ...data.telemetry
      });
      // Optionally update status if it changed
      if (data.status && data.status !== load.status) {
        setLoad(prev => ({ ...prev, status: data.status }));
      }
    });

    // Fallback: Poll booking details every 5 seconds
    const interval = setInterval(async () => {
      try {
        const detailsRes = await bookingService.getBookingDetails(load.id);
        if (detailsRes.success && detailsRes.data) {
          setLoad(detailsRes.data);
          setTelemetry(detailsRes.data.telemetry);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [load?.id]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading tracking center...</div>;
  if (error) return <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>;

  if (!load || !driver) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-full mx-auto">
          <Truck className="h-10 w-10" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-slate-800">No Cargo Transits Tracked</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-light">
            You do not have any bookings actively in transit. Allocate a driver to begin tracking.
          </p>
        </div>
        <div className="flex justify-center mt-2">
          <Button onClick={() => navigate('/customer/create-booking')}>Book New Cargo</Button>
        </div>
      </div>
    );
  }

  // Fallback coords if database telemetry doesn't have coordinates yet
  const startLat = load.pickup_coords_lat || -26.2041;
  const startLng = load.pickup_coords_lng || 28.0473;
  const endLat = load.delivery_coords_lat || -25.7479;
  const endLng = load.delivery_coords_lng || 28.2292;

  // Current positions
  const currentLat = telemetry?.latitude || startLat;
  const currentLng = telemetry?.longitude || startLng;

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Alert banner if driver hasn't accepted yet */}
      {load.assignments?.[0]?.status === 'PENDING' && (
        <div className="bg-amber-50 border border-amber-200 p-4.5 rounded-2xl text-amber-800 text-xs font-semibold flex items-start gap-3.5 shadow-sm">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold uppercase text-amber-950 tracking-wide text-xs">Transporter Dispatch Pending Confirmation</h4>
            <p className="text-slate-600 font-medium font-sans leading-relaxed">
              We have allocated driver <span className="font-bold text-slate-800">{driver.user?.first_name} {driver.user?.last_name || ''}</span> to this load. The driver has been notified and needs to click "Accept Assignment" in their mobile app to initialize the GPS telemetry feed.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* Map screen */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-amber-500 animate-spin" />
                <span className="font-bold text-sm">Escort Telemetry - {load.id.slice(0,8)}...</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                CONNECTED
              </div>
            </div>

            {/* Map canvas */}
            <div className="flex-1 relative overflow-hidden">
              <LoadAfricaMap
                pickupCoords={{ lat: startLat, lng: startLng }}
                deliveryCoords={{ lat: endLat, lng: endLng }}
                currentCoords={telemetry?.latitude ? { lat: telemetry.latitude, lng: telemetry.longitude } : null}
                routePolyline={load.route_polyline}
                heading={telemetry?.heading || 0}
                driverName={`${driver.user?.first_name || ''} ${driver.user?.last_name || ''}`.trim()}
                speed={telemetry?.speed || 0}
                status={load.status}
                height="100%"
              />
            </div>
          </div>
        </div>

      {/* Driver info card */}
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Assigned Driver</h3>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xl border border-slate-200">
              {driver.user?.first_name?.[0] || 'D'}
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">{driver.user?.first_name} {driver.user?.last_name || ''}</h4>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-slate-600">4.9</span>
              </div>
              <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">VERIFIED</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Phone Contact:</span>
              <span className="text-slate-800 font-bold">{driver.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicle Registry:</span>
              <span className="text-slate-800 font-mono font-bold bg-slate-50 border px-1.5 py-0.5 rounded">
                {(load.assignments?.find(a => a.status === 'ACTIVE') || load.assignments?.[0])?.vehicle?.registration_number || 'GP 82 DF GP'}
              </span>
            </div>
          </div>

          <a 
            href={`tel:${driver.user?.phone}`} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Call Driver Support
          </a>
        </Card>

        {/* Timeline */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Shipment Timeline</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
            <div className="relative flex items-start gap-4">
              <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white mt-1">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 font-extrabold">Driver Assigned</p>
                <p className="text-[10px] text-slate-500">Dispatch accepted by Transporter</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white mt-1">
                <Compass className="h-3 w-3 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 font-extrabold">{load.status.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-slate-500">Live GPS tracking active</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 z-10 border-2 border-white mt-1">
                <MapPin className="h-3 w-3" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Delivery Destination</p>
                <p className="text-[10px] text-slate-400">ETA: {telemetry?.eta ? new Date(telemetry.eta).toLocaleTimeString() : 'Recalculating...'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
