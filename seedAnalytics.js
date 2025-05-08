// seedAnalytics.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');

// Load environment variables
dotenv.config();

// Load models
const Customer = require('./models/customerModel');
const Table = require('./models/tableModel');
const Order = require('./models/orderModel');
const OrderItem = require('./models/orderItemModel');
const Product = require('./models/productModel');
const { DailyRevenue } = require('./models/analyticsModel');

// Spice Junction restaurant ID
const RESTAURANT_ID = '67e1b9bd2f1df8d44121f7d1';

// Product IDs from database
const PRODUCTS = [
  {
    id: '67e1bce01ed1962452888561',
    name: 'Paneer Tikka Masala',
    price: 302,
    category: '67e1bb21b85a784f9add729a',
    popularity: 0.8 // High popularity factor (0-1)
  },
  {
    id: '67e1bce01ed1962452888564',
    name: 'Dal Makhani',
    price: 209,
    category: '67e1bb21b85a784f9add729b',
    popularity: 0.7
  },
  {
    id: '67e1bce01ed1962452888568',
    name: 'Chicken Biryani',
    price: 338,
    category: '67e1bb21b85a784f9add729c',
    popularity: 0.9 // Most popular
  },
  {
    id: '67e1bce01ed196245288856b',
    name: 'Malai Kofta',
    price: 268,
    category: '67e1bb21b85a784f9add729d',
    popularity: 0.6
  }
];

// Add more products to ensure we have items across all categories
const ADDITIONAL_PRODUCTS = [
  {
    id: '67e1bce01ed196245288856c',
    name: 'Gulab Jamun',
    price: 120,
    category: '67e1bb21b85a784f9add72a5', // Desserts
    popularity: 0.75
  },
  {
    id: '67e1bce01ed196245288856d',
    name: 'Butter Chicken',
    price: 350,
    category: '67e1bb21b85a784f9add72a6', // Chef Specials
    popularity: 0.85
  },
  {
    id: '67e1bce01ed196245288856e',
    name: 'Mango Lassi',
    price: 90,
    category: '67e1bb21b85a784f9add72a7', // Seasonal Specials
    popularity: 0.7
  },
  {
    id: '67e1bce01ed196245288856f',
    name: 'Special Biryani Platter',
    price: 450,
    category: '67e1bb21b85a784f9add72a8', // Weekend Specials
    popularity: 0.8
  },
  {
    id: '67e1bce01ed1962452888570',
    name: 'Samosa',
    price: 80,
    category: '67e1bb21b85a784f9add72a9', // Starters
    popularity: 0.9
  }
];

// Combine all products
const ALL_PRODUCTS = [...PRODUCTS, ...ADDITIONAL_PRODUCTS];

// Table IDs from database
const TABLES = [
  { id: '681655df3d747da6d7a1e1e8', number: 'T1', capacity: 10 },
  { id: '6817a4162bd64d54b59f9a48', number: 'T2', capacity: 4 },
  { id: '6817a4162bd64d54b59f9a4c', number: 'T3', capacity: 6 },
  { id: '6817a4162bd64d54b59f9a4f', number: 'T4', capacity: 8 },
  { id: '6817a4162bd64d54b59f9a52', number: 'T5', capacity: 2 }
];

// Sample customers
const sampleCustomers = [
  { phoneNumber: '+919876543210', name: 'Rahul Sharma', visitFrequency: 0.9 }, // Regular
  { phoneNumber: '+919876543211', name: 'Priya Patel', visitFrequency: 0.8 },
  { phoneNumber: '+919876543212', name: 'Amit Singh', visitFrequency: 0.5 }, // Occasional
  { phoneNumber: '+919876543213', name: 'Neha Gupta', visitFrequency: 0.3 },
  { phoneNumber: '+919876543214', name: 'Vikram Malhotra', visitFrequency: 0.2 }, // Rare
  { phoneNumber: '+919876543215', name: 'Ananya Desai', visitFrequency: 0.7 },
  { phoneNumber: '+919876543216', name: 'Rajiv Kumar', visitFrequency: 0.4 },
  { phoneNumber: '+919876543217', name: 'Sunita Tiwari', visitFrequency: 0.6 },
  { phoneNumber: '+919876543218', name: 'Arjun Reddy', visitFrequency: 0.1 }, // Very rare
  { phoneNumber: '+919876543219', name: 'Meera Kapoor', visitFrequency: 0.85 }
];

// Order statuses with probabilities
const ORDER_STATUSES = {
  placed: 0.05,     // 5% of orders still in placed status
  preparing: 0.10,  // 10% of orders being prepared
  ready: 0.05,      // 5% ready for pickup/delivery
  delivered: 0.10,  // 10% delivered but not completed
  completed: 0.70   // 70% fully completed orders
};

// Item statuses
const ITEM_STATUSES = ['ordered', 'preparing', 'ready', 'delivered'];

// Payment methods with probabilities
const PAYMENT_METHODS = {
  cash: 0.4,    // 40% pay with cash
  card: 0.35,   // 35% pay with card
  online: 0.25  // 25% pay online
};

// Time distribution parameters
const TIME_DISTRIBUTION = {
  // Hour probabilities (24-hour format)
  hourProbabilities: {
    0: 0.01, 1: 0.005, 2: 0.001, 3: 0.001, 4: 0.001, 5: 0.005,
    6: 0.01, 7: 0.03, 8: 0.05, 9: 0.04, 10: 0.05, 11: 0.07,
    12: 0.09, 13: 0.10, 14: 0.06, 15: 0.03, 16: 0.02, 17: 0.03,
    18: 0.06, 19: 0.10, 20: 0.12, 21: 0.09, 22: 0.06, 23: 0.03
  },
  // Day of week probabilities (0 = Sunday, 6 = Saturday)
  dayProbabilities: {
    0: 0.17, 1: 0.11, 2: 0.10, 3: 0.12, 4: 0.14, 5: 0.18, 6: 0.18
  },
  // Month probabilities (seasonal variations)
  monthProbabilities: {
    0: 0.07, 1: 0.07, 2: 0.08, 3: 0.09, 4: 0.09, 5: 0.08,
    6: 0.08, 7: 0.08, 8: 0.09, 9: 0.09, 10: 0.09, 11: 0.09
  }
};

// Helper functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getWeightedRandom(options) {
  const keys = Object.keys(options);
  const sum = keys.reduce((total, key) => total + options[key], 0);
  let random = Math.random() * sum;
  
  for (const key of keys) {
    random -= options[key];
    if (random <= 0) {
      return key;
    }
  }
  
  return keys[0]; // Fallback
}

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a date with weighted randomness
function generateRandomDate(startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  const range = end.diff(start, 'days');
  
  // Start with a simple random date
  let randomDays = Math.floor(Math.random() * range);
  const date = moment(start).add(randomDays, 'days');
  
  // Apply day of week weighting
  const dayOfWeek = date.day();
  if (Math.random() > TIME_DISTRIBUTION.dayProbabilities[dayOfWeek] * 2) {
    // Try again for a more likely day
    return generateRandomDate(startDate, endDate);
  }
  
  // Apply month weighting
  const month = date.month();
  if (Math.random() > TIME_DISTRIBUTION.monthProbabilities[month] * 2) {
    // Try again for a more likely month
    return generateRandomDate(startDate, endDate);
  }
  
  // Apply hour weighting
  const hour = getWeightedRandom(TIME_DISTRIBUTION.hourProbabilities);
  date.hour(parseInt(hour));
  date.minute(Math.floor(Math.random() * 60));
  date.second(Math.floor(Math.random() * 60));
  
  return date.toDate();
}

// Select products for an order with weighted probabilities
function selectOrderProducts(count) {
  const selectedProducts = [];
  const productPool = [...ALL_PRODUCTS]; // Make a copy
  
  for (let i = 0; i < count; i++) {
    // Weight by popularity
    let totalPopularity = productPool.reduce((sum, product) => sum + product.popularity, 0);
    let random = Math.random() * totalPopularity;
    let selectedIndex = 0;
    
    for (let j = 0; j < productPool.length; j++) {
      random -= productPool[j].popularity;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    selectedProducts.push(productPool[selectedIndex]);
    
    // Optionally: remove the selected product to avoid duplicates
    // productPool.splice(selectedIndex, 1);
  }
  
  return selectedProducts;
}

// Select a customer with weighted probability based on visit frequency
function selectCustomer(customers) {
  const totalFrequency = customers.reduce((sum, customer) => sum + customer.visitFrequency, 0);
  let random = Math.random() * totalFrequency;
  
  for (const customer of customers) {
    random -= customer.visitFrequency;
    if (random <= 0) {
      return customer;
    }
  }
  
  return customers[0]; // Fallback
}

// Generate order fulfillment time in minutes based on order status
function generateFulfillmentTime(status) {
  switch (status) {
    case 'placed':
      return 0; // Just placed
    case 'preparing':
      return getRandomValue(5, 15); // 5-15 minutes in preparation
    case 'ready':
      return getRandomValue(15, 25); // 15-25 minutes to get ready
    case 'delivered':
      return getRandomValue(25, 40); // 25-40 minutes for delivery
    case 'completed':
      return getRandomValue(30, 60); // 30-60 minutes total time
    default:
      return 30; // Default 30 minutes
  }
}

// Main seeding function
async function seedAnalyticsData() {
  try {
    console.log('Starting to seed analytics data for Spice Junction...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Date range for analytics data (3 months)
    const endDate = new Date(); // Today
    const startDate = moment(endDate).subtract(3, 'months').toDate();
    
    console.log(`Generating data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    // Get or create customers
    const customerIds = [];
    const customers = [];
    
    for (const customerData of sampleCustomers) {
      // Check if customer already exists
      let customer = await Customer.findOne({ phoneNumber: customerData.phoneNumber });
      
      if (!customer) {
        customer = await Customer.create({
          ...customerData,
          isVerified: true
        });
        console.log(`Created customer: ${customer.name}`);
      } else {
        console.log(`Using existing customer: ${customer.name}`);
      }
      
      customerIds.push(customer._id);
      customers.push({
        ...customerData,
        _id: customer._id
      });
    }
    
    // Clear any existing analytics data for this restaurant in the date range
    await DailyRevenue.deleteMany({
      restaurant: RESTAURANT_ID,
      date: { $gte: startDate, $lte: endDate }
    });
    console.log('Cleared existing analytics data');
    
    // Create orders
    console.log('Creating orders...');
    const totalOrders = 350; // Create 350 orders over 3 months
    const dailyRevenue = {}; // Track daily revenue for aggregation
    
    for (let i = 0; i < totalOrders; i++) {
      // Generate order date with weighted distribution
      const orderDate = generateRandomDate(startDate, endDate);
      const dateString = moment(orderDate).format('YYYY-MM-DD');
      
      // Initialize daily revenue tracker if needed
      if (!dailyRevenue[dateString]) {
        dailyRevenue[dateString] = {
          date: new Date(dateString),
          totalRevenue: 0,
          orderCount: 0,
          paymentMethods: {
            cash: 0,
            card: 0,
            online: 0
          }
        };
      }
      
      // Select a customer weighted by visit frequency
      const customer = selectCustomer(customers);
      
      // Randomly select a table
      const table = getRandomItem(TABLES);
      
      // Select a status weighted by probabilities
      const status = getWeightedRandom(ORDER_STATUSES);
      
      // Determine if paid based on status (completed orders are always paid)
      const isPaid = status === 'completed' ? true : Math.random() < 0.5;
      
      // Select payment method if paid
      const paymentMethod = isPaid ? getWeightedRandom(PAYMENT_METHODS) : '';
      
      // Create order
      const order = new Order({
        customer: customer._id,
        restaurant: RESTAURANT_ID,
        table: table.id,
        status,
        totalAmount: 0, // Will update after adding items
        specialInstructions: Math.random() > 0.8 ? 'Please make it less spicy' : '',
        isPaid,
        paymentMethod,
        createdAt: orderDate,
        updatedAt: moment(orderDate).add(generateFulfillmentTime(status), 'minutes').toDate(),
        items: []
      });
      
      await order.save();
      
      // Create 1-5 order items
      const numItems = 1 + Math.floor(Math.random() * 4); // 1-5 items
      const selectedProducts = selectOrderProducts(numItems);
      let totalAmount = 0;
      
      for (let j = 0; j < selectedProducts.length; j++) {
        const product = selectedProducts[j];
        
        // Random quantity 1-3
        const quantity = 1 + Math.floor(Math.random() * 3);
        
        // Use actual product price
        const price = product.price;
        
        // Calculate item total
        const itemTotal = price * quantity;
        totalAmount += itemTotal;
        
        // Set item status based on order status
        let itemStatus;
        if (status === 'placed') {
          itemStatus = 'ordered';
        } else if (status === 'preparing') {
          itemStatus = Math.random() > 0.5 ? 'ordered' : 'preparing';
        } else if (status === 'ready') {
          itemStatus = 'ready';
        } else {
          itemStatus = 'delivered';
        }
        
        // Create order item
        const orderItem = new OrderItem({
          order: order._id,
          product: product.id,
          quantity,
          price,
          status: itemStatus,
          specialInstructions: Math.random() > 0.8 ? 'Extra spicy' : ''
        });
        
        await orderItem.save();
        
        // Add item to order
        order.items.push(orderItem._id);
      }
      
      // Update order with total amount
      order.totalAmount = totalAmount;
      await order.save();
      
      // Update daily revenue tracker
      dailyRevenue[dateString].totalRevenue += totalAmount;
      dailyRevenue[dateString].orderCount += 1;
      
      if (isPaid && paymentMethod) {
        dailyRevenue[dateString].paymentMethods[paymentMethod] += 1;
      }
      
      if (i % 50 === 0) {
        console.log(`Created ${i} orders out of ${totalOrders}...`);
      }
    }
    
    // Generate daily revenue aggregations
    console.log('Generating daily revenue aggregations...');
    for (const [date, data] of Object.entries(dailyRevenue)) {
      const averageOrderValue = data.orderCount > 0 ? data.totalRevenue / data.orderCount : 0;
      
      await DailyRevenue.create({
        date: data.date,
        restaurant: RESTAURANT_ID,
        totalRevenue: data.totalRevenue,
        orderCount: data.orderCount,
        averageOrderValue,
        paymentMethods: data.paymentMethods
      });
    }
    
    console.log('Analytics seed data creation completed!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed after error');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    process.exit(1);
  }
}

// Run the seeding function
seedAnalyticsData();