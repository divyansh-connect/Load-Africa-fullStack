const express = require('express');
const {
  getDashboard,
  submitCompliance,
  addMachine,
  acceptHireRequest
} = require('../controllers/plantController');

const router = express.Router();

// Mock auth middleware for now
const softProtect = (req, res, next) => {
  next();
};

router.get('/dashboard', softProtect, getDashboard);
router.post('/compliance/submit', softProtect, submitCompliance);
router.post('/machines', softProtect, addMachine);
router.post('/hire-requests/:requestId/accept', softProtect, acceptHireRequest);

module.exports = router;
