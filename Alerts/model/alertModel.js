const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

class AlertModel {
    static async getAllAlerts() {
        const params = {
            TableName: 'ESP32FKDevices',
            FilterExpression: 'dataType = :dt',
            ExpressionAttributeValues: {
                ':dt': { S: 'alerts' }
            }
        };
        
        try {
            const data = await dynamodb.scan(params).promise();
            return this.processAlertData(data.Items);
        } catch (error) {
            console.error('Error fetching all alerts:', error);
            throw error;
        }
    }

    static async getAlertsByMacAddress(macAddress) {
        const params = {
            TableName: 'ESP32FKDevices',
            KeyConditionExpression: 'macAddress = :mac AND begins_with(dataType, :dt)',
            ExpressionAttributeValues: {
                ':mac': { S: macAddress },
                ':dt': { S: 'alerts' }
            }
        };
        
        try {
            const data = await dynamodb.query(params).promise();
            return this.processAlertData(data.Items);
        } catch (error) {
            console.error('Error fetching alerts by MAC:', error);
            throw error;
        }
    }

    static processAlertData(items) {
        const alerts = [];

        for (const item of items) {
            const macAddress = item.macAddress.S;

            const alertKeys = Object.keys(item).filter(key => key.startsWith('alert#'));

            for (const alertKey of alertKeys) {
                const alert = item[alertKey].M;
                const payload = alert.payload.M;

                alerts.push({
                    macAddress,
                    alertId: alertKey,
                    timestamp: alert.alerttimestamp.S,
                    acknowledgement: payload.acknowledgement?.BOOL ?? null,
                    batteryLowWarning: payload.batterylowwarning?.BOOL ?? null,
                    batteryVoltage: payload.batteryvoltage ? parseFloat(payload.batteryvoltage.N) : null,
                    buzzerStatus: payload.buzzerstatus?.BOOL ?? null,
                    co: payload.co ? parseFloat(payload.co.N) : null,
                    co2: payload.co2 ? parseFloat(payload.co2.N) : null,
                    // ✅ fixed typo: "emgergencylightstatus"
                    emergencyLightStatus: payload.emgergencylightstatus?.BOOL ?? null,
                    // ✅ fixed typo: "externaltemp"
                    externalTemp: payload.externaltemp ? parseFloat(payload.externaltemp.N) : null,
                    failSafeDetection: payload.failsafedetection?.BOOL ?? null,
                    flameDetection: payload.flamedetection?.BOOL ?? null,
                    gasDetection: payload.gasdetection?.BOOL ?? null,
                    gasSensor: payload.gassensor ? parseFloat(payload.gassensor.N) : null,
                    imagePresent: payload.imagepresent?.BOOL ?? null,
                    internalTemp: payload.internaltemp ? parseFloat(payload.internaltemp.N) : null,
                    pressure: payload.pressure ? parseFloat(payload.pressure.N) : null,
                    rorDetection: payload.rordetection?.BOOL ?? null,
                    rorValue: payload.rorvalue ? parseFloat(payload.rorvalue.N) : null,
                    s3PictureLocation: payload.s3picturelocation?.S ?? '',
                    signalStrength: payload.signalstrength?.S ?? null,
                    // ✅ fixed typo: "supresssystem"
                    suppressSystem: payload.supresssystem?.BOOL ?? null,
                    systemActionStarted: payload.systemactionstarted?.BOOL ?? null
                });
            }
        }

        return alerts;
    }
}

module.exports = AlertModel;