// models/orderModel.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    // Not required because some orders might be takeaway
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  status: {
    type: String,
    enum: ['placed', 'preparing', 'ready', 'delivered', 'completed'],
    default: 'placed'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  specialInstructions: {
    type: String
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', ''],
    default: ''
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;