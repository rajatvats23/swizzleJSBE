// routes/mfaRoutes.js
const express = require('express');
const router = express.Router();
const {
  initMfaSetup,
  verifyMfaSetup,
  verifyMfaLogin,
  toggleMfa
} = require('../controllers/mfaController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.get('/setup', protect, initMfaSetup);
router.post('/verify-setup', protect, verifyMfaSetup);

// Public route - used during login
router.post('/verify', verifyMfaLogin);

// Admin routes - superadmin only
router.put('/toggle/:id', protect, restrictTo('superadmin'), toggleMfa);

module.exports = router;