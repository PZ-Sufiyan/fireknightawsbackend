const AlertService = require('../services/alertService');

class AlertController {
    async getAllAlerts(req, res) {
        try {
            const alerts = await AlertService.getAllAlerts();
            res.status(200).json(alerts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAlertsByMacAddress(req, res) {
        try {
            const { macAddress } = req.params;
            const alerts = await AlertService.getAlertsByMacAddress(macAddress);
            res.status(200).json(alerts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUnacknowledgedAlerts(req, res) {
        try {
            const alerts = await AlertService.getUnacknowledgedAlerts();
            res.status(200).json(alerts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUnacknowledgedAlertsByMac(req, res) {
        try {
            const { macAddress } = req.params;
            const alerts = await AlertService.getUnacknowledgedAlertsByMac(macAddress);
            res.status(200).json(alerts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new AlertController();