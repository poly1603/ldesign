/**
 * 模板动画系统
 */

import type { CSSProperties } from 'vue'
import { reactive } from 'vue'

/**
 * 动画类型
 */
export type AnimationType = 
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'flip'
  | 'bounce'
  | 'shake'
  | 'pulse'
  | 'parallax'
  | 'morph'
  | 'reveal'
  | 'typewriter'
  | 'gradient'
  | 'blur'
  | 'custom'

/**
 * 动画方向
 */
export type AnimationDirection = 
  | 'up' 
  | 'down' 
  | 'left' 
  | 'right' 
  | 'in' 
  | 'out'

/**
 * 缓动函数
 */
export type EasingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | 'spring'
  | 'elastic'
  | 'bounce'

/**
 * 动画配置
 */
export interface AnimationConfig {
  /**
   * 动画类型
   */
  type: AnimationType
  
  /**
   * 动画时长（毫秒）
   */
  duration?: number
  
  /**
   * 延迟时间（毫秒）
   */
  delay?: number
  
  /**
   * 缓动函数
   */
  easing?: EasingFunction | string
  
  /**
   * 动画方向
   */
  direction?: AnimationDirection
  
  /**
   * 迭代次数
   */
  iterations?: number | 'infinite'
  
  /**
   * 是否自动播放
   */
  autoPlay?: boolean
  
  /**
   * 填充模式
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  
  /**
   * 自定义属性
   */
  properties?: Record<string, any>
}

/**
 * 手势配置
 */
export interface GestureConfig {
  /**
   * 是否启用拖拽
   */
  drag?: boolean
  
  /**
   * 是否启用旋转
   */
  rotate?: boolean
  
  /**
   * 是否启用缩放
   */
  scale?: boolean
  
  /**
   * 是否启用滑动
   */
  swipe?: boolean
  
  /**
   * 拖拽约束
   */
  dragConstraints?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  
  /**
   * 弹性系数
   */
  dragElastic?: number
  
  /**
   * 动量
   */
  dragMomentum?: boolean
  
  /**
   * 滑动阈值
   */
  swipeThreshold?: number
  
  /**
   * 滑动速度
   */
  swipeVelocity?: number
}

/**
 * 视差配置
 */
export interface ParallaxConfig {
  /**
   * 速度系数
   */
  speed?: number
  
  /**
   * 偏移量
   */
  offset?: number
  
  /**
   * 是否启用水平视差
   */
  horizontal?: boolean
  
  /**
   * 是否启用垂直视差
   */
  vertical?: boolean
  
  /**
   * 是否启用旋转
   */
  rotate?: boolean
  
  /**
   * 是否启用缩放
   */
  scale?: boolean
  
  /**
   * 最大偏移量
   */
  maxOffset?: number
  
  /**
   * 触发元素
   */
  trigger?: string | HTMLElement
  
  /**
   * 是否平滑过渡
   */
  smooth?: boolean
}

/**
 * 滚动动画配置
 */
export interface ScrollAnimationConfig {
  /**
   * 触发位置
   */
  trigger?: 'top' | 'center' | 'bottom'
  
  /**
   * 触发偏移
   */
  offset?: number
  
  /**
   * 是否只触发一次
   */
  once?: boolean
  
  /**
   * 滚动方向
   */
  direction?: 'up' | 'down' | 'both'
  
  /**
   * 进入动画
   */
  enter?: AnimationConfig
  
  /**
   * 离开动画
   */
  leave?: AnimationConfig
  
  /**
   * 进度回调
   */
  onProgress?: (progress: number) => void
}

/**
 * 动画状态
 */
export interface AnimationState {
  /**
   * 是否正在播放
   */
  playing: boolean
  
  /**
   * 是否暂停
   */
  paused: boolean
  
  /**
   * 当前进度 (0-1)
   */
  progress: number
  
  /**
   * 当前迭代次数
   */
  iteration: number
  
  /**
   * 是否完成
   */
  finished: boolean
}

/**
 * 动画控制器
 */
export class AnimationController {
  private animations: Map<string, Animation>
  private rafId: number | null = null
  private startTime: number = 0
  private disposed = false
  
  constructor() {
    this.animations = new Map()
  }
  
  /**
   * 创建动画
   */
  create(id: string, element: HTMLElement, config: AnimationConfig): Animation {
    const animation = new Animation(element, config)
    this.animations.set(id, animation)
    return animation
  }
  
  /**
   * 播放动画
   */
  play(id: string) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.play()
    }
  }
  
  /**
   * 暂停动画
   */
  pause(id: string) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.pause()
    }
  }
  
  /**
   * 停止动画
   */
  stop(id: string) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.stop()
    }
  }
  
  /**
   * 重置动画
   */
  reset(id: string) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.reset()
    }
  }
  
  /**
   * 销毁动画
   */
  destroy(id: string) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.destroy()
      this.animations.delete(id)
    }
  }
  
  /**
   * 销毁所有动画
   */
  destroyAll() {
    if (this.disposed) return
    
    this.animations.forEach(animation => animation.destroy())
    this.animations.clear()
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.disposed = true
  }
}

/**
 * 单个动画实例
 */
export class Animation {
  private element: HTMLElement
  private config: AnimationConfig
  private state: AnimationState
  private animation: globalThis.Animation | null = null
  private initialStyles: CSSProperties = {}
  
  constructor(element: HTMLElement, config: AnimationConfig) {
    this.element = element
    this.config = config
    this.state = reactive({
      playing: false,
      paused: false,
      progress: 0,
      iteration: 0,
      finished: false
    })
    
    this.saveInitialStyles()
    if (config.autoPlay) {
      this.play()
    }
  }
  
  /**
   * 保存初始样式
   */
  private saveInitialStyles() {
    const computedStyles = window.getComputedStyle(this.element)
    this.initialStyles = {
      transform: computedStyles.transform,
      opacity: computedStyles.opacity,
      filter: computedStyles.filter
    }
  }
  
  /**
   * 获取关键帧
   */
  private getKeyframes(): Keyframe[] {
    const { type, direction, properties } = this.config
    
    switch (type) {
      case 'fade':
        return [
          { opacity: direction === 'out' ? 1 : 0 },
          { opacity: direction === 'out' ? 0 : 1 }
        ]
      
      case 'slide': {
        const distance = properties?.distance || 100
        const translateMap: Record<string, string> = {
          up: `translateY(${distance}px)`,
          down: `translateY(-${distance}px)`,
          left: `translateX(${distance}px)`,
          right: `translateX(-${distance}px)`
        }
        return [
          { transform: translateMap[direction || 'up'] || 'none' },
          { transform: 'translateX(0) translateY(0)' }
        ]
      }
      
      case 'scale':
        return [
          { transform: direction === 'out' ? 'scale(1)' : 'scale(0)' },
          { transform: direction === 'out' ? 'scale(0)' : 'scale(1)' }
        ]
      
      case 'rotate': {
        const degrees = properties?.degrees || 360
        return [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${degrees}deg)` }
        ]
      }
      
      case 'flip': {
        const axis = properties?.axis || 'Y'
        return [
          { transform: `rotate${axis}(0deg)` },
          { transform: `rotate${axis}(180deg)` }
        ]
      }
      
      case 'custom':
        return properties?.keyframes || []
      
      default:
        return []
    }
  }
  
  /**
   * 获取动画选项
   */
  private getAnimationOptions(): KeyframeAnimationOptions {
    const { duration, delay, easing, iterations, fillMode } = this.config
    
    return {
      duration: duration || 300,
      delay: delay || 0,
      easing: this.getEasing(easing),
      iterations: iterations === 'infinite' ? Infinity : (iterations || 1),
      fill: fillMode || 'both'
    }
  }
  
  /**
   * 获取缓动函数
   */
  private getEasing(easing?: EasingFunction | string): string {
    if (!easing) return 'ease'
    
    const easingMap: Record<EasingFunction, string> = {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'cubic-bezier': 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.5, 1.5, 0.5, 1)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.87, -0.41, 0.19, 1.44)'
    }
    
    return easingMap[easing as EasingFunction] || easing
  }
  
  /**
   * 播放动画
   */
  play() {
    if (this.state.playing && !this.state.paused) return
    
    const keyframes = this.getKeyframes()
    const options = this.getAnimationOptions()
    
    if (this.state.paused && this.animation) {
      this.animation.play()
      this.state.paused = false
    } else {
      this.animation = this.element.animate(keyframes, options)
      this.state.playing = true
      this.state.finished = false
      
      this.animation.onfinish = () => {
        this.state.finished = true
        this.state.playing = false
      }
    }
  }
  
  /**
   * 暂停动画
   */
  pause() {
    if (this.animation && this.state.playing) {
      this.animation.pause()
      this.state.paused = true
    }
  }
  
  /**
   * 停止动画
   */
  stop() {
    if (this.animation) {
      this.animation.cancel()
      this.state.playing = false
      this.state.paused = false
      this.state.finished = true
    }
  }
  
  /**
   * 重置动画
   */
  reset() {
    this.stop()
    this.state.progress = 0
    this.state.iteration = 0
    
    // 恢复初始样式
    Object.assign(this.element.style, this.initialStyles)
  }
  
  /**
   * 反转动画
   */
  reverse() {
    if (this.animation) {
      this.animation.reverse()
    }
  }
  
  /**
   * 设置播放速率
   */
  setPlaybackRate(rate: number) {
    if (this.animation) {
      this.animation.playbackRate = rate
    }
  }
  
  /**
   * 跳转到指定时间
   */
  seek(time: number) {
    if (this.animation) {
      this.animation.currentTime = time
    }
  }
  
  /**
   * 销毁动画
   */
  destroy() {
    this.stop()
    this.animation = null
  }
  
  /**
   * 获取状态
   */
  getState(): AnimationState {
    return this.state
  }
}

/**
 * 视差控制器
 */
export class ParallaxController {
  private elements: Map<HTMLElement, ParallaxConfig>
  private observer: IntersectionObserver | null = null
  private rafId: number | null = null
  private scrollY: number = 0
  private scrollX: number = 0
  
  constructor() {
    this.elements = new Map()
    this.init()
  }
  
  private init() {
    // 监听滚动
    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    
    // 创建交叉观察器
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startParallax(entry.target as HTMLElement)
        } else {
          this.stopParallax(entry.target as HTMLElement)
        }
      })
    })
  }
  
  /**
   * 添加视差元素
   */
  add(element: HTMLElement, config: ParallaxConfig = {}) {
    this.elements.set(element, {
      speed: 0.5,
      offset: 0,
      horizontal: false,
      vertical: true,
      rotate: false,
      scale: false,
      maxOffset: 1000,
      smooth: true,
      ...config
    })
    
    this.observer?.observe(element)
  }
  
  /**
   * 移除视差元素
   */
  remove(element: HTMLElement) {
    this.elements.delete(element)
    this.observer?.unobserve(element)
  }
  
  /**
   * 处理滚动
   */
  private handleScroll() {
    this.scrollY = window.scrollY
    this.scrollX = window.scrollX
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.updateParallax()
        this.rafId = null
      })
    }
  }
  
  /**
   * 开始视差效果
   */
  private startParallax(element: HTMLElement) {
    element.setAttribute('data-parallax-active', 'true')
  }
  
  /**
   * 停止视差效果
   */
  private stopParallax(element: HTMLElement) {
    element.removeAttribute('data-parallax-active')
  }
  
  /**
   * 更新视差效果
   */
  private updateParallax() {
    this.elements.forEach((config, element) => {
      if (element.getAttribute('data-parallax-active') !== 'true') return
      
      const rect = element.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const centerX = rect.left + rect.width / 2
      const screenCenterY = window.innerHeight / 2
      const screenCenterX = window.innerWidth / 2
      
      const offsetY = (centerY - screenCenterY) * (config.speed || 0.5)
      const offsetX = (centerX - screenCenterX) * (config.speed || 0.5)
      
      let transform = ''
      
      if (config.vertical) {
        transform += `translateY(${Math.min(Math.max(-config.maxOffset!, offsetY), config.maxOffset!)}px) `
      }
      
      if (config.horizontal) {
        transform += `translateX(${Math.min(Math.max(-config.maxOffset!, offsetX), config.maxOffset!)}px) `
      }
      
      if (config.rotate) {
        const rotation = offsetY * 0.1
        transform += `rotate(${rotation}deg) `
      }
      
      if (config.scale) {
        const scale = 1 + (offsetY / 1000)
        transform += `scale(${Math.min(Math.max(0.5, scale), 1.5)}) `
      }
      
      if (config.smooth) {
        element.style.transition = 'transform 0.1s ease-out'
      }
      
      element.style.transform = transform
    })
  }
  
  /**
   * 销毁
   */
  destroy() {
    window.removeEventListener('scroll', this.handleScroll)
    this.observer?.disconnect()
    this.elements.clear()
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }
}

/**
 * 手势控制器
 */
export class GestureController {
  private element: HTMLElement
  private config: GestureConfig
  private isDragging: boolean = false
  private startX: number = 0
  private startY: number = 0
  private currentX: number = 0
  private currentY: number = 0
  private velocityX: number = 0
  private velocityY: number = 0
  private rafId: number | null = null
  
  constructor(element: HTMLElement, config: GestureConfig = {}) {
    this.element = element
    this.config = {
      drag: true,
      rotate: false,
      scale: false,
      swipe: false,
      dragElastic: 0.2,
      dragMomentum: true,
      swipeThreshold: 50,
      swipeVelocity: 0.5,
      ...config
    }
    
    this.init()
  }
  
  private init() {
    if (this.config.drag) {
      this.initDrag()
    }
    
    if (this.config.swipe) {
      this.initSwipe()
    }
    
    if (this.config.scale || this.config.rotate) {
      this.initTouch()
    }
  }
  
  /**
   * 初始化拖拽
   */
  private initDrag() {
    this.element.style.cursor = 'grab'
    
    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true
      this.element.style.cursor = 'grabbing'
      this.startX = e.clientX - this.currentX
      this.startY = e.clientY - this.currentY
      
      e.preventDefault()
    }
    
    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return
      
      const newX = e.clientX - this.startX
      const newY = e.clientY - this.startY
      
      // 应用约束
      if (this.config.dragConstraints) {
        const { top, bottom, left, right } = this.config.dragConstraints
        this.currentX = Math.min(Math.max(left || -Infinity, newX), right || Infinity)
        this.currentY = Math.min(Math.max(top || -Infinity, newY), bottom || Infinity)
      } else {
        this.currentX = newX
        this.currentY = newY
      }
      
      // 计算速度
      this.velocityX = this.currentX - (this.velocityX || this.currentX)
      this.velocityY = this.currentY - (this.velocityY || this.currentY)
      
      this.updateTransform()
    }
    
    const onMouseUp = () => {
      this.isDragging = false
      this.element.style.cursor = 'grab'
      
      if (this.config.dragMomentum) {
        this.applyMomentum()
      }
    }
    
    this.element.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  
  /**
   * 初始化滑动
   */
  private initSwipe() {
    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0
    
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      touchStartTime = Date.now()
    }
    
    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY
      const deltaTime = Date.now() - touchStartTime
      
      const velocityX = deltaX / deltaTime
      const velocityY = deltaY / deltaTime
      
      if (Math.abs(deltaX) > this.config.swipeThreshold! || 
          Math.abs(velocityX) > this.config.swipeVelocity!) {
        if (deltaX > 0) {
          this.onSwipe('right')
        } else {
          this.onSwipe('left')
        }
      }
      
      if (Math.abs(deltaY) > this.config.swipeThreshold! || 
          Math.abs(velocityY) > this.config.swipeVelocity!) {
        if (deltaY > 0) {
          this.onSwipe('down')
        } else {
          this.onSwipe('up')
        }
      }
    }
    
    this.element.addEventListener('touchstart', onTouchStart, { passive: true })
    this.element.addEventListener('touchend', onTouchEnd, { passive: true })
  }
  
  /**
   * 初始化触摸手势
   */
  private initTouch() {
    let initialDistance = 0
    let initialAngle = 0
    let currentScale = 1
    let currentRotation = 0
    
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        
        // 计算初始距离（用于缩放）
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        
        // 计算初始角度（用于旋转）
        initialAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        )
      }
    }
    
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        
        // 计算当前距离
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        
        // 计算当前角度
        const currentAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        )
        
        if (this.config.scale) {
          currentScale = currentDistance / initialDistance
          this.element.style.transform += ` scale(${currentScale})`
        }
        
        if (this.config.rotate) {
          currentRotation = (currentAngle - initialAngle) * (180 / Math.PI)
          this.element.style.transform += ` rotate(${currentRotation}deg)`
        }
      }
    }
    
    this.element.addEventListener('touchstart', onTouchStart, { passive: true })
    this.element.addEventListener('touchmove', onTouchMove, { passive: true })
  }
  
  /**
   * 更新变换
   */
  private updateTransform() {
    const elastic = this.config.dragElastic || 0
    const x = this.currentX * (1 - elastic)
    const y = this.currentY * (1 - elastic)
    
    this.element.style.transform = `translate(${x}px, ${y}px)`
  }
  
  /**
   * 应用动量
   */
  private applyMomentum() {
    const friction = 0.95
    
    const animate = () => {
      this.velocityX *= friction
      this.velocityY *= friction
      
      this.currentX += this.velocityX
      this.currentY += this.velocityY
      
      this.updateTransform()
      
      if (Math.abs(this.velocityX) > 0.1 || Math.abs(this.velocityY) > 0.1) {
        this.rafId = requestAnimationFrame(animate)
      }
    }
    
    animate()
  }
  
  /**
   * 滑动回调
   */
  private onSwipe(direction: 'up' | 'down' | 'left' | 'right') {
    // 可以通过事件或回调函数通知外部
    this.element.dispatchEvent(new CustomEvent('swipe', { 
      detail: { direction } 
    }))
  }
  
  /**
   * 销毁
   */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    // 移除事件监听器
  }
}

// 导出单例
export const animationController = new AnimationController()
export const parallaxController = new ParallaxController()