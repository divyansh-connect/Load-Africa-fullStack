import React from 'react';
import { CheckCircle, MapPin, Calendar, User, Phone, CreditCard, Edit } from 'lucide-react';

export default function Step3Quotation({ selectedMachine, bookingDetails, onBack, onConfirm }) {
  if (!selectedMachine) return null;

  const duration = parseInt(bookingDetails.durationDays || 4);
  const hourlyRate = selectedMachine.hourlyRate;
  const hiringCost = hourlyRate * duration;
  const siteEstablishment = 1500;
  const siteDe = 1500;
  const subtotalExcl = hiringCost + siteEstablishment + siteDe;
  const adminFee = Math.round(subtotalExcl * 0.20);
  const netBeforeVAT = subtotalExcl - adminFee;
  const vat = Math.round(netBeforeVAT * 0.15);
  const total = netBeforeVAT + vat;

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full overflow-hidden">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-2 pt-1 pb-1 pr-0.5" style={{ scrollbarWidth: 'none' }}>

        {/* ── Machine + Booking Info Card  ──  bg: #F0F2F6 */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: '#F0F2F6' }}
        >
          {/* Machine row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200 p-1">
              <img
                src={selectedMachine.image}
                alt={selectedMachine.name}
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-slate-900">{selectedMachine.name}</h4>
              <p className="text-[11px] font-bold text-slate-500">{selectedMachine.category}</p>
            </div>
          </div>

          {/* Site + Date + Contact + Phone — equal 2-col grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#f99c00] shrink-0" />
              <span className="text-slate-600 font-bold">Site:</span>&nbsp;{bookingDetails.address}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#f99c00] shrink-0" />
              <span className="text-slate-600 font-bold">Date:</span>&nbsp;{bookingDetails.startDate}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-[#f99c00] shrink-0" />
              <span className="text-slate-600 font-bold">Contact:</span>&nbsp;{bookingDetails.contactPerson}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#f99c00] shrink-0" />
              <span className="text-slate-600 font-bold">Phone:</span>&nbsp;{bookingDetails.phone}
            </span>
          </div>
        </div>

        {/* ── Price Breakdown Card ── bg: #FEFAF2 */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#FEFAF2' }}
        >
          {/* Header row — same #FEFAF2 bg, just a bottom divider */}
          <div
            className="px-4 py-2.5 flex items-center gap-2 border-b"
            style={{ borderColor: '#f0e0b0' }}
          >
            <CreditCard className="w-4 h-4 text-[#f99c00]" />
            <span className="text-[13px] font-black text-slate-900 tracking-wide uppercase">
              Price Breakdown
            </span>
          </div>

          <div className="px-4 py-3 space-y-2">
            {/* Line items */}
            <div className="flex justify-between text-[13px] font-bold text-slate-600">
              <span>Hourly rate ({duration} hrs × R {hourlyRate.toLocaleString()})</span>
              <span>R {hiringCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-slate-600">
              <span>Site establishment</span>
              <span>R {siteEstablishment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-slate-600">
              <span>Site de-establishment</span>
              <span>R {siteDe.toLocaleString()}</span>
            </div>

            <div className="h-px" style={{ backgroundColor: '#f0e0b0' }} />

            <div className="flex justify-between text-[13px] font-bold text-slate-500">
              <span>Subtotal (excl. VAT)</span>
              <span>R {subtotalExcl.toLocaleString()}</span>
            </div>
            {/* Admin fee — RED */}
            <div className="flex justify-between text-[13px] font-bold text-red-500">
              <span>Admin fee (20%)</span>
              <span>– R {adminFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-slate-500">
              <span>Net before VAT</span>
              <span>R {netBeforeVAT.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-slate-500">
              <span>VAT (15%)</span>
              <span>R {vat.toLocaleString()}</span>
            </div>

            <div className="h-px" style={{ backgroundColor: '#f0e0b0' }} />

            <div className="flex justify-between text-[15px] font-black text-slate-900">
              <span>Total (incl. VAT)</span>
              <span className="text-[#f99c00]">R {total.toLocaleString()}</span>
            </div>

            <p className="text-[10px] text-slate-400 font-medium pt-0.5">
              * Final price may vary. Additional charges may apply for extended hours, standby time, or special attachments.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer Buttons — no border/line ── */}
      <div className="pt-1 shrink-0 flex gap-3 mt-0">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 border-2 border-[#f99c00] text-[#f99c00] hover:bg-amber-50 font-black rounded-lg text-[12px] tracking-widest transition-colors flex items-center justify-center gap-1.5 uppercase"
        >
          <Edit className="w-3.5 h-3.5" />
          EDIT DETAILS
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-[12px] tracking-widest transition-colors flex items-center justify-center gap-1.5 uppercase shadow-md"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          CONFIRM BOOKING
        </button>
      </div>
    </div>
  );
}
