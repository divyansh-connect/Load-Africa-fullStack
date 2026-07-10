const { prisma } = require('../config/db');

/**
 * POST /api/v1/bookings
 * Creates a new booking request with status QUOTE_REQUESTED.
 * NO auto-pricing is done here. Broker will prepare the official quote.
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      guest_email, guest_phone, guest_company,
      cargo_name, cargo_category, description, weight, volume, quantity,
      pickup_address, pickup_coords_lat, pickup_coords_lng, pickup_date,
      pickup_contact, pickup_instructions,
      delivery_address, delivery_coords_lat, delivery_coords_lng, delivery_date,
      delivery_contact, delivery_instructions,
      requested_vehicle, estimated_distance, estimated_duration_mins,
      requirements,
      is_urgent,
      loading_assistance,
      unloading_assistance,
      night_pickup,
    } = req.body;

    // Get customer_id from authenticated user
    let customer_id = req.user?.customer?.id;
    if (!customer_id && req.user?.id) {
      const customer = await prisma.customer.findUnique({
        where: { user_id: req.user.id }
      });
      customer_id = customer?.id;
    }

    // Sanitise numeric inputs
    const lat1 = pickup_coords_lat ? parseFloat(pickup_coords_lat) : null;
    const lon1 = pickup_coords_lng ? parseFloat(pickup_coords_lng) : null;
    const lat2 = delivery_coords_lat ? parseFloat(delivery_coords_lat) : null;
    const lon2 = delivery_coords_lng ? parseFloat(delivery_coords_lng) : null;
    
    let distanceKm = estimated_distance ? parseFloat(estimated_distance) : null;
    let durationMins = estimated_duration_mins ? parseFloat(estimated_duration_mins) : null;
    let routePolylineStr = null;

    if (lat1 && lon1 && lat2 && lon2) {
      try {
        const axios = require('axios');
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
        const response = await axios.get(url);
        if (response.data && response.data.routes && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          distanceKm = parseFloat((route.distance / 1000).toFixed(2));
          durationMins = parseFloat((route.duration / 60).toFixed(1));
          
          const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          routePolylineStr = JSON.stringify(coords);
        }
      } catch (err) {
        console.error('Backend OSRM Route Calculation Error:', err);
      }
    }

    // Build requirements tags
    const requirementTags = [];
    if (is_urgent) requirementTags.push('URGENT');
    if (loading_assistance) requirementTags.push('LOADING_ASSISTANCE');
    if (unloading_assistance) requirementTags.push('UNLOADING_ASSISTANCE');
    if (night_pickup) requirementTags.push('NIGHT_PICKUP');
    if (requirements && Array.isArray(requirements)) {
      requirements.forEach(r => {
        if (!requirementTags.includes(r)) requirementTags.push(r);
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the booking record
      const booking = await tx.booking.create({
        data: {
          customer_id: customer_id || null,
          guest_email: guest_email || null,
          guest_phone: guest_phone || null,
          guest_company: guest_company || null,
          cargo_name: cargo_name || 'General Cargo',
          cargo_category: cargo_category || 'GENERAL',
          description: description || null,
          weight: parseFloat(weight) || 0,
          volume: volume ? parseFloat(volume) : null,
          quantity: quantity ? parseInt(quantity) : null,
          pickup_address,
          pickup_coords_lat: lat1,
          pickup_coords_lng: lon1,
          pickup_date: pickup_date ? new Date(pickup_date) : new Date(),
          pickup_contact: pickup_contact || null,
          pickup_instructions: pickup_instructions || null,
          delivery_address,
          delivery_coords_lat: lat2,
          delivery_coords_lng: lon2,
          delivery_date: delivery_date ? new Date(delivery_date) : new Date(Date.now() + 86400000),
          delivery_contact: delivery_contact || null,
          delivery_instructions: delivery_instructions || null,
          requested_vehicle: requested_vehicle || null,
          estimated_distance: distanceKm,
          estimated_duration: durationMins,
          route_polyline: routePolylineStr,
          status: 'QUOTE_REQUESTED',
        }
      });

      // 2. Store requirement tags
      if (requirementTags.length > 0) {
        await tx.bookingRequirement.createMany({
          data: requirementTags.map(tag => ({
            booking_id: booking.id,
            tag,
          }))
        });
      }

      // 3. Tracking history entry
      await tx.trackingHistory.create({
        data: {
          booking_id: booking.id,
          status: 'QUOTE_REQUESTED',
          remarks: `Booking request submitted by customer. Route: ${pickup_address} → ${delivery_address}. Distance: ${distanceKm ? distanceKm.toFixed(1) + ' km' : 'TBD'}. Awaiting broker quotation.`,
          updated_by: req.user ? req.user.id : 'SYSTEM',
        }
      });

      // 4. Activity log
      await tx.activityLog.create({
        data: {
          user_id: req.user ? req.user.id : null,
          action: 'BOOKING_CREATED',
          description: `Booking ${booking.id} created. Status: QUOTE_REQUESTED. Awaiting broker to prepare official quotation.`,
        }
      });

      return booking;
    });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. A broker will prepare your quotation shortly.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking };
