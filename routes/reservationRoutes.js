// routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  assignTable,
  updateStatus,
  getAvailableTables
} = require('../controllers/reservationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect, restrictTo('manager', 'staff'));

router.route('/')
  .post(createReservation)
  .get(getReservations);

router.route('/available-tables')
  .get(getAvailableTables);

router.route('/:id')
  .get(getReservationById)
  .put(updateReservation);

router.route('/:id/assign-table')
  .put(assignTable);

router.route('/:id/status')
  .put(updateStatus);

module.exports = router;