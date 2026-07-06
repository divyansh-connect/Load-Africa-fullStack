import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ShieldCheck, Mail, MessageSquare, Phone, Wallet, Calendar, Shield, User, Wrench, Building, MapPin, ArrowRight, Upload, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Card, Input, Select, GooglePlacesInput } from '../components/ui';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const VEHICLE_TYPES = [
  'LDV',
  'Bakkie',
  'Coldroom Bakkie',
  '1-3 Ton Truck',
  'Furniture Truck',
  '4-8 Ton Truck',
  'Box Truck',
  'Flatbed Truck',
  'Dropside Truck',
  'Curtain-Side Truck',
  'Crane Truck',
  'Tipper Truck',
  'Side Tipper',
  'Water Tanker',
  'Fuel Tanker',
];

export default function Drivers() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Personal & Vehicle, 2: Documents, 3: Complete
  const [createdAccount, setCreatedAccount] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'signin'

  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const vehicleDropdownRef = useRef(null);

  useEffect(() => {
    if (window.location.hash === '#onboarding-wizard') {
      setTimeout(() => {
        const el = document.getElementById('onboarding-wizard');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target)) {
        setVehicleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form states
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('+27 82 123 4567');
  const [idNumber, setIdNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('bakkie');
  const [vehicleReg, setVehicleReg] = useState('ABC 123 GP');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  
  // File upload simulation states
  const [licenceUploaded, setLicenceUploaded] = useState(false);
  const [prdpUploaded, setPrdpUploaded] = useState(false);
  const [vehicleDocUploaded, setVehicleDocUploaded] = useState(false);

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    setCreatedAccount(true);
  };

  const handlePersonalVehicleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleDocumentsSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-slate-955">

      <Navbar />

      {/* Hero Header Area */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-4 text-left space-y-6">
        <div className="space-y-4">
          <span className="text-[#f99c00] font-bold text-xs uppercase tracking-wider block">
            FOR DRIVERS
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-955 leading-tight uppercase max-w-4xl tracking-tight">
            DRIVE WITH LOADAFRICA
          </h1>
          <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-3xl">
            Own a bakkie, truck, tipper or tanker? Get on South Africa's logistics load board and start earning across Gauteng, North West (Rustenburg) and Northern Cape.
          </p>
          <a
            href="#onboarding-wizard"
            className="inline-block px-6 py-3.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded text-xs uppercase tracking-wider"
          >
            REGISTER AS DRIVER
          </a>
        </div>

        {/* 3 Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <Card className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-xs rounded-2xl">
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-950">Get Paid Fast</h4>
              <p className="text-xs text-slate-550 leading-relaxed font-normal">
                Trip earnings settle quickly after delivery confirmation.
              </p>
            </div>
          </Card>

          <Card className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-xs rounded-2xl">
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-955">Flexible Loads</h4>
              <p className="text-xs text-slate-555 leading-relaxed font-normal">
                Pick the loads that suit your schedule and routes.
              </p>
            </div>
          </Card>

          <Card className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-xs rounded-2xl">
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-950">Verified Platform</h4>
              <p className="text-xs text-slate-550 leading-relaxed font-normal">
                Real customers, ID-verified bookings, transparent ratings.
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Onboarding Wizard Form Container */}
      <section id="onboarding-wizard" className="max-w-4xl mx-auto px-6 pt-2 pb-4 text-center space-y-6">
        
        {/* Wizard Multi-Step Progress Tracker */}
        <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step === 1 ? 'bg-[#f99c00] text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span className={step === 1 ? 'text-slate-955 font-black' : ''}>Personal & Vehicle</span>
          </div>
          <span className="h-px w-8 bg-slate-200"></span>
          <div className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step === 2 ? 'bg-[#f99c00] text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className={step === 2 ? 'text-slate-955 font-black' : ''}>Documents</span>
          </div>
          <span className="h-px w-8 bg-slate-200"></span>
          <div className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step === 3 ? 'bg-[#f99c00] text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className={step === 3 ? 'text-slate-955 font-black' : ''}>Complete</span>
          </div>
        </div>

        {/* Wizard Card Body — restored p-6 sm:p-8 padding */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 text-left max-w-[622px] mx-auto">
          
          {/* STEP 1: Personal & Vehicle Account setup */}
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <form onSubmit={handlePersonalVehicleSubmit} className="space-y-2">
                
                {/* Account credentials block — bg: #FEFAF2 with light orange border */}
                <div className="space-y-2.5 border border-[#f99c00]/30 pt-3.5 pb-3 px-5 rounded-2xl" style={{ backgroundColor: '#FEFAF2' }}>
                  {authMode === 'signup' ? (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f99c00]/15">
                        <h3 className="font-extrabold text-sm text-slate-900">Create your driver account</h3>
                        <button type="button" onClick={() => setAuthMode('signin')} className="text-xs text-[#f99c00] hover:text-[#e08b00] font-black">Have an account? Sign in</button>
                      </div>
                      
                      <Input 
                        label="Full Name"
                        placeholder="Enter full name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                        className="bg-white border-slate-200 focus:border-amber-500 py-2 text-xs font-semibold shadow-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                          label="Email"
                          placeholder="john@example.com"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="bg-white border-slate-200 focus:border-amber-500 py-2 text-xs font-semibold shadow-sm"
                        />
                        <Input 
                          label="Password"
                          placeholder="Enter secure password"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          className="bg-white border-slate-200 focus:border-amber-500 py-2 text-xs font-semibold shadow-sm"
                        />
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setCreatedAccount(true)}
                        className="w-full py-2 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs tracking-wider uppercase mt-2 shadow-sm"
                      >
                        CREATE ACCOUNT & CONTINUE
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f99c00]/15">
                        <h3 className="font-extrabold text-sm text-slate-900">Sign in to continue</h3>
                        <button type="button" onClick={() => setAuthMode('signup')} className="text-xs text-[#f99c00] hover:text-[#e08b00] font-black">New here? Create account</button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                          label="Email"
                          placeholder="john@example.com"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="bg-white border-slate-200 focus:border-amber-500 py-2 text-xs font-semibold shadow-sm"
                        />
                        <Input 
                          label="Password"
                          placeholder="Enter secure password"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          className="bg-white border-slate-200 focus:border-amber-500 py-2 text-xs font-semibold shadow-sm"
                        />
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setCreatedAccount(true)}
                        className="w-full py-2 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-xs tracking-wider uppercase mt-2 shadow-sm"
                      >
                        SIGN IN & CONTINUE
                      </button>
                    </>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">
                    After this, you'll fill in your details and upload documents.
                  </p>
                </div>

                {/* Full registration form details block */}
                <div className="space-y-4">
                  
                  {/* Account Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                    <div className="h-10 w-10 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900">Become a Driver</h4>
                      <p className="text-[11px] text-slate-500 font-bold">Fill in your personal and vehicle details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input 
                      label="Full Name *"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input 
                      label="Email *"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input 
                      label="Phone Number *"
                      placeholder="+27 XX XXX XXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input 
                      label="ID Number *"
                      placeholder="SA ID Number"
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                      required
                      className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                  </div>

                  {/* Vehicle Info Section */}
                  <div className="space-y-3 pt-1">
                    <h5 className="font-extrabold text-[11px] text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <Truck className="h-3.5 h-3.5 text-[#f99c00]" /> Vehicle Information
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Custom dropdown matching the design */}
                      <div className="relative text-left" ref={vehicleDropdownRef}>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Type *</label>
                        <button
                          type="button"
                          onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
                          className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm text-left"
                        >
                          <span className={vehicleType ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                            {vehicleType ? VEHICLE_TYPES.find(v => v.toLowerCase().replace(/[^a-z0-9]/g, '_') === vehicleType || v === vehicleType) || vehicleType : 'Select vehicle type'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-450 shrink-0" />
                        </button>

                        {vehicleDropdownOpen && (
                          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {VEHICLE_TYPES.map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => {
                                  setVehicleType(v);
                                  setVehicleDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors select-none ${
                                  vehicleType === v 
                                    ? 'bg-[#f99c00] text-slate-955' 
                                    : 'text-slate-700 hover:bg-[#f99c00] hover:text-slate-955'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Input 
                        label="Vehicle Registration *"
                        placeholder="ABC 123 GP"
                        value={vehicleReg}
                        onChange={e => setVehicleReg(e.target.value)}
                        required
                        className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                      />
                    </div>

                    <Input 
                      label="Driver's License Number *"
                      placeholder="License number"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      required
                      className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                  </div>

                  {/* Base Address Autocomplete Section */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/50">
                    <GooglePlacesInput 
                      label="Base Address *"
                      placeholder="Start typing your home/base address..."
                      value={baseAddress}
                      onChange={e => setBaseAddress(e.target.value)}
                      onPlaceSelect={place => setBaseAddress(place.address)}
                      icon={MapPin}
                      required
                      className="border-slate-200 focus:border-amber-500 bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      Pick a suggestion so we can match you with nearby loads on Google Maps.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded-lg text-xs tracking-wider uppercase mt-4 shadow-sm"
                  >
                    CONTINUE TO DOCUMENTS
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Document Upload Setup */}
          {step === 2 && (
            <form onSubmit={handleDocumentsSubmit} className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="h-10 w-10 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-950">Upload Documents</h4>
                  <p className="text-xs text-slate-400 font-bold">Provide verified credentials to get approved</p>
                </div>
              </div>

              {/* Upload Item 1: License */}
              <div className="p-4 border border-dashed border-slate-350 rounded-2xl flex items-center justify-between bg-slate-50/50">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-slate-950">Driver's License *</h5>
                  <p className="text-[10px] text-slate-450 leading-normal font-bold">Front side of SA Driver's License card</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLicenceUploaded(true)}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-colors ${licenceUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}
                >
                  {licenceUploaded ? 'Uploaded ✓' : 'Upload File'}
                </button>
              </div>

              {/* Upload Item 2: PrDP */}
              <div className="p-4 border border-dashed border-slate-350 rounded-2xl flex items-center justify-between bg-slate-50/50">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-slate-955">Professional Driving Permit (PrDP) *</h5>
                  <p className="text-[10px] text-slate-455 leading-normal font-bold">Valid PrDP endorsement page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrdpUploaded(true)}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-colors ${prdpUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}
                >
                  {prdpUploaded ? 'Uploaded ✓' : 'Upload File'}
                </button>
              </div>

              {/* Upload Item 3: Vehicle Docs */}
              <div className="p-4 border border-dashed border-slate-350 rounded-2xl flex items-center justify-between bg-slate-50/50">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-slate-950">Vehicle License Disc *</h5>
                  <p className="text-[10px] text-slate-450 leading-normal font-bold">Clear scan of current vehicle registration paper or windscreen disc</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVehicleDocUploaded(true)}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-colors ${vehicleDocUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}
                >
                  {vehicleDocUploaded ? 'Uploaded ✓' : 'Upload File'}
                </button>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg uppercase"
                >
                  Back to Personal
                </button>
                <button 
                  type="submit"
                  disabled={!licenceUploaded || !prdpUploaded || !vehicleDocUploaded}
                  className={`flex-1 py-3.5 text-xs font-black rounded-lg uppercase tracking-wider transition-colors ${(!licenceUploaded || !prdpUploaded || !vehicleDocUploaded) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#f99c00] hover:bg-[#e08b00] text-slate-950'}`}
                >
                  SUBMIT DOCUMENTS
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Wizard Complete */}
          {step === 3 && (
            <div className="space-y-6 text-center py-6 animate-scaleIn">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 fill-current" />
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-lg text-slate-950 uppercase tracking-tight">Onboarding Submitted Successfully!</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  Your profile credentials, vehicle registrations, and licensing details have been uploaded to our validation center. The Admin panel team will verify your documents within 24 hours.
                </p>
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                GO TO LOGIN PANEL
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer light />
    </div>
  );
}
