// routes/customerOrderRoutes.js
const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const {
  placeOrder,
  getCustomerOrders,
  getCustomerOrderById
} = require('../controllers/orderController');
const { protectCustomer, activeSession } = require('../middleware/customerAuthMiddleware');

// Protect all routes
router.use(protectCustomer);

// Cart routes
router.route('/cart')
  .get(getCart)
  .post(activeSession, addToCart)
  .delete(clearCart);

router.route('/cart/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

// Order routes
router.route('/orders')
  .get(getCustomerOrders)
  .post(activeSession, placeOrder);

router.route('/orders/:id')
  .get(getCustomerOrderById);

module.exports = router;