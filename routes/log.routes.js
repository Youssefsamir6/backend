const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { getAllLogs } = require('../controllers/log.controller');

router.use(authenticateToken);
router.use(authorizeRoles('admin', 'guard'));

router.get('/', getAllLogs);

module.exports = router;

