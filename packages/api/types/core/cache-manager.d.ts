import { CacheConfig } from '../types/index.js'

/**
 * 缓存管理器
 */
declare class CacheManager {
  /** 配置 */
  private readonly config
  /** 内存缓存 */
  private readonly memoryCache
  /** 缓存统计 */
  private readonly stats
  constructor(config: CacheConfig)
  /**
   * 获取缓存
   */
  get<T = unknown>(key: string): Promise<T | null>
  /**
   * 设置缓存
   */
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>
  /**
   * 删除缓存
   */
  delete(key: string): Promise<void>
  /**
   * 清空所有缓存
   */
  clear(): Promise<void>
  /**
   * 检查缓存是否存在
   */
  has(key: string): Promise<boolean>
  /**
   * 获取缓存统计
   */
  getStats(): {
    size: number
    hitRate: number
    hits: number
    misses: number
    sets: number
    deletes: number
    clears: number
  }
  /**
   * 获取缓存项（根据存储类型）
   */
  private getItem
  /**
   * 设置缓存项（根据存储类型）
   */
  private setItem
  /**
   * 删除缓存项（根据存储类型）
   */
  private deleteItem
  /**
   * 清空所有缓存项（根据存储类型）
   */
  private clearItems
  /**
   * 强制执行最大缓存大小限制
   */
  private enforceMaxSize
  /**
   * 启动清理定时器
   */
  private startCleanupTimer
  /**
   * 清理过期的缓存项
   */
  private cleanupExpiredItems
}

export { CacheManager }
