/**
 * LDesign QRCode - 核心二维码生成器
 * 实现Canvas/SVG/Image三种输出格式
 */

import type {
  GeneratorConfig,
  PerformanceMetric,
  QRCodeOptions,
  QRCodeGenerationResult,
} from '../types'
import QRCode from 'qrcode'
import { createError, PerformanceMonitor } from '../utils'
import { LogoProcessor } from './logo'
import { StyleProcessor } from './styles'
import { AdvancedCache, createCache, type CacheStats } from './cache'

export class QRCodeGenerator {
  private logoProcessor: LogoProcessor
  private styleProcessor: StyleProcessor
  private performanceMonitor: PerformanceMonitor
  private cache: AdvancedCache<any>
  private config: GeneratorConfig
  private options: QRCodeOptions

  constructor(options?: Partial<QRCodeOptions>) {
    this.options = {
      data: '',
      size: 200,
      format: 'canvas',
      margin: 4,
      errorCorrectionLevel: 'M',
      ...options,
    }

    this.config = {
      maxCacheSize: 100,
      enablePerformanceMonitoring: true,
    }

    this.logoProcessor = new LogoProcessor()
    this.styleProcessor = new StyleProcessor()
    this.performanceMonitor = new PerformanceMonitor()
    this.cache = createCache({
      maxSize: this.config.maxCacheSize,
      ttl: 1000 * 60 * 30, // 30 minutes
      maxMemoryUsage: 20 * 1024 * 1024, // 20MB
    })
  }

  /**
   * 生成二维码
   */
  async generate(
    text?: string,
    overrideOptions?: Partial<QRCodeOptions>,
  ): Promise<QRCodeGenerationResult> {
    const perfId = this.performanceMonitor.start('generate')

    const targetText = (text ?? this.options.data) || ''
    if (!targetText) {
      const metric = this.performanceMonitor.end(perfId, false)
      return {
        success: false,
        data: '',
        format: (overrideOptions?.format || this.options.format || 'canvas') as any,
        size: 0,
        timestamp: metric.timestamp,
        metrics: {
          duration: metric.duration,
          timestamp: new Date(metric.timestamp),
        },
        error: createError('No data provided for QR code generation', 'INVALID_DATA'),
      }
    }

    // Merge options and normalize
    const mergedOptions: QRCodeOptions = {
      ...this.options,
      ...(overrideOptions || {}),
    }
    const format = (mergedOptions.outputFormat || mergedOptions.format || 'canvas') as 'canvas' | 'svg' | 'image'
    const enableCache = (mergedOptions.performance?.enableCache ?? mergedOptions.enableCache) ?? true

    // Cache
    const cacheKey = this.generateCacheKey(targetText, { ...mergedOptions, format })
    if (enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      const metric = this.performanceMonitor.end(perfId, true)
      return {
        success: true,
        data: cached.data,
        format: cached.format,
        size: cached.size,
        timestamp: cached.timestamp,
        fromCache: true,
        metrics: {
          duration: metric.duration,
          timestamp: new Date(metric.timestamp),
          cacheHit: true,
        },
      }
    }

    try {
      const generated = await this.generateQRCode(targetText, { ...mergedOptions, format })

      // Add to cache
      if (enableCache) {
        this.cache.set(cacheKey, {
          data: generated.data,
          format,
          size: mergedOptions.size || 200,
          timestamp: Date.now()
        })
      }

      const metric = this.performanceMonitor.end(perfId, false)
      return {
        success: true,
        data: generated.data,
        format,
        size: mergedOptions.size || 200,
        timestamp: Date.now(),
        fromCache: false,
        metrics: {
          duration: metric.duration,
          timestamp: new Date(metric.timestamp),
          cacheHit: false,
          size: generated.size,
        },
      }
    }
    catch (error) {
      const metric = this.performanceMonitor.end(perfId, false)
      return {
        success: false,
        data: '',
        format,
        size: 0,
        timestamp: Date.now(),
        metrics: {
          duration: metric.duration,
          timestamp: new Date(metric.timestamp),
          cacheHit: false,
        },
        error: createError(
          `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
          'GENERATION_ERROR',
        ),
      }
    }
  }

  /**
   * 生成二维码核心逻辑
   */
  private async generateQRCode(
    text: string,
    options: QRCodeOptions,
  ): Promise<{ data: any, size: number }> {
    const format = (options.outputFormat || options.format || 'canvas') as 'canvas' | 'svg' | 'image'
    const width = options.size || 200
    const height = options.size || width

    // Prepare QR options
    const qrOptions: any = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      type: format === 'svg' ? 'svg' : 'image/png',
      quality: options.quality ?? 0.92,
      margin: options.margin ?? 1,
      color: {
        dark: options.color?.foreground || '#000000',
        light: options.color?.background || '#FFFFFF',
      },
      width,
    }

    switch (format) {
      case 'canvas': {
        const element = await this.generateCanvas(text, qrOptions, options)
        return { data: element, size: Math.max(width, height) }
      }
      case 'svg': {
        const element = await this.generateSVG(text, qrOptions, options)
        const svgData = new XMLSerializer().serializeToString(element)
        return { data: svgData, size: Math.max(width, height) }
      }
      case 'image': {
        const element = await this.generateImage(text, qrOptions, options)
        return { data: (element as HTMLImageElement).src, size: Math.max(width, height) }
      }
      default:
        throw createError(`Unsupported format: ${format}`, 'INVALID_FORMAT')
    }
  }

  /**
   * 生成Canvas格式
   */
  private async generateCanvas(
    text: string,
    qrOptions: any,
    options: QRCodeOptions,
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')

    canvas.width = options.size || 200
    canvas.height = options.size || canvas.width

    // 生成基础二维码
    await QRCode.toCanvas(canvas, text, qrOptions)

    // 应用样式
    if (options.style) {
      this.styleProcessor.applyStylesToCanvas(canvas, options.style)
    }

    // 添加Logo
    if (options.logo) {
      await this.logoProcessor.addLogoToCanvas(canvas, options.logo)
    }

    return canvas
  }

  /**
   * 生成SVG格式
   */
  private async generateSVG(
    text: string,
    qrOptions: any,
    options: QRCodeOptions,
  ): Promise<SVGElement> {
    // 生成SVG字符串
    const svgString = (await (QRCode as any).toString(text, {
      ...qrOptions,
      type: 'svg',
    })) as string

    // 解析SVG
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.documentElement as unknown as SVGElement

    // 设置尺寸
    svgElement.setAttribute('width', (options.size || 200).toString())
    svgElement.setAttribute('height', (options.size || 200).toString())

    // 应用样式
    if (options.style) {
      this.styleProcessor.applyStylesToSVG(svgElement, options.style)
    }

    // 添加Logo
    if (options.logo) {
      await this.logoProcessor.addLogoToSVG(svgElement, options.logo)
    }

    return svgElement
  }

  /**
   * 生成Image格式
   */
  private async generateImage(
    text: string,
    qrOptions: any,
    options: QRCodeOptions,
  ): Promise<HTMLImageElement> {
    // 先生成Canvas，然后转换为Image
    const canvas = await this.generateCanvas(text, qrOptions, options)

    const img = new Image()
    img.src = canvas.toDataURL('image/png')
    img.width = canvas.width
    img.height = canvas.height

    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = () => reject(createError('Failed to create image', 'IMAGE_GENERATION_ERROR'))
    })
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(text: string, options: QRCodeOptions): string {
    const optionsStr = JSON.stringify(options, (_key, value) => {
      // 排除函数和不可序列化的值
      if (typeof value === 'function')
        return undefined
      return value
    })

    // 使用简单的哈希而非Btoa来避免编码问题
    let hash = 0
    const combined = text + optionsStr
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }



  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    return this.cache.getStats()
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return this.performanceMonitor.getMetrics()
  }

  /**
   * 清除性能指标
   */
  clearPerformanceMetrics(): void {
    this.performanceMonitor.clear()
  }

  /**
   * 获取当前选项
   */
  getOptions(): QRCodeOptions {
    return { ...this.options }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<QRCodeOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GeneratorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 销毁生成器
   */
  destroy(): void {
    this.clearCache()
    this.clearPerformanceMetrics()
    this.logoProcessor.destroy()
    this.styleProcessor.destroy()
  }
}

export default QRCodeGenerator

// 便捷导出：默认单例与工厂函数
export const defaultGenerator = new QRCodeGenerator()
export function createQRCodeGenerator(options?: Partial<QRCodeOptions>) {
  return new QRCodeGenerator(options)
}
