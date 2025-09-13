/**
 * 数据懒加载器
 * 
 * 负责大数据集的分批加载和缓存管理
 * 提供高效的数据获取和预加载策略
 */

import type { TableRow, TableId } from '../types'
import { EventManager } from '../managers/EventManager'

/**
 * 懒加载配置
 */
export interface LazyLoadConfig {
  /** 每页大小 */
  pageSize?: number
  /** 预加载页数 */
  preloadPages?: number
  /** 缓存页数 */
  cachePages?: number
  /** 是否启用预加载 */
  enablePreload?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 加载超时时间 */
  timeout?: number
}

/**
 * 数据加载器函数类型
 */
export type DataLoader<T> = (offset: number, limit: number) => Promise<{
  data: T[]
  total: number
  hasMore: boolean
}>

/**
 * 缓存页面数据
 */
interface CachedPage<T> {
  data: T[]
  timestamp: number
  accessCount: number
  loading: boolean
}

/**
 * 加载状态
 */
export interface LoadingState {
  isLoading: boolean
  loadingPages: Set<number>
  error: Error | null
}

/**
 * 数据懒加载器实现类
 */
export class DataLazyLoader<T extends TableRow = TableRow> {
  /** 配置 */
  private config: Required<LazyLoadConfig>

  /** 数据加载器 */
  private dataLoader: DataLoader<T>

  /** 事件管理器 */
  private eventManager: EventManager

  /** 缓存的页面数据 */
  private cachedPages: Map<number, CachedPage<T>> = new Map()

  /** 总数据量 */
  private totalCount: number = 0

  /** 是否有更多数据 */
  private hasMoreData: boolean = true

  /** 加载状态 */
  private loadingState: LoadingState = {
    isLoading: false,
    loadingPages: new Set(),
    error: null
  }

  /** 正在进行的请求 */
  private pendingRequests: Map<number, Promise<void>> = new Map()

  /**
   * 构造函数
   * @param dataLoader 数据加载器函数
   * @param config 懒加载配置
   */
  constructor(dataLoader: DataLoader<T>, config: LazyLoadConfig = {}) {
    this.dataLoader = dataLoader
    this.config = {
      pageSize: 50,
      preloadPages: 2,
      cachePages: 10,
      enablePreload: true,
      enableCache: true,
      timeout: 10000,
      ...config
    }

    this.eventManager = new EventManager()
  }

  /**
   * 获取指定范围的数据
   */
  async getData(startIndex: number, endIndex: number): Promise<T[]> {
    const startPage = Math.floor(startIndex / this.config.pageSize)
    const endPage = Math.floor(endIndex / this.config.pageSize)

    const result: T[] = []
    const loadPromises: Promise<void>[] = []

    // 加载所需的页面
    for (let page = startPage; page <= endPage; page++) {
      const pageData = await this.getPageData(page)
      if (pageData) {
        const pageStartIndex = page * this.config.pageSize
        const pageEndIndex = pageStartIndex + pageData.length

        // 计算在当前页面中需要的数据范围
        const dataStartIndex = Math.max(0, startIndex - pageStartIndex)
        const dataEndIndex = Math.min(pageData.length, endIndex - pageStartIndex + 1)

        if (dataStartIndex < dataEndIndex) {
          result.push(...pageData.slice(dataStartIndex, dataEndIndex))
        }
      }
    }

    // 预加载相邻页面
    if (this.config.enablePreload) {
      for (let i = 1; i <= this.config.preloadPages; i++) {
        const prevPage = startPage - i
        const nextPage = endPage + i

        if (prevPage >= 0) {
          loadPromises.push(this.preloadPage(prevPage))
        }

        if (nextPage * this.config.pageSize < this.totalCount || this.hasMoreData) {
          loadPromises.push(this.preloadPage(nextPage))
        }
      }
    }

    // 异步执行预加载
    Promise.all(loadPromises).catch(error => {
      console.warn('预加载失败:', error)
    })

    return result
  }

  /**
   * 获取页面数据
   * @private
   */
  private async getPageData(page: number): Promise<T[] | null> {
    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.cachedPages.get(page)
      if (cached && !cached.loading) {
        cached.accessCount++
        return cached.data
      }
    }

    // 检查是否已在加载中
    const existingRequest = this.pendingRequests.get(page)
    if (existingRequest) {
      await existingRequest
      const cached = this.cachedPages.get(page)
      return cached ? cached.data : null
    }

    // 开始加载页面
    const loadPromise = this.loadPage(page)
    this.pendingRequests.set(page, loadPromise)

    try {
      await loadPromise
      const cached = this.cachedPages.get(page)
      return cached ? cached.data : null
    } finally {
      this.pendingRequests.delete(page)
    }
  }

  /**
   * 加载页面数据
   * @private
   */
  private async loadPage(page: number): Promise<void> {
    const offset = page * this.config.pageSize
    const limit = this.config.pageSize

    // 更新加载状态
    this.loadingState.loadingPages.add(page)
    this.updateLoadingState()

    // 创建缓存项
    if (this.config.enableCache) {
      this.cachedPages.set(page, {
        data: [],
        timestamp: Date.now(),
        accessCount: 0,
        loading: true
      })
    }

    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('加载超时')), this.config.timeout)
      })

      const loadPromise = this.dataLoader(offset, limit)
      const result = await Promise.race([loadPromise, timeoutPromise])

      // 更新总数据量和状态
      this.totalCount = result.total
      this.hasMoreData = result.hasMore

      // 缓存数据
      if (this.config.enableCache) {
        this.cachedPages.set(page, {
          data: result.data,
          timestamp: Date.now(),
          accessCount: 1,
          loading: false
        })

        // 清理过期缓存
        this.cleanupCache()
      }

      // 触发数据加载完成事件
      this.eventManager.emit('page-loaded', {
        page,
        data: result.data,
        total: result.total,
        hasMore: result.hasMore
      })

    } catch (error) {
      this.loadingState.error = error as Error

      // 移除失败的缓存项
      if (this.config.enableCache) {
        this.cachedPages.delete(page)
      }

      // 触发加载错误事件
      this.eventManager.emit('load-error', {
        page,
        error: error as Error
      })

      throw error
    } finally {
      // 更新加载状态
      this.loadingState.loadingPages.delete(page)
      this.updateLoadingState()
    }
  }

  /**
   * 预加载页面
   * @private
   */
  private async preloadPage(page: number): Promise<void> {
    // 检查是否已缓存或正在加载
    if (this.cachedPages.has(page) || this.pendingRequests.has(page)) {
      return
    }

    // 检查是否超出数据范围
    if (!this.hasMoreData && page * this.config.pageSize >= this.totalCount) {
      return
    }

    try {
      await this.getPageData(page)
    } catch (error) {
      // 预加载失败不影响主流程
      console.warn(`预加载页面 ${page} 失败:`, error)
    }
  }

  /**
   * 更新加载状态
   * @private
   */
  private updateLoadingState(): void {
    const wasLoading = this.loadingState.isLoading
    this.loadingState.isLoading = this.loadingState.loadingPages.size > 0

    if (wasLoading !== this.loadingState.isLoading) {
      this.eventManager.emit('loading-state-change', {
        isLoading: this.loadingState.isLoading,
        loadingPages: Array.from(this.loadingState.loadingPages)
      })
    }
  }

  /**
   * 清理过期缓存
   * @private
   */
  private cleanupCache(): void {
    if (!this.config.enableCache) return

    const maxCacheSize = this.config.cachePages
    if (this.cachedPages.size <= maxCacheSize) return

    // 按访问时间和访问次数排序，移除最少使用的页面
    const pages = Array.from(this.cachedPages.entries())
      .filter(([_, cached]) => !cached.loading)
      .sort(([, a], [, b]) => {
        // 优先移除访问次数少的
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount
        }
        // 其次移除时间较早的
        return a.timestamp - b.timestamp
      })

    const toRemove = pages.length - maxCacheSize + 1
    for (let i = 0; i < toRemove; i++) {
      const [page] = pages[i]
      this.cachedPages.delete(page)
    }
  }

  /**
   * 获取总数据量
   */
  getTotalCount(): number {
    return this.totalCount
  }

  /**
   * 获取是否有更多数据
   */
  getHasMoreData(): boolean {
    return this.hasMoreData
  }

  /**
   * 获取加载状态
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    const totalPages = this.cachedPages.size
    const loadingPages = Array.from(this.cachedPages.values())
      .filter(cached => cached.loading).length

    return {
      totalPages,
      loadingPages,
      cachedPages: totalPages - loadingPages,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * 估算内存使用量
   * @private
   */
  private estimateMemoryUsage(): number {
    let usage = 0
    for (const cached of this.cachedPages.values()) {
      usage += JSON.stringify(cached.data).length * 2 // 粗略估算
    }
    return usage
  }

  /**
   * 刷新指定页面
   */
  async refreshPage(page: number): Promise<void> {
    // 移除缓存
    this.cachedPages.delete(page)
    
    // 重新加载
    await this.loadPage(page)
  }

  /**
   * 刷新所有缓存
   */
  async refreshAll(): Promise<void> {
    // 清除所有缓存
    this.cachedPages.clear()
    this.pendingRequests.clear()
    
    // 重置状态
    this.totalCount = 0
    this.hasMoreData = true
    this.loadingState = {
      isLoading: false,
      loadingPages: new Set(),
      error: null
    }

    // 触发刷新事件
    this.eventManager.emit('refresh-all')
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedPages.clear()
    this.pendingRequests.clear()
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    this.eventManager.on(eventName, listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    this.eventManager.off(eventName, listener)
  }

  /**
   * 销毁懒加载器
   */
  destroy(): void {
    this.clearCache()
    this.eventManager.destroy()
  }
}
