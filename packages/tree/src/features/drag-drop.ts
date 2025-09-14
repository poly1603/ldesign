/**
 * 树形组件拖拽功能模块
 * 
 * 提供节点拖拽排序和层级调整功能
 */

import type { TreeNode, TreeNodeId } from '../types/tree-node'
import type { TreeOptions } from '../types/tree-options'
import { DragMode } from '../types/tree-node'

/**
 * 拖拽位置枚举
 */
export enum DropPosition {
  BEFORE = 'before',
  AFTER = 'after',
  INSIDE = 'inside',
}

/**
 * 拖拽状态接口
 */
export interface DragState {
  isDragging: boolean
  dragNode: TreeNode | null
  dragOverNode: TreeNode | null
  dropPosition: DropPosition | null
  allowDrop: boolean
}

/**
 * 拖拽事件数据接口
 */
export interface DragEventData {
  dragNode: TreeNode
  targetNode: TreeNode | null
  position: DropPosition
  originalEvent: DragEvent
}

/**
 * 拖拽管理器类
 */
export class DragDropManager {
  private options: TreeOptions
  private nodeMap: Map<TreeNodeId, TreeNode> = new Map()
  private dragState: DragState = {
    isDragging: false,
    dragNode: null,
    dragOverNode: null,
    dropPosition: null,
    allowDrop: false,
  }

  // 拖拽相关的回调函数
  private onDragStart?: (data: DragEventData) => boolean
  private onDragOver?: (data: DragEventData) => boolean
  private onDrop?: (data: DragEventData) => boolean
  private onDragEnd?: (data: DragEventData) => void

  constructor(options: TreeOptions) {
    this.options = options
  }

  /**
   * 更新节点映射
   */
  updateNodeMap(nodeMap: Map<TreeNodeId, TreeNode>): void {
    this.nodeMap = nodeMap
  }

  /**
   * 设置拖拽事件回调
   */
  setCallbacks(callbacks: {
    onDragStart?: (data: DragEventData) => boolean
    onDragOver?: (data: DragEventData) => boolean
    onDrop?: (data: DragEventData) => boolean
    onDragEnd?: (data: DragEventData) => void
  }): void {
    this.onDragStart = callbacks.onDragStart
    this.onDragOver = callbacks.onDragOver
    this.onDrop = callbacks.onDrop
    this.onDragEnd = callbacks.onDragEnd
  }

  /**
   * 获取当前拖拽状态
   */
  getDragState(): DragState {
    return { ...this.dragState }
  }

  /**
   * 处理拖拽开始事件
   */
  handleDragStart(event: DragEvent, nodeId: TreeNodeId): boolean {
    const node = this.nodeMap.get(nodeId)
    if (!node || !node.draggable || !this.options.drag?.enabled) {
      event.preventDefault()
      return false
    }

    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', nodeId.toString())
      event.dataTransfer.setData('application/x-tree-node-id', nodeId.toString())
    }

    // 更新拖拽状态
    this.dragState = {
      isDragging: true,
      dragNode: node,
      dragOverNode: null,
      dropPosition: null,
      allowDrop: false,
    }

    // 设置节点拖拽状态
    node.dragging = true

    // 触发拖拽开始回调
    const eventData: DragEventData = {
      dragNode: node,
      targetNode: null,
      position: DropPosition.INSIDE,
      originalEvent: event,
    }

    const allowDrag = this.onDragStart ? this.onDragStart(eventData) : true
    if (!allowDrag) {
      this.resetDragState()
      event.preventDefault()
      return false
    }

    return true
  }

  /**
   * 处理拖拽悬停事件
   */
  handleDragOver(event: DragEvent, nodeId: TreeNodeId): boolean {
    if (!this.dragState.isDragging || !this.dragState.dragNode) {
      return false
    }

    event.preventDefault()

    const targetNode = this.nodeMap.get(nodeId)
    if (!targetNode) {
      return false
    }

    // 不能拖拽到自己或自己的子节点
    if (this.isDescendantOf(targetNode, this.dragState.dragNode)) {
      this.updateDropIndicator(targetNode, null, false)
      return false
    }

    // 计算拖拽位置
    const dropPosition = this.calculateDropPosition(event, targetNode)
    
    // 检查是否允许放置
    const allowDrop = this.checkDropAllowed(this.dragState.dragNode, targetNode, dropPosition)

    // 更新拖拽状态
    this.dragState.dragOverNode = targetNode
    this.dragState.dropPosition = dropPosition
    this.dragState.allowDrop = allowDrop

    // 更新拖拽指示器
    this.updateDropIndicator(targetNode, dropPosition, allowDrop)

    // 触发拖拽悬停回调
    const eventData: DragEventData = {
      dragNode: this.dragState.dragNode,
      targetNode,
      position: dropPosition,
      originalEvent: event,
    }

    if (this.onDragOver) {
      return this.onDragOver(eventData)
    }

    return allowDrop
  }

  /**
   * 处理拖拽进入事件
   */
  handleDragEnter(event: DragEvent, nodeId: TreeNodeId): void {
    if (!this.dragState.isDragging) {
      return
    }

    event.preventDefault()
  }

  /**
   * 处理拖拽离开事件
   */
  handleDragLeave(event: DragEvent, nodeId: TreeNodeId): void {
    if (!this.dragState.isDragging) {
      return
    }

    // 检查是否真的离开了节点区域
    const targetElement = event.currentTarget as HTMLElement
    const relatedTarget = event.relatedTarget as HTMLElement

    if (targetElement && relatedTarget && targetElement.contains(relatedTarget)) {
      return
    }

    // 清除拖拽指示器
    const targetNode = this.nodeMap.get(nodeId)
    if (targetNode) {
      this.clearDropIndicator(targetNode)
    }
  }

  /**
   * 处理拖拽放置事件
   */
  handleDrop(event: DragEvent, nodeId: TreeNodeId): boolean {
    if (!this.dragState.isDragging || !this.dragState.dragNode || !this.dragState.allowDrop) {
      event.preventDefault()
      return false
    }

    event.preventDefault()

    const targetNode = this.nodeMap.get(nodeId)
    if (!targetNode || !this.dragState.dropPosition) {
      return false
    }

    // 触发拖拽放置回调
    const eventData: DragEventData = {
      dragNode: this.dragState.dragNode,
      targetNode,
      position: this.dragState.dropPosition,
      originalEvent: event,
    }

    const allowDrop = this.onDrop ? this.onDrop(eventData) : true
    if (!allowDrop) {
      return false
    }

    // 执行节点移动
    this.moveNode(this.dragState.dragNode, targetNode, this.dragState.dropPosition)

    return true
  }

  /**
   * 处理拖拽结束事件
   */
  handleDragEnd(event: DragEvent, nodeId: TreeNodeId): void {
    if (!this.dragState.isDragging || !this.dragState.dragNode) {
      return
    }

    // 触发拖拽结束回调
    const eventData: DragEventData = {
      dragNode: this.dragState.dragNode,
      targetNode: this.dragState.dragOverNode,
      position: this.dragState.dropPosition || DropPosition.INSIDE,
      originalEvent: event,
    }

    if (this.onDragEnd) {
      this.onDragEnd(eventData)
    }

    // 重置拖拽状态
    this.resetDragState()
  }

  /**
   * 计算拖拽位置
   */
  private calculateDropPosition(event: DragEvent, targetNode: TreeNode): DropPosition {
    const element = event.currentTarget as HTMLElement
    if (!element) {
      return DropPosition.INSIDE
    }

    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    const height = rect.height

    const threshold = height * 0.25 // 25% 的区域用于判断前后位置

    if (y < threshold) {
      return DropPosition.BEFORE
    } else if (y > height - threshold) {
      return DropPosition.AFTER
    } else {
      return DropPosition.INSIDE
    }
  }

  /**
   * 检查是否允许放置
   */
  private checkDropAllowed(dragNode: TreeNode, targetNode: TreeNode, position: DropPosition): boolean {
    if (!this.options.drag?.enabled) {
      return false
    }

    // 检查目标节点是否允许放置
    if (!targetNode.droppable) {
      return false
    }

    // 检查拖拽模式
    const dragMode = this.options.drag.mode
    switch (dragMode) {
      case DragMode.SORT:
        // 排序模式：只允许同级移动
        return position !== DropPosition.INSIDE && dragNode.parent === targetNode.parent

      case DragMode.FULL:
        // 完全拖拽模式：允许跨级移动
        return true

      case DragMode.DISABLED:
      default:
        return false
    }
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
   * 更新拖拽指示器
   */
  private updateDropIndicator(targetNode: TreeNode, position: DropPosition | null, allowDrop: boolean): void {
    // 清除所有节点的拖拽指示器
    this.nodeMap.forEach(node => {
      node.dropTarget = false
    })

    if (position && allowDrop) {
      targetNode.dropTarget = true
      // 可以在这里设置具体的拖拽位置样式类
    }
  }

  /**
   * 清除拖拽指示器
   */
  private clearDropIndicator(targetNode: TreeNode): void {
    targetNode.dropTarget = false
  }

  /**
   * 移动节点
   */
  private moveNode(dragNode: TreeNode, targetNode: TreeNode, position: DropPosition): void {
    // 从原位置移除
    if (dragNode.parent) {
      const index = dragNode.parent.children.indexOf(dragNode)
      if (index > -1) {
        dragNode.parent.children.splice(index, 1)
      }
    }

    // 移动到新位置
    switch (position) {
      case DropPosition.BEFORE:
        if (targetNode.parent) {
          const index = targetNode.parent.children.indexOf(targetNode)
          targetNode.parent.children.splice(index, 0, dragNode)
          dragNode.parent = targetNode.parent
        }
        break

      case DropPosition.AFTER:
        if (targetNode.parent) {
          const index = targetNode.parent.children.indexOf(targetNode)
          targetNode.parent.children.splice(index + 1, 0, dragNode)
          dragNode.parent = targetNode.parent
        }
        break

      case DropPosition.INSIDE:
        targetNode.children.push(dragNode)
        dragNode.parent = targetNode
        break
    }

    // 更新节点层级
    this.updateNodeLevel(dragNode)
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
   * 重置拖拽状态
   */
  private resetDragState(): void {
    // 清除节点拖拽状态
    if (this.dragState.dragNode) {
      this.dragState.dragNode.dragging = false
    }

    // 清除所有拖拽指示器
    this.nodeMap.forEach(node => {
      node.dropTarget = false
    })

    // 重置拖拽状态
    this.dragState = {
      isDragging: false,
      dragNode: null,
      dragOverNode: null,
      dropPosition: null,
      allowDrop: false,
    }
  }

  /**
   * 检查是否正在拖拽
   */
  isDragging(): boolean {
    return this.dragState.isDragging
  }

  /**
   * 获取拖拽节点
   */
  getDragNode(): TreeNode | null {
    return this.dragState.dragNode
  }

  /**
   * 强制结束拖拽
   */
  cancelDrag(): void {
    this.resetDragState()
  }
}
