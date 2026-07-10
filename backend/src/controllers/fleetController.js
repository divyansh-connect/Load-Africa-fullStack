const { prisma } = require('../config/db');

// Helper to get fleet owner ID STRICTLY
const getFleetOwnerId = async (req) => {
  if (!req.user || req.user.role !== 'FLEET_OWNER') {
    throw new Error('Unauthorized. Fleet Owner access required.');
  }
  const fleetOwner = await prisma.fleetOwner.findUnique({
    where: { user_id: req.user.id }
  });
  if (!fleetOwner) throw new Error('Fleet Owner profile not found');
  return fleetOwner.id;
};

const getDashboard = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id: fleetOwnerId },
      include: {
        user: true,
        vehicles: true,
        drivers: {
          include: {
            user: true,
            assigned_vehicle: true
          }
        },
        assignments: true
      }
    });

    if (!fleetOwner) return res.status(404).json({ success: false, message: 'Fleet Owner not found' });

    // Compute live values
    const totalDrivers = fleetOwner.drivers.length;
    const availableDrivers = fleetOwner.drivers.filter(d => d.status === 'AVAILABLE').length;
    const driversOnTrip = fleetOwner.drivers.filter(d => d.status === 'ON_TRIP').length;
    const inactiveDrivers = fleetOwner.drivers.filter(d => d.status === 'INACTIVE' || d.user.status === 'SUSPENDED').length;
    
    const now = new Date();
    const expiredLicenses = fleetOwner.drivers.filter(d => d.license_expiry && new Date(d.license_expiry) < now).length;

    res.status(200).json({
      success: true,
      data: fleetOwner,
      stats: {
        totalDrivers,
        availableDrivers,
        driversOnTrip,
        inactiveDrivers,
        expiredLicenses
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitCompliance = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { company_documents } = req.body;

    const fleetOwner = await prisma.fleetOwner.update({
      where: { id: fleetOwnerId },
      data: {
        status: 'UNDER_REVIEW',
        company_documents: company_documents
      }
    });

    res.status(200).json({
      success: true,
      message: 'Compliance documents submitted successfully. Account is now under review.',
      data: fleetOwner
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addVehicle = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const {
      registration_number, vehicle_type, capacity,
      photo_url, brand, model, year, vin,
      insurance_expiry, fitness_expiry,
      insurance_document, registration_document, fitness_document,
      category_id
    } = req.body;

    // category_id is optional — try to resolve one if not provided, but don't block
    let finalCategoryId = category_id || null;
    if (!finalCategoryId) {
      const category = await prisma.vehicleCategory.findFirst();
      if (category) finalCategoryId = category.id;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        fleet_owner_id: fleetOwnerId,
        category_id: finalCategoryId,          // nullable — no categories is fine
        registration_number,
        vehicle_type,
        capacity: capacity ? parseFloat(capacity) : null,
        status: 'REGISTERED',
        photo_url: photo_url || null,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year) : null,
        vin: vin || null,
        insurance_expiry: insurance_expiry ? new Date(insurance_expiry) : null,
        fitness_expiry: fitness_expiry ? new Date(fitness_expiry) : null,
        insurance_document: insurance_document || null,
        registration_document: registration_document || null,
        fitness_document: fitness_document || null,
      }
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    const code = error.code === 'P2002' ? 409 : 400;
    res.status(code).json({ success: false, message: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const vehicles = await prisma.vehicle.findMany({
      where: { fleet_owner_id: fleetOwnerId, is_deleted: false },
      include: {
        assigned_drivers: { include: { user: true } },
        assignments: {
          where: {
            status: { in: ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'IN_TRANSIT', 'ARRIVED_PICKUP', 'LOADING'] }
          },
          take: 1,
          include: { booking: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { id } = req.params;
    const {
      registration_number, vehicle_type, capacity,
      photo_url, brand, model, year, vin,
      insurance_expiry, fitness_expiry,
      insurance_document, registration_document, fitness_document
    } = req.body;

    // Verify ownership
    const existing = await prisma.vehicle.findFirst({ where: { id, fleet_owner_id: fleetOwnerId, is_deleted: false } });
    if (!existing) throw new Error('Vehicle not found');

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        registration_number,
        vehicle_type,
        capacity: capacity ? parseFloat(capacity) : null,
        photo_url: photo_url !== undefined ? photo_url : existing.photo_url,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year) : null,
        vin: vin || null,
        insurance_expiry: insurance_expiry ? new Date(insurance_expiry) : null,
        fitness_expiry: fitness_expiry ? new Date(fitness_expiry) : null,
        insurance_document: insurance_document || null,
        registration_document: registration_document || null,
        fitness_document: fitness_document || null,
      }
    });

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    const code = error.code === 'P2002' ? 409 : 400;
    res.status(code).json({ success: false, message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, fleet_owner_id: fleetOwnerId, is_deleted: false },
      include: {
        assignments: {
          where: { status: { in: ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'IN_TRANSIT', 'ARRIVED_PICKUP', 'LOADING'] } }
        }
      }
    });

    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.assignments.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete: vehicle has an active booking assignment.' });
    }

    // Soft delete
    await prisma.vehicle.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }
    });

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const bcrypt = require('bcrypt');

const getDrivers = async (req, res) => {
  try {
    // Authorization check — return 403 not 400 for wrong role
    if (!req.user || req.user.role !== 'FLEET_OWNER') {
      return res.status(403).json({ success: false, message: 'Fleet Owner access required.' });
    }
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { user_id: req.user.id }
    });
    if (!fleetOwner) {
      return res.status(403).json({ success: false, message: 'Fleet Owner profile not found.' });
    }

    const drivers = await prisma.driver.findMany({
      where: { fleet_owner_id: fleetOwner.id, is_deleted: false },
      include: {
        user: true,
        assigned_vehicle: true
      }
    });
    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addDriver = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { first_name, last_name, email, phone, password, license, license_expiry, driving_category, national_id, address, emergency_contact, documents, status, avatar } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email is already registered');

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'DRIVER',
          status: 'PENDING',
          first_name,
          last_name,
          phone,
          avatar: avatar || documents?.photo || null
        }
      });

      const driver = await tx.driver.create({
        data: {
          user_id: user.id,
          fleet_owner_id: fleetOwnerId,
          license,
          license_expiry: license_expiry ? new Date(license_expiry) : null,
          driving_category,
          national_id,
          address,
          emergency_contact,
          documents,
          status: 'AVAILABLE'
        }
      });
      return driver;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { id } = req.params;
    const { first_name, last_name, email, phone, license, license_expiry, driving_category, national_id, address, status, avatar } = req.body;

    const driver = await prisma.driver.findFirst({
      where: { id, fleet_owner_id: fleetOwnerId }
    });

    if (!driver) throw new Error('Driver not found');

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: driver.user_id } }
      });
      if (existingUser) throw new Error('Email is already in use');
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: driver.user_id },
        data: {
          first_name,
          last_name,
          email,
          phone,
          avatar: avatar !== undefined ? avatar : undefined,
          status: status
        }
      });

      const updatedDriver = await tx.driver.update({
        where: { id: driver.id },
        data: {
          license,
          license_expiry: license_expiry ? new Date(license_expiry) : null,
          driving_category,
          national_id,
          address
        }
      });

      return updatedDriver;
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { id } = req.params;
    const { status } = req.body;

    const driver = await prisma.driver.findFirst({
      where: { id, fleet_owner_id: fleetOwnerId },
      include: { user: true }
    });

    if (!driver) throw new Error('Driver not found');

    const updatedUser = await prisma.user.update({
      where: { id: driver.user_id },
      data: { status }
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { id } = req.params;

    const driver = await prisma.driver.findFirst({
      where: { id, fleet_owner_id: fleetOwnerId },
      include: { assignments: true }
    });

    if (!driver) throw new Error('Driver not found');

    const activeAssignment = driver.assignments.find(a => ['DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'ARRIVED_PICKUP', 'LOADING', 'IN_TRANSIT'].includes(a.status));
    if (activeAssignment) {
      return res.status(400).json({ success: false, message: 'This driver cannot be deleted because an active booking is assigned.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.driver.delete({ where: { id: driver.id } });
      await tx.user.delete({ where: { id: driver.user_id } });
    });

    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getLoads = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);

    const assignments = await prisma.bookingAssignment.findMany({
      where: { fleet_owner_id: fleetOwnerId },
      include: {
        booking: {
          include: { customer: { include: { user: true } } }
        },
        driver: { include: { user: true } },
        vehicle: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const acceptAndDispatch = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { id } = req.params;
    const { driverId, vehicleId } = req.body;

    const assignment = await prisma.bookingAssignment.findFirst({
      where: { booking_id: id, fleet_owner_id: fleetOwnerId }
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Load assignment not found for this fleet owner.' });
    }

    const driver = await prisma.driver.findFirst({
      where: { id: driverId, fleet_owner_id: fleetOwnerId }
    });
    if (!driver) return res.status(400).json({ success: false, message: 'Selected driver does not belong to your fleet.' });

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, fleet_owner_id: fleetOwnerId }
    });
    if (!vehicle) return res.status(400).json({ success: false, message: 'Selected vehicle does not belong to your fleet.' });

    await prisma.$transaction(async (tx) => {
      await tx.bookingAssignment.update({
        where: { id: assignment.id },
        data: {
          driver_id: driverId,
          vehicle_id: vehicleId,
          status: 'ACTIVE'
        }
      });

      await tx.booking.update({
        where: { id },
        data: { status: 'DRIVER_ASSIGNED' }
      });

      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'ON_TRIP' }
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'ON_TRIP' }
      });

      await tx.trackingHistory.create({
        data: {
          booking_id: id,
          status: 'DRIVER_ASSIGNED',
          remarks: 'Fleet Owner accepted load and dispatched vehicle + driver.',
          updated_by: req.user.id
        }
      });
    });

    res.status(200).json({ success: true, message: 'Load dispatched successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id: fleetOwnerId },
      include: { user: true }
    });

    if (!fleetOwner) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({
      success: true,
      data: {
        first_name: fleetOwner.user.first_name || '',
        last_name: fleetOwner.user.last_name || '',
        email: fleetOwner.user.email,
        phone: fleetOwner.user.phone || '',
        avatar: fleetOwner.user.avatar || '',
        company_name: fleetOwner.company_name,
        company_registration: fleetOwner.company_registration,
        tax_number: fleetOwner.tax_number || '',
        address: fleetOwner.address || ''
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { first_name, last_name, phone, company_name, company_registration, tax_number, address, avatar } = req.body;

    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id: fleetOwnerId }
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: fleetOwner.user_id },
        data: {
          first_name: first_name !== undefined ? first_name : undefined,
          last_name: last_name !== undefined ? last_name : undefined,
          phone: phone !== undefined ? phone : undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        }
      });

      await tx.fleetOwner.update({
        where: { id: fleetOwnerId },
        data: {
          company_name: company_name !== undefined ? company_name : undefined,
          company_registration: company_registration !== undefined ? company_registration : undefined,
          tax_number: tax_number !== undefined ? tax_number : undefined,
          address: address !== undefined ? address : undefined,
        }
      });
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  submitCompliance,
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  getDrivers,
  addDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
  getLoads,
  acceptAndDispatch,
  getProfile,
  updateProfile
};
