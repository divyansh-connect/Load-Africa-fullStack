const express = require('express');
const { verifyPODAndReleasePayment, withdrawEarnings, getWallet, processPayment, approveWithdrawal } = require('../controllers/financeController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/verify-pod/:bookingId', verifyPODAndReleasePayment);
router.post('/withdraw', requireAuth, withdrawEarnings);
router.get('/wallet', requireAuth, getWallet);

// Payment Simulation Endpoint
router.post('/process-payment', requireAuth, processPayment);

// Admin approve withdrawal
router.post('/withdraw/approve', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), approveWithdrawal);

module.exports = router;
