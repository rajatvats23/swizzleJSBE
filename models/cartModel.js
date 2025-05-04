// models/cartModel.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedAddons: [{
    addon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Addon'
    },
    subAddon: {
      name: String,
      price: Number
    }
  }],
  specialInstructions: {
    type: String
  }
});

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  },
  items: [cartItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated whenever cart is modified
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;