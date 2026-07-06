import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Scale, HelpCircle, Tag, DollarSign, Calendar, Truck, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Info, ShieldCheck
} from 'lucide-react';
import { createLoad } from '../../data/mockData';
import { GooglePlacesInput } from '../../components/ui';

const VEHICLE_TYPES = [
  { id: 'bakkie', name: 'Bakkie', capacity: '1-1.5 Tons', rateMultiplier: 0.5, desc: 'Ideal for local parcel deliveries and furniture removals', img: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=300&auto=format&fit=crop&q=80' },
  { id: 'box', name: '4-Ton & 8-Ton closed trucks', capacity: '4-8 Tons', rateMultiplier: 0.8, desc: 'Secure closed cargo transportation for office moves and wholesale retail', img: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=300&auto=format&fit=crop&q=80' },
  { id: 'tipper', name: 'Side Tipper Truck', capacity: '20-30 Tons', rateMultiplier: 1.2, desc: 'Perfect for sand supply, rubble clearing, site clearing aggregates', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80' },
  { id: 'tanker', name: 'Tanker Truck', capacity: '35,000 Liters', rateMultiplier: 1.3, desc: 'Bulk liquid logistics, chemicals, industrial fuel', img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=300&auto=format&fit=crop&q=80' },
  { id: 'yellow_plant', name: 'Yellow Plant (TLB, Excavator)', capacity: 'Heavy Equipment', rateMultiplier: 1.5, desc: 'Construction site plant machinery placement and excavation', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=80' }
];

export default function CreateLoad() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: Vehicle Selection, 3: Confirmation
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Building Materials');
  const [weight, setWeight] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('bakkie');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateEstimate = (baseRate) => {
    if (!baseRate) return 0;
    const vType = VEHICLE_TYPES.find(v => v.id === selectedVehicle);
    const multiplier = vType ? vType.rateMultiplier : 1.0;
    return Math.round(Number(baseRate) * multiplier);
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!title || !weight || !pickup || !dropoff || !budget) {
      setError('Please fill out all cargo details before proceeding.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirmBooking = () => {
    setLoading(true);
    
    // Construct new load object
    const finalBudget = calculateEstimate(budget);
    const newLoad = {
      title,
      category,
      weight: `${weight} Tons`,
      pickup,
      dropoff,
      budget: finalBudget,
      customerName: 'Patrice Motsepe',
      customerId: 'usr-1',
      vehicleType: VEHICLE_TYPES.find(v => v.id === selectedVehicle).name
    };

    setTimeout(() => {
      createLoad(newLoad);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create & Dispatch Load</h2>
        <p className="text-xs text-slate-400">Post details of your freight cargo to nearby vetted transporters.</p>
      </div>

      {/* Multi-step Progress Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400'
          }`}>1</span>
          <span className="text-xs font-bold text-slate-700">Cargo Information</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-150 mx-4" />
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400'
          }`}>2</span>
          <span className="text-xs font-bold text-slate-700">Vehicle Selection</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-150 mx-4" />
        <div className="flex items-center gap-2">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400'
          }`}>3</span>
          <span className="text-xs font-bold text-slate-700">Confirm Booking</span>
        </div>
      </div>

      {/* Step Contents */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Cargo & Route Details</h3>
          
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cargo Title</label>
              <input 
                type="text" 
                placeholder="e.g. 500 Bags of Lafarge Cement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
              >
                <option>Building Materials</option>
                <option>Heavy Equipment</option>
                <option>Food & Beverage</option>
                <option>Agriculture</option>
                <option>Consumer Goods</option>
                <option>Other / Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weight (Tons)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="number" 
                  placeholder="e.g. 25"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Base Budget (R)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="number" 
                  placeholder="e.g. 12000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <GooglePlacesInput
                label="Pickup Location Address"
                placeholder="Search pickup point"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                onPlaceSelect={place => setPickup(place.address)}
                icon={MapPin}
                required
              />
            </div>

            <div className="md:col-span-2">
              <GooglePlacesInput
                label="Dropoff Location Address"
                placeholder="Search destination"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                onPlaceSelect={place => setDropoff(place.address)}
                icon={MapPin}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-500/10"
            >
              Continue to Vehicles
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select Truck Type</h3>
            <p className="text-xs text-slate-400">Choose a truck best suited for your cement weight load. Multipliers apply to base budget.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VEHICLE_TYPES.map((vh) => {
              const active = selectedVehicle === vh.id;
              const estimate = calculateEstimate(budget);
              return (
                <div 
                  key={vh.id}
                  onClick={() => setSelectedVehicle(vh.id)}
                  className={`group border rounded-2xl p-5 cursor-pointer flex flex-col justify-between transition-all ${
                    active 
                      ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-4">
                    <img 
                      src={vh.img} 
                      alt={vh.name} 
                      className="h-28 w-full object-cover rounded-xl border border-slate-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{vh.name}</span>
                        {active && <CheckCircle2 className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />}
                      </div>
                      <span className="block text-xs text-slate-400 font-medium">Capacity: {vh.capacity}</span>
                      <p className="text-[11px] text-slate-400 mt-1 font-light leading-relaxed">{vh.desc}</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Estimated Cost:</span>
                    <span className="text-base font-extrabold text-slate-800">R{calculateEstimate(budget)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cargo info
            </button>
            <button 
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-500/10"
            >
              Booking Confirmation
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-8 animate-scaleIn">
          <div className="max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Cargo Booking Summary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please review all specifications before finalizing booking. Verified Load Africa transporters will instantly bid or accept details below.
            </p>
          </div>

          <div className="max-w-xl mx-auto border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div className="p-4 bg-slate-50/50 grid grid-cols-2 text-left text-xs text-slate-500 font-medium">
              <span>CARGO SPECIFICATION</span>
              <span className="text-right text-slate-800 font-bold">{title} ({weight} Tons)</span>
            </div>
            <div className="p-4 grid grid-cols-2 text-left text-xs text-slate-500 font-medium">
              <span>CATEGORY</span>
              <span className="text-right text-slate-800 font-bold">{category}</span>
            </div>
            <div className="p-4 grid grid-cols-2 text-left text-xs text-slate-500 font-medium">
              <span>PICKUP</span>
              <span className="text-right text-slate-800 font-bold truncate pl-4">{pickup}</span>
            </div>
            <div className="p-4 grid grid-cols-2 text-left text-xs text-slate-500 font-medium">
              <span>DROPOFF</span>
              <span className="text-right text-slate-800 font-bold truncate pl-4">{dropoff}</span>
            </div>
            <div className="p-4 grid grid-cols-2 text-left text-xs text-slate-500 font-medium">
              <span>VEHICLE TYPE</span>
              <span className="text-right text-amber-600 font-bold">{VEHICLE_TYPES.find(v => v.id === selectedVehicle).name}</span>
            </div>
            <div className="p-4 bg-amber-500/5 grid grid-cols-2 text-left text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-800">TOTAL COST ESTIMATE</span>
              <span className="text-right text-base font-extrabold text-slate-900">R{calculateEstimate(budget)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 max-w-xl mx-auto flex items-start gap-3 text-left">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-400 font-light leading-relaxed">
              Upon booking confirmation, your load is broadcasts to available drivers within a 30km radius. Booking is secured under digital escort wallet protocols.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 max-w-xl mx-auto flex items-center justify-between">
            <button 
              disabled={loading}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Adjust Vehicle
            </button>
            <button 
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Confirm & Dispatch Cargo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Booking complete modal view when step 4 occurs */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-6 max-w-md mx-auto animate-scaleIn">
          <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">Cargo Dispatched Successfully</h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Your cement cargo has been successfully posted. Check active listings on the Dashboard or track real-time transporter state.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => navigate('/customer/dashboard')}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/customer/active-deliveries')}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-all"
            >
              Track Cargo Live
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
