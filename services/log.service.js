const Log = require('../models/Log.model');
const User = require('../models/User.model');
const { createAlert } = require('./alert.service');

// Reusable io from server\nconst io = global.io;

const createLog = async ({ userId, status, method, reason, gateName = 'Main Gate', deviceId, confidence, timestamp, identificationReason = '' }) => {
  if (userId) {
    await User.findById(userId).lean(); // Validate exists, lean for perf
  }

  const logData = { 
    userId: userId || 'unknown',
    status, 
    method, 
    reason, 
    gateName,
    deviceId: deviceId || null,
    confidence: confidence || null,
    timestamp: timestamp || new Date(),
    identificationReason // New field support
  };
  const log = new Log(logData);
  await log.save();

  // Socket emit
  io.to('logs').emit('access_event', {
    log,
    type: 'access_event'
  });

  // Unauthorized → alert
  if (status === 'Unauthorized') {
    const alert = await createAlert({
      userId,
      type: 'Unauthorized Access',
      message: `Unauthorized ${method} at ${gateName}: ${reason}`,
      severity: 'high'
    });

    io.to('logs').emit('alert', {
      alert,
      type: 'alert'
    });
  }

  return log;
};

const getLogs = async (query = {}) => {
  const filter = {};

  if (query.userId) filter.userId = query.userId;
  if (query.status) filter.status = query.status;
  if (query.method) filter.method = query.method;
  if (query.deviceId) filter.deviceId = query.deviceId;
  if (query.gateName) filter.gateName = query.gateName;
  if (query.confidence_min || query.confidence_max) {
    filter.confidence = {};
    if (query.confidence_min) filter.confidence.$gte = parseFloat(query.confidence_min);
    if (query.confidence_max) filter.confidence.$lte = parseFloat(query.confidence_max);
  }
  if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
    if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
  }

  return await Log.find(filter).populate('userId', 'email role name idNumber').sort({ timestamp: -1 });
};

module.exports = { createLog, getLogs };

