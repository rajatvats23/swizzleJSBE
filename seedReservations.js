// seedReservations.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load models
const Reservation = require('./models/reservationModel');
const Table = require('./models/tableModel');
const Menu = require('./models/menuModel');

// Spice Junction restaurant ID
const RESTAURANT_ID = '67e1b9bd2f1df8d44121f7d1';
// Spice Junction manager ID
const MANAGER_ID = '67e1b90ef927324a16800486';

// Customer IDs from your database
const CUSTOMER_IDS = [
  '6817a4162bd64d54b59f9a55', // Rahul Sharma
  '6817a4162bd64d54b59f9a58', // Priya Patel
  '6817a4162bd64d54b59f9a5b', // Amit Singh
  '6817a4162bd64d54b59f9a5e', // Neha Gupta
  '6817a4172bd64d54b59f9a61'  // Vikram Malhotra
];

// Create a Main Menu for Spice Junction if it doesn't exist
const createSpiceJunctionMenu = async () => {
  try {
    // Check if menu already exists
    const existingMenu = await Menu.findOne({ 
      restaurantId: RESTAURANT_ID,
      name: 'Main Menu'
    });
    
    if (existingMenu) {
      console.log('Spice Junction Main Menu already exists');
      return existingMenu._id;
    }
    
    // Create new menu
    const menu = await Menu.create({
      name: 'Main Menu',
      description: 'Spice Junction\'s signature dishes available throughout the week',
      restaurantId: RESTAURANT_ID,
      createdBy: MANAGER_ID
    });
    
    console.log(`Created Spice Junction Main Menu with ID: ${menu._id}`);
    return menu._id;
  } catch (error) {
    console.error('Error creating menu:', error);
    throw error;
  }
};

// Function to seed reservation data
const seedReservations = async () => {
  try {
    console.log('Starting to seed reservation data for Spice Junction...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Create menu if it doesn't exist
    await createSpiceJunctionMenu();
    
    // Get all tables for the restaurant
    const tables = await Table.find({ restaurantId: RESTAURANT_ID });
    
    if (tables.length === 0) {
      console.log('No tables found for Spice Junction. Please run seedOrders.js first.');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Found ${tables.length} tables for Spice Junction`);
    
    // Create reservations for different days and times
    console.log('Creating reservations...');
    
    // Generate reservation dates (from today to 14 days in the future)
    const reservationDates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Add lunch time (13:00)
      const lunchTime = new Date(date);
      lunchTime.setHours(13, 0, 0, 0);
      reservationDates.push(lunchTime);
      
      // Add dinner time (20:00)
      const dinnerTime = new Date(date);
      dinnerTime.setHours(20, 0, 0, 0);
      reservationDates.push(dinnerTime);
    }
    
    // Reservation statuses with distribution weights
    const statuses = [
      { status: 'pending', weight: 0.2 },
      { status: 'confirmed', weight: 0.5 },
      { status: 'seated', weight: 0.1 },
      { status: 'completed', weight: 0.1 },
      { status: 'cancelled', weight: 0.05 },
      { status: 'no-show', weight: 0.05 }
    ];
    
    // Helper function to select status based on weights
    const selectStatusWithWeight = () => {
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (const statusObj of statuses) {
        cumulativeWeight += statusObj.weight;
        if (random <= cumulativeWeight) {
          return statusObj.status;
        }
      }
      
      return 'confirmed'; // Default
    };
    
    // Create about 40 reservations with different statuses
    const reservationsToCreate = 40;
    let createdCount = 0;
    
    for (let i = 0; i < reservationsToCreate; i++) {
      // Select random date, table, customer, and party size
      const dateIndex = Math.floor(Math.random() * reservationDates.length);
      const tableIndex = Math.floor(Math.random() * tables.length);
      const customerIndex = Math.floor(Math.random() * CUSTOMER_IDS.length);
      const partySize = Math.min(1 + Math.floor(Math.random() * 6), tables[tableIndex].capacity);
      
      // Select status (weighted)
      const status = selectStatusWithWeight();
      
      // Special instructions (30% chance)
      const hasSpecialRequest = Math.random() < 0.3;
      const specialRequests = hasSpecialRequest ? 
        ['Window seat please', 'Birthday celebration', 'Allergic to nuts', 'Wheelchair access needed', 
         'High chair needed'][Math.floor(Math.random() * 5)] : '';
      
      // Create reservation data
      const reservationData = {
        restaurant: RESTAURANT_ID,
        customer: {
          name: ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Neha Gupta', 'Vikram Malhotra'][customerIndex],
          phoneNumber: ['+919876543210', '+919876543211', '+919876543212', '+919876543213', '+919876543214'][customerIndex],
          email: Math.random() > 0.5 ? `customer${customerIndex}@example.com` : ''
        },
        partySize,
        reservationDate: reservationDates[dateIndex],
        specialRequests,
        status,
        createdBy: MANAGER_ID
      };
      
      // Assign table for confirmed, seated, and completed reservations
      if (['confirmed', 'seated', 'completed'].includes(status)) {
        reservationData.table = tables[tableIndex]._id;
        reservationData.assignedBy = MANAGER_ID;
      }
      
      // Create reservation
      const reservation = await Reservation.create(reservationData);
      createdCount++;
      
      console.log(`Created reservation #${createdCount}: ${status} for ${partySize} people on ${reservationDates[dateIndex].toLocaleString()}`);
    }
    
    console.log(`Successfully created ${createdCount} reservations`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding reservation data:', error);
    
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
seedReservations();