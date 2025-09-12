/**
 * @file 交互控制器
 * @description 整合所有交互功能的主控制器
 */

import type { CropArea, Point } from '@/types'
import { CropShape } from '@/types'
import { EventHandler, PointerEventType, type PointerEventData } from './event-handler'
import { DragController, type DragEventData } from './drag-controller'
import { ControlPointsManager, ControlPointType, type ControlPoint } from './control-points-manager'
import { GestureRecognizer, GestureType, type GestureEventData } from './gesture-recognizer'

/**
 * 交互模式
 */
export enum InteractionMode {
  NONE = 'none',
  MOVE = 'move',
  RESIZE = 'resize',
  ROTATE = 'rotate',
}

/**
 * 交互事件类型
 */
export enum InteractionEventType {
  INTERACTION_START = 'interaction-start',
  INTERACTION_CHANGE = 'interaction-change',
  INTERACTION_END = 'interaction-end',
  MODE_CHANGE = 'mode-change',
  CURSOR_CHANGE = 'cursor-change',
}

/**
 * 交互事件数据
 */
export interface InteractionEventData {
  /** 事件类型 */
  type: InteractionEventType
  /** 交互模式 */
  mode: InteractionMode
  /** 裁剪区域变化 */
  cropAreaChange?: Partial<CropArea>
  /** 变换数据 */
  transform?: {
    scale?: number
    rotation?: number
    translation?: Point
  }
  /** 光标样式 */
  cursor?: string
  /** 原始事件数据 */
  originalData?: any
}

/**
 * 交互回调函数
 */
export type InteractionCallback = (data: InteractionEventData) => void

/**
 * 交互控制器配置
 */
export interface InteractionControllerOptions {
  /** 是否启用移动 */
  enableMove: boolean
  /** 是否启用调整大小 */
  enableResize: boolean
  /** 是否启用旋转 */
  enableRotate: boolean
  /** 是否启用手势 */
  enableGestures: boolean
  /** 是否保持宽高比 */
  keepAspectRatio: boolean
  /** 控制点配置 */
  controlPoints: {
    size: number
    showCorners: boolean
    showEdges: boolean
    showCenter: boolean
    showRotate: boolean
  }
  /** 拖拽配置 */
  drag: {
    threshold: number
    constrainToBounds: boolean
  }
}

/**
 * 交互控制器类
 * 整合所有交互功能
 */
export class InteractionController {
  /** 目标元素 */
  private element: HTMLElement

  /** 配置选项 */
  private options: InteractionControllerOptions

  /** 事件处理器 */
  private eventHandler: EventHandler

  /** 拖拽控制器 */
  private dragController: DragController

  /** 控制点管理器 */
  private controlPointsManager: ControlPointsManager

  /** 手势识别器 */
  private gestureRecognizer: GestureRecognizer

  /** 当前交互模式 */
  private currentMode = InteractionMode.NONE

  /** 当前裁剪区域 */
  private currentCropArea: CropArea | null = null

  /** 当前激活的控制点 */
  private activeControlPoint: ControlPoint | null = null

  /** 事件回调 */
  private callbacks = new Map<InteractionEventType, Set<InteractionCallback>>()

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: InteractionControllerOptions = {
    enableMove: true,
    enableResize: true,
    enableRotate: true,
    enableGestures: true,
    keepAspectRatio: false,
    controlPoints: {
      size: 8,
      showCorners: true,
      showEdges: true,
      showCenter: false,
      showRotate: true,
    },
    drag: {
      threshold: 3,
      constrainToBounds: true,
    },
  }

  /**
   * 构造函数
   * @param element 目标元素
   * @param options 配置选项
   */
  constructor(element: HTMLElement, options: Partial<InteractionControllerOptions> = {}) {
    this.element = element
    this.options = { ...InteractionController.DEFAULT_OPTIONS, ...options }

    // 初始化各个控制器
    this.eventHandler = new EventHandler(element)
    this.dragController = new DragController(element, this.options.drag)
    this.controlPointsManager = new ControlPointsManager(this.options.controlPoints)
    this.gestureRecognizer = new GestureRecognizer(element)

    this.setupEventListeners()
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param callback 回调函数
   */
  on(type: InteractionEventType, callback: InteractionCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set())
    }
    this.callbacks.get(type)!.add(callback)
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param callback 回调函数
   */
  off(type: InteractionEventType, callback: InteractionCallback): void {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.callbacks.delete(type)
      }
    }
  }

  /**
   * 更新裁剪区域
   * @param cropArea 裁剪区域
   */
  updateCropArea(cropArea: CropArea): void {
    this.currentCropArea = { ...cropArea }
    this.controlPointsManager.updateControlPoints(cropArea)
    this.dragController.setStartCropArea(cropArea)
  }

  /**
   * 获取控制点
   */
  getControlPoints(): ControlPoint[] {
    return this.controlPointsManager.getVisibleControlPoints()
  }

  /**
   * 获取当前交互模式
   */
  getCurrentMode(): InteractionMode {
    return this.currentMode
  }

  /**
   * 设置交互模式
   * @param mode 交互模式
   */
  setMode(mode: InteractionMode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode
      this.emit(InteractionEventType.MODE_CHANGE, {
        type: InteractionEventType.MODE_CHANGE,
        mode,
      })
    }
  }

  /**
   * 启用/禁用功能
   * @param feature 功能名称
   * @param enabled 是否启用
   */
  setFeatureEnabled(feature: keyof InteractionControllerOptions, enabled: boolean): void {
    if (feature in this.options) {
      (this.options as any)[feature] = enabled
    }
  }

  /**
   * 更新配置
   * @param options 新配置
   */
  updateOptions(options: Partial<InteractionControllerOptions>): void {
    this.options = { ...this.options, ...options }
    this.controlPointsManager.updateOptions(this.options.controlPoints)
    this.dragController.updateOptions(this.options.drag)
  }

  /**
   * 销毁交互控制器
   */
  destroy(): void {
    this.eventHandler.destroy()
    this.dragController.destroy()
    this.gestureRecognizer.destroy()
    this.callbacks.clear()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 基础指针事件
    this.eventHandler.on(PointerEventType.START, this.handlePointerStart)
    this.eventHandler.on(PointerEventType.MOVE, this.handlePointerMove)
    this.eventHandler.on(PointerEventType.END, this.handlePointerEnd)

    // 拖拽事件
    this.dragController.setOnDragStart(this.handleDragStart)
    this.dragController.setOnDragMove(this.handleDragMove)
    this.dragController.setOnDragEnd(this.handleDragEnd)

    // 手势事件
    if (this.options.enableGestures) {
      this.gestureRecognizer.on(GestureType.PAN, this.handleGesture)
      this.gestureRecognizer.on(GestureType.PINCH, this.handleGesture)
      this.gestureRecognizer.on(GestureType.ROTATE, this.handleGesture)
      this.gestureRecognizer.on(GestureType.MULTI, this.handleGesture)
    }
  }

  /**
   * 处理指针开始事件
   */
  private handlePointerStart = (data: PointerEventData): void => {
    if (!this.currentCropArea) return

    // 检查是否点击在控制点上
    const controlPoint = this.controlPointsManager.hitTest(data.point)
    if (controlPoint) {
      this.activeControlPoint = controlPoint
      this.controlPointsManager.setActivePoint(controlPoint)
      
      // 设置交互模式
      if (controlPoint.type === ControlPointType.ROTATE) {
        this.setMode(InteractionMode.ROTATE)
      } else if (controlPoint.type === ControlPointType.CENTER) {
        this.setMode(InteractionMode.MOVE)
      } else {
        this.setMode(InteractionMode.RESIZE)
      }

      // 更新光标
      this.updateCursor(controlPoint.cursor)
    } else {
      // 检查是否点击在裁剪区域内
      const isInCropArea = this.isPointInCropArea(data.point)
      if (isInCropArea && this.options.enableMove) {
        this.setMode(InteractionMode.MOVE)
        this.updateCursor('move')
      } else {
        this.setMode(InteractionMode.NONE)
        this.updateCursor('default')
      }
    }
  }

  /**
   * 处理指针移动事件
   */
  private handlePointerMove = (data: PointerEventData): void => {
    if (this.currentMode === InteractionMode.NONE && this.currentCropArea) {
      // 悬停状态下更新光标
      const controlPoint = this.controlPointsManager.hitTest(data.point)
      if (controlPoint) {
        this.updateCursor(controlPoint.cursor)
      } else {
        const isInCropArea = this.isPointInCropArea(data.point)
        this.updateCursor(isInCropArea && this.options.enableMove ? 'move' : 'default')
      }
    }
  }

  /**
   * 处理指针结束事件
   */
  private handlePointerEnd = (data: PointerEventData): void => {
    this.activeControlPoint = null
    this.controlPointsManager.setActivePoint(null)
    this.setMode(InteractionMode.NONE)
    this.updateCursor('default')
  }

  /**
   * 处理拖拽开始
   */
  private handleDragStart = (data: DragEventData): void => {
    this.emit(InteractionEventType.INTERACTION_START, {
      type: InteractionEventType.INTERACTION_START,
      mode: this.currentMode,
      originalData: data,
    })
  }

  /**
   * 处理拖拽移动
   */
  private handleDragMove = (data: DragEventData): void => {
    if (!this.currentCropArea) return

    let cropAreaChange: Partial<CropArea> = {}

    if (this.currentMode === InteractionMode.MOVE) {
      // 移动整个裁剪区域
      cropAreaChange = {
        x: this.currentCropArea.x + data.delta.x,
        y: this.currentCropArea.y + data.delta.y,
      }
    } else if (this.currentMode === InteractionMode.RESIZE && this.activeControlPoint) {
      // 调整裁剪区域大小
      cropAreaChange = this.controlPointsManager.calculateResizedCropArea(
        this.activeControlPoint,
        data.delta,
        this.currentCropArea,
        this.options.keepAspectRatio,
      )
    }

    this.emit(InteractionEventType.INTERACTION_CHANGE, {
      type: InteractionEventType.INTERACTION_CHANGE,
      mode: this.currentMode,
      cropAreaChange,
      originalData: data,
    })
  }

  /**
   * 处理拖拽结束
   */
  private handleDragEnd = (data: DragEventData): void => {
    this.emit(InteractionEventType.INTERACTION_END, {
      type: InteractionEventType.INTERACTION_END,
      mode: this.currentMode,
      originalData: data,
    })
  }

  /**
   * 处理手势事件
   */
  private handleGesture = (data: GestureEventData): void => {
    const transform: any = {}

    if (data.type === GestureType.PINCH || data.type === GestureType.MULTI) {
      transform.scale = data.scale
    }

    if (data.type === GestureType.ROTATE || data.type === GestureType.MULTI) {
      transform.rotation = data.rotation
    }

    if (data.type === GestureType.PAN || data.type === GestureType.MULTI) {
      transform.translation = data.translation
    }

    this.emit(InteractionEventType.INTERACTION_CHANGE, {
      type: InteractionEventType.INTERACTION_CHANGE,
      mode: InteractionMode.NONE, // 手势不设置特定模式
      transform,
      originalData: data,
    })
  }

  /**
   * 检查点是否在裁剪区域内
   */
  private isPointInCropArea(point: Point): boolean {
    if (!this.currentCropArea) return false

    const { x, y, width, height, shape } = this.currentCropArea

    switch (shape) {
      case CropShape.RECTANGLE:
        return point.x >= x && point.x <= x + width && 
               point.y >= y && point.y <= y + height

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
        const a = width / 2
        const b = height / 2
        const dx = point.x - centerX
        const dy = point.y - centerY
        return (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1
      }

      default:
        return false
    }
  }

  /**
   * 更新光标样式
   */
  private updateCursor(cursor: string): void {
    this.element.style.cursor = cursor
    this.emit(InteractionEventType.CURSOR_CHANGE, {
      type: InteractionEventType.CURSOR_CHANGE,
      mode: this.currentMode,
      cursor,
    })
  }

  /**
   * 触发事件
   */
  private emit(type: InteractionEventType, data: InteractionEventData): void {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in interaction callback:', error)
        }
      })
    }
  }
}
