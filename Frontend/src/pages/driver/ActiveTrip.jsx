import React, { useState, useEffect } from 'react';
import { 
  MapPin, Truck, Box, Navigation, Clock, CheckCircle2, 
  PhoneCall, Package, Check, ArrowRight, AlertCircle
} from 'lucide-react';
import { driverService } from '../../services/driverService';

import LoadAfricaMap from '../../components/ui/LoadAfricaMap';

export default function ActiveTrip() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [driverLoc, setDriverLoc] = useState(null);
  const [isNearbyPickup, setIsNearbyPickup] = useState(false);
  const [isNearbyDelivery, setIsNearbyDelivery] = useState(false);
  const [simulatingRoute, setSimulatingRoute] = useState(false);

  const calcDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      setLoading(true);
      const res = await driverService.getActiveTrip();
      if (res.success && res.data) {
        setTrip(res.data);
        const s = res.data.status;
        if (s !== 'DRIVER_EN_ROUTE') setIsNearbyPickup(false);
        if (s !== 'IN_TRANSIT') setIsNearbyDelivery(false);
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

  const calcHeading = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  const simulateEnRouteProgress = async () => {
    if (!trip) return;
    const destLat = trip.pickup_coords_lat || -26.0697;
    const destLng = trip.pickup_coords_lng || 28.0898;
    const startLat = destLat - 0.10;
    const startLng = destLng - 0.10;

    setSimulatingRoute(true);
    showToast("Starting navigation to pickup...");

    const steps = 5;
    let step = 1;

    const interval = setInterval(async () => {
      const currentLat = startLat + ((destLat - startLat) * step) / steps;
      const currentLng = startLng + ((destLng - startLng) * step) / steps;
      const distance = calcDistance(currentLat, currentLng, destLat, destLng);
      
      const speed = 65; // simulated 65 km/h
      const heading = calcHeading(
        step > 1 && driverLoc ? driverLoc.lat : startLat,
        step > 1 && driverLoc ? driverLoc.lng : startLng,
        currentLat,
        currentLng
      );

      setDriverLoc({ lat: currentLat, lng: currentLng, speed, heading });

      try {
        await driverService.updateTelemetry(trip.id, currentLat, currentLng, speed, heading);
        showToast(`Navigating: ${Math.round((step / steps) * 100)}%. Distance: ${distance.toFixed(1)} km`);
      } catch (err) {
        console.error(err);
      }

      if (distance < 2.0) {
        setIsNearbyPickup(true);
      }

      step += 1;
      if (step > steps) {
        clearInterval(interval);
        setSimulatingRoute(false);
        showToast("Arrived nearby pickup location! You can now mark Reached Pickup.");
      }
    }, 2500);
  };

  const simulateTransitProgress = async () => {
    if (!trip) return;
    const startLat = trip.pickup_coords_lat || -26.0697;
    const startLng = trip.pickup_coords_lng || 28.0898;
    const destLat = trip.delivery_coords_lat || -25.7479;
    const destLng = trip.delivery_coords_lng || 28.2292;

    setSimulatingRoute(true);
    showToast("Starting transit simulation to destination...");

    const steps = 5;
    let step = 1;

    const interval = setInterval(async () => {
      const currentLat = startLat + ((destLat - startLat) * step) / steps;
      const currentLng = startLng + ((destLng - startLng) * step) / steps;
      const distance = calcDistance(currentLat, currentLng, destLat, destLng);
      
      const speed = 75; // simulated 75 km/h
      const heading = calcHeading(
        step > 1 && driverLoc ? driverLoc.lat : startLat,
        step > 1 && driverLoc ? driverLoc.lng : startLng,
        currentLat,
        currentLng
      );

      setDriverLoc({ lat: currentLat, lng: currentLng, speed, heading });

      try {
        await driverService.updateTelemetry(trip.id, currentLat, currentLng, speed, heading);
        showToast(`Transit Progress: ${Math.round((step / steps) * 100)}%. Distance: ${distance.toFixed(1)} km`);
      } catch (err) {
        console.error(err);
      }

      if (distance < 2.0) {
        setIsNearbyDelivery(true);
      }

      step += 1;
      if (step > steps) {
        clearInterval(interval);
        setSimulatingRoute(false);
        showToast("Arrived nearby destination! You can now mark Reached Destination.");
      }
    }, 2500);
  };

  const handleAcceptAssignment = async () => {
    try {
      setUpdating(true);
      await driverService.acceptAssignment(trip.id);
      showToast("Trip assignment accepted!");
      await fetchActiveTrip();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept trip");
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectAssignment = async () => {
    try {
      setUpdating(true);
      await driverService.rejectAssignment(trip.id);
      showToast("Trip assignment declined.");
      await fetchActiveTrip();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to decline trip");
    } finally {
      setUpdating(false);
    }
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

  const s = trip.status;
  
  const getNextAction = () => {
    // 3 simplified steps
    if (s === 'DRIVER_ASSIGNED') {
      return { label: 'Start Route to Pickup', status: 'DRIVER_EN_ROUTE', primary: true, icon: Navigation };
    }
    if (s === 'DRIVER_EN_ROUTE') {
      return { 
        label: 'Reached Pickup & Load Cargo', 
        status: 'IN_TRANSIT', 
        primary: true, 
        icon: MapPin, 
        disabled: !isNearbyPickup,
        tooltip: !isNearbyPickup ? 'You must be nearby pickup to load cargo. Start drive simulation below!' : ''
      };
    }
    if (s === 'IN_TRANSIT') {
      return { 
        label: 'Complete Delivery', 
        status: 'COMPLETED', 
        primary: true, 
        icon: CheckCircle2, 
        disabled: !isNearbyDelivery,
        tooltip: !isNearbyDelivery ? 'You must be nearby destination to complete delivery. Start drive simulation below!' : ''
      };
    }
    // Fallback/Safety mappings for other database states
    if (['ARRIVED_PICKUP', 'LOADING', 'PICKED_UP'].includes(s)) {
      return { label: 'Start Transit Journey', status: 'IN_TRANSIT', primary: true, icon: Navigation };
    }
    if (['ARRIVED_DESTINATION', 'DELIVERED', 'POD_UPLOADED', 'POD_VERIFIED'].includes(s)) {
      return { label: 'Complete Delivery Payout', status: 'COMPLETED', primary: true, icon: CheckCircle2 };
    }
    return null;
  };

  const action = getNextAction();

  const stages = [
    { key: 'ASSIGNED', match: ['DRIVER_ASSIGNED'], label: 'Assigned' },
    { key: 'EN_ROUTE', match: ['DRIVER_EN_ROUTE'], label: 'En Route to Pickup' },
    { key: 'TRANSIT', match: ['ARRIVED_PICKUP', 'LOADING', 'PICKED_UP', 'IN_TRANSIT'], label: 'In Transit' },
    { key: 'COMPLETED', match: ['ARRIVED_DESTINATION', 'DELIVERED', 'POD_UPLOADED', 'POD_VERIFIED', 'COMPLETED'], label: 'Completed' }
  ];

  let currentStageIdx = stages.findIndex(st => st.match.includes(s));
  if (currentStageIdx === -1) currentStageIdx = 0;

  const showNavigationLayout = true;

  return (
    <div className="space-y-6 animate-fadeIn pb-10 max-w-5xl mx-auto text-left">
      
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
        
        {trip.assignmentStatus === 'PENDING' ? (
          <div className="flex items-center gap-3">
            <button
              disabled={updating}
              onClick={handleRejectAssignment}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-red-500/10 animate-pulse"
            >
              Decline Assignment
            </button>
            <button
              disabled={updating}
              onClick={handleAcceptAssignment}
              className="px-5 py-2.5 bg-[#f4a236] hover:bg-amber-400 hover:text-amber-950 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Accept Assignment
            </button>
          </div>
        ) : (
          action && !action.disabled && (
            <div className="flex flex-col items-end gap-1.5 animate-fadeIn">
              <button 
                disabled={updating}
                onClick={() => updateStatus(action.status)}
                className="flex items-center gap-2 px-6 py-3 font-extrabold text-sm rounded-xl transition-all shadow-lg bg-[#f4a236] hover:bg-[#fdd086] hover:text-amber-900 text-white shadow-amber-500/20"
              >
                {updating ? 'Updating...' : action.label}
                {!updating && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )
        )}
      </div>

      {/* Pending assignment warning banner */}
      {trip.assignmentStatus === 'PENDING' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-800 animate-pulse">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-left text-xs">
            <p className="font-black mb-1 uppercase tracking-wider text-amber-900">New Trip Assignment Awaiting Acceptance</p>
            <p className="font-semibold leading-relaxed">
              Please review the cargo details, pickup location, and delivery route below. You must accept the assignment before you can start moving or initiate GPS live tracking.
            </p>
          </div>
        </div>
      )}

      {/* Layout switches depending on navigation mode */}
      <div className={showNavigationLayout ? "space-y-6 max-w-4xl mx-auto" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
        
        {/* Main Column */}
        <div className={showNavigationLayout ? "w-full space-y-6 animate-fadeIn" : "lg:col-span-2 space-y-6"}>
          
          {/* Progress Tracker (Hidden in Clean Navigation View) */}
          {!showNavigationLayout && (
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
          )}

          {/* Route Map Card (Hidden in Clean Navigation Layout) */}
          {!showNavigationLayout && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6 relative">
                <div className="absolute left-3 top-8 bottom-8 w-0.5 bg-slate-100 -z-10" />
                
                <div className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-white z-10">
                    <div className="h-2 w-2 rounded-full bg-emerald-50" />
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
                    <div className="h-2 w-2 rounded-full bg-red-50" />
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
          )}

          {/* Interactive Route Map (Becomes clean and full-width during transit view) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-500" /> 
                {showNavigationLayout ? 'GPS Navigation Active' : 'Interactive Route Map'}
              </h3>
              {showNavigationLayout && (
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full animate-pulse border border-amber-400/50">
                  LIVE NAVIGATION MODE
                </span>
              )}
            </div>

            <LoadAfricaMap 
              pickupCoords={{ lat: trip.pickup_coords_lat, lng: trip.pickup_coords_lng }} 
              deliveryCoords={{ lat: trip.delivery_coords_lat, lng: trip.delivery_coords_lng }} 
              currentCoords={driverLoc ? { lat: driverLoc.lat, lng: driverLoc.lng } : null}
              routePolyline={trip.route_polyline}
              heading={driverLoc?.heading || 0}
              speed={driverLoc?.speed || 0}
              status={trip.status}
              height="380px"
            />

            {/* Simulators */}
            {s === 'DRIVER_EN_ROUTE' && (
              <div className="p-5 bg-amber-500/5 border border-amber-200/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                <div className="text-left space-y-1">
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 text-amber-500 animate-spin" />
                    GPS Navigation Progress
                  </p>
                  <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                    {simulatingRoute 
                      ? 'Simulating drive towards the pickup location...' 
                      : isNearbyPickup 
                      ? 'You are now nearby the pickup yard! Reached Pickup button is unlocked.' 
                      : 'Simulate vehicle transit to enable the Reached Pickup arrival action.'}
                  </p>
                  {driverLoc && (
                    <p className="text-[9px] font-mono text-slate-500 mt-1">
                      Current GPS: {driverLoc.lat.toFixed(4)}°, {driverLoc.lng.toFixed(4)}°
                    </p>
                  )}
                </div>
                <button
                  onClick={simulateEnRouteProgress}
                  disabled={simulatingRoute || isNearbyPickup}
                  className="px-5 py-2.5 bg-[#f4a236] hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/10 shrink-0 cursor-pointer"
                >
                  {simulatingRoute ? 'Navigating...' : isNearbyPickup ? 'Arrived Nearby' : 'Simulate Drive to Pickup'}
                </button>
              </div>
            )}

            {s === 'IN_TRANSIT' && (
              <div className="p-5 bg-emerald-500/5 border border-emerald-250/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                <div className="text-left space-y-1">
                  <p className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-500 animate-bounce" />
                    In Transit Route Progress
                  </p>
                  <p className="text-[10px] text-emerald-800 font-semibold leading-relaxed">
                    {simulatingRoute 
                      ? 'Driving coordinates updating along route...' 
                      : isNearbyDelivery 
                      ? 'Arrived nearby delivery address! Reached Destination button is unlocked.' 
                      : 'Simulate cargo delivery transit to enable the Reached Destination arrival action.'}
                  </p>
                  {driverLoc && (
                    <p className="text-[9px] font-mono text-slate-500 mt-1">
                      Current GPS: {driverLoc.lat.toFixed(4)}°, {driverLoc.lng.toFixed(4)}°
                    </p>
                  )}
                </div>
                <button
                  onClick={simulateTransitProgress}
                  disabled={simulatingRoute || isNearbyDelivery}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/10 shrink-0 cursor-pointer"
                >
                  {simulatingRoute ? 'Navigating...' : isNearbyDelivery ? 'Arrived Nearby' : 'Simulate Drive to Dropoff'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Status & Contacts (Hidden completely during navigation to satisfy "Only Map" requirement) */}
        {!showNavigationLayout && (
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
          </div>
        )}

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
