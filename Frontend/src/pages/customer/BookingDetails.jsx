import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, DollarSign, User, CheckCircle2, Truck, FileText, 
  Download, Building, Clock, Map, X, Loader2, MapPin, ArrowLeft
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { bookingService } from '../../services/bookingService';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [detailsRes, timelineRes] = await Promise.all([
        bookingService.getBookingDetails(id),
        bookingService.getBookingTimeline(id)
      ]);
      if (detailsRes.success && detailsRes.data) {
        setLoad(detailsRes.data);
      } else {
        setError('Booking not found.');
      }
      if (timelineRes.success) {
        setTimeline(timelineRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const s = (status || '').toUpperCase();
    if (['COMPLETED', 'DELIVERED', 'PAYMENT_RECEIVED', 'POD_VERIFIED', 'CUSTOMER_ACCEPTED', 'CLOSED'].includes(s)) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (['CANCELLED', 'REJECTED', 'FAILED', 'EXPIRED'].includes(s)) return 'bg-red-100 text-red-800 border-red-200';
    if (['IN_TRANSIT', 'PICKED_UP', 'PICKUP_ARRIVED', 'DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'LOADING'].includes(s)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['PAYMENT_PENDING', 'QUOTE_PREPARED', 'QUOTE_REQUESTED'].includes(s)) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const isDelivered = (s) => ['COMPLETED', 'DELIVERED', 'POD_UPLOADED', 'POD_VERIFIED', 'PAYMENT_RECEIVED', 'CLOSED'].includes((s || '').toUpperCase());
  const isInTransit = (s) => ['IN_TRANSIT', 'PICKED_UP', 'LOADING', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'ARRIVED_DESTINATION'].includes((s || '').toUpperCase());
  const isDriverAssigned = (s) => isInTransit(s) || isDelivered(s) || ['DRIVER_ASSIGNED', 'PICKUP_SCHEDULED'].includes((s || '').toUpperCase());
  const isPaid = (s) => ['PAYMENT_RECEIVED', 'COMPLETED', 'CLOSED'].includes((s || '').toUpperCase());

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-slate-500 font-medium">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        Loading booking details...
      </div>
    );
  }

  if (error || !load) {
    return (
      <div className="p-12 text-center max-w-md mx-auto mt-10">
        <div className="text-red-500 font-bold mb-4">{error || 'Booking not found.'}</div>
        <button onClick={() => navigate('/customer/booking-history')} className="text-amber-500 font-bold flex items-center gap-2 mx-auto">
          <ArrowLeft className="h-4 w-4" /> Back to Booking History
        </button>
      </div>
    );
  }

  const quote = load.quotes?.[0];
  const grandTotal = quote ? Number(quote.grand_total) : 0;
  const activeAssignment = load.assignments?.find(a => a.status === 'ACTIVE') || load.assignments?.[0];
  const driver = activeAssignment?.driver;
  const vehicle = activeAssignment?.vehicle;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/customer/booking-history')} 
            className="text-xs text-slate-400 font-bold flex items-center gap-1 mb-1 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Booking History
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
          <p className="text-xs text-slate-400 font-mono">{load.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusBadgeColor(load.status)}`}>
            {load.status?.replace(/_/g, ' ')}
          </span>
          {isInTransit(load.status) && (
            <Button onClick={() => navigate('/customer/tracking')}>
              <Map className="h-4 w-4 mr-2" />
              Track Live
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cargo & Route Card */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{load.cargo_name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Cargo · {load.cargo_category || 'General'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Weight</span>
                <span className="font-bold text-slate-800 text-sm">{load.weight} tons</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-sm relative">
              <div className="absolute left-2.5 top-6 bottom-4 w-0.5 bg-slate-200 -z-10" />
              
              <div className="flex items-start gap-4">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Address</span>
                  <p className="text-slate-700 font-semibold">{load.pickup_address}</p>
                  <p className="text-xs text-slate-500">Date: {load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'Scheduled'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Address</span>
                  <p className="text-slate-700 font-semibold">{load.delivery_address}</p>
                  <p className="text-xs text-slate-500">
                    {load.delivery_date ? `Expected: ${new Date(load.delivery_date).toLocaleDateString()}` : 'ETA pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Vehicle Type</p>
                <p className="text-sm font-bold text-slate-800">{load.requested_vehicle || 'Any'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Distance</p>
                <p className="text-sm font-bold text-slate-800">{load.distance_km ? `${Number(load.distance_km).toFixed(1)} km` : 'Calculating...'}</p>
              </div>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="p-6 space-y-5">
            <h3 className="font-bold text-slate-800 text-sm">Lifecycle Timeline</h3>
            
            <div className="space-y-4 relative before:absolute before:left-5 before:top-0 before:h-full before:w-0.5 before:bg-slate-200">
              
              {/* Static first node */}
              <div className="relative flex items-start gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-white bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="pt-1.5 flex-1 border border-slate-100 rounded-xl p-3 bg-slate-50">
                  <h5 className="font-bold text-slate-800 text-sm">Booking Created</h5>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(load.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Dynamic timeline from DB */}
              {timeline.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full border-4 border-white bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="pt-1.5 flex-1 border border-slate-100 rounded-xl p-3 bg-white shadow-sm">
                    <h5 className="font-bold text-slate-800 text-sm">{event.status?.replace(/_/g, ' ')}</h5>
                    {event.remarks && <p className="text-xs text-slate-500 mt-0.5">{event.remarks}</p>}
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}

              {timeline.length === 0 && (
                <div className="relative flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full border-4 border-white bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 z-10">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="pt-1.5 flex-1 border border-slate-100 rounded-xl p-3 bg-white">
                    <h5 className="font-bold text-slate-500 text-sm">Awaiting Updates</h5>
                    <p className="text-xs text-slate-400">Status changes will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Driver & Vehicle */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Assigned Transporter</h3>
            
            {driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center font-black text-amber-700 text-xl border border-amber-200 shadow-sm">
                    {driver.user?.first_name?.[0] || 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{driver.user?.first_name} {driver.user?.last_name || ''}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Driver</span>
                  </div>
                </div>
                
                {vehicle && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Registration</span>
                      <span className="text-slate-800 font-bold">{vehicle.registration_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Vehicle</span>
                      <span className="text-slate-800 font-bold">{vehicle.brand} {vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Type</span>
                      <span className="text-slate-800 font-bold">{vehicle.vehicle_type || 'Truck'}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Building className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">LoadAfrica Dispatch</p>
                      <p className="text-slate-400 font-medium">Operations Hub</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Truck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Driver assignment pending</p>
                <p className="text-[10px] text-slate-400 mt-1">A broker will assign a driver shortly</p>
              </div>
            )}
          </Card>

          {/* Quote / Payment Summary */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Payment Summary</h3>
            
            {quote ? (
              <>
                <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Distance Cost</span>
                    <span className="text-slate-800 font-bold">R {Number(quote.distance_cost || 0).toFixed(2)}</span>
                  </div>
                  {Number(quote.surcharge) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Surcharges</span>
                      <span className="text-slate-800 font-bold">R {Number(quote.surcharge).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Platform Fee</span>
                    <span className="text-slate-800 font-bold">R {Number(quote.platform_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">VAT (15%)</span>
                    <span className="text-slate-800 font-bold">R {Number(quote.tax || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Grand Total</span>
                  <span className="text-xl font-black text-slate-900">R {grandTotal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 font-medium">Quote pending from broker</p>
              </div>
            )}

            <div className={`border rounded-xl p-3 flex justify-between items-center text-xs ${isPaid(load.status) ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-bold">Payment Status</span>
              </div>
              <span className="font-black">{isPaid(load.status) ? 'PAID' : 'PENDING'}</span>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Documents</h3>
            
            <div className="space-y-2">
              {[
                { label: 'Tax Invoice', sub: `INV-${load.id?.slice(0, 8)}.pdf`, icon: FileText, available: !!quote },
                { label: 'Payment Receipt', sub: `REC-${load.id?.slice(0, 8)}.pdf`, icon: DollarSign, available: isPaid(load.status) },
                { label: 'Proof of Delivery (POD)', sub: isDelivered(load.status) ? `POD-${load.id?.slice(0, 8)}.pdf` : 'Not yet available', icon: CheckCircle2, available: isDelivered(load.status) },
              ].map(({ label, sub, icon: Icon, available }) => (
                <button 
                  key={label}
                  disabled={!available}
                  onClick={() => available && alert(`Downloading ${label}...`)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 transition-colors group text-left ${available ? 'hover:border-amber-400 hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${available ? 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600' : 'bg-slate-50 text-slate-300'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{label}</p>
                      <p className="text-[10px] text-slate-400">{sub}</p>
                    </div>
                  </div>
                  <Download className={`h-4 w-4 ${available ? 'text-slate-400 group-hover:text-amber-500' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
