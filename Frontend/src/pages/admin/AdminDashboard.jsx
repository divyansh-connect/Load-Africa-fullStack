import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Truck, Navigation, DollarSign, ShieldAlert, CheckCircle2, 
  ArrowUpRight, Clock, AlertTriangle, Eye, ChevronRight, UserCheck
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [usersCount, setUsersCount] = useState(0);
  const [drivers, setDrivers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState([]);

  const loadData = () => {
    const allUsers = getMockData('users') || [];
    setUsersCount(allUsers.length);

    const allDrivers = getMockData('drivers') || [];
    setDrivers(allDrivers);

    const allLoads = getMockData('loads') || [];
    setLoads(allLoads);

    const allBookings = getMockData('bookings') || [];
    setBookings(allBookings);

    // Calculate revenue
    const revSum = allBookings.reduce((sum, b) => sum + b.price, 0);
    setRevenue(revSum);

    // Filter pending verifications (submitted kycStatus)
    const pending = allDrivers.filter(d => d.kycStatus === 'submitted' || d.kycStatus === 'pending');
    setPendingVerifications(pending);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveDriver = (driverId) => {
    const allDrivers = getMockData('drivers') || [];
    const idx = allDrivers.findIndex(d => d.id === driverId);
    if (idx > -1) {
      allDrivers[idx].kycStatus = 'verified';
      allDrivers[idx].status = 'active';
      saveMockData('drivers', allDrivers);
      
      // Update notifications
      const notifications = getMockData('notifications') || {};
      notifications.driver.unshift({
        id: `nt-d-${Math.random()}`,
        title: 'KYC Verified',
        message: 'Administrator approved your KYC documents successfully.',
        read: false,
        time: 'Just now',
        type: 'success'
      });
      saveMockData('notifications', notifications);

      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operational Statistics Dashboard</h2>
        <p className="text-xs text-slate-400 font-medium">Real-time system overview of customers, cargo corridors, and vetted truck operators.</p>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Shippers</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-800">{usersCount}</span>
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600"><Users className="h-5 w-5" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Transporters</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-800">{drivers.length}</span>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl"><Truck className="h-5 w-5" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Loads</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-800">{loads.filter(l => l.status === 'in_transit' || l.status === 'assigned').length}</span>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl"><Navigation className="h-5 w-5" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Revenue</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-800">R{revenue.toLocaleString()}</span>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl"><DollarSign className="h-5 w-5" /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending KYC</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-extrabold text-rose-600">{pendingVerifications.length}</span>
            <div className="bg-rose-50 text-rose-500 p-2.5 rounded-xl"><ShieldAlert className="h-5 w-5" /></div>
          </div>
        </div>

      </div>

      {/* Main Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Analytics Charts & Recent bookings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart visual mock */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Weekly System Volume</h3>
                <p className="text-xs text-slate-400">Total freight bookings volume represented corridor-wise.</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-150">Last 7 Days</span>
            </div>

            {/* Simulated Vector Graph */}
            <div className="h-44 bg-slate-950 rounded-2xl relative flex items-end justify-between p-4 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-rose-900/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:100%_20px]" />
              
              {/* Graphic line chart mockup */}
              <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path 
                  d="M 0 80 Q 80 60 160 40 T 320 20 T 400 30" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="3" 
                  className="drop-shadow-[0_2px_4px_rgba(244,63,94,0.3)]"
                />
                {/* Area fill */}
                <path 
                  d="M 0 80 Q 80 60 160 40 T 320 20 T 400 30 L 400 100 L 0 100 Z" 
                  fill="url(#grad)" 
                  opacity="0.1"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Day metrics labels */}
              <div className="w-full flex justify-between text-[10px] text-slate-500 font-semibold relative z-10">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Bookings table overview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Transporter Assignments</h3>
                <p className="text-xs text-slate-400">Escrow verification details on recent dispatch actions.</p>
              </div>
              <button 
                onClick={() => navigate('/admin/bookings')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                Manage Bookings
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="pb-3 font-semibold">Booking ID</th>
                    <th className="pb-3 font-semibold">Cargo Load</th>
                    <th className="pb-3 font-semibold">Allocated Driver</th>
                    <th className="pb-3 font-semibold">Price Payout</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                  {bookings.slice(0, 4).map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-mono text-slate-800">{bk.id}</td>
                      <td className="py-4 truncate max-w-xs">{loads.find(l => l.id === bk.loadId)?.title || 'Cement Cargo'}</td>
                      <td className="py-4 font-bold text-slate-800">{drivers.find(d => d.id === bk.driverId)?.name || 'Sipho Zuma'}</td>
                      <td className="py-4 text-slate-800">R{bk.price}</td>
                      <td className="py-4">
                        {bk.bookingStatus === 'completed' && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">Delivered</span>}
                        {bk.bookingStatus === 'in_transit' && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[10px] animate-pulse">In Transit</span>}
                        {bk.bookingStatus === 'assigned' && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 text-[10px]">Assigned</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Col: KYC approval action widgets */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending KYC Actions</h3>
              <p className="text-xs text-slate-400 font-light">Vetting required for new transporter registrations.</p>
            </div>

            <div className="space-y-4">
              {pendingVerifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-2xl">
                  No drivers currently pending vetting actions.
                </div>
              ) : (
                pendingVerifications.map((drv) => (
                  <div key={drv.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <img src={drv.avatar} alt={drv.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{drv.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{drv.id}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-1 font-mono">
                      <p>CDL LICENSE: CDL-9028-KM</p>
                      <p>REGISTRY DATE: {drv.joinedDate}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-150">
                      <button 
                        onClick={() => handleApproveDriver(drv.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Approve KYC
                      </button>
                      <button 
                        onClick={() => navigate('/admin/users')}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all border border-slate-200"
                        title="Audit Documents Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-2.5 text-xs text-left">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-slate-500 font-light leading-relaxed">
                Ensure license files are cross-audited against national registries prior to dispatch approvals.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
