const HeartbeatService = require('../services/heartbeatService');

class HeartbeatController {
    async getAllHeartbeats(req, res) {
        try {
            const heartbeats = await HeartbeatService.getAllHeartbeats();
            res.status(200).json(heartbeats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getHeartbeatsByMacAddress(req, res) {
        try {
            const { macAddress } = req.params;
            const heartbeats = await HeartbeatService.getHeartbeatsByMacAddress(macAddress);
            res.status(200).json(heartbeats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new HeartbeatController();