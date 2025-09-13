/**
 * LDesign QRCode - 批量下载功能
 * 支持多种格式的批量导出和打包下载
 */

import type { QRCodeResult } from '../types'
import type { DownloadOptions } from '../types/advanced'
import { downloadFile } from '../utils'

export interface BatchDownloadOptions extends DownloadOptions {
  zipFilename?: string
  includeIndex?: boolean
  nameTemplate?: string // 支持模板: {index}, {timestamp}, {hash}
  onProgress?: (completed: number, total: number) => void
  onItemComplete?: (filename: string, index: number) => void
  onError?: (error: Error, index: number) => void
}

export interface BatchItem {
  result: QRCodeResult
  filename?: string
  customOptions?: Partial<DownloadOptions>
}

export class BatchDownloader {
  private isSupported = typeof window !== 'undefined' && 'URL' in window

  constructor() {
    if (!this.isSupported) {
      console.warn('BatchDownloader: Some features may not be available in this environment')
    }
  }

  /**
   * 批量下载单个文件（逐个下载）
   */
  async downloadSeparately(
    items: BatchItem[],
    options: BatchDownloadOptions = {}
  ): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Batch download is not supported in this environment')
    }

    const total = items.length
    let completed = 0

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i]
        const filename = this.generateFilename(item, i, options)
        
        await this.downloadSingleItem(item, filename, options)
        
        completed++
        options.onProgress?.(completed, total)
        options.onItemComplete?.(filename, i)
        
        // 添加小延迟防止浏览器阻止多个下载
        if (i < items.length - 1) {
          await this.delay(100)
        }
      } catch (error) {
        options.onError?.(error as Error, i)
      }
    }
  }

  /**
   * 打包下载（需要JSZip）
   */
  async downloadAsZip(
    items: BatchItem[],
    options: BatchDownloadOptions = {}
  ): Promise<void> {
    try {
      // 动态导入JSZip（如果可用）
      const JSZip = await this.loadJSZip()
      const zip = new JSZip()

      // 添加索引文件（如果需要）
      if (options.includeIndex) {
        const indexContent = this.generateIndexContent(items, options)
        zip.file('index.json', indexContent)
      }

      let completed = 0
      const total = items.length

      // 处理每个项目
      for (let i = 0; i < items.length; i++) {
        try {
          const item = items[i]
          const filename = this.generateFilename(item, i, options)
          const content = await this.getFileContent(item, options)
          
          zip.file(filename, content)
          
          completed++
          options.onProgress?.(completed, total)
          options.onItemComplete?.(filename, i)
        } catch (error) {
          options.onError?.(error as Error, i)
        }
      }

      // 生成并下载zip文件
      const zipContent = await zip.generateAsync({ type: 'blob' })
      const zipFilename = options.zipFilename || `qrcodes-batch-${Date.now()}.zip`
      
      this.downloadBlob(zipContent, zipFilename)
    } catch (error) {
      throw new Error(`Failed to create zip file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 生成文件名
   */
  private generateFilename(item: BatchItem, index: number, options: BatchDownloadOptions): string {
    if (item.filename) {
      return this.addExtension(item.filename, item.result.format, options)
    }

    const template = options.nameTemplate || 'qrcode-{index}'
    const timestamp = new Date().getTime()
    const hash = this.generateHash(item.result.text || `item-${index}`)

    let filename = template
      .replace('{index}', (index + 1).toString().padStart(3, '0'))
      .replace('{timestamp}', timestamp.toString())
      .replace('{hash}', hash)

    return this.addExtension(filename, item.result.format, options)
  }

  /**
   * 添加文件扩展名
   */
  private addExtension(filename: string, format: string, options: BatchDownloadOptions): string {
    const hasExtension = /\.[a-z0-9]+$/i.test(filename)
    if (hasExtension) return filename

    const targetFormat = options.format || format
    const extensions: Record<string, string> = {
      'canvas': 'png',
      'svg': 'svg',
      'image': 'png',
      'png': 'png',
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'webp': 'webp'
    }

    const ext = extensions[targetFormat] || 'png'
    return `${filename}.${ext}`
  }

  /**
   * 下载单个项目
   */
  private async downloadSingleItem(
    item: BatchItem,
    filename: string,
    options: BatchDownloadOptions
  ): Promise<void> {
    const content = await this.getFileContent(item, options)
    
    if (typeof content === 'string') {
      // Data URL or SVG content
      downloadFile(content, filename, item.result.format)
    } else {
      // Blob content
      this.downloadBlob(content, filename)
    }
  }

  /**
   * 获取文件内容
   */
  private async getFileContent(
    item: BatchItem,
    options: BatchDownloadOptions
  ): Promise<string | Blob> {
    const result = item.result
    const targetFormat = options.format || result.format

    switch (targetFormat) {
      case 'svg':
        if (typeof result.svg === 'string') {
          return result.svg
        }
        if (result.element && result.element instanceof SVGElement) {
          return new XMLSerializer().serializeToString(result.element)
        }
        break

      case 'png':
      case 'jpg':
      case 'webp':
        return this.convertToBlob(result, targetFormat, options.quality)

      default:
        if (result.dataURL) {
          return result.dataURL
        }
    }

    throw new Error(`Cannot get content for format: ${targetFormat}`)
  }

  /**
   * 转换为Blob
   */
  private async convertToBlob(
    result: QRCodeResult,
    format: string,
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (result.canvas) {
        result.canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        }, `image/${format}`, quality || 0.92)
      } else if (result.dataURL) {
        // Convert data URL to blob
        fetch(result.dataURL)
          .then(res => res.blob())
          .then(resolve)
          .catch(reject)
      } else {
        reject(new Error('No canvas or dataURL available'))
      }
    })
  }

  /**
   * 生成索引文件内容
   */
  private generateIndexContent(items: BatchItem[], options: BatchDownloadOptions): string {
    const index = {
      generated: new Date().toISOString(),
      totalItems: items.length,
      options: {
        format: options.format,
        quality: options.quality
      },
      items: items.map((item, index) => ({
        filename: this.generateFilename(item, index, options),
        text: item.result.text,
        size: item.result.size,
        format: item.result.format,
        generatedAt: item.result.generatedAt,
        metadata: item.result.options
      }))
    }

    return JSON.stringify(index, null, 2)
  }

  /**
   * 下载Blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 生成简单哈希
   */
  private generateHash(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36).substr(0, 8)
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 动态加载JSZip
   */
  private async loadJSZip(): Promise<any> {
    try {
      // 尝试从全局对象获取
      if (typeof window !== 'undefined' && (window as any).JSZip) {
        return (window as any).JSZip
      }

      // 尝试动态导入
      const JSZip = await import('jszip')
      return JSZip.default || JSZip
    } catch (error) {
      throw new Error('JSZip is required for zip download. Please install it: npm install jszip')
    }
  }

  /**
   * 检查JSZip是否可用
   */
  isZipSupported(): boolean {
    return this.isSupported && (
      (typeof window !== 'undefined' && (window as any).JSZip) ||
      this.canImportJSZip()
    )
  }

  /**
   * 检查是否可以导入JSZip
   */
  private canImportJSZip(): boolean {
    try {
      // 这只是一个检查，实际导入在使用时进行
      return typeof import !== 'undefined'
    } catch {
      return false
    }
  }
}

/**
 * 便利函数：批量下载
 */
export async function batchDownload(
  results: QRCodeResult[],
  options: BatchDownloadOptions = {}
): Promise<void> {
  const downloader = new BatchDownloader()
  const items: BatchItem[] = results.map(result => ({ result }))
  
  if (options.zipFilename || downloader.isZipSupported()) {
    await downloader.downloadAsZip(items, options)
  } else {
    await downloader.downloadSeparately(items, options)
  }
}
