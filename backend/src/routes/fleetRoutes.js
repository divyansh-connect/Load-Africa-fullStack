const express = require('express');
const {
  getDashboard,
  submitCompliance,
  addVehicle,
  addDriver
} = require('../controllers/fleetController');

const router = express.Router();

// Mock auth middleware for now
const softProtect = (req, res, next) => {
  next();
};

router.get('/dashboard', softProtect, getDashboard);
router.post('/compliance/submit', softProtect, submitCompliance);
router.post('/vehicles', softProtect, addVehicle);
router.post('/drivers', softProtect, addDriver);

module.exports = router;
