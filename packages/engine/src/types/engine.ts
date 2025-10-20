/**
 * 核心引擎类型定义
 * 包含引擎的主要接口和类型
 */

import type { App, Component } from '@vue/runtime-dom'
// 使用实现定义以保证与实际工厂函数一致
import type { CacheManager } from '../cache/cache-manager'
import type { EnvironmentManager } from '../environment/environment-manager'
import type { LifecycleManager } from '../lifecycle/lifecycle-manager'
import type { PerformanceManager } from '../performance/performance-manager'
import type { SecurityManager } from '../security/security-manager'
import type {
  I18nAdapter,
  RouterAdapter,
  StateAdapter,
  ThemeAdapter,
} from './base'
import type { ConfigManager, EnhancedEngineConfig } from './config'
import type { DirectiveManager } from './directive'
import type { ErrorManager } from './error'
import type { EventManager } from './event'
import type { Logger } from './logger'
import type { MiddlewareManager } from './middleware'
import type { NotificationSystem } from '../notifications/notification-system'
import type { Plugin, PluginManager } from './plugin'
import type { StateManager } from './state'

// 引擎主接口
export interface Engine {
  readonly config: ConfigManager
  readonly plugins: PluginManager
  readonly middleware: MiddlewareManager
  readonly events: EventManager
  readonly state: StateManager
  readonly cache: CacheManager
  readonly performance: PerformanceManager
  readonly security: SecurityManager
  readonly environment: EnvironmentManager
  readonly lifecycle: LifecycleManager
  readonly directives: DirectiveManager
  readonly errors: ErrorManager
  readonly logger: Logger
  readonly notifications: NotificationSystem

  // 扩展接口
  router?: RouterAdapter
  store?: StateAdapter
  i18n?: I18nAdapter
  theme?: ThemeAdapter

  // 核心方法
  init: () => Promise<void>
  isReady: () => boolean
  createApp: (rootComponent: Component) => App
  install: (app: App) => void
  use: (plugin: Plugin) => Promise<void>
  mount: (selector: string | Element) => Promise<void>
  unmount: () => Promise<void>
  getApp: () => App | undefined
  isMounted: () => boolean
  getMountTarget: () => string | Element | undefined
  destroy: () => Promise<void>

  // 扩展方法
  setRouter: (router: RouterAdapter) => void
  setStore: (store: StateAdapter) => void
  setI18n: (i18n: I18nAdapter) => void
  setTheme: (theme: ThemeAdapter) => void

  // 配置方法
  updateConfig: (config: Partial<Record<string, unknown>>) => void
  getConfig: <T = unknown>(path: string, defaultValue?: T) => T
  setConfig: (path: string, value: unknown) => void

  // 管理器统计
  getManagerStats: () => Record<string, unknown>
  validateManagers: () => { valid: boolean; errors: string[] }
}

// 引擎状态
export type EngineStatus =
  | 'initializing'
  | 'ready'
  | 'running'
  | 'error'
  | 'destroyed'

// 引擎信息
export interface EngineInfo {
  readonly name: string
  readonly version: string
  readonly status: EngineStatus
  readonly startTime: number
  readonly uptime: number
  readonly managers: string[]
  readonly plugins: string[]
  readonly middleware: string[]
  readonly config: Record<string, unknown>
}

// 引擎统计
export interface EngineStats {
  readonly info: EngineInfo
  readonly performance: Record<string, unknown>
  readonly memory: Record<string, unknown>
  readonly errors: number
  readonly warnings: number
  readonly plugins: number
  readonly middleware: number
  readonly events: number
  readonly cache: Record<string, unknown>
}

// 引擎事件类型
export interface EngineEvents {
  'engine:init': { timestamp: number; config: EnhancedEngineConfig }
  'engine:ready': { timestamp: number; info: EngineInfo }
  'engine:start': { timestamp: number }
  'engine:stop': { timestamp: number }
  'engine:destroy': { timestamp: number }
  'engine:error': { error: Error; context?: string }
  'engine:status-change': {
    from: EngineStatus
    to: EngineStatus
    timestamp: number
  }
}

// 引擎生命周期钩子
export interface EngineLifecycle {
  beforeInit?: (config: EnhancedEngineConfig) => void | Promise<void>
  afterInit?: (engine: Engine) => void | Promise<void>
  beforeStart?: (engine: Engine) => void | Promise<void>
  afterStart?: (engine: Engine) => void | Promise<void>
  beforeStop?: (engine: Engine) => void | Promise<void>
  afterStop?: (engine: Engine) => void | Promise<void>
  beforeDestroy?: (engine: Engine) => void | Promise<void>
  afterDestroy?: (engine: Engine) => void | Promise<void>
}

// 引擎配置验证器
export interface EngineConfigValidator {
  validate: (config: EnhancedEngineConfig) => {
    valid: boolean
    errors: string[]
  }
  sanitize: (config: EnhancedEngineConfig) => EnhancedEngineConfig
  merge: (
    base: EnhancedEngineConfig,
    override: Partial<EnhancedEngineConfig>
  ) => EnhancedEngineConfig
}

// 引擎性能监控器
export interface EnginePerformanceMonitor {
  startMonitoring: () => void
  stopMonitoring: () => void
  getMetrics: () => Record<string, unknown>
  onMetric: (callback: (metric: Record<string, unknown>) => void) => () => void
  setThresholds: (thresholds: Record<string, number>) => void
  onThresholdViolation: (
    callback: (violation: Record<string, unknown>) => void
  ) => void
}

// 引擎错误处理器
export interface EngineErrorHandler {
  onError: (error: Error, context?: string) => void
  onWarning: (warning: string, context?: string) => void
  getErrors: () => Error[]
  getWarnings: () => string[]
  clearErrors: () => void
  clearWarnings: () => void
  setErrorHandler: (handler: (error: Error, context?: string) => void) => void
  setWarningHandler: (
    handler: (warning: string, context?: string) => void
  ) => void
}

// 引擎健康检查器
export interface EngineHealthChecker {
  checkHealth: () => Promise<{
    healthy: boolean
    issues: string[]
    details: Record<string, unknown>
  }>
  getHealthStatus: () => {
    healthy: boolean
    lastCheck: number
    issues: string[]
  }
  setHealthCheckInterval: (interval: number) => void
  onHealthChange: (
    callback: (healthy: boolean, issues: string[]) => void
  ) => () => void
  addHealthCheck: (name: string, check: () => Promise<boolean>) => void
  removeHealthCheck: (name: string) => void
}

// 引擎诊断器
export interface EngineDiagnostics {
  diagnose: () => Promise<{
    issues: string[]
    recommendations: string[]
    details: Record<string, unknown>
  }>
  generateReport: () => Promise<string>
  exportDiagnostics: (format: 'json' | 'html' | 'text') => Promise<string>
  getDiagnosticHistory: () => Array<{
    timestamp: number
    issues: string[]
    recommendations: string[]
  }>
  clearDiagnosticHistory: () => void
}
