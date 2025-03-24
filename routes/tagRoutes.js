const express = require('express');
const router = express.Router();
const {
  createTag,
  getTags,
  updateTag,
  deleteTag
} = require('../controllers/tagController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get tags - all authenticated users
// Create tags - only managers
router.route('/')
  .get(protect, getTags)
  .post(protect, restrictTo('manager'), createTag);

// Update/delete tags - only managers
router.route('/:id')
  .put(protect, restrictTo('manager'), updateTag)
  .delete(protect, restrictTo('manager'), deleteTag);

module.exports = router;