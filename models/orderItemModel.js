// models/orderItemModel.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
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
  price: {
    type: Number,
    required: true
    // Store price at time of order
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
  },
  status: {
    type: String,
    enum: ['ordered', 'preparing', 'ready', 'delivered'],
    default: 'ordered'
  }
}, { timestamps: true });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;