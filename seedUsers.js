const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define User schema directly in this script to avoid path issues
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
    enum: ['superadmin', 'admin', 'manager', 'staff'],
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
  },
  // MFA fields
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    default: null
  },
  tempMfaSecret: {
    type: String,
    default: null
  },
  // Restaurant association
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  }
}, { timestamps: true });

// Hash password middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Define the User model
const User = mongoose.model('User', userSchema);

// Function to seed users
const seedUsers = async () => {
  try {
    console.log('Starting to seed users...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB with URI: ${mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');
    
    // Check if users already exist
    const existingUsersCount = await User.countDocuments();
    console.log(`Found ${existingUsersCount} existing users`);
    
    if (existingUsersCount > 0) {
      console.log('Users already exist in the database. Clearing existing users...');
      // Clear all users except superadmin
      await User.deleteMany({ role: { $ne: 'superadmin' } });
      console.log('Existing non-superadmin users cleared successfully');
    }
    
    // Check for superadmin
    const superadminExists = await User.findOne({ role: 'superadmin' });
    
    if (!superadminExists) {
      console.log('Creating superadmin user...');
      // Create superadmin
      const superAdmin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@yopmail.com',
        password: 'Qwerty@123',
        countryCode: '+91',
        phoneNumber: '1234567890',
        role: 'superadmin',
        isVerified: true
      });
      
      console.log('Superadmin created successfully:');
      console.log({
        id: superAdmin._id,
        email: superAdmin.email,
        role: superAdmin.role
      });
    } else {
      console.log('Superadmin already exists:', {
        id: superadminExists._id,
        email: superadminExists.email
      });
    }
    
    // Create a test admin user
    console.log('Creating a test admin user...');
    const testAdmin = await User.create({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'testadmin@yopmail.com',
      password: 'Password@123',
      countryCode: '+91',
      phoneNumber: '9876543210',
      role: 'admin',
      isVerified: true,
      createdBy: superadminExists ? superadminExists._id : null
    });
    
    console.log('Test admin created successfully:');
    console.log({
      id: testAdmin._id,
      email: testAdmin.email,
      role: testAdmin.role
    });
    
    // Create a test manager
    console.log('Creating a test manager...');
    const testManager = await User.create({
      firstName: 'Test',
      lastName: 'Manager',
      email: 'testmanager@yopmail.com',
      password: 'Password@123',
      countryCode: '+91',
      phoneNumber: '8765432109',
      role: 'manager',
      isVerified: true,
      createdBy: superadminExists ? superadminExists._id : null
    });
    
    console.log('Test manager created successfully:');
    console.log({
      id: testManager._id,
      email: testManager.email,
      role: testManager.role
    });
    
    console.log('User seeding completed successfully!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding users:', error);
    // Print detailed error information
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Error Code:', error.code);
      console.error('MongoDB Error Message:', error.message);
    }
    
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed after error');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    process.exit(1);
  }
};

// Run the seed function
seedUsers();