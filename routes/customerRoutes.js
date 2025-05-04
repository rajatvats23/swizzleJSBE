// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  scanTable,
  checkout,
  getProfile,
  updateProfile
} = require('../controllers/customerAuthController');
const { protectCustomer, activeSession } = require('../middleware/customerAuthMiddleware');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes - require customer authentication
router.use(protectCustomer);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/scan-table/:qrCodeIdentifier', scanTable);

// Protected routes - require active session
router.post('/checkout', activeSession, checkout);

module.exports = router;