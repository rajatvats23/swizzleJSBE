// models/addonModel.js
const mongoose = require('mongoose');

// Schema for sub-addons (options within an addon)
const subAddonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

// Main addon schema
const addonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isMultiSelect: {
    type: Boolean,
    default: false
  },
  subAddons: [subAddonSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
}, { timestamps: true });

const Addon = mongoose.model('Addon', addonSchema);
module.exports = Addon;