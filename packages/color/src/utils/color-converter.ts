/**
 * 颜色转换工具函数
 *
 * 提供高性能的颜色格式转换功能，支持 HEX、RGB、HSL、HSV 等格式。
 * 所有转换函数都包含输入验证、缓存优化和详细的错误处理。
 */

/**
 * HSL 颜色接口（兼容性保留）
 * @deprecated 请使用 PreciseHSL 类型
 */
export interface HSL {
  h: number // 色相 (0-360)
  s: number // 饱和度 (0-100)
  l: number // 亮度 (0-100)
}

/**
 * RGB 颜色接口（兼容性保留）
 * @deprecated 请使用 PreciseRGB 类型
 */
export interface RGB {
  r: number // 红色 (0-255)
  g: number // 绿色 (0-255)
  b: number // 蓝色 (0-255)
}

/**
 * HSV 颜色接口（兼容性保留）
 * @deprecated 请使用 PreciseHSV 类型
 */
export interface HSV {
  h: number // 色相 (0-360)
  s: number // 饱和度 (0-100)
  v: number // 明度 (0-100)
}

/**
 * LAB 颜色接口（兼容性保留）
 * @deprecated 请使用 LABColor 类型
 */
export interface LAB {
  l: number // 亮度 (0-100)
  a: number // 绿-红轴 (-128 to 127)
  b: number // 蓝-黄轴 (-128 to 127)
}

/**
 * LRU 缓存实现
 * 用于提高频繁转换的性能
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private readonly maxSize: number

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 重新插入以更新访问顺序
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * 颜色转换结果缓存
 */
const conversionCache = new LRUCache<string, any>(500)

/**
 * 验证并规范化hex颜色值
 * @param hex - 十六进制颜色值
 * @returns 规范化的hex值或null
 */
export function normalizeHex(hex: string): string | null {
  if (!hex || typeof hex !== 'string') {
    return null
  }

  // 移除空格和#前缀
  hex = hex.trim().replace(/^#/, '')

  // 支持3位和6位hex格式
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  // 验证格式
  if (!/^[a-f0-9]{6}$/i.test(hex)) {
    return null
  }

  return `#${hex.toLowerCase()}`
}

/**
 * 检查hex颜色值是否有效
 * @param hex - 十六进制颜色值
 * @returns 是否有效
 */
export function isValidHex(hex: string): boolean {
  return normalizeHex(hex) !== null
}

/**
 * 将 hex 颜色转换为 RGB
 *
 * 支持3位和6位hex格式，包含输入验证和缓存优化
 * @param hex - 十六进制颜色值（如 "#ff0000" 或 "f00"）
 * @returns RGB对象或null（如果输入无效）
 */
export function hexToRgb(hex: string): RGB | null {
  // 检查缓存
  const cacheKey = `hex2rgb:${hex}`
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)
  }

  // 规范化输入
  const normalizedHex = normalizeHex(hex)
  if (!normalizedHex) {
    return null
  }

  // 解析RGB值
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex)
  const rgb = result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null

  // 缓存结果
  if (rgb) {
    conversionCache.set(cacheKey, rgb)
  }

  return rgb
}

/**
 * 限制数值在指定范围内
 * @param value - 要限制的值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 验证RGB值是否有效
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns 是否有效
 */
function isValidRgb(r: number, g: number, b: number): boolean {
  return (
    typeof r === 'number'
    && r >= 0
    && r <= 255
    && typeof g === 'number'
    && g >= 0
    && g <= 255
    && typeof b === 'number'
    && b >= 0
    && b <= 255
    && !Number.isNaN(r)
    && !Number.isNaN(g)
    && !Number.isNaN(b)
  )
}

/**
 * 将 RGB 颜色转换为 hex
 *
 * 包含输入验证、值限制和缓存优化
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns 十六进制颜色值
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // 检查缓存
  const cacheKey = `rgb2hex:${r},${g},${b}`
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)
  }

  // 验证和限制输入值
  if (!isValidRgb(r, g, b)) {
    console.warn(
      `Invalid RGB values: r=${r}, g=${g}, b=${b}. Values will be clamped to 0-255 range.`,
    )
  }

  // 限制值在有效范围内
  r = clamp(Math.round(r), 0, 255)
  g = clamp(Math.round(g), 0, 255)
  b = clamp(Math.round(b), 0, 255)

  // 转换为十六进制
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  const result = `#${toHex(r)}${toHex(g)}${toHex(b)}`

  // 缓存结果
  conversionCache.set(cacheKey, result)

  return result
}

/**
 * 规范化色相值到0-360度范围
 * @param hue - 色相值
 * @returns 规范化的色相值
 */
export function normalizeHue(hue: number): number {
  hue = hue % 360
  return hue < 0 ? hue + 360 : hue
}

/**
 * 验证HSL值是否有效
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param l - 亮度 (0-100)
 * @returns 是否有效
 */
function isValidHsl(h: number, s: number, l: number): boolean {
  return (
    typeof h === 'number'
    && h >= 0
    && h <= 360
    && typeof s === 'number'
    && s >= 0
    && s <= 100
    && typeof l === 'number'
    && l >= 0
    && l <= 100
    && !Number.isNaN(h)
    && !Number.isNaN(s)
    && !Number.isNaN(l)
  )
}

/**
 * 将 RGB 颜色转换为 HSL
 *
 * 包含输入验证和缓存优化，使用高精度算法
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns HSL对象
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  // 检查缓存
  const cacheKey = `rgb2hsl:${r},${g},${b}`
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)
  }

  // 验证和限制输入值
  if (!isValidRgb(r, g, b)) {
    console.warn(
      `Invalid RGB values: r=${r}, g=${g}, b=${b}. Values will be clamped to 0-255 range.`,
    )
  }

  // 限制值在有效范围内并转换为0-1范围
  r = clamp(r, 0, 255) / 255
  g = clamp(g, 0, 255) / 255
  b = clamp(b, 0, 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number, s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // 无色彩（灰色）
  }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    // 计算色相
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

  const result: HSL = {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }

  // 缓存结果
  conversionCache.set(cacheKey, result)

  return result
}

/**
 * 将 HSL 颜色转换为 RGB
 *
 * 包含输入验证、值限制和缓存优化，使用高精度算法
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param l - 亮度 (0-100)
 * @returns RGB对象
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  // 检查缓存
  const cacheKey = `hsl2rgb:${h},${s},${l}`
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)
  }

  // 验证和限制输入值
  if (!isValidHsl(h, s, l)) {
    console.warn(`Invalid HSL values: h=${h}, s=${s}, l=${l}. Values will be normalized.`)
  }

  // 规范化输入值
  h = normalizeHue(h) / 360
  s = clamp(s, 0, 100) / 100
  l = clamp(l, 0, 100) / 100

  /**
   * 色相到RGB的转换辅助函数
   * @param p - 计算参数p
   * @param q - 计算参数q
   * @param t - 色相参数t
   * @returns RGB分量值 (0-1)
   */
  const hue2rgb = (p: number, q: number, t: number): number => {
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
    // 无饱和度（灰色）
    r = g = b = l
  }
  else {
    // 有饱和度的颜色
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const result: RGB = {
    r: Math.round(clamp(r * 255, 0, 255)),
    g: Math.round(clamp(g * 255, 0, 255)),
    b: Math.round(clamp(b * 255, 0, 255)),
  }

  // 缓存结果
  conversionCache.set(cacheKey, result)

  return result
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
 * 将 RGB 颜色转换为 HSV
 */
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h: number
  let s: number
  const v = max

  if (delta === 0) {
    h = 0
    s = 0
  }
  else {
    s = delta / max

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / delta + 2) / 6
        break
      case b:
        h = ((r - g) / delta + 4) / 6
        break
      default:
        h = 0
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}

/**
 * 将 HSV 颜色转换为 RGB
 */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h /= 360
  s /= 100
  v /= 100

  const c = v * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = v - c

  let r: number, g: number, b: number

  if (h < 1 / 6) {
    r = c
    g = x
    b = 0
  }
  else if (h < 2 / 6) {
    r = x
    g = c
    b = 0
  }
  else if (h < 3 / 6) {
    r = 0
    g = c
    b = x
  }
  else if (h < 4 / 6) {
    r = 0
    g = x
    b = c
  }
  else if (h < 5 / 6) {
    r = x
    g = 0
    b = c
  }
  else {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

/**
 * 将 hex 颜色转换为 HSV
 */
export function hexToHsv(hex: string): HSV | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : null
}

/**
 * 将 HSV 颜色转换为 hex
 */
export function hsvToHex(h: number, s: number, v: number): string {
  const rgb = hsvToRgb(h, s, v)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * 将 HSL 颜色转换为 HSV
 */
export function hslToHsv(h: number, s: number, l: number): HSV {
  s /= 100
  l /= 100

  const v = l + s * Math.min(l, 1 - l)
  const sNew = v === 0 ? 0 : 2 * (1 - l / v)

  return {
    h,
    s: Math.round(sNew * 100),
    v: Math.round(v * 100),
  }
}

/**
 * 将 HSV 颜色转换为 HSL
 */
export function hsvToHsl(h: number, s: number, v: number): HSL {
  s /= 100
  v /= 100

  const l = v * (1 - s / 2)
  const sNew = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)

  return {
    h,
    s: Math.round(sNew * 100),
    l: Math.round(l * 100),
  }
}
