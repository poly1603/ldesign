// 核心功能
// 导入类型
import type { CacheOptions, SerializableValue } from './types'
import { CacheManager } from './core/cache-manager'
import { StorageEngineFactory } from './engines/factory'
import { getPresetOptions } from './presets'

export { CacheAnalyzer, createCacheAnalyzer } from './core/cache-analyzer'
export type { AccessPattern, AnalysisReport, PerformanceMetrics as AnalyzerPerformanceMetrics, OptimizationSuggestion } from './core/cache-analyzer'
export { CacheManager } from './core/cache-manager'
// 命名空间与同步
export { CacheNamespace, createNamespace } from './core/namespace-manager'

export type { NamespaceOptions } from './core/namespace-manager'

// 性能监控与容错
export { PerformanceMonitor } from './core/performance-monitor'
export type { PerformanceMetrics as MonitorPerformanceMetrics, PerformanceMonitorOptions, PerformanceStats } from './core/performance-monitor'
export { SyncManager } from './core/sync-manager'
export type { SyncOptions } from './core/sync-manager'
export { createWarmupManager, WarmupManager } from './core/warmup-manager'
export { WarmupManager as CacheWarmupManager } from './core/warmup-manager'
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

// 预设工厂（在安全模块之前）
export { createBrowserCache, createNodeCache, createOfflineCache, createSSRCache, getPresetOptions } from './presets'

export { AESCrypto } from './security/aes-crypto'
export { KeyObfuscator } from './security/key-obfuscator'
// 安全
export { SecurityManager } from './security/security-manager'


export * from './strategies/eviction-strategies'
// 策略
export { StorageStrategy } from './strategies/storage-strategy'

// 核心导出
export * from './types'
export * from './utils'
export { CircuitBreaker, RetryManager, withCircuitBreaker, withFallback } from './utils/retry-manager'


type DetectedPreset = 'browser' | 'ssr' | 'node' | 'offline'

function detectPreset(): DetectedPreset {
  // 浏览器（含 jsdom）优先
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser'
  }
  // 纯 Node 环境
  if (typeof process !== 'undefined' && (process as any).versions?.node) {
    return 'node'
  }
  // 其它环境（如 SSR 渲染器）
  return 'ssr'
}

/**
 * 创建缓存管理器实例
 * - 自动按环境选择预设（browser/node/ssr）
 * - 允许通过 options.preset 显式覆盖
 */
export function createCache(options?: CacheOptions & { preset?: DetectedPreset }) {
  const preset = (options as any)?.preset ?? detectPreset()
  const { preset: _omit, ...rest } = (options || {}) as any
  const merged = { ...getPresetOptions(preset), ...rest } as CacheOptions
  return new CacheManager(merged)
}

/**
 * 获取（懒初始化）默认缓存管理器实例
 * 避免在 SSR/Node 环境下提前触发浏览器 API 导致报错
 */
let _defaultCache: CacheManager | null = null
export function getDefaultCache(options?: CacheOptions & { preset?: DetectedPreset }): CacheManager {
  if (!_defaultCache) {
    _defaultCache = createCache(options)
  }
  return _defaultCache
}

/**
 * 统一简洁的 API：按需获取单例并执行操作（不提前创建实例）
 */
export const cache = {
  /** 获取缓存值（泛型推断） */
  get<T extends SerializableValue = SerializableValue>(key: string) {
    return getDefaultCache().get<T>(key)
  },
  /** 设置缓存值 */
  set<T extends SerializableValue = SerializableValue>(key: string, value: T, options?: import('./types').SetOptions) {
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
  remember<T extends SerializableValue = SerializableValue>(
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
