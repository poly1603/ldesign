/**
 * 树形组件节点操作功能模块
 * 
 * 提供节点的增删改操作，包括API设计和UI交互
 */

import type { TreeNode, TreeNodeId, TreeNodeData } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'
import { TreeNodeImpl } from '../core/tree-node'

/**
 * 操作类型枚举
 */
export enum OperationType {
  ADD = 'add',
  UPDATE = 'update',
  REMOVE = 'remove',
  MOVE = 'move',
  COPY = 'copy',
  CUT = 'cut',
  PASTE = 'paste',
}

/**
 * 操作结果接口
 */
export interface OperationResult {
  success: boolean
  message?: string
  data?: any
}

/**
 * 操作历史记录接口
 */
export interface OperationHistory {
  id: string
  type: OperationType
  timestamp: number
  nodeId: TreeNodeId
  oldData?: any
  newData?: any
  parentId?: TreeNodeId
  index?: number
}

/**
 * 剪贴板数据接口
 */
export interface ClipboardData {
  operation: 'cut' | 'copy'
  nodes: TreeNode[]
  timestamp: number
}

/**
 * 节点操作管理器类
 */
export class NodeOperationsManager {
  private options: TreeOptions
  private nodeMap: Map<TreeNodeId, TreeNode> = new Map()
  private rootNodes: TreeNode[] = []
  private operationHistory: OperationHistory[] = []
  private clipboard: ClipboardData | null = null
  private maxHistorySize: number = 50

  // 操作回调函数
  private onBeforeOperation?: (type: OperationType, data: any) => boolean
  private onAfterOperation?: (type: OperationType, result: OperationResult) => void

  constructor(options: TreeOptions) {
    this.options = options
    this.maxHistorySize = options.operations?.maxHistorySize || 50
  }

  /**
   * 更新节点映射和根节点
   */
  updateData(nodeMap: Map<TreeNodeId, TreeNode>, rootNodes: TreeNode[]): void {
    this.nodeMap = nodeMap
    this.rootNodes = rootNodes
  }

  /**
   * 设置操作回调
   */
  setCallbacks(callbacks: {
    onBeforeOperation?: (type: OperationType, data: any) => boolean
    onAfterOperation?: (type: OperationType, result: OperationResult) => void
  }): void {
    this.onBeforeOperation = callbacks.onBeforeOperation
    this.onAfterOperation = callbacks.onAfterOperation
  }

  /**
   * 添加节点
   */
  addNode(data: TreeNodeData, parentId?: TreeNodeId, index?: number): OperationResult {
    try {
      // 检查操作权限
      if (!this.checkPermission(OperationType.ADD, { data, parentId, index })) {
        return { success: false, message: '没有添加节点的权限' }
      }

      // 触发前置回调
      if (this.onBeforeOperation && !this.onBeforeOperation(OperationType.ADD, { data, parentId, index })) {
        return { success: false, message: '操作被前置回调阻止' }
      }

      // 检查父节点是否存在
      const parentNode = parentId ? this.nodeMap.get(parentId) : undefined
      if (parentId && !parentNode) {
        return { success: false, message: '父节点不存在' }
      }

      // 创建新节点
      const newNode = new TreeNodeImpl(data, parentNode, index)

      // 添加到父节点或根节点
      if (parentNode) {
        parentNode.addChild(data, index)
        // 获取实际添加的子节点
        const addedChild = index !== undefined ? parentNode.children[index] : parentNode.children[parentNode.children.length - 1]
        this.nodeMap.set(addedChild.id, addedChild)
      } else {
        if (index !== undefined && index >= 0 && index <= this.rootNodes.length) {
          this.rootNodes.splice(index, 0, newNode)
        } else {
          this.rootNodes.push(newNode)
        }
        this.nodeMap.set(newNode.id, newNode)
      }

      // 记录操作历史
      this.addToHistory({
        id: this.generateHistoryId(),
        type: OperationType.ADD,
        timestamp: Date.now(),
        nodeId: newNode.id,
        newData: data,
        parentId,
        index,
      })

      const result: OperationResult = {
        success: true,
        message: '节点添加成功',
        data: newNode,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.ADD, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `添加节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.ADD, result)
      }

      return result
    }
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: TreeNodeId, data: Partial<TreeNodeData>): OperationResult {
    try {
      const node = this.nodeMap.get(nodeId)
      if (!node) {
        return { success: false, message: '节点不存在' }
      }

      // 检查操作权限
      if (!this.checkPermission(OperationType.UPDATE, { nodeId, data })) {
        return { success: false, message: '没有更新节点的权限' }
      }

      // 触发前置回调
      if (this.onBeforeOperation && !this.onBeforeOperation(OperationType.UPDATE, { nodeId, data })) {
        return { success: false, message: '操作被前置回调阻止' }
      }

      // 保存旧数据
      const oldData = {
        id: node.id,
        label: node.label,
        icon: node.icon,
        disabled: node.disabled,
        selectable: node.selectable,
        draggable: node.draggable,
        droppable: node.droppable,
        data: node.data,
        className: node.className,
        style: node.style,
      }

      // 更新节点数据
      if (data.label !== undefined) node.label = data.label
      if (data.icon !== undefined) node.icon = data.icon
      if (data.disabled !== undefined) node.disabled = data.disabled
      if (data.selectable !== undefined) node.selectable = data.selectable
      if (data.draggable !== undefined) node.draggable = data.draggable
      if (data.droppable !== undefined) node.droppable = data.droppable
      if (data.data !== undefined) node.data = data.data
      if (data.className !== undefined) node.className = data.className
      if (data.style !== undefined) node.style = data.style

      // 记录操作历史
      this.addToHistory({
        id: this.generateHistoryId(),
        type: OperationType.UPDATE,
        timestamp: Date.now(),
        nodeId,
        oldData,
        newData: data,
      })

      const result: OperationResult = {
        success: true,
        message: '节点更新成功',
        data: node,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.UPDATE, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `更新节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.UPDATE, result)
      }

      return result
    }
  }

  /**
   * 删除节点
   */
  removeNode(nodeId: TreeNodeId): OperationResult {
    try {
      const node = this.nodeMap.get(nodeId)
      if (!node) {
        return { success: false, message: '节点不存在' }
      }

      // 检查操作权限
      if (!this.checkPermission(OperationType.REMOVE, { nodeId })) {
        return { success: false, message: '没有删除节点的权限' }
      }

      // 触发前置回调
      if (this.onBeforeOperation && !this.onBeforeOperation(OperationType.REMOVE, { nodeId })) {
        return { success: false, message: '操作被前置回调阻止' }
      }

      // 保存节点数据用于历史记录
      const nodeData = this.serializeNode(node)
      const parentId = node.parent?.id
      const index = node.parent ? node.parent.children.indexOf(node) : this.rootNodes.indexOf(node)

      // 从父节点或根节点中移除
      if (node.parent) {
        const parentIndex = node.parent.children.indexOf(node)
        if (parentIndex > -1) {
          node.parent.children.splice(parentIndex, 1)
        }
      } else {
        const rootIndex = this.rootNodes.indexOf(node)
        if (rootIndex > -1) {
          this.rootNodes.splice(rootIndex, 1)
        }
      }

      // 递归删除节点及其子节点的映射
      this.removeNodeFromMap(node)

      // 记录操作历史
      this.addToHistory({
        id: this.generateHistoryId(),
        type: OperationType.REMOVE,
        timestamp: Date.now(),
        nodeId,
        oldData: nodeData,
        parentId,
        index,
      })

      const result: OperationResult = {
        success: true,
        message: '节点删除成功',
        data: nodeData,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.REMOVE, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `删除节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.REMOVE, result)
      }

      return result
    }
  }

  /**
   * 移动节点
   */
  moveNode(nodeId: TreeNodeId, targetParentId?: TreeNodeId, index?: number): OperationResult {
    try {
      const node = this.nodeMap.get(nodeId)
      if (!node) {
        return { success: false, message: '节点不存在' }
      }

      const targetParent = targetParentId ? this.nodeMap.get(targetParentId) : undefined
      if (targetParentId && !targetParent) {
        return { success: false, message: '目标父节点不存在' }
      }

      // 检查是否移动到自己的子节点
      if (targetParent && this.isDescendantOf(targetParent, node)) {
        return { success: false, message: '不能移动到自己的子节点' }
      }

      // 检查操作权限
      if (!this.checkPermission(OperationType.MOVE, { nodeId, targetParentId, index })) {
        return { success: false, message: '没有移动节点的权限' }
      }

      // 触发前置回调
      if (this.onBeforeOperation && !this.onBeforeOperation(OperationType.MOVE, { nodeId, targetParentId, index })) {
        return { success: false, message: '操作被前置回调阻止' }
      }

      // 保存原始位置信息
      const oldParentId = node.parent?.id
      const oldIndex = node.parent ? node.parent.children.indexOf(node) : this.rootNodes.indexOf(node)

      // 从原位置移除
      if (node.parent) {
        const parentIndex = node.parent.children.indexOf(node)
        if (parentIndex > -1) {
          node.parent.children.splice(parentIndex, 1)
        }
      } else {
        const rootIndex = this.rootNodes.indexOf(node)
        if (rootIndex > -1) {
          this.rootNodes.splice(rootIndex, 1)
        }
      }

      // 移动到新位置
      if (targetParent) {
        if (index !== undefined && index >= 0 && index <= targetParent.children.length) {
          targetParent.children.splice(index, 0, node)
        } else {
          targetParent.children.push(node)
        }
        node.parent = targetParent
      } else {
        if (index !== undefined && index >= 0 && index <= this.rootNodes.length) {
          this.rootNodes.splice(index, 0, node)
        } else {
          this.rootNodes.push(node)
        }
        node.parent = undefined
      }

      // 更新节点层级
      this.updateNodeLevel(node)

      // 记录操作历史
      this.addToHistory({
        id: this.generateHistoryId(),
        type: OperationType.MOVE,
        timestamp: Date.now(),
        nodeId,
        oldData: { parentId: oldParentId, index: oldIndex },
        newData: { parentId: targetParentId, index },
      })

      const result: OperationResult = {
        success: true,
        message: '节点移动成功',
        data: node,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.MOVE, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `移动节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.MOVE, result)
      }

      return result
    }
  }

  /**
   * 复制节点
   */
  copyNode(nodeId: TreeNodeId): OperationResult {
    try {
      const node = this.nodeMap.get(nodeId)
      if (!node) {
        return { success: false, message: '节点不存在' }
      }

      // 检查操作权限
      if (!this.checkPermission(OperationType.COPY, { nodeId })) {
        return { success: false, message: '没有复制节点的权限' }
      }

      // 序列化节点数据
      const nodeData = this.serializeNodeWithChildren(node)

      // 设置剪贴板
      this.clipboard = {
        operation: 'copy',
        nodes: [node],
        timestamp: Date.now(),
      }

      const result: OperationResult = {
        success: true,
        message: '节点复制成功',
        data: nodeData,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.COPY, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `复制节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.COPY, result)
      }

      return result
    }
  }

  /**
   * 剪切节点
   */
  cutNode(nodeId: TreeNodeId): OperationResult {
    try {
      const node = this.nodeMap.get(nodeId)
      if (!node) {
        return { success: false, message: '节点不存在' }
      }

      // 检查操作权限
      if (!this.checkPermission(OperationType.CUT, { nodeId })) {
        return { success: false, message: '没有剪切节点的权限' }
      }

      // 设置剪贴板
      this.clipboard = {
        operation: 'cut',
        nodes: [node],
        timestamp: Date.now(),
      }

      const result: OperationResult = {
        success: true,
        message: '节点剪切成功',
        data: node,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.CUT, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `剪切节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.CUT, result)
      }

      return result
    }
  }

  /**
   * 粘贴节点
   */
  pasteNode(targetParentId?: TreeNodeId, index?: number): OperationResult {
    try {
      if (!this.clipboard || this.clipboard.nodes.length === 0) {
        return { success: false, message: '剪贴板为空' }
      }

      const targetParent = targetParentId ? this.nodeMap.get(targetParentId) : undefined
      if (targetParentId && !targetParent) {
        return { success: false, message: '目标父节点不存在' }
      }

      // 检查操作权限
      if (!this.checkPermission(OperationType.PASTE, { targetParentId, index })) {
        return { success: false, message: '没有粘贴节点的权限' }
      }

      // 触发前置回调
      if (this.onBeforeOperation && !this.onBeforeOperation(OperationType.PASTE, { targetParentId, index })) {
        return { success: false, message: '操作被前置回调阻止' }
      }

      const pastedNodes: TreeNode[] = []

      for (const sourceNode of this.clipboard.nodes) {
        if (this.clipboard.operation === 'copy') {
          // 复制操作：创建新节点
          const nodeData = this.serializeNodeWithChildren(sourceNode)
          const newNodeData = this.generateUniqueIds(nodeData)
          const addResult = this.addNode(newNodeData, targetParentId, index)
          if (addResult.success && addResult.data) {
            pastedNodes.push(addResult.data)
          }
        } else {
          // 剪切操作：移动节点
          const moveResult = this.moveNode(sourceNode.id, targetParentId, index)
          if (moveResult.success && moveResult.data) {
            pastedNodes.push(moveResult.data)
          }
        }
      }

      // 如果是剪切操作，清空剪贴板
      if (this.clipboard.operation === 'cut') {
        this.clipboard = null
      }

      const result: OperationResult = {
        success: true,
        message: '节点粘贴成功',
        data: pastedNodes,
      }

      // 触发后置回调
      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.PASTE, result)
      }

      return result
    } catch (error) {
      const result: OperationResult = {
        success: false,
        message: `粘贴节点失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }

      if (this.onAfterOperation) {
        this.onAfterOperation(OperationType.PASTE, result)
      }

      return result
    }
  }

  /**
   * 获取剪贴板状态
   */
  getClipboardStatus(): { hasData: boolean; operation?: 'cut' | 'copy'; nodeCount: number } {
    if (!this.clipboard) {
      return { hasData: false, nodeCount: 0 }
    }

    return {
      hasData: true,
      operation: this.clipboard.operation,
      nodeCount: this.clipboard.nodes.length,
    }
  }

  /**
   * 清空剪贴板
   */
  clearClipboard(): void {
    this.clipboard = null
  }

  /**
   * 获取操作历史
   */
  getOperationHistory(): OperationHistory[] {
    return [...this.operationHistory]
  }

  /**
   * 清空操作历史
   */
  clearOperationHistory(): void {
    this.operationHistory = []
  }

  // 辅助方法

  /**
   * 检查操作权限
   */
  private checkPermission(type: OperationType, data: any): boolean {
    // 这里可以根据配置和用户权限进行检查
    // 目前简单返回true，实际使用时可以扩展
    return true
  }

  /**
   * 检查节点是否是另一个节点的后代
   */
  private isDescendantOf(node: TreeNode, ancestor: TreeNode): boolean {
    if (node === ancestor) {
      return true
    }

    let parent = node.parent
    while (parent) {
      if (parent === ancestor) {
        return true
      }
      parent = parent.parent
    }

    return false
  }

  /**
   * 更新节点层级
   */
  private updateNodeLevel(node: TreeNode): void {
    const newLevel = node.parent ? node.parent.level + 1 : 0
    node.level = newLevel

    // 递归更新子节点层级
    for (const child of node.children) {
      this.updateNodeLevel(child)
    }
  }

  /**
   * 序列化节点数据
   */
  private serializeNode(node: TreeNode): TreeNodeData {
    return {
      id: node.id,
      label: node.label,
      icon: node.icon,
      disabled: node.disabled,
      selectable: node.selectable,
      draggable: node.draggable,
      droppable: node.droppable,
      data: node.data,
      hasChildren: node.hasChildren,
      className: node.className,
      style: node.style,
    }
  }

  /**
   * 序列化节点及其子节点数据
   */
  private serializeNodeWithChildren(node: TreeNode): TreeNodeData {
    const nodeData = this.serializeNode(node)

    if (node.children.length > 0) {
      nodeData.children = node.children.map(child => this.serializeNodeWithChildren(child))
    }

    return nodeData
  }

  /**
   * 为节点数据生成唯一ID
   */
  private generateUniqueIds(nodeData: TreeNodeData): TreeNodeData {
    const newNodeData = { ...nodeData }
    newNodeData.id = this.generateUniqueId()

    if (newNodeData.children) {
      newNodeData.children = newNodeData.children.map(child => this.generateUniqueIds(child))
    }

    return newNodeData
  }

  /**
   * 生成唯一ID
   */
  private generateUniqueId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 递归删除节点映射
   */
  private removeNodeFromMap(node: TreeNode): void {
    this.nodeMap.delete(node.id)

    for (const child of node.children) {
      this.removeNodeFromMap(child)
    }
  }

  /**
   * 添加到操作历史
   */
  private addToHistory(operation: OperationHistory): void {
    this.operationHistory.push(operation)

    // 限制历史记录数量
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift()
    }
  }

  /**
   * 生成历史记录ID
   */
  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
