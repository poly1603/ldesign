/**
 * 插件系统类型定义
 * 包含插件、插件管理器等相关类型
 */

import type { BaseManager, BasePlugin } from './base'
import type { Engine } from './engine'

// 插件元数据
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

// 插件上下文
export interface PluginContext<_TEngine = Engine> {
  readonly engine: _TEngine
  readonly logger: unknown
  readonly config: unknown
  readonly events: unknown
}

// 插件接口
export interface Plugin<TEngine = Engine> extends BasePlugin {
  install: (context: PluginContext<TEngine>) => void | Promise<void>
  uninstall?: (context: PluginContext<TEngine>) => void | Promise<void>

  // 生命周期钩子
  beforeInstall?: (context: PluginContext<TEngine>) => void | Promise<void>
  afterInstall?: (context: PluginContext<TEngine>) => void | Promise<void>
  beforeUninstall?: (context: PluginContext<TEngine>) => void | Promise<void>
  afterUninstall?: (context: PluginContext<TEngine>) => void | Promise<void>

  // 插件状态
  isEnabled?: () => boolean

  // 插件配置
  readonly config?: Record<string, unknown>

  // 插件元数据
  readonly metadata?: Partial<PluginMetadata>
}

// 插件状态
export type PluginStatus =
  | 'pending'
  | 'installing'
  | 'installed'
  | 'uninstalling'
  | 'error'

// 插件信息
export interface PluginInfo<TEngine = Engine> {
  readonly plugin: Plugin<TEngine>
  readonly status: PluginStatus
  readonly installTime?: number
  readonly error?: Error
  readonly dependencies: readonly string[]
  readonly dependents: readonly string[]
}

// 插件管理器接口
export interface PluginManager<TEngine = Engine> extends BaseManager {
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
  validateDependencies: () => { valid: boolean; errors: string[] }
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
    timestamp: number
  }

  // 插件查询
  findByKeyword: (keyword: string) => Plugin<TEngine>[]
  findByAuthor: (author: string) => Plugin<TEngine>[]
  findByDependency: (dependency: string) => Plugin<TEngine>[]

  // 额外的方法（兼容性）
  getInstalledPlugins: () => Plugin<TEngine>[]
  isInstalled: (name: string) => boolean
  getPlugin: (name: string) => Plugin<TEngine> | undefined
  getPluginStatus: (name: string) => PluginStatus | undefined

  // 初始化所有插件（兼容方法）
  initializeAll: () => Promise<void>
}

// 插件加载器接口
export interface PluginLoader<TEngine = Engine> {
  load: (path: string) => Promise<Plugin<TEngine>>
  loadFromURL: (url: string) => Promise<Plugin<TEngine>>
  loadFromPackage: (packageName: string) => Promise<Plugin<TEngine>>
  validate: (plugin: Plugin<TEngine>) => { valid: boolean; errors: string[] }
  getLoadHistory: () => Array<{
    timestamp: number
    path: string
    success: boolean
    error?: string
  }>
}

// 插件热重载接口
export interface PluginHotReload<_TEngine = Engine> {
  enable: () => void
  disable: () => void
  isEnabled: () => boolean
  reload: (pluginName: string) => Promise<void>
  watch: (pluginPath: string) => void
  unwatch: (pluginPath: string) => void
  onReload: (callback: (pluginName: string) => void) => () => void
}

// 插件市场接口
export interface PluginMarketplace<TEngine = Engine> {
  search: (query: string) => Promise<Plugin<TEngine>[]>
  getCategories: () => Promise<string[]>
  getPopular: () => Promise<Plugin<TEngine>[]>
  getLatest: () => Promise<Plugin<TEngine>[]>
  getRating: (
    pluginName: string
  ) => Promise<{ rating: number; reviews: number }>
  install: (pluginName: string) => Promise<void>
  uninstall: (pluginName: string) => Promise<void>
  update: (pluginName: string) => Promise<void>
}

// 插件验证器接口
export interface PluginValidator<TEngine = Engine> {
  validate: (plugin: Plugin<TEngine>) => {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
  validateDependencies: (
    plugin: Plugin<TEngine>,
    installed: Plugin<TEngine>[]
  ) => { satisfied: boolean; missing: string[] }
  validateSecurity: (plugin: Plugin<TEngine>) => {
    safe: boolean
    risks: string[]
  }
  validatePerformance: (plugin: Plugin<TEngine>) => {
    acceptable: boolean
    issues: string[]
  }
}

// 插件隔离器接口
export interface PluginIsolator<TEngine = Engine> {
  isolate: (plugin: Plugin<TEngine>) => Promise<void>
  deisolate: (plugin: Plugin<TEngine>) => Promise<void>
  isIsolated: (plugin: Plugin<TEngine>) => boolean
  getIsolationInfo: (plugin: Plugin<TEngine>) => Record<string, unknown>
  setIsolationLevel: (
    plugin: Plugin<TEngine>,
    level: 'strict' | 'moderate' | 'loose'
  ) => void
}
