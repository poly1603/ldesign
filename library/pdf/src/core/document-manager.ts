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
  private originalData: string | ArrayBuffer | Uint8Array | null = null
  private documentId: string | null = null
  private options: { workerSrc?: string | URL; workerPort?: Worker; workerModule?: string | URL } | undefined
  private ownedWorker: Worker | null = null

  constructor(options?: { workerSrc?: string | URL; workerPort?: Worker; workerModule?: string | URL }) {
    this.options = options
    // 设置PDF.js worker路径
    this.setupWorker()
  }

  /**
   * 设置PDF.js worker
   */
  private setupWorker(): void {
    if (typeof window !== 'undefined') {
      try {
        const gwo = (pdfjsLib as any).GlobalWorkerOptions
        const workerSrc = this.options?.workerSrc ?? '/pdf.worker.min.js'

        // 情况1：直接使用传入的 Worker 实例（最高优先级）
        if (this.options?.workerPort) {
          if (gwo) {
            gwo.workerPort = this.options.workerPort
            gwo.workerSrc = workerSrc as any
          }
          console.log('PDF.js worker: 使用外部传入的 workerPort')
          return
        }

        // 情况2：使用 module worker URL 创建 Worker
        if (this.options?.workerModule && typeof Worker !== 'undefined') {
          try {
            const worker = new Worker(this.options.workerModule as any, { type: 'module' as any })
            this.ownedWorker = worker
            if (gwo) {
              gwo.workerPort = worker
              gwo.workerSrc = workerSrc as any
            }
            console.log('PDF.js worker: 使用 module worker 创建成功')
            return
          } catch (e) {
            console.warn('module worker 创建失败，回退到 workerSrc', e)
          }
        }

        // 情况3：回退到 workerSrc，仅设置路径，不强行创建 Worker（由 pdf.js 自行加载）
        if (gwo) gwo.workerSrc = workerSrc as any
        // 不再强制 new Worker，以避免某些开发环境（Vite/路径基准/CORS）下创建失败导致加载卡住

        console.log('PDF.js worker 已设置:', {
          workerSrc: (pdfjsLib as any).GlobalWorkerOptions?.workerSrc || workerSrc,
          hasWorkerPort: Boolean((pdfjsLib as any).GlobalWorkerOptions?.workerPort),
          by: this.options?.workerPort ? 'port' : (this.options?.workerModule ? 'module' : 'src'),
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
      this.originalData = data

      // 加载PDF文档
      console.log('创建PDF.js加载任务...')
      const loadingTask = pdfjsLib.getDocument(data)

      console.log('等待PDF文档加载完成...')
      this.document = await loadingTask.promise

      // 记录文档ID（指纹）
      const fp = (this.document as any).fingerprint ?? ((this.document as any).fingerprints?.[0])
      this.documentId = fp ? String(fp) : null

      console.log('PDF文档加载成功:', {
        numPages: this.document.numPages,
        fingerprint: this.documentId,
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
      const size = input instanceof Uint8Array
        ? input.byteLength
        : (input as ArrayBuffer).byteLength
      console.log('使用二进制数据加载PDF:', size, 'bytes')
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
      const info: any = metadata.info as any

      return {
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
        keywords: info?.Keywords || undefined,
        creator: info?.Creator || undefined,
        producer: info?.Producer || undefined,
        creationDate: info?.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info?.ModDate ? new Date(info.ModDate) : undefined,
        numPages: this.document.numPages,
        pdfVersion: info?.PDFFormatVersion || undefined,
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

    // 终止内部持有的 worker（如有）
    if (this.ownedWorker && typeof this.ownedWorker.terminate === 'function') {
      try { this.ownedWorker.terminate() } catch {}
      this.ownedWorker = null
    }

    this.documentId = null

    // 清理原始数据引用（保留URL字符串，便于下载/打印；二进制无引用问题）
    // 如需彻底清理，可置空：
    // this.originalData = null
  }

  /**
   * 获取原始输入数据（URL 或二进制）
   */
  getOriginalData(): string | ArrayBuffer | Uint8Array | null {
    return this.originalData
  }

  /** 获取文档ID（指纹） */
  getDocumentId(): string | null {
    return this.documentId
  }
}
