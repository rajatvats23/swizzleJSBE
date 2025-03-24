// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get all categories - all roles can view (filtered in controller)
// Only managers can create
router.route('/')
  .get(protect, getCategories)
  .post(protect, restrictTo('manager'), createCategory);

// Get, update, delete specific category
router.route('/:id')
  .get(protect, getCategoryById) 
  .put(protect, restrictTo('manager', 'staff'), updateCategory) // Only manager and staff can update
  .delete(protect, restrictTo('manager'), deleteCategory); // Only manager can delete

module.exports = router;