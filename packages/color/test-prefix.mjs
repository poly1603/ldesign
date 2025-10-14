import { generateTailwindTheme, generateThemeCssVars } from './es/core/tailwindPalette.js'

// Test prefix auto-dash feature
console.log('Testing CSS prefix auto-dash feature...\n')

// Generate a simple theme
const theme = generateTailwindTheme('#3b82f6', {
  includeSemantics: false,
  includeGrays: false
})

// Test 1: Prefix without dash
console.log('Test 1: Prefix "td" (without dash):')
const css1 = generateThemeCssVars({ colors: { primary: theme.colors.primary } }, {
  prefix: 'td',
  suffixFormat: 'numeric'
})
console.log(css1.split('\n').slice(0, 3).join('\n'))
console.log('')

// Test 2: Prefix with dash already
console.log('Test 2: Prefix "app-" (with dash already):')
const css2 = generateThemeCssVars({ colors: { primary: theme.colors.primary } }, {
  prefix: 'app-',
  suffixFormat: 'numeric'
})
console.log(css2.split('\n').slice(0, 3).join('\n'))
console.log('')

// Test 3: No prefix
console.log('Test 3: No prefix:')
const css3 = generateThemeCssVars({ colors: { primary: theme.colors.primary } }, {
  suffixFormat: 'numeric'
})
console.log(css3.split('\n').slice(0, 3).join('\n'))
console.log('')

// Test 4: Custom names with prefix
console.log('Test 4: Prefix "td" with custom name mapping:')
const css4 = generateThemeCssVars({ colors: { primary: theme.colors.primary } }, {
  prefix: 'td',
  suffixFormat: 'tailwind',
  nameMap: { primary: 'brand' }
})
console.log(css4.split('\n').slice(0, 3).join('\n'))

console.log('\n✅ All tests complete!')