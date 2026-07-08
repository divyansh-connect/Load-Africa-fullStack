const express = require('express');
const { 
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
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth and admin role requirement to all admin routes
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// User Approval & Management Endpoints
router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/role', getUsersByRole);
router.get('/users/:id', getUserById);
router.get('/pending-users', getPendingUsers);
router.post('/users/approve/:userId', approveUser);
router.post('/users/reject/:userId', rejectUser);

// Booking Management
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.post('/bookings/:id/assign', assignProvider);
router.delete('/bookings/:id', deleteBooking);

// Legacy/Specific Entity Approvals
router.post('/kyc/approve/:driverId', approveDriverKYC);
router.post('/fleet/approve/:fleetId', approveFleetOwner);
router.post('/vehicle/approve/:vehicleId', approveVehicle);
router.post('/plant/approve/:plantId', approvePlantOwner);
router.post('/machine/approve/:machineId', approveMachine);

// Delete User
router.delete('/users/:userId', deleteUser);

module.exports = router;
