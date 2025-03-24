// routes/addonRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAddon,
  getAddons,
  getAddonById,
  updateAddon,
  deleteAddon
} = require('../controllers/addonController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Routes available only to restaurant managers
router.use(protect, restrictTo('manager'));

router.route('/')
  .get(getAddons)
  .post(createAddon);

router.route('/:id')
  .get(getAddonById)
  .put(updateAddon)
  .delete(deleteAddon);

module.exports = router;