// findObjectIdIssues.js
// Run with: node findObjectIdIssues.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to scan
const directories = [
  './controllers',
  './models',
  './routes',
  './middleware'
];

// Pattern to search for
const pattern = /mongoose\.Types\.ObjectId\([^)]+\)/g;

// Function to recursively scan directories
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (stat.isFile() && file.endsWith('.js')) {
      checkFile(filePath);
    }
  }
}

// Function to check a file for the pattern
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(pattern);
  
  if (matches && matches.length > 0) {
    console.log(`\x1b[33mFound ${matches.length} potential issue(s) in ${filePath}:\x1b[0m`);
    
    // Show a snippet of each match with line number
    const lines = content.split('\n');
    for (const match of matches) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(match)) {
          console.log(`  Line ${i + 1}: \x1b[31m${lines[i].trim()}\x1b[0m`);
          
          // Suggest fix
          const fixed = lines[i].replace(
            pattern, 
            (m) => `new ${m}`
          );
          console.log(`  Fix: \x1b[32m${fixed.trim()}\x1b[0m`);
          console.log();
          break;
        }
      }
    }
  }
}

// Function to check a specific file
function checkSpecificFile(filePath) {
  if (fs.existsSync(filePath)) {
    checkFile(filePath);
  } else {
    console.log(`\x1b[31mFile not found: ${filePath}\x1b[0m`);
  }
}

// Parse command line arguments
if (process.argv.length > 2) {
  // Check specific file
  checkSpecificFile(process.argv[2]);
} else {
  // Scan all directories
  console.log('Scanning for mongoose.Types.ObjectId usage without "new" keyword...\n');
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      scanDirectory(dir);
    }
  }
  
  console.log('\nScan complete. Fix the issues by adding "new" before mongoose.Types.ObjectId');
  console.log('After fixing, restart your server for changes to take effect.');
}