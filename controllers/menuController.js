const Menu = require('../models/menuModel');

// Standardized response structure
const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.json(response);
};

// @desc    Create a new menu
// @route   POST /api/menus
// @access  Private/Manager
const createMenu = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create menu with creator info and restaurant association
    const menu = await Menu.create({
      name,
      description,
      restaurantId: req.user.restaurantId,
      createdBy: req.user._id
    });
    
    return sendResponse(res, 201, 'success', 'Menu created successfully', { menu });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get all menus
// @route   GET /api/menus
// @access  Private (with role-based filtering)
const getMenus = async (req, res) => {
  try {
    let query = {};
    
    // If user is a manager, only show their restaurant's menus
    if (req.user.role === 'manager' && req.user.restaurantId) {
      query.restaurantId = req.user.restaurantId;
    }
    
    const menus = await Menu.find(query)
      .populate('restaurantId', 'name')
      .populate('createdBy', 'firstName lastName');
      
    return sendResponse(res, 200, 'success', 'Menus retrieved successfully', { menus });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get menu by ID
// @route   GET /api/menus/:id
// @access  Private (with role-based filtering)
const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)
      .populate('restaurantId', 'name')
      .populate('createdBy', 'firstName lastName');
      
    if (!menu) {
      return sendResponse(res, 404, 'fail', 'Menu not found');
    }
    
    // Check if manager has access to this menu
    if (req.user.role === 'manager' && 
        menu.restaurantId && 
        menu.restaurantId._id.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to access this menu');
    }
    
    return sendResponse(res, 200, 'success', 'Menu retrieved successfully', { menu });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update menu
// @route   PUT /api/menus/:id
// @access  Private/Manager
const updateMenu = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    let menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return sendResponse(res, 404, 'fail', 'Menu not found');
    }
    
    // Check if manager has access to update this menu
    if (menu.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to update this menu');
    }
    
    menu.name = name || menu.name;
    menu.description = description || menu.description;
    
    const updatedMenu = await menu.save();
    
    return sendResponse(res, 200, 'success', 'Menu updated successfully', { menu: updatedMenu });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Delete menu
// @route   DELETE /api/menus/:id
// @access  Private/Manager
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return sendResponse(res, 404, 'fail', 'Menu not found');
    }
    
    // Check if manager has access to delete this menu
    if (menu.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to delete this menu');
    }
    
    await menu.deleteOne();
    
    return sendResponse(res, 200, 'success', 'Menu deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu
};