/**
 * Enterprise Pricing Engine for Logistics
 * Simulates real-time quotation logic based on distance, weight, and vehicle category.
 */

// Simulated vehicle base rates (per km)
const VEHICLE_RATES = {
  'Light Duty': { base_price_per_km: 12, capacity: 2000, speed_kmh: 60, badges: ['Cheapest'] },
  'Medium Duty': { base_price_per_km: 18, capacity: 8000, speed_kmh: 70, badges: ['Recommended'] },
  'Heavy Duty': { base_price_per_km: 30, capacity: 34000, speed_kmh: 80, badges: ['Fastest'] },
  'Refrigerated': { base_price_per_km: 25, capacity: 15000, speed_kmh: 65, badges: ['Premium'] },
};

/**
 * Calculates a detailed quote for a given distance, weight, and vehicle.
 */
const calculateDetailedQuote = (distanceKm, weightKg, vehicleType, requirements = []) => {
  const vehicle = VEHICLE_RATES[vehicleType];
  if (!vehicle) throw new Error('Invalid vehicle type for quotation');

  if (weightKg > vehicle.capacity) {
    throw new Error('Weight exceeds vehicle capacity');
  }

  const baseFare = distanceKm * vehicle.base_price_per_km;
  const weightCharge = (weightKg / 1000) * 1.5; // 1.5 per ton
  
  // Fuel Surcharge (10% of base)
  const fuelSurcharge = baseFare * 0.10;
  
  // Tolls (simulated: 1 toll every 100km at R50 each)
  const tollCharges = Math.floor(distanceKm / 100) * 50;

  // Extra Requirements
  let insuranceCharge = 0;
  if (requirements.includes('INSURANCE')) {
    insuranceCharge = (baseFare + weightCharge) * 0.05; // 5% of subtotal
  }

  const subtotal = baseFare + weightCharge + fuelSurcharge + tollCharges + insuranceCharge;
  const platformFee = subtotal * 0.08; // 8% LoadAfrica Platform Fee
  
  const tax = (subtotal + platformFee) * 0.15; // 15% VAT
  const discount = 0;

  const grandTotal = subtotal + platformFee + tax - discount;

  // Calculate ETA (simple duration)
  const durationHours = distanceKm / vehicle.speed_kmh;
  const deliveryTime = new Date();
  deliveryTime.setHours(deliveryTime.getHours() + durationHours);

  return {
    vehicle_type: vehicleType,
    capacity_kg: vehicle.capacity,
    eta_hours: durationHours.toFixed(1),
    estimated_delivery: deliveryTime,
    badges: vehicle.badges,
    breakdown: {
      distance_km: distanceKm,
      base_fare: parseFloat(baseFare.toFixed(2)),
      weight_charges: parseFloat(weightCharge.toFixed(2)),
      fuel_surcharge: parseFloat(fuelSurcharge.toFixed(2)),
      toll_charges: parseFloat(tollCharges.toFixed(2)),
      insurance: parseFloat(insuranceCharge.toFixed(2)),
      platform_fee: parseFloat(platformFee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      grand_total: parseFloat(grandTotal.toFixed(2))
    }
  };
};

/**
 * Recommends available vehicles for a given route and weight.
 */
const recommendVehicles = (distanceKm, weightKg, requirements = []) => {
  const options = [];

  for (const [type, specs] of Object.entries(VEHICLE_RATES)) {
    // Skip vehicles that can't carry the weight
    if (weightKg > specs.capacity) continue;
    
    // If temperature controlled is required, only show Refrigerated
    if (requirements.includes('TEMPERATURE_CONTROL') && type !== 'Refrigerated') continue;

    const quote = calculateDetailedQuote(distanceKm, weightKg, type, requirements);
    options.push(quote);
  }

  // Sort by cheapest grand total by default
  return options.sort((a, b) => a.breakdown.grand_total - b.breakdown.grand_total);
};

module.exports = {
  calculateDetailedQuote,
  recommendVehicles
};
