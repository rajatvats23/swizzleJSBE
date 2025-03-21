// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getManagerRestaurant
} = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes (if any)

// Protected routes - require authentication
// Routes accessible by superadmin and admin
router.route('/')
  .post(protect, restrictTo('superadmin', 'admin'), createRestaurant)
  .get(protect, restrictTo('superadmin', 'admin'), getRestaurants);

router.route('/:id')
  .get(protect, getRestaurantById) // Accessible by all authenticated users, controller will restrict based on role
  .put(protect, updateRestaurant) // Controller will handle role-based restrictions
  .delete(protect, restrictTo('superadmin', 'admin'), deleteRestaurant);

// Special route for managers to get their associated restaurant
router.get('/manager/restaurant', protect, restrictTo('manager'), getManagerRestaurant);

module.exports = router;