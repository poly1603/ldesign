/**
 * 颜色转换工具
 *
 * 提供完整的颜色格式转换功能，支持：
 * - 十六进制 (HEX) 格式
 * - RGB 格式
 * - HSL 格式
 * - 颜色验证和标准化
 *
 * 所有函数都经过优化，确保高性能和准确性。
 *
 * @version 0.1.0
 * @author ldesign
 */

// ==================== 类型定义 ====================

/**
 * HSL 颜色格式接口
 */
export interface HSL {
  /** 色相 (0-360) */
  h: number
  /** 饱和度 (0-100) */
  s: number
  /** 亮度 (0-100) */
  l: number
}

/**
 * RGB 颜色格式接口
 */
export interface RGB {
  /** 红色分量 (0-255) */
  r: number
  /** 绿色分量 (0-255) */
  g: number
  /** 蓝色分量 (0-255) */
  b: number
}

// ==================== 核心转换函数 ====================

/**
 * 将十六进制颜色转换为RGB格式
 *
 * @param hex - 十六进制颜色值，支持 # 前缀
 * @returns RGB对象，如果转换失败返回null
 *
 * @example
 * ```javascript
 * hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
 * hexToRgb('ff0000')  // { r: 255, g: 0, b: 0 }
 * hexToRgb('#f00')    // { r: 255, g: 0, b: 0 }
 * ```
 */
export function hexToRgb(hex: string): RGB | null {
  // 标准化十六进制格式
  const normalizedHex = hex.replace(/^#/, '').toLowerCase()

  // 验证格式
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(normalizedHex)) {
    return null
  }

  // 处理3位十六进制
  const fullHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split('')
          .map(char => char + char)
          .join('')
      : normalizedHex

  // 解析RGB值
  const r = Number.parseInt(fullHex.slice(0, 2), 16)
  const g = Number.parseInt(fullHex.slice(2, 4), 16)
  const b = Number.parseInt(fullHex.slice(4, 6), 16)

  return { r, g, b }
}

/**
 * 将RGB颜色转换为十六进制格式
 *
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns 十六进制颜色字符串
 *
 * @example
 * ```javascript
 * rgbToHex(255, 0, 0) // '#ff0000'
 * rgbToHex(0, 255, 0) // '#00ff00'
 * ```
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // 确保值在有效范围内
  const clampR = Math.max(0, Math.min(255, Math.round(r)))
  const clampG = Math.max(0, Math.min(255, Math.round(g)))
  const clampB = Math.max(0, Math.min(255, Math.round(b)))

  // 转换为十六进制
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(clampR)}${toHex(clampG)}${toHex(clampB)}`
}

/**
 * 将RGB颜色转换为HSL格式
 *
 * 使用标准的RGB到HSL转换算法，确保颜色准确性。
 *
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns HSL对象
 *
 * @example
 * ```javascript
 * rgbToHsl(255, 0, 0) // { h: 0, s: 100, l: 50 }
 * rgbToHsl(0, 255, 0) // { h: 120, s: 100, l: 50 }
 * ```
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  // 标准化RGB值到0-1范围
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  // 找到最大和最小值
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  // 计算亮度
  const l = (max + min) / 2

  // 如果最大和最小值相等，说明是灰度色
  if (delta === 0) {
    return { h: 0, s: 0, l: l * 100 }
  }

  // 计算饱和度
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  // 计算色相
  let h = 0
  if (max === rNorm) {
    h = ((gNorm - bNorm) / delta) % 6
  } else if (max === gNorm) {
    h = (bNorm - rNorm) / delta + 2
  } else {
    h = (rNorm - gNorm) / delta + 4
  }

  h = h * 60
  if (h < 0) h += 360

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * 将HSL颜色转换为RGB格式
 *
 * 使用标准的HSL到RGB转换算法，支持完整的色相范围。
 *
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param l - 亮度 (0-100)
 * @returns RGB对象
 *
 * @example
 * ```javascript
 * hslToRgb(0, 100, 50)   // { r: 255, g: 0, b: 0 }
 * hslToRgb(120, 100, 50) // { r: 0, g: 255, b: 0 }
 * ```
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  // 标准化HSL值
  const hNorm = h / 360
  const sNorm = s / 100
  const lNorm = l / 100

  // 辅助函数：将色相转换为RGB分量
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b

  if (sNorm === 0) {
    // 灰度色
    r = g = b = lNorm
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q

    r = hue2rgb(p, q, hNorm + 1 / 3)
    g = hue2rgb(p, q, hNorm)
    b = hue2rgb(p, q, hNorm - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// ==================== 便捷转换函数 ====================

/**
 * 将十六进制颜色转换为HSL格式
 *
 * @param hex - 十六进制颜色值
 * @returns HSL对象，如果转换失败返回null
 *
 * @example
 * ```javascript
 * hexToHsl('#ff0000') // { h: 0, s: 100, l: 50 }
 * ```
 */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

/**
 * 将HSL颜色转换为十六进制格式
 *
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param l - 亮度 (0-100)
 * @returns 十六进制颜色字符串
 *
 * @example
 * ```javascript
 * hslToHex(0, 100, 50) // '#ff0000'
 * ```
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

// ==================== 工具函数 ====================

/**
 * 标准化色相值到0-360范围
 *
 * @param hue - 原始色相值
 * @returns 标准化后的色相值 (0-360)
 *
 * @example
 * ```javascript
 * normalizeHue(400) // 40
 * normalizeHue(-30) // 330
 * ```
 */
export function normalizeHue(hue: number): number {
  // 使用模运算确保色相在0-360范围内
  const normalized = hue % 360
  return normalized < 0 ? normalized + 360 : normalized
}

/**
 * 将值限制在指定范围内
 *
 * @param value - 原始值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 *
 * @example
 * ```javascript
 * clamp(150, 0, 100) // 100
 * clamp(-10, 0, 100) // 0
 * clamp(50, 0, 100)  // 50
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 验证十六进制颜色格式
 *
 * @param hex - 要验证的十六进制颜色值
 * @returns 是否为有效的十六进制颜色
 *
 * @example
 * ```javascript
 * isValidHex('#ff0000') // true
 * isValidHex('#f00')    // true
 * isValidHex('invalid') // false
 * ```
 */
export function isValidHex(hex: string): boolean {
  if (!hex || typeof hex !== 'string') return false

  const normalized = hex.replace(/^#/, '').toLowerCase()
  return /^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(normalized)
}

/**
 * 标准化十六进制颜色格式
 *
 * 确保十六进制颜色具有标准格式（6位，带#前缀）
 *
 * @param hex - 原始十六进制颜色值
 * @returns 标准化后的十六进制颜色值
 *
 * @example
 * ```javascript
 * normalizeHex('f00')     // '#ff0000'
 * normalizeHex('#f00')    // '#ff0000'
 * normalizeHex('ff0000')  // '#ff0000'
 * normalizeHex('#ff0000') // '#ff0000'
 * ```
 */
export function normalizeHex(hex: string): string {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`)
  }

  const normalized = hex.replace(/^#/, '').toLowerCase()

  // 如果是3位十六进制，扩展为6位
  if (normalized.length === 3) {
    const expanded = normalized
      .split('')
      .map(char => char + char)
      .join('')
    return `#${expanded}`
  }

  return `#${normalized}`
}

// ==================== 高级工具函数 ====================

/**
 * 计算两个颜色之间的对比度
 *
 * 使用WCAG 2.0标准计算对比度比率
 *
 * @param color1 - 第一个颜色（十六进制）
 * @param color2 - 第二个颜色（十六进制）
 * @returns 对比度比率
 *
 * @example
 * ```javascript
 * getContrastRatio('#ffffff', '#000000') // 21
 * getContrastRatio('#000000', '#ffffff') // 21
 * ```
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format')
  }

  const luminance1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 计算颜色的相对亮度
 *
 * 使用WCAG 2.0标准的亮度计算公式
 *
 * @param r - 红色分量 (0-255)
 * @param g - 绿色分量 (0-255)
 * @param b - 蓝色分量 (0-255)
 * @returns 相对亮度值 (0-1)
 *
 * @example
 * ```javascript
 * getLuminance(255, 255, 255) // 1
 * getLuminance(0, 0, 0)       // 0
 * ```
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * 判断颜色是否为深色
 *
 * @param color - 十六进制颜色值
 * @returns 是否为深色
 *
 * @example
 * ```javascript
 * isDark('#000000') // true
 * isDark('#ffffff') // false
 * ```
 */
export function isDark(color: string): boolean {
  const rgb = hexToRgb(color)
  if (!rgb) return false

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance < 0.5
}

/**
 * 判断颜色是否为浅色
 *
 * @param color - 十六进制颜色值
 * @returns 是否为浅色
 *
 * @example
 * ```javascript
 * isLight('#ffffff') // true
 * isLight('#000000') // false
 * ```
 */
export function isLight(color: string): boolean {
  return !isDark(color)
}

/**
 * 获取颜色的反色
 *
 * @param color - 十六进制颜色值
 * @returns 反色（十六进制）
 *
 * @example
 * ```javascript
 * getInverseColor('#ffffff') // '#000000'
 * getInverseColor('#000000') // '#ffffff'
 * ```
 */
export function getInverseColor(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return '#000000'

  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
}
