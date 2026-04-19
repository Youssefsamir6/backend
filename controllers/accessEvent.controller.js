const { handleAccessEvent } = require('../services/accessEvent.service');

const createAccessEvent = async (req, res) => {
  try {
    const data = req.body; // {userId?, rfid?, image?, method, gateName}
    const result = await handleAccessEvent(data);
    res.status(201).json(result.decision);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createAccessEvent };

