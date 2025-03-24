// sample-data/menus.js
const mongoose = require('mongoose');
const { restaurantIds, managerIds } = require('./restaurants');

// Generate ObjectIds for menus
const menuIds = [
  new mongoose.Types.ObjectId(), // Spice Junction - Main Menu
  new mongoose.Types.ObjectId(), // Spice Junction - Special Menu
  new mongoose.Types.ObjectId(), // Tandoori Nights - Main Menu
  new mongoose.Types.ObjectId(), // Tandoori Nights - Weekend Menu
  new mongoose.Types.ObjectId(), // Dosa Paradise - Regular Menu
  new mongoose.Types.ObjectId(), // Dosa Paradise - Breakfast Menu
  new mongoose.Types.ObjectId(), // Bengali Bites - Main Menu
  new mongoose.Types.ObjectId(), // Chaat Corner - Main Menu
  new mongoose.Types.ObjectId(), // Royal Rajputana - Main Menu
  new mongoose.Types.ObjectId()  // Royal Rajputana - Royal Feast Menu
];

// Sample menu data
const menus = [
  {
    _id: menuIds[0],
    name: 'Main Menu',
    description: 'Our signature dishes available throughout the week',
    restaurantId: restaurantIds[0], // Spice Junction
    createdBy: managerIds[0]
  },
  {
    _id: menuIds[1],
    name: 'Special Menu',
    description: 'Weekend special dishes available Friday through Sunday',
    restaurantId: restaurantIds[0], // Spice Junction
    createdBy: managerIds[0]
  },
  {
    _id: menuIds[2],
    name: 'Main Menu',
    description: 'Our everyday tandoori specialties',
    restaurantId: restaurantIds[1], // Tandoori Nights
    createdBy: managerIds[1]
  },
  {
    _id: menuIds[3],
    name: 'Weekend Menu',
    description: 'Special dishes available only on weekends',
    restaurantId: restaurantIds[1], // Tandoori Nights
    createdBy: managerIds[1]
  },
  {
    _id: menuIds[4],
    name: 'Regular Menu',
    description: 'Our all-day South Indian specialties',
    restaurantId: restaurantIds[2], // Dosa Paradise
    createdBy: managerIds[2]
  },
  {
    _id: menuIds[5],
    name: 'Breakfast Menu',
    description: 'Morning specialties served until 11am',
    restaurantId: restaurantIds[2], // Dosa Paradise
    createdBy: managerIds[2]
  },
  {
    _id: menuIds[6],
    name: 'Bengali Specials',
    description: 'Authentic Bengali cuisine including our famous fish dishes',
    restaurantId: restaurantIds[3], // Bengali Bites
    createdBy: managerIds[3]
  },
  {
    _id: menuIds[7],
    name: 'Street Food Favorites',
    description: 'Popular chaats and street food from across India',
    restaurantId: restaurantIds[4], // Chaat Corner
    createdBy: managerIds[4]
  },
  {
    _id: menuIds[8],
    name: 'Rajasthani Classics',
    description: 'Traditional Rajasthani dishes available daily',
    restaurantId: restaurantIds[5], // Royal Rajputana
    createdBy: managerIds[5]
  },
  {
    _id: menuIds[9],
    name: 'Royal Feast Menu',
    description: 'Special royal dishes from the kitchens of Rajasthan',
    restaurantId: restaurantIds[5], // Royal Rajputana
    createdBy: managerIds[5]
  }
];

module.exports = {
  menus,
  menuIds
};