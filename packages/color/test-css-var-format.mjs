import { generateTailwindScale, generatePaletteCssVars, generateThemeCssVars } from './es/core/tailwindPalette.js';

// Test with primary color
const primaryPalette = generateTailwindScale('#3b82f6');
console.log('Testing CSS variable formats with "-color":');
console.log('===========================================\n');

// Test with default Tailwind suffix format
console.log('1. Tailwind suffix format (50, 100, 200...):\n');
console.log(generatePaletteCssVars(primaryPalette, 'primary'));
console.log('\n');

// Test with numeric suffix format
console.log('2. Numeric suffix format (1, 2, 3...):\n');
console.log(generatePaletteCssVars(primaryPalette, 'primary', { suffixFormat: 'numeric' }));
console.log('\n');

// Test with custom prefix and Tailwind suffix
console.log('3. With custom prefix "tw-" and Tailwind suffix:\n');
console.log(generatePaletteCssVars(primaryPalette, 'primary', { prefix: 'tw-' }));
console.log('\n');

// Test with custom prefix and numeric suffix
console.log('4. With custom prefix "app-" and numeric suffix:\n');
console.log(generatePaletteCssVars(primaryPalette, 'primary', { prefix: 'app-', suffixFormat: 'numeric' }));
console.log('\n');

// Test complete theme
const theme = {
  colors: {
    primary: generateTailwindScale('#3b82f6'),
    success: generateTailwindScale('#10b981'),
    warning: generateTailwindScale('#f59e0b')
  },
  grays: generateTailwindScale('#64748b')
};

console.log('5. Complete theme with "-color" in all variables:\n');
console.log(generateThemeCssVars(theme, { prefix: 'theme-', suffixFormat: 'numeric' }));