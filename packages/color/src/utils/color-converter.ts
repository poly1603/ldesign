/**
 * 颜色转换工具函数
 */

/**
 * HSL 颜色接口
 */
export interface HSL {
  h: number // 色相 (0-360)
  s: number // 饱和度 (0-100)
  l: number // 亮度 (0-100)
}

/**
 * RGB 颜色接口
 */
export interface RGB {
  r: number // 红色 (0-255)
  g: number // 绿色 (0-255)
  b: number // 蓝色 (0-255)
}

/**
 * 将 hex 颜色转换为 RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    }
    : null
}

/**
 * 将 RGB 颜色转换为 hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 将 RGB 颜色转换为 HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number, s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * 将 HSL 颜色转换为 RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360
  s /= 100
  l /= 100

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

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l // achromatic
  }
  else {
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

/**
 * 将 hex 颜色转换为 HSL
 */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null
}

/**
 * 将 HSL 颜色转换为 hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * 标准化色相值到 0-360 范围
 */
export function normalizeHue(hue: number): number {
  while (hue < 0) hue += 360
  while (hue >= 360) hue -= 360
  return hue
}

/**
 * 限制值到指定范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 检查颜色字符串是否为有效的 hex 格式
 */
export function isValidHex(hex: string): boolean {
  return /^#?(?:[A-F0-9]{6}|[A-F0-9]{3})$/i.test(hex)
}

/**
 * 标准化 hex 颜色字符串
 */
export function normalizeHex(hex: string): string {
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }
  return `#${hex.toLowerCase()}`
}
