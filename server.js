const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');       
const productRoutes = require('./routes/productRoutes');
const addonRoutes = require('./routes/addonRoutes'); 
const tableRoutes = require('./routes/tableRoutes'); 
const customerRoutes = require('./routes/customerRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');
const staffOrderRoutes = require('./routes/staffOrderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Create Express app
const app = express();

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware for parsing JSON
app.use(express.json());

// Configure CORS specifically for React dev server
app.use(cors({
  origin: ['http://localhost:3000', 'http://2409:4055:2e98:cd6c:ad2f:2ce3:c43b:1555:3000', 'http://localhost:4500'],  // React dev server address
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Special route to handle table QR code URLs
app.get('/table/:qrCodeIdentifier', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);         
app.use('/api/products', productRoutes); 
app.use('/api/addons', addonRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/customer', customerOrderRoutes);
app.use('/api/staff', staffOrderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);


// Define a simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware for 404 routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Route not found: ${req.originalUrl}`
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Start server on all network interfaces
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} and accessible via local network`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });