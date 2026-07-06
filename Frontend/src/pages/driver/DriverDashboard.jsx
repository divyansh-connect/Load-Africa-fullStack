import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Scale, Star, ChevronRight, 
  CheckCircle2, Compass, RefreshCw, X, ShieldAlert, Award, Truck
} from 'lucide-react';
import { getMockData, acceptLoad } from '../../data/mockData';

export default function DriverDashboard({ view = 'overview' }) {
  const navigate = useNavigate();
  const [loads, setLoads] = useState([]);
  const [driver, setDriver] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  const fetchDashboardData = () => {
    const allLoads = getMockData('loads') || [];
    // Only show loads that are 'available'
    const available = allLoads.filter(l => l.status === 'available');
    setLoads(available);

    const drivers = getMockData('drivers') || [];
    setDriver(drivers[0]); // Sipho Zuma

    // Find active booking for Sipho Zuma (id: 'drv-1')
    const allBookings = getMockData('bookings') || [];
    const active = allBookings.find(b => b.driverId === 'drv-1' && (b.bookingStatus === 'in_transit' || b.bookingStatus === 'assigned'));
    if (active) {
      const matchLoad = allLoads.find(l => l.id === active.loadId);
      setActiveTrip({
        ...active,
        cargoTitle: matchLoad ? matchLoad.title : 'General Cargo',
        pickup: matchLoad ? matchLoad.pickup : 'Transit Origin',
        dropoff: matchLoad ? matchLoad.dropoff : 'Destination',
        weight: matchLoad ? matchLoad.weight : 'N/A'
      });
    } else {
      setActiveTrip(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [view]);

  const handleAcceptLoad = (loadId) => {
    setAccepting(true);
    setTimeout(() => {
      // Driver Sipho accepts the load
      const booking = acceptLoad(loadId, 'drv-1', 'vh-1');
      setAccepting(false);
      
      if (booking) {
        setAcceptedSuccess(true);
        setSelectedLoad(null);
        fetchDashboardData();
      }
    }, 1200);
  };

  if (!driver) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome & Stats Row */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Driver Console Connected</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Sipho Zuma</h2>
            <p className="text-xs text-slate-300 font-light max-w-md">
              Verify available cargo loads on major highway transport corridors and accept bids instantly.
            </p>
          </div>

          <div className="flex gap-4 sm:gap-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Wallet Bal</span>
              <span className="font-extrabold text-lg text-emerald-400">R{driver.walletBalance}</span>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Completed</span>
              <span className="font-extrabold text-lg text-white">{driver.trips} trips</span>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Rating</span>
              <div className="flex items-center gap-1 mt-0.5 justify-center">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                <span className="font-bold text-sm text-white">{driver.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success notification overlay */}
      {acceptedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4 animate-scaleIn">
          <div className="flex items-center gap-3 text-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-emerald-800 font-bold text-left font-sans">Load accepted successfully! Your truck is now assigned.</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/driver/active-trip')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm whitespace-nowrap"
            >
              Start Trip Escort
            </button>
            <button 
              onClick={() => setAcceptedSuccess(false)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Conditional View Rendering */}
      {view === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          
          {/* Active Trip card (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Active Cargo Allocations</h3>
              
              {activeTrip ? (
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase">{activeTrip.bookingStatus}</span>
                        <span className="text-xs font-mono text-slate-400">ID: {activeTrip.id}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-base">{activeTrip.cargoTitle}</h4>
                      <p className="text-xs text-slate-500 font-medium">Route: {activeTrip.pickup.split(',')[0]} → {activeTrip.dropoff.split(',')[0]}</p>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Payout</span>
                        <span className="text-lg font-extrabold text-slate-900">R{activeTrip.price}</span>
                      </div>
                      <button 
                        onClick={() => navigate('/driver/active-trip')}
                        className="mt-2.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        Track Trip Map
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl space-y-3">
                  <Truck className="h-10 w-10 text-slate-350 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">No Active Trips Assigned</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-light">You are currently offline or idle. Browse available cargo leads to accept cargo assignments.</p>
                  <button 
                    onClick={() => navigate('/driver/available-loads')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md mt-2"
                  >
                    View Available Leads
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Panel (Right 1 col) */}
          <div className="space-y-6">
            
            {/* KYC Compliance Badge */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-600">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Transporter Status</h4>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded uppercase">VERIFIED</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Your driver CDL and flatbed truck registration tags are verified. Maintain active telemetry locks during routing.
              </p>
            </div>

            {/* Platform Shortcuts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-850 text-sm border-b border-slate-100 pb-2">Quick Navigation</h4>
              <div className="space-y-2 text-xs">
                <button onClick={() => navigate('/driver/earnings')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700">
                  <span>View Wallet Earnings</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
                <button onClick={() => navigate('/driver/vehicle-management')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700">
                  <span>Manage Truck Details</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Available Cargo list */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Available Cargo Leads</h3>
              <p className="text-xs text-slate-400">Loads broadcasting within 50km coordinates. Ready for instant routing dispatch.</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all border border-slate-200"
              title="Refresh Leads"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>

          {loads.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Package className="h-12 w-12 text-slate-350 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No available loads in your area</p>
              <p className="text-xs text-slate-400 font-light max-w-xs mx-auto">Please check back later or modify your truck filters in Settings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loads.map((load) => (
                <div 
                  key={load.id} 
                  className="border border-slate-200 hover:border-emerald-500/40 rounded-2xl p-5 hover:bg-slate-50/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">{load.category}</span>
                        <h4 className="font-bold text-slate-800 text-base mt-1.5">{load.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{load.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Payout Bid</span>
                        <span className="text-lg font-extrabold text-slate-800">R{load.budget}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2.5">
                      <div className="flex items-start gap-2.5 text-xs text-slate-600">
                        <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="font-semibold leading-tight line-clamp-1">{load.pickup.split(',')[0]}</p>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-slate-600">
                        <MapPin className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="font-semibold leading-tight line-clamp-1">{load.dropoff.split(',')[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400 font-semibold">Weight: {load.weight}</span>
                    <button 
                      onClick={() => setSelectedLoad(load)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Load details modal */}
      {selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedLoad(null)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-scaleIn">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Accept Load Bidding - {selectedLoad.id}</span>
              <button onClick={() => setSelectedLoad(null)} className="text-slate-400 hover:text-white font-bold text-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start text-left">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900">{selectedLoad.title}</h4>
                  <span className="text-xs text-slate-400">Owner: {selectedLoad.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">COMMITTED PAYOUT</span>
                  <span className="text-2xl font-extrabold text-slate-800">R{selectedLoad.budget}</span>
                </div>
              </div>

              <div className="border border-slate-150 rounded-2xl p-4 divide-y divide-slate-100 space-y-3.5 text-xs bg-slate-50/50 text-left">
                <div className="flex justify-between pt-0">
                  <span className="text-slate-400 font-medium">Cargo Category:</span>
                  <span className="text-slate-800 font-bold">{selectedLoad.category}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-medium">Weight:</span>
                  <span className="text-slate-800 font-bold">{selectedLoad.weight}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-medium">Distance Estimate:</span>
                  <span className="text-slate-800 font-bold">{selectedLoad.distance || 'Calculating...'}</span>
                </div>
                <div className="space-y-1 pt-3 border-t border-slate-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PICKUP ADDRESS</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedLoad.pickup}</p>
                </div>
                <div className="space-y-1 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DROPOFF ADDRESS</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedLoad.dropoff}</p>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5 text-left text-xs">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 font-light leading-relaxed">
                  Acceptance holds your GPS telemetry active for regulatory logs. Escrow pays out within 2 hours of digital sign-off.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button 
                  onClick={() => setSelectedLoad(null)}
                  disabled={accepting}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAcceptLoad(selectedLoad.id)}
                  disabled={accepting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  {accepting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Accept Cargo & Start Trip</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
