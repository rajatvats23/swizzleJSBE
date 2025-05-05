// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');

// Standardized response structure
const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// @desc    Create payment intent (Stripe)
// @route   POST /api/payments/create-intent
// @access  Private/Customer
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return sendResponse(res, 400, 'fail', 'Order ID is required');
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Verify customer owns this order
    if (order.customer.toString() !== req.customer.id.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to pay for this order');
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      return sendResponse(res, 400, 'fail', 'Order is already paid');
    }
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to smallest currency unit (cents/paise)
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        customerId: req.customer.id.toString()
      }
    });
    
    // Create a payment record
    const payment = await Payment.create({
      order: order._id,
      amount: order.totalAmount,
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'card', // Default for online payments
      status: 'pending'
    });
    
    return sendResponse(res, 200, 'success', 'Payment intent created', {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Webhook for Stripe events
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Ensure you have access to raw request body
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle specific events
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handleSuccessfulPayment(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleFailedPayment(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Return success response to Stripe
  res.status(200).json({ received: true });
};

// Helper function to handle successful payments
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    // Find payment by payment intent ID
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    
    if (!payment) return;
    
    // Update payment status
    payment.status = 'successful';
    payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
    await payment.save();
    
    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.isPaid = true;
      order.paymentMethod = payment.paymentMethod;
      await order.save();
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Helper function to handle failed payments
const handleFailedPayment = async (paymentIntent) => {
  try {
    // Find payment by payment intent ID
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    
    if (!payment) return;
    
    // Update payment status
    payment.status = 'failed';
    payment.metadata = {
      error: paymentIntent.last_payment_error?.message || 'Payment failed'
    };
    await payment.save();
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// @desc    Record cash payment
// @route   POST /api/payments/cash
// @access  Private/Staff
const recordCashPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return sendResponse(res, 400, 'fail', 'Order ID is required');
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Ensure the order belongs to the staff member's restaurant
    if (order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to record payment for this order');
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      return sendResponse(res, 400, 'fail', 'Order is already paid');
    }
    
    // Create a payment record
    const payment = await Payment.create({
      order: order._id,
      amount: order.totalAmount,
      paymentMethod: 'cash',
      status: 'successful'
    });
    
    // Update order
    order.isPaid = true;
    order.paymentMethod = 'cash';
    await order.save();
    
    return sendResponse(res, 200, 'success', 'Cash payment recorded successfully', { payment });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private/Customer
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order');
    
    if (!payment) {
      return sendResponse(res, 404, 'fail', 'Payment not found');
    }
    
    // Ensure the payment belongs to the customer
    if (payment.order.customer.toString() !== req.customer.id.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to view this payment');
    }
    
    return sendResponse(res, 200, 'success', 'Payment retrieved successfully', { payment });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get order payments (for staff)
// @route   GET /api/payments/order/:orderId
// @access  Private/Staff
const getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Ensure the order belongs to the staff member's restaurant
    if (order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to view payments for this order');
    }
    
    // Get payments for the order
    const payments = await Payment.find({ order: orderId });
    
    return sendResponse(res, 200, 'success', 'Order payments retrieved successfully', { payments });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  recordCashPayment,
  getPaymentById,
  getOrderPayments
};