import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Truck, Box, ArrowLeft, Send, CheckCircle2, Loader2,
  AlertCircle, Navigation, Clock, Weight, Calendar, MessageSquare,
  Zap, Users, ChevronDown, ArrowRight, Info
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { authService } from '../../services/authService';

// ─────────────────────────────────────────────
// Nominatim geocoding (OpenStreetMap — free, no API key)
// ─────────────────────────────────────────────
const searchAddress = async (query) => {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=za&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.map(d => ({
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch {
    return [];
  }
};

// OSRM route calculation (free, no API key)
const calculateRoute = async (fromLat, fromLng, toLat, toLng) => {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
    );
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      return {
        distanceKm: (route.distance / 1000).toFixed(1),
        durationMins: Math.round(route.duration / 60),
      };
    }
  } catch {}
  return null;
};

// Vehicle categories and types
const VEHICLE_CATEGORIES = {
  'Light Vehicles': ['Motorbike', 'Small Car', 'LDV / Bakkie', 'Coldroom Bakkie'],
  'Medium Trucks': ['1-Ton Truck', '2-Ton Truck', '4-Ton Truck', 'Furniture Truck'],
  'Heavy Trucks': ['8-Ton Truck', '14-Ton Truck', '22-Ton Truck', '34-Ton Side Tipper'],
  'Specialized': ['Crane Truck', 'Tipper Truck', 'Tanker', 'Flatbed', 'Refrigerated Truck'],
};

const CARGO_CATEGORIES = [
  'General Cargo', 'Building Materials', 'Agricultural Produce',
  'Furniture & Household', 'Industrial Equipment', 'Retail & FMCG',
  'Refrigerated / Perishable', 'Hazardous Materials', 'Livestock',
  'Mining & Minerals', 'Electronics', 'Automotive Parts', 'Other',
];

// ─────────────────────────────────────────────
// Address autocomplete hook
// ─────────────────────────────────────────────
function useAddressSearch(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(
    initialValue ? { label: initialValue, lat: -26.2041, lng: 28.0473 } : null
  );
  const debounceRef = useRef(null);

  const onChange = useCallback((text) => {
    setValue(text);
    if (text.length >= 3) {
      setSelected({ label: text, lat: -26.2041, lng: 28.0473 });
    } else {
      setSelected(null);
    }
    clearTimeout(debounceRef.current);
    if (text.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchAddress(text);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  }, []);

  const onSelect = useCallback((suggestion) => {
    setValue(suggestion.label);
    setSelected(suggestion);
    setSuggestions([]);
  }, []);

  const closeSuggestions = () => {
    setSuggestions([]);
  };

  const clear = () => { setValue(''); setSelected(null); setSuggestions([]); };

  return { value, onChange, onSelect, suggestions, loading, selected, clear, closeSuggestions };
}

// ─────────────────────────────────────────────
// Reusable Address Input Component
// ─────────────────────────────────────────────
function AddressInput({ label, icon: Icon, color, hook, placeholder, id }) {
  const ref = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        hook.closeSuggestions();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [hook]);

  return (
    <div className="space-y-1.5" ref={ref}>
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-wider">
        <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} /> {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          value={hook.value}
          onChange={e => hook.onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full px-4 h-11 pr-10 text-xs font-semibold border rounded-xl focus:outline-none focus:ring-2 transition-all bg-slate-50/50 hover:bg-slate-50 ${
            hook.selected?.lat ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10' 
            : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/10'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {hook.loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : hook.selected?.lat ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Navigation className="h-4 w-4 text-slate-300" />
          )}
        </div>

        {/* Suggestions dropdown */}
        {hook.suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
            {hook.suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => hook.onSelect(s)}
                className="w-full text-left px-4 py-2.5 text-xs hover:bg-amber-50 border-b border-slate-50 last:border-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium leading-snug">{s.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OpenStreetMap embed (iframe — no API key)
// ─────────────────────────────────────────────
function RouteMap({ pickup, delivery }) {
  const hasCoords = pickup?.lat && pickup?.lng && delivery?.lat && delivery?.lng;

  if (!hasCoords) {
    return (
      <div className="h-52 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium gap-2">
        <MapPin className="h-5 w-5" />
        Map will appear after selecting both addresses
      </div>
    );
  }

  // Centre the map between the two points
  const centreLat = ((pickup.lat + delivery.lat) / 2).toFixed(4);
  const centreLng = ((pickup.lng + delivery.lng) / 2).toFixed(4);

  // OSM embed with markers for both points
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(pickup.lng, delivery.lng) - 0.5},${Math.min(pickup.lat, delivery.lat) - 0.5},${Math.max(pickup.lng, delivery.lng) + 0.5},${Math.max(pickup.lat, delivery.lat) + 0.5}&layer=mapnik&marker=${pickup.lat},${pickup.lng}`;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <iframe
        title="Route Map"
        src={src}
        width="100%"
        height="220"
        loading="lazy"
        className="w-full border-0"
      />
      <div className="bg-white px-4 py-2.5 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold truncate max-w-[140px]">{pickup.label?.split(',')[0]}</span>
        </div>
        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
          <span className="font-semibold truncate max-w-[140px]">{delivery.label?.split(',')[0]}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function CreateBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedBookingId, setSubmittedBookingId] = useState(null);

  // Route calculation
  const [routeData, setRouteData] = useState(null); // { distanceKm, durationMins }
  const [routeLoading, setRouteLoading] = useState(false);

  // Address hooks
  const pickupHook = useAddressSearch(location.state?.pickup || '');
  const deliveryHook = useAddressSearch(location.state?.dropoff || '');

  // Form data (all empty)
  const [form, setForm] = useState({
    vehicleCategory: '',
    vehicleType: '',
    cargoCategory: '',
    cargoName: '',
    weight: '',
    volume: '',
    pickupDate: '',
    pickupTime: '',
    specialInstructions: '',
    urgency: false,
    loadingAssistance: false,
    unloadingAssistance: false,
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // When category changes, reset vehicle type
  const handleCategoryChange = (e) => {
    setForm(prev => ({ ...prev, vehicleCategory: e.target.value, vehicleType: '' }));
  };

  // Auto-calculate route when both addresses are selected
  useEffect(() => {
    const p = pickupHook.selected;
    const d = deliveryHook.selected;
    if (p?.lat && d?.lat) {
      setRouteLoading(true);
      calculateRoute(p.lat, p.lng, d.lat, d.lng)
        .then(result => { setRouteData(result); setRouteLoading(false); })
        .catch(() => setRouteLoading(false));
    } else {
      setRouteData(null);
    }
  }, [pickupHook.selected, deliveryHook.selected]);

  // Validation
  const step1Valid =
    pickupHook.selected?.lat &&
    deliveryHook.selected?.lat &&
    form.vehicleType &&
    form.cargoCategory &&
    form.cargoName.trim() &&
    form.weight &&
    form.pickupDate;

  const formatDuration = (mins) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const pickup = pickupHook.selected;
      const delivery = deliveryHook.selected;

      const payload = {
        pickup_address: pickup.label,
        pickup_coords_lat: pickup.lat,
        pickup_coords_lng: pickup.lng,
        delivery_address: delivery.label,
        delivery_coords_lat: delivery.lat,
        delivery_coords_lng: delivery.lng,
        pickup_date: form.pickupDate,
        delivery_date: form.pickupDate, // Broker will refine this
        cargo_name: form.cargoName,
        cargo_category: form.cargoCategory,
        weight: form.weight,
        volume: form.volume || null,
        requested_vehicle: form.vehicleType,
        pickup_instructions: [
          form.specialInstructions,
          form.pickupTime ? `Pickup time: ${form.pickupTime}` : '',
        ].filter(Boolean).join('\n') || null,
        estimated_distance: routeData?.distanceKm ? parseFloat(routeData.distanceKm) : null,
        estimated_duration_mins: routeData?.durationMins || null,
        is_urgent: form.urgency,
        loading_assistance: form.loadingAssistance,
        unloading_assistance: form.unloadingAssistance,
      };

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        setSubmittedBookingId(res.data.id);
        setStep(3);
      } else {
        setSubmitError(res.message || 'Failed to submit booking.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicator
  const STEPS = [
    { num: 1, label: 'Booking Details' },
    { num: 2, label: 'Review & Confirm' },
    { num: 3, label: 'Submitted' },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, idx) => (
        <React.Fragment key={s.num}>
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
              step > s.num ? 'bg-emerald-500 border-emerald-500 text-white'
              : step === s.num ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
              step === s.num ? 'text-amber-600' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
            }`}>{s.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 rounded-full ${step > s.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ── STEP 1: Booking Form ──────────────────────
  const renderStep1 = () => (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── LEFT COLUMN: Form Fields ── */}
        <div className="space-y-5">

          {/* Route Section */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Navigation className="h-3 w-3" /> Route
            </p>
            <div className="space-y-3">
              <AddressInput
                id="pickup"
                label="Pickup Address"
                icon={MapPin}
                color="text-emerald-500"
                hook={pickupHook}
                placeholder="Search pickup location..."
              />
              <AddressInput
                id="delivery"
                label="Delivery Address"
                icon={MapPin}
                color="text-red-500"
                hook={deliveryHook}
                placeholder="Search delivery location..."
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Vehicle Section */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Truck className="h-3 w-3" /> Vehicle
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Vehicle Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="vehicleCategory"
                    value={form.vehicleCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50 appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {Object.keys(VEHICLE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Vehicle Type <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleFormChange}
                    disabled={!form.vehicleCategory}
                    className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select type</option>
                    {(VEHICLE_CATEGORIES[form.vehicleCategory] || []).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Cargo Section */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Box className="h-3 w-3" /> Cargo
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Cargo Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="cargoCategory"
                    value={form.cargoCategory}
                    onChange={handleFormChange}
                    className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50 appearance-none cursor-pointer"
                  >
                    <option value="">Select cargo category</option>
                    {CARGO_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Cargo Description <span className="text-red-400">*</span>
                </label>
                <input
                  name="cargoName"
                  value={form.cargoName}
                  onChange={handleFormChange}
                  placeholder="e.g., 50 bags of cement, office furniture, grain..."
                  className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Weight className="h-3 w-3" /> Weight (tons) <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="weight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.weight}
                    onChange={handleFormChange}
                    placeholder="e.g., 5.0"
                    className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Volume (m³) <span className="text-slate-400 font-normal normal-case text-[9px]">optional</span>
                  </label>
                  <input
                    name="volume"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.volume}
                    onChange={handleFormChange}
                    placeholder="e.g., 10"
                    className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Schedule Section */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Schedule
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pickup Date <span className="text-red-400">*</span>
                </label>
                <input
                  name="pickupDate"
                  type="date"
                  value={form.pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleFormChange}
                  className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Preferred Time <span className="text-slate-400 font-normal normal-case text-[9px]">optional</span>
                </label>
                <input
                  name="pickupTime"
                  type="time"
                  value={form.pickupTime}
                  onChange={handleFormChange}
                  className="w-full px-3 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" /> Special Instructions
              <span className="text-slate-400 font-normal normal-case text-[9px]">optional</span>
            </label>
            <textarea
              name="specialInstructions"
              value={form.specialInstructions}
              onChange={handleFormChange}
              rows={3}
              placeholder="Any special handling, access requirements, gate codes, etc."
              className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-slate-50 resize-none"
            />
          </div>

          {/* Next button */}
          <button
            onClick={() => setStep(2)}
            disabled={!step1Valid}
            className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider shadow-md shadow-amber-500/10"
          >
            <ArrowRight className="h-4 w-4" />
            Review Booking
          </button>

          {!step1Valid && (
            <p className="text-center text-[10px] text-slate-400 font-medium -mt-1">
              Fill in all required (*) fields to continue
            </p>
          )}
        </div>

        {/* ── RIGHT COLUMN: Live Map + Route Stats ── */}
        <div className="space-y-4">
          {/* Sticky wrapper on desktop */}
          <div className="lg:sticky lg:top-6 space-y-4">

            {/* Map preview */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Route Preview
              </p>
              <RouteMap pickup={pickupHook.selected} delivery={deliveryHook.selected} />
            </div>

            {/* Route stats pill */}
            {pickupHook.selected?.lat && deliveryHook.selected?.lat && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border ${
                routeLoading ? 'bg-slate-50 border-slate-200 text-slate-400'
                : routeData ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {routeLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating route...</>
                ) : routeData ? (
                  <>
                    <Navigation className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-bold">{routeData.distanceKm} km</span>
                    <span className="text-slate-400">·</span>
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>~{formatDuration(routeData.durationMins)} drive time</span>
                  </>
                ) : (
                  <><AlertCircle className="h-3.5 w-3.5" /> Could not calculate route. Continue anyway.</>
                )}
              </div>
            )}

            {/* Broker info notice */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-bold mb-1">No price shown — that's intentional</p>
                <p className="font-medium opacity-80 leading-relaxed">
                  After you submit, a certified LoadAfrica broker will review your route, cargo, and vehicle requirements and prepare an official quotation for you to accept.
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">What happens next?</h4>
              {[
                { n: '1', t: 'Broker reviews your route & cargo' },
                { n: '2', t: 'Broker prepares official quotation' },
                { n: '3', t: 'You accept → booking is confirmed' },
                { n: '4', t: 'Payment → Driver assigned' },
              ].map(({ n, t }) => (
                <div key={n} className="flex items-center gap-2.5 text-xs text-amber-800">
                  <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[9px] shrink-0">{n}</div>
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );


  // ── STEP 2: Review & Confirm ──────────────
  const renderStep2 = () => {
    const pickup = pickupHook.selected;
    const delivery = deliveryHook.selected;

    return (
      <div className="space-y-5 animate-fadeIn">

        {/* Map */}
        <RouteMap pickup={pickup} delivery={delivery} />

        {/* Route Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Route Summary</h4>
          <div className="space-y-2 text-xs">
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow" />
                <div className="w-0.5 h-4 bg-slate-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <p className="font-semibold text-slate-800">{pickup?.label?.split(',').slice(0, 2).join(', ')}</p>
                  <p className="text-[10px] text-slate-500">Pickup · {form.pickupDate}{form.pickupTime ? ` at ${form.pickupTime}` : ''}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{delivery?.label?.split(',').slice(0, 2).join(', ')}</p>
                  <p className="text-[10px] text-slate-500">Delivery</p>
                </div>
              </div>
            </div>
          </div>

          {routeData && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Navigation className="h-3.5 w-3.5 text-amber-500" />
                {routeData.distanceKm} km
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                ~{formatDuration(routeData.durationMins)} drive
              </div>
            </div>
          )}
        </div>

        {/* Cargo & Vehicle Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Cargo & Vehicle</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Vehicle', value: form.vehicleType },
              { label: 'Cargo Category', value: form.cargoCategory },
              { label: 'Description', value: form.cargoName },
              { label: 'Weight', value: `${form.weight} tons` },
              form.volume ? { label: 'Volume', value: `${form.volume} m³` } : null,
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
                <p className="font-semibold text-slate-700 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important notice — no price shown */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-bold mb-0.5">No price shown — that's intentional</p>
            <p className="font-medium opacity-80">After you submit, a certified LoadAfrica broker will review your route, cargo, and vehicle requirements and prepare an official quotation for you to review and accept.</p>
          </div>
        </div>

        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setStep(1)}
            className="py-3 border-2 border-slate-200 text-slate-600 font-extrabold text-xs rounded-xl hover:border-slate-300 hover:bg-slate-50 uppercase tracking-wider transition-colors"
          >
            Edit Details
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="h-4 w-4" /> Submit Booking</>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ── STEP 3: Success ───────────────────────
  const renderStep3 = () => (
    <div className="py-8 text-center space-y-5 animate-fadeIn">
      <div className="h-20 w-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900">Booking Submitted!</h3>
        <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
          Your booking request has been received. A LoadAfrica broker will review your details and prepare a quotation.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2.5 max-w-sm mx-auto">
        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">What happens next?</h4>
        {[
          { step: '1', text: 'Broker reviews your route & cargo' },
          { step: '2', text: 'Broker prepares official quotation' },
          { step: '3', text: 'You receive your quote in "My Quotations"' },
          { step: '4', text: 'You accept → booking is confirmed' },
          { step: '5', text: 'Payment processed → Driver assigned' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-2.5 text-xs text-amber-800">
            <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[9px] shrink-0">{step}</div>
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>

      {submittedBookingId && (
        <p className="text-[10px] text-slate-400 font-mono">Booking ID: {submittedBookingId}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => navigate('/customer/my-quotations')}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider transition-colors shadow-md shadow-amber-500/10"
        >
          View My Quotations
        </button>
        <button
          onClick={() => navigate('/customer/dashboard')}
          className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] flex items-start justify-center py-6 px-4 bg-slate-50/50">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-5xl text-left border border-slate-200/80">

        {/* Header */}
        <div className="flex items-center gap-3.5 p-6 pb-4 border-b border-slate-100">
          {step > 1 && step < 3 && (
            <button
              onClick={() => setStep(step - 1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
              {step === 1 ? 'Book Transport' : step === 2 ? 'Review & Submit' : 'Request Submitted'}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              {step === 1 ? 'Fill in your cargo & route details'
                : step === 2 ? 'Confirm your booking details'
                : 'Awaiting broker quotation'}
            </p>
          </div>
        </div>

        <div className="p-6 pt-5">
          {renderStepIndicator()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}
