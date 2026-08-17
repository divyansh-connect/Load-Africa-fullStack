import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ArrowRight, Star, ChevronDown, CheckCircle2, ShieldCheck,
  MapPin, Scale, MessageSquare, Phone, Mail, Building, Plus, UserCheck, Users,
  Play, Zap, Shield, FileText, Bike, Car, HardHat, Hammer, Trash, Sofa, Milestone, Droplet, Compass, X
} from 'lucide-react';
import { Button, Input, Select, Card, GooglePlacesInput } from '../components/ui';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [pickupDetails, setPickupDetails] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [dropoffDetails, setDropoffDetails] = useState(null);
  const [vehicle, setVehicle] = useState('');
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [cargoType, setCargoType] = useState('');
  const [weight, setWeight] = useState('');
  const [radius, setRadius] = useState(50);
  const [quoteResult, setQuoteResult] = useState(null);

  // Stepper flow states
  const [currentStep, setCurrentStep] = useState(1); // 1: Book, 2: Quote, 3: Details, 4: Success
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Customer/Payment Details state
  const [customerName, setCustomerName] = useState('Patrice Motsepe');
  const [customerEmail, setCustomerEmail] = useState('patrice@arm.co.za');
  const [customerPhone, setCustomerPhone] = useState('+27 82 123 4567');

  // Credit Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // FAQ accordion states
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Validation & Get Quotation
  const handleGetQuote = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff || !vehicle) {
      alert('Please fill in Pickup Location, Delivery Location and Vehicle Type.');
      return;
    }

    const mockDistance = Math.floor(50 + Math.random() * 450);
    let multiplier = 1.0;
    if (vehicle.toLowerCase().includes('bakkie')) multiplier = 0.5;
    else if (vehicle.toLowerCase().includes('tipper')) multiplier = 1.2;
    else if (vehicle.toLowerCase().includes('tanker')) multiplier = 1.3;
    else if (vehicle.toLowerCase().includes('plant')) multiplier = 1.5;

    const basePrice = Math.round(mockDistance * 18 * multiplier);

    setQuoteResult({
      distance: `${mockDistance} km`,
      estimate: basePrice,
      duration: `${Math.round(mockDistance / 60) + 1} hours`
    });
    setCurrentStep(2);
  };

  const handlePayClick = (e) => {
    e.preventDefault();
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaymentModalOpen(false);
      setCurrentStep(4);
    }, 1500);
  };

  const resetBookingWizard = () => {
    setPickup('');
    setDropoff('');
    setVehicle('');
    setCargoType('');
    setRadius(50);
    setQuoteResult(null);
    setCurrentStep(1);
  };

  const servicesList = [
    {
      title: 'Courier & Same-Day',
      desc: 'Bakkies for parcels, e-commerce and small business deliveries.',
      icon: Bike
    },
    {
      title: 'Furniture Removals',
      desc: 'Home and office moves with furniture trucks and trained crews.',
      icon: Sofa
    },
    {
      title: 'Sand & Rubble Removal',
      desc: 'Site clearing, rubble removal and sand delivery with tippers and skips.',
      icon: Trash
    },
    {
      title: 'Construction Loads',
      desc: 'Stone, cement and building material with tippers and flatbeds.',
      icon: Hammer
    },
    {
      title: '4-Ton & 8-Ton Trucks',
      desc: 'Pallet loads, retail distribution and heavier business cargo.',
      icon: Truck
    },
    {
      title: 'Side Tippers',
      desc: 'Bulk mining and aggregate haulage across SA.',
      icon: Milestone
    }
  ];

  const vehiclesList = [
    { name: 'Motorbike', capacity: '10 kg', use: 'Fast same-day courier for documents and small parcels', icon: Bike },
    { name: 'Small Car', capacity: '80 kg', use: 'Courier runs for parcels, groceries and light cargo', icon: Car },
    { name: 'LDV', capacity: '1.5-3.5 tons', use: 'General utility deliveries, tools, and medium-scale cargo', icon: Truck },
    { name: 'Bakkie', capacity: '500-1000 kg', use: 'Multi-purpose delivery vehicle for parcels, home moves, and retail', icon: Truck },
    { name: 'Coldroom Bakkie', capacity: '500-1000 kg', use: 'Temperature-controlled transport for perishables and food cargo', icon: Truck },
    { name: '1-3 Ton Truck', capacity: '1-3 tons', use: 'Light distribution and closed transit for retail products', icon: Truck },
    { name: 'Furniture Truck', capacity: '3-5 tons', use: 'Spacious box truck optimized for household and office moves', icon: Sofa },
    { name: '4-8 Ton Truck', capacity: '4-8 tons', use: 'Large capacity transport for heavy pallets and corporate logistics', icon: Truck },
    { name: 'Box Truck', capacity: '4-8 tons', use: 'Enclosed cargo for secure, weather-protected deliveries', icon: Truck },
    { name: 'Flatbed Truck', capacity: '8-30 tons', use: 'Oversized, irregular, or crane-loaded freight', icon: Truck },
    { name: 'Dropside Truck', capacity: '3-8 tons', use: 'Open-top loads with fold-down sides for easy access', icon: Truck },
    { name: 'Curtain-Side Truck', capacity: '8-14 tons', use: 'General palletized freight where side-loading with forklifts is necessary', icon: Truck },
    { name: 'Crane Truck', capacity: '5-15 tons', use: 'Mounted crane for heavy lifting on project sites — self-load and unload building materials', icon: Truck },
    { name: 'Tipper Truck', capacity: '10-15 tons', use: 'Bulk material hauling for site sand, gravel, and construction aggregates', icon: Truck },
    { name: 'Side Tipper', capacity: '20-34 tons', use: 'Heavy bulk mining aggregate, ore, and sand transit', icon: Milestone },
    { name: 'Water Tanker', capacity: '8-18 kL', use: 'Water supply hauling for construction sites, events, or agriculture', icon: Droplet },
    { name: 'Fuel Tanker', capacity: '20-40 kL', use: 'Safe commercial transport for fuels, oils, and bulk industrial liquids', icon: Droplet }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-slate-950">

      <Navbar />

      {/* Hero Section */}
      <div 
        className="relative z-10 text-white w-full overflow-hidden border-b border-slate-900 bg-cover bg-center py-12 lg:py-16 mt-20"
        style={{ 
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?w=1600&q=80')`
        }}
      >
        <section className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left info column */}
          <div className="text-left space-y-6 lg:col-span-6">
            <span className="text-[#EF9A30] font-bold text-xs uppercase tracking-wider block">
              LOADAFRICA LOGISTICS — SOUTH AFRICA
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight max-w-2xl">
              Book Bakkies, Trucks & Transport Across South Africa
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              Bakkie hire, truck hire, load board, furniture removal and business deliveries in Gauteng, North West (Rustenburg) and Northern Cape — instant quotes, verified drivers, insured loads.
            </p>

            {/* Grid of four actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookingModalOpen(true);
                }}
                className="px-4 py-3 bg-[#EF9A30] hover:bg-[#e08b00] text-slate-900 font-bold rounded-lg text-center text-xs tracking-wider transition-colors uppercase shadow-sm"
              >
                Book a Load
              </button>
              <button
                onClick={() => navigate('/drivers#onboarding-wizard')}
                className="px-4 py-3 bg-slate-900/70 hover:bg-slate-800 border border-slate-600 text-white font-bold rounded-lg text-center text-xs tracking-wider transition-colors uppercase shadow-sm"
              >
                Register as Driver
              </button>
              <button
                onClick={() => navigate('/yellow-plant')}
                className="px-4 py-3 bg-[#EF9A30] hover:bg-[#e08b00] text-slate-900 font-bold rounded-lg text-center text-xs tracking-wider transition-colors uppercase shadow-sm"
              >
                Yellow Plant Hire
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-3 bg-slate-900/70 hover:bg-slate-800 border border-slate-600 text-white font-bold rounded-lg text-center text-xs tracking-wider transition-colors uppercase shadow-sm"
              >
                Courier Service
              </button>
            </div>
          </div>


          {/* Right Image column */}
          <div className="lg:col-span-6 relative hidden lg:block cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setIsBookingModalOpen(true)}>
            <img 
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" 
              alt="Logistics Truck" 
              className="rounded-3xl shadow-2xl border border-white/20 w-full h-[520px] object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent rounded-3xl flex flex-col justify-end p-10">
               <h3 className="text-white text-3xl font-black uppercase mb-2 drop-shadow-lg">Ready to move?</h3>
               <p className="text-slate-200 font-medium text-sm max-w-sm drop-shadow">Click here to get an instant quote and book verified transport across South Africa in minutes.</p>
            </div>
          </div>

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl mx-auto my-auto animate-scaleIn">
            {/* Close button */}
            <button 
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          {/* Right quotation card column */}
          <div id="quote-card" className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-left border border-slate-100 text-slate-900 relative z-10">
              <h3 className="text-lg font-black text-slate-955 uppercase tracking-tight">
                BOOK TRANSPORT
              </h3>
              
              {/* Step counter */}
              <div className="flex items-center gap-2 my-5">
                <div className="flex items-center gap-2">
                  <span className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center shadow-md ${currentStep >= 1 ? 'bg-[#EF9A30] text-white' : 'bg-slate-100 text-slate-400 border border-slate-300'}`}>1</span>
                  <span className={`h-0.5 w-6 ${currentStep >= 2 ? 'bg-[#EF9A30]' : 'bg-slate-300'}`}></span>
                  <span className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center ${currentStep >= 2 ? 'bg-[#EF9A30] text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-300'}`}>2</span>
                  <span className={`h-0.5 w-6 ${currentStep >= 3 ? 'bg-[#EF9A30]' : 'bg-slate-300'}`}></span>
                  <span className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center ${currentStep >= 3 ? 'bg-[#EF9A30] text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-300'}`}>3</span>
                  <span className={`h-0.5 w-6 ${currentStep >= 4 ? 'bg-[#EF9A30]' : 'bg-slate-300'}`}></span>
                  <span className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center ${currentStep >= 4 ? 'bg-[#EF9A30] text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-300'}`}>4</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 ml-1">
                  {currentStep === 1 && 'Enter details'}
                  {currentStep === 2 && 'Quotation'}
                  {currentStep === 3 && 'Payment'}
                  {currentStep === 4 && 'Complete'}
                </span>
              </div>

              {/* STEP 1: Enter details */}
              {currentStep === 1 && (
                <form onSubmit={handleGetQuote} className="space-y-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-[#EF9A30]" /> Pickup Location
                    </label>
                    <GooglePlacesInput
                      placeholder="Search pickup address in South Africa..."
                      value={pickup}
                      onChange={e => setPickup(e.target.value)}
                      onPlaceSelect={place => {
                        setPickup(place.address);
                        setPickupDetails(place);
                      }}
                      className="bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#EF9A30] focus:ring-[#EF9A30] rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-[#EF9A30]" /> Delivery Location
                    </label>
                    <GooglePlacesInput
                      placeholder="Search delivery address in South Africa..."
                      value={dropoff}
                      onChange={e => setDropoff(e.target.value)}
                      onPlaceSelect={place => {
                        setDropoff(place.address);
                        setDropoffDetails(place);
                      }}
                      className="bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#EF9A30] focus:ring-[#EF9A30] rounded-md"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Truck className="h-3.5 w-3.5 text-[#EF9A30]" /> Vehicle Type
                    </label>
                    <button
                      type="button"
                      onClick={() => setVehicleOpen(!vehicleOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md border text-xs font-bold transition-all text-left ${
                        vehicle
                          ? 'border-[#EF9A30] text-slate-800 bg-white'
                          : 'border-slate-300 text-slate-400 bg-white'
                      }`}
                    >
                      <span>{vehicle || 'Select vehicle type'}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${vehicleOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {vehicleOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {['LDV','Bakkie','Coldroom Bakkie','1-3 Ton Truck','Furniture Truck','4-8 Ton Truck','Box Truck','Flatbed Truck','Dropside Truck','Curtain-Side Truck','Crane Truck','Tipper Truck','Side Tipper','Water Tanker','Fuel Tanker'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => { setVehicle(v); setVehicleOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors border-b border-slate-100 last:border-b-0 ${
                              vehicle === v
                                ? 'bg-orange-50 text-[#EF9A30]'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Truck className="h-3.5 w-3.5 text-[#EF9A30]" /> Cargo Type <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <Input
                      placeholder="e.g., Furniture, Building materials"
                      type="text"
                      value={cargoType}
                      onChange={e => setCargoType(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#EF9A30] focus:ring-[#EF9A30] rounded-md"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Compass className="h-3.5 w-3.5 text-[#EF9A30]" /> Match radius
                      </label>
                      <span className="text-xs font-bold text-[#EF9A30]">{radius} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="150" 
                      value={radius} 
                      onChange={(e) => setRadius(e.target.value)} 
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #EF9A30 0%, #EF9A30 ${((radius - 10) / 140) * 100}%, #d1d5db ${((radius - 10) / 140) * 100}%, #d1d5db 100%)`
                      }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal font-bold">
                    We'll notify drivers, fleets and plant owners within {radius} km of your pickup.
                  </p>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
                  >
                    <FileText className="h-4 w-4" />
                    GET QUOTATION
                  </button>
                </form>
              )}

              {/* STEP 2: Quotation */}
              {currentStep === 2 && quoteResult && (
                <div className="space-y-5 py-2 animate-scaleIn text-xs">
                  {/* Route Map Placeholder */}
                  <div className="bg-slate-100 rounded-xl h-28 flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/50 via-slate-100 to-slate-100"></div>
                    <MapPin className="h-6 w-6 text-amber-500 animate-bounce relative z-10" />
                    <span className="text-[10px] text-slate-400 font-bold mt-1 relative z-10">Route Polyline Map Active</span>
                  </div>

                  {/* Summary Details */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Pickup Address:</span>
                      <span className="text-slate-800 font-extrabold truncate max-w-[200px]">{pickup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Delivery Address:</span>
                      <span className="text-slate-800 font-extrabold truncate max-w-[200px]">{dropoff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Distance:</span>
                      <span className="text-slate-800 font-extrabold">{quoteResult.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Travel Time:</span>
                      <span className="text-slate-800 font-extrabold">{quoteResult.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Vehicle Class:</span>
                      <span className="text-slate-800 font-extrabold">{vehicle}</span>
                    </div>
                    {cargoType && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Cargo Type:</span>
                        <span className="text-slate-800 font-extrabold">{cargoType}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-slate-900 font-black text-sm">Estimated Total (ZAR):</span>
                      <strong className="text-amber-600 text-lg font-black">R{quoteResult.estimate}</strong>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-55 text-slate-650 text-xs font-bold rounded transition-colors uppercase font-mono"
                    >
                      Edit Details
                    </button>
                    <button 
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 text-xs font-bold rounded transition-colors uppercase tracking-wider"
                    >
                      Pay & Book
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Details */}
              {currentStep === 3 && quoteResult && (
                <div className="space-y-4 py-2 animate-scaleIn text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                    <p className="text-slate-500 font-bold">Booking Amount due:</p>
                    <h3 className="text-2xl font-black text-amber-600">R{quoteResult.estimate}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">Free cancellation within 1 hour</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-bold">Full Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold bg-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-bold">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold bg-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-bold">Phone Number</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold bg-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded transition-colors uppercase"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="flex-1 py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-bold rounded transition-colors uppercase tracking-wider"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Successful Payment */}
              {currentStep === 4 && (
                <div className="space-y-5 py-4 text-center animate-scaleIn">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Booking Successful!</h3>
                    <p className="text-xs text-slate-500 font-bold">Your vehicle assignment and load details are confirmed.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Reference Number:</span>
                      <strong className="text-slate-800 font-black">LA-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Vehicle Class:</span>
                      <strong className="text-slate-800 font-black">{vehicle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Paid (ZAR):</span>
                      <strong className="text-emerald-600 font-black">R{quoteResult?.estimate}</strong>
                    </div>
                  </div>

                  <button
                    onClick={resetBookingWizard}
                    className="w-full py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-bold rounded text-xs uppercase tracking-wider transition-colors"
                  >
                    Book another cargo
                  </button>
                </div>
              )}

            </div>
          </div>


          </div>
        </div>
      )}

          {/* Secure Payment Gateway Modal */}
          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white border border-slate-200 shadow-2xl p-8 rounded-2xl w-full max-w-sm text-slate-900 space-y-5 animate-scaleIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black uppercase text-slate-950">Secure Payment</h3>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-800">Cancel</button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Amount to pay (ZAR):</span>
                  <span className="font-extrabold text-amber-600">R{quoteResult?.estimate}</span>
                </div>

                <form onSubmit={handlePayClick} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-bold">Card Number</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-bold">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-amber-500 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-bold">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength="3"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        required
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-amber-500 text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isPaying ? 'Processing Payment...' : `Pay R${quoteResult?.estimate}`}
                  </button>
                </form>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* Why Choose Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center space-y-12 bg-white">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
            WHY CHOOSE LOADAFRICA
          </h2>
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">
            Reliable. Transparent. Efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border border-slate-200/60 p-8 text-center space-y-4 shadow-xs rounded-2xl flex flex-col items-center max-w-sm mx-auto">
            <div className="h-16 w-16 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <h4 className="font-extrabold text-slate-950 text-base">Instant Booking</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Get instant pricing and book your transport in minutes. No phone calls, no waiting.
            </p>
          </Card>

          <Card className="bg-white border border-slate-200/60 p-8 text-center space-y-4 shadow-xs rounded-2xl flex flex-col items-center max-w-sm mx-auto">
            <div className="h-16 w-16 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center mb-2">
              <MapPin className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-950 text-base">Live Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Track your cargo in real-time from pickup to delivery. Complete transparency.
            </p>
          </Card>

          <Card className="bg-white border border-slate-200/60 p-8 text-center space-y-4 shadow-xs rounded-2xl flex flex-col items-center max-w-sm mx-auto">
            <div className="h-16 w-16 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-955 text-base">Verified Drivers</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Every driver undergoes strict background verification and license audits.
            </p>
          </Card>
        </div>
      </section>

      {/* Services List Catalog */}
      <section id="services" className="bg-[#f8fafc] py-24 text-center border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-left">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
              OUR LOGISTICS SERVICES
            </h2>
            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">
              End-to-End logistics solutions in South Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesList.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <Card key={idx} className="bg-white border border-slate-200/80 p-6 text-left space-y-4 shadow-xs rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-[#f99c00] stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-slate-950">{srv.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{srv.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Every Vehicle Section with light grey background */}
      <section className="bg-[#F0F2F6] w-full border-t border-b border-slate-200/60 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Center Section Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-955 uppercase">
              EVERY VEHICLE YOU NEED
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              From bakkies to heavy-duty trucks
            </p>
          </div>

          {/* Vehicles Grid Catalog */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {vehiclesList.map((vh, idx) => {
              const Icon = vh.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-[#f99c00] rounded-2xl overflow-hidden flex flex-col h-full min-h-[260px] text-center transition-all duration-300 ease-out transform">
                  {/* Top Half: Light Grey Background with Divider Border and Orange Icon */}
                  <div className="bg-[#F3F3F4] py-10 flex items-center justify-center border-b border-slate-200/50">
                    <Icon className="h-10 w-10 text-[#f99c00] stroke-[1.8]" />
                  </div>
                  
                  {/* Bottom Half: White Background with Text */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900">{vh.name}</h4>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        {vh.capacity.startsWith('Up to') || vh.capacity.includes('tons') || vh.capacity.includes('kL') ? vh.capacity : `Up to ${vh.capacity}`}
                      </span>
                    </div>
                    {vh.use && (
                      <p className="text-[10px] text-slate-400 leading-relaxed font-normal mt-2">
                        {vh.use}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Accordion FAQ */}
      <section className="bg-white py-24 border-t border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">
              Everything you need to know about LoadAfrica
            </p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How do I track my active cargo transport?', a: 'Once your driver accepts the load, you will receive a tracking link via SMS. You can also view live tracking details on your Customer Portal under the Active Deliveries tab.' },
              { q: 'What insurance is provided on loaded cargo?', a: 'Every booking on LoadAfrica includes goods-in-transit (GIT) insurance up to R 250,000. Higher GIT limits can be requested for high-value cargo.' },
              { q: 'How are delivery payouts calculated?', a: 'Transport rates are dynamically estimated based on pickup distance, fuel indices, vehicle load type, and match parameters. Payments are securely held until successful confirmation of delivery.' }
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left text-xs font-black text-slate-955 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${faqOpen[idx] ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen[idx] && (
                  <div className="px-6 py-4 bg-white border-t border-slate-100 text-xs text-slate-500 leading-relaxed font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
