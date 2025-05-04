// controllers/orderController.js
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

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

// @desc    Place a new order from cart
// @route   POST /api/customer/orders
// @access  Private/Customer
const placeOrder = async (req, res) => {
  try {
    // Check if customer has active session
    if (!req.customer.currentSession || !req.customer.currentSession.active) {
      return sendResponse(res, 400, 'fail', 'No active table session');
    }
    
    // Find customer's cart
    const cart = await Cart.findOne({ customer: req.customer.id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return sendResponse(res, 400, 'fail', 'Cart is empty');
    }
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of cart.items) {
      const productPrice = item.product.price;
      let itemTotal = productPrice * item.quantity;
      
      // Add addon prices
      for (const selectedAddon of item.selectedAddons) {
        if (selectedAddon.subAddon && selectedAddon.subAddon.price) {
          itemTotal += selectedAddon.subAddon.price * item.quantity;
        }
      }
      
      totalAmount += itemTotal;
    }
    
    // Create new order
    const order = new Order({
      customer: req.customer.id,
      restaurant: req.customer.currentSession.restaurant,
      table: req.customer.currentSession.table,
      totalAmount,
      specialInstructions: req.body.specialInstructions || '',
      items: []
    });
    
    // Save the order to get its ID
    await order.save();
    
    // Create order items
    const orderItemPromises = cart.items.map(async (cartItem) => {
      const orderItem = new OrderItem({
        order: order._id,
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
        selectedAddons: cartItem.selectedAddons,
        specialInstructions: cartItem.specialInstructions
      });
      
      await orderItem.save();
      order.items.push(orderItem._id);
    });
    
    await Promise.all(orderItemPromises);
    await order.save();
    
    // Clear the cart
    cart.items = [];
    await cart.save();
    
    // Update customer's current order in session
    req.customer.currentSession.currentOrder = order._id;
    await req.customer.save();
    
    // Return the order
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price imageUrl'
        }
      });
    
    return sendResponse(res, 201, 'success', 'Order placed successfully', { order: populatedOrder });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get customer's order history
// @route   GET /api/customer/orders
// @access  Private/Customer
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customer.id })
      .sort('-createdAt')
      .select('status totalAmount createdAt');
    
    return sendResponse(res, 200, 'success', 'Orders retrieved successfully', { orders });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get customer's order details
// @route   GET /api/customer/orders/:id
// @access  Private/Customer
const getCustomerOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price imageUrl'
        }
      });
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Ensure the order belongs to the authenticated customer
    if (order.customer.toString() !== req.customer.id.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    return sendResponse(res, 200, 'success', 'Order retrieved successfully', { order });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get restaurant's active orders
// @route   GET /api/staff/orders/active
// @access  Private/Staff
const getActiveOrders = async (req, res) => {
  try {
    // Get orders that are not completed
    const orders = await Order.find({
      restaurant: req.user.restaurantId,
      status: { $ne: 'completed' }
    })
    .sort('createdAt')
    .populate({
      path: 'items',
      populate: {
        path: 'product',
        select: 'name'
      }
    })
    .populate('table', 'tableNumber');
    
    return sendResponse(res, 200, 'success', 'Active orders retrieved successfully', { orders });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get order details (staff view)
// @route   GET /api/staff/orders/:id
// @access  Private/Staff
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price imageUrl'
        }
      })
      .populate('table', 'tableNumber')
      .populate('customer', 'name phoneNumber');
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Ensure the order belongs to the staff member's restaurant
    if (order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    return sendResponse(res, 200, 'success', 'Order retrieved successfully', { order });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/staff/orders/:id/status
// @access  Private/Staff
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['placed', 'preparing', 'ready', 'delivered', 'completed'].includes(status)) {
      return sendResponse(res, 400, 'fail', 'Invalid status');
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Ensure the order belongs to the staff member's restaurant
    if (order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    order.status = status;
    await order.save();
    
    return sendResponse(res, 200, 'success', 'Order status updated successfully', { order });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update order item status
// @route   PUT /api/staff/orders/:orderId/items/:itemId/status
// @access  Private/Staff
const updateOrderItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId, itemId } = req.params;
    
    if (!status || !['ordered', 'preparing', 'ready', 'delivered'].includes(status)) {
      return sendResponse(res, 400, 'fail', 'Invalid status');
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return sendResponse(res, 404, 'fail', 'Order not found');
    }
    
    // Ensure the order belongs to the staff member's restaurant
    if (order.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    const orderItem = await OrderItem.findById(itemId);
    
    if (!orderItem || orderItem.order.toString() !== orderId) {
      return sendResponse(res, 404, 'fail', 'Order item not found');
    }
    
    orderItem.status = status;
    await orderItem.save();
    
    // Check if all items are delivered and update order status if needed
    if (status === 'delivered') {
      const allItems = await OrderItem.find({ order: orderId });
      const allDelivered = allItems.every(item => item.status === 'delivered');
      
      if (allDelivered && order.status !== 'completed') {
        order.status = 'delivered';
        await order.save();
      }
    }
    
    return sendResponse(res, 200, 'success', 'Order item status updated successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  placeOrder,
  getCustomerOrders,
  getCustomerOrderById,
  getActiveOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus
};