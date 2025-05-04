// routes/staffOrderRoutes.js
const express = require('express');
const router = express.Router();
const {
  getActiveOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all routes - staff and manager access only
router.use(protect, restrictTo('manager', 'staff'));

// Order routes
router.route('/orders/active')
  .get(getActiveOrders);

router.route('/orders/:id')
  .get(getOrderById);

router.route('/orders/:id/status')
  .put(updateOrderStatus);

router.route('/orders/:orderId/items/:itemId/status')
  .put(updateOrderItemStatus);

module.exports = router;