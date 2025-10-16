/**
 * 颜色处理工具函数
 */

export interface RGB {
  r: number
  g: number
  b: number
}

export interface RGBA extends RGB {
  a: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface HSLA extends HSL {
  a: number
}

/**
 * 将十六进制颜色转换为 RGB
 */
export function hexToRgb(hex: string): RGB | null {
  // 移除 # 号
  hex = hex.replace(/^#/, '')
  
  // 处理简写形式 (如 #FFF)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }
  
  // 验证长度
  if (hex.length !== 6) {
    return null
  }
  
  const num = parseInt(hex, 16)
  
  if (isNaN(num)) {
    return null
  }
  
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

/**
 * 将 RGB 转换为十六进制颜色
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.min(Math.max(0, n), 255)).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * 将 RGBA 转换为十六进制颜色（包含透明度）
 */
export function rgbaToHex(rgba: RGBA): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.min(Math.max(0, n), 255)).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  const alpha = Math.round(rgba.a * 255)
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(alpha)}`
}

/**
 * 解析颜色字符串
 */
export function parseColor(color: string): RGBA | null {
  // 移除空格
  color = color.trim()
  
  // 十六进制颜色
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    if (rgb) {
      return { ...rgb, a: 1 }
    }
  }
  
  // rgb() 或 rgba()
  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/)
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(s => s.trim())
    if (parts.length === 3 || parts.length === 4) {
      const r = parseInt(parts[0])
      const g = parseInt(parts[1])
      const b = parseInt(parts[2])
      const a = parts.length === 4 ? parseFloat(parts[3]) : 1
      
      if (!isNaN(r) && !isNaN(g) && !isNaN(b) && !isNaN(a)) {
        return { r, g, b, a }
      }
    }
  }
  
  // 预定义颜色名称
  const namedColors: Record<string, string> = {
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
    orange: '#ffa500',
    purple: '#800080',
    brown: '#a52a2a',
    pink: '#ffc0cb',
    lime: '#00ff00',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000'
  }
  
  const lowerColor = color.toLowerCase()
  if (namedColors[lowerColor]) {
    const rgb = hexToRgb(namedColors[lowerColor])
    if (rgb) {
      return { ...rgb, a: 1 }
    }
  }
  
  return null
}

/**
 * 检查是否为有效颜色
 */
export function isValidColor(color: string): boolean {
  return parseColor(color) !== null
}

/**
 * RGB 转 HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  
  if (max === min) {
    return { h: 0, s: 0, l }
  }
  
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  
  let h: number
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
    default:
      h = 0
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * HSL 转 RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100
  
  if (s === 0) {
    const gray = Math.round(l * 255)
    return { r: gray, g: gray, b: gray }
  }
  
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
  
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  }
}

/**
 * 调整颜色亮度
 */
export function adjustBrightness(color: string, percent: number): string {
  const rgba = parseColor(color)
  if (!rgba) return color
  
  const factor = 1 + percent / 100
  
  const adjusted: RGB = {
    r: Math.min(255, Math.max(0, rgba.r * factor)),
    g: Math.min(255, Math.max(0, rgba.g * factor)),
    b: Math.min(255, Math.max(0, rgba.b * factor))
  }
  
  return rgbToHex(adjusted)
}

/**
 * 变亮颜色
 */
export function lighten(color: string, percent: number = 10): string {
  return adjustBrightness(color, Math.abs(percent))
}

/**
 * 变暗颜色
 */
export function darken(color: string, percent: number = 10): string {
  return adjustBrightness(color, -Math.abs(percent))
}

/**
 * 调整颜色透明度
 */
export function setAlpha(color: string, alpha: number): string {
  const rgba = parseColor(color)
  if (!rgba) return color
  
  rgba.a = Math.min(1, Math.max(0, alpha))
  
  if (rgba.a === 1) {
    return rgbToHex(rgba)
  }
  
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}

/**
 * 混合两个颜色
 */
export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
  const rgba1 = parseColor(color1)
  const rgba2 = parseColor(color2)
  
  if (!rgba1 || !rgba2) {
    return color1
  }
  
  weight = Math.min(1, Math.max(0, weight))
  const w1 = weight
  const w2 = 1 - weight
  
  const mixed: RGBA = {
    r: Math.round(rgba1.r * w1 + rgba2.r * w2),
    g: Math.round(rgba1.g * w1 + rgba2.g * w2),
    b: Math.round(rgba1.b * w1 + rgba2.b * w2),
    a: rgba1.a * w1 + rgba2.a * w2
  }
  
  if (mixed.a === 1) {
    return rgbToHex(mixed)
  }
  
  return `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${mixed.a})`
}

/**
 * 计算对比色
 */
export function getContrastColor(color: string): string {
  const rgba = parseColor(color)
  if (!rgba) return '#000000'
  
  // 计算亮度
  const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
  
  // 根据亮度返回黑色或白色
  return brightness > 128 ? '#000000' : '#ffffff'
}

/**
 * 计算互补色
 */
export function getComplementaryColor(color: string): string {
  const rgba = parseColor(color)
  if (!rgba) return color
  
  const hsl = rgbToHsl(rgba)
  hsl.h = (hsl.h + 180) % 360
  
  const rgb = hslToRgb(hsl)
  return rgbToHex(rgb)
}

/**
 * 生成颜色渐变
 */
export function generateGradient(startColor: string, endColor: string, steps: number = 10): string[] {
  const start = parseColor(startColor)
  const end = parseColor(endColor)
  
  if (!start || !end || steps < 2) {
    return [startColor, endColor]
  }
  
  const gradient: string[] = []
  
  for (let i = 0; i < steps; i++) {
    const weight = i / (steps - 1)
    gradient.push(mixColors(startColor, endColor, 1 - weight))
  }
  
  return gradient
}

/**
 * 随机生成颜色
 */
export function randomColor(options?: {
  brightness?: 'light' | 'dark' | 'random'
  alpha?: number
}): string {
  const { brightness = 'random', alpha = 1 } = options || {}
  
  let h = Math.floor(Math.random() * 360)
  let s = Math.floor(Math.random() * 100)
  let l: number
  
  switch (brightness) {
    case 'light':
      l = Math.floor(Math.random() * 30 + 70) // 70-100
      break
    case 'dark':
      l = Math.floor(Math.random() * 30) // 0-30
      break
    default:
      l = Math.floor(Math.random() * 100)
  }
  
  const rgb = hslToRgb({ h, s, l })
  
  if (alpha === 1) {
    return rgbToHex(rgb)
  }
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * 获取颜色的CSS变量值
 */
export function getCSSVariableColor(variable: string): string | null {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return value || null
}

/**
 * 设置CSS变量颜色
 */
export function setCSSVariableColor(variable: string, color: string): void {
  document.documentElement.style.setProperty(variable, color)
}

/**
 * 将颜色转换为CSS格式
 */
export function toCSSColor(color: string | RGB | RGBA): string {
  if (typeof color === 'string') {
    return color
  }
  
  if ('a' in color && color.a < 1) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  }
  
  return rgbToHex(color)
}