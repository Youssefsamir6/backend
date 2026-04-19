const { getLogs } = require('../services/log.service');

const getAllLogs = async (req, res) => {
  try {
    const logs = await getLogs(req.query); // ?userId=..&status=..&method=..&startDate=..&endDate=..
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllLogs };

