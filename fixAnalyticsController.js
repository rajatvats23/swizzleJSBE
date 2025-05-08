// fixAnalyticsController.js
// Run with: node fixAnalyticsController.js
const fs = require('fs');
const path = require('path');

// Path to your analytics controller
const controllerPath = './controllers/analyticsController.js';

// Function to fix the file
function fixFile() {
  if (!fs.existsSync(controllerPath)) {
    console.error(`\x1b[31mFile not found: ${controllerPath}\x1b[0m`);
    console.log('Please provide the correct path to your analyticsController.js file.');
    return;
  }

  // Read the file
  let content = fs.readFileSync(controllerPath, 'utf8');
  
  // Create a backup
  const backupPath = `${controllerPath}.backup`;
  fs.writeFileSync(backupPath, content);
  console.log(`\x1b[32mBackup created at: ${backupPath}\x1b[0m`);
  
  // Replace all occurrences
  const pattern = /mongoose\.Types\.ObjectId\(([^)]+)\)/g;
  const fixedContent = content.replace(pattern, 'new mongoose.Types.ObjectId($1)');
  
  // Count the replacements
  const originalMatches = content.match(pattern) || [];
  const fixedMatches = fixedContent.match(/new mongoose\.Types\.ObjectId\([^)]+\)/g) || [];
  
  // Write the fixed content
  fs.writeFileSync(controllerPath, fixedContent);
  
  console.log(`\x1b[32mFixed ${originalMatches.length} occurrences of mongoose.Types.ObjectId without 'new'.\x1b[0m`);
  console.log(`\x1b[32mThe file now has ${fixedMatches.length} properly constructed ObjectId instances.\x1b[0m`);
  console.log('\x1b[33mPlease restart your server for changes to take effect.\x1b[0m');
}

// Run the fix
fixFile();