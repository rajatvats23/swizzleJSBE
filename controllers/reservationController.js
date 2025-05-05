// controllers/reservationController.js
const Reservation = require('../models/reservationModel');
const Table = require('../models/tableModel');

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

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private/Staff/Manager
const createReservation = async (req, res) => {
  try {
    const { 
      customerName, 
      phoneNumber, 
      email, 
      partySize, 
      reservationDate, 
      specialRequests 
    } = req.body;
    
    // Create reservation
    const reservation = await Reservation.create({
      restaurant: req.user.restaurantId,
      customer: {
        name: customerName,
        phoneNumber,
        email: email || ''
      },
      partySize,
      reservationDate: new Date(reservationDate),
      specialRequests: specialRequests || '',
      createdBy: req.user._id
    });
    
    return sendResponse(res, 201, 'success', 'Reservation created successfully', { reservation });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get all reservations for a restaurant
// @route   GET /api/reservations
// @access  Private/Staff/Manager
const getReservations = async (req, res) => {
  try {
    const { date, status } = req.query;
    
    // Build query
    const query = { restaurant: req.user.restaurantId };
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.reservationDate = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const reservations = await Reservation.find(query)
      .populate('table', 'tableNumber')
      .populate('assignedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort('reservationDate');
    
    return sendResponse(res, 200, 'success', 'Reservations retrieved successfully', { reservations });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private/Staff/Manager
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('table', 'tableNumber')
      .populate('assignedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');
    
    if (!reservation) {
      return sendResponse(res, 404, 'fail', 'Reservation not found');
    }
    
    // Check if reservation belongs to the user's restaurant
    if (reservation.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to access this reservation');
    }
    
    return sendResponse(res, 200, 'success', 'Reservation retrieved successfully', { reservation });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private/Staff/Manager
const updateReservation = async (req, res) => {
  try {
    const { 
      customerName, 
      phoneNumber, 
      email, 
      partySize, 
      reservationDate, 
      specialRequests,
      status
    } = req.body;
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return sendResponse(res, 404, 'fail', 'Reservation not found');
    }
    
    // Check if reservation belongs to the user's restaurant
    if (reservation.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to update this reservation');
    }
    
    // Update fields
    if (customerName) reservation.customer.name = customerName;
    if (phoneNumber) reservation.customer.phoneNumber = phoneNumber;
    if (email !== undefined) reservation.customer.email = email;
    if (partySize) reservation.partySize = partySize;
    if (reservationDate) reservation.reservationDate = new Date(reservationDate);
    if (specialRequests !== undefined) reservation.specialRequests = specialRequests;
    if (status) reservation.status = status;
    
    await reservation.save();
    
    return sendResponse(res, 200, 'success', 'Reservation updated successfully', { reservation });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Assign table to reservation
// @route   PUT /api/reservations/:id/assign-table
// @access  Private/Staff/Manager
const assignTable = async (req, res) => {
  try {
    const { tableId } = req.body;
    
    if (!tableId) {
      return sendResponse(res, 400, 'fail', 'Table ID is required');
    }
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return sendResponse(res, 404, 'fail', 'Reservation not found');
    }
    
    // Check if reservation belongs to the user's restaurant
    if (reservation.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to update this reservation');
    }
    
    // Check if table exists and belongs to the restaurant
    const table = await Table.findOne({ 
      _id: tableId,
      restaurantId: req.user.restaurantId
    });
    
    if (!table) {
      return sendResponse(res, 404, 'fail', 'Table not found or does not belong to your restaurant');
    }
    
    // Update reservation with table and change status to confirmed
    reservation.table = tableId;
    reservation.assignedBy = req.user._id;
    
    if (reservation.status === 'pending') {
      reservation.status = 'confirmed';
    }
    
    await reservation.save();
    
    return sendResponse(res, 200, 'success', 'Table assigned to reservation successfully', { reservation });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Change reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private/Staff/Manager
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return sendResponse(res, 400, 'fail', 'Valid status is required');
    }
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return sendResponse(res, 404, 'fail', 'Reservation not found');
    }
    
    // Check if reservation belongs to the user's restaurant
    if (reservation.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Not authorized to update this reservation');
    }
    
    // Handle "seated" status - update table status
    if (status === 'seated' && reservation.table) {
      const table = await Table.findById(reservation.table);
      if (table) {
        table.status = 'Occupied';
        table.currentOccupancy = reservation.partySize;
        await table.save();
      }
    }
    
    // Handle "completed" or "cancelled" status - free up table if assigned
    if ((status === 'completed' || status === 'cancelled') && reservation.table) {
      const table = await Table.findById(reservation.table);
      if (table && table.status === 'Occupied') {
        table.status = 'Cleaning';
        table.currentOccupancy = 0;
        await table.save();
      }
    }
    
    // Update reservation status
    reservation.status = status;
    await reservation.save();
    
    return sendResponse(res, 200, 'success', 'Reservation status updated successfully', { reservation });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get available tables for a reservation
// @route   GET /api/reservations/available-tables
// @access  Private/Staff/Manager
const getAvailableTables = async (req, res) => {
  try {
    const { date, partySize } = req.query;
    
    if (!date || !partySize) {
      return sendResponse(res, 400, 'fail', 'Date and party size are required');
    }
    
    const targetDate = new Date(date);
    
    // Get all tables for the restaurant that can accommodate the party size
    const allTables = await Table.find({
      restaurantId: req.user.restaurantId,
      capacity: { $gte: parseInt(partySize) }
    }).sort('tableNumber');
    
    // Find existing reservations for the target date
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const existingReservations = await Reservation.find({
      restaurant: req.user.restaurantId,
      reservationDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['confirmed', 'pending', 'seated'] },
      table: { $ne: null }
    });
    
    // Get IDs of tables that are already reserved
    const reservedTableIds = existingReservations.map(res => res.table.toString());
    
    // Filter out reserved tables
    const availableTables = allTables.filter(table => 
      !reservedTableIds.includes(table._id.toString())
    );
    
    return sendResponse(res, 200, 'success', 'Available tables retrieved successfully', { availableTables });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  assignTable,
  updateStatus,
  getAvailableTables
};