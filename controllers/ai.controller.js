const { handleAccessEvent, recognizeFace } = require('../services/accessEvent.service');

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

    const result = await handleAccessEvent({
      image,
      method: 'face',
      gateName
    });
    res.json(result.decision);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { recognition, smartAccess };

