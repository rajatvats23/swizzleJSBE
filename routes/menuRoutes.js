const express = require('express');
const router = express.Router();
const {
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu
} = require('../controllers/menuController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get all menus - accessible by all authenticated users
// Create menu - only managers can create
router.route('/')
  .get(protect, getMenus)
  .post(protect, restrictTo('manager'), createMenu);

// Get, update, delete specific menu
router.route('/:id')
  .get(protect, getMenuById)
  .put(protect, restrictTo('manager'), updateMenu)
  .delete(protect, restrictTo('manager'), deleteMenu);

module.exports = router;