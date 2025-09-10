/**
 * 颜色处理工具类
 * 提供颜色格式转换、颜色操作、颜色分析等功能
 * 
 * @example
 * ```typescript
 * import { ColorUtils } from '@ldesign/kit'
 * 
 * // 颜色格式转换
 * const rgb = ColorUtils.hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
 * const hex = ColorUtils.rgbToHex(255, 0, 0) // '#ff0000'
 * 
 * // 颜色操作
 * const lighter = ColorUtils.lighten('#ff0000', 0.2) // 变亮20%
 * const darker = ColorUtils.darken('#ff0000', 0.2) // 变暗20%
 * 
 * // 颜色分析
 * const isLight = ColorUtils.isLight('#ffffff') // true
 * const contrast = ColorUtils.getContrast('#000000', '#ffffff') // 21
 * ```
 */

/**
 * RGB 颜色值接口
 */
export interface RgbColor {
  /** 红色分量 (0-255) */
  r: number
  /** 绿色分量 (0-255) */
  g: number
  /** 蓝色分量 (0-255) */
  b: number
}

/**
 * HSL 颜色值接口
 */
export interface HslColor {
  /** 色相 (0-360) */
  h: number
  /** 饱和度 (0-100) */
  s: number
  /** 亮度 (0-100) */
  l: number
}

/**
 * 颜色处理工具类
 * 提供各种颜色格式转换、操作和分析功能
 */
export class ColorUtils {
  /**
   * 将十六进制颜色转换为 RGB 格式
   * 
   * @param hex - 十六进制颜色值，支持 #RGB 和 #RRGGBB 格式
   * @returns RGB 颜色对象
   * 
   * @example
   * ```typescript
   * ColorUtils.hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
   * ColorUtils.hexToRgb('#f00') // { r: 255, g: 0, b: 0 }
   * ColorUtils.hexToRgb('ff0000') // { r: 255, g: 0, b: 0 }
   * ```
   */
  static hexToRgb(hex: string): RgbColor {
    // 移除 # 前缀
    const cleanHex = hex.replace('#', '')

    // 处理 3 位十六进制格式 (#RGB -> #RRGGBB)
    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map(char => char + char).join('')
      : cleanHex

    // 验证格式
    if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
      throw new Error(`Invalid hex color: ${hex}`)
    }

    // 解析 RGB 分量
    const r = Number.parseInt(fullHex.slice(0, 2), 16)
    const g = Number.parseInt(fullHex.slice(2, 4), 16)
    const b = Number.parseInt(fullHex.slice(4, 6), 16)

    return { r, g, b }
  }

  /**
   * 将 RGB 颜色转换为十六进制格式
   * 
   * @param r - 红色分量 (0-255)
   * @param g - 绿色分量 (0-255)
   * @param b - 蓝色分量 (0-255)
   * @returns 十六进制颜色字符串
   * 
   * @example
   * ```typescript
   * ColorUtils.rgbToHex(255, 0, 0) // '#ff0000'
   * ColorUtils.rgbToHex(0, 255, 0) // '#00ff00'
   * ```
   */
  static rgbToHex(r: number, g: number, b: number): string {
    // 验证输入范围
    const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

    const rHex = clamp(r).toString(16).padStart(2, '0')
    const gHex = clamp(g).toString(16).padStart(2, '0')
    const bHex = clamp(b).toString(16).padStart(2, '0')

    return `#${rHex}${gHex}${bHex}`
  }

  /**
   * 将 HSL 颜色转换为 RGB 格式
   * 
   * @param h - 色相 (0-360)
   * @param s - 饱和度 (0-100)
   * @param l - 亮度 (0-100)
   * @returns RGB 颜色对象
   * 
   * @example
   * ```typescript
   * ColorUtils.hslToRgb(0, 100, 50) // { r: 255, g: 0, b: 0 }
   * ColorUtils.hslToRgb(120, 100, 50) // { r: 0, g: 255, b: 0 }
   * ```
   */
  static hslToRgb(h: number, s: number, l: number): RgbColor {
    // 标准化输入值
    h = ((h % 360) + 360) % 360 // 确保 h 在 0-360 范围内
    s = Math.max(0, Math.min(100, s)) / 100 // 转换为 0-1 范围
    l = Math.max(0, Math.min(100, l)) / 100 // 转换为 0-1 范围

    const c = (1 - Math.abs(2 * l - 1)) * s // 色度
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1)) // 中间值
    const m = l - c / 2 // 亮度调整

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    }
  }

  /**
   * 将 RGB 颜色转换为 HSL 格式
   * 
   * @param r - 红色分量 (0-255)
   * @param g - 绿色分量 (0-255)
   * @param b - 蓝色分量 (0-255)
   * @returns HSL 颜色对象
   * 
   * @example
   * ```typescript
   * ColorUtils.rgbToHsl(255, 0, 0) // { h: 0, s: 100, l: 50 }
   * ColorUtils.rgbToHsl(0, 255, 0) // { h: 120, s: 100, l: 50 }
   * ```
   */
  static rgbToHsl(r: number, g: number, b: number): HslColor {
    // 标准化 RGB 值到 0-1 范围
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    // 计算亮度
    const l = (max + min) / 2

    let h = 0, s = 0

    if (diff !== 0) {
      // 计算饱和度
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

      // 计算色相
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / diff + 2) / 6
          break
        case b:
          h = ((r - g) / diff + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  /**
   * 使颜色变亮
   * 
   * @param color - 颜色值（十六进制格式）
   * @param amount - 变亮程度 (0-1)，0 表示不变，1 表示变为白色
   * @returns 变亮后的十六进制颜色
   * 
   * @example
   * ```typescript
   * ColorUtils.lighten('#ff0000', 0.2) // 红色变亮20%
   * ColorUtils.lighten('#000000', 0.5) // 黑色变亮50%
   * ```
   */
  static lighten(color: string, amount: number): string {
    const rgb = this.hexToRgb(color)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)

    // 增加亮度
    hsl.l = Math.min(100, hsl.l + amount * 100)

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  }

  /**
   * 使颜色变暗
   * 
   * @param color - 颜色值（十六进制格式）
   * @param amount - 变暗程度 (0-1)，0 表示不变，1 表示变为黑色
   * @returns 变暗后的十六进制颜色
   * 
   * @example
   * ```typescript
   * ColorUtils.darken('#ff0000', 0.2) // 红色变暗20%
   * ColorUtils.darken('#ffffff', 0.5) // 白色变暗50%
   * ```
   */
  static darken(color: string, amount: number): string {
    const rgb = this.hexToRgb(color)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)

    // 减少亮度
    hsl.l = Math.max(0, hsl.l - amount * 100)

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  }

  /**
   * 混合两种颜色
   * 
   * @param color1 - 第一种颜色（十六进制格式）
   * @param color2 - 第二种颜色（十六进制格式）
   * @param weight - 第一种颜色的权重 (0-1)，0 表示完全是第二种颜色，1 表示完全是第一种颜色
   * @returns 混合后的十六进制颜色
   * 
   * @example
   * ```typescript
   * ColorUtils.mix('#ff0000', '#0000ff', 0.5) // 红色和蓝色各占50%
   * ColorUtils.mix('#ffffff', '#000000', 0.3) // 白色占30%，黑色占70%
   * ```
   */
  static mix(color1: string, color2: string, weight: number): string {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    // 限制权重在 0-1 范围内
    weight = Math.max(0, Math.min(1, weight))

    const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight))
    const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight))
    const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight))

    return this.rgbToHex(r, g, b)
  }

  /**
   * 计算两种颜色之间的对比度
   * 基于 WCAG 2.0 标准，返回值范围为 1-21
   *
   * @param color1 - 第一种颜色（十六进制格式）
   * @param color2 - 第二种颜色（十六进制格式）
   * @returns 对比度值，1 表示无对比度，21 表示最大对比度
   *
   * @example
   * ```typescript
   * ColorUtils.getContrast('#000000', '#ffffff') // 21 (最大对比度)
   * ColorUtils.getContrast('#ffffff', '#ffffff') // 1 (无对比度)
   * ```
   */
  static getContrast(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)

    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * 判断颜色是否为浅色
   *
   * @param color - 颜色值（十六进制格式）
   * @returns 如果是浅色返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * ColorUtils.isLight('#ffffff') // true
   * ColorUtils.isLight('#000000') // false
   * ColorUtils.isLight('#808080') // true (灰色偏亮)
   * ```
   */
  static isLight(color: string): boolean {
    return this.getLuminance(color) > 0.5
  }

  /**
   * 判断颜色是否为深色
   *
   * @param color - 颜色值（十六进制格式）
   * @returns 如果是深色返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * ColorUtils.isDark('#000000') // true
   * ColorUtils.isDark('#ffffff') // false
   * ColorUtils.isDark('#404040') // true (深灰色)
   * ```
   */
  static isDark(color: string): boolean {
    return !this.isLight(color)
  }

  /**
   * 获取颜色的相对亮度
   * 基于 WCAG 2.0 标准计算相对亮度
   *
   * @param color - 颜色值（十六进制格式）
   * @returns 相对亮度值 (0-1)
   *
   * @private
   */
  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color)

    // 将 RGB 值标准化到 0-1 范围
    const normalize = (value: number): number => {
      const normalized = value / 255
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
    }

    const r = normalize(rgb.r)
    const g = normalize(rgb.g)
    const b = normalize(rgb.b)

    // 使用 WCAG 2.0 公式计算相对亮度
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * 获取颜色的互补色
   *
   * @param color - 颜色值（十六进制格式）
   * @returns 互补色的十六进制颜色
   *
   * @example
   * ```typescript
   * ColorUtils.getComplement('#ff0000') // '#00ffff' (红色的互补色是青色)
   * ColorUtils.getComplement('#00ff00') // '#ff00ff' (绿色的互补色是洋红色)
   * ```
   */
  static getComplement(color: string): string {
    const rgb = this.hexToRgb(color)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)

    // 色相偏移180度得到互补色
    hsl.h = (hsl.h + 180) % 360

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
  }

  /**
   * 生成颜色调色板
   *
   * @param baseColor - 基础颜色（十六进制格式）
   * @param count - 生成的颜色数量
   * @returns 颜色调色板数组
   *
   * @example
   * ```typescript
   * ColorUtils.generatePalette('#ff0000', 5)
   * // 返回基于红色的5种颜色变化
   * ```
   */
  static generatePalette(baseColor: string, count: number): string[] {
    const rgb = this.hexToRgb(baseColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    const palette: string[] = []

    for (let i = 0; i < count; i++) {
      const lightness = (i / (count - 1)) * 100 // 从0%到100%的亮度变化
      const newRgb = this.hslToRgb(hsl.h, hsl.s, lightness)
      palette.push(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    }

    return palette
  }
}
