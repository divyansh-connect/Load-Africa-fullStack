import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, MapPin, Package, Download, 
  ExternalLink, ChevronRight, Eye, CheckCircle2, RotateCcw, FileText,
  User, Truck, X, Clock, MoreVertical, CreditCard, Crosshair, Ban, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { Badge } from '../../components/ui';

export default function BookingHistory() {
  const navigate = useNavigate();
  
  // State
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    vehicleType: ''
  });
  
  // Drawer state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [filters.status, filters.vehicleType]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      
      const res = await bookingService.getCustomerBookingsHistory(params);
      if (res.success) {
        setLoads(res.data);
      }
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const openDrawer = async (id) => {
    setSelectedBookingId(id);
    setDrawerLoading(true);
    setDrawerData(null);
    setTimeline([]);
    try {
      const res = await bookingService.getBookingDetails(id);
      if (res.success) {
        setDrawerData(res.data);
      }
      const tlRes = await bookingService.getBookingTimeline(id);
      if (tlRes.success) {
        setTimeline(tlRes.data);
      }
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedBookingId(null);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus, 'Status updated via action menu');
      // Refresh
      fetchBookings();
      if (selectedBookingId === id) {
        openDrawer(id); // reload drawer
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const SmartActions = ({ booking }) => {
    const s = booking.status;
    const actions = [];
    
    // Define actions based on exact Enum Statuses
    if (s === 'QUOTE_REQUESTED' || s === 'DRAFT') {
      actions.push({ label: 'Edit Booking', icon: FileText, onClick: () => alert('Edit feature coming soon') });
      actions.push({ label: 'Cancel Request', icon: Ban, danger: true, onClick: () => updateStatus(booking.id, 'CANCELLED') });
    }
    else if (s === 'QUOTE_PREPARED') {
      actions.push({ label: 'View Quotation', icon: Eye, onClick: () => openDrawer(booking.id) });
      actions.push({ label: 'Accept Quote', icon: CheckCircle2, primary: true, onClick: () => updateStatus(booking.id, 'CUSTOMER_ACCEPTED') });
      actions.push({ label: 'Reject Quote', icon: X, danger: true, onClick: () => updateStatus(booking.id, 'REJECTED') });
    }
    else if (s === 'CUSTOMER_ACCEPTED') {
      actions.push({ label: 'Proceed to Payment', icon: CreditCard, primary: true, onClick: () => navigate(`/customer/payment/${booking.id}`) });
    }
    else if (s === 'BOOKING_CONFIRMED') {
      actions.push({ label: 'View Booking', icon: Eye, onClick: () => openDrawer(booking.id) });
      actions.push({ label: 'Download Confirmation', icon: Download, onClick: () => alert('Downloading...') });
    }
    else if (s === 'DRIVER_SEARCHING') {
      actions.push({ label: 'View Status', icon: Eye, onClick: () => openDrawer(booking.id) });
    }
    else if (['DRIVER_ASSIGNED', 'PICKUP_SCHEDULED'].includes(s)) {
      actions.push({ label: 'View Driver', icon: User, onClick: () => openDrawer(booking.id) });
      actions.push({ label: 'Live Tracking', icon: MapPin, onClick: () => navigate(`/customer/tracking?id=${booking.id}`) });
    }
    else if (['PICKUP_ARRIVED', 'PICKED_UP', 'IN_TRANSIT'].includes(s)) {
      actions.push({ label: 'Track Shipment', icon: MapPin, primary: true, onClick: () => navigate(`/customer/tracking?id=${booking.id}`) });
      actions.push({ label: 'View Timeline', icon: Clock, onClick: () => openDrawer(booking.id) });
    }
    else if (s === 'DELIVERED') {
      actions.push({ label: 'Download POD', icon: Download, primary: true, onClick: () => alert('Downloading POD...') });
      actions.push({ label: 'Delivery Details', icon: FileText, onClick: () => openDrawer(booking.id) });
    }
    else if (s === 'PAYMENT_PENDING') {
      actions.push({ label: 'Pay Balance', icon: CreditCard, primary: true, onClick: () => navigate(`/customer/payment/${booking.id}`) });
    }
    else if (['PAYMENT_RECEIVED', 'COMPLETED', 'CLOSED'].includes(s)) {
      actions.push({ label: 'Download Invoice', icon: Download, onClick: () => alert('Downloading Invoice...') });
      actions.push({ label: 'Rebook Same Route', icon: RotateCcw, onClick: () => navigate('/customer/create-booking') });
      actions.push({ label: 'View Full Timeline', icon: Clock, onClick: () => openDrawer(booking.id) });
    }
    else if (s === 'CANCELLED' || s === 'REJECTED' || s === 'FAILED' || s === 'EXPIRED') {
      actions.push({ label: 'View Reason', icon: Eye, onClick: () => openDrawer(booking.id) });
      actions.push({ label: 'Rebook', icon: RotateCcw, onClick: () => navigate('/customer/create-booking') });
    }

    if (actions.length === 0) {
      actions.push({ label: 'View Details', icon: Eye, onClick: () => openDrawer(booking.id) });
    }

    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {actions.slice(0, 2).map((a, idx) => {
          const Icon = a.icon;
          let btnClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ";
          if (a.primary) btnClass += "bg-[#f4a236] text-white hover:bg-amber-500 shadow-sm shadow-amber-500/20";
          else if (a.danger) btnClass += "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200";
          else btnClass += "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm";
          
          return (
            <button key={idx} onClick={a.onClick} className={btnClass}>
              <Icon className="h-3.5 w-3.5" />
              {a.label}
            </button>
          );
        })}
        {actions.length > 2 && (
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const getStatusBadgeColor = (status) => {
    if (['COMPLETED', 'DELIVERED', 'PAYMENT_RECEIVED', 'POD_VERIFIED', 'CUSTOMER_ACCEPTED'].includes(status)) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (['CANCELLED', 'REJECTED', 'FAILED', 'EXPIRED'].includes(status)) return 'bg-red-100 text-red-800 border-red-200';
    if (['IN_TRANSIT', 'PICKED_UP', 'PICKUP_ARRIVED', 'DRIVER_ASSIGNED'].includes(status)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['PAYMENT_PENDING', 'QUOTE_PREPARED'].includes(status)) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Lifecycle Center</h2>
          <p className="text-xs text-slate-400">Manage all enterprise bookings, track statuses, and perform actions.</p>
        </div>
        <button 
          onClick={() => navigate('/customer/create-booking')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f4a236] hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-amber-500/20 uppercase tracking-wider"
        >
          Create Booking
        </button>
      </div>

      {/* Search and Filter Row */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Cargo Name..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-700 focus:outline-none focus:border-[#f4a236] text-xs transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-600 focus:outline-none text-xs transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="QUOTE_REQUESTED">Quote Requested</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs">
            Filter
          </button>
        </div>
      </form>

      {/* Table view */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading bookings...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : loads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No shipments found matching the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-3 px-4">Booking ID / Cargo</th>
                  <th className="py-3 px-4">Route Details</th>
                  <th className="py-3 px-4">Logistics Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loads.map((load) => (
                  <tr key={load.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-3 px-4 cursor-pointer" onClick={() => openDrawer(load.id)}>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500 shrink-0 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{load.cargo_name}</p>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">{load.id.split('-')[0]}-{load.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs cursor-pointer" onClick={() => openDrawer(load.id)}>
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-700 truncate font-semibold"><span className="text-emerald-600">●</span> {load.pickup_address}</p>
                        <p className="text-slate-700 truncate font-semibold"><span className="text-red-500">●</span> {load.delivery_address}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-bold text-slate-800">{load.weight} kg • {load.requested_vehicle || 'Any Vehicle'}</p>
                      <p className="text-slate-500 font-medium mt-0.5">{load.quotes?.length > 0 ? `Quote: R${load.quotes[0].grand_total}` : 'Unquoted'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusBadgeColor(load.status)}`}>
                        {load.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <SmartActions booking={load} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedBookingId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeDrawer} />
          
          <div className="w-full max-w-2xl bg-white h-full relative z-10 shadow-2xl animate-slideInRight flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Booking Details</h3>
                <p className="text-[10px] font-mono text-slate-500">{selectedBookingId}</p>
              </div>
              <div className="flex items-center gap-3">
                {drawerData && (
                   <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusBadgeColor(drawerData.status)}`}>
                     {drawerData.status.replace(/_/g, ' ')}
                   </span>
                )}
                <button onClick={closeDrawer} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {drawerLoading ? (
                <div className="text-center py-20 text-slate-500 font-medium">Loading full details...</div>
              ) : !drawerData ? (
                <div className="text-center py-20 text-red-500 font-medium">Failed to load booking.</div>
              ) : (
                <>
                  {/* Cargo Info */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Cargo Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Cargo Name</p>
                        <p className="font-bold text-slate-900">{drawerData.cargo_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Category</p>
                        <p className="font-bold text-slate-900">{drawerData.cargo_category}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Weight</p>
                        <p className="font-bold text-slate-900">{drawerData.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Vehicle Requested</p>
                        <p className="font-bold text-slate-900">{drawerData.requested_vehicle || 'None'}</p>
                      </div>
                    </div>
                  </section>

                  {/* Route Info */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Route Details</h4>
                    <div className="space-y-4 text-sm relative">
                       <div className="absolute left-2.5 top-6 bottom-4 w-0.5 bg-slate-200 -z-10" />
                       
                       <div className="flex items-start gap-4">
                         <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                           <div className="h-2 w-2 rounded-full bg-emerald-500" />
                         </div>
                         <div>
                           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pickup</p>
                           <p className="font-semibold text-slate-800">{drawerData.pickup_address}</p>
                           <p className="text-xs text-slate-500 mt-0.5">Date: {new Date(drawerData.pickup_date).toLocaleDateString()}</p>
                         </div>
                       </div>
                       
                       <div className="flex items-start gap-4">
                         <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                           <div className="h-2 w-2 rounded-full bg-red-500" />
                         </div>
                         <div>
                           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Delivery</p>
                           <p className="font-semibold text-slate-800">{drawerData.delivery_address}</p>
                           <p className="text-xs text-slate-500 mt-0.5">Date: {new Date(drawerData.delivery_date).toLocaleDateString()}</p>
                         </div>
                       </div>
                    </div>
                  </section>

                  {/* Quote Breakdown */}
                  {drawerData.quotes && drawerData.quotes.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Active Quotation</h4>
                      <div className="bg-slate-50 rounded-xl p-4 text-sm border border-slate-200">
                        <div className="space-y-2 mb-3">
                           <div className="flex justify-between">
                             <span className="text-slate-500">Distance Cost</span>
                             <span className="font-semibold text-slate-800">R {drawerData.quotes[0].distance_cost}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-slate-500">Platform Fee</span>
                             <span className="font-semibold text-slate-800">R {drawerData.quotes[0].platform_fee}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-slate-500">Taxes</span>
                             <span className="font-semibold text-slate-800">R {drawerData.quotes[0].tax}</span>
                           </div>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                          <span className="font-bold text-slate-900 uppercase">Grand Total</span>
                          <span className="text-lg font-black text-amber-600">R {drawerData.quotes[0].grand_total}</span>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Timeline */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Lifecycle Timeline</h4>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                      
                      <div className="relative flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full border-4 border-white bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="pt-1 w-full border border-slate-100 rounded-xl p-3 bg-slate-50">
                          <h5 className="font-bold text-slate-800 text-sm">Booking Created</h5>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(drawerData.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {timeline.map((event, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full border-4 border-white bg-[#f4a236] text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                            <Crosshair className="h-4 w-4" />
                          </div>
                          <div className="pt-1 w-full border border-slate-100 rounded-xl p-3 bg-white shadow-sm">
                            <h5 className="font-bold text-slate-800 text-sm">{event.status.replace(/_/g, ' ')}</h5>
                            <p className="text-xs text-slate-600 my-1">{event.remarks || 'Status changed'}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}

                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
