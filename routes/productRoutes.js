const express = require('express');
const router = express.Router();
const {
  getUploadUrl,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get S3 upload URL
router.post('/upload-url', protect, restrictTo('manager'), getUploadUrl);

// Public routes (if any)

// Protected routes - require authentication
// Routes accessible by all roles (with filtering in controller)
router.route('/')
  .get(protect, getProducts)
  .post(protect, restrictTo('manager'), createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, restrictTo('manager'), updateProduct)
  .delete(protect, restrictTo('manager'), deleteProduct);

module.exports = router;