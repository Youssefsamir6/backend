const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser
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

module.exports = router;

