import type {
  ColorInput,
  ColorFormat,
  RGBColor,
  HSLColor,
  HSVColor,
  CMYKColor,
  LABColor,
  ContrastInfo,
  ColorAnalysis,
  BlendMode
} from '../types'
import { ColorConverter } from './converter'
import { clamp } from '../utils'
import { NAMED_COLORS } from '../utils/constants'

/**
 * 颜色类 - 提供完整的颜色操作功能
 */
export class Color {
  private _rgb: RGBColor
  private _alpha: number

  constructor(input: ColorInput) {
    const { rgb, alpha } = this.parseInput(input)
    this._rgb = rgb
    this._alpha = alpha
  }

  /**
   * 解析颜色输入
   */
  private parseInput(input: ColorInput): { rgb: RGBColor; alpha: number } {
    if (typeof input === 'string') {
      return this.parseStringColor(input)
    }

    if ('r' in input && 'g' in input && 'b' in input) {
      return {
        rgb: { r: input.r, g: input.g, b: input.b },
        alpha: input.a ?? 1
      }
    }

    if ('h' in input && 's' in input && 'l' in input) {
      const rgb = ColorConverter.hslToRgb(input as HSLColor)
      return {
        rgb,
        alpha: (input as HSLColor).a ?? 1
      }
    }

    if ('h' in input && 's' in input && 'v' in input) {
      const rgb = ColorConverter.hsvToRgb(input as HSVColor)
      return {
        rgb,
        alpha: (input as HSVColor).a ?? 1
      }
    }

    if ('c' in input && 'm' in input && 'y' in input && 'k' in input) {
      const rgb = ColorConverter.cmykToRgb(input as CMYKColor)
      return { rgb, alpha: 1 }
    }

    if ('l' in input && 'a' in input && 'b' in input) {
      const rgb = ColorConverter.labToRgb(input as LABColor)
      return { rgb, alpha: 1 }
    }

    throw new Error('Invalid color input')
  }

  /**
   * 解析字符串颜色
   */
  private parseStringColor(color: string): { rgb: RGBColor; alpha: number } {
    const trimmed = color.trim().toLowerCase()

    // 命名颜色
    if (NAMED_COLORS[trimmed]) {
      return this.parseStringColor(NAMED_COLORS[trimmed])
    }

    // HEX颜色
    if (trimmed.startsWith('#')) {
      return this.parseHexColor(trimmed)
    }

    // RGB/RGBA颜色
    if (trimmed.startsWith('rgb')) {
      return this.parseRgbColor(trimmed)
    }

    // HSL/HSLA颜色
    if (trimmed.startsWith('hsl')) {
      return this.parseHslColor(trimmed)
    }

    throw new Error(`Unsupported color format: ${color}`)
  }

  /**
   * 解析HEX颜色
   */
  private parseHexColor(hex: string): { rgb: RGBColor; alpha: number } {
    const cleaned = hex.replace('#', '')
    let r: number, g: number, b: number, a = 1

    if (cleaned.length === 3) {
      r = parseInt(cleaned[0] + cleaned[0], 16)
      g = parseInt(cleaned[1] + cleaned[1], 16)
      b = parseInt(cleaned[2] + cleaned[2], 16)
    } else if (cleaned.length === 6) {
      r = parseInt(cleaned.substr(0, 2), 16)
      g = parseInt(cleaned.substr(2, 2), 16)
      b = parseInt(cleaned.substr(4, 2), 16)
    } else if (cleaned.length === 8) {
      r = parseInt(cleaned.substr(0, 2), 16)
      g = parseInt(cleaned.substr(2, 2), 16)
      b = parseInt(cleaned.substr(4, 2), 16)
      a = parseInt(cleaned.substr(6, 2), 16) / 255
    } else {
      throw new Error(`Invalid hex color: ${hex}`)
    }

    return { rgb: { r, g, b }, alpha: a }
  }

  /**
   * 解析RGB颜色
   */
  private parseRgbColor(rgb: string): { rgb: RGBColor; alpha: number } {
    const match = rgb.match(/rgba?\(([^)]+)\)/)
    if (!match) throw new Error(`Invalid RGB color: ${rgb}`)

    const values = match[1].split(',').map(v => parseFloat(v.trim()))
    if (values.length < 3) throw new Error(`Invalid RGB color: ${rgb}`)

    return {
      rgb: {
        r: clamp(values[0], 0, 255),
        g: clamp(values[1], 0, 255),
        b: clamp(values[2], 0, 255)
      },
      alpha: values[3] !== undefined ? clamp(values[3], 0, 1) : 1
    }
  }

  /**
   * 解析HSL颜色
   */
  private parseHslColor(hsl: string): { rgb: RGBColor; alpha: number } {
    const match = hsl.match(/hsla?\(([^)]+)\)/)
    if (!match) throw new Error(`Invalid HSL color: ${hsl}`)

    const values = match[1].split(',').map(v => parseFloat(v.trim()))
    if (values.length < 3) throw new Error(`Invalid HSL color: ${hsl}`)

    const hslColor: HSLColor = {
      h: clamp(values[0], 0, 360),
      s: clamp(values[1], 0, 100),
      l: clamp(values[2], 0, 100),
      a: values[3] !== undefined ? clamp(values[3], 0, 1) : 1
    }

    const rgb = ColorConverter.hslToRgb(hslColor)
    return { rgb, alpha: hslColor.a! }
  }

  // Getter方法
  get rgb(): RGBColor {
    return { ...this._rgb, a: this._alpha }
  }

  get hsl(): HSLColor {
    const hsl = ColorConverter.rgbToHsl(this._rgb)
    return { ...hsl, a: this._alpha }
  }

  get hsv(): HSVColor {
    const hsv = ColorConverter.rgbToHsv(this._rgb)
    return { ...hsv, a: this._alpha }
  }

  get cmyk(): CMYKColor {
    return ColorConverter.rgbToCmyk(this._rgb)
  }

  get lab(): LABColor {
    return ColorConverter.rgbToLab(this._rgb)
  }

  get alpha(): number {
    return this._alpha
  }

  // 格式化输出方法
  toHex(includeAlpha = false): string {
    const { r, g, b } = this._rgb
    const hex = [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
    
    if (includeAlpha && this._alpha < 1) {
      const alphaHex = Math.round(this._alpha * 255).toString(16).padStart(2, '0')
      return `#${hex}${alphaHex}`
    }
    
    return `#${hex}`
  }

  toRgb(): string {
    const { r, g, b } = this._rgb
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
  }

  toRgba(): string {
    const { r, g, b } = this._rgb
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${this._alpha})`
  }

  toHsl(): string {
    const { h, s, l } = this.hsl
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
  }

  toHsla(): string {
    const { h, s, l } = this.hsl
    return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${this._alpha})`
  }

  toString(format: ColorFormat = 'hex'): string {
    switch (format) {
      case 'hex':
        return this.toHex()
      case 'rgb':
        return this.toRgb()
      case 'rgba':
        return this.toRgba()
      case 'hsl':
        return this.toHsl()
      case 'hsla':
        return this.toHsla()
      default:
        return this.toHex()
    }
  }

  // 颜色操作方法
  lighten(amount: number): Color {
    const hsl = this.hsl
    hsl.l = clamp(hsl.l + amount, 0, 100)
    return new Color(hsl)
  }

  darken(amount: number): Color {
    return this.lighten(-amount)
  }

  saturate(amount: number): Color {
    const hsl = this.hsl
    hsl.s = clamp(hsl.s + amount, 0, 100)
    return new Color(hsl)
  }

  desaturate(amount: number): Color {
    return this.saturate(-amount)
  }

  rotate(degrees: number): Color {
    const hsl = this.hsl
    hsl.h = (hsl.h + degrees) % 360
    if (hsl.h < 0) hsl.h += 360
    return new Color(hsl)
  }

  complement(): Color {
    return this.rotate(180)
  }

  invert(): Color {
    const { r, g, b } = this._rgb
    return new Color({
      r: 255 - r,
      g: 255 - g,
      b: 255 - b,
      a: this._alpha
    })
  }

  grayscale(): Color {
    const gray = Math.round(0.299 * this._rgb.r + 0.587 * this._rgb.g + 0.114 * this._rgb.b)
    return new Color({ r: gray, g: gray, b: gray, a: this._alpha })
  }

  setAlpha(alpha: number): Color {
    return new Color({ ...this._rgb, a: clamp(alpha, 0, 1) })
  }

  // 颜色混合
  mix(color: Color, ratio = 0.5): Color {
    const r = ratio
    const rgb1 = this._rgb
    const rgb2 = color._rgb
    
    return new Color({
      r: rgb1.r * (1 - r) + rgb2.r * r,
      g: rgb1.g * (1 - r) + rgb2.g * r,
      b: rgb1.b * (1 - r) + rgb2.b * r,
      a: this._alpha * (1 - r) + color._alpha * r
    })
  }

  // 颜色分析
  getLuminance(): number {
    const { r, g, b } = this._rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  getBrightness(): number {
    const { r, g, b } = this._rgb
    return (r * 299 + g * 587 + b * 114) / 1000
  }

  isDark(): boolean {
    return this.getBrightness() < 128
  }

  isLight(): boolean {
    return !this.isDark()
  }

  getContrastRatio(color: Color): number {
    const l1 = this.getLuminance()
    const l2 = color.getLuminance()
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  getContrastInfo(color: Color): ContrastInfo {
    const ratio = this.getContrastRatio(color)
    return {
      ratio,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail',
      normal: ratio >= 4.5,
      large: ratio >= 3
    }
  }

  analyze(): ColorAnalysis {
    const { r, g, b } = this._rgb
    const brightness = this.getBrightness()
    const luminance = this.getLuminance()
    const isDark = this.isDark()
    
    // 判断色温
    let temperature: 'warm' | 'cool' | 'neutral'
    if (r > b + 20) {
      temperature = 'warm'
    } else if (b > r + 20) {
      temperature = 'cool'
    } else {
      temperature = 'neutral'
    }
    
    // 主导通道
    const max = Math.max(r, g, b)
    let dominantChannel: 'red' | 'green' | 'blue'
    if (r === max) {
      dominantChannel = 'red'
    } else if (g === max) {
      dominantChannel = 'green'
    } else {
      dominantChannel = 'blue'
    }
    
    return {
      brightness,
      luminance,
      isDark,
      isLight: !isDark,
      temperature,
      dominantChannel
    }
  }

  // 静态方法
  static fromHex(hex: string): Color {
    return new Color(hex)
  }

  static fromRgb(r: number, g: number, b: number, a = 1): Color {
    return new Color({ r, g, b, a })
  }

  static fromHsl(h: number, s: number, l: number, a = 1): Color {
    return new Color({ h, s, l, a })
  }

  static fromHsv(h: number, s: number, v: number, a = 1): Color {
    return new Color({ h, s, v, a })
  }

  static random(): Color {
    return new Color({
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    })
  }

  static isValid(input: any): boolean {
    try {
      new Color(input)
      return true
    } catch {
      return false
    }
  }

  // 比较方法
  equals(color: Color): boolean {
    const rgb1 = this._rgb
    const rgb2 = color._rgb
    return (
      Math.round(rgb1.r) === Math.round(rgb2.r) &&
      Math.round(rgb1.g) === Math.round(rgb2.g) &&
      Math.round(rgb1.b) === Math.round(rgb2.b) &&
      Math.round(this._alpha * 100) === Math.round(color._alpha * 100)
    )
  }

  clone(): Color {
    return new Color({ ...this._rgb, a: this._alpha })
  }
}