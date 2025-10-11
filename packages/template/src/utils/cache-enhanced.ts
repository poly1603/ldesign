/**
 * 增强的缓存系统
 * 
 * 提供 WeakMap 支持、批量操作事务、智能预热等高级功能
 */

import { AdvancedCache, type CacheItem, type AdvancedCacheConfig } from './cache'

/**
 * 批量操作事务配置
 */
export interface TransactionConfig {
  /** 事务 ID */
  id?: string
  /** 是否自动提交 */
  autoCommit?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 失败时回滚 */
  rollbackOnError?: boolean
}

/**
 * 事务操作类型
 */
export type TransactionOperation = 
  | { type: 'set'; key: string; value: any; options?: any }
  | { type: 'delete'; key: string }
  | { type: 'clear' }

/**
 * 缓存预热策略
 */
export interface WarmupStrategy {
  /** 预热类型 */
  type: 'immediate' | 'lazy' | 'scheduled'
  /** 预热优先级 */
  priority?: 'low' | 'normal' | 'high'
  /** 调度时间（对于 scheduled 类型） */
  schedule?: number
  /** 最大并发数 */
  maxConcurrent?: number
}

/**
 * WeakMap 缓存配置
 */
export interface WeakCacheConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大引用数 */
  maxRefs?: number
}

/**
 * 缓存事务类
 */
export class CacheTransaction<T = any> {
  private operations: TransactionOperation[] = []
  private cache: EnhancedCache<T>
  private config: Required<TransactionConfig>
  private committed = false
  private rolledBack = false
  private snapshot: Map<string, CacheItem<T>> | null = null
  private timer: NodeJS.Timeout | null = null

  constructor(cache: EnhancedCache<T>, config: TransactionConfig = {}) {
    this.cache = cache
    this.config = {
      id: config.id || `tx-${Date.now()}-${Math.random()}`,
      autoCommit: config.autoCommit ?? false,
      timeout: config.timeout || 30000,
      rollbackOnError: config.rollbackOnError ?? true,
    }

    // 创建快照
    this.createSnapshot()

    // 设置超时
    if (this.config.timeout > 0) {
      this.timer = setTimeout(() => {
        if (!this.committed && !this.rolledBack) {
          console.warn(`Transaction ${this.config.id} timed out, rolling back`)
          this.rollback()
        }
      }, this.config.timeout)
    }
  }

  /**
   * 创建缓存快照
   */
  private createSnapshot(): void {
    this.snapshot = new Map((this.cache as any).cache)
  }

  /**
   * 添加设置操作
   */
  set(key: string, value: T, options?: any): this {
    this.checkState()
    this.operations.push({ type: 'set', key, value, options })
    
    if (this.config.autoCommit) {
      this.commit()
    }
    
    return this
  }

  /**
   * 添加删除操作
   */
  delete(key: string): this {
    this.checkState()
    this.operations.push({ type: 'delete', key })
    
    if (this.config.autoCommit) {
      this.commit()
    }
    
    return this
  }

  /**
   * 添加清空操作
   */
  clear(): this {
    this.checkState()
    this.operations.push({ type: 'clear' })
    
    if (this.config.autoCommit) {
      this.commit()
    }
    
    return this
  }

  /**
   * 提交事务
   */
  async commit(): Promise<{ success: boolean; error?: Error }> {
    this.checkState()

    try {
      for (const op of this.operations) {
        switch (op.type) {
          case 'set':
            this.cache.set(op.key, op.value, op.options)
            break
          case 'delete':
            this.cache.delete(op.key)
            break
          case 'clear':
            this.cache.clear()
            break
        }
      }

      this.committed = true
      this.cleanup()
      
      return { success: true }
    } catch (error) {
      if (this.config.rollbackOnError) {
        await this.rollback()
      }
      
      return { success: false, error: error as Error }
    }
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (this.rolledBack || !this.snapshot) {
      return
    }

    // 恢复快照
    (this.cache as any).cache = new Map(this.snapshot)
    this.rolledBack = true
    this.cleanup()
  }

  /**
   * 检查事务状态
   */
  private checkState(): void {
    if (this.committed) {
      throw new Error('Transaction already committed')
    }
    if (this.rolledBack) {
      throw new Error('Transaction already rolled back')
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.snapshot = null
  }

  /**
   * 获取事务信息
   */
  getInfo() {
    return {
      id: this.config.id,
      operationCount: this.operations.length,
      committed: this.committed,
      rolledBack: this.rolledBack,
    }
  }
}

// TypeScript declarations for ES2021 WeakRef and FinalizationRegistry
// eslint-disable-next-line @typescript-eslint/ban-types
type WeakRefConstructor = new <T extends object>(target: T) => WeakRef<T>
interface WeakRef<T extends object> {
  deref(): T | undefined
}
declare var WeakRef: WeakRefConstructor

// eslint-disable-next-line @typescript-eslint/ban-types
type FinalizationRegistryConstructor = new <T>(
  cleanupCallback: (heldValue: T) => void
) => FinalizationRegistry<T>
interface FinalizationRegistry<T> {
  register(target: object, heldValue: T, unregisterToken?: object): void
  unregister(unregisterToken: object): boolean
}
declare var FinalizationRegistry: FinalizationRegistryConstructor

/**
 * WeakMap 缓存管理器
 */
export class WeakCache<K extends object, V> {
  private weakMap: WeakMap<K, V>
  private refMap: Map<string, WeakRef<K>>
  private config: Required<WeakCacheConfig>
  private cleanupRegistry: FinalizationRegistry<string>

  constructor(config: WeakCacheConfig = {}) {
    this.weakMap = new WeakMap()
    this.refMap = new Map()
    this.config = {
      enabled: config.enabled ?? true,
      maxRefs: config.maxRefs || 1000,
    }

    // 设置清理注册表
    this.cleanupRegistry = new FinalizationRegistry((key: string) => {
      this.refMap.delete(key)
    })
  }

  /**
   * 设置值
   */
  set(key: K, value: V, keyId?: string): void {
    if (!this.config.enabled) {
      return
    }

    this.weakMap.set(key, value)

    // 如果提供了 keyId，创建弱引用
    if (keyId) {
      // 检查是否超过最大引用数
      if (this.refMap.size >= this.config.maxRefs) {
        // 删除最旧的引用
        const firstKey = this.refMap.keys().next().value
        if (firstKey !== undefined) {
          this.refMap.delete(firstKey)
        }
      }

      const weakRef = new WeakRef(key)
      this.refMap.set(keyId, weakRef)
      this.cleanupRegistry.register(key, keyId)
    }
  }

  /**
   * 获取值
   */
  get(key: K): V | undefined {
    if (!this.config.enabled) {
      return undefined
    }

    return this.weakMap.get(key)
  }

  /**
   * 通过 ID 获取值
   */
  getById(keyId: string): V | undefined {
    const weakRef = this.refMap.get(keyId)
    if (!weakRef) {
      return undefined
    }

    const key = weakRef.deref()
    if (!key) {
      this.refMap.delete(keyId)
      return undefined
    }

    return this.weakMap.get(key)
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    return this.weakMap.has(key)
  }

  /**
   * 删除值
   */
  delete(key: K): boolean {
    return this.weakMap.delete(key)
  }

  /**
   * 获取活跃引用数
   */
  getActiveRefsCount(): number {
    let count = 0
    for (const weakRef of this.refMap.values()) {
      if (weakRef.deref()) {
        count++
      }
    }
    return count
  }

  /**
   * 清理失效引用
   */
  cleanup(): number {
    let cleaned = 0
    const keysToDelete: string[] = []

    for (const [keyId, weakRef] of this.refMap) {
      if (!weakRef.deref()) {
        keysToDelete.push(keyId)
      }
    }

    for (const keyId of keysToDelete) {
      this.refMap.delete(keyId)
      cleaned++
    }

    return cleaned
  }
}

/**
 * 增强缓存类
 */
export class EnhancedCache<T = any> extends AdvancedCache<T> {
  private weakCache: WeakCache<object, T>
  private warmupQueue: Array<{
    key: string
    loader: () => Promise<T>
    strategy: WarmupStrategy
  }> = []
  private warmupInProgress = false

  constructor(config: AdvancedCacheConfig & { weakCache?: WeakCacheConfig } = {}) {
    super(config)
    this.weakCache = new WeakCache(config.weakCache)
  }

  /**
   * 使用 WeakMap 设置值
   */
  setWeak(key: object, value: T, keyId?: string): void {
    this.weakCache.set(key, value, keyId)
  }

  /**
   * 从 WeakMap 获取值
   */
  getWeak(key: object): T | undefined {
    return this.weakCache.get(key)
  }

  /**
   * 通过 ID 从 WeakMap 获取值
   */
  getWeakById(keyId: string): T | undefined {
    return this.weakCache.getById(keyId)
  }

  /**
   * 创建事务
   */
  transaction(config?: TransactionConfig): CacheTransaction<T> {
    return new CacheTransaction(this, config)
  }

  /**
   * 批量操作（使用事务）
   */
  async batch(
    operations: TransactionOperation[],
    config?: TransactionConfig
  ): Promise<{ success: boolean; error?: Error }> {
    const tx = this.transaction(config)

    for (const op of operations) {
      switch (op.type) {
        case 'set':
          tx.set(op.key, op.value, op.options)
          break
        case 'delete':
          tx.delete(op.key)
          break
        case 'clear':
          tx.clear()
          break
      }
    }

    return await tx.commit()
  }

  /**
   * 添加预热任务
   */
  addWarmupTask(
    key: string,
    loader: () => Promise<T>,
    strategy: WarmupStrategy = { type: 'lazy' }
  ): void {
    this.warmupQueue.push({ key, loader, strategy })

    // 如果是立即执行，直接开始预热
    if (strategy.type === 'immediate') {
      this.processWarmupQueue()
    }
    // 如果是调度执行
    else if (strategy.type === 'scheduled' && strategy.schedule) {
      setTimeout(() => {
        this.processWarmupQueue()
      }, strategy.schedule)
    }
  }

  /**
   * 批量预热
   * 覆盖父类方法以支持策略
   */
  async warmup(
    loader: (key: string) => Promise<T>,
    keys: string[],
    strategy: WarmupStrategy = { type: 'lazy' }
  ): Promise<void> {
    for (const key of keys) {
      this.addWarmupTask(key, () => loader(key), strategy)
    }

    if (strategy.type === 'immediate') {
      await this.processWarmupQueue()
    }
  }

  /**
   * 处理预热队列
   */
  private async processWarmupQueue(): Promise<void> {
    if (this.warmupInProgress || this.warmupQueue.length === 0) {
      return
    }

    this.warmupInProgress = true

    // 按优先级排序
    this.warmupQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      const aPriority = priorityOrder[a.strategy.priority || 'normal']
      const bPriority = priorityOrder[b.strategy.priority || 'normal']
      return bPriority - aPriority
    })

    // 批量处理
    const maxConcurrent = this.warmupQueue[0]?.strategy.maxConcurrent || 3
    const promises: Promise<void>[] = []

    while (this.warmupQueue.length > 0 && promises.length < maxConcurrent) {
      const task = this.warmupQueue.shift()
      if (!task) break

      const promise = (async () => {
        try {
          // 检查是否已存在
          if (this.has(task.key)) {
            return
          }

          const value = await task.loader()
          this.set(task.key, value)
        } catch (error) {
          console.error(`Warmup failed for key ${task.key}:`, error)
        }
      })()

      promises.push(promise)
    }

    await Promise.allSettled(promises)
    this.warmupInProgress = false

    // 如果还有任务，继续处理
    if (this.warmupQueue.length > 0) {
      await this.processWarmupQueue()
    }
  }

  /**
   * 获取 WeakMap 统计信息
   */
  getWeakCacheStats() {
    return {
      activeRefs: this.weakCache.getActiveRefsCount(),
      totalRefs: (this.weakCache as any).refMap.size,
    }
  }

  /**
   * 清理 WeakMap 缓存
   */
  cleanupWeakCache(): number {
    return this.weakCache.cleanup()
  }

  /**
   * 获取增强的统计信息
   */
  getEnhancedStats() {
    return {
      ...this.getStats(),
      weakCache: this.getWeakCacheStats(),
      warmup: {
        queueLength: this.warmupQueue.length,
        inProgress: this.warmupInProgress,
      },
    }
  }
}

/**
 * 创建增强缓存实例
 */
export function createEnhancedCache<T = any>(
  config?: AdvancedCacheConfig & { weakCache?: WeakCacheConfig }
): EnhancedCache<T> {
  return new EnhancedCache<T>(config)
}

/**
 * 缓存装饰器（用于类方法）
 */
export function Cached(options: {
  cache?: EnhancedCache<any>
  key?: (args: any[]) => string
  ttl?: number
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const cache = options.cache || new EnhancedCache()

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键
      const cacheKey = options.key
        ? options.key(args)
        : `${propertyKey}:${JSON.stringify(args)}`

      // 检查缓存
      const cached = cache.get(cacheKey)
      if (cached !== undefined) {
        return cached
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 缓存结果
      cache.set(cacheKey, result, { ttl: options.ttl })

      return result
    }

    return descriptor
  }
}

/**
 * 缓存预热辅助函数
 */
export async function preload<T>(
  cache: EnhancedCache<T>,
  items: Array<{ key: string; value: T | (() => Promise<T>) }>,
  strategy?: WarmupStrategy
): Promise<void> {
  const loaders = items.map((item) => ({
    key: item.key,
    loader:
      typeof item.value === 'function'
        ? (item.value as () => Promise<T>)
        : () => Promise.resolve(item.value as T),
  }))

  for (const { key, loader } of loaders) {
    cache.addWarmupTask(key, loader, strategy)
  }

  if (strategy?.type === 'immediate') {
    await (cache as any).processWarmupQueue()
  }
}
