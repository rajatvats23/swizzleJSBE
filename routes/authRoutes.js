const express = require('express');
const router = express.Router();
const {
    login,
    inviteAdmin,
    registerAdmin,
    createSuperAdmin,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect, restrictTo} = require('../middleware/authMiddleware');


//Public routes
router.post('/login', login);
router.post('/register/:token', registerAdmin);
router.post('/create-superAdmin', createSuperAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


// Protected Routes

router.post('/invite', protect, restrictTo('superadmin'), inviteAdmin);

module.exports = router;
