/**
 * 插件系统类型定义
 */

import type { BasePlugin } from './base'
import type { CoreEngine } from './engine'

/**
 * 插件元数据
 */
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

/**
 * 插件上下文
 */
export interface PluginContext {
  readonly engine: CoreEngine
  readonly logger: any
  readonly config: any
  readonly events: any
}

/**
 * 插件接口
 */
export interface Plugin extends BasePlugin {
  /** 安装插件 */
  install: (context: PluginContext) => void | Promise<void>
  /** 卸载插件 */
  uninstall?: (context: PluginContext) => void | Promise<void>

  /** 生命周期钩子 */
  beforeInstall?: (context: PluginContext) => void | Promise<void>
  afterInstall?: (context: PluginContext) => void | Promise<void>
  beforeUninstall?: (context: PluginContext) => void | Promise<void>
  afterUninstall?: (context: PluginContext) => void | Promise<void>

  /** 插件状态 */
  isEnabled?: () => boolean

  /** 插件配置 */
  readonly config?: Record<string, unknown>

  /** 插件元数据 */
  readonly metadata?: Partial<PluginMetadata>
}

/**
 * 插件状态
 */
export type PluginStatus =
  | 'pending'
  | 'installing'
  | 'installed'
  | 'uninstalling'
  | 'error'

/**
 * 插件信息
 */
export interface PluginInfo {
  readonly plugin: Plugin
  readonly status: PluginStatus
  readonly installTime?: number
  readonly error?: Error
  readonly dependencies: readonly string[]
  readonly dependents: readonly string[]
}

/**
 * 插件管理器接口
 */
export interface PluginManager {
  /** 注册插件 */
  register: (plugin: Plugin) => Promise<void>
  /** 注销插件 */
  unregister: (name: string) => Promise<void>
  /** 获取插件 */
  get: (name: string) => Plugin | undefined
  /** 获取插件信息 */
  getInfo: (name: string) => PluginInfo | undefined
  /** 获取所有插件 */
  getAll: () => Plugin[]
  /** 获取所有插件信息 */
  getAllInfo: () => PluginInfo[]
  /** 检查插件是否已注册 */
  isRegistered: (name: string) => boolean
  /** 检查插件是否存在 */
  has: (name: string) => boolean
  /** 获取插件状态 */
  getStatus: (name: string) => PluginStatus | undefined

  /** 依赖管理 */
  checkDependencies: (plugin: Plugin) => {
    satisfied: boolean
    missing: string[]
    conflicts: string[]
  }
  getLoadOrder: () => string[]
  getDependencyGraph: () => Record<string, string[]>

  /** 统计信息 */
  getStats: () => {
    total: number
    loaded: string[]
    dependencies: Record<string, string[]>
    installed: number
    pending: number
    errors: number
  }

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

