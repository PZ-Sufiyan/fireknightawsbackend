const UserModel = require('../model/userModel');

class UserService {
    async getAllUsers() {
        try {
            return await UserModel.getAllUsers();
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }
            return await UserModel.getUserByEmail(email);
        } catch (error) {
            throw error;
        }
    }

    async getUserDevices(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }
            return await UserModel.getUserDevices(email);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();