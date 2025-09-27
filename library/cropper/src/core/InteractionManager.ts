/**
 * @file 交互管理器
 * @description 管理鼠标、触摸、键盘等交互事件
 */

import type {
  Point,
  DragType,
  CropperEventType,
} from '../types'

import {
  getPointerPosition,
  getRelativePosition,
  preventDefault,
  isTouchSupported,
} from '../utils/dom'

import {
  EventEmitter,
  throttle,
  debounce,
} from '../utils/events'

import { distance } from '../utils/math'

/**
 * 交互状态
 */
interface InteractionState {
  isActive: boolean
  type: 'drag' | 'resize' | 'zoom' | 'rotate' | null
  startPoint: Point | null
  currentPoint: Point | null
  lastPoint: Point | null
  startTime: number
  dragType?: DragType
}

/**
 * 触摸状态
 */
interface TouchState {
  touches: Touch[]
  initialDistance: number
  initialAngle: number
  center: Point
}

/**
 * 交互管理器类
 */
export class InteractionManager extends EventEmitter {
  private container: HTMLElement
  private enabled = true
  private touchEnabled = true
  private zoomEnabled = true
  private rotateEnabled = true
  
  private state: InteractionState = {
    isActive: false,
    type: null,
    startPoint: null,
    currentPoint: null,
    lastPoint: null,
    startTime: 0,
  }
  
  private touchState: TouchState = {
    touches: [],
    initialDistance: 0,
    initialAngle: 0,
    center: { x: 0, y: 0 },
  }
  
  private longPressTimer: NodeJS.Timeout | null = null
  private longPressDelay = 500
  
  // 节流和防抖的事件处理器
  private throttledMouseMove: (event: MouseEvent) => void
  private throttledTouchMove: (event: TouchEvent) => void
  private debouncedWheel: (event: WheelEvent) => void

  constructor(container: HTMLElement, options: {
    touchEnabled?: boolean
    zoomEnabled?: boolean
    rotateEnabled?: boolean
    longPressDelay?: number
  } = {}) {
    super()
    
    this.container = container
    this.touchEnabled = options.touchEnabled !== false
    this.zoomEnabled = options.zoomEnabled !== false
    this.rotateEnabled = options.rotateEnabled !== false
    this.longPressDelay = options.longPressDelay || 500
    
    // 创建节流和防抖的处理器
    this.throttledMouseMove = throttle(this.handleMouseMove.bind(this), 16) // ~60fps
    this.throttledTouchMove = throttle(this.handleTouchMove.bind(this), 16)
    this.debouncedWheel = debounce(this.handleWheel.bind(this), 50)
    
    this.bindEvents()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 鼠标事件
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this))
    document.addEventListener('mousemove', this.throttledMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    
    // 触摸事件
    if (this.touchEnabled && isTouchSupported()) {
      this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
      document.addEventListener('touchmove', this.throttledTouchMove, { passive: false })
      document.addEventListener('touchend', this.handleTouchEnd.bind(this))
      document.addEventListener('touchcancel', this.handleTouchEnd.bind(this))
    }
    
    // 滚轮事件
    if (this.zoomEnabled) {
      this.container.addEventListener('wheel', this.debouncedWheel, { passive: false })
    }
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
    
    // 上下文菜单
    this.container.addEventListener('contextmenu', preventDefault)
    
    // 拖拽事件
    this.container.addEventListener('dragstart', preventDefault)
    this.container.addEventListener('selectstart', preventDefault)
  }

  /**
   * 处理鼠标按下
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.enabled || event.button !== 0) return
    
    preventDefault(event)
    
    const point = getRelativePosition(event, this.container)
    this.startInteraction('drag', point, event)
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.enabled || !this.state.isActive) return
    
    const point = getRelativePosition(event, this.container)
    this.updateInteraction(point, event)
  }

  /**
   * 处理鼠标释放
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.enabled || !this.state.isActive) return
    
    const point = getRelativePosition(event, this.container)
    this.endInteraction(point, event)
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled || !this.touchEnabled) return
    
    preventDefault(event)
    
    const touches = Array.from(event.touches)
    this.touchState.touches = touches
    
    if (touches.length === 1) {
      // 单指触摸 - 拖拽
      const point = getRelativePosition(event, this.container)
      this.startInteraction('drag', point, event)
      
      // 开始长按检测
      this.startLongPressDetection(point)
      
    } else if (touches.length === 2) {
      // 双指触摸 - 缩放和旋转
      this.handleTwoFingerStart(touches)
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled || !this.touchEnabled) return
    
    preventDefault(event)
    
    const touches = Array.from(event.touches)
    this.touchState.touches = touches
    
    // 取消长按检测
    this.cancelLongPressDetection()
    
    if (touches.length === 1 && this.state.isActive) {
      // 单指拖拽
      const point = getRelativePosition(event, this.container)
      this.updateInteraction(point, event)
      
    } else if (touches.length === 2) {
      // 双指缩放和旋转
      this.handleTwoFingerMove(touches)
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.enabled || !this.touchEnabled) return
    
    this.cancelLongPressDetection()
    
    const touches = Array.from(event.touches)
    this.touchState.touches = touches
    
    if (touches.length === 0 && this.state.isActive) {
      // 所有手指离开
      const point = this.state.currentPoint || { x: 0, y: 0 }
      this.endInteraction(point, event)
    } else if (touches.length === 1 && this.state.type === 'zoom') {
      // 从双指变为单指
      this.endInteraction(this.state.currentPoint || { x: 0, y: 0 }, event)
    }
  }

  /**
   * 处理双指开始
   */
  private handleTwoFingerStart(touches: Touch[]): void {
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    const point1 = { x: touch1.clientX, y: touch1.clientY }
    const point2 = { x: touch2.clientX, y: touch2.clientY }
    
    this.touchState.initialDistance = distance(point1, point2)
    this.touchState.initialAngle = Math.atan2(point2.y - point1.y, point2.x - point1.x)
    this.touchState.center = {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    }
    
    const relativeCenter = getRelativePosition(
      { clientX: this.touchState.center.x, clientY: this.touchState.center.y } as MouseEvent,
      this.container
    )
    
    this.startInteraction('zoom', relativeCenter, null)
  }

  /**
   * 处理双指移动
   */
  private handleTwoFingerMove(touches: Touch[]): void {
    if (touches.length !== 2) return
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    const point1 = { x: touch1.clientX, y: touch1.clientY }
    const point2 = { x: touch2.clientX, y: touch2.clientY }
    
    const currentDistance = distance(point1, point2)
    const currentAngle = Math.atan2(point2.y - point1.y, point2.x - point1.x)
    const currentCenter = {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    }
    
    // 计算缩放比例
    const scale = currentDistance / this.touchState.initialDistance
    
    // 计算旋转角度
    const rotation = (currentAngle - this.touchState.initialAngle) * (180 / Math.PI)
    
    // 发射缩放事件
    if (this.zoomEnabled && Math.abs(scale - 1) > 0.1) {
      this.emit(CropperEventType.ZOOM_CHANGE, {
        scale,
        center: currentCenter,
        delta: scale - 1,
      })
    }
    
    // 发射旋转事件
    if (this.rotateEnabled && Math.abs(rotation) > 5) {
      this.emit(CropperEventType.ROTATION_CHANGE, {
        rotation,
        center: currentCenter,
        delta: rotation,
      })
    }
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    if (!this.enabled || !this.zoomEnabled) return
    
    preventDefault(event)
    
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const center = getRelativePosition(event, this.container)
    
    this.emit(CropperEventType.ZOOM_CHANGE, {
      delta,
      center,
      scale: 1 + delta,
    })
  }

  /**
   * 处理键盘按下
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return
    
    // ESC键取消当前操作
    if (event.key === 'Escape' && this.state.isActive) {
      this.cancelInteraction()
    }
    
    // 方向键移动裁剪框
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      preventDefault(event)
      
      const step = event.shiftKey ? 10 : 1
      let deltaX = 0
      let deltaY = 0
      
      switch (event.key) {
        case 'ArrowUp':
          deltaY = -step
          break
        case 'ArrowDown':
          deltaY = step
          break
        case 'ArrowLeft':
          deltaX = -step
          break
        case 'ArrowRight':
          deltaX = step
          break
      }
      
      this.emit(CropperEventType.CROP_MOVE, {
        deltaX,
        deltaY,
        keyboard: true,
      })
    }
  }

  /**
   * 处理键盘释放
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // 可以在这里处理键盘释放事件
  }

  /**
   * 开始交互
   */
  private startInteraction(
    type: 'drag' | 'resize' | 'zoom' | 'rotate',
    point: Point,
    originalEvent: Event | null
  ): void {
    this.state = {
      isActive: true,
      type,
      startPoint: point,
      currentPoint: point,
      lastPoint: point,
      startTime: Date.now(),
    }
    
    const eventType = type === 'drag' ? CropperEventType.DRAG_START : CropperEventType.CROP_START
    
    this.emit(eventType, {
      point,
      originalEvent,
      interactionType: type,
    })
  }

  /**
   * 更新交互
   */
  private updateInteraction(point: Point, originalEvent: Event): void {
    if (!this.state.isActive) return
    
    this.state.lastPoint = this.state.currentPoint
    this.state.currentPoint = point
    
    const eventType = this.state.type === 'drag' ? CropperEventType.DRAG_MOVE : CropperEventType.CROP_MOVE
    
    this.emit(eventType, {
      point,
      startPoint: this.state.startPoint,
      lastPoint: this.state.lastPoint,
      deltaX: point.x - (this.state.lastPoint?.x || point.x),
      deltaY: point.y - (this.state.lastPoint?.y || point.y),
      totalDeltaX: point.x - (this.state.startPoint?.x || point.x),
      totalDeltaY: point.y - (this.state.startPoint?.y || point.y),
      originalEvent,
      interactionType: this.state.type,
    })
  }

  /**
   * 结束交互
   */
  private endInteraction(point: Point, originalEvent: Event): void {
    if (!this.state.isActive) return
    
    const duration = Date.now() - this.state.startTime
    const eventType = this.state.type === 'drag' ? CropperEventType.DRAG_END : CropperEventType.CROP_END
    
    this.emit(eventType, {
      point,
      startPoint: this.state.startPoint,
      duration,
      originalEvent,
      interactionType: this.state.type,
    })
    
    this.resetState()
  }

  /**
   * 取消交互
   */
  private cancelInteraction(): void {
    if (!this.state.isActive) return
    
    this.emit('interactionCancel', {
      interactionType: this.state.type,
    })
    
    this.resetState()
  }

  /**
   * 重置状态
   */
  private resetState(): void {
    this.state = {
      isActive: false,
      type: null,
      startPoint: null,
      currentPoint: null,
      lastPoint: null,
      startTime: 0,
    }
  }

  /**
   * 开始长按检测
   */
  private startLongPressDetection(point: Point): void {
    this.cancelLongPressDetection()
    
    this.longPressTimer = setTimeout(() => {
      this.emit('longPress', { point })
    }, this.longPressDelay)
  }

  /**
   * 取消长按检测
   */
  private cancelLongPressDetection(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  /**
   * 启用交互
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用交互
   */
  disable(): void {
    this.enabled = false
    this.cancelInteraction()
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 检查是否正在交互
   */
  isInteracting(): boolean {
    return this.state.isActive
  }

  /**
   * 获取当前交互类型
   */
  getInteractionType(): string | null {
    return this.state.type
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.disable()
    this.cancelLongPressDetection()
    this.removeAllListeners()
    
    // 移除事件监听器
    document.removeEventListener('mousemove', this.throttledMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    document.removeEventListener('touchmove', this.throttledTouchMove)
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    document.removeEventListener('touchcancel', this.handleTouchEnd.bind(this))
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('keyup', this.handleKeyUp.bind(this))
  }
}
