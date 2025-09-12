/**
 * @file 拖拽控制器
 * @description 处理裁剪区域的拖拽移动操作
 */

import type { Point, CropArea } from '@/types'
import { EventHandler, PointerEventType, type PointerEventData } from './event-handler'
import { MathUtils } from '@/utils'

/**
 * 拖拽状态
 */
export enum DragState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
}

/**
 * 拖拽事件数据
 */
export interface DragEventData {
  /** 拖拽状态 */
  state: DragState
  /** 起始位置 */
  startPoint: Point
  /** 当前位置 */
  currentPoint: Point
  /** 偏移量 */
  delta: Point
  /** 累计偏移量 */
  totalDelta: Point
  /** 原始指针事件数据 */
  pointerData: PointerEventData
}

/**
 * 拖拽回调函数
 */
export type DragCallback = (data: DragEventData) => void

/**
 * 拖拽控制器配置
 */
export interface DragControllerOptions {
  /** 拖拽阈值（像素） */
  threshold: number
  /** 是否启用拖拽 */
  enabled: boolean
  /** 拖拽边界 */
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  /** 是否限制在边界内 */
  constrainToBounds: boolean
}

/**
 * 拖拽控制器类
 * 处理裁剪区域的拖拽移动
 */
export class DragController {
  /** 事件处理器 */
  private eventHandler: EventHandler

  /** 配置选项 */
  private options: DragControllerOptions

  /** 当前拖拽状态 */
  private state = DragState.IDLE

  /** 拖拽起始点 */
  private startPoint: Point = { x: 0, y: 0 }

  /** 拖拽起始时的裁剪区域 */
  private startCropArea: CropArea | null = null

  /** 累计偏移量 */
  private totalDelta: Point = { x: 0, y: 0 }

  /** 拖拽开始回调 */
  private onDragStart?: DragCallback

  /** 拖拽中回调 */
  private onDragMove?: DragCallback

  /** 拖拽结束回调 */
  private onDragEnd?: DragCallback

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: DragControllerOptions = {
    threshold: 3,
    enabled: true,
    constrainToBounds: true,
  }

  /**
   * 构造函数
   * @param element 目标元素
   * @param options 配置选项
   */
  constructor(element: HTMLElement, options: Partial<DragControllerOptions> = {}) {
    this.options = { ...DragController.DEFAULT_OPTIONS, ...options }
    this.eventHandler = new EventHandler(element, {
      enableMouse: true,
      enableTouch: true,
      preventDefault: true,
    })

    this.setupEventListeners()
  }

  /**
   * 设置拖拽开始回调
   * @param callback 回调函数
   */
  setOnDragStart(callback: DragCallback): void {
    this.onDragStart = callback
  }

  /**
   * 设置拖拽移动回调
   * @param callback 回调函数
   */
  setOnDragMove(callback: DragCallback): void {
    this.onDragMove = callback
  }

  /**
   * 设置拖拽结束回调
   * @param callback 回调函数
   */
  setOnDragEnd(callback: DragCallback): void {
    this.onDragEnd = callback
  }

  /**
   * 启用拖拽
   */
  enable(): void {
    this.options.enabled = true
  }

  /**
   * 禁用拖拽
   */
  disable(): void {
    this.options.enabled = false
    this.reset()
  }

  /**
   * 设置拖拽边界
   * @param bounds 边界矩形
   */
  setBounds(bounds: DragControllerOptions['bounds']): void {
    this.options.bounds = bounds
  }

  /**
   * 设置拖拽阈值
   * @param threshold 阈值（像素）
   */
  setThreshold(threshold: number): void {
    this.options.threshold = Math.max(0, threshold)
  }

  /**
   * 获取当前拖拽状态
   */
  getState(): DragState {
    return this.state
  }

  /**
   * 是否正在拖拽
   */
  isDragging(): boolean {
    return this.state === DragState.DRAGGING
  }

  /**
   * 重置拖拽状态
   */
  reset(): void {
    this.state = DragState.IDLE
    this.startPoint = { x: 0, y: 0 }
    this.startCropArea = null
    this.totalDelta = { x: 0, y: 0 }
  }

  /**
   * 更新配置
   * @param options 新配置
   */
  updateOptions(options: Partial<DragControllerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 销毁拖拽控制器
   */
  destroy(): void {
    this.eventHandler.destroy()
    this.reset()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.eventHandler.on(PointerEventType.START, this.handlePointerStart)
    this.eventHandler.on(PointerEventType.MOVE, this.handlePointerMove)
    this.eventHandler.on(PointerEventType.END, this.handlePointerEnd)
    this.eventHandler.on(PointerEventType.CANCEL, this.handlePointerCancel)
  }

  /**
   * 处理指针开始事件
   */
  private handlePointerStart = (data: PointerEventData): void => {
    if (!this.options.enabled || !data.isPrimary) return

    this.startPoint = { ...data.point }
    this.totalDelta = { x: 0, y: 0 }
    this.state = DragState.IDLE
  }

  /**
   * 处理指针移动事件
   */
  private handlePointerMove = (data: PointerEventData): void => {
    if (!this.options.enabled || !data.isPrimary) return

    const delta = {
      x: data.point.x - this.startPoint.x,
      y: data.point.y - this.startPoint.y,
    }

    // 检查是否超过拖拽阈值
    if (this.state === DragState.IDLE) {
      const distance = MathUtils.distance(this.startPoint, data.point)
      if (distance >= this.options.threshold) {
        this.state = DragState.DRAGGING
        this.handleDragStart(data, delta)
      }
      return
    }

    // 处理拖拽移动
    if (this.state === DragState.DRAGGING) {
      this.handleDragMove(data, delta)
    }
  }

  /**
   * 处理指针结束事件
   */
  private handlePointerEnd = (data: PointerEventData): void => {
    if (!this.options.enabled || !data.isPrimary) return

    if (this.state === DragState.DRAGGING) {
      const delta = {
        x: data.point.x - this.startPoint.x,
        y: data.point.y - this.startPoint.y,
      }
      this.handleDragEnd(data, delta)
    }

    this.reset()
  }

  /**
   * 处理指针取消事件
   */
  private handlePointerCancel = (data: PointerEventData): void => {
    if (!this.options.enabled || !data.isPrimary) return

    if (this.state === DragState.DRAGGING) {
      this.handleDragEnd(data, { x: 0, y: 0 })
    }

    this.reset()
  }

  /**
   * 处理拖拽开始
   */
  private handleDragStart(data: PointerEventData, delta: Point): void {
    this.totalDelta = { ...delta }

    const dragData: DragEventData = {
      state: DragState.DRAGGING,
      startPoint: this.startPoint,
      currentPoint: data.point,
      delta,
      totalDelta: this.totalDelta,
      pointerData: data,
    }

    this.onDragStart?.(dragData)
  }

  /**
   * 处理拖拽移动
   */
  private handleDragMove(data: PointerEventData, delta: Point): void {
    // 应用边界约束
    const constrainedDelta = this.applyBoundsConstraint(delta)
    this.totalDelta = { ...constrainedDelta }

    const dragData: DragEventData = {
      state: DragState.DRAGGING,
      startPoint: this.startPoint,
      currentPoint: data.point,
      delta: constrainedDelta,
      totalDelta: this.totalDelta,
      pointerData: data,
    }

    this.onDragMove?.(dragData)
  }

  /**
   * 处理拖拽结束
   */
  private handleDragEnd(data: PointerEventData, delta: Point): void {
    const constrainedDelta = this.applyBoundsConstraint(delta)

    const dragData: DragEventData = {
      state: DragState.IDLE,
      startPoint: this.startPoint,
      currentPoint: data.point,
      delta: constrainedDelta,
      totalDelta: this.totalDelta,
      pointerData: data,
    }

    this.onDragEnd?.(dragData)
  }

  /**
   * 应用边界约束
   * @param delta 偏移量
   * @returns 约束后的偏移量
   */
  private applyBoundsConstraint(delta: Point): Point {
    if (!this.options.constrainToBounds || !this.options.bounds || !this.startCropArea) {
      return delta
    }

    const bounds = this.options.bounds
    const cropArea = this.startCropArea

    // 计算新位置
    const newX = cropArea.x + delta.x
    const newY = cropArea.y + delta.y

    // 应用边界限制
    const constrainedX = MathUtils.clamp(
      newX,
      bounds.x,
      bounds.x + bounds.width - cropArea.width,
    )
    const constrainedY = MathUtils.clamp(
      newY,
      bounds.y,
      bounds.y + bounds.height - cropArea.height,
    )

    return {
      x: constrainedX - cropArea.x,
      y: constrainedY - cropArea.y,
    }
  }

  /**
   * 设置起始裁剪区域（用于边界约束计算）
   * @param cropArea 裁剪区域
   */
  setStartCropArea(cropArea: CropArea): void {
    this.startCropArea = { ...cropArea }
  }
}
