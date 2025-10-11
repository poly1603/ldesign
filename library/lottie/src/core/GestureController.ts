/**
 * 手势控制系统
 * 支持触摸、滑动、捏合、旋转等手势交互
 */

import type { ILottieInstance } from '../types'

export type GestureType = 'tap' | 'swipe' | 'pinch' | 'rotate' | 'pan' | 'press'

export interface GestureConfig {
  enableTap?: boolean
  enableSwipe?: boolean
  enablePinch?: boolean
  enableRotate?: boolean
  enablePan?: boolean
  enablePress?: boolean
  swipeThreshold?: number
  pinchThreshold?: number
  pressDelay?: number
}

export interface GestureEvent {
  type: GestureType
  target: HTMLElement
  original: TouchEvent | MouseEvent
  deltaX?: number
  deltaY?: number
  scale?: number
  rotation?: number
  velocity?: number
}

type GestureHandler = (event: GestureEvent) => void

/**
 * 手势控制器
 */
export class GestureController {
  private instance: ILottieInstance
  private container: HTMLElement
  private config: Required<GestureConfig>
  private handlers = new Map<GestureType, Set<GestureHandler>>()
  
  private touchStartX = 0
  private touchStartY = 0
  private touchStartTime = 0
  private lastTouchX = 0
  private lastTouchY = 0
  private touchDistance = 0
  private touchAngle = 0
  private pressTimer: number | null = null
  
  private isActive = false

  constructor(instance: ILottieInstance, config?: GestureConfig) {
    this.instance = instance
    this.container = this.getContainer()
    this.config = {
      enableTap: config?.enableTap ?? true,
      enableSwipe: config?.enableSwipe ?? true,
      enablePinch: config?.enablePinch ?? true,
      enableRotate: config?.enableRotate ?? true,
      enablePan: config?.enablePan ?? true,
      enablePress: config?.enablePress ?? true,
      swipeThreshold: config?.swipeThreshold ?? 50,
      pinchThreshold: config?.pinchThreshold ?? 0.1,
      pressDelay: config?.pressDelay ?? 500
    }

    this.init()
  }

  /**
   * 获取容器元素
   */
  private getContainer(): HTMLElement {
    const container = this.instance.config.container
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`Container not found: ${container}`)
      }
      return element as HTMLElement
    }
    return container as HTMLElement
  }

  /**
   * 初始化事件监听
   */
  private init(): void {
    // 触摸事件
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    
    // 鼠标事件（用于桌面端）
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this))
    
    this.isActive = true
  }

  /**
   * 监听手势
   */
  on(type: GestureType, handler: GestureHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
    
    // 返回取消监听函数
    return () => {
      this.off(type, handler)
    }
  }

  /**
   * 取消监听
   */
  off(type: GestureType, handler?: GestureHandler): void {
    if (!handler) {
      this.handlers.delete(type)
    } else {
      this.handlers.get(type)?.delete(handler)
    }
  }

  /**
   * 触发手势事件
   */
  private emit(event: GestureEvent): void {
    const handlers = this.handlers.get(event.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event)
        } catch (error) {
          console.error('[GestureController] Handler error:', error)
        }
      })
    }
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.isActive) return

    const touch = e.touches[0]
    this.touchStartX = touch.clientX
    this.touchStartY = touch.clientY
    this.lastTouchX = touch.clientX
    this.lastTouchY = touch.clientY
    this.touchStartTime = Date.now()

    // 多点触控
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      this.touchDistance = this.getDistance(touch1, touch2)
      this.touchAngle = this.getAngle(touch1, touch2)
    }

    // 长按检测
    if (this.config.enablePress) {
      this.pressTimer = window.setTimeout(() => {
        this.emit({
          type: 'press',
          target: this.container,
          original: e
        })
      }, this.config.pressDelay)
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!this.isActive) return

    // 取消长按
    if (this.pressTimer) {
      clearTimeout(this.pressTimer)
      this.pressTimer = null
    }

    const touch = e.touches[0]
    const deltaX = touch.clientX - this.lastTouchX
    const deltaY = touch.clientY - this.lastTouchY
    
    this.lastTouchX = touch.clientX
    this.lastTouchY = touch.clientY

    // 单点拖动
    if (e.touches.length === 1 && this.config.enablePan) {
      this.emit({
        type: 'pan',
        target: this.container,
        original: e,
        deltaX,
        deltaY
      })
      e.preventDefault()
    }

    // 双点操作
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      // 捏合
      if (this.config.enablePinch) {
        const distance = this.getDistance(touch1, touch2)
        const scale = distance / this.touchDistance
        
        if (Math.abs(scale - 1) > this.config.pinchThreshold) {
          this.emit({
            type: 'pinch',
            target: this.container,
            original: e,
            scale
          })
          this.touchDistance = distance
        }
      }

      // 旋转
      if (this.config.enableRotate) {
        const angle = this.getAngle(touch1, touch2)
        const rotation = angle - this.touchAngle
        
        this.emit({
          type: 'rotate',
          target: this.container,
          original: e,
          rotation
        })
        this.touchAngle = angle
      }

      e.preventDefault()
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.isActive) return

    // 取消长按
    if (this.pressTimer) {
      clearTimeout(this.pressTimer)
      this.pressTimer = null
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - this.touchStartX
    const deltaY = touch.clientY - this.touchStartY
    const deltaTime = Date.now() - this.touchStartTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 点击
    if (this.config.enableTap && distance < 10 && deltaTime < 300) {
      this.emit({
        type: 'tap',
        target: this.container,
        original: e
      })
    }

    // 滑动
    if (this.config.enableSwipe && distance > this.config.swipeThreshold) {
      const velocity = distance / deltaTime
      this.emit({
        type: 'swipe',
        target: this.container,
        original: e,
        deltaX,
        deltaY,
        velocity
      })
    }
  }

  /**
   * 处理鼠标按下
   */
  private handleMouseDown(e: MouseEvent): void {
    if (!this.isActive) return

    this.touchStartX = e.clientX
    this.touchStartY = e.clientY
    this.lastTouchX = e.clientX
    this.lastTouchY = e.clientY
    this.touchStartTime = Date.now()

    // 长按检测
    if (this.config.enablePress) {
      this.pressTimer = window.setTimeout(() => {
        this.emit({
          type: 'press',
          target: this.container,
          original: e
        })
      }, this.config.pressDelay)
    }
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isActive || !e.buttons) return

    // 取消长按
    if (this.pressTimer) {
      clearTimeout(this.pressTimer)
      this.pressTimer = null
    }

    const deltaX = e.clientX - this.lastTouchX
    const deltaY = e.clientY - this.lastTouchY
    
    this.lastTouchX = e.clientX
    this.lastTouchY = e.clientY

    if (this.config.enablePan) {
      this.emit({
        type: 'pan',
        target: this.container,
        original: e,
        deltaX,
        deltaY
      })
    }
  }

  /**
   * 处理鼠标释放
   */
  private handleMouseUp(e: MouseEvent): void {
    if (!this.isActive) return

    // 取消长按
    if (this.pressTimer) {
      clearTimeout(this.pressTimer)
      this.pressTimer = null
    }

    const deltaX = e.clientX - this.touchStartX
    const deltaY = e.clientY - this.touchStartY
    const deltaTime = Date.now() - this.touchStartTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 点击
    if (this.config.enableTap && distance < 10 && deltaTime < 300) {
      this.emit({
        type: 'tap',
        target: this.container,
        original: e
      })
    }

    // 滑动
    if (this.config.enableSwipe && distance > this.config.swipeThreshold) {
      const velocity = distance / deltaTime
      this.emit({
        type: 'swipe',
        target: this.container,
        original: e,
        deltaX,
        deltaY,
        velocity
      })
    }
  }

  /**
   * 计算两点距离
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 计算两点角度
   */
  private getAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.atan2(dy, dx) * 180 / Math.PI
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.isActive = false
    
    if (this.pressTimer) {
      clearTimeout(this.pressTimer)
    }

    this.handlers.clear()

    // 移除事件监听器需要在真实环境中实现
    // 这里简化处理
  }
}

/**
 * 创建手势控制器的便捷函数
 */
export function createGestureController(
  instance: ILottieInstance,
  config?: GestureConfig
): GestureController {
  return new GestureController(instance, config)
}
