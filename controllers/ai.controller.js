const multer = require('multer');
const path = require('path');
const { handleAccessEvent, smartDecision } = require('../services/accessEvent.service');

// Multer config for image upload (5MB limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

/**
 * Single image upload handler
 * Handles multipart/form or base64 JSON
 */
const handleImage = (req, imageField = 'image') => {
  return new Promise((resolve, reject) => {
    upload.single(imageField)(req, null, (err) => {
      if (err) return reject(err);
      
      let image;
      if (req.file) {
        // Multipart: buffer → base64
        image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (req.body[imageField]) {
        // Base64 JSON
        image = req.body[imageField];
        if (!image.startsWith('data:image')) {
          image = `data:image/jpeg;base64,${image}`;
        }
      }
      
      if (!image) reject(new Error('No image provided'));
      resolve(image);
    });
  });
};

const recognition = async (req, res) => {
  try {
    const { deviceId, gateName } = req.body;
    const image = await handleImage(req);
    
    const result = await smartDecision(image, gateName || 'Main Gate');
    
    // Auto log if deviceId
    let accessResult = null;
    if (deviceId) {
      accessResult = await handleAccessEvent({
        ...result,
        deviceId,
        method: 'face',
        timestamp: new Date()
      });
    }
    
    res.json({ recognition: result, access: accessResult });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const smartAccess = async (req, res) => {
  try {
    const { deviceId, gateName = 'Main Gate' } = req.body;
    const image = await handleImage(req);
    
    const decision = await smartDecision(image, gateName);
    const result = await handleAccessEvent({
      ...decision,
      deviceId: deviceId || 'smart-ai',
      method: 'face',
      timestamp: new Date()
    });
    
    res.json({ decision, access: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin endpoint for embedding extraction (for user face upload)
const extractEmbedding = async (req, res) => {
  try {
    const image = await handleImage(req, 'image');
    const { extractEmbedding } = require('../services/ai.service');
    const embedding = await extractEmbedding(image);
    res.json({ embedding });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { recognition, smartAccess, extractEmbedding, handleImage: upload.single('image') };

