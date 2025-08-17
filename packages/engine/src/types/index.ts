import type { App, Component, Directive } from '@vue/runtime-dom'

// 基础类型定义
export interface EngineConfig {
  appName?: string
  version?: string
  debug?: boolean
  [key: string]: unknown
}

// 严格类型的配置接口
export interface StrictEngineConfig {
  readonly app: {
    readonly name: string
    readonly version: string
    readonly description?: string
    readonly author?: string
    readonly homepage?: string
  }
  readonly environment: 'development' | 'production' | 'test'
  readonly debug: boolean
  readonly features: Readonly<{
    enableHotReload: boolean
    enableDevTools: boolean
    enablePerformanceMonitoring: boolean
    enableErrorReporting: boolean
    enableSecurityProtection: boolean
    enableCaching: boolean
    enableNotifications: boolean
  }>
  readonly logger: Readonly<LoggerConfig>
  readonly cache: Readonly<CacheConfig>
  readonly security: Readonly<SecurityConfig>
  readonly performance: Readonly<PerformanceConfig>
  readonly notifications: Readonly<NotificationConfig>
  readonly env: Readonly<Record<string, string | undefined>>
  readonly custom: Readonly<Record<string, unknown>>
}

// 增强的配置接口
export interface EnhancedEngineConfig {
  // 应用信息
  app: {
    name: string
    version: string
    description?: string
    author?: string
    homepage?: string
  }

  // 环境配置
  environment: 'development' | 'production' | 'test'
  debug: boolean

  // 功能开关
  features: {
    enableHotReload: boolean
    enableDevTools: boolean
    enablePerformanceMonitoring: boolean
    enableErrorReporting: boolean
    enableSecurityProtection: boolean
    enableCaching: boolean
    enableNotifications: boolean
  }

  // 各模块配置
  logger: LoggerConfig
  cache: CacheConfig
  security: SecurityConfig
  performance: PerformanceConfig
  notifications: NotificationConfig

  // 环境变量映射
  env: {
    [key: string]: string | undefined
  }

  // 自定义配置
  custom: Record<string, any>
}

// 配置管理器相关类型
export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    default?: any
    validator?: (value: any) => boolean
    description?: string
    children?: ConfigSchema
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface ConfigSnapshot {
  timestamp: number
  config: Record<string, any>
  environment: string
  version: string
}

export type ConfigWatcher = (newValue: any, oldValue: any, path: string) => void
export type UnwatchFunction = () => void

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

// 配置管理器接口（增强类型安全）
export interface ConfigManager<TConfig = Record<string, any>> {
  // 基础操作（类型安全）
  get: (<P extends ConfigPath<TConfig>>(
    path: P,
    defaultValue?: ConfigValue<TConfig, P>
  ) => ConfigValue<TConfig, P>) & (<T = any>(path: string, defaultValue?: T) => T)

  set: (<P extends ConfigPath<TConfig>>(
    path: P,
    value: ConfigValue<TConfig, P>
  ) => void) & ((path: string, value: any) => void)

  has: (path: string) => boolean
  remove: (path: string) => void
  clear: () => void

  // 配置合并
  merge: (config: Partial<Record<string, any>>) => void
  reset: (path?: string) => void

  // 环境管理
  setEnvironment: (env: 'development' | 'production' | 'test') => void
  getEnvironment: () => string

  // 配置验证
  validate: (schema?: ConfigSchema) => ValidationResult
  setSchema: (schema: ConfigSchema) => void
  getSchema: () => ConfigSchema | undefined

  // 配置监听
  watch: (path: string, callback: ConfigWatcher) => UnwatchFunction
  unwatch: (path: string, callback?: ConfigWatcher) => void

  // 持久化
  save: () => Promise<void>
  load: () => Promise<void>
  enableAutoSave: (interval?: number) => void
  disableAutoSave: () => void

  // 配置快照
  createSnapshot: () => ConfigSnapshot
  restoreSnapshot: (snapshot: ConfigSnapshot) => void
  getSnapshots: () => ConfigSnapshot[]

  // 配置统计
  getStats: () => {
    totalKeys: number
    watchers: number
    snapshots: number
    lastModified: number
    memoryUsage: string
  }

  // 配置导入导出
  export: (format?: 'json' | 'yaml') => string
  import: (data: string, format?: 'json' | 'yaml') => void

  // 命名空间
  namespace: (name: string) => ConfigManager
}

// 各模块配置接口
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  maxLogs: number
  enableConsole: boolean
  enableStorage: boolean
  storageKey: string
  transports: string[]
}

export interface CacheConfig {
  enabled: boolean
  maxSize: number
  defaultTTL: number
  strategy: 'lru' | 'lfu' | 'fifo' | 'ttl'
  enableStats: boolean
  cleanupInterval: number
}

export interface SecurityConfig {
  xss: {
    enabled: boolean
    allowedTags: string[]
    allowedAttributes: Record<string, string[]>
  }
  csrf: {
    enabled: boolean
    tokenName: string
    headerName: string
  }
  csp: {
    enabled: boolean
    directives: Record<string, string[]>
    reportOnly: boolean
  }
}

export interface PerformanceConfig {
  enabled: boolean
  sampleRate: number
  maxEntries: number
  thresholds: {
    responseTime: { good: number, poor: number }
    fps: { good: number, poor: number }
    memory: { warning: number, critical: number }
  }
}

export interface NotificationConfig {
  enabled: boolean
  maxNotifications: number
  defaultDuration: number
  defaultPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  defaultTheme: 'light' | 'dark' | 'auto'
}

// 插件相关类型（类型安全）
export interface PluginMetadata {
  readonly name: string
  readonly version: string
  readonly description?: string
  readonly author?: string
  readonly homepage?: string
  readonly keywords?: readonly string[]
  readonly dependencies?: readonly string[]
  readonly peerDependencies?: readonly string[]
  readonly optionalDependencies?: readonly string[]
}

export interface PluginContext<TEngine = Engine> {
  readonly engine: TEngine
  readonly logger: Logger
  readonly config: ConfigManager
  readonly events: EventManager
}

export interface Plugin<TEngine = Engine> {
  readonly name: string
  readonly version?: string
  readonly description?: string
  readonly author?: string
  readonly dependencies?: readonly string[]
  readonly peerDependencies?: readonly string[]
  readonly optionalDependencies?: readonly string[]

  install: (context: PluginContext<TEngine>) => void | Promise<void>
  uninstall?: (context: PluginContext<TEngine>) => void | Promise<void>

  // 生命周期钩子
  beforeInstall?: (context: PluginContext<TEngine>) => void | Promise<void>
  afterInstall?: (context: PluginContext<TEngine>) => void | Promise<void>
  beforeUninstall?: (context: PluginContext<TEngine>) => void | Promise<void>
  afterUninstall?: (context: PluginContext<TEngine>) => void | Promise<void>

  // 插件配置
  readonly config?: Record<string, any>

  // 插件元数据
  readonly metadata?: Partial<PluginMetadata>
}

// 插件状态
export type PluginStatus = 'pending' | 'installing' | 'installed' | 'uninstalling' | 'error'

export interface PluginInfo<TEngine = Engine> {
  readonly plugin: Plugin<TEngine>
  readonly status: PluginStatus
  readonly installTime?: number
  readonly error?: Error
  readonly dependencies: readonly string[]
  readonly dependents: readonly string[]
}

export interface PluginManager<TEngine = Engine> {
  register: (plugin: Plugin<TEngine>) => Promise<void>
  unregister: (name: string) => Promise<void>
  get: (name: string) => Plugin<TEngine> | undefined
  getInfo: (name: string) => PluginInfo<TEngine> | undefined
  getAll: () => Plugin<TEngine>[]
  getAllInfo: () => PluginInfo<TEngine>[]
  isRegistered: (name: string) => boolean
  has: (name: string) => boolean
  getStatus: (name: string) => PluginStatus | undefined

  // 依赖管理
  checkDependencies: (plugin: Plugin<TEngine>) => {
    satisfied: boolean
    missing: string[]
    conflicts: string[]
  }
  getLoadOrder: () => string[]
  getDependencyGraph: () => Record<string, string[]>
  validateDependencies: () => { valid: boolean, errors: string[] }
  resolveDependencies: (plugins: Plugin<TEngine>[]) => Plugin<TEngine>[]

  // 统计信息
  getStats: () => {
    total: number
    loaded: string[]
    dependencies: Record<string, string[]>
    installed: number
    pending: number
    errors: number
    averageInstallTime: number
  }

  // 插件查询
  findByKeyword: (keyword: string) => Plugin<TEngine>[]
  findByAuthor: (author: string) => Plugin<TEngine>[]
  findByDependency: (dependency: string) => Plugin<TEngine>[]
}

// 中间件相关类型
export interface MiddlewareContext {
  request?: any
  response?: any
  error?: Error
  [key: string]: any
}

export type MiddlewareNext = () => Promise<void> | void

export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: MiddlewareNext
) => Promise<void> | void

export interface Middleware {
  name: string
  handler: MiddlewareFunction
  priority?: number
}

export interface MiddlewareManager {
  use: (middleware: Middleware) => void
  remove: (name: string) => void
  execute: ((context: MiddlewareContext) => Promise<void>) & ((name: string, context: MiddlewareContext) => Promise<any>)
}

// 事件相关类型（类型安全）
export type EventHandler<T = any> = (data: T) => void | Promise<void>

// 事件映射类型
export interface EventMap {
  [event: string]: any
}

// 默认引擎事件映射
export interface EngineEventMap extends EventMap {
  'engine:init': { timestamp: number, config: any }
  'engine:destroy': { timestamp: number }
  'engine:error': { error: Error, context?: string }
  'config:changed': { path: string, newValue: any, oldValue: any }
  'plugin:registered': { name: string, version: string }
  'plugin:unregistered': { name: string }
  'state:changed': { path: string, newValue: any, oldValue: any }
  'notification:shown': { id: string, type: string, message: string }
  'notification:hidden': { id: string }
}

// 类型安全的事件管理器
export interface EventManager<TEventMap extends EventMap = EngineEventMap> {
  on: (<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ) => void) & ((event: string, handler: EventHandler) => void)

  off: (<K extends keyof TEventMap>(
    event: K,
    handler?: EventHandler<TEventMap[K]>
  ) => void) & ((event: string, handler?: EventHandler) => void)

  emit: (<K extends keyof TEventMap>(event: K, data: TEventMap[K]) => void) & ((event: string, ...args: any[]) => void)

  once: (<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ) => void) & ((event: string, handler: EventHandler) => void)

  eventNames: () => string[]
  listenerCount: (event: string) => number
  listeners: (event: string) => EventHandler[]
  removeAllListeners: (event?: string) => void
  setMaxListeners: (n: number) => void
  getMaxListeners: () => number
}

// 状态管理相关类型（类型安全）
export type StateChangeHandler<T = any> = (newValue: T, oldValue: T) => void

// 状态映射类型
export interface StateMap {
  [key: string]: any
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

// 类型安全的状态管理器
export interface StateManager<TState extends StateMap = StateMap> {
  get: (<P extends StatePath<TState>>(key: P) => StateValue<TState, P> | undefined) & (<T = any>(key: string) => T | undefined)

  set: (<P extends StatePath<TState>>(key: P, value: StateValue<TState, P>) => void) & (<T = any>(key: string, value: T) => void)

  remove: (key: string) => void
  has: (key: string) => boolean
  clear: () => void

  watch: (<P extends StatePath<TState>>(
    key: P,
    callback: StateChangeHandler<StateValue<TState, P>>
  ) => () => void) & (<T = any>(
    key: string,
    callback: StateChangeHandler<T>
  ) => () => void)

  keys: () => string[]
  namespace: (name: string) => StateManager
}

// 指令管理相关类型
export interface DirectiveManager {
  register: (name: string, directive: Directive) => void
  unregister: (name: string) => void
  get: (name: string) => Directive | undefined
  getAll: () => Record<string, Directive>
  registerBatch: (directives: Record<string, Directive>) => void
  unregisterBatch: (names: string[]) => void
  clear: () => void
}

// 错误管理相关类型
export interface ErrorInfo {
  message: string
  stack?: string
  component?: Component
  info?: string
  timestamp: number
  level: 'error' | 'warn' | 'info'
}

export type ErrorHandler = (error: ErrorInfo) => void

export interface ErrorManager {
  onError: (handler: ErrorHandler) => void
  offError: (handler: ErrorHandler) => void
  captureError: (error: Error, component?: Component, info?: string) => void
  getErrors: () => ErrorInfo[]
  clearErrors: () => void
}

// 日志相关类型
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  data?: any
}

export interface Logger {
  debug: (message: string, data?: any) => void
  info: (message: string, data?: any) => void
  warn: (message: string, data?: any) => void
  error: (message: string, data?: any) => void
  setLevel: (level: LogLevel) => void
  getLevel: () => LogLevel
  getLogs: () => LogEntry[]
  clearLogs: () => void
  clear: () => void
  setMaxLogs: (max: number) => void
  getMaxLogs: () => number
}

// 通知相关类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type NotificationAnimation =
  | 'slide'
  | 'fade'
  | 'bounce'
  | 'scale'
  | 'flip'

export type NotificationTheme = 'light' | 'dark' | 'auto'

export interface NotificationAction {
  label: string
  action: () => void | Promise<void>
  style?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

export interface NotificationProgress {
  value: number // 0-100
  showText?: boolean
  color?: string
}

export interface NotificationOptions {
  title?: string
  message: string
  type?: NotificationType
  duration?: number
  closable?: boolean
  position?: NotificationPosition
  animation?: NotificationAnimation
  theme?: NotificationTheme
  icon?: string | HTMLElement
  actions?: NotificationAction[]
  progress?: NotificationProgress
  persistent?: boolean
  group?: string
  priority?: number
  className?: string
  style?: Partial<CSSStyleDeclaration>
  onClick?: () => void
  onClose?: () => void
  onShow?: () => void
  allowHTML?: boolean
  maxWidth?: number
  zIndex?: number
  [key: string]: any
}

export interface NotificationManager {
  show: (options: NotificationOptions) => string
  hide: (id: string) => void
  hideAll: () => void
  getAll: () => NotificationOptions[]
  setPosition: (position: NotificationPosition) => void
  getPosition: () => NotificationPosition
  setTheme: (theme: NotificationTheme) => void
  getTheme: () => NotificationTheme
  setMaxNotifications: (max: number) => void
  getMaxNotifications: () => number
  setDefaultDuration: (duration: number) => void
  getDefaultDuration: () => number
  getStats: () => {
    total: number
    visible: number
    byType: Record<NotificationType, number>
    byPosition: Record<NotificationPosition, number>
  }
  destroy: () => void
}

// 扩展接口类型
export interface RouterAdapter {
  install: (engine: Engine) => void
  push: (path: string) => void | Promise<void>
  replace: (path: string) => void | Promise<void>
  go: (delta: number) => void
  back: () => void
  forward: () => void

  // 扩展方法
  getCurrentRoute?: () => any
  getRoutes?: () => any[]
  addRoute?: (route: any) => void
  removeRoute?: (name: string) => void
  hasRoute?: (name: string) => boolean
  resolve?: (to: any) => any

  // 路由守卫
  beforeEach?: (guard: any) => void
  beforeResolve?: (guard: any) => void
  afterEach?: (guard: any) => void

  // 高级功能
  preloadRoute?: (route: any) => Promise<void>
  clearCache?: () => void

  // 事件
  onRouteChange?: (callback: (to: any, from: any) => void) => void
  onError?: (callback: (error: Error) => void) => void
}

export interface StateAdapter {
  install: (engine: Engine) => void
  createStore: (options: any) => any
  getStore: (name?: string) => any
}

export interface I18nAdapter {
  install: (engine: Engine) => void
  setLocale: (locale: string) => void
  getLocale: () => string
  t: (key: string, params?: any) => string
}

export interface ThemeAdapter {
  install: (engine: Engine) => void
  setTheme: (theme: string) => void
  getTheme: () => string
  getThemes: () => string[]
}

// 缓存管理器接口（从cache-manager.ts导入）
export interface CacheManager {
  get: <T = unknown>(key: string) => T | undefined
  set: <T = unknown>(key: string, value: T, ttl?: number) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
  values: () => unknown[]
  entries: () => [string, unknown][]
  getStats: () => any
  resetStats: () => void
  namespace: (name: string) => CacheManager
}

// 性能管理器接口
export interface PerformanceManager {
  startMeasure: (name: string) => void
  endMeasure: (name: string) => number
  mark: (name: string) => void
  getMetrics: () => any
  getReport: () => any
  clearMetrics: () => void
  setThresholds: (thresholds: any) => void
}

// 安全管理器接口
export interface SecurityManager {
  sanitizeHTML: (html: string) => any
  validateInput: (input: string, type?: string) => boolean
  generateCSRFToken: () => any
  validateCSRFToken: (token: string) => boolean
  getSecurityHeaders: () => Record<string, string>
  updateConfig: (config: any) => void
}

// 环境管理器接口
export interface EnvironmentManager {
  detect: () => any
  getEnvironment: () => string
  getPlatform: () => string
  getBrowser: () => { name: string, version: string }
  getDevice: () => { type: string, isMobile: boolean }
  hasFeature: (feature: string) => boolean
  getFeatures: () => Record<string, boolean>
  checkCompatibility: (requirements: Record<string, any>) => boolean
  getAdaptation: () => any
  setAdaptation: (adaptation: any) => void
  adaptForEnvironment: (env: any) => any
  getPerformanceInfo: () => any
  monitorPerformance: (callback: (info: any) => void) => void
  onEnvironmentChange: (callback: (info: any) => void) => () => void
  onFeatureChange: (feature: string, callback: (available: boolean) => void) => () => void
}

// 生命周期管理器接口
export interface LifecycleManager<T = any> {
  on: (phase: any, hook: (context: any) => void | Promise<void>, priority?: number) => string
  once: (phase: any, hook: (context: any) => void | Promise<void>, priority?: number) => string
  off: (hookId: string) => boolean
  offAll: (phase?: any) => number
  getHooks: (phase: any) => any[]
  getAllHooks: () => any[]
  hasHooks: (phase: any) => boolean
  getHookCount: (phase?: any) => number
  execute: (phase: any, engine: T, data?: any) => Promise<any>
  executeSync: (phase: any, engine: T, data?: any) => any
  getCurrentPhase: () => any | undefined
  getLastEvent: () => any | undefined
  getHistory: () => any[]
  isPhaseExecuted: (phase: string) => boolean
  onError: (callback: (error: Error, context: any) => void) => () => void
  getStats: () => any
  clear: () => void
  reset: () => void
}

// 引擎主类型
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
  readonly notifications: NotificationManager

  // 扩展接口
  router?: RouterAdapter
  store?: StateAdapter
  i18n?: I18nAdapter
  theme?: ThemeAdapter

  createApp: (rootComponent: Component) => App
  install: (app: App) => void
  use: (plugin: Plugin) => Promise<void>
  mount: (selector: string | Element) => void
  unmount: () => void
  getApp: () => App | undefined
  isMounted: () => boolean
  getMountTarget: () => string | Element | undefined
  destroy: () => void

  // 扩展方法
  setRouter: (router: RouterAdapter) => void
  setStore: (store: StateAdapter) => void
  setI18n: (i18n: I18nAdapter) => void
  setTheme: (theme: ThemeAdapter) => void

  // 配置方法
  updateConfig: (config: Partial<Record<string, any>>) => void
  getConfig: <T = any>(path: string, defaultValue?: T) => T
  setConfig: (path: string, value: any) => void

  // 管理器统计
  getManagerStats: () => any
  validateManagers: () => any
}

// 创建引擎的选项
export interface CreateEngineOptions {
  config?: EngineConfig | EnhancedEngineConfig
  plugins?: Plugin[]
  middleware?: Middleware[]
  router?: RouterAdapter
  store?: StateAdapter
  i18n?: I18nAdapter
  theme?: ThemeAdapter

  // 新增配置选项
  configSchema?: ConfigSchema
  enableAutoSave?: boolean
  autoSaveInterval?: number
}
