/**
 * 拖拽优化管理器
 * 解决拖拽过程中的冲突和性能问题
 */

import { UpdateScheduler, UpdatePriority } from './UpdateScheduler'
import { debounce, throttle } from '../performance/InteractionOptimizer'
import type { Point } from '../types'

export interface DragState {
  isDragging: boolean
  draggedNodes: Map<string, {
    startPosition: Point
    currentPosition: Point
    tempPosition: Point
  }>
  dragStartTime: number
  dragThreshold: number
}

export interface DragOptimizationConfig {
  /** 拖拽阈值，小于此距离不认为是拖拽 */
  dragThreshold: number
  /** 拖拽更新节流间隔 */
  updateThrottleInterval: number
  /** 拖拽结束防抖延迟 */
  endDebounceDelay: number
  /** 是否启用中间位置更新 */
  enableIntermediateUpdates: boolean
  /** 中间更新频率 */
  intermediateUpdateInterval: number
}

/**
 * 拖拽优化管理器
 * 管理拖拽过程中的状态和性能优化
 */
export class DragOptimizationManager {
  private config: DragOptimizationConfig
  private updateScheduler: UpdateScheduler
  private dragState: DragState
  private onNodePositionUpdate?: (nodeId: string, position: Point) => void
  private onDragStateChange?: (isDragging: boolean) => void

  // 节流和防抖函数
  private throttledUpdate: (...args: any[]) => void
  private debouncedEnd: (...args: any[]) => void

  constructor(
    config: Partial<DragOptimizationConfig> = {},
    updateScheduler?: UpdateScheduler
  ) {
    this.config = {
      dragThreshold: 3,
      updateThrottleInterval: 16, // 60fps
      endDebounceDelay: 50,
      enableIntermediateUpdates: false,
      intermediateUpdateInterval: 100,
      ...config
    }

    this.updateScheduler = updateScheduler || new UpdateScheduler()
    
    this.dragState = {
      isDragging: false,
      draggedNodes: new Map(),
      dragStartTime: 0,
      dragThreshold: this.config.dragThreshold
    }

    // 创建节流和防抖函数
    this.throttledUpdate = throttle(
      this.performIntermediateUpdate.bind(this),
      this.config.updateThrottleInterval
    )

    this.debouncedEnd = debounce(
      this.performFinalUpdate.bind(this),
      this.config.endDebounceDelay
    )
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: {
    onNodePositionUpdate?: (nodeId: string, position: Point) => void
    onDragStateChange?: (isDragging: boolean) => void
  }): void {
    this.onNodePositionUpdate = callbacks.onNodePositionUpdate
    this.onDragStateChange = callbacks.onDragStateChange
  }

  /**
   * 开始拖拽
   */
  startDrag(nodeId: string, startPosition: Point): void {
    if (!this.dragState.isDragging) {
      this.dragState.isDragging = true
      this.dragState.dragStartTime = Date.now()
      this.onDragStateChange?.(true)
    }

    this.dragState.draggedNodes.set(nodeId, {
      startPosition: { ...startPosition },
      currentPosition: { ...startPosition },
      tempPosition: { ...startPosition }
    })
  }

  /**
   * 更新拖拽位置
   */
  updateDragPosition(nodeId: string, newPosition: Point): void {
    const nodeState = this.dragState.draggedNodes.get(nodeId)
    if (!nodeState) return

    // 检查是否超过拖拽阈值
    const distance = this.calculateDistance(nodeState.startPosition, newPosition)
    if (distance < this.dragState.dragThreshold) {
      return
    }

    // 更新临时位置
    nodeState.tempPosition = { ...newPosition }

    // 如果启用中间更新，使用节流更新
    if (this.config.enableIntermediateUpdates) {
      this.throttledUpdate(nodeId)
    }
  }

  /**
   * 结束拖拽
   */
  endDrag(nodeId?: string): void {
    if (nodeId) {
      // 结束单个节点拖拽
      const nodeState = this.dragState.draggedNodes.get(nodeId)
      if (nodeState) {
        this.scheduleFinalUpdate(nodeId, nodeState.tempPosition)
        this.dragState.draggedNodes.delete(nodeId)
      }
    } else {
      // 结束所有节点拖拽
      for (const [id, state] of this.dragState.draggedNodes.entries()) {
        this.scheduleFinalUpdate(id, state.tempPosition)
      }
      this.dragState.draggedNodes.clear()
    }

    // 如果没有拖拽中的节点，结束拖拽状态
    if (this.dragState.draggedNodes.size === 0) {
      this.dragState.isDragging = false
      this.onDragStateChange?.(false)
    }
  }

  /**
   * 取消拖拽
   * 将所有节点恢复到起始位置
   */
  cancelDrag(): void {
    for (const [nodeId, state] of this.dragState.draggedNodes.entries()) {
      this.scheduleFinalUpdate(nodeId, state.startPosition)
    }
    
    this.dragState.draggedNodes.clear()
    this.dragState.isDragging = false
    this.onDragStateChange?.(false)
  }

  /**
   * 获取拖拽状态
   */
  getDragState(): Readonly<DragState> {
    return { ...this.dragState }
  }

  /**
   * 是否正在拖拽
   */
  isDragging(): boolean {
    return this.dragState.isDragging
  }

  /**
   * 获取节点当前拖拽位置
   */
  getNodeDragPosition(nodeId: string): Point | null {
    const nodeState = this.dragState.draggedNodes.get(nodeId)
    return nodeState ? { ...nodeState.tempPosition } : null
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.cancelDrag()
    this.onNodePositionUpdate = undefined
    this.onDragStateChange = undefined
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 执行中间更新（节流）
   */
  private performIntermediateUpdate(nodeId: string): void {
    const nodeState = this.dragState.draggedNodes.get(nodeId)
    if (!nodeState) return

    // 更新当前位置为临时位置
    nodeState.currentPosition = { ...nodeState.tempPosition }
    
    // 调度中间更新，优先级较低
    this.updateScheduler.schedule(
      `drag-intermediate-${nodeId}`,
      () => {
        this.onNodePositionUpdate?.(nodeId, nodeState.currentPosition)
      },
      UpdatePriority.LOW
    )
  }

  /**
   * 安排最终更新
   */
  private scheduleFinalUpdate(nodeId: string, finalPosition: Point): void {
    // 使用防抖确保最终位置更新
    this.updateScheduler.schedule(
      `drag-final-${nodeId}`,
      () => {
        this.onNodePositionUpdate?.(nodeId, finalPosition)
      },
      UpdatePriority.HIGH
    )
  }

  /**
   * 执行最终更新（防抖）
   */
  private performFinalUpdate(): void {
    // 这个方法由防抖函数调用
  }
}

/**
 * 默认拖拽优化管理器实例
 */
export const defaultDragOptimizationManager = new DragOptimizationManager()
