/**
 * 树形组件状态管理相关类型定义
 */

import type { TreeNode, TreeNodeId } from './tree-node'
import type { TreeOptions } from './tree-options'

/**
 * 树形组件的全局状态接口
 */
export interface TreeState {
  /** 所有节点的映射表 */
  nodeMap: Map<TreeNodeId, TreeNode>
  /** 根节点列表 */
  rootNodes: TreeNode[]
  /** 扁平化的节点列表 */
  flatNodes: TreeNode[]
  /** 可见的节点列表 */
  visibleNodes: TreeNode[]
  /** 选中的节点ID集合 */
  selectedIds: Set<TreeNodeId>
  /** 展开的节点ID集合 */
  expandedIds: Set<TreeNodeId>
  /** 搜索关键词 */
  searchKeyword: string
  /** 匹配搜索的节点ID集合 */
  matchedIds: Set<TreeNodeId>
  /** 正在加载的节点ID集合 */
  loadingIds: Set<TreeNodeId>
  /** 拖拽状态 */
  dragState: DragState
  /** 虚拟滚动状态 */
  virtualState: VirtualScrollState
  /** 组件是否已初始化 */
  initialized: boolean
  /** 组件是否已销毁 */
  destroyed: boolean
}

/**
 * 拖拽状态接口
 */
export interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean
  /** 被拖拽的节点ID */
  dragNodeId?: TreeNodeId
  /** 拖拽目标节点ID */
  dropNodeId?: TreeNodeId
  /** 拖拽位置 */
  dropPosition?: 'before' | 'after' | 'inside'
  /** 拖拽开始位置 */
  startPosition?: { x: number; y: number }
  /** 当前拖拽位置 */
  currentPosition?: { x: number; y: number }
  /** 拖拽预览元素 */
  dragPreview?: HTMLElement
}

/**
 * 虚拟滚动状态接口
 */
export interface VirtualScrollState {
  /** 是否启用虚拟滚动 */
  enabled: boolean
  /** 容器高度 */
  containerHeight: number
  /** 滚动位置 */
  scrollTop: number
  /** 可见区域开始索引 */
  startIndex: number
  /** 可见区域结束索引 */
  endIndex: number
  /** 节点高度缓存 */
  itemHeights: Map<TreeNodeId, number>
  /** 总高度 */
  totalHeight: number
  /** 偏移量 */
  offsetY: number
}

/**
 * 状态变更动作类型
 */
export type TreeStateAction =
  | { type: 'INIT'; payload: { options: TreeOptions; data: TreeNode[] } }
  | { type: 'SET_DATA'; payload: { data: TreeNode[] } }
  | { type: 'ADD_NODE'; payload: { node: TreeNode; parent?: TreeNode; index?: number } }
  | { type: 'REMOVE_NODE'; payload: { nodeId: TreeNodeId } }
  | { type: 'UPDATE_NODE'; payload: { nodeId: TreeNodeId; data: Partial<TreeNode> } }
  | { type: 'MOVE_NODE'; payload: { nodeId: TreeNodeId; targetId?: TreeNodeId; position: 'before' | 'after' | 'inside' } }
  | { type: 'SELECT_NODE'; payload: { nodeId: TreeNodeId; selected: boolean; cascade?: boolean } }
  | { type: 'EXPAND_NODE'; payload: { nodeId: TreeNodeId; expanded: boolean } }
  | { type: 'SEARCH'; payload: { keyword: string } }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'START_LOADING'; payload: { nodeId: TreeNodeId } }
  | { type: 'FINISH_LOADING'; payload: { nodeId: TreeNodeId; children?: TreeNode[]; error?: Error } }
  | { type: 'START_DRAG'; payload: { nodeId: TreeNodeId; position: { x: number; y: number } } }
  | { type: 'UPDATE_DRAG'; payload: { position: { x: number; y: number }; dropNodeId?: TreeNodeId; dropPosition?: 'before' | 'after' | 'inside' } }
  | { type: 'END_DRAG' }
  | { type: 'UPDATE_VIRTUAL_SCROLL'; payload: { scrollTop: number; containerHeight: number } }
  | { type: 'DESTROY' }

/**
 * 状态变更函数类型
 */
export type TreeStateReducer = (state: TreeState, action: TreeStateAction) => TreeState

/**
 * 状态管理器接口
 */
export interface TreeStateManager {
  /** 获取当前状态 */
  getState(): TreeState
  /** 分发动作 */
  dispatch(action: TreeStateAction): void
  /** 订阅状态变更 */
  subscribe(listener: (state: TreeState, action: TreeStateAction) => void): () => void
  /** 获取节点 */
  getNode(id: TreeNodeId): TreeNode | undefined
  /** 获取选中的节点 */
  getSelectedNodes(): TreeNode[]
  /** 获取展开的节点 */
  getExpandedNodes(): TreeNode[]
  /** 获取可见的节点 */
  getVisibleNodes(): TreeNode[]
  /** 获取匹配搜索的节点 */
  getMatchedNodes(): TreeNode[]
  /** 销毁状态管理器 */
  destroy(): void
}

/**
 * 状态持久化接口
 */
export interface TreeStatePersistence {
  /** 保存状态 */
  save(key: string, state: Partial<TreeState>): Promise<void>
  /** 加载状态 */
  load(key: string): Promise<Partial<TreeState> | null>
  /** 删除状态 */
  remove(key: string): Promise<void>
  /** 清空所有状态 */
  clear(): Promise<void>
}

/**
 * 状态同步接口
 */
export interface TreeStateSync {
  /** 同步状态到远程 */
  sync(state: TreeState): Promise<void>
  /** 从远程加载状态 */
  load(): Promise<Partial<TreeState>>
  /** 监听远程状态变更 */
  watch(callback: (state: Partial<TreeState>) => void): () => void
}
