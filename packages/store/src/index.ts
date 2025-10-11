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

// 高级缓存
export {
  CacheAnalyzer,
  AdaptiveCache,
  CacheWarmer,
  MultiLevelCache,
} from './utils/advanced-cache'

export type {
  CacheStats,
} from './utils/advanced-cache'

// 验证和错误处理工具
export {
  Validator,
  ValidationError,
  StoreConfigValidator,
  TypeGuards,
  Assert,
  AssertionError,
  ErrorHandler,
  safeJsonParse,
  safeJsonStringify,
} from './utils/validation'

export type {
  ValidationRule,
  ValidationResult,
} from './utils/validation'

// 辅助工具函数
export {
  deepClone,
  deepMerge,
  deepFreeze,
  getDeepValue,
  setDeepValue,
  deleteDeepValue,
  deepEqual,
  pick,
  omit,
  flattenObject,
  unflattenObject,
  debounce,
  throttle,
  delay,
  retry,
  memoize,
  batch,
  pLimit,
  generateId,
  formatBytes,
  formatDuration,
  safeKeys,
  safeValues,
  safeEntries,
  range,
  unique,
  uniqueBy,
  groupBy,
  sum,
  average,
  min,
  max,
  randomInt,
  randomItem,
  shuffle,
  chunk,
  zip,
  unzip,
  intersection,
  union,
  difference,
} from './utils/helpers'

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
// 类型定义导出

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

// 实用类型定义导出
export type {
  // 深度类型
  DeepReadonly,
  DeepPartial,
  DeepRequired,
  DeepMutable,
  DeepMerge,
  
  // 可空类型
  Nullable,
  Optional,
  Maybe,
  
  // 函数类型
  AnyFunction,
  AsyncFunction,
  FunctionArgs,
  FunctionReturn,
  
  // 对象类型
  AnyObject,
  EmptyObject,
  ValueOf,
  KeyOf,
  
  // 数组类型
  ArrayElement,
  ArrayType,
  Flatten,
  
  // 路径类型
  PathsOf,
  PathValue,
  
  // 条件类型
  If,
  Equals,
  
  // 修饰类型
  Mutable,
  Merge,
  Override,
  PartialBy,
  RequiredBy,
  ReadonlyBy,
  WritableBy,
  NullableBy,
  OptionalBy,
  
  // JSON 类型
  JSONValue,
  JSONObject,
  JSONArray,
  Serializable,
  
  // 其他实用类型
  Primitive,
  NonPrimitive,
  Class,
  AbstractClass,
  RequiredKeys,
  OptionalKeys,
  KeysOfType,
  FunctionKeys,
  NonFunctionKeys,
} from './types/utility-types'

// 版本信息
export const version = '0.1.0'
