// You can add any additional business logic or service layer functions here
// For example, sending registration emails, notifications, etc.

const deviceService = {
  sendRegistrationConfirmation: async (deviceData) => {
    // Implement email sending or other notifications
    console.log(`Registration confirmation for device ${deviceData.mac_address}`);
    return true;
  }
};

module.exports = deviceService;