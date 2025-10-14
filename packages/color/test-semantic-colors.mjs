import { generateTailwindSemanticColors } from './es/core/tailwindPalette.js';
import { generateThemePalettes } from './es/palette/darkMode.js';

console.log('Testing semantic color generation based on primary color:');
console.log('=========================================================\n');

// Test with different primary colors
const testColors = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' }
];

testColors.forEach(({ name, hex }) => {
  console.log(`Primary Color: ${name} (${hex})`);
  console.log('-'.repeat(40));
  
  // Generate semantic colors
  const semanticColors = generateTailwindSemanticColors(hex);
  
  // Show the base colors (shade 500 is usually the middle)
  console.log(`  Success: ${semanticColors.success['500']}`);
  console.log(`  Warning: ${semanticColors.warning['500']}`);
  console.log(`  Danger:  ${semanticColors.danger['500']}`);
  console.log(`  Info:    ${semanticColors.info['500']}`);
  console.log();
});

console.log('\nTesting complete theme generation with different primaries:');
console.log('===========================================================\n');

// Test theme generation
const blueTheme = generateThemePalettes('#3b82f6');
const purpleTheme = generateThemePalettes('#8b5cf6');

console.log('Blue Primary (#3b82f6) - Light Mode:');
console.log(`  Success[500]: ${blueTheme.light.success['500']}`);
console.log(`  Warning[500]: ${blueTheme.light.warning['500']}`);
console.log(`  Danger[500]:  ${blueTheme.light.danger['500']}`);

console.log('\nPurple Primary (#8b5cf6) - Light Mode:');
console.log(`  Success[500]: ${purpleTheme.light.success['500']}`);
console.log(`  Warning[500]: ${purpleTheme.light.warning['500']}`);
console.log(`  Danger[500]:  ${purpleTheme.light.danger['500']}`);

console.log('\nNote: The semantic colors now have consistent hues but saturation');
console.log('      is adjusted based on the primary color for better harmony.');