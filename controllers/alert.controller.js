const { getAlerts, markAsRead } = require('../services/alert.service');

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await getAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAlertAsRead = async (req, res) => {
  try {
    const alert = await markAsRead(req.params.id);
    res.json({ message: 'Alert marked as read', alert });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = { getAllAlerts, markAlertAsRead };
