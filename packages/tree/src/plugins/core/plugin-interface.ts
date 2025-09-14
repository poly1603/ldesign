/**
 * 插件接口定义
 */

import type { Tree } from '../../core/tree'
import type { TreeNode } from '../../types'

/**
 * 插件生命周期钩子
 */
export interface PluginLifecycle {
  /**
   * 插件安装时调用
   * @param context 插件上下文
   */
  install?(context: PluginContext): void | Promise<void>

  /**
   * 树挂载前调用
   * @param context 插件上下文
   */
  beforeMount?(context: PluginContext): void | Promise<void>

  /**
   * 树挂载后调用
   * @param context 插件上下文
   */
  mounted?(context: PluginContext): void | Promise<void>

  /**
   * 树更新前调用
   * @param context 插件上下文
   */
  beforeUpdate?(context: PluginContext): void | Promise<void>

  /**
   * 树更新后调用
   * @param context 插件上下文
   */
  updated?(context: PluginContext): void | Promise<void>

  /**
   * 树卸载前调用
   * @param context 插件上下文
   */
  beforeUnmount?(context: PluginContext): void | Promise<void>

  /**
   * 插件卸载时调用
   * @param context 插件上下文
   */
  uninstall?(context: PluginContext): void | Promise<void>
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /**
   * 插件名称
   */
  name: string

  /**
   * 插件版本
   */
  version: string

  /**
   * 插件描述
   */
  description?: string

  /**
   * 插件作者
   */
  author?: string

  /**
   * 插件依赖
   */
  dependencies?: string[]

  /**
   * 插件配置模式
   */
  configSchema?: Record<string, any>
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /**
   * 是否启用插件
   */
  enabled?: boolean

  /**
   * 插件特定配置
   */
  [key: string]: any
}

/**
 * 插件上下文
 */
export interface PluginContext {
  /**
   * 树实例
   */
  tree: Tree

  /**
   * 插件管理器
   */
  pluginManager: PluginManager

  /**
   * 插件配置
   */
  config: PluginConfig

  /**
   * 插件元数据
   */
  metadata: PluginMetadata

  /**
   * 获取其他插件实例
   */
  getPlugin<T = Plugin>(name: string): T | undefined

  /**
   * 发送事件
   */
  emit(event: string, ...args: any[]): void

  /**
   * 监听事件
   */
  on(event: string, callback: (...args: any[]) => void): void

  /**
   * 取消监听事件
   */
  off(event: string, callback?: (...args: any[]) => void): void

  /**
   * 创建DOM元素
   */
  createElement(tag: string, props?: Record<string, any>): HTMLElement

  /**
   * 添加样式
   */
  addStyle(css: string): void

  /**
   * 移除样式
   */
  removeStyle(css: string): void

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode[]

  /**
   * 获取所有节点
   */
  getAllNodes(): TreeNode[]

  /**
   * 查找节点
   */
  findNode(predicate: (node: TreeNode) => boolean): TreeNode | undefined

  /**
   * 查找多个节点
   */
  findNodes(predicate: (node: TreeNode) => boolean): TreeNode[]
}

/**
 * 插件接口
 */
export interface Plugin extends PluginLifecycle {
  /**
   * 插件元数据
   */
  readonly metadata: PluginMetadata

  /**
   * 插件配置
   */
  config: PluginConfig

  /**
   * 插件上下文
   */
  context?: PluginContext

  /**
   * 插件是否已安装
   */
  readonly installed: boolean

  /**
   * 插件是否已启用
   */
  readonly enabled: boolean

  /**
   * 设置插件配置
   */
  setConfig(config: Partial<PluginConfig>): void

  /**
   * 获取插件配置
   */
  getConfig<T = any>(key?: string): T

  /**
   * 验证插件配置
   */
  validateConfig(config: PluginConfig): boolean

  /**
   * 插件API（可选）
   */
  api?: Record<string, any>
}

/**
 * 插件管理器接口
 */
export interface PluginManager {
  /**
   * 注册插件
   */
  register(plugin: Plugin): void

  /**
   * 卸载插件
   */
  unregister(name: string): void

  /**
   * 获取插件
   */
  get<T = Plugin>(name: string): T | undefined

  /**
   * 获取所有插件
   */
  getAll(): Plugin[]

  /**
   * 启用插件
   */
  enable(name: string): void

  /**
   * 禁用插件
   */
  disable(name: string): void

  /**
   * 检查插件是否存在
   */
  has(name: string): boolean

  /**
   * 检查插件是否启用
   */
  isEnabled(name: string): boolean

  /**
   * 调用插件生命周期钩子
   */
  callHook(hook: keyof PluginLifecycle, ...args: any[]): Promise<void>

  /**
   * 销毁插件管理器
   */
  destroy(): void
}

/**
 * 插件工厂函数类型
 */
export type PluginFactory<T extends Plugin = Plugin> = (config?: PluginConfig) => T

/**
 * 插件注册选项
 */
export interface PluginRegistrationOptions {
  /**
   * 插件配置
   */
  config?: PluginConfig

  /**
   * 是否立即启用
   */
  enabled?: boolean

  /**
   * 是否覆盖已存在的插件
   */
  override?: boolean
}

/**
 * 插件事件类型
 */
export interface PluginEvents {
  /**
   * 插件注册事件
   */
  'plugin:registered': [plugin: Plugin]

  /**
   * 插件卸载事件
   */
  'plugin:unregistered': [name: string]

  /**
   * 插件启用事件
   */
  'plugin:enabled': [plugin: Plugin]

  /**
   * 插件禁用事件
   */
  'plugin:disabled': [plugin: Plugin]

  /**
   * 插件错误事件
   */
  'plugin:error': [error: Error, plugin: Plugin]
}

/**
 * 插件状态
 */
export enum PluginStatus {
  /**
   * 未安装
   */
  UNINSTALLED = 'uninstalled',

  /**
   * 已安装但未启用
   */
  INSTALLED = 'installed',

  /**
   * 已启用
   */
  ENABLED = 'enabled',

  /**
   * 已禁用
   */
  DISABLED = 'disabled',

  /**
   * 错误状态
   */
  ERROR = 'error',
}

/**
 * 插件信息
 */
export interface PluginInfo {
  /**
   * 插件实例
   */
  plugin: Plugin

  /**
   * 插件状态
   */
  status: PluginStatus

  /**
   * 插件错误（如果有）
   */
  error?: Error

  /**
   * 安装时间
   */
  installedAt?: Date

  /**
   * 启用时间
   */
  enabledAt?: Date
}
