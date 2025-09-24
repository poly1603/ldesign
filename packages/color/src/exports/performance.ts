/**
 * 性能优化功能导出模块
 * 包含缓存、闲时处理、性能监控等功能
 */

// 闲时处理器
export {
  addIdleTask,
  addIdleTasks,
  createConditionalIdleTask,
  createDelayedIdleTask,
  createIdleProcessor,
  defaultIdleProcessor,
  getDefaultProcessorStatus,
  IdleProcessorImpl,
  supportsIdleCallback,
} from '../utils/idle-processor'

export type { IdleProcessorOptions } from '../utils/idle-processor'

// 性能优化工具
export {
  BatchProcessor,
  debounce,
  memoize,
  PerformanceMonitor,
  RAFScheduler,
  throttle,
  withPerformance,
} from '../utils/performance'

export type { BatchOptions, DebounceOptions, ThrottleOptions } from '../utils/performance'

// 缓存系统
export { cached, createColorCache, createThemeCache, SmartCache } from '../utils/smart-cache'

export type {
  CacheMetadata,
  CacheStats,
  CacheStrategy,
  SmartCacheConfig,
} from '../utils/smart-cache'

// Worker 管理器
export {
  executeInWorker,
  getDefaultWorkerPool,
  isWorkerSupported,
  WorkerColorGenerator,
  WorkerPool,
} from '../utils/worker-manager'

export type { WorkerPoolOptions } from '../utils/worker-manager'
