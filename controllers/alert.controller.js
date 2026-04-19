const { getAllAlerts, markAsRead } = require("../services/alert.service");

function getAlerts(req, res) {
  res.json(getAllAlerts());
}

function markAlertAsRead(req, res) {
  const { id } = req.params;

  const alert = markAsRead(id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  res.json({ message: "Alert marked as read", alert });
}

module.exports = {
  getAlerts,
  markAlertAsRead
};
