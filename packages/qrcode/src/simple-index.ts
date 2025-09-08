/**
 * LDesign QR Code Library - 简化入口
 * 只导出核心功能，避免复杂的跨框架依赖
 */

import * as QRCode from 'qrcode'

// 基础类型定义
export interface QRCodeOptions {
  size?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  format?: 'canvas' | 'svg' | 'image'
  foregroundColor?: string
  backgroundColor?: string
}

export interface QRCodeResult {
  data: string
  element?: HTMLElement | null
  format: string
  size: number
  timestamp: number
}

/**
 * 简化的二维码生成器类
 */
export class QRCodeGenerator {
  private options: QRCodeOptions

  constructor(options: QRCodeOptions = {}) {
    this.options = {
      size: 200,
      margin: 4,
      errorCorrectionLevel: 'M',
      format: 'canvas',
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      ...options
    }
  }

  /**
   * 生成二维码
   */
  async generate(text: string, options: QRCodeOptions = {}): Promise<QRCodeResult> {
    const finalOptions = { ...this.options, ...options }

    try {
      let data: string

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
      } else {
        // 默认生成 data URL
        data = await QRCode.toDataURL(text, {
          width: finalOptions.size,
          margin: finalOptions.margin,
          errorCorrectionLevel: finalOptions.errorCorrectionLevel,
          color: {
            dark: finalOptions.foregroundColor,
            light: finalOptions.backgroundColor
          }
        })
      }

      return {
        data,
        element: null,
        format: finalOptions.format || 'canvas',
        size: finalOptions.size || 200,
        timestamp: Date.now()
      }
    } catch (error) {
      throw new Error(`QR Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<QRCodeOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  getOptions(): QRCodeOptions {
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
export async function generateQRCode(text: string, options: QRCodeOptions = {}): Promise<QRCodeResult> {
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
export const version = '1.0.0'

// 默认导出
export default {
  QRCodeGenerator,
  generateQRCode,
  downloadQRCode,
  version
}
