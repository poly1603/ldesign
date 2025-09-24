/**
 * PDF预览器性能优化管理器
 * 提供智能缓存、内存管理、懒加载等性能优化功能
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export interface PerformanceOptions {
  maxCacheSize?: number // 最大缓存大小 (MB)
  maxPageCache?: number // 最大页面缓存数
  enableLazyLoading?: boolean // 启用懒加载
  preloadDistance?: number // 预加载距离（页面数）
  enableMemoryMonitoring?: boolean // 启用内存监控
  memoryThreshold?: number // 内存阈值 (MB)
  enableMetrics?: boolean // 启用性能指标收集
  debounceDelay?: number // 防抖延迟（毫秒）
  throttleDelay?: number // 节流延迟（毫秒）
}

export interface PerformanceMetrics {
  renderTime: number
  loadTime: number
  cacheHitRate: number
  memoryUsage: number
  totalPages: number
  renderedPages: number
  lastUpdateTime: number
}

export interface CacheItem {
  key: string
  data: any
  size: number
  accessTime: number
  frequency: number
  priority: number
}

/**
 * 性能优化管理器
 */
export class PerformanceOptimizer {
  private options: PerformanceOptions
  private document: PDFDocumentProxy | null = null
  
  // 缓存系统
  private pageCache = new Map<string, CacheItem>()
  private renderCache = new Map<string, CacheItem>()
  private thumbnailCache = new Map<string, CacheItem>()
  
  // 性能指标
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    loadTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    totalPages: 0,
    renderedPages: 0,
    lastUpdateTime: Date.now()
  }
  
  // 内存监控
  private memoryObserver: PerformanceObserver | null = null
  private cleanupTimer: number | null = null
  
  // 懒加载相关
  private intersectionObserver: IntersectionObserver | null = null
  private lazyLoadQueue = new Set<number>()
  private loadingPages = new Set<number>()
  
  constructor(options: PerformanceOptions = {}) {
    this.options = {
      maxCacheSize: 100, // 100MB
      maxPageCache: 20,
      enableLazyLoading: true,
      preloadDistance: 2,
      enableMemoryMonitoring: true,
      memoryThreshold: 500, // 500MB
      enableMetrics: true,
      debounceDelay: 300,
      throttleDelay: 100,
      ...options
    }

    this.initializePerformanceMonitoring()
    this.startMemoryMonitoring()
    this.setupIntersectionObserver()
  }

  /**
   * 设置PDF文档
   */
  setDocument(document: PDFDocumentProxy): void {
    this.document = document
    this.metrics.totalPages = document.numPages
  }

  /**
   * 智能缓存页面
   */
  async cachePage(pageNumber: number, priority: number = 1): Promise<PDFPageProxy | null> {
    if (!this.document) return null

    const cacheKey = `page-${pageNumber}`
    const cached = this.pageCache.get(cacheKey)

    if (cached) {
      // 更新缓存访问信息
      cached.accessTime = Date.now()
      cached.frequency++
      this.updateCacheHitRate(true)
      return cached.data
    }

    try {
      const startTime = performance.now()
      const page = await this.document.getPage(pageNumber)
      const loadTime = performance.now() - startTime

      // 计算缓存项大小（估算）
      const size = this.estimatePageSize(page)
      
      const cacheItem: CacheItem = {
        key: cacheKey,
        data: page,
        size,
        accessTime: Date.now(),
        frequency: 1,
        priority
      }

      // 检查缓存空间
      this.ensureCacheSpace(this.pageCache, size)
      this.pageCache.set(cacheKey, cacheItem)

      this.updateCacheHitRate(false)
      this.updateMetrics({ loadTime })

      return page
    } catch (error) {
      console.warn(`Failed to cache page ${pageNumber}:`, error)
      return null
    }
  }

  /**
   * 缓存渲染结果
   */
  cacheRender(pageNumber: number, canvas: HTMLCanvasElement, scale: number = 1): void {
    const cacheKey = `render-${pageNumber}-${scale}`
    const size = this.estimateCanvasSize(canvas)

    const cacheItem: CacheItem = {
      key: cacheKey,
      data: {
        canvas: canvas.cloneNode(true) as HTMLCanvasElement,
        imageData: canvas.toDataURL()
      },
      size,
      accessTime: Date.now(),
      frequency: 1,
      priority: 1
    }

    this.ensureCacheSpace(this.renderCache, size)
    this.renderCache.set(cacheKey, cacheItem)
  }

  /**
   * 获取渲染缓存
   */
  getCachedRender(pageNumber: number, scale: number = 1): HTMLCanvasElement | null {
    const cacheKey = `render-${pageNumber}-${scale}`
    const cached = this.renderCache.get(cacheKey)

    if (cached) {
      cached.accessTime = Date.now()
      cached.frequency++
      return cached.data.canvas
    }

    return null
  }

  /**
   * 缓存缩略图
   */
  cacheThumbnail(pageNumber: number, thumbnail: HTMLCanvasElement): void {
    const cacheKey = `thumb-${pageNumber}`
    const size = this.estimateCanvasSize(thumbnail)

    const cacheItem: CacheItem = {
      key: cacheKey,
      data: thumbnail.cloneNode(true) as HTMLCanvasElement,
      size,
      accessTime: Date.now(),
      frequency: 1,
      priority: 0.5 // 缩略图优先级较低
    }

    this.ensureCacheSpace(this.thumbnailCache, size)
    this.thumbnailCache.set(cacheKey, cacheItem)
  }

  /**
   * 预加载页面
   */
  async preloadPages(currentPage: number): Promise<void> {
    if (!this.document || !this.options.enableLazyLoading) return

    const distance = this.options.preloadDistance!
    const startPage = Math.max(1, currentPage - distance)
    const endPage = Math.min(this.document.numPages, currentPage + distance)

    const preloadPromises: Promise<void>[] = []

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      if (!this.pageCache.has(`page-${pageNum}`) && !this.loadingPages.has(pageNum)) {
        this.loadingPages.add(pageNum)
        
        const priority = this.calculatePreloadPriority(currentPage, pageNum)
        preloadPromises.push(
          this.cachePage(pageNum, priority).then(() => {
            this.loadingPages.delete(pageNum)
          })
        )
      }
    }

    await Promise.all(preloadPromises)
  }

  /**
   * 计算预加载优先级
   */
  private calculatePreloadPriority(currentPage: number, targetPage: number): number {
    const distance = Math.abs(targetPage - currentPage)
    
    if (targetPage === currentPage) return 10 // 当前页最高优先级
    if (distance === 1) return 8 // 相邻页面高优先级
    if (distance <= 2) return 5 // 近距离页面中等优先级
    
    return Math.max(1, 5 - distance) // 远距离页面低优先级
  }

  /**
   * 确保缓存空间
   */
  private ensureCacheSpace(cache: Map<string, CacheItem>, newItemSize: number): void {
    const maxSize = this.options.maxCacheSize! * 1024 * 1024 // 转换为字节
    let currentSize = this.calculateCacheSize(cache)

    // 如果添加新项会超出限制，则清理旧项
    while (currentSize + newItemSize > maxSize && cache.size > 0) {
      const itemToRemove = this.findLeastUsedItem(cache)
      if (itemToRemove) {
        currentSize -= itemToRemove.size
        cache.delete(itemToRemove.key)
      } else {
        break
      }
    }
  }

  /**
   * 计算缓存总大小
   */
  private calculateCacheSize(cache: Map<string, CacheItem>): number {
    let totalSize = 0
    for (const item of cache.values()) {
      totalSize += item.size
    }
    return totalSize
  }

  /**
   * 查找最少使用的缓存项（LFU算法）
   */
  private findLeastUsedItem(cache: Map<string, CacheItem>): CacheItem | null {
    let leastUsed: CacheItem | null = null
    let minScore = Infinity

    for (const item of cache.values()) {
      // 综合考虑频率、时间和优先级
      const timeDecay = (Date.now() - item.accessTime) / (1000 * 60 * 60) // 小时
      const score = (item.frequency / Math.max(1, item.priority)) + timeDecay

      if (score < minScore) {
        minScore = score
        leastUsed = item
      }
    }

    return leastUsed
  }

  /**
   * 估算页面大小
   */
  private estimatePageSize(page: PDFPageProxy): number {
    const viewport = page.getViewport({ scale: 1.0 })
    // 估算：页面对象 + viewport + 潜在的文本内容
    return viewport.width * viewport.height * 4 + 1024 * 10 // 粗略估算10KB
  }

  /**
   * 估算画布大小
   */
  private estimateCanvasSize(canvas: HTMLCanvasElement): number {
    // RGBA * 宽度 * 高度
    return canvas.width * canvas.height * 4
  }

  /**
   * 设置懒加载观察器
   */
  private setupIntersectionObserver(): void {
    if (!this.options.enableLazyLoading || !('IntersectionObserver' in window)) return

    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    )
  }

  /**
   * 处理元素交集变化
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement
        const pageNumber = parseInt(element.getAttribute('data-page-number') || '0')
        
        if (pageNumber > 0) {
          this.lazyLoadQueue.add(pageNumber)
          this.processLazyLoadQueue()
        }
      }
    })
  }

  /**
   * 处理懒加载队列
   */
  private processLazyLoadQueue = (() => {
    const debouncedFn = this.debounce(async () => {
      for (const pageNumber of this.lazyLoadQueue) {
        if (!this.loadingPages.has(pageNumber)) {
          this.loadingPages.add(pageNumber)
          
          try {
            await this.cachePage(pageNumber, 3) // 可见页面中等优先级
            this.metrics.renderedPages++
          } catch (error) {
            console.warn(`Failed to lazy load page ${pageNumber}:`, error)
          } finally {
            this.loadingPages.delete(pageNumber)
          }
        }
      }
      
      this.lazyLoadQueue.clear()
    }, this.options.debounceDelay!)
    
    return debouncedFn
  })()

  /**
   * 防抖函数
   */
  private debounce<T extends (...args: any[]) => any>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null
    
    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null
        func(...args)
      }
      
      if (timeout !== null) {
        clearTimeout(timeout)
      }
      timeout = window.setTimeout(later, wait)
    }
  }

  /**
   * 节流函数
   */
  private throttle<T extends (...args: any[]) => any>(
    func: T, 
    limit: number
  ): (...args: Parameters<T>) => void {
    let lastFunc: number | null = null
    let lastRan: number | null = null
    
    return (...args: Parameters<T>) => {
      if (lastRan === null) {
        func(...args)
        lastRan = Date.now()
      } else {
        if (lastFunc) clearTimeout(lastFunc)
        
        lastFunc = window.setTimeout(() => {
          if (Date.now() - lastRan! >= limit) {
            func(...args)
            lastRan = Date.now()
          }
        }, limit - (Date.now() - lastRan))
      }
    }
  }

  /**
   * 观察页面元素以启用懒加载
   */
  observePageElement(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element)
    }
  }

  /**
   * 停止观察页面元素
   */
  unobservePageElement(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element)
    }
  }

  /**
   * 初始化性能监控
   */
  private initializePerformanceMonitoring(): void {
    if (!this.options.enableMetrics) return

    // 监控长任务
    if ('PerformanceObserver' in window) {
      try {
        this.memoryObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.entryType === 'longtask') {
              console.warn('Long task detected:', entry.duration)
            }
          })
        })
        
        this.memoryObserver.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }
  }

  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(): void {
    if (!this.options.enableMemoryMonitoring) return

    this.cleanupTimer = window.setInterval(() => {
      this.checkMemoryUsage()
      this.performCleanup()
    }, 30000) // 每30秒检查一次
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedJSHeapSize = memory.usedJSHeapSize / 1024 / 1024 // MB
      
      this.metrics.memoryUsage = usedJSHeapSize
      
      if (usedJSHeapSize > this.options.memoryThreshold!) {
        console.warn('High memory usage detected:', usedJSHeapSize, 'MB')
        this.performAggressiveCleanup()
      }
    }
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    const now = Date.now()
    const maxAge = 10 * 60 * 1000 // 10分钟

    // 清理长时间未使用的缓存项
    const caches: Map<string, CacheItem>[] = [this.pageCache, this.renderCache, this.thumbnailCache]
    caches.forEach((cache: Map<string, CacheItem>) => {
      for (const [key, item] of cache.entries()) {
        if (now - item.accessTime > maxAge && item.frequency < 2) {
          cache.delete(key)
        }
      }
    })
  }

  /**
   * 执行积极清理
   */
  private performAggressiveCleanup(): void {
    // 清理一半的渲染缓存
    const renderItems = Array.from(this.renderCache.values())
      .sort((a, b) => a.frequency - b.frequency)
    
    const toRemove = renderItems.slice(0, Math.floor(renderItems.length / 2))
    toRemove.forEach(item => this.renderCache.delete(item.key))

    // 清理低优先级缩略图
    for (const [key, item] of this.thumbnailCache.entries()) {
      if (item.priority < 1) {
        this.thumbnailCache.delete(key)
      }
    }

    console.log('Aggressive cleanup performed')
  }

  /**
   * 更新缓存命中率
   */
  private updateCacheHitRate(hit: boolean): void {
    // 简化的命中率计算
    const currentHits = this.metrics.cacheHitRate * 100
    const newHitRate = hit ? 
      (currentHits + 1) / 101 : 
      currentHits / 101
    
    this.metrics.cacheHitRate = Math.min(1, newHitRate)
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(updates: Partial<PerformanceMetrics>): void {
    Object.assign(this.metrics, updates)
    this.metrics.lastUpdateTime = Date.now()
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      pageCache: {
        size: this.pageCache.size,
        totalSize: this.calculateCacheSize(this.pageCache),
      },
      renderCache: {
        size: this.renderCache.size,
        totalSize: this.calculateCacheSize(this.renderCache),
      },
      thumbnailCache: {
        size: this.thumbnailCache.size,
        totalSize: this.calculateCacheSize(this.thumbnailCache),
      }
    }
  }

  /**
   * 清理所有缓存
   */
  clearAllCaches(): void {
    this.pageCache.clear()
    this.renderCache.clear()
    this.thumbnailCache.clear()
    
    this.metrics.cacheHitRate = 0
    console.log('All caches cleared')
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.memoryObserver) {
      this.memoryObserver.disconnect()
      this.memoryObserver = null
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    this.clearAllCaches()
    this.lazyLoadQueue.clear()
    this.loadingPages.clear()
  }
}

/**
 * 创建性能优化器
 */
export function createPerformanceOptimizer(options?: PerformanceOptions): PerformanceOptimizer {
  return new PerformanceOptimizer(options)
}
