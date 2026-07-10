import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, MapPin, Package, Download, 
  Eye, CheckCircle2, RotateCcw, FileText,
  User, Truck, X, Clock, CreditCard, Ban, ArrowRight, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';

export default function BookingHistory() {
  const navigate = useNavigate();
  
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  
  // Drawer state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [filters.status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      
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
      if (res.success) setDrawerData(res.data);
      const tlRes = await bookingService.getBookingTimeline(id);
      if (tlRes.success) setTimeline(tlRes.data);
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => setSelectedBookingId(null);

  const updateStatus = async (id, newStatus) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus, 'Status updated via action menu');
      fetchBookings();
      if (selectedBookingId === id) openDrawer(id);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusStyle = (status) => {
    if (['COMPLETED', 'DELIVERED', 'PAYMENT_RECEIVED', 'POD_VERIFIED', 'CLOSED'].includes(status))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (['CANCELLED', 'REJECTED', 'FAILED', 'EXPIRED'].includes(status))
      return 'bg-red-50 text-red-700 border-red-200';
    if (['IN_TRANSIT', 'PICKED_UP', 'PICKUP_ARRIVED', 'DRIVER_EN_ROUTE'].includes(status))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    if (['DRIVER_ASSIGNED', 'DRIVER_SEARCHING', 'DRIVER_APPLIED'].includes(status))
      return 'bg-violet-50 text-violet-700 border-violet-200';
    if (['PAYMENT_PENDING', 'QUOTE_PREPARED', 'CUSTOMER_ACCEPTED'].includes(status))
      return 'bg-amber-50 text-amber-700 border-amber-200';
    if (['BOOKING_CONFIRMED'].includes(status))
      return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    if (['COMPLETED', 'DELIVERED', 'PAYMENT_RECEIVED', 'POD_VERIFIED', 'CLOSED'].includes(status))
      return <CheckCircle2 className="h-3 w-3" />;
    if (['IN_TRANSIT', 'PICKED_UP', 'PICKUP_ARRIVED', 'DRIVER_EN_ROUTE'].includes(status))
      return <Truck className="h-3 w-3" />;
    if (['DRIVER_ASSIGNED', 'DRIVER_SEARCHING'].includes(status))
      return <User className="h-3 w-3" />;
    if (['CANCELLED', 'REJECTED', 'FAILED', 'EXPIRED'].includes(status))
      return <X className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  // Smart action buttons per status
  const getActions = (booking) => {
    const s = booking.status;
    
    if (s === 'QUOTE_REQUESTED' || s === 'DRAFT') {
      return [
        { label: 'Edit Booking', icon: FileText, onClick: () => alert('Edit feature coming soon') },
        { label: 'Cancel', icon: Ban, danger: true, onClick: () => updateStatus(booking.id, 'CANCELLED') }
      ];
    }
    if (s === 'QUOTE_PREPARED') {
      return [
        { label: 'View Quote', icon: Eye, onClick: () => openDrawer(booking.id) },
        { label: 'Accept', icon: CheckCircle2, primary: true, onClick: () => updateStatus(booking.id, 'CUSTOMER_ACCEPTED') }
      ];
    }
    if (s === 'CUSTOMER_ACCEPTED') {
      return [{ label: 'Pay Now', icon: CreditCard, primary: true, onClick: () => navigate(`/customer/payment/${booking.id}`) }];
    }
    if (s === 'BOOKING_CONFIRMED') {
      return [
        { label: 'View Details', icon: Eye, onClick: () => openDrawer(booking.id) },
        { label: 'Download', icon: Download, onClick: () => alert('Downloading...') }
      ];
    }
    if (s === 'DRIVER_SEARCHING' || s === 'DRIVER_APPLIED') {
      return [{ label: 'View Status', icon: Eye, onClick: () => openDrawer(booking.id) }];
    }
    if (s === 'DRIVER_ASSIGNED') {
      return [{ label: 'View Driver', icon: User, onClick: () => openDrawer(booking.id) }];
    }
    if (['PICKUP_ARRIVED', 'PICKED_UP', 'IN_TRANSIT', 'DRIVER_EN_ROUTE'].includes(s)) {
      return [{ label: 'Track Shipment', icon: MapPin, primary: true, onClick: () => navigate(`/customer/tracking?id=${booking.id}`) }];
    }
    if (s === 'DELIVERED' || s === 'POD_UPLOADED') {
      return [{ label: 'View Delivery', icon: Eye, onClick: () => openDrawer(booking.id) }];
    }
    if (s === 'PAYMENT_PENDING') {
      return [{ label: 'Pay Balance', icon: CreditCard, primary: true, onClick: () => navigate(`/customer/payment/${booking.id}`) }];
    }
    if (['PAYMENT_RECEIVED', 'COMPLETED', 'CLOSED'].includes(s)) {
      return [
        { label: 'View Details', icon: Eye, onClick: () => openDrawer(booking.id) },
        { label: 'Rebook', icon: RotateCcw, onClick: () => navigate('/customer/create-booking') }
      ];
    }
    if (['CANCELLED', 'REJECTED', 'FAILED', 'EXPIRED'].includes(s)) {
      return [
        { label: 'View Reason', icon: Eye, onClick: () => openDrawer(booking.id) },
        { label: 'Rebook', icon: RotateCcw, onClick: () => navigate('/customer/create-booking') }
      ];
    }
    return [{ label: 'View Details', icon: Eye, onClick: () => openDrawer(booking.id) }];
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking History</h2>
          <p className="text-xs text-slate-400 mt-0.5">View all your past and current bookings with full details.</p>
        </div>
        <button 
          onClick={() => navigate('/customer/create-booking')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f4a236] hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-amber-500/20 uppercase tracking-wider"
        >
          + New Booking
        </button>
      </div>

      {/* Search and Filter */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by cargo name, booking ID..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-700 focus:outline-none focus:border-[#f4a236] text-xs transition-all"
          />
        </div>
        <select 
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-600 focus:outline-none text-xs transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="QUOTE_REQUESTED">Quote Requested</option>
          <option value="QUOTE_PREPARED">Quote Ready</option>
          <option value="BOOKING_CONFIRMED">Confirmed</option>
          <option value="DRIVER_ASSIGNED">Driver Assigned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
      </form>

      {/* Booking Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-500 font-medium bg-white rounded-2xl border border-red-100">{error}</div>
      ) : loads.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">No bookings found matching your filters.</p>
          <button onClick={() => navigate('/customer/create-booking')} className="mt-4 px-5 py-2 bg-[#f4a236] text-white text-xs font-bold rounded-lg">Create First Booking</button>
        </div>
      ) : (
        <div className="space-y-4">
          {loads.map((load) => {
            const actions = getActions(load);
            return (
              <div key={load.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
                
                {/* Card Top */}
                <div className="p-5 cursor-pointer" onClick={() => openDrawer(load.id)}>
                  {/* Top Row: Status + Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getStatusStyle(load.status)}`}>
                        {getStatusIcon(load.status)}
                        {load.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        #{load.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Calendar className="h-3 w-3" />
                      {formatDate(load.created_at)}
                    </div>
                  </div>

                  {/* Route Section */}
                  <div className="flex items-stretch gap-4 mb-4">
                    {/* Route Visual */}
                    <div className="flex flex-col items-center py-1">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-emerald-200 shrink-0" />
                      <div className="flex-1 w-0.5 bg-gradient-to-b from-emerald-300 to-red-300 my-1" />
                      <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-red-200 shrink-0" />
                    </div>
                    
                    {/* Route Text */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pickup</p>
                        <p className="text-sm font-bold text-slate-800 leading-snug">{load.pickup_address || '—'}</p>
                        {load.pickup_date && <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(load.pickup_date)}</p>}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Delivery</p>
                        <p className="text-sm font-bold text-slate-800 leading-snug">{load.delivery_address || '—'}</p>
                        {load.delivery_date && <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(load.delivery_date)}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Cargo Summary Bar */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">{load.cargo_name}</span>
                    </div>
                    <div className="h-3 w-px bg-slate-200" />
                    <span className="text-xs text-slate-500 font-semibold">{load.weight} kg</span>
                    <div className="h-3 w-px bg-slate-200" />
                    <div className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-semibold">{load.requested_vehicle || 'Any Vehicle'}</span>
                    </div>
                    {load.quotes?.length > 0 && (
                      <>
                        <div className="h-3 w-px bg-slate-200" />
                        <span className="text-xs font-black text-amber-600">R {parseFloat(load.quotes[0].grand_total).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button 
                    onClick={() => openDrawer(load.id)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Full Details
                  </button>
                  <div className="flex items-center gap-2">
                    {actions.map((a, idx) => {
                      const Icon = a.icon;
                      let cls = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ";
                      if (a.primary) cls += "bg-[#f4a236] text-white hover:bg-amber-500 shadow-sm";
                      else if (a.danger) cls += "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200";
                      else cls += "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm";
                      return (
                        <button key={idx} onClick={a.onClick} className={cls}>
                          <Icon className="h-3.5 w-3.5" />
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedBookingId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeDrawer} />
          
          <div className="w-full max-w-2xl bg-white h-full relative z-10 shadow-2xl animate-slideInRight flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Booking Details</h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{selectedBookingId}</p>
              </div>
              <div className="flex items-center gap-3">
                {drawerData && (
                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getStatusStyle(drawerData.status)}`}>
                     {getStatusIcon(drawerData.status)}
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
                <div className="text-center py-20 text-slate-500 font-medium">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading details...
                </div>
              ) : !drawerData ? (
                <div className="text-center py-20 text-red-500 font-medium">Failed to load booking.</div>
              ) : (
                <>
                  {/* Booking Date */}
                  <section className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>Booked on <strong className="text-slate-800">{formatDate(drawerData.created_at)}</strong> at {formatTime(drawerData.created_at)}</span>
                  </section>

                  {/* Route Info */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Route Details</h4>
                    <div className="space-y-4 text-sm relative">
                       <div className="absolute left-2.5 top-6 bottom-4 w-0.5 bg-slate-200 -z-10" />
                       
                       <div className="flex items-start gap-4">
                         <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                           <div className="h-2 w-2 rounded-full bg-emerald-500" />
                         </div>
                         <div>
                           <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pickup Location</p>
                           <p className="font-semibold text-slate-800">{drawerData.pickup_address}</p>
                           {drawerData.pickup_date && <p className="text-xs text-slate-500 mt-0.5">Date: {formatDate(drawerData.pickup_date)}</p>}
                         </div>
                       </div>
                       
                       <div className="flex items-start gap-4">
                         <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                           <div className="h-2 w-2 rounded-full bg-red-500" />
                         </div>
                         <div>
                           <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Delivery Location</p>
                           <p className="font-semibold text-slate-800">{drawerData.delivery_address}</p>
                           {drawerData.delivery_date && <p className="text-xs text-slate-500 mt-0.5">Date: {formatDate(drawerData.delivery_date)}</p>}
                         </div>
                       </div>
                    </div>
                  </section>

                  {/* Cargo Info */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Cargo Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cargo Name</p>
                        <p className="font-bold text-slate-900">{drawerData.cargo_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Category</p>
                        <p className="font-bold text-slate-900">{drawerData.cargo_category}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Weight</p>
                        <p className="font-bold text-slate-900">{drawerData.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Vehicle Requested</p>
                        <p className="font-bold text-slate-900">{drawerData.requested_vehicle || 'Any'}</p>
                      </div>
                    </div>
                  </section>

                  {/* Quote Breakdown */}
                  {drawerData.quotes && drawerData.quotes.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Quotation</h4>
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
                          <span className="font-bold text-slate-900 uppercase text-xs">Grand Total</span>
                          <span className="text-lg font-black text-amber-600">R {parseFloat(drawerData.quotes[0].grand_total).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Timeline */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Booking Timeline</h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                      
                      <div className="relative flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="pt-0.5 w-full border border-slate-100 rounded-xl p-3 bg-slate-50">
                          <h5 className="font-bold text-slate-800 text-xs">Booking Created</h5>
                          <span className="text-[10px] text-slate-400">{new Date(drawerData.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {timeline.map((event, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-[#f4a236] text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div className="pt-0.5 w-full border border-slate-100 rounded-xl p-3 bg-white shadow-sm">
                            <h5 className="font-bold text-slate-800 text-xs">{event.status.replace(/_/g, ' ')}</h5>
                            {event.remarks && <p className="text-[10px] text-slate-500 mt-0.5">{event.remarks}</p>}
                            <span className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleString()}</span>
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
