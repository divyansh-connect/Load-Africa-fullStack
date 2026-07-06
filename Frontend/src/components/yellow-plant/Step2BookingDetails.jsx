import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Wrench, FileText } from 'lucide-react';

export default function Step2BookingDetails({ selectedMachine, bookingDetails, setBookingDetails, onNext, onBack }) {
  const [isCalculating, setIsCalculating] = useState(false);

  if (!selectedMachine) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = (bookingDetails.durationDays || '4') && bookingDetails.address && bookingDetails.startDate && bookingDetails.contactPerson && bookingDetails.phone;

  const handleNext = () => {
    if (!isFormValid) return;
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      onNext();
    }, 2000);
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full overflow-hidden">
      {/* Content Area - overflow-y-auto so button always visible */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-1 space-y-3 pt-1" style={{ scrollbarWidth: 'none' }}>
        
        {/* Selected Machine Summary Card */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200 p-1">
              <img src={selectedMachine.image} alt={selectedMachine.name} className="w-full h-full object-cover rounded-md" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-slate-900">{selectedMachine.name}</h4>
              <p className="text-[12px] font-bold text-slate-500 mt-0.5">R {selectedMachine.hourlyRate.toLocaleString()}/hr</p>
            </div>
          </div>
          <button onClick={onBack} className="text-[#f99c00] text-[13px] font-bold hover:underline px-2 mr-1 disabled:opacity-50" disabled={isCalculating}>
            Change
          </button>
        </div>

        {/* Form Fields - with more breathing room */}
        <div className="space-y-3">
          
          {/* Number of Hours */}
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#f99c00]" />
              Number of Hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="durationDays"
                value={bookingDetails.durationDays || '4'}
                onChange={handleChange}
                disabled={isCalculating}
                className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 disabled:bg-slate-50 disabled:text-slate-400"
                min={selectedMachine.minHireHours || "4"}
              />
              <span className="text-[11px] text-slate-500 font-bold">Minimum {selectedMachine.minHireHours || 4} hours</span>
            </div>
          </div>

          {/* Site Address */}
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#f99c00]" />
              Site Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter site address"
              value={bookingDetails.address}
              onChange={handleChange}
              disabled={isCalculating}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#f99c00]" />
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={bookingDetails.startDate}
              onChange={handleChange}
              disabled={isCalculating}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Contact & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-900 mb-1">Contact Name</label>
              <input
                type="text"
                name="contactPerson"
                placeholder="Full name"
                value={bookingDetails.contactPerson}
                onChange={handleChange}
                disabled={isCalculating}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-900 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 082 123 4567"
                value={bookingDetails.phone}
                onChange={handleChange}
                disabled={isCalculating}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900 mb-1">
              <Wrench className="w-3.5 h-3.5 text-[#f99c00]" />
              Special Requirements (Optional)
            </label>
            <textarea
              name="companyName"
              placeholder="e.g. Attachments needed, access restrictions..."
              rows="3"
              value={bookingDetails.companyName}
              onChange={handleChange}
              disabled={isCalculating}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/50 placeholder-slate-400 resize-none disabled:bg-slate-50 disabled:text-slate-400"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Footer Button (Fixed) — no border, no extra margin */}
      <div className="pt-2 shrink-0">
        <button
          onClick={handleNext}
          disabled={!isFormValid || isCalculating}
          className={`w-full py-2.5 font-bold rounded-lg text-[14px] tracking-widest transition-all flex items-center justify-center gap-2 uppercase ${
            isFormValid && !isCalculating
              ? 'bg-[#1e3a8a] hover:bg-[#162d6a] text-white cursor-pointer shadow-md'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          {isCalculating ? (
            <span className="animate-pulse tracking-[0.2em] font-black">CALCULATING....</span>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              GET QUOTATION
            </>
          )}
        </button>
      </div>
    </div>
  );
}
