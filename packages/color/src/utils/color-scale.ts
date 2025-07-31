/**
 * 色阶生成系统
 * 使用优化的HSL算法实现高质量的色阶生成，确保亮色和暗色模式都有正确的色阶效果
 */

import type { ColorCategory, ColorMode, ColorScale, ColorValue, NeutralColors } from '../core/types'
import { hexToHsl, hslToHex, isValidHex, normalizeHex } from './color-converter'

/**
 * 不同颜色类别的默认色阶配置
 */
const SCALE_CONFIGS = {
  primary: { count: 12, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  success: { count: 12, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  warning: { count: 12, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  danger: { count: 12, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  gray: { count: 14, indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
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
      colors = this.generateGrayScale(normalizedColor, config.count, mode)
    }
    else {
      colors = this.generateColorScale(normalizedColor, config.count, mode)
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
      count: colors.length,
      category,
      mode,
    }
  }

  /**
   * 生成彩色色阶
   */
  private generateColorScale(baseColor: string, count: number, mode: ColorMode): string[] {
    const baseHsl = hexToHsl(baseColor)
    if (!baseHsl) {
      throw new Error(`Failed to parse color: ${baseColor}`)
    }

    const colors: string[] = []

    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1)

      // 根据模式调整色阶方向
      let lightness: number
      if (mode === 'dark') {
        // 暗色模式：从深到浅（1级=最深色，12级=最浅色）
        lightness = 5 + (factor * 80) // 从5到85
      }
      else {
        // 亮色模式：从浅到深（1级=最浅色，12级=最深色）
        lightness = 95 - (factor * 90) // 从95到5
      }

      // 保持饱和度相对稳定，在中间位置稍微提高
      const saturationFactor = 1.0 - Math.abs(factor - 0.5) * 0.3
      const saturation = baseHsl.s * saturationFactor

      colors.push(hslToHex(baseHsl.h, Math.max(0, Math.min(100, saturation)), Math.max(0, Math.min(100, lightness))))
    }

    return colors
  }

  /**
   * 生成灰色色阶
   */
  private generateGrayScale(baseColor: string, count: number, mode: ColorMode): string[] {
    const baseHsl = hexToHsl(baseColor)
    if (!baseHsl) {
      throw new Error(`Failed to parse color: ${baseColor}`)
    }

    const colors: string[] = []
    const saturation = Math.min(baseHsl.s, 15) // 限制饱和度

    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1)

      // 根据模式调整色阶方向
      let lightness: number
      if (mode === 'dark') {
        // 暗色模式：从深到浅（1级=最深色，14级=最浅色）
        lightness = 5 + (factor * 80) // 从5到85
      }
      else {
        // 亮色模式：从浅到深（1级=最浅色，14级=最深色）
        lightness = 95 - (factor * 90) // 从95到5
      }

      colors.push(hslToHex(baseHsl.h, saturation, lightness))
    }

    return colors
  }

  /**
   * 扩展色阶到目标数量
   */
  private extendColorScale(colors: string[], targetCount: number, mode: ColorMode): string[] {
    if (colors.length >= targetCount) {
      return colors.slice(0, targetCount)
    }

    const extended: string[] = []
    const sourceCount = colors.length

    for (let i = 0; i < targetCount; i++) {
      const position = i / (targetCount - 1)
      const sourcePosition = position * (sourceCount - 1)

      const lowerIndex = Math.floor(sourcePosition)
      const upperIndex = Math.ceil(sourcePosition)
      const factor = sourcePosition - lowerIndex

      if (lowerIndex === upperIndex || upperIndex >= sourceCount) {
        extended.push(colors[Math.min(lowerIndex, sourceCount - 1)])
      }
      else {
        // 在两个颜色之间插值
        const interpolated = this.interpolateColors(colors[lowerIndex], colors[upperIndex], factor)
        extended.push(interpolated)
      }
    }

    return extended
  }

  /**
   * 在两个颜色之间插值
   */
  private interpolateColors(color1: string, color2: string, factor: number): string {
    const hsl1 = hexToHsl(color1)
    const hsl2 = hexToHsl(color2)

    if (!hsl1 || !hsl2) {
      return factor < 0.5 ? color1 : color2
    }

    // 简单的HSL插值
    const h = this.interpolateHue(hsl1.h, hsl2.h, factor)
    const s = hsl1.s + (hsl2.s - hsl1.s) * factor
    const l = hsl1.l + (hsl2.l - hsl1.l) * factor

    return hslToHex(h, s, l)
  }

  /**
   * 色相插值 - 处理色相环的最短路径
   */
  private interpolateHue(h1: number, h2: number, factor: number): number {
    let diff = h2 - h1

    // 处理色相环的跨越（0-360度）
    if (Math.abs(diff) > 180) {
      if (diff > 0) {
        diff -= 360
      }
      else {
        diff += 360
      }
    }

    let result = h1 + diff * factor

    // 确保结果在0-360范围内
    if (result < 0)
      result += 360
    if (result >= 360)
      result -= 360

    return result
  }

  /**
   * 生成多个颜色类别的色阶
   */
  generateScales<T extends ColorCategory>(
    colors: Record<T, ColorValue>,
    mode: ColorMode = 'light',
  ): Record<T, ColorScale> {
    const scales: Record<T, ColorScale> = {} as Record<T, ColorScale>

    for (const [category, color] of Object.entries(colors) as [T, ColorValue][]) {
      try {
        scales[category] = this.generateScale(color, category as ColorCategory, mode)
      }
      catch (error) {
        console.warn(`Failed to generate scale for ${category}:`, error)
        // 提供回退色阶
        scales[category] = this.createFallbackScale(category as ColorCategory, mode)
      }
    }

    return scales
  }

  /**
   * 创建回退色阶
   */
  private createFallbackScale(category: ColorCategory, mode: ColorMode): ColorScale {
    const config = SCALE_CONFIGS[category]
    const colors: string[] = []

    // 使用灰色作为回退
    for (let i = 0; i < config.count; i++) {
      const factor = i / (config.count - 1)
      const lightness = 95 - (factor * 90)
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
      count: colors.length,
      category,
      mode,
    }
  }

  /**
   * 生成中性色（灰色）色阶
   */
  generateNeutralColors(mode: ColorMode = 'light'): NeutralColors {
    const grayScale = this.generateGrayScale('#595959', 14, mode)

    return {
      50: grayScale[0],
      100: grayScale[1],
      200: grayScale[2],
      300: grayScale[3],
      400: grayScale[4],
      500: grayScale[5],
      600: grayScale[6],
      700: grayScale[7],
      800: grayScale[8],
      900: grayScale[9],
      950: grayScale[10],
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
