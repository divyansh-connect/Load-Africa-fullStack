const express = require('express');
const { getDashboard } = require('../controllers/customerController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth and role middleware to all routes in this file
router.use(requireAuth);
router.use(requireRole(['CUSTOMER']));

router.get('/dashboard', getDashboard);

module.exports = router;
