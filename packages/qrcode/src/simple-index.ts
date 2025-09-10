/**
 * LDesign QR Code Library - 简化入口
 * 只导出核心功能，避免复杂的跨框架依赖
 */

import * as QRCode from 'qrcode'

// 导出的结果类型（与示例项目对齐，包含常用兼容字段）
export type QRCodeFormat = 'canvas' | 'svg' | 'image'
export type QRCodeError = Error
export interface QRCodeResult {
  // 兼容字段
  canvas?: HTMLCanvasElement
  svg?: string
  dataURL?: string
  blob?: Blob
  size: number
  format: QRCodeFormat
  timestamp: number
  element?: HTMLCanvasElement | SVGElement | HTMLImageElement | null
  width?: number
  height?: number
  text?: string
  options?: any
  fromCache?: boolean
  generatedAt?: number
}

// 简化的QR码生成选项（包含logo支持）
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
    shape?: 'square' | 'circle'
  }

  // 容器选项
  container?: string | HTMLElement
  className?: string
}


/**
 * Logo处理工具类
 */
class LogoProcessor {
  /**
   * 在Canvas上添加Logo
   */
  static async addLogoToCanvas(canvas: HTMLCanvasElement, logoOptions: any): Promise<void> {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const logoSrc = typeof logoOptions === 'string' ? logoOptions : logoOptions.src
    if (!logoSrc) return

    try {
      const logoImg = await this.loadImage(logoSrc)
      const logoSize = (typeof logoOptions === 'object' ? logoOptions.size : 50) || 50
      const logoMargin = (typeof logoOptions === 'object' ? logoOptions.margin : 5) || 5
      const shape = (typeof logoOptions === 'object' ? logoOptions.shape : 'circle') || 'circle'

      const canvasSize = canvas.width
      const actualLogoSize = Math.min(logoSize, canvasSize * 0.3)
      const x = (canvasSize - actualLogoSize) / 2
      const y = (canvasSize - actualLogoSize) / 2

      // 保存当前状态
      ctx.save()

      if (shape === 'circle') {
        // 创建圆形裁剪路径
        ctx.beginPath()
        ctx.arc(x + actualLogoSize / 2, y + actualLogoSize / 2, actualLogoSize / 2, 0, 2 * Math.PI)
        ctx.clip()
      }

      // 绘制白色背景
      ctx.fillStyle = 'white'
      if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(x + actualLogoSize / 2, y + actualLogoSize / 2, actualLogoSize / 2 + logoMargin, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.fillRect(x - logoMargin, y - logoMargin, actualLogoSize + 2 * logoMargin, actualLogoSize + 2 * logoMargin)
      }

      // 绘制Logo
      ctx.drawImage(logoImg, x, y, actualLogoSize, actualLogoSize)

      // 恢复状态
      ctx.restore()
    } catch (error) {
      console.warn('Failed to add logo to canvas:', error)
    }
  }

  /**
   * 加载图片
   */
  static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }
}

/**
 * 简化的二维码生成器类
 */
export class QRCodeGenerator {
  private options: SimpleQRCodeOptions

  constructor(options: SimpleQRCodeOptions = {}) {
    const hasDOM = typeof document !== 'undefined' && typeof window !== 'undefined'
    const defaultFormat: 'canvas' | 'svg' | 'image' = hasDOM ? 'canvas' : 'svg'
    this.options = {
      size: 200,
      margin: 4,
      errorCorrectionLevel: 'M',
      format: defaultFormat,
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      ...options
    }
  }

  /**
   * 生成二维码
   */
  async generate(text: string, options: SimpleQRCodeOptions = {}): Promise<QRCodeResult> {
    const finalOptions = { ...this.options, ...options }
    const hasDOM = typeof document !== 'undefined' && typeof window !== 'undefined'

    try {
      let data: string
      let element: HTMLElement | SVGElement | null = null

      if (finalOptions.format === 'svg') {
        data = await QRCode.toString(text, {
          type: 'svg',
          width: finalOptions.size,
          margin: finalOptions.margin,
          errorCorrectionLevel: finalOptions.errorCorrectionLevel,
          color: {
            dark: finalOptions.foregroundColor,
            light: finalOptions.backgroundColor
          }
        })

        // 创建SVG元素（仅在浏览器环境）
        if (hasDOM && typeof DOMParser !== 'undefined') {
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(data, 'image/svg+xml')
          element = svgDoc.documentElement as unknown as SVGElement
        }
      } else if (finalOptions.format === 'canvas') {
        if (!hasDOM) {
          // 非浏览器环境下，回退到 SVG 数据
          data = await QRCode.toString(text, {
            type: 'svg',
            width: finalOptions.size,
            margin: finalOptions.margin,
            errorCorrectionLevel: finalOptions.errorCorrectionLevel,
            color: {
              dark: finalOptions.foregroundColor,
              light: finalOptions.backgroundColor
            }
          })
        } else {
          // 创建Canvas元素
          const canvas = document.createElement('canvas')
          canvas.width = finalOptions.size || 200
          canvas.height = finalOptions.size || 200

          await QRCode.toCanvas(canvas, text, {
            width: finalOptions.size,
            margin: finalOptions.margin,
            errorCorrectionLevel: finalOptions.errorCorrectionLevel,
            color: {
              dark: finalOptions.foregroundColor,
              light: finalOptions.backgroundColor
            }
          })

          // 添加Logo（如果有）
          if (finalOptions.logo) {
            await LogoProcessor.addLogoToCanvas(canvas, finalOptions.logo)
          }

          data = canvas.toDataURL('image/png')
          element = canvas
        }
      } else {
        if (!hasDOM) {
          // 非浏览器环境下，直接输出SVG字符串
          data = await QRCode.toString(text, {
            type: 'svg',
            width: finalOptions.size,
            margin: finalOptions.margin,
            errorCorrectionLevel: finalOptions.errorCorrectionLevel,
            color: {
              dark: finalOptions.foregroundColor,
              light: finalOptions.backgroundColor
            }
          })
        } else {
          // 生成 data URL 并创建 Image 元素
          data = await QRCode.toDataURL(text, {
            width: finalOptions.size,
            margin: finalOptions.margin,
            errorCorrectionLevel: finalOptions.errorCorrectionLevel,
            color: {
              dark: finalOptions.foregroundColor,
              light: finalOptions.backgroundColor
            }
          })

          const img = new Image()
          img.src = data
          img.width = finalOptions.size || 200
          img.height = finalOptions.size || 200
          element = img
        }
      }

      // 组装配置（仅用于回显，不强约束具体类型）
      const qrOptions: any = {
        data: text,
        size: finalOptions.size || 200,
        format: finalOptions.format || (hasDOM ? 'canvas' : 'svg'),
        errorCorrectionLevel: finalOptions.errorCorrectionLevel,
        margin: finalOptions.margin,
        color: {
          foreground: finalOptions.foregroundColor || '#000000',
          background: finalOptions.backgroundColor || '#FFFFFF',
        },
      }

      const result: QRCodeResult = {
        size: qrOptions.size!,
        format: qrOptions.format!,
        timestamp: Date.now(),
        element: element as any,
        // 兼容属性
        svg: qrOptions.format === 'svg' ? (typeof data === 'string' ? data : undefined) : undefined,
        dataURL: qrOptions.format !== 'svg' ? (typeof data === 'string' ? data : undefined) : undefined,
        text,
        options: qrOptions,
        fromCache: false,
      }

      return result
    } catch (error) {
      throw new Error(`QR Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<SimpleQRCodeOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  getOptions(): SimpleQRCodeOptions {
    return { ...this.options }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    // 清理资源
  }
}

/**
 * 简化的生成函数
 */
export async function generateQRCode(text: string, options: SimpleQRCodeOptions = {}): Promise<QRCodeResult> {
  const generator = new QRCodeGenerator(options)
  return generator.generate(text)
}


/**
 * 下载二维码
 */
export function downloadQRCode(data: string, filename: string = 'qrcode'): void {
  if (typeof window === 'undefined') {
    throw new Error('Download is only available in browser environment')
  }

  const link = document.createElement('a')
  link.download = filename.includes('.') ? filename : `${filename}.png`
  link.href = data
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 版本信息
export const version = '1.0.1'

// 默认导出
export default {
  QRCodeGenerator,
  generateQRCode,
  downloadQRCode,
  version
}
