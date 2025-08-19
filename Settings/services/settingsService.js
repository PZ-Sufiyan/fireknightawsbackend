const SettingsModel = require('../model/settingsModel');

class SettingsService {
    async getAllSettings() {
        try {
            return await SettingsModel.getAllSettings();
        } catch (error) {
            throw error;
        }
    }

    async getSettingsByMacAddress(macAddress) {
        try {
            if (!macAddress) {
                throw new Error('MAC address is required');
            }
            return await SettingsModel.getSettingsByMacAddress(macAddress);
        } catch (error) {
            throw error;
        }
    }

    async updateBooleanSetting(macAddress, settingName, value) {
        try {
            if (typeof value !== 'boolean') {
                throw new Error('Value must be boolean');
            }
            return await SettingsModel.updateSettings(macAddress, { [settingName]: value });
        } catch (error) {
            throw error;
        }
    }

    async updateValueSetting(macAddress, settingName, value) {
        try {
            return await SettingsModel.updateSettings(macAddress, { [settingName]: value });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SettingsService();