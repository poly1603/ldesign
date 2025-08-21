/**
 * PDF引擎 - 核心PDF处理功能
 * 负责PDF文档的加载、解析和页面管理
 */

import type {
  DocumentMetadata,
  EventEmitter,
  EventListener,
  EventType,
  LoadOptions,
  OutlineNode,
  PdfDocument,
  PdfError,
  PdfPage,
  PdfSource,
} from '../types'
import {
  ErrorCode,
} from '../types'

/**
 * PDF引擎类
 * 提供PDF文档的核心处理功能
 */
export class PdfEngine implements EventEmitter {
  private documents = new Map<string, PdfDocument>()
  private listeners = new Map<EventType, Set<EventListener>>()
  private pdfjsLib: any = null
  private initialized = false

  /**
   * 初始化PDF引擎
   */
  async initialize(pdfjsLib?: any): Promise<void> {
    try {
      if (this.initialized) {
        return
      }

      // 如果没有传入pdfjs-dist，尝试动态导入
      if (!pdfjsLib) {
        try {
          // TODO: 配置PDF.js库
        // pdfjsLib = await import('pdfjs-dist') as any
          throw new Error('PDF.js library not configured')
        }
        catch (error) {
          throw this.createError(
            ErrorCode.LOAD_FAILED,
            'Failed to load pdfjs-dist library',
            { originalError: error },
          )
        }
      }

      this.pdfjsLib = pdfjsLib
      this.initialized = true

      // 配置PDF.js worker
      if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = this.getWorkerSrc()
      }

      this.emit('engineInitialized')
    }
    catch (error) {
      const pdfError = error instanceof Error
        ? this.createError(ErrorCode.LOAD_FAILED, error.message, { originalError: error })
        : this.createError(ErrorCode.UNKNOWN_ERROR, 'Unknown initialization error')

      this.emit('error', pdfError)
      throw pdfError
    }
  }

  /**
   * 加载PDF文档
   */
  async loadDocument(
    source: PdfSource,
    options: LoadOptions = {},
  ): Promise<PdfDocument> {
    try {
      this.ensureInitialized()

      const loadingTask = this.pdfjsLib.getDocument({
        ...this.prepareSource(source),
        ...options,
        onProgress: (progress: { loaded: number, total: number }) => {
          this.emit('loadProgress', progress)
          options.onProgress?.(progress)
        },
      })

      const pdfDoc = await loadingTask.promise
      const documentId = this.generateDocumentId(source)

      const document: PdfDocument = {
        numPages: pdfDoc.numPages,
        fingerprint: pdfDoc.fingerprint,
        loadingTask,
        getPage: async (pageNumber: number) => this.getPage(pdfDoc, pageNumber),
        getMetadata: async () => this.getMetadata(pdfDoc),
        getOutline: async () => this.getOutline(pdfDoc),
        getPermissions: async () => this.getPermissions(pdfDoc),
        destroy: () => this.destroyDocument(documentId),
      }

      this.documents.set(documentId, document)
      this.emit('documentLoaded', { documentId, document })

      return document
    }
    catch (error) {
      const pdfError = this.handleLoadError(error)
      this.emit('error', pdfError)
      throw pdfError
    }
  }

  /**
   * 获取PDF页面
   */
  private async getPage(pdfDoc: any, pageNumber: number): Promise<PdfPage> {
    try {
      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        throw this.createError(
          ErrorCode.INVALID_PAGE_NUMBER,
          `Page number ${pageNumber} is out of range (1-${pdfDoc.numPages})`,
        )
      }

      const page = await pdfDoc.getPage(pageNumber)

      return {
        pageNumber: page.pageNumber,
        pageIndex: page.pageIndex,
        rotate: page.rotate,
        ref: page.ref,
        userUnit: page.userUnit,
        view: page.view,
        getViewport: options => page.getViewport(options),
        render: renderContext => page.render(renderContext),
        getTextContent: options => page.getTextContent(options),
        getAnnotations: options => page.getAnnotations(options),
        cleanup: () => page.cleanup(),
      }
    }
    catch (error) {
      const pdfError = error instanceof Error && 'code' in error
        ? error as PdfError
        : this.createError(ErrorCode.PAGE_NOT_FOUND, `Failed to get page ${pageNumber}`, { originalError: error })

      throw pdfError
    }
  }

  /**
   * 获取文档元数据
   */
  private async getMetadata(pdfDoc: any): Promise<DocumentMetadata> {
    try {
      const [info, metadata] = await Promise.all([
        pdfDoc.getMetadata(),
        pdfDoc.getMetadata().then((m: any) => m.metadata),
      ])

      return {
        info: info.info || {},
        metadata: metadata || null,
        contentDispositionFilename: info.contentDispositionFilename,
        contentLength: info.contentLength,
      }
    }
    catch (error) {
      console.warn('Failed to get document metadata:', error)
      return {
        info: {},
        metadata: null,
      }
    }
  }

  /**
   * 获取文档大纲
   */
  private async getOutline(pdfDoc: any): Promise<OutlineNode[] | null> {
    try {
      return await pdfDoc.getOutline()
    }
    catch (error) {
      console.warn('Failed to get document outline:', error)
      return null
    }
  }

  /**
   * 获取文档权限
   */
  private async getPermissions(pdfDoc: any): Promise<number[] | null> {
    try {
      return await pdfDoc.getPermissions()
    }
    catch (error) {
      console.warn('Failed to get document permissions:', error)
      return null
    }
  }

  /**
   * 销毁文档
   */
  private destroyDocument(documentId: string): void {
    const document = this.documents.get(documentId)
    if (document) {
      try {
        document.loadingTask.destroy()
      }
      catch (error) {
        console.warn('Error destroying document:', error)
      }
      this.documents.delete(documentId)
      this.emit('documentDestroyed', { documentId })
    }
  }

  /**
   * 销毁所有文档
   */
  destroy(): void {
    for (const [documentId] of this.documents) {
      this.destroyDocument(documentId)
    }
    this.documents.clear()
    this.listeners.clear()
    this.initialized = false
  }

  // ============================================================================
  // 事件系统实现
  // ============================================================================

  on<T>(event: EventType, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as EventListener)
  }

  off<T>(event: EventType, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener as EventListener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  emit<T>(event: EventType, data?: T): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data)
        }
        catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      }
    }
  }

  once<T>(event: EventType, listener: EventListener<T>): void {
    const onceListener = (data: T) => {
      this.off(event, onceListener)
      listener(data)
    }
    this.on(event, onceListener)
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 确保引擎已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw this.createError(
        ErrorCode.LOAD_FAILED,
        'PDF engine is not initialized. Call initialize() first.',
      )
    }
  }

  /**
   * 准备PDF源
   */
  private prepareSource(source: PdfSource): any {
    if (typeof source === 'string') {
      return { url: source }
    }
    if (source instanceof File) {
      return { data: source }
    }
    if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
      return { data: source }
    }
    throw this.createError(
      ErrorCode.INVALID_ARGUMENT,
      'Invalid PDF source type',
    )
  }

  /**
   * 生成文档ID
   */
  private generateDocumentId(source: PdfSource): string {
    if (typeof source === 'string') {
      return `url_${btoa(source).replace(/[^a-z0-9]/gi, '')}`
    }
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取Worker脚本路径
   */
  private getWorkerSrc(): string {
    // 默认使用CDN版本，实际项目中应该配置为本地路径
    return 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }

  /**
   * 处理加载错误
   */
  private handleLoadError(error: any): PdfError {
    if (error?.name === 'PasswordException') {
      return this.createError(
        ErrorCode.PASSWORD_REQUIRED,
        'PDF document requires a password',
        { originalError: error },
      )
    }

    if (error?.name === 'InvalidPDFException') {
      return this.createError(
        ErrorCode.INVALID_PDF,
        'Invalid PDF document',
        { originalError: error },
      )
    }

    if (error?.name === 'MissingPDFException') {
      return this.createError(
        ErrorCode.NETWORK_ERROR,
        'PDF document not found',
        { originalError: error },
      )
    }

    return this.createError(
      ErrorCode.LOAD_FAILED,
      error?.message || 'Failed to load PDF document',
      { originalError: error },
    )
  }

  /**
   * 创建PDF错误
   */
  private createError(
    code: ErrorCode,
    message: string,
    details?: any,
  ): PdfError {
    const error = new Error(message) as PdfError
    error.code = code
    error.details = details
    error.recoverable = this.isRecoverableError(code)
    return error
  }

  /**
   * 判断错误是否可恢复
   */
  private isRecoverableError(code: ErrorCode): boolean {
    const recoverableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.WORKER_TIMEOUT,
      ErrorCode.RENDER_FAILED,
    ]
    return recoverableErrors.includes(code)
  }
}

/**
 * 创建PDF引擎实例
 */
export function createPdfEngine(): PdfEngine {
  return new PdfEngine()
}

/**
 * 默认PDF引擎实例
 */
export const defaultPdfEngine = createPdfEngine()
