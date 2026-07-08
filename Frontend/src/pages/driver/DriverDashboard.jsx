import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, DollarSign, Clock,
  ArrowRight, Star, ToggleLeft, ToggleRight, ChevronRight,
  AlertCircle
} from 'lucide-react';
import { driverService } from '../../services/driverService';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, tripRes, loadsRes, histRes] = await Promise.all([
        driverService.getDriverDashboard(),
        driverService.getActiveTrip(),
        driverService.getAvailableLoads(),
        driverService.getDriverHistory()
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (tripRes.success) setActiveTrip(tripRes.data);
      if (loadsRes.success) setAvailableLoads(loadsRes.data);
      if (histRes.success) setHistory(histRes.data);

    } catch (err) {
      console.error("Failed to load driver dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  const stats = [
    { label: 'Completed Trips', value: dashboardData?.completedTrips || '0', icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Trip', value: activeTrip ? '1' : '0', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Earnings', value: `R ${dashboardData?.earnings || '0'}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Rating', value: `${dashboardData?.rating || '0'}★`, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">

      {/* Welcome + Online toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Driver Command Center</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isOnline ? 'You are online — matching with live loads.' : 'You are offline — go online to receive loads.'}
          </p>
        </div>
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
            isOnline
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-200 text-slate-600 border-slate-300'
          }`}
        >
          {isOnline ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Available Loads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">New Loads Available</h2>
            <button onClick={() => navigate('/driver/available-loads')} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData?.status !== 'ACTIVE' ? (
              <div className="p-8 text-center bg-white border border-amber-200 rounded-2xl">
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Complete KYC to View Loads</h3>
                <p className="text-xs text-slate-500 mt-2 mb-4">Your account is currently {dashboardData?.status || 'PENDING'}. You must submit your documents and be approved to receive load assignments.</p>
                <button onClick={() => navigate('/driver/kyc')} className="px-4 py-2 bg-[#f4a236] text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20">Go to KYC</button>
              </div>
            ) : availableLoads.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
                No matching loads currently. We will notify you when a load is available.
              </div>
            ) : (
              availableLoads.slice(0, 3).map((load) => (
                <div key={load.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-[#f4a236] transition-colors cursor-pointer" onClick={() => navigate('/driver/available-loads')}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        {load.pickup_address}
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        {load.delivery_address}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{load.cargo_name} · {load.weight} kg · {load.requested_vehicle || 'Any Vehicle'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active trip + Earnings */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => activeTrip && navigate('/driver/active-trip')}>
            <h3 className="text-xs font-extrabold text-slate-800">Current Trip</h3>
            {activeTrip ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                  <MapPin className="h-3 w-3" />
                  Trip in Progress
                </div>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{activeTrip.status.replace(/_/g, ' ')}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-blue-600 font-bold flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {activeTrip.cargo_name}</span>
                </div>
                <button className="w-full mt-2 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase">Open Details</button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2">
                <Truck className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-[10px] text-slate-500 font-medium">No active trips currently. Apply for a load to start earning.</p>
              </div>
            )}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-emerald-900">Wallet Balance</h3>
            <p className="text-2xl font-black text-emerald-600">R {dashboardData?.walletBalance || '0'}</p>
            <button onClick={() => navigate('/driver/earnings')} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all">
              Withdraw Earnings
            </button>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">History</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">No completed trips yet.</div>
          ) : (
            history.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5 max-w-[60%]">
                  <p className="text-xs font-bold text-slate-800 truncate">{t.pickup_address} → {t.delivery_address}</p>
                  <p className="text-[10px] text-slate-400">{t.cargo_name} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
