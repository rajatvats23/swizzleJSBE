// models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'inr'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'successful', 'failed'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cash', 'wallet'],
    required: true
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: Object
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;