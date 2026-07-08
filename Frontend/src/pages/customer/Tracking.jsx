import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, MapPin, Truck, Phone, Star, Info, CheckCircle2 } from 'lucide-react';
import { getMockData } from '../../data/mockData';
import { Card, Button, Badge } from '../../components/ui';

export default function Tracking() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [driver, setDriver] = useState(null);
  const [simProgress, setSimProgress] = useState(45);

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    // Kofi's active load (driver Kofi Mensah)
    const active = allLoads.find(l => l.customerId === 'usr-1' && (l.status === 'in_transit' || l.status === 'assigned'));
    
    if (active) {
      setLoad(active);
      const allDrivers = getMockData('drivers') || [];
      const drv = allDrivers.find(d => d.id === active.driverId);
      setDriver(drv);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 98) return 15;
        return prev + 1.5;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!load || !driver) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4 text-left">
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

  const startCoords = { lat: -26.2041, lng: 28.0473 };
  const endCoords = { lat: -25.7479, lng: 28.2293 };
  
  const currentLat = (startCoords.lat + (endCoords.lat - startCoords.lat) * (simProgress / 100)).toFixed(4);
  const currentLng = (startCoords.lng + (endCoords.lng - startCoords.lng) * (simProgress / 100)).toFixed(4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
      
      {/* Map screen */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-500 animate-spin" />
              <span className="font-bold text-sm">Escort Telemetry - {load.id}</span>
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
                strokeDashoffset={500 - (500 * (simProgress / 100))}
                className="transition-all duration-1000"
              />

              {(() => {
                const t = simProgress / 100;
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

            {/* Telementry readings */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-[10px] text-slate-300 font-mono space-y-1 backdrop-blur z-20">
              <p className="font-semibold text-white">TELEMETRY STREAM</p>
              <div className="grid grid-cols-2 gap-x-4">
                <span>LATITUDE:</span>
                <span className="text-amber-550 text-amber-500">{currentLat}° S</span>
                <span>LONGITUDE:</span>
                <span className="text-amber-550 text-amber-500">{currentLng}° E</span>
                <span>SPEED:</span>
                <span className="text-white">72 km/h</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-[10px] text-amber-500 font-bold backdrop-blur z-20">
              ETA: ~3.5h remaining
            </div>
          </div>
        </div>
      </div>

      {/* Driver info card */}
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Assigned Driver</h3>
          
          <div className="flex items-center gap-4">
            <img src={driver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'} alt={driver.name} className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">{driver.name}</h4>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-slate-650">{driver.rating}</span>
              </div>
              <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">VERIFIED</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Phone Contact:</span>
              <span className="text-slate-850 font-bold">{driver.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicle Registry:</span>
              <span className="text-slate-850 font-mono font-bold bg-slate-50 border px-1.5 py-0.5 rounded">{getMockData('vehicles')?.find(v => v.driverName === driver.name)?.numberPlate || 'GP 82 DF GP'}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span>Broker:</span>
              <span className="text-slate-850 font-bold text-slate-800">Global Logistics Coordinator</span>
            </div>
          </div>

          <a 
            href={`tel:${driver.phone}`} 
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
                <p className="text-xs font-bold text-slate-800">Driver Assigned</p>
                <p className="text-[10px] text-slate-500">12 Jun, 09:15</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white mt-1">
                <Compass className="h-3 w-3 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">In Transit</p>
                <p className="text-[10px] text-slate-500">ETA: ~3.5h remaining</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 z-10 border-2 border-white mt-1">
                <MapPin className="h-3 w-3" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Delivery Destination</p>
                <p className="text-[10px] text-slate-400">Pending</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
