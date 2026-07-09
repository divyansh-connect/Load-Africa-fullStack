const { prisma } = require('../config/db');

// Helper to get plant owner ID (auto-creates PlantOwner if missing)
const getPlantOwnerId = async (req) => {
  if (req.user && req.user.role === 'PLANT_OWNER') {
    let plantOwner = await prisma.plantOwner.findUnique({
      where: { user_id: req.user.id }
    });
    if (plantOwner) return plantOwner.id;

    // Auto-create PlantOwner record if user has PLANT_OWNER role but no profile yet
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    plantOwner = await prisma.plantOwner.create({
      data: {
        user_id: req.user.id,
        company_name: user ? `${user.first_name || 'Plant'} ${user.last_name || 'Owner'}` : 'Plant Owner',
        status: 'ACTIVE'
      }
    });
    return plantOwner.id;
  }
  throw new Error('Plant Owner not found or unauthorized');
};

const getDashboard = async (req, res) => {
  try {
    const plantOwnerId = await getPlantOwnerId(req);
    const plantOwner = await prisma.plantOwner.findUnique({
      where: { id: plantOwnerId },
      include: {
        user: true,
        machines: true,
        operators: true,
        hire_requests: {
          include: {
            booking: true
          }
        }
      }
    });

    if (!plantOwner) return res.status(404).json({ success: false, message: 'Plant Owner not found' });

    res.status(200).json({
      success: true,
      data: plantOwner
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitCompliance = async (req, res) => {
  try {
    const plantOwnerId = await getPlantOwnerId(req);
    const { company_documents } = req.body;

    const plantOwner = await prisma.plantOwner.update({
      where: { id: plantOwnerId },
      data: {
        status: 'UNDER_REVIEW',
        company_documents
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        entity_type: 'PlantOwner',
        entity_id: plantOwnerId,
        action: 'SUBMIT_COMPLIANCE',
        new_value: 'UNDER_REVIEW'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Compliance documents submitted successfully. Account is now under review.',
      data: plantOwner
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addMachine = async (req, res) => {
  try {
    const plantOwnerId = await getPlantOwnerId(req);
    const { type, capacity, registration_number, machine_documents } = req.body;

    const plantOwner = await prisma.plantOwner.findUnique({ where: { id: plantOwnerId } });
    const initialStatus = plantOwner?.status === 'ACTIVE' ? 'AVAILABLE' : 'CREATED';

    const machine = await prisma.machine.create({
      data: {
        plant_owner_id: plantOwnerId,
        type,
        capacity: parseFloat(capacity) || 0,
        registration_number,
        status: initialStatus,
        machine_documents
      }
    });

    res.status(201).json({ success: true, data: machine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const acceptHireRequest = async (req, res) => {
  try {
    const plantOwnerId = await getPlantOwnerId(req);
    const { requestId } = req.params;
    const { machine_id, operator_id } = req.body;

    const plantOwner = await prisma.plantOwner.findUnique({ where: { id: plantOwnerId } });
    if (plantOwner.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Plant Owner account is not active.' });
    }

    const machine = await prisma.machine.findUnique({ where: { id: machine_id } });
    if (!machine || machine.status !== 'APPROVED') {
      return res.status(403).json({ success: false, message: 'Machine is not approved or not found.' });
    }

    const request = await prisma.hireRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    // Assign to booking
    const assignment = await prisma.bookingAssignment.create({
      data: {
        booking_id: request.booking_id,
        plant_owner_id: plantOwnerId,
        machine_id,
        operator_id
      }
    });

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPublicMachines = async (req, res) => {
  try {
    const machines = await prisma.machine.findMany({
      where: {
        status: { in: ['AVAILABLE', 'APPROVED', 'ACTIVE'] }
      },
      include: {
        plant_owner: {
          select: {
            company_name: true,
            status: true
          }
        }
      }
    });
    res.status(200).json({ success: true, data: machines });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  submitCompliance,
  addMachine,
  acceptHireRequest,
  getPublicMachines
};
