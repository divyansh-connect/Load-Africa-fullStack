import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Star, AlertCircle, Compass, ShieldCheck, 
  Clock, Navigation, ChevronRight, Truck, Info, Award
} from 'lucide-react';
import { getMockData } from '../../data/mockData';

export default function ActiveBooking() {
  const navigate = useNavigate();
  const [activeBooking, setActiveBooking] = useState(null);
  const [driver, setDriver] = useState(null);
  const [load, setLoad] = useState(null);
  const [simProgress, setSimProgress] = useState(40); // percent along the route

  useEffect(() => {
    // Fetch active bookings
    const bookings = getMockData('bookings') || [];
    const active = bookings.find(b => b.bookingStatus === 'in_transit' || b.bookingStatus === 'assigned');
    
    if (active) {
      setActiveBooking(active);
      const drivers = getMockData('drivers') || [];
      const drv = drivers.find(d => d.id === active.driverId);
      setDriver(drv);

      const loads = getMockData('loads') || [];
      const ld = loads.find(l => l.id === active.loadId);
      setLoad(ld);
    }
  }, []);

  // Simulate truck movement along the line for visual polish
  useEffect(() => {
    const timer = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 98) return 10; // reset/loop
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!activeBooking || !load || !driver) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-full">
          <Truck className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Active Bookings Tracked</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          You currently do not have any shipments actively in transit. Create a load or assign it to a transporter to begin tracking.
        </p>
        <button 
          onClick={() => navigate('/customer/create-load')}
          className="mt-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Book a Cargo Truck
        </button>
      </div>
    );
  }

  // Calculate moving coordinate indicators
  const routePoints = {
    start: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    end: { lat: -25.7479, lng: 28.2293 }   // Pretoria (simulated trip)
  };

  const currentLat = (routePoints.start.lat + (routePoints.end.lat - routePoints.start.lat) * (simProgress / 100)).toFixed(4);
  const currentLng = (routePoints.start.lng + (routePoints.end.lng - routePoints.start.lng) * (simProgress / 100)).toFixed(4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      
      {/* Map display screen (Left 2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-500 animate-spin" />
              <span className="font-bold text-sm">Live Route escorts - {load.id}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE CONNECTED
            </div>
          </div>

          {/* Interactive Simulated Map */}
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6 overflow-hidden">
            
            {/* Grid overlay for radar feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-indigo-500/5 animate-pulse pointer-events-none" />

            {/* Simulated Vector Route Line */}
            <svg className="w-full h-full relative z-10" viewBox="0 0 500 300">
              {/* Pickup point */}
              <circle cx="100" cy="150" r="8" className="fill-amber-500 stroke-amber-500/40 stroke-[6px]" />
              <text x="100" y="130" className="fill-slate-400 font-bold text-[10px] text-center" textAnchor="middle">Pickup (Lagos)</text>

              {/* Destination Point */}
              <circle cx="400" cy="150" r="8" className="fill-indigo-500 stroke-indigo-500/40 stroke-[6px]" />
              <text x="400" y="130" className="fill-slate-400 font-bold text-[10px] text-center" textAnchor="middle">Dropoff (Kano)</text>

              {/* The Route Path Line */}
              <path 
                d="M 100 150 Q 250 80 400 150" 
                fill="none" 
                stroke="#334155" 
                strokeWidth="4" 
                strokeDasharray="6,6"
              />

              {/* Progress active path */}
              <path 
                id="active-path"
                d="M 100 150 Q 250 80 400 150" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="4" 
                strokeDasharray="500" 
                strokeDashoffset={500 - (500 * (simProgress / 100))}
                className="transition-all duration-1000"
              />

              {/* Truck Icon marker sliding along curve */}
              {/* Calculated coordinates for quadratic bezier curve display */}
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

            {/* GPS HUD Info overlays */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-[10px] text-slate-300 font-mono space-y-1.5 backdrop-blur z-20 shadow-xl">
              <p className="font-semibold text-white">TELEMETRY STREAM</p>
              <div className="grid grid-cols-2 gap-x-4">
                <span>LATITUDE:</span>
                <span className="text-amber-550 text-amber-500">{currentLat}° S</span>
                <span>LONGITUDE:</span>
                <span className="text-amber-550 text-amber-500">{currentLng}° E</span>
                <span>SPEED:</span>
                <span className="text-white">68 km/h</span>
                <span>HEADING:</span>
                <span className="text-white">North-East</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-[10px] text-amber-500 font-bold backdrop-blur z-20">
              ETA: ~4h 15m remaining
            </div>
          </div>
        </div>

        {/* Dispatch Notes alert */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-800">Operational Update</p>
            <p className="text-slate-500 font-light leading-relaxed">
              Driver has reported clear road conditions on Lokoja Bypass. GPS lock remains stable. Checkpoints verified by Load Africa security nodes.
            </p>
          </div>
        </div>
      </div>

      {/* Driver info + Booking Details sidebar card (Right 1 col) */}
      <div className="space-y-6">
        
        {/* Driver Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Assigned Driver</h3>
          
          <div className="flex items-center gap-4">
            <img 
              src={driver.avatar} 
              alt={driver.name} 
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">{driver.name}</h4>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-slate-600">{driver.rating}</span>
                <span className="text-[10px] text-slate-400">({driver.trips} trips)</span>
              </div>
              <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">VERIFIED PARTNER</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Phone Number:</span>
              <span className="text-slate-800 font-bold">{driver.phone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Vehicle Model:</span>
              <span className="text-slate-800 font-bold">Volvo FH16 (Flatbed)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">License Plate:</span>
              <span className="text-slate-800 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-150 text-[11px]">{getMockData('vehicles')?.find(v => v.driverName === driver.name)?.numberPlate || 'GP 82 DF GP'}</span>
            </div>
          </div>

          <div className="pt-2">
            <a 
              href={`tel:${driver.phone}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Call Driver escorts
            </a>
          </div>
        </div>

        {/* Cargo specifications card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Shipment Cargo info</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">LOAD DESCRIPTION</span>
              <p className="font-bold text-slate-800 text-sm mt-1">{load.title}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">PICKUP</span>
                  <p className="text-slate-700 font-medium leading-tight">{load.pickup}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">DROPOFF</span>
                  <p className="text-slate-700 font-medium leading-tight">{load.dropoff}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">WEIGHT</span>
                <span className="font-extrabold text-slate-800 text-sm mt-1 block">{load.weight}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">COMMITTED BUDGET</span>
                <span className="font-extrabold text-slate-800 text-sm mt-1 block">R{load.budget}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
