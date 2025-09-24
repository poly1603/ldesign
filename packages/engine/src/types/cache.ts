/**
 * 缓存类型定义
 * 包含缓存管理器、缓存策略等相关类型
 */

import type { CacheStrategy } from './base'

// 缺失的缓存类型，供高级缓存与存储实现使用
export interface CacheOptions {
  ttl?: number
  metadata?: Record<string, unknown>
}

// 缓存存储配置
export interface CacheStorageConfig {
  prefix?: string
  maxSize?: number
  ttl?: number
  compression?: boolean
  encryption?: boolean
  encryptionKey?: string
  namespace?: string
}

// 内存缓存配置
export interface MemoryCacheConfig extends CacheStorageConfig {
  maxMemoryUsage?: number
  gcInterval?: number
}

// 本地存储缓存配置
export interface LocalStorageCacheConfig extends CacheStorageConfig {
  storageKey?: string
  quotaLimit?: number
}

// IndexedDB缓存配置
export interface IndexedDBCacheConfig extends CacheStorageConfig {
  dbName?: string
  storeName?: string
  version?: number
}

export interface CacheItem<T = unknown> {
  value: T
  expiry?: number
  metadata?: Record<string, unknown>
}

export interface CacheStorage {
  get: <T>(key: string) => Promise<T | null>
  set: <T>(key: string, value: T, options?: CacheOptions) => Promise<void>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  getSize: () => Promise<number>
}

// 缓存条目接口
export interface CacheEntry<T = unknown> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccess: number
  size: number
}

// 缓存管理器接口
export interface CacheManager {
  get: <T = unknown>(key: string) => T | undefined
  set: <T = unknown>(key: string, value: T, ttl?: number) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
  values: () => unknown[]
  entries: () => [string, unknown][]
  getStats: () => CacheStats
  resetStats: () => void
  namespace: (name: string) => CacheManager
}

// 缓存统计接口
export interface CacheStats {
  hits: number
  misses: number
  total: number
  size: number
  maxSize: number
  hitRate: number
  averageAccessTime: number
  evictions: number
  byStrategy: Record<CacheStrategy, number>
}

// 缓存策略接口
export interface CacheStrategyInterface {
  name: CacheStrategy
  shouldEvict: (entries: CacheEntry[]) => string[]
  getEvictionCandidates: (entries: CacheEntry[], count: number) => string[]
  optimize: (entries: CacheEntry[]) => void
}

// 缓存持久化接口
export interface CachePersistence {
  save: (cache: Record<string, CacheEntry>) => Promise<void>
  load: () => Promise<Record<string, CacheEntry> | null>
  clear: () => Promise<void>
  getSize: () => Promise<number>
}

// 缓存同步接口
export interface CacheSync {
  sync: (cache: Record<string, CacheEntry>) => Promise<void>
  getLastSync: () => Date | null
  isSyncing: () => boolean
  onSync: (callback: (cache: Record<string, CacheEntry>) => void) => () => void
  onSyncError: (callback: (error: Error) => void) => void
}

// 缓存压缩接口
export interface CacheCompression {
  compress: (data: string) => string
  decompress: (data: string) => string
  getCompressionRatio: () => number
  isCompressed: (data: string) => boolean
}

// 缓存加密接口
export interface CacheEncryption {
  encrypt: (data: string, key: string) => string
  decrypt: (data: string, key: string) => string
  generateKey: () => string
  validateKey: (key: string) => boolean
}

// 缓存清理接口
export interface CacheCleanup {
  schedule: (interval: number) => void
  cancel: () => void
  isScheduled: () => boolean
  cleanup: () => Promise<number>
  getLastCleanup: () => Date | null
}

// 缓存监控接口
export interface CacheMonitor {
  onHit: (callback: (key: string, value: unknown) => void) => () => void
  onMiss: (callback: (key: string) => void) => () => void
  onEviction: (callback: (key: string, reason: string) => void) => () => void
  onSizeChange: (
    callback: (oldSize: number, newSize: number) => void
  ) => () => void
}
