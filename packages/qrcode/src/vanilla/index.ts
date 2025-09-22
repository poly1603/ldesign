/**
 * Vanilla JavaScript QR Code Library
 * 提供简洁易用的原生JavaScript API
 */

import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
} from '../types'
import { QRCodeGenerator } from '../core/generator'
// import { createQRCodeInstance } from '../core/instance'
import { getDefaultOptions, createError } from '../utils'
import { download } from '../helpers'

/**
 * 简化的QR码生成选项
 */
export interface SimpleQRCodeOptions {
  // 基础选项
  size?: number
  format?: 'canvas' | 'svg' | 'image'
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  
  // 颜色选项
  foregroundColor?: string
  backgroundColor?: string
  
  // Logo选项
  logo?: string | {
    src: string
    size?: number
    margin?: number
  }
  
  // 容器选项
  container?: string | HTMLElement
  className?: string
  
  // 回调函数
  onGenerated?: (result: QRCodeResult) => void
  onError?: (error: QRCodeError) => void
}

/**
 * 快速生成二维码的函数
 * 
 * @param text - 要编码的文本
 * @param options - 配置选项
 * @returns Promise<QRCodeResult>
 * 
 * @example
 * ```javascript
 * // 最简单的使用
 * const result = await generateQRCode('Hello World')
 * document.body.appendChild(result.element)
 * 
 * // 带选项的使用
 * const result = await generateQRCode('https://example.com', {
 *   size: 300,
 *   format: 'svg',
 *   foregroundColor: '#000',
 *   backgroundColor: '#fff',
 *   logo: 'logo.png'
 * })
 * 
 * // 直接渲染到容器
 * await generateQRCode('Hello World', {
 *   container: '#qrcode-container',
 *   size: 200,
 *   onGenerated: (result) => console.log('Generated!', result)
 * })
 * ```
 */
export async function generateQRCode(
  text: string,
  options: SimpleQRCodeOptions = {}
): Promise<QRCodeResult> {
  if (!text || !text.trim()) {
    throw createError('Text cannot be empty', 'INVALID_TEXT')
  }

  // 转换选项格式
  const qrOptions: QRCodeOptions = {
    ...getDefaultOptions(),
    data: text,
    size: options.size || 200,
    format: options.format || 'canvas',
    margin: options.margin,
    errorCorrectionLevel: options.errorCorrectionLevel,
    color: {
      foreground: options.foregroundColor || '#000000',
      background: options.backgroundColor || '#FFFFFF',
    },
  }

  // 处理Logo选项
  if (options.logo) {
    if (typeof options.logo === 'string') {
      qrOptions.logo = { src: options.logo }
    } else {
      qrOptions.logo = options.logo
    }
  }

  try {
    // 创建生成器并生成
    const generator = new QRCodeGenerator(qrOptions)
    const result = await generator.generate(text)

    // 处理容器渲染
    if (options.container) {
      const container = typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container

      if (container && result.element) {
        // 清空容器
        container.innerHTML = ''
        
        // 添加类名
        if (options.className && result.element) {
          result.element.setAttribute('class', options.className)
        }
        
        // 添加到容器
        container.appendChild(result.element)
      }
    }

    // 触发成功回调
    if (options.onGenerated) {
      options.onGenerated(result)
    }

    return result
  } catch (error) {
    const qrError = error as QRCodeError
    
    // 触发错误回调
    if (options.onError) {
      options.onError(qrError)
    }
    
    throw qrError
  }
}

/**
 * 创建QR码生成器类的简化包装
 */
export class SimpleQRCodeGenerator {
  private generator: QRCodeGenerator
  private options: QRCodeOptions

  constructor(options: SimpleQRCodeOptions = {}) {
    this.options = {
      ...getDefaultOptions(),
      size: options.size || 200,
      format: options.format || 'canvas',
      margin: options.margin,
      errorCorrectionLevel: options.errorCorrectionLevel,
      color: {
        foreground: options.foregroundColor || '#000000',
        background: options.backgroundColor || '#FFFFFF',
      },
    }

    // 处理Logo选项
    if (options.logo) {
      if (typeof options.logo === 'string') {
        this.options.logo = { src: options.logo }
      } else {
        this.options.logo = options.logo
      }
    }

    this.generator = new QRCodeGenerator(this.options)
  }

  /**
   * 生成二维码
   */
  async generate(text: string): Promise<QRCodeResult> {
    return await this.generator.generate(text)
  }

  /**
   * 更新选项
   */
  updateOptions(options: SimpleQRCodeOptions): void {
    const newOptions: Partial<QRCodeOptions> = {
      size: options.size,
      format: options.format,
      margin: options.margin,
      errorCorrectionLevel: options.errorCorrectionLevel,
    }

    if (options.foregroundColor || options.backgroundColor) {
      newOptions.color = {
        foreground: options.foregroundColor || this.options.color?.foreground || '#000000',
        background: options.backgroundColor || this.options.color?.background || '#FFFFFF',
      }
    }

    if (options.logo) {
      if (typeof options.logo === 'string') {
        newOptions.logo = { src: options.logo }
      } else {
        newOptions.logo = options.logo
      }
    }

    this.generator.updateOptions(newOptions)
    Object.assign(this.options, newOptions)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.generator.clearCache()
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return this.generator.getPerformanceMetrics()
  }

  /**
   * 销毁生成器
   */
  destroy(): void {
    this.generator.destroy()
  }
}

/**
 * 下载二维码
 * 
 * @param result - 二维码结果
 * @param filename - 文件名
 * 
 * @example
 * ```javascript
 * const result = await generateQRCode('Hello World')
 * await downloadQRCode(result, 'my-qrcode')
 * ```
 */
export async function downloadQRCode(
  result: QRCodeResult,
  filename: string = 'qrcode'
): Promise<void> {
  return await download(result, filename)
}

/**
 * 批量生成二维码
 * 
 * @param texts - 文本数组
 * @param options - 配置选项
 * @returns Promise<QRCodeResult[]>
 * 
 * @example
 * ```javascript
 * const results = await generateQRCodeBatch([
 *   'Text 1',
 *   'Text 2',
 *   'Text 3'
 * ], {
 *   size: 150,
 *   format: 'svg'
 * })
 * 
 * results.forEach((result, index) => {
 *   document.body.appendChild(result.element)
 * })
 * ```
 */
export async function generateQRCodeBatch(
  texts: string[],
  options: SimpleQRCodeOptions = {}
): Promise<QRCodeResult[]> {
  const generator = new SimpleQRCodeGenerator(options)
  const results: QRCodeResult[] = []

  try {
    for (const text of texts) {
      const result = await generator.generate(text)
      results.push(result)
    }
    return results
  } finally {
    generator.destroy()
  }
}

// 重新导出核心类型和工具
export type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
  LogoOptions,
  StyleOptions,
  ColorOptions,
  GradientColor,
  ColorStop,
} from '../types'

export {
  QRCodeGenerator,
  createQRCodeInstance,
} from '../core'

export {
  isValidColor,
  validateOptions,
  getDefaultOptions,
  generateCacheKey,
  createError,
  PerformanceMonitor,
} from '../utils'
