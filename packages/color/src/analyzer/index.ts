/**
 * 棰滆壊鏁版嵁鍒嗘瀽鍣?
 * 鏀寔鍥剧墖棰滆壊鎻愬彇銆佷富鑹茶皟鍒嗘瀽銆侀鑹插垎甯冪粺璁?
 */

import { Color } from '../core/Color'
import type { RGB } from '../types'

/**
 * 棰滆壊缁熻淇℃伅
 */
export interface ColorStatistics {
  color: Color
  count: number
  percentage: number
  prominence: number // 鏄捐憲搴?
}

/**
 * 棰滆壊鍒嗗竷淇℃伅
 */
export interface ColorDistribution {
  hueDistribution: number[] // 360涓€硷紝琛ㄧず鍚勮壊鐩哥殑鍒嗗竷
  saturationDistribution: number[] // 101涓€硷紝琛ㄧず楗卞拰搴﹀垎甯?
  lightnessDistribution: number[] // 101涓€硷紝琛ㄧず鏄庡害鍒嗗竷
  dominantHues: number[] // 涓昏鑹茬浉
  averageSaturation: number
  averageLightness: number
}

/**
 * 鍒嗘瀽閫夐」
 */
export interface AnalyzerOptions {
  sampleSize?: number // 閲囨牱澶у皬
  quality?: number // 璐ㄩ噺 (1-10)
  ignoreWhite?: boolean // 蹇界暐鐧借壊
  ignoreBlack?: boolean // 蹇界暐榛戣壊
  threshold?: number // 鐩镐技搴﹂槇鍊?
}

/**
 * 棰滆壊鑱氱被缁撴灉
 */
interface ColorCluster {
  center: Color
  members: Color[]
  weight: number
}

/**
 * 棰滆壊鏁版嵁鍒嗘瀽鍣?
 */
export class ColorAnalyzer {
  
  /**
   * 浠庡浘鐗囨彁鍙栬皟鑹叉澘
   */
  static async extractPalette(
    input: File | Blob | HTMLImageElement | string,
    count = 5,
    _options: AnalyzerOptions = {}
  ): Promise<Color[]> {
    const pixels = await this.getImagePixels(input, _options)
    const clusters = this.kMeansClustering(pixels, count, _options)
    
    return clusters
      .sort((a, b) => b.weight - a.weight)
      .map(cluster => cluster.center)
  }
  
  /**
   * 鏌ユ壘涓昏壊璋?
   */
  static async findDominantColors(
    input: File | Blob | HTMLImageElement | string,
    count = 3,
    _options: AnalyzerOptions = {}
  ): Promise<ColorStatistics[]> {
    const pixels = await this.getImagePixels(input, _options)
    const colorMap = new Map<string, number>()
    
    // 缁熻棰滆壊棰戠巼
    for (const pixel of pixels) {
      const color = new Color(pixel)
      const key = this.getColorKey(color, _options.threshold || 10)
      colorMap.set(key, (colorMap.get(key) || 0) + 1)
    }
    
    // 杞崲涓虹粺璁′俊鎭?
    const total = pixels.length
    const statistics: ColorStatistics[] = []
    
    for (const [key, count] of colorMap.entries()) {
      const [r, g, b] = key.split(',').map(Number)
      const color = Color.fromRGB(r, g, b)
      const percentage = (count / total) * 100
      const prominence = this.calculateProminence(color, percentage)
      
      statistics.push({
        color,
        count,
        percentage,
        prominence
      })
    }
    
    // 鎸夋樉钁楀害鎺掑簭骞惰繑鍥炲墠N涓?
    return statistics
      .sort((a, b) => b.prominence - a.prominence)
      .slice(0, count)
  }
  
  /**
   * 鍒嗘瀽棰滆壊鍒嗗竷
   */
  static async analyzeColorDistribution(
    input: File | Blob | HTMLImageElement | string,
    _options: AnalyzerOptions = {}
  ): Promise<ColorDistribution> {
    const pixels = await this.getImagePixels(input, _options)
    
    // 鍒濆鍖栧垎甯冩暟缁?
    const hueDistribution = new Array(360).fill(0)
    const saturationDistribution = new Array(101).fill(0)
    const lightnessDistribution = new Array(101).fill(0)
    
    let totalSaturation = 0
    let totalLightness = 0
    
    // 缁熻鍒嗗竷
    for (const pixel of pixels) {
      const color = new Color(pixel)
      const hsl = color.toHSL()
      
      hueDistribution[Math.round(hsl.h)]++
      saturationDistribution[Math.round(hsl.s)]++
      lightnessDistribution[Math.round(hsl.l)]++
      
      totalSaturation += hsl.s
      totalLightness += hsl.l
    }
    
    // 褰掍竴鍖?
    const maxHue = Math.max(...hueDistribution)
    const maxSat = Math.max(...saturationDistribution)
    const maxLight = Math.max(...lightnessDistribution)
    
    for (let i = 0; i < 360; i++) {
      hueDistribution[i] = hueDistribution[i] / maxHue
    }
    for (let i = 0; i < 101; i++) {
      saturationDistribution[i] = saturationDistribution[i] / maxSat
      lightnessDistribution[i] = lightnessDistribution[i] / maxLight
    }
    
    // 鎵惧嚭涓昏鑹茬浉
    const dominantHues = this.findPeaks(hueDistribution, 3)
    
    return {
      hueDistribution,
      saturationDistribution,
      lightnessDistribution,
      dominantHues,
      averageSaturation: totalSaturation / pixels.length,
      averageLightness: totalLightness / pixels.length
    }
  }
  
  /**
   * 鑾峰彇鍥剧墖鍍忕礌鏁版嵁
   */
  private static async getImagePixels(
    input: File | Blob | HTMLImageElement | string,
    _options: AnalyzerOptions = {}
  ): Promise<RGB[]> {
    const img = await this.loadImage(input)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // 鏍规嵁璐ㄩ噺璁剧疆閲囨牱澶у皬
    const quality = _options.quality || 5
    const sampleSize = _options.sampleSize || Math.max(10, 100 - quality * 10)
    
    canvas.width = Math.min(img.width, sampleSize)
    canvas.height = Math.min(img.height, sampleSize)
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels: RGB[] = []
    
    // 鎻愬彇鍍忕礌
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      const a = imageData.data[i + 3]
      
      // 蹇界暐閫忔槑鍍忕礌
      if (a < 128) continue
      
      // 鏍规嵁閫夐」蹇界暐榛戠櫧鑹?
      if (_options.ignoreWhite && r > 240 && g > 240 && b > 240) continue
      if (_options.ignoreBlack && r < 15 && g < 15 && b < 15) continue
      
      pixels.push({ r, g, b })
    }
    
    return pixels
  }
  
  /**
   * 鍔犺浇鍥剧墖
   */
  private static async loadImage(
    input: File | Blob | HTMLImageElement | string
  ): Promise<HTMLImageElement> {
    if (input instanceof HTMLImageElement) {
      return input
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    if (typeof input === 'string') {
      img.src = input
    } else {
      const url = URL.createObjectURL(input)
      img.src = url
      img.onload = () => URL.revokeObjectURL(url)
    }
    
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = reject
    })
  }
  
  /**
   * K-means鑱氱被绠楁硶
   */
  private static kMeansClustering(
    pixels: RGB[],
    k: number,
    _options: AnalyzerOptions = {}
  ): ColorCluster[] {
    if (pixels.length === 0) return []
    if (k >= pixels.length) {
      return pixels.map(p => ({
        center: new Color(p),
        members: [new Color(p)],
        weight: 1
      }))
    }
    
    // 鍒濆鍖栬仛绫讳腑蹇冿紙K-means++锛?
    const centers = this.initializeCenters(pixels, k)
    const clusters: ColorCluster[] = centers.map(c => ({
      center: c,
      members: [],
      weight: 0
    }))
    
    const maxIterations = 30
    let iteration = 0
    let changed = true
    
    while (changed && iteration < maxIterations) {
      changed = false
      
      // 娓呯┖鎴愬憳
      clusters.forEach(c => c.members = [])
      
      // 鍒嗛厤鍍忕礌鍒版渶杩戠殑鑱氱被
      for (const pixel of pixels) {
        const color = new Color(pixel)
        let minDistance = Infinity
        let nearestCluster = 0
        
        for (let i = 0; i < clusters.length; i++) {
          const distance = this.colorDistance(color, clusters[i].center)
          if (distance < minDistance) {
            minDistance = distance
            nearestCluster = i
          }
        }
        
        clusters[nearestCluster].members.push(color)
      }
      
      // 鏇存柊鑱氱被涓績
      for (const cluster of clusters) {
        if (cluster.members.length > 0) {
          const newCenter = this.calculateCentroid(cluster.members)
          if (this.colorDistance(newCenter, cluster.center) > 1) {
            cluster.center = newCenter
            changed = true
          }
          cluster.weight = cluster.members.length / pixels.length
        }
      }
      
      iteration++
    }
    
    return clusters.filter(c => c.members.length > 0)
  }
  
  /**
   * 鍒濆鍖栬仛绫讳腑蹇冿紙K-means++锛?
   */
  private static initializeCenters(pixels: RGB[], k: number): Color[] {
    const centers: Color[] = []
    
    // 闅忔満閫夋嫨绗竴涓腑蹇?
    const first = pixels[Math.floor(Math.random() * pixels.length)]
    centers.push(new Color(first))
    
    // 閫夋嫨鍓╀綑鐨勪腑蹇?
    for (let i = 1; i < k; i++) {
      const distances = pixels.map(pixel => {
        const color = new Color(pixel)
        let minDist = Infinity
        for (const center of centers) {
          const dist = this.colorDistance(color, center)
          if (dist < minDist) minDist = dist
        }
        return minDist
      })
      
      // 鏍规嵁璺濈姒傜巼閫夋嫨涓嬩竴涓腑蹇?
      const sum = distances.reduce((a, b) => a + b, 0)
      let random = Math.random() * sum
      
      for (let j = 0; j < pixels.length; j++) {
        random -= distances[j]
        if (random <= 0) {
          centers.push(new Color(pixels[j]))
          break
        }
      }
    }
    
    return centers
  }
  
  /**
   * 璁＄畻璐ㄥ績
   */
  private static calculateCentroid(colors: Color[]): Color {
    if (colors.length === 0) return new Color('#000000')
    
    let totalR = 0, totalG = 0, totalB = 0
    
    for (const color of colors) {
      const rgb = color.toRGB()
      totalR += rgb.r
      totalG += rgb.g
      totalB += rgb.b
    }
    
    const count = colors.length
    return Color.fromRGB(
      Math.round(totalR / count),
      Math.round(totalG / count),
      Math.round(totalB / count)
    )
  }
  
  /**
   * 璁＄畻棰滆壊璺濈
   */
  private static colorDistance(c1: Color, c2: Color): number {
    const rgb1 = c1.toRGB()
    const rgb2 = c2.toRGB()
    
    // 浣跨敤鍔犳潈娆у嚑閲屽緱璺濈锛堣€冭檻浜虹溂鎰熺煡锛?
    const rMean = (rgb1.r + rgb2.r) / 2
    const deltaR = rgb1.r - rgb2.r
    const deltaG = rgb1.g - rgb2.g
    const deltaB = rgb1.b - rgb2.b
    
    const weightR = 2 + rMean / 256
    const weightG = 4
    const weightB = 2 + (255 - rMean) / 256
    
    return Math.sqrt(
      weightR * deltaR * deltaR +
      weightG * deltaG * deltaG +
      weightB * deltaB * deltaB
    )
  }
  
  /**
   * 鑾峰彇棰滆壊閿紙鐢ㄤ簬鍒嗙粍鐩镐技棰滆壊锛?
   */
  private static getColorKey(color: Color, threshold: number): string {
    const rgb = color.toRGB()
    const factor = Math.max(1, threshold)
    
    const r = Math.round(rgb.r / factor) * factor
    const g = Math.round(rgb.g / factor) * factor
    const b = Math.round(rgb.b / factor) * factor
    
    return `${r},${g},${b}`
  }
  
  /**
   * 璁＄畻棰滆壊鏄捐憲搴?
   */
  private static calculateProminence(color: Color, percentage: number): number {
    const hsl = color.toHSL()
    
    // 楂橀ケ鍜屽害鍜屼腑绛変寒搴︾殑棰滆壊鏇存樉钁?
    const saturationWeight = hsl.s / 100
    const lightnessWeight = 1 - Math.abs(hsl.l - 50) / 50
    
    return percentage * saturationWeight * lightnessWeight
  }
  
  /**
   * 鏌ユ壘宄板€?
   */
  private static findPeaks(data: number[], count: number): number[] {
    const peaks: { index: number; value: number }[] = []
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push({ index: i, value: data[i] })
      }
    }
    
    return peaks
      .sort((a, b) => b.value - a.value)
      .slice(0, count)
      .map(p => p.index)
  }
  
  /**
   * 鐢熸垚棰滆壊鎶ュ憡
   */
  static async generateColorReport(
    input: File | Blob | HTMLImageElement | string,
    _options: AnalyzerOptions = {}
  ): Promise<{
    palette: Color[]
    dominant: ColorStatistics[]
    distribution: ColorDistribution
    mood: string
    temperature: 'warm' | 'cool' | 'neutral'
  }> {
    const [palette, dominant, distribution] = await Promise.all([
      this.extractPalette(input, 5, _options),
      this.findDominantColors(input, 3, _options),
      this.analyzeColorDistribution(input, _options)
    ])
    
    // 鍒嗘瀽鑹插僵鎯呯华
    const mood = this.analyzeMood(palette)
    
    // 鍒嗘瀽鑹叉俯
    const temperature = this.analyzeTemperature(distribution.dominantHues)
    
    return {
      palette,
      dominant,
      distribution,
      mood,
      temperature
    }
  }
  
  /**
   * 鍒嗘瀽鑹插僵鎯呯华
   */
  private static analyzeMood(colors: Color[]): string {
    let totalSaturation = 0
    let totalLightness = 0
    
    for (const color of colors) {
      const hsl = color.toHSL()
      totalSaturation += hsl.s
      totalLightness += hsl.l
    }
    
    const avgSaturation = totalSaturation / colors.length
    const avgLightness = totalLightness / colors.length
    
    if (avgSaturation > 70 && avgLightness > 50) {
      return '娲诲姏鍏呮矝'
    } else if (avgSaturation < 30 && avgLightness > 70) {
      return '娓呮柊娣￠泤'
    } else if (avgLightness < 30) {
      return '娣辨矇绁炵'
    } else if (avgSaturation > 60) {
      return '鐑儏濂旀斁'
    } else {
      return '骞冲拰鑷劧'
    }
  }
  
  /**
   * 鍒嗘瀽鑹叉俯
   */
  private static analyzeTemperature(dominantHues: number[]): 'warm' | 'cool' | 'neutral' {
    if (dominantHues.length === 0) return 'neutral'
    
    let warmCount = 0
    let coolCount = 0
    
    for (const hue of dominantHues) {
      if (hue >= 0 && hue <= 60 || hue >= 300 && hue <= 360) {
        warmCount++ // 绾€佹銆侀粍
      } else if (hue >= 120 && hue <= 240) {
        coolCount++ // 缁裤€侀潚銆佽摑
      }
    }
    
    if (warmCount > coolCount) return 'warm'
    if (coolCount > warmCount) return 'cool'
    return 'neutral'
  }
}

// 瀵煎嚭渚挎嵎鍑芥暟
export const extractPalette = ColorAnalyzer.extractPalette.bind(ColorAnalyzer)
export const findDominantColors = ColorAnalyzer.findDominantColors.bind(ColorAnalyzer)
export const analyzeColorDistribution = ColorAnalyzer.analyzeColorDistribution.bind(ColorAnalyzer)
export const generateColorReport = ColorAnalyzer.generateColorReport.bind(ColorAnalyzer)

