// Run this file with: node create-test-dirs.js
const fs = require('fs');
const path = require('path');
const dirs = [
  'frontend/src/test',
  'frontend/src/utils/__tests__',
  'frontend/src/services/__tests__'
];
dirs.forEach(d => {
  fs.mkdirSync(path.resolve(__dirname, d), { recursive: true });
  console.log('Created:', d);
});
