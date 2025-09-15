/**
 * Color Harmony Analyzer
 * Implements color theory principles to analyze and generate harmonious color combinations
 */

export type HarmonyType = 
  | 'monochromatic'     // Single hue with varying saturation/lightness
  | 'analogous'         // Adjacent colors on the wheel
  | 'complementary'     // Opposite colors
  | 'split-complementary' // Base + two adjacent to complement
  | 'triadic'          // Three equidistant colors
  | 'tetradic'         // Four colors in two complementary pairs
  | 'square'           // Four equidistant colors
  | 'double-complementary' // Two complementary pairs

export interface HSL {
  h: number  // Hue: 0-360
  s: number  // Saturation: 0-100
  l: number  // Lightness: 0-100
}

export interface RGB {
  r: number  // Red: 0-255
  g: number  // Green: 0-255
  b: number  // Blue: 0-255
}

export interface HarmonyAnalysis {
  type: HarmonyType
  score: number  // 0-100
  balance: {
    hue: number
    saturation: number
    lightness: number
  }
  temperature: 'cool' | 'warm' | 'neutral'
  mood: string[]
  suggestions: string[]
}

export interface ColorRelationship {
  color1: string
  color2: string
  angle: number  // Angle between colors on wheel
  relationship: string
  harmony: number  // 0-1 harmony score
}

export class ColorHarmonyAnalyzer {
  private readonly GOLDEN_RATIO = 0.618033988749895
  private readonly moods: Record<string, { hueRanges: [number, number][], saturations: [number, number], lightness: [number, number] }> = {
    energetic: {
      hueRanges: [[0, 60], [300, 360]],  // Reds, oranges, magentas
      saturations: [70, 100],
      lightness: [40, 70]
    },
    calm: {
      hueRanges: [[180, 260]],  // Blues, cyans
      saturations: [30, 60],
      lightness: [50, 80]
    },
    natural: {
      hueRanges: [[60, 150]],  // Greens, yellow-greens
      saturations: [30, 70],
      lightness: [30, 70]
    },
    elegant: {
      hueRanges: [[0, 360]],  // Any hue
      saturations: [10, 40],
      lightness: [20, 40]
    },
    playful: {
      hueRanges: [[0, 360]],  // Any hue
      saturations: [60, 100],
      lightness: [50, 80]
    },
    sophisticated: {
      hueRanges: [[0, 30], [200, 280]],  // Deep reds, purples, blues
      saturations: [20, 50],
      lightness: [20, 50]
    },
    fresh: {
      hueRanges: [[60, 180]],  // Greens, cyans
      saturations: [50, 80],
      lightness: [60, 90]
    },
    dramatic: {
      hueRanges: [[0, 360]],  // Any hue
      saturations: [0, 100],
      lightness: [0, 30]
    }
  }

  /**
   * Generate a harmonious color palette based on color theory
   */
  generateHarmony(
    baseColor: string,
    type: HarmonyType,
    options: {
      count?: number
      variation?: number  // 0-1, how much to vary the generated colors
      preserveLightness?: boolean
      preserveSaturation?: boolean
    } = {}
  ): string[] {
    const {
      count = 5,
      variation = 0.2,
      preserveLightness = false,
      preserveSaturation = false
    } = options

    const baseHsl = this.hexToHsl(baseColor)
    const colors: HSL[] = [baseHsl]

    switch (type) {
      case 'monochromatic':
        colors.push(...this.generateMonochromatic(baseHsl, count - 1, variation))
        break
        
      case 'analogous':
        colors.push(...this.generateAnalogous(baseHsl, count - 1, variation))
        break
        
      case 'complementary':
        colors.push(...this.generateComplementary(baseHsl, variation))
        if (count > 2) {
          colors.push(...this.generateTints(colors, count - colors.length))
        }
        break
        
      case 'split-complementary':
        colors.push(...this.generateSplitComplementary(baseHsl, variation))
        if (count > 3) {
          colors.push(...this.generateTints(colors, count - colors.length))
        }
        break
        
      case 'triadic':
        colors.push(...this.generateTriadic(baseHsl, variation))
        if (count > 3) {
          colors.push(...this.generateTints(colors, count - colors.length))
        }
        break
        
      case 'tetradic':
        colors.push(...this.generateTetradic(baseHsl, variation))
        if (count > 4) {
          colors.push(...this.generateTints(colors, count - colors.length))
        }
        break
        
      case 'square':
        colors.push(...this.generateSquare(baseHsl, variation))
        if (count > 4) {
          colors.push(...this.generateTints(colors, count - colors.length))
        }
        break
        
      case 'double-complementary':
        colors.push(...this.generateDoubleComplementary(baseHsl, variation))
        if (count > 4) {
          colors.push(...this.generateTints(colors, count - colors.length))
        }
        break
    }

    // Apply preservation options
    if (preserveLightness || preserveSaturation) {
      colors.forEach((color, i) => {
        if (i === 0) return  // Skip base color
        if (preserveLightness) color.l = baseHsl.l
        if (preserveSaturation) color.s = baseHsl.s
      })
    }

    return colors.slice(0, count).map(hsl => this.hslToHex(hsl))
  }

  /**
   * Analyze the harmony of a given color palette
   */
  analyzePalette(colors: string[]): HarmonyAnalysis {
    if (colors.length < 2) {
      return {
        type: 'monochromatic',
        score: 100,
        balance: { hue: 100, saturation: 100, lightness: 100 },
        temperature: 'neutral',
        mood: [],
        suggestions: ['Add more colors to create a palette']
      }
    }

    const hslColors = colors.map(c => this.hexToHsl(c))
    
    // Detect harmony type
    const harmonyType = this.detectHarmonyType(hslColors)
    
    // Calculate balance scores
    const balance = this.calculateBalance(hslColors)
    
    // Determine temperature
    const temperature = this.determineTemperature(hslColors)
    
    // Detect mood
    const mood = this.detectMood(hslColors)
    
    // Calculate overall score
    const score = this.calculateHarmonyScore(hslColors, harmonyType, balance)
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(hslColors, harmonyType, balance, score)

    return {
      type: harmonyType,
      score,
      balance,
      temperature,
      mood,
      suggestions
    }
  }

  /**
   * Find relationships between colors in a palette
   */
  findRelationships(colors: string[]): ColorRelationship[] {
    const relationships: ColorRelationship[] = []
    const hslColors = colors.map(c => this.hexToHsl(c))

    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const angle = this.calculateHueAngle(hslColors[i].h, hslColors[j].h)
        const relationship = this.classifyRelationship(angle)
        const harmony = this.calculatePairHarmony(hslColors[i], hslColors[j])

        relationships.push({
          color1: colors[i],
          color2: colors[j],
          angle,
          relationship,
          harmony
        })
      }
    }

    return relationships.sort((a, b) => b.harmony - a.harmony)
  }

  /**
   * Suggest improvements to make a palette more harmonious
   */
  improveHarmony(colors: string[], targetType?: HarmonyType): {
    original: string[]
    improved: string[]
    changes: Array<{ index: number; from: string; to: string; reason: string }>
  } {
    const original = [...colors]
    const improved = [...colors]
    const changes: Array<{ index: number; from: string; to: string; reason: string }> = []
    
    const hslColors = colors.map(c => this.hexToHsl(c))
    const currentType = targetType || this.detectHarmonyType(hslColors)

    // Calculate ideal positions for the target harmony type
    const idealPositions = this.calculateIdealPositions(hslColors[0], currentType, colors.length)

    // Adjust colors to match ideal positions
    idealPositions.forEach((ideal, i) => {
      if (i === 0) return  // Keep base color
      
      const current = hslColors[i]
      const distance = this.calculateColorDistance(current, ideal)
      
      if (distance > 10) {  // Threshold for adjustment
        const adjusted = this.blendColors(current, ideal, 0.7)  // 70% towards ideal
        const newHex = this.hslToHex(adjusted)
        
        changes.push({
          index: i,
          from: colors[i],
          to: newHex,
          reason: `Adjusted to better fit ${currentType} harmony`
        })
        
        improved[i] = newHex
      }
    })

    return { original, improved, changes }
  }

  /**
   * Generate color variations using golden ratio
   */
  generateGoldenRatioPalette(baseColor: string, count: number = 5): string[] {
    const baseHsl = this.hexToHsl(baseColor)
    const colors: string[] = [baseColor]

    for (let i = 1; i < count; i++) {
      const hueShift = (360 * this.GOLDEN_RATIO * i) % 360
      const newHue = (baseHsl.h + hueShift) % 360
      
      // Also vary saturation and lightness slightly
      const satVariation = Math.sin(i * this.GOLDEN_RATIO) * 20
      const lightVariation = Math.cos(i * this.GOLDEN_RATIO) * 15
      
      const newColor: HSL = {
        h: newHue,
        s: Math.max(0, Math.min(100, baseHsl.s + satVariation)),
        l: Math.max(0, Math.min(100, baseHsl.l + lightVariation))
      }
      
      colors.push(this.hslToHex(newColor))
    }

    return colors
  }

  /**
   * Create a gradient between two colors with harmony consideration
   */
  createHarmonicGradient(
    startColor: string,
    endColor: string,
    steps: number = 5,
    curve: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'linear'
  ): string[] {
    const startHsl = this.hexToHsl(startColor)
    const endHsl = this.hexToHsl(endColor)
    const gradient: string[] = []

    // Calculate hue path (shortest or longest based on harmony)
    const hueDiff = endHsl.h - startHsl.h
    const useShortPath = Math.abs(hueDiff) <= 180
    
    for (let i = 0; i < steps; i++) {
      const t = this.applyCurve(i / (steps - 1), curve)
      
      // Interpolate hue (considering circular nature)
      let hue: number
      if (useShortPath) {
        hue = startHsl.h + hueDiff * t
      } else {
        const adjustedDiff = hueDiff > 0 ? hueDiff - 360 : hueDiff + 360
        hue = startHsl.h + adjustedDiff * t
      }
      hue = (hue + 360) % 360
      
      // Interpolate saturation and lightness
      const saturation = startHsl.s + (endHsl.s - startHsl.s) * t
      const lightness = startHsl.l + (endHsl.l - startHsl.l) * t
      
      gradient.push(this.hslToHex({ h: hue, s: saturation, l: lightness }))
    }

    return gradient
  }

  // Private helper methods
  private generateMonochromatic(base: HSL, count: number, variation: number): HSL[] {
    const colors: HSL[] = []
    
    for (let i = 0; i < count; i++) {
      const factor = (i + 1) / (count + 1)
      colors.push({
        h: base.h,
        s: base.s * (1 - variation * factor),
        l: Math.max(10, Math.min(90, base.l + (50 - base.l) * factor))
      })
    }
    
    return colors
  }

  private generateAnalogous(base: HSL, count: number, variation: number): HSL[] {
    const colors: HSL[] = []
    const angleStep = 30 * variation
    
    for (let i = 0; i < count; i++) {
      const angle = angleStep * (i + 1) * (i % 2 === 0 ? 1 : -1)
      colors.push({
        h: (base.h + angle + 360) % 360,
        s: base.s * (1 - variation * 0.2),
        l: base.l + (Math.random() - 0.5) * variation * 20
      })
    }
    
    return colors
  }

  private generateComplementary(base: HSL, variation: number): HSL[] {
    return [{
      h: (base.h + 180) % 360,
      s: base.s * (1 - variation * 0.1),
      l: base.l
    }]
  }

  private generateSplitComplementary(base: HSL, variation: number): HSL[] {
    const complement = (base.h + 180) % 360
    const split = 30 * (1 + variation)
    
    return [
      {
        h: (complement - split + 360) % 360,
        s: base.s,
        l: base.l * (1 - variation * 0.1)
      },
      {
        h: (complement + split) % 360,
        s: base.s,
        l: base.l * (1 + variation * 0.1)
      }
    ]
  }

  private generateTriadic(base: HSL, variation: number): HSL[] {
    return [
      {
        h: (base.h + 120) % 360,
        s: base.s * (1 - variation * 0.1),
        l: base.l
      },
      {
        h: (base.h + 240) % 360,
        s: base.s * (1 + variation * 0.1),
        l: base.l
      }
    ]
  }

  private generateTetradic(base: HSL, variation: number): HSL[] {
    return [
      {
        h: (base.h + 60) % 360,
        s: base.s,
        l: base.l * (1 - variation * 0.1)
      },
      {
        h: (base.h + 180) % 360,
        s: base.s * (1 - variation * 0.1),
        l: base.l
      },
      {
        h: (base.h + 240) % 360,
        s: base.s,
        l: base.l * (1 + variation * 0.1)
      }
    ]
  }

  private generateSquare(base: HSL, variation: number): HSL[] {
    return [
      {
        h: (base.h + 90) % 360,
        s: base.s * (1 - variation * 0.05),
        l: base.l
      },
      {
        h: (base.h + 180) % 360,
        s: base.s,
        l: base.l * (1 - variation * 0.1)
      },
      {
        h: (base.h + 270) % 360,
        s: base.s * (1 + variation * 0.05),
        l: base.l
      }
    ]
  }

  private generateDoubleComplementary(base: HSL, variation: number): HSL[] {
    const shift = 30 * (1 + variation)
    
    return [
      {
        h: (base.h + shift) % 360,
        s: base.s,
        l: base.l * (1 - variation * 0.1)
      },
      {
        h: (base.h + 180) % 360,
        s: base.s * (1 - variation * 0.1),
        l: base.l
      },
      {
        h: (base.h + 180 + shift) % 360,
        s: base.s,
        l: base.l * (1 + variation * 0.1)
      }
    ]
  }

  private generateTints(baseColors: HSL[], count: number): HSL[] {
    const tints: HSL[] = []
    
    for (let i = 0; i < count; i++) {
      const sourceColor = baseColors[i % baseColors.length]
      const factor = 0.3 + (i / count) * 0.4
      
      tints.push({
        h: sourceColor.h,
        s: sourceColor.s * factor,
        l: Math.min(95, sourceColor.l + (100 - sourceColor.l) * factor)
      })
    }
    
    return tints
  }

  private detectHarmonyType(colors: HSL[]): HarmonyType {
    if (colors.length < 2) return 'monochromatic'
    
    const hues = colors.map(c => c.h)
    const uniqueHues = [...new Set(hues.map(h => Math.round(h / 10) * 10))]
    
    if (uniqueHues.length === 1) {
      return 'monochromatic'
    }
    
    // Check for specific harmony patterns
    const angles = this.calculateAllAngles(hues)
    
    if (this.hasComplementary(angles)) return 'complementary'
    if (this.hasTriadic(angles)) return 'triadic'
    if (this.hasTetradic(angles)) return 'tetradic'
    if (this.hasAnalogous(angles)) return 'analogous'
    if (this.hasSplitComplementary(angles)) return 'split-complementary'
    
    return 'analogous'  // Default
  }

  private calculateBalance(colors: HSL[]): { hue: number; saturation: number; lightness: number } {
    // Calculate standard deviations
    const hues = colors.map(c => c.h)
    const saturations = colors.map(c => c.s)
    const lightnesses = colors.map(c => c.l)
    
    const hueBalance = 100 - Math.min(100, this.standardDeviation(hues) / 1.8)
    const satBalance = 100 - Math.min(100, this.standardDeviation(saturations) / 0.5)
    const lightBalance = 100 - Math.min(100, this.standardDeviation(lightnesses) / 0.5)
    
    return {
      hue: Math.round(hueBalance),
      saturation: Math.round(satBalance),
      lightness: Math.round(lightBalance)
    }
  }

  private determineTemperature(colors: HSL[]): 'cool' | 'warm' | 'neutral' {
    const warmCount = colors.filter(c => 
      (c.h >= 0 && c.h <= 60) || (c.h >= 300 && c.h <= 360)
    ).length
    
    // const coolCount = colors.filter(c => c.h >= 120 && c.h <= 240).length
    
    const ratio = warmCount / colors.length
    
    if (ratio > 0.6) return 'warm'
    if (ratio < 0.4) return 'cool'
    return 'neutral'
  }

  private detectMood(colors: HSL[]): string[] {
    const detectedMoods: string[] = []
    
    for (const [mood, criteria] of Object.entries(this.moods)) {
      let matches = 0
      const required = colors.length * 0.6
      
      for (const color of colors) {
        const hueMatch = criteria.hueRanges.some(range => 
          color.h >= range[0] && color.h <= range[1]
        )
        
        const satMatch = color.s >= criteria.saturations[0] && 
                        color.s <= criteria.saturations[1]
        
        const lightMatch = color.l >= criteria.lightness[0] && 
                          color.l <= criteria.lightness[1]
        
        if (hueMatch && satMatch && lightMatch) {
          matches++
        }
      }
      
      if (matches >= required) {
        detectedMoods.push(mood)
      }
    }
    
    return detectedMoods
  }

  private calculateHarmonyScore(
    colors: HSL[],
    type: HarmonyType,
    balance: { hue: number; saturation: number; lightness: number }
  ): number {
    let score = 50  // Base score
    
    // Harmony type bonus
    const harmonyBonus: Record<HarmonyType, number> = {
      complementary: 15,
      triadic: 15,
      tetradic: 12,
      analogous: 10,
      'split-complementary': 12,
      square: 10,
      monochromatic: 8,
      'double-complementary': 10
    }
    
    score += harmonyBonus[type] || 0
    
    // Balance bonus
    score += (balance.hue + balance.saturation + balance.lightness) / 12
    
    // Variety penalty/bonus
    const uniqueHues = new Set(colors.map(c => Math.round(c.h / 30)))
    if (uniqueHues.size === 1 && type !== 'monochromatic') {
      score -= 10  // Penalty for unintended monochrome
    } else if (uniqueHues.size >= colors.length * 0.7) {
      score += 5  // Bonus for good variety
    }
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private generateSuggestions(
    colors: HSL[],
    type: HarmonyType,
    balance: { hue: number; saturation: number; lightness: number },
    score: number
  ): string[] {
    const suggestions: string[] = []
    
    if (score >= 80) {
      suggestions.push('✨ Excellent harmony! Your palette is well-balanced.')
    }
    
    if (balance.hue < 50) {
      suggestions.push('🎨 Try adjusting hues to create more visual interest')
    }
    
    if (balance.saturation < 50) {
      suggestions.push('🎯 Consider varying saturation levels for better depth')
    }
    
    if (balance.lightness < 50) {
      suggestions.push('💡 Add more contrast by varying lightness values')
    }
    
    if (type === 'monochromatic' && colors.length > 3) {
      suggestions.push('🌈 Consider adding an accent color for more variety')
    }
    
    return suggestions
  }

  private calculateHueAngle(h1: number, h2: number): number {
    const diff = Math.abs(h1 - h2)
    return Math.min(diff, 360 - diff)
  }

  private classifyRelationship(angle: number): string {
    if (angle < 15) return 'monochromatic'
    if (angle < 45) return 'analogous'
    if (angle < 75) return 'similar'
    if (angle >= 165 && angle <= 195) return 'complementary'
    if (angle >= 110 && angle <= 130) return 'triadic'
    if (angle >= 85 && angle <= 95) return 'square'
    return 'contrasting'
  }

  private calculatePairHarmony(c1: HSL, c2: HSL): number {
    const hueAngle = this.calculateHueAngle(c1.h, c2.h)
    const satDiff = Math.abs(c1.s - c2.s)
    const lightDiff = Math.abs(c1.l - c2.l)
    
    // Ideal angles for harmony
    const idealAngles = [0, 30, 60, 90, 120, 180]
    const angleScore = Math.max(...idealAngles.map(ideal => 
      1 - Math.abs(hueAngle - ideal) / 180
    ))
    
    // Balanced differences are better
    const satScore = 1 - Math.abs(satDiff - 30) / 100
    const lightScore = 1 - Math.abs(lightDiff - 20) / 100
    
    return (angleScore * 0.5 + satScore * 0.25 + lightScore * 0.25)
  }

  private calculateIdealPositions(base: HSL, type: HarmonyType, count: number): HSL[] {
    const positions: HSL[] = [base]
    
    switch (type) {
      case 'complementary':
        positions.push({ ...base, h: (base.h + 180) % 360 })
        break
      case 'triadic':
        positions.push(
          { ...base, h: (base.h + 120) % 360 },
          { ...base, h: (base.h + 240) % 360 }
        )
        break
      case 'analogous':
        for (let i = 1; i < count; i++) {
          positions.push({ ...base, h: (base.h + i * 30) % 360 })
        }
        break
      // Add more cases as needed
    }
    
    // Fill remaining positions
    while (positions.length < count) {
      const lastPos = positions[positions.length - 1]
      positions.push({
        h: lastPos.h,
        s: Math.max(0, Math.min(100, lastPos.s + 10)),
        l: Math.max(0, Math.min(100, lastPos.l + 10))
      })
    }
    
    return positions
  }

  private calculateColorDistance(c1: HSL, c2: HSL): number {
    const hueDiff = this.calculateHueAngle(c1.h, c2.h)
    const satDiff = Math.abs(c1.s - c2.s)
    const lightDiff = Math.abs(c1.l - c2.l)
    
    return Math.sqrt(hueDiff * hueDiff + satDiff * satDiff + lightDiff * lightDiff)
  }

  private blendColors(c1: HSL, c2: HSL, ratio: number): HSL {
    return {
      h: this.blendHue(c1.h, c2.h, ratio),
      s: c1.s + (c2.s - c1.s) * ratio,
      l: c1.l + (c2.l - c1.l) * ratio
    }
  }

  private blendHue(h1: number, h2: number, ratio: number): number {
    const diff = h2 - h1
    
    if (Math.abs(diff) <= 180) {
      return (h1 + diff * ratio + 360) % 360
    } else {
      const adjustedDiff = diff > 0 ? diff - 360 : diff + 360
      return (h1 + adjustedDiff * ratio + 360) % 360
    }
  }

  private applyCurve(t: number, curve: string): number {
    switch (curve) {
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      default:
        return t
    }
  }

  private calculateAllAngles(hues: number[]): number[] {
    const angles: number[] = []
    for (let i = 0; i < hues.length - 1; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        angles.push(this.calculateHueAngle(hues[i], hues[j]))
      }
    }
    return angles
  }

  private hasComplementary(angles: number[]): boolean {
    return angles.some(a => a >= 170 && a <= 190)
  }

  private hasTriadic(angles: number[]): boolean {
    return angles.filter(a => (a >= 110 && a <= 130)).length >= 2
  }

  private hasTetradic(angles: number[]): boolean {
    return angles.filter(a => (a >= 85 && a <= 95) || (a >= 175 && a <= 185)).length >= 3
  }

  private hasAnalogous(angles: number[]): boolean {
    return angles.every(a => a <= 60)
  }

  private hasSplitComplementary(angles: number[]): boolean {
    return angles.some(a => a >= 150 && a <= 170) && 
           angles.some(a => a >= 190 && a <= 210)
  }

  private standardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(variance)
  }

  // Color conversion utilities
  private hexToHsl(hex: string): HSL {
    const rgb = this.hexToRgb(hex)
    return this.rgbToHsl(rgb)
  }

  private hslToHex(hsl: HSL): string {
    const rgb = this.hslToRgb(hsl)
    return this.rgbToHex(rgb)
  }

  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`)
    }
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  private rgbToHex(rgb: RGB): string {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(x => Math.round(x).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  }

  private rgbToHsl(rgb: RGB): HSL {
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

  private hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360
    const s = hsl.s / 100
    const l = hsl.l / 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }
}

// Export singleton instance
export const colorHarmonyAnalyzer = new ColorHarmonyAnalyzer()
