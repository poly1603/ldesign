import type {
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  CacheMetadata,
  CacheOptions,
  CacheStats,
  ICacheManager,
  IStorageEngine,
  SerializableValue,
  SetOptions,
  StorageEngine,
} from '../types'
import type { MemoryManager} from './memory-manager';
import type { PrefetchManager} from './prefetch-manager';
import { StorageEngineFactory } from '../engines/factory'
import { SecurityManager } from '../security/security-manager'
import { StorageStrategy } from '../strategies/storage-strategy'
import { EventEmitter, Validator } from '../utils'
import { createMemoryManager } from './memory-manager'
import { createPrefetchManager } from './prefetch-manager'

/**
 * 缓存管理器核心实现
 */
export class CacheManager implements ICacheManager {
  private engines: Map<StorageEngine, IStorageEngine> = new Map()
  private strategy: StorageStrategy
  private security: SecurityManager
  private eventEmitter: EventEmitter<CacheEvent>
  private stats: Map<StorageEngine, { hits: number, misses: number }>
    = new Map()

  private cleanupTimer?: number
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  // 内存管理器
  private memoryManager: MemoryManager
  // 预取管理器
  private prefetchManager?: PrefetchManager
  
  // 优化：使用WeakMap避免内存泄漏
  private serializationCache = new WeakMap<object, string>()
  private stringSerializationCache = new Map<string, string>()
  private readonly maxStringCacheSize = 500
  private serializationCacheOrder = new Map<string, number>()
  private serializationCacheCounter = 0

  // 优化：事件节流，使用环形缓冲区
  private eventThrottleRing: Array<{ key: string, time: number }> = []
  private eventThrottleIndex = new Map<string, number>()
  private readonly eventThrottleMs = 100
  private readonly maxEventThrottleSize = 200

  constructor(private options: CacheOptions = {}) {
    this.strategy = new StorageStrategy(options.strategy)
    this.security = new SecurityManager(options.security)
    this.eventEmitter = new EventEmitter()
    
    // 初始化内存管理器
    this.memoryManager = createMemoryManager({
      maxMemory: options.maxMemory || 100 * 1024 * 1024,
      highPressureThreshold: 0.8,
      criticalPressureThreshold: 0.95,
      autoCleanupInterval: options.cleanupInterval || 60000
    })
    
    // 监听内存压力
    this.memoryManager.onPressure((level) => {
      if (level === 'critical') {
        this.performEmergencyCleanup()
      } else if (level === 'high') {
        this.cleanup().catch(console.error)
      }
    })
    
    // 初始化预取管理器（如果启用）
    if (options.enablePrefetch) {
      this.prefetchManager = createPrefetchManager({
        strategy: options.prefetch?.strategy || 'markov',
        cacheGetter: async (key: string) => await this.get(key),
        cacheSetter: async (key: string, value: SerializableValue, opts?: SetOptions) => await this.set(key, value, opts),
        fetcher: options.prefetch?.fetcher
      })
    }

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
        const engineConfig = this.options.engines?.[engineType]

        // 检查引擎是否被显式禁用
        if (engineConfig && 'enabled' in engineConfig && engineConfig.enabled === false) {
          continue
        }

        const engine = await StorageEngineFactory.create(
          engineType,
          engineConfig,
        )
        if (engine.available) {
          this.engines.set(engineType, engine)
          this.stats.set(engineType, { hits: 0, misses: 0 })
        }
      }
      catch (error) {
        console.warn(`Failed to initialize ${engineType} engine:`, error)
      }
    }

    this.initialized = true
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (typeof this.options.cleanupInterval === 'number' && this.options.cleanupInterval > 0) {
      // 兼容浏览器与 Node/SSR 环境
      const setIntervalFn
        = typeof window !== 'undefined' && typeof window.setInterval === 'function'
          ? window.setInterval
          : globalThis.setInterval

      this.cleanupTimer = setIntervalFn(() => {
        this.cleanup().catch((error) => {
          console.error(error)
        })
      }, this.options.cleanupInterval) as unknown as number
    }
  }

  /**
   * 选择存储引擎
   */
  private async selectEngine(
    key: string,
    value: SerializableValue,
    options?: SetOptions,
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
         
        console.info(`[CacheManager] Strategy selected engine: ${result.engine}`)
      }

      const engine = this.engines.get(result.engine)
      if (engine) {
        return engine
      }
      else {
        console.warn(
          `[CacheManager] Strategy selected engine ${result.engine} is not available, falling back to default`,
        )
      }
    }

    // 回退到默认/推荐引擎（提高 SSR/Node 环境健壮性）
    const defaultEngine = this.options.defaultEngine || StorageEngineFactory.getRecommendedEngine()
    const engine = this.engines.get(defaultEngine)
    if (engine) {
      return engine
    }

    // 兼底：选择第一个可用引擎
    const firstAvailable = Array.from(this.engines.values())[0]
    if (firstAvailable !== undefined) {
      return firstAvailable
    }

    throw new Error('No storage engine is available')
  }

  /**
   * 处理键名
   */
  private async processKey(key: string): Promise<string> {
    let processedKey = key

    // 添加前缀
    if (typeof this.options.keyPrefix === 'string' && this.options.keyPrefix.length > 0) {
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
    if (typeof this.options.keyPrefix === 'string' && this.options.keyPrefix.length > 0) {
      const prefix = `${this.options.keyPrefix}:`
      if (originalKey.startsWith(prefix)) {
        originalKey = originalKey.slice(prefix.length)
      }
    }

    return originalKey
  }

  /**
   * 序列化数据
   *
   * 将任意类型的数据序列化为字符串，支持加密选项
   *
   * @param value - 需要序列化的数据
   * @param options - 序列化选项，包含加密设置
   * @returns 序列化后的字符串
   * @throws {Error} 当序列化失败时抛出错误
   *
   * @example
   * ```typescript
   * const serialized = await serializeValue({ name: 'test' })
   * ```
   */
  private async serializeValue(
    value: SerializableValue,
    options?: SetOptions,
  ): Promise<string> {
    try {
      // 性能优化：对于简单值，使用缓存
      const needsEncryption = options?.encrypt || this.options.security?.encryption?.enabled
      const cacheKey = needsEncryption ? null : this.createSerializationCacheKey(value)

      // 对于简单类型使用字符串缓存
      if (cacheKey !== null && this.stringSerializationCache.has(cacheKey)) {
        // 更新访问顺序
        this.serializationCacheOrder.set(cacheKey, this.serializationCacheCounter++)
        const cached = this.stringSerializationCache.get(cacheKey)
        if (cached !== undefined) {
          return cached
        }
      }

      // 检查循环引用
      let serialized: string

      try {
        serialized = JSON.stringify(value)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('circular')) {
          // 处理循环引用：创建一个简化的版本
          const simplifiedValue = this.removeCircularReferences(value)
          serialized = JSON.stringify(simplifiedValue)

          // 记录警告但不阻止操作
          console.warn('Circular reference detected in cache value, using simplified version:', error.message)
        }
        else {
          throw new Error(`JSON serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // 加密
      if (needsEncryption) {
        try {
          serialized = await this.security.encrypt(serialized)
        }
        catch (error) {
          throw new Error(`Encryption failed during serialization: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      else if (cacheKey !== null) {
        // 缓存未加密的序列化结果
        this.cacheSerializationResult(cacheKey, serialized)
      }

      return serialized
    }
    catch (error) {
      // 发出错误事件
      this.emitEvent('error', 'serialization', 'memory', value, error as Error)
      throw error
    }
  }

  /**
   * 创建序列化缓存键（优化版）
   */
  private createSerializationCacheKey(value: any): string | null {
    try {
      const type = typeof value
      // 基本类型使用字符串缓存
      if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
        const key = `${type}:${String(value)}`
        // 限制键长度
        return key.length < 200 ? key : null
      }
      return null
    }
    catch {
      return null
    }
  }

  /**
   * 缓存序列化结果（优化版）
   */
  private cacheSerializationResult(key: string, result: string): void {
    // 限制字符串缓存大小
    if (this.stringSerializationCache.size >= this.maxStringCacheSize) {
      // 简单FIFO淘汰第一个
      const firstKey = this.stringSerializationCache.keys().next().value
      if (firstKey !== undefined) {
        this.stringSerializationCache.delete(firstKey)
      }
    }
    this.stringSerializationCache.set(key, result)
  }

  /**
   * 反序列化数据
   *
   * 将字符串反序列化为原始数据类型，支持解密选项
   *
   * @param data - 需要反序列化的字符串数据
   * @param encrypted - 数据是否已加密
   * @returns 反序列化后的原始数据
   * @throws {Error} 当反序列化失败时抛出错误
   *
   * @example
   * ```typescript
   * const original = await deserializeValue<MyType>(serializedData, false)
   * ```
   */
  private async deserializeValue<T>(
    data: string,
    encrypted: boolean,
  ): Promise<T> {
    try {
      let deserialized = data

      // 解密
      if (encrypted) {
        try {
          deserialized = await this.security.decrypt(deserialized)
        }
        catch (error) {
          throw new Error(`Decryption failed during deserialization: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // JSON 解析
      try {
        return JSON.parse(deserialized)
      }
      catch (error) {
        throw new Error(`JSON parsing failed during deserialization: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    catch (error) {
      // 发出错误事件
      this.emitEvent('error', 'deserialization', 'memory', data, error as Error)
      throw error
    }
  }

  /**
   * 移除对象中的循环引用
   *
   * @param obj - 需要处理的对象
   * @param seen - 已访问的对象集合（用于检测循环引用）
   * @returns 移除循环引用后的对象
   */
  private removeCircularReferences(obj: SerializableValue, seen = new WeakSet()): SerializableValue {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (seen.has(obj)) {
      return '[Circular Reference]'
    }

    seen.add(obj)

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeCircularReferences(item, seen))
    }

    const result: Record<string, SerializableValue> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.removeCircularReferences((obj as Record<string, SerializableValue>)[key], seen)
      }
    }

    return result
  }

  /**
   * 验证 set 方法的输入参数
   *
   * 使用统一的验证工具进行参数验证
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param options - 设置选项
   * @throws {ValidationError} 当输入参数无效时抛出错误
   */
  private validateSetInput<T>(key: string, value: T, options?: SetOptions): void {
    // 使用统一的验证工具
    Validator.validateSetInput(key, value, options)
  }

  /**
   * 创建元数据
   */
  /**
   * 创建元数据
   *
   * 根据值、引擎和选项生成标准化的缓存元数据。
   * 注意：size 基于 JSON 字符串字节大小估算，若启用压缩请使用 compressor 统计真实值。
   */
  private createMetadata(
    value: SerializableValue,
    engine: StorageEngine,
    options?: SetOptions,
  ): CacheMetadata {
    const now = Date.now()
    const serialized = JSON.stringify(value)

    return {
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: typeof options?.ttl === 'number' ? now + options.ttl : undefined,
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
  /**
   * 推断数据类型
   */
  private getDataType(value: SerializableValue): import('../types').DataType {
    if (value === null || value === undefined) {
      return 'string'
    }
    if (typeof value === 'string') {
      return 'string'
    }
    if (typeof value === 'number') {
      return 'number'
    }
    if (typeof value === 'boolean') {
      return 'boolean'
    }
    if (Array.isArray(value)) {
      return 'array'
    }
    if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
      return 'binary'
    }
    return 'object'
  }

  /**
   * 触发事件（优化版）
   */
  private emitEvent<T>(
    type: CacheEventType,
    key: string,
    engine: StorageEngine,
    value?: T,
    error?: Error,
  ): void {
    // 对高频事件进行节流
    const eventKey = `${type}:${key}:${engine}`
    const now = Date.now()
    
    // 检查节流
    const index = this.eventThrottleIndex.get(eventKey)
    if (index !== undefined && type !== 'error') {
      const entry = this.eventThrottleRing[index]
      if (entry && now - entry.time < this.eventThrottleMs) {
        return
      }
    }

    // 更新或添加到环形缓冲区
    if (this.eventThrottleRing.length >= this.maxEventThrottleSize) {
      // 覆盖最旧的条目
      const oldestIndex = 0
      const oldEntry = this.eventThrottleRing[oldestIndex]
      if (oldEntry) {
        this.eventThrottleIndex.delete(oldEntry.key)
      }
      this.eventThrottleRing[oldestIndex] = { key: eventKey, time: now }
      this.eventThrottleIndex.set(eventKey, oldestIndex)
      // 旋转数组
      this.eventThrottleRing.push(this.eventThrottleRing.shift()!)
    } else {
      const newIndex = this.eventThrottleRing.length
      this.eventThrottleRing.push({ key: eventKey, time: now })
      this.eventThrottleIndex.set(eventKey, newIndex)
    }

    const event: CacheEvent<T> = {
      type,
      key,
      value,
      engine,
      timestamp: now,
      error,
    }

    this.eventEmitter.emit(type, event)
  }

  /**
   * 发出策略选择事件
   */
  private emitStrategyEvent<T = SerializableValue>(
    key: string,
    engine: StorageEngine,
    value: T,
    strategyInfo: {
      reason: string
      confidence: number
      dataSize: number
      dataType: string
      ttl?: number
    },
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
      // Debug logging handled by event emitter
    }
  }

  /**
   * 设置缓存项
   *
   * 将键值对存储到缓存中，支持多种存储引擎和配置选项
   *
   * @param key - 缓存键，必须是非空字符串
   * @param value - 缓存值，支持任意可序列化的数据类型
   * @param options - 可选的设置选项，包括TTL、存储引擎、加密等
   * @throws {Error} 当键无效、值无法序列化或存储失败时抛出错误
   *
   * @example
   * ```typescript
   * // 基础用法
   * await cache.set('user:123', { name: 'John', age: 30 })
   *
   * // 带选项
   * await cache.set('session:abc', sessionData, {
   *   ttl: 3600000, // 1小时
   *   engine: 'localStorage',
   *   encrypt: true
   * })
   * ```
   */
  async set<T extends SerializableValue = SerializableValue>(
    key: string,
    value: T,
    options?: SetOptions,
  ): Promise<void> {
    // 输入验证
    this.validateSetInput(key, value, options)

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
    }
    catch (error) {
      this.emitEvent('error', key, 'memory', value, error as Error)
      throw error
    }
  }

  /**
   * 获取缓存项
   *
   * 从缓存中获取指定键的值，支持多存储引擎查找和自动过期检查
   *
   * @template T - 期望返回的数据类型
   * @param key - 缓存键，必须是非空字符串
   * @returns 缓存的值，如果不存在或已过期则返回 null
   * @throws {Error} 当键无效或反序列化失败时抛出错误
   *
   * @example
   * ```typescript
   * // 获取字符串值
   * const name = await cache.get<string>('user:name')
   *
   * // 获取对象值
   * const user = await cache.get<User>('user:123')
   * if (user) {
   *   
   * }
   *
   * // 处理不存在的键
   * const data = await cache.get('nonexistent') // 返回 null
   * ```
   */
  async get<T extends SerializableValue = SerializableValue>(key: string): Promise<T | null> {
    // 确保缓存管理器已初始化
    await this.ensureInitialized()

    // 处理缓存键（可能包含混淆处理）
    const processedKey = await this.processKey(key)

    // 按优先级顺序尝试从各个存储引擎获取数据（优化检索性能）
    // 优先级：memory > localStorage > sessionStorage > cookie > indexedDB
    const searchOrder: StorageEngine[] = [
      'memory',
      'localStorage',
      'sessionStorage',
      'cookie',
      'indexedDB',
    ]

    for (const engineType of searchOrder) {
      const engine = this.engines.get(engineType)
      if (!engine) {
        continue
      }

      try {
        // 从当前引擎获取原始数据
        const itemData = await engine.getItem(processedKey)
        if (typeof itemData === 'string' && itemData.length > 0) {
          // 解析存储的数据结构 { value, metadata }
          const { value, metadata } = JSON.parse(itemData)

          // 检查缓存项是否已过期
          if (typeof metadata.expiresAt === 'number' && Date.now() > metadata.expiresAt) {
            // 过期则从当前引擎中移除
            await engine.removeItem(processedKey)
            // 发出过期事件
            this.emitEvent('expired', key, engineType)
            continue // 继续尝试下一个引擎
          }

          // 更新访问统计信息（仅内存，避免频繁写回存储）
          metadata.lastAccessedAt = Date.now()
          metadata.accessCount++

          // 更新引擎命中统计
          const stats = this.stats.get(engineType)
          if (stats) {
            stats.hits++
          }

          // 反序列化缓存值（处理加密数据）
          const deserializedValue = await this.deserializeValue<T>(
            value,
            metadata.encrypted,
          )

          // 读穿缓存：非内存命中则回填到内存引擎，提升后续读取性能
          if (engineType !== 'memory') {
            const memoryEngine = this.engines.get('memory')
            if (memoryEngine) {
              try {
                const ttlRemaining = typeof metadata.expiresAt === 'number'
                  ? Math.max(0, metadata.expiresAt - Date.now())
                  : undefined
                await memoryEngine.setItem(processedKey, itemData, ttlRemaining)
              }
              catch (e) {
                console.warn('[CacheManager] Failed to promote item to memory:', e)
              }
            }
          }

          // 发出获取成功事件
          this.emitEvent('get', key, engineType, deserializedValue)
          return deserializedValue
        }
      }
      catch (error) {
        // 记录引擎错误但不中断查找过程
        console.warn(`Error getting from ${engineType}:`, error)
      }
    }

    // 未找到，更新未命中统计
    for (const [engineType] of this.engines) {
      const stats = this.stats.get(engineType)
      if (stats) {
        stats.misses++
      }
    }

    return null
  }

  /**
   * 获取或设置（缺省则计算并写入）
   *
   * 当缓存不存在时，调用提供的 fetcher 计算值并写入缓存，然后返回该值。
   * 可通过 options.refresh 强制刷新。
   */
  async remember<T extends SerializableValue = SerializableValue>(
    key: string,
    fetcher: () => Promise<T> | T,
    options?: SetOptions & { refresh?: boolean },
  ): Promise<T> {
    await this.ensureInitialized()

    if (!options?.refresh) {
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }
    }
    const value = await Promise.resolve().then(fetcher)
    await this.set<T>(key, value, options)
    return value
  }

  /** 获取或设置（别名） */
  async getOrSet<T extends SerializableValue = SerializableValue>(
    key: string,
    fetcher: () => Promise<T> | T,
    options?: SetOptions,
  ): Promise<T> {
    return this.remember<T>(key, fetcher, options)
  }

  /**
   * 批量设置缓存项
   *
   * 并行设置多个缓存项，提高效率
   *
   * @param items - 要设置的缓存项，可以是数组或对象格式
   * @param options - 可选的全局设置选项，应用于所有项
   * @returns 设置结果，包含成功和失败信息
   *
   * @example
   * ```typescript
   * // 数组格式
   * const results = await cache.mset([
   *   { key: 'user:1', value: user1, options: { ttl: 3600000 } },
   *   { key: 'user:2', value: user2 },
   * ])
   * 
   * // 对象格式
   * const results = await cache.mset({
   *   'user:1': user1,
   *   'user:2': user2,
   * }, { ttl: 3600000 })
   * ```
   */
  async mset<T extends SerializableValue = SerializableValue>(
    items: Array<{ key: string, value: T, options?: SetOptions }> | Record<string, T>,
    options?: SetOptions,
  ): Promise<{ success: string[], failed: Array<{ key: string, error: Error }> }> {
    await this.ensureInitialized()

    // 转换输入格式
    let itemsArray: Array<{ key: string, value: T, options?: SetOptions }>
    if (Array.isArray(items)) {
      itemsArray = items
    }
    else {
      itemsArray = Object.entries(items).map(([key, value]) => ({
        key,
        value,
        options,
      }))
    }

    // 验证输入
    if (itemsArray.length === 0) {
      return { success: [], failed: [] }
    }

    // 性能优化：按引擎分组批量处理
    const engineGroups = new Map<StorageEngine, Array<{ key: string, value: T, options?: SetOptions, index: number }>>()
    const failedItems: Array<{ index: number, key: string, error: Error }> = []

    // 预处理：确定每个项目的目标引擎
    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i]
      try {
        // 先进行输入验证
        this.validateSetInput(item.key, item.value, item.options || options)

        const engine = await this.selectEngine(item.key, item.value, item.options || options)
        const group = engineGroups.get(engine.name) || []
        group.push({ ...item, index: i })
        engineGroups.set(engine.name, group)
      }
      catch (error) {
        // 记录验证或引擎选择失败的项目
        failedItems.push({
          index: i,
          key: item.key,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }

    // 并行处理各引擎组
    const allResults: Array<PromiseSettledResult<{ success: boolean, key: string, error?: Error }> | undefined> = Array.from({ length: itemsArray.length })
    const enginePromises = Array.from(engineGroups.entries()).map(async ([engineType, group]) => {
      const engine = this.engines.get(engineType)
      if (!engine) {
        return
      }

      // 批量处理同一引擎的项目
      const groupResults = await Promise.allSettled(
        group.map(async (item) => {
          try {
            const processedKey = await this.processKey(item.key)
            const serializedValue = await this.serializeValue(item.value, item.options || options)
            const metadata = this.createMetadata(item.value, engineType, item.options || options)

            const itemData = JSON.stringify({
              value: serializedValue,
              metadata,
            })

            await engine.setItem(processedKey, itemData, (item.options || options)?.ttl)
            this.emitEvent('set', item.key, engineType, item.value)
            return { success: true, key: item.key }
          }
          catch (error) {
            this.emitEvent('error', item.key, engineType, item.value, error as Error)
            return { success: false, key: item.key, error: error as Error }
          }
        }),
      )

      // 将结果放回原始位置
      group.forEach((item, groupIndex) => {
        allResults[item.index] = groupResults[groupIndex]
      })
    })

    await Promise.all(enginePromises)

    // 整理结果
    const success: string[] = []
    const failed: Array<{ key: string, error: Error }> = []

    // 先添加预处理阶段失败的项目
    failedItems.forEach((item) => {
      failed.push({ key: item.key, error: item.error })
    })

    itemsArray.forEach((item, index) => {
      // 跳过已经在预处理阶段失败的项目
      if (failedItems.some(f => f.index === index)) {
        return
      }

      const result = allResults[index]
      if (result && result.status === 'fulfilled' && result.value.success) {
        success.push(item.key)
      }
      else {
        let error: Error
        if (result && result.status === 'rejected') {
          error = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
        }
        else if (result && result.status === 'fulfilled' && result.value.error) {
          error = result.value.error
        }
        else {
          error = new Error('Unknown error')
        }
        failed.push({ key: item.key, error })
      }
    })

    return { success, failed }
  }

  /**
   * 批量获取缓存项
   *
   * 并行获取多个缓存项，提高效率
   *
   * @param keys - 要获取的缓存键数组
   * @returns 键值对映射，不存在的键值为 null
   *
   * @example
   * ```typescript
   * const users = await cache.mget(['user:1', 'user:2', 'user:3'])
   * // { 'user:1': {...}, 'user:2': {...}, 'user:3': null }
   * ```
   */
  async mget<T extends SerializableValue = SerializableValue>(keys: string[]): Promise<Record<string, T | null>> {
    await this.ensureInitialized()

    if (keys.length === 0) {
      return {}
    }

    // 性能优化：批量处理键，减少重复的键处理开销
    const processedKeys = await Promise.all(
      keys.map(async key => this.processKey(key)),
    )

    // 按引擎优先级分组查找，优化查找策略
    const results: Array<T | null> = Array.from({ length: keys.length }, () => null)
    const remainingIndices = new Set(keys.map((_, i) => i))

    // 按引擎优先级顺序查找
    for (const [engineType, engine] of this.engines) {
      if (remainingIndices.size === 0) { break }

      const engineResults = await Promise.allSettled(
        Array.from(remainingIndices).map(async (index) => {
          try {
            const processedKey = processedKeys[index]
            const itemData = await engine.getItem(processedKey)

            if (itemData) {
              const { value, metadata } = JSON.parse(itemData)

              // 检查过期
              if (typeof metadata.expiresAt === 'number' && Date.now() > metadata.expiresAt) {
                await engine.removeItem(processedKey)
                this.emitEvent('expired', keys[index], engineType)
                return null
              }

              // 更新统计
              const stats = this.stats.get(engineType)
              if (stats) {
                stats.hits++
              }

              // 反序列化
              const deserializedValue = await this.deserializeValue<T>(
                value,
                metadata.encrypted,
              )

              // 读穿缓存：非内存命中则回填到内存引擎
              if (engineType !== 'memory') {
                const memoryEngine = this.engines.get('memory')
                if (memoryEngine) {
                  try {
                    const ttlRemaining = typeof metadata.expiresAt === 'number'
                      ? Math.max(0, metadata.expiresAt - Date.now())
                      : undefined
                    await memoryEngine.setItem(processedKey, itemData, ttlRemaining)
                  }
                  catch (e) {
                    console.warn('[CacheManager] Failed to promote item to memory:', e)
                  }
                }
              }

              this.emitEvent('get', keys[index], engineType, deserializedValue)
              return deserializedValue
            }
            return null
          }
          catch (error) {
            console.warn(`Error getting ${keys[index]} from ${engineType}:`, error)
            return null
          }
        }),
      )

      // 处理结果并移除已找到的键
      Array.from(remainingIndices).forEach((index, resultIndex) => {
        const result = engineResults[resultIndex]
        if (result.status === 'fulfilled' && result.value !== null) {
          results[index] = result.value
          remainingIndices.delete(index)
        }
      })
    }

    // 更新未命中统计
    if (remainingIndices.size > 0) {
      for (const [engineType] of this.engines) {
        const stats = this.stats.get(engineType)
        if (stats) {
          stats.misses += remainingIndices.size
        }
      }
    }

    // 填充未找到的键为null
    remainingIndices.forEach((index) => {
      results[index] = null
    })

    return Object.fromEntries(
      keys.map((key, index) => [key, results[index]]),
    ) as Record<string, T | null>
  }

  /**
   * 批量删除缓存项
   *
   * 并行删除多个缓存项
   *
   * @param keys - 要删除的缓存键数组或单个键
   * @returns 删除结果，包含成功和失败信息
   *
   * @example
   * ```typescript
   * const results = await cache.mremove(['user:1', 'user:2', 'user:3'])
   * ```
   */
  async mremove(keys: string[] | string): Promise<{ success: string[], failed: Array<{ key: string, error: Error }> }> {
    await this.ensureInitialized()

    // 规范化输入为数组
    const keysArray = Array.isArray(keys) ? keys : [keys]

    if (keysArray.length === 0) {
      return { success: [], failed: [] }
    }

    const results = await Promise.allSettled(
      keysArray.map(async key => this.remove(key)),
    )

    const success: string[] = []
    const failed: Array<{ key: string, error: Error }> = []

    keysArray.forEach((key, index) => {
      const result = results[index]
      if (result.status === 'fulfilled') {
        success.push(key)
      }
      else {
        failed.push({
          key,
          error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
        })
      }
    })

    return { success, failed }
  }

  /**
   * 批量检查缓存项是否存在
   *
   * @param keys - 要检查的缓存键数组
   * @returns 键存在性映射
   *
   * @example
   * ```typescript
   * const exists = await cache.mhas(['user:1', 'user:2'])
   * // { 'user:1': true, 'user:2': false }
   * ```
   */
  async mhas(keys: string[]): Promise<Record<string, boolean>> {
    await this.ensureInitialized()

    const results = await Promise.all(
      keys.map(async key => this.has(key).catch(() => false)),
    )

    return Object.fromEntries(
      keys.map((key, index) => [key, results[index]]),
    )
  }

  /**
   * 删除缓存项
   *
   * 从所有存储引擎中删除指定键的缓存项，确保数据完全清除
   *
   * @param key - 要删除的缓存键
   * @throws {Error} 当键无效时抛出错误
   *
   * @example
   * ```typescript
   * // 删除单个缓存项
   * await cache.remove('user:123')
   *
   * // 删除后检查是否存在
   * const exists = await cache.has('user:123') // false
   *
   * // 删除不存在的键不会报错
   * await cache.remove('nonexistent-key') // 正常执行
   * ```
   */
  async remove(key: string): Promise<void> {
    // 确保缓存管理器已初始化
    await this.ensureInitialized()

    // 处理缓存键（可能包含混淆处理）
    const processedKey = await this.processKey(key)

    // 从所有存储引擎中删除该键
    // 即使某个引擎删除失败，也要继续删除其他引擎中的数据
    for (const [engineType, engine] of this.engines) {
      try {
        // 从当前引擎删除缓存项
        await engine.removeItem(processedKey)
        // 发出删除成功事件
        this.emitEvent('remove', key, engineType)
      }
      catch (error) {
        // 记录删除错误但不中断其他引擎的删除操作
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
    }
    else {
      for (const [engineType, storageEngine] of this.engines) {
        try {
          await storageEngine.clear()
          this.emitEvent('clear', '*', engineType)
        }
        catch (error) {
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
            engineKeys.map(async k => this.unprocessKey(k)),
          )
          allKeys.push(...processedKeys)
        }
        catch (error) {
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
      }
      catch (error) {
        console.warn(`Error getting metadata from ${engine.name}:`, error)
      }
    }

    return null
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const engineStats: Record<StorageEngine, import('../types').EngineStats>
      = {} as any
    let totalItems = 0
    let totalSize = 0
    let totalHits = 0
    let totalRequests = 0
    const expiredItems = 0

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
      }
      catch (error) {
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
      const clearIntervalFn
        = typeof window !== 'undefined' && typeof window.clearInterval === 'function'
          ? window.clearInterval
          : (globalThis as any).clearInterval
      clearIntervalFn(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.eventEmitter.removeAllListeners()
    this.engines.clear()
    this.stats.clear()

    // 清理性能优化相关的缓存
    // WeakMap doesn't have clear method, recreate it
    this.serializationCache = new WeakMap()
    this.stringSerializationCache.clear()
    this.eventThrottleIndex.clear()
    this.eventThrottleRing = []
  }

  /**
   * 性能优化：手动触发内存清理
   */
  async optimizeMemory(): Promise<void> {
    // 清理字符串序列化缓存
    if (this.stringSerializationCache.size > this.maxStringCacheSize / 2) {
      const keysToDelete: string[] = []
      let count = 0
      for (const key of this.stringSerializationCache.keys()) {
        if (count++ >= this.maxStringCacheSize / 4) break
        keysToDelete.push(key)
      }
      keysToDelete.forEach(key => this.stringSerializationCache.delete(key))
    }

    // 清理事件节流环形缓冲区
    if (this.eventThrottleRing.length > this.maxEventThrottleSize / 2) {
      const halfSize = Math.floor(this.maxEventThrottleSize / 2)
      this.eventThrottleRing = this.eventThrottleRing.slice(-halfSize)
      this.eventThrottleIndex.clear()
      this.eventThrottleRing.forEach((entry, index) => {
        this.eventThrottleIndex.set(entry.key, index)
      })
    }

    // 触发内存管理器清理
    this.memoryManager.requestMemory(0)

    // 触发内存引擎的清理
    const memoryEngine = this.engines.get('memory')
    if (memoryEngine && typeof (memoryEngine as any).cleanup === 'function') {
      try {
        await (memoryEngine as any).cleanup()
      }
      catch (error) {
        console.warn('Error during memory engine cleanup:', error)
      }
    }
  }
  
  /**
   * 紧急内存清理
   */
  private async performEmergencyCleanup(): Promise<void> {
    console.warn('[CacheManager] Emergency cleanup triggered')
    
    // 清空所有缓存
    this.stringSerializationCache.clear()
    this.eventThrottleRing = []
    this.eventThrottleIndex.clear()
    
    // 触发各引擎清理
    for (const [, engine] of this.engines) {
      if (typeof (engine as any).cleanup === 'function') {
        try {
          await (engine as any).cleanup()
        } catch (error) {
          console.error(`Cleanup failed for ${engine.name}:`, error)
        }
      }
    }
  }
}
