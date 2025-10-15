import { ThemeManager } from './src/index'
import { generateColorPalette } from './src/palette/colorScale'
import { generateThemedCssVariables } from './src/palette/cssVariables'

// Test the ThemeManager
const manager = new ThemeManager({
  prefix: 'ld',
  includeSemantics: true,
  includeGrays: true,
  autoApply: false  // Disable auto-apply to avoid DOM access
})

// Generate palette directly without DOM operations
const palette = generateColorPalette('#1677ff', { mode: 'light' })
console.log('Light Mode Palette:', palette.primary.slice(0, 3))

// Generate CSS for light mode
console.log('\n=== Light Mode CSS Variables ===')
const lightCSS = manager.generateCSS()
const lightVars = lightCSS.match(/--[\w-]+:\s*[^;]+/g)?.slice(0, 20)
lightVars?.forEach(v => console.log(v))

// Switch to dark mode
manager.setDarkMode(true)
console.log('\n=== Dark Mode CSS Variables ===')
const darkCSS = manager.generateCSS()
const darkVars = darkCSS.match(/--[\w-]+:\s*[^;]+/g)?.slice(0, 20)
darkVars?.forEach(v => console.log(v))

// Check semantic variables
console.log('\n=== Semantic Variables (Dark Mode) ===')
const semanticVars = darkCSS.match(/--ld-color-(?:bg|text|border)[^:]+:\s*[^;]+/g)?.slice(0, 10)
semanticVars?.forEach(v => console.log(v))

// Test gradient generation
console.log('\n=== Gradient Variables ===')
const gradientVars = darkCSS.match(/--ld-gradient[^:]+:\s*[^;]+/g)?.slice(0, 5)
gradientVars?.forEach(v => console.log(v))