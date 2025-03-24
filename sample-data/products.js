// sample-data/products.js
const mongoose = require('mongoose');
const { restaurantIds, managerIds } = require('./restaurants');
const { categoryIds } = require('./categories');
const { tagIds } = require('./tags');
const { addonIds } = require('./addons');

// Generate product IDs
const generateProductIds = (count) => {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(new mongoose.Types.ObjectId());
  }
  return ids;
};

// Generate a larger number of product IDs
const productIds = generateProductIds(50);

// Sample products data
const products = [
  // Spice Junction - Starters
  {
    _id: productIds[0],
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese cubes grilled to perfection',
    price: 250,
    imageUrl: 'https://example.com/images/paneer-tikka.jpg',
    category: categoryIds[0],
    tags: [tagIds[1], tagIds[5]], // Vegetarian, Chef Special
    addons: [
      { addon: addonIds[0], required: true }, // Spice Level
      { addon: addonIds[1], required: false } // Extra Toppings
    ],
    isAvailable: true,
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },
  {
    _id: productIds[1],
    name: 'Gobi Manchurian',
    description: 'Crispy cauliflower florets tossed in a spicy and tangy sauce',
    price: 220,
    imageUrl: 'https://example.com/images/gobi-manchurian.jpg',
    category: categoryIds[0],
    tags: [tagIds[1], tagIds[0]], // Vegetarian, Spicy
    addons: [
      { addon: addonIds[0], required: true } // Spice Level
    ],
    isAvailable: true,
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },

  // Spice Junction - Main Courses
  {
    _id: productIds[2],
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich and creamy tomato-based sauce',
    price: 350,
    imageUrl: 'https://example.com/images/butter-chicken.jpg',
    category: categoryIds[1],
    tags: [tagIds[0], tagIds[4]], // Spicy, Bestseller
    addons: [
      { addon: addonIds[0], required: true }, // Spice Level
      { addon: addonIds[1], required: false } // Extra Toppings
    ],
    isAvailable: true,
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },
  {
    _id: productIds[3],
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in a rich and creamy tomato-based gravy',
    price: 320,
    imageUrl: 'https://example.com/images/paneer-butter-masala.jpg',
    category: categoryIds[1],
    tags: [tagIds[1], tagIds[4]], // Vegetarian, Bestseller
    addons: [
      { addon: addonIds[0], required: true }, // Spice Level
      { addon: addonIds[1], required: false } // Extra Toppings
    ],
    isAvailable: true,
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },

  // Spice Junction - Breads
  {
    _id: productIds[4],
    name: 'Garlic Naan',
    description: 'Leavened bread topped with garlic and butter',
    price: 70,
    imageUrl: 'https://example.com/images/garlic-naan.jpg',
    category: categoryIds[2],
    tags: [tagIds[1]], // Vegetarian
    addons: [
      { addon: addonIds[2], required: false } // Bread Size
    ],
    isAvailable: true,
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },
  {
    _id: productIds[5],
    name: 'Butter Roti',
    description: 'Whole wheat flatbread brushed with butter',
    price: 50,
    imageUrl: 'https://example.com/images/butter-roti.jpg',
    category: categoryIds[2],
    tags: [tagIds[1]], // Vegetarian
    addons: [
      { addon: addonIds[2], required: false } // Bread Size
    ],
    isAvailable: true,
    createdBy: managerIds[0],
    restaurant: restaurantIds[0]
  },

  // Tandoori Nights - Tandoori Starters
  {
    _id: productIds[6],
    name: 'Chicken Tikka',
    description: 'Marinated chicken pieces grilled in tandoor',
    price: 280,
    imageUrl: 'https://example.com/images/chicken-tikka.jpg',
    category: categoryIds[7],
    tags: [tagIds[4], tagIds[11]], // Bestseller, Recommended
    addons: [
      { addon: addonIds[3], required: false }, // Meat Options
      { addon: addonIds[4], required: false } // Extra Sides
    ],
    isAvailable: true,
    createdBy: managerIds[1],
    restaurant: restaurantIds[1]
  },
  {
    _id: productIds[7],
    name: 'Seekh Kebab',
    description: 'Minced meat with herbs and spices grilled on skewers',
    price: 300,
    imageUrl: 'https://example.com/images/seekh-kebab.jpg',
    category: categoryIds[7],
    tags: [tagIds[0], tagIds[5]], // Spicy, Chef Special
    addons: [
      { addon: addonIds[3], required: false }, // Meat Options
      { addon: addonIds[4], required: false } // Extra Sides
    ],
    isAvailable: true,
    createdBy: managerIds[1],
    restaurant: restaurantIds[1]
  },

  // Dosa Paradise - Dosas
  {
    _id: productIds[8],
    name: 'Masala Dosa',
    description: 'Crispy rice and lentil crepe filled with spiced potato mixture',
    price: 180,
    imageUrl: 'https://example.com/images/masala-dosa.jpg',
    category: categoryIds[13],
    tags: [tagIds[1], tagIds[4]], // Vegetarian, Bestseller
    addons: [
      { addon: addonIds[6], required: false }, // Dosa Fillings
      { addon: addonIds[7], required: false }, // Extra Chutneys
      { addon: addonIds[8], required: false } // Dosa Type
    ],
    isAvailable: true,
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },
  {
    _id: productIds[9],
    name: 'Mysore Masala Dosa',
    description: 'Crispy dosa spread with spicy red chutney and filled with potato mixture',
    price: 200,
    imageUrl: 'https://example.com/images/mysore-dosa.jpg',
    category: categoryIds[13],
    tags: [tagIds[1], tagIds[0]], // Vegetarian, Spicy
    addons: [
      { addon: addonIds[6], required: false }, // Dosa Fillings
      { addon: addonIds[7], required: false }, // Extra Chutneys
      { addon: addonIds[8], required: false } // Dosa Type
    ],
    isAvailable: true,
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },

  // Dosa Paradise - Idli & Vada
  {
    _id: productIds[10],
    name: 'Idli Sambar',
    description: 'Steamed rice cakes served with sambar and chutney',
    price: 150,
    imageUrl: 'https://example.com/images/idli-sambar.jpg',
    category: categoryIds[14],
    tags: [tagIds[1], tagIds[6]], // Vegetarian, Low Calorie
    addons: [
      { addon: addonIds[7], required: false } // Extra Chutneys
    ],
    isAvailable: true,
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },
  {
    _id: productIds[11],
    name: 'Medu Vada',
    description: 'Crispy fried lentil donuts served with sambar and chutney',
    price: 160,
    imageUrl: 'https://example.com/images/medu-vada.jpg',
    category: categoryIds[14],
    tags: [tagIds[1]], // Vegetarian
    addons: [
      { addon: addonIds[7], required: false } // Extra Chutneys
    ],
    isAvailable: true,
    createdBy: managerIds[2],
    restaurant: restaurantIds[2]
  },

  // Bengali Bites - Fish Specialties
  {
    _id: productIds[12],
    name: 'Fish Curry (Bengali Style)',
    description: 'Traditional Bengali style fish curry with mustard sauce',
    price: 350,
    imageUrl: 'https://example.com/images/bengali-fish-curry.jpg',
    category: categoryIds[21],
    tags: [tagIds[5], tagIds[11]], // Chef Special, Recommended
    addons: [
      { addon: addonIds[9], required: true }, // Fish Options
      { addon: addonIds[11], required: false } // Extra Side Dishes
    ],
    isAvailable: true,
    createdBy: managerIds[3],
    restaurant: restaurantIds[3]
  },
  {
    _id: productIds[13],
    name: 'Macher Jhol',
    description: 'Light fish stew with vegetables',
    price: 320,
    imageUrl: 'https://example.com/images/macher-jhol.jpg',
    category: categoryIds[21],
    tags: [tagIds[4]], // Bestseller
    addons: [
      { addon: addonIds[9], required: true }, // Fish Options
      { addon: addonIds[11], required: false } // Extra Side Dishes
    ],
    isAvailable: true,
    createdBy: managerIds[3],
    restaurant: restaurantIds[3]
  },

  // Chaat Corner - Chaats
  {
    _id: productIds[14],
    name: 'Aloo Tikki Chaat',
    description: 'Potato patties topped with yogurt, chutneys, and spices',
    price: 120,
    imageUrl: 'https://example.com/images/aloo-tikki-chaat.jpg',
    category: categoryIds[25],
    tags: [tagIds[1], tagIds[4]], // Vegetarian, Bestseller
    addons: [
      { addon: addonIds[12], required: false }, // Chaat Toppings
      { addon: addonIds[14], required: false } // Portion Size
    ],
    isAvailable: true,
    createdBy: managerIds[4],
    restaurant: restaurantIds[4]
  },
  {
    _id: productIds[15],
    name: 'Bhel Puri',
    description: 'Puffed rice, vegetables, and tangy tamarind sauce',
    price: 100,
    imageUrl: 'https://example.com/images/bhel-puri.jpg',
    category: categoryIds[25],
    tags: [tagIds[1], tagIds[8]], // Vegetarian, Dairy-Free
    addons: [
      { addon: addonIds[12], required: false }, // Chaat Toppings
      { addon: addonIds[14], required: false } // Portion Size
    ],
    isAvailable: true,
    createdBy: managerIds[4],
    restaurant: restaurantIds[4]
  },

  // Royal Rajputana - Main Courses
  {
    _id: productIds[16],
    name: 'Laal Maas',
    description: 'Fiery red mutton curry - a royal Rajasthani delicacy',
    price: 380,
    imageUrl: 'https://example.com/images/laal-maas.jpg',
    category: categoryIds[31],
    tags: [tagIds[0], tagIds[5]], // Spicy, Chef Special
    addons: [
      { addon: addonIds[15], required: true }, // Curry Base
      { addon: addonIds[16], required: false } // Extra Accompaniments
    ],
    isAvailable: true,
    createdBy: managerIds[5],
    restaurant: restaurantIds[5]
  },
  {
    _id: productIds[17],
    name: 'Gatte ki Sabji',
    description: 'Gram flour dumplings in yogurt gravy',
    price: 280,
    imageUrl: 'https://example.com/images/gatte-ki-sabji.jpg',
    category: categoryIds[31],
    tags: [tagIds[1], tagIds[11]], // Vegetarian, Recommended
    addons: [
      { addon: addonIds[15], required: true }, // Curry Base
      { addon: addonIds[16], required: false } // Extra Accompaniments
    ],
    isAvailable: true,
    createdBy: managerIds[5],
    restaurant: restaurantIds[5]
  }
];

module.exports = {
  products,
  productIds
};