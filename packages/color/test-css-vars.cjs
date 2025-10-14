#!/usr/bin/env node

/**
 * Test script to demonstrate CSS variable configuration options
 * Using CommonJS with dynamic import for ES modules
 */

async function runTest() {
  // Import directly from TypeScript source (requires ts-node or tsx)
  const module = await import('./src/core/tailwindPalette.js').catch(async () => {
    // If direct TS import fails, try the built version
    return await import('./es/core/tailwindPalette.js');
  }).catch(async () => {
    // Try importing with tsx loader
    console.log('Attempting to use tsx loader...');
    const { register } = require('tsx');
    register();
    return await import('./src/core/tailwindPalette.ts');
  });

  const {
    generateTailwindTheme,
    generateThemeCssVars,
    generatePaletteCssVars
  } = module;

  const primaryColor = '#1890ff';

  console.log('🎨 Testing CSS Variable Configuration\n');
  console.log('=====================================\n');

  // Generate a theme
  const theme = generateTailwindTheme(primaryColor, {
    includeSemantics: true,
    includeGrays: true,
    preserveInput: true
  });

  // Prepare theme object for CSS generation
  const themeForCss = {
    colors: theme.colors,
    grays: theme.grays
  };

  // Test 1: Default configuration (no prefix, Tailwind suffix format)
  console.log('1️⃣ Default Configuration (No prefix, Tailwind format):');
  console.log('--------------------------------------------------');
  const defaultVars = generatePaletteCssVars(theme.colors.primary, 'primary');
  console.log(defaultVars.split('\n').slice(0, 3).join('\n') + '\n  ...\n');

  // Test 2: With custom prefix
  console.log('2️⃣ With Custom Prefix (tw-):');
  console.log('---------------------------');
  const prefixedVars = generatePaletteCssVars(theme.colors.primary, 'primary', {
    prefix: 'tw-'
  });
  console.log(prefixedVars.split('\n').slice(0, 3).join('\n') + '\n  ...\n');

  // Test 3: With numeric suffix format
  console.log('3️⃣ Numeric Suffix Format (1, 2, 3...):');
  console.log('-------------------------------------');
  const numericVars = generatePaletteCssVars(theme.colors.primary, 'primary', {
    suffixFormat: 'numeric'
  });
  console.log(numericVars.split('\n').slice(0, 3).join('\n') + '\n  ...\n');

  // Test 4: Combined - prefix + numeric format
  console.log('4️⃣ Combined (app- prefix + numeric format):');
  console.log('------------------------------------------');
  const combinedVars = generatePaletteCssVars(theme.colors.primary, 'primary', {
    prefix: 'app-',
    suffixFormat: 'numeric'
  });
  console.log(combinedVars.split('\n').slice(0, 3).join('\n') + '\n  ...\n');

  // Test 5: Full theme with custom configuration
  console.log('5️⃣ Full Theme CSS Variables:');
  console.log('---------------------------');
  const fullThemeVars = generateThemeCssVars(themeForCss, {
    prefix: 'theme-',
    suffixFormat: 'tailwind'
  });

  // Show a sample of each color category
  const lines = fullThemeVars.split('\n');
  const categories = ['primary', 'success', 'warning', 'danger', 'info', 'gray'];

  categories.forEach(cat => {
    const catLines = lines.filter(line => line.includes(`--theme-${cat}-`));
    if (catLines.length > 0) {
      console.log(`\n  /* ${cat} */`);
      console.log(`  ${catLines[0]}`);
      console.log(`  ${catLines[1]}`);
      console.log('  ...');
    }
  });

  console.log('\n\n✅ CSS Variable Configuration Test Complete!\n');

  // Display comparison table
  console.log('📊 Configuration Comparison:');
  console.log('================================');
  console.log('| Format     | Prefix | Output Example        |');
  console.log('|------------|--------|----------------------|');
  console.log('| Tailwind   | (none) | --primary-500         |');
  console.log('| Tailwind   | tw-    | --tw-primary-500      |');
  console.log('| Numeric    | (none) | --primary-6           |');
  console.log('| Numeric    | app-   | --app-primary-6       |');
  console.log('================================\n');
}

// Run the test
runTest().catch(console.error);