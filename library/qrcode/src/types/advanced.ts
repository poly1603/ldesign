/**
 * LDesign QRCode - 高级类型定义
 * 提供更安全和准确的类型定义，减少 as any 的使用
 */

import type { 
  LogoOptions, 
  QRCodeOptions, 
  QRCodeResult, 
  StyleOptions,
  QRCodeFormat 
} from './index'

// 更严格的Logo选项类型
export interface StrictLogoOptions extends Omit<LogoOptions, 'position' | 'shape'> {
  src: string
  size?: number
  margin?: number
  shape?: 'square' | 'circle'
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  offset?: { x: number; y: number }
  opacity?: number
  borderWidth?: number
  borderColor?: string
  backgroundColor?: string
  // 支持的扩展属性
  background?: string
  border?: { width: number; color: string }
}

// Logo处理器位置计算参数
export interface LogoPositionParams {
  containerWidth: number
  containerHeight: number
  logoWidth: number
  logoHeight: number
  position: StrictLogoOptions['position']
  offset?: { x: number; y: number }
}

// Logo位置计算结果
export interface LogoPosition {
  x: number
  y: number
}

// Canvas绘制上下文类型守卫
export function isCanvasRenderingContext2D(
  ctx: CanvasRenderingContext2D | null
): ctx is CanvasRenderingContext2D {
  return ctx !== null
}

// SVG元素类型守卫
export function isSVGElement(element: Element | null): element is SVGElement {
  return element !== null && element.namespaceURI === 'http://www.w3.org/2000/svg'
}

// 图片元素类型守卫
export function isHTMLImageElement(element: Element | null): element is HTMLImageElement {
  return element !== null && element instanceof HTMLImageElement
}

// Canvas元素类型守卫
export function isHTMLCanvasElement(element: Element | null): element is HTMLCanvasElement {
  return element !== null && element instanceof HTMLCanvasElement
}

// 生成器结果的类型守卫
export function isQRCodeGenerationSuccess(
  result: any
): result is { success: true; data: any; format: QRCodeFormat } {
  return result && typeof result === 'object' && result.success === true
}

// 生成器错误结果的类型守卫
export function isQRCodeGenerationError(
  result: any
): result is { success: false; error: Error } {
  return result && typeof result === 'object' && result.success === false
}

// DOM元素联合类型
export type QRCodeElement = HTMLCanvasElement | SVGElement | HTMLImageElement

// 更严格的QR码选项（移除可选的data字段）
export interface StrictQRCodeOptions extends Omit<QRCodeOptions, 'data' | 'logo'> {
  data: string // 必需字段
  logo?: StrictLogoOptions
}

// 批量生成的选项
export interface BatchGenerateOptions extends Omit<StrictQRCodeOptions, 'data'> {
  // 批量相关配置
  concurrency?: number
  onProgress?: (completed: number, total: number) => void
  onItemComplete?: (result: QRCodeResult, index: number) => void
  onItemError?: (error: Error, index: number) => void
}

// 下载选项
export interface DownloadOptions {
  filename?: string
  format?: 'png' | 'jpg' | 'svg' | 'webp'
  quality?: number
  includeMetadata?: boolean
}

// 验证选项
export interface ValidationOptions {
  checkUrl?: boolean
  maxLength?: number
  allowedProtocols?: string[]
  customValidators?: Array<(data: string) => boolean | string>
}

// 主题配置
export interface ThemeConfig {
  name: string
  colors: {
    foreground: string
    background: string
    accent?: string
  }
  style?: Partial<StyleOptions>
  logo?: Partial<StrictLogoOptions>
}

// 预设主题
export interface PresetThemes {
  light: ThemeConfig
  dark: ThemeConfig
  blue: ThemeConfig
  green: ThemeConfig
  purple: ThemeConfig
  [key: string]: ThemeConfig
}

// 工厂选项
export interface GeneratorFactoryOptions {
  enableCache?: boolean
  cacheConfig?: {
    maxSize?: number
    ttl?: number
    maxMemoryUsage?: number
  }
  enablePerformanceMonitoring?: boolean
  defaultTheme?: string
  customThemes?: Record<string, ThemeConfig>
}

// 插件接口
export interface QRCodePlugin {
  name: string
  version: string
  install: (generator: any) => void
  uninstall?: (generator: any) => void
}

// Web Worker 相关类型
export interface WorkerMessage {
  id: string
  type: 'generate' | 'batch' | 'validate'
  payload: any
}

export interface WorkerResponse {
  id: string
  success: boolean
  data?: any
  error?: string
}

// 事件类型定义
export interface QRCodeEvents {
  'beforeGenerate': (options: StrictQRCodeOptions) => void
  'afterGenerate': (result: QRCodeResult) => void
  'error': (error: Error) => void
  'cacheHit': (key: string) => void
  'cacheMiss': (key: string) => void
  'themeChange': (theme: ThemeConfig) => void
}

// 更安全的类型转换工具
export class TypeSafeConverter {
  static toStrictLogoOptions(options: any): StrictLogoOptions | null {
    if (!options || typeof options !== 'object' || !options.src) {
      return null
    }
    
    return {
      src: String(options.src),
      size: typeof options.size === 'number' ? options.size : undefined,
      margin: typeof options.margin === 'number' ? options.margin : undefined,
      shape: ['square', 'circle'].includes(options.shape) ? options.shape : 'square',
      position: [
        'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
      ].includes(options.position) ? options.position : 'center',
      offset: options.offset && typeof options.offset === 'object' 
        ? { x: Number(options.offset.x) || 0, y: Number(options.offset.y) || 0 }
        : undefined,
      opacity: typeof options.opacity === 'number' 
        ? Math.max(0, Math.min(1, options.opacity)) 
        : undefined,
      borderWidth: typeof options.borderWidth === 'number' ? options.borderWidth : undefined,
      borderColor: typeof options.borderColor === 'string' ? options.borderColor : undefined,
      backgroundColor: typeof options.backgroundColor === 'string' 
        ? options.backgroundColor 
        : (typeof options.background === 'string' ? options.background : undefined),
    }
  }

  static toStrictQRCodeOptions(options: any): StrictQRCodeOptions | null {
    if (!options || typeof options !== 'object' || !options.data) {
      return null
    }

    const logo = this.toStrictLogoOptions(options.logo)

    return {
      data: String(options.data),
      size: typeof options.size === 'number' && options.size > 0 ? options.size : 200,
      format: ['canvas', 'svg', 'image'].includes(options.format) ? options.format : 'canvas',
      margin: typeof options.margin === 'number' ? options.margin : 4,
      errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(options.errorCorrectionLevel) 
        ? options.errorCorrectionLevel : 'M',
      color: options.color && typeof options.color === 'object' ? {
        foreground: typeof options.color.foreground === 'string' 
          ? options.color.foreground : '#000000',
        background: typeof options.color.background === 'string' 
          ? options.color.background : '#FFFFFF',
      } : undefined,
      logo: logo || undefined,
      style: options.style,
      quality: typeof options.quality === 'number' 
        ? Math.max(0.1, Math.min(1, options.quality)) 
        : undefined,
    }
  }
}

// 运行时类型检查工具
export class RuntimeTypeChecker {
  static isValidURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  static isValidImageSrc(src: string): boolean {
    return /^(data:|https?:|blob:)/i.test(src) || this.isValidURL(src)
  }

  static isValidColor(color: string): boolean {
    // 简化的颜色验证
    return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color) ||
           /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(color) ||
           /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/i.test(color) ||
           ['black', 'white', 'red', 'green', 'blue', 'transparent'].includes(color.toLowerCase())
  }

  static isValidSize(size: any): size is number {
    return typeof size === 'number' && size > 0 && size <= 2000
  }
}
