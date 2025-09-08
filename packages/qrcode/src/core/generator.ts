/**
 * LDesign QRCode - 核心二维码生成器
 * 实现Canvas/SVG/Image三种输出格式
 */

import type {
  GeneratorConfig,
  PerformanceMetric,
  QRCodeOptions,
  QRCodeResult,
} from '../types'
import QRCode from 'qrcode'
import { createError, PerformanceMonitor } from '../utils'
import { LogoProcessor } from './logo'
import { StyleProcessor } from './styles'

export class QRCodeGenerator {
  private logoProcessor: LogoProcessor
  private styleProcessor: StyleProcessor
  private performanceMonitor: PerformanceMonitor
  private cache: Map<string, QRCodeResult> = new Map()
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
  }

  /**
   * 生成二维码
   */
  async generate(
    text?: string,
    overrideOptions?: Partial<QRCodeOptions>,
  ): Promise<QRCodeResult> {
    const endTimer = this.performanceMonitor.startOperation('generate')

    try {
      const targetText = (text ?? this.options.data) || ''
      if (!targetText) {
        throw createError('No data provided for QR code generation', 'INVALID_DATA')
      }

      // 合并选项
      const mergedOptions: QRCodeOptions = {
        ...this.options,
        ...(overrideOptions || {}),
        format: overrideOptions?.format || this.options.format || 'canvas',
        errorCorrectionLevel: overrideOptions?.errorCorrectionLevel || this.options.errorCorrectionLevel || 'M',
        margin: overrideOptions?.margin ?? this.options.margin ?? 4,
      }

      // 检查缓存
      const cacheKey = this.generateCacheKey(targetText, mergedOptions)
      if ((mergedOptions.enableCache ?? true) && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!
        endTimer(true, cached.dataURL ? cached.dataURL.length : undefined)
        return { ...cached, fromCache: true }
      }

      const result = await this.generateQRCode(targetText, mergedOptions)

      // 添加到缓存
      if (mergedOptions.enableCache ?? true) {
        this.addToCache(cacheKey, result)
      }

      endTimer(false, result.dataURL ? result.dataURL.length : undefined)

      return result
    }
    catch (error) {
      endTimer(false)
      console.error('QRCode generation failed:', error)
      throw createError(
        `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'GENERATION_ERROR',
      )
    }
  }

  /**
   * 生成二维码核心逻辑
   */
  private async generateQRCode(
    text: string,
    options: QRCodeOptions,
  ): Promise<QRCodeResult> {
    const format = options.format || 'canvas'
    const width = options.size || 200
    const height = options.size || width

    // 准备QRCode库的选项
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      type: format === 'svg' ? 'svg' : 'image/png',
      quality: 0.92,
      margin: options.margin || 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width,
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
      generatedAt: Date.now(),
      size: Math.max(width, height),
      timestamp: Date.now(),
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

    return `${text}:${btoa(optionsStr)}`
  }

  /**
   * 添加到缓存
   */
  private addToCache(key: string, result: QRCodeResult): void {
    if (this.cache.size >= (this.config.maxCacheSize || 100)) {
      // 删除最旧的条目
      const it = this.cache.keys().next()
      if (!it.done) {
        this.cache.delete(it.value as string)
      }
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
  getCacheStats(): { size: number, maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize || 100,
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
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return this.performanceMonitor.getMetrics()
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
