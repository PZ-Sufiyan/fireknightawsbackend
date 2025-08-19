const SettingsService = require('../services/settingsService');

class SettingsController {
    async getAllSettings(req, res) {
        try {
            const settings = await SettingsService.getAllSettings();
            res.status(200).json(settings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSettingsByMacAddress(req, res) {
        try {
            const { macAddress } = req.params;
            const settings = await SettingsService.getSettingsByMacAddress(macAddress);
            res.status(200).json(settings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateBooleanSetting(req, res) {
        try {
            const { macAddress, settingName } = req.params;
            const { value } = req.body;
            
            const validBooleanSettings = [
                'buzzerenable', 'emergencylight', 'failsafetemperatureenable', 'sendcurrentupdate',
                'fallbackenabled', 'flamedetectionenable', 'gasleakagedetectionenable',
                'registerationpermission', 'resetsensor', 'rordetectionenable', 'supresssystem'
            ];

            if (!validBooleanSettings.includes(settingName)) {
                return res.status(400).json({ message: 'Invalid boolean setting name' });
            }

            const updatedSettings = await SettingsService.updateBooleanSetting(macAddress, settingName, value);
            res.status(200).json(updatedSettings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateValueSetting(req, res) {
        try {
            const { macAddress, settingName } = req.params;
            const { value } = req.body;
            
            const validValueSettings = [
                'batterywarningthreshold', 'failsafetemperaturethreshold',
                'fallbackorder', 'password', 'wifissid', 'currentstatus'
            ];

            if (!validValueSettings.includes(settingName)) {
                return res.status(400).json({ message: 'Invalid value setting name' });
            }

            const updatedSettings = await SettingsService.updateValueSetting(macAddress, settingName, value);
            res.status(200).json(updatedSettings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new SettingsController();