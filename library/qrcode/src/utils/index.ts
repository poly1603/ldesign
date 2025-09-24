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
  outputFormat: 'canvas',
  errorCorrectionLevel: 'M',
  mode: 'byte',
  version: 0,
  mask: 0,
  margin: 4,
  scale: 1,
  quality: 0.92,
  enableCache: true,
  cacheKey: '',
  performance: { enableCache: true },
  color: { foreground: '#000000', background: '#ffffff' },
}

// 颜色验证
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string')
    return false

  // 检查十六进制颜色
  if (/^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) {
    return true
  }

  // 检查RGB颜色
  const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch
    const red = parseInt(r, 10)
    const green = parseInt(g, 10)
    const blue = parseInt(b, 10)
    return red >= 0 && red <= 255 && green >= 0 && green <= 255 && blue >= 0 && blue <= 255
  }

  // 检查RGBA颜色
  const rgbaMatch = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/)
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch
    const red = parseInt(r, 10)
    const green = parseInt(g, 10)
    const blue = parseInt(b, 10)
    const alpha = parseFloat(a)
    return red >= 0 && red <= 255 && green >= 0 && green <= 255 && blue >= 0 && blue <= 255 && alpha >= 0 && alpha <= 1
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

  // 验证颜色配置
  if (options.color) {
    if (options.color.foreground && typeof options.color.foreground === 'string') {
      if (!isValidColor(options.color.foreground)) {
        errors.push('color.foreground is not a valid color')
      }
    }

    if (options.color.background && typeof options.color.background === 'string') {
      if (!isValidColor(options.color.background)) {
        errors.push('color.background is not a valid color')
      }
    }
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
    margin: 4,
    errorCorrectionLevel: 'M',
    outputFormat: 'canvas',
    format: 'canvas',
    color: {
      foreground: '#000000',
      background: '#FFFFFF',
    },
    performance: {
      enableCache: true,
    },
  }
}

// 合并配置
export function mergeOptions(base: QRCodeOptions, override: Partial<QRCodeOptions>): QRCodeOptions {
  const merged: QRCodeOptions = {
    ...base,
    ...override,
  }

  // 深度合并color选项
  if (base.color || override.color) {
    merged.color = {
      ...(base.color || {}),
      ...(override.color || {}),
    }
  }

  // 深度合并style选项
  if (base.style || override.style) {
    merged.style = {
      ...(base.style || {}),
      ...(override.style || {}),
    }
  }

  // 深度合并logo选项
  if (base.logo || override.logo) {
    merged.logo = {
      ...(base.logo || {} as any),
      ...(override.logo || {} as any),
    } as any
  }

  return merged
}

// 计算实际尺寸
export function calculateActualSize(size: number, margin: number): number {
  return size + margin * 2
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

  // 使用简单的哈希算法生成缓存键
  const jsonString = JSON.stringify(keyData)
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

// 性能监控器
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private activeOperations: Map<string, { operation: string, startTime: number }> = new Map()
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

  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation)
    }
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

  /**
   * 开始性能测量
   */
  start(operation: string): string {
    const id = Math.random().toString(36).substr(2, 9)
    this.activeOperations.set(id, {
      operation,
      startTime: performance.now(),
    })
    return id
  }

  /**
   * 结束性能测量
   */
  end(id: string, cacheHit = false, size?: number): PerformanceMetric {
    const activeOp = this.activeOperations.get(id)
    if (!activeOp) {
      throw new Error(`No active operation found for id: ${id}`)
    }

    const duration = performance.now() - activeOp.startTime
    const metric: PerformanceMetric = {
      operation: activeOp.operation,
      duration,
      timestamp: Date.now(),
      cacheHit,
      size,
    }

    this.metrics.push(metric)
    this.activeOperations.delete(id)

    // 限制指标数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    return metric
  }

  /**
   * 按操作类型获取指标
   */
  getMetricsByOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation === operation)
  }

  clear(): void {
    this.metrics = []
    this.activeOperations.clear()
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

/**
 * 验证QR码选项
 */
export function validateOptions(options: QRCodeOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!options.data) {
    errors.push('Data is required')
  }

  if (options.size && options.size <= 0) {
    errors.push('Size must be positive')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
