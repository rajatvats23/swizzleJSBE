// seedPayments.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load models
const Order = require('./models/orderModel');
const Payment = require('./models/paymentModel');

// Spice Junction restaurant ID
const RESTAURANT_ID = '67e1b9bd2f1df8d44121f7d1';

// Function to seed payment data
const seedPayments = async () => {
  try {
    console.log('Starting to seed payment data for Spice Junction...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find all orders for Spice Junction that are not marked as paid
    const unpaidOrders = await Order.find({ 
      restaurant: RESTAURANT_ID,
      isPaid: false  
    });
    
    console.log(`Found ${unpaidOrders.length} unpaid orders to process`);
    
    // Find all orders for Spice Junction that are already paid
    const paidOrders = await Order.find({
      restaurant: RESTAURANT_ID,
      isPaid: true
    });
    
    console.log(`Found ${paidOrders.length} orders already marked as paid`);
    
    // Check if payments already exist for paid orders
    let paymentsToCreate = 0;
    for (const order of paidOrders) {
      const existingPayment = await Payment.findOne({ order: order._id });
      if (!existingPayment) {
        paymentsToCreate++;
      }
    }
    
    console.log(`Need to create ${paymentsToCreate} payment records for orders marked as paid`);
    
    // Payment methods with distribution weights
    const paymentMethods = [
      { method: 'card', weight: 0.4 },
      { method: 'cash', weight: 0.3 },
      { method: 'upi', weight: 0.2 },
      { method: 'wallet', weight: 0.1 }
    ];
    
    // Helper function to select payment method based on weights
    const selectPaymentMethodWithWeight = () => {
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (const methodObj of paymentMethods) {
        cumulativeWeight += methodObj.weight;
        if (random <= cumulativeWeight) {
          return methodObj.method;
        }
      }
      
      return 'card'; // Default
    };
    
    // Create payments for orders already marked as paid but without payment records
    console.log('Creating payments for orders already marked as paid...');
    let paidPaymentsCreated = 0;
    
    for (const order of paidOrders) {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({ order: order._id });
      if (existingPayment) {
        console.log(`Payment already exists for order ${order._id}`);
        continue;
      }
      
      // Create payment record
      const paymentMethod = order.paymentMethod || selectPaymentMethodWithWeight();
      
      const payment = await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        currency: 'inr',
        status: 'successful',
        paymentMethod,
        paymentIntentId: paymentMethod === 'card' ? `pi_${Math.random().toString(36).substring(2, 15)}` : undefined,
        receiptUrl: paymentMethod === 'card' ? `https://receipts.example.com/${Math.random().toString(36).substring(2, 10)}` : undefined,
        metadata: {
          customerName: 'Seeded Payment',
          restaurantId: RESTAURANT_ID
        },
        createdAt: order.createdAt, // Same date as order
        updatedAt: order.createdAt
      });
      
      // Ensure order payment method matches
      if (order.paymentMethod !== paymentMethod) {
        order.paymentMethod = paymentMethod;
        await order.save();
      }
      
      paidPaymentsCreated++;
      console.log(`Created successful payment record for paid order ${order._id}`);
    }
    
    console.log(`Successfully created ${paidPaymentsCreated} payment records for already paid orders`);
    
    // Process some unpaid orders - create payments with various statuses
    console.log('Creating payments for unpaid orders...');
    const paymentStatuses = ['successful', 'pending', 'processing', 'failed'];
    const statusDistribution = [0.6, 0.2, 0.1, 0.1]; // 60% successful, 20% pending, 10% processing, 10% failed
    
    let unpaidPaymentsCreated = 0;
    
    for (const order of unpaidOrders) {
      // Randomly decide whether to create payment for this order (70% chance)
      if (Math.random() > 0.7) {
        continue;
      }
      
      // Select payment status based on distribution
      const statusIndex = (() => {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < statusDistribution.length; i++) {
          cumulativeWeight += statusDistribution[i];
          if (random <= cumulativeWeight) {
            return i;
          }
        }
        
        return 0; // Default to successful
      })();
      
      const status = paymentStatuses[statusIndex];
      const paymentMethod = selectPaymentMethodWithWeight();
      
      // Create payment record
      const payment = await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        currency: 'inr',
        status,
        paymentMethod,
        paymentIntentId: paymentMethod === 'card' ? `pi_${Math.random().toString(36).substring(2, 15)}` : undefined,
        receiptUrl: (status === 'successful' && paymentMethod === 'card') ? 
          `https://receipts.example.com/${Math.random().toString(36).substring(2, 10)}` : undefined,
        metadata: {
          customerName: 'Seeded Payment',
          restaurantId: RESTAURANT_ID
        }
      });
      
      // If payment is successful, update order's isPaid flag
      if (status === 'successful') {
        order.isPaid = true;
        order.paymentMethod = paymentMethod;
        await order.save();
      }
      
      unpaidPaymentsCreated++;
      console.log(`Created ${status} payment record for order ${order._id}`);
    }
    
    console.log(`Successfully created ${unpaidPaymentsCreated} payment records for previously unpaid orders`);
    console.log(`Total payments created: ${paidPaymentsCreated + unpaidPaymentsCreated}`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding payment data:', error);
    
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
seedPayments();