/**
 * 缓存存储基类
 * 提供缓存存储的抽象接口和通用功能
 */

import type { CacheStats, CacheStore } from '../types'
import { EventEmitter } from 'node:events'

/**
 * 抽象缓存存储类
 */
export abstract class AbstractCacheStore extends EventEmitter implements CacheStore {
  protected stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    errors: 0,
  }

  /**
   * 获取缓存值
   */
  abstract get<T = unknown>(key: string): Promise<T | undefined>

  /**
   * 设置缓存值
   */
  abstract set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>

  /**
   * 检查缓存是否存在
   */
  abstract has(key: string): Promise<boolean>

  /**
   * 删除缓存
   */
  abstract delete(key: string): Promise<boolean>

  /**
   * 清空缓存
   */
  abstract clear(): Promise<void>

  /**
   * 获取统计信息
   */
  abstract getStats(): Promise<CacheStats>

  /**
   * 批量获取（默认实现）
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    for (const key of keys) {
      const value = await this.get<T>(key)
      if (value !== undefined) {
        results.set(key, value)
      }
    }

    return results
  }

  /**
   * 批量设置（默认实现）
   */
  async mset<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, ttl)
    }
  }

  /**
   * 批量删除（默认实现）
   */
  async mdel(keys: string[]): Promise<number> {
    let deleted = 0
    for (const key of keys) {
      if (await this.delete(key)) {
        deleted++
      }
    }
    return deleted
  }

  /**
   * 获取所有键（可选实现）
   */
  async keys?(pattern?: string): Promise<string[]>

  /**
   * 设置过期时间（可选实现）
   */
  async expire?(key: string, ttl: number): Promise<boolean>

  /**
   * 获取剩余过期时间（可选实现）
   */
  async ttl?(key: string): Promise<number>

  /**
   * 销毁存储（可选实现）
   */
  async destroy?(): Promise<void>

  /**
   * 记录命中
   */
  protected recordHit(key: string): void {
    this.stats.hits++
    this.emit('hit', key)
  }

  /**
   * 记录未命中
   */
  protected recordMiss(key: string): void {
    this.stats.misses++
    this.emit('miss', key)
  }

  /**
   * 记录设置
   */
  protected recordSet(key: string, value: unknown): void {
    this.stats.sets++
    this.emit('set', key, value)
  }

  /**
   * 记录删除
   */
  protected recordDelete(key: string): void {
    this.stats.deletes++
    this.emit('delete', key)
  }

  /**
   * 记录驱逐
   */
  protected recordEviction(key: string): void {
    this.stats.evictions++
    this.emit('evicted', key)
  }

  /**
   * 记录错误
   */
  protected recordError(error: Error): void {
    this.stats.errors++
    this.emit('error', error)
  }

  /**
   * 获取命中率
   */
  protected getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 重置统计信息
   */
  protected resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      errors: 0,
    }
  }
}

/**
 * 缓存存储装饰器
 * 为现有存储添加额外功能
 */
export class CacheStoreDecorator extends AbstractCacheStore {
  constructor(protected store: CacheStore) {
    super()

    // 转发事件
    this.store.on('hit', key => this.emit('hit', key))
    this.store.on('miss', key => this.emit('miss', key))
    this.store.on('set', (key, value) => this.emit('set', key, value))
    this.store.on('delete', key => this.emit('delete', key))
    this.store.on('clear', () => this.emit('clear'))
    this.store.on('error', error => this.emit('error', error))
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return await this.store.get<T>(key)
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    return await this.store.set(key, value, ttl)
  }

  async has(key: string): Promise<boolean> {
    return await this.store.has(key)
  }

  async delete(key: string): Promise<boolean> {
    return await this.store.delete(key)
  }

  async clear(): Promise<void> {
    return await this.store.clear()
  }

  override async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    if (this.store.mget) {
      return await this.store.mget<T>(keys)
    }
    return await super.mget<T>(keys)
  }

  override async mset<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    if (this.store.mset) {
      return await this.store.mset(entries, ttl)
    }
    return await super.mset(entries, ttl)
  }

  override async mdel(keys: string[]): Promise<number> {
    if (this.store.mdel) {
      return await this.store.mdel(keys)
    }
    return await super.mdel(keys)
  }

  override async keys(pattern?: string): Promise<string[]> {
    if (this.store.keys) {
      return await this.store.keys(pattern)
    }
    return []
  }

  override async expire(key: string, ttl: number): Promise<boolean> {
    if (this.store.expire) {
      return await this.store.expire(key, ttl)
    }
    return false
  }

  override async ttl(key: string): Promise<number> {
    if (this.store.ttl) {
      return await this.store.ttl(key)
    }
    return -1
  }

  async getStats(): Promise<CacheStats> {
    return await this.store.getStats()
  }

  override async destroy(): Promise<void> {
    if (this.store.destroy) {
      await this.store.destroy()
    }
    this.removeAllListeners()
  }
}

/**
 * 带压缩的缓存存储装饰器
 */
export class CompressedCacheStore extends CacheStoreDecorator {
  constructor(
    store: CacheStore,
    private compressionThreshold = 1024,
  ) {
    super(store)
  }

  override async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    let processedValue = value

    // 如果值是字符串且超过阈值，进行压缩
    if (typeof value === 'string' && value.length > this.compressionThreshold) {
      try {
        const { gzip } = await import('node:zlib')
        const { promisify } = await import('node:util')
        const gzipAsync = promisify(gzip)

        const compressed = await gzipAsync(Buffer.from(value, 'utf8'))
        processedValue = `__compressed__${compressed.toString('base64')}` as T
      }
      catch (error) {
        this.recordError(error as Error)
      }
    }

    return await this.store.set(key, processedValue, ttl)
  }

  override async get<T = unknown>(key: string): Promise<T | undefined> {
    const value = await this.store.get<T>(key)

    if (typeof value === 'string' && value.startsWith('__compressed__')) {
      try {
        const { gunzip } = await import('node:zlib')
        const { promisify } = await import('node:util')
        const gunzipAsync = promisify(gunzip)

        const compressedData = value.slice('__compressed__'.length)
        const buffer = Buffer.from(compressedData, 'base64')
        const decompressed = await gunzipAsync(buffer)

        return decompressed.toString('utf8') as T
      }
      catch (error) {
        this.recordError(error as Error)
        return value
      }
    }

    return value
  }
}

/**
 * 带序列化的缓存存储装饰器
 */
export class SerializedCacheStore extends CacheStoreDecorator {
  constructor(store: CacheStore) {
    super(store)
  }

  override async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    let serializedValue: string

    try {
      serializedValue = JSON.stringify(value)
    }
    catch (error) {
      this.recordError(error as Error)
      throw new Error(`Failed to serialize value for key '${key}': ${error}`)
    }

    return await this.store.set(key, serializedValue, ttl)
  }

  override async get<T = unknown>(key: string): Promise<T | undefined> {
    const value = await this.store.get<string>(key)

    if (value === undefined) {
      return undefined
    }

    try {
      return JSON.parse(value) as T
    }
    catch (error) {
      this.recordError(error as Error)
      // 如果反序列化失败，返回原始值
      return value as T
    }
  }
}

/**
 * 带命名空间的缓存存储装饰器
 */
export class NamespacedCacheStore extends CacheStoreDecorator {
  constructor(
    store: CacheStore,
    private namespace: string,
  ) {
    super(store)
  }

  private addNamespace(key: string): string {
    return `${this.namespace}:${key}`
  }

  private removeNamespace(key: string): string {
    const prefix = `${this.namespace}:`
    return key.startsWith(prefix) ? key.slice(prefix.length) : key
  }

  override async get<T = unknown>(key: string): Promise<T | undefined> {
    return await this.store.get<T>(this.addNamespace(key))
  }

  override async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    return await this.store.set(this.addNamespace(key), value, ttl)
  }

  override async has(key: string): Promise<boolean> {
    return await this.store.has(this.addNamespace(key))
  }

  override async delete(key: string): Promise<boolean> {
    return await this.store.delete(this.addNamespace(key))
  }

  override async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    const namespacedKeys = keys.map(key => this.addNamespace(key))
    const results = await super.mget<T>(namespacedKeys)

    const finalResults = new Map<string, T>()
    for (const [namespacedKey, value] of results) {
      const originalKey = this.removeNamespace(namespacedKey)
      finalResults.set(originalKey, value)
    }

    return finalResults
  }

  override async mset<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    const namespacedEntries = new Map<string, T>()
    for (const [key, value] of entries) {
      namespacedEntries.set(this.addNamespace(key), value)
    }

    return await super.mset(namespacedEntries, ttl)
  }

  override async mdel(keys: string[]): Promise<number> {
    const namespacedKeys = keys.map(key => this.addNamespace(key))
    return await super.mdel(namespacedKeys)
  }

  override async keys(pattern?: string): Promise<string[]> {
    const namespacedPattern = pattern ? this.addNamespace(pattern) : `${this.namespace}:*`
    const namespacedKeys = await super.keys(namespacedPattern)

    return namespacedKeys.map(key => this.removeNamespace(key))
  }

  override async expire(key: string, ttl: number): Promise<boolean> {
    return await super.expire(this.addNamespace(key), ttl)
  }

  override async ttl(key: string): Promise<number> {
    return await super.ttl(this.addNamespace(key))
  }
}
