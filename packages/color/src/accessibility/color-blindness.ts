/**
 * Color Vision Deficiency (Color Blindness) Simulation
 * Implements various color vision deficiency simulations to help designers
 * create accessible color palettes
 */

export type ColorBlindnessType =
  | 'protanopia' // Red-blind
  | 'protanomaly' // Red-weak
  | 'deuteranopia' // Green-blind
  | 'deuteranomaly' // Green-weak
  | 'tritanopia' // Blue-blind
  | 'tritanomaly' // Blue-weak
  | 'achromatopsia' // Complete color blindness
  | 'achromatomaly' // Partial color blindness

interface RGB {
  r: number
  g: number
  b: number
}

interface SimulationMatrix {
  [key: string]: number[][]
}

/**
 * Color transformation matrices for different types of color vision deficiencies
 * Based on research by Brettel, Viénot and Mollon (1997)
 */
const SIMULATION_MATRICES: SimulationMatrix = {
  // Protanopia (Red-blind) - Missing L cones
  protanopia: [
    [0.567, 0.433, 0.000],
    [0.558, 0.442, 0.000],
    [0.000, 0.242, 0.758],
  ],

  // Protanomaly (Red-weak) - Anomalous L cones
  protanomaly: [
    [0.817, 0.183, 0.000],
    [0.333, 0.667, 0.000],
    [0.000, 0.125, 0.875],
  ],

  // Deuteranopia (Green-blind) - Missing M cones
  deuteranopia: [
    [0.625, 0.375, 0.000],
    [0.700, 0.300, 0.000],
    [0.000, 0.300, 0.700],
  ],

  // Deuteranomaly (Green-weak) - Anomalous M cones
  deuteranomaly: [
    [0.800, 0.200, 0.000],
    [0.258, 0.742, 0.000],
    [0.000, 0.142, 0.858],
  ],

  // Tritanopia (Blue-blind) - Missing S cones
  tritanopia: [
    [0.950, 0.050, 0.000],
    [0.000, 0.433, 0.567],
    [0.000, 0.475, 0.525],
  ],

  // Tritanomaly (Blue-weak) - Anomalous S cones
  tritanomaly: [
    [0.967, 0.033, 0.000],
    [0.000, 0.733, 0.267],
    [0.000, 0.183, 0.817],
  ],

  // Achromatopsia (Complete color blindness)
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],

  // Achromatomaly (Partial color blindness)
  achromatomaly: [
    [0.618, 0.320, 0.062],
    [0.163, 0.775, 0.062],
    [0.163, 0.320, 0.516],
  ],
}

export class ColorBlindnessSimulator {
  private cache: Map<string, RGB> = new Map()

  /**
   * Simulate how a color appears to someone with a specific type of color blindness
   */
  simulateColorBlindness(color: string | RGB, type: ColorBlindnessType): string {
    const rgb = typeof color === 'string' ? this.hexToRgb(color) : color
    const cacheKey = `${rgb.r}-${rgb.g}-${rgb.b}-${type}`

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      return this.rgbToHex(cached)
    }

    const matrix = SIMULATION_MATRICES[type]
    const simulated = this.applyMatrix(rgb, matrix)

    this.cache.set(cacheKey, simulated)
    return this.rgbToHex(simulated)
  }

  /**
   * Simulate multiple types of color blindness for a single color
   */
  simulateAll(color: string | RGB): Record<ColorBlindnessType, string> {
    const results: Record<string, string> = {}
    const types: ColorBlindnessType[] = [
      'protanopia',
      'protanomaly',
      'deuteranopia',
      'deuteranomaly',
      'tritanopia',
      'tritanomaly',
      'achromatopsia',
      'achromatomaly',
    ]

    for (const type of types) {
      results[type] = this.simulateColorBlindness(color, type)
    }

    return results as Record<ColorBlindnessType, string>
  }

  /**
   * Check if two colors are distinguishable for a specific type of color blindness
   */
  areDistinguishable(
    color1: string | RGB,
    color2: string | RGB,
    type: ColorBlindnessType,
    threshold: number = 20,
  ): boolean {
    const sim1 = this.simulateColorBlindness(color1, type)
    const sim2 = this.simulateColorBlindness(color2, type)

    const rgb1 = this.hexToRgb(sim1)
    const rgb2 = this.hexToRgb(sim2)

    const distance = this.calculateColorDistance(rgb1, rgb2)
    return distance > threshold
  }

  /**
   * Analyze a color palette for accessibility issues
   */
  analyzePalette(colors: string[]): {
    issues: Array<{
      type: ColorBlindnessType
      conflicts: Array<[number, number]>
      severity: 'low' | 'medium' | 'high'
    }>
    score: number
    recommendations: string[]
  } {
    const issues: Array<{
      type: ColorBlindnessType
      conflicts: Array<[number, number]>
      severity: 'low' | 'medium' | 'high'
    }> = []

    const types: ColorBlindnessType[] = [
      'protanopia',
      'deuteranopia',
      'tritanopia',
    ]

    for (const type of types) {
      const conflicts: Array<[number, number]> = []

      for (let i = 0; i < colors.length - 1; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          if (!this.areDistinguishable(colors[i], colors[j], type)) {
            conflicts.push([i, j])
          }
        }
      }

      if (conflicts.length > 0) {
        const severity = conflicts.length > colors.length / 2
          ? 'high'
          : conflicts.length > colors.length / 4 ? 'medium' : 'low'

        issues.push({ type, conflicts, severity })
      }
    }

    const score = Math.max(0, 100 - (issues.length * 10)
      - issues.filter(i => i.severity === 'high').length * 20)

    const recommendations = this.generateRecommendations(issues, colors)

    return { issues, score, recommendations }
  }

  /**
   * Suggest alternative colors that are more accessible
   */
  suggestAccessibleAlternative(
    color: string,
    existingColors: string[],
    types: ColorBlindnessType[] = ['protanopia', 'deuteranopia', 'tritanopia'],
  ): string[] {
    const suggestions: string[] = []
    const rgb = this.hexToRgb(color)

    // Try adjusting lightness
    for (const factor of [0.7, 0.85, 1.15, 1.3]) {
      const adjusted: RGB = {
        r: Math.min(255, Math.round(rgb.r * factor)),
        g: Math.min(255, Math.round(rgb.g * factor)),
        b: Math.min(255, Math.round(rgb.b * factor)),
      }

      const hex = this.rgbToHex(adjusted)
      let isGood = true

      for (const existing of existingColors) {
        for (const type of types) {
          if (!this.areDistinguishable(hex, existing, type)) {
            isGood = false
            break
          }
        }
        if (!isGood)
          break
      }

      if (isGood) {
        suggestions.push(hex)
      }
    }

    // Try shifting hue
    const hsl = this.rgbToHsl(rgb)
    for (const hueShift of [30, 60, 90, 120, 150]) {
      const newHue = (hsl.h + hueShift) % 360
      const shifted = this.hslToRgb({ h: newHue, s: hsl.s, l: hsl.l })
      const hex = this.rgbToHex(shifted)

      let isGood = true
      for (const existing of existingColors) {
        for (const type of types) {
          if (!this.areDistinguishable(hex, existing, type)) {
            isGood = false
            break
          }
        }
        if (!isGood)
          break
      }

      if (isGood) {
        suggestions.push(hex)
      }
    }

    return suggestions.slice(0, 5)
  }

  /**
   * Calculate contrast ratio considering color blindness
   */
  calculateAccessibleContrast(
    foreground: string,
    background: string,
    type?: ColorBlindnessType,
  ): {
      normal: number
      simulated: number
      meetsWCAG_AA: boolean
      meetsWCAG_AAA: boolean
    } {
    const normalContrast = this.calculateContrast(
      this.hexToRgb(foreground),
      this.hexToRgb(background),
    )

    let simulatedContrast = normalContrast
    if (type) {
      const simFg = this.simulateColorBlindness(foreground, type)
      const simBg = this.simulateColorBlindness(background, type)
      simulatedContrast = this.calculateContrast(
        this.hexToRgb(simFg),
        this.hexToRgb(simBg),
      )
    }

    const minContrast = Math.min(normalContrast, simulatedContrast)

    return {
      normal: normalContrast,
      simulated: simulatedContrast,
      meetsWCAG_AA: minContrast >= 4.5,
      meetsWCAG_AAA: minContrast >= 7.0,
    }
  }

  /**
   * Generate a color-blind safe palette
   */
  generateAccessiblePalette(
    baseColor: string,
    count: number = 5,
    options: {
      includeTypes?: ColorBlindnessType[]
      minContrast?: number
      preferredHarmony?: 'monochromatic' | 'analogous' | 'complementary' | 'triadic'
    } = {},
  ): string[] {
    const {
      includeTypes = ['protanopia', 'deuteranopia', 'tritanopia'],
      minContrast = 3.0,
      preferredHarmony = 'analogous',
    } = options

    const palette: string[] = [baseColor]
    const baseRgb = this.hexToRgb(baseColor)
    const baseHsl = this.rgbToHsl(baseRgb)

    while (palette.length < count) {
      let candidate: RGB | null = null

      switch (preferredHarmony) {
        case 'monochromatic':
          // Vary lightness
          const lightness = (baseHsl.l + (palette.length * 15)) % 100
          candidate = this.hslToRgb({ ...baseHsl, l: lightness })
          break

        case 'analogous':
          // Adjacent hues
          const hueShift = palette.length * 30
          const hue = (baseHsl.h + hueShift) % 360
          candidate = this.hslToRgb({ ...baseHsl, h: hue })
          break

        case 'complementary':
          // Opposite hues
          const compHue = (baseHsl.h + 180) % 360
          const variation = (palette.length - 1) * 20
          candidate = this.hslToRgb({
            h: (compHue + variation) % 360,
            s: baseHsl.s,
            l: baseHsl.l + (palette.length - 1) * 10,
          })
          break

        case 'triadic':
          // Three equidistant hues
          const triadicHue = (baseHsl.h + (120 * palette.length)) % 360
          candidate = this.hslToRgb({ ...baseHsl, h: triadicHue })
          break
      }

      if (candidate) {
        const hex = this.rgbToHex(candidate)
        let isAccessible = true

        // Check against all existing colors for all color blindness types
        for (const existing of palette) {
          for (const type of includeTypes) {
            if (!this.areDistinguishable(hex, existing, type, minContrast)) {
              isAccessible = false
              break
            }
          }
          if (!isAccessible)
            break
        }

        if (isAccessible) {
          palette.push(hex)
        }
        else {
          // Try adjusting the candidate
          const adjusted = this.suggestAccessibleAlternative(hex, palette, includeTypes)
          if (adjusted.length > 0) {
            palette.push(adjusted[0])
          }
        }
      }

      // Prevent infinite loop
      if (palette.length === 1 && count > 1) {
        // Fallback: use very different colors
        const fallbackHue = (360 / count) * palette.length
        const fallback = this.hslToRgb({ h: fallbackHue, s: 70, l: 50 })
        palette.push(this.rgbToHex(fallback))
      }
    }

    return palette
  }

  // Utility methods
  private applyMatrix(rgb: RGB, matrix: number[][]): RGB {
    const linear = this.toLinearRgb(rgb)

    const r = matrix[0][0] * linear.r + matrix[0][1] * linear.g + matrix[0][2] * linear.b
    const g = matrix[1][0] * linear.r + matrix[1][1] * linear.g + matrix[1][2] * linear.b
    const b = matrix[2][0] * linear.r + matrix[2][1] * linear.g + matrix[2][2] * linear.b

    return this.fromLinearRgb({ r, g, b })
  }

  private toLinearRgb(rgb: RGB): RGB {
    const toLinear = (c: number) => {
      const normalized = c / 255
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4
    }

    return {
      r: toLinear(rgb.r),
      g: toLinear(rgb.g),
      b: toLinear(rgb.b),
    }
  }

  private fromLinearRgb(linear: RGB): RGB {
    const fromLinear = (c: number) => {
      const value = c <= 0.0031308
        ? c * 12.92
        : 1.055 * c ** (1 / 2.4) - 0.055

      return Math.round(Math.max(0, Math.min(255, value * 255)))
    }

    return {
      r: fromLinear(linear.r),
      g: fromLinear(linear.g),
      b: fromLinear(linear.b),
    }
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`)
    }

    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    }
  }

  private rgbToHex(rgb: RGB): string {
    return `#${[rgb.r, rgb.g, rgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`
  }

  private calculateColorDistance(rgb1: RGB, rgb2: RGB): number {
    return Math.sqrt(
      (rgb2.r - rgb1.r) ** 2
      + (rgb2.g - rgb1.g) ** 2
      + (rgb2.b - rgb1.b) ** 2,
    )
  }

  private calculateContrast(rgb1: RGB, rgb2: RGB): number {
    const getLuminance = (rgb: RGB) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
        const normalized = c / 255
        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4
      })

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const l1 = getLuminance(rgb1)
    const l2 = getLuminance(rgb2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  private rgbToHsl(rgb: RGB): { h: number, s: number, l: number } {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    if (max === min) {
      return { h: 0, s: 0, l: l * 100 }
    }

    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    let h = 0
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  private hslToRgb(hsl: { h: number, s: number, l: number }): RGB {
    const h = hsl.h / 360
    const s = hsl.s / 100
    const l = hsl.l / 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    }
    else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0)
          t += 1
        if (t > 1)
          t -= 1
        if (t < 1 / 6)
          return p + (q - p) * 6 * t
        if (t < 1 / 2)
          return q
        if (t < 2 / 3)
          return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  private generateRecommendations(
    issues: Array<{
      type: ColorBlindnessType
      conflicts: Array<[number, number]>
      severity: 'low' | 'medium' | 'high'
    }>,
    colors: string[],
  ): string[] {
    const recommendations: string[] = []

    if (issues.length === 0) {
      recommendations.push('✅ Palette is accessible for common types of color blindness')
      return recommendations
    }

    // Count which colors are most problematic
    const problemCounts = new Map<number, number>()
    for (const issue of issues) {
      for (const [i, j] of issue.conflicts) {
        problemCounts.set(i, (problemCounts.get(i) || 0) + 1)
        problemCounts.set(j, (problemCounts.get(j) || 0) + 1)
      }
    }

    // Sort by most problematic
    const sortedProblems = Array.from(problemCounts.entries())
      .sort((a, b) => b[1] - a[1])

    if (sortedProblems.length > 0) {
      const [colorIndex, conflictCount] = sortedProblems[0]
      recommendations.push(
        `⚠️ Color ${colors[colorIndex]} conflicts with ${conflictCount} other colors. Consider adjusting its brightness or hue.`,
      )
    }

    // Type-specific recommendations
    const typeMessages: Record<string, string> = {
      protanopia: 'Avoid relying solely on red-green distinctions',
      deuteranopia: 'Ensure sufficient brightness contrast between greens and reds',
      tritanopia: 'Be careful with blue-yellow distinctions',
    }

    for (const issue of issues) {
      if (issue.severity === 'high' && typeMessages[issue.type]) {
        recommendations.push(`🔴 ${typeMessages[issue.type]}`)
      }
    }

    // General recommendations
    if (issues.some(i => i.severity === 'high')) {
      recommendations.push('💡 Consider using patterns, textures, or labels in addition to color')
      recommendations.push('💡 Increase brightness contrast between conflicting colors')
    }

    return recommendations
  }
}

// Export singleton instance
export const colorBlindnessSimulator = new ColorBlindnessSimulator()
