// controllers/customerAuthController.js
const Customer = require('../models/customerModel');
const Table = require('../models/tableModel');
const Restaurant = require('../models/restaurantModel');
const twilio = require('twilio');

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Standardized response structure (same as your other controllers)
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

// @desc    Send OTP to customer's phone
// @route   POST /api/customer/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return sendResponse(res, 400, 'fail', 'Phone number is required');
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    
    // Find or create customer
    let customer = await Customer.findOne({ phoneNumber });
    
    if (!customer) {
      customer = new Customer({
        phoneNumber,
        otp: {
          code: otp,
          expiresAt: otpExpiresAt
        }
      });
    } else {
      customer.otp = {
        code: otp,
        expiresAt: otpExpiresAt
      };
    }
    
    await customer.save();
    
    // Send OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your verification code for Restaurant App is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return sendResponse(res, 200, 'success', 'OTP sent successfully');
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      
      // In development, return OTP for testing
      if (process.env.NODE_ENV === 'development') {
        return sendResponse(res, 200, 'success', 'OTP generated for testing', { otp });
      }
      
      return sendResponse(res, 500, 'error', 'Failed to send OTP');
    }
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Verify OTP and authenticate customer
// @route   POST /api/customer/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return sendResponse(res, 400, 'fail', 'Phone number and OTP are required');
    }
    
    const customer = await Customer.findOne({ phoneNumber });
    
    if (!customer) {
      return sendResponse(res, 404, 'fail', 'Customer not found');
    }
    
    // Verify OTP
    if (!customer.isOtpValid(otp)) {
      return sendResponse(res, 400, 'fail', 'Invalid or expired OTP');
    }
    
    // Mark as verified and clear OTP
    customer.isVerified = true;
    customer.otp = undefined;
    await customer.save();
    
    // Generate token
    const token = customer.generateAuthToken();
    
    return sendResponse(res, 200, 'success', 'OTP verified successfully', {
      token,
      customer: {
        _id: customer._id,
        phoneNumber: customer.phoneNumber,
        name: customer.name
      }
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Scan table QR code and start session
// @route   POST /api/customer/scan-table/:qrCodeIdentifier
// @access  Private/Customer
const scanTable = async (req, res) => {
  try {
    const { qrCodeIdentifier } = req.params;
    
    // Find table by QR code
    const table = await Table.findOne({ qrCodeIdentifier }).populate('restaurantId');
    
    if (!table) {
      return sendResponse(res, 404, 'fail', 'Table not found');
    }
    
    // Check if table is available
    if (table.status !== 'Available' && table.status !== 'Reserved') {
      return sendResponse(res, 400, 'fail', `Table is currently ${table.status.toLowerCase()}`);
    }
    
    const customer = await Customer.findById(req.customer.id);
    
    // Update customer session
    customer.currentSession = {
      restaurant: table.restaurantId,
      table: table._id,
      startTime: new Date(),
      active: true
    };
    
    // Add to visit history
    customer.visitHistory.push({
      restaurant: table.restaurantId,
      table: table._id,
      visitDate: new Date(),
      checkedOut: false
    });
    
    await customer.save();
    
    // Update table status
    table.status = 'Occupied';
    table.currentOccupancy = Math.max(1, table.currentOccupancy || 0);
    await table.save();
    
    return sendResponse(res, 200, 'success', 'Table session started', {
      table: {
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity
      },
      restaurant: {
        _id: table.restaurantId._id,
        name: table.restaurantId.name
      },
      session: customer.currentSession
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Check out from table
// @route   POST /api/customer/checkout
// @access  Private/Customer
const checkout = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    
    if (!customer.currentSession || !customer.currentSession.active) {
      return sendResponse(res, 400, 'fail', 'No active session to check out from');
    }
    
    // Update latest visit history entry
    const visitIndex = customer.visitHistory.findIndex(
      visit => visit.restaurant.toString() === customer.currentSession.restaurant.toString() &&
               visit.table.toString() === customer.currentSession.table.toString() &&
               !visit.checkedOut
    );
    
    if (visitIndex !== -1) {
      customer.visitHistory[visitIndex].checkedOut = true;
    }
    
    // Get table reference before clearing session
    const tableId = customer.currentSession.table;
    
    // Clear current session
    customer.currentSession.active = false;
    
    await customer.save();
    
    // Update table status
    const table = await Table.findById(tableId);
    if (table) {
      table.status = 'Cleaning';
      table.currentOccupancy = 0;
      await table.save();
    }
    
    return sendResponse(res, 200, 'success', 'Checked out successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get customer profile
// @route   GET /api/customer/profile
// @access  Private/Customer
const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id)
      .select('-otp');
    
    if (!customer) {
      return sendResponse(res, 404, 'fail', 'Customer not found');
    }
    
    return sendResponse(res, 200, 'success', 'Profile retrieved successfully', { customer });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private/Customer
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const customer = await Customer.findById(req.customer.id);
    
    if (!customer) {
      return sendResponse(res, 404, 'fail', 'Customer not found');
    }
    
    // Update fields
    if (name) customer.name = name;
    
    await customer.save();
    
    return sendResponse(res, 200, 'success', 'Profile updated successfully', {
      customer: {
        _id: customer._id,
        phoneNumber: customer.phoneNumber,
        name: customer.name
      }
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  scanTable,
  checkout,
  getProfile,
  updateProfile
};