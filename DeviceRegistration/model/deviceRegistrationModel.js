const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const DEVICE_TABLE = 'RegisteredDevices';
const USERS_TABLE = 'Users';

class DeviceModel {
  static async registerDevice(macAddress, registrationData) {
    const deviceParams = {
      TableName: DEVICE_TABLE,
      Item: {
        mac_address: macAddress,
        ...registrationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      ConditionExpression: 'attribute_not_exists(mac_address)'
    };

    try {
      // First try to register the device
      await dynamoDB.put(deviceParams).promise();
      
      // Then handle user association separately
      await this.updateUserDeviceAssociation(registrationData.email, macAddress, {
        fullName: registrationData.fullName,
        phone: registrationData.phone
      });
      
      return { success: true, device: deviceParams.Item };
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Device with this MAC address already exists');
      }
      throw error;
    }
  }

  static async updateUserDeviceAssociation(email, macAddress, userDetails) {
    try {
      // Try to update existing user
      await dynamoDB.update({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: `
          SET #macAddresses = list_append(if_not_exists(#macAddresses, :empty_list), :macAddress),
              #updatedAt = :updatedAt,
              #fullName = if_not_exists(#fullName, :fullName),
              #phone = if_not_exists(#phone, :phone)
        `,
        ExpressionAttributeNames: {
          '#macAddresses': 'macAddresses',
          '#updatedAt': 'updatedAt',
          '#fullName': 'fullName',
          '#phone': 'phone'
        },
        ExpressionAttributeValues: {
          ':macAddress': [macAddress],
          ':empty_list': [],
          ':updatedAt': new Date().toISOString(),
          ':fullName': userDetails.fullName,
          ':phone': userDetails.phone
        }
      }).promise();
    } catch (error) {
      if (error.code === 'ResourceNotFoundException' || 
          error.code === 'ValidationException') {
        // Create new user if doesn't exist
        await dynamoDB.put({
          TableName: USERS_TABLE,
          Item: {
            email,
            fullName: userDetails.fullName,
            phone: userDetails.phone,
            macAddresses: [macAddress],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }).promise();
      } else {
        throw error;
      }
    }
  }

  static async getUserByEmail(email) {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email: email
      }
    };

    try {
      const result = await dynamoDB.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async getDeviceByMacAddress(macAddress) {
    const params = {
      TableName: DEVICE_TABLE,
      Key: {
        mac_address: macAddress
      }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
  }

  static async getDevicesByEmail(email) {
    const params = {
      TableName: DEVICE_TABLE,
      FilterExpression: '#email = :email',
      ExpressionAttributeNames: {
        '#email': 'email'
      },
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    try {
      const result = await dynamoDB.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error fetching devices by email:', error);
      throw error;
    }
  }

  static async updateDevice(macAddress, updateData) {
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updateData).forEach((key, index) => {
      updateExpressions.push(`#${key} = :val${index}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:val${index}`] = updateData[key];
    });

    // Always update the updatedAt field
    updateExpressions.push('#updatedAt = :updatedAtVal');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAtVal'] = new Date().toISOString();

    const params = {
      TableName: DEVICE_TABLE,
      Key: {
        mac_address: macAddress
      },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async deleteDevice(macAddress) {
    const params = {
      TableName: DEVICE_TABLE,
      Key: {
        mac_address: macAddress
      }
    };

    await dynamoDB.delete(params).promise();
    return { success: true };
  }
}

module.exports = DeviceModel;