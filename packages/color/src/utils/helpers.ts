import type { RGB, HSL, ColorInput } from '../types'
import { ColorConverter } from '../core/converter'

/**
 * 解析颜色输入
 */
export function parseColorInput(input: ColorInput): RGB {
  if (typeof input === 'string') {
    return parseColorString(input)
  }
  
  if ('r' in input && 'g' in input && 'b' in input) {
    return input as RGB
  }
  
  if ('h' in input && 's' in input && 'l' in input) {
    return ColorConverter.hslToRgb(input as HSL)
  }
  
  if ('h' in input && 's' in input && 'v' in input) {
    return ColorConverter.hsvToRgb(input as any)
  }
  
  if ('c' in input && 'm' in input && 'y' in input && 'k' in input) {
    return ColorConverter.cmykToRgb(input as any)
  }
  
  if ('l' in input && 'a' in input && 'b' in input) {
    return ColorConverter.labToRgb(input as any)
  }
  
  throw new Error(`Invalid color input: ${JSON.stringify(input)}`)
}

/**
 * 解析颜色字符串
 */
export function parseColorString(colorString: string): RGB {
  const trimmed = colorString.trim().toLowerCase()
  
  // HEX格式
  if (trimmed.startsWith('#')) {
    return parseHex(trimmed)
  }
  
  // RGB格式
  if (trimmed.startsWith('rgb(')) {
    return parseRgb(trimmed)
  }
  
  // RGBA格式
  if (trimmed.startsWith('rgba(')) {
    return parseRgba(trimmed)
  }
  
  // HSL格式
  if (trimmed.startsWith('hsl(')) {
    return parseHsl(trimmed)
  }
  
  // HSLA格式
  if (trimmed.startsWith('hsla(')) {
    return parseHsla(trimmed)
  }
  
  // 命名颜色
  const namedColor = parseNamedColor(trimmed)
  if (namedColor) {
    return namedColor
  }
  
  throw new Error(`Invalid color string: ${colorString}`)
}

/**
 * 解析HEX颜色
 */
function parseHex(hex: string): RGB {
  const cleanHex = hex.replace('#', '')
  
  if (cleanHex.length === 3) {
    // 短格式 #RGB -> #RRGGBB
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return { r, g, b }
  }
  
  if (cleanHex.length === 6) {
    // 标准格式 #RRGGBB
    return ColorConverter.hexToRgb('#' + cleanHex)
  }
  
  throw new Error(`Invalid hex color: ${hex}`)
}

/**
 * 解析RGB颜色
 */
function parseRgb(rgb: string): RGB {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) {
    throw new Error(`Invalid RGB color: ${rgb}`)
  }
  
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  }
}

/**
 * 解析RGBA颜色
 */
function parseRgba(rgba: string): RGB {
  const match = rgba.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/)
  if (!match) {
    throw new Error(`Invalid RGBA color: ${rgba}`)
  }
  
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  }
}

/**
 * 解析HSL颜色
 */
function parseHsl(hsl: string): RGB {
  const match = hsl.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/)
  if (!match) {
    throw new Error(`Invalid HSL color: ${hsl}`)
  }
  
  const hslColor: HSL = {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10)
  }
  
  return ColorConverter.hslToRgb(hslColor)
}

/**
 * 解析HSLA颜色
 */
function parseHsla(hsla: string): RGB {
  const match = hsla.match(/hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d.]+)\s*\)/)
  if (!match) {
    throw new Error(`Invalid HSLA color: ${hsla}`)
  }
  
  const hslColor: HSL = {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10)
  }
  
  return ColorConverter.hslToRgb(hslColor)
}

/**
 * 解析命名颜色
 */
function parseNamedColor(name: string): RGB | null {
  const namedColors: Record<string, string> = {
    // 基础颜色
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    silver: '#c0c0c0',
    gray: '#808080',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00ff00',
    aqua: '#00ffff',
    teal: '#008080',
    navy: '#000080',
    fuchsia: '#ff00ff',
    purple: '#800080',
    // 扩展颜色
    orange: '#ffa500',
    pink: '#ffc0cb',
    brown: '#a52a2a',
    gold: '#ffd700',
    violet: '#ee82ee',
    indigo: '#4b0082',
    turquoise: '#40e0d0',
    coral: '#ff7f50',
    salmon: '#fa8072',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    plum: '#dda0dd',
    orchid: '#da70d6',
    tan: '#d2b48c',
    beige: '#f5f5dc',
    mint: '#98fb98',
    azure: '#f0ffff',
    snow: '#fffafa',
    ivory: '#fffff0',
    linen: '#faf0e6'
  }
  
  const hex = namedColors[name]
  return hex ? ColorConverter.hexToRgb(hex) : null
}

/**
 * 计算颜色亮度
 */
export function getLuminance(rgb: RGB): number {
  const { r, g, b } = rgb
  
  // 转换为线性RGB
  const toLinear = (c: number) => {
    const normalized = c / 255
    return normalized <= 0.03928 
      ? normalized / 12.92 
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }
  
  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)
  
  // 计算相对亮度
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * 计算对比度
 */
export function getContrast(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getLuminance(rgb1)
  const lum2 = getLuminance(rgb2)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * 判断颜色是否为深色
 */
export function isDark(rgb: RGB): boolean {
  return getLuminance(rgb) < 0.5
}

/**
 * 判断颜色是否为浅色
 */
export function isLight(rgb: RGB): boolean {
  return !isDark(rgb)
}

/**
 * 混合两个颜色
 */
export function mixColors(rgb1: RGB, rgb2: RGB, ratio: number = 0.5): RGB {
  const clampedRatio = Math.max(0, Math.min(1, ratio))
  
  return {
    r: Math.round(rgb1.r * (1 - clampedRatio) + rgb2.r * clampedRatio),
    g: Math.round(rgb1.g * (1 - clampedRatio) + rgb2.g * clampedRatio),
    b: Math.round(rgb1.b * (1 - clampedRatio) + rgb2.b * clampedRatio)
  }
}

/**
 * 生成随机颜色
 */
export function randomColor(): RGB {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  }
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 格式化数值
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}