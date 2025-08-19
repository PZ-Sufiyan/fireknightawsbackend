const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Get all users
router.get('/', UserController.getAllUsers);

// Get user by email
router.get('/:email', UserController.getUserByEmail);

// Get user's devices by email
router.get('/:email/devices', UserController.getUserDevices);

module.exports = router;