// seedOrders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Load models directly
const Customer = require('./models/customerModel');
const Table = require('./models/tableModel');
const Order = require('./models/orderModel');
const OrderItem = require('./models/orderItemModel');

// Spice Junction restaurant ID
const RESTAURANT_ID = '67e1b9bd2f1df8d44121f7d1';

// Product IDs from your database
const PRODUCT_IDS = [
  '67e1bce01ed1962452888561', // Paneer Tikka Masala
  '67e1bce01ed1962452888564', // Dal Makhani
  '67e1bce01ed1962452888568', // Chicken Biryani
  '67e1bce01ed196245288856b'  // Malai Kofta
];

// Sample tables for Spice Junction
const sampleTables = [
  { tableNumber: 'T1', capacity: 2, qrCodeIdentifier: crypto.randomBytes(16).toString('hex') },
  { tableNumber: 'T2', capacity: 4, qrCodeIdentifier: crypto.randomBytes(16).toString('hex') },
  { tableNumber: 'T3', capacity: 6, qrCodeIdentifier: crypto.randomBytes(16).toString('hex') },
  { tableNumber: 'T4', capacity: 8, qrCodeIdentifier: crypto.randomBytes(16).toString('hex') },
  { tableNumber: 'T5', capacity: 2, qrCodeIdentifier: crypto.randomBytes(16).toString('hex') }
];

// Sample customers
const sampleCustomers = [
  { phoneNumber: '+919876543210', name: 'Rahul Sharma' },
  { phoneNumber: '+919876543211', name: 'Priya Patel' },
  { phoneNumber: '+919876543212', name: 'Amit Singh' },
  { phoneNumber: '+919876543213', name: 'Neha Gupta' },
  { phoneNumber: '+919876543214', name: 'Vikram Malhotra' }
];

// Function to seed data
const seedData = async () => {
  try {
    console.log('Starting to seed data for Spice Junction...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Create tables for Spice Junction if they don't exist
    console.log('Creating tables...');
    const tableIds = [];
    
    for (const tableData of sampleTables) {
      // Check if table already exists
      const existingTable = await Table.findOne({ 
        tableNumber: tableData.tableNumber,
        restaurantId: RESTAURANT_ID
      });
      
      if (existingTable) {
        console.log(`Table ${tableData.tableNumber} already exists`);
        tableIds.push(existingTable._id);
      } else {
        const table = await Table.create({
          ...tableData,
          restaurantId: RESTAURANT_ID,
          status: 'Available',
          currentOccupancy: 0
        });
        
        console.log(`Created table: ${table.tableNumber}`);
        tableIds.push(table._id);
      }
    }
    
    // Create customers if they don't exist
    console.log('Creating customers...');
    const customerIds = [];
    
    for (const customerData of sampleCustomers) {
      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ 
        phoneNumber: customerData.phoneNumber 
      });
      
      if (existingCustomer) {
        console.log(`Customer ${customerData.name} already exists`);
        customerIds.push(existingCustomer._id);
      } else {
        const customer = await Customer.create({
          ...customerData,
          isVerified: true
        });
        
        console.log(`Created customer: ${customer.name}`);
        customerIds.push(customer._id);
      }
    }
    
    // Create orders with various statuses
    console.log('Creating orders...');
    
    const orderStatuses = ['placed', 'preparing', 'ready', 'delivered', 'completed'];
    const itemStatuses = ['ordered', 'preparing', 'ready', 'delivered'];
    
    // Create 10 orders with different dates over the past week
    for (let i = 0; i < 10; i++) {
      // Randomly select customer, table, and status
      const customerIndex = Math.floor(Math.random() * customerIds.length);
      const tableIndex = Math.floor(Math.random() * tableIds.length);
      const statusIndex = Math.floor(Math.random() * orderStatuses.length);
      
      // Calculate a random date within the past week
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 7));
      
      // Create order first
      const order = new Order({
        customer: customerIds[customerIndex],
        restaurant: RESTAURANT_ID,
        table: tableIds[tableIndex],
        status: orderStatuses[statusIndex],
        totalAmount: 0, // Will update after adding items
        specialInstructions: Math.random() > 0.8 ? 'Please bring water with the meal' : '',
        isPaid: Math.random() > 0.3, // 70% chance of being paid
        paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
        createdAt: orderDate,
        updatedAt: orderDate,
        items: [] // Will add items later
      });
      
      await order.save();
      
      // Create 1-4 order items
      const numItems = 1 + Math.floor(Math.random() * 4);
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        // Randomly select product
        const productIndex = Math.floor(Math.random() * PRODUCT_IDS.length);
        const productId = PRODUCT_IDS[productIndex];
        
        // Random quantity 1-3
        const quantity = 1 + Math.floor(Math.random() * 3);
        
        // Random price between 150-350
        const price = 150 + Math.floor(Math.random() * 200);
        
        // Calculate item total
        const itemTotal = price * quantity;
        totalAmount += itemTotal;
        
        // Random item status
        const itemStatusIndex = Math.min(statusIndex, itemStatuses.length - 1);
        
        // Create order item with order ID
        const orderItem = new OrderItem({
          order: order._id, // Now we have the order ID
          product: productId,
          quantity: quantity,
          price: price,
          status: itemStatuses[itemStatusIndex],
          specialInstructions: Math.random() > 0.7 ? 'Extra spicy, please' : ''
        });
        
        await orderItem.save();
        
        // Add item to order
        order.items.push(orderItem._id);
      }
      
      // Update order with total amount and save
      order.totalAmount = totalAmount;
      await order.save();
      
      console.log(`Created order #${i+1} with ${numItems} items, status: ${orderStatuses[statusIndex]}`);
    }
    
    console.log('Seed data creation completed!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    
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
seedData();