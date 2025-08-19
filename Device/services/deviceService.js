const AWS = require('aws-sdk');
// ...dynamoDb.put(...), etc

const axios = require('axios');

// AWS Configuration
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const DEVICE_IP = '192.168.4.1';

// API 1: GET /getMac from device
exports.fetchMacFromDevice = async () => {
  try {
    const response = await axios.get(`http://${DEVICE_IP}/getMac`);
    return response.data.mac; // Expected format: { "mac": "xx:xx:xx:xx" }
  } catch (error) {
    console.error('Error fetching MAC from device:', error.message);
    return null;
  }
};

// API 2: Verify MAC in DynamoDB
exports.verifyMacFromDatabase = async (macAddress) => {
  const params = {
    TableName: 'Devices',
    FilterExpression: 'MacAddress = :mac',
    ExpressionAttributeValues: { ':mac': macAddress }
  };

  try {
    const scanResult = await dynamoDB.scan(params).promise();
    const device = scanResult.Items[0];

    if (device && device.ActivationPermission === true && device.CurrentStatus === "inactive") {
      return {
        registration: "Allowed",
        verified: true,
        device
      };
    }

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return { registration: "mac does not exist", verified: false };
    }
    if (device.ActivationPermission !== true) {
      return { registration: "Activation permission not allowed", verified: false };
    }
    if (device.CurrentStatus !== "inactive") {
      if (device.CurrentStatus === "pending") {
        return { registration: "Currentstatus is pending", verified: false };
      }
      if (device.CurrentStatus === "active") {
        return { registration: "Currentstatus is already active", verified: false };
      }
    }
  } catch (error) {
    console.error('DynamoDB Error:', error);
    throw new Error(`Verification failed: ${error.message}`);
  }
};

// API 3: POST /provision (send SSID & password)
exports.changeDeviceWifiCredentials = async (ssid, password) => {
  try {
    const response = await axios.post(`http://${DEVICE_IP}/provision`, { ssid, password });

    return response.status === 200
      ? { success: true, response: response.data }
      : { success: false };
  } catch (error) {
    console.error('Provisioning failed:', error.message);
    throw new Error('Provisioning failed');
  }
};

exports.updateDeviceStatusInDatabase = async (macAddress) => {
  try {
    // 1. Find the device using the exact MAC address provided
    const deviceData = await dynamoDB.scan({
      TableName: 'Devices',
      FilterExpression: 'MacAddress = :mac',
      ExpressionAttributeValues: {
        ':mac': macAddress // Use the exact format provided
      }
    }).promise();
    
    if (!deviceData.Items || deviceData.Items.length === 0) {
      throw new Error(`Device with MAC ${macAddress} not found`);
    }

    const device = deviceData.Items[0];
    
    // 2. Update using both keys with exact MAC format
    const updateParams = {
      TableName: 'Devices',
      Key: {
        DeviceId: device.DeviceId,    // Partition key
        MacAddress: macAddress        // Use the exact format provided
      },
      UpdateExpression: 'SET CurrentStatus = :status, UpdatedAt = :now',
      ExpressionAttributeValues: {
        ':status': 'pending',
        ':now': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(updateParams).promise();
    return result.Attributes;

  } catch (error) {
    console.error('Update failed:', {
      originalMac: macAddress,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to update status: ${error.message}`);
  }
};