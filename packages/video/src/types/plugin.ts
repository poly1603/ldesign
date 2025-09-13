/**
 * 插件系统类型定义
 * 定义插件的基础接口、生命周期和管理机制
 */

import type { IVideoPlayer, PlayerEvent } from './player'

/**
 * 插件生命周期钩子
 */
export enum PluginHook {
  /** 插件安装前 */
  BEFORE_INSTALL = 'beforeInstall',
  /** 插件安装后 */
  AFTER_INSTALL = 'afterInstall',
  /** 插件启用前 */
  BEFORE_ENABLE = 'beforeEnable',
  /** 插件启用后 */
  AFTER_ENABLE = 'afterEnable',
  /** 插件禁用前 */
  BEFORE_DISABLE = 'beforeDisable',
  /** 插件禁用后 */
  AFTER_DISABLE = 'afterDisable',
  /** 插件卸载前 */
  BEFORE_UNINSTALL = 'beforeUninstall',
  /** 插件卸载后 */
  AFTER_UNINSTALL = 'afterUninstall'
}

/**
 * 插件状态
 */
export enum PluginStatus {
  /** 未安装 */
  UNINSTALLED = 'uninstalled',
  /** 已安装但未启用 */
  INSTALLED = 'installed',
  /** 已启用 */
  ENABLED = 'enabled',
  /** 已禁用 */
  DISABLED = 'disabled',
  /** 错误状态 */
  ERROR = 'error'
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
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
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件标签 */
  tags?: string[]
  /** 最小播放器版本要求 */
  minPlayerVersion?: string
  /** 最大播放器版本要求 */
  maxPlayerVersion?: string
}

/**
 * 插件配置选项
 */
export interface PluginOptions {
  /** 是否默认启用 */
  enabled?: boolean
  /** 插件优先级 */
  priority?: number
  /** 插件特定配置 */
  [key: string]: any
}

/**
 * 插件上下文
 */
export interface PluginContext {
  /** 播放器实例 */
  player: IVideoPlayer
  /** 插件配置 */
  options: PluginOptions
  /** 插件元数据 */
  metadata: PluginMetadata
  /** 插件状态 */
  status: PluginStatus
  /** 插件管理器 */
  manager: IPluginManager
}

/**
 * 插件基础接口
 */
export interface IPlugin {
  /** 插件元数据 */
  readonly metadata: PluginMetadata
  /** 插件状态 */
  readonly status: PluginStatus
  /** 插件配置 */
  readonly options: PluginOptions

  /** 安装插件 */
  install(context: PluginContext): Promise<void> | void
  /** 卸载插件 */
  uninstall(context: PluginContext): Promise<void> | void
  /** 启用插件 */
  enable(context: PluginContext): Promise<void> | void
  /** 禁用插件 */
  disable(context: PluginContext): Promise<void> | void
  /** 更新插件配置 */
  updateOptions(options: Partial<PluginOptions>): void
  /** 获取插件状态 */
  getStatus(): PluginStatus
  /** 插件生命周期钩子 */
  onHook?(hook: PluginHook, context: PluginContext): Promise<void> | void
}

/**
 * 插件构造函数接口
 */
export interface PluginConstructor {
  new(options?: PluginOptions): IPlugin
  /** 插件元数据 */
  metadata: PluginMetadata
}

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  /** 已安装的插件 */
  readonly plugins: Map<string, IPlugin>
  /** 播放器实例 */
  readonly player: IVideoPlayer

  /** 注册插件 */
  register(plugin: PluginConstructor | IPlugin, options?: PluginOptions): Promise<void>
  /** 卸载插件 */
  unregister(name: string): Promise<void>
  /** 启用插件 */
  enable(name: string): Promise<void>
  /** 禁用插件 */
  disable(name: string): Promise<void>
  /** 获取插件 */
  get(name: string): IPlugin | undefined
  /** 获取所有插件 */
  getAll(): IPlugin[]
  /** 获取已启用的插件 */
  getEnabled(): IPlugin[]
  /** 检查插件是否存在 */
  has(name: string): boolean
  /** 检查插件是否启用 */
  isEnabled(name: string): boolean
  /** 更新插件配置 */
  updateOptions(name: string, options: Partial<PluginOptions>): Promise<void>
  /** 清空所有插件 */
  clear(): Promise<void>
  /** 触发插件钩子 */
  triggerHook(hook: PluginHook, context?: Partial<PluginContext>): Promise<void>
}

/**
 * 插件事件
 */
export enum PluginEvent {
  /** 插件注册 */
  PLUGIN_REGISTERED = 'plugin:registered',
  /** 插件卸载 */
  PLUGIN_UNREGISTERED = 'plugin:unregistered',
  /** 插件启用 */
  PLUGIN_ENABLED = 'plugin:enabled',
  /** 插件禁用 */
  PLUGIN_DISABLED = 'plugin:disabled',
  /** 插件错误 */
  PLUGIN_ERROR = 'plugin:error',
  /** 插件配置更新 */
  PLUGIN_OPTIONS_UPDATED = 'plugin:optionsUpdated'
}

/**
 * 插件错误类型
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public readonly pluginName: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'PluginError'
  }
}

/**
 * UI插件接口
 * 用于需要渲染UI的插件
 */
export interface IUIPlugin extends IPlugin {
  /** 渲染UI */
  render(container: HTMLElement): HTMLElement | void
  /** 销毁UI */
  destroyUI(): void
  /** 更新UI */
  updateUI?(): void
  /** 显示UI */
  show?(): void
  /** 隐藏UI */
  hide?(): void
}

/**
 * 控制栏插件接口
 * 用于在控制栏中添加按钮或控件的插件
 */
export interface IControlPlugin extends IUIPlugin {
  /** 控件位置 */
  position: 'left' | 'center' | 'right'
  /** 控件优先级 */
  priority: number
  /** 创建控件 */
  createControl(): HTMLElement
}

/**
 * 覆盖层插件接口
 * 用于在视频上方显示内容的插件
 */
export interface IOverlayPlugin extends IUIPlugin {
  /** 覆盖层层级 */
  zIndex: number
  /** 是否可交互 */
  interactive: boolean
  /** 创建覆盖层 */
  createOverlay(): HTMLElement
}

/**
 * 插件工厂函数
 */
export type PluginFactory<T extends IPlugin = IPlugin> = (
  options?: PluginOptions
) => T

/**
 * 插件定义
 */
export interface PluginDefinition {
  /** 插件元数据 */
  metadata: PluginMetadata
  /** 插件工厂函数 */
  factory: PluginFactory
  /** 默认配置 */
  defaultOptions?: PluginOptions
}
