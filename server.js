const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Create Express app
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Define a simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Route not found: ${req.originalUrl}`
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });