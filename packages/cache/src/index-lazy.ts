/**
 * @ldesign/cache - 懒加载入口
 * 
 * 提供按需加载的缓存管理功能，减小初始包体积
 */

// 核心模块 - 立即加载
export { CacheManager } from './core/cache-manager'
export type { CacheEvent, CacheOptions, SetOptions } from './types'

// 懒加载模块
export const lazyModules = {
  // 性能监控 - 按需加载
  async loadPerformanceMonitor() {
    const { PerformanceMonitor } = await import('./core/performance-monitor')
    return { PerformanceMonitor }
  },

  // 同步管理 - 按需加载
  async loadSyncManager() {
    const { SyncManager } = await import('./core/sync-manager')
    return { SyncManager }
  },

  // 预热管理 - 按需加载
  async loadWarmupManager() {
    const { WarmupManager, createWarmupManager } = await import('./core/warmup-manager')
    return { WarmupManager, createWarmupManager }
  },

  // 缓存分析 - 按需加载
  async loadCacheAnalyzer() {
    const { CacheAnalyzer, createCacheAnalyzer } = await import('./core/cache-analyzer')
    return { CacheAnalyzer, createCacheAnalyzer }
  },

  // 命名空间管理 - 按需加载
  async loadNamespaceManager() {
    const { CacheNamespace, createNamespace } = await import('./core/namespace-manager')
    return { CacheNamespace, createNamespace }
  },

  // 存储引擎 - 按需加载
  async loadEngines() {
    const [
      { MemoryEngine },
      { LocalStorageEngine },
      { SessionStorageEngine },
      { IndexedDBEngine },
      { CookieEngine },
    ] = await Promise.all([
      import('./engines/memory-engine'),
      import('./engines/local-storage-engine'),
      import('./engines/session-storage-engine'),
      import('./engines/indexeddb-engine'),
      import('./engines/cookie-engine'),
    ])
    
    return {
      MemoryEngine,
      LocalStorageEngine,
      SessionStorageEngine,
      IndexedDBEngine,
      CookieEngine,
    }
  },

  // 安全模块 - 按需加载
  async loadSecurity() {
    const [
      { SecurityManager },
      { AESCrypto },
      { KeyObfuscator },
    ] = await Promise.all([
      import('./security/security-manager'),
      import('./security/aes-crypto'),
      import('./security/key-obfuscator'),
    ])
    
    return {
      SecurityManager,
      AESCrypto,
      KeyObfuscator,
    }
  },

  // 策略模块 - 按需加载
  async loadStrategies() {
    const [
      { StorageStrategy },
      evictionStrategies,
    ] = await Promise.all([
      import('./strategies/storage-strategy'),
      import('./strategies/eviction-strategies'),
    ])
    
    return {
      StorageStrategy,
      ...evictionStrategies,
    }
  },

  // 工具模块 - 按需加载
  async loadUtils() {
    const utils = await import('./utils/index')
    return utils
  },

  // Vue 集成 - 按需加载
  async loadVue() {
    const [
      { useCache },
      { useCacheStats },
      vueHelpers,
      { CacheProvider },
    ] = await Promise.all([
      import('./vue/use-cache'),
      import('./vue/use-cache-stats'),
      import('./vue/use-cache-helpers'),
      import('./vue/cache-provider'),
    ])

    return {
      useCache,
      useCacheStats,
      ...vueHelpers,
      CacheProvider,
    }
  },

  // 预设配置 - 按需加载
  async loadPresets() {
    const presets = await import('./presets')
    return presets
  },
}

/**
 * 创建懒加载的缓存管理器
 * 只加载核心功能，其他功能按需加载
 */
export async function createLazyCacheManager(options?: any) {
  const { CacheManager } = await import('./core/cache-manager')
  return new CacheManager(options)
}

/**
 * 批量加载常用模块
 */
export async function loadCommonModules() {
  const [engines, utils] = await Promise.all([
    lazyModules.loadEngines(),
    lazyModules.loadUtils(),
  ])
  
  return { ...engines, ...utils }
}

/**
 * 批量加载高级功能模块
 */
export async function loadAdvancedModules() {
  const [
    performanceMonitor,
    syncManager,
    warmupManager,
    cacheAnalyzer,
  ] = await Promise.all([
    lazyModules.loadPerformanceMonitor(),
    lazyModules.loadSyncManager(),
    lazyModules.loadWarmupManager(),
    lazyModules.loadCacheAnalyzer(),
  ])
  
  return {
    ...performanceMonitor,
    ...syncManager,
    ...warmupManager,
    ...cacheAnalyzer,
  }
}

/**
 * 批量加载所有模块
 */
export async function loadAllModules() {
  const [
    engines,
    security,
    strategies,
    utils,
    vue,
    presets,
    advanced,
  ] = await Promise.all([
    lazyModules.loadEngines(),
    lazyModules.loadSecurity(),
    lazyModules.loadStrategies(),
    lazyModules.loadUtils(),
    lazyModules.loadVue(),
    lazyModules.loadPresets(),
    loadAdvancedModules(),
  ])
  
  return {
    ...engines,
    ...security,
    ...strategies,
    ...utils,
    ...vue,
    ...presets,
    ...advanced,
  }
}

// 默认导出懒加载模块
export default lazyModules
