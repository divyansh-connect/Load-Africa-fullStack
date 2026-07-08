const { prisma } = require('../config/db');

// Helper to get fleet owner ID
const getFleetOwnerId = async (req) => {
  if (req.user && req.user.role === 'FLEET_OWNER') {
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { user_id: req.user.id }
    });
    if (fleetOwner) return fleetOwner.id;
  }
  // Mock fallback for development if auth isn't fully wired
  const fallback = await prisma.fleetOwner.findFirst();
  if (fallback) return fallback.id;
  throw new Error('Fleet Owner not found');
};

const getDashboard = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id: fleetOwnerId },
      include: {
        user: true,
        vehicles: true,
        drivers: true
      }
    });

    if (!fleetOwner) return res.status(404).json({ success: false, message: 'Fleet Owner not found' });

    res.status(200).json({
      success: true,
      data: fleetOwner
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
    const { registration_number, vehicle_type, capacity, vehicle_documents, category_id } = req.body;

    // Use a default category if none provided for mockup
    let finalCategoryId = category_id;
    if (!finalCategoryId) {
      const category = await prisma.vehicleCategory.findFirst();
      if (!category) throw new Error('No vehicle categories available');
      finalCategoryId = category.id;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        fleet_owner_id: fleetOwnerId,
        category_id: finalCategoryId,
        registration_number,
        vehicle_type,
        capacity: parseFloat(capacity) || 0,
        status: 'UNDER_REVIEW',
        vehicle_documents
      }
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addDriver = async (req, res) => {
  try {
    const fleetOwnerId = await getFleetOwnerId(req);
    const { first_name, last_name, email, phone, license, pdp, id_document } = req.body;

    // Create user and driver
    const user = await prisma.user.create({
      data: {
        email,
        password: 'password123', // mockup password
        role: 'DRIVER',
        first_name,
        last_name,
        phone
      }
    });

    const driver = await prisma.driver.create({
      data: {
        user_id: user.id,
        fleet_owner_id: fleetOwnerId,
        license,
        pdp,
        id_document,
        status: 'UNDER_REVIEW'
      }
    });

    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  submitCompliance,
  addVehicle,
  addDriver
};
