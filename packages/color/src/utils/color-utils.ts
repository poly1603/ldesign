/**
 * 颜色工具函数 - 混合、对比度计算等高级功能
 */

import type { RGB } from './color-converter'
import { clamp, hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from './color-converter'

/**
 * 颜色混合模式
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'

/**
 * 渐变方向
 */
export type GradientDirection =
  | 'to-right'
  | 'to-left'
  | 'to-bottom'
  | 'to-top'
  | 'to-bottom-right'
  | 'to-bottom-left'
  | 'to-top-right'
  | 'to-top-left'

/**
 * 渐变色阶
 */
export interface GradientStop {
  color: string
  position: number // 0-100
}

/**
 * 渐变配置
 */
export interface GradientConfig {
  direction: GradientDirection
  stops: GradientStop[]
}

/**
 * 计算两个颜色的对比度比值
 * 基于 WCAG 2.1 标准
 * @param color1 第一个颜色 (hex)
 * @param color2 第二个颜色 (hex)
 * @returns 对比度比值 (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color provided')
  }

  const l1 = getRelativeLuminance(rgb1)
  const l2 = getRelativeLuminance(rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 计算颜色的相对亮度
 * 基于 WCAG 2.1 标准
 */
function getRelativeLuminance(rgb: RGB): number {
  const { r, g, b } = rgb

  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * 检查颜色对比度是否符合 WCAG AA 标准
 * @param foreground 前景色 (hex)
 * @param background 背景色 (hex)
 * @param level 'AA' | 'AAA'
 * @param size 'normal' | 'large'
 * @returns 是否符合标准
 */
export function isAccessible(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal',
): boolean {
  const ratio = getContrastRatio(foreground, background)

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  }

  return size === 'large' ? ratio >= 3 : ratio >= 4.5
}

/**
 * 混合两个颜色
 * @param color1 第一个颜色 (hex)
 * @param color2 第二个颜色 (hex)
 * @param mode 混合模式
 * @param opacity 第二个颜色的不透明度 (0-1)
 * @returns 混合后的颜色 (hex)
 */
export function blendColors(
  color1: string,
  color2: string,
  mode: BlendMode = 'normal',
  opacity: number = 1,
): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color provided')
  }

  opacity = clamp(opacity, 0, 1)

  let result: RGB

  switch (mode) {
    case 'normal':
      result = blendNormal(rgb1, rgb2, opacity)
      break
    case 'multiply':
      result = blendMultiply(rgb1, rgb2, opacity)
      break
    case 'screen':
      result = blendScreen(rgb1, rgb2, opacity)
      break
    case 'overlay':
      result = blendOverlay(rgb1, rgb2, opacity)
      break
    case 'soft-light':
      result = blendSoftLight(rgb1, rgb2, opacity)
      break
    case 'hard-light':
      result = blendHardLight(rgb1, rgb2, opacity)
      break
    case 'color-dodge':
      result = blendColorDodge(rgb1, rgb2, opacity)
      break
    case 'color-burn':
      result = blendColorBurn(rgb1, rgb2, opacity)
      break
    case 'darken':
      result = blendDarken(rgb1, rgb2, opacity)
      break
    case 'lighten':
      result = blendLighten(rgb1, rgb2, opacity)
      break
    case 'difference':
      result = blendDifference(rgb1, rgb2, opacity)
      break
    case 'exclusion':
      result = blendExclusion(rgb1, rgb2, opacity)
      break
    default:
      result = blendNormal(rgb1, rgb2, opacity)
  }

  return rgbToHex(result.r, result.g, result.b)
}

/**
 * 正常混合模式
 */
function blendNormal(base: RGB, overlay: RGB, opacity: number): RGB {
  return {
    r: Math.round(base.r * (1 - opacity) + overlay.r * opacity),
    g: Math.round(base.g * (1 - opacity) + overlay.g * opacity),
    b: Math.round(base.b * (1 - opacity) + overlay.b * opacity),
  }
}

/**
 * 正片叠底混合模式
 */
function blendMultiply(base: RGB, overlay: RGB, opacity: number): RGB {
  const result = {
    r: (base.r * overlay.r) / 255,
    g: (base.g * overlay.g) / 255,
    b: (base.b * overlay.b) / 255,
  }

  return blendNormal(base, result, opacity)
}

/**
 * 滤色混合模式
 */
function blendScreen(base: RGB, overlay: RGB, opacity: number): RGB {
  const result = {
    r: 255 - ((255 - base.r) * (255 - overlay.r)) / 255,
    g: 255 - ((255 - base.g) * (255 - overlay.g)) / 255,
    b: 255 - ((255 - base.b) * (255 - overlay.b)) / 255,
  }

  return blendNormal(base, result, opacity)
}

/**
 * 叠加混合模式
 */
function blendOverlay(base: RGB, overlay: RGB, opacity: number): RGB {
  const blendChannel = (base: number, overlay: number) => {
    return base < 128
      ? (2 * base * overlay) / 255
      : 255 - (2 * (255 - base) * (255 - overlay)) / 255
  }

  const result = {
    r: blendChannel(base.r, overlay.r),
    g: blendChannel(base.g, overlay.g),
    b: blendChannel(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 柔光混合模式
 */
function blendSoftLight(base: RGB, overlay: RGB, opacity: number): RGB {
  const blendChannel = (base: number, overlay: number) => {
    base /= 255
    overlay /= 255

    if (overlay < 0.5) {
      return 255 * (base - (1 - 2 * overlay) * base * (1 - base))
    }
    else {
      const d = base < 0.25
        ? ((16 * base - 12) * base + 4) * base
        : Math.sqrt(base)
      return 255 * (base + (2 * overlay - 1) * (d - base))
    }
  }

  const result = {
    r: blendChannel(base.r, overlay.r),
    g: blendChannel(base.g, overlay.g),
    b: blendChannel(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 强光混合模式
 */
function blendHardLight(base: RGB, overlay: RGB, opacity: number): RGB {
  const blendChannel = (base: number, overlay: number) => {
    return overlay < 128
      ? (2 * base * overlay) / 255
      : 255 - (2 * (255 - base) * (255 - overlay)) / 255
  }

  const result = {
    r: blendChannel(base.r, overlay.r),
    g: blendChannel(base.g, overlay.g),
    b: blendChannel(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 颜色减淡混合模式
 */
function blendColorDodge(base: RGB, overlay: RGB, opacity: number): RGB {
  const blendChannel = (base: number, overlay: number) => {
    return overlay === 255 ? 255 : Math.min(255, (base * 255) / (255 - overlay))
  }

  const result = {
    r: blendChannel(base.r, overlay.r),
    g: blendChannel(base.g, overlay.g),
    b: blendChannel(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 颜色加深混合模式
 */
function blendColorBurn(base: RGB, overlay: RGB, opacity: number): RGB {
  const blendChannel = (base: number, overlay: number) => {
    return overlay === 0 ? 0 : Math.max(0, 255 - ((255 - base) * 255) / overlay)
  }

  const result = {
    r: blendChannel(base.r, overlay.r),
    g: blendChannel(base.g, overlay.g),
    b: blendChannel(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 变暗混合模式
 */
function blendDarken(base: RGB, overlay: RGB, opacity: number): RGB {
  const result = {
    r: Math.min(base.r, overlay.r),
    g: Math.min(base.g, overlay.g),
    b: Math.min(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 变亮混合模式
 */
function blendLighten(base: RGB, overlay: RGB, opacity: number): RGB {
  const result = {
    r: Math.max(base.r, overlay.r),
    g: Math.max(base.g, overlay.g),
    b: Math.max(base.b, overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 差值混合模式
 */
function blendDifference(base: RGB, overlay: RGB, opacity: number): RGB {
  const result = {
    r: Math.abs(base.r - overlay.r),
    g: Math.abs(base.g - overlay.g),
    b: Math.abs(base.b - overlay.b),
  }

  return blendNormal(base, result, opacity)
}

/**
 * 排除混合模式
 */
function blendExclusion(base: RGB, overlay: RGB, opacity: number): RGB {
  const result = {
    r: base.r + overlay.r - (2 * base.r * overlay.r) / 255,
    g: base.g + overlay.g - (2 * base.g * overlay.g) / 255,
    b: base.b + overlay.b - (2 * base.b * overlay.b) / 255,
  }

  return blendNormal(base, result, opacity)
}

/**
 * 生成线性渐变 CSS
 * @param config 渐变配置
 * @returns CSS 渐变字符串
 */
export function generateLinearGradient(config: GradientConfig): string {
  const { direction, stops } = config

  // 转换方向为 CSS 值
  const directionMap: Record<GradientDirection, string> = {
    'to-right': 'to right',
    'to-left': 'to left',
    'to-bottom': 'to bottom',
    'to-top': 'to top',
    'to-bottom-right': 'to bottom right',
    'to-bottom-left': 'to bottom left',
    'to-top-right': 'to top right',
    'to-top-left': 'to top left',
  }

  const cssDirection = directionMap[direction]
  const cssStops = stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')

  return `linear-gradient(${cssDirection}, ${cssStops})`
}

/**
 * 生成径向渐变 CSS
 * @param stops 渐变色阶
 * @param shape 形状 ('circle' | 'ellipse')
 * @param size 大小
 * @returns CSS 渐变字符串
 */
export function generateRadialGradient(
  stops: GradientStop[],
  shape: 'circle' | 'ellipse' = 'circle',
  size: string = 'closest-side',
): string {
  const cssStops = stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')

  return `radial-gradient(${shape} ${size}, ${cssStops})`
}

/**
 * 在两个颜色之间插值
 * @param color1 起始颜色 (hex)
 * @param color2 结束颜色 (hex)
 * @param factor 插值因子 (0-1)
 * @returns 插值后的颜色 (hex)
 */
export function interpolateColors(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color provided')
  }

  factor = clamp(factor, 0, 1)

  const result = {
    r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor),
    g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor),
    b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor),
  }

  return rgbToHex(result.r, result.g, result.b)
}

/**
 * 生成颜色渐变序列
 * @param startColor 起始颜色 (hex)
 * @param endColor 结束颜色 (hex)
 * @param steps 步数
 * @returns 颜色数组
 */
export function generateColorGradient(startColor: string, endColor: string, steps: number): string[] {
  if (steps < 2) {
    throw new Error('Steps must be at least 2')
  }

  const colors: string[] = []

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1)
    colors.push(interpolateColors(startColor, endColor, factor))
  }

  return colors
}

/**
 * 调整颜色亮度
 * @param color 颜色 (hex)
 * @param amount 调整量 (-100 到 100)
 * @returns 调整后的颜色 (hex)
 */
export function adjustBrightness(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  amount = clamp(amount, -100, 100)
  const factor = amount / 100

  const adjust = (value: number) => {
    if (factor > 0) {
      return Math.round(value + (255 - value) * factor)
    }
    else {
      return Math.round(value + value * factor)
    }
  }

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b))
}

/**
 * 调整颜色饱和度
 * @param color 颜色 (hex)
 * @param amount 调整量 (-100 到 100)
 * @returns 调整后的颜色 (hex)
 */
export function adjustSaturation(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  amount = clamp(amount, -100, 100)

  hsl.s = clamp(hsl.s + amount, 0, 100)

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * 调整颜色色相
 * @param color 颜色 (hex)
 * @param amount 调整量 (-360 到 360)
 * @returns 调整后的颜色 (hex)
 */
export function adjustHue(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hsl.h = (hsl.h + amount) % 360
  if (hsl.h < 0)
    hsl.h += 360

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * 生成单色调色板
 * @param baseColor 基础颜色 (hex)
 * @param count 颜色数量
 * @returns 调色板颜色数组
 */
export function generateMonochromaticPalette(baseColor: string, count: number = 5): string[] {
  if (count < 1) {
    throw new Error('Count must be at least 1')
  }

  const colors: string[] = []
  const step = 80 / (count - 1) // 亮度变化范围

  for (let i = 0; i < count; i++) {
    const brightness = -40 + step * i // 从 -40 到 +40
    colors.push(adjustBrightness(baseColor, brightness))
  }

  return colors
}

/**
 * 生成类似色调色板
 * @param baseColor 基础颜色 (hex)
 * @param count 颜色数量
 * @returns 调色板颜色数组
 */
export function generateAnalogousPalette(baseColor: string, count: number = 5): string[] {
  if (count < 1) {
    throw new Error('Count must be at least 1')
  }

  const colors: string[] = []
  const hueStep = 60 / (count - 1) // 色相变化范围

  for (let i = 0; i < count; i++) {
    const hueShift = -30 + hueStep * i // 从 -30 到 +30 度
    colors.push(adjustHue(baseColor, hueShift))
  }

  return colors
}

/**
 * 生成互补色调色板
 * @param baseColor 基础颜色 (hex)
 * @returns 调色板颜色数组
 */
export function generateComplementaryPalette(baseColor: string): string[] {
  return [
    baseColor,
    adjustHue(baseColor, 180), // 互补色
  ]
}

/**
 * 生成三元色调色板
 * @param baseColor 基础颜色 (hex)
 * @returns 调色板颜色数组
 */
export function generateTriadicPalette(baseColor: string): string[] {
  return [
    baseColor,
    adjustHue(baseColor, 120),
    adjustHue(baseColor, 240),
  ]
}

/**
 * 生成四元色调色板
 * @param baseColor 基础颜色 (hex)
 * @returns 调色板颜色数组
 */
export function generateTetradicPalette(baseColor: string): string[] {
  return [
    baseColor,
    adjustHue(baseColor, 90),
    adjustHue(baseColor, 180),
    adjustHue(baseColor, 270),
  ]
}

/**
 * 获取颜色的感知亮度
 * 基于 ITU-R BT.709 标准
 * @param color 颜色 (hex)
 * @returns 感知亮度 (0-255)
 */
export function getPerceivedBrightness(color: string): number {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  // ITU-R BT.709 权重
  return Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)
}

/**
 * 判断颜色是否为深色
 * @param color 颜色 (hex)
 * @param threshold 阈值 (0-255)
 * @returns 是否为深色
 */
export function isDark(color: string, threshold: number = 128): boolean {
  return getPerceivedBrightness(color) < threshold
}

/**
 * 判断颜色是否为浅色
 * @param color 颜色 (hex)
 * @param threshold 阈值 (0-255)
 * @returns 是否为浅色
 */
export function isLight(color: string, threshold: number = 128): boolean {
  return !isDark(color, threshold)
}

/**
 * 获取最佳文本颜色（黑色或白色）
 * @param backgroundColor 背景颜色 (hex)
 * @returns 最佳文本颜色 (hex)
 */
export function getBestTextColor(backgroundColor: string): string {
  return isDark(backgroundColor) ? '#ffffff' : '#000000'
}
