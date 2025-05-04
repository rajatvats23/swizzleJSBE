// models/customerModel.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const customerSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  visitHistory: [{
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table'
    },
    visitDate: {
      type: Date,
      default: Date.now
    },
    checkedOut: {
      type: Boolean,
      default: false
    }
  }],
  currentSession: {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table'
    },
    startTime: Date,
    active: {
      type: Boolean,
      default: false
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }
}, { timestamps: true });

// Generate auth token for customer
customerSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // 24 hour expiry as fallback
  );
};

// Method to check if OTP is valid
customerSchema.methods.isOtpValid = function(otpToVerify) {
  return this.otp && 
         this.otp.code === otpToVerify && 
         this.otp.expiresAt > Date.now();
};

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;