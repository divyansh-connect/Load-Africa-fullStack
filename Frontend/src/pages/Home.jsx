import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ArrowRight, Star, ChevronDown, CheckCircle2, ShieldCheck,
  MapPin, Scale, MessageSquare, Phone, Mail, Building, Plus, UserCheck, Users,
  Play, Zap, Shield, FileText, Bike, Car, HardHat, Hammer, Trash, Sofa, Milestone, Droplet, Compass
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

  // FAQ accordion states
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleGetQuote = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;

    // Simulate smart cargo quote estimation
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

      {/* Hero Section (Compensated for Fixed Navbar) */}
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

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight uppercase">
              LOADAFRICA LOGISTICS — <br />
              BOOK BAKKIES, TRUCKS & <br />
              TRANSPORT ACROSS <br />
              SOUTH AFRICA
            </h1>

            <p className="text-sm sm:text-base text-slate-350 font-light leading-relaxed max-w-xl">
              Bakkie hire, truck hire, load board, furniture removal and business deliveries in Gauteng, North West (Rustenburg) and Northern Cape — instant quotes, verified drivers, insured loads.
            </p>

            {/* Grid of four actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-lg">
              <a
                href="#quote-card"
                className="px-5 py-3 bg-[#EF9A30] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-center text-sm tracking-wider transition-colors uppercase"
              >
                Book a Load
              </a>
              <button
                onClick={() => navigate('/drivers#onboarding-wizard')}
                className="px-5 py-3 bg-slate-900/70 hover:bg-slate-800 border border-slate-600 text-white font-black rounded-lg text-center text-sm tracking-wider transition-colors uppercase"
              >
                Register as Driver
              </button>
              <button
                onClick={() => navigate('/yellow-plant')}
                className="px-5 py-3 bg-[#EF9A30] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-center text-sm tracking-wider transition-colors uppercase"
              >
                Yellow Plant Hire
              </button>
              <a
                href="#services"
                className="px-5 py-3 bg-slate-900/70 hover:bg-slate-800 border border-slate-600 text-white font-black rounded-lg text-center text-sm tracking-wider transition-colors uppercase"
              >
                Courier Service
              </a>
            </div>
          </div>

          {/* Right quotation card column */}
          <div id="quote-card" className="lg:col-span-6 relative">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-left border border-slate-100 text-slate-900 relative z-10">
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                BOOK TRANSPORT
              </h3>
              
              {/* Step counter */}
              <div className="flex items-center gap-2 my-5">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-[#EF9A30] text-white text-xs font-bold flex items-center justify-center shadow-md">1</span>
                  <span className="h-0.5 w-6 bg-slate-300"></span>
                  <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 text-xs font-bold flex items-center justify-center">2</span>
                  <span className="h-0.5 w-6 bg-slate-300"></span>
                  <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 text-xs font-bold flex items-center justify-center">3</span>
                  <span className="h-0.5 w-6 bg-slate-300"></span>
                  <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 text-xs font-bold flex items-center justify-center">4</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 ml-1">Enter details</span>
              </div>

              {!quoteResult ? (
                <form onSubmit={handleGetQuote} className="space-y-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-[#EF9A30]" /> Pickup Location
                    </label>
                    <GooglePlacesInput
                      placeholder="Search pickup address..."
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
                      placeholder="Search delivery address..."
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
                    {/* Custom Dropdown Trigger */}
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
                    {/* Dropdown Options */}
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
                    className="w-full py-3 bg-[#808a9f] hover:bg-slate-600 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
                  >
                    <FileText className="h-4 w-4" />
                    GET QUOTATION
                  </button>
                </form>
              ) : (
                <div className="space-y-6 py-4 animate-scaleIn">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/50 space-y-3.5 text-xs text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Est Distance:</span>
                      <strong className="text-slate-855 font-black">{quoteResult.distance}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Est Duration:</span>
                      <strong className="text-slate-855 font-black">{quoteResult.duration}</strong>
                    </div>
                    <div className="flex justify-between border-t border-amber-200/40 pt-3">
                      <span className="text-slate-600 font-black">Est Cost (ZAR):</span>
                      <strong className="text-amber-600 text-lg font-black">R{quoteResult.estimate}</strong>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setQuoteResult(null)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded transition-colors uppercase"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex-1 py-3 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 text-xs font-bold rounded transition-colors uppercase tracking-wider"
                    >
                      Book Cargo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </section>
      </div>

      {/* Why Choose Section (Match spacing & clean cards) */}
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
            <h4 className="font-extrabold text-slate-950 text-base">Verified Drivers</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              All drivers are verified and rated. Your cargo is in safe, professional hands.
            </p>
          </Card>
        </div>
      </section>

      {/* Services Section (Match Spacing py-24 & color style background) */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100 text-center space-y-12 bg-white">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
            LOGISTICS SERVICES WE COVER
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            From a single bakkie courier run to fleet-scale construction haulage — book it on LoadAfrica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesList.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Card key={idx} className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-xs hover:shadow-md transition-shadow rounded-2xl">
                <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-base text-slate-955">{srv.title}</h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-normal">{srv.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Every Vehicle Section (Match spacing & colors) */}
      <div id="vehicles" className="bg-[#F0F2F6] w-full border-t border-slate-100 py-24">
        <section className="max-w-7xl mx-auto px-6 text-center space-y-12 bg-transparent">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-955 uppercase">
              EVERY VEHICLE YOU NEED
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              From bakkies to heavy-duty trucks
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {vehiclesList.map((vh, idx) => {
              const Icon = vh.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#f99c00] rounded-2xl overflow-hidden flex flex-col h-full min-h-[260px] text-center transition-all duration-300 ease-out transform">
                  {/* Top Half: Light Grey Background with Divider Border and Orange Icon */}
                  <div className="bg-[#F3F3F4] py-10 flex items-center justify-center border-b border-slate-200/60">
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
        </section>
      </div>

      {/* Trust Section (Match spacing & text details) */}
      <section id="trust" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100 text-center space-y-12 bg-white">
        <div className="space-y-2">
          <span className="text-[#f99c00] font-bold text-xs uppercase tracking-wider block">
            SOUTH AFRICAN LOGISTICS PLATFORM
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
            A TRANSPORT SERVICE YOU CAN TRUST
          </h2>
          <p className="text-xs text-slate-500 max-w-3xl mx-auto font-bold uppercase tracking-wide">
            LoadAfrica is a logistics & transport marketplace — not a crypto or payments product. We move cargo across South Africa with verified drivers and insured loads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-sm rounded-2xl">
            <div className="h-10 w-10 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 fill-current" />
            </div>
            <h4 className="font-extrabold text-slate-950 text-sm uppercase">Registered SA Business</h4>
            <p className="text-xs text-slate-550 leading-relaxed font-normal">
              Loadafrica (Pty) Ltd — Company Reg 2016 / 389702 / 07.
            </p>
          </Card>

          <Card className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-sm rounded-2xl">
            <div className="h-10 w-10 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-slate-950 text-sm uppercase">Verified Drivers & Vehicles</h4>
            <p className="text-xs text-slate-550 leading-relaxed font-normal">
              Every driver is ID-verified. Vehicles are inspected and load-insured before dispatch.
            </p>
          </Card>

          <Card className="bg-white border border-slate-200/80 p-8 text-left space-y-4 shadow-sm rounded-2xl">
            <div className="h-10 w-10 rounded-full bg-amber-50 text-[#f99c00] flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-950 text-sm uppercase">Real Human Support</h4>
            <p className="text-xs text-slate-550 leading-relaxed font-normal">
              Talk to a person on WhatsApp 063 931 6677 — tracking, bookings and disputes handled fast. (For quotes, use the booking form.)
            </p>
          </Card>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 font-bold tracking-wide">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#EF9A30] shrink-0" />
            Operating in Gauteng, North West (Rustenburg) & Northern Cape
          </span>
          <a href="mailto:support@loadafrica.app" className="flex items-center gap-2 hover:text-[#EF9A30] transition-colors">
            <Mail className="h-4 w-4 text-[#EF9A30] shrink-0" />
            support@loadafrica.app
          </a>
        </div>
      </section>

      {/* Ready to Move Cargo Section */}
      <section className="bg-[#0b1329] py-12 border-t border-slate-800/40 text-center text-white">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            READY TO MOVE YOUR CARGO?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Join thousands of businesses using LoadAfrica for reliable logistics.
          </p>
          <div className="pt-3 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-[#f99c00] hover:bg-[#e08b00] active:scale-[0.98] text-slate-950 font-extrabold rounded text-xs tracking-wider transition-all duration-150 uppercase shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              BOOK YOUR FIRST LOAD
            </button>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
