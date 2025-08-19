const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Users';

class UserModel {
    static async getAllUsers() {
        const params = {
            TableName: TABLE_NAME
        };

        try {
            const result = await dynamoDB.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }

    static async getUserByEmail(email) {
        const params = {
            TableName: TABLE_NAME,
            Key: { email }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            return result.Item;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    }

    static async getUserDevices(email) {
        try {
            const user = await this.getUserByEmail(email);
            return user ? user.macAddresses || [] : [];
        } catch (error) {
            console.error('Error fetching user devices:', error);
            throw error;
        }
    }
}

module.exports = UserModel;