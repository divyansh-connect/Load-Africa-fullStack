import React, { useState, useEffect } from 'react';
import { Search, Filter, Truck, X, User, MapPin, CheckCircle2, RefreshCcw } from 'lucide-react';
import { brokerService } from '../../services/brokerService';

export default function QuoteRequests() {
  const [search, setSearch] = useState('');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    vehicle_rate: '',
    fuel_charges: '',
    discount: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await brokerService.getQuoteRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuoteClick = (req) => {
    setSelectedBooking(req);
    setQuoteForm({
      vehicle_rate: '', fuel_charges: '', discount: ''
    });
    setQuoteModalOpen(true);
  };

  const handleQuoteChange = (e) => {
    setQuoteForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitQuote = async () => {
    try {
      const res = await brokerService.submitQuote(selectedBooking.id, {
        ...quoteForm,
        vehicle_rate: Number(quoteForm.vehicle_rate) || 0,
        fuel_charges: Number(quoteForm.fuel_charges) || 0,
        discount: Number(quoteForm.discount) || 0,
      });
      if (res.success) {
        setQuoteModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchRequests(); // refresh list
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit quote');
    }
  };

  const filteredRequests = requests.filter(req => 
    req.id.toLowerCase().includes(search.toLowerCase()) || 
    (req.customer?.company_name && req.customer.company_name.toLowerCase().includes(search.toLowerCase())) ||
    (req.customer?.user?.first_name && req.customer.user.first_name.toLowerCase().includes(search.toLowerCase())) ||
    (req.customer?.user?.email && req.customer.user.email.toLowerCase().includes(search.toLowerCase())) ||
    (req.guest_email && req.guest_email.toLowerCase().includes(search.toLowerCase())) ||
    (req.guest_company && req.guest_company.toLowerCase().includes(search.toLowerCase())) ||
    (req.pickup_contact && req.pickup_contact.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quote Requests</h1>
          <p className="text-sm text-slate-500 font-medium">Review customer booking requests and submit official quotations</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by ID or customer..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Modern Card Grid Layout instead of Table */}
        <div className="p-4 sm:p-6 bg-slate-50/30">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 font-medium">
              <RefreshCcw className="h-6 w-6 animate-spin mb-2 text-slate-400" />
              Loading quote requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200 border-dashed">
              No pending quote requests found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all flex flex-col md:flex-row items-start md:items-center p-4 gap-4 md:gap-6">
                  {/* Status/ID */}
                  <div className="shrink-0 flex flex-col items-start gap-1 w-full md:w-32">
                    <span className="text-[10px] font-black px-2 py-1 bg-amber-100 text-amber-800 rounded-md uppercase tracking-wider">
                      ID: {req.id.split('-')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Customer</p>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
                        <User className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {req.customer?.company_name 
                          ? req.customer.company_name 
                          : req.customer?.user?.first_name 
                            ? `${req.customer.user.first_name} ${req.customer.user.last_name || ''}` 
                            : req.customer?.user?.email
                              ? req.customer.user.email.split('@')[0]
                              : req.guest_company
                                ? req.guest_company
                                : req.guest_email
                                  ? req.guest_email.split('@')[0]
                                  : req.pickup_contact || 'Guest User'}
                      </p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Route</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 truncate">
                      <span className="truncate max-w-[120px]" title={req.pickup_address}>{req.pickup_address?.split(',')[0]}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="truncate max-w-[120px]" title={req.delivery_address}>{req.delivery_address?.split(',')[0]}</span>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Cargo & Weight</p>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {req.cargo_name} <span className="text-slate-500 font-semibold">({req.weight}kg)</span>
                    </p>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    {req.quotes && req.quotes.length > 0 ? (
                      <div className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider text-center rounded-lg flex justify-center items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Quote Issued
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCreateQuoteClick(req)}
                        className="w-full md:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        View & Quote
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Quote Modal */}
      {quoteModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setQuoteModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900">Create Quotation</h2>
                <p className="text-sm text-slate-500">Provide pricing for Booking ID: {selectedBooking.id.substring(0,8)}</p>
              </div>
              <button onClick={() => setQuoteModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Detailed Load Info Summary */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4 text-xs font-semibold text-slate-700">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Trip & Cargo Specifications</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pickup Point</p>
                    <p className="text-slate-800 font-bold truncate max-w-[200px]" title={selectedBooking.pickup_address}>
                      {selectedBooking.pickup_address?.split(',')[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Delivery Point</p>
                    <p className="text-slate-800 font-bold truncate max-w-[200px]" title={selectedBooking.delivery_address}>
                      {selectedBooking.delivery_address?.split(',')[0]}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100/50">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Customer / Company</p>
                    <p className="text-slate-800 font-bold">
                      {selectedBooking.customer?.company_name || selectedBooking.guest_company || 'Individual Customer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Contact Person</p>
                    <p className="text-slate-800 font-bold truncate">
                      {selectedBooking.customer?.user?.first_name 
                        ? `${selectedBooking.customer.user.first_name} ${selectedBooking.customer.user.last_name || ''}` 
                        : selectedBooking.pickup_contact || selectedBooking.customer?.user?.email?.split('@')[0] || selectedBooking.guest_email?.split('@')[0] || 'Guest User'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-slate-800 font-bold">{selectedBooking.customer?.user?.phone || selectedBooking.guest_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-slate-800 font-bold truncate max-w-[200px]" title={selectedBooking.customer?.user?.email || selectedBooking.guest_email}>
                      {selectedBooking.customer?.user?.email || selectedBooking.guest_email || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-1 border-t border-slate-100/50">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Cargo & Weight</p>
                    <p className="text-slate-800 font-bold">{selectedBooking.cargo_name} ({selectedBooking.weight} kg)</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Category</p>
                    <p className="text-slate-800 font-bold">{selectedBooking.cargo_category}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Vehicle Type</p>
                    <p className="text-slate-800 font-bold">{selectedBooking.requested_vehicle || 'Any Available'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pickup Date</p>
                    <p className="text-slate-800 font-bold">
                      {selectedBooking.pickup_date ? new Date(selectedBooking.pickup_date).toLocaleDateString() : 'Immediate'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Est. Distance</p>
                    <p className="text-slate-800 font-bold">
                      {selectedBooking.estimated_distance ? `${selectedBooking.estimated_distance} km` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Est. Travel Time</p>
                    <p className="text-slate-800 font-bold">
                      {selectedBooking.estimated_duration_mins ? `${Math.round(selectedBooking.estimated_duration_mins / 60)} hours` : '—'}
                    </p>
                  </div>
                </div>

                {selectedBooking.pickup_instructions && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Broker & Driver Guidelines</p>
                    <p className="text-slate-650 font-medium leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-100 mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap">
                      {selectedBooking.pickup_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Inputs */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Pricing Breakdown (ZAR)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Vehicle Base Rate</label>
                    <input type="number" name="vehicle_rate" value={quoteForm.vehicle_rate} onChange={handleQuoteChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-semibold" placeholder="e.g. 5000" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Fuel Charges</label>
                    <input type="number" name="fuel_charges" value={quoteForm.fuel_charges} onChange={handleQuoteChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-semibold" placeholder="e.g. 1500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-red-650">Discount</label>
                    <input type="number" name="discount" value={quoteForm.discount} onChange={handleQuoteChange} className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:outline-none focus:border-red-500 text-sm font-semibold" placeholder="e.g. 0" />
                  </div>
                </div>

                {/* Live Real-time Quote Split Calculator */}
                {(() => {
                  const subtotal = (Number(quoteForm.vehicle_rate) || 0) + 
                                   (Number(quoteForm.fuel_charges) || 0) - 
                                   (Number(quoteForm.discount) || 0);
                  const brokerFee = subtotal * 0.05;
                  const platformFee = subtotal * 0.10;
                  const tax = subtotal * 0.15;
                  const grandTotal = subtotal + brokerFee + platformFee + tax;
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-4 space-y-2 text-xs font-semibold text-slate-650">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Live Calculation Preview</h4>
                      <div className="flex justify-between">
                        <span>Pricing Subtotal:</span>
                        <span className="text-slate-800 font-bold">R {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Broker Fee (5%):</span>
                        <span className="text-slate-800 font-bold">R {brokerFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (10%):</span>
                        <span className="text-slate-800 font-bold">R {platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Tax (15%):</span>
                        <span className="text-slate-800 font-bold">R {tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                        <span>GRAND TOTAL CHARGE:</span>
                        <span className="text-amber-500 font-black">R {grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setQuoteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSubmitQuote} 
                className="px-6 py-2 bg-amber-500 text-slate-950 text-sm font-black rounded-xl hover:bg-amber-400 transition-colors shadow-sm"
              >
                Submit Official Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Popup */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-black text-sm">Quote Submitted!</p>
              <p className="text-xs font-semibold text-emerald-100">Customer will review your pricing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
