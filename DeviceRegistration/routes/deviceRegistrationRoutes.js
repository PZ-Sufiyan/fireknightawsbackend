const express = require('express');
const router = express.Router();
const deviceRegistrationController = require('../controllers/deviceRegistrationController');

// Device registration and management routes (no authentication)
router.post('/:mac_address', deviceRegistrationController.registerDevice);
router.get('/:mac_address', deviceRegistrationController.getDevice);
router.put('/:mac_address', deviceRegistrationController.updateDevice);
router.delete('/:mac_address', deviceRegistrationController.deleteDevice);
router.get('/by-email/:email', deviceRegistrationController.getDevicesByEmail);

module.exports = router;