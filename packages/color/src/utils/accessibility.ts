/**
 * 颜色可访问性检查工具
 * 基于 WCAG 2.1 和 WCAG 3.0 标准
 */

import type { RGB } from './color-converter'
import { hexToRgb } from './color-converter'
import { getContrastRatio, getPerceivedBrightness } from './color-utils'

/**
 * WCAG 等级
 */
export type WCAGLevel = 'AA' | 'AAA'

/**
 * 文本大小类型
 */
export type TextSize = 'normal' | 'large'

/**
 * 颜色盲类型
 */
export type ColorBlindnessType =
  | 'protanopia' // 红色盲
  | 'deuteranopia' // 绿色盲
  | 'tritanopia' // 蓝色盲
  | 'protanomaly' // 红色弱
  | 'deuteranomaly' // 绿色弱
  | 'tritanomaly' // 蓝色弱
  | 'achromatopsia' // 全色盲
  | 'achromatomaly' // 色弱

/**
 * 可访问性检查结果
 */
export interface AccessibilityResult {
  isAccessible: boolean
  contrastRatio: number
  level: WCAGLevel | null
  recommendations: string[]
}

/**
 * 颜色盲模拟结果
 */
export interface ColorBlindnessSimulation {
  original: string
  simulated: string
  type: ColorBlindnessType
  severity: number // 0-1
}

/**
 * 检查颜色对比度是否符合 WCAG 标准
 * @param foreground 前景色 (hex)
 * @param background 背景色 (hex)
 * @param textSize 文本大小
 * @returns 可访问性检查结果
 */
export function checkAccessibility(
  foreground: string,
  background: string,
  textSize: TextSize = 'normal',
): AccessibilityResult {
  const contrastRatio = getContrastRatio(foreground, background)
  const recommendations: string[] = []

  // WCAG 2.1 标准
  const aaThreshold = textSize === 'large' ? 3 : 4.5
  const aaaThreshold = textSize === 'large' ? 4.5 : 7

  let isAccessible = false
  let level: WCAGLevel | null = null

  if (contrastRatio >= aaaThreshold) {
    isAccessible = true
    level = 'AAA'
  }
  else if (contrastRatio >= aaThreshold) {
    isAccessible = true
    level = 'AA'
  }
  else {
    // 提供改进建议
    if (contrastRatio < aaThreshold) {
      const needed = aaThreshold - contrastRatio
      recommendations.push(`需要提高对比度 ${needed.toFixed(2)} 以达到 WCAG AA 标准`)

      if (getPerceivedBrightness(foreground) > getPerceivedBrightness(background)) {
        recommendations.push('建议使用更深的前景色或更浅的背景色')
      }
      else {
        recommendations.push('建议使用更浅的前景色或更深的背景色')
      }
    }
  }

  return {
    isAccessible,
    contrastRatio,
    level,
    recommendations,
  }
}

/**
 * 获取符合 WCAG 标准的颜色建议
 * @param baseColor 基础颜色 (hex)
 * @param targetLevel 目标 WCAG 等级
 * @param textSize 文本大小
 * @returns 建议的前景色和背景色组合
 */
export function getAccessibleColorSuggestions(
  baseColor: string,
  targetLevel: WCAGLevel = 'AA',
  textSize: TextSize = 'normal',
): { foreground: string, background: string }[] {
  const suggestions: { foreground: string, background: string }[] = []
  const threshold = getAccessibilityThreshold(targetLevel, textSize)

  // 生成深色和浅色变体
  const darkVariants = generateColorVariants(baseColor, 'dark')
  const lightVariants = generateColorVariants(baseColor, 'light')

  // 测试所有组合
  for (const dark of darkVariants) {
    for (const light of lightVariants) {
      const ratio = getContrastRatio(dark, light)
      if (ratio >= threshold) {
        suggestions.push({ foreground: dark, background: light })
        suggestions.push({ foreground: light, background: dark })
      }
    }
  }

  // 去重并按对比度排序
  const uniqueSuggestions = suggestions
    .filter(
      (item, index, self) =>
        index
        === self.findIndex(t => t.foreground === item.foreground && t.background === item.background),
    )
    .sort(
      (a, b) =>
        getContrastRatio(b.foreground, b.background) - getContrastRatio(a.foreground, a.background),
    )

  return uniqueSuggestions.slice(0, 10) // 返回前10个建议
}

/**
 * 模拟颜色盲视觉效果
 * @param color 原始颜色 (hex)
 * @param type 颜色盲类型
 * @param severity 严重程度 (0-1)
 * @returns 模拟结果
 */
export function simulateColorBlindness(
  color: string,
  type: ColorBlindnessType,
  severity: number = 1,
): ColorBlindnessSimulation {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  severity = Math.max(0, Math.min(1, severity))

  let simulatedRgb: RGB

  switch (type) {
    case 'protanopia':
      simulatedRgb = simulateProtanopia(rgb, severity)
      break
    case 'deuteranopia':
      simulatedRgb = simulateDeuteranopia(rgb, severity)
      break
    case 'tritanopia':
      simulatedRgb = simulateTritanopia(rgb, severity)
      break
    case 'protanomaly':
      simulatedRgb = simulateProtanomaly(rgb, severity)
      break
    case 'deuteranomaly':
      simulatedRgb = simulateDeuteranomaly(rgb, severity)
      break
    case 'tritanomaly':
      simulatedRgb = simulateTritanomaly(rgb, severity)
      break
    case 'achromatopsia':
      simulatedRgb = simulateAchromatopsia(rgb, severity)
      break
    case 'achromatomaly':
      simulatedRgb = simulateAchromatomaly(rgb, severity)
      break
    default:
      simulatedRgb = rgb
  }

  return {
    original: color,
    simulated: rgbToHex(simulatedRgb),
    type,
    severity,
  }
}

/**
 * 检查颜色组合对颜色盲用户的可访问性
 * @param colors 颜色数组 (hex)
 * @param types 要检查的颜色盲类型
 * @returns 可访问性报告
 */
export function checkColorBlindnessAccessibility(
  colors: string[],
  types: ColorBlindnessType[] = ['protanopia', 'deuteranopia', 'tritanopia'],
): {
    type: ColorBlindnessType
    issues: { color1: string, color2: string, problem: string }[]
  }[] {
  const results: {
    type: ColorBlindnessType
    issues: { color1: string, color2: string, problem: string }[]
  }[] = []

  for (const type of types) {
    const issues: { color1: string, color2: string, problem: string }[] = []

    // 模拟所有颜色
    const simulatedColors = colors.map(color => simulateColorBlindness(color, type).simulated)

    // 检查颜色是否变得难以区分
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const originalRatio = getContrastRatio(colors[i], colors[j])
        const simulatedRatio = getContrastRatio(simulatedColors[i], simulatedColors[j])

        // 如果模拟后对比度显著降低
        if (simulatedRatio < originalRatio * 0.7 && simulatedRatio < 3) {
          issues.push({
            color1: colors[i],
            color2: colors[j],
            problem: `对比度从 ${originalRatio.toFixed(2)} 降低到 ${simulatedRatio.toFixed(2)}`,
          })
        }
      }
    }

    results.push({ type, issues })
  }

  return results
}

/**
 * 获取可访问性阈值
 */
function getAccessibilityThreshold(level: WCAGLevel, textSize: TextSize): number {
  if (level === 'AAA') {
    return textSize === 'large' ? 4.5 : 7
  }
  return textSize === 'large' ? 3 : 4.5
}

/**
 * 生成颜色变体
 */
function generateColorVariants(baseColor: string, direction: 'dark' | 'light'): string[] {
  const variants: string[] = []
  const steps = direction === 'dark' ? [-80, -60, -40, -20] : [20, 40, 60, 80]

  for (const step of steps) {
    try {
      const rgb = hexToRgb(baseColor)
      if (!rgb)
        continue

      // 简单的亮度调整
      const factor = step / 100
      const adjust = (value: number) => {
        if (factor > 0) {
          return Math.round(value + (255 - value) * factor)
        }
        else {
          return Math.round(value + value * factor)
        }
      }

      const adjustedRgb = {
        r: Math.max(0, Math.min(255, adjust(rgb.r))),
        g: Math.max(0, Math.min(255, adjust(rgb.g))),
        b: Math.max(0, Math.min(255, adjust(rgb.b))),
      }

      variants.push(rgbToHex(adjustedRgb))
    }
    catch {
      // 忽略无效颜色
    }
  }

  return variants
}

/**
 * 模拟红色盲 (Protanopia)
 */
function simulateProtanopia(rgb: RGB, severity: number): RGB {
  const { r, g, b } = rgb

  // 红色盲变换矩阵
  const newR = 0.567 * r + 0.433 * g + 0 * b
  const newG = 0.558 * r + 0.442 * g + 0 * b
  const newB = 0 * r + 0.242 * g + 0.758 * b

  return interpolateRgb(rgb, { r: newR, g: newG, b: newB }, severity)
}

/**
 * 模拟绿色盲 (Deuteranopia)
 */
function simulateDeuteranopia(rgb: RGB, severity: number): RGB {
  const { r, g, b } = rgb

  // 绿色盲变换矩阵
  const newR = 0.625 * r + 0.375 * g + 0 * b
  const newG = 0.7 * r + 0.3 * g + 0 * b
  const newB = 0 * r + 0.3 * g + 0.7 * b

  return interpolateRgb(rgb, { r: newR, g: newG, b: newB }, severity)
}

/**
 * 模拟蓝色盲 (Tritanopia)
 */
function simulateTritanopia(rgb: RGB, severity: number): RGB {
  const { r, g, b } = rgb

  // 蓝色盲变换矩阵
  const newR = 0.95 * r + 0.05 * g + 0 * b
  const newG = 0 * r + 0.433 * g + 0.567 * b
  const newB = 0 * r + 0.475 * g + 0.525 * b

  return interpolateRgb(rgb, { r: newR, g: newG, b: newB }, severity)
}

/**
 * 模拟红色弱 (Protanomaly)
 */
function simulateProtanomaly(rgb: RGB, severity: number): RGB {
  const protanopia = simulateProtanopia(rgb, 1)
  return interpolateRgb(rgb, protanopia, severity * 0.6)
}

/**
 * 模拟绿色弱 (Deuteranomaly)
 */
function simulateDeuteranomaly(rgb: RGB, severity: number): RGB {
  const deuteranopia = simulateDeuteranopia(rgb, 1)
  return interpolateRgb(rgb, deuteranopia, severity * 0.6)
}

/**
 * 模拟蓝色弱 (Tritanomaly)
 */
function simulateTritanomaly(rgb: RGB, severity: number): RGB {
  const tritanopia = simulateTritanopia(rgb, 1)
  return interpolateRgb(rgb, tritanopia, severity * 0.8)
}

/**
 * 模拟全色盲 (Achromatopsia)
 */
function simulateAchromatopsia(rgb: RGB, severity: number): RGB {
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)
  const grayRgb = { r: gray, g: gray, b: gray }

  return interpolateRgb(rgb, grayRgb, severity)
}

/**
 * 模拟色弱 (Achromatomaly)
 */
function simulateAchromatomaly(rgb: RGB, severity: number): RGB {
  const achromatopsia = simulateAchromatopsia(rgb, 1)
  return interpolateRgb(rgb, achromatopsia, severity * 0.5)
}

/**
 * RGB 颜色插值
 */
function interpolateRgb(rgb1: RGB, rgb2: RGB, factor: number): RGB {
  return {
    r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor),
    g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor),
    b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor),
  }
}

/**
 * RGB 转 Hex（临时函数，避免循环依赖）
 */
function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}
