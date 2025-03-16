const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Define the user schema directly in this script to avoid path issues
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inviteToken: String,
  inviteTokenExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash the password before saving
const bcrypt = require('bcryptjs');
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Function to create superadmin
const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if superadmin already exists
    const superAdminExists = await User.findOne({ role: 'superadmin' });
    
    if (superAdminExists) {
      console.log('Super admin already exists');
      await mongoose.connection.close();
      return;
    }

    // Create superadmin
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'vats.rajat23@gmail.com',
      password: 'Qwerty@123',
      countryCode: '+91',
      phoneNumber: '1234567890',
      role: 'superadmin',
      isVerified: true
    });

    console.log('Super admin created successfully:');
    console.log({
      id: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role
    });

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating super admin:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the function
createSuperAdmin();