const PeriodicService = require('../services/periodicService');

class PeriodicController {
    async getAllPeriodicUpdates(req, res) {
        try {
            const updates = await PeriodicService.getAllPeriodicUpdates();
            res.status(200).json(updates);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPeriodicUpdatesByMacAddress(req, res) {
        try {
            const { macAddress } = req.params;
            const updates = await PeriodicService.getPeriodicUpdatesByMacAddress(macAddress);
            res.status(200).json(updates);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new PeriodicController();