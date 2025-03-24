// sample-data/categories.js
const mongoose = require('mongoose');
const { menuIds } = require('./menus');
const { managerIds } = require('./restaurants');

// Generate ObjectIds for categories
const categoryIds = [];
for (let i = 0; i < 36; i++) {
  categoryIds.push(new mongoose.Types.ObjectId());
}

// Sample category data with mapping to menus
const categories = [
  // Spice Junction - Main Menu Categories
  {
    _id: categoryIds[0],
    name: 'Starters',
    description: 'Appetizers to begin your meal',
    order: 1,
    menus: [menuIds[0]],
    createdBy: managerIds[0]
  },
  {
    _id: categoryIds[1],
    name: 'Main Courses',
    description: 'Hearty main dishes',
    order: 2,
    menus: [menuIds[0]],
    createdBy: managerIds[0]
  },
  {
    _id: categoryIds[2],
    name: 'Breads',
    description: 'Freshly baked Indian breads',
    order: 3,
    menus: [menuIds[0]],
    createdBy: managerIds[0]
  },
  {
    _id: categoryIds[3],
    name: 'Rice & Biryani',
    description: 'Fragrant rice dishes',
    order: 4,
    menus: [menuIds[0]],
    createdBy: managerIds[0]
  },
  {
    _id: categoryIds[4],
    name: 'Desserts',
    description: 'Sweet treats to end your meal',
    order: 5,
    menus: [menuIds[0]],
    createdBy: managerIds[0]
  },

  // Spice Junction - Special Menu Categories
  {
    _id: categoryIds[5],
    name: 'Chef Specials',
    description: 'Signature dishes from our chef',
    order: 1,
    menus: [menuIds[1]],
    createdBy: managerIds[0]
  },
  {
    _id: categoryIds[6],
    name: 'Seasonal Specials',
    description: 'Dishes featuring seasonal ingredients',
    order: 2,
    menus: [menuIds[1]],
    createdBy: managerIds[0]
  },

  // Tandoori Nights - Main Menu Categories
  {
    _id: categoryIds[7],
    name: 'Tandoori Starters',
    description: 'Marinated and grilled appetizers from our tandoor',
    order: 1,
    menus: [menuIds[2]],
    createdBy: managerIds[1]
  },
  {
    _id: categoryIds[8],
    name: 'Vegetarian Curries',
    description: 'Flavorful vegetarian curries',
    order: 2,
    menus: [menuIds[2]],
    createdBy: managerIds[1]
  },
  {
    _id: categoryIds[9],
    name: 'Non-Vegetarian Curries',
    description: 'Rich and savory meat curries',
    order: 3,
    menus: [menuIds[2]],
    createdBy: managerIds[1]
  },
  {
    _id: categoryIds[10],
    name: 'Breads & Rice',
    description: 'Naan, roti, and rice varieties',
    order: 4,
    menus: [menuIds[2]],
    createdBy: managerIds[1]
  },

  // Tandoori Nights - Weekend Menu Categories
  {
    _id: categoryIds[11],
    name: 'Weekend Specials',
    description: 'Available only on weekends',
    order: 1,
    menus: [menuIds[3]],
    createdBy: managerIds[1]
  },
  {
    _id: categoryIds[12],
    name: 'Feast Platters',
    description: 'Sharing platters for groups',
    order: 2,
    menus: [menuIds[3]],
    createdBy: managerIds[1]
  },

  // Dosa Paradise - Regular Menu Categories
  {
    _id: categoryIds[13],
    name: 'Dosas',
    description: 'Varieties of crispy dosas',
    order: 1,
    menus: [menuIds[4]],
    createdBy: managerIds[2]
  },
  {
    _id: categoryIds[14],
    name: 'Idli & Vada',
    description: 'Steamed rice cakes and savory donuts',
    order: 2,
    menus: [menuIds[4]],
    createdBy: managerIds[2]
  },
  {
    _id: categoryIds[15],
    name: 'Rice Dishes',
    description: 'South Indian rice specialties',
    order: 3,
    menus: [menuIds[4]],
    createdBy: managerIds[2]
  },
  {
    _id: categoryIds[16],
    name: 'Curries',
    description: 'South Indian curries and gravies',
    order: 4,
    menus: [menuIds[4]],
    createdBy: managerIds[2]
  },

  // Dosa Paradise - Breakfast Menu Categories
  {
    _id: categoryIds[17],
    name: 'Morning Specials',
    description: 'Perfect start to your day',
    order: 1,
    menus: [menuIds[5]],
    createdBy: managerIds[2]
  },
  {
    _id: categoryIds[18],
    name: 'Breakfast Combos',
    description: 'Value meal combinations',
    order: 2,
    menus: [menuIds[5]],
    createdBy: managerIds[2]
  },
  {
    _id: categoryIds[19],
    name: 'Hot Beverages',
    description: 'Coffee, tea and more',
    order: 3,
    menus: [menuIds[5]],
    createdBy: managerIds[2]
  },

  // Bengali Bites - Main Menu Categories
  {
    _id: categoryIds[20],
    name: 'Starters',
    description: 'Bengali appetizers',
    order: 1,
    menus: [menuIds[6]],
    createdBy: managerIds[3]
  },
  {
    _id: categoryIds[21],
    name: 'Fish Specialties',
    description: 'Famous Bengali fish preparations',
    order: 2,
    menus: [menuIds[6]],
    createdBy: managerIds[3]
  },
  {
    _id: categoryIds[22],
    name: 'Vegetarian Dishes',
    description: 'Vegetarian Bengali specialties',
    order: 3,
    menus: [menuIds[6]],
    createdBy: managerIds[3]
  },
  {
    _id: categoryIds[23],
    name: 'Rice & Breads',
    description: 'Rice dishes and Bengali breads',
    order: 4,
    menus: [menuIds[6]],
    createdBy: managerIds[3]
  },
  {
    _id: categoryIds[24],
    name: 'Sweets',
    description: 'Traditional Bengali desserts',
    order: 5,
    menus: [menuIds[6]],
    createdBy: managerIds[3]
  },

  // Chaat Corner - Main Menu Categories
  {
    _id: categoryIds[25],
    name: 'Chaats',
    description: 'Tangy and spicy street food classics',
    order: 1,
    menus: [menuIds[7]],
    createdBy: managerIds[4]
  },
  {
    _id: categoryIds[26],
    name: 'Pani Puri & Golgappa',
    description: 'Crispy hollow puris with flavored water',
    order: 2,
    menus: [menuIds[7]],
    createdBy: managerIds[4]
  },
  {
    _id: categoryIds[27],
    name: 'Tikki & Pakoras',
    description: 'Fried savory snacks',
    order: 3,
    menus: [menuIds[7]],
    createdBy: managerIds[4]
  },
  {
    _id: categoryIds[28],
    name: 'Sandwiches & Rolls',
    description: 'Street-style sandwiches and wraps',
    order: 4,
    menus: [menuIds[7]],
    createdBy: managerIds[4]
  },
  {
    _id: categoryIds[29],
    name: 'Beverages',
    description: 'Refreshing drinks',
    order: 5,
    menus: [menuIds[7]],
    createdBy: managerIds[4]
  },

  // Royal Rajputana - Main Menu Categories
  {
    _id: categoryIds[30],
    name: 'Starters',
    description: 'Rajasthani appetizers',
    order: 1,
    menus: [menuIds[8]],
    createdBy: managerIds[5]
  },
  {
    _id: categoryIds[31],
    name: 'Main Courses',
    description: 'Traditional Rajasthani main dishes',
    order: 2,
    menus: [menuIds[8]],
    createdBy: managerIds[5]
  },
  {
    _id: categoryIds[32],
    name: 'Breads & Rice',
    description: 'Accompaniments for your meal',
    order: 3,
    menus: [menuIds[8]],
    createdBy: managerIds[5]
  },
  {
    _id: categoryIds[33],
    name: 'Desserts',
    description: 'Sweet delicacies from Rajasthan',
    order: 4,
    menus: [menuIds[8]],
    createdBy: managerIds[5]
  },

  // Royal Rajputana - Royal Feast Menu Categories
  {
    _id: categoryIds[34],
    name: 'Royal Appetizers',
    description: 'Start your royal feast experience',
    order: 1,
    menus: [menuIds[9]],
    createdBy: managerIds[5]
  },
  {
    _id: categoryIds[35],
    name: 'Royal Main Course',
    description: 'Dishes from royal kitchens of Rajasthan',
    order: 2,
    menus: [menuIds[9]],
    createdBy: managerIds[5]
  }
];

module.exports = {
  categories,
  categoryIds
};