const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

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

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return sendResponse(res, 400, 'fail', 'Please provide email and password');
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      const userData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      };
      
      return sendResponse(res, 200, 'success', 'Login successful', userData);
    } else {
      return sendResponse(res, 401, 'fail', 'Invalid email or password');
    }
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Send invite to admin
// @route   POST /api/auth/invite
// @access  Private/SuperAdmin
const inviteAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return sendResponse(res, 400, 'fail', 'Please provide an email');
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return sendResponse(res, 400, 'fail', 'User already exists');
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(20).toString('hex');
    const inviteTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    if (user) {
      // Update existing unverified user
      user.inviteToken = inviteToken;
      user.inviteTokenExpiry = inviteTokenExpiry;
      user.createdBy = req.user._id;
    } else {
      // Create a new user with invite token
      user = new User({
        email,
        inviteToken,
        inviteTokenExpiry,
        role: 'admin',
        createdBy: req.user._id,
        // Setting temporary values for required fields
        firstName: 'Pending',
        lastName: 'Registration',
        password: crypto.randomBytes(10).toString('hex'),
        countryCode: '+91',
        phoneNumber: '0000000000'
      });
    }

    await user.save();

    // Create invite URL
    const inviteUrl = `${process.env.CLIENT_URL}/signup/${inviteToken}`;

    // Send email using SendGrid
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Invitation to Join as Admin',
      html: `
        <h1>You've been invited to join as an Admin</h1>
        <p>Please click the link below to complete your registration:</p>
        <a href="${inviteUrl}" target="_blank">Complete Registration</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    await sgMail.send(msg);

    return sendResponse(res, 200, 'success', 'Invitation sent successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Register admin using invite token
// @route   POST /api/auth/register/:token
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const { token } = req.params;
    const { firstName, lastName, password, countryCode, phoneNumber } = req.body;

    // Find user by invite token and check if token is valid
    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, 'fail', 'Invalid or expired token');
    }

    // Update user information
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password;
    user.countryCode = countryCode;
    user.phoneNumber = phoneNumber;
    user.isVerified = true;
    user.inviteToken = undefined;
    user.inviteTokenExpiry = undefined;

    await user.save();

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };

    return sendResponse(res, 200, 'success', 'Registration successful', userData);
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Create superadmin user
// @route   POST /api/auth/create-superadmin
// @access  Public (should be restricted or removed in production)
const createSuperAdmin = async (req, res) => {
  try {
    const superAdminExists = await User.findOne({ role: 'superadmin' });
    
    if (superAdminExists) {
      return sendResponse(res, 400, 'fail', 'Super admin already exists');
    }

    const superAdmin = await User.create({
      firstName: 'Rajat',
      lastName: 'Vats',
      email: 'superadmin@yopmail.com',
      password: 'Qwerty@123',
      countryCode: '+91',
      phoneNumber: '1234567890',
      role: 'superadmin',
      isVerified: true
    });

    return sendResponse(res, 201, 'success', 'Super admin created successfully', {
      _id: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  login,
  inviteAdmin,
  registerAdmin,
  createSuperAdmin
};