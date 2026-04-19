const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { analytics } = require('../controllers/analytics.controller');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/', analytics);

module.exports = router;

