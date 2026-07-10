import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, MapPin, Truck, CheckCircle2, XCircle, Clock, Loader2,
  Navigation, AlertCircle, ChevronRight, DollarSign, ArrowRight,
  RefreshCcw, Info
} from 'lucide-react';
import { customerService } from '../../services/customerService';

const STATUS_CONFIG = {
  REQUEST_SUBMITTED: {
    label: 'Awaiting Broker Quote',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-400',
  },
  QUOTE_PREPARED: {
    label: 'Awaiting Your Decision',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-400',
  },
  QUOTE_SENT: {
    label: 'Awaiting Your Decision',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-400',
  },
  QUOTE_ACCEPTED: {
    label: 'Accepted',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  BOOKING_CONFIRMED: {
    label: 'Booking Confirmed',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-400',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-400',
  },
  PAYMENT_COMPLETED: {
    label: 'Payment Completed',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  PLANT_ASSIGNED: {
    label: 'Machine Assigned',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-400',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-700 bg-red-50 border-red-200',
    dot: 'bg-red-400',
  },
};

function QuoteCard({ booking, onAccept, onReject, actionLoading }) {
  const [expanded, setExpanded] = useState(false);
  const quote = booking.quotes?.[0];
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.QUOTE_PREPARED;
  const canAct = booking.status === 'QUOTE_PREPARED' || booking.status === 'QUOTE_SENT';

  const fmt = (val) =>
    val !== undefined && val !== null
      ? `R ${Number(val).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
      : '—';

  const lineItems = quote
    ? (booking.bookingType === 'Plant Hire'
      ? [
          { label: 'Base Rental Rate', value: quote.vehicle_rate },
          { label: 'Broker Fee', value: quote.broker_fee },
          { label: 'Platform Fee', value: quote.platform_fee },
          { label: 'VAT (15%)', value: quote.tax },
        ].filter(Boolean)
      : [
          { label: 'Base / Vehicle Rate', value: quote.vehicle_rate },
          { label: 'Distance Charge', value: quote.distance_cost },
          { label: 'Fuel Surcharge', value: quote.fuel_charges },
          { label: 'Weight Charges', value: quote.weight_charges },
          { label: 'Insurance', value: quote.insurance_charges },
          { label: 'Broker Fee', value: quote.broker_fee },
          { label: 'Platform Fee', value: quote.platform_fee },
          { label: 'VAT (15%)', value: quote.tax },
          quote.discount > 0 && { label: 'Discount', value: -quote.discount },
        ].filter(Boolean))
    : [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Card Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                booking.bookingType === 'Plant Hire' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {booking.bookingType || 'Transport'}
              </span>
              <p className="text-[10px] font-mono text-slate-400">
                {booking.id?.slice(0, 16)}...
              </p>
            </div>
            {/* Route or Machine details */}
            {booking.bookingType === 'Plant Hire' ? (
              <div className="text-sm font-bold text-slate-800">
                {booking.machineType} ({booking.machineCategory})
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-1 truncate">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{booking.pickup_address?.split(',')[0]}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <div className="flex items-center gap-1 truncate">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span className="truncate">{booking.delivery_address?.split(',')[0]}</span>
                </div>
              </div>
            )}
          </div>
          {/* Status badge */}
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0 flex items-center gap-1 ${cfg.color}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2">
          {booking.bookingType === 'Plant Hire' ? (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-600">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                {booking.siteAddress}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-600">
                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                {booking.durationValue} {booking.durationUnit}
              </div>
            </>
          ) : (
            [
              { icon: Truck, text: booking.requested_vehicle || 'Any Vehicle' },
              booking.estimated_distance && { icon: Navigation, text: `${Number(booking.estimated_distance).toFixed(1)} km` },
              { icon: Clock, text: new Date(booking.created_at).toLocaleDateString('en-ZA') },
            ].filter(Boolean).map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-600">
                <Icon className="h-3 w-3 text-slate-400" />
                {text}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quote Breakdown */}
      {quote ? (
        <>
          {/* Grand Total always visible */}
          <div className="mx-5 mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Broker Quote</p>
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">Official quotation prepared</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-amber-700">{fmt(quote.grand_total)}</p>
              <p className="text-[9px] text-amber-600 font-medium">incl. VAT</p>
            </div>
          </div>

          {/* Expandable breakdown */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 border-t border-slate-100 transition-colors"
          >
            View full breakdown
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-2 border-t border-slate-50 bg-slate-50/50">
              {lineItems.map(({ label, value }) => (
                Number(value) !== 0 && (
                  <div key={label} className="flex justify-between text-xs py-1">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className={`font-bold ${Number(value) < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {Number(value) < 0 ? `−${fmt(-value)}` : fmt(value)}
                    </span>
                  </div>
                )
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black">
                <span className="text-slate-700">Total</span>
                <span className="text-amber-600">{fmt(quote.grand_total)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mx-5 mb-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 text-center font-medium">
          {booking.bookingType === 'Plant Hire' ? 'Awaiting broker quotation...' : 'Broker quote data unavailable'}
        </div>
      )}

      {/* Action buttons */}
      {canAct && (
        <div className="grid grid-cols-2 gap-3 p-4 border-t border-slate-100">
          <button
            onClick={() => onReject(booking.id)}
            disabled={actionLoading === booking.id}
            className="py-2.5 border-2 border-red-200 text-red-600 font-bold text-xs rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject Quote
          </button>
          <button
            onClick={() => onAccept(booking.id)}
            disabled={actionLoading === booking.id}
            className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {actionLoading === booking.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Accept & Confirm
          </button>
        </div>
      )}

      {booking.status === 'CUSTOMER_ACCEPTED' || booking.status === 'BOOKING_CONFIRMED' || booking.status === 'QUOTE_ACCEPTED' || booking.status === 'PAYMENT_PENDING' || booking.status === 'PAYMENT_COMPLETED' || booking.status === 'PLANT_ASSIGNED' ? (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            {booking.bookingType === 'Plant Hire' ? 'Quote accepted — processing booking' : 'Quote accepted — booking confirmed'}
          </div>
          <button
            onClick={() => window.location.href = `/customer/booking-details/${booking.id}`}
            className="text-[10px] font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1"
          >
            View Details <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ) : booking.status === 'REJECTED' ? (
        <div className="p-4 border-t border-red-50 bg-red-50/50 text-xs text-red-600 font-medium flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          You rejected this quotation.
        </div>
      ) : null}
    </div>
  );
}

export default function MyQuotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getMyQuotations();
      if (res.success) {
        // Map database bookings to populate Plant Hire details from description
        const processedBookings = res.data.map(booking => {
          if (booking.cargo_category === 'Plant Hire') {
            let plantDetails = {};
            try {
              if (booking.description) {
                plantDetails = JSON.parse(booking.description);
              }
            } catch (e) {
              console.error("Error parsing plant description:", e);
            }
            return {
              ...booking,
              bookingType: 'Plant Hire',
              status: booking.status === 'QUOTE_REQUESTED' ? 'REQUEST_SUBMITTED' : booking.status,
              machineCategory: plantDetails.machineCategory || 'Plant',
              machineType: plantDetails.machineType || booking.requested_vehicle || 'Equipment',
              siteAddress: plantDetails.siteAddress || booking.pickup_address,
              durationValue: plantDetails.durationValue || '',
              durationUnit: plantDetails.durationUnit || 'Hours'
            };
          }
          return booking;
        });

        // Seeding mock Plant Hire quotation for demo purposes of QUOTE_SENT state
        const plantMockQuoted = {
          id: 'plant-quote-sent-12345',
          bookingType: 'Plant Hire',
          status: 'QUOTE_SENT',
          created_at: new Date().toISOString(),
          machineCategory: 'Earthmoving',
          machineType: 'Excavator 20 Ton',
          siteAddress: 'Johannesburg, Gauteng',
          durationValue: 8,
          durationUnit: 'Hours',
          quotes: [{
            grand_total: 4800,
            vehicle_rate: 4000,
            tax: 600,
            broker_fee: 200,
            platform_fee: 0
          }]
        };

        setQuotations([plantMockQuoted, ...processedBookings]);
      } else {
        setError(res.message || 'Failed to load quotations');
      }
    } catch (err) {
      setError('Unable to load quotations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await customerService.acceptQuote(bookingId);
      if (res.success) {
        setQuotations(prev =>
          prev.map(b => b.id === bookingId
            ? { ...b, status: 'BOOKING_CONFIRMED' }
            : b
          )
        );
      } else {
        alert(res.message || 'Failed to accept quote');
      }
    } catch (err) {
      alert('Failed to accept quote. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Reason for rejection (optional):') ?? '';
    setActionLoading(bookingId);
    try {
      const res = await customerService.rejectQuote(bookingId, reason);
      if (res.success) {
        setQuotations(prev =>
          prev.map(b => b.id === bookingId
            ? { ...b, status: 'REJECTED' }
            : b
          )
        );
      } else {
        alert(res.message || 'Failed to reject quote');
      }
    } catch (err) {
      alert('Failed to reject quote. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'QUOTE_PREPARED', label: 'Pending Decision' },
    { key: 'BOOKING_CONFIRMED', label: 'Confirmed' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const filtered = quotations.filter(q =>
    filter === 'all' || q.status === filter
  );

  const pendingCount = quotations.filter(q => q.status === 'QUOTE_PREPARED').length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Quotations</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Broker-prepared quotes for your booking requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} awaiting decision
            </div>
          )}
          <button
            onClick={fetchQuotations}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* How it works info */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 font-medium">
          When a broker prepares your quotation it appears here. Review the full price breakdown and <strong>Accept</strong> to confirm your booking, or <strong>Reject</strong> if you'd like to negotiate or cancel.
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map(({ key, label }) => {
          const count = key === 'all' ? quotations.length : quotations.filter(q => q.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                filter === key
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  filter === key ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-500 font-medium">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          Loading quotations...
        </div>
      ) : error ? (
        <div className="text-center py-16 space-y-3">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">{error}</p>
          <button
            onClick={fetchQuotations}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600">
              {filter === 'all' ? 'No quotations yet' : `No ${filters.find(f => f.key === filter)?.label?.toLowerCase()} quotations`}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {filter === 'all'
                ? 'Your broker-prepared quotes will appear here once a broker reviews your booking request.'
                : 'Try a different filter.'}
            </p>
          </div>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/customer/create-booking')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider transition-colors shadow-sm"
            >
              Create a Booking
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <QuoteCard
              key={booking.id}
              booking={booking}
              onAccept={handleAccept}
              onReject={handleReject}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
