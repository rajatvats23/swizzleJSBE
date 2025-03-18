const express = require('express');
const router = express.Router();
const {
    login,
    inviteAdmin,
    registerAdmin,
    createSuperAdmin
} = require('../controllers/authController');
const { protect, restrictTo} = require('../middleware/authMiddleware');


//Public routes
router.post('/login', login);
router.post('/register/:token', registerAdmin);
router.post('/create-superAdmin', createSuperAdmin);


// Protected Routes

router.post('/invite', protect, restrictTo('superadmin'), inviteAdmin);

module.exports = router;
