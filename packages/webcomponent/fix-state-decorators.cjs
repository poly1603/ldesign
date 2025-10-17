const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix @State() declarations
function fixStateDecorators(content) {
  // Match @State() declarations with definite assignment assertion and initializer
  // Pattern: @State() propertyName!: type = value
  const pattern = /@State\(\)\s+(\w+)!:\s*([^=]+?)\s*=\s*([^;]+);/g;
  
  return content.replace(pattern, (match, propName, type, value) => {
    // Remove the ! and keep the rest
    return `@State() ${propName}: ${type.trim()} = ${value.trim()};`;
  });
}

// Get all TypeScript files
const tsFiles = glob.sync('src/components/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true
});

let fixedCount = 0;

tsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = fixStateDecorators(content);
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});

console.log(`\nFixed ${fixedCount} files.`);