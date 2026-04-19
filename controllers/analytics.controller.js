const { getAnalytics } = require('../services/analytics.service');

const analytics = async (req, res) => {
  try {
    const data = await getAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analytics };

