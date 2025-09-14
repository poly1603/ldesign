/**
 * 树形组件状态管理器实现
 * 
 * 管理树形组件的全局状态，提供状态变更和订阅功能
 */

import type {
  TreeState,
  TreeStateAction,
  TreeStateManager as ITreeStateManager,
  TreeStateReducer,
  DragState,
  VirtualScrollState
} from '../types/tree-state'
import type { TreeNode, TreeNodeId } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'
import { TreeNodeImpl } from './tree-node'

/**
 * 状态变更监听器类型
 */
type StateListener = (state: TreeState, action: TreeStateAction) => void

/**
 * 树形组件状态管理器实现类
 */
export class TreeStateManager implements ITreeStateManager {
  private state: TreeState
  private listeners: Set<StateListener> = new Set()

  constructor(options: TreeOptions = {}) {
    this.state = this.createInitialState(options)
  }

  /**
   * 创建初始状态
   */
  private createInitialState(options: TreeOptions): TreeState {
    return {
      nodeMap: new Map(),
      rootNodes: [],
      flatNodes: [],
      visibleNodes: [],
      selectedIds: new Set(options.selection?.defaultSelected || []),
      expandedIds: new Set(options.expansion?.defaultExpanded || []),
      searchKeyword: '',
      matchedIds: new Set(),
      loadingIds: new Set(),
      dragState: this.createInitialDragState(),
      virtualState: this.createInitialVirtualState(options),
      initialized: false,
      destroyed: false,
    }
  }

  /**
   * 创建初始拖拽状态
   */
  private createInitialDragState(): DragState {
    return {
      isDragging: false,
      dragNodeId: undefined,
      dropNodeId: undefined,
      dropPosition: undefined,
      startPosition: undefined,
      currentPosition: undefined,
      dragPreview: undefined,
    }
  }

  /**
   * 创建初始虚拟滚动状态
   */
  private createInitialVirtualState(options: TreeOptions): VirtualScrollState {
    return {
      enabled: options.virtual?.enabled ?? false,
      containerHeight: options.virtual?.height ?? 300,
      scrollTop: 0,
      startIndex: 0,
      endIndex: 0,
      itemHeights: new Map(),
      totalHeight: 0,
      offsetY: 0,
    }
  }

  /**
   * 获取当前状态
   */
  getState(): TreeState {
    return { ...this.state }
  }

  /**
   * 分发动作
   */
  dispatch(action: TreeStateAction): void {
    if (this.state.destroyed) {
      console.warn('Cannot dispatch action on destroyed state manager')
      return
    }

    const newState = this.reducer(this.state, action)

    if (newState !== this.state) {
      this.state = newState
      this.notifyListeners(action)
    }
  }

  /**
   * 状态归约器
   */
  private reducer: TreeStateReducer = (state, action) => {
    switch (action.type) {
      case 'INIT':
        return this.handleInit(state, action.payload)

      case 'SET_DATA':
        return this.handleSetData(state, action.payload)

      case 'ADD_NODE':
        return this.handleAddNode(state, action.payload)

      case 'REMOVE_NODE':
        return this.handleRemoveNode(state, action.payload)

      case 'UPDATE_NODE':
        return this.handleUpdateNode(state, action.payload)

      case 'MOVE_NODE':
        return this.handleMoveNode(state, action.payload)

      case 'SELECT_NODE':
        return this.handleSelectNode(state, action.payload)

      case 'EXPAND_NODE':
        return this.handleExpandNode(state, action.payload)

      case 'SEARCH':
        return this.handleSearch(state, action.payload)

      case 'CLEAR_SEARCH':
        return this.handleClearSearch(state)

      case 'START_LOADING':
        return this.handleStartLoading(state, action.payload)

      case 'FINISH_LOADING':
        return this.handleFinishLoading(state, action.payload)

      case 'START_DRAG':
        return this.handleStartDrag(state, action.payload)

      case 'UPDATE_DRAG':
        return this.handleUpdateDrag(state, action.payload)

      case 'END_DRAG':
        return this.handleEndDrag(state)

      case 'UPDATE_VIRTUAL_SCROLL':
        return this.handleUpdateVirtualScroll(state, action.payload)

      case 'DESTROY':
        return this.handleDestroy(state)

      default:
        return state
    }
  }

  /**
   * 处理初始化
   */
  private handleInit(state: TreeState, payload: { options: TreeOptions; data: TreeNode[] }): TreeState {
    const { data } = payload
    const nodeMap = new Map<TreeNodeId, TreeNode>()
    const flatNodes: TreeNode[] = []

    // 构建节点映射和扁平列表
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        nodeMap.set(node.id, node)
        flatNodes.push(node)
        if (node.children.length > 0) {
          traverse(node.children)
        }
      }
    }
    traverse(data)

    return {
      ...state,
      nodeMap,
      rootNodes: data,
      flatNodes,
      visibleNodes: this.calculateVisibleNodes(data, state.expandedIds, state.searchKeyword),
      initialized: true,
    }
  }

  /**
   * 处理设置数据
   */
  private handleSetData(state: TreeState, payload: { data: TreeNode[] }): TreeState {
    return this.handleInit(state, { options: {}, data: payload.data })
  }

  /**
   * 处理添加节点
   */
  private handleAddNode(state: TreeState, payload: { node: TreeNode; parent?: TreeNode; index?: number }): TreeState {
    const { node, parent, index } = payload
    const newNodeMap = new Map(state.nodeMap)
    const newRootNodes = [...state.rootNodes]

    newNodeMap.set(node.id, node)

    if (parent) {
      const nodeData = {
        id: node.id,
        label: node.label,
        icon: node.icon,
        disabled: node.disabled,
        selectable: node.selectable,
        draggable: node.draggable,
        droppable: node.droppable,
        data: node.data,
        hasChildren: node.hasChildren,
        loading: node.loading,
        error: node.error,
        className: node.className,
        style: node.style,
      }
      parent.addChild(nodeData, index)
    } else {
      if (index !== undefined && index >= 0 && index <= newRootNodes.length) {
        newRootNodes.splice(index, 0, node)
      } else {
        newRootNodes.push(node)
      }
    }

    const newFlatNodes = this.calculateFlatNodes(newRootNodes)
    const newVisibleNodes = this.calculateVisibleNodes(newRootNodes, state.expandedIds, state.searchKeyword)

    return {
      ...state,
      nodeMap: newNodeMap,
      rootNodes: newRootNodes,
      flatNodes: newFlatNodes,
      visibleNodes: newVisibleNodes,
    }
  }

  /**
   * 处理移除节点
   */
  private handleRemoveNode(state: TreeState, payload: { nodeId: TreeNodeId }): TreeState {
    const { nodeId } = payload
    const node = state.nodeMap.get(nodeId)
    if (!node) {
      return state
    }

    const newNodeMap = new Map(state.nodeMap)
    const newRootNodes = [...state.rootNodes]
    const newSelectedIds = new Set(state.selectedIds)
    const newExpandedIds = new Set(state.expandedIds)

    // 递归移除节点及其后代
    const removeNodeRecursive = (nodeToRemove: TreeNode) => {
      newNodeMap.delete(nodeToRemove.id)
      newSelectedIds.delete(nodeToRemove.id)
      newExpandedIds.delete(nodeToRemove.id)

      for (const child of nodeToRemove.children) {
        removeNodeRecursive(child)
      }
    }

    removeNodeRecursive(node)

    // 从父节点或根节点列表中移除
    if (node.parent) {
      node.parent.removeChild(node)
    } else {
      const index = newRootNodes.findIndex(n => n.id === nodeId)
      if (index !== -1) {
        newRootNodes.splice(index, 1)
      }
    }

    const newFlatNodes = this.calculateFlatNodes(newRootNodes)
    const newVisibleNodes = this.calculateVisibleNodes(newRootNodes, newExpandedIds, state.searchKeyword)

    return {
      ...state,
      nodeMap: newNodeMap,
      rootNodes: newRootNodes,
      flatNodes: newFlatNodes,
      visibleNodes: newVisibleNodes,
      selectedIds: newSelectedIds,
      expandedIds: newExpandedIds,
    }
  }

  /**
   * 处理更新节点
   */
  private handleUpdateNode(state: TreeState, payload: { nodeId: TreeNodeId; data: Partial<TreeNode> }): TreeState {
    const { nodeId, data } = payload
    const node = state.nodeMap.get(nodeId)
    if (!node) {
      return state
    }

    // 更新节点数据
    Object.assign(node, data)

    const newVisibleNodes = this.calculateVisibleNodes(state.rootNodes, state.expandedIds, state.searchKeyword)

    return {
      ...state,
      visibleNodes: newVisibleNodes,
    }
  }

  /**
   * 处理移动节点
   */
  private handleMoveNode(state: TreeState, payload: { nodeId: TreeNodeId; targetId?: TreeNodeId; position: 'before' | 'after' | 'inside' }): TreeState {
    const { nodeId, targetId, position } = payload
    const node = state.nodeMap.get(nodeId)
    const target = targetId ? state.nodeMap.get(targetId) : null

    if (!node || (targetId && !target)) {
      return state
    }

    // 执行移动操作
    if (position === 'inside' && target) {
      node.moveTo(target)
    } else if (position === 'before' && target) {
      node.moveTo(target.parent, target.index)
    } else if (position === 'after' && target) {
      node.moveTo(target.parent, target.index + 1)
    }

    const newFlatNodes = this.calculateFlatNodes(state.rootNodes)
    const newVisibleNodes = this.calculateVisibleNodes(state.rootNodes, state.expandedIds, state.searchKeyword)

    return {
      ...state,
      flatNodes: newFlatNodes,
      visibleNodes: newVisibleNodes,
    }
  }

  /**
   * 处理选择节点
   */
  private handleSelectNode(state: TreeState, payload: { nodeId: TreeNodeId; selected: boolean; cascade?: boolean }): TreeState {
    const { nodeId, selected, cascade } = payload
    const newSelectedIds = new Set(state.selectedIds)

    // 更新节点的选中状态
    const node = state.nodeMap.get(nodeId)
    if (node) {
      node.selected = selected
    }

    if (selected) {
      newSelectedIds.add(nodeId)
    } else {
      newSelectedIds.delete(nodeId)
    }

    // 如果启用级联选择，处理父子节点联动
    if (cascade) {
      if (node) {
        // 处理子节点
        const updateChildren = (parentNode: TreeNode, isSelected: boolean) => {
          for (const child of parentNode.children) {
            child.selected = isSelected
            if (isSelected) {
              newSelectedIds.add(child.id)
            } else {
              newSelectedIds.delete(child.id)
            }
            updateChildren(child, isSelected)
          }
        }
        updateChildren(node, selected)

        // 处理父节点
        let parent = node.parent
        while (parent) {
          const allChildrenSelected = parent.children.every(child => newSelectedIds.has(child.id))
          parent.selected = allChildrenSelected
          if (allChildrenSelected) {
            newSelectedIds.add(parent.id)
          } else {
            newSelectedIds.delete(parent.id)
          }
          parent = parent.parent
        }
      }
    }

    return {
      ...state,
      selectedIds: newSelectedIds,
    }
  }

  /**
   * 处理展开节点
   */
  private handleExpandNode(state: TreeState, payload: { nodeId: TreeNodeId; expanded: boolean }): TreeState {
    const { nodeId, expanded } = payload
    const newExpandedIds = new Set(state.expandedIds)

    // 更新节点的展开状态
    const node = state.nodeMap.get(nodeId)
    if (node) {
      node.expanded = expanded
    }

    if (expanded) {
      newExpandedIds.add(nodeId)
    } else {
      newExpandedIds.delete(nodeId)
    }

    const newVisibleNodes = this.calculateVisibleNodes(state.rootNodes, newExpandedIds, state.searchKeyword)

    return {
      ...state,
      expandedIds: newExpandedIds,
      visibleNodes: newVisibleNodes,
    }
  }

  /**
   * 处理搜索
   */
  private handleSearch(state: TreeState, payload: { keyword: string }): TreeState {
    const { keyword } = payload
    const matchedIds = new Set<TreeNodeId>()

    if (keyword.trim()) {
      for (const node of state.flatNodes) {
        if (node.label.toLowerCase().includes(keyword.toLowerCase())) {
          matchedIds.add(node.id)
          // 添加所有祖先节点到匹配列表
          for (const ancestorId of node.path.slice(0, -1)) {
            matchedIds.add(ancestorId)
          }
        }
      }
    } else {
      // 如果没有搜索关键词，所有节点都匹配
      for (const node of state.flatNodes) {
        matchedIds.add(node.id)
      }
    }

    const newVisibleNodes = this.calculateVisibleNodes(state.rootNodes, state.expandedIds, keyword)

    return {
      ...state,
      searchKeyword: keyword,
      matchedIds,
      visibleNodes: newVisibleNodes,
    }
  }

  /**
   * 处理清空搜索
   */
  private handleClearSearch(state: TreeState): TreeState {
    return this.handleSearch(state, { keyword: '' })
  }

  /**
   * 处理开始加载
   */
  private handleStartLoading(state: TreeState, payload: { nodeId: TreeNodeId }): TreeState {
    const { nodeId } = payload
    const newLoadingIds = new Set(state.loadingIds)
    newLoadingIds.add(nodeId)

    return {
      ...state,
      loadingIds: newLoadingIds,
    }
  }

  /**
   * 处理完成加载
   */
  private handleFinishLoading(state: TreeState, payload: { nodeId: TreeNodeId; children?: TreeNode[]; error?: Error }): TreeState {
    const { nodeId, children, error } = payload
    const newLoadingIds = new Set(state.loadingIds)
    newLoadingIds.delete(nodeId)

    const node = state.nodeMap.get(nodeId)
    if (node) {
      if (error) {
        node.error = error.message
        node.loading = false
      } else if (children) {
        // 添加子节点
        for (const child of children) {
          node.addChild(child)
        }
        node.loading = false
        node.error = undefined
      }
    }

    const newFlatNodes = this.calculateFlatNodes(state.rootNodes)
    const newVisibleNodes = this.calculateVisibleNodes(state.rootNodes, state.expandedIds, state.searchKeyword)

    return {
      ...state,
      loadingIds: newLoadingIds,
      flatNodes: newFlatNodes,
      visibleNodes: newVisibleNodes,
    }
  }

  /**
   * 处理开始拖拽
   */
  private handleStartDrag(state: TreeState, payload: { nodeId: TreeNodeId; position: { x: number; y: number } }): TreeState {
    const { nodeId, position } = payload

    return {
      ...state,
      dragState: {
        ...state.dragState,
        isDragging: true,
        dragNodeId: nodeId,
        startPosition: position,
        currentPosition: position,
      },
    }
  }

  /**
   * 处理更新拖拽
   */
  private handleUpdateDrag(state: TreeState, payload: { position: { x: number; y: number }; dropNodeId?: TreeNodeId; dropPosition?: 'before' | 'after' | 'inside' }): TreeState {
    const { position, dropNodeId, dropPosition } = payload

    return {
      ...state,
      dragState: {
        ...state.dragState,
        currentPosition: position,
        dropNodeId,
        dropPosition,
      },
    }
  }

  /**
   * 处理结束拖拽
   */
  private handleEndDrag(state: TreeState): TreeState {
    return {
      ...state,
      dragState: this.createInitialDragState(),
    }
  }

  /**
   * 处理更新虚拟滚动
   */
  private handleUpdateVirtualScroll(state: TreeState, payload: { scrollTop: number; containerHeight: number }): TreeState {
    const { scrollTop, containerHeight } = payload
    const { itemHeight = 32, buffer = 10 } = {}

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const endIndex = Math.min(
      state.visibleNodes.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
    )

    return {
      ...state,
      virtualState: {
        ...state.virtualState,
        scrollTop,
        containerHeight,
        startIndex,
        endIndex,
        totalHeight: state.visibleNodes.length * itemHeight,
        offsetY: startIndex * itemHeight,
      },
    }
  }

  /**
   * 处理销毁
   */
  private handleDestroy(state: TreeState): TreeState {
    return {
      ...state,
      destroyed: true,
    }
  }

  /**
   * 计算扁平节点列表
   */
  private calculateFlatNodes(rootNodes: TreeNode[]): TreeNode[] {
    const flatNodes: TreeNode[] = []

    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        flatNodes.push(node)
        if (node.children.length > 0) {
          traverse(node.children)
        }
      }
    }

    traverse(rootNodes)
    return flatNodes
  }

  /**
   * 计算可见节点列表
   */
  private calculateVisibleNodes(rootNodes: TreeNode[], expandedIds: Set<TreeNodeId>, searchKeyword: string): TreeNode[] {
    const visibleNodes: TreeNode[] = []

    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        // 检查节点是否匹配搜索条件
        const isMatched = !searchKeyword || node.label.toLowerCase().includes(searchKeyword.toLowerCase())

        if (isMatched || searchKeyword) {
          node.visible = true
          node.matched = isMatched
          visibleNodes.push(node)

          // 如果节点展开或有搜索关键词，继续遍历子节点
          if (expandedIds.has(node.id) || searchKeyword) {
            traverse(node.children)
          }
        } else {
          node.visible = false
          node.matched = false
        }
      }
    }

    traverse(rootNodes)
    return visibleNodes
  }

  /**
   * 订阅状态变更
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(action: TreeStateAction): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state, action)
      } catch (error) {
        console.error('Error in state listener:', error)
      }
    }
  }

  /**
   * 获取节点
   */
  getNode(id: TreeNodeId): TreeNode | undefined {
    return this.state.nodeMap.get(id)
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode[] {
    return Array.from(this.state.selectedIds)
      .map(id => this.state.nodeMap.get(id))
      .filter((node): node is TreeNode => node !== undefined)
  }

  /**
   * 获取展开的节点
   */
  getExpandedNodes(): TreeNode[] {
    return Array.from(this.state.expandedIds)
      .map(id => this.state.nodeMap.get(id))
      .filter((node): node is TreeNode => node !== undefined)
  }

  /**
   * 获取可见的节点
   */
  getVisibleNodes(): TreeNode[] {
    return this.state.visibleNodes
  }

  /**
   * 获取匹配搜索的节点
   */
  getMatchedNodes(): TreeNode[] {
    return Array.from(this.state.matchedIds)
      .map(id => this.state.nodeMap.get(id))
      .filter((node): node is TreeNode => node !== undefined)
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.dispatch({ type: 'DESTROY' })
    this.listeners.clear()
  }
}
