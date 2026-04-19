const alerts = [];

function createAlert({ userId, type }) {
  const alert = {
    id: alerts.length + 1,
    userId,
    type,
    timestamp: new Date(),
    isRead: false
  };

  alerts.push(alert);
  console.log("ALERT CREATED:", alert);
}

function getAllAlerts() {
  return alerts;
}

function markAsRead(id) {
  const alert = alerts.find(a => a.id === Number(id));
  if (!alert) return null;

  alert.isRead = true;
  return alert;
}

module.exports = {
  createAlert,
  getAllAlerts,
  markAsRead
};
