/**
 * 配置缓存管理器
 * 提供配置缓存、智能重载和变更追踪功能
 */

import { createHash } from 'node:crypto'
import { EventEmitter } from 'node:events'

/**
 * 配置缓存选项
 */
export interface ConfigCacheOptions {
  maxSize?: number
  ttl?: number
  enableCompression?: boolean
  enableEncryption?: boolean
  encryptionKey?: string
  enableVersioning?: boolean
  maxVersions?: number
}

/**
 * 配置缓存条目
 */
export interface ConfigCacheEntry {
  value: unknown
  hash: string
  timestamp: number
  ttl?: number
  version: number
  dependencies: string[]
  metadata: Record<string, unknown>
}

/**
 * 配置变更信息
 */
export interface ConfigChange {
  path: string
  oldValue: unknown
  newValue: unknown
  timestamp: number
  type: 'added' | 'modified' | 'deleted'
  source: string
}

/**
 * 配置缓存管理器类
 */
export class ConfigCache extends EventEmitter {
  private cache = new Map<string, ConfigCacheEntry>()
  private dependencies = new Map<string, Set<string>>()
  private versions = new Map<string, ConfigCacheEntry[]>()
  private options: Required<ConfigCacheOptions>
  private currentVersion = 0

  constructor(options: ConfigCacheOptions = {}) {
    super()

    this.options = {
      maxSize: options.maxSize || 1000,
      ttl: options.ttl || 3600000, // 1 hour
      enableCompression: options.enableCompression !== false,
      enableEncryption: options.enableEncryption !== false,
      encryptionKey: options.encryptionKey || '',
      enableVersioning: options.enableVersioning !== false,
      maxVersions: options.maxVersions || 10,
    }
  }

  /**
   * 设置配置值
   */
  set(
    key: string,
    value: unknown,
    options: {
      ttl?: number
      dependencies?: string[]
      metadata?: Record<string, unknown>
      source?: string
    } = {},
  ): void {
    const hash = this.generateHash(value)
    const timestamp = Date.now()
    const version = ++this.currentVersion

    // 检查是否有变化
    const existing = this.cache.get(key)
    if (existing && existing.hash === hash) {
      // 值没有变化，只更新时间戳
      existing.timestamp = timestamp
      return
    }

    // 创建新的缓存条目
    const entry: ConfigCacheEntry = {
      value: this.processValue(value),
      hash,
      timestamp,
      ttl: options.ttl || this.options.ttl,
      version,
      dependencies: options.dependencies || [],
      metadata: options.metadata || {},
    }

    // 保存到缓存
    this.cache.set(key, entry)

    // 更新依赖关系
    this.updateDependencies(key, entry.dependencies)

    // 保存版本历史
    if (this.options.enableVersioning) {
      this.saveVersion(key, entry)
    }

    // 触发变更事件
    const change: ConfigChange = {
      path: key,
      oldValue: existing?.value,
      newValue: value,
      timestamp,
      type: existing ? 'modified' : 'added',
      source: options.source || 'unknown',
    }

    this.emit('changed', change)
    this.emit(`changed:${key}`, change)

    // 清理过期条目
    this.cleanup()
  }

  /**
   * 获取配置值
   */
  get<T = unknown>(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.emit('miss', key)
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.delete(key)
      this.emit('expired', key)
      return undefined
    }

    this.emit('hit', key)
    return this.restoreValue(entry.value) as T
  }

  /**
   * 检查配置是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * 删除配置
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    this.cache.delete(key)
    this.dependencies.delete(key)

    // 触发删除事件
    const change: ConfigChange = {
      path: key,
      oldValue: entry.value,
      newValue: undefined,
      timestamp: Date.now(),
      type: 'deleted',
      source: 'manual',
    }

    this.emit('changed', change)
    this.emit(`deleted:${key}`, change)

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    const keys = Array.from(this.cache.keys())
    this.cache.clear()
    this.dependencies.clear()
    this.versions.clear()
    this.currentVersion = 0

    this.emit('cleared', keys)
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: number
    oldestEntry: number
    newestEntry: number
  } {
    const entries = Array.from(this.cache.values())
    const timestamps = entries.map(e => e.timestamp)

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.calculateMemoryUsage(),
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    }
  }

  /**
   * 智能重载配置
   */
  smartReload(changes: Record<string, unknown>, source = 'reload'): ConfigChange[] {
    const configChanges: ConfigChange[] = []

    for (const [key, newValue] of Object.entries(changes)) {
      const oldEntry = this.cache.get(key)
      const newHash = this.generateHash(newValue)

      // 只有当值真正发生变化时才更新
      if (!oldEntry || oldEntry.hash !== newHash) {
        this.set(key, newValue, { source })

        configChanges.push({
          path: key,
          oldValue: oldEntry?.value,
          newValue,
          timestamp: Date.now(),
          type: oldEntry ? 'modified' : 'added',
          source,
        })
      }
    }

    // 触发批量变更事件
    if (configChanges.length > 0) {
      this.emit('batchChanged', configChanges)
    }

    return configChanges
  }

  /**
   * 获取配置依赖
   */
  getDependencies(key: string): string[] {
    const deps = this.dependencies.get(key)
    return deps ? Array.from(deps) : []
  }

  /**
   * 获取依赖于指定配置的其他配置
   */
  getDependents(key: string): string[] {
    const dependents: string[] = []

    for (const [configKey, deps] of this.dependencies.entries()) {
      if (deps.has(key)) {
        dependents.push(configKey)
      }
    }

    return dependents
  }

  /**
   * 获取配置版本历史
   */
  getVersionHistory(key: string): ConfigCacheEntry[] {
    return this.versions.get(key) || []
  }

  /**
   * 回滚到指定版本
   */
  rollbackToVersion(key: string, version: number): boolean {
    const history = this.versions.get(key)
    if (!history) {
      return false
    }

    const targetEntry = history.find(entry => entry.version === version)
    if (!targetEntry) {
      return false
    }

    this.set(key, targetEntry.value, { source: 'rollback' })
    return true
  }

  // 私有方法

  private generateHash(value: unknown): string {
    const serialized = this.serializeForHash(value)
    return createHash('sha256').update(serialized).digest('hex')
  }

  private processValue(value: unknown): unknown {
    // 这里可以添加压缩和加密逻辑
    return value
  }

  private restoreValue(value: unknown): unknown {
    // 这里可以添加解压缩和解密逻辑
    return value
  }

  private isExpired(entry: ConfigCacheEntry): boolean {
    if (!entry.ttl) {
      return false
    }
    return Date.now() - entry.timestamp > entry.ttl
  }

  private updateDependencies(key: string, dependencies: string[]): void {
    this.dependencies.set(key, new Set(dependencies))
  }

  private saveVersion(key: string, entry: ConfigCacheEntry): void {
    if (!this.versions.has(key)) {
      this.versions.set(key, [])
    }

    const history = this.versions.get(key)!
    history.push({ ...entry })

    // 限制版本数量
    if (history.length > this.options.maxVersions) {
      history.shift()
    }
  }

  private cleanup(): void {
    if (this.cache.size <= this.options.maxSize) {
      return
    }

    // 删除过期条目
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.delete(key)
      }
    }

    // 如果还是超过限制，删除最旧的条目
    if (this.cache.size > this.options.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toDelete = entries.slice(0, entries.length - this.options.maxSize)
      for (const [key] of toDelete) {
        this.delete(key)
      }
    }
  }

  private calculateHitRate(): number {
    // 这里需要实现命中率计算逻辑
    return 0
  }

  private calculateMemoryUsage(): number {
    // 这里需要实现内存使用量计算逻辑
    return 0
  }

  /**
   * 将值序列化为用于哈希的稳定字符串（对象键排序）
   */
  private serializeForHash(value: unknown): string {
    if (value === null || value === undefined) {
      return String(value)
    }
    const t = typeof value
    if (t === 'string' || t === 'number' || t === 'boolean') {
      return JSON.stringify(value)
    }
    if (Array.isArray(value)) {
      const items = value.map(v => this.serializeForHash(v)).join(',')
      return `[${items}]`
    }
    if (this.isRecord(value)) {
      const keys = Object.keys(value).sort()
      const parts = keys.map((k) => {
        const v = (value as Record<string, unknown>)[k]
        return `${JSON.stringify(k)}:${this.serializeForHash(v)}`
      })
      return `{${parts.join(',')}}`
    }
    // Fallback for other types (functions, symbols, bigint, etc.)
    try {
      return JSON.stringify(value)
    }
    catch {
      return String(value)
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
