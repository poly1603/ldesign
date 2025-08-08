/**
 * 插件系统类型定义
 */

import type { RouteLocationNormalized, Router } from '../types'

/**
 * 插件上下文接口
 */
export interface PluginContext {
  router: Router
  emit: (event: string, ...args: any[]) => void
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
  getPlugin: (name: string) => RouterPlugin | undefined
  hasPlugin: (name: string) => boolean
}

/**
 * 路由器插件接口
 */
export interface RouterPlugin {
  name: string
  version?: string
  description?: string
  dependencies?: string[]
  install: (context: PluginContext, options?: any) => void | Promise<void>
  uninstall?: (context: PluginContext) => void | Promise<void>
  beforeInstall?: (
    context: PluginContext,
    options?: any
  ) => boolean | Promise<boolean>
  afterInstall?: (context: PluginContext, options?: any) => void | Promise<void>
  beforeUninstall?: (context: PluginContext) => boolean | Promise<boolean>
  afterUninstall?: (context: PluginContext) => void | Promise<void>
}

/**
 * 插件安装选项
 */
export interface PluginInstallOptions {
  force?: boolean // 强制安装，即使已存在
  skipDependencies?: boolean // 跳过依赖检查
  silent?: boolean // 静默安装，不输出日志
}

/**
 * 插件卸载选项
 */
export interface PluginUninstallOptions {
  force?: boolean // 强制卸载，即使有依赖
  cascade?: boolean // 级联卸载依赖此插件的其他插件
  silent?: boolean // 静默卸载，不输出日志
}

/**
 * 插件状态
 */
export enum PluginStatus {
  NOT_INSTALLED = 'not_installed',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  UNINSTALLING = 'uninstalling',
  ERROR = 'error',
}

/**
 * 插件信息
 */
export interface PluginInfo {
  plugin: RouterPlugin
  status: PluginStatus
  installTime?: number | undefined
  options?: any
  error?: Error | undefined
  dependents?: string[] // 依赖此插件的其他插件
}

/**
 * 插件事件类型
 */
export interface PluginEvents {
  'plugin:before-install': (name: string, options?: any) => void
  'plugin:after-install': (name: string, options?: any) => void
  'plugin:before-uninstall': (name: string) => void
  'plugin:after-uninstall': (name: string) => void
  'plugin:error': (name: string, error: Error) => void
  'plugin:status-change': (name: string, status: PluginStatus) => void
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  // 插件管理
  register: (plugin: RouterPlugin) => void
  install: (
    name: string,
    options?: any,
    installOptions?: PluginInstallOptions
  ) => Promise<void>
  uninstall: (
    name: string,
    uninstallOptions?: PluginUninstallOptions
  ) => Promise<void>

  // 插件查询
  has: (name: string) => boolean
  get: (name: string) => RouterPlugin | undefined
  getInfo: (name: string) => PluginInfo | undefined
  getAll: () => RouterPlugin[]
  getAllInfo: () => PluginInfo[]
  getInstalled: () => RouterPlugin[]

  // 依赖管理
  checkDependencies: (name: string) => string[]
  getDependents: (name: string) => string[]

  // 事件系统
  on: <K extends keyof PluginEvents>(event: K, handler: PluginEvents[K]) => void
  off: <K extends keyof PluginEvents>(
    event: K,
    handler: PluginEvents[K]
  ) => void
  emit: <K extends keyof PluginEvents>(
    event: K,
    ...args: Parameters<PluginEvents[K]>
  ) => void

  // 工具方法
  clear: () => void
  destroy: () => void
}

/**
 * 分析插件选项
 */
export interface AnalyticsPluginOptions {
  trackingId?: string
  enablePageViews?: boolean
  enableTiming?: boolean
  enableErrors?: boolean
  customDimensions?: Record<string, string>
  trackPageView?: (route: RouteLocationNormalized) => void
  trackTiming?: (
    name: string,
    duration: number,
    route: RouteLocationNormalized
  ) => void
  trackError?: (error: Error, route: RouteLocationNormalized) => void
}

/**
 * 权限插件选项
 */
export interface PermissionPluginOptions {
  getUser: () => any | Promise<any>
  loginPath?: string
  forbiddenPath?: string
  unauthorizedPath?: string
  checkRole?: (role: string, user: any) => boolean
  checkPermission?: (permission: string, user: any) => boolean
}

/**
 * 缓存插件选项
 */
export interface CachePluginOptions {
  maxSize?: number
  ttl?: number
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  include?: (string | RegExp)[]
  exclude?: (string | RegExp)[]
  condition?: (route: RouteLocationNormalized) => boolean
}

/**
 * 面包屑插件选项
 */
export interface BreadcrumbPluginOptions {
  separator?: string
  homeText?: string
  homePath?: string
  maxItems?: number
  showHome?: boolean
  generateText?: (route: RouteLocationNormalized) => string
}

/**
 * 进度条插件选项
 */
export interface ProgressPluginOptions {
  color?: string
  height?: number
  duration?: number
  showSpinner?: boolean
  start?: () => void
  finish?: () => void
  error?: () => void
  increase?: (amount: number) => void
}

/**
 * 标题插件选项
 */
export interface TitlePluginOptions {
  suffix?: string
  separator?: string
  template?: string
  generateTitle?: (route: RouteLocationNormalized) => string
}
