/**
 * 基础类型定义
 * 包含引擎系统中通用的基础类型和接口
 */

// 基础配置接口
export interface EngineConfig {
  appName?: string
  version?: string
  debug?: boolean
  [key: string]: unknown
}

// 环境类型
export type Environment = 'development' | 'production' | 'test'

// 功能开关类型
export interface FeatureFlags {
  enableHotReload: boolean
  enableDevTools: boolean
  enablePerformanceMonitoring: boolean
  enableErrorReporting: boolean
  enableSecurityProtection: boolean
  enableCaching: boolean
  enableNotifications: boolean
}

// 通用验证结果
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 通用快照接口
export interface Snapshot<T = unknown> {
  timestamp: number
  data: T
  version: string
  metadata?: Record<string, unknown>
}

// 通用监听器接口
export type UnwatchFunction = () => void

// 通用统计信息接口
export interface Stats {
  timestamp: number
  [key: string]: unknown
}

// 通用配置Schema
export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    default?: unknown
    validator?: (value: unknown) => boolean
    description?: string
    children?: ConfigSchema
  }
}

// 类型安全的路径访问
export type ConfigPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${ConfigPath<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

// 根据路径获取值的类型
export type ConfigValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? T[K] extends object
        ? ConfigValue<T[K], Rest>
        : never
      : never
    : never

// 通用管理器接口
export interface BaseManager {
  readonly name: string
  readonly version: string
  destroy: () => void
  getStats: () => Stats
}

// 通用插件接口
export interface BasePlugin {
  readonly name: string
  readonly version?: string
  readonly description?: string
  readonly author?: string
  readonly dependencies?: readonly string[]
  readonly peerDependencies?: readonly string[]
  readonly optionalDependencies?: readonly string[]
}

// 路由适配器接口
export interface RouterAdapter {
  readonly name: string
  readonly version: string
  install: (engine: unknown) => void
  navigate: (to: string, options?: Record<string, unknown>) => void
  push: (to: string, options?: Record<string, unknown>) => void
  replace: (to: string, options?: Record<string, unknown>) => void
  go: (delta: number) => void
  back: () => void
  forward: () => void
  getCurrentRoute: () => string
  getCurrentParams: () => Record<string, string>
  getCurrentQuery: () => Record<string, string>
  onRouteChange: (callback: (route: string) => void) => () => void
  destroy: () => void
}

// 状态管理适配器接口
export interface StateAdapter {
  readonly name: string
  readonly version: string
  install: (engine: unknown) => void
  get: <T>(key: string, defaultValue?: T) => T
  set: <T>(key: string, value: T) => void
  delete: (key: string) => void
  clear: () => void
  has: (key: string) => boolean
  keys: () => string[]
  subscribe: (key: string, callback: (value: unknown) => void) => () => void
  destroy: () => void
}

// 国际化适配器接口
export interface I18nAdapter {
  readonly name: string
  readonly version: string
  install: (engine: unknown) => void
  t: (key: string, params?: Record<string, unknown>) => string
  setLocale: (locale: string) => void
  getLocale: () => string
  getAvailableLocales: () => string[]
  onLocaleChange: (callback: (locale: string) => void) => () => void
  destroy: () => void
}

// 主题适配器接口
export interface ThemeAdapter {
  readonly name: string
  readonly version: string
  install: (engine: unknown) => void
  setTheme: (theme: string) => void
  getTheme: () => string
  getAvailableThemes: () => string[]
  onThemeChange: (callback: (theme: string) => void) => () => void
  destroy: () => void
}

// 通用事件处理器类型
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>

// 通用事件映射类型
export interface EventMap {
  [event: string]: unknown
}

// 通用状态变更处理器类型
export type StateChangeHandler<T = unknown> = (newValue: T, oldValue: T) => void

// 通用状态映射类型
export interface StateMap {
  [key: string]: unknown
}

// 状态路径类型
export type StatePath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${StatePath<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

// 根据路径获取状态值的类型
export type StateValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? T[K] extends object
        ? StateValue<T[K], Rest>
        : never
      : never
    : never

// 通用错误信息接口
export interface ErrorInfo {
  message: string
  stack?: string
  timestamp: number
  level: 'error' | 'warn' | 'info'
  context?: Record<string, unknown>
  component?: unknown
  info?: string
}

// 通用日志条目接口
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  data?: unknown
  context?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

// 日志级别类型
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 通用通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// 通用通知位置类型
export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

// 通用通知动画类型
export type NotificationAnimation =
  | 'slide'
  | 'fade'
  | 'bounce'
  | 'scale'
  | 'flip'

// 通用通知主题类型
export type NotificationTheme = 'light' | 'dark' | 'auto'

// 通用缓存策略类型
export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'ttl'

// 通用性能指标类型
export interface PerformanceMetrics {
  timestamp: number
  duration: number
  memory?: number
  cpu?: number
  [key: string]: unknown
}

// 注意：SecurityConfig 已在 config.ts 中定义，这里不再重复定义

// 通用环境信息接口
export interface EnvironmentInfo {
  platform: string
  browser: { name: string; version: string }
  device: { type: string; isMobile: boolean }
  features: Record<string, boolean>
  [key: string]: unknown
}
