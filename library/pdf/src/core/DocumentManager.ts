import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist'
import { EventEmitter } from '../utils/EventEmitter'
import type { LoadProgress, PDFViewerEvents } from '../types'

/**
 * 文档管理器
 * 负责PDF文档的加载和管理
 */
export class DocumentManager extends EventEmitter<PDFViewerEvents> {
  private loadingTask: PDFDocumentLoadingTask | null = null
  private document: PDFDocumentProxy | null = null
  private workerSrc: string

  constructor(workerSrc?: string) {
    super()
    this.workerSrc = workerSrc || this.getDefaultWorkerSrc()
    this.initWorker()
  }

  /**
   * 初始化PDF.js Worker
   */
  private initWorker(): void {
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc
    }
  }

  /**
   * 获取默认的Worker路径
   */
  private getDefaultWorkerSrc(): string {
    // 尝试从CDN加载
    const version = pdfjsLib.version || '4.0.379'
    return `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`
  }

  /**
   * 加���PDF文档
   * @param source PDF文件URL或Uint8Array
   * @param options 加载选项
   */
  async loadDocument(
    source: string | Uint8Array,
    options?: {
      cMapUrl?: string
      cMapPacked?: boolean
      password?: string
    }
  ): Promise<PDFDocumentProxy> {
    try {
      // 取消之前的加载任务
      if (this.loadingTask) {
        await this.loadingTask.destroy()
      }

      // 创建加载任务
      this.loadingTask = pdfjsLib.getDocument({
        url: typeof source === 'string' ? source : undefined,
        data: source instanceof Uint8Array ? source : undefined,
        cMapUrl: options?.cMapUrl || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
        cMapPacked: options?.cMapPacked ?? true,
        password: options?.password
      })

      // 监听加载进度
      this.loadingTask.onProgress = (progress: LoadProgress) => {
        this.emit('loading-progress', progress)
      }

      // 等待文档加载完成
      this.document = await this.loadingTask.promise

      // 触发加载完成事件
      this.emit('document-loaded', this.document)

      return this.document
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.emit('document-error', err)
      throw err
    }
  }

  /**
   * 获取当前文档
   */
  getDocument(): PDFDocumentProxy | null {
    return this.document
  }

  /**
   * 获取文档页数
   */
  getPageCount(): number {
    return this.document?.numPages || 0
  }

  /**
   * 获取指定页
   * @param pageNumber 页码（1-based）
   */
  async getPage(pageNumber: number) {
    if (!this.document) {
      throw new Error('No document loaded')
    }

    if (pageNumber < 1 || pageNumber > this.document.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`)
    }

    return await this.document.getPage(pageNumber)
  }

  /**
   * 获取��档元数据
   */
  async getMetadata() {
    if (!this.document) {
      throw new Error('No document loaded')
    }

    return await this.document.getMetadata()
  }

  /**
   * 搜索文本
   * @param text 搜索文本
   */
  async searchText(text: string) {
    if (!this.document) {
      throw new Error('No document loaded')
    }

    const results = []
    const searchText = text.toLowerCase()

    for (let pageNum = 1; pageNum <= this.document.numPages; pageNum++) {
      const page = await this.document.getPage(pageNum)
      const textContent = await page.getTextContent()

      let pageText = ''
      textContent.items.forEach((item: any) => {
        if ('str' in item) {
          pageText += item.str + ' '
        }
      })

      const lowerPageText = pageText.toLowerCase()
      let index = 0

      while ((index = lowerPageText.indexOf(searchText, index)) !== -1) {
        results.push({
          pageNumber: pageNum,
          text: pageText.substring(index, index + text.length),
          index
        })
        index += searchText.length
      }
    }

    this.emit('search-results', results)
    return results
  }

  /**
   * 销毁文档管理器
   */
  async destroy(): Promise<void> {
    if (this.loadingTask) {
      await this.loadingTask.destroy()
      this.loadingTask = null
    }

    if (this.document) {
      await this.document.destroy()
      this.document = null
    }

    this.removeAllListeners()
  }
}
