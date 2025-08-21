/**
 * LDesign QRCode - 工具函数
 * 提供配置验证、颜色处理、性能监控等功能
 */

import type {
  PerformanceMetric,
  QRCodeOptions,
  ValidationResult,
} from '../types'
// 直接定义错误类型，避免与类型声明合并冲突

// 默认配置
export const DEFAULT_OPTIONS: Required<Omit<QRCodeOptions, 'logo' | 'style'>> = {
  data: '',
  size: 200,
  format: 'canvas',
  errorCorrectionLevel: 'M',
  mode: 'byte',
  version: 0,
  mask: 0,
  margin: 4,
  scale: 1,
  quality: 0.92,
  enableCache: true,
  cacheKey: '',
}

// 颜色验证
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string')
    return false

  // 检查十六进制颜色
  if (/^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) {
    return true
  }

  // 检查RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:(,\s*[0-9.]+)\s*)?\)$/.test(color)) {
    return true
  }

  // 检查HSL/HSLA
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:(,\s*[0-9.]+)\s*)?\)$/.test(color)) {
    return true
  }

  // 检查命名颜色
  return isNamedColor(color)
}

// 命名颜色检查
export function isNamedColor(color: string): boolean {
  const namedColors = [
    'black',
    'white',
    'red',
    'green',
    'blue',
    'yellow',
    'cyan',
    'magenta',
    'gray',
    'grey',
    'orange',
    'purple',
    'pink',
    'brown',
    'transparent',
  ]
  return namedColors.includes(color.toLowerCase())
}

// 配置验证
export function validateQRCodeOptions(options: QRCodeOptions): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 验证必需字段
  if (!options.data || typeof options.data !== 'string') {
    errors.push('data is required and must be a string')
  }

  // 验证尺寸
  if (options.size !== undefined) {
    if (typeof options.size !== 'number' || options.size <= 0) {
      errors.push('size must be a positive number')
    }
    else if (options.size > 2000) {
      warnings.push('size is very large, may impact performance')
    }
  }

  // 验证格式
  if (options.format && !['canvas', 'svg', 'image'].includes(options.format)) {
    errors.push('format must be one of: canvas, svg, image')
  }

  // 验证纠错级别
  if (options.errorCorrectionLevel && !['L', 'M', 'Q', 'H'].includes(options.errorCorrectionLevel)) {
    errors.push('errorCorrectionLevel must be one of: L, M, Q, H')
  }

  // 验证样式配置
  if (options.style) {
    if (options.style.backgroundColor && typeof options.style.backgroundColor === 'string') {
      if (!isValidColor(options.style.backgroundColor)) {
        errors.push('style.backgroundColor is not a valid color')
      }
    }

    if (options.style.foregroundColor && typeof options.style.foregroundColor === 'string') {
      if (!isValidColor(options.style.foregroundColor)) {
        errors.push('style.foregroundColor is not a valid color')
      }
    }
  }

  // 验证Logo配置
  if (options.logo) {
    if (!options.logo.src || typeof options.logo.src !== 'string') {
      errors.push('logo.src is required and must be a string')
    }

    if (options.logo.size !== undefined) {
      if (typeof options.logo.size !== 'number' || options.logo.size <= 0) {
        errors.push('logo.size must be a positive number')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// 获取默认配置
export function getDefaultOptions(): QRCodeOptions {
  return {
    data: '',
    size: 200,
    format: 'canvas',
  }
}

// 合并配置
export function mergeOptions(base: QRCodeOptions, override: Partial<QRCodeOptions>): QRCodeOptions {
  const merged: QRCodeOptions = {
    ...base,
    ...override,
  }
  if (base.style || override.style) {
    merged.style = {
      ...(base.style || {}),
      ...(override.style || {}),
    }
  }
  if (base.logo || override.logo) {
    merged.logo = {
      ...(base.logo || {} as any),
      ...(override.logo || {} as any),
    } as any
  }
  return merged
}

// 计算实际尺寸
export function calculateActualSize(options: QRCodeOptions): { width: number, height: number } {
  const baseSize = options.size || DEFAULT_OPTIONS.size
  const margin = options.margin || DEFAULT_OPTIONS.margin
  const scale = options.scale || DEFAULT_OPTIONS.scale

  const actualSize = (baseSize + margin * 2) * scale

  return {
    width: actualSize,
    height: actualSize,
  }
}

// 生成缓存键
export function generateCacheKey(options: QRCodeOptions): string {
  if (options.cacheKey) {
    return options.cacheKey
  }

  const keyData = {
    data: options.data,
    size: options.size,
    format: options.format,
    errorCorrectionLevel: options.errorCorrectionLevel,
    style: options.style,
    logo: options.logo,
  }

  return btoa(JSON.stringify(keyData)).replace(/[+/=]/g, '')
}

// 性能监控器
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 100

  startOperation(operation: string): (cacheHit?: boolean, size?: number) => void {
    const startTime = performance.now()

    return (cacheHit = false, size?: number) => {
      const duration = performance.now() - startTime

      this.metrics.push({
        operation,
        duration,
        timestamp: Date.now(),
        cacheHit,
        size,
      })

      // 限制指标数量
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics)
      }
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getAverageTime(operation?: string): number {
    const filteredMetrics = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics

    if (filteredMetrics.length === 0)
      return 0

    const totalTime = filteredMetrics.reduce((sum, m) => sum + m.duration, 0)
    return totalTime / filteredMetrics.length
  }

  getCacheHitRate(): number {
    const cacheableMetrics = this.metrics.filter(m => m.cacheHit !== undefined)
    if (cacheableMetrics.length === 0)
      return 0

    const hits = cacheableMetrics.filter(m => m.cacheHit).length
    return hits / cacheableMetrics.length
  }

  clear(): void {
    this.metrics = []
  }
}

// Canvas转DataURL
export function canvasToDataURL(canvas: HTMLCanvasElement, format = 'image/png', quality = 0.92): string {
  return canvas.toDataURL(format, quality)
}

// 下载文件
export function downloadFile(dataURL: string, filename: string, format?: 'canvas' | 'svg' | 'image'): void {
  const link = document.createElement('a')
  // 自动补全扩展名
  const hasExt = /\.[a-z0-9]+$/i.test(filename)
  const ext = format === 'svg' ? 'svg' : 'png'
  link.download = hasExt ? filename : `${filename}.${ext}`
  link.href = dataURL || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 错误创建器
export function createError(message: string, code: string = 'UNKNOWN_ERROR', details?: any): QRCodeError {
  return new QRCodeError(message, code, details)
}

// 导出QRCodeError类
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
