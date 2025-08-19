const express = require('express');
const router = express.Router();
const HeartbeatController = require('../controllers/heartbeatController');

// Get all heartbeats
router.get('/', HeartbeatController.getAllHeartbeats);

// Get heartbeats by MAC address
router.get('/:macAddress', HeartbeatController.getHeartbeatsByMacAddress);

module.exports = router;