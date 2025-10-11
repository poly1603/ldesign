/**
 * 智能缓存系统
 * 使用 IndexedDB 提供持久化存储和智能缓存策略
 */

// Type imports for future use

/**
 * 缓存策略类型
 */
export type CacheStrategy =
  | 'lru' // 最近最少使用
  | 'lfu' // 最不经常使用
  | 'fifo' // 先进先出
  | 'ttl' // 基于时间
  | 'adaptive' // 自适应策略

/**
 * 缓存项元数据
 */
export interface CacheMetadata {
  key: string
  size: number
  hits: number
  misses: number
  lastAccess: number
  createdAt: number
  expiresAt?: number
  priority: number
  tags?: string[]
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
  itemCount: number
  evictions: number
  avgAccessTime: number
}

/**
 * 智能缓存配置
 */
export interface SmartCacheConfig {
  dbName?: string
  storeName?: string
  maxSize?: number // 最大缓存大小（字节）
  maxItems?: number // 最大缓存项数
  defaultTTL?: number // 默认 TTL（毫秒）
  strategy?: CacheStrategy
  compression?: boolean // 是否压缩
  encryption?: boolean // 是否加密
  autoCleanup?: boolean // 自动清理
  cleanupInterval?: number // 清理间隔（毫秒）
}

/**
 * IndexedDB 包装器
 */
class IndexedDBWrapper {
  private db: IDBDatabase | null = null
  private readonly dbName: string
  private readonly storeName: string
  private readonly version = 1

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName
    this.storeName = storeName
  }

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })

          // 创建索引
          store.createIndex('lastAccess', 'lastAccess', { unique: false })
          store.createIndex('expiresAt', 'expiresAt', { unique: false })
          store.createIndex('priority', 'priority', { unique: false })
          store.createIndex('size', 'size', { unique: false })
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }

        // 创建元数据存储
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * 获取事务
   */
  private getTransaction(mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db.transaction([this.storeName, 'metadata'], mode)
  }

  /**
   * 获取对象存储
   */
  private getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    return this.getTransaction(mode).objectStore(this.storeName)
  }

  /**
   * 设置缓存项
   */
  async set(key: string, value: any, metadata: Partial<CacheMetadata> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction('readwrite')
      const store = transaction.objectStore(this.storeName)

      const item = {
        key,
        value,
        ...metadata,
        lastAccess: Date.now(),
        createdAt: metadata.createdAt || Date.now(),
        hits: metadata.hits || 0,
        misses: metadata.misses || 0,
        size: metadata.size || JSON.stringify(value).length,
        priority: metadata.priority || 0,
      }

      const request = store.put(item)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取缓存项
   */
  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction('readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.get(key)
      request.onsuccess = () => {
        const item = request.result
        if (item) {
          // 更新访问信息
          item.lastAccess = Date.now()
          item.hits++
          store.put(item)
          resolve(item.value)
        }
        else {
          resolve(undefined)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 删除缓存项
   */
  async delete(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite')
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite')
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取所有键
   */
  async keys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore()
      const request = store.getAllKeys()
      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取缓存大小
   */
  async size(): Promise<number> {
    return new Promise((resolve, reject) => {
      const store = this.getStore()
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 关闭数据库
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

/**
 * 智能缓存系统
 */
export class SmartCache {
  private db: IndexedDBWrapper
  private config: Required<SmartCacheConfig>
  private stats: CacheStats
  private cleanupTimer?: NodeJS.Timeout
  private memoryCache: Map<string, any> = new Map()
  private accessQueue: string[] = []
  private frequencyMap: Map<string, number> = new Map()

  constructor(config: SmartCacheConfig = {}) {
    this.config = {
      dbName: config.dbName || 'ldesign-smart-cache',
      storeName: config.storeName || 'cache',
      maxSize: config.maxSize || 50 * 1024 * 1024, // 50MB
      maxItems: config.maxItems || 10000,
      defaultTTL: config.defaultTTL || 24 * 60 * 60 * 1000, // 24 hours
      strategy: config.strategy || 'adaptive',
      compression: config.compression || false,
      encryption: config.encryption || false,
      autoCleanup: config.autoCleanup !== false,
      cleanupInterval: config.cleanupInterval || 60 * 60 * 1000, // 1 hour
    }

    this.db = new IndexedDBWrapper(this.config.dbName, this.config.storeName)

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      itemCount: 0,
      evictions: 0,
      avgAccessTime: 0,
    }
  }

  /**
   * 初始化缓存
   */
  async init(): Promise<void> {
    await this.db.init()

    // 加载统计信息
    await this.loadStats()

    // 启动自动清理
    if (this.config.autoCleanup) {
      this.startAutoCleanup()
    }

    // 预热缓存
    await this.warmup()
  }

  /**
   * 设置缓存项
   */
  async set<T>(
    key: string,
    value: T,
    options: {
      ttl?: number
      priority?: number
      tags?: string[]
    } = {},
  ): Promise<void> {
    const startTime = Date.now()

    try {
      // 检查缓存大小限制
      await this.ensureSpace()

      // 准备数据
      let data = value
      if (this.config.compression) {
        data = await this.compress(value)
      }
      if (this.config.encryption) {
        data = await this.encrypt(data)
      }

      // 计算过期时间
      const ttl = options.ttl || this.config.defaultTTL
      const expiresAt = ttl > 0 ? Date.now() + ttl : undefined

      // 存储到 IndexedDB
      await this.db.set(key, data, {
        expiresAt,
        priority: options.priority || 0,
        tags: options.tags,
        size: JSON.stringify(data).length,
      })

      // 更新内存缓存
      if (this.config.strategy === 'adaptive') {
        this.memoryCache.set(key, value)
        if (this.memoryCache.size > 100) {
          // 限制内存缓存大小
          const firstKey = this.memoryCache.keys().next().value
          if (firstKey !== undefined) {
            this.memoryCache.delete(firstKey)
          }
        }
      }

      // 更新统计
      this.stats.itemCount++
      this.stats.size += JSON.stringify(data).length
    }
    finally {
      this.updateAvgAccessTime(Date.now() - startTime)
    }
  }

  /**
   * 获取缓存项
   */
  async get<T>(key: string): Promise<T | undefined> {
    const startTime = Date.now()

    try {
      // 先检查内存缓存
      if (this.memoryCache.has(key)) {
        this.stats.hits++
        this.updateHitRate()
        return this.memoryCache.get(key)
      }

      // 从 IndexedDB 获取
      let data = await this.db.get(key)

      if (data === undefined) {
        this.stats.misses++
        this.updateHitRate()
        return undefined
      }

      // 解密和解压
      if (this.config.encryption) {
        data = await this.decrypt(data)
      }
      if (this.config.compression) {
        data = await this.decompress(data)
      }

      // 更新访问记录
      this.updateAccessRecord(key)

      // 更新统计
      this.stats.hits++
      this.updateHitRate()

      // 更新内存缓存
      if (this.config.strategy === 'adaptive') {
        this.memoryCache.set(key, data)
      }

      return data
    }
    finally {
      this.updateAvgAccessTime(Date.now() - startTime)
    }
  }

  /**
   * 删除缓存项
   */
  async delete(key: string): Promise<void> {
    await this.db.delete(key)
    this.memoryCache.delete(key)
    this.stats.itemCount--
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    await this.db.clear()
    this.memoryCache.clear()
    this.accessQueue = []
    this.frequencyMap.clear()
    this.stats.itemCount = 0
    this.stats.size = 0
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 预热缓存
   */
  private async warmup(): Promise<void> {
    // 预加载高优先级缓存项
    const keys = await this.db.keys()
    const highPriorityKeys = keys.slice(0, 10) // 简化实现

    for (const key of highPriorityKeys) {
      const value = await this.db.get(key)
      if (value && this.config.strategy === 'adaptive') {
        this.memoryCache.set(key, value)
      }
    }
  }

  /**
   * 确保有足够的空间
   */
  private async ensureSpace(): Promise<void> {
    const currentSize = await this.db.size()

    if (currentSize >= this.config.maxItems) {
      // 根据策略驱逐缓存项
      await this.evict()
    }
  }

  /**
   * 驱逐缓存项
   */
  private async evict(): Promise<void> {
    const strategy = this.config.strategy
    const keys = await this.db.keys()

    let keyToEvict: string | undefined

    switch (strategy) {
      case 'lru':
        // 驱逐最近最少使用的
        keyToEvict = this.accessQueue[0]
        break

      case 'lfu':
        // 驱逐最不经常使用的
        let minFreq = Infinity
        for (const [key, freq] of this.frequencyMap) {
          if (freq < minFreq) {
            minFreq = freq
            keyToEvict = key
          }
        }
        break

      case 'fifo':
        // 驱逐最早的
        keyToEvict = keys[0]
        break

      case 'ttl':
        // 驱逐过期的
        // 这里需要查询过期的项
        break

      case 'adaptive':
        // 自适应策略：结合 LRU 和 LFU
        const score = (key: string): number => {
          const freq = this.frequencyMap.get(key) || 0
          const recency = this.accessQueue.indexOf(key)
          return freq * 0.7 + (1 / (recency + 1)) * 0.3
        }

        let minScore = Infinity
        for (const key of keys) {
          const s = score(key)
          if (s < minScore) {
            minScore = s
            keyToEvict = key
          }
        }
        break
    }

    if (keyToEvict) {
      await this.delete(keyToEvict)
      this.stats.evictions++
    }
  }

  /**
   * 更新访问记录
   */
  private updateAccessRecord(key: string): void {
    // 更新 LRU 队列
    const index = this.accessQueue.indexOf(key)
    if (index > -1) {
      this.accessQueue.splice(index, 1)
    }
    this.accessQueue.push(key)

    // 更新频率映射
    this.frequencyMap.set(key, (this.frequencyMap.get(key) || 0) + 1)
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 更新平均访问时间
   */
  private updateAvgAccessTime(time: number): void {
    const alpha = 0.1 // 指数加权移动平均系数
    this.stats.avgAccessTime = this.stats.avgAccessTime * (1 - alpha) + time * alpha
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * 清理过期缓存
   */
  private async cleanup(): Promise<void> {
    const keys = await this.db.keys()
    const now = Date.now()

    for (const key of keys) {
      const item = await this.db.get(key)
      if (item && item.expiresAt && item.expiresAt < now) {
        await this.delete(key)
      }
    }
  }

  /**
   * 压缩数据
   */
  private async compress(data: any): Promise<any> {
    // 简化实现：使用 JSON 字符串压缩
    // 实际应用中可以使用 pako 或其他压缩库
    return JSON.stringify(data)
  }

  /**
   * 解压数据
   */
  private async decompress(data: any): Promise<any> {
    // 简化实现
    return typeof data === 'string' ? JSON.parse(data) : data
  }

  /**
   * 加密数据
   */
  private async encrypt(data: any): Promise<any> {
    // 简化实现：使用 base64
    // 实际应用中应使用 Web Crypto API
    return btoa(JSON.stringify(data))
  }

  /**
   * 解密数据
   */
  private async decrypt(data: any): Promise<any> {
    // 简化实现
    return JSON.parse(atob(data))
  }

  /**
   * 加载统计信息
   */
  private async loadStats(): Promise<void> {
    // 从 IndexedDB 加载持久化的统计信息
    // 简化实现
    this.stats.itemCount = await this.db.size()
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.db.close()
    this.memoryCache.clear()
  }
}

/**
 * 创建颜色缓存
 */
export function createColorCache(): SmartCache {
  return new SmartCache({
    dbName: 'ldesign-color-cache',
    storeName: 'colors',
    maxSize: 10 * 1024 * 1024, // 10MB
    strategy: 'adaptive',
    compression: true,
    autoCleanup: true,
  })
}

/**
 * 创建主题缓存
 */
export function createThemeCache(): SmartCache {
  return new SmartCache({
    dbName: 'ldesign-theme-cache',
    storeName: 'themes',
    maxSize: 20 * 1024 * 1024, // 20MB
    strategy: 'lru',
    defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

/**
 * 缓存装饰器
 */
export function cached(
  options: {
    key?: string | ((args: any[]) => string)
    ttl?: number
    cache?: SmartCache
  } = {},
) {
  const cache = options.cache || new SmartCache()

  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey
        = typeof options.key === 'function'
          ? options.key(args)
          : options.key || `${propertyKey}:${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cached = await cache.get(cacheKey)
      if (cached !== undefined) {
        return cached
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 存入缓存
      await cache.set(cacheKey, result, { ttl: options.ttl })

      return result
    }

    return descriptor
  }
}

/**
 * 缓存预热策略
 * 
 * 提供智能的缓存预热功能，提高首屏加载性能
 * 
 * @example
 * ```ts
 * const warmup = new CacheWarmup(smartCache)
 * 
 * // 预热高频访问项
 * await warmup.warmupHotItems(20)
 * 
 * // 预测性预热
 * await warmup.predictiveWarmup('/dashboard')
 * ```
 */
export class CacheWarmup {
  private accessStats: Map<string, { count: number, lastAccess: number }> = new Map()
  
  constructor(private cache: SmartCache) {}
  
  /**
   * 预热高频访问项
   * @param limit 预热数量限制
   */
  async warmupHotItems(limit: number = 20): Promise<number> {
    try {
      // 获取所有键
      const keys = await this.cache['db'].keys()
      
      // 按访问频率排序
      const sorted = Array.from(this.accessStats.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit)
        .map(([key]) => key)
        .filter(key => keys.includes(key))
      
      // 预加载到内存
      let warmed = 0
      for (const key of sorted) {
        const value = await this.cache.get(key)
        if (value !== undefined) {
          warmed++
        }
      }
      
      return warmed
    } catch (error) {
      console.error('Cache warmup failed:', error)
      return 0
    }
  }
  
  /**
   * 预测性预热
   * @param currentRoute 当前路由
   */
  async predictiveWarmup(currentRoute: string): Promise<void> {
    const predictions = this.predictNextAccess(currentRoute)
    
    // 使用低优先级在空闲时预热
    for (const key of predictions) {
      // 延迟执行，不阻塞主线程
      setTimeout(async () => {
        await this.cache.get(key)
      }, 100)
    }
  }
  
  /**
   * 预测下一次访问的键
   */
  private predictNextAccess(currentRoute: string): string[] {
    // 简化的预测逻辑，基于路由关系
    const predictions: string[] = []
    
    // 根据路由预测可能需要的主题
    if (currentRoute.includes('dashboard')) {
      predictions.push('theme:default', 'theme:light')
    } else if (currentRoute.includes('settings')) {
      predictions.push('theme:user-preference', 'theme:custom')
    }
    
    return predictions
  }
  
  /**
   * 记录访问统计
   */
  recordAccess(key: string): void {
    const stats = this.accessStats.get(key) || { count: 0, lastAccess: 0 }
    stats.count++
    stats.lastAccess = Date.now()
    this.accessStats.set(key, stats)
  }
  
  /**
   * 获取访问统计
   */
  getAccessStats(): Array<{ key: string, count: number, lastAccess: number }> {
    return Array.from(this.accessStats.entries()).map(([key, stats]) => ({
      key,
      ...stats,
    }))
  }
}

/**
 * 缓存分析器
 * 
 * 分析缓存效率并提供优化建议
 * 
 * @example
 * ```ts
 * const analyzer = new CacheAnalyzer()
 * const analysis = analyzer.analyzeCacheEfficiency(stats)
 * 
 * console.log(analysis.efficiency) // 'excellent' | 'good' | 'fair' | 'poor'
 * console.log(analysis.recommendations)
 * ```
 */
export class CacheAnalyzer {
  /**
   * 分析缓存效率
   */
  analyzeCacheEfficiency(stats: CacheStats): {
    efficiency: 'excellent' | 'good' | 'fair' | 'poor'
    recommendations: string[]
    score: number
  } {
    const recommendations: string[] = []
    let score = 100
    
    // 命中率分析
    if (stats.hitRate < 0.5) {
      recommendations.push('命中率过低（<50%），考虑增加缓存大小或调整 TTL')
      score -= 30
    } else if (stats.hitRate < 0.7) {
      recommendations.push('命中率较低（<70%），建议优化缓存策略')
      score -= 15
    } else if (stats.hitRate < 0.85) {
      recommendations.push('命中率良好，可考虑预热策略进一步提升')
      score -= 5
    }
    
    // 淘汰率分析
    const evictionRate = stats.itemCount > 0 ? stats.evictions / stats.itemCount : 0
    if (evictionRate > 0.3) {
      recommendations.push(`淘汰率过高（${(evictionRate * 100).toFixed(1)}%），建议增加缓存容量`)
      score -= 20
    } else if (evictionRate > 0.15) {
      recommendations.push(`淘汰率较高（${(evictionRate * 100).toFixed(1)}%），可考虑适当扩大缓存`)
      score -= 10
    }
    
    // 平均访问时间分析
    if (stats.avgAccessTime > 100) {
      recommendations.push(`访问时间过长（${stats.avgAccessTime.toFixed(1)}ms），考虑优化数据结构或启用压缩`)
      score -= 15
    } else if (stats.avgAccessTime > 50) {
      recommendations.push(`访问时间较长（${stats.avgAccessTime.toFixed(1)}ms），可优化查询性能`)
      score -= 8
    }
    
    // 缓存大小分析
    const sizeMB = stats.size / 1024 / 1024
    if (sizeMB > 50) {
      recommendations.push(`缓存占用过大（${sizeMB.toFixed(1)}MB），考虑启用压缩或减小 TTL`)
      score -= 10
    }
    
    // 如果没有问题，提供积极建议
    if (recommendations.length === 0) {
      recommendations.push('缓存运行良好，继续保持！')
      if (stats.hitRate > 0.9) {
        recommendations.push('命中率优秀，可考虑分享缓存配置经验')
      }
    }
    
    // 确定效率等级
    let efficiency: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) {
      efficiency = 'excellent'
    } else if (score >= 75) {
      efficiency = 'good'
    } else if (score >= 60) {
      efficiency = 'fair'
    } else {
      efficiency = 'poor'
    }
    
    return { efficiency, recommendations, score }
  }
  
  /**
   * 生成缓存报告
   */
  generateReport(stats: CacheStats): string {
    const analysis = this.analyzeCacheEfficiency(stats)
    
    const lines = [
      '\n=================================',
      '      缓存效率报告',
      '=================================',
      '',
      `效率等级: ${this.getEfficiencyEmoji(analysis.efficiency)} ${analysis.efficiency.toUpperCase()}`,
      `综合评分: ${analysis.score}/100`,
      '',
      '基础指标:',
      `  命中率: ${(stats.hitRate * 100).toFixed(2)}%`,
      `  命中次数: ${stats.hits}`,
      `  未命中: ${stats.misses}`,
      `  淘汰次数: ${stats.evictions}`,
      `  平均访问时间: ${stats.avgAccessTime.toFixed(2)}ms`,
      `  当前大小: ${(stats.size / 1024 / 1024).toFixed(2)}MB`,
      `  条目数量: ${stats.itemCount}`,
      '',
      '优化建议:',
      ...analysis.recommendations.map((r, i) => `  ${i + 1}. ${r}`),
      '',
      '=================================',
    ]
    
    return lines.join('\n')
  }
  
  /**
   * 获取效率等级表情
   */
  private getEfficiencyEmoji(efficiency: string): string {
    switch (efficiency) {
      case 'excellent': return '⭐'
      case 'good': return '✅'
      case 'fair': return '⚠️'
      case 'poor': return '❌'
      default: return '❓'
    }
  }
}
