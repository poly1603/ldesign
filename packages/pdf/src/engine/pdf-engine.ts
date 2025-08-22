/**
 * PDF引擎 - 核心PDF处理功能
 * 负责PDF文档的加载、解析和页面管理，提供高性能和完善的错误处理机制 🚀
 * 
 * @fileoverview 这是PDF预览组件包的核心引擎，提供了：
 * - 高性能的PDF文档加载和解析
 * - 完善的错误处理和恢复机制
 * - 内存优化的页面管理
 * - 灵活的事件系统
 * - Worker支持的异步处理
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type {
  DocumentMetadata,
  EventEmitter,
  EventListener,
  EventType,
  LoadOptions,
  LoadProgress,
  LoadingTask,
  OutlineNode,
  PdfDocument,
  PdfError,
  PdfPage,
  PdfSource,
  PerformanceMetrics,
} from '../types'
import {
  ErrorCode,
} from '../types'

/**
 * PDF引擎配置选项
 */
export interface PdfEngineOptions {
  /** 是否启用性能监控 */
  readonly enablePerformanceMonitoring?: boolean
  /** 是否启用调试模式 */
  readonly debug?: boolean
  /** Worker脚本路径 */
  readonly workerSrc?: string
  /** 最大并发文档数量 */
  readonly maxConcurrentDocuments?: number
  /** 页面缓存大小 */
  readonly pageCacheSize?: number
  /** 错误重试次数 */
  readonly maxRetries?: number
  /** 超时时间（毫秒） */
  readonly timeout?: number
}

/**
 * 文档缓存项
 */
interface DocumentCacheItem {
  readonly document: PdfDocument
  readonly loadTime: number
  readonly lastAccessed: number
  readonly accessCount: number
}

/**
 * 页面缓存项
 */
interface PageCacheItem {
  readonly page: PdfPage
  readonly documentId: string
  readonly pageNumber: number
  readonly lastAccessed: number
}

/**
 * PDF引擎类
 * 提供PDF文档的核心处理功能，具备高性能和完善的错误处理 🎯
 */
export class PdfEngine implements EventEmitter {
  private readonly options: Required<PdfEngineOptions>
  private readonly documents = new Map<string, DocumentCacheItem>()
  private readonly pages = new Map<string, PageCacheItem>()
  private readonly listeners = new Map<EventType, Set<EventListener>>()
  private readonly performanceMetrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    workerUtilization: 0,
    errorRate: 0,
  }
  
  private pdfjsLib: unknown = null
  private initialized = false
  private destroyed = false
  private loadingTasks = new Map<string, LoadingTask>()
  private errorCount = 0
  private totalOperations = 0

  constructor(options: PdfEngineOptions = {}) {
    this.options = {
      enablePerformanceMonitoring: false,
      debug: false,
      workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js',
      maxConcurrentDocuments: 10,
      pageCacheSize: 50,
      maxRetries: 3,
      timeout: 30000,
      ...options,
    }

    if (this.options.debug) {
      console.info('[PdfEngine] 初始化PDF引擎，配置:', this.options)
    }
  }

  /**
   * 获取引擎配置
   */
  get config(): Readonly<Required<PdfEngineOptions>> {
    return { ...this.options }
  }

  /**
   * 获取性能指标
   */
  get metrics(): Readonly<PerformanceMetrics> {
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: this.calculateErrorRate(),
      memoryUsage: this.calculateMemoryUsage(),
    }
  }

  /**
   * 获取引擎状态
   */
  get status(): {
    readonly initialized: boolean
    readonly destroyed: boolean
    readonly documentCount: number
    readonly pageCount: number
    readonly activeLoadingTasks: number
  } {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      documentCount: this.documents.size,
      pageCount: this.pages.size,
      activeLoadingTasks: this.loadingTasks.size,
    }
  }

  /**
   * 初始化PDF引擎
   * 支持动态导入和配置验证，确保引擎能正常工作 ⚡
   */
  async initialize(pdfjsLib?: unknown): Promise<void> {
    if (this.destroyed) {
      throw this.createError(
        ErrorCode.INVALID_ARGUMENT,
        'Cannot initialize destroyed engine'
      )
    }

    if (this.initialized) {
      if (this.options.debug) {
        console.warn('[PdfEngine] 引擎已经初始化，跳过重复初始化')
      }
      return
    }

    const startTime = this.options.enablePerformanceMonitoring ? performance.now() : 0

    try {
      // 如果没有传入pdfjs-dist，尝试动态导入
      if (!pdfjsLib) {
        throw this.createError(
          ErrorCode.LOAD_FAILED,
          'PDF.js library must be provided during initialization. Please provide the pdfjs-dist library.'
        )
      }

      // 验证pdfjs-dist库的有效性
      if (!this.validatePdfJsLib(pdfjsLib)) {
        throw this.createError(
          ErrorCode.INVALID_ARGUMENT,
          'Invalid pdfjs-dist library provided'
        )
      }

      this.pdfjsLib = pdfjsLib
      this.initialized = true

      // 配置PDF.js worker
      await this.configureWorker()

      // 记录性能指标
      if (this.options.enablePerformanceMonitoring) {
        const initTime = performance.now() - startTime
        this.updatePerformanceMetric('loadTime', initTime)
      }

      if (this.options.debug) {
        console.info('[PdfEngine] PDF引擎初始化成功')
      }

      this.emit('engineInitialized', {
        version: this.getPdfJsVersion(),
        features: this.getSupportedFeatures(),
      })
    } catch (error) {
      this.errorCount++
      const pdfError = error instanceof Error && 'code' in error
        ? error as PdfError
        : this.createError(ErrorCode.LOAD_FAILED, 'Unknown initialization error', { originalError: error })

      this.emit('error', pdfError)
      throw pdfError
    }
  }

  /**
   * 加载PDF文档
   * 提供高性能的文档加载，支持缓存和并发控制 📚
   */
  async loadDocument(
    source: PdfSource,
    options: LoadOptions = {}
  ): Promise<PdfDocument> {
    this.ensureNotDestroyed()
    this.ensureInitialized()
    this.totalOperations++

    // 检查并发限制
    if (this.documents.size >= this.options.maxConcurrentDocuments) {
      await this.evictOldestDocument()
    }

    const documentId = this.generateDocumentId(source)
    const cached = this.documents.get(documentId)
    
    // 返回缓存的文档
    if (cached) {
      this.updateDocumentAccess(documentId)
      if (this.options.debug) {
        console.info(`[PdfEngine] 返回缓存文档: ${documentId}`)
      }
      this.emit('cacheHit', { key: documentId, size: 0 })
      return cached.document
    }

    const startTime = this.options.enablePerformanceMonitoring ? performance.now() : 0

    try {
      // 配置加载选项
      const loadOptions = {
        ...this.prepareSource(source),
        ...options,
        onProgress: (progress: LoadProgress) => {
          this.emit('loadProgress', progress)
          options.onProgress?.(progress)
        },
        onError: (error: Error) => {
          this.errorCount++
          options.onError?.(error)
        },
      }

      // 创建加载任务
      const loadingTask = (this.pdfjsLib as any).getDocument(loadOptions)
      this.loadingTasks.set(documentId, {
        id: documentId,
        destroyed: false,
        promise: loadingTask.promise,
        destroy: () => {
          loadingTask.destroy()
          this.loadingTasks.delete(documentId)
        },
      })

      // 等待文档加载完成
      const pdfDoc = await Promise.race([
        loadingTask.promise,
        this.createTimeoutPromise(this.options.timeout),
      ])

      // 创建文档包装器
      const document: PdfDocument = {
        numPages: pdfDoc.numPages,
        fingerprint: pdfDoc.fingerprint,
        loadingTask: this.loadingTasks.get(documentId)!,
        getPage: async (pageNumber: number) => this.getPage(pdfDoc, documentId, pageNumber),
        getMetadata: async () => this.getMetadata(pdfDoc),
        getOutline: async () => this.getOutline(pdfDoc),
        getPermissions: async () => this.getPermissions(pdfDoc),
        destroy: () => this.destroyDocument(documentId),
      }

      // 缓存文档
      const loadTime = this.options.enablePerformanceMonitoring ? performance.now() - startTime : 0
      this.cacheDocument(documentId, document, loadTime)

      // 更新性能指标
      if (this.options.enablePerformanceMonitoring) {
        this.updatePerformanceMetric('loadTime', loadTime)
      }

      if (this.options.debug) {
        console.info(`[PdfEngine] 文档加载成功: ${documentId}, 页数: ${document.numPages}`)
      }

      this.emit('documentLoaded', { document, loadTime })
      return document
    } catch (error) {
      this.errorCount++
      this.loadingTasks.delete(documentId)
      
      const pdfError = this.handleLoadError(error)
      this.emit('error', pdfError)
      throw pdfError
    }
  }

  /**
   * 获取PDF页面
   * 提供高效的页面缓存和错误处理 📄
   */
  private async getPage(pdfDoc: unknown, documentId: string, pageNumber: number): Promise<PdfPage> {
    this.totalOperations++
    const pageKey = `${documentId}_${pageNumber}`
    const cached = this.pages.get(pageKey)
    
    // 返回缓存的页面
    if (cached) {
      cached.lastAccessed = Date.now()
      this.emit('cacheHit', { key: pageKey, size: 0 })
      return cached.page
    }

    const startTime = this.options.enablePerformanceMonitoring ? performance.now() : 0

    try {
      const pdfDocObj = pdfDoc as any
      
      if (pageNumber < 1 || pageNumber > pdfDocObj.numPages) {
        throw this.createError(
          ErrorCode.INVALID_PAGE_NUMBER,
          `页码 ${pageNumber} 超出范围 (1-${pdfDocObj.numPages})`
        )
      }

      const page = await pdfDocObj.getPage(pageNumber)

      const wrappedPage: PdfPage = {
        pageNumber: page.pageNumber,
        pageIndex: page.pageIndex,
        rotate: page.rotate,
        ref: page.ref,
        userUnit: page.userUnit,
        view: page.view,
        getViewport: (options) => page.getViewport(options),
        render: (renderContext) => {
          const startRenderTime = performance.now()
          const result = page.render(renderContext)
          
          // 监控渲染性能
          result.promise.then(() => {
            const renderTime = performance.now() - startRenderTime
            if (this.options.enablePerformanceMonitoring) {
              this.updatePerformanceMetric('renderTime', renderTime)
            }
            this.emit('pageRendered', { pageNumber, renderTime })
          }).catch((error: Error) => {
            this.errorCount++
            this.emit('renderFailed', { pageNumber, error: this.createError(ErrorCode.RENDER_FAILED, error.message) })
          })
          
          return result
        },
        getTextContent: async (options) => {
          try {
            const textContent = await page.getTextContent(options)
            this.emit('textExtracted', { pageNumber, textLength: textContent.items.length })
            return textContent
          } catch (error) {
            this.errorCount++
            console.warn(`获取页面 ${pageNumber} 文本内容失败:`, error)
            return { items: [], styles: {} }
          }
        },
        getAnnotations: async (options) => {
          try {
            const annotations = await page.getAnnotations(options)
            this.emit('annotationsLoaded', { pageNumber, annotationCount: annotations.length })
            return annotations
          } catch (error) {
            console.warn(`获取页面 ${pageNumber} 注释失败:`, error)
            return []
          }
        },
        cleanup: () => {
          try {
            page.cleanup()
            this.pages.delete(pageKey)
          } catch (error) {
            console.warn(`清理页面 ${pageNumber} 失败:`, error)
          }
        },
      }

      // 缓存页面
      this.cachePage(pageKey, wrappedPage, documentId, pageNumber)

      // 更新性能指标
      if (this.options.enablePerformanceMonitoring) {
        const loadTime = performance.now() - startTime
        this.updatePerformanceMetric('loadTime', loadTime)
      }

      this.emit('cacheMiss', { key: pageKey })
      return wrappedPage
    } catch (error) {
      this.errorCount++
      const pdfError = error instanceof Error && 'code' in error
        ? error as PdfError
        : this.createError(ErrorCode.PAGE_NOT_FOUND, `获取页面 ${pageNumber} 失败`, { originalError: error })

      throw pdfError
    }
  }

  /**
   * 获取文档元数据
   * 安全地获取PDF文档的元数据信息 📋
   */
  private async getMetadata(pdfDoc: unknown): Promise<DocumentMetadata> {
    try {
      const pdfDocObj = pdfDoc as any
      const [info, metadata] = await Promise.all([
        pdfDocObj.getMetadata(),
        pdfDocObj.getMetadata().then((m: any) => m.metadata),
      ])

      return {
        info: info.info || {},
        metadata: metadata || null,
        contentDispositionFilename: info.contentDispositionFilename,
        contentLength: info.contentLength,
      }
    } catch (error) {
      console.warn('获取文档元数据失败:', error)
      return {
        info: {},
        metadata: null,
      }
    }
  }

  /**
   * 获取文档大纲
   */
  private async getOutline(pdfDoc: unknown): Promise<readonly OutlineNode[] | null> {
    try {
      const pdfDocObj = pdfDoc as any
      return await pdfDocObj.getOutline()
    } catch (error) {
      console.warn('获取文档大纲失败:', error)
      return null
    }
  }

  /**
   * 获取文档权限
   */
  private async getPermissions(pdfDoc: unknown): Promise<readonly number[] | null> {
    try {
      const pdfDocObj = pdfDoc as any
      return await pdfDocObj.getPermissions()
    } catch (error) {
      console.warn('获取文档权限失败:', error)
      return null
    }
  }

  /**
   * 销毁文档
   */
  private destroyDocument(documentId: string): void {
    const cached = this.documents.get(documentId)
    if (cached) {
      try {
        cached.document.loadingTask.destroy()
        
        // 清理相关页面缓存
        for (const [pageKey, pageItem] of this.pages) {
          if (pageItem.documentId === documentId) {
            this.pages.delete(pageKey)
          }
        }
      } catch (error) {
        console.warn('销毁文档时出错:', error)
      }
      
      this.documents.delete(documentId)
      this.loadingTasks.delete(documentId)
      this.emit('documentDestroyed', { fingerprint: documentId })
    }
  }

  /**
   * 销毁所有文档
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    for (const [documentId] of this.documents) {
      this.destroyDocument(documentId)
    }
    
    this.documents.clear()
    this.pages.clear()
    this.listeners.clear()
    this.loadingTasks.clear()
    this.initialized = false
    this.destroyed = true
    
    this.emit('engineDestroyed', {})
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
        } catch (error) {
          console.error(`事件监听器执行出错 ${event}:`, error)
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

  removeAllListeners(event?: EventType): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size || 0
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 确保引擎未被销毁
   */
  private ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw this.createError(
        ErrorCode.INVALID_ARGUMENT,
        'PDF engine has been destroyed'
      )
    }
  }

  /**
   * 确保引擎已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw this.createError(
        ErrorCode.LOAD_FAILED,
        'PDF engine is not initialized. Call initialize() first.'
      )
    }
  }

  /**
   * 验证PDF.js库的有效性
   */
  private validatePdfJsLib(pdfjsLib: unknown): boolean {
    return !!(
      pdfjsLib &&
      typeof pdfjsLib === 'object' &&
      'getDocument' in pdfjsLib &&
      'version' in pdfjsLib
    )
  }

  /**
   * 配置Worker
   */
  private async configureWorker(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && this.pdfjsLib) {
        const lib = this.pdfjsLib as any
        if (lib.GlobalWorkerOptions) {
          lib.GlobalWorkerOptions.workerSrc = this.options.workerSrc
        }
      }
    } catch (error) {
      console.warn('配置Worker失败:', error)
    }
  }

  /**
   * 获取PDF.js版本
   */
  private getPdfJsVersion(): string {
    try {
      return (this.pdfjsLib as any)?.version || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * 获取支持的功能
   */
  private getSupportedFeatures(): string[] {
    const features = []
    
    if (typeof Worker !== 'undefined') {
      features.push('webworker')
    }
    
    if (typeof OffscreenCanvas !== 'undefined') {
      features.push('offscreen-canvas')
    }
    
    return features
  }

  /**
   * 准备PDF源
   */
  private prepareSource(source: PdfSource): Record<string, unknown> {
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
      'Invalid PDF source type'
    )
  }

  /**
   * 生成文档ID
   */
  private generateDocumentId(source: PdfSource): string {
    if (typeof source === 'string') {
      return `url_${btoa(source).replace(/[^a-z0-9]/gi, '')}`
    }
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 创建超时Promise
   */
  private createTimeoutPromise<T>(timeout: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(this.createError(ErrorCode.TIMEOUT_ERROR, `Operation timed out after ${timeout}ms`))
      }, timeout)
    })
  }

  /**
   * 缓存文档
   */
  private cacheDocument(documentId: string, document: PdfDocument, loadTime: number): void {
    this.documents.set(documentId, {
      document,
      loadTime,
      lastAccessed: Date.now(),
      accessCount: 1,
    })
  }

  /**
   * 缓存页面
   */
  private cachePage(pageKey: string, page: PdfPage, documentId: string, pageNumber: number): void {
    // 如果缓存已满，移除最旧的页面
    if (this.pages.size >= this.options.pageCacheSize) {
      this.evictOldestPage()
    }

    this.pages.set(pageKey, {
      page,
      documentId,
      pageNumber,
      lastAccessed: Date.now(),
    })
  }

  /**
   * 更新文档访问时间
   */
  private updateDocumentAccess(documentId: string): void {
    const cached = this.documents.get(documentId)
    if (cached) {
      this.documents.set(documentId, {
        ...cached,
        lastAccessed: Date.now(),
        accessCount: cached.accessCount + 1,
      })
    }
  }

  /**
   * 移除最旧的文档
   */
  private async evictOldestDocument(): Promise<void> {
    let oldestId = ''
    let oldestTime = Infinity

    for (const [id, item] of this.documents) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestId = id
      }
    }

    if (oldestId) {
      this.destroyDocument(oldestId)
      this.emit('cacheEvicted', { key: oldestId, reason: 'lru' })
    }
  }

  /**
   * 移除最旧的页面
   */
  private evictOldestPage(): void {
    let oldestKey = ''
    let oldestTime = Infinity

    for (const [key, item] of this.pages) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.pages.delete(oldestKey)
      this.emit('cacheEvicted', { key: oldestKey, reason: 'lru' })
    }
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(): number {
    if (this.totalOperations === 0) return 0
    const hits = this.totalOperations - this.errorCount
    return hits / this.totalOperations
  }

  /**
   * 计算错误率
   */
  private calculateErrorRate(): number {
    if (this.totalOperations === 0) return 0
    return this.errorCount / this.totalOperations
  }

  /**
   * 计算内存使用量
   */
  private calculateMemoryUsage(): number {
    return (this.documents.size + this.pages.size) * 1024 // 估算值
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetric(metric: keyof PerformanceMetrics, value: number): void {
    if (typeof this.performanceMetrics[metric] === 'number') {
      ;(this.performanceMetrics as any)[metric] = value
    }
  }

  /**
   * 处理加载错误
   */
  private handleLoadError(error: unknown): PdfError {
    const err = error as any

    if (err?.name === 'PasswordException') {
      return this.createError(
        ErrorCode.PASSWORD_REQUIRED,
        'PDF文档需要密码',
        { originalError: error }
      )
    }

    if (err?.name === 'InvalidPDFException') {
      return this.createError(
        ErrorCode.INVALID_PDF,
        '无效的PDF文档',
        { originalError: error }
      )
    }

    if (err?.name === 'MissingPDFException') {
      return this.createError(
        ErrorCode.NETWORK_ERROR,
        'PDF文档未找到',
        { originalError: error }
      )
    }

    return this.createError(
      ErrorCode.LOAD_FAILED,
      err?.message || '加载PDF文档失败',
      { originalError: error }
    )
  }

  /**
   * 创建PDF错误
   */
  private createError(
    code: ErrorCode,
    message: string,
    details?: unknown
  ): PdfError {
    const error = new Error(message) as PdfError
    error.code = code
    error.details = details
    error.recoverable = this.isRecoverableError(code)
    error.timestamp = Date.now()
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
      ErrorCode.TIMEOUT_ERROR,
    ]
    return recoverableErrors.includes(code)
  }
}

/**
 * 创建PDF引擎实例
 */
export function createPdfEngine(options?: PdfEngineOptions): PdfEngine {
  return new PdfEngine(options)
}

/**
 * 默认PDF引擎实例
 */
export const defaultPdfEngine = createPdfEngine({
  enablePerformanceMonitoring: true,
  debug: false,
})