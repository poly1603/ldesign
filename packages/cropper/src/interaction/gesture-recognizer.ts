/**
 * @file 手势识别器
 * @description 识别和处理多点触控手势（缩放、旋转、平移）
 */

import type { Point } from '@/types'
import { EventHandler, PointerEventType, type PointerEventData } from './event-handler'
import { MathUtils } from '@/utils'

/**
 * 手势类型
 */
export enum GestureType {
  NONE = 'none',
  PAN = 'pan',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  MULTI = 'multi', // 多种手势组合
}

/**
 * 手势状态
 */
export enum GestureState {
  IDLE = 'idle',
  STARTED = 'started',
  CHANGED = 'changed',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

/**
 * 手势事件数据
 */
export interface GestureEventData {
  /** 手势类型 */
  type: GestureType
  /** 手势状态 */
  state: GestureState
  /** 中心点 */
  center: Point
  /** 缩放比例 */
  scale: number
  /** 旋转角度（弧度） */
  rotation: number
  /** 平移偏移 */
  translation: Point
  /** 速度 */
  velocity: Point
  /** 指针数量 */
  pointerCount: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 手势回调函数
 */
export type GestureCallback = (data: GestureEventData) => void

/**
 * 手势识别器配置
 */
export interface GestureRecognizerOptions {
  /** 是否启用平移手势 */
  enablePan: boolean
  /** 是否启用缩放手势 */
  enablePinch: boolean
  /** 是否启用旋转手势 */
  enableRotate: boolean
  /** 平移阈值 */
  panThreshold: number
  /** 缩放阈值 */
  pinchThreshold: number
  /** 旋转阈值（弧度） */
  rotateThreshold: number
  /** 最小缩放比例 */
  minScale: number
  /** 最大缩放比例 */
  maxScale: number
  /** 惯性滚动支持 */
  enableInertia: boolean
  /** 惯性系数 */
  inertiaDeceleration: number
  /** 多指触控支持 */
  enableMultitouch: boolean
  /** 边缘检测 */
  enableEdgeDetection: boolean
  /** 边缘容差 */
  edgeTolerance: number
  /** 防抖动时间（毫秒） */
  debounceTime: number
}

/**
 * 指针状态
 */
interface PointerState {
  id: number
  startPoint: Point
  currentPoint: Point
  timestamp: number
}

/**
 * 手势识别器类
 * 识别和处理多点触控手势
 */
export class GestureRecognizer {
  /** 事件处理器 */
  private eventHandler: EventHandler

  /** 配置选项 */
  private options: GestureRecognizerOptions

  /** 当前手势类型 */
  private currentGesture = GestureType.NONE

  /** 当前手势状态 */
  private currentState = GestureState.IDLE

  /** 活动指针状态 */
  private pointers = new Map<number, PointerState>()

  /** 初始手势数据 */
  private initialGestureData: Partial<GestureEventData> = {}

  /** 上一次手势数据 */
  private previousGestureData: Partial<GestureEventData> = {}

  /** 手势回调 */
  private callbacks = new Map<GestureType, Set<GestureCallback>>()

  /** 惯性滚动状态 */
  private inertiaAnimation: {
    active: boolean
    velocity: Point
    startTime: number
    rafId?: number
  } = { active: false, velocity: { x: 0, y: 0 }, startTime: 0 }
  
  /** 边缘检测状态 */
  private edgeState = {
    left: false,
    right: false,
    top: false,
    bottom: false
  }
  
  /** 防抖动定时器 */
  private debounceTimer?: NodeJS.Timeout
  
  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: GestureRecognizerOptions = {
    enablePan: true,
    enablePinch: true,
    enableRotate: true,
    panThreshold: 10,
    pinchThreshold: 0.1,
    rotateThreshold: Math.PI / 36, // 5度
    minScale: 0.1,
    maxScale: 10,
    enableInertia: true,
    inertiaDeceleration: 0.95,
    enableMultitouch: true,
    enableEdgeDetection: true,
    edgeTolerance: 20,
    debounceTime: 16, // ~60fps
  }

  /**
   * 构造函数
   * @param element 目标元素
   * @param options 配置选项
   */
  constructor(element: HTMLElement, options: Partial<GestureRecognizerOptions> = {}) {
    this.options = { ...GestureRecognizer.DEFAULT_OPTIONS, ...options }
    this.eventHandler = new EventHandler(element, {
      enableMouse: false, // 手势主要用于触摸
      enableTouch: true,
      enablePointer: true,
      preventDefault: true,
    })

    this.setupEventListeners()
  }

  /**
   * 添加手势监听器
   * @param type 手势类型
   * @param callback 回调函数
   */
  on(type: GestureType, callback: GestureCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set())
    }
    this.callbacks.get(type)!.add(callback)
  }

  /**
   * 移除手势监听器
   * @param type 手势类型
   * @param callback 回调函数
   */
  off(type: GestureType, callback: GestureCallback): void {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.callbacks.delete(type)
      }
    }
  }

  /**
   * 获取当前手势类型
   */
  getCurrentGesture(): GestureType {
    return this.currentGesture
  }

  /**
   * 获取当前手势状态
   */
  getCurrentState(): GestureState {
    return this.currentState
  }

  /**
   * 更新配置
   * @param options 新配置
   */
  updateOptions(options: Partial<GestureRecognizerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 销毁手势识别器
   */
  destroy(): void {
    this.eventHandler.destroy()
    this.callbacks.clear()
    this.stopInertia()
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.reset()
  }

  /**
   * 重置手势状态
   */
  private reset(): void {
    this.currentGesture = GestureType.NONE
    this.currentState = GestureState.IDLE
    this.pointers.clear()
    this.initialGestureData = {}
    this.previousGestureData = {}
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
    this.pointers.set(data.pointerId, {
      id: data.pointerId,
      startPoint: { ...data.point },
      currentPoint: { ...data.point },
      timestamp: data.timestamp,
    })

    this.updateGesture()
  }

  /**
   * 处理指针移动事件
   */
  private handlePointerMove = (data: PointerEventData): void => {
    const pointer = this.pointers.get(data.pointerId)
    if (!pointer) return

    pointer.currentPoint = { ...data.point }
    pointer.timestamp = data.timestamp

    this.updateGesture()
  }

  /**
   * 处理指针结束事件
   */
  private handlePointerEnd = (data: PointerEventData): void {
    const pointer = this.pointers.get(data.pointerId)
    
    // 计算惯性速度
    if (pointer && this.options.enableInertia && this.pointers.size === 1) {
      const velocity = this.calculateEnhancedVelocity([pointer])
      const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
      
      if (velocityMagnitude > 100) { // 只有速度足够大才启动惯性
        this.startInertia(velocity)
      }
    }
    
    this.pointers.delete(data.pointerId)
    this.updateGesture()

    // 如果没有活动指针，结束手势
    if (this.pointers.size === 0) {
      this.endGesture()
    }
  }

  /**
   * 处理指针取消事件
   */
  private handlePointerCancel = (data: PointerEventData): void => {
    this.pointers.delete(data.pointerId)
    this.cancelGesture()
  }

  /**
   * 更新手势识别
   */
  private updateGesture(): void {
    const pointerCount = this.pointers.size

    if (pointerCount === 0) {
      return
    }
    
    // 停止惯性滚动（如果正在进行）
    if (this.inertiaAnimation.active) {
      this.stopInertia()
    }

    // 防抖动处理
    this.debounceExecution(() => {
      // 计算当前手势数据
      const gestureData = this.calculateGestureData()
      
      // 边缘检测
      this.detectEdgeCollision(gestureData.center)

      // 识别手势类型
      const gestureType = this.recognizeGesture(gestureData)

      // 更新手势状态
      if (this.currentGesture === GestureType.NONE) {
        this.startGesture(gestureType, gestureData)
      } else if (this.currentGesture === gestureType) {
        this.changeGesture(gestureData)
      } else {
        // 手势类型改变，结束当前手势并开始新手势
        this.endGesture()
        this.startGesture(gestureType, gestureData)
      }
    })
  }

  /**
   * 计算手势数据
   */
  private calculateGestureData(): GestureEventData {
    const pointers = Array.from(this.pointers.values())
    const pointerCount = pointers.length

    // 计算中心点
    const center = this.calculateCenter(pointers)

    // 计算平移
    const translation = this.calculateTranslation(pointers)

    // 计算缩放和旋转（需要至少两个指针）
    let scale = 1
    let rotation = 0

    if (pointerCount >= 2) {
      scale = this.calculateScale(pointers)
      rotation = this.calculateRotation(pointers)
    }

    // 计算速度（使用增强版本）
    const velocity = this.calculateEnhancedVelocity(pointers)

    return {
      type: GestureType.NONE, // 将在识别阶段设置
      state: GestureState.CHANGED,
      center,
      scale,
      rotation,
      translation,
      velocity,
      pointerCount,
      timestamp: Date.now(),
    }
  }

  /**
   * 识别手势类型
   */
  private recognizeGesture(data: GestureEventData): GestureType {
    const { pointerCount, scale, rotation, translation } = data

    if (pointerCount === 1) {
      // 单指平移
      if (this.options.enablePan) {
        const distance = MathUtils.distance({ x: 0, y: 0 }, translation)
        if (distance > this.options.panThreshold) {
          return GestureType.PAN
        }
      }
    } else if (pointerCount >= 2) {
      // 多指手势
      const scaleChange = Math.abs(scale - 1)
      const rotationChange = Math.abs(rotation)

      let hasScale = false
      let hasRotation = false

      if (this.options.enablePinch && scaleChange > this.options.pinchThreshold) {
        hasScale = true
      }

      if (this.options.enableRotate && rotationChange > this.options.rotateThreshold) {
        hasRotation = true
      }

      if (hasScale && hasRotation) {
        return GestureType.MULTI
      } else if (hasScale) {
        return GestureType.PINCH
      } else if (hasRotation) {
        return GestureType.ROTATE
      } else if (this.options.enablePan) {
        return GestureType.PAN
      }
    }

    return GestureType.NONE
  }

  /**
   * 开始手势
   */
  private startGesture(type: GestureType, data: GestureEventData): void {
    this.currentGesture = type
    this.currentState = GestureState.STARTED
    this.initialGestureData = { ...data }
    this.previousGestureData = { ...data }

    data.type = type
    data.state = GestureState.STARTED

    this.emit(type, data)
  }

  /**
   * 改变手势
   */
  private changeGesture(data: GestureEventData): void {
    this.currentState = GestureState.CHANGED
    this.previousGestureData = { ...data }

    data.type = this.currentGesture
    data.state = GestureState.CHANGED

    this.emit(this.currentGesture, data)
  }

  /**
   * 结束手势
   */
  private endGesture(): void {
    if (this.currentGesture !== GestureType.NONE) {
      const data: GestureEventData = {
        ...this.previousGestureData,
        type: this.currentGesture,
        state: GestureState.ENDED,
        timestamp: Date.now(),
      } as GestureEventData

      this.emit(this.currentGesture, data)
    }

    this.reset()
  }

  /**
   * 取消手势
   */
  private cancelGesture(): void {
    if (this.currentGesture !== GestureType.NONE) {
      const data: GestureEventData = {
        ...this.previousGestureData,
        type: this.currentGesture,
        state: GestureState.CANCELLED,
        timestamp: Date.now(),
      } as GestureEventData

      this.emit(this.currentGesture, data)
    }

    this.reset()
  }

  /**
   * 计算中心点
   */
  private calculateCenter(pointers: PointerState[]): Point {
    if (pointers.length === 0) return { x: 0, y: 0 }

    const sum = pointers.reduce(
      (acc, pointer) => ({
        x: acc.x + pointer.currentPoint.x,
        y: acc.y + pointer.currentPoint.y,
      }),
      { x: 0, y: 0 },
    )

    return {
      x: sum.x / pointers.length,
      y: sum.y / pointers.length,
    }
  }

  /**
   * 计算平移
   */
  private calculateTranslation(pointers: PointerState[]): Point {
    if (pointers.length === 0) return { x: 0, y: 0 }

    const currentCenter = this.calculateCenter(pointers)
    const startCenter = this.calculateStartCenter(pointers)

    return {
      x: currentCenter.x - startCenter.x,
      y: currentCenter.y - startCenter.y,
    }
  }

  /**
   * 计算起始中心点
   */
  private calculateStartCenter(pointers: PointerState[]): Point {
    if (pointers.length === 0) return { x: 0, y: 0 }

    const sum = pointers.reduce(
      (acc, pointer) => ({
        x: acc.x + pointer.startPoint.x,
        y: acc.y + pointer.startPoint.y,
      }),
      { x: 0, y: 0 },
    )

    return {
      x: sum.x / pointers.length,
      y: sum.y / pointers.length,
    }
  }

  /**
   * 计算缩放比例
   */
  private calculateScale(pointers: PointerState[]): number {
    if (pointers.length < 2) return 1

    const currentDistance = MathUtils.distance(
      pointers[0].currentPoint,
      pointers[1].currentPoint,
    )
    const startDistance = MathUtils.distance(
      pointers[0].startPoint,
      pointers[1].startPoint,
    )

    if (startDistance === 0) return 1

    const scale = currentDistance / startDistance
    return MathUtils.clamp(scale, this.options.minScale, this.options.maxScale)
  }

  /**
   * 计算旋转角度
   */
  private calculateRotation(pointers: PointerState[]): number {
    if (pointers.length < 2) return 0

    const currentAngle = Math.atan2(
      pointers[1].currentPoint.y - pointers[0].currentPoint.y,
      pointers[1].currentPoint.x - pointers[0].currentPoint.x,
    )
    const startAngle = Math.atan2(
      pointers[1].startPoint.y - pointers[0].startPoint.y,
      pointers[1].startPoint.x - pointers[0].startPoint.x,
    )

    return currentAngle - startAngle
  }

  /**
   * 计算速度
   */
  private calculateVelocity(pointers: PointerState[]): Point {
    if (pointers.length === 0) return { x: 0, y: 0 }

    // 简化实现：基于第一个指针计算速度
    const pointer = pointers[0]
    const timeDelta = Date.now() - pointer.timestamp

    if (timeDelta === 0) return { x: 0, y: 0 }

    const distance = {
      x: pointer.currentPoint.x - pointer.startPoint.x,
      y: pointer.currentPoint.y - pointer.startPoint.y,
    }

    return {
      x: distance.x / timeDelta * 1000, // 像素/秒
      y: distance.y / timeDelta * 1000,
    }
  }

  /**
   * 启动惯性滚动
   */
  private startInertia(velocity: Point): void {
    if (!this.options.enableInertia) return
    
    this.inertiaAnimation.active = true
    this.inertiaAnimation.velocity = { ...velocity }
    this.inertiaAnimation.startTime = performance.now()
    
    const animate = (currentTime: number) => {
      if (!this.inertiaAnimation.active) return
      
      const deltaTime = (currentTime - this.inertiaAnimation.startTime) / 1000
      
      // 应用减速
      this.inertiaAnimation.velocity.x *= this.options.inertiaDeceleration
      this.inertiaAnimation.velocity.y *= this.options.inertiaDeceleration
      
      // 检查是否停止
      const minVelocity = 1
      if (Math.abs(this.inertiaAnimation.velocity.x) < minVelocity && 
          Math.abs(this.inertiaAnimation.velocity.y) < minVelocity) {
        this.stopInertia()
        return
      }
      
      // 发送惯性事件
      const inertiaData: GestureEventData = {
        type: GestureType.PAN,
        state: GestureState.CHANGED,
        center: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
        translation: {
          x: this.inertiaAnimation.velocity.x * deltaTime,
          y: this.inertiaAnimation.velocity.y * deltaTime
        },
        velocity: this.inertiaAnimation.velocity,
        pointerCount: 0,
        timestamp: currentTime
      }
      
      this.emit(GestureType.PAN, inertiaData)
      
      this.inertiaAnimation.rafId = requestAnimationFrame(animate)
    }
    
    this.inertiaAnimation.rafId = requestAnimationFrame(animate)
  }
  
  /**
   * 停止惯性滚动
   */
  private stopInertia(): void {
    this.inertiaAnimation.active = false
    if (this.inertiaAnimation.rafId) {
      cancelAnimationFrame(this.inertiaAnimation.rafId)
      this.inertiaAnimation.rafId = undefined
    }
  }
  
  /**
   * 检测边缘碰撞
   */
  private detectEdgeCollision(center: Point, containerRect?: DOMRect): void {
    if (!this.options.enableEdgeDetection) return
    
    const tolerance = this.options.edgeTolerance
    const rect = containerRect || this.eventHandler.getElement().getBoundingClientRect()
    
    this.edgeState.left = center.x <= tolerance
    this.edgeState.right = center.x >= rect.width - tolerance
    this.edgeState.top = center.y <= tolerance
    this.edgeState.bottom = center.y >= rect.height - tolerance
    
    // 发送边缘事件
    if (this.edgeState.left || this.edgeState.right || this.edgeState.top || this.edgeState.bottom) {
      this.emit(GestureType.PAN, {
        type: GestureType.PAN,
        state: GestureState.CHANGED,
        center,
        scale: 1,
        rotation: 0,
        translation: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        pointerCount: 1,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 防抖动执行
   */
  private debounceExecution(callback: () => void): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    this.debounceTimer = setTimeout(() => {
      callback()
      this.debounceTimer = undefined
    }, this.options.debounceTime)
  }
  
  /**
   * 增强的速度计算
   */
  private calculateEnhancedVelocity(pointers: PointerState[]): Point {
    if (pointers.length === 0) return { x: 0, y: 0 }
    
    // 使用最近的多个点来计算更精确的速度
    const pointer = pointers[0]
    const currentTime = Date.now()
    const timeDelta = currentTime - pointer.timestamp
    
    if (timeDelta === 0 || timeDelta > 100) return { x: 0, y: 0 } // 避免时间太长或太短
    
    const distance = {
      x: pointer.currentPoint.x - pointer.startPoint.x,
      y: pointer.currentPoint.y - pointer.startPoint.y
    }
    
    return {
      x: distance.x / timeDelta * 1000, // 像素/秒
      y: distance.y / timeDelta * 1000
    }
  }
  
  /**
   * 获取设备信息
   */
  private getDeviceInfo(): {
    isTouchDevice: boolean
    supportsMultitouch: boolean
    maxTouchPoints: number
  } {
    return {
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      supportsMultitouch: navigator.maxTouchPoints > 1,
      maxTouchPoints: navigator.maxTouchPoints || 0
    }
  }

  /**
   * 触发手势事件
   */
  private emit(type: GestureType, data: GestureEventData): void {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in gesture callback:', error)
        }
      })
    }
  }
}
