// Script to analyze the generated color scales
const { Color } = require('./es/core/Color.js');
const { generateTailwindScale, generateTailwindSemanticColors, generateTailwindGrayScale } = require('./es/core/tailwindPalette.js');

// Expected lightness values from tailwindcss-palette-generator
const expectedLightness = {
  '50': 98,
  '100': 95,
  '200': 90,
  '300': 82,
  '400': 64,
  '500': 46,
  '600': 33,
  '700': 24,
  '800': 14,
  '900': 7,
  '950': 4,
  '1000': 2
};

function analyzeColorScale(name, scale) {
  console.log(`\n=== ${name} ===`);
  console.log('Shade | Hex      | L (actual) | L (expected) | Diff');
  console.log('------|----------|------------|--------------|------');
  
  Object.entries(scale).forEach(([shade, hex]) => {
    const color = new Color(hex);
    const hsl = color.toHSL();
    const actualL = Math.round(hsl.l);
    const expectedL = expectedLightness[shade];
    const diff = expectedL ? actualL - expectedL : '-';
    
    console.log(
      `${shade.padEnd(5)} | ${hex} | ${actualL.toString().padStart(10)} | ${(expectedL || '-').toString().padStart(12)} | ${diff.toString().padStart(5)}`
    );
  });
}

// Test with primary color #1890ff
const primaryColor = '#1890ff';
console.log(`\nAnalyzing color scales for primary color: ${primaryColor}`);

// Analyze primary scale
const primaryScale = generateTailwindScale(primaryColor, true);
analyzeColorScale('Primary', primaryScale);

// Analyze semantic colors
const semanticColors = generateTailwindSemanticColors(primaryColor);
Object.entries(semanticColors).forEach(([name, scale]) => {
  analyzeColorScale(name.charAt(0).toUpperCase() + name.slice(1), scale);
});

// Analyze gray scale
const grayScale = generateTailwindGrayScale();
console.log('\n=== Gray Scale (14 shades) ===');
console.log('Shade | Hex      | L (actual) | S (actual)');
console.log('------|----------|------------|------------');

const grayExpectedLightness = {
  '50': 98,
  '100': 95,
  '150': 93,
  '200': 88,
  '300': 80,
  '400': 71,
  '500': 60,
  '600': 48,
  '700': 37,
  '800': 27,
  '850': 20,
  '900': 14,
  '950': 9,
  '1000': 5
};

Object.entries(grayScale).forEach(([shade, hex]) => {
  const color = new Color(hex);
  const hsl = color.toHSL();
  const actualL = Math.round(hsl.l);
  const actualS = Math.round(hsl.s);
  const expectedL = grayExpectedLightness[shade];
  
  console.log(
    `${shade.padEnd(5)} | ${hex} | ${actualL.toString().padStart(10)} (${expectedL}) | ${actualS.toString().padStart(10)}`
  );
});

// Additional check: verify that 500 shade contains the original color
console.log('\n=== Preservation Check ===');
const primary500 = primaryScale['500'];
console.log(`Original color: ${primaryColor}`);
console.log(`500 shade:      ${primary500}`);
console.log(`Match: ${primary500.toLowerCase() === primaryColor.toLowerCase()}`);

// Check HSL values of the original vs generated
const originalHSL = new Color(primaryColor).toHSL();
const generated500HSL = new Color(primary500).toHSL();
console.log(`\nOriginal HSL: H=${Math.round(originalHSL.h)}, S=${Math.round(originalHSL.s)}, L=${Math.round(originalHSL.l)}`);
console.log(`500 HSL:      H=${Math.round(generated500HSL.h)}, S=${Math.round(generated500HSL.s)}, L=${Math.round(generated500HSL.l)}`);