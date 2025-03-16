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

// Admin routes (accessible only by superadmin)
router.route('/')
  .get(protect, restrictTo('superadmin'), getUsers);

router.route('/:id')
  .get(protect, restrictTo('superadmin'), getUserById)
  .put(protect, restrictTo('superadmin'), updateUser)
  .delete(protect, restrictTo('superadmin'), deleteUser);

module.exports = router;