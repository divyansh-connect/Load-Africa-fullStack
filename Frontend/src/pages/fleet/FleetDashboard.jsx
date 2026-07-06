import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck, DollarSign, CheckCircle2, Clock,
  Plus, ChevronRight, MapPin, ArrowRight,
  TrendingUp, AlertCircle, Trash2, Edit2, ShieldAlert,
  Calendar, User, Key, Mail, Building
} from 'lucide-react';

const stats = [
  { label: 'Total Vehicles', value: '12', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Active / Out', value: '7', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Idle / Available', value: '5', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Monthly Revenue', value: 'R 42,800', icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

const initialVehicles = [
  { reg: 'GP 12 ABC', type: '8-Ton Truck', driver: 'Sipho Zuma', status: 'On Trip', statusColor: 'bg-blue-100 text-blue-700', trip: 'Joburg → Cape Town' },
  { reg: 'NW 34 XYZ', type: 'Bakkie', driver: 'Thabo Nkosi', status: 'Available', statusColor: 'bg-emerald-100 text-emerald-700', trip: '—' },
  { reg: 'NC 55 DEF', type: 'Tipper Truck', driver: 'Lwazi Dlamini', status: 'On Trip', statusColor: 'bg-blue-100 text-blue-700', trip: 'Kimberley → Joburg' },
  { reg: 'GT 78 GHI', type: 'Flatbed Truck', driver: 'Unassigned', status: 'Maintenance', statusColor: 'bg-amber-100 text-amber-700', trip: '—' },
  { reg: 'GP 90 JKL', type: 'Furniture Truck', driver: 'David Mokoena', status: 'Available', statusColor: 'bg-emerald-100 text-emerald-700', trip: '—' },
];

const initialRequests = [
  {
    id: 'REQ-2024-041',
    customer: 'Patrice Motsepe',
    from: 'Johannesburg',
    to: 'Polokwane',
    vehicle: '8-Ton Truck',
    date: 'Today, 14:00',
    payout: 'R 2,800',
  },
  {
    id: 'REQ-2024-040',
    customer: 'African Rainbow Co.',
    from: 'Rustenburg',
    to: 'Pretoria',
    vehicle: 'Flatbed Truck',
    date: 'Tomorrow, 08:00',
    payout: 'R 1,900',
  },
  {
    id: 'REQ-2024-039',
    customer: 'BuildRight Ltd',
    from: 'Joburg',
    to: 'Witbank',
    vehicle: 'Tipper Truck',
    date: 'Tomorrow, 10:00',
    payout: 'R 1,200',
  },
];

const revenueData = [
  { week: 'Week 1', amount: 9800 },
  { week: 'Week 2', amount: 11200 },
  { week: 'Week 3', amount: 8400 },
  { week: 'Week 4', amount: 13400 },
];

export default function FleetDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Local state to simulate real interactivity
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [requests, setRequests] = useState(initialRequests);
  const [newReg, setNewReg] = useState('');
  const [newType, setNewType] = useState('Bakkie');
  const [newDriver, setNewDriver] = useState('');

  // Add Vehicle handler
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newReg) return;
    const newV = {
      reg: newReg.toUpperCase(),
      type: newType,
      driver: newDriver || 'Unassigned',
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      trip: '—'
    };
    setVehicles([newV, ...vehicles]);
    setNewReg('');
    setNewDriver('');
    navigate('/fleet-portal/vehicles');
  };

  // Delete vehicle handler
  const handleDeleteVehicle = (reg) => {
    setVehicles(vehicles.filter(v => v.reg !== reg));
  };

  // Request Accept/Decline
  const handleRequest = (id, accepted) => {
    if (accepted) {
      alert(`Request ${id} accepted! Driver will be scheduled.`);
    }
    setRequests(requests.filter(r => r.id !== id));
  };

  // 1. Vehicles Page View
  if (path.endsWith('/vehicles')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">My Registered Fleet</h1>
            <p className="text-xs text-slate-500 font-medium">Manage and monitor your active transporters.</p>
          </div>
          <button onClick={() => navigate('/fleet-portal/add-vehicle')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Vehicle
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {vehicles.map((v) => (
              <div key={v.reg} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Truck className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{v.reg} — {v.type}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Driver Assigned: <span className="font-bold text-slate-600">{v.driver}</span> {v.trip !== '—' ? ` | Active Trip: ${v.trip}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${v.statusColor}`}>
                    {v.status}
                  </span>
                  <button onClick={() => handleDeleteVehicle(v.reg)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Booking Requests Page View
  if (path.endsWith('/requests')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Incoming Load Requests</h1>
          <p className="text-xs text-slate-500 font-medium">Accept loads matching your fleet's location and capacity.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white border border-slate-250 rounded-2xl p-12 text-center text-slate-400 text-sm">
            No pending load booking requests at the moment. Check back soon!
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      {r.from}
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      {r.to}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{r.customer} · Requested Fleet Type: <span className="font-bold text-slate-600">{r.vehicle}</span> · {r.date}</p>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-sm font-extrabold text-emerald-600">{r.payout}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequest(r.id, true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-lg uppercase tracking-wider transition-colors shadow-sm">
                        Accept
                      </button>
                      <button onClick={() => handleRequest(r.id, false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-lg uppercase tracking-wider transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Add Vehicle Page View
  if (path.endsWith('/add-vehicle')) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">List New Fleet Vehicle</h1>
          <p className="text-xs text-slate-500 font-medium">Add a vehicle with license details to receive booking matches.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6">
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">License Plate Registration Number</label>
              <input
                type="text"
                placeholder="e.g. GP 12 ABC"
                value={newReg}
                onChange={e => setNewReg(e.target.value)}
                required
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Vehicle Type Class</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
              >
                <option>Bakkie</option>
                <option>Furniture Truck</option>
                <option>4-8 Ton Truck</option>
                <option>Tipper Truck</option>
                <option>Flatbed Truck</option>
                <option>Side Tipper</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Assign Driver Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sipho Zuma"
                value={newDriver}
                onChange={e => setNewDriver(e.target.value)}
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors mt-2">
              LIST VEHICLE
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Revenue Page View
  if (path.endsWith('/revenue')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Fleet Financial Reports</h1>
          <p className="text-xs text-slate-500 font-medium">Review your earnings and transactions statements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weekly Average</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">R 10,700</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Total</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">R 42,800</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Withdrawn Earnings</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">R 38,000</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800">Weekly Breakdown</h2>
          <div className="space-y-3">
            {revenueData.map((r) => (
              <div key={r.week} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{r.week}</span>
                  <span>R {r.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(r.amount / 15000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Profile & Settings Page View
  if (path.endsWith('/profile')) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Profile & Platform Settings</h1>
          <p className="text-xs text-slate-500 font-medium">Manage details for your fleet company account.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="h-16 w-16 bg-amber-100 text-amber-600 font-black rounded-full flex items-center justify-center text-xl">FO</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Johannesburg Logistics Ltd</h3>
              <p className="text-xs text-slate-400">Fleet Owner Account ID: FL-9921-ZA</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Owner Full Name</label>
              <input type="text" defaultValue="Johannesburg Logistics Manager" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Contact Email</label>
              <input type="email" defaultValue="fleet@loadafrica.co.za" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Company Address</label>
              <input type="text" defaultValue="Sandton, Johannesburg, South Africa" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Default Dashboard Overview
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Fleet Dashboard 🚛</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your vehicles, bookings and revenue.</p>
        </div>
        <button
          onClick={() => navigate('/fleet-portal/add-vehicle')}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Vehicle
        </button>
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

        {/* My Fleet */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">My Vehicles</h2>
            <button onClick={() => navigate('/fleet-portal/vehicles')} className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {vehicles.slice(0, 5).map((v) => (
                <div key={v.reg} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">{v.reg} — {v.type}</p>
                      <p className="text-[10px] text-slate-400">{v.driver}{v.trip !== '—' ? ` · ${v.trip}` : ''}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${v.statusColor}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Requests + Revenue */}
        <div className="space-y-4">

          {/* Revenue summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800">Revenue (June)</h3>
              <button onClick={() => navigate('/fleet-portal/revenue')} className="text-[10px] text-amber-500 font-bold">Details</button>
            </div>
            <div className="space-y-2">
              {revenueData.map((r) => (
                <div key={r.week}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500 font-medium">{r.week}</span>
                    <span className="font-extrabold text-slate-800">R {r.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(r.amount / 15000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-semibold">Total June</span>
              <span className="text-sm font-extrabold text-amber-600">R 42,800</span>
            </div>
          </div>

          {/* Alert — maintenance */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Maintenance Due</p>
              <p className="text-[10px] text-amber-600">GP 78 GHI (Flatbed) is due for service. Schedule now.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Requests */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">New Booking Requests</h2>
          <button onClick={() => navigate('/fleet-portal/requests')} className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {requests.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">{r.from} → {r.to}</p>
                <p className="text-[10px] text-slate-400">{r.customer} · {r.vehicle} · {r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-emerald-600">{r.payout}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => handleRequest(r.id, true)} className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase">Accept</button>
                  <button onClick={() => handleRequest(r.id, false)} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
