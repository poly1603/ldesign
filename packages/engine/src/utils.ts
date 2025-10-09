/**
 * @ldesign/engine/utils - 工具模块
 *
 * 提供各种工具函数和实用工具
 */

// Bundle优化工具
export {
  BundleOptimizer,
  dynamicImport,
  globalBundleOptimizer,
  LazyLoad,
  preloadCriticalModules
} from './utils/bundle-optimizer'

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
export {
  applyConfigDefaults,
  ConfigValidators,
  validateConfig,
  validateConfigType,
} from './utils/config-validators'
export type {
  ConfigChangeEvent,
  ConfigSchema,
  ConfigValidator,
} from './utils/config-validators'

// Core Web Vitals 监控
export {
  type CoreWebVitalsMetrics,
  CoreWebVitalsMonitor,
  getCoreWebVitals,
  getCoreWebVitalsScore,
  globalCoreWebVitalsMonitor,
  startCoreWebVitalsMonitoring
} from './utils/core-web-vitals'

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

// 日志系统
export {
  ConsoleLogHandler,
  createModuleLogger,
  EnhancedLogger,
  ErrorTracker,
  logger,
  LogLevel,
  MemoryLogHandler,
  RemoteLogHandler
} from './utils/logging-system'

// 内存管理工具
export {
  createManagedPromise,
  GlobalMemoryManager,
  ListenerManager,
  managedLifecycle,
  MemoryLeakDetector,
  memoryManager,
  ReferenceTracker,
  ResourceManager,
  TimerManager
} from './utils/memory-manager'

// 性能分析工具
export {
  BatchProcessor,
  globalPerformanceAnalyzer,
  measurePerformance,
  ObjectPool,
  PerformanceAnalyzer
} from './utils/performance-analyzer'

// 实时性能监控
export {
  getPerformanceAlerts,
  getRealtimePerformanceData,
  globalRealtimePerformanceMonitor,
  type PerformanceAlert,
  type PerformanceThresholds,
  type RealtimePerformanceData,
  RealtimePerformanceMonitor,
  startRealtimeMonitoring,
  stopRealtimeMonitoring
} from './utils/realtime-performance-monitor'

// 类型安全工具
export {
  isArray,
  isBoolean,
  isNumber,
  isString,
  isValidObject,
  PromiseUtil,
  safeAsync,
  safeDeepClone,
  safeFilter,
  safeGet,
  safeGetNested,
  safeJsonParse as safeJsonParseTyped,
  safeJsonStringify as safeJsonStringifyTyped,
  safeMap,
  safeMerge,
  TypedConfigWrapper
} from './utils/type-safety'
