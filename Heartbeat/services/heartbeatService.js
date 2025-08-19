const HeartbeatModel = require('../model/heartbeatModel');

class HeartbeatService {
    async getAllHeartbeats() {
        try {
            return await HeartbeatModel.getAllHeartbeats();
        } catch (error) {
            throw error;
        }
    }

    async getHeartbeatsByMacAddress(macAddress) {
        try {
            if (!macAddress) {
                throw new Error('MAC address is required');
            }
            return await HeartbeatModel.getHeartbeatsByMacAddress(macAddress);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HeartbeatService();