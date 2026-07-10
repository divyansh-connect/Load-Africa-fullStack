import React from 'react';
import { Truck, Package, Clock, Navigation, DollarSign, Calendar, Compass, AlertCircle, Loader2 } from 'lucide-react';

// =========================================================================
// BUTTON COMPONENT
// =========================================================================
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  ...props 
}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-250 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-950/10',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10',
    rose: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/10',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-800',
    ghostDark: 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4.5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  return (
    <button 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// =========================================================================
// INPUT COMPONENT
// =========================================================================
export function Input({ 
  label, 
  icon: Icon, 
  className = '', 
  ...props 
}) {
  const hasBg = className.includes('bg-');
  const hasBorder = className.includes('border-');
  const hasTextColor = className.includes('text-');
  const hasFocusBg = className.includes('focus:bg-');
  const hasPadding = className.includes('py-');

  let focusBgClass = '';
  if (hasBg && !hasFocusBg) {
    const bgMatch = className.match(/(?:^|\s)(bg-\S+)/);
    if (bgMatch) {
      focusBgClass = `focus:${bgMatch[1]}`;
    }
  }

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label className="block text-xs font-bold text-slate-900 tracking-wider">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        )}
        <input 
          className={`w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all ${
            hasBg ? '' : 'bg-slate-50 focus:bg-white'
          } ${focusBgClass} ${
            hasBorder ? '' : 'border border-slate-200'
          } ${
            hasTextColor ? '' : 'text-slate-800'
          } ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${
            hasPadding ? '' : 'py-3'
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

// =========================================================================
// SELECT COMPONENT
// =========================================================================
export function Select({ 
  label, 
  children, 
  className = '', 
  ...props 
}) {
  const hasBg = className.includes('bg-');
  const hasBorder = className.includes('border-');
  const hasTextColor = className.includes('text-');
  const hasFocusBg = className.includes('focus:bg-');
  const hasPadding = className.includes('py-');

  let focusBgClass = '';
  if (hasBg && !hasFocusBg) {
    const bgMatch = className.match(/(?:^|\s)(bg-\S+)/);
    if (bgMatch) {
      focusBgClass = `focus:${bgMatch[1]}`;
    }
  }

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select 
        className={`w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all px-4 ${
          hasPadding ? '' : 'py-3'
        } ${
          hasBg ? '' : 'bg-slate-50 focus:bg-white'
        } ${focusBgClass} ${
          hasBorder ? '' : 'border border-slate-200'
        } ${
          hasTextColor ? '' : 'text-slate-700'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// =========================================================================
// BADGE COMPONENT
// =========================================================================
export function Badge({ 
  status, 
  className = '' 
}) {
  const getStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'available':
      case 'active':
      case 'live':
      case 'online':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'assigned':
      case 'pending':
      case 'under review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      case 'in_transit':
      case 'in transit':
      case 'transit':
        return 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse';
      case 'completed':
      case 'delivered':
      case 'settled':
      case 'paid':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'failed':
      case 'canceled':
      case 'inactive':
      case 'suspended':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStyle(status)} ${className}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

// =========================================================================
// CARD COMPONENT
// =========================================================================
export function Card({ 
  children, 
  className = '', 
  ...props 
}) {
  return (
    <div 
      className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// =========================================================================
// TABLE COMPONENT
// =========================================================================
export function Table({ 
  headers, 
  children, 
  className = '' 
}) {
  return (
    <div className={`overflow-x-auto w-full border border-slate-200 rounded-2xl bg-white shadow-sm ${className}`}>
      <table className="w-full min-w-[600px] text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase bg-slate-50/60">
            {headers.map((h, i) => (
              <th key={i} className="py-4 px-6 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-slate-650 font-medium">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// =========================================================================
// STAT CARD COMPONENT
// =========================================================================
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'amber', 
  className = '' 
}) {
  const colorMap = {
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    rose: 'bg-rose-100 text-rose-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow ${className}`}>
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl shrink-0 ${colorMap[color] || colorMap.amber}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}

// =========================================================================
// VEHICLE CARD COMPONENT
// =========================================================================
export function VehicleCard({ 
  img, 
  name, 
  capacity, 
  desc, 
  rate, 
  selected = false, 
  onClick 
}) {
  return (
    <div 
      onClick={onClick}
      className={`border rounded-2xl p-5 cursor-pointer flex flex-col justify-between transition-all ${
        selected 
          ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500' 
          : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
      }`}
    >
      <div className="space-y-4">
        <img 
          src={img} 
          alt={name} 
          className="h-28 w-full object-cover rounded-xl border border-slate-100"
        />
        <div className="space-y-1 text-left">
          <span className="font-bold text-slate-800 text-sm">{name}</span>
          <span className="block text-xs text-slate-450 font-medium">Capacity: {capacity}</span>
          <p className="text-[11px] text-slate-450 mt-1 font-light leading-relaxed">{desc}</p>
        </div>
      </div>

      {rate && (
        <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Estimate:</span>
          <span className="text-base font-extrabold text-slate-800">R{rate}</span>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// BOOKING CARD COMPONENT
// =========================================================================
export function BookingCard({ 
  booking, 
  onActionClick 
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50/20 transition-all flex flex-col justify-between">
      <div className="space-y-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge status={booking.bookingStatus} />
            <h4 className="font-bold text-slate-800 text-base mt-2">Load ID: {booking.loadId}</h4>
            <span className="text-[10px] text-slate-400 font-mono font-medium">Booking ref: {booking.id}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Cost</span>
            <span className="text-lg font-extrabold text-slate-800">R{booking.price}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <MapPinIcon className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="font-semibold leading-tight line-clamp-1">Transit origin active</p>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <MapPinIcon className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="font-semibold leading-tight line-clamp-1">Destination point locked</p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
        <span className="text-xs text-slate-400 font-semibold">{booking.date}</span>
        {onActionClick && (
          <Button 
            onClick={onActionClick}
            size="sm"
            variant="secondary"
          >
            Track Trip
          </Button>
        )}
      </div>
    </div>
  );
}

function MapPinIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// =========================================================================
// EMPTY STATE COMPONENT
// =========================================================================
export function EmptyState({ 
  icon: Icon = Package, 
  title, 
  description, 
  actionText, 
  onAction 
}) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl space-y-4 max-w-md mx-auto">
      <div className="inline-flex p-4 bg-slate-50 text-slate-450 rounded-full">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <div className="space-y-1 px-4">
        <h4 className="text-base font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed font-light">{description}</p>
      </div>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}

// =========================================================================
// SKELETON LOADER
// =========================================================================
export function SkeletonLoader({ 
  rows = 3, 
  className = '' 
}) {
  return (
    <div className={`space-y-3.5 animate-pulse w-full ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-3.5 bg-slate-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// MODAL OVERLAY
// =========================================================================
export function Modal({ 
  open, 
  onClose, 
  title, 
  children 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      {/* Content wrapper */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-scaleIn">
        <div className="p-5.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-850">
          <span className="font-bold text-sm">{title}</span>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg"
          >
            Close
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// GOOGLE PLACES AUTOCOMPLETE INPUT
// =========================================================================
export function GooglePlacesInput({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  className = '',
  required = false,
  ...props
}) {
  const hasBg = className.includes('bg-');
  const hasBorder = className.includes('border-');
  const hasTextColor = className.includes('text-');

  const [suggestions, setSuggestions] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (isSelecting) {
      setIsSelecting(false);
      return;
    }

    if (!value || value.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`, {
          headers: { 'User-Agent': 'LoadAfricaLogisticsApp' }
        });
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Nominatim autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    if (onChange) onChange(e);
  };

  return (
    <div ref={containerRef} className="space-y-1.5 w-full text-left relative z-[20]">
      {label && (
        <label className="block text-xs font-bold text-slate-900 tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          className={`w-full rounded-md focus:outline-none focus:ring-1 focus:ring-[#EF9A30] focus:border-[#EF9A30] text-xs transition-all ${
            hasBg ? '' : 'bg-white'
          } ${
            hasBorder ? '' : 'border border-slate-300'
          } ${
            hasTextColor ? '' : 'text-slate-800'
          } ${Icon && !className.includes('pl-') ? 'pl-9 pr-3' : 'px-3'} py-2.5 ${className}`}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] max-h-60 overflow-y-auto divide-y divide-slate-100">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsSelecting(true);
                setIsOpen(false);
                if (onPlaceSelect) {
                  onPlaceSelect({
                    address: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                  });
                }
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 flex flex-col gap-0.5 cursor-pointer"
            >
              <span className="text-slate-900 font-bold truncate">{item.display_name.split(',')[0]}</span>
              <span className="text-[10px] text-slate-400 truncate">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

