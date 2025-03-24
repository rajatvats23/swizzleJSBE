// checkFiles.js - A simple script to verify file existence and paths
const fs = require('fs');
const path = require('path');

console.log('Current directory:', __dirname);
console.log('Parent directory:', path.resolve(__dirname, '..'));

// Check if data files exist
const dataFiles = [
  'restaurants.js',
  'users.js',
  'menus.js',
  'categories.js',
  'tags.js',
  'addons.js',
  'products.js'
];

console.log('\nChecking data files in current directory:');
dataFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`- ${file}: ${exists ? 'Found ✓' : 'Missing ✗'}`);
});

// Check if model files exist
const modelFiles = [
  'restaurantModel.js',
  'userModel.js',
  'menuModel.js',
  'categoryModel.js',
  'tagModel.js',
  'addonModel.js',
  'productModel.js'
];

const modelsDir = path.join(__dirname, '..', 'models');
console.log('\nChecking model files in models directory:');
console.log('Models directory path:', modelsDir);
console.log('Models directory exists:', fs.existsSync(modelsDir) ? 'Yes ✓' : 'No ✗');

if (fs.existsSync(modelsDir)) {
  modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`- ${file}: ${exists ? 'Found ✓' : 'Missing ✗'}`);
  });
}

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
console.log('\nEnvironment file:');
console.log(`- .env file: ${fs.existsSync(envPath) ? 'Found ✓' : 'Missing ✗'}`);

if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasMongoUri = envContent.includes('MONGO_URI');
    console.log(`- MONGO_URI in .env: ${hasMongoUri ? 'Found ✓' : 'Missing ✗'}`);
  } catch (error) {
    console.log('- Error reading .env file:', error.message);
  }
}

console.log('\nThis information can help identify issues with file paths and configuration.');