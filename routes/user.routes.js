const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB per file

const {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
  addFaceImages,
  deleteFaceImages
} = require('../controllers/user.controller');


// Protect all routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/', getUsers);
router.post('/', createNewUser);
router.route('/:id')
  .get(getUser)
  .put(updateExistingUser)
  .delete(deleteExistingUser);

// Safe upload wrapper to catch multer errors and validate images
const uploadHandler = (fieldName, maxCount) => (req, res, next) => {
  const uploader = upload.array(fieldName, maxCount);
  uploader(req, res, (err) => {
    if (err) {
      const code = err.code || 'UPLOAD_ERROR';
      if (code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'One or more files exceed 10MB limit' });
      }
      if (code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Too many files uploaded' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
};

const validateFaceUpload = (req, res, next) => {
  const files = req.files || [];
  if (!files.length && !req.body.image) {
    return res.status(400).json({ error: 'No image provided. Use multipart images[] or image (base64).' });
  }

  for (let f of files) {
    if (!f.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'All uploaded files must be images (jpeg/png/etc.)' });
    }
  }

  if (files.length > 5) return res.status(400).json({ error: 'Maximum 5 images allowed' });

  next();
};

router.post('/:id/face-images', uploadHandler('images', 5), validateFaceUpload, addFaceImages);
router.delete('/:id/face-images', deleteFaceImages);


module.exports = router;

