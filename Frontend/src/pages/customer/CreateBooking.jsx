import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, Box, Navigation, Calculator, ArrowLeft, Send, Lock, Check, CheckCircle2 } from 'lucide-react';
import { Input, Select } from '../../components/ui';

export default function CreateBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    pickup: '27 Watermelon St, Bendor, Polokwane, 0699, South Africa',
    dropoff: 'X89, 16 Serengeti Blvd, Witfontein, Kempton Park, 1619, South Africa',
    vehicleType: 'LDV',
    cargoType: 'Furniture, Building materials',
    radius: 50,
    email: 'you@example.com',
    fullName: 'Jane Doe',
    phone: '+27 ...'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSliderChange = (e) => {
    setFormData(prev => ({ ...prev, radius: e.target.value }));
  };

  // Step names based on screenshots
  const steps = ['Enter details', 'Review price', 'Payment', 'Confirmation'];

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center gap-3.5 mb-8 text-xs font-bold bg-slate-50 p-3 rounded-2xl border border-slate-150">
        {[1, 2, 3, 4].map((num, idx) => (
          <React.Fragment key={num}>
            <div className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-[10px] font-black border transition-all ${
              step > num ? 'bg-amber-50 border-amber-200 text-amber-600' :
              step === num ? 'bg-[#f99c00] border-[#f99c00] text-slate-950 shadow-md shadow-amber-500/10' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {step > num ? <Check className="h-3 w-3" /> : num}
            </div>
            {idx < 3 && <div className={`h-[1.5px] w-5 rounded-full ${step > num + 1 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>}
          </React.Fragment>
        ))}
        <span className="ml-auto text-slate-550 uppercase tracking-widest text-[9px] font-black">{steps[step - 1]}</span>
      </div>
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50/50">
      {/* Premium Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-xl p-8 text-left border border-slate-200/80 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
              {step === 1 ? 'Book Transport' : step === 2 ? 'Your Quotation' : step === 3 ? 'Payment' : 'Booking Confirmed'}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Secure, vetted freight dispatch dashboard</p>
          </div>
        </div>

        {renderStepIndicator()}

        {/* STEP 1: Enter details */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Pickup Location Card */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-[#f99c00] shrink-0" /> Pickup Location *
              </label>
              <input 
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                placeholder="Search pickup address..."
                className="w-full px-4 h-11 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-[#f99c00] focus:ring-2 focus:ring-[#f99c00]/10 bg-slate-50/50 hover:bg-slate-50 transition-all"
              />
            </div>

            {/* Delivery Location Card */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-[#f99c00] shrink-0" /> Delivery Location *
              </label>
              <input 
                name="dropoff"
                value={formData.dropoff}
                onChange={handleChange}
                placeholder="Search delivery address..."
                className="w-full px-4 h-11 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-[#f99c00] focus:ring-2 focus:ring-[#f99c00]/10 bg-slate-50/50 hover:bg-slate-50 transition-all"
              />
            </div>

            {/* Vehicle Type Card */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                <Truck className="h-3.5 w-3.5 text-[#f99c00] shrink-0" /> Vehicle Type *
              </label>
              <div className="relative">
                <select 
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 h-11 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-[#f99c00] focus:ring-2 focus:ring-[#f99c00]/10 bg-slate-50/50 hover:bg-slate-50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select vehicle type</option>
                  <option value="Motorbike">Motorbike</option>
                  <option value="Small Car">Small Car</option>
                  <option value="LDV">LDV</option>
                  <option value="Bakkie">Bakkie</option>
                  <option value="Coldroom Bakkie">Coldroom Bakkie</option>
                  <option value="1-3 Ton Truck">1-3 Ton Truck</option>
                  <option value="Furniture Truck">Furniture Truck</option>
                  <option value="4-8 Ton Truck">4-8 Ton Truck</option>
                  <option value="Crane Truck">Crane Truck</option>
                  <option value="Tipper Truck">Tipper Truck</option>
                  <option value="Side Tipper">Side Tipper</option>
                  <option value="Tanker">Tanker</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* Cargo Type Card */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                <Box className="h-3.5 w-3.5 text-[#f99c00] shrink-0" /> Cargo Type (Optional)
              </label>
              <input 
                name="cargoType"
                value={formData.cargoType}
                onChange={handleChange}
                placeholder="e.g., Furniture, Building materials"
                className="w-full px-4 h-11 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-[#f99c00] focus:ring-2 focus:ring-[#f99c00]/10 bg-slate-50/50 hover:bg-slate-50 transition-all"
              />
            </div>

            {/* Match Radius slider */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                  <Navigation className="h-3.5 w-3.5 text-[#f99c00] shrink-0" /> Match radius
                </label>
                <span className="text-xs font-black text-slate-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">{formData.radius} km</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                value={formData.radius} 
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#f99c00]"
              />
              <p className="text-[10px] text-slate-400 font-bold leading-normal">We'll notify drivers, fleets and plant owners within {formData.radius} km of your pickup.</p>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full mt-2 h-12 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider shadow-md shadow-amber-500/10"
            >
              <Calculator className="h-4 w-4" />
              Get Quotation
            </button>
          </div>
        )}

        {/* STEP 2: Review price */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Map Placeholder */}
            <div className="h-48 bg-slate-800 rounded-xl overflow-hidden relative flex items-center justify-center">
              {/* Very rough mockup of a dark map background from screenshot */}
              <div className="absolute inset-0 opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Pretoria,South+Africa&zoom=7&size=600x300&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0xffffff&style=feature:all|element:labels.text.stroke|color:0x000000&style=feature:water|element:geometry|color:0x0e171d&style=feature:landscape|element:geometry|color:0x1e2730&style=feature:road|element:geometry|color:0x2c353f&style=feature:poi|element:geometry|color:0x28313a&sensor=false')] bg-cover bg-center"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <div className="relative h-24 w-1 bg-blue-500 rounded-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-5 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold rounded-full border border-white">A</div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-5 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold rounded-full border border-white">B</div>
                </div>
              </div>

              {/* Map Controls placeholder */}
              <div className="absolute right-3 top-3 bg-white rounded-md shadow-md flex flex-col border border-slate-200">
                <button className="h-8 w-8 flex items-center justify-center border-b border-slate-200 text-slate-600 font-bold">+</button>
                <button className="h-8 w-8 flex items-center justify-center text-slate-600 font-bold">-</button>
              </div>
            </div>

            {/* Route Details Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-3 font-semibold text-slate-800 mb-1">
                <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> 301 km</div>
                <div className="flex items-center gap-1">⏱ 3 hours 6 mins</div>
              </div>
              <p><span className="font-bold text-slate-700">From:</span> {formData.pickup}</p>
              <p><span className="font-bold text-slate-700">To:</span> {formData.dropoff}</p>
              <p><span className="font-bold text-slate-700">Vehicle:</span> {formData.vehicleType} • <span className="font-bold text-slate-700">Cargo:</span> {formData.cargoType}</p>
            </div>

            {/* Price Breakdown Box */}
            <div className="border border-[#f4a236]/30 bg-amber-50/10 rounded-xl p-5">
              <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-4 uppercase tracking-wider">
                <Calculator className="h-4 w-4 text-[#f4a236]" /> Price Breakdown
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Base fare ({formData.vehicleType})</span>
                  <span>R 100</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Distance (301.4 km)</span>
                  <span>R 3,014</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-200/60">
                  <span>Service fee (17%)</span>
                  <span>R 516</span>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <span className="font-extrabold text-slate-900 text-base">Estimated Total</span>
                  <span className="font-extrabold text-[#f4a236] text-xl">R 3,630</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">* Final price may vary based on route conditions and loading time</p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setStep(1)}
                className="py-3 border-2 border-[#f4a236] text-[#f4a236] font-extrabold text-sm rounded-lg hover:bg-amber-50 uppercase tracking-wider transition-colors"
              >
                Edit Details
              </button>
              <button 
                onClick={() => setStep(3)}
                className="py-3 bg-[#f4a236] hover:bg-amber-500 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
              >
                <Send className="h-4 w-4" />
                Pay & Book
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Amount Due Box */}
            <div className="border border-[#f4a236]/30 bg-amber-50/30 rounded-xl p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-slate-900 text-sm">Amount due now</span>
                <span className="font-extrabold text-[#f4a236] text-xl">R 3,630</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Full payment required to confirm booking. Secured by Paystack.</p>
            </div>

            {/* Cancellation Policy Box */}
            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-3.5 flex items-start gap-2.5">
              <div className="mt-0.5 h-4 w-4 shrink-0 text-orange-500 flex items-center justify-center font-bold text-xs border border-orange-500 rounded-full">!</div>
              <p className="text-xs text-slate-700 leading-snug">
                <span className="font-bold">Cancellation policy:</span> 15% penalty (R 545) if cancelled. You'll be refunded R 3,085.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Email</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#f4a236]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Full name</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#f4a236]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Phone</label>
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#f4a236]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
              <Lock className="h-3 w-3 shrink-0" />
              Secure checkout via Paystack. Test mode active — use test card 4084 0840 8408 4081.
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setStep(2)}
                className="py-3 border-2 border-[#f4a236] text-[#f4a236] font-extrabold text-sm rounded-lg hover:bg-amber-50 uppercase tracking-wider transition-colors"
              >
                Back
              </button>
              <button 
                onClick={async () => {
                  try {
                    const { bookingService } = await import('../../services/bookingService');
                    await bookingService.createBooking({
                      pickup_address: formData.pickup,
                      delivery_address: formData.dropoff,
                      pickup_date: new Date().toISOString(),
                      delivery_date: new Date(Date.now() + 86400000).toISOString(),
                      cargo_name: formData.cargoType,
                      cargo_category: formData.cargoType,
                      weight: 5000, // mock weight
                      requested_vehicle: formData.vehicleType,
                      guest_email: formData.email,
                      guest_phone: formData.phone
                    });
                    setStep(4);
                  } catch (err) {
                    console.error("Failed to create booking", err);
                    alert("Failed to create booking. Make sure backend is running.");
                  }
                }}
                className="py-3 bg-[#fdd086] text-amber-900 hover:bg-[#fcc871] font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-colors"
              >
                <Lock className="h-4 w-4" />
                Pay R 3,630
              </button>
            </div>

          </div>
        )}

        {/* STEP 4: Success / Confirmation */}
        {step === 4 && (
          <div className="py-10 text-center space-y-4 animate-fadeIn">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Your booking is confirmed. We will notify you once a driver is assigned to your load.</p>
            <div className="pt-6">
              <button 
                onClick={() => navigate('/customer/dashboard')}
                className="py-3 px-8 bg-[#f4a236] text-white hover:bg-amber-500 font-extrabold text-sm rounded-lg transition-colors uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
