const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

class SettingsModel {
    static async getAllSettings() {
        const params = {
            TableName: 'ESP32FKDevices',
            FilterExpression: 'dataType = :dt',
            ExpressionAttributeValues: {
                ':dt': { S: 'settings' }
            }
        };
        
        try {
            const data = await dynamodb.scan(params).promise();
            return this.processSettingsData(data.Items);
        } catch (error) {
            console.error('Error fetching all settings:', error);
            throw error;
        }
    }

    static async getSettingsByMacAddress(macAddress) {
        const params = {
            TableName: 'ESP32FKDevices',
            KeyConditionExpression: 'macAddress = :mac AND dataType = :dt',
            ExpressionAttributeValues: {
                ':mac': { S: macAddress },
                ':dt': { S: 'settings' }
            }
        };
        
        try {
            const data = await dynamodb.query(params).promise();
            return this.processSettingsData(data.Items);
        } catch (error) {
            console.error('Error fetching settings by MAC:', error);
            throw error;
        }
    }

    static async updateSettings(macAddress, updateData) {
        const timestamp = new Date().toISOString();
        let updateExpression = 'SET lastsettingupdatetimestamp = :ts';
        let expressionAttributeValues = {
            ':ts': { S: timestamp }
        };

        // Dynamically build the update expression
        Object.keys(updateData).forEach((key, index) => {
            const value = updateData[key];
            
            // Handle boolean values specifically
            if (typeof value === 'boolean') {
                updateExpression += `, payload.${key} = :val${index}`;
                expressionAttributeValues[`:val${index}`] = { BOOL: value }; // Correct boolean format
            } 
            // Handle number values
            else if (typeof value === 'number') {
                updateExpression += `, payload.${key} = :val${index}`;
                expressionAttributeValues[`:val${index}`] = { N: value.toString() };
            }
            // Handle string values
            else {
                updateExpression += `, payload.${key} = :val${index}`;
                expressionAttributeValues[`:val${index}`] = { S: value.toString() };
            }
        });

        const params = {
            TableName: 'ESP32FKDevices',
            Key: {
                'macAddress': { S: macAddress },
                'dataType': { S: 'settings' }
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        try {
            const data = await dynamodb.updateItem(params).promise();
            return this.processSettingsData([data.Attributes]);
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    static processSettingsData(items) {
        return items.map(item => ({
            macAddress: item.macAddress.S,
            lastUpdated: item.lastsettingupdatetimestamp.S,
            settings: {
                batterywarningthreshold: parseFloat(item.payload.M.batterywarningthreshold.N),
                buzzerenable: item.payload.M.buzzerenable.BOOL,
                emergencylight: item.payload.M.emergencylight.BOOL,
                failsafetemperatureenable: item.payload.M.failsafetemperatureenable.BOOL,
                failsafetemperaturethreshold: parseFloat(item.payload.M.failsafetemperaturethreshold.N),
                fallbackenabled: item.payload.M.fallbackenabled.BOOL,
                fallbackorder: item.payload.M.fallbackorder.S,
                flamedetectionenable: item.payload.M.flamedetectionenable.BOOL,
                gasleakagedetectionenable: item.payload.M.gasleakagedetectionenable.BOOL,
                password: item.payload.M.password.S,
                resetsensor: item.payload.M.resetsensor.BOOL,
                rordetectionenable: item.payload.M.rordetectionenable.BOOL,
                sendcurrentupdate: item.payload.M.sendcurrentupdate.BOOL,
                supresssystem: item.payload.M.supresssystem.BOOL,
                wifissid: item.payload.M.wifissid.S
            }
        }));
    }
}

module.exports = SettingsModel;