import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, CheckCircle2, Shield, Calendar, MapPin, Truck, RefreshCw } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import api from '../../services/api';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingDetails(id);
      if (res.success) {
        setBooking(res.data);
      } else {
        setError(res.message || 'Failed to fetch booking details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    const invoice = booking?.invoices?.[0] || booking?.invoices?.find(inv => inv.status === 'PENDING');
    if (!invoice) {
      alert("No active invoice found for this booking.");
      return;
    }

    try {
      setPaying(true);
      const response = await api.post('/finance/process-payment', { invoiceId: invoice.id });
      if (response.data.success) {
        setPaymentSuccess(true);
      } else {
        alert(response.data.message || 'Payment failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Network error during payment processing');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" /> Fetching Invoice & Booking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-100 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="text-red-500 font-bold text-sm">{error}</div>
        <button onClick={() => navigate('/customer/booking-history')} className="px-4 py-2 bg-slate-905 text-white font-bold text-xs rounded-xl">
          Back to Bookings
        </button>
      </div>
    );
  }

  const invoice = booking?.invoices?.[0] || booking?.invoices?.find(inv => inv.status === 'PENDING');

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white border border-slate-205 rounded-3xl p-8 text-center space-y-6 shadow-xl animate-fadeIn">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Payment Successful!</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Your payment for booking <strong className="text-slate-800 font-mono">#{id.slice(0, 8)}</strong> has been processed successfully. Your invoice is marked as PAID and the trip is finalized.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs font-semibold text-slate-700 space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-450 font-bold">Transaction ID:</span>
            <span className="font-mono text-slate-900">TXN-{Math.floor(1000000 + Math.random() * 9000000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-450 font-bold">Amount Paid:</span>
            <span className="text-slate-900 font-black">R {parseFloat(invoice?.total_amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-450 font-bold">Status:</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-emerald-200">COMPLETED</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/customer/booking-history')}
          className="w-full py-3 bg-[#f4a236] hover:bg-amber-500 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          View Bookings History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invoice Checkout</h2>
          <p className="text-xs text-slate-400 mt-0.5">Settle outstanding platform dues for booking #{id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column: Invoice Details */}
        <div className="md:col-span-3 space-y-6">
          {/* Booking Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">Booking Summary</h3>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" />
                <span>Cargo: <strong className="text-slate-800">{booking.cargo_name}</strong> ({booking.weight} kg)</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Requested Vehicle: <strong className="text-slate-800">{booking.requested_vehicle || 'Any Vehicle'}</strong></span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 relative space-y-3">
                <div className="absolute left-2.5 top-6 bottom-4 w-0.5 bg-slate-200" />
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Pickup Location</p>
                    <p className="text-slate-800 mt-0.5 truncate max-w-[280px]">{booking.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 z-10">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Delivery Location</p>
                    <p className="text-slate-800 mt-0.5 truncate max-w-[280px]">{booking.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method simulation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" /> Payment Method
            </h3>
            
            <div className="space-y-3">
              <div className="border border-amber-300 bg-amber-50/30 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-3 w-3" />
                </div>
                <div className="text-xs text-amber-800 font-semibold leading-relaxed">
                  <p className="font-bold mb-0.5 text-amber-900">Sandbox Payment Simulation Mode</p>
                  <p className="opacity-80">This checkout simulates payment processing on card settlement gates. Clicking "Authorize Payment" simulates a real platform authorization and finishes the booking sequence.</p>
                </div>
              </div>

              <div className="border-2 border-amber-500 bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-200 rounded-lg flex items-center justify-center font-black text-slate-600 text-xs">VISA</div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Mock Card Authorization</p>
                    <p className="text-[10px] text-slate-400 font-bold">Expires: 12 / 2030</p>
                  </div>
                </div>
                <div className="h-4 w-4 rounded-full bg-amber-500 border-4 border-white shadow shadow-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Pricing Breakdown */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">Receipt Breakdown</h3>
            
            {!invoice ? (
              <div className="text-center text-xs py-10 font-bold text-slate-400">
                No unpaid invoice found. Click "View Bookings History" to check status.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-450">Platform Subtotal:</span>
                    <span className="font-bold">R {parseFloat(invoice.amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Taxes & Levies:</span>
                    <span className="font-bold">R {parseFloat(invoice.tax_amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Service Fees:</span>
                    <span className="font-bold">R 0.00</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase text-slate-400">Grand Total:</span>
                  <span className="text-2xl font-black text-amber-400">
                    R {parseFloat(invoice.total_amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {paying ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Authorize Payment</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
