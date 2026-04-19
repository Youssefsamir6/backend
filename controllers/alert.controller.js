const { getAlerts, getUserAlerts, getUnreadCount, markAsRead } = require('../services/alert.service');

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await getAlerts(req.query); // ?unread=false&type=Unauthorized Access
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserAlertsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unread } = req.query;
    const alerts = await getUserAlerts(userId, unread === 'true');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnreadCountHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await getUnreadCount(userId);
    res.json({ unreadCount: count });
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

module.exports = { getAllAlerts, getUserAlertsHandler, getUnreadCountHandler, markAlertAsRead };
