import React, { useState, useEffect } from 'react';
import { 
  Percent, Search, Filter, Package, MapPin, 
  ChevronRight, Calendar, UserCheck, X, CheckCircle2 
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';
import { Button, Input, Select, Badge, Table, Modal } from '../../components/ui';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Allocation states
  const [allocatingLead, setAllocatingLead] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = () => {
    const allLoads = getMockData('loads') || [];
    setLeads(allLoads.filter(l => l.status === 'available'));

    const allDrivers = getMockData('drivers') || [];
    setDrivers(allDrivers.filter(d => d.status === 'active' && d.kycStatus === 'verified'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!selectedDriver || !allocatingLead) return;

    setSubmitting(true);
    setTimeout(() => {
      const allLoads = getMockData('loads') || [];
      const idx = allLoads.findIndex(l => l.id === allocatingLead.id);
      const drv = drivers.find(d => d.id === selectedDriver);

      if (idx > -1 && drv) {
        allLoads[idx].status = 'assigned';
        allLoads[idx].driverId = selectedDriver;
        allLoads[idx].brokerId = 'brk-1'; // Lwazi Dlamini broker ID
        saveMockData('loads', allLoads);

        // Generate Booking
        const allBookings = getMockData('bookings') || [];
        const newBooking = {
          id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
          loadId: allocatingLead.id,
          customerId: allocatingLead.customerId,
          driverId: selectedDriver,
          vehicleId: drv.vehicleId || 'vh-1',
          price: allocatingLead.budget,
          paymentStatus: 'paid',
          bookingStatus: 'assigned',
          date: new Date().toISOString().split('T')[0],
          tracking: {
            currentLat: -26.2041,
            currentLng: 28.0473,
            status: 'Driver Assigned by Broker Associate',
            lastUpdate: 'Just now'
          }
        };
        allBookings.unshift(newBooking);
        saveMockData('bookings', allBookings);

        // Create notification alerts
        const notifications = getMockData('notifications') || {};
        notifications.customer.unshift({
          id: `nt-c-${Math.random()}`,
          title: 'Transporter Allocated',
          message: `Broker Lwazi Dlamini assigned driver ${drv.name} to transport your cargo "${allocatingLead.title}".`,
          read: false,
          time: 'Just now',
          type: 'success'
        });
        notifications.driver.unshift({
          id: `nt-d-${Math.random()}`,
          title: 'New Trip Allocated',
          message: `Broker Lwazi Dlamini allocated load "${allocatingLead.title}" to you. Budget: R${allocatingLead.budget}.`,
          read: false,
          time: 'Just now',
          type: 'info'
        });
        notifications.broker.unshift({
          id: `nt-b-${Math.random()}`,
          title: 'Load Allocated Successfully',
          message: `You allocated driver ${drv.name} to load "${allocatingLead.title}". Commission lock active.`,
          read: false,
          time: 'Just now',
          type: 'success'
        });
        saveMockData('notifications', notifications);

        setSubmitting(false);
        setSuccess(true);
        setSelectedDriver('');
        
        setTimeout(() => {
          setSuccess(false);
          setAllocatingLead(null);
          loadData();
        }, 1500);
      }
    }, 1200);
  };

  const filteredLeads = leads.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Cargo Leads</h2>
        <p className="text-xs text-slate-400">Available cargo posted by verified shippers. Allocate driver transporters to secure commissions.</p>
      </div>

      {/* Search Filter Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search leads by Cargo details, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-xs transition-all"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No available leads matching search.</div>
        ) : (
          <Table headers={['Cargo Lead Info', 'Pickup / Delivery Route', 'Weight & Payload', 'Total Payout', '']}>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/30">
                <td className="py-4.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{lead.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{lead.id} ({lead.category})</span>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-6 max-w-xs">
                  <div className="space-y-1 text-slate-650 font-semibold">
                    <p className="truncate">From: {lead.pickup}</p>
                    <p className="truncate">To: {lead.dropoff}</p>
                  </div>
                </td>
                <td className="py-4.5 px-6">
                  <p className="font-bold text-slate-800">{lead.weight}</p>
                  <span className="text-slate-400">Flatbed cargo req</span>
                </td>
                <td className="py-4.5 px-6">
                  <p className="font-bold text-slate-800">R{lead.budget}</p>
                  <span className="text-emerald-600 font-bold">Est Comm: R{Math.round(lead.budget * 0.05)}</span>
                </td>
                <td className="py-4.5 px-6 text-right">
                  <button 
                    onClick={() => setAllocatingLead(lead)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                  >
                    <UserCheck className="h-4 w-4" />
                    Allocate Transporter
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Allocation modal */}
      {allocatingLead && (
        <Modal 
          open={!!allocatingLead} 
          onClose={() => setAllocatingLead(null)} 
          title="Allocate Transporter Driver"
        >
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Transporter Allocated!</h4>
              <p className="text-xs text-slate-400">Commissions details locks are now active.</p>
            </div>
          ) : (
            <form onSubmit={handleAllocate} className="space-y-5 text-left text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CARGO DISPATCH LEAD</span>
                <p className="font-bold text-slate-850 text-sm">{allocatingLead.title}</p>
                <p className="text-slate-500 font-light leading-relaxed mt-1">Pickup: {allocatingLead.pickup}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Verified Driver Partner</label>
                <select 
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(drv => (
                    <option key={drv.id} value={drv.id}>{drv.name} (★ {drv.rating} - Volvo FH16)</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={() => setAllocatingLead(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Confirm Allocation</>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
}
