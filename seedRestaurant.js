const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define User schema (needed for reference)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'manager', 'staff'],
    default: 'admin'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  }
}, { timestamps: true });

// Define Restaurant schema
const restaurantSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  
  // Manager relationship
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerEmail: { type: String, required: true, trim: true, lowercase: true },
  
  // Basic location (admin provided)
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  
  // Detailed location (manager provided)
  detailedLocation: {
    fullAddress: String,
    street: String,
    landmark: String,
    formattedAddress: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    placeId: String // Google Maps Place ID for future reference
  },
  
  // Business details
  description: String,
  cuisineType: String,
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  website: String,
  
  // Status tracking
  status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionPercentage: { type: Number, default: 0 },
  isBasicSetupComplete: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save hook for Restaurant schema
restaurantSchema.pre('save', function(next) {
  const requiredFields = ['name', 'email', 'phone', 'address', 'city',
    'description', 'cuisineType', 'detailedLocation.location.coordinates'];
  
  const filledFields = requiredFields.filter(field => {
    if (field.includes('.')) {
      const parts = field.split('.');
      let obj = this;
      for (const part of parts) {
        if (!obj || !obj[part]) return false;
        obj = obj[part];
      }
      return obj[0] !== 0 || obj[1] !== 0; // For coordinates
    }
    return Boolean(this[field]);
  }).length;
  
  this.completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
  
  const basicFields = ['name', 'email', 'phone', 'address', 'city'];
  this.isBasicSetupComplete = basicFields.every(field => Boolean(this[field]));
  
  next();
});

// Define models
const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Function to seed restaurants
const seedRestaurants = async () => {
  try {
    console.log('Starting to seed restaurants...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB with URI: ${mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');
    
    // Check if restaurants already exist
    const existingRestaurantsCount = await Restaurant.countDocuments();
    console.log(`Found ${existingRestaurantsCount} existing restaurants`);
    
    if (existingRestaurantsCount > 0) {
      console.log('Restaurants already exist in the database. Clearing existing restaurants...');
      await Restaurant.deleteMany({});
      console.log('Existing restaurants cleared successfully');
    }
    
    // Get superadmin
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (!superadmin) {
      console.error('Superadmin user not found. Please run seedUsers.js first.');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    // Get all manager users or create them if they don't exist
    console.log('Checking for existing managers...');
    const restaurantNames = [
      'SpiceJunction',
      'TandooriNights',
      'DosaParadise',
      'BengaliBites',
      'ChaatCorner',
      'RoyalRajputana'
    ];
    
    const managerEmails = restaurantNames.map(name => 
      `vats.rajat23+${name}@gmail.com`
    );
    
    const managers = [];
    let createdManagersCount = 0;
    
    for (const [index, email] of managerEmails.entries()) {
      let manager = await User.findOne({ email });
      
      if (!manager) {
        console.log(`Creating manager with email: ${email}`);
        manager = await User.create({
          firstName: `Manager${index + 1}`,
          lastName: `Restaurant${index + 1}`,
          email,
          password: 'Password@123',
          countryCode: '+91',
          phoneNumber: `98765${index}${index}${index}`,
          role: 'manager',
          isVerified: true,
          createdBy: superadmin._id
        });
        createdManagersCount++;
      } else {
        console.log(`Found existing manager with email: ${email}`);
      }
      
      managers.push(manager);
    }
    
    console.log(`Total managers: ${managers.length} (${createdManagersCount} newly created)`);
    
    // Sample restaurant data
    const restaurantsData = [
      {
        name: 'Spice Junction',
        email: 'contact@spicejunction.com',
        phone: '+91-9876543210',
        managerEmail: 'vats.rajat23+SpiceJunction@gmail.com',
        address: '42 Flavor Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        description: 'Authentic North Indian cuisine served in a warm and inviting atmosphere.',
        cuisineType: 'North Indian',
        operatingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '10:00', close: '22:00' }
        },
        website: 'https://spicejunction.com',
        status: 'active',
        detailedLocation: {
          fullAddress: '42 Flavor Lane, Mumbai, Maharashtra 400001',
          street: 'Flavor Lane',
          landmark: 'Near City Mall',
          formattedAddress: '42 Flavor Lane, Mumbai',
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.0760]
          },
          placeId: 'ChIJW_fZxFC5wjsRmkUbwIrwpgM'
        },
        isBasicSetupComplete: true
      },
      {
        name: 'Tandoori Nights',
        email: 'info@tandoorinights.com',
        phone: '+91-8765432109',
        managerEmail: 'vats.rajat23+TandooriNights@gmail.com',
        address: '78 Curry Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
        description: 'Specializing in tandoori dishes with a modern twist.',
        cuisineType: 'North Indian',
        operatingHours: {
          monday: { open: '12:00', close: '23:00' },
          tuesday: { open: '12:00', close: '23:00' },
          wednesday: { open: '12:00', close: '23:00' },
          thursday: { open: '12:00', close: '23:00' },
          friday: { open: '12:00', close: '00:00' },
          saturday: { open: '12:00', close: '00:00' },
          sunday: { open: '12:00', close: '23:00' }
        },
        website: 'https://tandoorinights.com',
        status: 'active',
        detailedLocation: {
          fullAddress: '78 Curry Street, Delhi 110001',
          street: 'Curry Street',
          landmark: 'Opposite Central Park',
          formattedAddress: '78 Curry Street, Delhi',
          location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139]
          },
          placeId: 'ChIJLbZ-NFv9DDkRzk0gTkm3wlM'
        },
        isBasicSetupComplete: true
      },
      {
        name: 'Dosa Paradise',
        email: 'hello@dosaparadise.com',
        phone: '+91-7654321098',
        managerEmail: 'vats.rajat23+DosaParadise@gmail.com',
        address: '15 South Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
        description: 'South Indian cuisine specializing in various types of dosas and idlis.',
        cuisineType: 'South Indian',
        operatingHours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' },
          wednesday: { open: '07:00', close: '22:00' },
          thursday: { open: '07:00', close: '22:00' },
          friday: { open: '07:00', close: '22:00' },
          saturday: { open: '07:00', close: '22:00' },
          sunday: { open: '07:00', close: '22:00' }
        },
        website: 'https://dosaparadise.com',
        status: 'active',
        detailedLocation: {
          fullAddress: '15 South Avenue, Bangalore, Karnataka 560001',
          street: 'South Avenue',
          landmark: 'Near Tech Park',
          formattedAddress: '15 South Avenue, Bangalore',
          location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716]
          },
          placeId: 'ChIJbU60yXAWrjsR4E9-UejD3_g'
        },
        isBasicSetupComplete: true
      },
      {
        name: 'Bengali Bites',
        email: 'contact@bengalibites.com',
        phone: '+91-6543210987',
        managerEmail: 'vats.rajat23+BengaliBites@gmail.com',
        address: '27 East Road',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700001',
        country: 'India',
        description: 'Traditional Bengali cuisine with emphasis on seafood dishes.',
        cuisineType: 'Bengali',
        operatingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '11:00', close: '22:00' }
        },
        website: 'https://bengalibites.com',
        status: 'active',
        detailedLocation: {
          fullAddress: '27 East Road, Kolkata, West Bengal 700001',
          street: 'East Road',
          landmark: 'Near Victoria Memorial',
          formattedAddress: '27 East Road, Kolkata',
          location: {
            type: 'Point',
            coordinates: [88.3639, 22.5726]
          },
          placeId: 'ChIJZ_YISduC-DkRvCp1OTaM5cg'
        },
        isBasicSetupComplete: true
      },
      {
        name: 'Chaat Corner',
        email: 'info@chaatcorner.com',
        phone: '+91-5432109876',
        managerEmail: 'vats.rajat23+ChaatCorner@gmail.com',
        address: '9 Street Food Alley',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
        country: 'India',
        description: 'Specializing in street food from across India with a focus on Gujarati chaats.',
        cuisineType: 'Street Food',
        operatingHours: {
          monday: { open: '10:00', close: '21:00' },
          tuesday: { open: '10:00', close: '21:00' },
          wednesday: { open: '10:00', close: '21:00' },
          thursday: { open: '10:00', close: '21:00' },
          friday: { open: '10:00', close: '22:00' },
          saturday: { open: '10:00', close: '22:00' },
          sunday: { open: '10:00', close: '22:00' }
        },
        website: 'https://chaatcorner.com',
        status: 'active',
        detailedLocation: {
          fullAddress: '9 Street Food Alley, Ahmedabad, Gujarat 380001',
          street: 'Street Food Alley',
          landmark: 'Near Law Garden',
          formattedAddress: '9 Street Food Alley, Ahmedabad',
          location: {
            type: 'Point',
            coordinates: [72.5714, 23.0225]
          },
          placeId: 'ChIJSdRbuQ6EXjkRFmVPYRHdzk8'
        },
        isBasicSetupComplete: true
      },
      {
        name: 'Royal Rajputana',
        email: 'contact@royalrajputana.com',
        phone: '+91-4321098765',
        managerEmail: 'vats.rajat23+RoyalRajputana@gmail.com',
        address: '36 Desert View',
        city: 'Jaipur',
        state: 'Rajasthan',
        zipCode: '302001',
        country: 'India',
        description: 'Authentic Rajasthani cuisine with royal recipes passed down through generations.',
        cuisineType: 'Rajasthani',
        operatingHours: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '23:00' },
          friday: { open: '11:00', close: '23:30' },
          saturday: { open: '11:00', close: '23:30' },
          sunday: { open: '11:00', close: '23:00' }
        },
        website: 'https://royalrajputana.com',
        status: 'active',
        detailedLocation: {
          fullAddress: '36 Desert View, Jaipur, Rajasthan 302001',
          street: 'Desert View',
          landmark: 'Near Hawa Mahal',
          formattedAddress: '36 Desert View, Jaipur',
          location: {
            type: 'Point',
            coordinates: [75.8273, 26.9124]
          },
          placeId: 'ChIJgeJXTN2aaDkRCS7yDDrV_Yw'
        },
        isBasicSetupComplete: true
      }
    ];
    
    // Create restaurants and associate with manager
    console.log('Creating restaurants...');
    const createdRestaurants = [];
    
    for (const [index, restaurantData] of restaurantsData.entries()) {
      // Find corresponding manager
      const manager = managers[index]; // Use the index directly since the arrays are aligned
      
      console.log(`Finding manager for ${restaurantData.name}...`);
      console.log(`Expected email: ${restaurantData.managerEmail}`);
      console.log(`Found manager: ${manager ? manager.email : 'None'}`);
      
      if (!manager) {
        console.error(`Manager not found for restaurant: ${restaurantData.name}`);
        continue;
      }
      
      const restaurantToCreate = {
        ...restaurantData,
        manager: manager._id,
        createdBy: superadmin._id
      };
      
      const restaurant = await Restaurant.create(restaurantToCreate);
      createdRestaurants.push(restaurant);
      
      // Update manager with restaurant ID
      manager.restaurantId = restaurant._id;
      await manager.save();
      
      console.log(`Created restaurant: ${restaurant.name} with manager: ${manager.email}`);
    }
    
    console.log(`Successfully created ${createdRestaurants.length} restaurants`);
    
    console.log('Restaurant seeding completed successfully!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error seeding restaurants:', error);
    
    // Print detailed error information
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Error Code:', error.code);
      console.error('MongoDB Error Message:', error.message);
    }
    
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
seedRestaurants();