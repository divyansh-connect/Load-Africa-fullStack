import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Info, CheckCircle2, Upload, FileText, ArrowRight, Wrench, ChevronDown, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fleetService } from '../services/fleetService';

const EQUIPMENT_TYPES = [
  'Excavator',
  'TLB (Backhoe Loader)',
  'Front-End Loader',
  'Bulldozer',
  'Grader',
  'Mobile Crane',
  'Tower Crane',
  'Tipper / Dump Truck',
  'Roller / Compactor',
  'Skid Steer',
  'Forklift',
  'Telehandler',
  'Concrete Mixer Truck',
  'Water Bowser',
  'Other',
];

export default function ListPlant() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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

  // Step 1 state
  const [companyName, setCompanyName]   = useState('');
  const [contactName, setContactName]   = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [idNumber, setIdNumber]         = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [make, setMake]                 = useState('');
  const [model, setModel]               = useState('');
  const [regSerial, setRegSerial]       = useState('');
  const [year, setYear]                 = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Step 2 state
  const [companyRegDoc, setCompanyRegDoc] = useState(null);
  const [machinePhoto, setMachinePhoto]   = useState(null);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!companyName || !contactName || !email || !phone || !idNumber || !equipmentType || !regSerial || !baseLocation || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyRegDoc || !machinePhoto) {
      setError('Please upload all required documents.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload COR document
      let corUrl = '';
      const corRes = await fleetService.uploadFile(companyRegDoc);
      if (corRes.success && corRes.data?.urls?.[0]) {
        corUrl = corRes.data.urls[0];
      } else {
        throw new Error('Company registration document upload failed.');
      }

      // 2. Upload Machine Photo
      let photoUrl = '';
      const photoRes = await fleetService.uploadFile(machinePhoto);
      if (photoRes.success && photoRes.data?.urls?.[0]) {
        photoUrl = photoRes.data.urls[0];
      } else {
        throw new Error('Machine photo upload failed.');
      }

      // 3. Post application payload to backend
      const payload = {
        company_name: companyName,
        contact_name: contactName,
        email,
        phone,
        password,
        national_id: idNumber,
        equipment_type: equipmentType,
        make,
        model,
        registration_number: regSerial,
        year: year ? parseInt(year) : null,
        base_location: baseLocation,
        company_reg_doc: corUrl,
        machine_photo: photoUrl
      };

      const res = await fleetService.submitPlantApplication(payload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to submit application.');
      }

      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicator
  const STEPS = [
    { n: 1, label: 'Company & Machine' },
    { n: 2, label: 'Documents'         },
    { n: 3, label: 'Complete'          },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-[650px] mx-auto px-4 pt-24 pb-20">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">LIST YOUR PLANT</h1>
          <p className="mt-2 text-sm text-slate-500 font-bold">
            Earn from your construction equipment by listing it on LoadAfrica.
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1.5">
                <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                  step >= n ? 'bg-[#f99c00] text-slate-955' : 'bg-slate-200 text-slate-500'
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

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 sm:p-6 space-y-5 text-left">
            {/* Sign in notice */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-[#f99c00] shrink-0" /> Sign in required
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-bold leading-relaxed">
                  Create a free account or sign in so we can link your plant profile to you securely.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')}
                  className="px-5 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs rounded-lg transition-colors">
                  Sign in
                </button>
                <button onClick={() => navigate('/signup')}
                  className="px-5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs rounded-lg bg-white transition-colors">
                  Sign up
                </button>
              </div>
            </div>

            {/* Section heading */}
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide mb-0.5">
                <Wrench className="h-4 w-4 text-[#f99c00]" /> Register Your Machine
              </h3>
              <p className="text-[13px] text-slate-500 font-bold">Tell us about your company and the equipment you'd like to list.</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-bold">{error}</div>
              )}

              {/* Company & Contact row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Company Name *</label>
                  <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="ABC Plant Hire"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Contact Name *</label>
                  <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Email *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Phone *</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+27 ..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Password *</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Confirm Password *</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">ID / Passport Number *</label>
                <input type="text" required value={idNumber} onChange={e => setIdNumber(e.target.value)}
                  placeholder="ID or passport number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
              </div>

              {/* Machine Details divider */}
              <div className="pt-2 border-b border-slate-100 pb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine Details</p>
              </div>

              {/* Equipment type */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Equipment Type *</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm text-left"
                >
                  <span className={equipmentType ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                    {equipmentType || 'Choose equipment'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {EQUIPMENT_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setEquipmentType(t);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[13px] font-bold transition-colors select-none ${
                          equipmentType === t 
                            ? 'bg-[#f99c00] text-slate-955' 
                            : 'text-slate-700 hover:bg-[#f99c00] hover:text-slate-955'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Make & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Make</label>
                  <input type="text" value={make} onChange={e => setMake(e.target.value)}
                    placeholder="CAT, Komatsu..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Model</label>
                  <input type="text" value={model} onChange={e => setModel(e.target.value)}
                    placeholder="320D, PC200..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
              </div>

              {/* Reg/Serial & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Registration / Serial *</label>
                  <input type="text" required value={regSerial} onChange={e => setRegSerial(e.target.value)}
                    placeholder="Reg or serial number"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1">Year</label>
                  <input type="number" min="1990" max="2026" value={year} onChange={e => setYear(e.target.value)}
                    placeholder="2020"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                </div>
              </div>

              {/* Base Location */}
              <div>
                <label className="block text-[12px] font-black uppercase tracking-wide text-slate-700 mb-1 flex items-center gap-1">
                  <span className="text-[#f99c00]">📍</span> Base Location *
                </label>
                <input type="text" required value={baseLocation} onChange={e => setBaseLocation(e.target.value)}
                  placeholder="Start typing the machine's base address..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-55 focus:bg-white text-[13px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f99c00]/30 focus:border-[#f99c00] transition-all shadow-sm" />
                <p className="text-[11px] text-slate-400 mt-1">Pick a suggestion so customers nearby can find your equipment on Google Maps.</p>
              </div>

              <button type="submit"
                className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-sm tracking-widest transition-colors uppercase flex items-center justify-center gap-2 shadow-sm">
                CONTINUE TO DOCUMENTS <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 sm:p-6 space-y-5 text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide mb-0.5">
                <Upload className="h-4 w-4 text-[#f99c00]" /> Documents & Photos
              </h3>
              <p className="text-xs text-slate-500 font-bold">Upload your compliance documents and at least one photo of the machine.</p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-bold">{error}</div>
              )}

              {/* Company Reg Doc */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-2">Company Registration / COR *</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${companyRegDoc ? 'border-[#f99c00] bg-amber-50/40' : 'border-slate-200 hover:border-[#f99c00]/50'}`}
                  onClick={() => document.getElementById('companyRegInput').click()}>
                  <input id="companyRegInput" type="file" accept=".pdf,.jpg,.png" className="hidden"
                    onChange={e => setCompanyRegDoc(e.target.files[0])} />
                  {companyRegDoc ? (
                    <p className="text-sm font-bold text-[#f99c00]">✓ {companyRegDoc.name}</p>
                  ) : (
                    <>
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Click to upload PDF or image</p>
                    </>
                  )}
                </div>
              </div>

              {/* Machine Photo */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-2">Machine Photo *</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${machinePhoto ? 'border-[#f99c00] bg-amber-50/40' : 'border-slate-200 hover:border-[#f99c00]/50'}`}
                  onClick={() => document.getElementById('machinePhotoInput').click()}>
                  <input id="machinePhotoInput" type="file" accept="image/*" className="hidden"
                    onChange={e => setMachinePhoto(e.target.files[0])} />
                  {machinePhoto ? (
                    <p className="text-sm font-bold text-[#f99c00]">✓ {machinePhoto.name}</p>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Upload a clear photo of the machine</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} disabled={submitting}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-55 font-bold rounded-lg text-sm transition-colors bg-white disabled:opacity-50">
                  Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-sm tracking-widest transition-colors uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-slate-955" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3 — Complete ── */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-7 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f99c00]/15">
              <CheckCircle2 className="h-10 w-10 text-[#f99c00]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Application Submitted!</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Our team will review your machine details and contact you within 2 business days to complete verification and go live.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={() => navigate('/yellow-plant')}
                className="px-8 py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-sm tracking-wider transition-colors uppercase">
                Browse Yellow Plant
              </button>
              <button onClick={() => navigate('/')}
                className="px-8 py-3 border border-slate-200 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition-colors">
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer light />
    </div>
  );
}
