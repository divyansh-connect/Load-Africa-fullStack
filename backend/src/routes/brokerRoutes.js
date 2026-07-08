const express = require('express');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const {
  getQuoteRequests,
  submitQuote,
  getAssignedLoads,
  getDashboardStats,
  getCommissions,
  getCustomers
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

module.exports = router;
