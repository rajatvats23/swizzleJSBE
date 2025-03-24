// sample-data/restaurants.js
const mongoose = require('mongoose');

// Generate ObjectIds to use as references
const restaurantIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId()
];

// Create user IDs for managers
const managerIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId()
];

// Sample restaurant data
const restaurants = [
  {
    _id: restaurantIds[0],
    name: 'Spice Junction',
    email: 'contact@spicejunction.com',
    phone: '+91-9876543210',
    manager: managerIds[0],
    managerEmail: 'manager@spicejunction.com',
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
    _id: restaurantIds[1],
    name: 'Tandoori Nights',
    email: 'info@tandoorinights.com',
    phone: '+91-8765432109',
    manager: managerIds[1],
    managerEmail: 'manager@tandoorinights.com',
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
    _id: restaurantIds[2],
    name: 'Dosa Paradise',
    email: 'hello@dosaparadise.com',
    phone: '+91-7654321098',
    manager: managerIds[2],
    managerEmail: 'manager@dosaparadise.com',
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
    _id: restaurantIds[3],
    name: 'Bengali Bites',
    email: 'contact@bengalibites.com',
    phone: '+91-6543210987',
    manager: managerIds[3],
    managerEmail: 'manager@bengalibites.com',
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
    _id: restaurantIds[4],
    name: 'Chaat Corner',
    email: 'info@chaatcorner.com',
    phone: '+91-5432109876',
    manager: managerIds[4],
    managerEmail: 'manager@chaatcorner.com',
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
    _id: restaurantIds[5],
    name: 'Royal Rajputana',
    email: 'contact@royalrajputana.com',
    phone: '+91-4321098765',
    manager: managerIds[5],
    managerEmail: 'manager@royalrajputana.com',
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

module.exports = {
  restaurants,
  restaurantIds,
  managerIds
};