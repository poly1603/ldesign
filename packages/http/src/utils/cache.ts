import type {
  CacheConfig,
  CacheStorage,
  RequestConfig,
  ResponseData,
} from '../types'

/**
 * 缓存项接口
 */
interface CacheItem<T = any> {
  data: ResponseData<T>
  timestamp: number
  ttl: number
}

/**
 * 内存缓存存储实现
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>()
  private timers = new Map<string, NodeJS.Timeout>()

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      return null
    }

    return item.data
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    // 清除旧的定时器
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 存储数据
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)

    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()

    this.timers.forEach((timer) => {
      clearTimeout(timer)
    })
    this.timers.clear()
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
}

/**
 * LocalStorage 缓存存储实现
 */
export class LocalStorageCacheStorage implements CacheStorage {
  private prefix: string

  constructor(prefix = 'http_cache_') {
    this.prefix = prefix
  }

  async get(key: string): Promise<any> {
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

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const item: CacheItem = {
        data: value,
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

    this.storage = this.config.storage
  }

  /**
   * 获取缓存
   */
  async get<T = any>(config: RequestConfig): Promise<ResponseData<T> | null> {
    if (!this.config.enabled) {
      return null
    }

    const key = this.getCachedKey(config)
    const result = await this.storage.get(key)

    // 更新统计信息
    if (result) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }

    // 更新命中率
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0

    return result
  }

  /**
   * 设置缓存
   */
  async set<T = any>(
    config: RequestConfig,
    response: ResponseData<T>,
  ): Promise<void> {
    if (!this.config.enabled) {
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
    await this.storage.set(key, response, this.config.ttl)
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
   * 获取缓存的键（带缓存优化）
   */
  protected getCachedKey(config: RequestConfig): string {
    // 创建一个简单的配置标识符用于缓存查找
    const configId = `${config.method || 'GET'}:${config.url}:${JSON.stringify(
      config.params || {},
    )}:${JSON.stringify(config.data || {})}`

    if (this.keyCache.has(configId)) {
      return this.keyCache.get(configId)!
    }

    const key = this.config.keyGenerator(config)

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
 * 高级缓存配置
 */
export interface AdvancedCacheConfig extends CacheConfig {
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
export class AdvancedCacheManager extends CacheManager {
  private advancedConfig: AdvancedCacheConfig
  private accessLog = new Map<string, number>() // 访问计数
  private tagIndex = new Map<string, Set<string>>() // 标签索引
  private dependencyGraph = new Map<string, Set<string>>() // 依赖图

  constructor(config: AdvancedCacheConfig = {}) {
    super(config)
    this.advancedConfig = {
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
    if (!this.advancedConfig.stats) {
      // 如果统计被禁用，直接从存储获取，不进行任何统计
      if (!this.config.enabled) {
        return null
      }
      const key = this.getCachedKey(config)
      return await this.storage.get(key)
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

    if (this.advancedConfig.stats) {
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
    } else {
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
    if (!this.advancedConfig.preload?.enabled) {
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
 * 创建高级缓存管理器
 */
export function createAdvancedCacheManager(config?: AdvancedCacheConfig): AdvancedCacheManager {
  return new AdvancedCacheManager(config)
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
