/**
 * @ldesign/store - 现代化的 Vue 状态管理库
 *
 * 基于 Pinia 构建，提供装饰器、Hooks、类型安全等现代化特性
 * 支持多种使用方式：装饰器、函数式、Composition API
 */

import 'reflect-metadata'

// ============================================
// 核心模块导出
// ============================================

// 核心功能（包含 BaseStore, 性能优化器, Store工厂等）
export * from './core'

// 装饰器
export * from './decorators'

// Hooks
export * from './hooks'

// Vue 集成
export * from './vue'

// Engine 集成
export * from './engine'

// ============================================
// 工具函数导出
// ============================================

// 缓存工具
export {
  LRUCache,
  fastHash,
  ObjectPool,
} from './utils/cache'

// 性能监控（额外导出，方便直接使用）
export {
  PerformanceMonitor
} from './PerformanceMonitoring'

// DevTools（额外导出，方便直接使用）
export {
  StoreDevTools,
  DevToolsConnection,
  ConsoleFormatter,
  VisualInspector
} from './DevTools'

// ============================================
// 类型定义导出
// ============================================

export type {
  // 基础类型
  StateDefinition,
  ActionDefinition,
  GetterDefinition,
  StrictStateDefinition,
  StrictActionDefinition,
  StrictGetterDefinition,

  // 配置类型
  CacheOptions,
  StoreOptions,
  PersistOptions,

  // 元数据类型
  DecoratorMetadata,
  MutationCallback,
  ActionContext,

  // Store 接口
  IBaseStore,
  BaseStore as IBaseStoreAlias,
} from './types'

// 版本信息
export const version = '0.1.0'
