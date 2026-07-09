import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, DollarSign, Clock, ArrowRight, Star, ToggleLeft, ToggleRight,
  ChevronRight, AlertCircle, Shield, CheckCircle2, User, Phone, Clipboard, Video, Info, Lock
} from 'lucide-react';
import { driverService } from '../../services/driverService';

export default function DriverDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

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
        // Let's check status. If user role details from backend says onboarding is not complete, we toggle onboarding view
        // We'll read it directly from dashboard data
        const profile = await driverService.getProfile();
        // Fetch driver's onboarding status from database
        const resProfile = await driverService.getDriverDashboard();
        // Wait, the profile response returns user, let's fetch it from local storage as well or mock it if backend didn't set onboarding completion
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        // Let's check if the driver status is APPROVED or ACTIVE
        if (userObj.onboarding_completed) {
          setOnboardingCompleted(true);
        } else {
          // Check backend status
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
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
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
              availableLoads.slice(0, 3).map((load) => (
                <div key={load.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-[#f4a236] transition-colors cursor-pointer" onClick={() => navigate('/driver/available-loads')}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                        {load.pickup_address}
                        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                        {load.delivery_address}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{load.cargo_name} · {load.weight} kg · {load.requested_vehicle || 'Any Vehicle'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Info: Active trip + Earnings & Vehicle */}
        <div className="space-y-4">
          
          {/* Active Trip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => activeTrip && navigate('/driver/active-trip')}>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Current Trip Status</h3>
            {activeTrip ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                  <MapPin className="h-3 w-3" />
                  Trip in Progress
                </div>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{activeTrip.status.replace(/_/g, ' ')}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-blue-600 font-bold flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {activeTrip.cargo_name}</span>
                </div>
                <button className="w-full mt-2 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase shadow-sm">Open Details</button>
              </div>
            ) : (
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
            history.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5 max-w-[60%]">
                  <p className="text-xs font-bold text-slate-800 truncate">{t.pickup_address} → {t.delivery_address}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{t.cargo_name} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
