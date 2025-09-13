/**
 * 工具类型定义
 * 定义通用的工具类型和辅助类型
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
 * 排除null和undefined的类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 提取Promise的返回类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 函数参数类型
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never

/**
 * 函数返回类型
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

/**
 * 构造函数参数类型
 */
export type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never

/**
 * 构造函数实例类型
 */
export type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any

/**
 * 键值对类型
 */
export type KeyValuePair<K = string, V = any> = {
  key: K
  value: V
}

/**
 * 字符串字面量联合类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

/**
 * 数字字面量联合类型
 */
export type NumberLiteral<T> = T extends number ? (number extends T ? never : T) : never

/**
 * 布尔字面量联合类型
 */
export type BooleanLiteral<T> = T extends boolean ? (boolean extends T ? never : T) : T

/**
 * 获取对象的值类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 获取数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * 条件类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 联合类型转交叉类型
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/**
 * 获取函数重载的最后一个签名
 */
export type LastOverload<T> = UnionToIntersection<T extends (...args: any[]) => any ? T : never>

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
 * URL类型
 */
export type URL = string

/**
 * CSS颜色类型
 */
export type CSSColor = string

/**
 * CSS长度类型
 */
export type CSSLength = string | number

/**
 * CSS时间类型
 */
export type CSSTime = string

/**
 * 尺寸类型
 */
export interface Size {
  width: number
  height: number
}

/**
 * 位置类型
 */
export interface Position {
  x: number
  y: number
}

/**
 * 矩形类型
 */
export interface Rectangle extends Position, Size {}

/**
 * 范围类型
 */
export interface Range {
  start: number
  end: number
}

/**
 * 时间范围类型
 */
export interface TimeRange extends Range {}

/**
 * 版本号类型
 */
export interface Version {
  major: number
  minor: number
  patch: number
  prerelease?: string
  build?: string
}

/**
 * 错误信息类型
 */
export interface ErrorInfo {
  code: string | number
  message: string
  details?: any
  stack?: string
  timestamp: Timestamp
}

/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 日志条目类型
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Timestamp
  data?: any
  source?: string
}

/**
 * 配置验证结果类型
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 异步操作状态类型
 */
export type AsyncStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected'

/**
 * 异步操作结果类型
 */
export interface AsyncResult<T = any, E = Error> {
  status: AsyncStatus
  data?: T
  error?: E
  timestamp: Timestamp
}

/**
 * 缓存条目类型
 */
export interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: Timestamp
  ttl?: number
  hits: number
}

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  /** 内存使用量 */
  memory?: {
    used: number
    total: number
    percentage: number
  }
  /** CPU使用率 */
  cpu?: number
  /** 帧率 */
  fps?: number
  /** 延迟 */
  latency?: number
  /** 带宽 */
  bandwidth?: number
  /** 丢帧数 */
  droppedFrames?: number
}

/**
 * 浏览器信息类型
 */
export interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  mobile: boolean
  tablet: boolean
  desktop: boolean
}

/**
 * 设备信息类型
 */
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: string
  browser: BrowserInfo
  screen: Size
  viewport: Size
  pixelRatio: number
  touchSupport: boolean
  orientation: 'portrait' | 'landscape'
}

/**
 * 网络信息类型
 */
export interface NetworkInfo {
  type: string
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

/**
 * 媒体能力类型
 */
export interface MediaCapabilities {
  canPlayType: (type: string) => string
  supportsHLS: boolean
  supportsDASH: boolean
  supportsWebRTC: boolean
  supportsMSE: boolean
  supportsEME: boolean
  codecs: {
    video: string[]
    audio: string[]
  }
}
