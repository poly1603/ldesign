/**
 * 缓存管理器
 * 提供页面缓存、渲染缓存等功能
 */

import type { PDFPageProxy } from 'pdfjs-dist'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  accessCount: number
  lastAccessed: number
}

/**
 * 缓存配置
 */
interface CacheConfig {
  /** 最大缓存项数量 */
  maxItems: number
  /** 缓存过期时间（毫秒） */
  maxAge: number
  /** 是否启用LRU清理 */
  enableLRU: boolean
}

/**
 * 通用缓存管理器
 */
export class CacheManager<T> {
  private cache = new Map<string, CacheItem<T>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxItems: 50,
      maxAge: 30 * 60 * 1000, // 30分钟
      enableLRU: true,
      ...config,
    }
  }

  /**
   * 设置缓存项
   */
  set(key: string, data: T): void {
    const now = Date.now()
    
    // 如果缓存已满，清理旧项
    if (this.cache.size >= this.config.maxItems) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
    })
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const now = Date.now()
    
    // 检查是否过期
    if (now - item.timestamp > this.config.maxAge) {
      this.cache.delete(key)
      return null
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccessed = now

    return item.data
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 清理过期和最少使用的缓存项
   */
  private cleanup(): void {
    const now = Date.now()
    const itemsToDelete: string[] = []

    // 清理过期项
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > this.config.maxAge) {
        itemsToDelete.push(key)
      }
    }

    // 删除过期项
    itemsToDelete.forEach(key => this.cache.delete(key))

    // 如果仍然超出限制，使用LRU策略
    if (this.config.enableLRU && this.cache.size >= this.config.maxItems) {
      const items = Array.from(this.cache.entries())
      
      // 按最后访问时间排序
      items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      
      // 删除最少使用的项
      const deleteCount = Math.max(1, Math.floor(this.config.maxItems * 0.2))
      for (let i = 0; i < deleteCount && i < items.length; i++) {
        this.cache.delete(items[i][0])
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxItems: number
    hitRate: number
    oldestItem: number
    newestItem: number
  } {
    const items = Array.from(this.cache.values())
    const now = Date.now()
    
    let totalAccess = 0
    let oldestTime = now
    let newestTime = 0

    items.forEach(item => {
      totalAccess += item.accessCount
      oldestTime = Math.min(oldestTime, item.timestamp)
      newestTime = Math.max(newestTime, item.timestamp)
    })

    return {
      size: this.cache.size,
      maxItems: this.config.maxItems,
      hitRate: totalAccess > 0 ? totalAccess / (totalAccess + this.cache.size) : 0,
      oldestItem: now - oldestTime,
      newestItem: now - newestTime,
    }
  }
}

/**
 * PDF页面缓存管理器
 */
export class PdfPageCacheManager extends CacheManager<PDFPageProxy> {
  constructor() {
    super({
      maxItems: 20, // PDF页面缓存较少
      maxAge: 10 * 60 * 1000, // 10分钟
      enableLRU: true,
    })
  }

  /**
   * 生成页面缓存键
   */
  static generatePageKey(documentId: string, pageNumber: number): string {
    return `page:${documentId}:${pageNumber}`
  }

  /**
   * 缓存页面
   */
  cachePage(documentId: string, pageNumber: number, page: PDFPageProxy): void {
    const key = PdfPageCacheManager.generatePageKey(documentId, pageNumber)
    this.set(key, page)
  }

  /**
   * 获取缓存的页面
   */
  getCachedPage(documentId: string, pageNumber: number): PDFPageProxy | null {
    const key = PdfPageCacheManager.generatePageKey(documentId, pageNumber)
    return this.get(key)
  }

  /**
   * 检查页面是否已缓存
   */
  hasPage(documentId: string, pageNumber: number): boolean {
    const key = PdfPageCacheManager.generatePageKey(documentId, pageNumber)
    return this.has(key)
  }

  /**
   * 删除文档的所有页面缓存
   */
  clearDocument(documentId: string): void {
    const keysToDelete = this.keys().filter(key => key.startsWith(`page:${documentId}:`))
    keysToDelete.forEach(key => this.delete(key))
  }
}

/**
 * 渲染缓存管理器
 */
export class RenderCacheManager extends CacheManager<HTMLCanvasElement> {
  constructor() {
    super({
      maxItems: 10, // 渲染缓存更少
      maxAge: 5 * 60 * 1000, // 5分钟
      enableLRU: true,
    })
  }

  /**
   * 生成渲染缓存键
   */
  static generateRenderKey(
    documentId: string,
    pageNumber: number,
    scale: number,
    rotation: number
  ): string {
    return `render:${documentId}:${pageNumber}:${scale}:${rotation}`
  }

  /**
   * 缓存渲染结果
   */
  cacheRender(
    documentId: string,
    pageNumber: number,
    scale: number,
    rotation: number,
    canvas: HTMLCanvasElement
  ): void {
    const key = RenderCacheManager.generateRenderKey(documentId, pageNumber, scale, rotation)
    
    // 克隆canvas以避免引用问题
    const clonedCanvas = document.createElement('canvas')
    clonedCanvas.width = canvas.width
    clonedCanvas.height = canvas.height
    const ctx = clonedCanvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(canvas, 0, 0)
    }
    
    this.set(key, clonedCanvas)
  }

  /**
   * 获取缓存的渲染结果
   */
  getCachedRender(
    documentId: string,
    pageNumber: number,
    scale: number,
    rotation: number
  ): HTMLCanvasElement | null {
    const key = RenderCacheManager.generateRenderKey(documentId, pageNumber, scale, rotation)
    return this.get(key)
  }

  /**
   * 检查渲染是否已缓存
   */
  hasRender(
    documentId: string,
    pageNumber: number,
    scale: number,
    rotation: number
  ): boolean {
    const key = RenderCacheManager.generateRenderKey(documentId, pageNumber, scale, rotation)
    return this.has(key)
  }

  /**
   * 删除文档的所有渲染缓存
   */
  clearDocument(documentId: string): void {
    const keysToDelete = this.keys().filter(key => key.startsWith(`render:${documentId}:`))
    keysToDelete.forEach(key => this.delete(key))
  }
}

/**
 * 缩略图缓存管理器
 */
export class ThumbnailCacheManager extends CacheManager<HTMLCanvasElement> {
  constructor() {
    super({
      maxItems: 100, // 缩略图可以缓存更多
      maxAge: 15 * 60 * 1000, // 15分钟
      enableLRU: true,
    })
  }

  /**
   * 生成缩略图缓存键
   */
  static generateThumbnailKey(
    documentId: string,
    pageNumber: number,
    width: number,
    height: number
  ): string {
    return `thumbnail:${documentId}:${pageNumber}:${width}:${height}`
  }

  /**
   * 缓存缩略图
   */
  cacheThumbnail(
    documentId: string,
    pageNumber: number,
    width: number,
    height: number,
    canvas: HTMLCanvasElement
  ): void {
    const key = ThumbnailCacheManager.generateThumbnailKey(documentId, pageNumber, width, height)
    
    // 克隆canvas
    const clonedCanvas = document.createElement('canvas')
    clonedCanvas.width = canvas.width
    clonedCanvas.height = canvas.height
    const ctx = clonedCanvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(canvas, 0, 0)
    }
    
    this.set(key, clonedCanvas)
  }

  /**
   * 获取缓存的缩略图
   */
  getCachedThumbnail(
    documentId: string,
    pageNumber: number,
    width: number,
    height: number
  ): HTMLCanvasElement | null {
    const key = ThumbnailCacheManager.generateThumbnailKey(documentId, pageNumber, width, height)
    return this.get(key)
  }

  /**
   * 检查缩略图是否已缓存
   */
  hasThumbnail(
    documentId: string,
    pageNumber: number,
    width: number,
    height: number
  ): boolean {
    const key = ThumbnailCacheManager.generateThumbnailKey(documentId, pageNumber, width, height)
    return this.has(key)
  }

  /**
   * 删除文档的所有缩略图缓存
   */
  clearDocument(documentId: string): void {
    const keysToDelete = this.keys().filter(key => key.startsWith(`thumbnail:${documentId}:`))
    keysToDelete.forEach(key => this.delete(key))
  }
}
