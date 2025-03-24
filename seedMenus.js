const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define User schema (needed for reference)
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
  isVerified: {
    type: Boolean,
    default: false
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  }
}, { timestamps: true });

// Define Restaurant schema
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerEmail: { type: String, required: true, trim: true, lowercase: true },
  // Other fields omitted for brevity
}, { timestamps: true });

// Define Menu schema
const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Define models
const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Menu = mongoose.model('Menu', menuSchema);

// Function to seed menus
const seedMenus = async () => {
  try {
    console.log('Starting to seed menus...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB with URI: ${mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');
    
    // Check if menus already exist
    const existingMenusCount = await Menu.countDocuments();
    console.log(`Found ${existingMenusCount} existing menus`);
    
    if (existingMenusCount > 0) {
      console.log('Menus already exist in the database. Clearing existing menus...');
      await Menu.deleteMany({});
      console.log('Existing menus cleared successfully');
    }
    
    // Get all restaurants
    const restaurants = await Restaurant.find().populate('manager');
    console.log(`Found ${restaurants.length} restaurants`);
    
    if (restaurants.length === 0) {
      console.error('No restaurants found. Please run seedRestaurants.js first.');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    // Log restaurant details for debugging
    restaurants.forEach((restaurant, index) => {
      console.log(`Restaurant ${index + 1}: ${restaurant.name}`);
      console.log(`- ID: ${restaurant._id}`);
      console.log(`- Manager ID: ${restaurant.manager ? restaurant.manager._id : 'Not assigned'}`);
      console.log(`- Manager Email: ${restaurant.managerEmail}`);
    });
    
    // Define menu data based on restaurant names
    const menuData = [];
    
    // Add menus for each restaurant
    restaurants.forEach(restaurant => {
      // Get the manager ID from the restaurant
      const managerId = restaurant.manager ? restaurant.manager._id : null;
      
      if (!managerId) {
        console.warn(`Warning: No manager found for restaurant ${restaurant.name}. Using restaurant's createdBy instead.`);
      }
      
      // For each restaurant, add a main menu
      menuData.push({
        name: 'Main Menu',
        description: `${restaurant.name}'s signature dishes available throughout the week`,
        restaurantId: restaurant._id,
        createdBy: managerId || restaurant.createdBy
      });
      
      // For each restaurant, add a special menu
      menuData.push({
        name: 'Special Menu',
        description: `${restaurant.name}'s weekend specials available Friday through Sunday`,
        restaurantId: restaurant._id,
        createdBy: managerId || restaurant.createdBy
      });
    });
    
    console.log(`Prepared ${menuData.length} menus to create`);
    
    // Create all menus
    const createdMenus = await Menu.insertMany(menuData);
    console.log(`Successfully created ${createdMenus.length} menus`);
    
    // Verify created menus
    for (const menu of createdMenus) {
      console.log(`Created menu: ${menu.name} for restaurant ID: ${menu.restaurantId}`);
      
      // Find the restaurant for this menu
      const restaurant = restaurants.find(r => r._id.toString() === menu.restaurantId.toString());
      if (restaurant) {
        console.log(`  - Restaurant: ${restaurant.name}`);
      }
    }
    
    console.log('Menu seeding completed successfully!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding menus:', error);
    
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
seedMenus();