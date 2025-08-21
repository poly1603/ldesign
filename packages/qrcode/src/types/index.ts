/**
 * LDesign QRCode - TypeScript Type Definitions
 * 定义二维码生成器的所有类型接口
 */

// 基础类型定义
export type QRCodeFormat = 'canvas' | 'svg' | 'image'
export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type QRCodeMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji'
export type LogoShape = 'square' | 'circle'
export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy'
export type CornerStyle = 'square' | 'rounded' | 'extra-rounded'
export type GradientType = 'linear' | 'radial'

// 颜色相关类型
export interface ColorStop {
  offset: number
  color: string
}

export interface GradientOptions {
  type: GradientType
  colors: ColorStop[]
  direction?: number // 线性渐变角度
  centerX?: number // 径向渐变中心X
  centerY?: number // 径向渐变中心Y
}

export type ColorValue = string | GradientOptions

// Logo配置接口
export interface LogoOptions {
  src: string
  size?: number
  margin?: number
  shape?: LogoShape
  borderWidth?: number
  borderColor?: string
  backgroundColor?: string
  opacity?: number
}

// 样式配置接口
export interface StyleOptions {
  backgroundColor?: ColorValue
  foregroundColor?: ColorValue
  dotStyle?: DotStyle
  cornerStyle?: CornerStyle
  borderRadius?: number
  margin?: number
}

// 主要配置接口
export interface QRCodeOptions {
  // 基础配置
  data: string
  size?: number
  format?: QRCodeFormat

  // 二维码配置
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel
  mode?: QRCodeMode
  version?: number
  mask?: number

  // 样式配置
  style?: StyleOptions

  // Logo配置
  logo?: LogoOptions

  // 高级配置
  margin?: number
  scale?: number
  quality?: number

  // 性能配置
  enableCache?: boolean
  cacheKey?: string
}

// 生成结果接口
export interface QRCodeResult {
  canvas?: HTMLCanvasElement
  svg?: string
  dataURL?: string
  blob?: Blob
  size: number
  format: QRCodeFormat
  timestamp: number
  element?: HTMLCanvasElement | SVGElement | HTMLImageElement
  width?: number
  height?: number
  text?: string
  options?: QRCodeOptions
  fromCache?: boolean
  generatedAt?: number
}

// 生成结果接口（新版本）
export interface QRCodeGenerationResult {
  success: boolean
  data: string
  format: QRCodeFormat
  metrics: {
    generationTime: number
    cacheHit: boolean
    size: number
  }
}

// 性能指标接口
export interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  cacheHit?: boolean
  size?: number
}

// 错误类型
export class QRCodeError extends Error {
  code: string
  details?: any

  constructor(message: string, code: string, details?: any) {
    super(message)
    this.name = 'QRCodeError'
    this.code = code
    this.details = details
  }
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 生成器配置接口
export interface GeneratorConfig {
  enablePerformanceMonitoring?: boolean
  maxCacheSize?: number
  defaultOptions?: Partial<QRCodeOptions>
}

// 事件类型
export interface QRCodeEvents {
  'generate:start': (options: QRCodeOptions) => void
  'generate:success': (result: QRCodeResult) => void
  'generate:error': (error: QRCodeError) => void
  'cache:hit': (key: string) => void
  'cache:miss': (key: string) => void
}

// Vue组件Props类型
export interface QRCodeProps extends QRCodeOptions {
  autoGenerate?: boolean
  loading?: boolean
  onGenerated?: (result: QRCodeResult) => void
  onError?: (error: QRCodeError) => void
}

// Vue Hook返回类型
export interface UseQRCodeReturn {
  // 响应式状态
  options: import('vue').Ref<QRCodeOptions>
  result: import('vue').Ref<QRCodeResult | null>
  isLoading: import('vue').Ref<boolean>
  error: import('vue').Ref<QRCodeError | null>

  // 方法
  generate: (customOptions?: Partial<QRCodeOptions>) => Promise<QRCodeResult | null>
  updateOptions: (newOptions: Partial<QRCodeOptions>, autoGenerate?: boolean) => Promise<void>
  download: (filename?: string) => void
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  destroy: () => void
}

// 工具函数类型
export type ColorValidator = (color: string) => boolean
export type OptionsValidator = (options: QRCodeOptions) => ValidationResult
export type CacheKeyGenerator = (options: QRCodeOptions) => string
export type SizeCalculator = (options: QRCodeOptions) => { width: number; height: number }

// 导出所有类型
// 注意：避免自循环导出
