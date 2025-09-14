/**
 * 树形组件框架适配器相关类型定义
 */

import type { TreeNode, TreeNodeData } from './tree-node'
import type { TreeOptions } from './tree-options'
import type { TreeEventMap } from './tree-events'
import type { TreeInstance } from './tree-plugin'

/**
 * 框架适配器基础接口
 */
export interface TreeAdapter<TComponent = any, TProps = any> {
  /** 适配器名称 */
  name: string
  /** 适配器版本 */
  version: string
  /** 支持的框架版本 */
  frameworkVersion: string
  /** 创建组件实例 */
  createComponent(props: TProps): TComponent
  /** 更新组件属性 */
  updateProps(component: TComponent, props: Partial<TProps>): void
  /** 销毁组件实例 */
  destroyComponent(component: TComponent): void
  /** 获取组件实例 */
  getInstance(component: TComponent): TreeInstance
}

/**
 * Vue 3 适配器接口
 */
export interface VueTreeAdapter extends TreeAdapter<any, VueTreeProps> {
  /** Vue 应用实例 */
  app?: any
  /** 注册全局组件 */
  registerGlobalComponent(app: any): void
  /** 创建 Vue 组件 */
  createVueComponent(): any
}

/**
 * Vue 3 组件属性接口
 */
export interface VueTreeProps {
  /** 树形数据 */
  data?: TreeNodeData[]
  /** 组件配置选项 */
  options?: Partial<TreeOptions>
  /** 选中的节点ID */
  selectedIds?: (string | number)[]
  /** 展开的节点ID */
  expandedIds?: (string | number)[]
  /** 搜索关键词 */
  searchKeyword?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  class?: string
  /** 自定义样式 */
  style?: Record<string, any>
}

/**
 * Vue 3 组件事件接口
 */
export interface VueTreeEvents {
  /** 选择事件 */
  'update:selectedIds': (ids: (string | number)[]) => void
  /** 展开事件 */
  'update:expandedIds': (ids: (string | number)[]) => void
  /** 搜索事件 */
  'update:searchKeyword': (keyword: string) => void
  /** 节点点击事件 */
  'node-click': (node: TreeNode, event: MouseEvent) => void
  /** 节点双击事件 */
  'node-dblclick': (node: TreeNode, event: MouseEvent) => void
  /** 节点右键事件 */
  'node-contextmenu': (node: TreeNode, event: MouseEvent) => void
  /** 节点选择事件 */
  'node-select': (node: TreeNode, selected: boolean) => void
  /** 节点展开事件 */
  'node-expand': (node: TreeNode, expanded: boolean) => void
  /** 拖拽事件 */
  'node-drag': (dragNode: TreeNode, dropNode: TreeNode, position: 'before' | 'after' | 'inside') => void
}

/**
 * React 适配器接口
 */
export interface ReactTreeAdapter extends TreeAdapter<any, ReactTreeProps> {
  /** 创建 React 组件 */
  createReactComponent(): React.ComponentType<ReactTreeProps>
  /** 创建 Hook */
  createHook(): (props: ReactTreeProps) => any
}

/**
 * React 组件属性接口
 */
export interface ReactTreeProps {
  /** 树形数据 */
  data?: TreeNodeData[]
  /** 组件配置选项 */
  options?: Partial<TreeOptions>
  /** 选中的节点ID */
  selectedIds?: (string | number)[]
  /** 展开的节点ID */
  expandedIds?: (string | number)[]
  /** 搜索关键词 */
  searchKeyword?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 节点点击事件 */
  onNodeClick?: (node: TreeNode, event: React.MouseEvent) => void
  /** 节点双击事件 */
  onNodeDoubleClick?: (node: TreeNode, event: React.MouseEvent) => void
  /** 节点右键事件 */
  onNodeContextMenu?: (node: TreeNode, event: React.MouseEvent) => void
  /** 节点选择事件 */
  onNodeSelect?: (node: TreeNode, selected: boolean) => void
  /** 节点展开事件 */
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void
  /** 拖拽事件 */
  onNodeDrag?: (dragNode: TreeNode, dropNode: TreeNode, position: 'before' | 'after' | 'inside') => void
  /** 选择变更事件 */
  onSelectedChange?: (ids: (string | number)[]) => void
  /** 展开变更事件 */
  onExpandedChange?: (ids: (string | number)[]) => void
  /** 搜索变更事件 */
  onSearchChange?: (keyword: string) => void
}

/**
 * Angular 适配器接口
 */
export interface AngularTreeAdapter extends TreeAdapter<any, AngularTreeProps> {
  /** Angular 模块 */
  module?: any
  /** 创建 Angular 组件 */
  createAngularComponent(): any
  /** 创建 Angular 指令 */
  createAngularDirective(): any
  /** 创建 Angular 服务 */
  createAngularService(): any
}

/**
 * Angular 组件属性接口
 */
export interface AngularTreeProps {
  /** 树形数据 */
  data?: TreeNodeData[]
  /** 组件配置选项 */
  options?: Partial<TreeOptions>
  /** 选中的节点ID */
  selectedIds?: (string | number)[]
  /** 展开的节点ID */
  expandedIds?: (string | number)[]
  /** 搜索关键词 */
  searchKeyword?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  class?: string
  /** 自定义样式 */
  style?: Record<string, any>
}

/**
 * Angular 组件事件接口
 */
export interface AngularTreeEvents {
  /** 选择变更事件 */
  selectedIdsChange: (string | number)[]
  /** 展开变更事件 */
  expandedIdsChange: (string | number)[]
  /** 搜索变更事件 */
  searchKeywordChange: string
  /** 节点点击事件 */
  nodeClick: { node: TreeNode; event: MouseEvent }
  /** 节点双击事件 */
  nodeDoubleClick: { node: TreeNode; event: MouseEvent }
  /** 节点右键事件 */
  nodeContextMenu: { node: TreeNode; event: MouseEvent }
  /** 节点选择事件 */
  nodeSelect: { node: TreeNode; selected: boolean }
  /** 节点展开事件 */
  nodeExpand: { node: TreeNode; expanded: boolean }
  /** 拖拽事件 */
  nodeDrag: { dragNode: TreeNode; dropNode: TreeNode; position: 'before' | 'after' | 'inside' }
}

/**
 * 适配器工厂接口
 */
export interface TreeAdapterFactory {
  /** 创建 Vue 适配器 */
  createVueAdapter(): VueTreeAdapter
  /** 创建 React 适配器 */
  createReactAdapter(): ReactTreeAdapter
  /** 创建 Angular 适配器 */
  createAngularAdapter(): AngularTreeAdapter
  /** 获取适配器 */
  getAdapter(framework: 'vue' | 'react' | 'angular'): TreeAdapter
  /** 注册自定义适配器 */
  registerAdapter(name: string, adapter: TreeAdapter): void
  /** 检测当前框架 */
  detectFramework(): 'vue' | 'react' | 'angular' | 'vanilla' | 'unknown'
}

/**
 * 框架检测结果接口
 */
export interface FrameworkDetectionResult {
  /** 框架名称 */
  name: 'vue' | 'react' | 'angular' | 'vanilla' | 'unknown'
  /** 框架版本 */
  version?: string
  /** 是否支持 */
  supported: boolean
  /** 推荐的适配器 */
  adapter?: TreeAdapter
}
