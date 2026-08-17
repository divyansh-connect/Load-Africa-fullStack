const { recommendVehicles } = require('../services/pricingService');
const { createBooking: createBookingService } = require('../services/bookingService');
const { searchAndAssignDriver } = require('../services/driverDispatchService');

const { prisma } = require('../config/db');

/**
 * Handles generating a quote recommendation (Step 4 of Booking Wizard)
 */
const getQuoteRecommendations = async (req, res, next) => {
  try {
    const { distanceKm, weightKg, requirements } = req.body;

    if (!distanceKm || !weightKg) {
      return res.status(400).json({ success: false, message: 'Distance and weight are required.' });
    }

    const options = recommendVehicles(Number(distanceKm), Number(weightKg), requirements || []);

    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Handles finalizing the booking request
 */
const createBooking = async (req, res, next) => {
  await createBookingService(req, res, next);
};

/**
 * GET /api/v1/bookings/history
 * Fetch customer booking history with filters
 */
const getCustomerBookingsHistory = async (req, res, next) => {
  try {
    // Get the customer ID from the authenticated user
    let customer_id = req.user?.customer?.id;
    
    // If not directly attached by middleware, look it up from user ID
    if (!customer_id && req.user?.id) {
      const customer = await prisma.customer.findUnique({
        where: { user_id: req.user.id }
      });
      customer_id = customer?.id;
    }

    if (!customer_id) {
      return res.status(401).json({ success: false, message: 'Customer profile not found for this account.' });
    }

    const { status, search, vehicleType } = req.query;

    const whereClause = { customer_id, is_deleted: false };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { cargo_name: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (vehicleType) {
      whereClause.requested_vehicle = vehicleType;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        quotes: { orderBy: { created_at: 'desc' }, take: 1 },
        assignments: {
          include: { 
            driver: { include: { user: true } }, 
            fleet_owner: { include: { user: true } }, 
            broker: true,
            vehicle: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/bookings/:id
 * Fetch single booking details
 */
const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        quotes: true,
        requirements: true,
        documents: true,
        invoices: true,
        telemetry: true,
        assignments: {
          include: { 
            driver: { include: { user: true } }, 
            fleet_owner: { include: { user: true } },
            broker: { include: { user: true } },
            vehicle: true
          }
        }
      }
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/v1/bookings/:id/status
 * Update booking status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const booking = await prisma.booking.findUnique({ 
      where: { id },
      include: { quotes: true, customer: true }
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status }
      });

      if (status === 'CUSTOMER_ACCEPTED' || status === 'BOOKING_CONFIRMED') {
        const acceptedQuote = await tx.quote.findFirst({
          where: { booking_id: id },
          orderBy: { created_at: 'desc' }
        });

        if (acceptedQuote && acceptedQuote.prepared_by) {
          await tx.quote.update({
            where: { id: acceptedQuote.id },
            data: { status: 'ACCEPTED' }
          });

          const broker = await tx.broker.findUnique({
            where: { user_id: acceptedQuote.prepared_by }
          });

          if (broker) {
            const existingAssignment = await tx.bookingAssignment.findFirst({
              where: { booking_id: id, broker_id: broker.id }
            });

            if (!existingAssignment) {
              await tx.bookingAssignment.create({
                data: {
                  booking_id: id,
                  broker_id: broker.id,
                  status: 'ACTIVE'
                }
              });
            }
          }
        }
      }

      // Tracking History
      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status,
          remarks,
          updated_by: req.user?.id || 'SYSTEM'
        }
      });

      // Activity Log
      await tx.activityLog.create({
        data: {
          user_id: req.user?.id,
          action: `STATUS_UPDATED_${status}`,
          description: `Booking ${id} status updated to ${status}. ${remarks || ''}`
        }
      });

      // Auto-generate invoice and pay split if status becomes COMPLETED
      if (status === 'COMPLETED') {
        const existingInvoice = await tx.invoice.findFirst({
          where: { booking_id: id }
        });
        
        if (!existingInvoice) {
          const grandTotal = booking.quotes.length > 0 ? Number(booking.quotes[0].grand_total) : 1500;
          const platformComm = grandTotal * 0.10;
          const payoutAmount = grandTotal * 0.90;

          const invoice = await tx.invoice.create({
            data: {
              invoice_no: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
              booking_id: id,
              customer_id: booking.customer_id,
              amount: grandTotal - platformComm,
              tax_amount: 0,
              total_amount: grandTotal,
              platform_commission: platformComm,
              payout_amount: payoutAmount,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
              status: 'PAID'
            }
          });

          // Create mock Payment confirmation
          await tx.payment.create({
            data: {
              invoice_id: invoice.id,
              amount: grandTotal,
              payment_method: 'CARD',
              transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'PAID'
            }
          });

          // Resolve Transporter to credit payout to their Wallet!
          const assignment = await tx.bookingAssignment.findFirst({
            where: { booking_id: id, status: 'ACTIVE' }
          });

          let payeeUserId = null;
          if (assignment) {
            if (assignment.fleet_owner_id) {
              const fleetOwner = await tx.fleetOwner.findUnique({
                where: { id: assignment.fleet_owner_id }
              });
              if (fleetOwner) payeeUserId = fleetOwner.user_id;
            } else if (assignment.driver_id) {
              const driver = await tx.driver.findUnique({
                where: { id: assignment.driver_id }
              });
              if (driver) payeeUserId = driver.user_id;

              await tx.driver.update({
                where: { id: assignment.driver_id },
                data: { status: 'AVAILABLE' }
              });
            }
          }

          if (payeeUserId) {
            let wallet = await tx.wallet.findFirst({
              where: { user_id: payeeUserId }
            });

            if (!wallet) {
              wallet = await tx.wallet.create({
                data: {
                  user_id: payeeUserId,
                  balance: 0,
                  pending_balance: 0
                }
              });
            }

            await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: { increment: payoutAmount }
              }
            });

            await tx.walletTransaction.create({
              data: {
                wallet_id: wallet.id,
                type: 'CREDIT',
                amount: payoutAmount,
                description: `Payout for load delivery (Booking ID: ${id.slice(0, 8)})`,
                reference_id: id
              }
            });
          }
        }
      }

      return b;
    });

    // Automatically search for a driver after the customer accepts the quote
    if (status === 'CUSTOMER_ACCEPTED') {
      // Run asynchronously without blocking the response
      searchAndAssignDriver(id).catch(err => console.error('Automated dispatch failed:', err));
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBookingTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await prisma.trackingHistory.findMany({
      where: { booking_id: id },
      orderBy: { timestamp: 'asc' }
    });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const driverId = req.user?.driver?.id;
    const fleetOwnerId = req.user?.fleet_owner?.id;

    const updated = await prisma.$transaction(async (tx) => {
      // Find the pending assignment for this driver or fleet owner
      const assignment = await tx.bookingAssignment.findFirst({
        where: {
          booking_id: id,
          OR: [
            driverId ? { driver_id: driverId } : undefined,
            fleetOwnerId ? { fleet_owner_id: fleetOwnerId } : undefined
          ].filter(Boolean),
          status: 'PENDING'
        }
      });

      if (assignment) {
        await tx.bookingAssignment.update({
          where: { id: assignment.id },
          data: { status: 'ACTIVE' }
        });
      }

      // The new upfront payment flow:
      // Driver accepts -> Status becomes PAYMENT_PENDING -> Customer pays upfront -> Status becomes DRIVER_ASSIGNED
      const newStatus = 'PAYMENT_PENDING';

      const b = await tx.booking.update({
        where: { id },
        data: { status: newStatus },
        include: { quotes: { orderBy: { created_at: 'desc' }, take: 1 } }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: newStatus,
          remarks: req.user?.role === 'DRIVER' ? 'Driver accepted. Awaiting upfront customer payment.' : 'Fleet Owner accepted. Awaiting upfront customer payment.',
          updated_by: req.user?.id || 'SYSTEM'
        }
      });
      
      // Auto-generate invoice for upfront payment if not exists
      const existingInvoice = await tx.invoice.findFirst({
        where: { booking_id: id }
      });
      
      if (!existingInvoice) {
        const payoutAmount = b.quotes.length > 0 ? Number(b.quotes[0].grand_total) : 1500;
        const platformComm = payoutAmount * 0.10;
        const driverPayout = payoutAmount * 0.90;

        await tx.invoice.create({
          data: {
            invoice_no: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
            booking_id: id,
            customer_id: b.customer_id,
            amount: payoutAmount - platformComm,
            tax_amount: 0,
            total_amount: payoutAmount,
            platform_commission: platformComm,
            payout_amount: driverPayout,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
            status: 'PENDING'
          }
        });
      }

      return b;
    });

    res.status(200).json({ success: true, data: updated, message: 'Booking assignment accepted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const driverId = req.user?.driver?.id;
    const fleetOwnerId = req.user?.fleet_owner?.id;
    const newStatus = 'DRIVER_SEARCHING';
    
    const updated = await prisma.$transaction(async (tx) => {
      // Find and mark the pending assignment as REJECTED instead of deleting it
      await tx.bookingAssignment.updateMany({
        where: {
          booking_id: id,
          OR: [
            driverId ? { driver_id: driverId } : undefined,
            fleetOwnerId ? { fleet_owner_id: fleetOwnerId } : undefined
          ].filter(Boolean),
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });

      const b = await tx.booking.update({
        where: { id },
        data: { status: newStatus }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: newStatus,
          remarks: req.user?.role === 'DRIVER' ? 'Driver rejected the trip assignment. Searching for new driver.' : 'Fleet Owner rejected the assignment. Searching for new transporter.',
          updated_by: req.user?.id || 'SYSTEM'
        }
      });
      return b;
    });

    // Automatically search for the next available driver
    searchAndAssignDriver(id).catch(err => console.error('Automated dispatch failed:', err));

    res.status(200).json({ success: true, data: updated, message: 'Booking assignment rejected' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuoteRecommendations,
  createBooking,
  getCustomerBookingsHistory,
  getBookingDetails,
  updateBookingStatus,
  getBookingTimeline,
  acceptBooking,
  rejectBooking
};
