import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, MapPin, Truck, Phone, Star, Info, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { bookingService } from '../../services/bookingService';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_URL.replace('/api/v1', '');

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

    socket.on(`telemetry_updated_${load.id}`, (data) => {
      console.log('Real-time telemetry update:', data);
      setTelemetry(data);
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

  // Calculate percentage progress along the direct line for the custom SVG map
  const totalLatDiff = endLat - startLat;
  const totalLngDiff = endLng - startLng;
  const currentLatDiff = currentLat - startLat;
  const currentLngDiff = currentLng - startLng;

  let progressPct = 0;
  if (Math.abs(totalLatDiff) > 0.0001 || Math.abs(totalLngDiff) > 0.0001) {
    const totalDistSq = totalLatDiff * totalLatDiff + totalLngDiff * totalLngDiff;
    const currentDistSq = currentLatDiff * currentLatDiff + currentLngDiff * currentLngDiff;
    progressPct = Math.min(100, Math.max(0, Math.round((Math.sqrt(currentDistSq) / Math.sqrt(totalDistSq)) * 100)));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
      
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
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-indigo-500/5 animate-pulse pointer-events-none" />

            <svg className="w-full h-full relative z-10" viewBox="0 0 500 300">
              <circle cx="100" cy="150" r="8" className="fill-amber-500 stroke-amber-500/40 stroke-[6px]" />
              <text x="100" y="130" className="fill-slate-400 font-bold text-[10px] text-center" textAnchor="middle">Pickup Route</text>

              <circle cx="400" cy="150" r="8" className="fill-indigo-500 stroke-indigo-500/40 stroke-[6px]" />
              <text x="400" y="130" className="fill-slate-400 font-bold text-[10px] text-center" textAnchor="middle">Dropoff Route</text>

              <path d="M 100 150 Q 250 80 400 150" fill="none" stroke="#334155" strokeWidth="4" strokeDasharray="6,6" />
              <path 
                d="M 100 150 Q 250 80 400 150" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="4" 
                strokeDasharray="500" 
                strokeDashoffset={500 - (500 * (progressPct / 100))}
                className="transition-all duration-1000"
              />

              {(() => {
                const t = progressPct / 100;
                const x = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 250 + t * t * 400;
                const y = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 80 + t * t * 150;
                return (
                  <g transform={`translate(${x - 12}, ${y - 12})`} className="transition-all duration-1000">
                    <circle cx="12" cy="12" r="16" className="fill-amber-500/20 stroke-amber-500/30 stroke-1" />
                    <rect x="4" y="6" width="16" height="12" rx="2" className="fill-amber-500 shadow-xl" />
                    <circle cx="8" cy="18" r="2.5" className="fill-slate-900" />
                    <circle cx="16" cy="18" r="2.5" className="fill-slate-900" />
                  </g>
                );
              })()}
            </svg>

            {/* Telemetry readings */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-[10px] text-slate-300 font-mono space-y-1 backdrop-blur z-20">
              <p className="font-semibold text-white">TELEMETRY STREAM</p>
              <div className="grid grid-cols-2 gap-x-4">
                <span>LATITUDE:</span>
                <span className="text-amber-500">{parseFloat(currentLat).toFixed(4)}° S</span>
                <span>LONGITUDE:</span>
                <span className="text-amber-500">{parseFloat(currentLng).toFixed(4)}° E</span>
                <span>COMPLETED:</span>
                <span className="text-white">{telemetry?.completed_distance || 0} km</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-[10px] text-amber-500 font-bold backdrop-blur z-20">
              {telemetry?.eta ? `ETA: ${new Date(telemetry.eta).toLocaleTimeString()}` : 'ETA: Recalculating...'}
            </div>
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
  );
}
