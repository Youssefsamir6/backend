const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getAllAlerts,
  getUserAlertsHandler,
  getUnreadCountHandler,
  markAlertAsRead
} = require('../controllers/alert.controller');

router.use(authenticateToken);

// Admin/Guard: all alerts
router.use(authorizeRoles('admin', 'guard'), [
  router.get('/', getAllAlerts),
  router.patch('/:id/read', markAlertAsRead)
]);

// Any auth user: own alerts + count
router.get('/user/:userId', getUserAlertsHandler); // ?unread=true
router.get('/user/:userId/unread-count', getUnreadCountHandler);

module.exports = router;

