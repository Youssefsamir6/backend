const Log = require('../models/Log.model');

const getAnalytics = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const logsToday = await Log.find({
    timestamp: { $gte: today, $lt: tomorrow }
  });

  const total = logsToday.length;
  const denied = logsToday.filter(l => l.status === 'Unauthorized').length;
  const deniedPercent = total ? ((denied / total) * 100).toFixed(1) : 0;

  // Peak hour
  const hours = {};
  logsToday.forEach(log => {
    const hour = log.timestamp.getHours();
    hours[hour] = (hours[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hours).reduce((a, b) => a[1] > b[1] ? a : b, [0, 0])[0];

  return {
    date: today.toISOString().split('T')[0],
    totalEntries: total,
    deniedAttempts: denied,
    deniedPercent,
    peakHour,
    avgConfidence: 'N/A' // From AI logs if added
  };
};

module.exports = { getAnalytics };

