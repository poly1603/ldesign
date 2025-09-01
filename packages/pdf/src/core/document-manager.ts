/**
 * PDF文档管理器
 * 负责PDF文档的加载、解析和管理
 */

import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { IPdfDocumentManager, PdfInput, PdfDocumentInfo } from './types'

/**
 * PDF文档管理器实现
 */
export class PdfDocumentManager implements IPdfDocumentManager {
  private document: PDFDocumentProxy | null = null
  private pageCache = new Map<number, PDFPageProxy>()

  constructor() {
    // 设置PDF.js worker路径
    this.setupWorker()
  }

  /**
   * 设置PDF.js worker
   */
  private setupWorker(): void {
    if (typeof window !== 'undefined') {
      try {
        // 1) 显式指定与依赖版本匹配的 worker 资源路径
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        // 2) 强制注入 Worker 实例，避免打包工具覆盖 workerSrc
        if (typeof Worker !== 'undefined') {
          try {
            // 优先使用 classic worker，确保与 pdfjs-dist@3 兼容
            const worker = new Worker('/pdf.worker.min.js')
            // @ts-expect-error: workerPort 在运行时可用
            pdfjsLib.GlobalWorkerOptions.workerPort = worker
          } catch (e) {
            // 兼容某些环境需要 type: 'module'
            try {
              const worker = new Worker('/pdf.worker.min.js', { type: 'module' as unknown as WorkerType })
              // @ts-expect-error: workerPort 在运行时可用
              pdfjsLib.GlobalWorkerOptions.workerPort = worker
            } catch (e2) {
              console.warn('使用内置Worker失败，降级为仅设置workerSrc。错误：', e2)
            }
          }
        }
        console.log('PDF.js worker 已设置:', {
          workerSrc: (pdfjsLib as any).GlobalWorkerOptions?.workerSrc,
          hasWorkerPort: Boolean((pdfjsLib as any).GlobalWorkerOptions?.workerPort),
        })
      } catch (error) {
        console.error('设置 PDF.js worker 失败:', error)
      }
    }
  }

  /**
   * 加载PDF文档
   */
  async loadDocument(input: PdfInput): Promise<PDFDocumentProxy> {
    try {
      console.log('开始加载PDF文档...')

      // 清理之前的文档
      await this.destroy()

      // 根据输入类型处理数据
      const data = await this.processInput(input)

      // 加载PDF文档
      console.log('创建PDF.js加载任务...')
      const loadingTask = pdfjsLib.getDocument(data)

      console.log('等待PDF文档加载完成...')
      this.document = await loadingTask.promise

      console.log('PDF文档加载成功:', {
        numPages: this.document.numPages,
        fingerprint: this.document.fingerprint
      })

      // 清空页面缓存
      this.pageCache.clear()

      return this.document
    }
    catch (error) {
      console.error('PDF文档加载失败:', error)
      throw new Error(`Failed to load PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 处理不同类型的输入
   */
  private async processInput(input: PdfInput): Promise<string | ArrayBuffer | Uint8Array> {
    console.log('处理PDF输入:', typeof input === 'string' ? input : `${typeof input} (${input instanceof File ? input.name : 'binary data'})`)

    if (typeof input === 'string') {
      // URL字符串
      console.log('使用URL加载PDF:', input)
      return input
    }
    else if (input instanceof File) {
      // File对象转换为ArrayBuffer
      console.log('将File对象转换为ArrayBuffer:', input.name, input.size, 'bytes')
      return await this.fileToArrayBuffer(input)
    }
    else if (input instanceof ArrayBuffer || input instanceof Uint8Array) {
      // 直接返回二进制数据
      console.log('使用二进制数据加载PDF:', input.byteLength || input.length, 'bytes')
      return input
    }
    else {
      throw new Error('Unsupported input type')
    }
  }

  /**
   * 将File对象转换为ArrayBuffer
   */
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        }
        else {
          reject(new Error('Failed to read file as ArrayBuffer'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 获取指定页面
   */
  async getPage(pageNumber: number): Promise<PDFPageProxy> {
    if (!this.document) {
      throw new Error('No document loaded')
    }

    if (pageNumber < 1 || pageNumber > this.document.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`)
    }

    // 检查缓存
    if (this.pageCache.has(pageNumber)) {
      return this.pageCache.get(pageNumber)!
    }

    try {
      // 获取页面并缓存
      const page = await this.document.getPage(pageNumber)
      this.pageCache.set(pageNumber, page)
      return page
    }
    catch (error) {
      throw new Error(`Failed to get page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取文档信息
   */
  async getDocumentInfo(): Promise<PdfDocumentInfo> {
    if (!this.document) {
      throw new Error('No document loaded')
    }

    try {
      const metadata = await this.document.getMetadata()
      const info = metadata.info

      return {
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        keywords: info.Keywords || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
        numPages: this.document.numPages,
        pdfVersion: info.PDFFormatVersion || undefined,
      }
    }
    catch (error) {
      // 如果获取元数据失败，返回基本信息
      return {
        numPages: this.document.numPages,
      }
    }
  }

  /**
   * 获取当前文档
   */
  getDocument(): PDFDocumentProxy | null {
    return this.document
  }

  /**
   * 检查是否已加载文档
   */
  hasDocument(): boolean {
    return this.document !== null
  }

  /**
   * 获取总页数
   */
  getPageCount(): number {
    return this.document?.numPages || 0
  }

  /**
   * 预加载页面（用于性能优化）
   */
  async preloadPages(startPage: number, endPage: number): Promise<void> {
    if (!this.document) {
      return
    }

    const promises: Promise<PDFPageProxy>[] = []
    for (let i = startPage; i <= Math.min(endPage, this.document.numPages); i++) {
      if (!this.pageCache.has(i)) {
        promises.push(this.getPage(i))
      }
    }

    await Promise.all(promises)
  }

  /**
   * 清理页面缓存
   */
  clearPageCache(): void {
    this.pageCache.clear()
  }

  /**
   * 销毁文档管理器
   */
  async destroy(): Promise<void> {
    // 清理页面缓存
    this.pageCache.clear()

    // 销毁文档
    if (this.document) {
      await this.document.destroy()
      this.document = null
    }
  }
}
