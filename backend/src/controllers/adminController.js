const { prisma } = require('../config/db');

const approveDriverKYC = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Typically this would be protected by admin auth middleware.
    
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status: 'ACTIVE' // Approved and Active in the marketplace
      }
    });

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveFleetOwner = async (req, res) => {
  try {
    const { fleetId } = req.params;
    const fleetOwner = await prisma.fleetOwner.update({
      where: { id: fleetId },
      data: { status: 'ACTIVE' }
    });
    res.status(200).json({ success: true, data: fleetOwner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'AVAILABLE' } // Approved and ready
    });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approvePlantOwner = async (req, res) => {
  try {
    const { plantId } = req.params;
    const plantOwner = await prisma.plantOwner.update({
      where: { id: plantId },
      data: { status: 'ACTIVE' }
    });
    await prisma.auditLog.create({
      data: { entity_type: 'PlantOwner', entity_id: plantId, action: 'APPROVED', new_value: 'ACTIVE' }
    });
    res.status(200).json({ success: true, data: plantOwner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const machine = await prisma.machine.update({
      where: { id: machineId },
      data: { status: 'APPROVED' }
    });
    await prisma.auditLog.create({
      data: { entity_type: 'Machine', entity_id: machineId, action: 'APPROVED', new_value: 'APPROVED' }
    });
    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING', is_deleted: false },
      include: {
        driver: true,
        fleet_owner: true,
        plant_owner: true,
        broker: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' }
      });

      if (user.role === 'DRIVER') {
        await tx.driver.update({ where: { user_id: userId }, data: { status: 'ACTIVE' }});
      } else if (user.role === 'FLEET_OWNER') {
        await tx.fleetOwner.update({ where: { user_id: userId }, data: { status: 'ACTIVE' }});
      } else if (user.role === 'PLANT_OWNER') {
        await tx.plantOwner.update({ where: { user_id: userId }, data: { status: 'ACTIVE' }});
      }

      await tx.activityLog.create({
        data: {
          user_id: req.user.id,
          action: 'USER_APPROVED',
          description: `Admin approved user ${user.email}`
        }
      });
    });

    res.status(200).json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: 'REJECTED' }
      });

      if (user.role === 'DRIVER') {
        await tx.driver.update({ where: { user_id: userId }, data: { status: 'REJECTED' }});
      } else if (user.role === 'FLEET_OWNER') {
        await tx.fleetOwner.update({ where: { user_id: userId }, data: { status: 'REJECTED' }});
      } else if (user.role === 'PLANT_OWNER') {
        await tx.plantOwner.update({ where: { user_id: userId }, data: { status: 'REJECTED' }});
      }

      await tx.activityLog.create({
        data: {
          user_id: req.user.id,
          action: 'USER_REJECTED',
          description: `Admin rejected user ${user.email}`
        }
      });
    });

    res.status(200).json({ success: true, message: 'User rejected successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { is_deleted: false },
      include: {
        customer: true,
        driver: true,
        fleet_owner: true,
        plant_owner: true,
        broker: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const customersCount = await prisma.user.count({ where: { role: 'CUSTOMER', is_deleted: false } });
    const driversCount = await prisma.user.count({ where: { role: 'DRIVER', is_deleted: false } });
    const fleetCount = await prisma.user.count({ where: { role: 'FLEET_OWNER', is_deleted: false } });
    const plantCount = await prisma.user.count({ where: { role: 'PLANT_OWNER', is_deleted: false } });
    const pendingCount = await prisma.user.count({ where: { status: 'PENDING', is_deleted: false } });
    
    // For today's bookings:
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayBookingsCount = await prisma.booking.count({ 
      where: { created_at: { gte: startOfDay }, is_deleted: false } 
    });

    const activeTripsCount = await prisma.booking.count({ 
      where: { 
        status: { in: ['IN_TRANSIT', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'PICKED_UP', 'LOADING'] },
        is_deleted: false 
      } 
    });

    // Mock revenue for now, wait until Phase 3 for Wallet logic
    const revenueSummary = 'R 0'; 

    res.status(200).json({
      success: true,
      data: {
        customers: customersCount,
        drivers: driversCount,
        fleetAccounts: fleetCount,
        plantOwners: plantCount,
        pendingApprovals: pendingCount,
        todayBookings: todayBookingsCount,
        activeTrips: activeTripsCount,
        revenueSummary
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search = '', status } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query conditions
    const whereCondition = {
      is_deleted: false
    };

    if (role) {
      const roles = role.split(',').map(r => r.toUpperCase());
      if (roles.length > 1) {
        whereCondition.role = { in: roles };
      } else {
        whereCondition.role = roles[0];
      }
    }

    if (status) {
      whereCondition.status = status.toUpperCase();
    }

    if (search) {
      whereCondition.OR = [
        { email: { contains: search } },
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limitNum,
        include: {
          customer: true,
          driver: true,
          fleet_owner: true,
          plant_owner: true,
          broker: true,
          admin: true,
          wallets: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count({ where: whereCondition })
    ]);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, search = '', page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereCondition = {
      is_deleted: false
    };

    if (status && status !== 'All') {
      whereCondition.status = status.toUpperCase();
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search } },
        { customer: { user: { first_name: { contains: search } } } },
        { customer: { user: { last_name: { contains: search } } } },
        { customer: { company_name: { contains: search } } }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereCondition,
        skip,
        take: limitNum,
        include: {
          customer: {
            include: { user: true }
          },
          assignments: {
            include: {
              driver: { include: { user: true } },
              fleet_owner: { include: { user: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.booking.count({ where: whereCondition })
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        assignments: {
          include: {
            driver: { include: { user: true } },
            fleet_owner: { include: { user: true } },
            broker: { include: { user: true } },
            plant_owner: { include: { user: true } },
            vehicle: true,
            machine: true
          }
        },
        quotes: true,
        documents: true,
        trackings: true
      }
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const assignProvider = async (req, res) => {
  try {
    const { id } = req.params; // Booking ID
    const { driverId, fleetOwnerId, brokerId, plantOwnerId, vehicleId, machineId } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    await prisma.$transaction(async (tx) => {
      // Create assignment
      await tx.bookingAssignment.create({
        data: {
          booking_id: id,
          driver_id: driverId || null,
          fleet_owner_id: fleetOwnerId || null,
          broker_id: brokerId || null,
          plant_owner_id: plantOwnerId || null,
          vehicle_id: vehicleId || null,
          machine_id: machineId || null,
          assigned_by: req.user.id
        }
      });

      // Update Booking Status to DRIVER_ASSIGNED or similar based on provider
      let newStatus = 'DRIVER_ASSIGNED';
      
      await tx.booking.update({
        where: { id },
        data: { status: newStatus }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: newStatus,
          remarks: 'Admin assigned a provider to the booking',
          updated_by: req.user.id
        }
      });
    });

    res.status(200).json({ success: true, message: 'Provider assigned successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        driver: true,
        fleet_owner: true,
        broker: true,
        plant_owner: true,
        wallets: { include: { transactions: true } }
      }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check Wallet Balance
    if (user.wallets && user.wallets.length > 0) {
      const balance = Number(user.wallets[0].balance);
      const pending = Number(user.wallets[0].pending_balance);
      if (balance > 0 || pending > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete: User has active wallet balances or pending settlements.' });
      }
    }

    if (user.role === 'CUSTOMER') {
      const bookingsCount = await prisma.booking.count({ where: { customer_id: user.customer.id } });
      const invoiceCount = await prisma.invoice.count({ where: { customer_id: user.customer.id } });
      if (bookingsCount > 0 || invoiceCount > 0) {
        return res.status(400).json({ success: false, message: 'This customer cannot be deleted because financial records or bookings exist.' });
      }
    }

    if (user.role === 'DRIVER') {
      const activeAssignments = await prisma.bookingAssignment.count({
        where: { driver_id: user.driver.id, booking: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } } }
      });
      if (activeAssignments > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete: Driver has active or pending trips.' });
      }
    }

    if (user.role === 'FLEET_OWNER') {
      const activeAssignments = await prisma.bookingAssignment.count({
        where: { fleet_owner_id: user.fleet_owner.id, booking: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } } }
      });
      if (activeAssignments > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete: Fleet has active assigned bookings or pending payouts.' });
      }
    }

    if (user.role === 'BROKER') {
      const activeAssignments = await prisma.bookingAssignment.count({
        where: { broker_id: user.broker.id, booking: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } } }
      });
      if (activeAssignments > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete: Broker has assigned bookings or pending commissions.' });
      }
    }

    if (user.role === 'PLANT_OWNER') {
      const activeAssignments = await prisma.bookingAssignment.count({
        where: { plant_owner_id: user.plant_owner.id, booking: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } } }
      });
      if (activeAssignments > 0) {
        return res.status(400).json({ success: false, message: 'Cannot delete: Plant Owner has active jobs or equipment assigned.' });
      }
    }

    // Perform Hard Delete (or Soft Delete depending on preference, but we'll do soft delete with is_deleted flag for safety, as deleting a user might break FKs).
    // The user requested permanent delete rules, so if all constraints pass, we could delete. 
    // We'll soft delete to keep audit integrity, or hard delete if really 0 relations.
    // Let's perform a hard delete if no relations exist.
    await prisma.user.delete({ where: { id: userId } });

    await prisma.activityLog.create({
      data: {
        user_id: req.user.id,
        action: `USER_DELETED`,
        description: `Admin deleted user ${userId} (${user.email})`
      }
    });

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Never delete a completed booking.' });
    }

    if (booking.status === 'CANCELLED' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete cancelled bookings.' });
    }

    if (!['DRAFT', 'QUOTE_REQUESTED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot delete an active booking.' });
    }

    await prisma.booking.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        user_id: req.user.id,
        action: `BOOKING_DELETED`,
        description: `Admin deleted booking ${id}`
      }
    });

    res.status(200).json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: { include: { applications: true, assignments: true } },
        fleet_owner: { include: { vehicles: true, drivers: true } },
        broker: true,
        plant_owner: { include: { machines: true, operators: true } },
        wallets: true
      }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  approveDriverKYC,
  approveFleetOwner,
  approveVehicle,
  approvePlantOwner,
  approveMachine,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getDashboardStats,
  getUsersByRole,
  getUserById,
  getAllBookings,
  getBookingById,
  assignProvider,
  deleteUser,
  deleteBooking
};
