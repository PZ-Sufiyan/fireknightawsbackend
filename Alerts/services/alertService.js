const AlertModel = require('../model/alertModel');

class AlertService {
    async getAllAlerts() {
        try {
            return await AlertModel.getAllAlerts();
        } catch (error) {
            throw error;
        }
    }

    async getAlertsByMacAddress(macAddress) {
        try {
            if (!macAddress) {
                throw new Error('MAC address is required');
            }
            return await AlertModel.getAlertsByMacAddress(macAddress);
        } catch (error) {
            throw error;
        }
    }

    async getUnacknowledgedAlerts() {
        try {
            const allAlerts = await AlertModel.getAllAlerts();
            return allAlerts.filter(alert => !alert.acknowledgement);
        } catch (error) {
            throw error;
        }
    }

    async getUnacknowledgedAlertsByMac(macAddress) {
        try {
            if (!macAddress) {
                throw new Error('MAC address is required');
            }
            const alerts = await AlertModel.getAlertsByMacAddress(macAddress);
            return alerts.filter(alert => !alert.acknowledgement);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AlertService();