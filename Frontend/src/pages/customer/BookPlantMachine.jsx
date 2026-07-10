import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import {
  MapPin, Tractor, Clock, Calendar, MessageSquare, Phone, Mail, User, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Send, Loader2, FileText, ChevronRight
} from 'lucide-react';

const MACHINE_CATEGORIES = {
  'Earthmoving': ['Excavator', 'TLB', 'Grader', 'Bulldozer'],
  'Compaction': ['Roller', 'Compactor'],
  'Lifting': ['Crane', 'Forklift', 'Telehandler'],
  'Concrete Equipment': ['Concrete Mixer', 'Pump'],
  'Drilling': ['Drill Rig', 'Auger'],
};

export default function BookPlantMachine() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    siteAddress: '',
    province: '',
    city: '',
    machineCategory: '',
    machineType: '',
    durationUnit: 'Hours',
    durationValue: '',
    minimumHours: '4',
    preferredDate: '',
    preferredTime: '',
    contactPerson: '',
    phone: '',
    email: '',
    specialRequirements: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        cargo_category: 'Plant Hire',
        cargo_name: `${form.machineCategory} - ${form.machineType}`,
        description: JSON.stringify({
          bookingType: 'Plant Hire',
          machineCategory: form.machineCategory,
          machineType: form.machineType,
          durationValue: form.durationValue,
          durationUnit: form.durationUnit,
          specialRequirements: form.specialRequirements
        }),
        weight: 0,
        volume: 0,
        quantity: 1,
        pickup_address: form.siteAddress,
        pickup_date: form.preferredDate ? new Date(form.preferredDate).toISOString() : new Date().toISOString(),
        pickup_contact: form.contactPerson,
        pickup_instructions: form.phone ? `Phone: ${form.phone}. Email: ${form.email}` : '',
        delivery_address: form.siteAddress,
        delivery_date: form.preferredDate ? new Date(form.preferredDate).toISOString() : new Date().toISOString(),
        requested_vehicle: form.machineType,
        is_urgent: false,
      };

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        setStep(3);
      } else {
        alert(res.message || 'Failed to submit booking');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting the booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = form.siteAddress && form.machineCategory && form.machineType && form.durationValue && form.preferredDate;

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.classList.add('lg:overflow-hidden', 'lg:!p-0');
    }
    return () => {
      if (mainEl) {
        mainEl.classList.remove('lg:overflow-hidden', 'lg:!p-0');
      }
    };
  }, []);

  return (
    <div className="w-full mx-auto px-4 md:px-8 lg:px-12 py-6 lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:py-0">
      {step === 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-8 lg:gap-10 items-start lg:h-full">
          
          {/* LEFT COLUMN: Header + Stepper + Form */}
          <div className="lg:col-span-1 lg:h-full lg:overflow-y-auto lg:pr-5 lg:py-4">
            
            {/* Page Header */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Book Plant Machine</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Book heavy equipment for construction, mining and industrial projects.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { num: 1, title: 'Booking Details' },
                { num: 2, title: 'Review & Confirm' },
                { num: 3, title: 'Submitted' }
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-3 shrink-0">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
                    step === s.num ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' :
                    step > s.num ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 flex items-center justify-center rounded-full bg-black/10 text-[10px]">{s.num}</span>}
                    {s.title}
                  </div>
                  {s.num < 3 && <div className="h-[2px] w-8 md:w-12 bg-slate-200 rounded-full" />}
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Section 1: Project Location */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">1. Project Location</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Where is the site?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Site Address <span className="text-red-500">*</span></label>
                    <input type="text" name="siteAddress" value={form.siteAddress} onChange={handleChange} placeholder="Search Google Places..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Province</label>
                      <input type="text" name="province" value={form.province} onChange={handleChange} placeholder="e.g. Gauteng" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">City</label>
                      <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Johannesburg" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Machine Details */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Tractor className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">2. Machine Details</h2>
                    <p className="text-[11px] text-slate-500 font-medium">What equipment do you need?</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Machine Category <span className="text-red-500">*</span></label>
                    <select name="machineCategory" value={form.machineCategory} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all appearance-none cursor-pointer font-medium">
                      <option value="">Select Category...</option>
                      {Object.keys(MACHINE_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Machine Type <span className="text-red-500">*</span></label>
                    <select name="machineType" value={form.machineType} onChange={handleChange} disabled={!form.machineCategory} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all appearance-none cursor-pointer font-medium disabled:opacity-50">
                      <option value="">Select Type...</option>
                      {form.machineCategory && MACHINE_CATEGORIES[form.machineCategory].map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Rental Details */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">3. Rental Details</h2>
                    <p className="text-[11px] text-slate-500 font-medium">How long do you need it?</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Duration <span className="text-red-500">*</span></label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <input type="number" min="4" name="durationValue" value={form.durationValue} onChange={handleChange} placeholder="e.g. 8" className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none font-medium" />
                      <div className="px-6 py-2.5 bg-slate-100 border-l border-slate-200 text-sm font-bold text-slate-700 flex items-center justify-center">
                        Hours
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Start Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Contact Details */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">4. Contact Details</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Who should the operator contact?</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Contact Person</label>
                    <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Name" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Special Requirements */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">5. Special Requirements</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Instructions or attachments needed?</p>
                  </div>
                </div>
                <div>
                  <textarea name="specialRequirements" value={form.specialRequirements} onChange={handleChange} rows="3" placeholder="Examples: Access restrictions, operator required, fuel included, extra bucket, etc." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all resize-none"></textarea>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: BOOKING SUMMARY (Only visible in Step 1) */}
          <div className="lg:block hidden lg:h-full lg:pt-6">
            <div className="sticky top-6 flex flex-col w-full h-[calc(100vh-100px)] pb-6">
              <div className="bg-slate-900 rounded-2xl p-4 text-slate-300 shadow-xl border border-slate-800 flex-1 overflow-y-auto flex flex-col">
                <h3 className="text-base font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2 shrink-0">
                  <FileText className="h-4 w-4 text-amber-500" /> Booking Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-start pb-2.5 border-b border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Selected Machine</span>
                    <span className="text-xs font-bold text-white text-right max-w-[120px]">{form.machineType || '-'}</span>
                  </div>
                  <div className="flex justify-between items-start pb-2.5 border-b border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Duration</span>
                    <span className="text-xs font-bold text-white">{form.durationValue ? `${form.durationValue} ${form.durationUnit}` : '-'}</span>
                  </div>
                  <div className="flex justify-between items-start pb-2.5 border-b border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Project Address</span>
                    <span className="text-xs font-bold text-white text-right max-w-[150px] truncate">{form.siteAddress || '-'}</span>
                  </div>
                </div>
                  
                <div className="pt-3 mt-auto shrink-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Estimated Rental</span>
                    <span className="text-lg font-black text-amber-500">TBD</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-relaxed bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <AlertCircle className="inline h-3 w-3 mr-1 text-blue-400" />
                    Final quotation will be confirmed by LoadAfrica based on availability and logistics.
                  </p>
                </div>
              </div>

              <button
                disabled={!isStep1Valid}
                onClick={handleNext}
                className={`mt-3 w-full shrink-0 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
                  isStep1Valid 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Continue to Review <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* MOBILE BOTTOM SUMMARY (Visible only on small screens) */}
          <div className="lg:hidden col-span-1 mt-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-slate-300 shadow-xl border border-slate-800">
              <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2 shrink-0">
                <FileText className="h-5 w-5 text-amber-500" /> Booking Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Selected Machine</span>
                  <span className="text-sm font-bold text-white text-right max-w-[120px]">{form.machineType || '-'}</span>
                </div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Duration</span>
                  <span className="text-sm font-bold text-white">{form.durationValue ? `${form.durationValue} ${form.durationUnit}` : '-'}</span>
                </div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Project Address</span>
                  <span className="text-sm font-bold text-white text-right max-w-[150px] truncate">{form.siteAddress || '-'}</span>
                </div>
              </div>
                
              <div className="pt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-white">Estimated Rental</span>
                  <span className="text-xl font-black text-amber-500">TBD</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <AlertCircle className="inline h-3 w-3 mr-1 text-blue-400" />
                  Final quotation will be confirmed by LoadAfrica based on availability and logistics.
                </p>
              </div>
            </div>

            <button
              disabled={!isStep1Valid}
              onClick={handleNext}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${
                isStep1Valid 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Continue to Review <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto w-full lg:h-full lg:overflow-y-auto lg:py-6 lg:pr-3 pb-10">
          
          {/* Page Header */}
          <div className="mb-4 flex items-center gap-3.5">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 shrink-0 bg-white"
              >
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Book Plant Machine</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Book heavy equipment for construction, mining and industrial projects.</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { num: 1, title: 'Booking Details' },
              { num: 2, title: 'Review & Confirm' },
              { num: 3, title: 'Submitted' }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-3 shrink-0">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
                  step === s.num ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' :
                  step > s.num ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 flex items-center justify-center rounded-full bg-black/10 text-[10px]">{s.num}</span>}
                  {s.title}
                </div>
                {s.num < 3 && <div className="h-[2px] w-8 md:w-12 bg-slate-200 rounded-full" />}
              </div>
            ))}
          </div>

          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Review Your Plant Request</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900">No payment is required now.</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">Our operations team will verify availability and send you an official quotation.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Project Location</p>
                    <p className="text-xs font-semibold text-slate-800">{form.siteAddress}</p>
                    {form.city && <p className="text-[10px] text-slate-500 mt-0.5">{form.city}, {form.province}</p>}
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Machine Selected</p>
                    <p className="text-xs font-semibold text-slate-800">{form.machineType}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{form.machineCategory}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Rental Duration</p>
                    <p className="text-xs font-semibold text-slate-800">{form.durationValue} {form.durationUnit}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Preferred Date</p>
                    <p className="text-xs font-semibold text-slate-800">{new Date(form.preferredDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {(form.contactPerson || form.phone || form.email) && (
                  <div className="pb-4 border-b border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Details</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {form.contactPerson && <p className="text-xs font-medium text-slate-700"><span className="text-slate-400">Name:</span> {form.contactPerson}</p>}
                      {form.phone && <p className="text-xs font-medium text-slate-700"><span className="text-slate-400">Phone:</span> {form.phone}</p>}
                      {form.email && <p className="text-xs font-medium text-slate-700"><span className="text-slate-400">Email:</span> {form.email}</p>}
                    </div>
                  </div>
                )}

                {form.specialRequirements && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Special Instructions</p>
                    <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">{form.specialRequirements}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button 
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Edit
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-lg shadow-amber-500/25 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Submit Booking</>
                  )}
                </button>
              </div>

            </div>
          )}

          {step === 3 && (
            <div className="max-w-2xl mx-auto lg:h-[70vh] flex flex-col justify-center py-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm text-center">
                <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1.5">Booking Submitted</h2>
                <p className="text-xs text-slate-500 font-medium mb-4 max-w-md mx-auto">Your plant hire request has been received successfully. Our operations team will review machine availability and prepare your quotation.</p>

                <div className="bg-slate-50 rounded-xl p-4 text-left mb-4 border border-slate-100 max-w-md mx-auto">
                  <h3 className="text-[10px] font-bold text-slate-800 mb-3 uppercase tracking-wider">Next Steps Timeline</h3>
                  <div className="space-y-3">
                    {[
                      { num: 1, title: 'Request Submitted', active: true },
                      { num: 2, title: 'Broker Reviews Request', active: false },
                      { num: 3, title: 'Official Quotation Prepared', active: false },
                      { num: 4, title: 'Customer Reviews Quote', active: false },
                    ].map((item, idx, arr) => (
                      <div key={item.num} className="relative flex items-start gap-2.5">
                        {idx !== arr.length - 1 && <div className="absolute left-[9px] top-4 bottom-[-16px] w-0.5 bg-slate-200" />}
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[8px] font-bold border-2 ${
                          item.active ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {item.active ? <CheckCircle2 className="h-3 w-3" /> : item.num}
                        </div>
                        <p className={`text-[11px] pt-0.5 ${item.active ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button 
                    onClick={() => navigate('/customer/dashboard')}
                    className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors uppercase tracking-wider"
                  >
                    Return Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/customer/my-quotations')}
                    className="flex-1 py-3 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 uppercase tracking-wider"
                  >
                    View My Quotations
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
