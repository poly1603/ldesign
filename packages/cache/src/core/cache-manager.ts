import type {
  CacheOptions,
  ICacheManager,
  IStorageEngine,
  CacheMetadata,
  CacheStats,
  SetOptions,
  StorageEngine,
  CacheEvent,
  CacheEventListener,
  CacheEventType,
} from '../types'
import { StorageEngineFactory } from '../engines/factory'
import { StorageStrategy } from '../strategies/storage-strategy'
import { SecurityManager } from '../security/security-manager'
import { EventEmitter } from '../utils'

/**
 * 缓存管理器核心实现
 */
export class CacheManager implements ICacheManager {
  private engines: Map<StorageEngine, IStorageEngine> = new Map()
  private strategy: StorageStrategy
  private security: SecurityManager
  private eventEmitter: EventEmitter<CacheEvent>
  private stats: Map<StorageEngine, { hits: number; misses: number }> =
    new Map()
  private cleanupTimer?: number
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  constructor(private options: CacheOptions = {}) {
    this.strategy = new StorageStrategy(options.strategy)
    this.security = new SecurityManager(options.security)
    this.eventEmitter = new EventEmitter()

    this.initPromise = this.initializeEngines()
    this.startCleanupTimer()
  }

  /**
   * 确保已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initPromise) {
      await this.initPromise
    }
  }

  /**
   * 初始化存储引擎
   */
  private async initializeEngines(): Promise<void> {
    const engineTypes: StorageEngine[] = [
      'localStorage',
      'sessionStorage',
      'cookie',
      'indexedDB',
      'memory',
    ]

    for (const engineType of engineTypes) {
      try {
        const engine = await StorageEngineFactory.create(
          engineType,
          this.options.engines?.[engineType]
        )
        if (engine.available) {
          this.engines.set(engineType, engine)
          this.stats.set(engineType, { hits: 0, misses: 0 })
        }
      } catch (error) {
        console.warn(`Failed to initialize ${engineType} engine:`, error)
      }
    }

    this.initialized = true
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.options.cleanupInterval && this.options.cleanupInterval > 0) {
      this.cleanupTimer = window.setInterval(() => {
        this.cleanup().catch(console.error)
      }, this.options.cleanupInterval)
    }
  }

  /**
   * 选择存储引擎
   */
  private async selectEngine(
    key: string,
    value: any,
    options?: SetOptions
  ): Promise<IStorageEngine> {
    if (options?.engine) {
      const engine = this.engines.get(options.engine)
      if (!engine) {
        throw new Error(`Storage engine ${options.engine} is not available`)
      }
      return engine
    }

    if (this.options.strategy?.enabled) {
      const result = await this.strategy.selectEngine(key, value, options)

      // 发出策略选择事件
      const dataSize = new Blob([JSON.stringify(value)]).size
      const dataType = this.getDataType(value)

      this.emitStrategyEvent(key, result.engine, value, {
        reason: result.reason,
        confidence: result.confidence,
        dataSize,
        dataType,
        ttl: options?.ttl,
      })

      // 调试输出策略选择结果
      if (this.options.debug) {
        console.log(
          `[CacheManager] Strategy selected engine: ${result.engine}, reason: ${result.reason}, confidence: ${result.confidence}`
        )
      }

      const engine = this.engines.get(result.engine)
      if (engine) {
        return engine
      } else {
        console.warn(
          `[CacheManager] Strategy selected engine ${result.engine} is not available, falling back to default`
        )
      }
    }

    // 回退到默认引擎
    const defaultEngine = this.options.defaultEngine || 'localStorage'
    const engine = this.engines.get(defaultEngine)
    if (!engine) {
      throw new Error(
        `Default storage engine ${defaultEngine} is not available`
      )
    }
    return engine
  }

  /**
   * 处理键名
   */
  private async processKey(key: string): Promise<string> {
    let processedKey = key

    // 添加前缀
    if (this.options.keyPrefix) {
      processedKey = `${this.options.keyPrefix}:${processedKey}`
    }

    // 键名混淆
    if (this.options.security?.obfuscation?.enabled) {
      processedKey = await this.security.obfuscateKey(processedKey)
    }

    return processedKey
  }

  /**
   * 反处理键名
   */
  private async unprocessKey(key: string): Promise<string> {
    let originalKey = key

    // 键名反混淆
    if (this.options.security?.obfuscation?.enabled) {
      originalKey = await this.security.deobfuscateKey(originalKey)
    }

    // 移除前缀
    if (this.options.keyPrefix) {
      const prefix = `${this.options.keyPrefix}:`
      if (originalKey.startsWith(prefix)) {
        originalKey = originalKey.slice(prefix.length)
      }
    }

    return originalKey
  }

  /**
   * 序列化数据
   */
  private async serializeValue(
    value: any,
    options?: SetOptions
  ): Promise<string> {
    let serialized = JSON.stringify(value)

    // 加密
    if (options?.encrypt || this.options.security?.encryption?.enabled) {
      serialized = await this.security.encrypt(serialized)
    }

    return serialized
  }

  /**
   * 反序列化数据
   */
  private async deserializeValue<T>(
    data: string,
    encrypted: boolean
  ): Promise<T> {
    let deserialized = data

    // 解密
    if (encrypted) {
      deserialized = await this.security.decrypt(deserialized)
    }

    return JSON.parse(deserialized)
  }

  /**
   * 创建元数据
   */
  private createMetadata(
    value: any,
    engine: StorageEngine,
    options?: SetOptions
  ): CacheMetadata {
    const now = Date.now()
    const serialized = JSON.stringify(value)

    return {
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: options?.ttl ? now + options.ttl : undefined,
      dataType: this.getDataType(value),
      size: new Blob([serialized]).size,
      accessCount: 0,
      engine,
      encrypted:
        options?.encrypt || this.options.security?.encryption?.enabled || false,
    }
  }

  /**
   * 获取数据类型
   */
  private getDataType(value: any): import('../types').DataType {
    if (value === null || value === undefined) return 'string'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return 'array'
    if (value instanceof ArrayBuffer || value instanceof Uint8Array)
      return 'binary'
    return 'object'
  }

  /**
   * 触发事件
   */
  private emitEvent<T>(
    type: CacheEventType,
    key: string,
    engine: StorageEngine,
    value?: T,
    error?: Error
  ): void {
    const event: CacheEvent<T> = {
      type,
      key,
      value,
      engine,
      timestamp: Date.now(),
      error,
    }

    this.eventEmitter.emit(type, event)

    if (this.options.debug) {
      console.log(`[CacheManager] ${type}:`, event)
    }
  }

  /**
   * 发出策略选择事件
   */
  private emitStrategyEvent<T = any>(
    key: string,
    engine: StorageEngine,
    value: T,
    strategyInfo: {
      reason: string
      confidence: number
      dataSize: number
      dataType: string
      ttl?: number
    }
  ): void {
    const event: CacheEvent<T> = {
      type: 'strategy',
      key,
      value,
      engine,
      timestamp: Date.now(),
      strategy: strategyInfo,
    }

    this.eventEmitter.emit('strategy', event)

    if (this.options.debug) {
      console.log(`[CacheManager] strategy:`, event)
    }
  }

  /**
   * 设置缓存项
   */
  async set<T = any>(
    key: string,
    value: T,
    options?: SetOptions
  ): Promise<void> {
    await this.ensureInitialized()

    try {
      const engine = await this.selectEngine(key, value, options)
      const processedKey = await this.processKey(key)
      const serializedValue = await this.serializeValue(value, options)

      // 创建缓存项
      const metadata = this.createMetadata(value, engine.name, options)

      // 存储缓存项（包含元数据）
      const itemData = JSON.stringify({
        value: serializedValue,
        metadata,
      })

      await engine.setItem(processedKey, itemData, options?.ttl)

      this.emitEvent('set', key, engine.name, value)
    } catch (error) {
      this.emitEvent('error', key, 'memory', value, error as Error)
      throw error
    }
  }

  /**
   * 获取缓存项
   */
  async get<T = any>(key: string): Promise<T | null> {
    await this.ensureInitialized()

    const processedKey = await this.processKey(key)

    // 尝试从所有可用引擎中查找
    for (const [engineType, engine] of this.engines) {
      try {
        const itemData = await engine.getItem(processedKey)
        if (itemData) {
          const { value, metadata } = JSON.parse(itemData)

          // 检查是否过期
          if (metadata.expiresAt && Date.now() > metadata.expiresAt) {
            await engine.removeItem(processedKey)
            this.emitEvent('expired', key, engineType)
            continue
          }

          // 更新访问统计
          metadata.lastAccessedAt = Date.now()
          metadata.accessCount++

          const stats = this.stats.get(engineType)!
          stats.hits++

          // 反序列化值
          const deserializedValue = await this.deserializeValue<T>(
            value,
            metadata.encrypted
          )

          this.emitEvent('get', key, engineType, deserializedValue)
          return deserializedValue
        }
      } catch (error) {
        console.warn(`Error getting from ${engineType}:`, error)
      }
    }

    // 未找到，更新未命中统计
    for (const [engineType] of this.engines) {
      const stats = this.stats.get(engineType)!
      stats.misses++
    }

    return null
  }

  /**
   * 删除缓存项
   */
  async remove(key: string): Promise<void> {
    await this.ensureInitialized()

    const processedKey = await this.processKey(key)

    for (const [engineType, engine] of this.engines) {
      try {
        await engine.removeItem(processedKey)
        this.emitEvent('remove', key, engineType)
      } catch (error) {
        console.warn(`Error removing from ${engineType}:`, error)
      }
    }
  }

  /**
   * 清空缓存
   */
  async clear(engine?: StorageEngine): Promise<void> {
    if (engine) {
      const storageEngine = this.engines.get(engine)
      if (storageEngine) {
        await storageEngine.clear()
        this.emitEvent('clear', '*', engine)
      }
    } else {
      for (const [engineType, storageEngine] of this.engines) {
        try {
          await storageEngine.clear()
          this.emitEvent('clear', '*', engineType)
        } catch (error) {
          console.warn(`Error clearing ${engineType}:`, error)
        }
      }
    }
  }

  /**
   * 检查键是否存在
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  /**
   * 获取所有键名
   */
  async keys(engine?: StorageEngine): Promise<string[]> {
    const allKeys: string[] = []

    const engines = engine
      ? [this.engines.get(engine)!]
      : Array.from(this.engines.values())

    for (const storageEngine of engines) {
      if (storageEngine) {
        try {
          const engineKeys = await storageEngine.keys()
          const processedKeys = await Promise.all(
            engineKeys.map(k => this.unprocessKey(k))
          )
          allKeys.push(...processedKeys)
        } catch (error) {
          console.warn(`Error getting keys from ${storageEngine.name}:`, error)
        }
      }
    }

    return [...new Set(allKeys)]
  }

  /**
   * 获取缓存项元数据
   */
  async getMetadata(key: string): Promise<CacheMetadata | null> {
    const processedKey = await this.processKey(key)

    for (const [, engine] of this.engines) {
      try {
        const itemData = await engine.getItem(processedKey)
        if (itemData) {
          const { metadata } = JSON.parse(itemData)
          return metadata
        }
      } catch (error) {
        console.warn(`Error getting metadata from ${engine.name}:`, error)
      }
    }

    return null
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const engineStats: Record<StorageEngine, import('../types').EngineStats> =
      {} as any
    let totalItems = 0
    let totalSize = 0
    let totalHits = 0
    let totalRequests = 0
    let expiredItems = 0

    for (const [engineType, engine] of this.engines) {
      const stats = this.stats.get(engineType)!
      const itemCount = await engine.length()
      const size = engine.usedSize

      engineStats[engineType] = {
        itemCount,
        size,
        available: engine.available,
        hits: stats.hits,
        misses: stats.misses,
      }

      totalItems += itemCount
      totalSize += size
      totalHits += stats.hits
      totalRequests += stats.hits + stats.misses
    }

    return {
      totalItems,
      totalSize,
      engines: engineStats,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      expiredItems,
    }
  }

  /**
   * 清理过期项
   */
  async cleanup(): Promise<void> {
    for (const [engineType, engine] of this.engines) {
      try {
        await engine.cleanup()
      } catch (error) {
        console.warn(`Error cleaning up ${engineType}:`, error)
      }
    }
  }

  /**
   * 添加事件监听器
   */
  on<T = any>(event: CacheEventType, listener: CacheEventListener<T>): void {
    this.eventEmitter.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off<T = any>(event: CacheEventType, listener: CacheEventListener<T>): void {
    this.eventEmitter.off(event, listener)
  }

  /**
   * 销毁缓存管理器
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.eventEmitter.removeAllListeners()
    this.engines.clear()
    this.stats.clear()
  }
}
