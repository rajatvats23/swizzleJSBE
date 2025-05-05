// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handleWebhook,
  recordCashPayment,
  getPaymentById,
  getOrderPayments
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { protectCustomer } = require('../middleware/customerAuthMiddleware');

// Public webhook route (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Staff routes
router.post('/cash', protect, restrictTo('manager', 'staff'), recordCashPayment);
router.get('/order/:orderId', protect, restrictTo('manager', 'staff'), getOrderPayments);

// Customer routes
router.post('/create-intent', protectCustomer, createPaymentIntent);
router.get('/:id', protectCustomer, getPaymentById);

module.exports = router;