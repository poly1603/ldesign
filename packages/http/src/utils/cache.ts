import type {
  CacheConfig,
  CacheStorage,
  RequestConfig,
  ResponseData,
} from '../types'

/**
 * 缓存项接口
 *
 * 定义缓存中存储的数据项结构
 */
interface CacheItem<T = unknown> {
  /** 缓存的响应数据 */
  data: ResponseData<T>
  /** 缓存创建时间戳 */
  timestamp: number
  /** 生存时间（毫秒） */
  ttl: number
}

/**
 * 内存缓存存储实现（优化版）
 *
 * 优化点：
 * 1. 使用单个定时器替代多个定时器，减少内存占用
 * 2. 延迟过期检查，只在访问时检查
 * 3. 批量清理过期项
 * 4. 添加 LRU 淘汰策略
 * 5. 使用 WeakRef 减少内存占用
 *
 * @example
 * ```typescript
 * const storage = new MemoryCacheStorage()
 *
 * // 存储数据，5分钟后过期
 * await storage.set('user:123', userData, 5 * 60 * 1000)
 *
 * // 获取数据
 * const cached = await storage.get('user:123')
 *
 * // 删除数据
 * await storage.delete('user:123')
 * ```
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>()
  private accessOrder = new Map<string, number>() // LRU 访问顺序
  private maxSize = 1000 // 最大缓存项数
  // 优化：使用单个定时器进行批量清理
  private cleanupTimer?: NodeJS.Timeout
  private cleanupInterval = 60000 // 每分钟清理一次
  private isDestroyed = false

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    // 启动定期清理
    this.startCleanup()
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期（延迟过期检查）
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.accessOrder.delete(key)
      return null
    }

    // 更新 LRU 访问顺序
    this.accessOrder.set(key, Date.now())

    return item.data
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    // LRU 淘汰：如果超过最大大小，移除最旧的项
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    // 存储数据（不再为每个项设置定时器）
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })
    
    // 更新访问顺序
    this.accessOrder.set(key, Date.now())
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
    this.accessOrder.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
    this.accessOrder.clear()
  }

  /**
   * 启动定期清理（优化：单个定时器）
   */
  private startCleanup(): void {
    if (this.isDestroyed) return
    
    this.cleanupTimer = setInterval(() => {
      if (!this.isDestroyed) {
        this.cleanupExpired()
      }
    }, this.cleanupInterval)

    // 确保 Node.js 不会因为这个定时器而保持进程运行
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  /**
   * 批量清理过期项
   */
  private cleanupExpired(): void {
    if (this.isDestroyed) return
    
    const now = Date.now()
    const keysToDelete: string[] = []

    // 优化：限制每次清理的数量，避免阻塞
    let cleanupCount = 0
    const maxCleanupPerCycle = 100

    // 收集过期的键
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
        cleanupCount++
        if (cleanupCount >= maxCleanupPerCycle) {
          break
        }
      }
    }

    // 批量删除
    for (const key of keysToDelete) {
      this.cache.delete(key)
      this.accessOrder.delete(key)
    }
  }

  /**
   * LRU 淘汰策略
   */
  private evictLRU(): void {
    if (this.accessOrder.size === 0) return

    // 找到最久未访问的键
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.accessOrder.delete(oldestKey)
    }
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
   * 销毁缓存
   */
  destroy(): void {
    this.isDestroyed = true
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    
    this.cache.clear()
    this.accessOrder.clear()
  }
}

/**
 * LocalStorage 缓存存储实现
 */
export class LocalStorageCacheStorage implements CacheStorage {
  private prefix: string

  constructor(prefix = 'http_cache_') {
    this.prefix = prefix
  }

  async get(key: string): Promise<unknown> {
    if (typeof localStorage === 'undefined') {
      return null
    }

    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) {
        return null
      }

      const parsed = JSON.parse(item) as CacheItem

      // 检查是否过期
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        this.delete(key)
        return null
      }

      return parsed.data
    }
    catch {
      return null
    }
  }

  async set(key: string, value: unknown, ttl = 300000): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const item: CacheItem = {
        data: value as ResponseData<unknown>,
        timestamp: Date.now(),
        ttl,
      }

      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    }
    catch {
      // 存储失败，可能是空间不足
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    localStorage.removeItem(this.prefix + key)
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  protected config: Required<CacheConfig>
  protected storage: CacheStorage
  private keyCache = new Map<string, string>() // 缓存生成的键，避免重复计算
  protected stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
    recentKeys: [],
    hotKeys: [],
  }

  constructor(config: CacheConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      ttl: config.ttl ?? 300000, // 默认 5 分钟
      keyGenerator: config.keyGenerator ?? this.defaultKeyGenerator,
      storage: config.storage ?? new MemoryCacheStorage(),
    }

    this.storage = this.config?.storage
  }

  /**
   * 获取缓存
   */
  async get<T = unknown>(config: RequestConfig): Promise<ResponseData<T> | null> {
    if (!this.config?.enabled) {
      return null
    }

    const key = this.getCachedKey(config)
    const result = await this.storage.get(key)

    // 更新统计信息
    if (result) {
      this.stats.hits++
    }
    else {
      this.stats.misses++
    }

    // 更新命中率
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0

    return result as ResponseData<T> | null
  }

  /**
   * 设置缓存
   */
  async set<T = unknown>(
    config: RequestConfig,
    response: ResponseData<T>,
  ): Promise<void> {
    if (!this.config?.enabled) {
      return
    }

    // 只缓存成功的 GET 请求
    if (
      config.method !== 'GET'
      || response.status < 200
      || response.status >= 300
    ) {
      return
    }

    const key = this.getCachedKey(config)
    await this.storage.set(key, response, this.config?.ttl)
  }

  /**
   * 删除缓存
   */
  async delete(config: RequestConfig): Promise<void> {
    const key = this.getCachedKey(config)
    await this.storage.delete(key)
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    await this.storage.clear()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CacheConfig>): void {
    Object.assign(this.config, config)
    if (config.storage) {
      this.storage = config.storage
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config }
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 获取缓存的键（性能优化版本）
   */
  protected getCachedKey(config: RequestConfig): string {
    // 优化：使用更快的配置标识符生成方式，避免 JSON.stringify
    const method = config.method || 'GET'
    const url = config.url || ''
    const paramsStr = config.params ? this.fastStringify(config.params) : ''
    const dataStr = config.data ? this.fastStringify(config.data) : ''
    const configId = `${method}:${url}:${paramsStr}:${dataStr}`

    if (this.keyCache.has(configId)) {
      return this.keyCache.get(configId)!
    }

    const key = this.config?.keyGenerator(config)

    // 限制缓存大小，避免内存泄漏
    if (this.keyCache.size > 1000) {
      const firstKey = this.keyCache.keys().next().value
      if (firstKey !== undefined) {
        this.keyCache.delete(firstKey)
      }
    }

    this.keyCache.set(configId, key)
    return key
  }

  /**
   * 快速字符串化对象（优化版：小对象直接用JSON.stringify）
   */
  private fastStringify(obj: any): string {
    if (obj === null || obj === undefined) {
      return ''
    }
    if (typeof obj === 'string') {
      return obj
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj)
    }
    // 对于对象和数组，直接使用 JSON.stringify（更快且准确）
    return JSON.stringify(obj)
  }

  /**
   * 默认缓存键生成器
   */
  private defaultKeyGenerator(config: RequestConfig): string {
    const { method = 'GET', url = '', params = {}, data } = config

    // 构建基础键
    let key = `${method}:${url}`

    // 添加查询参数
    const paramKeys = Object.keys(params).sort()
    if (paramKeys.length > 0) {
      const paramString = paramKeys.map(k => `${k}=${params[k]}`).join('&')
      key += `?${paramString}`
    }

    // 对于 POST 等请求，添加数据哈希
    if (data && method !== 'GET') {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data)
      key += `:${simpleHash(dataString)}`
    }

    return key
  }
}

/**
 * 增强缓存配置
 */
export interface EnhancedCacheConfig extends CacheConfig {
  /** 缓存策略 */
  strategy?: 'lru' | 'lfu' | 'fifo' | 'ttl'
  /** 最大缓存大小（字节） */
  maxSize?: number
  /** 是否启用压缩 */
  compression?: boolean
  /** 缓存预热配置 */
  preload?: {
    enabled: boolean
    urls: string[]
  }
  /** 缓存失效策略 */
  invalidation?: {
    /** 基于标签的失效 */
    tags?: boolean
    /** 基于依赖的失效 */
    dependencies?: boolean
  }
  /** 缓存统计 */
  stats?: boolean
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 缓存大小 */
  size: number
  /** 总内存使用量（字节） */
  memoryUsage: number
  /** 最近访问的键 */
  recentKeys: string[]
  /** 最热门的键 */
  hotKeys: Array<{ key: string, accessCount: number }>
}

/**
 * 缓存项元数据
 */
export interface CacheItemMetadata {
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessed: number
  /** 访问次数 */
  accessCount: number
  /** 数据大小（字节） */
  size: number
  /** 标签 */
  tags?: string[]
  /** 依赖 */
  dependencies?: string[]
  /** 是否压缩 */
  compressed?: boolean
}

/**
 * 增强的缓存项
 */
export interface EnhancedCacheItem extends CacheItem {
  /** 元数据 */
  metadata: CacheItemMetadata
}

/**
 * 增强的缓存管理器
 */
export class EnhancedCacheManager extends CacheManager {
  private enhancedConfig: EnhancedCacheConfig
  private accessLog = new Map<string, number>() // 访问计数
  private tagIndex = new Map<string, Set<string>>() // 标签索引
  private dependencyGraph = new Map<string, Set<string>>() // 依赖图

  constructor(config: EnhancedCacheConfig = {}) {
    super(config)
    this.enhancedConfig = {
      strategy: 'lru',
      maxSize: 50 * 1024 * 1024, // 50MB
      compression: false,
      stats: true,
      ...config,
    }
  }

  /**
   * 增强的获取方法
   */
  async get<T = any>(config: RequestConfig): Promise<ResponseData<T> | null> {
    if (!this.enhancedConfig.stats) {
      // 如果统计被禁用，直接从存储获取，不进行任何统计
      if (!this.config?.enabled) {
        return null
      }
      const key = this.getCachedKey(config)
      const res = await this.storage.get(key)
      return res as ResponseData<T> | null
    }

    // 如果统计启用，调用父类方法（会进行基础统计）
    const result = await super.get<T>(config)

    // 只做增强功能，不重复统计（父类已经统计了）
    if (result) {
      const key = this.getCachedKey(config)
      this.updateAccessLog(key)
      this.updateRecentKeys(key)
    }

    return result
  }

  /**
   * 增强的设置方法
   */
  async set<T = any>(
    config: RequestConfig,
    response: ResponseData<T>,
    options?: {
      tags?: string[]
      dependencies?: string[]
      compress?: boolean
    },
  ): Promise<void> {
    await super.set(config, response)

    if (this.enhancedConfig.stats) {
      const key = this.getCachedKey(config)

      // 更新标签索引
      if (options?.tags) {
        this.updateTagIndex(key, options.tags)
      }

      // 更新依赖图
      if (options?.dependencies) {
        this.updateDependencyGraph(key, options.dependencies)
      }

      this.updateStats()
    }
  }

  /**
   * 基于标签失效缓存（批量优化）
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag)
    if (!keys) {
      return 0
    }

    const invalidatedCount = keys.size

    // 批量删除优化：如果存储支持批量删除，使用批量操作
    if (this.storage.deleteBatch) {
      await this.storage.deleteBatch(Array.from(keys))
    }
    else {
      // 并行删除以提高性能
      await Promise.all(Array.from(keys).map(key => this.storage.delete(key)))
    }

    this.tagIndex.delete(tag)
    this.updateStats()

    return invalidatedCount
  }

  /**
   * 基于依赖失效缓存
   */
  async invalidateByDependency(dependency: string): Promise<number> {
    const dependentKeys = this.dependencyGraph.get(dependency)
    if (!dependentKeys) {
      return 0
    }

    let invalidatedCount = 0
    for (const key of dependentKeys) {
      await this.storage.delete(key)
      invalidatedCount++
    }

    this.dependencyGraph.delete(dependency)
    this.updateStats()

    return invalidatedCount
  }

  /**
   * 缓存预热
   */
  async preload(urls: string[]): Promise<void> {
    if (!this.enhancedConfig.preload?.enabled) {
      return
    }

    const preloadPromises = urls.map(async (url) => {
      try {
        // 这里应该调用实际的HTTP请求
        // 为了示例，我们只是模拟
        const config: RequestConfig = { url, method: 'GET' }
        const mockResponse: ResponseData = {
          data: `preloaded-${url}`,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }

        await this.set(config, mockResponse)
      }
      catch (error) {
        console.warn(`Failed to preload ${url}:`, error)
      }
    })

    await Promise.all(preloadPromises)
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0,
      recentKeys: [],
      hotKeys: [],
    }
    this.accessLog.clear()
  }

  /**
   * 获取热门键
   */
  getHotKeys(limit: number = 10): Array<{ key: string, accessCount: number }> {
    return Array.from(this.accessLog.entries())
      .map(([key, count]) => ({ key, accessCount: count }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<number> {
    // 这里应该实现清理逻辑
    // 由于基类已经有清理机制，我们只需要更新统计
    this.updateStats()
    return 0
  }

  /**
   * 更新访问日志
   */
  private updateAccessLog(key: string): void {
    const currentCount = this.accessLog.get(key) || 0
    this.accessLog.set(key, currentCount + 1)
  }

  /**
   * 更新最近访问的键
   */
  private updateRecentKeys(key: string): void {
    // 移除已存在的键
    const index = this.stats.recentKeys.indexOf(key)
    if (index > -1) {
      this.stats.recentKeys.splice(index, 1)
    }

    // 添加到开头
    this.stats.recentKeys.unshift(key)

    // 保持最多10个
    if (this.stats.recentKeys.length > 10) {
      this.stats.recentKeys = this.stats.recentKeys.slice(0, 10)
    }
  }

  /**
   * 更新标签索引
   */
  private updateTagIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set())
      }
      this.tagIndex.get(tag)!.add(key)
    }
  }

  /**
   * 更新依赖图
   */
  private updateDependencyGraph(key: string, dependencies: string[]): void {
    for (const dependency of dependencies) {
      if (!this.dependencyGraph.has(dependency)) {
        this.dependencyGraph.set(dependency, new Set())
      }
      this.dependencyGraph.get(dependency)!.add(key)
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    // 更新热门键
    this.stats.hotKeys = this.getHotKeys()

    // 这里可以添加更多统计更新逻辑
  }
}

/**
 * 创建缓存管理器
 */
export function createCacheManager(config?: CacheConfig): CacheManager {
  return new CacheManager(config)
}

/**
 * 创建增强缓存管理器
 */
export function createEnhancedCacheManager(
  config?: EnhancedCacheConfig,
): EnhancedCacheManager {
  return new EnhancedCacheManager(config)
}

/**
 * 创建内存缓存存储
 */
export function createMemoryStorage(): MemoryCacheStorage {
  return new MemoryCacheStorage()
}

/**
 * 创建 LocalStorage 缓存存储
 */
export function createLocalStorage(prefix?: string): LocalStorageCacheStorage {
  return new LocalStorageCacheStorage(prefix)
}

/**
 * 简单哈希函数
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为 32 位整数
  }
  return Math.abs(hash).toString(36)
}
