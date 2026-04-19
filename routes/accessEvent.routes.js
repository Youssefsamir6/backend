const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { createAccessEvent } = require('../controllers/accessEvent.controller');

router.use(authenticateToken); // Auth required, no role restrict for guards/users
router.post('/', createAccessEvent);

module.exports = router;

