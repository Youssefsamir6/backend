const { getAnalytics } = require('../services/analytics.service');

const analytics = async (req, res) => {
  try {
    const { period, userId } = req.query;
    const data = await getAnalytics({ period, userId });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analytics };

