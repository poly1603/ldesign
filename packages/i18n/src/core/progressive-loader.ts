/**
 * 渐进式加载策略
 * 
 * 优化大型应用的加载性能，支持按需加载、代码分割和智能预取
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import { UnifiedCache } from './unified-cache'
import { SmartPreloader } from './advanced-features'

/**
 * 加载策略配置
 */
export interface ProgressiveLoaderConfig {
  /** 初始加载的语言 */
  initialLocales?: string[]
  /** 初始加载的命名空间 */
  initialNamespaces?: string[]
  /** 是否启用代码分割 */
  enableCodeSplitting?: boolean
  /** 是否启用懒加载 */
  enableLazyLoading?: boolean
  /** 是否启用预取 */
  enablePrefetch?: boolean
  /** 预取策略 */
  prefetchStrategy?: 'idle' | 'visible' | 'hover' | 'route'
  /** 最大并发加载数 */
  maxConcurrent?: number
  /** 加载超时时间 */
  loadTimeout?: number
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟 */
  retryDelay?: number
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存策略 */
  cacheStrategy?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
  /** 是否启用压缩 */
  enableCompression?: boolean
}

/**
 * 资源加载状态
 */
export enum LoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  FAILED = 'failed',
  CACHED = 'cached'
}

/**
 * 资源信息
 */
export interface ResourceInfo {
  id: string
  url: string
  locale?: string
  namespace?: string
  size?: number
  priority?: number
  status: LoadStatus
  loadTime?: number
  error?: Error
  retryCount?: number
}

/**
 * 加载队列项
 */
interface LoadQueueItem {
  resource: ResourceInfo
  resolve: (data: any) => void
  reject: (error: Error) => void
  priority: number
  timestamp: number
}

/**
 * 渐进式加载器类
 */
export class ProgressiveLoader {
  private config: Required<ProgressiveLoaderConfig>
  private resources = new Map<string, ResourceInfo>()
  private loadQueue: LoadQueueItem[] = []
  private activeLoads = new Map<string, Promise<any>>()
  private cache: UnifiedCache<any>
  private preloader: SmartPreloader
  private observers = new Map<string, IntersectionObserver>()
  private performanceObserver?: PerformanceObserver

  constructor(config: ProgressiveLoaderConfig = {}) {
    this.config = {
      initialLocales: ['en'],
      initialNamespaces: ['common'],
      enableCodeSplitting: true,
      enableLazyLoading: true,
      enablePrefetch: true,
      prefetchStrategy: 'idle',
      maxConcurrent: 3,
      loadTimeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      enableCache: true,
      cacheStrategy: 'memory',
      enableCompression: false,
      ...config,
    }

    this.cache = new UnifiedCache({
      maxSize: 100,
      strategy: 'lru',
    })

    this.preloader = new SmartPreloader({
      maxConcurrent: this.config.maxConcurrent,
    })

    this.initialize()
  }

  /**
   * 初始化
   */
  private initialize(): void {
    // 设置性能观察器
    if (typeof PerformanceObserver !== 'undefined') {
      this.setupPerformanceObserver()
    }

    // 设置预取策略
    if (this.config.enablePrefetch) {
      this.setupPrefetchStrategy()
    }

    // 加载初始资源
    this.loadInitialResources()
  }

  /**
   * 加载初始资源
   */
  private async loadInitialResources(): Promise<void> {
    const initialResources: ResourceInfo[] = []

    // 添加初始语言资源
    for (const locale of this.config.initialLocales) {
      for (const namespace of this.config.initialNamespaces) {
        initialResources.push({
          id: `${locale}:${namespace}`,
          url: this.getResourceUrl(locale, namespace),
          locale,
          namespace,
          status: LoadStatus.IDLE,
          priority: 10, // 高优先级
        })
      }
    }

    // 批量加载
    await this.loadMultiple(initialResources)
  }

  /**
   * 加载资源
   */
  async load(resource: ResourceInfo | string): Promise<any> {
    const resourceInfo = typeof resource === 'string' 
      ? this.createResourceInfo(resource) 
      : resource

    // 检查缓存
    if (this.config.enableCache) {
      const cached = await this.getFromCache(resourceInfo.id)
      if (cached !== undefined) {
        resourceInfo.status = LoadStatus.CACHED
        return cached
      }
    }

    // 检查是否已经在加载
    const activeLoad = this.activeLoads.get(resourceInfo.id)
    if (activeLoad) {
      return activeLoad
    }

    // 添加到队列或立即加载
    if (this.activeLoads.size >= this.config.maxConcurrent) {
      return this.addToQueue(resourceInfo)
    } else {
      return this.performLoad(resourceInfo)
    }
  }

  /**
   * 批量加载
   */
  async loadMultiple(resources: (ResourceInfo | string)[]): Promise<any[]> {
    const promises = resources.map(resource => this.load(resource))
    return Promise.all(promises)
  }

  /**
   * 执行加载
   */
  private async performLoad(resource: ResourceInfo): Promise<any> {
    resource.status = LoadStatus.LOADING
    const startTime = Date.now()

    const loadPromise = this.createLoadPromise(resource)
    this.activeLoads.set(resource.id, loadPromise)

    try {
      const data = await loadPromise
      
      resource.status = LoadStatus.LOADED
      resource.loadTime = Date.now() - startTime
      
      // 缓存结果
      if (this.config.enableCache) {
        await this.saveToCache(resource.id, data)
      }

      // 处理队列中的下一个项目
      this.processQueue()

      return data
    } catch (error) {
      resource.status = LoadStatus.FAILED
      resource.error = error as Error
      resource.retryCount = (resource.retryCount || 0) + 1

      // 重试逻辑
      if (resource.retryCount <= this.config.retryCount) {
        await this.delay(this.config.retryDelay * resource.retryCount)
        return this.performLoad(resource)
      }

      throw error
    } finally {
      this.activeLoads.delete(resource.id)
    }
  }

  /**
   * 创建加载Promise
   */
  private createLoadPromise(resource: ResourceInfo): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Load timeout: ${resource.id}`))
      }, this.config.loadTimeout)

      this.fetchResource(resource)
        .then(data => {
          clearTimeout(timeout)
          resolve(data)
        })
        .catch(error => {
          clearTimeout(timeout)
          reject(error)
        })
    })
  }

  /**
   * 获取资源
   */
  private async fetchResource(resource: ResourceInfo): Promise<any> {
    // 支持代码分割
    if (this.config.enableCodeSplitting && resource.url.endsWith('.js')) {
      return this.loadWithCodeSplitting(resource.url)
    }

    // 标准fetch
    const response = await fetch(resource.url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': this.config.enableCompression ? 'gzip, deflate, br' : 'identity',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to load resource: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 使用代码分割加载
   */
  private async loadWithCodeSplitting(url: string): Promise<any> {
    // 动态导入
    const module = await import(/* webpackChunkName: "i18n-[request]" */ url)
    return module.default || module
  }

  /**
   * 添加到队列
   */
  private addToQueue(resource: ResourceInfo): Promise<any> {
    return new Promise((resolve, reject) => {
      const item: LoadQueueItem = {
        resource,
        resolve,
        reject,
        priority: resource.priority || 0,
        timestamp: Date.now(),
      }

      // 按优先级插入队列
      const insertIndex = this.loadQueue.findIndex(
        qi => qi.priority < item.priority
      )

      if (insertIndex === -1) {
        this.loadQueue.push(item)
      } else {
        this.loadQueue.splice(insertIndex, 0, item)
      }
    })
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    while (this.loadQueue.length > 0 && this.activeLoads.size < this.config.maxConcurrent) {
      const item = this.loadQueue.shift()
      if (item) {
        this.performLoad(item.resource)
          .then(item.resolve)
          .catch(item.reject)
      }
    }
  }

  /**
   * 预取资源
   */
  async prefetch(resources: (ResourceInfo | string)[]): Promise<void> {
    if (!this.config.enablePrefetch) return

    const resourceInfos = resources.map(r => 
      typeof r === 'string' ? this.createResourceInfo(r) : r
    )

    // 根据策略执行预取
    switch (this.config.prefetchStrategy) {
      case 'idle':
        this.prefetchOnIdle(resourceInfos)
        break
      case 'visible':
        this.prefetchOnVisible(resourceInfos)
        break
      case 'hover':
        this.prefetchOnHover(resourceInfos)
        break
      case 'route':
        this.prefetchOnRoute(resourceInfos)
        break
    }
  }

  /**
   * 空闲时预取
   */
  private prefetchOnIdle(resources: ResourceInfo[]): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadMultiple(resources.map(r => ({ ...r, priority: -1 })))
      })
    } else {
      setTimeout(() => {
        this.loadMultiple(resources.map(r => ({ ...r, priority: -1 })))
      }, 100)
    }
  }

  /**
   * 可见时预取
   */
  private prefetchOnVisible(resources: ResourceInfo[]): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const resourceId = entry.target.getAttribute('data-i18n-resource')
          if (resourceId) {
            const resource = resources.find(r => r.id === resourceId)
            if (resource) {
              this.load(resource)
            }
          }
        }
      })
    })

    // 假设有相关DOM元素
    resources.forEach(resource => {
      const elements = document.querySelectorAll(`[data-i18n-resource="${resource.id}"]`)
      elements.forEach(el => observer.observe(el))
    })

    this.observers.set('visible', observer)
  }

  /**
   * 悬停时预取
   */
  private prefetchOnHover(resources: ResourceInfo[]): void {
    resources.forEach(resource => {
      const elements = document.querySelectorAll(`[data-i18n-resource="${resource.id}"]`)
      elements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          this.load({ ...resource, priority: 5 })
        })
      })
    })
  }

  /**
   * 路由变化时预取
   */
  private prefetchOnRoute(resources: ResourceInfo[]): void {
    // 监听路由变化
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname
        const relevantResources = this.getResourcesForRoute(currentPath)
        this.loadMultiple(relevantResources)
      })
    }
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver(): void {
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('i18n')) {
          console.debug(`[i18n] Resource loaded: ${entry.name} in ${entry.duration}ms`)
        }
      }
    })

    this.performanceObserver.observe({ entryTypes: ['resource'] })
  }

  /**
   * 设置预取策略
   */
  private setupPrefetchStrategy(): void {
    // 设置资源提示
    if (typeof document !== 'undefined') {
      // 添加预连接
      this.addLinkHint('preconnect', this.getBaseUrl())
      
      // 添加DNS预取
      this.addLinkHint('dns-prefetch', this.getBaseUrl())
    }
  }

  /**
   * 添加链接提示
   */
  private addLinkHint(rel: string, href: string): void {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    document.head.appendChild(link)
  }

  /**
   * 从缓存获取
   */
  private async getFromCache(key: string): Promise<any> {
    switch (this.config.cacheStrategy) {
      case 'memory':
        return this.cache.get(key)
      
      case 'localStorage':
        const lsData = localStorage.getItem(`i18n:${key}`)
        return lsData ? JSON.parse(lsData) : undefined
      
      case 'sessionStorage':
        const ssData = sessionStorage.getItem(`i18n:${key}`)
        return ssData ? JSON.parse(ssData) : undefined
      
      case 'indexedDB':
        return this.getFromIndexedDB(key)
      
      default:
        return undefined
    }
  }

  /**
   * 保存到缓存
   */
  private async saveToCache(key: string, data: any): Promise<void> {
    switch (this.config.cacheStrategy) {
      case 'memory':
        this.cache.set(key, data)
        break
      
      case 'localStorage':
        localStorage.setItem(`i18n:${key}`, JSON.stringify(data))
        break
      
      case 'sessionStorage':
        sessionStorage.setItem(`i18n:${key}`, JSON.stringify(data))
        break
      
      case 'indexedDB':
        await this.saveToIndexedDB(key, data)
        break
    }
  }

  /**
   * 从IndexedDB获取
   */
  private async getFromIndexedDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('i18n-cache', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['resources'], 'readonly')
        const store = transaction.objectStore('resources')
        const getRequest = store.get(key)
        
        getRequest.onsuccess = () => resolve(getRequest.result?.data)
        getRequest.onerror = () => reject(getRequest.error)
      }
      
      request.onerror = () => reject(request.error)
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * 保存到IndexedDB
   */
  private async saveToIndexedDB(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('i18n-cache', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['resources'], 'readwrite')
        const store = transaction.objectStore('resources')
        const putRequest = store.put({ id: key, data, timestamp: Date.now() })
        
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 创建资源信息
   */
  private createResourceInfo(id: string): ResourceInfo {
    const [locale, namespace] = id.split(':')
    return {
      id,
      url: this.getResourceUrl(locale, namespace),
      locale,
      namespace,
      status: LoadStatus.IDLE,
    }
  }

  /**
   * 获取资源URL
   */
  private getResourceUrl(locale: string, namespace?: string): string {
    const base = this.getBaseUrl()
    return namespace 
      ? `${base}/locales/${locale}/${namespace}.json`
      : `${base}/locales/${locale}.json`
  }

  /**
   * 获取基础URL
   */
  private getBaseUrl(): string {
    return typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000'
  }

  /**
   * 获取路由相关资源
   */
  private getResourcesForRoute(path: string): ResourceInfo[] {
    // 根据路由路径确定需要的资源
    // 这里需要根据实际应用的路由配置来实现
    const resources: ResourceInfo[] = []
    
    // 示例：根据路径判断
    if (path.startsWith('/admin')) {
      resources.push(this.createResourceInfo('en:admin'))
    } else if (path.startsWith('/user')) {
      resources.push(this.createResourceInfo('en:user'))
    }
    
    return resources
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取加载统计
   */
  getStatistics(): {
    totalResources: number
    loadedResources: number
    failedResources: number
    cachedResources: number
    averageLoadTime: number
    queueSize: number
    activeLoads: number
  } {
    let loadedCount = 0
    let failedCount = 0
    let cachedCount = 0
    let totalLoadTime = 0
    let loadTimeCount = 0

    for (const resource of this.resources.values()) {
      switch (resource.status) {
        case LoadStatus.LOADED:
          loadedCount++
          if (resource.loadTime) {
            totalLoadTime += resource.loadTime
            loadTimeCount++
          }
          break
        case LoadStatus.FAILED:
          failedCount++
          break
        case LoadStatus.CACHED:
          cachedCount++
          break
      }
    }

    return {
      totalResources: this.resources.size,
      loadedResources: loadedCount,
      failedResources: failedCount,
      cachedResources: cachedCount,
      averageLoadTime: loadTimeCount > 0 ? totalLoadTime / loadTimeCount : 0,
      queueSize: this.loadQueue.length,
      activeLoads: this.activeLoads.size,
    }
  }

  /**
   * 清理资源
   */
  clearResources(filter?: (resource: ResourceInfo) => boolean): void {
    if (filter) {
      for (const [id, resource] of this.resources) {
        if (filter(resource)) {
          this.resources.delete(id)
        }
      }
    } else {
      this.resources.clear()
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    // 清理观察器
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()

    // 清理性能观察器
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }

    // 清理队列
    this.loadQueue = []
    this.activeLoads.clear()
    this.resources.clear()
  }
}

/**
 * 创建渐进式加载器
 */
export function createProgressiveLoader(config?: ProgressiveLoaderConfig): ProgressiveLoader {
  return new ProgressiveLoader(config)
}

/**
 * 默认导出
 */
export default ProgressiveLoader