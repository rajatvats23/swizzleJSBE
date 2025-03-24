// sample-data/users.js
const bcrypt = require('bcryptjs');
const { managerIds, restaurantIds } = require('./restaurants');

// Create a default hashed password for all users
const createHashedPassword = async () => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash('Password@123', salt);
};

// Sample user data creator function
const createUsers = async () => {
  const hashedPassword = await createHashedPassword();
  
  // Admin ID
  const adminId = '507f1f77bcf86cd799439011'; // Fixed ID for admin user
  
  // Create manager users
  const managerUsers = [
    {
      _id: managerIds[0],
      firstName: 'Amit',
      lastName: 'Sharma',
      email: 'manager@spicejunction.com',
      password: hashedPassword,
      countryCode: '+91',
      phoneNumber: '9876543210',
      role: 'manager',
      isVerified: true,
      createdBy: adminId,
      restaurantId: restaurantIds[0]
    },
    {
      _id: managerIds[1],
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'manager@tandoorinights.com',
      password: hashedPassword,
      countryCode: '+91',
      phoneNumber: '8765432109',
      role: 'manager',
      isVerified: true,
      createdBy: adminId,
      restaurantId: restaurantIds[1]
    },
    {
      _id: managerIds[2],
      firstName: 'Sanjay',
      lastName: 'Reddy',
      email: 'manager@dosaparadise.com',
      password: hashedPassword,
      countryCode: '+91',
      phoneNumber: '7654321098',
      role: 'manager',
      isVerified: true,
      createdBy: adminId,
      restaurantId: restaurantIds[2]
    },
    {
      _id: managerIds[3],
      firstName: 'Neha',
      lastName: 'Banerjee',
      email: 'manager@bengalibites.com',
      password: hashedPassword,
      countryCode: '+91',
      phoneNumber: '6543210987',
      role: 'manager',
      isVerified: true,
      createdBy: adminId,
      restaurantId: restaurantIds[3]
    },
    {
      _id: managerIds[4],
      firstName: 'Raj',
      lastName: 'Mehta',
      email: 'manager@chaatcorner.com',
      password: hashedPassword,
      countryCode: '+91',
      phoneNumber: '5432109876',
      role: 'manager',
      isVerified: true,
      createdBy: adminId,
      restaurantId: restaurantIds[4]
    },
    {
      _id: managerIds[5],
      firstName: 'Divya',
      lastName: 'Singh',
      email: 'manager@royalrajputana.com',
      password: hashedPassword,
      countryCode: '+91',
      phoneNumber: '4321098765',
      role: 'manager',
      isVerified: true,
      createdBy: adminId,
      restaurantId: restaurantIds[5]
    }
  ];

  // Create staff users
  const staffUsers = [];
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) { // 2 staff members per restaurant
      staffUsers.push({
        _id: new mongoose.Types.ObjectId(),
        firstName: `Staff${j+1}`,
        lastName: `Restaurant${i+1}`,
        email: `staff${j+1}_r${i+1}@example.com`,
        password: hashedPassword,
        countryCode: '+91',
        phoneNumber: `98765${i}${j}${i}${j}${i}`,
        role: 'staff',
        isVerified: true,
        createdBy: managerIds[i],
        restaurantId: restaurantIds[i]
      });
    }
  }

  return {
    managerUsers,
    staffUsers
  };
};

module.exports = {
  createUsers
};