/**
 * @ldesign/engine/utils - 工具模块
 *
 * 提供各种工具函数和实用工具
 */

// 配置管理
export {
  CompositeConfigLoader,
  EnvironmentConfigLoader,
  JsonConfigLoader,
  LocalStorageConfigLoader,
  MemoryConfigLoader,
} from './config/loaders'

export type {
  ConfigLoader,
  ConfigObject,
  ConfigValue,
} from './config/loaders'

// 基础工具函数
export {
  chunk,
  debounce,
  deepClone,
  delay,
  formatFileSize,
  formatTime,
  generateId,
  getNestedValue,
  groupBy,
  isEmpty,
  isFunction,
  isObject,
  isPromise,
  retry,
  safeJsonParse,
  safeJsonStringify,
  setNestedValue,
  throttle,
  unique
} from './utils/index'

// 快速设置工具 - 简化API使用
export {
  getDefaultCache,
  getDefaultLogger,
  lightCache,
  lightLogger,
  quickCache,
  quickLogger,
  quickPerformance,
  quickSetup,
  type QuickSetupResult
} from './utils/quick-setup'

// 懒加载工具
export {
  clearCache as clearLazyCache,
  getCacheStats as getLazyCacheStats,
  lazyComponent,
  lazyLoad,
  preload,
  preloadBatch,
  smartPreloader,
  SmartPreloader
} from './utils/lazy-loader'
