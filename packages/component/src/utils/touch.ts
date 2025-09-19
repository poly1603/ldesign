/**
 * 触摸设备支持工具
 * 
 * 提供触摸事件处理、手势识别和触摸设备优化功能
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 触摸点信息
 */
export interface TouchPoint {
  /** 触摸点ID */
  id: number
  /** 起始X坐标 */
  startX: number
  /** 起始Y坐标 */
  startY: number
  /** 当前X坐标 */
  currentX: number
  /** 当前Y坐标 */
  currentY: number
  /** 起始时间 */
  startTime: number
  /** 当前时间 */
  currentTime: number
}

/**
 * 手势类型
 */
export type GestureType = 'tap' | 'longPress' | 'swipe' | 'pinch' | 'pan' | 'doubleTap'

/**
 * 滑动方向
 */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

/**
 * 手势事件数据
 */
export interface GestureEvent {
  /** 手势类型 */
  type: GestureType
  /** 原始触摸事件 */
  originalEvent: TouchEvent
  /** 触摸点数据 */
  touches: TouchPoint[]
  /** 手势特定数据 */
  data?: {
    /** 滑动方向 */
    direction?: SwipeDirection
    /** 移动距离 */
    distance?: number
    /** 移动速度 */
    velocity?: number
    /** 缩放比例 */
    scale?: number
    /** 旋转角度 */
    rotation?: number
    /** 中心点 */
    center?: { x: number; y: number }
  }
}

/**
 * 触摸配置选项
 */
export interface TouchOptions {
  /** 是否启用触摸事件 */
  enabled?: boolean
  /** 是否阻止默认行为 */
  preventDefault?: boolean
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean
  /** 点击最大移动距离 */
  tapMaxDistance?: number
  /** 长按最小时间 */
  longPressMinTime?: number
  /** 滑动最小距离 */
  swipeMinDistance?: number
  /** 滑动最小速度 */
  swipeMinVelocity?: number
  /** 双击最大间隔时间 */
  doubleTapMaxTime?: number
  /** 双击最大移动距离 */
  doubleTapMaxDistance?: number
}

/**
 * 默认触摸配置
 */
export const DEFAULT_TOUCH_OPTIONS: Required<TouchOptions> = {
  enabled: true,
  preventDefault: false,
  stopPropagation: false,
  tapMaxDistance: 10,
  longPressMinTime: 500,
  swipeMinDistance: 30,
  swipeMinVelocity: 0.3,
  doubleTapMaxTime: 300,
  doubleTapMaxDistance: 20
}

/**
 * 触摸手势管理器
 */
export class TouchGestureManager {
  private element: HTMLElement | null = null
  private options: Required<TouchOptions>
  private touches = new Map<number, TouchPoint>()
  private longPressTimer: number | null = null
  private lastTapTime = 0
  private lastTapPosition = { x: 0, y: 0 }
  private listeners = new Map<GestureType, ((event: GestureEvent) => void)[]>()

  constructor(options: TouchOptions = {}) {
    this.options = { ...DEFAULT_TOUCH_OPTIONS, ...options }
  }

  /**
   * 绑定到元素
   */
  bind(element: HTMLElement): void {
    this.unbind()
    this.element = element

    if (!this.options.enabled) return

    // 添加触摸事件监听器
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: !this.options.preventDefault })
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: !this.options.preventDefault })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: !this.options.preventDefault })
    element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: !this.options.preventDefault })
  }

  /**
   * 解绑元素
   */
  unbind(): void {
    if (!this.element) return

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))

    this.element = null
    this.clearLongPressTimer()
    this.touches.clear()
  }

  /**
   * 添加手势监听器
   */
  on(type: GestureType, callback: (event: GestureEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(callback)
  }

  /**
   * 移除手势监听器
   */
  off(type: GestureType, callback?: (event: GestureEvent) => void): void {
    const callbacks = this.listeners.get(type)
    if (!callbacks) return

    if (callback) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      callbacks.length = 0
    }
  }

  /**
   * 触发手势事件
   */
  private emit(type: GestureType, originalEvent: TouchEvent, data?: GestureEvent['data']): void {
    const callbacks = this.listeners.get(type)
    if (!callbacks || callbacks.length === 0) return

    const gestureEvent: GestureEvent = {
      type,
      originalEvent,
      touches: Array.from(this.touches.values()),
      data
    }

    callbacks.forEach(callback => callback(gestureEvent))
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this.options.preventDefault) event.preventDefault()
    if (this.options.stopPropagation) event.stopPropagation()

    const now = Date.now()

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint: TouchPoint = {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now,
        currentTime: now
      }

      this.touches.set(touch.identifier, touchPoint)
    })

    // 设置长按定时器（仅单指触摸）
    if (this.touches.size === 1) {
      this.longPressTimer = window.setTimeout(() => {
        this.emit('longPress', event)
      }, this.options.longPressMinTime)
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.options.preventDefault) event.preventDefault()
    if (this.options.stopPropagation) event.stopPropagation()

    const now = Date.now()

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = this.touches.get(touch.identifier)
      if (!touchPoint) return

      touchPoint.currentX = touch.clientX
      touchPoint.currentY = touch.clientY
      touchPoint.currentTime = now

      // 如果移动距离超过阈值，取消长按
      const distance = this.calculateDistance(
        touchPoint.startX,
        touchPoint.startY,
        touchPoint.currentX,
        touchPoint.currentY
      )

      if (distance > this.options.tapMaxDistance) {
        this.clearLongPressTimer()
      }
    })

    // 触发拖拽事件
    if (this.touches.size === 1) {
      this.emit('pan', event)
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.options.preventDefault) event.preventDefault()
    if (this.options.stopPropagation) event.stopPropagation()

    const now = Date.now()

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = this.touches.get(touch.identifier)
      if (!touchPoint) return

      touchPoint.currentX = touch.clientX
      touchPoint.currentY = touch.clientY
      touchPoint.currentTime = now

      // 计算手势参数
      const distance = this.calculateDistance(
        touchPoint.startX,
        touchPoint.startY,
        touchPoint.currentX,
        touchPoint.currentY
      )
      const duration = now - touchPoint.startTime
      const velocity = duration > 0 ? distance / duration : 0

      // 判断手势类型
      if (distance <= this.options.tapMaxDistance) {
        // 检查双击
        if (this.isDoubleTap(touch.clientX, touch.clientY, now)) {
          this.emit('doubleTap', event)
        } else {
          this.emit('tap', event)
        }
        this.updateLastTap(touch.clientX, touch.clientY, now)
      } else if (distance >= this.options.swipeMinDistance && velocity >= this.options.swipeMinVelocity) {
        // 滑动手势
        const direction = this.getSwipeDirection(touchPoint)
        this.emit('swipe', event, { direction, distance, velocity })
      }

      this.touches.delete(touch.identifier)
    })

    this.clearLongPressTimer()
  }

  /**
   * 处理触摸取消
   */
  private handleTouchCancel(event: TouchEvent): void {
    Array.from(event.changedTouches).forEach(touch => {
      this.touches.delete(touch.identifier)
    })
    this.clearLongPressTimer()
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  /**
   * 获取滑动方向
   */
  private getSwipeDirection(touchPoint: TouchPoint): SwipeDirection {
    const deltaX = touchPoint.currentX - touchPoint.startX
    const deltaY = touchPoint.currentY - touchPoint.startY

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  /**
   * 检查是否为双击
   */
  private isDoubleTap(x: number, y: number, time: number): boolean {
    const timeDiff = time - this.lastTapTime
    const distance = this.calculateDistance(x, y, this.lastTapPosition.x, this.lastTapPosition.y)

    return timeDiff <= this.options.doubleTapMaxTime && distance <= this.options.doubleTapMaxDistance
  }

  /**
   * 更新最后一次点击信息
   */
  private updateLastTap(x: number, y: number, time: number): void {
    this.lastTapTime = time
    this.lastTapPosition = { x, y }
  }

  /**
   * 清除长按定时器
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }
}

/**
 * 触摸手势 Composable
 */
export function useTouch(element: Ref<HTMLElement | null>, options: TouchOptions = {}) {
  const gestureManager = new TouchGestureManager(options)
  const isActive = ref(false)

  onMounted(() => {
    if (element.value) {
      gestureManager.bind(element.value)
      isActive.value = true
    }
  })

  onUnmounted(() => {
    gestureManager.unbind()
    isActive.value = false
  })

  return {
    isActive,
    isTouchDevice: ref(isTouchDevice()),
    on: gestureManager.on.bind(gestureManager),
    off: gestureManager.off.bind(gestureManager)
  }
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取触摸目标的最小尺寸（用于无障碍访问）
 */
export function getMinTouchTargetSize(): number {
  // 根据 WCAG 指南，触摸目标最小尺寸为 44px
  return 44
}

/**
 * 检查元素是否满足触摸目标尺寸要求
 */
export function validateTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const minSize = getMinTouchTargetSize()
  return rect.width >= minSize && rect.height >= minSize
}
