/**
 * 核心模块
 * 导出核心功能
 */

// 基础 Store 类
export { BaseStore } from './BaseStore'

// 工具函数
export * from './utils'

// 性能监控
export {
  MonitorAction,
  MonitorGetter,
  PerformanceMonitor,
  getOptimizationSuggestions,
  usePerformanceMonitor,
} from './performance'
export type { PerformanceMetrics } from './performance'

// Store 池管理
export {
  PooledStore,
  StorePool,
  useStorePool,
} from './storePool'
export type { StorePoolOptions } from './storePool'

// 类型定义
export type {
  ActionDefinition,
  GetterDefinition,
  BaseStore as IBaseStore,
  PersistOptions,
  StateDefinition,
  StoreOptions,
} from '@/types'
