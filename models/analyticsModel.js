// models/analyticsModel.js
const mongoose = require('mongoose');

// Daily Revenue snapshot schema - stores daily revenue summaries
const dailyRevenueSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  orderCount: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  paymentMethods: {
    cash: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    online: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Compound index for faster queries
dailyRevenueSchema.index({ restaurant: 1, date: 1 }, { unique: true });

const DailyRevenue = mongoose.model('DailyRevenue', dailyRevenueSchema);

module.exports = {
  DailyRevenue
};