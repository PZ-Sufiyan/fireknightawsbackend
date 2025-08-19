const express = require('express');
const router = express.Router();
const AlertController = require('../controllers/alertController');

// Get all alerts
router.get('/', AlertController.getAllAlerts);

// Get alerts by MAC address
router.get('/:macAddress', AlertController.getAlertsByMacAddress);

// Get all unacknowledged alerts
router.get('/unacknowledged/all', AlertController.getUnacknowledgedAlerts);

// Get unacknowledged alerts by MAC address
router.get('/unacknowledged/:macAddress', AlertController.getUnacknowledgedAlertsByMac);

module.exports = router;