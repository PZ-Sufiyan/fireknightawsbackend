const express = require('express');
const {
  fetchMac,
  verifyMac,
  updateDeviceWifiCredentials,
  updateDeviceStatus
} = require('../controllers/deviceController');

const router = express.Router();

// API 1: Get MAC from device
router.get('/fetch-mac', fetchMac);

// API 2: Verify MAC in DynamoDB
router.post('/verify-mac', verifyMac);

// API 3: Provision device Wi-Fi credentials
router.post('/wifi-credentials', updateDeviceWifiCredentials);

// NEW API 4: Update device status
router.post('/update-status', updateDeviceStatus);

module.exports = router;
