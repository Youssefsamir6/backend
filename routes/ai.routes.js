const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { recognition, smartAccess } = require('../controllers/ai.controller');

router.use(authenticateToken);

router.post('/recognition', recognition); // Basic face rec
router.post('/smart-access', smartAccess); // Full decision + auto-log

module.exports = router;

