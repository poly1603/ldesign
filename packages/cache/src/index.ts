// 核心功能
// 导入类型
import type { CacheOptions } from './types'
import { CacheManager } from './core/cache-manager'
import { StorageEngineFactory } from './engines/factory'

export { CacheManager } from './core/cache-manager'
// Engine 插件（按字母序应在 strategies 前）
export { createCacheEnginePlugin } from './engine/plugin'
export type { CacheEnginePluginOptions } from './engine/plugin'
export { BaseStorageEngine } from './engines/base-engine'

export { CookieEngine } from './engines/cookie-engine'

// 存储引擎
export { StorageEngineFactory } from './engines/factory'
export { IndexedDBEngine } from './engines/indexeddb-engine'
export { LocalStorageEngine } from './engines/local-storage-engine'
export { MemoryEngine } from './engines/memory-engine'
export { SessionStorageEngine } from './engines/session-storage-engine'
export { AESCrypto } from './security/aes-crypto'
export { KeyObfuscator } from './security/key-obfuscator'

// 安全
export { SecurityManager } from './security/security-manager'

// 策略
export { StorageStrategy } from './strategies/storage-strategy'
export * from './strategies/eviction-strategies'

// 命名空间与同步
export { CacheNamespace, createNamespace } from './core/namespace-manager'
export type { NamespaceOptions } from './core/namespace-manager'
export { SyncManager } from './core/sync-manager'
export type { SyncOptions } from './core/sync-manager'
export { WarmupManager, createWarmupManager } from './core/warmup-manager'
export { WarmupManager as CacheWarmupManager } from './core/warmup-manager'
export { CacheAnalyzer, createCacheAnalyzer } from './core/cache-analyzer'
export type { AnalysisReport, OptimizationSuggestion, AccessPattern, PerformanceMetrics as AnalyzerPerformanceMetrics } from './core/cache-analyzer'

// 核心导出
export * from './types'
export * from './utils'

// 性能监控与容错
export { PerformanceMonitor } from './core/performance-monitor'
export type { PerformanceMetrics as MonitorPerformanceMetrics, PerformanceStats, PerformanceMonitorOptions } from './core/performance-monitor'
export * from './utils/retry-manager'

/**
 * 创建缓存管理器实例
 */
export function createCache(options?: CacheOptions) {
  return new CacheManager(options)
}

/**
 * 获取（懒初始化）默认缓存管理器实例
 * 避免在 SSR/Node 环境下提前触发浏览器 API 导致报错
 */
let _defaultCache: CacheManager | null = null
export function getDefaultCache(options?: CacheOptions): CacheManager {
  if (!_defaultCache) {
    _defaultCache = new CacheManager(options)
  }
  return _defaultCache
}

/**
 * 统一简洁的 API：按需获取单例并执行操作（不提前创建实例）
 */
export const cache = {
  /** 获取缓存值（泛型推断） */
  get<T = any>(key: string) {
    return getDefaultCache().get<T>(key)
  },
  /** 设置缓存值 */
  set<T = any>(key: string, value: T, options?: import('./types').SetOptions) {
    return getDefaultCache().set<T>(key, value, options)
  },
  /** 删除指定键 */
  remove(key: string) {
    return getDefaultCache().remove(key)
  },
  /** 清空缓存（可指定引擎） */
  clear(engine?: import('./types').StorageEngine) {
    return getDefaultCache().clear(engine)
  },
  /** 判断键是否存在 */
  has(key: string) {
    return getDefaultCache().has(key)
  },
  /** 获取键列表 */
  keys(engine?: import('./types').StorageEngine) {
    return getDefaultCache().keys(engine)
  },
  /** 获取统计信息 */
  getStats() {
    return getDefaultCache().getStats()
  },
  /** 记忆函数：不存在则计算并写入 */
  remember<T = any>(
    key: string,
    fetcher: () => Promise<T> | T,
    options?: import('./types').SetOptions & { refresh?: boolean },
  ) {
    return getDefaultCache().remember<T>(key, fetcher, options)
  },
  /** 获取管理器实例 */
  manager(): CacheManager {
    return getDefaultCache()
  },
}

// 默认导出
export default {
  CacheManager,
  createCache,
  getDefaultCache,
  cache,
  StorageEngineFactory,
}
