/**
 * @file 交互控制器
 * @description 处理裁剪器的鼠标、触摸等交互事件
 */

import type { CropArea, Point, Size } from '@/types'
import { CropShape } from '@/types'
import { MathUtils } from '@/utils'

/**
 * 交互模式枚举
 */
export enum InteractionMode {
  /** 无操作 */
  NONE = 'none',
  /** 移动裁剪区域 */
  MOVE = 'move',
  /** 移动背景图片 */
  MOVE_IMAGE = 'move-image',
  /** 调整大小 - 左上角 */
  RESIZE_NW = 'resize-nw',
  /** 调整大小 - 上边 */
  RESIZE_N = 'resize-n',
  /** 调整大小 - 右上角 */
  RESIZE_NE = 'resize-ne',
  /** 调整大小 - 右边 */
  RESIZE_E = 'resize-e',
  /** 调整大小 - 右下角 */
  RESIZE_SE = 'resize-se',
  /** 调整大小 - 下边 */
  RESIZE_S = 'resize-s',
  /** 调整大小 - 左下角 */
  RESIZE_SW = 'resize-sw',
  /** 调整大小 - 左边 */
  RESIZE_W = 'resize-w',
}

/**
 * 交互事件回调
 */
export interface InteractionCallbacks {
  /** 裁剪区域变化回调 */
  onCropAreaChange?: (cropArea: CropArea) => void
  /** 背景图片移动回调 */
  onImageMove?: (deltaX: number, deltaY: number) => void
  /** 交互开始回调 */
  onInteractionStart?: (mode: InteractionMode) => void
  /** 交互结束回调 */
  onInteractionEnd?: (mode: InteractionMode) => void
  /** 缩放回调 */
  onZoom?: (scale: number, center: Point) => void
}

/**
 * 交互控制器类
 * 处理裁剪器的所有交互逻辑
 */
export class InteractionController {
  /** Canvas 元素 */
  private canvas: HTMLCanvasElement

  /** 当前裁剪区域 */
  private cropArea: CropArea

  /** 交互回调 */
  private callbacks: InteractionCallbacks

  /** 当前交互模式 */
  private currentMode: InteractionMode = InteractionMode.NONE

  /** 是否正在交互 */
  private isInteracting = false

  /** 交互开始时的鼠标位置 */
  private startPoint: Point = { x: 0, y: 0 }

  /** 交互开始时的裁剪区域 */
  private startCropArea: CropArea

  /** 上一次的鼠标位置（用于计算增量） */
  private lastPoint: Point = { x: 0, y: 0 }

  /** 控制点大小 */
  private readonly CONTROL_POINT_SIZE = 8

  /** 控制点检测范围 */
  private readonly CONTROL_POINT_TOLERANCE = 12

  /**
   * 构造函数
   * @param canvas Canvas元素
   * @param initialCropArea 初始裁剪区域
   * @param callbacks 交互回调
   */
  constructor(
    canvas: HTMLCanvasElement,
    initialCropArea: CropArea,
    callbacks: InteractionCallbacks = {}
  ) {
    this.canvas = canvas
    this.cropArea = { ...initialCropArea }
    this.callbacks = callbacks
    this.startCropArea = { ...initialCropArea }

    this.setupEventListeners()
  }

  /**
   * 更新裁剪区域
   * @param cropArea 新的裁剪区域
   */
  updateCropArea(cropArea: CropArea): void {
    this.cropArea = { ...cropArea }
  }

  /**
   * 获取当前裁剪区域
   * @returns 裁剪区域
   */
  getCropArea(): CropArea {
    return { ...this.cropArea }
  }

  /**
   * 设置交互回调
   * @param callbacks 回调函数
   */
  setCallbacks(callbacks: InteractionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.removeEventListeners()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseup', this.handleMouseUp)
    this.canvas.addEventListener('mouseleave', this.handleMouseUp)

    // 触摸事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart)
    this.canvas.addEventListener('touchmove', this.handleTouchMove)
    this.canvas.addEventListener('touchend', this.handleTouchEnd)

    // 滚轮事件
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false })
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mouseup', this.handleMouseUp)
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp)

    this.canvas.removeEventListener('touchstart', this.handleTouchStart)
    this.canvas.removeEventListener('touchmove', this.handleTouchMove)
    this.canvas.removeEventListener('touchend', this.handleTouchEnd)
    this.canvas.removeEventListener('wheel', this.handleWheel)
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown = (event: MouseEvent): void => {
    event.preventDefault()
    const point = this.getEventPoint(event)
    this.startInteraction(point)
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove = (event: MouseEvent): void => {
    const point = this.getEventPoint(event)

    if (this.isInteracting) {
      this.updateInteraction(point)
    } else {
      // 更新光标样式
      const mode = this.getInteractionMode(point)
      this.updateCursor(mode)
    }
  }

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp = (): void => {
    this.endInteraction()
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault()
    if (event.touches.length === 1) {
      const point = this.getTouchPoint(event.touches[0])
      this.startInteraction(point)
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault()
    if (event.touches.length === 1 && this.isInteracting) {
      const point = this.getTouchPoint(event.touches[0])
      this.updateInteraction(point)
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    event.preventDefault()
    this.endInteraction()
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel = (event: WheelEvent): void => {
    event.preventDefault()

    const rect = this.canvas.getBoundingClientRect()
    const centerX = event.clientX - rect.left
    const centerY = event.clientY - rect.top

    // 计算缩放因子
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1

    // 触发缩放回调
    this.callbacks.onZoom?.(scaleFactor, { x: centerX, y: centerY })
  }

  /**
   * 获取鼠标事件的坐标点
   */
  private getEventPoint(event: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  /**
   * 获取触摸事件的坐标点
   */
  private getTouchPoint(touch: Touch): Point {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }

  /**
   * 开始交互
   */
  private startInteraction(point: Point): void {
    this.startPoint = point
    this.lastPoint = point
    this.startCropArea = { ...this.cropArea }
    this.currentMode = this.getInteractionMode(point)
    this.isInteracting = true

    this.callbacks.onInteractionStart?.(this.currentMode)
  }

  /**
   * 更新交互
   */
  private updateInteraction(point: Point): void {
    if (!this.isInteracting) return

    if (this.currentMode === InteractionMode.MOVE_IMAGE) {
      // 移动背景图片 - 使用增量移动
      const deltaX = point.x - this.lastPoint.x
      const deltaY = point.y - this.lastPoint.y
      this.callbacks.onImageMove?.(deltaX, deltaY)
      this.lastPoint = point
    } else {
      // 移动或调整裁剪区域 - 使用相对于起始点的偏移
      const deltaX = point.x - this.startPoint.x
      const deltaY = point.y - this.startPoint.y
      const newCropArea = this.calculateNewCropArea(deltaX, deltaY)
      this.cropArea = newCropArea
      this.callbacks.onCropAreaChange?.(this.cropArea)
    }
  }

  /**
   * 结束交互
   */
  private endInteraction(): void {
    if (this.isInteracting) {
      this.isInteracting = false
      this.callbacks.onInteractionEnd?.(this.currentMode)
      this.currentMode = InteractionMode.NONE
      this.canvas.style.cursor = 'default'
    }
  }

  /**
   * 获取交互模式
   */
  private getInteractionMode(point: Point): InteractionMode {
    // 检查是否在控制点上
    const controlPoint = this.getControlPointAt(point)
    if (controlPoint !== InteractionMode.NONE) {
      return controlPoint
    }

    // 检查是否在裁剪区域内
    if (this.isPointInCropArea(point)) {
      return InteractionMode.MOVE
    }

    // 如果不在裁剪区域内，则为移动背景图片模式
    return InteractionMode.MOVE_IMAGE
  }

  /**
   * 获取指定点的控制点类型
   */
  private getControlPointAt(point: Point): InteractionMode {
    const { x, y, width, height } = this.cropArea
    const tolerance = this.CONTROL_POINT_TOLERANCE

    // 检查各个控制点
    const points = [
      { x: x, y: y, mode: InteractionMode.RESIZE_NW },
      { x: x + width / 2, y: y, mode: InteractionMode.RESIZE_N },
      { x: x + width, y: y, mode: InteractionMode.RESIZE_NE },
      { x: x + width, y: y + height / 2, mode: InteractionMode.RESIZE_E },
      { x: x + width, y: y + height, mode: InteractionMode.RESIZE_SE },
      { x: x + width / 2, y: y + height, mode: InteractionMode.RESIZE_S },
      { x: x, y: y + height, mode: InteractionMode.RESIZE_SW },
      { x: x, y: y + height / 2, mode: InteractionMode.RESIZE_W },
    ]

    for (const controlPoint of points) {
      const distance = Math.sqrt(
        Math.pow(point.x - controlPoint.x, 2) + Math.pow(point.y - controlPoint.y, 2)
      )
      if (distance <= tolerance) {
        return controlPoint.mode
      }
    }

    return InteractionMode.NONE
  }

  /**
   * 检查点是否在裁剪区域内
   */
  private isPointInCropArea(point: Point): boolean {
    const { x, y, width, height, shape } = this.cropArea

    switch (shape) {
      case CropShape.RECTANGLE:
        return (
          point.x >= x &&
          point.x <= x + width &&
          point.y >= y &&
          point.y <= y + height
        )

      case CropShape.CIRCLE: {
        const centerX = x + width / 2
        const centerY = y + height / 2
        const radius = Math.min(width, height) / 2
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        )
        return distance <= radius
      }

      case CropShape.ELLIPSE: {
        const centerX = x + width / 2
        const centerY = y + height / 2
        const radiusX = width / 2
        const radiusY = height / 2
        const normalizedX = (point.x - centerX) / radiusX
        const normalizedY = (point.y - centerY) / radiusY
        return normalizedX * normalizedX + normalizedY * normalizedY <= 1
      }

      default:
        return false
    }
  }

  /**
   * 计算新的裁剪区域
   */
  private calculateNewCropArea(deltaX: number, deltaY: number): CropArea {
    const newCropArea = { ...this.startCropArea }

    switch (this.currentMode) {
      case InteractionMode.MOVE:
        newCropArea.x = this.startCropArea.x + deltaX
        newCropArea.y = this.startCropArea.y + deltaY
        break

      case InteractionMode.RESIZE_NW:
        newCropArea.x = this.startCropArea.x + deltaX
        newCropArea.y = this.startCropArea.y + deltaY
        newCropArea.width = this.startCropArea.width - deltaX
        newCropArea.height = this.startCropArea.height - deltaY
        break

      case InteractionMode.RESIZE_N:
        newCropArea.y = this.startCropArea.y + deltaY
        newCropArea.height = this.startCropArea.height - deltaY
        break

      case InteractionMode.RESIZE_NE:
        newCropArea.y = this.startCropArea.y + deltaY
        newCropArea.width = this.startCropArea.width + deltaX
        newCropArea.height = this.startCropArea.height - deltaY
        break

      case InteractionMode.RESIZE_E:
        newCropArea.width = this.startCropArea.width + deltaX
        break

      case InteractionMode.RESIZE_SE:
        newCropArea.width = this.startCropArea.width + deltaX
        newCropArea.height = this.startCropArea.height + deltaY
        break

      case InteractionMode.RESIZE_S:
        newCropArea.height = this.startCropArea.height + deltaY
        break

      case InteractionMode.RESIZE_SW:
        newCropArea.x = this.startCropArea.x + deltaX
        newCropArea.width = this.startCropArea.width - deltaX
        newCropArea.height = this.startCropArea.height + deltaY
        break

      case InteractionMode.RESIZE_W:
        newCropArea.x = this.startCropArea.x + deltaX
        newCropArea.width = this.startCropArea.width - deltaX
        break
    }

    // 确保最小尺寸
    const minSize = 10
    if (newCropArea.width < minSize) {
      newCropArea.width = minSize
    }
    if (newCropArea.height < minSize) {
      newCropArea.height = minSize
    }

    return newCropArea
  }

  /**
   * 更新光标样式
   */
  private updateCursor(mode: InteractionMode): void {
    const cursorMap: Record<InteractionMode, string> = {
      [InteractionMode.NONE]: 'default',
      [InteractionMode.MOVE]: 'move',
      [InteractionMode.MOVE_IMAGE]: 'grab',
      [InteractionMode.RESIZE_NW]: 'nw-resize',
      [InteractionMode.RESIZE_N]: 'n-resize',
      [InteractionMode.RESIZE_NE]: 'ne-resize',
      [InteractionMode.RESIZE_E]: 'e-resize',
      [InteractionMode.RESIZE_SE]: 'se-resize',
      [InteractionMode.RESIZE_S]: 's-resize',
      [InteractionMode.RESIZE_SW]: 'sw-resize',
      [InteractionMode.RESIZE_W]: 'w-resize',
    }

    this.canvas.style.cursor = cursorMap[mode] || 'default'
  }
}
