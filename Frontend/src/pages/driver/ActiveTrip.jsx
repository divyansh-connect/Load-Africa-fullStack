import React, { useState, useEffect } from 'react';
import { 
  MapPin, Truck, Box, Navigation, Clock, CheckCircle2, 
  PhoneCall, Package, Check, ArrowRight
} from 'lucide-react';
import { driverService } from '../../services/driverService';

export default function ActiveTrip() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      setLoading(true);
      const res = await driverService.getActiveTrip();
      if (res.success) {
        setTrip(res.data);
      }
    } catch (err) {
      setError('Failed to fetch active trip.');
    } finally {
      setLoading(false);
    }
  };

  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const simulateProgress = async () => {
    if (!trip) return;
    const startLat = trip.pickup_coords_lat || -26.2041;
    const startLng = trip.pickup_coords_lng || 28.0473;
    const endLat = trip.delivery_coords_lat || -25.7479;
    const endLng = trip.delivery_coords_lng || 28.2292;

    const steps = 5;
    let step = 1;

    showToast("Starting live transit simulation...");

    const interval = setInterval(async () => {
      const currentLat = startLat + ((endLat - startLat) * step) / steps;
      const currentLng = startLng + ((endLng - startLng) * step) / steps;

      try {
        await driverService.updateTelemetry(trip.id, currentLat, currentLng);
        showToast(`Simulation step ${step}/5. Progress: ${step * 20}%`);
      } catch (err) {
        console.error(err);
      }

      step += 1;
      if (step > steps) {
        clearInterval(interval);
        showToast("Transit simulation complete! Trip arrived.");
        await updateStatus('ARRIVED_DESTINATION');
      }
    }, 3000);
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await driverService.updateTripStatus(trip.id, newStatus);
      await fetchActiveTrip();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your active trip...</div>;
  if (error) return <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>;
  if (!trip) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto mt-10">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Truck className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">No Active Trip</h3>
        <p className="text-slate-500 text-sm mb-6">You don't have any assigned trips at the moment.</p>
        <button onClick={() => window.location.href = '/driver/available-loads'} className="px-6 py-3 bg-[#f4a236] text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-500 transition-all">
          Find Available Loads
        </button>
      </div>
    );
  }

  // Determine which actions to show based on status
  const s = trip.status;
  
  const getNextAction = () => {
    if (s === 'DRIVER_ASSIGNED') return { label: 'Start Route to Pickup', status: 'DRIVER_EN_ROUTE', primary: true, icon: Navigation };
    if (s === 'DRIVER_EN_ROUTE') return { label: 'Reached Pickup', status: 'ARRIVED_PICKUP', primary: true, icon: MapPin };
    if (s === 'ARRIVED_PICKUP') return { label: 'Start Loading', status: 'LOADING', primary: true, icon: Box };
    if (s === 'LOADING') return { label: 'Loading Complete (Picked Up)', status: 'PICKED_UP', primary: true, icon: CheckCircle2 };
    if (s === 'PICKED_UP') return { label: 'Start Journey (In Transit)', status: 'IN_TRANSIT', primary: true, icon: Truck };
    if (s === 'IN_TRANSIT') return { label: 'Reached Destination', status: 'ARRIVED_DESTINATION', primary: true, icon: MapPin };
    if (s === 'ARRIVED_DESTINATION') return { label: 'Mark as Delivered', status: 'DELIVERED', primary: true, icon: Package };
    if (s === 'DELIVERED') return { label: 'Upload POD', status: 'POD_UPLOADED', primary: true, icon: Check };
    return null;
  };

  const action = getNextAction();

  // Progress logic
  const stages = [
    { key: 'ASSIGNED', match: ['DRIVER_ASSIGNED'], label: 'Assigned' },
    { key: 'EN_ROUTE', match: ['DRIVER_EN_ROUTE'], label: 'En Route' },
    { key: 'ARRIVED', match: ['ARRIVED_PICKUP'], label: 'At Pickup' },
    { key: 'LOADING', match: ['LOADING'], label: 'Loading' },
    { key: 'TRANSIT', match: ['PICKED_UP', 'IN_TRANSIT'], label: 'In Transit' },
    { key: 'DESTINATION', match: ['ARRIVED_DESTINATION'], label: 'At Dest.' },
    { key: 'DELIVERED', match: ['DELIVERED', 'POD_UPLOADED'], label: 'Delivered' }
  ];

  let currentStageIdx = stages.findIndex(st => st.match.includes(s));
  if (currentStageIdx === -1) currentStageIdx = 0; // fallback

  return (
    <div className="space-y-6 animate-fadeIn pb-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider border border-emerald-500/30">
              Active Trip
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest">{trip.id}</span>
          </div>
          <h2 className="text-2xl font-black">{trip.cargo_name}</h2>
        </div>
        
        {action && (
          <button 
            disabled={updating}
            onClick={() => updateStatus(action.status)}
            className="flex items-center gap-2 px-6 py-3 bg-[#f4a236] hover:bg-[#fdd086] hover:text-amber-900 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            {updating ? 'Updating...' : action.label}
            {!updating && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Route & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Tracker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] relative">
              <div className="absolute left-6 right-6 top-5 h-1 bg-slate-100 -z-10 rounded-full" />
              <div 
                className="absolute left-6 top-5 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500" 
                style={{ width: `calc(${(currentStageIdx / (stages.length - 1)) * 100}% - 2rem)` }} 
              />
              
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-2 w-2 rounded-full bg-slate-300" />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-slate-900' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Map Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6 relative">
              <div className="absolute left-3 top-8 bottom-8 w-0.5 bg-slate-100 -z-10" />
              
              <div className="flex gap-4 items-start">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-white z-10">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</p>
                  <h4 className="font-bold text-slate-800 text-lg">{trip.pickup_address}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-[#f4a236] bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                      <Navigation className="h-3.5 w-3.5" /> Navigate
                    </button>
                    {trip.pickup_contact && (
                      <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                        <PhoneCall className="h-3.5 w-3.5" /> Call Pickup
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 border-2 border-white z-10">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Location</p>
                  <h4 className="font-bold text-slate-800 text-lg">{trip.delivery_address}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-[#f4a236] bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                      <Navigation className="h-3.5 w-3.5" /> Navigate
                    </button>
                    {trip.delivery_contact && (
                      <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                        <PhoneCall className="h-3.5 w-3.5" /> Call Receiver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Distance</p>
                <p className="font-black text-slate-800 text-xl">{trip.estimated_distance || '300'} km</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo Weight</p>
                <p className="font-black text-slate-800 text-xl">{trip.weight} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Vehicle</p>
                <p className="font-bold text-slate-800 text-sm">{trip.requested_vehicle || 'Any'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Status & Contacts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Customer Details</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                  {trip.customer?.company_name?.[0] || 'C'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{trip.customer?.company_name || 'Individual Customer'}</p>
                  <p className="text-xs text-slate-500">{trip.guest_phone || 'Contact via Broker'}</p>
                </div>
              </div>
              <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                <PhoneCall className="h-3.5 w-3.5" /> Contact Broker Support
              </button>
            </div>
          </div>

          <div className="bg-[#fdd086]/20 p-6 rounded-3xl border border-[#fdd086]/50">
            <h4 className="font-bold text-amber-900 mb-2">Instructions</h4>
            <p className="text-sm text-amber-800/80 mb-4">
              {trip.pickup_instructions || 'Please ensure you have all required PPE before entering the pickup facility. Call the pickup contact 30 minutes prior to arrival.'}
            </p>
          </div>

          {s === 'IN_TRANSIT' && (
            <div className="mt-4 p-6 border border-emerald-205 rounded-3xl bg-emerald-50 text-center space-y-3">
              <p className="text-xs font-bold text-emerald-800">Simulate vehicle coordinates, completed distance, and remaining distance tracking updates.</p>
              <button
                onClick={simulateProgress}
                className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-500 font-extrabold text-xs tracking-wider rounded-xl uppercase transition-all cursor-pointer"
              >
                Simulate Driving Progress
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Local Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl shadow-xl bg-slate-900 border border-slate-800 text-white z-50 animate-slideUp">
          <p className="text-xs font-bold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
