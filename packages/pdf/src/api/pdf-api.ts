/**
 * PDF API - 基础API层
 * 提供loadPdf、renderPage等核心API函数
 */

import type {
  PdfSource,
  PdfDocument,
  PdfPage,
  LoadOptions,
  RenderOptions,
  RenderContext,
  RenderResult,
  PageViewport,
  TextContent,
  TextExtractionOptions,
  DocumentMetadata,
  OutlineNode,
  PdfError,
  CacheOptions,
  LRUCache
} from '../types'
import { ErrorCode } from '../types'

import { PdfEngine, createPdfEngine } from '../engine/pdf-engine'
import { createLRUCache, defaultCacheOptions } from '../cache/lru-cache'

/**
 * PDF API配置选项
 */
export interface PdfApiOptions {
  engine?: PdfEngine
  cache?: LRUCache
  cacheOptions?: CacheOptions
  enableCache?: boolean
  enableWorker?: boolean
  workerScript?: string
}

/**
 * 渲染缓存键
 */
interface RenderCacheKey {
  documentId: string
  pageNumber: number
  scale: number
  rotation: number
  background?: string
}

/**
 * 缓存的渲染结果
 */
interface CachedRenderResult {
  canvas: HTMLCanvasElement
  viewport: PageViewport
  timestamp: number
}

/**
 * PDF API类
 * 提供高级PDF操作接口
 */
export class PdfApi {
  private engine: PdfEngine
  private cache?: LRUCache<CachedRenderResult>
  private enableCache: boolean
  private documents = new Map<string, PdfDocument>()
  private pages = new Map<string, PdfPage>()

  constructor(options: PdfApiOptions = {}) {
    this.engine = options.engine || createPdfEngine()
    this.enableCache = options.enableCache !== false
    
    if (this.enableCache) {
      this.cache = options.cache || createLRUCache<CachedRenderResult>(
        options.cacheOptions || defaultCacheOptions
      )
    }
  }

  /**
   * 初始化API
   */
  async initialize(pdfjsLib?: any): Promise<void> {
    await this.engine.initialize(pdfjsLib)
  }

  /**
   * 加载PDF文档
   */
  async loadPdf(
    source: PdfSource,
    options: LoadOptions = {}
  ): Promise<PdfDocument> {
    try {
      const document = await this.engine.loadDocument(source, options)
      const documentId = this.generateDocumentId(source)
      this.documents.set(documentId, document)
      return document
    } catch (error) {
      throw this.handleError(error, 'Failed to load PDF document')
    }
  }

  /**
   * 获取PDF页面
   */
  async getPage(
    document: PdfDocument,
    pageNumber: number
  ): Promise<PdfPage> {
    try {
      const pageKey = `${document.fingerprint}_${pageNumber}`
      
      // 检查缓存
      if (this.pages.has(pageKey)) {
        return this.pages.get(pageKey)!
      }
      
      const page = await document.getPage(pageNumber)
      this.pages.set(pageKey, page)
      return page
    } catch (error) {
      throw this.handleError(error, `Failed to get page ${pageNumber}`)
    }
  }

  /**
   * 渲染PDF页面
   */
  async renderPage(
    page: PdfPage,
    canvas: HTMLCanvasElement,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    try {
      const scale = options.scale || 1.0
      const rotation = options.rotation || 0
      const background = options.background || 'white'
      
      // 生成缓存键
      const cacheKey = this.generateRenderCacheKey({
        documentId: page.ref?.toString() || 'unknown',
        pageNumber: page.pageNumber,
        scale,
        rotation,
        background
      })
      
      // 检查缓存
      if (this.enableCache && this.cache) {
        const cached = this.cache.get(cacheKey)
        if (cached && this.isCacheValid(cached)) {
          this.copyCanvas(cached.canvas, canvas)
          return {
            promise: Promise.resolve(),
            cancel: () => {}
          }
        }
      }
      
      // 获取视口
      const viewport = page.getViewport({ scale, rotation })
      
      // 设置画布尺寸
      const context = canvas.getContext('2d')
      if (!context) {
        throw this.createError(
          ErrorCode.CANVAS_ERROR,
          'Failed to get canvas 2D context'
        )
      }
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      // 设置背景
      if (background && background !== 'transparent') {
        context.fillStyle = background
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      // 创建渲染上下文
      const renderContext: RenderContext = {
        canvasContext: context,
        viewport,
        intent: options.intent || 'display',
        enableWebGL: options.enableWebGL,
        renderInteractiveForms: true,
        transform: options.transform,
        background
      }
      
      // 执行渲染
      const renderResult = page.render(renderContext)
      
      // 缓存结果
      if (this.enableCache && this.cache) {
        renderResult.promise.then(() => {
          const cachedCanvas = this.cloneCanvas(canvas)
          const cachedResult: CachedRenderResult = {
            canvas: cachedCanvas,
            viewport,
            timestamp: Date.now()
          }
          
          // 估算缓存大小（像素数 * 4字节/像素）
          const size = canvas.width * canvas.height * 4
          this.cache!.set(cacheKey, cachedResult, size)
        }).catch(() => {
          // 渲染失败时不缓存
        })
      }
      
      return renderResult
    } catch (error) {
      throw this.handleError(error, `Failed to render page ${page.pageNumber}`)
    }
  }

  /**
   * 获取页面文本内容
   */
  async getTextContent(
    page: PdfPage,
    options: TextExtractionOptions = {}
  ): Promise<TextContent> {
    try {
      return await page.getTextContent(options)
    } catch (error) {
      throw this.handleError(error, `Failed to get text content for page ${page.pageNumber}`)
    }
  }

  /**
   * 获取页面注释
   */
  async getAnnotations(
    page: PdfPage,
    options: { intent?: string } = {}
  ): Promise<any[]> {
    try {
      return await page.getAnnotations(options)
    } catch (error) {
      console.warn(`Failed to get annotations for page ${page.pageNumber}:`, error)
      return []
    }
  }

  /**
   * 获取文档元数据
   */
  async getMetadata(document: PdfDocument): Promise<DocumentMetadata> {
    try {
      return await document.getMetadata()
    } catch (error) {
      throw this.handleError(error, 'Failed to get document metadata')
    }
  }

  /**
   * 获取文档大纲
   */
  async getOutline(document: PdfDocument): Promise<OutlineNode[] | null> {
    try {
      return await document.getOutline()
    } catch (error) {
      console.warn('Failed to get document outline:', error)
      return null
    }
  }

  /**
   * 获取文档权限
   */
  async getPermissions(document: PdfDocument): Promise<number[] | null> {
    try {
      return await document.getPermissions()
    } catch (error) {
      console.warn('Failed to get document permissions:', error)
      return null
    }
  }

  /**
   * 预加载页面
   */
  async preloadPages(
    document: PdfDocument,
    pageNumbers: number[]
  ): Promise<void> {
    const promises = pageNumbers.map(async (pageNumber) => {
      try {
        await this.getPage(document, pageNumber)
      } catch (error) {
        console.warn(`Failed to preload page ${pageNumber}:`, error)
      }
    })
    
    await Promise.allSettled(promises)
  }

  /**
   * 清理页面缓存
   */
  cleanupPage(page: PdfPage): void {
    try {
      page.cleanup()
      
      // 从缓存中移除相关项
      const pageKey = `${page.ref?.toString() || 'unknown'}_${page.pageNumber}`
      this.pages.delete(pageKey)
    } catch (error) {
      console.warn(`Failed to cleanup page ${page.pageNumber}:`, error)
    }
  }

  /**
   * 销毁文档
   */
  destroyDocument(document: PdfDocument): void {
    try {
      document.destroy()
      
      // 清理相关缓存
      const documentId = document.fingerprint
      for (const [key] of this.documents) {
        if (key.includes(documentId)) {
          this.documents.delete(key)
        }
      }
      
      for (const [key] of this.pages) {
        if (key.includes(documentId)) {
          this.pages.delete(key)
        }
      }
    } catch (error) {
      console.warn('Failed to destroy document:', error)
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache?.getStats() || null
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache?.clear()
    this.pages.clear()
  }

  /**
   * 销毁API实例
   */
  destroy(): void {
    this.engine.destroy()
    this.cache?.destroy()
    this.documents.clear()
    this.pages.clear()
  }

  // ============================================================================
  // 私有辅助方法
  // ============================================================================

  /**
   * 生成文档ID
   */
  private generateDocumentId(source: PdfSource): string {
    if (typeof source === 'string') {
      return `url_${btoa(source).replace(/[^a-zA-Z0-9]/g, '')}`
    }
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成渲染缓存键
   */
  private generateRenderCacheKey(key: RenderCacheKey): string {
    return `render_${key.documentId}_${key.pageNumber}_${key.scale}_${key.rotation}_${key.background || 'default'}`
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cached: CachedRenderResult): boolean {
    const maxAge = 30 * 60 * 1000 // 30分钟
    return Date.now() - cached.timestamp < maxAge
  }

  /**
   * 克隆画布
   */
  private cloneCanvas(original: HTMLCanvasElement): HTMLCanvasElement {
    const clone = document.createElement('canvas')
    clone.width = original.width
    clone.height = original.height
    
    const context = clone.getContext('2d')
    if (context) {
      context.drawImage(original, 0, 0)
    }
    
    return clone
  }

  /**
   * 复制画布内容
   */
  private copyCanvas(source: HTMLCanvasElement, target: HTMLCanvasElement): void {
    target.width = source.width
    target.height = source.height
    
    const context = target.getContext('2d')
    if (context) {
      context.drawImage(source, 0, 0)
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: any, message: string): PdfError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as PdfError
    }
    
    return this.createError(
      ErrorCode.UNKNOWN_ERROR,
      message,
      { originalError: error }
    )
  }

  /**
   * 创建错误
   */
  private createError(
    code: ErrorCode,
    message: string,
    details?: any
  ): PdfError {
    const error = new Error(message) as PdfError
    error.code = code
    error.details = details
    error.recoverable = false
    return error
  }
}

/**
 * 创建PDF API实例
 */
export function createPdfApi(options: PdfApiOptions = {}): PdfApi {
  return new PdfApi(options)
}

/**
 * 默认PDF API实例
 */
export const defaultPdfApi = createPdfApi()

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 快速加载PDF
 */
export async function loadPdf(
  source: PdfSource,
  options: LoadOptions = {}
): Promise<PdfDocument> {
  return defaultPdfApi.loadPdf(source, options)
}

/**
 * 快速渲染页面
 */
export async function renderPage(
  page: PdfPage,
  canvas: HTMLCanvasElement,
  options: RenderOptions = {}
): Promise<RenderResult> {
  return defaultPdfApi.renderPage(page, canvas, options)
}

/**
 * 快速获取文本内容
 */
export async function getTextContent(
  page: PdfPage,
  options: TextExtractionOptions = {}
): Promise<TextContent> {
  return defaultPdfApi.getTextContent(page, options)
}

/**
 * 创建默认缓存
 */
export function createDefaultCache() {
  // 这里应该导入并创建LRU缓存实例
  // 暂时返回null，需要实现具体的缓存创建逻辑
  return null
}

/**
 * 创建Worker管理器
 */
export function createWorkerManager() {
  // 这里应该导入并创建Worker管理器实例
  // 暂时返回null，需要实现具体的Worker管理器创建逻辑
  return null
}

/**
 * 创建事件发射器
 */
export function createEventEmitter() {
  // 这里应该导入并创建事件发射器实例
  // 暂时返回null，需要实现具体的事件发射器创建逻辑
  return null
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor() {
  // 这里应该导入并创建性能监控器实例
  // 暂时返回null，需要实现具体的性能监控器创建逻辑
  return null
}

/**
 * 创建PDF错误
 */
export function createPdfError(code: ErrorCode, message: string, details?: any) {
  const error = new Error(message) as PdfError
  error.code = code
  error.details = details
  error.recoverable = false
  error.timestamp = Date.now()
  error.context = {}
  return error
}