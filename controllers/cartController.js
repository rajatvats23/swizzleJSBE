// controllers/cartController.js
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

// @desc    Get customer's cart
// @route   GET /api/customer/cart
// @access  Private/Customer
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.customer.id })
      .populate({
        path: 'items.product',
        select: 'name price imageUrl'
      })
      .populate({
        path: 'items.selectedAddons.addon',
        select: 'name'
      });
    
    if (!cart) {
      return sendResponse(res, 200, 'success', 'Cart is empty', { 
        items: [],
        totalAmount: 0
      });
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
    
    return sendResponse(res, 200, 'success', 'Cart retrieved successfully', {
      cart,
      totalAmount
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/customer/cart
// @access  Private/Customer
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedAddons, specialInstructions } = req.body;
    
    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, 'fail', 'Product not found');
    }
    
    // Ensure customer has an active session
    if (!req.customer.currentSession || !req.customer.currentSession.active) {
      return sendResponse(res, 400, 'fail', 'No active table session');
    }
    
    const restaurantId = req.customer.currentSession.restaurant;
    const tableId = req.customer.currentSession.table;
    
    // Find or create cart
    let cart = await Cart.findOne({ customer: req.customer.id });
    
    if (!cart) {
      cart = new Cart({
        customer: req.customer.id,
        restaurant: restaurantId,
        table: tableId,
        items: []
      });
    }
    
    // Check if item is already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex !== -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity || 1;
      
      // Update addons if provided
      if (selectedAddons) {
        cart.items[existingItemIndex].selectedAddons = selectedAddons;
      }
      
      // Update special instructions if provided
      if (specialInstructions) {
        cart.items[existingItemIndex].specialInstructions = specialInstructions;
      }
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        selectedAddons: selectedAddons || [],
        specialInstructions: specialInstructions || ''
      });
    }
    
    await cart.save();
    
    return sendResponse(res, 200, 'success', 'Item added to cart successfully', { cart });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update cart item
// @route   PUT /api/customer/cart/:itemId
// @access  Private/Customer
const updateCartItem = async (req, res) => {
  try {
    const { quantity, selectedAddons, specialInstructions } = req.body;
    const itemId = req.params.itemId;
    
    const cart = await Cart.findOne({ customer: req.customer.id });
    
    if (!cart) {
      return sendResponse(res, 404, 'fail', 'Cart not found');
    }
    
    // Find the item in the cart
    const item = cart.items.id(itemId);
    
    if (!item) {
      return sendResponse(res, 404, 'fail', 'Item not found in cart');
    }
    
    // Update item
    if (quantity !== undefined) {
      item.quantity = quantity;
    }
    
    if (selectedAddons) {
      item.selectedAddons = selectedAddons;
    }
    
    if (specialInstructions !== undefined) {
      item.specialInstructions = specialInstructions;
    }
    
    // If quantity is 0 or less, remove the item
    if (item.quantity <= 0) {
      cart.items.pull(itemId);
    }
    
    await cart.save();
    
    return sendResponse(res, 200, 'success', 'Cart updated successfully', { cart });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/customer/cart/:itemId
// @access  Private/Customer
const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    const cart = await Cart.findOne({ customer: req.customer.id });
    
    if (!cart) {
      return sendResponse(res, 404, 'fail', 'Cart not found');
    }
    
    // Remove the item
    cart.items.pull(itemId);
    await cart.save();
    
    return sendResponse(res, 200, 'success', 'Item removed from cart');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/customer/cart
// @access  Private/Customer
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer.id });
    
    if (!cart) {
      return sendResponse(res, 200, 'success', 'Cart is already empty');
    }
    
    cart.items = [];
    await cart.save();
    
    return sendResponse(res, 200, 'success', 'Cart cleared successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};