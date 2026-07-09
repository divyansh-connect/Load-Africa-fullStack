const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  getAvailableLoads,
  applyForLoad,
  getActiveTrip,
  updateTripStatus,
  getDriverHistory,
  getDriverDashboard,
  submitKYC,
  getProfile,
  updateProfile,
  completeOnboarding
} = require('../controllers/driverController');

const router = express.Router();

router.get('/available-loads', requireAuth, getAvailableLoads);
router.post('/apply/:bookingId', requireAuth, applyForLoad);
router.get('/active-trip', requireAuth, getActiveTrip);
router.patch('/status/:bookingId', requireAuth, updateTripStatus);
router.get('/history', requireAuth, getDriverHistory);
router.get('/dashboard', requireAuth, getDriverDashboard);
router.post('/kyc/submit', requireAuth, submitKYC);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.post('/onboarding/complete', requireAuth, completeOnboarding);

module.exports = router;
