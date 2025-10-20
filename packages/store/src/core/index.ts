/**
 * 核心模块
 * 导出核心功能
 */

// 类型定义
export type {
  ActionDefinition,
  GetterDefinition,
  BaseStore as IBaseStore,
  PersistOptions,
  StateDefinition,
  StoreOptions,
} from '../types'

// 高级功能
export {
  BatchOperationManager,
  createAdvancedStore,
  createMiddlewareSystem,
  MiddlewareSystem,
  SnapshotManager,
  StateDiffer,
  StateValidator,
  TimeTravelDebugger,
  TransactionManager
} from './AdvancedFeatures'

export type {
  ActionInfo,
  LoggerOptions,
  Middleware,
  MiddlewareContext
} from './AdvancedFeatures'

// 基础 Store 类
export { BaseStore } from './BaseStore'
// Composition Store
export { createCompositionStore, defineCompositionStore, defineCompositionStoreWithOptions } from './CompositionStore'

export type { CompositionStoreContext, CompositionStoreInstance, CompositionStoreOptions, CompositionStoreSetup } from './CompositionStore'
// 增强版性能优化器
export {
  ComputationOptimizer,
  ConcurrencyController,
  EnhancedPerformanceOptimizer,
  LazyLoadManager,
  MemoryManager,
  PreloadManager,
  RequestMerger,
  VirtualizationManager
} from './EnhancedPerformance'

// 函数式 Store
export { createFunctionalStore, defineStore as defineFunctionalStore, defineStoreWithOptions } from './FunctionalStore'
export type { FunctionalStoreInstance, FunctionalStoreOptions } from './FunctionalStore'

// 内存监控
export {
  MemoryMonitor,
  useMemoryMonitor
} from './MemoryMonitor'

export type {
  MemoryLeakDetection,
  MemoryMonitorConfig,
  MemoryUsageInfo
} from './MemoryMonitor'
// 性能监控
export {
  getOptimizationSuggestions,
  MonitorAction,
  MonitorGetter,
  PerformanceMonitor,
  usePerformanceMonitor,
} from './performance'

export type { PerformanceMetrics } from './performance'
// 性能优化器
export { CacheManager, DebounceManager, PerformanceOptimizer, PersistenceManager, ThrottleManager } from './PerformanceOptimizer'

// 性能报告
export {
  generatePerformanceReport,
  PerformanceReporter,
  usePerformanceReporter
} from './PerformanceReporter'

export type {
  PerformanceReport,
  ReportConfig
} from './PerformanceReporter'

// 持久化增强
export {
  createEnhancedPersistence,
  EnhancedPersistenceManager,
  IndexedDBStorage,
  PersistenceStrategy
} from './PersistenceEnhancement'

export type {
  EnhancedPersistOptions,
  StateMigration,
  StorageEngine
} from './PersistenceEnhancement'

// 响应式系统优化
export {
  batchUpdate,
  BatchUpdateManager,
  batchUpdateManager,
  batchUpdateSync,
  ComputedOptimizer,
  DependencyTracker,
  dependencyTracker,
  memoryManager,
  ReactiveOptimizer,
  reactiveOptimizer,
  SmartCacheManager,
  VirtualProxy,
  waitForUpdates
} from './ReactiveSystem'

// 智能预加载
export {
  createSmartPreloader,
  PreloadPriority,
  PreloadStrategy,
  SmartPreloader
} from './SmartPreloader'

export type {
  PreloadResult,
  PreloadTask
} from './SmartPreloader'

// Store 工厂
export { createClassStore, createCompositionStoreFactory, createStore, defineStore, factory, StoreFactory, StoreType } from './StoreFactory'

export type { ClassStoreOptions, CompositionStoreFactoryOptions, FunctionalStoreFactoryOptions, UnifiedStoreOptions } from './StoreFactory'

// Store 池管理
export { PooledStore, StorePool, useStorePool } from './storePool'

export type { StorePoolOptions } from './storePool'

// 工具函数
export * from './utils'
