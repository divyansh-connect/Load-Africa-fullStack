import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HardHat, DollarSign, CheckCircle2, Clock,
  Plus, ChevronRight, MapPin, Wrench, AlertCircle,
  Trash2, PlusCircle, User, Settings
} from 'lucide-react';

const stats = [
  { label: 'Total Machines', value: '6', icon: HardHat, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { label: 'Currently Hired', value: '4', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Available', value: '2', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Monthly Revenue', value: 'R 28,600', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const initialEquipment = [
  { id: 'EQ-001', name: 'TLB (Backhoe Loader)', make: 'JCB 3CX', rate: 'R 850/hr', status: 'On Hire', statusColor: 'bg-blue-100 text-blue-700', site: 'Rustenburg Mine Site' },
  { id: 'EQ-002', name: 'Excavator (20T)', make: 'CAT 320', rate: 'R 1,200/hr', status: 'Available', statusColor: 'bg-emerald-100 text-emerald-700', site: '—' },
  { id: 'EQ-003', name: 'Grader (Motor)', make: 'Komatsu GD655', rate: 'R 1,400/hr', status: 'On Hire', statusColor: 'bg-blue-100 text-blue-700', site: 'Joburg Road Works' },
  { id: 'EQ-004', name: 'Compactor (Roller)', make: 'Bomag BW 213', rate: 'R 600/hr', status: 'Maintenance', statusColor: 'bg-amber-100 text-amber-700', site: '—' },
  { id: 'EQ-005', name: 'Crane (50T Mobile)', make: 'Liebherr LTM 1050', rate: 'R 2,800/hr', status: 'On Hire', statusColor: 'bg-blue-100 text-blue-700', site: 'Cape Town Harbour' },
  { id: 'EQ-006', name: 'Bulldozer (D6)', make: 'CAT D6T', rate: 'R 1,100/hr', status: 'Available', statusColor: 'bg-emerald-100 text-emerald-700', site: '—' },
];

const initialRequests = [
  {
    id: 'HR-2024-018',
    client: 'BuildRight Construction',
    machine: 'TLB (Backhoe Loader)',
    site: 'Pretoria, Gauteng',
    startDate: 'Tomorrow',
    duration: '5 days',
    totalValue: 'R 34,000',
  },
  {
    id: 'HR-2024-017',
    client: 'Mega Mining SA',
    machine: 'Excavator (20T)',
    site: 'Rustenburg, NW',
    startDate: '10 Jul',
    duration: '14 days',
    totalValue: 'R 1,34,400',
  },
  {
    id: 'HR-2024-016',
    client: 'City Roads Ltd',
    machine: 'Grader (Motor)',
    site: 'Johannesburg, Gauteng',
    startDate: '8 Jul',
    duration: '3 days',
    totalValue: 'R 29,400',
  },
];

const revenueData = [
  { label: 'TLB', amount: 8500, pct: 30 },
  { label: 'Excavator', amount: 7200, pct: 25 },
  { label: 'Crane', amount: 8400, pct: 29 },
  { label: 'Grader', amount: 4500, pct: 16 },
];

export default function PlantDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [equipment, setEquipment] = useState(initialEquipment);
  const [requests, setRequests] = useState(initialRequests);
  const [newName, setNewName] = useState('');
  const [newMake, setNewMake] = useState('');
  const [newRate, setNewRate] = useState('');

  const handleAddMachine = (e) => {
    e.preventDefault();
    if (!newName || !newRate) return;
    const newEq = {
      id: `EQ-00${equipment.length + 1}`,
      name: newName,
      make: newMake || 'Generic model',
      rate: `R ${newRate}/hr`,
      status: 'Available',
      statusColor: 'bg-emerald-100 text-emerald-700',
      site: '—'
    };
    setEquipment([newEq, ...equipment]);
    setNewName('');
    setNewMake('');
    setNewRate('');
    navigate('/plant-portal/equipment');
  };

  const handleDelete = (id) => {
    setEquipment(equipment.filter(eq => eq.id !== id));
  };

  const handleRequestAction = (id, accept) => {
    if (accept) alert(`Hire Request ${id} Accepted! Logistics will coordinate delivery.`);
    setRequests(requests.filter(r => r.id !== id));
  };

  // 1. My Equipment View
  if (path.endsWith('/equipment')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Heavy Equipment Fleet</h1>
            <p className="text-xs text-slate-500 font-medium">List of listed machinery & operators.</p>
          </div>
          <button onClick={() => navigate('/plant-portal/add-machine')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" /> List Machine
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {equipment.map((eq) => (
              <div key={eq.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center">
                    <HardHat className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{eq.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{eq.make} · <span className="font-extrabold text-slate-700">{eq.rate}</span> {eq.site !== '—' ? ` | Site: ${eq.site}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${eq.statusColor}`}>
                    {eq.status}
                  </span>
                  <button onClick={() => handleDelete(eq.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

  // 2. Hire Requests View
  if (path.endsWith('/requests')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Equipment Hire Requests</h1>
          <p className="text-xs text-slate-500 font-medium">Accept and manage machinery bookings.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white border border-slate-250 rounded-2xl p-12 text-center text-slate-400 text-sm">
            No active hire requests found.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{r.machine} — {r.client}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Location: <span className="font-bold text-slate-600">{r.site}</span> · Duration: {r.duration} · Start: {r.startDate}</p>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-sm font-extrabold text-emerald-600">{r.totalValue}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestAction(r.id, true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-lg uppercase tracking-wider transition-colors shadow-sm">
                        Accept
                      </button>
                      <button onClick={() => handleRequestAction(r.id, false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-lg uppercase tracking-wider transition-colors">
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

  // 3. List Machine Form
  if (path.endsWith('/add-machine')) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">List Heavy Construction Machine</h1>
          <p className="text-xs text-slate-500 font-medium">Add machine specs and rate details to rent out.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6">
          <form onSubmit={handleAddMachine} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Machine Category Name</label>
              <input
                type="text"
                placeholder="e.g. TLB (Backhoe Loader), Excavator, Bulldozer"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Make / Model</label>
              <input
                type="text"
                placeholder="e.g. JCB 3CX, CAT 320"
                value={newMake}
                onChange={e => setNewMake(e.target.value)}
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Hourly Rental Rate (Rand / hr)</label>
              <input
                type="number"
                placeholder="e.g. 850"
                value={newRate}
                onChange={e => setNewRate(e.target.value)}
                required
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs font-bold bg-white transition-colors"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-colors mt-2">
              LIST MACHINE
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Revenue View
  if (path.endsWith('/revenue')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Plant Hire Financial Breakdown</h1>
          <p className="text-xs text-slate-500 font-medium">Detailed statements of your active machinery rental assets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Hourly Rate</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">R 1,150 / hr</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Revenue</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">R 28,600</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Withdrawable</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">R 24,000</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800">Earnings Share By Machinery Type</h2>
          <div className="space-y-3.5">
            {revenueData.map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{r.label}</span>
                  <span>R {r.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Maintenance View
  if (path.endsWith('/maintenance')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Machine Maintenance & Log Book</h1>
          <p className="text-xs text-slate-500 font-medium">Keep track of safety inspections and schedules.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-amber-800">Inspection Overdue</p>
            <p className="text-xs text-amber-600 mt-0.5">Compactor (EQ-004) has exceeded 250 operating hours since the last inspection filter. Safety block is active.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4">Inspection History</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div>
                <p className="text-xs font-extrabold text-slate-800">Excavator CAT 320 Hydraulic Inspection</p>
                <p className="text-[10px] text-slate-400">Passed · 14 Jun 2024</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">Passed</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div>
                <p className="text-xs font-extrabold text-slate-800">TLB JCB 3CX Engine Oil & Filters</p>
                <p className="text-[10px] text-slate-400">Passed · 05 Jun 2024</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">Passed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Profile View
  if (path.endsWith('/profile')) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Yellow Plant Profile</h1>
          <p className="text-xs text-slate-500 font-medium">Manage company listings, terms, and billing contacts.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="h-16 w-16 bg-yellow-100 text-yellow-600 font-black rounded-full flex items-center justify-center text-xl">YP</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Gauteng Plant & Tool Hire</h3>
              <p className="text-xs text-slate-400">Plant Owner Account ID: YP-1140-ZA</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Representative Name</label>
              <input type="text" defaultValue="Gauteng Plant Operations Manager" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Contact Email</label>
              <input type="email" defaultValue="plant@loadafrica.co.za" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Registered Base Address</label>
              <input type="text" defaultValue="Midrand, Gauteng, South Africa" className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50" disabled />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Default Dashboard View
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Yellow Plant Dashboard 🏗️</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your heavy equipment, hire jobs and revenue.</p>
        </div>
        <button
          onClick={() => navigate('/plant-portal/add-machine')}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-3.5 w-3.5" />
          List Machine
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

        {/* My Equipment */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">My Equipment</h2>
            <button onClick={() => navigate('/plant-portal/equipment')} className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {equipment.slice(0, 5).map((eq) => (
                <div key={eq.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                      <HardHat className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">{eq.name}</p>
                      <p className="text-[10px] text-slate-400">{eq.make} · {eq.rate}{eq.site !== '—' ? ` · ${eq.site}` : ''}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${eq.statusColor}`}>
                    {eq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Revenue + Alert */}
        <div className="space-y-4">

          {/* Revenue by machine */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800">Revenue by Machine</h3>
              <button onClick={() => navigate('/plant-portal/revenue')} className="text-[10px] text-amber-500 font-bold">Details</button>
            </div>
            <div className="space-y-2.5">
              {revenueData.map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500 font-medium">{r.label}</span>
                    <span className="font-extrabold text-slate-800">R {r.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-semibold">Total June</span>
              <span className="text-sm font-extrabold text-amber-600">R 28,600</span>
            </div>
          </div>

          {/* Maintenance alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Service Due</p>
              <p className="text-[10px] text-amber-600">Compactor (EQ-004) is overdue for service. Mark unavailable.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Hire Requests */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">New Hire Requests</h2>
          <button onClick={() => navigate('/plant-portal/requests')} className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {requests.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">{r.machine}</p>
                <p className="text-[10px] text-slate-400">{r.client} · {r.site} · {r.startDate} · {r.duration}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-emerald-600">{r.totalValue}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => handleRequestAction(r.id, true)} className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase">Accept</button>
                  <button onClick={() => handleRequestAction(r.id, false)} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
