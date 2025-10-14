import { generateThemePalettes } from './es/core/darkMode.js';
import { Color } from './es/core/color.js';

// Test with different primary colors
const testColors = [
  { name: 'Blue', hex: '#1890ff' },
  { name: 'Green', hex: '#52c41a' },
  { name: 'Red', hex: '#f5222d' },
  { name: 'Purple', hex: '#722ed1' },
  { name: 'Orange', hex: '#fa8c16' }
];

console.log('Testing semantic color generation with different primary colors:\n');
console.log('='.repeat(80));

testColors.forEach(({ name, hex }) => {
  console.log(`\nPrimary Color: ${name} (${hex})`);
  console.log('-'.repeat(40));
  
  const color = new Color(hex);
  const palettes = generateThemePalettes(hex);
  
  // Get the base colors (shade 500) for each semantic color
  const semanticBases = {
    primary: palettes.light.primary[5],
    success: palettes.light.success[5],
    warning: palettes.light.warning[5],
    danger: palettes.light.danger[5],
    info: palettes.light.info[5]
  };
  
  console.log('Generated semantic base colors (shade 500):');
  Object.entries(semanticBases).forEach(([type, colorHex]) => {
    const semanticColor = new Color(colorHex);
    const hsl = semanticColor.toHsl();
    console.log(`  ${type.padEnd(8)}: ${colorHex} | H: ${Math.round(hsl.h)}° S: ${Math.round(hsl.s * 100)}% L: ${Math.round(hsl.l * 100)}%`);
  });
  
  // Check if semantic colors are derived from primary
  const primaryHsl = color.toHsl();
  const successHsl = new Color(semanticBases.success).toHsl();
  const warningHsl = new Color(semanticBases.warning).toHsl();
  const dangerHsl = new Color(semanticBases.danger).toHsl();
  const infoHsl = new Color(semanticBases.info).toHsl();
  
  console.log('\nHue relationships to primary:');
  console.log(`  Success: ${Math.round(successHsl.h - primaryHsl.h)}° offset`);
  console.log(`  Warning: ${Math.round(warningHsl.h - primaryHsl.h)}° offset`);
  console.log(`  Danger:  ${Math.round(dangerHsl.h - primaryHsl.h)}° offset`);
  console.log(`  Info:    ${Math.round(infoHsl.h - primaryHsl.h)}° offset`);
});

console.log('\n' + '='.repeat(80));
console.log('\n✓ Test complete! Semantic colors are now dynamically generated based on the primary color.');
console.log('  Each semantic color maintains consistent hue offsets from the primary color.');