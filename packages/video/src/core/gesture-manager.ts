/**
 * 手势管理器
 * 负责触摸手势的识别和处理
 */

import { EventEmitter } from '../utils/events'
import { throttle, debounce } from '../utils/events'
import type { IVideoPlayer } from '../types/player'

/**
 * 手势类型
 */
export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'doubleTap',
  LONG_PRESS = 'longPress',
  SWIPE_LEFT = 'swipeLeft',
  SWIPE_RIGHT = 'swipeRight',
  SWIPE_UP = 'swipeUp',
  SWIPE_DOWN = 'swipeDown',
  PINCH_IN = 'pinchIn',
  PINCH_OUT = 'pinchOut',
  VOLUME_SWIPE = 'volumeSwipe',
  BRIGHTNESS_SWIPE = 'brightnessSwipe',
  PROGRESS_SWIPE = 'progressSwipe'
}

/**
 * 手势事件数据
 */
export interface GestureEvent {
  type: GestureType
  startX: number
  startY: number
  endX: number
  endY: number
  deltaX: number
  deltaY: number
  distance: number
  duration: number
  velocity: number
  scale?: number
  originalEvent: TouchEvent
}

/**
 * 手势绑定配置
 */
export interface GestureBinding {
  /** 手势类型 */
  type: GestureType
  /** 手势描述 */
  description: string
  /** 手势处理函数 */
  handler: (event: GestureEvent, player: IVideoPlayer) => void | Promise<void>
  /** 是否启用 */
  enabled?: boolean
  /** 手势区域限制 */
  area?: 'left' | 'right' | 'center' | 'full'
  /** 最小距离阈值 */
  minDistance?: number
  /** 最小速度阈值 */
  minVelocity?: number
}

/**
 * 手势配置
 */
export interface GestureConfig {
  /** 是否启用手势 */
  enabled?: boolean
  /** 手势绑定 */
  bindings?: Record<string, GestureBinding>
  /** 手势识别阈值 */
  thresholds?: {
    /** 点击最大移动距离 */
    tapMaxDistance?: number
    /** 双击最大间隔时间 */
    doubleTapMaxDelay?: number
    /** 长按最小时间 */
    longPressMinTime?: number
    /** 滑动最小距离 */
    swipeMinDistance?: number
    /** 滑动最小速度 */
    swipeMinVelocity?: number
    /** 缩放最小比例变化 */
    pinchMinScale?: number
  }
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

/**
 * 触摸点信息
 */
interface TouchPoint {
  id: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
}

/**
 * 手势管理器实现
 */
export class GestureManager extends EventEmitter {
  private _player: IVideoPlayer
  private _config: GestureConfig
  private _container: HTMLElement
  private _bindings = new Map<GestureType, GestureBinding>()
  private _enabled = true
  private _touches = new Map<number, TouchPoint>()
  private _lastTapTime = 0
  private _lastTapPosition = { x: 0, y: 0 }
  private _longPressTimer?: NodeJS.Timeout
  private _isLongPress = false

  constructor(player: IVideoPlayer, config: GestureConfig = {}) {
    super()
    
    this._player = player
    this._container = player.container
    this._config = {
      enabled: true,
      preventDefault: true,
      thresholds: {
        tapMaxDistance: 10,
        doubleTapMaxDelay: 300,
        longPressMinTime: 500,
        swipeMinDistance: 30,
        swipeMinVelocity: 0.3,
        pinchMinScale: 0.1
      },
      ...config
    }

    this.setupDefaultBindings()
    this.bindEvents()
  }

  /**
   * 手势配置
   */
  get config(): GestureConfig {
    return { ...this._config }
  }

  /**
   * 是否启用
   */
  get enabled(): boolean {
    return this._enabled
  }

  /**
   * 所有手势绑定
   */
  get bindings(): Map<GestureType, GestureBinding> {
    return new Map(this._bindings)
  }

  /**
   * 注册手势
   */
  register(type: GestureType, binding: GestureBinding): void {
    this._bindings.set(type, {
      enabled: true,
      area: 'full',
      ...binding
    })

    this.emit('registered', { type, binding })
  }

  /**
   * 批量注册手势
   */
  registerMultiple(bindings: Record<GestureType, GestureBinding>): void {
    Object.entries(bindings).forEach(([type, binding]) => {
      this.register(type as GestureType, binding)
    })
  }

  /**
   * 移除手势
   */
  unregister(type: GestureType): void {
    const binding = this._bindings.get(type)
    
    if (binding) {
      this._bindings.delete(type)
      this.emit('unregistered', { type, binding })
    }
  }

  /**
   * 启用手势
   */
  enable(type?: GestureType): void {
    if (type) {
      const binding = this._bindings.get(type)
      if (binding) {
        binding.enabled = true
        this.emit('enabled', { type })
      }
    } else {
      this._enabled = true
      this.emit('enabled', { global: true })
    }
  }

  /**
   * 禁用手势
   */
  disable(type?: GestureType): void {
    if (type) {
      const binding = this._bindings.get(type)
      if (binding) {
        binding.enabled = false
        this.emit('disabled', { type })
      }
    } else {
      this._enabled = false
      this.emit('disabled', { global: true })
    }
  }

  /**
   * 销毁手势管理器
   */
  destroy(): void {
    this.unbindEvents()
    this._bindings.clear()
    this._touches.clear()
    this.clearLongPressTimer()
    this.removeAllListeners()
  }

  /**
   * 设置默认手势绑定
   */
  private setupDefaultBindings(): void {
    const defaultBindings: Record<GestureType, GestureBinding> = {
      [GestureType.TAP]: {
        type: GestureType.TAP,
        description: '单击播放/暂停',
        handler: () => this._player.toggle()
      },
      [GestureType.DOUBLE_TAP]: {
        type: GestureType.DOUBLE_TAP,
        description: '双击全屏切换',
        handler: () => this._player.toggleFullscreen()
      },
      [GestureType.SWIPE_LEFT]: {
        type: GestureType.SWIPE_LEFT,
        description: '左滑快退',
        handler: () => {
          const currentTime = this._player.status.currentTime
          this._player.seek(Math.max(0, currentTime - 10))
        }
      },
      [GestureType.SWIPE_RIGHT]: {
        type: GestureType.SWIPE_RIGHT,
        description: '右滑快进',
        handler: () => {
          const currentTime = this._player.status.currentTime
          const duration = this._player.status.duration
          this._player.seek(Math.min(duration, currentTime + 10))
        }
      },
      [GestureType.VOLUME_SWIPE]: {
        type: GestureType.VOLUME_SWIPE,
        description: '右侧上下滑动调节音量',
        area: 'right',
        handler: (event) => {
          const volume = this._player.status.volume
          const delta = -event.deltaY / this._container.clientHeight
          const newVolume = Math.max(0, Math.min(1, volume + delta))
          this._player.setVolume(newVolume)
        }
      },
      [GestureType.BRIGHTNESS_SWIPE]: {
        type: GestureType.BRIGHTNESS_SWIPE,
        description: '左侧上下滑动调节亮度',
        area: 'left',
        handler: (event) => {
          // 亮度调节需要浏览器支持或通过滤镜实现
          const delta = -event.deltaY / this._container.clientHeight
          this.adjustBrightness(delta)
        }
      },
      [GestureType.PROGRESS_SWIPE]: {
        type: GestureType.PROGRESS_SWIPE,
        description: '中间左右滑动调节进度',
        area: 'center',
        handler: (event) => {
          const duration = this._player.status.duration
          const delta = event.deltaX / this._container.clientWidth
          const currentTime = this._player.status.currentTime
          const newTime = Math.max(0, Math.min(duration, currentTime + delta * duration))
          this._player.seek(newTime)
        }
      }
    }

    // 注册默认手势
    if (this._config.bindings) {
      this.registerMultiple({ ...defaultBindings, ...this._config.bindings })
    } else {
      this.registerMultiple(defaultBindings)
    }
  }

  /**
   * 绑定触摸事件
   */
  private bindEvents(): void {
    this._container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this._container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this._container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this._container.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
  }

  /**
   * 解绑触摸事件
   */
  private unbindEvents(): void {
    this._container.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this._container.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this._container.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this._container.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this._enabled || !this._config.enabled) return

    if (this._config.preventDefault) {
      event.preventDefault()
    }

    const now = Date.now()
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint: TouchPoint = {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: now
      }
      
      this._touches.set(touch.identifier, touchPoint)
    })

    // 设置长按定时器
    if (this._touches.size === 1) {
      this._isLongPress = false
      this._longPressTimer = setTimeout(() => {
        this._isLongPress = true
        this.triggerGesture(GestureType.LONG_PRESS, event)
      }, this._config.thresholds!.longPressMinTime!)
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this._enabled || !this._config.enabled) return

    if (this._config.preventDefault) {
      event.preventDefault()
    }

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = this._touches.get(touch.identifier)
      if (touchPoint) {
        touchPoint.currentX = touch.clientX
        touchPoint.currentY = touch.clientY
      }
    })

    // 如果有移动，取消长按
    if (this._touches.size === 1) {
      const touch = Array.from(this._touches.values())[0]
      const distance = this.calculateDistance(
        touch.startX, touch.startY,
        touch.currentX, touch.currentY
      )
      
      if (distance > this._config.thresholds!.tapMaxDistance!) {
        this.clearLongPressTimer()
      }
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this._enabled || !this._config.enabled) return

    if (this._config.preventDefault) {
      event.preventDefault()
    }

    const now = Date.now()

    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = this._touches.get(touch.identifier)
      if (!touchPoint) return

      const duration = now - touchPoint.startTime
      const distance = this.calculateDistance(
        touchPoint.startX, touchPoint.startY,
        touchPoint.currentX, touchPoint.currentY
      )
      const deltaX = touchPoint.currentX - touchPoint.startX
      const deltaY = touchPoint.currentY - touchPoint.startY
      const velocity = distance / duration

      // 判断手势类型
      if (!this._isLongPress) {
        if (distance <= this._config.thresholds!.tapMaxDistance!) {
          // 点击手势
          this.handleTapGesture(touchPoint, now, event)
        } else if (distance >= this._config.thresholds!.swipeMinDistance! && 
                   velocity >= this._config.thresholds!.swipeMinVelocity!) {
          // 滑动手势
          this.handleSwipeGesture(touchPoint, deltaX, deltaY, event)
        }
      }

      this._touches.delete(touch.identifier)
    })

    this.clearLongPressTimer()
  }

  /**
   * 处理触摸取消事件
   */
  private handleTouchCancel(event: TouchEvent): void {
    Array.from(event.changedTouches).forEach(touch => {
      this._touches.delete(touch.identifier)
    })
    
    this.clearLongPressTimer()
  }

  /**
   * 处理点击手势
   */
  private handleTapGesture(touchPoint: TouchPoint, now: number, event: TouchEvent): void {
    const timeSinceLastTap = now - this._lastTapTime
    const distanceFromLastTap = this.calculateDistance(
      touchPoint.startX, touchPoint.startY,
      this._lastTapPosition.x, this._lastTapPosition.y
    )

    if (timeSinceLastTap <= this._config.thresholds!.doubleTapMaxDelay! &&
        distanceFromLastTap <= this._config.thresholds!.tapMaxDistance!) {
      // 双击
      this.triggerGesture(GestureType.DOUBLE_TAP, event)
      this._lastTapTime = 0 // 重置以避免三击
    } else {
      // 单击
      this.triggerGesture(GestureType.TAP, event)
      this._lastTapTime = now
      this._lastTapPosition = { x: touchPoint.startX, y: touchPoint.startY }
    }
  }

  /**
   * 处理滑动手势
   */
  private handleSwipeGesture(touchPoint: TouchPoint, deltaX: number, deltaY: number, event: TouchEvent): void {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    // 确定滑动区域
    const area = this.getGestureArea(touchPoint.startX)
    
    if (absX > absY) {
      // 水平滑动
      if (area === 'center') {
        this.triggerGesture(GestureType.PROGRESS_SWIPE, event)
      } else {
        const gestureType = deltaX > 0 ? GestureType.SWIPE_RIGHT : GestureType.SWIPE_LEFT
        this.triggerGesture(gestureType, event)
      }
    } else {
      // 垂直滑动
      if (area === 'left') {
        this.triggerGesture(GestureType.BRIGHTNESS_SWIPE, event)
      } else if (area === 'right') {
        this.triggerGesture(GestureType.VOLUME_SWIPE, event)
      } else {
        const gestureType = deltaY > 0 ? GestureType.SWIPE_DOWN : GestureType.SWIPE_UP
        this.triggerGesture(gestureType, event)
      }
    }
  }

  /**
   * 触发手势
   */
  private triggerGesture(type: GestureType, event: TouchEvent): void {
    const binding = this._bindings.get(type)
    if (!binding || !binding.enabled) return

    const touch = event.changedTouches[0]
    const touchPoint = this._touches.get(touch.identifier)
    
    if (!touchPoint) return

    const gestureEvent: GestureEvent = {
      type,
      startX: touchPoint.startX,
      startY: touchPoint.startY,
      endX: touchPoint.currentX,
      endY: touchPoint.currentY,
      deltaX: touchPoint.currentX - touchPoint.startX,
      deltaY: touchPoint.currentY - touchPoint.startY,
      distance: this.calculateDistance(
        touchPoint.startX, touchPoint.startY,
        touchPoint.currentX, touchPoint.currentY
      ),
      duration: Date.now() - touchPoint.startTime,
      velocity: 0,
      originalEvent: event
    }

    gestureEvent.velocity = gestureEvent.distance / gestureEvent.duration

    try {
      const result = binding.handler(gestureEvent, this._player)
      if (result instanceof Promise) {
        result.catch(error => {
          this.emit('error', { type, error })
        })
      }
      
      this.emit('triggered', { type, binding, event: gestureEvent })
    } catch (error) {
      this.emit('error', { type, error })
    }
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  /**
   * 获取手势区域
   */
  private getGestureArea(x: number): 'left' | 'center' | 'right' {
    const width = this._container.clientWidth
    const leftThird = width / 3
    const rightThird = width * 2 / 3
    
    if (x < leftThird) return 'left'
    if (x > rightThird) return 'right'
    return 'center'
  }

  /**
   * 清除长按定时器
   */
  private clearLongPressTimer(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer)
      this._longPressTimer = undefined
    }
  }

  /**
   * 调节亮度（通过CSS滤镜实现）
   */
  private adjustBrightness(delta: number): void {
    const video = this._player.videoElement
    const currentFilter = video.style.filter || ''
    
    // 解析当前亮度值
    const brightnessMatch = currentFilter.match(/brightness\(([^)]+)\)/)
    let currentBrightness = brightnessMatch ? parseFloat(brightnessMatch[1]) : 1
    
    // 调整亮度
    const newBrightness = Math.max(0.1, Math.min(2, currentBrightness + delta))
    
    // 应用新的滤镜
    const newFilter = currentFilter.replace(/brightness\([^)]+\)/, '') + ` brightness(${newBrightness})`
    video.style.filter = newFilter.trim()
    
    this.emit('brightnessChanged', { brightness: newBrightness })
  }
}
