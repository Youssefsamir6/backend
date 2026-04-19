const { recognizeFace, smartDecision } = require('../services/ai.service');
const { createLog } = require('../services/log.service');

const recognition = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });

    const result = await recognizeFace(image);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartAccess = async (req, res) => {
  try {
    const { image, gateName = 'Main Gate' } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });

    const decision = await smartDecision(image, gateName);
    
    // Auto-log the smart decision
    if (decision.readyForLog) {
      await createLog({
        userId: decision.userId || 'unknown',
        status: decision.status,
        method: decision.method,
        reason: decision.reason,
        gateName
      });
    }

    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { recognition, smartAccess };

