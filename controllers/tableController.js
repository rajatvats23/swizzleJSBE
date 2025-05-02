// controllers/tableController.js
const Table = require('../models/tableModel');
const crypto = require('crypto');

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

// Create a new table
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    
    // Generate a unique QR code identifier
    const qrCodeIdentifier = crypto.randomBytes(16).toString('hex');
    
    const table = await Table.create({
      tableNumber,
      restaurantId: req.user.restaurantId,
      capacity,
      qrCodeIdentifier
    });
    
    return sendResponse(res, 201, 'success', 'Table created successfully', { table });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// Get all tables for a restaurant
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.user.restaurantId })
      .sort('tableNumber');
    
    return sendResponse(res, 200, 'success', 'Tables retrieved successfully', { tables });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// Get table by ID
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return sendResponse(res, 404, 'fail', 'Table not found');
    }
    
    // Check if the table belongs to the restaurant of the logged-in user
    if (table.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    return sendResponse(res, 200, 'success', 'Table retrieved successfully', { table });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// Update table
exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status, currentOccupancy } = req.body;
    
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return sendResponse(res, 404, 'fail', 'Table not found');
    }
    
    // Check if the table belongs to the restaurant of the logged-in user
    if (table.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    // Update fields
    if (tableNumber) table.tableNumber = tableNumber;
    if (capacity) table.capacity = capacity;
    if (status) table.status = status;
    if (currentOccupancy !== undefined) table.currentOccupancy = currentOccupancy;
    
    await table.save();
    
    return sendResponse(res, 200, 'success', 'Table updated successfully', { table });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// Delete table
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return sendResponse(res, 404, 'fail', 'Table not found');
    }
    
    // Check if the table belongs to the restaurant of the logged-in user
    if (table.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    await table.deleteOne();
    
    return sendResponse(res, 200, 'success', 'Table deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// Update table status
exports.updateTableStatus = async (req, res) => {
  try {
    const { status, currentOccupancy } = req.body;
    
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return sendResponse(res, 404, 'fail', 'Table not found');
    }
    
    // Update status
    if (status) table.status = status;
    if (currentOccupancy !== undefined) table.currentOccupancy = currentOccupancy;
    
    await table.save();
    
    return sendResponse(res, 200, 'success', 'Table status updated successfully', { table });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// Get table by QR code identifier
exports.getTableByQRCode = async (req, res) => {
    try {
      const { qrCodeIdentifier } = req.params;
      
      const table = await Table.findOne({ qrCodeIdentifier }).populate('restaurantId');
      
      if (!table) {
        return sendResponse(res, 404, 'fail', 'Table not found');
      }
      
      // Include the restaurant's staff approval setting in the response
      const requiresStaffApproval = table.restaurantId.requiresStaffApproval;
      
      return sendResponse(res, 200, 'success', 'Table retrieved successfully', { 
        table,
        requiresStaffApproval 
      });
    } catch (error) {
      return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
    }
  };