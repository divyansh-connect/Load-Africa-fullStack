import React, { useState, useEffect } from 'react';
import { 
  Navigation, Package, Calendar, MapPin, Search, Filter, 
  ChevronRight, Compass, CheckCircle2, UserCheck, X 
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';

export default function ManageBookings() {
  const [activeTab, setActiveTab] = useState('loads');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loads, setLoads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Assignment states
  const [assigningLoad, setAssigningLoad] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const loadData = () => {
    setLoads(getMockData('loads') || []);
    setBookings(getMockData('bookings') || []);
    
    // Only fetch drivers that are verified and active
    const activeDrivers = getMockData('drivers') || [];
    setDrivers(activeDrivers.filter(d => d.status === 'active' && d.kycStatus === 'verified'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedDriver || !assigningLoad) return;

    const allLoads = getMockData('loads') || [];
    const idx = allLoads.findIndex(l => l.id === assigningLoad.id);
    const drv = drivers.find(d => d.id === selectedDriver);

    if (idx > -1 && drv) {
      allLoads[idx].status = 'assigned';
      allLoads[idx].driverId = selectedDriver;
      saveMockData('loads', allLoads);

      const allBookings = getMockData('bookings') || [];
      const newBooking = {
        id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
        loadId: assigningLoad.id,
        customerId: assigningLoad.customerId,
        driverId: selectedDriver,
        vehicleId: drv.vehicleId || 'vh-1',
        price: assigningLoad.budget,
        paymentStatus: 'paid',
        bookingStatus: 'assigned',
        date: new Date().toISOString().split('T')[0],
        tracking: {
          currentLat: -26.2041,
          currentLng: 28.0473,
          status: 'Driver Assigned by Administrator',
          lastUpdate: 'Just now'
        }
      };
      allBookings.unshift(newBooking);
      saveMockData('bookings', allBookings);

      // Create notifications
      const notifications = getMockData('notifications') || {};
      notifications.customer.unshift({
        id: `nt-c-${Math.random()}`,
        title: 'Driver Assigned',
        message: `Admin assigned driver ${drv.name} to transport "${assigningLoad.title}".`,
        read: false,
        time: 'Just now',
        type: 'success'
      });
      notifications.driver.unshift({
        id: `nt-d-${Math.random()}`,
        title: 'New Trip Allocated',
        message: `Admin allocated load "${assigningLoad.title}" to you. Budget: R${assigningLoad.budget}.`,
        read: false,
        time: 'Just now',
        type: 'info'
      });
      saveMockData('notifications', notifications);

      setAssigningLoad(null);
      setSelectedDriver('');
      loadData();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-150 uppercase text-[9px]">Awaiting Dispatch</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-150 uppercase text-[9px]">Assigned</span>;
      case 'in_transit':
        return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-150 uppercase text-[9px] animate-pulse">In Transit</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-150 uppercase text-[9px]">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cargo Loads & Bookings Logs</h2>
        <p className="text-xs text-slate-400">Monitor active transportation corridors, allocate vetted transporters, and track delivery escrow releases.</p>
      </div>

      {/* Filter tabs navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => { setActiveTab('loads'); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'loads' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            Cargo Listings ({loads.length})
          </button>
          <button 
            onClick={() => { setActiveTab('bookings'); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Navigation className="h-4 w-4" />
            Active Bookings ({bookings.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'loads' ? 'Cargo Description...' : 'Booking ID...'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs transition-all"
          />
        </div>
      </div>

      {/* List views */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        
        {activeTab === 'loads' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase bg-slate-50/50">
                  <th className="py-4 px-6">Cargo Detail</th>
                  <th className="py-4 px-6">Shipper Name</th>
                  <th className="py-4 px-6">Weight / Payout Budget</th>
                  <th className="py-4 px-6">Listing Status</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                {loads.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase())).map((load) => (
                  <tr key={load.id} className="hover:bg-slate-50/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-xl text-slate-500 shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{load.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{load.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-850">{load.customerName}</td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-bold">R{load.budget}</p>
                      <span className="text-slate-400">{load.weight}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(load.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {load.status === 'available' ? (
                        <button 
                          onClick={() => setAssigningLoad(load)}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all font-bold flex items-center gap-1.5 ml-auto"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Assign Transporter
                        </button>
                      ) : (
                        <span className="text-slate-400">Assigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase bg-slate-50/50">
                  <th className="py-4 px-6">Booking Details</th>
                  <th className="py-4 px-6">Allocated Driver</th>
                  <th className="py-4 px-6">Committed Price</th>
                  <th className="py-4 px-6">Trip Progress Status</th>
                  <th className="py-4 px-6">GPS Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                {bookings.filter(b => b.id.toLowerCase().includes(searchTerm.toLowerCase())).map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/30">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">{bk.id}</td>
                    <td className="py-4 px-6 text-slate-850 font-bold">{drivers.find(d => d.id === bk.driverId)?.name || 'Sipho Zuma'}</td>
                    <td className="py-4 px-6 text-slate-800 font-bold">R{bk.price}</td>
                    <td className="py-4 px-6">
                      {getStatusBadge(bk.bookingStatus)}
                    </td>
                    <td className="py-4 px-6">
                      {bk.bookingStatus === 'in_transit' ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                          -26.2041° S, 28.0473° E
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Stationary</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Manual Driver assignment modal */}
      {assigningLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setAssigningLoad(null)} />
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-scaleIn">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Assign Transporter Driver</span>
              <button onClick={() => setAssigningLoad(null)} className="text-slate-400 hover:text-white font-bold text-sm">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-5 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CARGO DISPATCH LOAD</span>
                <p className="font-bold text-slate-800 text-sm">{assigningLoad.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-light">From: {assigningLoad.pickup}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Active Vetted Transporter</label>
                <select 
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-rose-500 text-sm transition-all"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(drv => (
                    <option key={drv.id} value={drv.id}>{drv.name} (★ {drv.rating} - Volvo FH16)</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Confirm Allocation & Notify Driver
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
