const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const Restaurant = require('../models/restaurantModel');

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
      // If MFA is enabled for this user
      if (user.mfaEnabled) {
        if (user.mfaSecret) {
          // MFA already set up, require verification
          const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            countryCode: user.countryCode,
            phoneNumber: user.phoneNumber,
            requireMfa: true,
            mfaSetupRequired: false
          };
          
          // Only add restaurantId if it exists
          if (user.restaurantId) {
            userData.restaurantId = user.restaurantId;
          }
          
          return sendResponse(res, 200, 'success', 'MFA verification required', userData);
        } else {
          // MFA enabled by admin but not set up yet, require setup
          const tempToken = jwt.sign(
            { id: user._id, temp: true },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // Short expiry for security
          );
          
          const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            countryCode: user.countryCode,
            phoneNumber: user.phoneNumber,
            requireMfa: true,
            mfaSetupRequired: true,
            tempToken: tempToken // Add temporary token for MFA setup
          };
          
          // Only add restaurantId if it exists
          if (user.restaurantId) {
            userData.restaurantId = user.restaurantId;
          }
          
          return sendResponse(res, 200, 'success', 'MFA setup required', userData);
        }
      }
      
      // Normal login, no MFA required
      const userData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id)
      };
      
      // Only add restaurantId if it exists
      if (user.restaurantId) {
        userData.restaurantId = user.restaurantId;
      }
      
      return sendResponse(res, 200, 'success', 'Login successful', userData);
    } else {
      return sendResponse(res, 401, 'fail', 'Invalid email or password');
    }
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Send invite to admin or staff
// @route   POST /api/auth/invite
// @access  Private/SuperAdmin/Admin/Manager
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

    // Determine role and restaurant based on inviter's role
    let role = 'admin'; // Default role
    let restaurantId = null;

    // If inviter is restaurant manager, set role to staff and assign restaurant
    if (req.user.role === 'manager') {
      role = 'staff';
      restaurantId = req.user.restaurantId;
    }

    if (user) {
      // Update existing unverified user
      user.inviteToken = inviteToken;
      user.inviteTokenExpiry = inviteTokenExpiry;
      user.createdBy = req.user._id;
      user.role = role;
      
      // Only set restaurantId if it exists
      if (restaurantId) {
        user.restaurantId = restaurantId;
      }
    } else {
      // Create a new user with appropriate role
      const userData = {
        email,
        inviteToken,
        inviteTokenExpiry,
        role,
        createdBy: req.user._id,
        // Setting temporary values for required fields
        firstName: 'Pending',
        lastName: 'Registration',
        password: crypto.randomBytes(10).toString('hex'),
        countryCode: '+91',
        phoneNumber: '0000000000'
      };
      
      // Only add restaurantId if it exists
      if (restaurantId) {
        userData.restaurantId = restaurantId;
      }
      
      user = new User(userData);
    }

    await user.save();

    // Create invite URL
    const inviteUrl = `${process.env.CLIENT_URL}/auth/register/${inviteToken}`;

    // Send email using SendGrid
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: role === 'staff' ? 'Invitation to Join as Staff' : 'Invitation to Join as Admin',
      html: `
        <h1>You've been invited to join as ${role === 'staff' ? 'Restaurant Staff' : 'an Admin'}</h1>
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

    //If user is a manager, update their associated restaurant
    if (user.role === 'manager') {
      await Restaurant.findOneAndUpdate(
        {managerEmail: user.email},
        {manager: user._id}
      );
    }

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      countryCode: user.countryCode,
      phoneNumber: user.phoneNumber,
      token: generateToken(user._id)
    };
    
    // Only add restaurantId if it exists
    if (user.restaurantId) {
      userData.restaurantId = user.restaurantId;
    }

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return sendResponse(res, 404, 'fail', 'User not found');
    }
    
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    };
    
    await sgMail.send(msg);
    return sendResponse(res, 200, 'success', 'Reset email sent');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return sendResponse(res, 400, 'fail', 'Invalid or expired token');
    }
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return sendResponse(res, 200, 'success', 'Password updated successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  login,
  inviteAdmin,
  registerAdmin,
  createSuperAdmin,
  forgotPassword,
  resetPassword
};