/**
 * Redis缓存
 * 提供基于Redis的分布式缓存实现
 */

import type { CacheStats, CacheStore } from '../types'
import { EventEmitter } from 'node:events'

/**
 * Redis缓存选项
 */
export interface RedisCacheOptions {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  connectTimeout?: number
  lazyConnect?: boolean
  retryDelayOnFailover?: number
  maxRetriesPerRequest?: number
  family?: number
}

/**
 * Redis客户端接口（兼容多种Redis库）
 */
export interface RedisClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, mode?: string, duration?: number) => Promise<string | null>
  setex: (key: string, seconds: number, value: string) => Promise<string>
  del: (...keys: string[]) => Promise<number>
  exists: (...keys: string[]) => Promise<number>
  keys: (pattern: string) => Promise<string[]>
  ttl: (key: string) => Promise<number>
  expire: (key: string, seconds: number) => Promise<number>
  flushdb: () => Promise<string>
  mget: (...keys: string[]) => Promise<(string | null)[]>
  mset: (...keyValues: string[]) => Promise<string>
  quit: () => Promise<string>
  on: (event: string, listener: (...args: unknown[]) => void) => void
  off: (event: string, listener: (...args: unknown[]) => void) => void
}

/**
 * Redis缓存类
 */
export class RedisCache extends EventEmitter implements CacheStore {
  private client?: RedisClient
  private options: Required<RedisCacheOptions>
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  }

  private connected = false

  constructor(options: RedisCacheOptions = {}) {
    super()

    this.options = {
      host: options.host || 'localhost',
      port: options.port || 6379,
      password: options.password || '',
      db: options.db || 0,
      keyPrefix: options.keyPrefix || 'cache:',
      connectTimeout: options.connectTimeout || 10000,
      lazyConnect: options.lazyConnect !== false,
      retryDelayOnFailover: options.retryDelayOnFailover || 100,
      maxRetriesPerRequest: options.maxRetriesPerRequest || 3,
      family: options.family || 4,
    }

    if (!this.options.lazyConnect) {
      this.connect()
    }
  }

  /**
   * 连接Redis
   */
  async connect(): Promise<void> {
    if (this.connected || this.client) {
      return
    }

    try {
      // 这里需要根据实际使用的Redis库来创建客户端
      // 例如：ioredis, redis, node_redis等
      // 为了避免依赖，这里提供一个抽象实现

      throw new Error(
        'Redis client not configured. Please install and configure a Redis client (ioredis, redis, etc.)',
      )
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 确保连接
   */
  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }
  }

  /**
   * 构建完整键名
   */
  private buildKey(key: string): string {
    return `${this.options.keyPrefix}${key}`
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKey = this.buildKey(key)
      const value = await this.client.get(fullKey)

      if (value === null) {
        this.stats.misses++
        this.emit('miss', key)
        return undefined
      }

      this.stats.hits++
      this.emit('hit', key)

      try {
        return JSON.parse(value) as T
      }
      catch {
        return value as T
      }
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return undefined
    }
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKey = this.buildKey(key)
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)

      if (ttl && ttl > 0) {
        await this.client.setex(fullKey, ttl, serializedValue)
      }
      else {
        await this.client.set(fullKey, serializedValue)
      }

      this.stats.sets++
      this.emit('set', key, value)
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKey = this.buildKey(key)
      const exists = await this.client.exists(fullKey)
      return exists > 0
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return false
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKey = this.buildKey(key)
      const deleted = await this.client.del(fullKey)

      if (deleted > 0) {
        this.stats.deletes++
        this.emit('delete', key)
        return true
      }

      return false
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return false
    }
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      await this.client.flushdb()
      this.emit('clear')
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 批量获取
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKeys = keys.map(key => this.buildKey(key))
      const values = await this.client.mget(...fullKeys)

      const results = new Map<string, T>()

      for (let i = 0; i < keys.length; i++) {
        const originalKey = keys[i]
        const value = values[i]
        if (!originalKey)
          continue
        const v = value ?? null
        if (v !== null) {
          try {
            results.set(originalKey, JSON.parse(v) as T)
          }
          catch {
            results.set(originalKey, v as T)
          }
        }
      }

      return results
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return new Map()
    }
  }

  /**
   * 批量设置
   */
  async mset<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const keyValues: string[] = []

      for (const [key, value] of entries) {
        const fullKey = this.buildKey(key)
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
        keyValues.push(fullKey, serializedValue)
      }

      await this.client.mset(...keyValues)

      // 如果有TTL，需要逐个设置过期时间
      if (ttl && ttl > 0) {
        for (const key of entries.keys()) {
          const fullKey = this.buildKey(key)
          await this.client.expire(fullKey, ttl)
        }
      }
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 批量删除
   */
  async mdel(keys: string[]): Promise<number> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKeys = keys.map(key => this.buildKey(key))
      const deleted = await this.client.del(...fullKeys)

      this.stats.deletes += deleted
      return deleted
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return 0
    }
  }

  /**
   * 获取所有键
   */
  async keys(pattern?: string): Promise<string[]> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const searchPattern = pattern
        ? `${this.options.keyPrefix}${pattern}`
        : `${this.options.keyPrefix}*`

      const fullKeys = await this.client.keys(searchPattern)

      // 移除前缀
      return fullKeys.map(key => key.slice(this.options.keyPrefix.length))
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return []
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKey = this.buildKey(key)
      const result = await this.client.expire(fullKey, ttl)
      return result > 0
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return false
    }
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      await this.ensureConnection()

      if (!this.client) {
        throw new Error('Redis client not available')
      }

      const fullKey = this.buildKey(key)
      return await this.client.ttl(fullKey)
    }
    catch (error) {
      this.stats.errors++
      this.emit('error', error)
      return -2
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<CacheStats> {
    const keyCount = (await this.keys()).length

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: keyCount,
      size: keyCount,
      memory: 0, // Redis内存使用需要通过INFO命令获取
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      errors: this.stats.errors,
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit()
      }
      catch (error) {
        this.emit('error', error)
      }

      this.client = undefined
      this.connected = false
      this.emit('disconnected')
    }
  }

  /**
   * 销毁缓存
   */
  async destroy(): Promise<void> {
    await this.disconnect()
    this.removeAllListeners()
  }

  /**
   * 创建Redis缓存实例
   */
  static create(options?: RedisCacheOptions): RedisCache {
    return new RedisCache(options)
  }

  /**
   * 使用ioredis创建实例
   */
  static createWithIORedis(redisClient: RedisClient, options?: Partial<RedisCacheOptions>): RedisCache {
    const cache = new RedisCache(options)
    cache.client = redisClient
    cache.connected = true
    return cache
  }

  /**
   * 使用node_redis创建实例
   */
  static createWithNodeRedis(redisClient: RedisClient, options?: Partial<RedisCacheOptions>): RedisCache {
    const cache = new RedisCache(options)
    cache.client = redisClient
    cache.connected = true
    return cache
  }
}
