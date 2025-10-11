/**
import { getLogger } from '../logger/unified-logger';

 * 资源预加载管理器
 * 🚀 智能预加载资源，提升应用性能
 */

/**
 * 资源类型
 */
export type ResourceType =
  | 'script'
  | 'style'
  | 'image'
  | 'font'
  | 'fetch'
  | 'document'

/**
 * 资源优先级
 */
export type ResourcePriority = 'high' | 'medium' | 'low'

/**
 * 资源状态
 */
export type ResourceStatus = 'pending' | 'loading' | 'loaded' | 'error' | 'cached'

/**
 * 资源项接口
 */
export interface ResourceItem {
  url: string
  type: ResourceType
  priority: ResourcePriority
  status: ResourceStatus
  error?: Error
  loadTime?: number
  size?: number
  crossOrigin?: 'anonymous' | 'use-credentials'
  integrity?: string
}

/**
 * 预加载配置
 */
export interface PreloadConfig {
  maxConcurrent?: number
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  cacheEnabled?: boolean
}

/**
 * 资源预加载管理器类
 */
export class ResourcePreloader {
  private logger = getLogger('ResourcePreloader')

  private resources: Map<string, ResourceItem> = new Map()
  private loadingQueue: ResourceItem[] = []
  private loadingCount = 0
  private config: Required<PreloadConfig>
  private cache: Map<string, unknown> = new Map()

  constructor(config: PreloadConfig = {}) {
    this.config = {
      maxConcurrent: 6,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      cacheEnabled: true,
      ...config,
    }
  }

  /**
   * 添加资源到预加载队列
   */
  add(
    url: string,
    type: ResourceType,
    priority: ResourcePriority = 'medium',
    options?: Partial<ResourceItem>
  ): void {
    if (this.resources.has(url)) {
      return
    }

    const resource: ResourceItem = {
      url,
      type,
      priority,
      status: 'pending',
      ...options,
    }

    this.resources.set(url, resource)
    this.loadingQueue.push(resource)

    // 按优先级排序
    this.sortQueue()

    // 尝试开始加载
    this.processQueue()
  }

  /**
   * 批量添加资源
   */
  addBatch(
    resources: Array<{
      url: string
      type: ResourceType
      priority?: ResourcePriority
      options?: Partial<ResourceItem>
    }>
  ): void {
    resources.forEach(({ url, type, priority, options }) => {
      this.add(url, type, priority, options)
    })
  }

  /**
   * 预加载图片
   */
  preloadImage(url: string, priority: ResourcePriority = 'medium'): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.config.cacheEnabled && this.cache.has(url)) {
        resolve(this.cache.get(url) as HTMLImageElement)
        return
      }

      const img = new Image()

      img.onload = () => {
        if (this.config.cacheEnabled) {
          this.cache.set(url, img)
        }
        const resource = this.resources.get(url)
        if (resource) {
          resource.status = 'loaded'
          resource.loadTime = performance.now()
        }
        resolve(img)
      }

      img.onerror = () => {
        const resource = this.resources.get(url)
        const error = new Error(`Failed to load image: ${url}`)
        if (resource) {
          resource.status = 'error'
          resource.error = error
        }
        reject(error)
      }

      this.add(url, 'image', priority)
      img.src = url
    })
  }

  /**
   * 预加载脚本
   */
  preloadScript(url: string, priority: ResourcePriority = 'medium'): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
      if (this.config.cacheEnabled && this.cache.has(url)) {
        resolve(this.cache.get(url) as HTMLScriptElement)
        return
      }

      const script = document.createElement('script')
      script.src = url
      script.async = true

      script.onload = () => {
        if (this.config.cacheEnabled) {
          this.cache.set(url, script)
        }
        const resource = this.resources.get(url)
        if (resource) {
          resource.status = 'loaded'
          resource.loadTime = performance.now()
        }
        resolve(script)
      }

      script.onerror = () => {
        const resource = this.resources.get(url)
        const error = new Error(`Failed to load script: ${url}`)
        if (resource) {
          resource.status = 'error'
          resource.error = error
        }
        reject(error)
      }

      this.add(url, 'script', priority)
      document.head.appendChild(script)
    })
  }

  /**
   * 预加载样式表
   */
  preloadStyle(url: string, priority: ResourcePriority = 'medium'): Promise<HTMLLinkElement> {
    return new Promise((resolve, reject) => {
      if (this.config.cacheEnabled && this.cache.has(url)) {
        resolve(this.cache.get(url) as HTMLLinkElement)
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url

      link.onload = () => {
        if (this.config.cacheEnabled) {
          this.cache.set(url, link)
        }
        const resource = this.resources.get(url)
        if (resource) {
          resource.status = 'loaded'
          resource.loadTime = performance.now()
        }
        resolve(link)
      }

      link.onerror = () => {
        const resource = this.resources.get(url)
        const error = new Error(`Failed to load stylesheet: ${url}`)
        if (resource) {
          resource.status = 'error'
          resource.error = error
        }
        reject(error)
      }

      this.add(url, 'style', priority)
      document.head.appendChild(link)
    })
  }

  /**
   * 预加载字体
   */
  async preloadFont(url: string, priority: ResourcePriority = 'medium'): Promise<FontFace> {
    if (this.config.cacheEnabled && this.cache.has(url)) {
      return this.cache.get(url) as FontFace
    }

    try {
      const fontFace = new FontFace('preloaded-font', `url(${url})`)
      await fontFace.load()

      if (document.fonts) {
        document.fonts.add(fontFace)
      }

      if (this.config.cacheEnabled) {
        this.cache.set(url, fontFace)
      }

      const resource = this.resources.get(url)
      if (resource) {
        resource.status = 'loaded'
        resource.loadTime = performance.now()
      }

      return fontFace
    } catch (error) {
      const resource = this.resources.get(url)
      if (resource) {
        resource.status = 'error'
        resource.error = error as Error
      }
      throw error
    }
  }

  /**
   * 通过fetch预加载数据
   */
  async preloadData<T = unknown>(
    url: string,
    priority: ResourcePriority = 'medium'
  ): Promise<T> {
    if (this.config.cacheEnabled && this.cache.has(url)) {
      return this.cache.get(url) as T
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (this.config.cacheEnabled) {
        this.cache.set(url, data)
      }

      const resource = this.resources.get(url)
      if (resource) {
        resource.status = 'loaded'
        resource.loadTime = performance.now()
      }

      return data
    } catch (error) {
      const resource = this.resources.get(url)
      if (resource) {
        resource.status = 'error'
        resource.error = error as Error
      }
      throw error
    }
  }

  /**
   * 使用link rel=preload预加载
   */
  preloadWithLink(url: string, type: ResourceType, priority: ResourcePriority = 'medium'): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = type

    const resource = this.resources.get(url)
    if (resource?.crossOrigin) {
      link.crossOrigin = resource.crossOrigin
    }
    if (resource?.integrity) {
      link.integrity = resource.integrity
    }

    document.head.appendChild(link)
    this.add(url, type, priority)
  }

  /**
   * 预取资源（低优先级）
   */
  prefetch(url: string, type: ResourceType): void {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = type

    document.head.appendChild(link)
    this.add(url, type, 'low')
  }

  /**
   * DNS预解析
   */
  dnsPrefetch(domain: string): void {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  }

  /**
   * 预连接
   */
  preconnect(url: string, crossOrigin?: boolean): void {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = url

    if (crossOrigin) {
      link.crossOrigin = 'anonymous'
    }

    document.head.appendChild(link)
  }

  /**
   * 获取资源状态
   */
  getStatus(url: string): ResourceStatus | undefined {
    return this.resources.get(url)?.status
  }

  /**
   * 获取所有资源
   */
  getAll(): ResourceItem[] {
    return Array.from(this.resources.values())
  }

  /**
   * 获取加载统计
   */
  getStats(): {
    total: number
    loaded: number
    loading: number
    pending: number
    error: number
    cached: number
    averageLoadTime: number
  } {
    const resources = Array.from(this.resources.values())
    const loadTimes = resources
      .filter(r => r.loadTime)
      .map(r => r.loadTime!)

    return {
      total: resources.length,
      loaded: resources.filter(r => r.status === 'loaded').length,
      loading: resources.filter(r => r.status === 'loading').length,
      pending: resources.filter(r => r.status === 'pending').length,
      error: resources.filter(r => r.status === 'error').length,
      cached: resources.filter(r => r.status === 'cached').length,
      averageLoadTime: loadTimes.length > 0
        ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
        : 0,
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 清除指定资源
   */
  clear(url: string): void {
    this.resources.delete(url)
    this.cache.delete(url)
  }

  /**
   * 清除所有资源
   */
  clearAll(): void {
    this.resources.clear()
    this.cache.clear()
    this.loadingQueue = []
  }

  /**
   * 排序队列（按优先级）
   */
  private sortQueue(): void {
    const priorityMap: Record<ResourcePriority, number> = {
      high: 3,
      medium: 2,
      low: 1,
    }

    this.loadingQueue.sort((a, b) => {
      return priorityMap[b.priority] - priorityMap[a.priority]
    })
  }

  /**
   * 处理加载队列
   */
  private async processQueue(): Promise<void> {
    while (
      this.loadingQueue.length > 0 &&
      this.loadingCount < this.config.maxConcurrent
    ) {
      const resource = this.loadingQueue.shift()
      if (!resource) break

      this.loadingCount++
      resource.status = 'loading'

      try {
        await this.loadResource(resource)
      } catch (error) {
        this.logger.error(`Failed to load resource: ${resource.url}`, error)
      } finally {
        this.loadingCount--
        this.processQueue() // 继续处理队列
      }
    }
  }

  /**
   * 加载单个资源
   */
  private async loadResource(resource: ResourceItem): Promise<void> {
    switch (resource.type) {
      case 'image':
        await this.preloadImage(resource.url, resource.priority)
        break
      case 'script':
        await this.preloadScript(resource.url, resource.priority)
        break
      case 'style':
        await this.preloadStyle(resource.url, resource.priority)
        break
      case 'font':
        await this.preloadFont(resource.url, resource.priority)
        break
      case 'fetch':
        await this.preloadData(resource.url, resource.priority)
        break
      default:
        this.preloadWithLink(resource.url, resource.type, resource.priority)
    }
  }
}

/**
 * 全局资源预加载器实例
 */
let globalPreloader: ResourcePreloader | null = null

/**
 * 获取全局资源预加载器
 */
export function getGlobalPreloader(): ResourcePreloader {
  if (!globalPreloader) {
    globalPreloader = new ResourcePreloader()
  }
  return globalPreloader
}

/**
 * 设置全局资源预加载器
 */
export function setGlobalPreloader(preloader: ResourcePreloader): void {
  globalPreloader = preloader
}

/**
 * 快捷预加载函数
 */
export const preload = {
  image: (url: string, priority?: ResourcePriority) =>
    getGlobalPreloader().preloadImage(url, priority),
  script: (url: string, priority?: ResourcePriority) =>
    getGlobalPreloader().preloadScript(url, priority),
  style: (url: string, priority?: ResourcePriority) =>
    getGlobalPreloader().preloadStyle(url, priority),
  font: (url: string, priority?: ResourcePriority) =>
    getGlobalPreloader().preloadFont(url, priority),
  data: <T = unknown>(url: string, priority?: ResourcePriority) =>
    getGlobalPreloader().preloadData<T>(url, priority),
  dns: (domain: string) =>
    getGlobalPreloader().dnsPrefetch(domain),
  connect: (url: string, crossOrigin?: boolean) =>
    getGlobalPreloader().preconnect(url, crossOrigin),
}
