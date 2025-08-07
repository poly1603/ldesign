import type { App, Component, Directive } from 'vue'

// 基础类型定义
export interface EngineConfig {
  appName?: string
  version?: string
  debug?: boolean
  [key: string]: unknown
}

// 插件相关类型
export interface Plugin {
  name: string
  version?: string
  dependencies?: string[]
  install: (engine: Engine) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>
  [key: string]: unknown
}

export interface PluginManager {
  register: (plugin: Plugin) => Promise<void>
  unregister: (name: string) => Promise<void>
  get: (name: string) => Plugin | undefined
  getAll: () => Plugin[]
  isRegistered: (name: string) => boolean
  has: (name: string) => boolean
  checkDependencies: (plugin: Plugin) => boolean
  getLoadOrder: () => string[]
  getDependencyGraph: () => Record<string, string[]>
  validateDependencies: () => { valid: boolean, errors: string[] }
  getStats: () => {
    total: number
    loaded: string[]
    dependencies: Record<string, string[]>
  }
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
  execute(context: MiddlewareContext): Promise<void>
  execute(name: string, context: MiddlewareContext): Promise<any>
}

// 事件相关类型
export type EventHandler = (...args: any[]) => void

export interface EventManager {
  on: (event: string, handler: EventHandler) => void
  off: (event: string, handler?: EventHandler) => void
  emit: (event: string, ...args: any[]) => void
  once: (event: string, handler: EventHandler) => void
  eventNames: () => string[]
  listenerCount: (event: string) => number
  listeners: (event: string) => EventHandler[]
  removeAllListeners: (event?: string) => void
  setMaxListeners: (n: number) => void
  getMaxListeners: () => number
}

// 状态管理相关类型
export interface StateManager {
  get: <T = any>(key: string) => T | undefined
  set: <T = any>(key: string, value: T) => void
  remove: (key: string) => void
  clear: () => void
  watch: <T = any>(key: string, callback: (newValue: T, oldValue: T) => void) => () => void
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

export interface NotificationOptions {
  title?: string
  message: string
  type?: NotificationType
  duration?: number
  closable?: boolean
  [key: string]: any
}

export interface NotificationManager {
  show: (options: NotificationOptions) => string
  hide: (id: string) => void
  hideAll: () => void
  getAll: () => NotificationOptions[]
}

// 扩展接口类型
export interface RouterAdapter {
  install: (engine: Engine) => void
  push: (path: string) => void
  replace: (path: string) => void
  go: (delta: number) => void
  back: () => void
  forward: () => void
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

// 引擎主类型
export interface Engine {
  readonly config: EngineConfig
  readonly plugins: PluginManager
  readonly middleware: MiddlewareManager
  readonly events: EventManager
  readonly state: StateManager
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
}

// 创建引擎的选项
export interface CreateEngineOptions {
  config?: EngineConfig
  plugins?: Plugin[]
  middleware?: Middleware[]
  router?: RouterAdapter
  store?: StateAdapter
  i18n?: I18nAdapter
  theme?: ThemeAdapter
}
