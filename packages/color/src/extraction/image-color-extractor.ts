/**
 * Image Color Extractor
 * 从图像中提取主要颜色和生成调色板
 */

export interface ExtractorOptions {
  maxColors?: number
  quality?: number // 1-10, higher = better quality but slower
  algorithm?: 'kmeans' | 'median-cut' | 'octree'
  ignoreWhite?: boolean
  ignoreBlack?: boolean
  deltaE?: number // Color difference threshold
}

export interface ExtractedColor {
  hex: string
  rgb: { r: number, g: number, b: number }
  hsl: { h: number, s: number, l: number }
  population: number // Percentage of pixels
  prominence: number // Visual prominence score
}

export interface ColorPalette {
  dominant: ExtractedColor
  palette: ExtractedColor[]
  average: string
  vibrant?: ExtractedColor
  muted?: ExtractedColor
  darkVibrant?: ExtractedColor
  lightVibrant?: ExtractedColor
  darkMuted?: ExtractedColor
  lightMuted?: ExtractedColor
}

interface PixelData {
  r: number
  g: number
  b: number
  count: number
}

// Palette entry returned from Octree quantization
interface OctreePaletteEntry {
  r: number
  g: number
  b: number
  pixelCount: number
}

export class ImageColorExtractor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: Required<ExtractorOptions>

  constructor(options: ExtractorOptions = {}) {
    this.options = {
      maxColors: 10,
      quality: 5,
      algorithm: 'kmeans',
      ignoreWhite: true,
      ignoreBlack: true,
      deltaE: 2.3,
      ...options,
    }

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
  }

  /**
   * Extract colors from an image
   */
  async extractColors(source: string | HTMLImageElement | File): Promise<ColorPalette> {
    const image = await this.loadImage(source)
    const pixels = this.getPixelData(image)

    let colors: ExtractedColor[]

    switch (this.options.algorithm) {
      case 'median-cut':
        colors = this.medianCutQuantization(pixels)
        break
      case 'octree':
        colors = this.octreeQuantization(pixels)
        break
      case 'kmeans':
      default:
        colors = this.kmeansQuantization(pixels)
        break
    }

    // Sort by population
    colors.sort((a, b) => b.population - a.population)

    // Calculate special colors
    const palette = this.generatePalette(colors)

    return palette
  }

  /**
   * Extract color at specific coordinates
   */
  getColorAt(image: HTMLImageElement, x: number, y: number): ExtractedColor {
    this.canvas.width = 1
    this.canvas.height = 1
    this.ctx.drawImage(image, x, y, 1, 1, 0, 0, 1, 1)

    const [r, g, b] = this.ctx.getImageData(0, 0, 1, 1).data
    const hex = this.rgbToHex(r, g, b)
    const hsl = this.rgbToHsl(r, g, b)

    return {
      hex,
      rgb: { r, g, b },
      hsl,
      population: 0,
      prominence: 0,
    }
  }

  /**
   * Generate a color scheme from an image
   */
  async generateColorScheme(
    source: string | HTMLImageElement | File,
    type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' = 'analogous',
  ): Promise<string[]> {
    const palette = await this.extractColors(source)
    const baseColor = palette.dominant.hsl

    switch (type) {
      case 'monochromatic':
        return this.generateMonochromaticScheme(baseColor)
      case 'complementary':
        return this.generateComplementaryScheme(baseColor)
      case 'triadic':
        return this.generateTriadicScheme(baseColor)
      case 'analogous':
      default:
        return this.generateAnalogousScheme(baseColor)
    }
  }

  private async loadImage(source: string | HTMLImageElement | File): Promise<HTMLImageElement> {
    if (source instanceof HTMLImageElement) {
      return source
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => resolve(img)
      img.onerror = reject

      if (typeof source === 'string') {
        img.src = source
      }
      else if (source instanceof File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(source)
      }
    })
  }

  private getPixelData(image: HTMLImageElement): PixelData[] {
    const scaleFactor = Math.max(1, Math.floor(11 - this.options.quality))
    const width = Math.floor(image.width / scaleFactor)
    const height = Math.floor(image.height / scaleFactor)

    this.canvas.width = width
    this.canvas.height = height
    this.ctx.drawImage(image, 0, 0, width, height)

    const imageData = this.ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    const pixelMap = new Map<string, PixelData>()

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      // Skip transparent pixels
      if (a < 125)
        continue

      // Skip white/black if configured
      if (this.options.ignoreWhite && this.isWhite(r, g, b))
        continue
      if (this.options.ignoreBlack && this.isBlack(r, g, b))
        continue

      // Quantize to reduce colors
      const qr = Math.round(r / 5) * 5
      const qg = Math.round(g / 5) * 5
      const qb = Math.round(b / 5) * 5

      const key = `${qr},${qg},${qb}`
      const existing = pixelMap.get(key)

      if (existing) {
        existing.count++
      }
      else {
        pixelMap.set(key, { r: qr, g: qg, b: qb, count: 1 })
      }
    }

    return Array.from(pixelMap.values())
  }

  private kmeansQuantization(pixels: PixelData[]): ExtractedColor[] {
    const k = Math.min(this.options.maxColors, pixels.length)
    if (k === 0)
      return []

    // Initialize centroids randomly
    let centroids = this.initializeCentroids(pixels, k)
    let clusters: PixelData[][] = []
    let iterations = 0
    const maxIterations = 20

    while (iterations < maxIterations) {
      // Assign pixels to clusters
      clusters = Array.from({ length: k }, () => [])

      for (const pixel of pixels) {
        let minDist = Infinity
        let closestCentroid = 0

        for (let i = 0; i < centroids.length; i++) {
          const dist = this.colorDistance(pixel, centroids[i])
          if (dist < minDist) {
            minDist = dist
            closestCentroid = i
          }
        }

        clusters[closestCentroid].push(pixel)
      }

      // Update centroids
      const newCentroids: PixelData[] = []
      let changed = false

      for (let i = 0; i < k; i++) {
        if (clusters[i].length === 0) {
          newCentroids.push(centroids[i])
          continue
        }

        const cluster = clusters[i]
        const totalCount = cluster.reduce((sum, p) => sum + p.count, 0)
        const newCentroid: PixelData = {
          r: 0,
          g: 0,
          b: 0,
          count: totalCount,
        }

        for (const pixel of cluster) {
          const weight = pixel.count / totalCount
          newCentroid.r += pixel.r * weight
          newCentroid.g += pixel.g * weight
          newCentroid.b += pixel.b * weight
        }

        newCentroid.r = Math.round(newCentroid.r)
        newCentroid.g = Math.round(newCentroid.g)
        newCentroid.b = Math.round(newCentroid.b)

        if (!this.colorsEqual(centroids[i], newCentroid)) {
          changed = true
        }

        newCentroids.push(newCentroid)
      }

      centroids = newCentroids
      iterations++

      if (!changed)
        break
    }

    // Convert to ExtractedColor format
    const totalPixels = pixels.reduce((sum, p) => sum + p.count, 0)

    return centroids.map((centroid, i) => {
      const clusterCount = clusters[i].reduce((sum, p) => sum + p.count, 0)
      const population = (clusterCount / totalPixels) * 100
      const prominence = this.calculateProminence(centroid, population)

      return {
        hex: this.rgbToHex(centroid.r, centroid.g, centroid.b),
        rgb: { r: centroid.r, g: centroid.g, b: centroid.b },
        hsl: this.rgbToHsl(centroid.r, centroid.g, centroid.b),
        population,
        prominence,
      }
    })
  }

  private medianCutQuantization(pixels: PixelData[]): ExtractedColor[] {
    if (pixels.length === 0)
      return []

    const boxes: PixelData[][] = [pixels]
    const targetBoxes = Math.min(this.options.maxColors, pixels.length)

    while (boxes.length < targetBoxes) {
      // Find box with largest color range
      let maxRange = 0
      let boxToSplit = 0

      for (let i = 0; i < boxes.length; i++) {
        const range = this.getColorRange(boxes[i])
        if (range > maxRange) {
          maxRange = range
          boxToSplit = i
        }
      }

      // Split the box
      const box = boxes[boxToSplit]
      const [box1, box2] = this.splitBox(box)

      boxes.splice(boxToSplit, 1, box1, box2)
    }

    // Calculate average color for each box
    const totalPixels = pixels.reduce((sum, p) => sum + p.count, 0)

    return boxes.map((box) => {
      const totalCount = box.reduce((sum, p) => sum + p.count, 0)
      const avgColor: PixelData = {
        r: 0,
        g: 0,
        b: 0,
        count: totalCount,
      }

      for (const pixel of box) {
        const weight = pixel.count / totalCount
        avgColor.r += pixel.r * weight
        avgColor.g += pixel.g * weight
        avgColor.b += pixel.b * weight
      }

      avgColor.r = Math.round(avgColor.r)
      avgColor.g = Math.round(avgColor.g)
      avgColor.b = Math.round(avgColor.b)

      const population = (totalCount / totalPixels) * 100
      const prominence = this.calculateProminence(avgColor, population)

      return {
        hex: this.rgbToHex(avgColor.r, avgColor.g, avgColor.b),
        rgb: { r: avgColor.r, g: avgColor.g, b: avgColor.b },
        hsl: this.rgbToHsl(avgColor.r, avgColor.g, avgColor.b),
        population,
        prominence,
      }
    })
  }

  private octreeQuantization(pixels: PixelData[]): ExtractedColor[] {
    // Simplified octree implementation
    const octree = new OctreeNode()

    // Add all pixels to octree
    for (const pixel of pixels) {
      octree.addColor(pixel.r, pixel.g, pixel.b, pixel.count)
    }

    // Reduce to target colors
    octree.reduce(this.options.maxColors)

    // Get palette from octree
    const palette = octree.getPalette()
    const totalPixels = pixels.reduce((sum, p) => sum + p.count, 0)

    return palette.map((entry) => {
      const population = (entry.pixelCount / totalPixels) * 100
      const prominence = this.calculateProminence(
        { r: entry.r, g: entry.g, b: entry.b, count: entry.pixelCount },
        population,
      )

      return {
        hex: this.rgbToHex(entry.r, entry.g, entry.b),
        rgb: { r: entry.r, g: entry.g, b: entry.b },
        hsl: this.rgbToHsl(entry.r, entry.g, entry.b),
        population,
        prominence,
      }
    })
  }

  private generatePalette(colors: ExtractedColor[]): ColorPalette {
    const dominant = colors[0] || this.createDefaultColor()

    // Calculate average color
    let totalR = 0
    let totalG = 0
    let totalB = 0
    let totalWeight = 0

    for (const color of colors) {
      const weight = color.population
      totalR += color.rgb.r * weight
      totalG += color.rgb.g * weight
      totalB += color.rgb.b * weight
      totalWeight += weight
    }

    const avgR = Math.round(totalR / totalWeight)
    const avgG = Math.round(totalG / totalWeight)
    const avgB = Math.round(totalB / totalWeight)
    const average = this.rgbToHex(avgR, avgG, avgB)

    // Find special colors
    const vibrant = this.findVibrantColor(colors)
    const muted = this.findMutedColor(colors)
    const darkVibrant = this.findDarkVibrantColor(colors)
    const lightVibrant = this.findLightVibrantColor(colors)
    const darkMuted = this.findDarkMutedColor(colors)
    const lightMuted = this.findLightMutedColor(colors)

    return {
      dominant,
      palette: colors,
      average,
      vibrant,
      muted,
      darkVibrant,
      lightVibrant,
      darkMuted,
      lightMuted,
    }
  }

  private findVibrantColor(colors: ExtractedColor[]): ExtractedColor | undefined {
    return colors.find(c => c.hsl.s > 50 && c.hsl.l >= 30 && c.hsl.l <= 70)
  }

  private findMutedColor(colors: ExtractedColor[]): ExtractedColor | undefined {
    return colors.find(c => c.hsl.s <= 50 && c.hsl.l >= 30 && c.hsl.l <= 70)
  }

  private findDarkVibrantColor(colors: ExtractedColor[]): ExtractedColor | undefined {
    return colors.find(c => c.hsl.s > 50 && c.hsl.l < 30)
  }

  private findLightVibrantColor(colors: ExtractedColor[]): ExtractedColor | undefined {
    return colors.find(c => c.hsl.s > 50 && c.hsl.l > 70)
  }

  private findDarkMutedColor(colors: ExtractedColor[]): ExtractedColor | undefined {
    return colors.find(c => c.hsl.s <= 50 && c.hsl.l < 30)
  }

  private findLightMutedColor(colors: ExtractedColor[]): ExtractedColor | undefined {
    return colors.find(c => c.hsl.s <= 50 && c.hsl.l > 70)
  }

  private initializeCentroids(pixels: PixelData[], k: number): PixelData[] {
    // K-means++ initialization
    const centroids: PixelData[] = []

    // Choose first centroid randomly
    const firstIndex = Math.floor(Math.random() * pixels.length)
    centroids.push({ ...pixels[firstIndex] })

    // Choose remaining centroids
    for (let i = 1; i < k; i++) {
      const distances = pixels.map((pixel) => {
        let minDist = Infinity
        for (const centroid of centroids) {
          const dist = this.colorDistance(pixel, centroid)
          minDist = Math.min(minDist, dist)
        }
        return minDist
      })

      // Choose next centroid with probability proportional to squared distance
      const totalDist = distances.reduce((sum, d) => sum + d * d, 0)
      let random = Math.random() * totalDist
      let selectedIndex = 0

      for (let j = 0; j < distances.length; j++) {
        random -= distances[j] * distances[j]
        if (random <= 0) {
          selectedIndex = j
          break
        }
      }

      centroids.push({ ...pixels[selectedIndex] })
    }

    return centroids
  }

  private getColorRange(box: PixelData[]): number {
    let minR = 255
    let maxR = 0
    let minG = 255
    let maxG = 0
    let minB = 255
    let maxB = 0

    for (const pixel of box) {
      minR = Math.min(minR, pixel.r)
      maxR = Math.max(maxR, pixel.r)
      minG = Math.min(minG, pixel.g)
      maxG = Math.max(maxG, pixel.g)
      minB = Math.min(minB, pixel.b)
      maxB = Math.max(maxB, pixel.b)
    }

    const rangeR = maxR - minR
    const rangeG = maxG - minG
    const rangeB = maxB - minB

    return Math.max(rangeR, rangeG, rangeB)
  }

  private splitBox(box: PixelData[]): [PixelData[], PixelData[]] {
    let minR = 255
    let maxR = 0
    let minG = 255
    let maxG = 0
    let minB = 255
    let maxB = 0

    for (const pixel of box) {
      minR = Math.min(minR, pixel.r)
      maxR = Math.max(maxR, pixel.r)
      minG = Math.min(minG, pixel.g)
      maxG = Math.max(maxG, pixel.g)
      minB = Math.min(minB, pixel.b)
      maxB = Math.max(maxB, pixel.b)
    }

    const rangeR = maxR - minR
    const rangeG = maxG - minG
    const rangeB = maxB - minB

    // Split along the dimension with largest range
    let splitDimension: 'r' | 'g' | 'b'
    let splitValue: number

    if (rangeR >= rangeG && rangeR >= rangeB) {
      splitDimension = 'r'
      splitValue = (minR + maxR) / 2
    }
    else if (rangeG >= rangeB) {
      splitDimension = 'g'
      splitValue = (minG + maxG) / 2
    }
    else {
      splitDimension = 'b'
      splitValue = (minB + maxB) / 2
    }

    const box1: PixelData[] = []
    const box2: PixelData[] = []

    for (const pixel of box) {
      if (pixel[splitDimension] <= splitValue) {
        box1.push(pixel)
      }
      else {
        box2.push(pixel)
      }
    }

    // Ensure both boxes have at least one pixel
    if (box1.length === 0) {
      box1.push(box2.pop()!)
    }
    else if (box2.length === 0) {
      box2.push(box1.pop()!)
    }

    return [box1, box2]
  }

  private calculateProminence(color: PixelData, population: number): number {
    const { s, l } = this.rgbToHsl(color.r, color.g, color.b)

    // Prominence based on saturation, lightness, and population
    const saturationWeight = s / 100
    const lightnessWeight = 1 - Math.abs(l - 50) / 50 // Prefer mid-range lightness
    const populationWeight = Math.sqrt(population / 100)

    return (saturationWeight * 0.3 + lightnessWeight * 0.3 + populationWeight * 0.4) * 100
  }

  private colorDistance(c1: PixelData, c2: PixelData): number {
    // Euclidean distance in RGB space
    const dr = c1.r - c2.r
    const dg = c1.g - c2.g
    const db = c1.b - c2.b

    return Math.sqrt(dr * dr + dg * dg + db * db)
  }

  private colorsEqual(c1: PixelData, c2: PixelData): boolean {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b
  }

  private isWhite(r: number, g: number, b: number): boolean {
    return r > 250 && g > 250 && b > 250
  }

  private isBlack(r: number, g: number, b: number): boolean {
    return r < 5 && g < 5 && b < 5
  }

  private createDefaultColor(): ExtractedColor {
    return {
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 0, s: 0, l: 0 },
      population: 0,
      prominence: 0,
    }
  }

  // Color scheme generation methods
  private generateMonochromaticScheme(base: { h: number, s: number, l: number }): string[] {
    const colors: string[] = []

    for (let i = 0; i < 5; i++) {
      const lightness = 20 + i * 15
      const { r, g, b } = this.hslToRgb(base.h, base.s, lightness)
      colors.push(this.rgbToHex(r, g, b))
    }

    return colors
  }

  private generateAnalogousScheme(base: { h: number, s: number, l: number }): string[] {
    const colors: string[] = []
    const hueStep = 30

    for (let i = -2; i <= 2; i++) {
      const hue = (base.h + i * hueStep + 360) % 360
      const { r, g, b } = this.hslToRgb(hue, base.s, base.l)
      colors.push(this.rgbToHex(r, g, b))
    }

    return colors
  }

  private generateComplementaryScheme(base: { h: number, s: number, l: number }): string[] {
    const colors: string[] = []

    // Base color
    const { r: r1, g: g1, b: b1 } = this.hslToRgb(base.h, base.s, base.l)
    colors.push(this.rgbToHex(r1, g1, b1))

    // Complementary color
    const compHue = (base.h + 180) % 360
    const { r: r2, g: g2, b: b2 } = this.hslToRgb(compHue, base.s, base.l)
    colors.push(this.rgbToHex(r2, g2, b2))

    // Variations
    for (let i = 1; i <= 3; i++) {
      const lightness = base.l + (i - 2) * 20
      const { r, g, b } = this.hslToRgb(base.h, base.s, Math.max(10, Math.min(90, lightness)))
      colors.push(this.rgbToHex(r, g, b))
    }

    return colors
  }

  private generateTriadicScheme(base: { h: number, s: number, l: number }): string[] {
    const colors: string[] = []

    for (let i = 0; i < 3; i++) {
      const hue = (base.h + i * 120) % 360
      const { r, g, b } = this.hslToRgb(hue, base.s, base.l)
      colors.push(this.rgbToHex(r, g, b))
    }

    // Add variations
    const { r: r1, g: g1, b: b1 } = this.hslToRgb(base.h, base.s, Math.min(90, base.l + 15))
    colors.push(this.rgbToHex(r1, g1, b1))

    const { r: r2, g: g2, b: b2 } = this.hslToRgb(base.h, base.s, Math.max(10, base.l - 15))
    colors.push(this.rgbToHex(r2, g2, b2))

    return colors
  }

  // Color conversion utilities
  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255
    g /= 255
    b /= 255

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

  private hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
    h /= 360
    s /= 100
    l /= 100

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
}

// Octree implementation for color quantization
class OctreeNode {
  private children: (OctreeNode | null)[] = Array.from({ length: 8 }, () => null)
  private isLeaf = false
  private r = 0
  private g = 0
  private b = 0
  pixelCount = 0

  addColor(r: number, g: number, b: number, count: number, level = 0): void {
    if (level >= 8) {
      this.r += r * count
      this.g += g * count
      this.b += b * count
      this.pixelCount += count
      this.isLeaf = true
      return
    }

    const index = this.getColorIndex(r, g, b, level)

    if (!this.children[index]) {
      this.children[index] = new OctreeNode()
    }

    this.children[index]!.addColor(r, g, b, count, level + 1)
  }

  reduce(maxColors: number): void {
    const leaves = this.getLeaves()

    while (leaves.length > maxColors) {
      // Find and merge smallest nodes
      leaves.sort((a, b) => a.pixelCount - b.pixelCount)

      // Merge smallest leaf (placeholder for real merge logic)
      leaves.shift()
      // Note: A real implementation would merge with sibling or parent nodes.
    }
  }

  getPalette(): OctreePaletteEntry[] {
    const leaves = this.getLeaves()

    return leaves.map(
      (leaf): OctreePaletteEntry => ({
        r: Math.round(leaf.r / Math.max(1, leaf.pixelCount)),
        g: Math.round(leaf.g / Math.max(1, leaf.pixelCount)),
        b: Math.round(leaf.b / Math.max(1, leaf.pixelCount)),
        pixelCount: leaf.pixelCount,
      }),
    )
  }

  private getLeaves(): OctreeNode[] {
    const leaves: OctreeNode[] = []

    if (this.isLeaf) {
      leaves.push(this)
    }
    else {
      for (const child of this.children) {
        if (child) {
          leaves.push(...child.getLeaves())
        }
      }
    }

    return leaves
  }

  private getColorIndex(r: number, g: number, b: number, level: number): number {
    const bit = 7 - level
    const mask = 1 << bit

    let index = 0
    if (r & mask)
      index |= 4
    if (g & mask)
      index |= 2
    if (b & mask)
      index |= 1

    return index
  }
}

// Export factory function
export function createImageColorExtractor(options?: ExtractorOptions): ImageColorExtractor {
  return new ImageColorExtractor(options)
}
