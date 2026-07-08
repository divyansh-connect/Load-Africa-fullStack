import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, MapPin, Clock, CheckCircle2, Plus,
  ArrowRight, TrendingUp, DollarSign, Star, ChevronRight, Loader2
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { authService } from '../../services/authService';

const quickVehicles = [
  { name: 'Bakkie', capacity: '1 ton', icon: '🛻', desc: 'Parcels & light cargo' },
  { name: 'Furniture Truck', capacity: '3-5 ton', icon: '🚚', desc: 'Home & office moves' },
  { name: 'Tipper Truck', capacity: '10-15 ton', icon: '🚛', desc: 'Sand, rubble, building materials' },
  { name: '8-Ton Truck', capacity: '8 ton', icon: '🚛', desc: 'Pallets & heavy cargo' },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await customerService.getDashboard();
        setDashboardData(res.data);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeBookingsCount = dashboardData?.activeBookingsCount || 0;
  const totalBookings = dashboardData?.totalBookings || 0;
  const walletBalance = dashboardData?.walletBalance || 0;
  const recentBookings = dashboardData?.recentBookings || [];

  const pendingQuotesCount = dashboardData?.pendingQuotesCount || 0;

  const stats = [
    { label: 'Total Bookings', value: totalBookings.toString(), icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Pending Quotes', value: pendingQuotesCount.toString(), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Deliveries', value: activeBookingsCount.toString(), icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Wallet Balance', value: `R ${walletBalance}`, icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Good morning, {user?.firstName || 'Customer'} 👋</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Here's what's happening with your shipments today.</p>
        </div>
        <button
          onClick={() => navigate('/customer/create-booking')}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Book a Load
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Active Bookings (using recent for demo, filtered by status) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">Active Deliveries</h2>
            <button onClick={() => navigate('/customer/active-deliveries')} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentBookings.filter(b => ['QUOTE_REQUESTED', 'QUOTE_PREPARED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status)).length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
                No active deliveries at the moment.
              </div>
            ) : (
              recentBookings
                .filter(b => ['QUOTE_REQUESTED', 'QUOTE_PREPARED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status))
                .map((booking) => (
                <div 
                  key={booking.id} 
                  onClick={() => navigate(`/customer/booking-details/${booking.id}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2.5 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        <span className="font-semibold">{booking.pickup}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold">{booking.dropoff}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{booking.vehicle_type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-100 text-blue-700">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono">{booking.id}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Book panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-800 mb-2">Quick Quote</h3>
            <p className="text-[10px] text-slate-500 mb-3">Enter route to see vehicle options and rates.</p>
            <div className="space-y-2">
              <input
                placeholder="Pickup location"
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400"
              />
              <input
                placeholder="Drop-off location"
                value={dropoff}
                onChange={e => setDropoff(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={() => navigate('/customer/create-booking', { state: { pickup, dropoff } })}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Find Vehicles
              </button>
            </div>
          </div>

          {/* Popular Vehicles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-800 mb-2">Popular Vehicles</h3>
            <div className="space-y-2">
              {quickVehicles.map((v) => (
                <div key={v.name} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate('/customer/create-booking')}>
                  <span className="text-lg">{v.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{v.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{v.desc}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{v.capacity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">Recent History</h2>
          <button onClick={() => navigate('/customer/booking-history')} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {recentBookings.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No booking history yet.</div>
          ) : (
            recentBookings.map((b) => (
            <div 
              key={b.id} 
              onClick={() => navigate(`/customer/booking-details/${b.id}`)}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">{b.pickup} → {b.dropoff}</p>
                <p className="text-[10px] text-slate-400">{b.vehicle_type} · {new Date(b.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-800">R {b.estimated_price || 0}</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{b.status}</span>
              </div>
            </div>
          )))}
        </div>
      </div>

    </div>
  );
}
