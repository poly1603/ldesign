/**
 * 高级颜色分析工具
 * 提供颜色情感分析、品牌识别、趋势分析等功能
 */

import { hexToHsl, hexToRgb, rgbToHex } from './color-converter'
import { getContrastRatio } from './color-utils'

/**
 * 颜色情感类型
 */
export type ColorEmotion =
  | 'energetic' // 充满活力
  | 'calm' // 平静
  | 'warm' // 温暖
  | 'cool' // 冷静
  | 'professional' // 专业
  | 'playful' // 活泼
  | 'luxurious' // 奢华
  | 'natural' // 自然
  | 'modern' // 现代
  | 'vintage' // 复古

/**
 * 颜色季节类型
 */
export type ColorSeason = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * 颜色温度
 */
export type ColorTemperature = 'cold' | 'cool' | 'neutral' | 'warm' | 'hot'

/**
 * 颜色分析结果
 */
export interface ColorAnalysis {
  /** 主要颜色 */
  color: string
  /** RGB 值 */
  rgb: { r: number, g: number, b: number }
  /** HSL 值 */
  hsl: { h: number, s: number, l: number }
  /** 颜色名称 */
  name: string
  /** 颜色情感 */
  emotions: ColorEmotion[]
  /** 季节属性 */
  season: ColorSeason
  /** 温度感知 */
  temperature: ColorTemperature
  /** 饱和度等级 */
  saturationLevel: 'desaturated' | 'muted' | 'moderate' | 'saturated' | 'vivid'
  /** 亮度等级 */
  brightnessLevel: 'very-dark' | 'dark' | 'medium' | 'light' | 'very-light'
  /** 使用建议 */
  suggestions: {
    /** 最佳搭配色 */
    bestMatches: string[]
    /** 避免搭配 */
    avoidWith: string[]
    /** 适用场景 */
    useCases: string[]
    /** 行业推荐 */
    industries: string[]
  }
  /** 可访问性分数 */
  accessibilityScore: number
  /** 流行度分数 (0-100) */
  popularityScore: number
}

/**
 * 颜色名称数据库
 */
const COLOR_NAMES: Record<string, string> = {
  '#FF0000': 'Red',
  '#00FF00': 'Lime',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#FF00FF': 'Magenta',
  '#00FFFF': 'Cyan',
  '#FFA500': 'Orange',
  '#800080': 'Purple',
  '#FFC0CB': 'Pink',
  '#A52A2A': 'Brown',
  '#808080': 'Gray',
  '#000000': 'Black',
  '#FFFFFF': 'White',
  // 添加更多颜色...
}

/**
 * 行业颜色偏好
 */
const INDUSTRY_COLORS: Record<string, string[]> = {
  technology: ['#0066CC', '#00A4E4', '#7C4DFF', '#212121'],
  healthcare: ['#00A859', '#0085CA', '#41B6E6', '#FFFFFF'],
  finance: ['#003087', '#00539B', '#78BE20', '#525252'],
  education: ['#003F87', '#FF6B35', '#F7931E', '#8CC63F'],
  retail: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
  food: ['#D32F2F', '#FFA000', '#388E3C', '#5D4037'],
  fashion: ['#000000', '#FF1493', '#FFD700', '#C0C0C0'],
  sports: ['#FF4500', '#1E90FF', '#32CD32', '#FFD700'],
  entertainment: ['#FF1744', '#AA00FF', '#00E676', '#FFEA00'],
  travel: ['#00BCD4', '#4CAF50', '#FFC107', '#FF5722'],
}

/**
 * 分析颜色
 */
export function analyzeColor(color: string): ColorAnalysis {
  const rgb = hexToRgb(color)
  const hsl = hexToHsl(color)

  if (!rgb || !hsl) {
    throw new Error('Invalid color format')
  }

  return {
    color,
    rgb,
    hsl,
    name: getColorName(color),
    emotions: analyzeEmotions(hsl),
    season: analyzeSeason(hsl),
    temperature: analyzeTemperature(hsl),
    saturationLevel: analyzeSaturation(hsl.s),
    brightnessLevel: analyzeBrightness(hsl.l),
    suggestions: generateSuggestions(color, hsl),
    accessibilityScore: calculateAccessibilityScore(color),
    popularityScore: calculatePopularityScore(color),
  }
}

/**
 * 获取颜色名称
 */
export function getColorName(color: string): string {
  // 精确匹配
  if (COLOR_NAMES[color.toUpperCase()]) {
    return COLOR_NAMES[color.toUpperCase()]
  }

  // 查找最近的颜色
  const rgb = hexToRgb(color)
  if (!rgb)
    return 'Unknown'

  let closestColor = ''
  let minDistance = Infinity

  for (const [hex, name] of Object.entries(COLOR_NAMES)) {
    const targetRgb = hexToRgb(hex)
    if (!targetRgb)
      continue

    const distance = Math.sqrt(
      (rgb.r - targetRgb.r) ** 2
      + (rgb.g - targetRgb.g) ** 2
      + (rgb.b - targetRgb.b) ** 2,
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = name
    }
  }

  return closestColor || 'Custom'
}

/**
 * 分析颜色情感
 */
function analyzeEmotions(hsl: { h: number, s: number, l: number }): ColorEmotion[] {
  const emotions: ColorEmotion[] = []
  const { h, s, l } = hsl

  // 基于色相分析
  if (h >= 0 && h < 30) {
    emotions.push('energetic', 'warm')
  }
  else if (h >= 30 && h < 60) {
    emotions.push('playful', 'warm')
  }
  else if (h >= 60 && h < 150) {
    emotions.push('natural', 'calm')
  }
  else if (h >= 150 && h < 250) {
    emotions.push('cool', 'professional')
  }
  else if (h >= 250 && h < 330) {
    emotions.push('luxurious', 'modern')
  }
  else {
    emotions.push('energetic', 'playful')
  }

  // 基于饱和度分析
  if (s < 20) {
    emotions.push('professional', 'modern')
  }
  else if (s > 70) {
    emotions.push('playful', 'energetic')
  }

  // 基于亮度分析
  if (l < 30) {
    emotions.push('luxurious', 'professional')
  }
  else if (l > 70) {
    emotions.push('calm', 'playful')
  }

  // 去重
  return [...new Set(emotions)]
}

/**
 * 分析颜色季节
 */
function analyzeSeason(hsl: { h: number, s: number, l: number }): ColorSeason {
  const { h, s, l } = hsl

  // 春季：明亮、清新的色彩
  if (h >= 60 && h < 150 && s > 40 && l > 50) {
    return 'spring'
  }

  // 夏季：柔和、冷调的色彩
  if (h >= 150 && h < 250 && s < 60 && l > 40) {
    return 'summer'
  }

  // 秋季：温暖、饱和的色彩
  if (((h >= 0 && h < 60) || h >= 300) && s > 30 && l < 70) {
    return 'autumn'
  }

  // 冬季：冷调、高对比的色彩
  return 'winter'
}

/**
 * 分析颜色温度
 */
function analyzeTemperature(hsl: { h: number, s: number, l: number }): ColorTemperature {
  const { h } = hsl

  if ((h >= 0 && h < 60) || h >= 300) {
    return (h < 30 || h >= 330) ? 'hot' : 'warm'
  }
  else if (h >= 60 && h < 150) {
    return 'neutral'
  }
  else if (h >= 150 && h < 250) {
    return h < 200 ? 'cool' : 'cold'
  }
  else {
    return 'cool'
  }
}

/**
 * 分析饱和度等级
 */
function analyzeSaturation(saturation: number): ColorAnalysis['saturationLevel'] {
  if (saturation < 10)
    return 'desaturated'
  if (saturation < 30)
    return 'muted'
  if (saturation < 60)
    return 'moderate'
  if (saturation < 80)
    return 'saturated'
  return 'vivid'
}

/**
 * 分析亮度等级
 */
function analyzeBrightness(lightness: number): ColorAnalysis['brightnessLevel'] {
  if (lightness < 20)
    return 'very-dark'
  if (lightness < 40)
    return 'dark'
  if (lightness < 60)
    return 'medium'
  if (lightness < 80)
    return 'light'
  return 'very-light'
}

/**
 * 生成使用建议
 */
function generateSuggestions(
  color: string,
  hsl: { h: number, s: number, l: number },
): ColorAnalysis['suggestions'] {
  const bestMatches: string[] = []
  const avoidWith: string[] = []
  const useCases: string[] = []
  const industries: string[] = []

  // 生成最佳搭配
  // 互补色
  const complementHue = (hsl.h + 180) % 360
  bestMatches.push(hslToHex(complementHue, hsl.s, hsl.l))

  // 类似色
  const analogous1 = (hsl.h + 30) % 360
  const analogous2 = (hsl.h - 30 + 360) % 360
  bestMatches.push(hslToHex(analogous1, hsl.s, hsl.l))
  bestMatches.push(hslToHex(analogous2, hsl.s, hsl.l))

  // 避免搭配（饱和度和亮度相近但色相略有不同的颜色）
  const avoidHue1 = (hsl.h + 15) % 360
  const avoidHue2 = (hsl.h - 15 + 360) % 360
  avoidWith.push(hslToHex(avoidHue1, hsl.s, hsl.l))
  avoidWith.push(hslToHex(avoidHue2, hsl.s, hsl.l))

  // 使用场景建议
  if (hsl.s < 30 && hsl.l > 40 && hsl.l < 60) {
    useCases.push('Corporate design', 'Professional documents')
  }
  if (hsl.s > 60) {
    useCases.push('Call-to-action buttons', 'Highlights', 'Branding')
  }
  if (hsl.l > 70) {
    useCases.push('Backgrounds', 'Light themes')
  }
  if (hsl.l < 30) {
    useCases.push('Text', 'Dark themes', 'Luxury branding')
  }

  // 行业推荐
  for (const [industry, colors] of Object.entries(INDUSTRY_COLORS)) {
    if (colors.some((c) => {
      const industryRgb = hexToRgb(c)
      const colorRgb = hexToRgb(color)
      if (!industryRgb || !colorRgb)
        return false

      const distance = Math.sqrt(
        (colorRgb.r - industryRgb.r) ** 2
        + (colorRgb.g - industryRgb.g) ** 2
        + (colorRgb.b - industryRgb.b) ** 2,
      )
      return distance < 50
    })) {
      industries.push(industry)
    }
  }

  return {
    bestMatches,
    avoidWith,
    useCases,
    industries,
  }
}

/**
 * 计算可访问性分数
 */
function calculateAccessibilityScore(color: string): number {
  // 计算与白色和黑色的对比度
  const whiteContrast = getContrastRatio(color, '#FFFFFF')
  const blackContrast = getContrastRatio(color, '#000000')

  // 最佳对比度是 7:1 或更高（WCAG AAA）
  const maxContrast = Math.max(whiteContrast, blackContrast)

  if (maxContrast >= 7)
    return 100
  if (maxContrast >= 4.5)
    return 80
  if (maxContrast >= 3)
    return 60
  if (maxContrast >= 2)
    return 40
  return 20
}

/**
 * 计算流行度分数
 */
function calculatePopularityScore(color: string): number {
  // 这里可以基于实际数据或趋势分析
  // 简化版本：基于常见品牌色和网页设计趋势

  const popularColors = [
    '#000000',
    '#FFFFFF', // 经典黑白
    '#FF0000',
    '#00FF00',
    '#0000FF', // 基础色
    '#007AFF', // iOS 蓝
    '#4285F4', // Google 蓝
    '#1DA1F2', // Twitter 蓝
    '#FF6B6B', // 流行的珊瑚色
    '#4ECDC4', // 流行的青色
    '#45B7D1', // 流行的天蓝色
  ]

  const rgb = hexToRgb(color)
  if (!rgb)
    return 50

  let minDistance = Infinity

  for (const popular of popularColors) {
    const popRgb = hexToRgb(popular)
    if (!popRgb)
      continue

    const distance = Math.sqrt(
      (rgb.r - popRgb.r) ** 2
      + (rgb.g - popRgb.g) ** 2
      + (rgb.b - popRgb.b) ** 2,
    )

    minDistance = Math.min(minDistance, distance)
  }

  // 距离越小，流行度越高
  const score = Math.max(0, 100 - (minDistance / 255 * 100))
  return Math.round(score)
}

/**
 * 批量分析颜色
 */
export function analyzeColors(colors: string[]): ColorAnalysis[] {
  return colors.map(color => analyzeColor(color))
}

/**
 * 查找相似颜色
 */
export function findSimilarColors(
  color: string,
  threshold: number = 30,
): string[] {
  const rgb = hexToRgb(color)
  if (!rgb)
    return []

  const similar: string[] = []

  // 生成相似颜色
  for (let dr = -threshold; dr <= threshold; dr += 10) {
    for (let dg = -threshold; dg <= threshold; dg += 10) {
      for (let db = -threshold; db <= threshold; db += 10) {
        if (dr === 0 && dg === 0 && db === 0)
          continue

        const r = Math.max(0, Math.min(255, rgb.r + dr))
        const g = Math.max(0, Math.min(255, rgb.g + dg))
        const b = Math.max(0, Math.min(255, rgb.b + db))

        similar.push(rgbToHex(r, g, b))
      }
    }
  }

  return similar
}

/**
 * 提取图片主色调（需要在浏览器环境中使用）
 */
export async function extractDominantColors(
  imageUrl: string,
  count: number = 5,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // 缩小图片以提高性能
      const scaleFactor = Math.min(1, 100 / Math.max(img.width, img.height))
      canvas.width = img.width * scaleFactor
      canvas.height = img.height * scaleFactor

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      // 使用简单的颜色量化算法
      const colorMap = new Map<string, number>()

      for (let i = 0; i < pixels.length; i += 4) {
        // 量化颜色值
        const r = Math.round(pixels[i] / 32) * 32
        const g = Math.round(pixels[i + 1] / 32) * 32
        const b = Math.round(pixels[i + 2] / 32) * 32

        const hex = rgbToHex(r, g, b)
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
      }

      // 按频率排序并返回前N个颜色
      const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([color]) => color)

      resolve(sorted)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageUrl
  })
}

/**
 * 颜色和谐度评分
 */
export function calculateHarmonyScore(colors: string[]): number {
  if (colors.length < 2)
    return 100

  let totalScore = 0
  let comparisons = 0

  for (let i = 0; i < colors.length - 1; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const hsl1 = hexToHsl(colors[i])
      const hsl2 = hexToHsl(colors[j])

      if (!hsl1 || !hsl2)
        continue

      // 计算色相差异
      const hueDiff = Math.abs(hsl1.h - hsl2.h)
      const effectiveHueDiff = Math.min(hueDiff, 360 - hueDiff)

      // 理想的色相差异：0（同色）、30（类似）、120（三角）、180（互补）
      const idealDiffs = [0, 30, 60, 90, 120, 150, 180]
      const minDiff = Math.min(...idealDiffs.map(ideal => Math.abs(effectiveHueDiff - ideal)))

      // 基于理想差异计算分数
      const hueScore = Math.max(0, 100 - minDiff * 2)

      // 考虑饱和度和亮度的平衡
      const saturationBalance = 100 - Math.abs(hsl1.s - hsl2.s)
      const lightnessBalance = 100 - Math.abs(hsl1.l - hsl2.l)

      // 综合评分
      const pairScore = (hueScore * 0.6 + saturationBalance * 0.2 + lightnessBalance * 0.2)

      totalScore += pairScore
      comparisons++
    }
  }

  return comparisons > 0 ? Math.round(totalScore / comparisons) : 100
}

// 辅助函数：HSL 到 HEX 转换
function hslToHex(h: number, s: number, l: number): string {
  // 转换为 0-1 范围
  s = s / 100
  l = l / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r = 0; let g = 0; let b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  }
  else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  }
  else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  }
  else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  }
  else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  }
  else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return rgbToHex(r, g, b)
}
