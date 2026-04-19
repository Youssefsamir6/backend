const { createLog } = require('../services/log.service');

const createAccessEvent = async (req, res) => {
  try {
    const { userId, status, method, reason, gateName } = req.body;
    const log = await createLog({ userId, status, method, reason, gateName });
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createAccessEvent };

