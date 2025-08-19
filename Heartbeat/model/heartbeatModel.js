const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

class HeartbeatModel {
    static async getAllHeartbeats() {
        const params = {
            TableName: 'ESP32FKDevices',
            FilterExpression: 'dataType = :dt',
            ExpressionAttributeValues: {
                ':dt': { S: 'heartbeat' }
            }
        };
        
        try {
            const data = await dynamodb.scan(params).promise();
            return this.processHeartbeatData(data.Items);
        } catch (error) {
            console.error('Error fetching all heartbeats:', error);
            throw error;
        }
    }

    static async getHeartbeatsByMacAddress(macAddress) {
        const params = {
            TableName: 'ESP32FKDevices',
            KeyConditionExpression: 'macAddress = :mac AND dataType = :dt',
            ExpressionAttributeValues: {
                ':mac': { S: macAddress },
                ':dt': { S: 'heartbeat' }
            }
        };
        
        try {
            const data = await dynamodb.query(params).promise();
            return this.processHeartbeatData(data.Items);
        } catch (error) {
            console.error('Error fetching heartbeats by MAC:', error);
            throw error;
        }
    }

    static processHeartbeatData(items) {
        return items.map(item => ({
            macAddress: item.macAddress.S,
            timestamp: item.timestamp.S,
            dataType: item.dataType.S
        }));
    }
}

module.exports = HeartbeatModel;