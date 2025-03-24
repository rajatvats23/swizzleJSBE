// controllers/addonController.js
const Addon = require('../models/addonModel');
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

// @desc    Create a new addon
// @route   POST /api/addons
// @access  Private/Manager
const createAddon = async (req, res) => {
  try {
    const { name, isMultiSelect, subAddons } = req.body;
    
    // Create addon with restaurant and creator info
    const addon = await Addon.create({
      name,
      isMultiSelect: isMultiSelect !== undefined ? isMultiSelect : false,
      subAddons: subAddons || [],
      createdBy: req.user._id,
      restaurant: req.user.restaurantId
    });
    
    return sendResponse(res, 201, 'success', 'Addon created successfully', { addon });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get all addons for manager's restaurant
// @route   GET /api/addons
// @access  Private/Manager
const getAddons = async (req, res) => {
  try {
    // For managers, only show their restaurant's addons
    const query = { restaurant: req.user.restaurantId };
    
    const addons = await Addon.find(query).sort('name');
    
    return sendResponse(res, 200, 'success', 'Addons retrieved successfully', { addons });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get addon by ID
// @route   GET /api/addons/:id
// @access  Private/Manager
const getAddonById = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);
    
    if (!addon) {
      return sendResponse(res, 404, 'fail', 'Addon not found');
    }
    
    // Check if manager owns this addon
    if (addon.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    return sendResponse(res, 200, 'success', 'Addon retrieved successfully', { addon });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update addon
// @route   PUT /api/addons/:id
// @access  Private/Manager
const updateAddon = async (req, res) => {
  try {
    const { name, isMultiSelect, subAddons } = req.body;
    
    const addon = await Addon.findById(req.params.id);
    
    if (!addon) {
      return sendResponse(res, 404, 'fail', 'Addon not found');
    }
    
    // Check if manager owns this addon
    if (addon.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'You can only update addons from your restaurant');
    }
    
    // Update fields
    addon.name = name || addon.name;
    addon.isMultiSelect = isMultiSelect !== undefined ? isMultiSelect : addon.isMultiSelect;
    addon.subAddons = subAddons || addon.subAddons;
    
    await addon.save();
    
    return sendResponse(res, 200, 'success', 'Addon updated successfully', { addon });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Delete addon
// @route   DELETE /api/addons/:id
// @access  Private/Manager
const deleteAddon = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);
    
    if (!addon) {
      return sendResponse(res, 404, 'fail', 'Addon not found');
    }
    
    // Check if manager owns this addon
    if (addon.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'You can only delete addons from your restaurant');
    }
    
    // Check if addon is used by any products
    const productsUsingAddon = await Product.countDocuments({ 'addons.addon': req.params.id });
    
    if (productsUsingAddon > 0) {
      return sendResponse(res, 400, 'fail', `Cannot delete addon. It is used by ${productsUsingAddon} products.`);
    }
    
    await addon.deleteOne();
    
    return sendResponse(res, 200, 'success', 'Addon deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  createAddon,
  getAddons,
  getAddonById,
  updateAddon,
  deleteAddon
};