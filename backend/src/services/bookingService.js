const { prisma } = require('../config/db');

const createBooking = async (req, res, next) => {
  try {
    const {
      guest_email, guest_phone, guest_company,
      cargo_name, cargo_category, description, weight, volume, quantity,
      pickup_address, pickup_coords_lat, pickup_coords_lng, pickup_date, pickup_contact, pickup_instructions,
      delivery_address, delivery_coords_lat, delivery_coords_lng, delivery_date, delivery_contact, delivery_instructions,
      requested_vehicle, estimated_distance,
      requirements, // array of strings
      quote // object containing breakdown
    } = req.body;

    // Optional customer_id if logged in
    const customer_id = req.user ? req.user.customer?.id : null;

    // We use a Prisma transaction to ensure Booking, Requirements, and Quote are saved atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Booking
      const booking = await tx.booking.create({
        data: {
          customer_id,
          guest_email, guest_phone, guest_company,
          cargo_name, cargo_category, description, weight, volume, quantity,
          pickup_address, pickup_coords_lat, pickup_coords_lng, pickup_date: new Date(pickup_date), pickup_contact, pickup_instructions,
          delivery_address, delivery_coords_lat, delivery_coords_lng, delivery_date: new Date(delivery_date), delivery_contact, delivery_instructions,
          requested_vehicle, estimated_distance,
          status: 'QUOTE_REQUESTED'
        }
      });

      // 2. Create Requirements
      if (requirements && requirements.length > 0) {
        const reqData = requirements.map(r => ({
          booking_id: booking.id,
          tag: r
        }));
        await tx.bookingRequirement.createMany({ data: reqData });
      }

      // 3. Create Quote (if calculated on frontend, we store it as DRAFT or ISSUED)
      if (quote) {
        await tx.quote.create({
          data: {
            booking_id: booking.id,
            distance_cost: quote.distance_cost || 0,
            vehicle_rate: quote.vehicle_rate || 0,
            weight_charges: quote.weight_charges || 0,
            fuel_charges: quote.fuel_charges || 0,
            insurance_charges: quote.insurance_charges || 0,
            hazard_charge: quote.hazard_charge || 0,
            platform_fee: quote.platform_fee || 0,
            broker_fee: quote.broker_fee || 0,
            tax: quote.tax || 0,
            discount: quote.discount || 0,
            grand_total: quote.grand_total,
            status: 'DRAFT'
          }
        });
      }

      // 4. Activity Log
      await tx.activityLog.create({
        data: {
          user_id: req.user ? req.user.id : null,
          action: 'BOOKING_CREATED',
          description: `Quote requested for booking ${booking.id}`,
        }
      });

      return booking;
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking
};
