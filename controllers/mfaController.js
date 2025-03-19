// controllers/mfaController.js
const User = require('../models/userModel');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
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

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Initialize MFA setup
// @route   GET /api/mfa/setup
// @access  Private
const initMfaSetup = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Swizzle Admin:${user.email}`
    });
    
    // Save the secret temporarily in the user's document
    user.tempMfaSecret = secret.base32;
    await user.save();
    
    // Generate QR code
    const otpauthUrl = secret.otpauth_url;
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    
    return sendResponse(res, 200, 'success', 'MFA setup initialized', {
      qrCodeUrl,
      secret: secret.base32
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Verify MFA setup
// @route   POST /api/mfa/verify-setup
// @access  Private
const verifyMfaSetup = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;
    
    if (!code) {
      return sendResponse(res, 400, 'fail', 'Verification code is required');
    }
    
    const user = await User.findById(userId);
    
    if (!user || !user.tempMfaSecret) {
      return sendResponse(res, 400, 'fail', 'MFA setup not initiated');
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.tempMfaSecret,
      encoding: 'base32',
      token: code,
      window: 1 // Allow a 30-second window on either side of the current time
    });
    
    if (!verified) {
      return sendResponse(res, 400, 'fail', 'Invalid verification code');
    }
    
    // MFA setup verified, save the secret
    user.mfaSecret = user.tempMfaSecret;
    user.mfaEnabled = true;
    user.tempMfaSecret = undefined;
    await user.save();
    
    // Generate a new token
    const token = generateToken(user._id);
    
    return sendResponse(res, 200, 'success', 'MFA setup verified successfully', { token });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Verify MFA during login
// @route   POST /api/mfa/verify
// @access  Public
const verifyMfaLogin = async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return sendResponse(res, 400, 'fail', 'User ID and verification code are required');
    }
    
    const user = await User.findById(userId);
    
    if (!user || !user.mfaSecret || !user.mfaEnabled) {
      return sendResponse(res, 400, 'fail', 'MFA not set up for this user');
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1 // Allow a 30-second window on either side of the current time
    });
    
    if (!verified) {
      return sendResponse(res, 400, 'fail', 'Invalid verification code');
    }
    
    // Generate a new token
    const token = generateToken(user._id);
    
    return sendResponse(res, 200, 'success', 'MFA verification successful', { token });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Toggle MFA for a user (admin only)
// @route   PUT /api/mfa/toggle/:id
// @access  Private/SuperAdmin
const toggleMfa = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return sendResponse(res, 400, 'fail', 'Enabled status is required');
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    if (!enabled) {
      // Disable MFA
      user.mfaEnabled = false;
      user.mfaSecret = undefined;
      user.tempMfaSecret = undefined;
    } else if (enabled && !user.mfaEnabled) {
      // Flag for setup on next login
      user.mfaEnabled = true; // Enable MFA requirement
      user.mfaSecret = undefined; // Clear any existing secret to force setup
      user.tempMfaSecret = undefined; // Clear any partial setup
    }
    
    await user.save();
    
    return sendResponse(res, 200, 'success', `MFA ${enabled ? 'enabled' : 'disabled'} successfully`);
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  initMfaSetup,
  verifyMfaSetup,
  verifyMfaLogin,
  toggleMfa
};