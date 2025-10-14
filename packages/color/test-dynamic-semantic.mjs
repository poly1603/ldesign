import { generateThemePalettes } from './es/palette/darkMode.js';

// Test with different primary colors
const testColors = [
  { name: 'Blue', hex: '#1976d2' },
  { name: 'Green', hex: '#4caf50' },
  { name: 'Purple', hex: '#9c27b0' },
  { name: 'Orange', hex: '#ff9800' },
  { name: 'Red', hex: '#f44336' }
];

console.log('Testing semantic color generation with different primary colors:\n');
console.log('=' .repeat(80));

testColors.forEach(({ name, hex }) => {
  console.log(`\nPrimary Color: ${name} (${hex})`);
  console.log('-'.repeat(40));
  
  const theme = generateThemePalettes(hex);
  
  // Show the base (500) color for each semantic palette
  const semanticColors = {
    'Success': theme.light.success['500'],
    'Warning': theme.light.warning['500'],
    'Danger': theme.light.danger['500'],
    'Info': theme.light.info['500']
  };
  
  Object.entries(semanticColors).forEach(([type, color]) => {
    console.log(`  ${type.padEnd(10)}: ${color}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ If colors above change based on primary color, semantic generation is working!');