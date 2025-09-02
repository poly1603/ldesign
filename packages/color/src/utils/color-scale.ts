/**
 * 色阶生成系统
 * 使用优化的HSL算法实现高质量的色阶生成，确保亮色和暗色模式都有正确的色阶效果
 */

import type {
  ColorCategory,
  ColorMode,
  ColorScale,
  ColorValue,
  NeutralColors,
} from '../core/types'
import { hexToHsl, hslToHex, isValidHex, normalizeHex } from './color-converter'

/**
 * 不同颜色类别的默认色阶配置
 * 先实现10级色阶，确保与Arco Design一致
 */
const SCALE_CONFIGS = {
  primary: { count: 10, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  success: { count: 10, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  warning: { count: 10, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  danger: { count: 10, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  gray: { count: 10, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
} as const

/**
 * 色阶生成器类
 */
export class ColorScaleGenerator {
  /**
   * 生成单个颜色的色阶
   */
  generateScale(
    baseColor: string,
    category: ColorCategory,
    mode: ColorMode = 'light',
  ): ColorScale {
    if (!isValidHex(baseColor)) {
      throw new Error(`Invalid hex color: ${baseColor}`)
    }

    const normalizedColor = normalizeHex(baseColor)
    const config = SCALE_CONFIGS[category]

    let colors: string[]

    if (category === 'gray') {
      colors = this.generateGrayScale(normalizedColor || '#808080', config.count, mode)
    }
    else {
      colors = this.generateColorScale(normalizedColor || '#808080', config.count, mode)
    }

    // 创建索引映射
    const indices: Record<number, string> = {}
    config.indices.forEach((index, i) => {
      if (i < colors.length) {
        indices[index] = colors[i]
      }
    })

    return {
      colors,
      indices,
    }
  }

  /**
   * 生成彩色色阶 - 完全使用Arco Design的原始算法
   * 直接拷贝自官方源码，不使用硬编码
   * 暗黑模式下色阶反转：1是最深的，10是最浅的
   */
  private generateColorScale(
    baseColor: string,
    count: number,
    mode: ColorMode,
  ): string[] {
    const colors: string[] = []

    // 使用Arco Design的原始算法生成10级色阶
    for (let i = 1; i <= 10; i++) {
      colors.push(this.arcoColorPalette(baseColor, i))
    }

    // 暗黑模式下反转色阶顺序
    if (mode === 'dark') {
      colors.reverse()
    }

    // 如果需要更多级别，扩展色阶
    if (count > 10) {
      const extraLight = count - 10
      for (let i = 0; i < extraLight; i++) {
        const extraColor = this.generateExtraLightColor(baseColor, i + 1)
        if (mode === 'dark') {
          colors.push(extraColor) // 暗黑模式下添加到末尾（更浅）
        }
        else {
          colors.unshift(extraColor) // 亮色模式下添加到开头（更浅）
        }
      }
    }
    else if (count < 10) {
      return colors.slice(0, count)
    }

    return colors
  }

  /**
   * Arco Design的原始色阶算法 - 直接拷贝自官方源码
   * 来源: https://github.com/arco-design/color/blob/main/src/palette.js
   */
  private arcoColorPalette(originColor: string, i: number): string {
    // 解析颜色到HSV
    const rgb = this.hexToRgb(originColor)
    if (!rgb) {
      throw new Error(`Failed to parse color: ${originColor}`)
    }

    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b)
    const h = hsv.h
    const s = hsv.s // 这里是HSV的饱和度，不是HSL的
    const v = hsv.v // 这里是HSV的明度，不是HSL的亮度

    // Arco Design的固定参数
    const hueStep = 2
    const maxSaturationStep = 100
    const minSaturationStep = 9
    const maxValue = 100
    const minValue = 30

    // 色相调整函数 - 完全按照原始代码
    function getNewHue(isLight: boolean, index: number): number {
      let hue: number
      if (h >= 60 && h <= 240) {
        hue = isLight ? h - hueStep * index : h + hueStep * index
      }
      else {
        hue = isLight ? h + hueStep * index : h - hueStep * index
      }
      if (hue < 0) {
        hue += 360
      }
      else if (hue >= 360) {
        hue -= 360
      }
      return Math.round(hue)
    }

    // 饱和度调整函数 - 完全按照原始代码
    function getNewSaturation(isLight: boolean, index: number): number {
      let newSaturation: number
      if (isLight) {
        newSaturation
          = s <= minSaturationStep ? s : s - ((s - minSaturationStep) / 5) * index
      }
      else {
        newSaturation = s + ((maxSaturationStep - s) / 4) * index
      }
      return newSaturation
    }

    // 明度调整函数 - 完全按照原始代码
    function getNewValue(isLight: boolean, index: number): number {
      return isLight
        ? v + ((maxValue - v) / 5) * index
        : v <= minValue
          ? v
          : v - ((v - minValue) / 4) * index
    }

    const isLight = i < 6
    const index = isLight ? 6 - i : i - 6

    let resultHsv: { h: number, s: number, v: number }
    if (i === 6) {
      // 基准色
      resultHsv = { h, s, v }
    }
    else {
      resultHsv = {
        h: getNewHue(isLight, index),
        s: getNewSaturation(isLight, index),
        v: getNewValue(isLight, index),
      }
    }

    // 转换回RGB然后到Hex
    const resultRgb = this.hsvToRgb(resultHsv.h, resultHsv.s, resultHsv.v)
    return this.rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b)
  }

  /**
   * 生成额外的浅色（用于扩展到12级或14级）
   */
  private generateExtraLightColor(
    baseColor: string,
    extraIndex: number,
  ): string {
    const baseHsl = hexToHsl(baseColor)
    if (!baseHsl) {
      throw new Error(`Failed to parse color: ${baseColor}`)
    }

    // 基于第1级颜色继续变浅
    const firstColor = this.arcoColorPalette(baseColor, 1)
    const firstHsl = hexToHsl(firstColor)
    if (!firstHsl) {
      return firstColor
    }

    // 进一步降低饱和度，增加亮度
    const newSaturation = Math.max(5, firstHsl.s - extraIndex * 8)
    const newLightness = Math.min(98, firstHsl.l + extraIndex * 3)

    return hslToHex(firstHsl.h, newSaturation, newLightness)
  }

  /**
   * Hex转RGB
   */
  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
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
   * RGB转Hex
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? `0${hex}` : hex
      })
      .join('')}`
  }

  /**
   * RGB转HSV - 完全按照Arco Design的算法
   */
  private rgbToHsv(
    r: number,
    g: number,
    b: number,
  ): { h: number, s: number, v: number } {
    r = r / 255
    g = g / 255
    b = b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6
      }
      else if (max === g) {
        h = (b - r) / diff + 2
      }
      else {
        h = (r - g) / diff + 4
      }
    }
    h = h * 60
    if (h < 0)
      h += 360

    const s = max === 0 ? 0 : (diff / max) * 100
    const v = max * 100

    return { h: Math.round(h), s, v }
  }

  /**
   * HSV转RGB - 完全按照Arco Design的算法
   */
  private hsvToRgb(
    h: number,
    s: number,
    v: number,
  ): { r: number, g: number, b: number } {
    s = s / 100
    v = v / 100

    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c

    let r = 0
    let g = 0
    let b = 0

    if (h >= 0 && h < 60) {
      r = c
      g = x
      b = 0
    }
    else if (h >= 60 && h < 120) {
      r = x
      g = c
      b = 0
    }
    else if (h >= 120 && h < 180) {
      r = 0
      g = c
      b = x
    }
    else if (h >= 180 && h < 240) {
      r = 0
      g = x
      b = c
    }
    else if (h >= 240 && h < 300) {
      r = x
      g = 0
      b = c
    }
    else if (h >= 300 && h < 360) {
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
   * 生成灰色色阶 - 直接使用Arco Design的预设灰色
   */
  private generateGrayScale(
    _baseColor: string,
    count: number,
    mode: ColorMode,
  ): string[] {
    if (mode === 'dark') {
      // 优化的暗色模式中性灰色（从深到浅）
      const neutralGrayDark = [
        '#1a1a1a',
        '#2d2d2d',
        '#404040',
        '#595959',
        '#737373',
        '#8c8c8c',
        '#a6a6a6',
        '#bfbfbf',
        '#d9d9d9',
        '#f5f5f5',
      ]
      return neutralGrayDark.slice(0, count)
    }
    else {
      // 优化的亮色模式中性灰色（从浅到深）
      const neutralGrayLight = [
        '#fafafa',
        '#f5f5f5',
        '#f0f0f0',
        '#d9d9d9',
        '#bfbfbf',
        '#8c8c8c',
        '#737373',
        '#595959',
        '#404040',
        '#262626',
      ]
      return neutralGrayLight.slice(0, count)
    }
  }

  /**
   * 生成多个颜色类别的色阶
   */
  generateScales<T extends ColorCategory>(
    colors: Record<T, ColorValue>,
    mode: ColorMode = 'light',
  ): Record<T, ColorScale> {
    const scales: Record<T, ColorScale> = {} as Record<T, ColorScale>

    for (const [category, color] of Object.entries(colors) as [
      T,
      ColorValue,
    ][]) {
      try {
        scales[category] = this.generateScale(
          color,
          category as ColorCategory,
          mode,
        )
      }
      catch (error) {
        console.warn(`Failed to generate scale for ${category}:`, error)
        // 提供回退色阶
        scales[category] = this.createFallbackScale(
          category as ColorCategory,
          mode,
        )
      }
    }

    return scales
  }

  /**
   * 创建回退色阶
   */
  private createFallbackScale(
    category: ColorCategory,
    _mode: ColorMode,
  ): ColorScale {
    const config = SCALE_CONFIGS[category]
    const colors: string[] = []

    // 使用灰色作为回退
    for (let i = 0; i < config.count; i++) {
      const factor = i / (config.count - 1)
      const lightness = 95 - factor * 90
      colors.push(hslToHex(0, 0, lightness))
    }

    const indices: Record<number, string> = {}
    config.indices.forEach((index, i) => {
      if (i < colors.length) {
        indices[index] = colors[i]
      }
    })

    return {
      colors,
      indices,
    }
  }

  /**
   * 生成中性色（灰色）色阶
   */
  generateNeutralColors(mode: ColorMode = 'light'): NeutralColors {
    const grayScale = this.generateScale('#595959', 'gray', mode)

    return {
      border: grayScale,
      background: grayScale,
      text: grayScale,
      white: grayScale,
      shadow: grayScale,
    }
  }
}

// 导出单例实例
export const colorScaleGenerator = new ColorScaleGenerator()

// 导出便捷函数
export function generateColorScales<T extends ColorCategory>(
  colors: Record<T, ColorValue>,
  mode: ColorMode = 'light',
): Record<T, ColorScale> {
  return colorScaleGenerator.generateScales(colors, mode)
}

export function generateColorScale(
  baseColor: string,
  category: ColorCategory,
  mode: ColorMode = 'light',
): ColorScale {
  return colorScaleGenerator.generateScale(baseColor, category, mode)
}
