const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

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

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return sendResponse(res, 200, 'success', 'Users retrieved successfully', { users });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/SuperAdmin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    return sendResponse(res, 200, 'success', 'User retrieved successfully', { user });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, countryCode, phoneNumber } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.countryCode = countryCode || user.countryCode;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    
    const updatedUser = await user.save();
    
    return sendResponse(res, 200, 'success', 'User updated successfully', {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      countryCode: updatedUser.countryCode,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    if (user.role === 'superadmin') {
      return sendResponse(res, 400, 'fail', 'Cannot delete superadmin');
    }
    
    await user.deleteOne();
    
    return sendResponse(res, 200, 'success', 'User deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    return sendResponse(res, 200, 'success', 'User profile retrieved successfully', { user });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, countryCode, phoneNumber, password } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.countryCode = countryCode || user.countryCode;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    
    // Update password if provided
    if (password) {
      user.password = password;
    }
    
    const updatedUser = await user.save();
    
    return sendResponse(res, 200, 'success', 'Profile updated successfully', {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      countryCode: updatedUser.countryCode,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      token: password ? generateToken(updatedUser._id) : undefined
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  };