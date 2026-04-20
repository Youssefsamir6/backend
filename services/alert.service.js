const Alert = require('../models/Alert.model');
const Log = require('../models/Log.model');
const User = require('../models/User.model');

// Reusable io from server\nconst io = global.io;

const createAlert = async ({ userId, type, message = '', severity = 'medium' }) => {
  const alert = new Alert({ userId, type, message, severity });
  await alert.save();

  // Socket emit to logs room
  io.to('logs').emit('alert', {
    alert: alert.toObject(),
    type: 'alert'
  });

  return alert;
};

const getAlerts = async (filter = {}) => {
  const query = { ...filter };
  return await Alert.find(query).populate('userId', 'email role').sort({ timestamp: -1 });
};

const getUserAlerts = async (userId, unreadOnly = false) => {
  const query = { userId };
  if (unreadOnly) query.isRead = false;
  return await Alert.find(query).populate('userId', 'email role').sort({ timestamp: -1 });
};

const getUnreadCount = async (userId) => {
  return await Alert.countDocuments({ userId, isRead: false });
};

const markAsRead = async (id) => {
  const alert = await Alert.findById(id);
  if (!alert) throw new Error('Alert not found');
  alert.isRead = true;
  await alert.save();
  return alert;
};

module.exports = { createAlert, getAlerts, getUserAlerts, getUnreadCount, markAsRead };

