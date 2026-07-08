import React, { useState, useEffect } from 'react';
import { 
  MapPin, Truck, Box, Navigation, Clock, Search, 
  ChevronRight, Calendar, AlertCircle
} from 'lucide-react';
import { driverService } from '../../services/driverService';

export default function AvailableLoads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      const res = await driverService.getAvailableLoads();
      if (res.success) {
        setLoads(res.data);
      }
    } catch (err) {
      setError('Failed to fetch available loads. Ensure you have a driver profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (bookingId) => {
    try {
      setApplyingId(bookingId);
      const res = await driverService.applyForLoad(bookingId);
      if (res.success) {
        // Remove from list or show success
        alert("Application submitted successfully! The broker will review it.");
        setLoads(loads.filter(l => l.id !== bookingId));
      }
    } catch (err) {
      alert("Failed to apply for load. It may no longer be available.");
      fetchLoads();
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Searching for matching loads...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Loads</h2>
          <p className="text-sm text-slate-500 mt-1">Loads matching your vehicle type and radius.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">Looking for new loads</span>
        </div>
      </div>

      {loads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No matching loads found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            We are actively searching for new shipments that match your vehicle profile. Please check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {loads.map(load => (
            <div key={load.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-[#f4a236] transition-colors group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left: Route info */}
                <div className="flex-1 space-y-4 relative">
                  <div className="absolute left-3 top-8 bottom-4 w-0.5 bg-slate-100 -z-10" />
                  
                  {/* Pickup */}
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-white z-10">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup</p>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{load.pickup_address}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(load.pickup_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 border-2 border-white z-10">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery</p>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{load.delivery_address}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(load.delivery_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Cargo Info */}
                <div className="flex-1 md:border-l md:border-r border-slate-100 md:px-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5 line-clamp-1">{load.cargo_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{load.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Req.</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-[#f4a236]" /> {load.requested_vehicle || 'Any'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Distance</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{load.estimated_distance || 'N/A'} km</p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full md:w-48 shrink-0 flex flex-col justify-center space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Pay</p>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">Contact Broker</p>
                  </div>
                  <button 
                    disabled={applyingId === load.id}
                    onClick={() => handleApply(load.id)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                  >
                    {applyingId === load.id ? 'Applying...' : 'Apply for Load'}
                  </button>
                  <button className="w-full py-2.5 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors border border-transparent hover:border-slate-200">
                    View Full Details
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
