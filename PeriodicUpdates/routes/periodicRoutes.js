const express = require('express');
const router = express.Router();
const PeriodicController = require('../controllers/periodicController');

// Get all periodic updates
router.get('/', PeriodicController.getAllPeriodicUpdates);

// Get periodic updates by MAC address
router.get('/:macAddress', PeriodicController.getPeriodicUpdatesByMacAddress);

module.exports = router;