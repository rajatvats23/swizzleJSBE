const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// User profile routes (accessible by any authenticated user)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes (accessible by superadmin, admin, and manager with proper filtering)
router.route('/')
  .get(protect, restrictTo('superadmin', 'admin', 'manager'), getUsers);

// User management - superadmin can manage all, manager can only manage their restaurant's staff
router.route('/:id')
  .get(protect, restrictTo('superadmin', 'admin', 'manager'), getUserById)
  .put(protect, restrictTo('superadmin', 'admin', 'manager'), updateUser)
  .delete(protect, restrictTo('superadmin', 'admin', 'manager'), deleteUser);

module.exports = router;