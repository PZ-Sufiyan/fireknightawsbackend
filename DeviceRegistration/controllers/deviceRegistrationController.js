const DeviceModel = require('../model/deviceRegistrationModel');

const validateMacAddress = (mac) => {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
};

const deviceController = {
  registerDevice: async (req, res) => {
    try {
      const { mac_address } = req.params;
      const registrationData = req.body;

      // Validate MAC address format
      if (!validateMacAddress(mac_address)) {
        return res.status(400).json({ error: 'Invalid MAC address format' });
      }

      // Validate required fields
      const requiredFields = ['fullName', 'email', 'phone', 'address', 'model'];
      const missingFields = requiredFields.filter(field => !registrationData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          missingFields
        });
      }

      const result = await DeviceModel.registerDevice(mac_address, registrationData);
      
      res.status(201).json({
        success: true,
        device: result.device,
        user: {
          email: registrationData.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Device with this MAC address already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ 
        error: 'Registration failed',
        details: error.message 
      });
    }
  },

  getDevice: async (req, res) => {
    try {
      const { mac_address } = req.params;
      const device = await DeviceModel.getDeviceByMacAddress(mac_address);

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.status(200).json(device);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add this method to the deviceController object
  getDevicesByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      const devices = await DeviceModel.getDevicesByEmail(email);
      
      if (!devices || devices.length === 0) {
        return res.status(404).json({ error: 'No devices found for this email' });
      }

      res.status(200).json(devices);
    } catch (error) {
      console.error('Error getting devices by email:', error);
      res.status(500).json({ 
        error: 'Failed to fetch devices',
        details: error.message 
      });
    }
  },

  updateDevice: async (req, res) => {
    try {
      const { mac_address } = req.params;
      const updateData = req.body;

      // Don't allow updating MAC address
      if (updateData.mac_address) {
        return res.status(400).json({ error: 'MAC address cannot be updated' });
      }

      const updatedDevice = await DeviceModel.updateDevice(mac_address, updateData);
      res.status(200).json(updatedDevice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteDevice: async (req, res) => {
    try {
      const { mac_address } = req.params;
      await DeviceModel.deleteDevice(mac_address);
      res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = deviceController;