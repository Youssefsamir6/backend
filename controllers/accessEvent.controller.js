const { createLog } = require('../services/log.service');
const { smartDecision } = require('../services/ai.service');

const createAccessEvent = async (req, res) => {
  try {
    const { userId, status, method, reason, gateName, image, useAI } = req.body;
    
    let logData = { userId, status, method, reason, gateName };

    // Smart AI override
    if (useAI && image) {
      const decision = await smartDecision(image, gateName);
      logData = {
        userId: decision.userId || userId || 'unknown',
        status: decision.status,
        method: 'face', // AI = face
        reason: decision.reason,
        gateName
      };
    }

    const log = await createLog(logData);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createAccessEvent };

