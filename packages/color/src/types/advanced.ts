/**
 * 高级类型定义
 * 包含更专业的颜色科学、算法和性能相关类型
 */

import type { ColorFormat, ColorValue } from '../core/types'

/**
 * 颜色混合模式
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

/**
 * 颜色插值算法
 */
export type InterpolationAlgorithm =
  | 'linear'
  | 'bezier'
  | 'perceptual'
  | 'lab'
  | 'oklab'
  | 'lch'
  | 'oklch'

/**
 * 颜色生成策略
 */
export type ColorGenerationStrategy =
  | 'default'
  | 'vibrant'
  | 'muted'
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'

/**
 * 颜色盲类型
 */
export type ColorBlindnessType =
  | 'protanopia' // 红色盲
  | 'deuteranopia' // 绿色盲
  | 'tritanopia' // 蓝色盲
  | 'protanomaly' // 红色弱
  | 'deuteranomaly' // 绿色弱
  | 'tritanomaly' // 蓝色弱
  | 'achromatopsia' // 全色盲
  | 'achromatomaly' // 色弱

/**
 * 颜色和谐类型
 */
export type ColorHarmonyType =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'square'

/**
 * 精确的RGB颜色接口
 */
export interface PreciseRGB {
  /** 红色分量 (0-255) */
  r: number
  /** 绿色分量 (0-255) */
  g: number
  /** 蓝色分量 (0-255) */
  b: number
  /** 透明度 (0-1) */
  a?: number
}

/**
 * 精确的HSL颜色接口
 */
export interface PreciseHSL {
  /** 色相 (0-360) */
  h: number
  /** 饱和度 (0-100) */
  s: number
  /** 亮度 (0-100) */
  l: number
  /** 透明度 (0-1) */
  a?: number
}

/**
 * 精确的HSV颜色接口
 */
export interface PreciseHSV {
  /** 色相 (0-360) */
  h: number
  /** 饱和度 (0-100) */
  s: number
  /** 明度 (0-100) */
  v: number
  /** 透明度 (0-1) */
  a?: number
}

/**
 * LAB颜色空间接口
 */
export interface LABColor {
  /** 亮度 (0-100) */
  l: number
  /** 绿-红轴 (-128 to 127) */
  a: number
  /** 蓝-黄轴 (-128 to 127) */
  b: number
  /** 透明度 (0-1) */
  alpha?: number
}

/**
 * LCH颜色空间接口
 */
export interface LCHColor {
  /** 亮度 (0-100) */
  l: number
  /** 色度 (0-150) */
  c: number
  /** 色相 (0-360) */
  h: number
  /** 透明度 (0-1) */
  alpha?: number
}

/**
 * 颜色转换配置
 */
export interface ColorConversionConfig {
  /** 输入格式 */
  inputFormat?: ColorFormat
  /** 输出格式 */
  outputFormat: ColorFormat
  /** 精度 */
  precision?: number
  /** 是否保留透明度 */
  preserveAlpha?: boolean
  /** 色彩空间 */
  colorSpace?: 'srgb' | 'p3' | 'rec2020'
  /** 伽马校正 */
  gammaCorrection?: boolean
}

/**
 * 颜色混合配置
 */
export interface ColorBlendConfig {
  /** 混合模式 */
  mode: BlendMode
  /** 混合比例 (0-1) */
  ratio?: number
  /** 是否使用感知混合 */
  perceptual?: boolean
  /** 色彩空间 */
  colorSpace?: 'rgb' | 'lab' | 'lch'
}

/**
 * 调色板生成配置
 */
export interface PaletteGenerationConfig {
  /** 基础颜色 */
  baseColor: ColorValue
  /** 生成策略 */
  strategy: ColorGenerationStrategy
  /** 颜色数量 */
  count: number
  /** 色相范围 */
  hueRange?: number
  /** 饱和度范围 */
  saturationRange?: [number, number]
  /** 亮度范围 */
  lightnessRange?: [number, number]
  /** 插值算法 */
  interpolation?: InterpolationAlgorithm
  /** 是否确保可访问性 */
  ensureAccessibility?: boolean
  /** 目标对比度 */
  targetContrast?: number
}

/**
 * 颜色分析配置
 */
export interface ColorAnalysisConfig {
  /** 分析深度 */
  depth?: 'basic' | 'detailed' | 'comprehensive'
  /** 是否包含和谐分析 */
  includeHarmony?: boolean
  /** 是否包含可访问性分析 */
  includeAccessibility?: boolean
  /** 是否包含色盲分析 */
  includeColorBlindness?: boolean
  /** 参考颜色（用于对比分析） */
  referenceColors?: ColorValue[]
}

/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled?: boolean
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 是否记录详细信息 */
  detailed?: boolean
  /** 性能阈值（毫秒） */
  thresholds?: {
    conversion?: number
    generation?: number
    analysis?: number
  }
}

/**
 * 缓存策略配置
 */
export interface CacheStrategyConfig {
  /** 缓存类型 */
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
  /** 最大缓存大小 */
  maxSize?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用压缩 */
  compression?: boolean
  /** 缓存键前缀 */
  keyPrefix?: string
}

/**
 * 颜色验证规则
 */
export interface ColorValidationRules {
  /** 允许的格式 */
  allowedFormats?: ColorFormat[]
  /** 是否允许透明度 */
  allowAlpha?: boolean
  /** 亮度范围 */
  lightnessRange?: [number, number]
  /** 饱和度范围 */
  saturationRange?: [number, number]
  /** 自定义验证函数 */
  customValidator?: (color: ColorValue) => boolean
}

/**
 * 主题生成选项
 */
export interface ThemeGenerationOptions {
  /** 生成策略 */
  strategy?: ColorGenerationStrategy
  /** 是否生成暗色模式 */
  generateDarkMode?: boolean
  /** 暗色模式生成算法 */
  darkModeAlgorithm?: 'invert' | 'desaturate' | 'shift-hue' | 'custom'
  /** 色阶数量 */
  scaleSteps?: number
  /** 是否确保可访问性 */
  ensureAccessibility?: boolean
  /** 目标对比度等级 */
  contrastLevel?: 'AA' | 'AAA'
  /** 是否包含中性色 */
  includeNeutrals?: boolean
}

/**
 * 导出类型联合
 */
export type AdvancedColorType = PreciseRGB | PreciseHSL | PreciseHSV | LABColor | LCHColor

/**
 * 颜色操作结果
 */
export interface ColorOperationResult<T = ColorValue> {
  /** 操作结果 */
  result: T
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 性能信息 */
  performance?: {
    duration: number
    cacheHit: boolean
  }
}
