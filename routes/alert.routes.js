const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getAlerts,
  markAlertAsRead
} = require('../controllers/alert.controller');

router.use(authenticateToken);
router.use(authorizeRoles('admin', 'guard'));

router.get('/', getAlerts);
router.patch('/:id/read', markAlertAsRead);

module.exports = router;

