// ============================================================
// MASTER VEHICLE TYPE LIST — used across the entire platform:
//   - Fleet Owner: Add Vehicle, Edit Vehicle, My Fleet
//   - Customer: Booking Form
//   - Admin: Vehicle management
//   - Public: Fleet listing page
// ============================================================

export const VEHICLE_TYPES = [
  { value: 'Motorbike',           label: 'Motorbike',           icon: '🏍️' },
  { value: 'Small Car',           label: 'Small Car',           icon: '🚗' },
  { value: 'LDV',                 label: 'LDV',                 icon: '🚐' },
  { value: 'Bakkie',              label: 'Bakkie',              icon: '🛻' },
  { value: 'Coldroom Bakkie',     label: 'Coldroom Bakkie',     icon: '❄️' },
  { value: '1-3 Ton Truck',       label: '1–3 Ton Truck',       icon: '🚚' },
  { value: 'Furniture Truck',     label: 'Furniture Truck',     icon: '🚛' },
  { value: '4-8 Ton Truck',       label: '4–8 Ton Truck',       icon: '🚛' },
  { value: 'Box Truck',           label: 'Box Truck',           icon: '📦' },
  { value: 'Flatbed Truck',       label: 'Flatbed Truck',       icon: '🚛' },
  { value: 'Dropside Truck',      label: 'Dropside Truck',      icon: '🚚' },
  { value: 'Curtain Side Truck',  label: 'Curtain Side Truck',  icon: '🚛' },
  { value: 'Crane Truck',         label: 'Crane Truck',         icon: '🏗️' },
  { value: 'Tipper Truck',        label: 'Tipper Truck',        icon: '🚧' },
  { value: 'Side Tipper',         label: 'Side Tipper',         icon: '🚧' },
  { value: 'Water Tanker',        label: 'Water Tanker',        icon: '💧' },
  { value: 'Fuel Tanker',         label: 'Fuel Tanker',         icon: '⛽' },
];

// Default images per vehicle type (SVG data-URIs or Unsplash fallbacks)
export const VEHICLE_TYPE_DEFAULTS = {
  'Motorbike':          'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80',
  'Small Car':          'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&auto=format&fit=crop&q=80',
  'LDV':                'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80',
  'Bakkie':             'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80',
  'Coldroom Bakkie':    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
  '1-3 Ton Truck':      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80',
  'Furniture Truck':    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
  '4-8 Ton Truck':      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&auto=format&fit=crop&q=80',
  'Box Truck':          'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&auto=format&fit=crop&q=80',
  'Flatbed Truck':      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&auto=format&fit=crop&q=80',
  'Dropside Truck':     'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&auto=format&fit=crop&q=80',
  'Curtain Side Truck': 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&auto=format&fit=crop&q=80',
  'Crane Truck':        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
  'Tipper Truck':       'https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=400&auto=format&fit=crop&q=80',
  'Side Tipper':        'https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=400&auto=format&fit=crop&q=80',
  'Water Tanker':       'https://images.unsplash.com/photo-1567416661576-659a05d5e978?w=400&auto=format&fit=crop&q=80',
  'Fuel Tanker':        'https://images.unsplash.com/photo-1567416661576-659a05d5e978?w=400&auto=format&fit=crop&q=80',
};

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

// Helper: get the default image for a given vehicle type string
export function getVehicleImage(photoUrl, vehicleType) {
  if (photoUrl) {
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${API_BASE}${photoUrl}`;
  }
  return VEHICLE_TYPE_DEFAULTS[vehicleType] || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80';
}

// Helper: get type label from value
export function getVehicleTypeLabel(value) {
  const found = VEHICLE_TYPES.find(t => t.value === value);
  return found ? found.label : value;
}
