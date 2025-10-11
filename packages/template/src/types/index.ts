/**
 * 类型定义导出文件
 *
 * 导出所有类型定义
 */

// ========== 通用类型系统 ==========
export * from './common'
export * from './guards'

// 避免重复导出，使用具名导出
export * from './animation'
export {
  type CacheConfig,
  type DeviceDetectionConfig,
  type PreloadStrategyConfig,
  type ScannerConfig,
  type TemplateSystemConfig,
  type ConfigValidationResult,
  type LoaderConfig,
  type FileNamingConfig,
  type PerformanceConfig,
  type ErrorHandlingConfig,
  type DevtoolsConfig,
  type ConfigListener,
  type ConfigManager,
  type ConfigUpdateEvent,
  type LogLevel,
  type CacheStrategy,
  type PreloadMode
} from './config'

// 从模板类型导出 TemplateConfig，避免错误地从 config 导出
export { type TemplateConfig } from './template'

export {
  type TemplatePluginOptions,
  type PluginState,
  type PluginOptions
} from './plugin'

export * from './strict-types'

export {
  type DeviceType,
  type TemplateMetadata,
  type TemplateIndex,
  type TemplateRendererAnimationConfig,
  type TemplateSelectorConfig,
  type TemplateRendererProps,
  type UseTemplateOptions,
  type UseTemplateReturn,
  type UseSimpleTemplateOptions,
  type UseSimpleTemplateReturn,
  type UseTemplateListReturn,
  type ExtendedTemplateMetadata,
  type TemplateManagerConfig,
  type LoadResult,
  type TemplateInfo,
  type TemplateEvents,
  type EventListener,
  type PreloadStrategy,
  type FileChangeEvent
} from './template'

export * from './template-categories'

// 导出工厂函数类型
export * from './factory'

// 导出性能相关类型
export * from './performance'

// ========== 类型约束常量 ==========

/**
 * 设备类型枚举
 */
export const DeviceTypes = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
} as const

/**
 * 加载优先级枚举
 */
export const LoadPriorities = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

/**
 * 缓存策略枚举
 */
export const CacheStrategies = {
  LRU: 'lru',
  LFU: 'lfu',
  FIFO: 'fifo',
  TTL: 'ttl',
  HYBRID: 'hybrid',
} as const

/**
 * 错误严重级别枚举
 */
export const ErrorSeverities = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const

/**
 * 动画类型枚举
 */
export const AnimationTypes = {
  FADE: 'fade',
  SLIDE: 'slide',
  SCALE: 'scale',
  ROTATE: 'rotate',
  CUSTOM: 'custom',
} as const

// ========== 类型辅助工具 ==========

/**
 * 提取枚举值类型
 */
export type ExtractEnum<T> = T[keyof T]

/**
 * 字面量值类型
 */
export type LiteralUnion<T extends U, U = string> = T | (U & { _?: never })

/**
 * 排除函数类型
 */
export type ExcludeFunctions<T> = Pick<
  T,
  { [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K }[keyof T]
>

/**
 * 只提取函数类型
 */
export type OnlyFunctions<T> = Pick<
  T,
  { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T]
>

/**
 * 可变参数函数类型
 */
export type VariadicFunction<T = unknown, R = unknown> = (...args: T[]) => R

/**
 * 严格的 Omit
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 严格的 Pick
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>

/**
 * 可选化指定属性
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必填化指定属性
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 只读化指定属性
 */
export type ReadonlyBy<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>

/**
 * 可写化指定属性
 */
export type WritableBy<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] }

/**
 * 扁平化对象类型
 */
export type Flatten<T> = T extends object
  ? { [K in keyof T]: T[K] }
  : T

/**
 * 递归扁平化
 */
export type DeepFlatten<T> = T extends object
  ? { [K in keyof T]: DeepFlatten<T[K]> }
  : T

/**
 * Promise 包装类型
 */
export type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K]
}

/**
 * 函数返回值提取
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * 递归 Promise 解包
 */
export type DeepUnwrapPromise<T> = T extends Promise<infer U>
  ? DeepUnwrapPromise<U>
  : T

/**
 * 可空属性提取
 */
export type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never
}[keyof T]

/**
 * 非空属性提取
 */
export type NonNullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? never : K
}[keyof T]

/**
 * 函数参数提取（支持多个）
 */
export type FirstParameter<T extends (...args: any[]) => any> = Parameters<T>[0]
export type SecondParameter<T extends (...args: any[]) => any> = Parameters<T>[1]
export type LastParameter<T extends (...args: any[]) => any> = Parameters<T> extends [...infer _, infer L]
  ? L
  : never

/**
 * 类型兼容性检查
 */
export type IsCompatible<T, U> = T extends U ? true : false

/**
 * 子类型检查
 */
export type IsSubtype<T, U> = T extends U ? (U extends T ? false : true) : false

/**
 * 精确类型检查
 */
export type IsExact<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
  ? true
  : false
