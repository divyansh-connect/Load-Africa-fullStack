import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, Truck, Package, ChevronRight, TrendingUp, Clock, 
  MapPin, CheckCircle, AlertCircle, DollarSign, Calendar
} from 'lucide-react';
import { getMockData } from '../../data/mockData';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [loads, setLoads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    available: 0,
    completed: 0,
    spent: 0
  });

  useEffect(() => {
    const allLoads = getMockData('loads') || [];
    const customerLoads = allLoads.filter(l => l.customerId === 'usr-1');
    setLoads(customerLoads);

    const allBookings = getMockData('bookings') || [];
    const customerBookings = allBookings.filter(b => b.customerId === 'usr-1');
    setBookings(customerBookings);

    // Calculate dynamic stats
    const active = customerLoads.filter(l => l.status === 'in_transit' || l.status === 'assigned').length;
    const available = customerLoads.filter(l => l.status === 'available').length;
    const completed = customerLoads.filter(l => l.status === 'completed').length;
    const spent = customerLoads.reduce((sum, item) => sum + (item.status === 'completed' || item.status === 'assigned' || item.status === 'in_transit' ? item.budget : 0), 0);

    setStats({ active, available, completed, spent });
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Finding Driver</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Driver Assigned</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">In Transit</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome back, Patrice Motsepe</h2>
          <p className="mt-2 text-slate-300 font-light text-sm sm:text-base">
            Keep your supply chain moving. Manage your active shipments, look at rates, or book a flatbed cargo truck in minutes.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/customer/create-booking')}
              className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Book New Load
            </button>
            <button 
              onClick={() => navigate('/customer/active-deliveries')}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-2xl transition-all border border-slate-700/60"
            >
              <Truck className="h-4.5 w-4.5" />
              Track Active Fleet
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Shipments</span>
            <p className="text-3xl font-extrabold text-slate-900">{stats.active}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unassigned Loads</span>
            <p className="text-3xl font-extrabold text-slate-900">{stats.available}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Deliveries</span>
            <p className="text-3xl font-extrabold text-slate-900">{stats.completed}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Budget Committed</span>
            <p className="text-3xl font-extrabold text-slate-900">R{stats.spent.toLocaleString()}</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main grids: Cargo Table & Analytics placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 cols: Cargo Loads tracking */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Shipments</h3>
              <p className="text-xs text-slate-400">Overview of recent shipments posted by you.</p>
            </div>
            <Link to="/customer/booking-history" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View History
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loads.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <Package className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No shipments found</p>
              <button 
                onClick={() => navigate('/customer/create-booking')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Create First Load
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Load ID / Cargo</th>
                    <th className="pb-3 font-semibold">Route</th>
                    <th className="pb-3 font-semibold">Weight & Budget</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {loads.slice(0, 4).map((load) => (
                    <tr key={load.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{load.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono font-medium">{load.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-3 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs gap-1.5 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="truncate font-medium">{load.pickup.split(',')[0]}</span>
                          </div>
                          <div className="flex items-center text-xs gap-1.5 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate font-medium">{load.dropoff.split(',')[0]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-3">
                        <p className="font-bold text-slate-800">R{load.budget}</p>
                        <span className="text-xs text-slate-400 font-medium">{load.weight}</span>
                      </td>
                      <td className="py-4.5 px-3">
                        {getStatusBadge(load.status)}
                      </td>
                      <td className="py-4.5 pl-3 text-right">
                        {(load.status === 'in_transit' || load.status === 'assigned') ? (
                          <button 
                            onClick={() => navigate('/customer/active-deliveries')}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                          >
                            Track
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate('/customer/booking-history')}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 col: Quick Info Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Africa Market Insights</h3>
              <p className="text-xs text-slate-400">Logistics metrics for Western & Eastern corridors.</p>
            </div>
            
            {/* Insights widgets */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">Lagos - Kano Corridor Rates</p>
                  <p className="text-xs text-slate-500 font-light">Average diesel pricing rose by 4% in June. Transport rates updated dynamically in budget builder.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                <Truck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">Verified Trucks Available</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-xs text-slate-600 font-medium">14 Flatbeds & 8 Box Trucks nearby</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <AlertCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>Tips for faster booking:</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                Add precise weight metrics and categories when creating loads. Drivers accept loads with detailed descriptions 60% faster.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium bg-slate-55 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Support Line</span>
              </div>
              <span className="font-bold text-slate-700">+27 63 931 6677</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
