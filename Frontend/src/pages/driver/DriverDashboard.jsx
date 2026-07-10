import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, DollarSign, Clock, ArrowRight, Star, ToggleLeft, ToggleRight,
  ChevronRight, AlertCircle, Shield, CheckCircle2, User, Phone, Clipboard, Video, Info, Lock, RefreshCw
} from 'lucide-react';
import { driverService } from '../../services/driverService';

export default function DriverDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);

  useEffect(() => {
    const syncStatus = async () => {
      if (isOnline) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setGpsCoords({ lat, lng });
              try {
                await driverService.toggleOnline(true, lat, lng);
              } catch (e) {
                console.error("Failed to update GPS online status", e);
              }
            },
            async () => {
              const lat = -26.2041;
              const lng = 28.0473;
              setGpsCoords({ lat, lng });
              try {
                await driverService.toggleOnline(true, lat, lng);
              } catch (e) {
                console.error("Failed to update GPS fallback status", e);
              }
            }
          );
        }
      } else {
        setGpsCoords(null);
        try {
          await driverService.toggleOnline(false, null, null);
        } catch (e) {
          console.error("Failed to update GPS offline status", e);
        }
      }
    };
    syncStatus();
  }, [isOnline]);

  // Onboarding verification checks (local state for wizard)
  const [onboardingCompleted, setOnboardingCompleted] = useState(true); // default true, loaded from profile
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [trainingSlide, setTrainingSlide] = useState(0);
  const [trainingFinished, setTrainingFinished] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // We will first fetch the driver profile to check onboarding completion
      const profileRes = await driverService.getProfile();
      // Wait, we need to check if profile onboarding is complete. Let's fetch dashboard stats
      const [dashRes, tripRes, loadsRes, histRes] = await Promise.all([
        driverService.getDriverDashboard(),
        driverService.getActiveTrip(),
        driverService.getAvailableLoads(),
        driverService.getDriverHistory()
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes.data);
        setIsOnline(dashRes.data.currentStatus === 'AVAILABLE');
        
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        if (userObj.onboarding_completed) {
          setOnboardingCompleted(true);
        } else {
          setOnboardingCompleted(userObj.onboarding_completed || false);
        }
      }

      if (tripRes.success) setActiveTrip(tripRes.data);
      if (loadsRes.success) setAvailableLoads(loadsRes.data);
      if (histRes.success) setHistory(histRes.data);

    } catch (err) {
      console.error("Failed to load driver dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcceptAssignment = async () => {
    try {
      setLoading(true);
      const res = await driverService.acceptAssignment(activeTrip.id);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert("Failed to accept assignment: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleRejectAssignment = async () => {
    try {
      setLoading(true);
      const res = await driverService.rejectAssignment(activeTrip.id);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert("Failed to reject assignment: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleVerifyPhone = () => {
    if (phoneOtp === '1234') {
      setOtpVerified(true);
      alert("Mobile number verified successfully!");
    } else {
      alert("Invalid verification code. Please enter '1234' for demo verification.");
    }
  };

  const handleEnableGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsEnabled(true);
          alert(`GPS Activated: Lat ${position.coords.latitude.toFixed(4)}, Lng ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          alert("Could not access browser location. Please enable location permissions.");
        }
      );
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      setLoading(true);
      const res = await driverService.completeOnboarding();
      if (res.success) {
        // Update user state in localStorage
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        userObj.onboarding_completed = true;
        localStorage.setItem('user', JSON.stringify(userObj));
        
        setOnboardingCompleted(true);
        fetchDashboardData();
      }
    } catch (err) {
      alert("Failed to save onboarding checklist status.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" /> Connecting to command center...
      </div>
    );
  }

  // Render Onboarding flow if not complete
  if (!onboardingCompleted) {
    const trainingSlides = [
      "Welcome to LoadAfrica! In this module you will learn to receive, update, and complete loads safely.",
      "Always verify cargo parameters and container seal integrity at the shipper pickup point before starting the trip.",
      "Provide real-time updates inside the App when you reach the pickup, start moving, or arrive at destination.",
      "Submit digital POD (Proof Of Delivery) copies instantly with shipper sign-off to request swift earnings release."
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-6 animate-fadeIn pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Driver First-Login Onboarding</h2>
            <p className="text-xs text-slate-500 font-semibold">Complete the compliance checklist to activate your driver dashboard.</p>
          </div>

          {/* Steps tracker */}
          <div className="flex justify-between items-center px-4">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                onClick={() => setOnboardingStep(num)}
                className={`h-7 w-7 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                  onboardingStep === num
                    ? 'bg-amber-500 text-slate-950 font-black scale-110 shadow-md'
                    : onboardingStep > num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl min-h-[160px]">
            {/* Step 1: Complete Profile */}
            {onboardingStep === 1 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><User className="h-4 w-4 text-amber-500" /> Step 1: Profile Verification</h3>
                <p className="text-xs text-slate-500 font-semibold">Confirm your registration details are correct:</p>
                <div className="space-y-1.5 text-xs text-slate-700 font-bold bg-white p-3 border border-slate-150 rounded-lg">
                  <p>Name: {dashboardData?.driverName || "Driver Name"}</p>
                  <p>Vehicle Assigned: {dashboardData?.vehicle ? `${dashboardData.vehicle.manufacturer} ${dashboardData.vehicle.model}` : "Pending Assignment"}</p>
                  <p>Fleet Manager: {dashboardData?.fleetOwner || "Independent"}</p>
                </div>
                <button onClick={() => setOnboardingStep(2)} className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-955 text-xs font-black uppercase rounded-lg shadow-sm">Verify & Next</button>
              </div>
            )}

            {/* Step 2: Complete KYC */}
            {onboardingStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Clipboard className="h-4 w-4 text-indigo-500" /> Step 2: KYC Compliance Validation</h3>
                <p className="text-xs text-slate-500 font-semibold">Your driver credentials and compliance files have been successfully validated by the administration center.</p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> Verified: National ID, License Disc, and COF roadworthy clearance.
                </div>
                <button onClick={() => setOnboardingStep(3)} className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-955 text-xs font-black uppercase rounded-lg shadow-sm">Proceed to Next Step</button>
              </div>
            )}

            {/* Step 3: Verify Phone */}
            {onboardingStep === 3 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-4 w-4 text-blue-500" /> Step 3: Mobile Number Validation</h3>
                <p className="text-xs text-slate-500 font-semibold">Enter the verification code sent to your registered mobile device:</p>
                
                {otpVerified ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> Phone verification code confirmed.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code '1234' for demo"
                      value={phoneOtp}
                      onChange={e => setPhoneOtp(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold w-48 bg-white focus:outline-none"
                    />
                    <button onClick={handleVerifyPhone} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase shadow">Verify</button>
                  </div>
                )}
                <button disabled={!otpVerified} onClick={() => setOnboardingStep(4)} className={`mt-3 px-4 py-2 text-xs font-black uppercase rounded-lg shadow-sm ${otpVerified ? 'bg-amber-500 hover:bg-amber-600 text-slate-955 cursor-pointer' : 'bg-slate-200 text-slate-450 cursor-not-allowed border border-slate-300'}`}>Continue</button>
              </div>
            )}

            {/* Step 4: Enable GPS */}
            {onboardingStep === 4 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-500" /> Step 4: Geolocation Activation</h3>
                <p className="text-xs text-slate-500 font-semibold">Enable GPS tracking to automatically match with shippers and receive navigation routes:</p>
                {gpsEnabled ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> Geolocation permissions active.
                  </div>
                ) : (
                  <button onClick={handleEnableGPS} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg uppercase shadow">Activate GPS Link</button>
                )}
                <button disabled={!gpsEnabled} onClick={() => setOnboardingStep(5)} className={`mt-3 px-4 py-2 text-xs font-black uppercase rounded-lg shadow-sm ${gpsEnabled ? 'bg-amber-500 hover:bg-amber-600 text-slate-955 cursor-pointer' : 'bg-slate-200 text-slate-450 cursor-not-allowed border border-slate-300'}`}>Continue</button>
              </div>
            )}

            {/* Step 5: Accept Terms */}
            {onboardingStep === 5 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Info className="h-4 w-4 text-orange-500" /> Step 5: Terms & Conditions</h3>
                <p className="text-xs text-slate-500 font-semibold">Scroll through and accept the platform logistics service provider terms:</p>
                <div className="border border-slate-250 bg-white p-3 rounded-lg text-[10px] text-slate-500 font-bold h-24 overflow-y-auto leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam pulvinar eros non nibh placerat congue. Suspendisse potenti. Nam convallis feugiat finibus. Curabitur vel tristique dui. Quisque volutpat dolor sed nisi tristique tempor. Integer a risus sem. Phasellus interdum risus feugiat feugiat rhoncus.
                </div>
                <label className="flex items-center gap-2.5 p-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-xs text-slate-700 font-bold">I accept LoadAfrica Terms of Service</span>
                </label>
                <button disabled={!termsAccepted} onClick={() => setOnboardingStep(6)} className={`mt-3 px-4 py-2 text-xs font-black uppercase rounded-lg shadow-sm ${termsAccepted ? 'bg-amber-500 hover:bg-amber-600 text-slate-955 cursor-pointer' : 'bg-slate-200 text-slate-450 cursor-not-allowed border border-slate-300'}`}>Continue</button>
              </div>
            )}

            {/* Step 6: Complete Training */}
            {onboardingStep === 6 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Video className="h-4 w-4 text-purple-500" /> Step 6: Driver Safety Training</h3>
                <p className="text-xs text-slate-500 font-semibold">Read safety slide {trainingSlide + 1} of {trainingSlides.length}:</p>
                
                <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs font-semibold italic text-slate-650 leading-relaxed min-h-[60px]">
                  "{trainingSlides[trainingSlide]}"
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Progress: {Math.round(((trainingSlide + 1) / trainingSlides.length) * 100)}%</span>
                  <div className="flex gap-2">
                    <button
                      disabled={trainingSlide === 0}
                      onClick={() => setTrainingSlide(prev => prev - 1)}
                      className="px-2.5 py-1 border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-white disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {trainingSlide < trainingSlides.length - 1 ? (
                      <button
                        onClick={() => setTrainingSlide(prev => prev + 1)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700"
                      >
                        Next Slide
                      </button>
                    ) : (
                      <button
                        onClick={() => { setTrainingFinished(true); alert("Safety training completed!"); }}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                      >
                        Finish Training
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {onboardingStep === 6 && trainingFinished && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleFinishOnboarding}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                Activate Driver Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active dashboard statistics
  const stats = [
    { label: 'Active Trip', value: activeTrip ? '1' : '0', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed Loads', value: dashboardData?.completedLoads || '0', icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Earnings', value: `R ${parseFloat(dashboardData?.walletBalance || 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Driver Rating', value: `${dashboardData?.ratings || '5.0'} ★`, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">

      {/* Welcome + Online toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-350 bg-slate-200">
            {dashboardData?.driverPhoto ? (
              <img src={`${import.meta.env.VITE_API_URL}${dashboardData.driverPhoto}`} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">U</div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Driver Command Center
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 tracking-wide uppercase select-none">
                {dashboardData?.verificationBadge}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isOnline ? 'You are online — matching with live loads.' : 'You are offline — go online to receive loads.'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
            isOnline
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 cursor-pointer'
              : 'bg-slate-200 text-slate-600 border-slate-300 cursor-pointer'
          }`}
        >
          {isOnline ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Available Loads seeking drivers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Telemetry Radar Map */}
          {isOnline && (
            <div className="bg-slate-955 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[280px] relative text-left">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-850/80 text-white flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-xs">GPS Telemetry - Route Assistant</span>
                </div>
                {gpsCoords && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {gpsCoords.lat.toFixed(4)}° S, {gpsCoords.lng.toFixed(4)}° E
                  </span>
                )}
              </div>

              {activeTrip?.assignmentStatus === 'PENDING' ? (
                // Pending Assignment View
                <div className="flex-1 flex flex-col justify-center items-center p-5 relative z-10 text-center space-y-3 bg-slate-900/80 backdrop-blur-sm">
                  <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/50 animate-pulse">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">New Load Assignment</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please accept to view details and start navigation.</p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3 w-full border border-slate-700 text-left space-y-1">
                    <p className="text-sm font-bold text-white">{activeTrip.cargo_name} <span className="text-amber-500 text-[10px]">({activeTrip.weight} kg)</span></p>
                    <p className="text-[10px] text-slate-400 truncate">{activeTrip.pickup_address?.split(',')[0]} → {activeTrip.delivery_address?.split(',')[0]}</p>
                  </div>
                  <div className="flex gap-3 w-full pt-2">
                    <button onClick={handleRejectAssignment} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase rounded-xl border border-slate-700">Decline</button>
                    <button onClick={handleAcceptAssignment} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl shadow-lg shadow-emerald-500/20">Accept Load</button>
                  </div>
                </div>
              ) : activeTrip ? (
                // Active trip route view
                <div className="flex-1 flex flex-col justify-between p-5 relative z-10">
                  <div className="space-y-1">
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded uppercase tracking-wider border border-amber-500/20">
                      Active Cargo Transit Route
                    </span>
                    <h4 className="text-sm font-black text-white">{activeTrip.cargo_name} ({activeTrip.weight} kg)</h4>
                    <p className="text-[10px] text-slate-450 truncate font-semibold">
                      {activeTrip.pickup_address?.split(',')[0]} → {activeTrip.delivery_address?.split(',')[0]}
                    </p>
                  </div>

                  <svg className="w-full h-20" viewBox="0 0 400 80">
                    <circle cx="50" cy="40" r="5" className="fill-emerald-500 stroke-emerald-500/30 stroke-8" />
                    <text x="50" y="25" className="fill-slate-400 font-bold text-[9px]" textAnchor="middle">Pickup</text>

                    <circle cx="350" cy="40" r="5" className="fill-amber-500 stroke-amber-500/30 stroke-8" />
                    <text x="350" y="25" className="fill-slate-400 font-bold text-[9px]" textAnchor="middle">Delivery</text>

                    <line x1="50" y1="40" x2="350" y2="40" stroke="#334155" strokeWidth="3" strokeDasharray="5,5" />
                    
                    {/* Moving truck indicator */}
                    <g transform="translate(170, 30)">
                      <rect x="0" y="4" width="20" height="12" rx="2" className="fill-amber-500" />
                      <circle cx="5" cy="18" r="2" className="fill-slate-900" />
                      <circle cx="15" cy="18" r="2" className="fill-slate-900" />
                    </g>
                  </svg>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-450 font-semibold">Status: <span className="text-amber-500 font-bold uppercase">{activeTrip.status.replace(/_/g, ' ')}</span></span>
                    <button onClick={() => navigate('/driver/active-trip')} className="px-3.5 py-1.5 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-xl border border-slate-700">Open Map Navigation</button>
                  </div>
                </div>
              ) : (
                // Radar searching view
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 relative z-10">
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <div className="absolute inset-0 h-full w-full rounded-full border border-emerald-500/10 animate-ping" />
                    <div className="absolute inset-2 h-16 w-16 rounded-full border border-emerald-500/20 animate-pulse" />
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                      <Truck className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="text-center space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">Active Live Matching Radar</h4>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Broadcasting live coordinates to brokers. Waiting for load assignments near you...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Live Matching Loads ({dashboardData?.availableLoads || 0})</h2>
            <button onClick={() => navigate('/driver/available-loads')} className="text-[10px] font-black text-amber-600 flex items-center gap-1 uppercase tracking-wide hover:text-amber-700">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {availableLoads.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-250 rounded-2xl text-slate-500 text-xs font-semibold leading-relaxed">
                No matching loads currently. We will notify you when a load is available.
              </div>
            ) : (
              availableLoads.slice(0, 3).map((load) => {
                const cust = load.customer;
                const custName = cust?.user?.first_name
                  ? `${cust.user.first_name} ${cust.user.last_name || ''}`
                  : cust?.company_name || load.guest_company || load.guest_email?.split('@')[0] || 'Customer';
                return (
                <div key={load.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-[#f4a236] transition-colors cursor-pointer" onClick={() => navigate('/driver/available-loads')}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{custName}</span>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-2 text-[11px]">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-semibold truncate">{load.pickup_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-slate-700 font-semibold truncate">{load.delivery_address}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{load.cargo_name} · {load.weight} kg · {load.requested_vehicle || 'Any Vehicle'}</p>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Info: Active trip + Earnings & Vehicle */}
        <div className="space-y-4">
          
          {/* Active Trip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => activeTrip && navigate('/driver/active-trip')}>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Current Trip Status</h3>
            {activeTrip?.assignmentStatus === 'PENDING' ? (() => {
              const cust = activeTrip.customer;
              const custName = cust?.user?.first_name
                ? `${cust.user.first_name} ${cust.user.last_name || ''}`
                : cust?.company_name || activeTrip.guest_company || activeTrip.guest_email || 'Customer';
              return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <AlertCircle className="h-3.5 w-3.5" />
                  New Load Assignment — Action Required
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-amber-600" />
                  <span className="font-bold text-slate-800">{custName}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-semibold truncate">{activeTrip.pickup_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-slate-700 font-semibold truncate">{activeTrip.delivery_address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-amber-700 font-semibold">
                  <span>{activeTrip.cargo_name}</span>
                  <span>·</span>
                  <span>{activeTrip.weight} kg</span>
                  <span>·</span>
                  <span>{activeTrip.requested_vehicle || 'Any Vehicle'}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={(e) => { e.stopPropagation(); handleAcceptAssignment(); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase shadow-sm cursor-pointer transition-colors">Accept</button>
                  <button onClick={(e) => { e.stopPropagation(); handleRejectAssignment(); }} className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors">Reject</button>
                </div>
              </div>
              );
            })() : activeTrip ? (() => {
              const cust = activeTrip.customer;
              const custName = cust?.user?.first_name
                ? `${cust.user.first_name} ${cust.user.last_name || ''}`
                : cust?.company_name || activeTrip.guest_company || activeTrip.guest_email || 'Customer';
              return (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                  <MapPin className="h-3 w-3" />
                  Trip in Progress
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-blue-600" />
                  <span className="font-bold text-slate-800">{custName}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">{activeTrip.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-semibold truncate">{activeTrip.pickup_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-slate-700 font-semibold truncate">{activeTrip.delivery_address}</span>
                  </div>
                </div>
                <p className="text-[10px] text-blue-600 font-semibold">{activeTrip.cargo_name} · {activeTrip.weight} kg</p>
                <button className="w-full mt-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase shadow-sm">Open Trip Details</button>
              </div>
              );
            })() : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2">
                <Truck className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-[10px] text-slate-500 font-medium">No active trips currently. Apply for a load to start earning.</p>
              </div>
            )}
          </div>

          {/* Vehicle specifications */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Active Vehicle</h3>
            {dashboardData?.vehicle ? (
              <div className="text-xs space-y-1 text-slate-600 font-semibold">
                <p className="text-slate-900 font-bold">{dashboardData.vehicle.manufacturer} {dashboardData.vehicle.model}</p>
                {dashboardData.vehicle.reg && <p>Registration: {dashboardData.vehicle.reg}</p>}
                {dashboardData.fleetOwner && <p className="text-[10px] text-indigo-600 font-black">Fleet Company: {dashboardData.fleetOwner}</p>}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 font-bold leading-normal">No vehicle assigned yet. Shippers require a verified vehicle disc to assign loads.</p>
            )}
          </div>

          {/* Withdraw Balance Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">Wallet Balance</h3>
            <p className="text-2xl font-black text-emerald-600">R {parseFloat(dashboardData?.walletBalance || 0).toFixed(2)}</p>
            <button onClick={() => navigate('/driver/earnings')} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer">
              Withdraw Earnings
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-850 uppercase tracking-wide">Trip Delivery History</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-bold">No completed trips yet.</div>
          ) : (
            history.slice(0, 5).map((t) => {
              const cust = t.customer;
              const custName = cust?.user?.first_name
                ? `${cust.user.first_name} ${cust.user.last_name || ''}`
                : cust?.company_name || t.guest_company || 'Customer';
              return (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5 max-w-[60%]">
                  <p className="text-xs font-bold text-slate-800 truncate">{custName} — {t.pickup_address} → {t.delivery_address}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{t.cargo_name} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
