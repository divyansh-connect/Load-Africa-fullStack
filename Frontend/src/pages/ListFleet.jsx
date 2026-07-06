import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Info, CheckCircle2, Upload, FileText, ArrowRight, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ListFleet() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Steps: 1 (Form), 2 (Docs Upload), 3 (Success Complete)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [numVehicles, setNumVehicles] = useState('');
  const [fleetTier, setFleetTier] = useState('Starter (≤25 vehicles)');
  const [operatingAreas, setOperatingAreas] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  
  // Step 2 uploads State
  const [companyRegDoc, setCompanyRegDoc] = useState(null);
  const [vatDoc, setVatDoc] = useState(null);
  
  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!companyName || !contactName || !email || !phone || !numVehicles || !address) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleStep2Submit = (e) => {
    e.preventDefault();
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const STEPS = [
    { n: 1, label: 'Company & Fleet' },
    { n: 2, label: 'Documents & Photos' },
    { n: 3, label: 'Complete' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />

      {/* Main Page Layout */}
      <main className="max-w-[650px] mx-auto px-4 pt-24 pb-20">
        
        {/* Title area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            LIST YOUR FLEET
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-bold">
            Register your fleet, upload your compliance documents, and start receiving loads across South Africa.
          </p>
        </div>

        {/* Stepper progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1.5">
                <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                  step >= n ? 'bg-[#f99c00] text-slate-950' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                </span>
                <span className={`text-xs font-bold whitespace-nowrap hidden sm:block ${step >= n ? 'text-slate-900' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-10 sm:w-16 rounded ${step > n ? 'bg-[#f99c00]' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Dynamic Steps Container */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 sm:p-6 space-y-5 text-left">
            
            {/* Sign in required Banner */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-[#f99c00] shrink-0" /> Sign in required
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed">
                  Create a free account or sign in so we can link your fleet profile to you securely.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')} className="px-5 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs rounded-lg transition-colors">
                  Sign in
                </button>
                <button onClick={() => navigate('/signup')} className="px-5 py-1.5 border border-slate-200 hover:bg-slate-55 text-slate-700 font-black text-xs rounded-lg bg-white transition-colors">
                  Sign up
                </button>
              </div>
            </div>

            {/* Subheading info */}
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide mb-0.5">
                <Truck className="h-4 w-4 text-[#f99c00]" /> Register Your Fleet
              </h3>
              <p className="text-[13px] text-slate-500 font-bold">
                Tell us about your company and fleet to get started.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-bold">
                  {error}
                </div>
              )}

              {/* Grid 2-column fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="ABC Logistics"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 ..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">VAT Number</label>
                  <input
                    type="text"
                    placeholder="VAT Number"
                    value={vatNumber}
                    onChange={e => setVatNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Number of Vehicles *</label>
                  <input
                    type="number"
                    required
                    placeholder="Number of Vehicles"
                    value={numVehicles}
                    onChange={e => setNumVehicles(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Full width dropdown (CUSTOM SELECT DROPDOWN) */}
              <div className="relative text-left" ref={dropdownRef}>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Fleet Tier *</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm text-left"
                >
                  <span className="text-slate-900 font-bold">{fleetTier}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    {['Starter (≤25 vehicles)', 'Growth (26-100 vehicles)', 'Enterprise (>100 vehicles)'].map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          setFleetTier(tier);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[13px] font-bold transition-colors select-none ${
                          fleetTier === tier 
                            ? 'bg-[#f99c00] text-slate-955' 
                            : 'text-slate-700 hover:bg-[#f99c00] hover:text-slate-955'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Full width inputs */}
              <div>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Operating Areas</label>
                <input
                  type="text"
                  placeholder="e.g. Gauteng, Rustenburg, Northern Cape"
                  value={operatingAreas}
                  onChange={e => setOperatingAreas(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Services Offered</label>
                <input
                  type="text"
                  placeholder="e.g. Bakkie hire, side tipper, furniture removals"
                  value={servicesOffered}
                  onChange={e => setServicesOffered(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                />
              </div>

              {/* Full width Address Input */}
              <div>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Operating Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Start typing your depot / office address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm"
                />
                <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1">
                  Pick a suggestion so customers nearby can find you on Google Maps.
                </p>
              </div>

              {/* Submit / Proceed action */}
              <button
                type="submit"
                className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-xs uppercase tracking-wider transition-colors mt-6 shadow-sm flex items-center justify-center gap-2"
              >
                CONTINUE TO DOCUMENTS <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: File upload interface */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 sm:p-6 space-y-5 text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide mb-0.5">
                <Upload className="h-4 w-4 text-[#f99c00]" /> Compliance Documents
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Please upload copies of your business documentation to verify your fleet.
              </p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-5">
              
              {/* Document 1 */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-2">Company Registration Document (CIPC) *</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${companyRegDoc ? 'border-[#f99c00] bg-amber-50/40' : 'border-slate-200 hover:border-[#f99c00]/50'}`}
                  onClick={() => document.getElementById('companyRegInput').click()}>
                  <input id="companyRegInput" type="file" required accept=".pdf,.jpg,.png" className="hidden"
                    onChange={e => setCompanyRegDoc(e.target.files[0])} />
                  {companyRegDoc ? (
                    <p className="text-xs font-bold text-emerald-600">✓ Selected: {companyRegDoc.name}</p>
                  ) : (
                    <>
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Click to upload CIPC Document</p>
                    </>
                  )}
                </div>
              </div>

              {/* Document 2 */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-2">VAT Registration Document (If applicable)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${vatDoc ? 'border-[#f99c00] bg-amber-50/40' : 'border-slate-200 hover:border-[#f99c00]/50'}`}
                  onClick={() => document.getElementById('vatInput').click()}>
                  <input id="vatInput" type="file" accept=".pdf,.jpg,.png" className="hidden"
                    onChange={e => setVatDoc(e.target.files[0])} />
                  {vatDoc ? (
                    <p className="text-xs font-bold text-emerald-600">✓ Selected: {vatDoc.name}</p>
                  ) : (
                    <>
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Click to upload VAT Document</p>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-55 text-slate-600 font-bold rounded-lg text-sm transition-colors bg-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-sm tracking-widest transition-colors uppercase"
                >
                  SUBMIT APPLICATION
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Complete Success Screen */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-7 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f99c00]/15">
              <CheckCircle2 className="h-10 w-10 text-[#f99c00]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Application Submitted!</h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">
                Thank you for listing your fleet with LoadAfrica. Our compliance team will review your CIPC documents and verify your profile within 24 hours.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-black rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Back to Home
            </button>
          </div>
        )}

      </main>

      <Footer light />
    </div>
  );
}
