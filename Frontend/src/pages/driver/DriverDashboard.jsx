import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck, MapPin, DollarSign, CheckCircle2, Clock,
  ArrowRight, Star, ToggleLeft, ToggleRight, ChevronRight,
  ShieldCheck, TrendingUp, Package, AlertCircle, FileText, Upload, User, Settings
} from 'lucide-react';

const stats = [
  { label: 'Total Trips', value: '142', icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Active Trip', value: '1', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'This Month', value: 'R 8,200', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Rating', value: '4.8★', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
];

const availableLoads = [
  {
    id: 'LA-2024-091',
    from: 'Johannesburg, Gauteng',
    to: 'Polokwane, Limpopo',
    cargo: 'Building Materials',
    weight: '8 tons',
    vehicle: '8-Ton Truck',
    payout: 'R 2,800',
    distance: '320 km',
    urgency: 'Same Day',
    urgencyColor: 'bg-red-100 text-red-700',
  },
  {
    id: 'LA-2024-090',
    from: 'Rustenburg, North West',
    to: 'Pretoria, Gauteng',
    cargo: 'Furniture & Goods',
    weight: '3 tons',
    vehicle: 'Furniture Truck',
    payout: 'R 950',
    distance: '110 km',
    urgency: 'Flexible',
    urgencyColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'LA-2024-089',
    from: 'Kimberley, Northern Cape',
    to: 'Johannesburg, Gauteng',
    cargo: 'Mining Aggregate',
    weight: '15 tons',
    vehicle: 'Tipper Truck',
    payout: 'R 4,500',
    distance: '480 km',
    urgency: 'Tomorrow',
    urgencyColor: 'bg-amber-100 text-amber-700',
  },
];

const recentTrips = [
  { id: 'LA-2024-085', from: 'Joburg', to: 'Cape Town', cargo: 'Retail Pallets', date: '10 Jun', earned: 'R 5,200', rating: 5 },
  { id: 'LA-2024-078', from: 'Pretoria', to: 'Durban', cargo: 'Electronics', date: '4 Jun', earned: 'R 3,800', rating: 5 },
  { id: 'LA-2024-071', from: 'Rustenburg', to: 'Joburg', cargo: 'Sand Delivery', date: '28 May', earned: 'R 1,100', rating: 4 },
];

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const handleAcceptLoad = (id) => {
    alert(`Load ${id} Accepted! Added to Active Trip.`);
    navigate('/driver/active-trip');
  };

  // 1. Available Loads Page View
  if (path.endsWith('/available-loads')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Available Loads near you</h1>
          <p className="text-xs text-slate-500 font-medium">Accept freight requests matching your vehicle.</p>
        </div>

        <div className="space-y-3">
          {availableLoads.map((load) => (
            <div key={load.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-amber-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    {load.from}
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    {load.to}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{load.cargo} · {load.weight} · {load.vehicle} · {load.distance}</p>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start ${load.urgencyColor}`}>
                  {load.urgency}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className="text-base font-extrabold text-amber-600">{load.payout}</span>
                <button onClick={() => handleAcceptLoad(load.id)} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase rounded-lg transition-colors">
                  Accept Load
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. KYC Verification View
  if (path.endsWith('/kyc')) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">KYC Verification</h1>
          <p className="text-xs text-slate-500 font-medium">Verify your driver license and permits to unlock full payouts.</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-emerald-800">Verified Transporter</p>
            <p className="text-[10px] text-emerald-600">All documents approved. Load matching enabled.</p>
          </div>
          <span className="ml-auto text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">APPROVED</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">PrDP Code 14 Heavy License</p>
                <p className="text-[10px] text-slate-400">Expires Oct 2028</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Vehicle Inspection Certificate</p>
                <p className="text-[10px] text-slate-400">Expires Dec 2026</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Driver Profile View
  if (path.endsWith('/profile')) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Profile & Account</h1>
          <p className="text-xs text-slate-500 font-medium">Manage driver contact info and payout preferences.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="Sipho Zuma" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Sipho Zuma</h3>
              <p className="text-xs text-slate-400">Driver ID: DR-9921-ZA | Rating: 4.8 ★</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
              <input type="text" defaultValue="+27 82 123 4567" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Assigned Truck Plate</label>
              <input type="text" defaultValue="GP 12 ABC (8-Ton Dropside)" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Payout Bank Account</label>
              <input type="text" defaultValue="FNB Account •••• 9812" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default Overview
  return (
    <div className="space-y-6">

      {/* Welcome + Online toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Welcome, Sipho 👋</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isOnline ? 'You are online — loads are visible to you.' : 'You are offline — go online to see available loads.'}
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

      {/* KYC Status */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-xs font-extrabold text-emerald-800">KYC Verified</p>
          <p className="text-[10px] text-emerald-600">Your documents are approved. You can accept all load types.</p>
        </div>
        <span className="ml-auto text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">VERIFIED</span>
      </div>

      {/* Stats */}
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

        {/* Available Loads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">Available Loads Near You</h2>
            <button onClick={() => navigate('/driver/available-loads')} className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {availableLoads.slice(0, 2).map((load) => (
              <div key={load.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-amber-300 transition-colors group">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                      <MapPin className="h-3 w-3 text-amber-500" />
                      {load.from}
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      {load.to}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{load.cargo} · {load.weight} · {load.vehicle} · {load.distance}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${load.urgencyColor}`}>
                    {load.urgency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-amber-600">{load.payout}</p>
                  <button onClick={() => handleAcceptLoad(load.id)} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-lg transition-all">
                    Accept Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active trip + Earnings */}
        <div className="space-y-4">

          {/* Active Trip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800">Active Trip</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                <MapPin className="h-3 w-3" />
                Joburg → Cape Town
              </div>
              <p className="text-[10px] text-blue-600">Retail Pallets · 8-Ton Truck</p>
              <div>
                <div className="flex justify-between text-[9px] text-blue-500 mb-1">
                  <span>Progress</span><span>65%</span>
                </div>
                <div className="h-1.5 bg-blue-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full w-[65%]" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-blue-600 font-bold flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> ETA 2h 30min</span>
                <span className="font-extrabold text-blue-800">R 5,200</span>
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800">Earnings</h3>
              <button onClick={() => navigate('/driver/earnings')} className="text-[10px] text-amber-500 font-bold">Details</button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-medium">This Week</span>
                <span className="text-sm font-extrabold text-slate-900">R 3,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-medium">This Month</span>
                <span className="text-sm font-extrabold text-slate-900">R 8,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-medium">Wallet Balance</span>
                <span className="text-sm font-extrabold text-emerald-600">R 2,100</span>
              </div>
            </div>
            <button onClick={() => navigate('/driver/earnings')}
              className="w-full py-2 bg-slate-55 hover:bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all">
              Withdraw Earnings
            </button>
          </div>

        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">Recent Trips</h2>
          <button onClick={() => navigate('/driver/trips')} className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {recentTrips.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">{t.from} → {t.to}</p>
                <p className="text-[10px] text-slate-400">{t.cargo} · {t.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-800">{t.earned}</p>
                <p className="text-[10px] text-yellow-500">{'★'.repeat(t.rating)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
