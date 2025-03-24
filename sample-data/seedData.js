// seedData.js - With explicit MongoDB connection
const mongoose = require('mongoose');
const path = require('path');

// Data imports - using current directory
const { restaurants, restaurantIds, managerIds } = require('./restaurants');
const { createUsers } = require('./users');
const { menus } = require('./menus');
const { categories } = require('./categories');
const { tags } = require('./tags');
const { addons } = require('./addons');
const { products } = require('./products');

// Model imports - using relative paths to parent directory
const Restaurant = require('../models/restaurantModel');
const User = require('../models/userModel');
const Menu = require('../models/menuModel');
const Category = require('../models/categoryModel');
const Tag = require('../models/tagModel');
const Addon = require('../models/addonModel');
const Product = require('../models/productModel');

// MongoDB Connection String - REPLACE WITH YOUR ACTUAL CONNECTION STRING
const MONGO_URI = 'mongodb+srv://vatsrajat23:OHN0kFAhZibGaNXu@cluster0.6rasi.mongodb.net/swizzleDB?retryWrites=true&w=majority&appName=Cluster0';
// If you want to use environment variables instead, use:
// const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB with explicit URI
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Function to clear all existing data
const clearExistingData = async () => {
  try {
    await Restaurant.deleteMany({});
    await User.deleteMany({ role: { $ne: 'superadmin' } }); // Don't delete superadmin
    await Menu.deleteMany({});
    await Category.deleteMany({});
    await Tag.deleteMany({});
    await Addon.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Existing data cleared successfully.');
  } catch (error) {
    console.error('Error clearing existing data:', error.message);
    throw error;
  }
};

// Function to seed all data
const seedData = async () => {
  try {
    console.log('Starting data seeding process...');
    
    // Clear existing data
    await clearExistingData();
    
    // Seed restaurants
    console.log('Seeding restaurants...');
    await Restaurant.insertMany(restaurants);
    
    // Seed users
    console.log('Seeding users...');
    const { managerUsers, staffUsers } = await createUsers();
    await User.insertMany([...managerUsers, ...staffUsers]);
    
    // Seed menus
    console.log('Seeding menus...');
    await Menu.insertMany(menus);
    
    // Seed categories
    console.log('Seeding categories...');
    await Category.insertMany(categories);
    
    // Seed tags
    console.log('Seeding tags...');
    await Tag.insertMany(tags);
    
    // Seed addons
    console.log('Seeding addons...');
    await Addon.insertMany(addons);
    
    // Seed products
    console.log('Seeding products...');
    await Product.insertMany(products);
    
    console.log('Data seeding completed successfully!');
    console.log(`Added ${restaurants.length} restaurants`);
    console.log(`Added ${managerUsers.length} managers`);
    console.log(`Added ${staffUsers.length} staff members`);
    console.log(`Added ${menus.length} menus`);
    console.log(`Added ${categories.length} categories`);
    console.log(`Added ${tags.length} tags`);
    console.log(`Added ${addons.length} addons`);
    console.log(`Added ${products.length} products`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Print current working directory for debugging
console.log('Current directory:', __dirname);
console.log('Parent directory:', path.resolve(__dirname, '..'));

// Run the seed function
seedData();