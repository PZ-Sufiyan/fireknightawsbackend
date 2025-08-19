const {
  fetchMacFromDevice,
  verifyMacFromDatabase,
  changeDeviceWifiCredentials,
  updateDeviceStatusInDatabase
} = require('../services/deviceService');

// API 1: GET /fetch-mac
exports.fetchMac = async (req, res) => {
  try {
    const mac = await fetchMacFromDevice();
    if (!mac) {
      return res.status(500).json({ message: 'Failed to fetch MAC from device' });
    }
    return res.status(200).json({ macAddress: mac });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching MAC', error: error.message });
  }
};

// API 2: POST /verify-mac
exports.verifyMac = async (req, res) => {
  const { macAddress } = req.body;
  if (!macAddress) {
    return res.status(400).json({ message: 'MAC address is required' });
  }

  try {
    const result = await verifyMacFromDatabase(macAddress);
    if (result.verified) {
      return res.status(200).json(result); // Always include verified + registration
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

// API 3: POST /wifi-credentials
exports.updateDeviceWifiCredentials = async (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid || !password) {
    return res.status(400).json({ message: 'SSID and Password are required' });
  }

  try {
    const response = await changeDeviceWifiCredentials(ssid, password);
    if (response.success) {
      return res.status(200).json({ message: 'Provisioning successful', data: response.response });
    }
    return res.status(500).json({ message: 'Provisioning failed' });
  } catch (err) {
    return res.status(500).json({ message: 'Provisioning error', error: err.message });
  }
};

// Add this new controller function
exports.updateDeviceStatus = async (req, res) => {
  const { macAddress } = req.body;
  
  if (!macAddress) {
    return res.status(400).json({ message: 'MAC address is required' });
  }

  try {
    const result = await updateDeviceStatusInDatabase(macAddress);
    return res.status(200).json({
      message: 'Device status updated successfully',
      device: result
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Failed to update device status',
      error: error.message 
    });
  }
};