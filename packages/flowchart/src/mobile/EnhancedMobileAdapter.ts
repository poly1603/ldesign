/**
 * 增强移动端适配器
 * 提供更好的触控体验，包括手势识别、触控区域优化等
 */

import { MobileDetector } from './MobileDetector'

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'pan' | 'pinch' | 'swipe'
  startTime: number
  endTime?: number
  startPosition: { x: number, y: number }
  currentPosition?: { x: number, y: number }
  distance?: number
  scale?: number
  velocity?: { x: number, y: number }
}

export interface MobileOptimizationConfig {
  /** 触控区域最小大小 */
  minTouchTargetSize: number
  /** 长按延迟时间 */
  longPressDelay: number
  /** 双击最大间隔 */
  doubleTapMaxInterval: number
  /** 最小拖拽距离 */
  minPanDistance: number
  /** 最小缩放变化 */
  minPinchScale: number
  /** 启用触觉反馈 */
  enableHapticFeedback: boolean
  /** 启用手势预览 */
  enableGesturePreview: boolean
}

/**
 * 增强移动端适配器
 */
export class EnhancedMobileAdapter {
  private config: MobileOptimizationConfig
  private container: HTMLElement | null = null
  private mobileDetector = new MobileDetector()
  private currentGestures: Map<number, TouchGesture> = new Map()
  private touchTargets: WeakMap<Element, { originalSize: string, enhanced: boolean }> = new WeakMap()
  
  // 事件回调
  private onGesture?: (gesture: TouchGesture) => void
  private onTouchTargetEnhanced?: (element: Element) => void

  // 手势识别状态
  private lastTapTime = 0
  private lastTapPosition = { x: 0, y: 0 }
  private isLongPressActive = false
  private longPressTimer?: number
  
  constructor(config: Partial<MobileOptimizationConfig> = {}) {
    this.config = {
      minTouchTargetSize: 44, // iOS HIG推荐44pt
      longPressDelay: 500,
      doubleTapMaxInterval: 300,
      minPanDistance: 10,
      minPinchScale: 0.1,
      enableHapticFeedback: true,
      enableGesturePreview: true,
      ...config
    }
  }

  /**
   * 初始化移动端适配器
   */
  initialize(container: HTMLElement): void {
    this.container = container
    
    if (!this.mobileDetector.isMobileDevice()) {
      console.log('非移动设备，跳过移动端适配')
      return
    }

    console.log('初始化增强移动端适配器')
    
    this.setupTouchEvents()
    this.enhanceTouchTargets()
    this.setupViewportMeta()
    this.preventDefaultBehaviors()
  }

  /**
   * 设置事件回调
   */
  setCallbacks(callbacks: {
    onGesture?: (gesture: TouchGesture) => void
    onTouchTargetEnhanced?: (element: Element) => void
  }): void {
    this.onGesture = callbacks.onGesture
    this.onTouchTargetEnhanced = callbacks.onTouchTargetEnhanced
  }

  /**
   * 设置触摸事件监听
   */
  private setupTouchEvents(): void {
    if (!this.container) return

    // 使用被动监听器提升性能
    const passiveOptions = { passive: true }
    const activeOptions = { passive: false }

    // 触摸开始
    this.container.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e as TouchEvent)
    }, activeOptions)

    // 触摸移动
    this.container.addEventListener('touchmove', (e) => {
      this.handleTouchMove(e as TouchEvent)
    }, passiveOptions)

    // 触摸结束
    this.container.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e as TouchEvent)
    }, activeOptions)

    // 触摸取消
    this.container.addEventListener('touchcancel', (e) => {
      this.handleTouchCancel(e as TouchEvent)
    }, passiveOptions)
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(event: TouchEvent): void {
    const touches = Array.from(event.touches)
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i]
      const gesture: TouchGesture = {
        type: 'tap',
        startTime: Date.now(),
        startPosition: { x: touch.clientX, y: touch.clientY }
      }
      
      this.currentGestures.set(touch.identifier, gesture)
      
      // 检测长按
      this.startLongPressDetection(touch.identifier)
    }

    // 检测双击
    if (touches.length === 1) {
      this.detectDoubleTap(touches[0])
    }

    // 检测多指手势
    if (touches.length === 2) {
      this.startPinchDetection()
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(event: TouchEvent): void {
    const touches = Array.from(event.touches)
    
    for (const touch of touches) {
      const gesture = this.currentGestures.get(touch.identifier)
      if (!gesture) continue

      const currentPosition = { x: touch.clientX, y: touch.clientY }
      gesture.currentPosition = currentPosition

      // 计算移动距离
      const distance = this.calculateDistance(gesture.startPosition, currentPosition)
      gesture.distance = distance

      // 如果移动距离超过阈值，取消长按检测
      if (distance > this.config.minPanDistance) {
        this.cancelLongPress()
        
        if (gesture.type === 'tap') {
          gesture.type = 'pan'
          this.triggerHapticFeedback('light')
        }
      }
    }

    // 处理双指缩放
    if (touches.length === 2) {
      this.handlePinchGesture(touches)
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(event: TouchEvent): void {
    const changedTouches = Array.from(event.changedTouches)
    
    for (const touch of changedTouches) {
      const gesture = this.currentGestures.get(touch.identifier)
      if (!gesture) continue

      gesture.endTime = Date.now()
      
      // 计算手势速度
      if (gesture.currentPosition) {
        const duration = gesture.endTime - gesture.startTime
        if (duration > 0) {
          const dx = gesture.currentPosition.x - gesture.startPosition.x
          const dy = gesture.currentPosition.y - gesture.startPosition.y
          gesture.velocity = {
            x: dx / duration * 1000, // px/s
            y: dy / duration * 1000
          }
        }
      }

      // 检测滑动手势
      if (gesture.type === 'pan' && gesture.velocity) {
        const speed = Math.sqrt(gesture.velocity.x ** 2 + gesture.velocity.y ** 2)
        if (speed > 500) { // 滑动速度阈值
          gesture.type = 'swipe'
        }
      }

      // 触发手势事件
      this.onGesture?.(gesture)
      
      // 清理手势
      this.currentGestures.delete(touch.identifier)
    }

    this.cancelLongPress()
  }

  /**
   * 处理触摸取消
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.currentGestures.clear()
    this.cancelLongPress()
  }

  /**
   * 增强触控区域
   */
  private enhanceTouchTargets(): void {
    if (!this.container) return

    // 查找需要增强的小尺寸元素
    const selectors = [
      'button',
      '.toolbar-tool',
      '.property-input',
      '.material-item',
      '.flowchart-node',
      '[role="button"]'
    ]

    for (const selector of selectors) {
      const elements = this.container.querySelectorAll(selector)
      elements.forEach(element => this.enhanceTouchTarget(element as HTMLElement))
    }
  }

  /**
   * 增强单个触控区域
   */
  private enhanceTouchTarget(element: HTMLElement): void {
    const rect = element.getBoundingClientRect()
    const minSize = this.config.minTouchTargetSize

    if (rect.width < minSize || rect.height < minSize) {
      // 保存原始尺寸
      this.touchTargets.set(element, {
        originalSize: element.style.minWidth || 'auto',
        enhanced: true
      })

      // 应用最小触控尺寸
      element.style.minWidth = `${minSize}px`
      element.style.minHeight = `${minSize}px`
      element.style.display = element.style.display || 'inline-flex'
      element.style.alignItems = 'center'
      element.style.justifyContent = 'center'

      // 添加触控增强标识
      element.classList.add('touch-enhanced')
      
      this.onTouchTargetEnhanced?.(element)
    }
  }

  /**
   * 设置视口元标签
   */
  private setupViewportMeta(): void {
    let viewportMeta = document.querySelector('meta[name="viewport"]')
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta')
      viewportMeta.setAttribute('name', 'viewport')
      document.head.appendChild(viewportMeta)
    }

    // 防止缩放，优化触控体验
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    )
  }

  /**
   * 防止默认触控行为
   */
  private preventDefaultBehaviors(): void {
    if (!this.container) return

    // 防止双击缩放
    this.container.addEventListener('touchstart', (e) => {
      if ((e as TouchEvent).touches.length > 1) {
        e.preventDefault()
      }
    }, { passive: false })

    // 防止长按弹出上下文菜单
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    }, { passive: false })

    // 防止文本选择
    this.container.style.webkitUserSelect = 'none'
    this.container.style.userSelect = 'none'
  }

  /**
   * 开始长按检测
   */
  private startLongPressDetection(touchId: number): void {
    this.longPressTimer = window.setTimeout(() => {
      const gesture = this.currentGestures.get(touchId)
      if (gesture && gesture.type === 'tap') {
        gesture.type = 'long-press'
        this.isLongPressActive = true
        this.triggerHapticFeedback('medium')
        this.onGesture?.(gesture)
      }
    }, this.config.longPressDelay)
  }

  /**
   * 取消长按检测
   */
  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = undefined
    }
    this.isLongPressActive = false
  }

  /**
   * 检测双击
   */
  private detectDoubleTap(touch: Touch): void {
    const now = Date.now()
    const position = { x: touch.clientX, y: touch.clientY }
    const timeDiff = now - this.lastTapTime
    const distance = this.calculateDistance(this.lastTapPosition, position)

    if (timeDiff < this.config.doubleTapMaxInterval && distance < 50) {
      // 双击检测成功
      const gesture: TouchGesture = {
        type: 'double-tap',
        startTime: now,
        startPosition: position
      }
      
      this.triggerHapticFeedback('light')
      this.onGesture?.(gesture)
    }

    this.lastTapTime = now
    this.lastTapPosition = position
  }

  /**
   * 开始缩放检测
   */
  private startPinchDetection(): void {
    // 缩放手势在handlePinchGesture中实现
  }

  /**
   * 处理缩放手势
   */
  private handlePinchGesture(touches: Touch[]): void {
    if (touches.length !== 2) return

    const touch1 = touches[0]
    const touch2 = touches[1]
    
    const gesture1 = this.currentGestures.get(touch1.identifier)
    const gesture2 = this.currentGestures.get(touch2.identifier)
    
    if (!gesture1 || !gesture2) return

    // 计算当前距离
    const currentDistance = this.calculateDistance(
      { x: touch1.clientX, y: touch1.clientY },
      { x: touch2.clientX, y: touch2.clientY }
    )

    // 计算初始距离
    const initialDistance = this.calculateDistance(
      gesture1.startPosition,
      gesture2.startPosition
    )

    // 计算缩放比例
    const scale = currentDistance / initialDistance
    
    if (Math.abs(scale - 1) > this.config.minPinchScale) {
      const pinchGesture: TouchGesture = {
        type: 'pinch',
        startTime: Math.min(gesture1.startTime, gesture2.startTime),
        startPosition: {
          x: (gesture1.startPosition.x + gesture2.startPosition.x) / 2,
          y: (gesture1.startPosition.y + gesture2.startPosition.y) / 2
        },
        currentPosition: {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        },
        scale
      }

      this.onGesture?.(pinchGesture)
    }
  }

  /**
   * 计算两点距离
   */
  private calculateDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 触发触觉反馈
   */
  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.config.enableHapticFeedback) return

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      }
      navigator.vibrate(patterns[intensity])
    }

    // 对于支持的设备，使用Haptic Feedback API
    if ('hapticFeedback' in navigator) {
      // @ts-ignore - Experimental API
      navigator.hapticFeedback?.vibrate?.(intensity)
    }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.cancelLongPress()
    this.currentGestures.clear()
    
    if (this.container) {
      // 移除事件监听器
      this.container.removeEventListener('touchstart', this.handleTouchStart)
      this.container.removeEventListener('touchmove', this.handleTouchMove)
      this.container.removeEventListener('touchend', this.handleTouchEnd)
      this.container.removeEventListener('touchcancel', this.handleTouchCancel)
    }

    this.onGesture = undefined
    this.onTouchTargetEnhanced = undefined
  }

  /**
   * 获取移动端适配信息
   */
  getMobileAdaptationInfo() {
    return {
      isMobileDevice: this.mobileDetector.isMobileDevice(),
      deviceType: this.mobileDetector.getDeviceInfo().deviceType,
      config: this.config,
      enhancedTargetsCount: this.touchTargets ? 
        Array.from(this.container?.querySelectorAll('.touch-enhanced') || []).length : 0
    }
  }
}

/**
 * 默认移动端适配器实例
 */
export const defaultMobileAdapter = new EnhancedMobileAdapter()
