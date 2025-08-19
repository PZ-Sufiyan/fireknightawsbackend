const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

class PeriodicModel {
    static async getAllPeriodicUpdates() {
        const params = {
            TableName: 'ESP32FKDevices',
            FilterExpression: 'dataType = :dt',
            ExpressionAttributeValues: {
                ':dt': { S: 'periodicupdate' }
            }
        };
        
        try {
            const data = await dynamodb.scan(params).promise();
            return this.processPeriodicData(data.Items);
        } catch (error) {
            console.error('Error fetching all periodic updates:', error);
            throw error;
        }
    }

    static async getPeriodicUpdatesByMacAddress(macAddress) {
        const params = {
            TableName: 'ESP32FKDevices',
            KeyConditionExpression: 'macAddress = :mac AND dataType = :dt',
            ExpressionAttributeValues: {
                ':mac': { S: macAddress },
                ':dt': { S: 'periodicupdate' }
            }
        };
        
        try {
            const data = await dynamodb.query(params).promise();
            return this.processPeriodicData(data.Items);
        } catch (error) {
            console.error('Error fetching periodic updates by MAC:', error);
            throw error;
        }
    }

    static processPeriodicData(items) {
        return items.map(item => {
            // Safely extract macAddress and timestamp
            const macAddress = item.macAddress?.S || '';
            const timestamp = item.periodictimestamp?.S || '';
            
            // Safely extract payload or default to empty object
            const payload = item.payload?.M || {};
            
            return {
                macAddress,
                timestamp,
                payload: {
                    batterylevel: parseFloat(payload.batterylevel?.N || '0'),
                    buzzerstatus: payload.buzzerstatus?.BOOL || false,
                    co: parseFloat(payload.co?.N || '0'),
                    co2: parseFloat(payload.co2?.N || '0'),
                    emergencylightstatus: payload.emergencylightstatus?.BOOL || false,
                    extenaltemp: parseFloat(payload.externaltemp?.N || '0'), // Fixed typo here
                    failsafedetection: payload.failsafedetection?.BOOL || false,
                    flamedetection: payload.flamedetection?.BOOL || false,
                    gasdetection: payload.gasdetection?.BOOL || false,
                    gassensor: parseFloat(payload.gassensor?.N || '0'),
                    internaltemp: parseFloat(payload.internaltemp?.N || '0'),
                    mode: payload.mode?.S || '',
                    networktype: payload.networktype?.S || '',
                    pressure: parseFloat(payload.pressure?.N || '0'),
                    rordetection: payload.rordetection?.BOOL || false,
                    rorvalue: parseFloat(payload.rorvalue?.N || '0'),
                    signalstrength: payload.signalstrength?.S || '',
                    valvestatus: payload.valvestatus?.BOOL || false
                }
            };
        });
    }
}

module.exports = PeriodicModel;