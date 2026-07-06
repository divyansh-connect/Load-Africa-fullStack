import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, MapPin, Clock, CheckCircle2, Plus,
  ArrowRight, TrendingUp, DollarSign, Star, ChevronRight
} from 'lucide-react';

const stats = [
  { label: 'Total Bookings', value: '24', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Active Deliveries', value: '3', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Delivered', value: '20', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Total Spent', value: 'R 18,450', icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

const activeBookings = [
  {
    id: 'LA-2024-001',
    from: 'Johannesburg, Gauteng',
    to: 'Cape Town, Western Cape',
    vehicle: '8-Ton Truck',
    status: 'In Transit',
    statusColor: 'bg-blue-100 text-blue-700',
    driver: 'Sipho Zuma',
    eta: '2h 30min',
    progress: 65,
  },
  {
    id: 'LA-2024-002',
    from: 'Rustenburg, North West',
    to: 'Pretoria, Gauteng',
    vehicle: 'Bakkie',
    status: 'Finding Driver',
    statusColor: 'bg-amber-100 text-amber-700',
    driver: '—',
    eta: 'Pending',
    progress: 20,
  },
  {
    id: 'LA-2024-003',
    from: 'Kimberley, Northern Cape',
    to: 'Bloemfontein, Free State',
    vehicle: 'Tipper Truck',
    status: 'Picked Up',
    statusColor: 'bg-emerald-100 text-emerald-700',
    driver: 'Thabo Nkosi',
    eta: '45 min',
    progress: 80,
  },
];

const bookingHistory = [
  { id: 'LA-2023-088', from: 'Joburg', to: 'Durban', vehicle: 'Flatbed', date: '12 Jun 2024', amount: 'R 3,200', status: 'Delivered' },
  { id: 'LA-2023-075', from: 'Pretoria', to: 'Polokwane', vehicle: 'Bakkie', date: '5 Jun 2024', amount: 'R 850', status: 'Delivered' },
  { id: 'LA-2023-061', from: 'Rustenburg', to: 'Joburg', vehicle: '4-Ton Truck', date: '28 May 2024', amount: 'R 1,400', status: 'Delivered' },
];

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

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Good morning, Patrice 👋</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">Active Deliveries</h2>
            <button onClick={() => navigate('/customer/active-deliveries')} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-amber-500" />
                      <span className="font-semibold">{booking.from}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-semibold">{booking.to}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{booking.vehicle} • Driver: {booking.driver}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${booking.statusColor}`}>
                      {booking.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> {booking.eta}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{booking.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${booking.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-mono">{booking.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Book panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-800 mb-3">Quick Book</h3>
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
              <select
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-700"
              >
                <option value="">Select vehicle type</option>
                <option>Bakkie</option>
                <option>Furniture Truck</option>
                <option>4-8 Ton Truck</option>
                <option>Tipper Truck</option>
                <option>Flatbed Truck</option>
              </select>
              <button
                onClick={() => navigate('/customer/create-booking')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Get Quote & Book
              </button>
            </div>
          </div>

          {/* Popular Vehicles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-800 mb-3">Popular Vehicles</h3>
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
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">Recent History</h2>
          <button onClick={() => navigate('/customer/booking-history')} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {bookingHistory.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">{b.from} → {b.to}</p>
                <p className="text-[10px] text-slate-400">{b.vehicle} · {b.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-800">{b.amount}</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
