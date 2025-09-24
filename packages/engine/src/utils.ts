/**
 * @ldesign/engine/utils - 工具模块
 * 
 * 提供各种工具函数和实用工具
 */

// 基础工具函数
export {
  deepClone,
  debounce,
  throttle,
  generateId,
  isEmpty,
  formatFileSize,
  formatTime,
  safeJsonParse,
  safeJsonStringify,
  getNestedValue,
  setNestedValue,
  isFunction,
  isObject,
  isPromise,
  delay,
  retry,
  unique,
  groupBy,
  chunk
} from './utils/index'

// 类型安全工具
export {
  isArray,
  isBoolean,
  isNumber,
  isString,
  isValidObject,
  safeAsync,
  safeDeepClone,
  safeFilter,
  safeGet,
  safeGetNested,
  safeJsonParse as safeJsonParseTyped,
  safeJsonStringify as safeJsonStringifyTyped,
  safeMap,
  safeMerge,
  TypedConfigWrapper,
  PromiseUtil
} from './utils/type-safety'

// 性能分析工具
export {
  PerformanceAnalyzer,
  measurePerformance,
  debounce as performanceDebounce,
  throttle as performanceThrottle,
  ObjectPool,
  BatchProcessor,
  globalPerformanceAnalyzer
} from './utils/performance-analyzer'

// Core Web Vitals 监控
export {
  CoreWebVitalsMonitor,
  globalCoreWebVitalsMonitor,
  startCoreWebVitalsMonitoring,
  getCoreWebVitals,
  getCoreWebVitalsScore,
  type CoreWebVitalsMetrics
} from './utils/core-web-vitals'

// 实时性能监控
export {
  RealtimePerformanceMonitor,
  globalRealtimePerformanceMonitor,
  startRealtimeMonitoring,
  stopRealtimeMonitoring,
  getRealtimePerformanceData,
  getPerformanceAlerts,
  type RealtimePerformanceData,
  type PerformanceAlert,
  type PerformanceThresholds
} from './utils/realtime-performance-monitor'

// 内存管理工具
export {
  GlobalMemoryManager,
  memoryManager,
  TimerManager,
  ListenerManager,
  ResourceManager,
  MemoryLeakDetector,
  ReferenceTracker,
  managedLifecycle,
  createManagedPromise
} from './utils/memory-manager'

// Bundle优化工具
export {
  BundleOptimizer,
  LazyLoad,
  dynamicImport,
  preloadCriticalModules,
  globalBundleOptimizer
} from './utils/bundle-optimizer'

// 日志系统
export {
  EnhancedLogger,
  logger,
  createModuleLogger,
  LogLevel,
  ConsoleLogHandler,
  MemoryLogHandler,
  RemoteLogHandler,
  ErrorTracker
} from './utils/logging-system'

// 配置管理
export {
  EnhancedConfigManager,
  createEnhancedConfigManager,
  ConfigValidators,
  JsonConfigLoader,
  EnvironmentConfigLoader,
  MemoryConfigLoader
} from './utils/config-manager'
