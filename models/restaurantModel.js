// models/restaurantModel.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  
  // Manager relationship
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerEmail: { type: String, required: true, trim: true, lowercase: true },
  
  // Basic location (admin provided)
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  
  // Detailed location (manager provided)
  detailedLocation: {
    fullAddress: String,
    street: String,
    landmark: String,
    formattedAddress: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    placeId: String // Google Maps Place ID for future reference
  },
  
  // Business details
  description: String,
  cuisineType: String,
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  website: String,
  
  // Status tracking
  status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionPercentage: { type: Number, default: 0 },
  isBasicSetupComplete: { type: Boolean, default: false }
}, { timestamps: true });

// Create geospatial index for location-based queries
restaurantSchema.index({ 'detailedLocation.location': '2dsphere' });

// Pre-save hook to calculate completion percentage
restaurantSchema.pre('save', function(next) {
  const requiredFields = ['name', 'email', 'phone', 'address', 'city',
    'description', 'cuisineType', 'detailedLocation.location.coordinates'];
  
  const filledFields = requiredFields.filter(field => {
    if (field.includes('.')) {
      const parts = field.split('.');
      let obj = this;
      for (const part of parts) {
        if (!obj || !obj[part]) return false;
        obj = obj[part];
      }
      return obj[0] !== 0 || obj[1] !== 0; // For coordinates
    }
    return Boolean(this[field]);
  }).length;
  
  this.completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
  
  const basicFields = ['name', 'email', 'phone', 'address', 'city'];
  this.isBasicSetupComplete = basicFields.every(field => Boolean(this[field]));
  
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;