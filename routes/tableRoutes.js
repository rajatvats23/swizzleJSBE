// routes/tableRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableStatus,
  getTableByQRCode
} = require('../controllers/tableController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Routes accessible to restaurant managers only
router.route('/')
  .get(protect, restrictTo('manager', 'staff'), getTables)  // Staff can view tables but not modify
  .post(protect, restrictTo('manager'), createTable);       // Only managers can create

router.route('/:id')
  .get(protect, restrictTo('manager', 'staff'), getTableById)   // Staff can view
  .put(protect, restrictTo('manager'), updateTable)             // Only managers can update
  .delete(protect, restrictTo('manager'), deleteTable);         // Only managers can delete

// Special route for updating table status - both managers and staff can update status
router.route('/:id/status')
  .patch(protect, restrictTo('manager', 'staff'), updateTableStatus);

// Public route for QR code access
router.route('/qr/:qrCodeIdentifier')
  .get(getTableByQRCode);

module.exports = router;