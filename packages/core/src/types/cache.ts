/**
 * 缓存管理类型定义
 */

/**
 * 缓存策略
 */
export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'ttl'

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 最大缓存数量 */
  maxSize?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 缓存策略 */
  strategy?: CacheStrategy
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 最大内存占用（字节），超过后自动驱逐 */
  maxMemory?: number
  /** 缓存大小警告阈值 */
  warnOnLargeCacheSize?: number
}

/**
 * 缓存项
 */
export interface CacheEntry<T = any> {
  value: T
  expires?: number
  createdAt: number
  accessCount: number
  lastAccessed: number
  /** 数据大小（字节，估算值） */
  size?: number
}

/**
 * 缓存统计
 */
export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
  evictions: number
  /** 内存占用（字节，估算值） */
  memoryUsage?: number
}

/**
 * 缓存管理器接口
 */
export interface CacheManager {
  /** 设置缓存 */
  set<T = any>(key: string, value: T, ttl?: number): void

  /** 获取缓存 */
  get<T = any>(key: string): T | undefined

  /** 检查缓存是否存在 */
  has(key: string): boolean

  /** 删除缓存 */
  delete(key: string): boolean

  /** 清空所有缓存 */
  clear(): void

  /** 获取缓存大小 */
  size(): number

  /** 获取所有键 */
  keys(): string[]

  /** 获取缓存统计 */
  getStats(): CacheStats

  /** 清理过期缓存 */
  cleanup(): void

  /** 批量预热缓存 */
  warmup?(loaders: Array<{
    key: string
    loader: () => Promise<any> | any
    ttl?: number
  }>): Promise<void>

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

