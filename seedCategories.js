const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define User schema (for references)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  role: { type: String, enum: ['superadmin', 'admin', 'manager', 'staff'], default: 'admin' }
}, { timestamps: true });

// Define Restaurant schema (for references)
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  managerEmail: { type: String, required: true, trim: true, lowercase: true }
}, { timestamps: true });

// Define Menu schema
const menuSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Define Category schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, default: 0 },
  menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Define models (use different approach to avoid schema registration issues)
const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Menu = mongoose.model('Menu', menuSchema);
const Category = mongoose.model('Category', categorySchema);

// Function to seed categories
const seedCategories = async () => {
  try {
    console.log('Starting to seed categories...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB with URI: ${mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');
    
    // Check if categories already exist
    const existingCategoriesCount = await Category.countDocuments();
    console.log(`Found ${existingCategoriesCount} existing categories`);
    
    if (existingCategoriesCount > 0) {
      console.log('Categories already exist in the database. Clearing existing categories...');
      await Category.deleteMany({});
      console.log('Existing categories cleared successfully');
    }
    
    // Get all menus (but don't use populate to avoid schema issues)
    const menus = await Menu.find().lean();
    console.log(`Found ${menus.length} menus`);
    
    if (menus.length === 0) {
      console.error('No menus found. Please run seedMenus.js first.');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    // Get restaurant details separately
    const restaurants = await Restaurant.find({}, 'name').lean();
    const restaurantMap = {};
    restaurants.forEach(restaurant => {
      restaurantMap[restaurant._id.toString()] = restaurant;
    });
    
    // Get only managers (for createdBy reference)
    const managers = await User.find({ role: 'manager' }).lean();
    const managerMap = {};
    managers.forEach(manager => {
      managerMap[manager._id.toString()] = manager;
    });
    
    // Group menus by restaurant
    const menusByRestaurant = {};
    menus.forEach(menu => {
      const restaurantId = menu.restaurantId.toString();
      const restaurant = restaurantMap[restaurantId];
      
      if (!menusByRestaurant[restaurantId]) {
        menusByRestaurant[restaurantId] = {
          restaurantName: restaurant ? restaurant.name : 'Unknown Restaurant',
          menus: []
        };
      }
      
      menusByRestaurant[restaurantId].menus.push({
        id: menu._id,
        name: menu.name,
        createdBy: menu.createdBy
      });
    });
    
    console.log(`Grouped menus by ${Object.keys(menusByRestaurant).length} restaurants`);
    
    // Category data to insert
    const categoriesToInsert = [];
    
    // Define standard category names and descriptions
    const standardCategories = [
      { name: 'Starters', description: 'Appetizers to begin your meal', order: 1 },
      { name: 'Main Courses', description: 'Hearty main dishes', order: 2 },
      { name: 'Breads', description: 'Freshly baked breads', order: 3 },
      { name: 'Rice & Biryani', description: 'Fragrant rice dishes', order: 4 },
      { name: 'Desserts', description: 'Sweet treats to end your meal', order: 5 }
    ];
    
    // Special categories for special menus
    const specialCategories = [
      { name: 'Chef Specials', description: 'Signature dishes from our chef', order: 1 },
      { name: 'Seasonal Specials', description: 'Dishes featuring seasonal ingredients', order: 2 },
      { name: 'Weekend Specials', description: 'Available only on weekends', order: 3 }
    ];
    
    // For each restaurant, create categories for each menu
    Object.values(menusByRestaurant).forEach(restaurant => {
      restaurant.menus.forEach(menu => {
        // Select categories based on menu name
        const categories = menu.name.toLowerCase().includes('special') 
          ? specialCategories 
          : standardCategories;
        
        // Create categories for this menu
        categories.forEach(category => {
          categoriesToInsert.push({
            name: category.name,
            description: category.description,
            order: category.order,
            menus: [menu.id],
            createdBy: menu.createdBy // Use menu's createdBy
          });
        });
      });
    });
    
    console.log(`Prepared ${categoriesToInsert.length} categories to create`);
    
    // Create all categories
    const createdCategories = await Category.insertMany(categoriesToInsert);
    console.log(`Successfully created ${createdCategories.length} categories`);
    
    // Log a few created categories for verification
    const sampleSize = Math.min(5, createdCategories.length);
    console.log(`\nSample of created categories (${sampleSize} of ${createdCategories.length}):`);
    
    for (let i = 0; i < sampleSize; i++) {
      const category = createdCategories[i];
      const menuId = category.menus[0].toString();
      
      // Find the menu this category belongs to
      const relatedMenu = menus.find(m => m._id.toString() === menuId);
      const restaurantId = relatedMenu ? relatedMenu.restaurantId.toString() : null;
      const restaurant = restaurantId ? restaurantMap[restaurantId] : null;
      
      console.log(`${i+1}. Category: ${category.name} (Order: ${category.order})`);
      console.log(`   - Menu ID: ${menuId}`);
      console.log(`   - Menu Name: ${relatedMenu ? relatedMenu.name : 'Unknown'}`);
      console.log(`   - Restaurant: ${restaurant ? restaurant.name : 'Unknown'}`);
    }
    
    console.log('\nCategory seeding completed successfully!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    
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
seedCategories();