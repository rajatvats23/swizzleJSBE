// sample-data/addons.js
const mongoose = require('mongoose');
const { restaurantIds, managerIds } = require('./restaurants');

// Generate ObjectIds for addons
const addonIds = [];
for (let i = 0; i < 18; i++) {
  addonIds.push(new mongoose.Types.ObjectId());
}

// Sample addon data
const addons = [
  // Spice Junction addons
  {
    _id: addonIds[0],
    name: 'Spice Level',
    isMultiSelect: false,
    subAddons: [
      { name: 'Mild', price: 0 },
      { name: 'Medium', price: 0 },
      { name: 'Hot', price: 0 },
      { name: 'Extra Hot', price: 0 }
    ],
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },
  {
    _id: addonIds[1],
    name: 'Extra Toppings',
    isMultiSelect: true,
    subAddons: [
      { name: 'Cheese', price: 30 },
      { name: 'Paneer', price: 40 },
      { name: 'Vegetables', price: 25 },
      { name: 'Cashews', price: 35 }
    ],
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },
  {
    _id: addonIds[2],
    name: 'Bread Size',
    isMultiSelect: false,
    subAddons: [
      { name: 'Regular', price: 0 },
      { name: 'Large', price: 25 }
    ],
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },

  // Tandoori Nights addons
  {
    _id: addonIds[3],
    name: 'Meat Options',
    isMultiSelect: false,
    subAddons: [
      { name: 'Chicken', price: 0 },
      { name: 'Lamb', price: 60 },
      { name: 'Fish', price: 50 }
    ],
    createdBy: managerIds[1],
    restaurant: restaurantIds[1]
  },
  {
    _id: addonIds[4],
    name: 'Extra Sides',
    isMultiSelect: true,
    subAddons: [
      { name: 'Mint Chutney', price: 20 },
      { name: 'Yogurt Raita', price: 30 },
      { name: 'Onion Salad', price: 25 },
      { name: 'Pickle', price: 15 }
    ],
    createdBy: managerIds[1],
    restaurant: restaurantIds[1]
  },
  {
    _id: addonIds[5],
    name: 'Bread Type',
    isMultiSelect: false,
    subAddons: [
      { name: 'Naan', price: 0 },
      { name: 'Roti', price: 0 },
      { name: 'Paratha', price: 20 },
      { name: 'Kulcha', price: 25 }
    ],
    createdBy: managerIds[1],
    restaurant: restaurantIds[1]
  },

  // Dosa Paradise addons
  {
    _id: addonIds[6],
    name: 'Dosa Fillings',
    isMultiSelect: false,
    subAddons: [
      { name: 'Masala', price: 0 },
      { name: 'Paneer', price: 40 },
      { name: 'Cheese', price: 35 },
      { name: 'Onion', price: 20 }
    ],
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },
  {
    _id: addonIds[7],
    name: 'Extra Chutneys',
    isMultiSelect: true,
    subAddons: [
      { name: 'Coconut Chutney', price: 20 },
      { name: 'Tomato Chutney', price: 20 },
      { name: 'Mint Chutney', price: 20 },
      { name: 'Peanut Chutney', price: 25 }
    ],
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },
  {
    _id: addonIds[8],
    name: 'Dosa Type',
    isMultiSelect: false,
    subAddons: [
      { name: 'Regular', price: 0 },
      { name: 'Paper', price: 20 },
      { name: 'Rava', price: 30 }
    ],
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },

  // Bengali Bites addons
  {
    _id: addonIds[9],
    name: 'Fish Options',
    isMultiSelect: false,
    subAddons: [
      { name: 'Rohu', price: 0 },
      { name: 'Hilsa', price: 100 },
      { name: 'Prawns', price: 80 },
      { name: 'Bhetki', price: 70 }
    ],
    createdBy: managerIds[3],
    restaurant: restaurantIds[3]
  },
  {
    _id: addonIds[10],
    name: 'Rice Options',
    isMultiSelect: false,
    subAddons: [
      { name: 'Plain Rice', price: 0 },
      { name: 'Jeera Rice', price: 20 },
      { name: 'Ghee Rice', price: 30 }
    ],
    createdBy: managerIds[3],
    restaurant: restaurantIds[3]
  },
  {
    _id: addonIds[11],
    name: 'Extra Side Dishes',
    isMultiSelect: true,
    subAddons: [
      { name: 'Aloo Bhaja', price: 30 },
      { name: 'Begun Bhaja', price: 35 },
      { name: 'Papad', price: 15 }
    ],
    createdBy: managerIds[3],
    restaurant: restaurantIds[3]
  },

  // Chaat Corner addons
  {
    _id: addonIds[12],
    name: 'Chaat Toppings',
    isMultiSelect: true,
    subAddons: [
      { name: 'Extra Yogurt', price: 15 },
      { name: 'Extra Tamarind Chutney', price: 10 },
      { name: 'Extra Mint Chutney', price: 10 },
      { name: 'Extra Sev', price: 10 }
    ],
    createdBy: managerIds[4],
    restaurant: restaurantIds[4]
  },
  {
    _id: addonIds[13],
    name: 'Pani Puri Water',
    isMultiSelect: false,
    subAddons: [
      { name: 'Regular', price: 0 },
      { name: 'Sweet', price: 0 },
      { name: 'Extra Spicy', price: 0 },
      { name: 'Mixed', price: 0 }
    ],
    createdBy: managerIds[4],
    restaurant: restaurantIds[4]
  },
  {
    _id: addonIds[14],
    name: 'Portion Size',
    isMultiSelect: false,
    subAddons: [
      { name: 'Regular', price: 0 },
      { name: 'Large', price: 40 }
    ],
    createdBy: managerIds[4],
    restaurant: restaurantIds[4]
  },

  // Royal Rajputana addons
  {
    _id: addonIds[15],
    name: 'Curry Base',
    isMultiSelect: false,
    subAddons: [
      { name: 'Regular', price: 0 },
      { name: 'Less Spicy', price: 0 },
      { name: 'Less Oil', price: 0 }
    ],
    createdBy: managerIds[5],
    restaurant: restaurantIds[5]
  },
  {
    _id: addonIds[16],
    name: 'Extra Accompaniments',
    isMultiSelect: true,
    subAddons: [
      { name: 'Garlic Chutney', price: 25 },
      { name: 'Kachumber Salad', price: 30 },
      { name: 'Papad', price: 20 },
      { name: 'Pyaaz', price: 15 }
    ],
    createdBy: managerIds[5],
    restaurant: restaurantIds[5]
  },
  {
    _id: addonIds[17],
    name: 'Bread Options',
    isMultiSelect: false,
    subAddons: [
      { name: 'Bajra Roti', price: 0 },
      { name: 'Missi Roti', price: 20 },
      { name: 'Roomali Roti', price: 25 }
    ],
    createdBy: managerIds[5],
    restaurant: restaurantIds[5]
  }
];

module.exports = {
  addons,
  addonIds
};