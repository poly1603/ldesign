/**
 * LDesign QRCode - 核心二维码生成器
 * 实现Canvas/SVG/Image三种输出格式
 */

import QRCode from 'qrcode'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeFormat,
  QRCodeGenerationResult,
  PerformanceMetric,
  GeneratorConfig
} from '../types'
import { LogoProcessor } from './logo'
import { StyleProcessor } from './styles'
import { PerformanceMonitor, createError, validateQRCodeOptions } from '../utils'

export class QRCodeGenerator {
  private logoProcessor: LogoProcessor
  private styleProcessor: StyleProcessor
  private performanceMonitor: PerformanceMonitor
  private cache: Map<string, QRCodeResult> = new Map()
  private config: GeneratorConfig
  private options: QRCodeOptions

  constructor(options: QRCodeOptions) {
    this.options = {
      data: '',
      size: 200,
      format: 'canvas',
      ...options
    }
    
    this.config = {
      enableCache: true,
      maxCacheSize: 100,
      enablePerformanceMonitoring: true
    }
    
    this.logoProcessor = new LogoProcessor()
    this.styleProcessor = new StyleProcessor()
    this.performanceMonitor = new PerformanceMonitor()
  }

  /**
   * 生成二维码
   */
  async generate(): Promise<QRCodeGenerationResult> {
    const startTime = performance.now()
    
    try {
      const text = this.options.data
      if (!text) {
        throw createError('No data provided for QR code generation', 'INVALID_DATA')
      }

      // 合并选项
      const mergedOptions: QRCodeOptions = {
        width: this.options.size || 200,
        height: this.options.size || 200,
        format: this.options.format || 'canvas',
        errorCorrectionLevel: this.options.errorCorrectionLevel || 'M',
        margin: this.options.margin || 4,
        color: this.options.color || {
          dark: '#000000',
          light: '#FFFFFF'
        },
        ...this.options
      }

      // 检查缓存
      const cacheKey = this.generateCacheKey(text, mergedOptions)
      if (this.config.enableCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!
        return {
          success: true,
          data: cached.dataURL,
          format: cached.format,
          metrics: {
            generationTime: 0,
            cacheHit: true,
            size: cached.dataURL.length
          }
        }
      }

      const result = await this.generateQRCode(text, mergedOptions)
      
      // 添加到缓存
      if (this.config.enableCache) {
        this.addToCache(cacheKey, result)
      }

      const endTime = performance.now()
      const generationTime = endTime - startTime

      // 记录性能指标
      if (this.config.enablePerformanceMonitoring) {
        this.performanceMonitor.recordMetric({
          operation: 'generate',
          duration: generationTime,
          timestamp: Date.now(),
          metadata: {
            format: mergedOptions.format,
            size: `${mergedOptions.width}x${mergedOptions.height}`,
            hasLogo: !!mergedOptions.logo,
            hasStyle: !!mergedOptions.style
          }
        })
      }

      return {
        success: true,
        data: result.dataURL,
        format: result.format,
        metrics: {
          generationTime,
          cacheHit: false,
          size: result.dataURL.length
        }
      }
    } catch (error) {
      const endTime = performance.now()
      const generationTime = endTime - startTime
      
      // 记录错误指标
      if (this.config.enablePerformanceMonitoring) {
        this.performanceMonitor.recordMetric({
          operation: 'generate_error',
          duration: generationTime,
          timestamp: Date.now(),
          metadata: {
            error: error instanceof Error ? error.message : String(error)
          }
        })
      }
      
      console.error('QRCode generation failed:', error)
      throw createError(
        `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'GENERATION_ERROR'
      )
    }
  }

  /**
   * 生成二维码核心逻辑
   */
  private async generateQRCode(
    text: string,
    options: QRCodeOptions
  ): Promise<QRCodeResult> {
    const format = options.format || 'canvas'
    const width = options.width || 200
    const height = options.height || width
    
    // 准备QRCode库的选项
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      type: format === 'svg' ? 'svg' : 'image/png',
      quality: 0.92,
      margin: options.margin || 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: width
    }

    let dataURL: string
    let element: HTMLCanvasElement | SVGElement | HTMLImageElement

    switch (format) {
      case 'canvas':
        element = await this.generateCanvas(text, qrOptions, options)
        dataURL = (element as HTMLCanvasElement).toDataURL('image/png')
        break
        
      case 'svg':
        element = await this.generateSVG(text, qrOptions, options)
        const svgData = new XMLSerializer().serializeToString(element)
        dataURL = `data:image/svg+xml;base64,${btoa(svgData)}`
        break
        
      case 'image':
        element = await this.generateImage(text, qrOptions, options)
        dataURL = (element as HTMLImageElement).src
        break
        
      default:
        throw createError(`Unsupported format: ${format}`, 'INVALID_FORMAT')
    }

    return {
      dataURL,
      element,
      format,
      width,
      height,
      text,
      options,
      fromCache: false,
      generatedAt: Date.now()
    }
  }

  /**
   * 生成Canvas格式
   */
  private async generateCanvas(
    text: string,
    qrOptions: any,
    options: QRCodeOptions
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = options.width || 200
    canvas.height = options.height || canvas.width

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
    options: QRCodeOptions
  ): Promise<SVGElement> {
    // 生成SVG字符串
    const svgString = await QRCode.toString(text, {
      ...qrOptions,
      type: 'svg'
    })

    // 解析SVG
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = svgDoc.documentElement as unknown as SVGElement

    // 设置尺寸
    svgElement.setAttribute('width', (options.width || 200).toString())
    svgElement.setAttribute('height', (options.height || options.width || 200).toString())

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
    options: QRCodeOptions
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
    const optionsStr = JSON.stringify(options, (key, value) => {
      // 排除函数和不可序列化的值
      if (typeof value === 'function') return undefined
      return value
    })
    
    return `${text}:${btoa(optionsStr)}`
  }

  /**
   * 添加到缓存
   */
  private addToCache(key: string, result: QRCodeResult): void {
    if (this.cache.size >= this.config.maxCacheSize!) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, result)
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
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize || 100
    }
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
    this.performanceMonitor.clearMetrics()
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

export { QRCodeGenerator }
export default QRCodeGenerator