/**
 * 缓存管理器
 * 提供统一的缓存接口和多种缓存策略
 */

import type { CacheOptions, CacheStats, CacheStore } from '../types'
import { EventEmitter } from 'node:events'
import { FileCache } from './file-cache'
import { MemoryCache } from './memory-cache'
import { RedisCache, type RedisCacheOptions } from './redis-cache'

/**
 * 缓存管理器类
 */
export class CacheManager extends EventEmitter {
  private stores: Map<string, CacheStore> = new Map()
  private defaultStore: string = 'memory'
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    super()

    this.options = {
      defaultTTL: options.defaultTTL || 3600, // 1小时
      maxSize: options.maxSize || 1000,
      strategy: options.strategy || 'lru',
      prefix: options.prefix || 'cache',
      serialize: options.serialize !== false,
      compress: options.compress !== false,
      namespace: options.namespace || 'default',
      ...options,
    }

    // 初始化默认内存缓存
    this.addStore(
      'memory',
      new MemoryCache({
        maxSize: this.options.maxSize,
        defaultTTL: this.options.defaultTTL,
        strategy: this.options.strategy,
      }),
    )
  }

  /**
   * 添加缓存存储
   */
  addStore(name: string, store: CacheStore): void {
    this.stores.set(name, store)

    // 监听存储事件
    store.on('hit', key => this.emit('hit', { store: name, key }))
    store.on('miss', key => this.emit('miss', { store: name, key }))
    store.on('set', (key, value) => this.emit('set', { store: name, key, value }))
    store.on('delete', key => this.emit('delete', { store: name, key }))
    store.on('clear', () => this.emit('clear', { store: name }))
    store.on('expired', key => this.emit('expired', { store: name, key }))

    this.emit('storeAdded', { name, store })
  }

  /**
   * 移除缓存存储
   */
  removeStore(name: string): boolean {
    const store = this.stores.get(name)
    if (store) {
      store.removeAllListeners()
      this.stores.delete(name)
      this.emit('storeRemoved', { name, store })
      return true
    }
    return false
  }

  /**
   * 获取缓存存储
   */
  getStore(name?: string): CacheStore | undefined {
    return this.stores.get(name || this.defaultStore)
  }

  /**
   * 设置默认存储
   */
  setDefaultStore(name: string): void {
    if (this.stores.has(name)) {
      this.defaultStore = name
      this.emit('defaultStoreChanged', name)
    }
    else {
      throw new Error(`Store '${name}' not found`)
    }
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string, store?: string): Promise<T | undefined> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKey = this.buildKey(key)
    return await cacheStore.get<T>(fullKey)
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, ttl?: number, store?: string): Promise<void> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKey = this.buildKey(key)
    const cacheTTL = ttl || this.options.defaultTTL

    await cacheStore.set(fullKey, value, cacheTTL)
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string, store?: string): Promise<boolean> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKey = this.buildKey(key)
    return await cacheStore.has(fullKey)
  }

  /**
   * 删除缓存
   */
  async delete(key: string, store?: string): Promise<boolean> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKey = this.buildKey(key)
    return await cacheStore.delete(fullKey)
  }

  /**
   * 清空缓存
   */
  async clear(store?: string): Promise<void> {
    if (store) {
      const cacheStore = this.getStore(store)
      if (cacheStore) {
        await cacheStore.clear()
      }
    }
    else {
      // 清空所有存储
      for (const cacheStore of this.stores.values()) {
        await cacheStore.clear()
      }
    }
  }

  /**
   * 获取或设置缓存（缓存穿透保护）
   */
  async getOrSet<T = unknown>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number,
    store?: string,
  ): Promise<T> {
    // 先尝试获取缓存
    const cached = await this.get<T>(key, store)
    if (cached !== undefined) {
      return cached
    }

    // 缓存不存在，执行工厂函数
    const value = await factory()

    // 设置缓存
    await this.set(key, value, ttl, store)

    return value
  }

  /**
   * 批量获取缓存
   */
  async mget<T = unknown>(keys: string[], store?: string): Promise<Map<string, T>> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKeys = keys.map(key => this.buildKey(key))
    const results = new Map<string, T>()

    if (cacheStore.mget) {
      // 如果存储支持批量获取
      const cacheResults = await cacheStore.mget<T>(fullKeys)
      for (const [fullKey, value] of cacheResults) {
        const originalKey = this.extractKey(fullKey)
        if (originalKey) {
          results.set(originalKey, value)
        }
      }
    }
    else {
      // 逐个获取
      for (let i = 0; i < keys.length; i++) {
        const fullKey = fullKeys[i]
        const originalKey = keys[i]
        if (!fullKey || !originalKey)
          continue
        const value = await cacheStore.get<T>(fullKey)
        if (value !== undefined) {
          results.set(originalKey, value)
        }
      }
    }

    return results
  }

  /**
   * 批量设置缓存
   */
  async mset<T = unknown>(entries: Map<string, T>, ttl?: number, store?: string): Promise<void> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullEntries = new Map<string, T>()
    for (const [key, value] of entries) {
      fullEntries.set(this.buildKey(key), value)
    }

    const cacheTTL = ttl || this.options.defaultTTL

    if (cacheStore.mset) {
      // 如果存储支持批量设置
      await cacheStore.mset(fullEntries, cacheTTL)
    }
    else {
      // 逐个设置
      for (const [fullKey, value] of fullEntries) {
        await cacheStore.set(fullKey, value, cacheTTL)
      }
    }
  }

  /**
   * 批量删除缓存
   */
  async mdel(keys: string[], store?: string): Promise<number> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKeys = keys.map(key => this.buildKey(key))

    if (cacheStore.mdel) {
      // 如果存储支持批量删除
      return await cacheStore.mdel(fullKeys)
    }
    else {
      // 逐个删除
      let deleted = 0
      for (const fullKey of fullKeys) {
        if (await cacheStore.delete(fullKey)) {
          deleted++
        }
      }
      return deleted
    }
  }

  /**
   * 获取缓存键列表
   */
  async keys(pattern?: string, store?: string): Promise<string[]> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    if (!cacheStore.keys) {
      throw new Error(`Store '${store || this.defaultStore}' does not support keys operation`)
    }

    const fullPattern = pattern ? this.buildKey(pattern) : undefined
    const fullKeys = await cacheStore.keys(fullPattern)

    return fullKeys.map(key => this.extractKey(key)).filter(Boolean) as string[]
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(store?: string): Promise<CacheStats> {
    if (store) {
      const cacheStore = this.getStore(store)
      if (!cacheStore) {
        throw new Error(`Store '${store}' not found`)
      }
      return await cacheStore.getStats()
    }
    else {
      // 合并所有存储的统计信息
      const allStats: CacheStats[] = []
      for (const cacheStore of this.stores.values()) {
        allStats.push(await cacheStore.getStats())
      }

      return this.mergeStats(allStats)
    }
  }

  /**
   * 设置缓存过期时间
   */
  async expire(key: string, ttl: number, store?: string): Promise<boolean> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKey = this.buildKey(key)

    if (cacheStore.expire) {
      return await cacheStore.expire(fullKey, ttl)
    }
    else {
      // 如果不支持expire，尝试重新设置
      const value = await cacheStore.get(fullKey)
      if (value !== undefined) {
        await cacheStore.set(fullKey, value, ttl)
        return true
      }
      return false
    }
  }

  /**
   * 获取缓存剩余过期时间
   */
  async ttl(key: string, store?: string): Promise<number> {
    const cacheStore = this.getStore(store)
    if (!cacheStore) {
      throw new Error(`Store '${store || this.defaultStore}' not found`)
    }

    const fullKey = this.buildKey(key)

    if (cacheStore.ttl) {
      return await cacheStore.ttl(fullKey)
    }
    else {
      return -1 // 不支持TTL查询
    }
  }

  /**
   * 构建完整的缓存键
   */
  private buildKey(key: string): string {
    return `${this.options.prefix}:${this.options.namespace}:${key}`
  }

  /**
   * 从完整键中提取原始键
   */
  private extractKey(fullKey: string): string | null {
    const prefix = `${this.options.prefix}:${this.options.namespace}:`
    if (fullKey.startsWith(prefix)) {
      return fullKey.slice(prefix.length)
    }
    return null
  }

  /**
   * 合并统计信息
   */
  private mergeStats(statsList: CacheStats[]): CacheStats {
    return statsList.reduce(
      (merged, stats) => ({
        hits: merged.hits + stats.hits,
        misses: merged.misses + stats.misses,
        keys: merged.keys + stats.keys,
        size: merged.size + stats.size,
        memory: merged.memory + stats.memory,
      }),
      {
        hits: 0,
        misses: 0,
        keys: 0,
        size: 0,
        memory: 0,
      },
    )
  }

  /**
   * 获取所有存储名称
   */
  getStoreNames(): string[] {
    return Array.from(this.stores.keys())
  }

  /**
   * 销毁缓存管理器
   */
  async destroy(): Promise<void> {
    for (const store of this.stores.values()) {
      if (store.destroy) {
        await store.destroy()
      }
      store.removeAllListeners()
    }

    this.stores.clear()
    this.removeAllListeners()
    this.emit('destroyed')
  }

  /**
   * 创建缓存管理器实例
   */
  static create(options?: CacheOptions): CacheManager {
    return new CacheManager(options)
  }

  /**
   * 创建带文件缓存的管理器
   */
  static createWithFileCache(cacheDir: string, options?: CacheOptions): CacheManager {
    const manager = new CacheManager(options)
    manager.addStore('file', new FileCache({ cacheDir }))
    return manager
  }

  /**
   * 创建带Redis缓存的管理器
   */
  static createWithRedisCache(redisOptions: RedisCacheOptions, options?: CacheOptions): CacheManager {
    const manager = new CacheManager(options)
    manager.addStore('redis', new RedisCache(redisOptions))
    return manager
  }
}
