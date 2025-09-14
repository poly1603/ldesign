/**
 * 树形组件事件相关类型定义
 */

import type { TreeNode, TreeNodeData, TreeNodeId } from './tree-node'

/**
 * 基础事件接口
 */
export interface BaseTreeEvent {
  /** 事件类型 */
  type: string
  /** 事件时间戳 */
  timestamp: number
  /** 是否可以取消 */
  cancelable: boolean
  /** 是否已取消 */
  cancelled: boolean
  /** 取消事件 */
  preventDefault(): void
}

/**
 * 节点相关事件接口
 */
export interface TreeNodeEvent extends BaseTreeEvent {
  /** 触发事件的节点 */
  node: TreeNode
  /** 原始DOM事件 */
  originalEvent?: Event
}

/**
 * 选择事件接口
 */
export interface TreeSelectEvent extends TreeNodeEvent {
  type: 'select' | 'unselect'
  /** 当前选中的所有节点 */
  selectedNodes: TreeNode[]
  /** 当前选中的节点ID */
  selectedIds: TreeNodeId[]
}

/**
 * 展开事件接口
 */
export interface TreeExpandEvent extends TreeNodeEvent {
  type: 'expand' | 'collapse'
  /** 当前展开的所有节点 */
  expandedNodes: TreeNode[]
  /** 当前展开的节点ID */
  expandedIds: TreeNodeId[]
}

/**
 * 拖拽事件接口
 */
export interface TreeDragEvent extends BaseTreeEvent {
  type: 'dragstart' | 'dragover' | 'dragenter' | 'dragleave' | 'drop' | 'dragend'
  /** 被拖拽的节点 */
  dragNode: TreeNode
  /** 拖拽目标节点 */
  dropNode?: TreeNode
  /** 拖拽位置 */
  position?: 'before' | 'after' | 'inside'
  /** 原始拖拽事件 */
  originalEvent: DragEvent
}

/**
 * 搜索事件接口
 */
export interface TreeSearchEvent extends BaseTreeEvent {
  type: 'search' | 'search-clear'
  /** 搜索关键词 */
  keyword: string
  /** 匹配的节点 */
  matchedNodes: TreeNode[]
  /** 匹配的节点ID */
  matchedIds: TreeNodeId[]
}

/**
 * 异步加载事件接口
 */
export interface TreeLoadEvent extends TreeNodeEvent {
  type: 'load-start' | 'load-success' | 'load-error'
  /** 加载的子节点数据 */
  children?: TreeNodeData[]
  /** 加载错误信息 */
  error?: Error
}

/**
 * 节点操作事件接口
 */
export interface TreeNodeOperationEvent extends BaseTreeEvent {
  type: 'node-add' | 'node-remove' | 'node-update' | 'node-move'
  /** 操作的节点 */
  node: TreeNode
  /** 操作的父节点 */
  parent?: TreeNode
  /** 操作前的数据 */
  oldData?: TreeNodeData
  /** 操作后的数据 */
  newData?: TreeNodeData
  /** 操作的索引位置 */
  index?: number
}

/**
 * 虚拟滚动事件接口
 */
export interface TreeVirtualScrollEvent extends BaseTreeEvent {
  type: 'virtual-scroll'
  /** 可见区域开始索引 */
  startIndex: number
  /** 可见区域结束索引 */
  endIndex: number
  /** 可见的节点 */
  visibleNodes: TreeNode[]
}

/**
 * 树形组件事件映射
 */
export interface TreeEventMap {
  // 选择事件
  select: TreeSelectEvent
  unselect: TreeSelectEvent
  'selection-change': TreeSelectEvent
  
  // 展开事件
  expand: TreeExpandEvent
  collapse: TreeExpandEvent
  'expansion-change': TreeExpandEvent
  
  // 拖拽事件
  dragstart: TreeDragEvent
  dragover: TreeDragEvent
  dragenter: TreeDragEvent
  dragleave: TreeDragEvent
  drop: TreeDragEvent
  dragend: TreeDragEvent
  
  // 搜索事件
  search: TreeSearchEvent
  'search-clear': TreeSearchEvent
  
  // 异步加载事件
  'load-start': TreeLoadEvent
  'load-success': TreeLoadEvent
  'load-error': TreeLoadEvent
  
  // 节点操作事件
  'node-add': TreeNodeOperationEvent
  'node-remove': TreeNodeOperationEvent
  'node-update': TreeNodeOperationEvent
  'node-move': TreeNodeOperationEvent
  
  // 虚拟滚动事件
  'virtual-scroll': TreeVirtualScrollEvent
  
  // 通用事件
  click: TreeNodeEvent
  dblclick: TreeNodeEvent
  contextmenu: TreeNodeEvent
  focus: TreeNodeEvent
  blur: TreeNodeEvent
  keydown: TreeNodeEvent
  keyup: TreeNodeEvent
}

/**
 * 事件监听器类型
 */
export type TreeEventListener<T extends keyof TreeEventMap> = (event: TreeEventMap[T]) => void

/**
 * 事件监听器选项
 */
export interface TreeEventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean
  /** 是否在捕获阶段执行 */
  capture?: boolean
  /** 是否是被动监听器 */
  passive?: boolean
}

/**
 * 事件发射器接口
 */
export interface TreeEventEmitter {
  /** 添加事件监听器 */
  on<T extends keyof TreeEventMap>(
    type: T,
    listener: TreeEventListener<T>,
    options?: TreeEventListenerOptions
  ): void
  
  /** 移除事件监听器 */
  off<T extends keyof TreeEventMap>(
    type: T,
    listener: TreeEventListener<T>
  ): void
  
  /** 添加一次性事件监听器 */
  once<T extends keyof TreeEventMap>(
    type: T,
    listener: TreeEventListener<T>
  ): void
  
  /** 触发事件 */
  emit<T extends keyof TreeEventMap>(
    type: T,
    event: TreeEventMap[T]
  ): boolean
  
  /** 移除所有事件监听器 */
  removeAllListeners(type?: keyof TreeEventMap): void
  
  /** 获取事件监听器数量 */
  listenerCount(type: keyof TreeEventMap): number
}
