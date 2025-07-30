/**
 * 色阶生成系统
 * 集成 @arco-design/color 库实现亮色和暗色模式的完整色阶生成
 */

// @arco-design/color 类型声明
declare module '@arco-design/color' {
  interface RGB {
    r: number
    g: number
    b: number
  }

  interface GenerateOptions {
    list?: boolean
    dark?: boolean
    index?: number
  }

  export function generate(
    color: string,
    options?: GenerateOptions
  ): string | string[] | RGB | RGB[]

  export function getRgbStr(rgb: RGB): string
}

import { generate, getRgbStr } from '@arco-design/color'
import type { ColorCategory, ColorMode, ColorScale, ColorValue } from '../core/types'
import { isValidHex, normalizeHex, hexToHsl, hslToHex } from './color-converter'

/**
 * 色阶生成选项
 */
export interface ColorScaleOptions {
  /** 色阶数量 */
  count?: number
  /** 颜色模式 */
  mode?: ColorMode
  /** 是否包含原色 */
  includeOriginal?: boolean
  /** 自定义色阶索引映射 */
  customIndices?: number[]
}

/**
 * 默认色阶选项
 */
const DEFAULT_SCALE_OPTIONS: Required<ColorScaleOptions> = {
  count: 10,
  mode: 'light',
  includeOriginal: true,
  customIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
}

/**
 * 色阶生成器类
 */
export class ColorScaleGenerator {
  private options: Required<ColorScaleOptions>

  constructor(options?: ColorScaleOptions) {
    this.options = { ...DEFAULT_SCALE_OPTIONS, ...options }
  }

  /**
   * 生成单个颜色的色阶
   */
  generateScale(color: ColorValue, mode: ColorMode = 'light'): ColorScale {
    if (!isValidHex(color)) {
      throw new Error(`Invalid hex color: ${color}`)
    }

    const normalizedColor = normalizeHex(color)

    // 使用 @arco-design/color 生成色阶
    const colors = generate(normalizedColor, {
      list: true,
      dark: mode === 'dark',
    }) as (string | { r: number; g: number; b: number })[]

    // 转换为 hex 格式
    const hexColors = colors.map((c) => {
      if (typeof c === 'string') {
        return c
      }
      // 如果是 RGB 对象，转换为 hex
      return getRgbStr(c)
    })

    // 创建索引映射
    const indices: Record<number, ColorValue> = {}
    this.options.customIndices.forEach((index, i) => {
      if (i < hexColors.length) {
        indices[index] = hexColors[i]
      }
    })

    return {
      colors: hexColors,
      indices,
    }
  }

  /**
   * 为灰色系生成特殊的色阶
   * 先生成4个基础灰色，然后基于这些基础灰色平滑插值生成完整的10级色阶
   */
  generateGrayScale(baseGray: ColorValue, mode: ColorMode = 'light'): ColorScale {
    if (!isValidHex(baseGray)) {
      throw new Error(`Invalid hex color: ${baseGray}`)
    }

    const normalizedColor = normalizeHex(baseGray)
    const hsl = hexToHsl(normalizedColor)

    if (!hsl) {
      throw new Error(`Failed to parse hex color: ${baseGray}`)
    }

    // 生成4个基础灰色的亮度值
    const baseLightnesses = mode === 'dark'
      ? [20, 35, 55, 80] // 暗色模式：从深到浅的基础点
      : [85, 65, 45, 25] // 亮色模式：从浅到深的基础点

    // 生成4个基础灰色
    const baseGrays = baseLightnesses.map(lightness => {
      return hslToHex(hsl.h, hsl.s, lightness)
    })

    // 基于4个基础灰色插值生成10级色阶
    const grayColors: string[] = []

    // 使用线性插值在基础灰色之间生成平滑过渡
    for (let i = 0; i < 10; i++) {
      const position = i / 9 // 0 到 1 之间的位置
      const segmentPosition = position * 3 // 0 到 3 之间，对应4个基础色的3个区间
      const segmentIndex = Math.floor(segmentPosition)
      const localPosition = segmentPosition - segmentIndex

      let lightness: number
      if (segmentIndex >= 3) {
        // 最后一个区间
        lightness = baseLightnesses[3]
      } else {
        // 在两个基础亮度之间插值
        const startLightness = baseLightnesses[segmentIndex]
        const endLightness = baseLightnesses[segmentIndex + 1]
        lightness = startLightness + (endLightness - startLightness) * localPosition
      }

      const grayHex = hslToHex(hsl.h, hsl.s, Math.round(lightness))
      grayColors.push(grayHex)
    }

    // 创建索引映射
    const indices: Record<number, ColorValue> = {}
    this.options.customIndices.forEach((index, i) => {
      if (i < grayColors.length) {
        indices[index] = grayColors[i]
      }
    })

    return {
      colors: grayColors,
      indices,
    }
  }

  /**
   * 批量生成多个颜色的色阶
   */
  generateScales(
    colors: Record<ColorCategory, ColorValue>,
    mode: ColorMode = 'light',
  ): Record<ColorCategory, ColorScale> {
    const scales: Record<ColorCategory, ColorScale> = {} as Record<ColorCategory, ColorScale>

    for (const [category, color] of Object.entries(colors) as [ColorCategory, ColorValue][]) {
      try {
        // 对灰色使用特殊的生成方法
        if (category === 'gray') {
          scales[category] = this.generateGrayScale(color, mode)
        } else {
          scales[category] = this.generateScale(color, mode)
        }
      }
      catch (error) {
        console.warn(`Failed to generate scale for ${category}:`, error)
        // 提供默认的色阶
        scales[category] = this.createFallbackScale(color)
      }
    }

    return scales
  }

  /**
   * 创建回退色阶（当生成失败时使用）
   */
  private createFallbackScale(color: ColorValue): ColorScale {
    const colors = Array(this.options.count).fill(color)
    const indices: Record<number, ColorValue> = {}

    this.options.customIndices.forEach((index, i) => {
      if (i < colors.length) {
        indices[index] = color
      }
    })

    return { colors, indices }
  }

  /**
   * 更新生成选项
   */
  updateOptions(options: Partial<ColorScaleOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<ColorScaleOptions> {
    return { ...this.options }
  }
}

/**
 * 预设的色阶配置
 */
export const COLOR_SCALE_PRESETS = {
  /** 标准 10 级色阶 */
  standard: {
    count: 10,
    customIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },

  /** 简化 5 级色阶 */
  simple: {
    count: 5,
    customIndices: [1, 2, 3, 4, 5],
  },

  /** 扩展 12 级色阶 */
  extended: {
    count: 12,
    customIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },

  /** 自定义索引色阶 */
  custom: {
    count: 10,
    customIndices: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
} as const

/**
 * 创建色阶生成器实例
 */
export function createColorScaleGenerator(options?: ColorScaleOptions): ColorScaleGenerator {
  return new ColorScaleGenerator(options)
}

/**
 * 默认色阶生成器实例
 */
export const defaultColorScaleGenerator = new ColorScaleGenerator()

/**
 * 便捷函数：生成单个颜色的色阶
 */
export function generateColorScale(
  color: ColorValue,
  mode: ColorMode = 'light',
  options?: ColorScaleOptions,
): ColorScale {
  const generator = options ? new ColorScaleGenerator(options) : defaultColorScaleGenerator
  return generator.generateScale(color, mode)
}

/**
 * 便捷函数：批量生成色阶
 */
export function generateColorScales(
  colors: Record<ColorCategory, ColorValue>,
  mode: ColorMode = 'light',
  options?: ColorScaleOptions,
): Record<ColorCategory, ColorScale> {
  const generator = options ? new ColorScaleGenerator(options) : defaultColorScaleGenerator
  return generator.generateScales(colors, mode)
}

/**
 * 便捷函数：安全生成色阶（不抛出异常）
 */
export function safeGenerateColorScale(
  color: ColorValue,
  mode: ColorMode = 'light',
  options?: ColorScaleOptions,
): ColorScale | null {
  try {
    return generateColorScale(color, mode, options)
  }
  catch (error) {
    console.warn('Failed to generate color scale:', error)
    return null
  }
}

/**
 * 便捷函数：安全批量生成色阶
 */
export function safeGenerateColorScales(
  colors: Record<ColorCategory, ColorValue>,
  mode: ColorMode = 'light',
  options?: ColorScaleOptions,
): Record<ColorCategory, ColorScale> | null {
  try {
    return generateColorScales(colors, mode, options)
  }
  catch (error) {
    console.warn('Failed to generate color scales:', error)
    return null
  }
}

/**
 * 获取色阶中的特定颜色
 */
export function getColorFromScale(scale: ColorScale, index: number): ColorValue | undefined {
  return scale.indices[index] || scale.colors[index - 1]
}

/**
 * 检查色阶是否有效
 */
export function isValidColorScale(scale: ColorScale): boolean {
  return Array.isArray(scale.colors)
    && scale.colors.length > 0
    && typeof scale.indices === 'object'
    && scale.indices !== null
}
