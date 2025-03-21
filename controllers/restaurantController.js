// controllers/restaurantController.js
const Restaurant = require('../models/restaurantModel');
const User = require('../models/userModel');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin/SuperAdmin
const createRestaurant = async (req, res) => {
  try {
    const { managerEmail } = req.body;

    // Check if a restaurant already exists with this manager email
    const existingRestaurant = await Restaurant.findOne({ managerEmail });
    if (existingRestaurant) {
      return sendResponse(res, 400, 'fail', 'A restaurant with this manager email already exists');
    }

    // Create restaurant with creator info
    const restaurant = await Restaurant.create({
      ...req.body,
      createdBy: req.user._id
    });

    // Generate invite token for the manager
    const inviteToken = crypto.randomBytes(20).toString('hex');
    const inviteTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create or update user for the manager with invite token
    let manager = await User.findOne({ email: managerEmail });
    
    if (manager) {
      // If user exists but isn't a manager, update their role
      if (manager.role !== 'manager') {
        manager.role = 'manager';
      }
    } else {
      // Create new user with manager role
      manager = new User({
        email: managerEmail,
        // Temporary values until they register
        firstName: 'Restaurant',
        lastName: 'Manager',
        password: crypto.randomBytes(10).toString('hex'),
        countryCode: '+1',
        phoneNumber: '0000000000',
        role: 'manager',
        inviteToken,
        inviteTokenExpiry,
        isVerified: false
      });
    }
    
    manager.inviteToken = inviteToken;
    manager.inviteTokenExpiry = inviteTokenExpiry;
    await manager.save();
    
    // Update restaurant with manager ID
    restaurant.manager = manager._id;
    await restaurant.save();

    // Send invitation email
    const inviteUrl = `${process.env.CLIENT_URL}/auth/register/${inviteToken}`;
    const msg = {
      to: managerEmail,
      from: process.env.EMAIL_FROM,
      subject: 'Invitation to Manage Your Restaurant',
      html: `
        <h1>You've been invited to manage your restaurant</h1>
        <p>Please click the link below to complete your registration and manage your restaurant:</p>
        <a href="${inviteUrl}" target="_blank">Complete Registration</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    await sgMail.send(msg);

    return sendResponse(res, 201, 'success', 'Restaurant created and invitation sent to manager', { restaurant });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Private/Admin/SuperAdmin
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('manager', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    return sendResponse(res, 200, 'success', 'Restaurants retrieved successfully', { restaurants });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Private (with role-based restrictions)
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('manager', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    if (!restaurant) {
      return sendResponse(res, 404, 'fail', 'Restaurant not found');
    }

    // Check permissions based on user role
    if (req.user.role === 'manager' && restaurant.manager && 
        restaurant.manager._id.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, 'fail', 'You are not authorized to view this restaurant');
    }

    return sendResponse(res, 200, 'success', 'Restaurant retrieved successfully', { restaurant });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (with role-based restrictions)
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return sendResponse(res, 404, 'fail', 'Restaurant not found');
    }

    // Check permissions based on user role
    if (req.user.role === 'manager') {
      // Managers can only update their own restaurant
      if (!restaurant.manager || restaurant.manager.toString() !== req.user._id.toString()) {
        return sendResponse(res, 403, 'fail', 'You are not authorized to update this restaurant');
      }
      
      // Managers cannot change manager assignment
      if (req.body.managerEmail && req.body.managerEmail !== restaurant.managerEmail) {
        return sendResponse(res, 400, 'fail', 'You cannot change the manager assignment');
      }
    }

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName email')
     .populate('createdBy', 'firstName lastName');

    return sendResponse(res, 200, 'success', 'Restaurant updated successfully', { restaurant: updatedRestaurant });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin/SuperAdmin
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return sendResponse(res, 404, 'fail', 'Restaurant not found');
    }

    await restaurant.deleteOne();

    return sendResponse(res, 200, 'success', 'Restaurant deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get manager's restaurant
// @route   GET /api/restaurants/manager/restaurant
// @access  Private/Manager
const getManagerRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ manager: req.user._id })
      .populate('createdBy', 'firstName lastName');

    if (!restaurant) {
      return sendResponse(res, 404, 'fail', 'No restaurant found for this manager');
    }

    return sendResponse(res, 200, 'success', 'Restaurant retrieved successfully', { restaurant });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getManagerRestaurant
};