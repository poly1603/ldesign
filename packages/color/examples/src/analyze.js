// Browser-based color analysis script
import { Color, generateTailwindScale, generateTailwindSemanticColors, generateTailwindGrayScale } from '@ldesign/color/core'

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
}

export function analyzeColors(primaryColor = '#1890ff') {
  const results = []
  
  // Analyze primary scale
  const primaryScale = generateTailwindScale(primaryColor, true)
  
  results.push('=== Primary Color Analysis ===')
  results.push('Original: ' + primaryColor)
  results.push('')
  results.push('Shade | Hex      | L (actual) | L (expected) | Diff')
  results.push('------|----------|------------|--------------|------')
  
  Object.entries(primaryScale).forEach(([shade, hex]) => {
    const color = new Color(hex)
    const hsl = color.toHSL()
    const actualL = Math.round(hsl.l)
    const expectedL = expectedLightness[shade]
    const diff = expectedL ? actualL - expectedL : '-'
    
    results.push(
      `${shade.padEnd(5)} | ${hex} | ${actualL.toString().padStart(10)} | ${(expectedL || '-').toString().padStart(12)} | ${diff.toString().padStart(5)}`
    )
  })
  
  // Check preservation
  results.push('')
  results.push('=== Color Preservation Check ===')
  const primary500 = primaryScale['500']
  results.push(`Original: ${primaryColor}`)
  results.push(`500 shade: ${primary500}`)
  results.push(`Match: ${primary500.toLowerCase() === primaryColor.toLowerCase()}`)
  
  // Analyze semantic colors
  const semanticColors = generateTailwindSemanticColors(primaryColor)
  
  Object.entries(semanticColors).forEach(([name, scale]) => {
    results.push('')
    results.push(`=== ${name.charAt(0).toUpperCase() + name.slice(1)} ===`)
    
    // Find the base (500) value
    const base500 = scale['500']
    if (base500) {
      const baseColor = new Color(base500)
      const baseHSL = baseColor.toHSL()
      results.push(`Base (500): ${base500} - H:${Math.round(baseHSL.h)} S:${Math.round(baseHSL.s)} L:${Math.round(baseHSL.l)}`)
    }
  })
  
  // Analyze gray scale
  results.push('')
  results.push('=== Gray Scale Analysis (14 shades) ===')
  
  const grayScale = generateTailwindGrayScale()
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
  }
  
  results.push('Shade | Hex      | L (actual) | S (actual) | Pure Gray?')
  results.push('------|----------|------------|------------|------------')
  
  Object.entries(grayScale).forEach(([shade, hex]) => {
    const color = new Color(hex)
    const hsl = color.toHSL()
    const actualL = Math.round(hsl.l)
    const actualS = Math.round(hsl.s)
    const isPureGray = actualS === 0
    
    results.push(
      `${shade.padEnd(5)} | ${hex} | ${actualL.toString().padStart(10)} | ${actualS.toString().padStart(10)} | ${isPureGray ? 'Yes' : 'No'}`
    )
  })
  
  return results
}

// Display results in console
export function runAnalysis() {
  const results = analyzeColors('#1890ff')
  )
  return results
}