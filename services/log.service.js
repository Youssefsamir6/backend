const Log = require('../models/Log.model');
const User = require('../models/User.model');
const { createAlert } = require('./alert.service');

// Global io from server
const io = global.io;

const createLog = async ({ userId, status, method, reason, gateName = 'Main Gate' }) => {
  await User.findById(userId);

  const log = new Log({ userId, status, method, reason, gateName });
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
  if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
    if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
  }

  return await Log.find(filter).populate('userId', 'email role').sort({ timestamp: -1 });
};

module.exports = { createLog, getLogs };

