/**
 * LDesign QRCode - 便捷函数
 * 提供简化的API接口
 */

import type { QRCodeOptions, QRCodeResult } from '../types'
import { defaultGenerator } from '../core/generator'
import { downloadFile } from '../utils'

/**
 * 生成二维码（通用）
 */
export async function generateQRCode(
  text: string,
  options?: QRCodeOptions,
): Promise<QRCodeResult> {
  return await defaultGenerator.generate(text, options || {})
}

/**
 * 生成Canvas格式二维码
 */
export async function generateQRCodeCanvas(
  text: string,
  options?: Omit<QRCodeOptions, 'format'>,
): Promise<QRCodeResult> {
  return await defaultGenerator.generate(text, {
    ...options,
    format: 'canvas',
  })
}

/**
 * 生成SVG格式二维码
 */
export async function generateQRCodeSVG(
  text: string,
  options?: Omit<QRCodeOptions, 'format'>,
): Promise<QRCodeResult> {
  return await defaultGenerator.generate(text, {
    ...options,
    format: 'svg',
  })
}

/**
 * 生成Image格式二维码
 */
export async function generateQRCodeImage(
  text: string,
  options?: Omit<QRCodeOptions, 'format'>,
): Promise<QRCodeResult> {
  return await defaultGenerator.generate(text, {
    ...options,
    format: 'image',
  })
}

/**
 * 下载二维码
 */
export async function downloadQRCode(
  text: string,
  filename?: string,
  options?: QRCodeOptions,
): Promise<void> {
  const result = await generateQRCode(text, options)
  const finalFilename = filename || 'qrcode'
  await downloadFile(result.dataURL || '', finalFilename, result.format)
}

/**
 * 快速生成并获取DataURL
 */
export async function getQRCodeDataURL(
  text: string,
  options?: QRCodeOptions,
): Promise<string> {
  const result = await generateQRCode(text, options)
  return result.dataURL || ''
}

/**
 * 快速生成并获取Canvas元素
 */
export async function getQRCodeCanvas(
  text: string,
  options?: Omit<QRCodeOptions, 'format'>,
): Promise<HTMLCanvasElement> {
  const result = await generateQRCodeCanvas(text, options)
  return result.element as HTMLCanvasElement
}

/**
 * 快速生成并获取SVG元素
 */
export async function getQRCodeSVG(
  text: string,
  options?: Omit<QRCodeOptions, 'format'>,
): Promise<SVGElement> {
  const result = await generateQRCodeSVG(text, options)
  return result.element as SVGElement
}

/**
 * 快速生成并获取Image元素
 */
export async function getQRCodeImage(
  text: string,
  options?: Omit<QRCodeOptions, 'format'>,
): Promise<HTMLImageElement> {
  const result = await generateQRCodeImage(text, options)
  return result.element as HTMLImageElement
}

/**
 * 批量生成二维码
 */
export async function generateQRCodeBatch(
  items: Array<{
    text: string
    options?: QRCodeOptions
    filename?: string
  }>,
): Promise<QRCodeResult[]> {
  const results = await Promise.allSettled(
    items.map(item => generateQRCode(item.text, item.options)),
  )

  return results
    .filter((result): result is PromiseFulfilledResult<QRCodeResult> =>
      result.status === 'fulfilled',
    )
    .map(result => result.value)
}

/**
 * 验证文本是否可以生成二维码
 */
export function validateQRCodeText(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  if (text.trim().length === 0) {
    return false
  }

  // 检查文本长度（二维码有最大容量限制）
  if (text.length > 4296) {
    return false
  }

  return true
}

/**
 * 估算二维码大小
 */
export function estimateQRCodeSize(
  text: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M',
): { version: number, modules: number, capacity: number } {
  const textLength = text.length

  // 简化的版本估算（实际情况更复杂）
  let version = 1
  let capacity = 25 // Version 1, Level M

  const capacities = {
    L: [25, 47, 77, 114, 154, 195, 224, 279, 335, 395],
    M: [20, 38, 61, 90, 122, 154, 178, 221, 262, 311],
    Q: [16, 29, 47, 67, 87, 108, 125, 157, 189, 221],
    H: [10, 20, 35, 50, 64, 84, 93, 122, 143, 174],
  }

  const levelCapacities = capacities[errorCorrectionLevel]

  for (let i = 0; i < levelCapacities.length; i++) {
    if (textLength <= levelCapacities[i]) {
      version = i + 1
      capacity = levelCapacities[i]
      break
    }
  }

  const modules = 21 + (version - 1) * 4

  return {
    version,
    modules,
    capacity,
  }
}

/**
 * 清除默认生成器缓存
 */
export function clearQRCodeCache(): void {
  defaultGenerator.clearCache()
}

/**
 * 获取默认生成器性能指标
 */
export function getQRCodeMetrics() {
  return defaultGenerator.getPerformanceMetrics()
}

/**
 * 获取默认生成器缓存统计
 */
export function getQRCodeCacheStats() {
  return defaultGenerator.getCacheStats()
}
