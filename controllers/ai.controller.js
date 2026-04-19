const { recognizeFace } = require('../services/ai.service');

const recognition = async (req, res) => {
  try {
    const { image } = req.body; // base64
    if (!image) return res.status(400).json({ error: 'Image required' });

    const result = await recognizeFace(image);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { recognition };

