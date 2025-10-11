/**
 * 资源类型
 */
export type ResourceType = 'image' | 'font' | 'audio' | 'video' | 'data' | 'script' | 'style'

/**
 * 资源状态
 */
export type ResourceStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'cached'

/**
 * 资源配置
 */
export interface ResourceConfig {
  /** 资源 URL */
  url: string
  /** 资源类型 */
  type: ResourceType
  /** 资源优先级 (数字越大优先级越高) */
  priority?: number
  /** 缓存策略 */
  cache?: boolean
  /** 超时时间 (毫秒) */
  timeout?: number
  /** 重试次数 */
  retries?: number
  /** 资源元数据 */
  metadata?: Record<string, unknown>
}

/**
 * 资源项
 */
interface ResourceItem<T = unknown> {
  config: ResourceConfig
  status: ResourceStatus
  data?: T
  error?: Error
  loadTime?: number
  lastAccessTime?: number
  accessCount: number
  size?: number
}

/**
 * 加载进度信息
 */
export interface LoadProgress {
  loaded: number
  total: number
  percentage: number
  currentResource?: string
}

/**
 * 资源统计信息
 */
export interface ResourceStats {
  totalResources: number
  loadedResources: number
  cachedResources: number
  errorResources: number
  totalSize: number
  cacheHitRate: number
  averageLoadTime: number
}

/**
 * 资源管理器选项
 */
export interface ResourceManagerOptions {
  /** 最大缓存大小 (字节) */
  maxCacheSize?: number
  /** 最大并发加载数 */
  maxConcurrent?: number
  /** 默认超时时间 (毫秒) */
  defaultTimeout?: number
  /** 默认重试次数 */
  defaultRetries?: number
  /** 是否启用自动清理 */
  autoCleanup?: boolean
  /** 清理间隔 (毫秒) */
  cleanupInterval?: number
  /** 缓存过期时间 (毫秒) */
  cacheExpiry?: number
}

/**
 * 资源管理器
 * 
 * 功能：
 * - 统一管理各类资源的加载
 * - 智能缓存和内存管理
 * - 支持优先级加载
 * - 并发控制
 * - 进度跟踪
 * - 自动清理和释放
 * 
 * @example
 * ```typescript
 * const manager = ResourceManager.getInstance({
 *   maxCacheSize: 50 * 1024 * 1024, // 50MB
 *   maxConcurrent: 6,
 *   autoCleanup: true
 * })
 * 
 * // 加载单个资源
 * const image = await manager.load({
 *   url: '/images/logo.png',
 *   type: 'image',
 *   priority: 10
 * })
 * 
 * // 批量加载
 * const resources = await manager.loadBatch([
 *   { url: '/fonts/main.woff2', type: 'font' },
 *   { url: '/data/config.json', type: 'data' }
 * ])
 * 
 * // 预加载
 * manager.preload([
 *   { url: '/images/bg.jpg', type: 'image' }
 * ])
 * ```
 */
export class ResourceManager {
  private static instance: ResourceManager
  private resources: Map<string, ResourceItem> = new Map()
  private options: Required<ResourceManagerOptions>
  private cleanupTimer?: NodeJS.Timeout
  private progressCallbacks: Set<(progress: LoadProgress) => void> = new Set()

  // 统计信息
  private stats = {
    totalLoads: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalLoadTime: 0,
    totalSize: 0,
  }

  private constructor(options: ResourceManagerOptions = {}) {
    this.options = {
      maxCacheSize: options.maxCacheSize ?? 100 * 1024 * 1024, // 100MB
      maxConcurrent: options.maxConcurrent ?? 6,
      defaultTimeout: options.defaultTimeout ?? 30000,
      defaultRetries: options.defaultRetries ?? 3,
      autoCleanup: options.autoCleanup ?? true,
      cleanupInterval: options.cleanupInterval ?? 60000, // 1分钟
      cacheExpiry: options.cacheExpiry ?? 3600000, // 1小时
    }

    if (this.options.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(options?: ResourceManagerOptions): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager(options)
    }
    return ResourceManager.instance
  }

  /**
   * 加载单个资源
   */
  async load<T = unknown>(config: ResourceConfig): Promise<T> {
    const key = this.getResourceKey(config)
    const cached = this.resources.get(key)

    // 检查缓存
    if (cached && cached.status === 'loaded' && cached.data) {
      this.updateAccessInfo(key)
      this.stats.cacheHits++
      return cached.data as T
    }

    this.stats.cacheMisses++

    // 如果正在加载，等待完成
    if (cached && cached.status === 'loading') {
      return this.waitForLoad<T>(key)
    }

    // 创建资源项
    const item: ResourceItem<T> = {
      config,
      status: 'loading',
      accessCount: 0,
    }
    this.resources.set(key, item)

    try {
      const startTime = Date.now()
      const data = await this.loadResource<T>(config)
      const loadTime = Date.now() - startTime

      item.status = 'loaded'
      item.data = data
      item.loadTime = loadTime
      item.lastAccessTime = Date.now()
      item.accessCount = 1

      // 估算资源大小
      item.size = this.estimateSize(data)
      this.stats.totalSize += item.size

      // 更新统计
      this.stats.totalLoads++
      this.stats.totalLoadTime += loadTime

      // 检查缓存大小
      this.checkCacheSize()

      return data
    }
    catch (error) {
      item.status = 'error'
      item.error = error instanceof Error ? error : new Error(String(error))
      throw item.error
    }
  }

  /**
   * 批量加载资源
   */
  async loadBatch<T = unknown>(configs: ResourceConfig[]): Promise<T[]> {
    // 按优先级排序
    const sorted = [...configs].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

    return Promise.all(sorted.map(config => this.load<T>(config)))
  }

  /**
   * 预加载资源（不阻塞）
   */
  preload(configs: ResourceConfig[]): void {
    configs.forEach((config) => {
      this.load(config).catch((error) => {
        console.warn(`Failed to preload resource: ${config.url}`, error)
      })
    })
  }

  /**
   * 获取资源
   */
  get<T = unknown>(url: string): T | undefined {
    const item = this.resources.get(url)
    if (item && item.status === 'loaded') {
      this.updateAccessInfo(url)
      return item.data as T
    }
    return undefined
  }

  /**
   * 检查资源是否已加载
   */
  has(url: string): boolean {
    const item = this.resources.get(url)
    return item?.status === 'loaded'
  }

  /**
   * 释放单个资源
   */
  release(url: string): boolean {
    const item = this.resources.get(url)
    if (item) {
      if (item.size) {
        this.stats.totalSize -= item.size
      }
      this.resources.delete(url)
      return true
    }
    return false
  }

  /**
   * 按类型释放资源
   */
  releaseByType(type: ResourceType): number {
    let count = 0
    for (const [key, item] of this.resources.entries()) {
      if (item.config.type === type) {
        this.release(key)
        count++
      }
    }
    return count
  }

  /**
   * 清除所有资源
   */
  clear(): void {
    this.resources.clear()
    this.stats.totalSize = 0
  }

  /**
   * 获取资源统计信息
   */
  getStats(): ResourceStats {
    let loadedCount = 0
    let cachedCount = 0
    let errorCount = 0

    for (const item of this.resources.values()) {
      if (item.status === 'loaded')
        loadedCount++
      if (item.status === 'cached')
        cachedCount++
      if (item.status === 'error')
        errorCount++
    }

    const cacheHitRate = this.stats.totalLoads > 0
      ? this.stats.cacheHits / this.stats.totalLoads
      : 0

    const averageLoadTime = this.stats.totalLoads > 0
      ? this.stats.totalLoadTime / this.stats.totalLoads
      : 0

    return {
      totalResources: this.resources.size,
      loadedResources: loadedCount,
      cachedResources: cachedCount,
      errorResources: errorCount,
      totalSize: this.stats.totalSize,
      cacheHitRate,
      averageLoadTime,
    }
  }

  /**
   * 监听加载进度
   */
  onProgress(callback: (progress: LoadProgress) => void): () => void {
    this.progressCallbacks.add(callback)
    return () => this.progressCallbacks.delete(callback)
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
    this.progressCallbacks.clear()
  }

  // ==================== 私有方法 ====================

  /**
   * 生成资源键
   */
  private getResourceKey(config: ResourceConfig): string {
    return config.url
  }

  /**
   * 更新访问信息
   */
  private updateAccessInfo(key: string): void {
    const item = this.resources.get(key)
    if (item) {
      item.lastAccessTime = Date.now()
      item.accessCount++
    }
  }

  /**
   * 等待资源加载完成
   */
  private async waitForLoad<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const item = this.resources.get(key)
        if (!item) {
          clearInterval(checkInterval)
          reject(new Error('Resource removed during loading'))
          return
        }

        if (item.status === 'loaded' && item.data) {
          clearInterval(checkInterval)
          resolve(item.data as T)
        }
        else if (item.status === 'error') {
          clearInterval(checkInterval)
          reject(item.error)
        }
      }, 100)
    })
  }

  /**
   * 加载资源
   */
  private async loadResource<T>(config: ResourceConfig): Promise<T> {
    const timeout = config.timeout ?? this.options.defaultTimeout
    const retries = config.retries ?? this.options.defaultRetries

    let lastError: Error | undefined

    for (let i = 0; i <= retries; i++) {
      try {
        const data = await this.loadByType<T>(config, timeout)
        return data
      }
      catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (i < retries) {
          await this.delay(Math.pow(2, i) * 1000) // 指数退避
        }
      }
    }

    throw lastError || new Error('Failed to load resource')
  }

  /**
   * 根据类型加载资源
   */
  private async loadByType<T>(config: ResourceConfig, timeout: number): Promise<T> {
    switch (config.type) {
      case 'image':
        return this.loadImage(config.url, timeout) as Promise<T>
      case 'font':
        return this.loadFont(config.url) as Promise<T>
      case 'audio':
      case 'video':
        return this.loadMedia(config.url, timeout) as Promise<T>
      case 'data':
        return this.loadData(config.url, timeout) as Promise<T>
      case 'script':
        return this.loadScript(config.url, timeout) as Promise<T>
      case 'style':
        return this.loadStyle(config.url, timeout) as Promise<T>
      default:
        throw new Error(`Unsupported resource type: ${config.type}`)
    }
  }

  /**
   * 加载图片
   */
  private loadImage(url: string, timeout: number): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const timer = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`))
      }, timeout)

      img.onload = () => {
        clearTimeout(timer)
        resolve(img)
      }
      img.onerror = () => {
        clearTimeout(timer)
        reject(new Error(`Failed to load image: ${url}`))
      }
      img.src = url
    })
  }

  /**
   * 加载字体
   */
  private async loadFont(url: string): Promise<FontFace> {
    const fontFace = new FontFace('CustomFont', `url(${url})`)
    await fontFace.load()
    document.fonts.add(fontFace)
    return fontFace
  }

  /**
   * 加载媒体文件
   */
  private loadMedia(url: string, timeout: number): Promise<HTMLMediaElement> {
    return new Promise((resolve, reject) => {
      const media = document.createElement('audio')
      const timer = setTimeout(() => {
        reject(new Error(`Media load timeout: ${url}`))
      }, timeout)

      media.oncanplaythrough = () => {
        clearTimeout(timer)
        resolve(media)
      }
      media.onerror = () => {
        clearTimeout(timer)
        reject(new Error(`Failed to load media: ${url}`))
      }
      media.src = url
    })
  }

  /**
   * 加载数据
   */
  private async loadData<T>(url: string, timeout: number): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }
      return await response.text() as T
    }
    catch (error) {
      clearTimeout(timer)
      throw error
    }
  }

  /**
   * 加载脚本
   */
  private loadScript(url: string, timeout: number): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      const timer = setTimeout(() => {
        reject(new Error(`Script load timeout: ${url}`))
      }, timeout)

      script.onload = () => {
        clearTimeout(timer)
        resolve(script)
      }
      script.onerror = () => {
        clearTimeout(timer)
        reject(new Error(`Failed to load script: ${url}`))
      }
      script.src = url
      document.head.appendChild(script)
    })
  }

  /**
   * 加载样式表
   */
  private loadStyle(url: string, timeout: number): Promise<HTMLLinkElement> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      const timer = setTimeout(() => {
        reject(new Error(`Style load timeout: ${url}`))
      }, timeout)

      link.onload = () => {
        clearTimeout(timer)
        resolve(link)
      }
      link.onerror = () => {
        clearTimeout(timer)
        reject(new Error(`Failed to load style: ${url}`))
      }
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
    })
  }

  /**
   * 估算资源大小
   */
  private estimateSize(data: unknown): number {
    if (!data)
      return 0

    if (typeof data === 'string')
      return data.length * 2 // UTF-16

    if (data instanceof HTMLImageElement)
      return data.width * data.height * 4 // RGBA

    if (data instanceof Blob)
      return data.size

    // 粗略估算对象大小
    try {
      return JSON.stringify(data).length * 2
    }
    catch {
      return 1024 // 默认1KB
    }
  }

  /**
   * 检查并清理缓存
   */
  private checkCacheSize(): void {
    if (this.stats.totalSize <= this.options.maxCacheSize) {
      return
    }

    // 按访问时间和访问频率排序，移除最不常用的资源
    const items = Array.from(this.resources.entries())
      .map(([key, item]) => ({
        key,
        item,
        score: this.calculateResourceScore(item),
      }))
      .sort((a, b) => a.score - b.score)

    // 移除资源直到低于限制
    for (const { key } of items) {
      if (this.stats.totalSize <= this.options.maxCacheSize * 0.8) {
        break
      }
      this.release(key)
    }
  }

  /**
   * 计算资源评分（用于清理决策）
   */
  private calculateResourceScore(item: ResourceItem): number {
    const now = Date.now()
    const timeSinceAccess = item.lastAccessTime
      ? now - item.lastAccessTime
      : Number.POSITIVE_INFINITY

    // 综合考虑访问频率和最近访问时间
    return item.accessCount / (timeSinceAccess / 1000)
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredResources()
    }, this.options.cleanupInterval)
  }

  /**
   * 清理过期资源
   */
  private cleanupExpiredResources(): void {
    const now = Date.now()
    const expiry = this.options.cacheExpiry

    for (const [key, item] of this.resources.entries()) {
      if (
        item.lastAccessTime
        && now - item.lastAccessTime > expiry
      ) {
        this.release(key)
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
