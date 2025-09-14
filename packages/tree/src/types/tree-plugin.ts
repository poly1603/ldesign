/**
 * 树形组件插件系统相关类型定义
 */

import type { TreeNode, TreeNodeId } from './tree-node'
import type { TreeOptions } from './tree-options'
import type { TreeState, TreeStateManager } from './tree-state'
import type { TreeEventEmitter } from './tree-events'

/**
 * 插件生命周期钩子
 */
export interface TreePluginHooks {
  /** 插件初始化前 */
  beforeInit?: (options: TreeOptions) => void | Promise<void>
  /** 插件初始化后 */
  afterInit?: (tree: TreeInstance) => void | Promise<void>
  /** 数据加载前 */
  beforeDataLoad?: (data: TreeNode[]) => TreeNode[] | Promise<TreeNode[]>
  /** 数据加载后 */
  afterDataLoad?: (data: TreeNode[]) => void | Promise<void>
  /** 节点渲染前 */
  beforeNodeRender?: (node: TreeNode) => TreeNode | Promise<TreeNode>
  /** 节点渲染后 */
  afterNodeRender?: (node: TreeNode, element: HTMLElement) => void | Promise<void>
  /** 节点选择前 */
  beforeNodeSelect?: (node: TreeNode) => boolean | Promise<boolean>
  /** 节点选择后 */
  afterNodeSelect?: (node: TreeNode) => void | Promise<void>
  /** 节点展开前 */
  beforeNodeExpand?: (node: TreeNode) => boolean | Promise<boolean>
  /** 节点展开后 */
  afterNodeExpand?: (node: TreeNode) => void | Promise<void>
  /** 拖拽开始前 */
  beforeDragStart?: (dragNode: TreeNode) => boolean | Promise<boolean>
  /** 拖拽结束后 */
  afterDragEnd?: (dragNode: TreeNode, dropNode?: TreeNode, position?: 'before' | 'after' | 'inside') => void | Promise<void>
  /** 搜索前 */
  beforeSearch?: (keyword: string) => string | Promise<string>
  /** 搜索后 */
  afterSearch?: (keyword: string, results: TreeNode[]) => void | Promise<void>
  /** 插件销毁前 */
  beforeDestroy?: () => void | Promise<void>
  /** 插件销毁后 */
  afterDestroy?: () => void | Promise<void>
}

/**
 * 插件配置接口
 */
export interface TreePluginConfig {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 插件描述 */
  description?: string
  /** 插件作者 */
  author?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件配置选项 */
  options?: Record<string, any>
  /** 是否启用插件 */
  enabled?: boolean
}

/**
 * 插件实例接口
 */
export interface TreePlugin extends TreePluginConfig, TreePluginHooks {
  /** 插件安装方法 */
  install(tree: TreeInstance): void | Promise<void>
  /** 插件卸载方法 */
  uninstall?(tree: TreeInstance): void | Promise<void>
  /** 插件更新配置方法 */
  updateConfig?(config: Partial<TreePluginConfig>): void
  /** 获取插件状态 */
  getStatus?(): 'installed' | 'uninstalled' | 'error'
}

/**
 * 树形组件实例接口（用于插件系统）
 */
export interface TreeInstance {
  /** 组件配置选项 */
  options: TreeOptions
  /** 状态管理器 */
  stateManager: TreeStateManager
  /** 事件发射器 */
  eventEmitter: TreeEventEmitter
  /** 容器元素 */
  container: HTMLElement
  /** 获取当前状态 */
  getState(): TreeState
  /** 获取节点 */
  getNode(id: TreeNodeId): TreeNode | undefined
  /** 获取所有节点 */
  getAllNodes(): TreeNode[]
  /** 获取根节点 */
  getRootNodes(): TreeNode[]
  /** 获取选中的节点 */
  getSelectedNodes(): TreeNode[]
  /** 获取展开的节点 */
  getExpandedNodes(): TreeNode[]
  /** 选择节点 */
  selectNode(id: TreeNodeId, selected?: boolean): void
  /** 展开节点 */
  expandNode(id: TreeNodeId, expanded?: boolean): void
  /** 添加节点 */
  addNode(data: TreeNode, parent?: TreeNodeId, index?: number): TreeNode
  /** 移除节点 */
  removeNode(id: TreeNodeId): boolean
  /** 更新节点 */
  updateNode(id: TreeNodeId, data: Partial<TreeNode>): boolean
  /** 移动节点 */
  moveNode(id: TreeNodeId, targetId?: TreeNodeId, position?: 'before' | 'after' | 'inside'): boolean
  /** 搜索节点 */
  search(keyword: string): TreeNode[]
  /** 清空搜索 */
  clearSearch(): void
  /** 刷新组件 */
  refresh(): void
  /** 销毁组件 */
  destroy(): void
}

/**
 * 插件管理器接口
 */
export interface TreePluginManager {
  /** 注册插件 */
  register(plugin: TreePlugin): void
  /** 卸载插件 */
  unregister(name: string): boolean
  /** 获取插件 */
  get(name: string): TreePlugin | undefined
  /** 获取所有插件 */
  getAll(): TreePlugin[]
  /** 启用插件 */
  enable(name: string): boolean
  /** 禁用插件 */
  disable(name: string): boolean
  /** 检查插件是否已注册 */
  has(name: string): boolean
  /** 检查插件是否已启用 */
  isEnabled(name: string): boolean
  /** 安装所有插件 */
  installAll(tree: TreeInstance): Promise<void>
  /** 卸载所有插件 */
  uninstallAll(tree: TreeInstance): Promise<void>
  /** 清空所有插件 */
  clear(): void
}

/**
 * 内置插件类型
 */
export interface BuiltinPlugins {
  /** 搜索插件 */
  search: TreePlugin
  /** 拖拽插件 */
  drag: TreePlugin
  /** 虚拟滚动插件 */
  virtualScroll: TreePlugin
  /** 异步加载插件 */
  asyncLoad: TreePlugin
  /** 右键菜单插件 */
  contextMenu: TreePlugin
  /** 键盘导航插件 */
  keyboard: TreePlugin
  /** 无障碍访问插件 */
  accessibility: TreePlugin
  /** 状态持久化插件 */
  persistence: TreePlugin
}

/**
 * 插件事件类型
 */
export interface PluginEvents {
  /** 插件注册事件 */
  'plugin:register': { plugin: TreePlugin }
  /** 插件卸载事件 */
  'plugin:unregister': { name: string }
  /** 插件启用事件 */
  'plugin:enable': { name: string }
  /** 插件禁用事件 */
  'plugin:disable': { name: string }
  /** 插件安装事件 */
  'plugin:install': { name: string }
  /** 插件卸载事件 */
  'plugin:uninstall': { name: string }
  /** 插件错误事件 */
  'plugin:error': { name: string; error: Error }
}
