import type { StorageEngineConfig } from '../types'
import { CACHE_SIZE, ENGINE_CONFIG, MEMORY_CONFIG, UTF8_SIZE } from '../constants/performance'
import { type EvictionStrategy, EvictionStrategyFactory } from '../strategies/eviction-strategies'

import { BaseStorageEngine } from './base-engine'

/**
 * 内存缓存项接口
 *
 * 定义存储在内存中的缓存项的数据结构
 */
interface MemoryCacheItem {
  /** 缓存值（已序列化的字符串） */
  value: string
  /** 创建时间戳 */
  createdAt: number
  /** 过期时间戳（可选） */
  expiresAt?: number
}

/**
 * 内存存储引擎
 *
 * 基于 JavaScript Map 实现的高性能内存缓存引擎
 * 特点：
 * - 访问速度最快
 * - 支持自动过期清理
 * - 支持内存大小限制
 * - 进程重启后数据丢失
 *
 * @example
 * ```typescript
 * const engine = new MemoryEngine({
 *   maxSize: 50 * 1024 * 1024, // 50MB
 *   cleanupInterval: 30000      // 30秒清理一次
 * })
 *
 * await engine.setItem('key', 'value', 3600000) // 1小时TTL
 * const value = await engine.getItem('key')
 * ```
 */
export class MemoryEngine extends BaseStorageEngine {
  /** 引擎名称标识 */
  readonly name = 'memory' as const
  /** 引擎可用性（内存引擎始终可用） */
  readonly available = true
  /** 最大内存大小限制（字节） */
  readonly maxSize: number
  /** 最大项数限制 */
  private readonly maxItems: number
  /** 淘汰策略 */
  private evictionStrategy: EvictionStrategy

  /** 内存存储容器 */
  private storage: Map<string, MemoryCacheItem> = new Map()
  /** 清理定时器ID */
  private cleanupTimer?: number
  /** 淘汰计数 */
  private evictionCount = 0
  /** 大小计算缓存（LRU缓存） */
  private sizeCache: Map<string, number> = new Map()
  /** 大小缓存的最大条目数 */
  private readonly SIZE_CACHE_LIMIT = CACHE_SIZE.SIZE_CACHE_LIMIT

  /**
   * 构造函数
   *
   * @param config - 内存引擎配置选项
   */
  constructor(config?: StorageEngineConfig['memory']) {
    super()
    // 设置最大内存大小
    this.maxSize = config?.maxSize || ENGINE_CONFIG.MEMORY_MAX_SIZE_DEFAULT
    // 设置最大项数
    this.maxItems = config?.maxItems || ENGINE_CONFIG.MEMORY_MAX_ITEMS_DEFAULT
    
    // 初始化淘汰策略，默认使用 LRU
    const strategyName = config?.evictionStrategy || 'LRU'
    this.evictionStrategy = EvictionStrategyFactory.create(strategyName)

    // 启动定期清理过期项
    const cleanupInterval = config?.cleanupInterval || 60000 // 默认1分钟
    this.startCleanupTimer(cleanupInterval)
  }

  /**
   * 启动清理定时器
   *
   * 创建定期清理过期缓存项的定时器，兼容浏览器和Node.js环境
   *
   * @param interval - 清理间隔时间（毫秒）
   */
  private startCleanupTimer(interval: number): void {
    // 兼容浏览器和Node.js环境的setInterval
    const setIntervalFn
      = typeof window !== 'undefined' ? window.setInterval : globalThis.setInterval

    // 启动定时清理任务
    this.cleanupTimer = setIntervalFn(() => {
      this.cleanup().catch((error) => {
        console.error('Memory engine cleanup failed:', error)
      })
    }, interval) as unknown as number
  }

  /**
   * 设置缓存项
   *
   * 将键值对存储到内存中，支持TTL过期时间和内存大小检查
   *
   * @param key - 缓存键
   * @param value - 缓存值（字符串格式）
   * @param ttl - 生存时间（毫秒），可选
   * @throws {Error} 当内存不足时抛出错误
   *
   * @example
   * ```typescript
   * // 设置永久缓存
   * await engine.setItem('user:123', JSON.stringify(userData))
   *
   * // 设置带TTL的缓存
   * await engine.setItem('session:abc', sessionData, 3600000) // 1小时
   * ```
   */
  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    // 优化：使用更快的大小计算方法
    const keySize = this.calculateSizeFast(key)
    const valueSize = this.calculateSizeFast(value)
    const dataSize = keySize + valueSize

    // 检查项数限制
    if (this.storage.size >= this.maxItems && !this.storage.has(key)) {
      await this.evictByStrategy()
    }

    // 如果是更新操作，先减去旧值的大小
    const isUpdate = this.storage.has(key)
    let oldSize = 0
    if (isUpdate) {
      const oldItem = this.storage.get(key)!
      oldSize = keySize + this.calculateSizeFast(oldItem.value)
    }

    // 检查存储空间（考虑更新情况）
    const netSizeChange = dataSize - oldSize
    if (!this.checkStorageSpace(netSizeChange)) {
      // 尝试清理过期项
      await this.cleanup()

      // 再次检查
      if (!this.checkStorageSpace(netSizeChange)) {
        // 根据策略清理项
        await this.evictUntilSpaceAvailable(netSizeChange)
      }
    }

    const now = Date.now()
    const item: MemoryCacheItem = {
      value,
      createdAt: now,
      expiresAt: ttl ? now + ttl : undefined,
    }

    // 更新或添加到存储
    this.storage.set(key, item)

    // 增量更新大小（优化：避免遍历整个存储）
    if (isUpdate) {
      this._usedSize = this._usedSize - oldSize + dataSize
      this.evictionStrategy.recordAccess(key)
    }
    else {
      this._usedSize += dataSize
      this.evictionStrategy.recordAdd(key, ttl)
    }
  }

  /**
   * 获取缓存项
   */
  async getItem(key: string): Promise<string | null> {
    const item = this.storage.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      // 优化：增量更新大小
      const itemSize = this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
      this.storage.delete(key)
      this.evictionStrategy.removeKey(key)
      this._usedSize -= itemSize
      return null
    }

    // 记录访问
    this.evictionStrategy.recordAccess(key)

    return item.value
  }

  /**
   * 获取缓存项（别名，用于测试兼容）
   */
  async get(key: string): Promise<string | null> {
    return this.getItem(key)
  }

  /**
   * 设置缓存项（别名，用于测试兼容）
   */
  async set(key: string, value: string, options: { ttl?: number } = {}): Promise<void> {
    return this.setItem(key, value, options.ttl)
  }

  /**
   * 删除缓存项
   */
  async removeItem(key: string): Promise<void> {
    const item = this.storage.get(key)
    if (item) {
      // 优化：增量更新大小
      const itemSize = this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
      this._usedSize -= itemSize
    }
    this.storage.delete(key)
    this.evictionStrategy.removeKey(key)
  }

  /**
   * 清空所有缓存项
   */
  async clear(): Promise<void> {
    this.storage.clear()
    this.evictionStrategy.clear()
    this._usedSize = 0
  }

  /**
   * 获取所有键名
   */
  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys())
  }

  /**
   * 检查键是否存在
   */
  async hasItem(key: string): Promise<boolean> {
    return this.storage.has(key)
  }

  /**
   * 获取缓存项数量
   */
  async length(): Promise<number> {
    return this.storage.size
  }

  /**
   * 清理过期项
   */
  async cleanup(): Promise<void> {
    const now = Date.now()
    const keysToDelete: string[] = []
    let freedSize = 0

    for (const [key, item] of this.storage) {
      if (item.expiresAt && now > item.expiresAt) {
        keysToDelete.push(key)
        // 优化：在遍历时计算释放的大小
        freedSize += this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
      }
    }

    for (const key of keysToDelete) {
      this.storage.delete(key)
      this.evictionStrategy.removeKey(key)
    }

    // 优化：增量更新大小
    if (keysToDelete.length > 0) {
      this._usedSize -= freedSize
    }
  }

  /**
   * 快速计算字符串大小（字节）
   * 优化版本：
   * 1. 使用LRU缓存避免重复计算相同字符串
   * 2. 使用更高效的UTF-8字节计算
   *
   * UTF-8编码规则：
   * - ASCII字符（0-127）：1字节
   * - 其他字符：平均3字节（简化估算）
   */
  private calculateSizeFast(str: string): number {
    // 检查缓存
    const cached = this.sizeCache.get(str)
    if (cached !== undefined) {
      return cached
    }

    // 计算大小 - 优化版本
    let size = 0
    const len = str.length
    
    for (let i = 0; i < len; i++) {
      const code = str.charCodeAt(i)
      // 优化：使用常量减少分支
      size += code < UTF8_SIZE.ASCII_MAX 
        ? UTF8_SIZE.ONE_BYTE 
        : code < UTF8_SIZE.TWO_BYTE_MAX 
          ? UTF8_SIZE.TWO_BYTES 
          : code < UTF8_SIZE.THREE_BYTE_MAX 
            ? UTF8_SIZE.THREE_BYTES 
            : UTF8_SIZE.FOUR_BYTES
    }

    // 更新缓存（LRU策略）
    if (this.sizeCache.size >= this.SIZE_CACHE_LIMIT) {
      // 删除最早的条目（Map保持插入顺序）
      const firstKey = this.sizeCache.keys().next().value
      if (firstKey !== undefined) {
        this.sizeCache.delete(firstKey)
      }
    }
    this.sizeCache.set(str, size)

    return size
  }

  /**
   * 根据策略淘汰一个项
   */
  private async evictByStrategy(): Promise<void> {
    const keyToEvict = this.evictionStrategy.getEvictionKey()
    if (keyToEvict && this.storage.has(keyToEvict)) {
      const item = this.storage.get(keyToEvict)!
      const itemSize = this.calculateSizeFast(keyToEvict) + this.calculateSizeFast(item.value)
      this.storage.delete(keyToEvict)
      this.evictionStrategy.removeKey(keyToEvict)
      this.evictionCount++
      this._usedSize -= itemSize
    }
  }

  /**
   * 淘汰项直到有足够空间
   */
  private async evictUntilSpaceAvailable(requiredSpace: number): Promise<void> {
    let freedSpace = 0
    const maxEvictions = Math.min(this.storage.size, Math.ceil(this.storage.size * MEMORY_CONFIG.MAX_EVICTION_RATIO))
    let evictionCount = 0

    while (freedSpace < requiredSpace && evictionCount < maxEvictions) {
      const keyToEvict = this.evictionStrategy.getEvictionKey()
      if (!keyToEvict || !this.storage.has(keyToEvict)) {
        // 没有更多可淘汰的项，回退到清理最旧的项
        await this.evictOldestItems(requiredSpace - freedSpace)
        break
      }

      const item = this.storage.get(keyToEvict)!
      const itemSize = this.calculateSizeFast(keyToEvict) + this.calculateSizeFast(item.value)

      this.storage.delete(keyToEvict)
      this.evictionStrategy.removeKey(keyToEvict)
      this.evictionCount++
      this._usedSize -= itemSize

      freedSpace += itemSize
      evictionCount++
    }
  }

  /**
   * 清理最旧的项以释放空间
   */
  private async evictOldestItems(requiredSpace: number): Promise<void> {
    // 按创建时间排序，删除最旧的项
    const items = Array.from(this.storage.entries()).sort(
      ([, a], [, b]) => a.createdAt - b.createdAt,
    )

    let freedSpace = 0
    const keysToDelete: string[] = []

    for (const [key, item] of items) {
      const itemSize = this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
      keysToDelete.push(key)
      freedSpace += itemSize

      // 确保释放足够的空间，并且至少删除一个项
      if (freedSpace >= requiredSpace && keysToDelete.length > 0) {
        break
      }
    }

    // 如果仍然空间不足，删除更多项
    if (freedSpace < requiredSpace && keysToDelete.length < items.length) {
      // 删除一半的项
      const halfLength = Math.ceil(items.length * MEMORY_CONFIG.HALF_EVICTION_RATIO)
      for (let i = keysToDelete.length; i < halfLength; i++) {
        if (items[i]) {
          const [key, item] = items[i]
          keysToDelete.push(key)
          freedSpace += this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
        }
      }
    }

    // 批量删除并更新大小
    for (const key of keysToDelete) {
      this.storage.delete(key)
      this.evictionStrategy.removeKey(key)
    }
    this._usedSize -= freedSpace
  }

  /**
   * 更新使用大小（完整重新计算）
   * 注意：此方法现在主要用于初始化或校验，日常操作使用增量更新
   */
  protected async updateUsedSize(): Promise<void> {
    let totalSize = 0

    for (const [key, item] of this.storage) {
      totalSize += this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
    }

    this._usedSize = totalSize
  }

  /**
   * 获取缓存项详细信息
   */
  async getItemInfo(key: string): Promise<MemoryCacheItem | null> {
    return this.storage.get(key) || null
  }

  /**
   * 获取所有缓存项（用于调试）
   */
  async getAllItems(): Promise<Record<string, MemoryCacheItem>> {
    const result: Record<string, MemoryCacheItem> = {}

    for (const [key, item] of this.storage) {
      result[key] = { ...item }
    }

    return result
  }

  /**
   * 设置淘汰策略
   */
  setEvictionStrategy(strategyName: string): void {
    // 创建新策略
    const newStrategy = EvictionStrategyFactory.create(strategyName)
    
    // 将所有现有的键添加到新策略中
    for (const [key, item] of this.storage) {
      const ttl = item.expiresAt ? item.expiresAt - Date.now() : undefined
      newStrategy.recordAdd(key, ttl)
    }
    
    // 替换策略
    this.evictionStrategy = newStrategy
  }

  /**
   * 获取淘汰统计
   */
  getEvictionStats(): {
    totalEvictions: number
    strategy: string
    strategyStats: Record<string, any>
  } {
    return {
      totalEvictions: this.evictionCount || 0,
      strategy: this.evictionStrategy.name,
      strategyStats: this.evictionStrategy.getStats(),
    }
  }

  /**
   * 获取存储统计
   */
  async getStorageStats(): Promise<{
    totalItems: number
    totalSize: number
    expiredItems: number
    oldestItem?: { key: string, age: number }
    newestItem?: { key: string, age: number }
  }> {
    const now = Date.now()
    let expiredItems = 0
    let oldestTime = Infinity
    let newestTime = 0
    let oldestKey = ''
    let newestKey = ''

    for (const [key, item] of this.storage) {
      if (item.expiresAt && now > item.expiresAt) {
        expiredItems++
      }

      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt
        oldestKey = key
      }

      if (item.createdAt > newestTime) {
        newestTime = item.createdAt
        newestKey = key
      }
    }

    return {
      totalItems: this.storage.size,
      totalSize: this._usedSize,
      expiredItems,
      oldestItem: oldestKey
        ? { key: oldestKey, age: now - oldestTime }
        : undefined,
      newestItem: newestKey
        ? { key: newestKey, age: now - newestTime }
        : undefined,
    }
  }

  /**
   * 批量设置缓存项（优化版本）
   * 
   * @param items - 要设置的键值对数组
   * @returns 设置结果数组
   */
  async batchSet(items: Array<{ key: string, value: string, ttl?: number }>): Promise<boolean[]> {
    const results: boolean[] = []
    const now = Date.now()

    // 批量处理所有项
    for (const { key, value, ttl } of items) {
      try {
        const keySize = this.calculateSizeFast(key)
        const valueSize = this.calculateSizeFast(value)
        const dataSize = keySize + valueSize

        // 检查项数限制
        if (this.storage.size >= this.maxItems && !this.storage.has(key)) {
          await this.evictByStrategy()
        }

        // 如果是更新操作，先减去旧值的大小
        const isUpdate = this.storage.has(key)
        let oldSize = 0
        if (isUpdate) {
          const oldItem = this.storage.get(key)!
          oldSize = keySize + this.calculateSizeFast(oldItem.value)
        }

        // 检查存储空间
        const netSizeChange = dataSize - oldSize
        if (!this.checkStorageSpace(netSizeChange)) {
          await this.cleanup()
          if (!this.checkStorageSpace(netSizeChange)) {
            await this.evictUntilSpaceAvailable(netSizeChange)
          }
        }

        const item: MemoryCacheItem = {
          value,
          createdAt: now,
          expiresAt: ttl ? now + ttl : undefined,
        }

        this.storage.set(key, item)

        // 增量更新大小
        if (isUpdate) {
          this._usedSize = this._usedSize - oldSize + dataSize
          this.evictionStrategy.recordAccess(key)
        }
        else {
          this._usedSize += dataSize
          this.evictionStrategy.recordAdd(key, ttl)
        }

        results.push(true)
      }
      catch (error) {
        console.error(`Failed to set ${key}:`, error)
        results.push(false)
      }
    }

    return results
  }

  /**
   * 批量获取缓存项（优化版本）
   * 
   * @param keys - 要获取的键数组
   * @returns 值数组（未找到的为 null）
   */
  async batchGet(keys: string[]): Promise<Array<string | null>> {
    const results: Array<string | null> = []
    const now = Date.now()
    const expiredKeys: string[] = []
    let expiredSize = 0

    for (const key of keys) {
      const item = this.storage.get(key)

      if (!item) {
        results.push(null)
        continue
      }

      // 检查是否过期
      if (item.expiresAt && now > item.expiresAt) {
        expiredKeys.push(key)
        expiredSize += this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
        results.push(null)
        continue
      }

      // 记录访问
      this.evictionStrategy.recordAccess(key)
      results.push(item.value)
    }

    // 批量删除过期项
    if (expiredKeys.length > 0) {
      for (const key of expiredKeys) {
        this.storage.delete(key)
        this.evictionStrategy.removeKey(key)
      }
      this._usedSize -= expiredSize
    }

    return results
  }

  /**
   * 批量删除缓存项（优化版本）
   * 
   * @param keys - 要删除的键数组
   * @returns 删除结果数组
   */
  async batchRemove(keys: string[]): Promise<boolean[]> {
    const results: boolean[] = []
    let totalFreedSize = 0

    for (const key of keys) {
      const item = this.storage.get(key)
      if (item) {
        const itemSize = this.calculateSizeFast(key) + this.calculateSizeFast(item.value)
        totalFreedSize += itemSize
        this.storage.delete(key)
        this.evictionStrategy.removeKey(key)
        results.push(true)
      }
      else {
        results.push(false)
      }
    }

    if (totalFreedSize > 0) {
      this._usedSize -= totalFreedSize
    }

    return results
  }

  /**
   * 批量检查键是否存在（优化版本）
   * 
   * @param keys - 要检查的键数组
   * @returns 存在性检查结果数组
   */
  async batchHas(keys: string[]): Promise<boolean[]> {
    return keys.map(key => this.storage.has(key))
  }

  /**
   * 销毁引擎
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      const clearIntervalFn
        = typeof window !== 'undefined'
          ? window.clearInterval
          : globalThis.clearInterval
      clearIntervalFn(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.storage.clear()
    this.evictionStrategy.clear()
    this.sizeCache.clear()
    this._usedSize = 0
  }
}

