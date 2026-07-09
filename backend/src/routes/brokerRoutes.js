const express = require('express');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const {
  getQuoteRequests,
  submitQuote,
  getAssignedLoads,
  getDashboardStats,
  getCommissions,
  getCustomers,
  assignFleet,
  assignDriver,
  getApprovedFleetOwners,
  getApprovedDrivers
} = require('../controllers/brokerController');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('BROKER'));

router.get('/dashboard', getDashboardStats);
router.get('/quotes/requests', getQuoteRequests);
router.post('/quotes/:bookingId', submitQuote);
router.get('/assigned-loads', getAssignedLoads);
router.get('/commissions', getCommissions);
router.get('/customers', getCustomers);
router.post('/bookings/:id/assign-fleet', assignFleet);
router.post('/bookings/:id/assign-driver', assignDriver);
router.get('/fleet-owners', getApprovedFleetOwners);
router.get('/drivers', getApprovedDrivers);

module.exports = router;
