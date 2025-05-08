// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDailyRevenue,
  getTopSellingItems,
  getAverageOrderValue,
  getTableOccupancy,
  getPeakHours,
  getOrderFulfillmentTime,
  getCustomerReturnRate,
  getCategoryPerformance,
  getPaymentMethodDistribution,
  getStaffPerformance,
  getDashboardSummary
} = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes should be protected and restricted to appropriate roles
router.use(protect, restrictTo('superadmin', 'admin', 'manager'));

// Dashboard summary
router.get('/dashboard-summary', getDashboardSummary);

// Revenue analytics
router.get('/daily-revenue', getDailyRevenue);
router.get('/top-selling-items', getTopSellingItems);
router.get('/average-order-value', getAverageOrderValue);

// Operational analytics
router.get('/table-occupancy', getTableOccupancy);
router.get('/peak-hours', getPeakHours);
router.get('/order-fulfillment-time', getOrderFulfillmentTime);

// Customer analytics
router.get('/customer-return-rate', getCustomerReturnRate);

// Product analytics
router.get('/category-performance', getCategoryPerformance);

// Financial analytics
router.get('/payment-method-distribution', getPaymentMethodDistribution);

// Staff analytics
router.get('/staff-performance', restrictTo('superadmin', 'admin', 'manager'), getStaffPerformance);

module.exports = router;