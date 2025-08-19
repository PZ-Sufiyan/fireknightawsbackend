const PeriodicModel = require('../model/periodicModel');

class PeriodicService {
    async getAllPeriodicUpdates() {
        try {
            return await PeriodicModel.getAllPeriodicUpdates();
        } catch (error) {
            throw error;
        }
    }

    async getPeriodicUpdatesByMacAddress(macAddress) {
        try {
            if (!macAddress) {
                throw new Error('MAC address is required');
            }
            return await PeriodicModel.getPeriodicUpdatesByMacAddress(macAddress);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PeriodicService();