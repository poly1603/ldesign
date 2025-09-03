/**
 * @ldesign/store - 现代化的 Vue 状态管理库
 *
 * 基于 Pinia 构建，提供装饰器、Hooks、类型安全等现代化特性
 * 支持多种使用方式：装饰器、函数式、Composition API
 */

import 'reflect-metadata'

// 核心功能
export * from './core'

// 性能优化器
export {
  PerformanceOptimizer,
  CacheManager,
  PersistenceManager,
  DebounceManager,
  ThrottleManager,
} from './core/PerformanceOptimizer'

// 函数式 Store
export {
  createFunctionalStore,
  defineStore as defineFunctionalStore,
  defineStoreWithOptions,
} from './core/FunctionalStore'
export type {
  FunctionalStoreOptions,
  FunctionalStoreInstance,
} from './core/FunctionalStore'

// Composition Store
export {
  createCompositionStore,
  defineCompositionStore,
  defineCompositionStoreWithOptions,
} from './core/CompositionStore'
export type {
  CompositionStoreContext,
  CompositionStoreSetup,
  CompositionStoreOptions,
  CompositionStoreInstance,
} from './core/CompositionStore'

// Store 工厂
export {
  StoreFactory,
  factory,
  createClassStore,
  createStore,
  createCompositionStoreFactory,
  defineStore,
  StoreType,
} from './core/StoreFactory'
export type {
  ClassStoreOptions,
  FunctionalStoreFactoryOptions,
  CompositionStoreFactoryOptions,
  UnifiedStoreOptions,
} from './core/StoreFactory'

// 装饰器
export * from './decorators'

// Hooks
export * from './hooks'

// Vue 集成
export * from './vue'

// Engine 集成
export * from './engine'

// 类型定义
export type {
  StateDefinition,
  ActionDefinition,
  GetterDefinition,
  StrictStateDefinition,
  StrictActionDefinition,
  StrictGetterDefinition,
  CacheOptions,
  StoreOptions,
  PersistOptions,
  DecoratorMetadata,
  MutationCallback,
  ActionContext,
  IBaseStore,
  BaseStore as IBaseStoreAlias,
} from './types'

// 版本信息
export const version = '0.1.0'
