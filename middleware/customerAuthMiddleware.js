// middleware/customerAuthMiddleware.js
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');

// Standardized error response
const sendErrorResponse = (res, statusCode, status, message) => {
  return res.status(statusCode).json({
    status,
    message
  });
};

// Protect routes for authenticated customers
const protectCustomer = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return sendErrorResponse(res, 401, 'fail', 'Not authorized, no token provided');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for customer
    if (decoded.type !== 'customer') {
      return sendErrorResponse(res, 403, 'fail', 'Not authorized, invalid token type');
    }
    
    // Find customer by id
    const customer = await Customer.findById(decoded.id);
    
    if (!customer) {
      return sendErrorResponse(res, 401, 'fail', 'Not authorized, customer not found');
    }
    
    // Attach customer to request object
    req.customer = {
      id: customer._id
    };
    
    next();
  } catch (error) {
    return sendErrorResponse(res, 401, 'fail', 'Not authorized, token failed');
  }
};

// Check if customer has active session
const activeSession = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    
    if (!customer.currentSession || !customer.currentSession.active) {
      return sendErrorResponse(res, 403, 'fail', 'No active table session. Please scan a table QR code');
    }
    
    next();
  } catch (error) {
    return sendErrorResponse(res, 500, 'fail', 'Server error');
  }
};

module.exports = { protectCustomer, activeSession };