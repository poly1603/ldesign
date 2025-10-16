/**
 * 核心模块
 * 导出核心功能
 */

// 基础 Store 类
export { BaseStore } from './BaseStore'

// 性能优化器
export { PerformanceOptimizer, CacheManager, PersistenceManager, DebounceManager, ThrottleManager } from './PerformanceOptimizer'

// 增强版性能优化器
export {
  EnhancedPerformanceOptimizer,
  LazyLoadManager,
  PreloadManager,
  MemoryManager,
  ConcurrencyController,
  VirtualizationManager,
  ComputationOptimizer,
  RequestMerger
} from './EnhancedPerformance'

// 函数式 Store
export { createFunctionalStore, defineStore as defineFunctionalStore, defineStoreWithOptions } from './FunctionalStore'
export type { FunctionalStoreOptions, FunctionalStoreInstance } from './FunctionalStore'

// Composition Store
export { createCompositionStore, defineCompositionStore, defineCompositionStoreWithOptions } from './CompositionStore'
export type { CompositionStoreContext, CompositionStoreSetup, CompositionStoreOptions, CompositionStoreInstance } from './CompositionStore'

// Store 工厂
export { StoreFactory, factory, createClassStore, createStore, createCompositionStoreFactory, defineStore, StoreType } from './StoreFactory'
export type { ClassStoreOptions, FunctionalStoreFactoryOptions, CompositionStoreFactoryOptions, UnifiedStoreOptions } from './StoreFactory'

// 性能监控
export {
  getOptimizationSuggestions,
  MonitorAction,
  MonitorGetter,
  PerformanceMonitor,
  usePerformanceMonitor,
} from './performance'

export type { PerformanceMetrics } from './performance'
// Store 池管理
export { PooledStore, StorePool, useStorePool } from './storePool'

export type { StorePoolOptions } from './storePool'
// 工具函数
export * from './utils'

// 高级功能
export {
  BatchOperationManager,
  TransactionManager,
  SnapshotManager,
  TimeTravelDebugger,
  StateDiffer,
  StateValidator,
  MiddlewareSystem,
  createAdvancedStore,
  createMiddlewareSystem
} from './AdvancedFeatures'

export type {
  ActionInfo,
  Middleware,
  MiddlewareContext,
  LoggerOptions
} from './AdvancedFeatures'

// 持久化增强
export {
  EnhancedPersistenceManager,
  IndexedDBStorage,
  createEnhancedPersistence,
  PersistenceStrategy
} from './PersistenceEnhancement'

export type {
  StorageEngine,
  StateMigration,
  EnhancedPersistOptions
} from './PersistenceEnhancement'

// 智能预加载
export {
  SmartPreloader,
  createSmartPreloader,
  PreloadPriority,
  PreloadStrategy
} from './SmartPreloader'

export type {
  PreloadTask,
  PreloadResult
} from './SmartPreloader'

// 类型定义
export type {
  ActionDefinition,
  GetterDefinition,
  BaseStore as IBaseStore,
  PersistOptions,
  StateDefinition,
  StoreOptions,
} from '../types'
