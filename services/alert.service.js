const Alert = require('../models/Alert.model');
const User = require('../models/User.model');

const createAlert = async ({ userId, type, message = '', severity = 'medium' }) => {
  const alert = new Alert({ userId, type, message, severity });
  await alert.save();
  return alert;
};

const getAlerts = async () => {
  return await Alert.find().populate('userId', 'email').sort({ timestamp: -1 });
};

const markAsRead = async (id) => {
  const alert = await Alert.findById(id);
  if (!alert) throw new Error('Alert not found');
  alert.isRead = true;
  await alert.save();
  return alert;
};

module.exports = { createAlert, getAlerts, markAsRead };

