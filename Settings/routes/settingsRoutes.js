const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');

// Get all devices settings
router.get('/', SettingsController.getAllSettings);

// Get settings by MAC address
router.get('/:macAddress', SettingsController.getSettingsByMacAddress);

// Update boolean settings (On/Off)
router.put('/boolean/:macAddress/:settingName', SettingsController.updateBooleanSetting);

// Update value settings
router.put('/value/:macAddress/:settingName', SettingsController.updateValueSetting);

module.exports = router;