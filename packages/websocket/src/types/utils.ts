/**
 * WebSocket 工具类型定义
 * 
 * 定义工具函数和辅助类型
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度必需类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * 可为空类型
 */
export type Nullable<T> = T | null

/**
 * 可选类型
 */
export type Optional<T> = T | undefined

/**
 * 可为空或可选类型
 */
export type Maybe<T> = T | null | undefined

/**
 * 函数类型
 */
export type Fn<T = void> = () => T

/**
 * 异步函数类型
 */
export type AsyncFn<T = void> = () => Promise<T>

/**
 * 回调函数类型
 */
export type Callback<T = unknown, R = void> = (data: T) => R

/**
 * 异步回调函数类型
 */
export type AsyncCallback<T = unknown, R = void> = (data: T) => Promise<R>

/**
 * 构造函数类型
 */
export type Constructor<T = {}> = new (...args: unknown[]) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = {}> = abstract new (...args: unknown[]) => T

/**
 * 类类型
 */
export type Class<T = {}> = Constructor<T>

/**
 * 混入类型
 */
export type Mixin<T extends Constructor> = T & Constructor

/**
 * 键值对类型
 */
export type KeyValuePair<K = string, V = unknown> = {
  key: K
  value: V
}

/**
 * 字典类型
 */
export type Dictionary<T = unknown> = Record<string, T>

/**
 * 数字字典类型
 */
export type NumericDictionary<T = unknown> = Record<number, T>

/**
 * 只读字典类型
 */
export type ReadonlyDictionary<T = unknown> = Readonly<Dictionary<T>>

/**
 * 数组或单个值类型
 */
export type ArrayOrSingle<T> = T | T[]

/**
 * 字符串或数字类型
 */
export type StringOrNumber = string | number

/**
 * 原始类型
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint

/**
 * 非原始类型
 */
export type NonPrimitive = object

/**
 * 序列化类型
 */
export type Serializable = 
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable }

/**
 * JSON 值类型
 */
export type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/**
 * JSON 对象类型
 */
export type JsonObject = { [key: string]: JsonValue }

/**
 * JSON 数组类型
 */
export type JsonArray = JsonValue[]

/**
 * 时间戳类型
 */
export type Timestamp = number

/**
 * 毫秒时间戳类型
 */
export type MillisecondTimestamp = number

/**
 * 秒时间戳类型
 */
export type SecondTimestamp = number

/**
 * URL 字符串类型
 */
export type UrlString = string

/**
 * 正则表达式字符串类型
 */
export type RegexString = string

/**
 * Base64 字符串类型
 */
export type Base64String = string

/**
 * UUID 字符串类型
 */
export type UuidString = string

/**
 * 十六进制字符串类型
 */
export type HexString = string

/**
 * 错误信息类型
 */
export type ErrorMessage = string

/**
 * 错误代码类型
 */
export type ErrorCode = string | number

/**
 * 状态码类型
 */
export type StatusCode = number

/**
 * 版本号类型
 */
export type Version = string

/**
 * 环境类型
 */
export type Environment = 'development' | 'production' | 'test'

/**
 * 平台类型
 */
export type Platform = 'browser' | 'node' | 'worker' | 'react-native'

/**
 * 浏览器类型
 */
export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown'

/**
 * 操作系统类型
 */
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown'

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

/**
 * 网络类型
 */
export type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'unknown'

/**
 * 连接质量类型
 */
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  /** 内存使用量（字节） */
  memoryUsage: number
  /** CPU 使用率（百分比） */
  cpuUsage: number
  /** 网络延迟（毫秒） */
  networkLatency: number
  /** 吞吐量（字节/秒） */
  throughput: number
  /** 错误率（百分比） */
  errorRate: number
  /** 可用性（百分比） */
  availability: number
}

/**
 * 配置验证结果类型
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
  /** 警告信息列表 */
  warnings: string[]
}

/**
 * 重试选项类型
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxAttempts: number
  /** 初始延迟时间（毫秒） */
  initialDelay: number
  /** 最大延迟时间（毫秒） */
  maxDelay: number
  /** 退避倍数 */
  backoffMultiplier: number
  /** 抖动范围（毫秒） */
  jitter: number
  /** 重试条件函数 */
  shouldRetry?: (error: Error, attempt: number) => boolean
}

/**
 * 缓存选项类型
 */
export interface CacheOptions {
  /** 缓存键 */
  key: string
  /** 过期时间（毫秒） */
  ttl: number
  /** 是否持久化 */
  persistent: boolean
  /** 存储引擎 */
  storage: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
}

/**
 * 限流选项类型
 */
export interface ThrottleOptions {
  /** 时间窗口（毫秒） */
  window: number
  /** 最大请求数 */
  maxRequests: number
  /** 是否队列化超出限制的请求 */
  queue: boolean
  /** 队列最大长度 */
  maxQueueSize: number
}

/**
 * 防抖选项类型
 */
export interface DebounceOptions {
  /** 延迟时间（毫秒） */
  delay: number
  /** 是否立即执行 */
  immediate: boolean
  /** 最大等待时间（毫秒） */
  maxWait: number
}
