/**
 * 基于 a-nice-red 算法的颜色生成器
 * 参考：https://github.com/Jahallahan/a-nice-red
 */

import type { ColorConfig, ColorGenerator, ColorMode } from '../core/types'
import { clamp, hexToHsl, hslToHex, isValidHex, normalizeHex, normalizeHue } from './color-converter'

/**
 * 颜色生成配置
 */
interface ColorGenerationConfig {
  /** 成功色色相偏移 */
  successHueOffset: number
  /** 警告色色相偏移 */
  warningHueOffset: number
  /** 危险色色相偏移 */
  dangerHueOffset: number
  /** 灰色饱和度 */
  graySaturation: number
  /** 是否混入主色调到灰色中 */
  grayMixPrimary: boolean
  /** 饱和度调整范围 */
  saturationRange: [number, number]
  /** 亮度调整范围 */
  lightnessRange: [number, number]
}

/**
 * 默认颜色生成配置
 */
const DEFAULT_CONFIG: ColorGenerationConfig = {
  successHueOffset: 120, // 绿色区域
  warningHueOffset: 45, // 橙色区域
  dangerHueOffset: 0, // 红色区域（与主色调相近）
  graySaturation: 8, // 低饱和度灰色
  grayMixPrimary: false, // 默认不混入主色调，生成纯中性灰色
  saturationRange: [0.7, 1.2], // 饱和度调整倍数
  lightnessRange: [0.8, 1.2], // 亮度调整倍数
}

/**
 * 颜色生成器实现
 * 基于 a-nice-red 算法和色彩理论，从主色调生成和谐的配套颜色
 */
export class ColorGeneratorImpl implements ColorGenerator {
  private config: ColorGenerationConfig
  private currentMode: ColorMode = 'light'

  constructor(config?: Partial<ColorGenerationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 从主色调生成其他颜色
   * 使用改进的 a-nice-red 算法，确保生成的颜色和谐且符合设计规范
   */
  generateColors(primary: string): Omit<ColorConfig, 'primary'> {
    if (!isValidHex(primary)) {
      throw new Error(`Invalid hex color: ${primary}`)
    }

    const normalizedPrimary = normalizeHex(primary)
    const primaryHsl = hexToHsl(normalizedPrimary)

    if (!primaryHsl) {
      throw new Error(`Failed to parse hex color: ${primary}`)
    }

    // 使用改进的算法生成配套颜色
    return {
      success: this.generateSuccessColor(primaryHsl),
      warning: this.generateWarningColor(primaryHsl),
      danger: this.generateDangerColor(primaryHsl),
      gray: this.generateGrayColor(primaryHsl),
    }
  }

  /**
   * 生成成功色（绿色系）
   * 基于色彩和谐理论，生成与主色调协调的绿色
   */
  private generateSuccessColor(primaryHsl: { h: number, s: number, l: number }): string {
    // 使用类似色或三角色和谐理论
    // 成功色使用绿色系，但要与主色调保持和谐关系
    let hue: number

    if (primaryHsl.h >= 90 && primaryHsl.h <= 150) {
      // 主色调已经是绿色系，使用类似色
      hue = normalizeHue(primaryHsl.h + 15)
    } else {
      // 使用固定的绿色，但根据主色调调整
      hue = 120 // 标准绿色
      // 如果主色调是暖色调，稍微偏向黄绿
      if (primaryHsl.h >= 0 && primaryHsl.h <= 60) {
        hue = 110
      }
      // 如果主色调是冷色调，稍微偏向青绿
      else if (primaryHsl.h >= 180 && primaryHsl.h <= 270) {
        hue = 130
      }
    }

    // 饱和度：保持与主色调相似的饱和度，但稍微降低以保持和谐
    const saturation = Math.max(40, Math.min(85, primaryHsl.s * 0.9))

    // 亮度：根据主色调亮度调整，确保足够的对比度
    let lightness = primaryHsl.l
    if (primaryHsl.l < 40) {
      lightness = 45 // 确保在深色背景上可见
    } else if (primaryHsl.l > 70) {
      lightness = 55 // 确保在浅色背景上可见
    }

    return hslToHex(hue, saturation, lightness)
  }

  /**
   * 生成警告色（橙色系）
   * 基于色彩和谐理论，生成与主色调协调的橙色
   */
  private generateWarningColor(primaryHsl: { h: number, s: number, l: number }): string {
    let hue: number

    if (primaryHsl.h >= 20 && primaryHsl.h <= 70) {
      // 主色调已经是橙色系，使用类似色
      hue = normalizeHue(primaryHsl.h + 10)
    } else {
      // 使用橙色，但根据主色调的色温调整
      hue = 35 // 标准橙色
      // 如果主色调是冷色调，使用更暖的橙色
      if (primaryHsl.h >= 180 && primaryHsl.h <= 270) {
        hue = 25
      }
      // 如果主色调是绿色系，使用更红的橙色
      else if (primaryHsl.h >= 90 && primaryHsl.h <= 150) {
        hue = 15
      }
    }

    // 饱和度：警告色需要较高的饱和度以引起注意
    const saturation = Math.max(60, Math.min(95, primaryHsl.s * 1.1))

    // 亮度：确保警告色足够明亮和醒目
    let lightness = Math.max(50, Math.min(70, primaryHsl.l * 1.1))

    return hslToHex(hue, saturation, lightness)
  }

  /**
   * 生成危险色（红色系）
   * 基于色彩和谐理论，生成与主色调协调的红色
   */
  private generateDangerColor(primaryHsl: { h: number, s: number, l: number }): string {
    let hue: number

    if (primaryHsl.h >= 330 || primaryHsl.h <= 30) {
      // 主色调已经是红色系，使用类似色
      hue = normalizeHue(primaryHsl.h - 10)
    } else {
      // 使用红色，但根据主色调调整
      hue = 0 // 标准红色
      // 如果主色调是暖色调，使用稍微偏橙的红色
      if (primaryHsl.h >= 30 && primaryHsl.h <= 90) {
        hue = 10
      }
      // 如果主色调是冷色调，使用稍微偏紫的红色
      else if (primaryHsl.h >= 240 && primaryHsl.h <= 300) {
        hue = 350
      }
    }

    // 饱和度：危险色需要高饱和度以传达紧急感
    const saturation = Math.max(65, Math.min(90, primaryHsl.s * 0.95))

    // 亮度：稍微比主色调暗一些，增加严肃感
    let lightness = Math.max(40, Math.min(60, primaryHsl.l * 0.9))

    return hslToHex(hue, saturation, lightness)
  }

  /**
   * 生成灰色系
   * 基于配置选择生成纯中性灰色或带有主色调倾向的灰色
   */
  private generateGrayColor(primaryHsl: { h: number, s: number, l: number }): string {
    if (this.config.grayMixPrimary) {
      // 混入主色调的灰色
      const hue = primaryHsl.h
      const saturation = Math.max(3, Math.min(15, primaryHsl.s * 0.2))
      const lightness = 55
      return hslToHex(hue, saturation, lightness)
    } else {
      // 纯中性灰色（基于a-nice-red算法的中性色生成）
      return this.generateNeutralGray()
    }
  }

  /**
   * 生成纯中性灰色
   * 基于a-nice-red算法，生成不带任何色彩倾向的中性灰色
   */
  private generateNeutralGray(): string {
    // 使用0度色相（红色）但极低饱和度，创建真正的中性灰
    // 这是a-nice-red算法中推荐的中性色生成方式
    const hue = 0
    const saturation = 0 // 完全无饱和度
    const lightness = 55 // 中等亮度

    return hslToHex(hue, saturation, lightness)
  }

  /**
   * 生成四个基础灰色
   * 基于a-nice-red算法和配置选择生成纯中性或带主色调倾向的基础灰色
   */
  generateBaseGrays(primaryHsl: { h: number, s: number, l: number }): string[] {
    // 根据配置决定色相和饱和度
    let hue: number
    let saturation: number

    if (this.config.grayMixPrimary) {
      // 混入主色调的灰色
      hue = primaryHsl.h
      saturation = Math.max(3, Math.min(15, primaryHsl.s * 0.2))
    } else {
      // 纯中性灰色（a-nice-red推荐方式）
      hue = 0
      saturation = 0
    }

    // 生成四个基础灰色的亮度值：浅灰、中浅灰、中深灰、深灰
    // 这些亮度值经过优化，确保良好的视觉层次和对比度
    const lightnesses = [88, 68, 45, 22]

    return lightnesses.map(lightness => {
      return hslToHex(hue, saturation, lightness)
    })
  }

  /**
   * 生成完整的灰色系配置
   * 基于四个基础灰色生成完整的灰色系统
   */
  generateGraySystem(primaryHsl: { h: number, s: number, l: number }): {
    lightGray: string
    midGray: string
    darkGray: string
    black: string
  } {
    const baseGrays = this.generateBaseGrays(primaryHsl)

    return {
      lightGray: baseGrays[0],  // 浅灰
      midGray: baseGrays[1],    // 中灰
      darkGray: baseGrays[2],   // 深灰
      black: baseGrays[3]       // 接近黑色
    }
  }

  /**
   * 计算最优饱和度
   * 基于 a-nice-red 算法，根据颜色类型和主色调特性计算最佳饱和度
   */
  private calculateOptimalSaturation(baseSaturation: number, colorType: 'success' | 'warning' | 'danger' | 'gray'): number {
    const saturationMap = {
      success: 0.85,  // 成功色保持较高饱和度
      warning: 0.95,  // 警告色需要更高饱和度以引起注意
      danger: 0.90,   // 危险色保持高饱和度
      gray: 0.15      // 灰色保持低饱和度
    }

    const targetFactor = saturationMap[colorType]
    let adjustedSaturation = baseSaturation * targetFactor

    // 根据颜色类型设置合理的饱和度范围
    switch (colorType) {
      case 'success':
        adjustedSaturation = clamp(adjustedSaturation, 60, 90)
        break
      case 'warning':
        adjustedSaturation = clamp(adjustedSaturation, 70, 95)
        break
      case 'danger':
        adjustedSaturation = clamp(adjustedSaturation, 65, 90)
        break
      case 'gray':
        adjustedSaturation = clamp(adjustedSaturation, 5, 20)
        break
    }

    return adjustedSaturation
  }

  /**
   * 计算最优亮度
   * 基于 a-nice-red 算法，根据颜色类型和主色调特性计算最佳亮度
   */
  private calculateOptimalLightness(baseLightness: number, colorType: 'success' | 'warning' | 'danger' | 'gray'): number {
    const lightnessMap = {
      success: 0.95,  // 成功色稍微调亮
      warning: 1.05,  // 警告色稍微调亮以提高可见性
      danger: 0.90,   // 危险色稍微调暗以增加严肃感
      gray: 1.0       // 灰色保持原亮度
    }

    const targetFactor = lightnessMap[colorType]
    let adjustedLightness = baseLightness * targetFactor

    // 根据颜色类型设置合理的亮度范围
    switch (colorType) {
      case 'success':
        adjustedLightness = clamp(adjustedLightness, 45, 65)
        break
      case 'warning':
        adjustedLightness = clamp(adjustedLightness, 50, 70)
        break
      case 'danger':
        adjustedLightness = clamp(adjustedLightness, 40, 60)
        break
      case 'gray':
        adjustedLightness = clamp(adjustedLightness, 45, 65)
        break
    }

    return adjustedLightness
  }

  /**
   * 调整饱和度（保留原方法以兼容性）
   */
  private adjustSaturation(baseSaturation: number, factor: number): number {
    const adjusted = baseSaturation * factor
    return clamp(adjusted, 0, 100)
  }

  /**
   * 调整亮度（保留原方法以兼容性）
   */
  private adjustLightness(baseLightness: number, factor: number): number {
    const adjusted = baseLightness * factor
    return clamp(adjusted, 0, 100)
  }

  /**
   * 更新生成配置
   */
  updateConfig(config: Partial<ColorGenerationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ColorGenerationConfig {
    return { ...this.config }
  }

  /**
   * 设置颜色模式
   */
  setMode(mode: ColorMode): void {
    this.currentMode = mode
  }

  /**
   * 切换颜色模式
   */
  toggleMode(): ColorMode {
    this.currentMode = this.currentMode === 'light' ? 'dark' : 'light'
    return this.currentMode
  }

  /**
   * 获取当前颜色模式
   */
  getCurrentMode(): ColorMode {
    return this.currentMode
  }

  /**
   * 根据当前模式生成颜色
   * 在不同模式下调整颜色的亮度和饱和度
   */
  generateColorsForCurrentMode(primary: string): Omit<ColorConfig, 'primary'> {
    const baseColors = this.generateColors(primary)

    if (this.currentMode === 'dark') {
      // 暗色模式下调整颜色
      return {
        success: this.adjustColorForDarkMode(baseColors.success),
        warning: this.adjustColorForDarkMode(baseColors.warning),
        danger: this.adjustColorForDarkMode(baseColors.danger),
        gray: this.adjustColorForDarkMode(baseColors.gray),
      }
    }

    return baseColors
  }

  /**
   * 为暗色模式调整颜色
   */
  private adjustColorForDarkMode(color: string): string {
    const hsl = hexToHsl(color)
    if (!hsl) return color

    // 暗色模式下降低亮度，稍微提高饱和度
    const adjustedLightness = Math.max(20, hsl.l * 0.7) // 降低亮度但不低于20
    const adjustedSaturation = Math.min(100, hsl.s * 1.1) // 稍微提高饱和度

    return hslToHex(hsl.h, adjustedSaturation, adjustedLightness)
  }



  /**
   * 生成色阶（实现 ColorGenerator 接口）
   */
  generateScale(color: string, _mode: 'light' | 'dark'): any {
    // 这里应该调用色阶生成器，但为了简化，我们返回一个基本实现
    return {
      colors: [color],
      indices: { 5: color }
    }
  }

  /**
   * 生成 CSS 变量（实现 ColorGenerator 接口）
   */
  generateCSSVariables(
    scales: Record<string, any>,
    prefix = '--color'
  ): Record<string, string> {
    const variables: Record<string, string> = {}

    for (const [category, scale] of Object.entries(scales)) {
      if (scale && scale.indices) {
        for (const [index, color] of Object.entries(scale.indices)) {
          variables[`${prefix}-${category}-${index}`] = color as string
        }
      }
    }

    return variables
  }

  /**
   * 生成完整的CSS变量集合
   * 包括基础颜色、色阶、中性色等
   */
  generateCompleteCSSVariables(
    colors: Omit<ColorConfig, 'primary'>,
    scales: Record<string, any>,
    neutralColors?: any,
    mode: ColorMode = 'light',
    prefix = '--color'
  ): Record<string, string> {
    const variables: Record<string, string> = {}

    // 基础颜色变量
    for (const [category, color] of Object.entries(colors)) {
      variables[`${prefix}-${category}`] = color as string
    }

    // 色阶变量
    for (const [category, scale] of Object.entries(scales)) {
      if (scale && scale.indices) {
        for (const [index, color] of Object.entries(scale.indices)) {
          variables[`${prefix}-${category}-${index}`] = color as string
        }
      }
    }

    // 中性色变量
    if (neutralColors) {
      for (const [category, scale] of Object.entries(neutralColors)) {
        if (scale && scale.indices) {
          for (const [index, color] of Object.entries(scale.indices)) {
            variables[`${prefix}-${category}-${index}`] = color as string
          }
        }
      }
    }

    // 语义化变量（根据模式调整）
    this.addSemanticVariables(variables, colors, mode, prefix)

    return variables
  }

  /**
   * 添加语义化CSS变量
   */
  private addSemanticVariables(
    variables: Record<string, string>,
    colors: Omit<ColorConfig, 'primary'>,
    mode: ColorMode,
    prefix: string
  ): void {
    if (mode === 'light') {
      // 亮色模式的语义化变量
      variables[`${prefix}-background`] = '#ffffff'
      variables[`${prefix}-background-secondary`] = '#f8f9fa'
      variables[`${prefix}-background-tertiary`] = '#f1f3f4'
      variables[`${prefix}-text-primary`] = '#212529'
      variables[`${prefix}-text-secondary`] = '#6c757d'
      variables[`${prefix}-text-tertiary`] = '#adb5bd'
      variables[`${prefix}-border`] = '#dee2e6'
      variables[`${prefix}-border-light`] = '#e9ecef'
      variables[`${prefix}-shadow`] = 'rgba(0, 0, 0, 0.1)'
    } else {
      // 暗色模式的语义化变量
      variables[`${prefix}-background`] = '#1a1a1a'
      variables[`${prefix}-background-secondary`] = '#2d2d2d'
      variables[`${prefix}-background-tertiary`] = '#404040'
      variables[`${prefix}-text-primary`] = '#ffffff'
      variables[`${prefix}-text-secondary`] = '#b3b3b3'
      variables[`${prefix}-text-tertiary`] = '#808080'
      variables[`${prefix}-border`] = '#404040'
      variables[`${prefix}-border-light`] = '#333333'
      variables[`${prefix}-shadow`] = 'rgba(0, 0, 0, 0.3)'
    }
  }
}

/**
 * 创建颜色生成器实例
 */
export function createColorGenerator(config?: Partial<ColorGenerationConfig>): ColorGenerator {
  return new ColorGeneratorImpl(config)
}

/**
 * 创建纯中性灰色生成器
 * 生成不带任何色彩倾向的纯中性灰色
 */
export function createNeutralGrayGenerator(): ColorGenerator {
  return new ColorGeneratorImpl({
    grayMixPrimary: false,
    graySaturation: 0,
  })
}

/**
 * 创建带主色调倾向的灰色生成器
 * 生成带有主色调倾向的灰色
 */
export function createTintedGrayGenerator(saturation: number = 8): ColorGenerator {
  return new ColorGeneratorImpl({
    grayMixPrimary: true,
    graySaturation: saturation,
  })
}

/**
 * 默认颜色生成器实例（使用纯中性灰色）
 */
export const defaultColorGenerator = createNeutralGrayGenerator()

/**
 * 便捷函数：从主色调生成完整的颜色配置
 */
export function generateColorConfig(primary: string, config?: Partial<ColorGenerationConfig>): ColorConfig {
  const generator = config ? new ColorGeneratorImpl(config) : defaultColorGenerator
  const generatedColors = generator.generateColors(primary)

  return {
    primary: normalizeHex(primary),
    ...generatedColors,
  }
}

/**
 * 便捷函数：验证并生成颜色配置
 */
export function safeGenerateColorConfig(primary: string, config?: Partial<ColorGenerationConfig>): ColorConfig | null {
  try {
    return generateColorConfig(primary, config)
  }
  catch (error) {
    console.warn('Failed to generate color config:', error)
    return null
  }
}

/**
 * 预设的颜色生成配置
 */
export const COLOR_GENERATION_PRESETS = {
  /** 默认配置 */
  default: DEFAULT_CONFIG,

  /** 柔和配置 - 降低饱和度和对比度 */
  soft: {
    ...DEFAULT_CONFIG,
    saturationRange: [0.6, 1.0] as [number, number],
    lightnessRange: [0.9, 1.1] as [number, number],
  },

  /** 鲜艳配置 - 提高饱和度和对比度 */
  vibrant: {
    ...DEFAULT_CONFIG,
    saturationRange: [1.0, 1.3] as [number, number],
    lightnessRange: [0.7, 1.3] as [number, number],
  },

  /** 单色配置 - 基于主色调的不同明度 */
  monochrome: {
    ...DEFAULT_CONFIG,
    successHueOffset: 0,
    warningHueOffset: 0,
    dangerHueOffset: 0,
    graySaturation: 0,
  },
} as const
