/**
 * 插件系统类型定义（为后续 plugin 包预留）
 * 
 * 定义插件系统的接口和类型，为后续的 @ldesign/plugin 包预留扩展空间
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin as VitePlugin } from 'vite'
import type { ViteLauncherConfig } from './config'
import type { IViteLauncher } from './launcher'
import type { ValidationResult, AsyncResult } from './common'

/**
 * Launcher 插件接口
 * 扩展 Vite 插件，添加 launcher 特有的功能
 */
export interface LauncherPlugin extends Omit<VitePlugin, 'config'> {
  /** 插件元数据 */
  meta?: PluginMeta

  /** 插件配置 */
  config?: PluginConfig

  /** 插件生命周期钩子 */
  hooks?: PluginHooks

  /** 插件初始化方法 */
  init?(launcher: IViteLauncher): Promise<void> | void

  /** 插件销毁方法 */
  destroy?(): Promise<void> | void

  /** 插件配置验证方法 */
  validateConfig?(config: any): ValidationResult
}

/**
 * 插件元数据接口
 * 定义插件的基本信息
 */
export interface PluginMeta {
  /** 插件名称 */
  name: string

  /** 插件版本 */
  version: string

  /** 插件描述 */
  description?: string

  /** 插件作者 */
  author?: string

  /** 插件主页 */
  homepage?: string

  /** 插件仓库地址 */
  repository?: string

  /** 插件许可证 */
  license?: string

  /** 插件关键词 */
  keywords?: string[]

  /** 插件依赖 */
  dependencies?: string[]

  /** 插件兼容的 launcher 版本 */
  launcherVersion?: string

  /** 插件兼容的 Vite 版本 */
  viteVersion?: string
}

/**
 * 插件配置接口
 * 定义插件的配置选项
 */
export interface PluginConfig {
  /** 是否启用插件 */
  enabled?: boolean

  /** 插件优先级 */
  priority?: number

  /** 插件应用的环境 */
  apply?: 'build' | 'serve' | ((config: ViteLauncherConfig) => boolean)

  /** 插件执行条件 */
  enforce?: 'pre' | 'post'

  /** 插件配置选项 */
  options?: Record<string, any>
}

/**
 * 插件生命周期钩子接口
 * 定义插件在不同生命周期阶段的回调函数
 */
export interface PluginHooks {
  /** 插件加载前钩子 */
  beforeLoad?(): Promise<void> | void

  /** 插件加载后钩子 */
  afterLoad?(): Promise<void> | void

  /** 配置解析前钩子 */
  beforeConfigResolved?(config: ViteLauncherConfig): Promise<ViteLauncherConfig> | ViteLauncherConfig

  /** 配置解析后钩子 */
  afterConfigResolved?(config: ViteLauncherConfig): Promise<void> | void

  /** 服务器启动前钩子 */
  beforeServerStart?(): Promise<void> | void

  /** 服务器启动后钩子 */
  afterServerStart?(): Promise<void> | void

  /** 构建开始前钩子 */
  beforeBuildStart?(): Promise<void> | void

  /** 构建完成后钩子 */
  afterBuildEnd?(): Promise<void> | void

  /** 插件卸载前钩子 */
  beforeUnload?(): Promise<void> | void

  /** 插件卸载后钩子 */
  afterUnload?(): Promise<void> | void
}

/**
 * 插件管理器接口
 * 定义插件管理器的功能
 */
export interface IPluginManager {
  /** 注册插件 */
  register(plugin: LauncherPlugin): Promise<AsyncResult>

  /** 卸载插件 */
  unregister(pluginName: string): Promise<AsyncResult>

  /** 启用插件 */
  enable(pluginName: string): Promise<AsyncResult>

  /** 禁用插件 */
  disable(pluginName: string): Promise<AsyncResult>

  /** 获取插件列表 */
  getPlugins(): LauncherPlugin[]

  /** 获取已启用的插件列表 */
  getEnabledPlugins(): LauncherPlugin[]

  /** 获取插件信息 */
  getPluginInfo(pluginName: string): PluginInfo | null

  /** 验证插件 */
  validatePlugin(plugin: LauncherPlugin): ValidationResult

  /** 解析插件依赖 */
  resolveDependencies(): Promise<AsyncResult>

  /** 清理插件缓存 */
  clearCache(): Promise<void>
}

/**
 * 插件信息接口
 * 定义插件的运行时信息
 */
export interface PluginInfo {
  /** 插件实例 */
  plugin: LauncherPlugin

  /** 插件状态 */
  status: PluginStatus

  /** 加载时间 */
  loadTime: number

  /** 最后活动时间 */
  lastActivity: number

  /** 错误信息 */
  error?: Error

  /** 插件统计信息 */
  stats: PluginStats
}

/**
 * 插件清单
 */
export interface PluginManifest {
  /** 插件ID */
  id: string
  /** 插件名称 */
  name: string
  /** 版本 */
  version: string
  /** 描述 */
  description: string
  /** 主文件 */
  main: string
  /** 配置 */
  config: Record<string, any>
  /** 是否启用 */
  enabled: boolean
  /** 安装时间 */
  installedAt?: string
}

/**
 * 插件版本信息
 */
export interface PluginVersion {
  /** 版本号 */
  version: string
  /** 依赖 */
  dependencies?: Record<string, string>
  /** 发布时间 */
  publishedAt: Date
}

/**
 * 插件搜索结果
 */
export interface PluginSearchResult {
  /** 插件ID */
  id: string
  /** 名称 */
  name: string
  /** 描述 */
  description: string
  /** 版本 */
  version: string
  /** 作者 */
  author: string
  /** 下载量 */
  downloads: number
  /** 评分 */
  rating: number
  /** 标签 */
  tags: string[]
  /** 分类 */
  category: string
}

/**
 * 插件状态枚举
 * 定义插件的运行状态
 */
export enum PluginStatus {
  /** 未加载 */
  UNLOADED = 'unloaded',
  /** 正在加载 */
  LOADING = 'loading',
  /** 已加载 */
  LOADED = 'loaded',
  /** 已启用 */
  ENABLED = 'enabled',
  /** 已禁用 */
  DISABLED = 'disabled',
  /** 错误状态 */
  ERROR = 'error'
}

/**
 * 插件统计信息接口
 * 定义插件的统计数据
 */
export interface PluginStats {
  /** 调用次数 */
  callCount: number

  /** 总执行时间 */
  totalExecutionTime: number

  /** 平均执行时间 */
  averageExecutionTime: number

  /** 错误次数 */
  errorCount: number

  /** 最后执行时间 */
  lastExecutionTime: number
}

/**
 * 插件注册选项接口
 * 定义注册插件时的选项
 */
export interface PluginRegistrationOptions {
  /** 是否立即启用 */
  autoEnable?: boolean

  /** 插件优先级 */
  priority?: number

  /** 是否覆盖已存在的插件 */
  override?: boolean

  /** 插件配置 */
  config?: PluginConfig
}

/**
 * 插件加载器接口
 * 定义插件加载器的功能
 */
export interface IPluginLoader {
  /** 从文件加载插件 */
  loadFromFile(filePath: string): Promise<LauncherPlugin>

  /** 从模块加载插件 */
  loadFromModule(moduleName: string): Promise<LauncherPlugin>

  /** 从配置加载插件 */
  loadFromConfig(config: PluginConfig): Promise<LauncherPlugin>

  /** 批量加载插件 */
  loadBatch(sources: (string | PluginConfig)[]): Promise<LauncherPlugin[]>

  /** 验证插件文件 */
  validatePluginFile(filePath: string): ValidationResult
}

/**
 * 插件事件类型枚举
 * 定义插件系统的事件类型
 */
export enum PluginEvent {
  /** 插件注册事件 */
  PLUGIN_REGISTERED = 'pluginRegistered',
  /** 插件卸载事件 */
  PLUGIN_UNREGISTERED = 'pluginUnregistered',
  /** 插件启用事件 */
  PLUGIN_ENABLED = 'pluginEnabled',
  /** 插件禁用事件 */
  PLUGIN_DISABLED = 'pluginDisabled',
  /** 插件错误事件 */
  PLUGIN_ERROR = 'pluginError',
  /** 插件加载事件 */
  PLUGIN_LOADED = 'pluginLoaded'
}

/**
 * 插件事件数据接口
 * 定义插件事件携带的数据
 */
export interface PluginEventData {
  [PluginEvent.PLUGIN_REGISTERED]: {
    plugin: LauncherPlugin
    timestamp: number
  }

  [PluginEvent.PLUGIN_UNREGISTERED]: {
    pluginName: string
    timestamp: number
  }

  [PluginEvent.PLUGIN_ENABLED]: {
    plugin: LauncherPlugin
    timestamp: number
  }

  [PluginEvent.PLUGIN_DISABLED]: {
    plugin: LauncherPlugin
    timestamp: number
  }

  [PluginEvent.PLUGIN_ERROR]: {
    plugin: LauncherPlugin
    error: Error
    timestamp: number
  }

  [PluginEvent.PLUGIN_LOADED]: {
    plugin: LauncherPlugin
    loadTime: number
    timestamp: number
  }
}
