/**
 * @file 事件处理器
 * @description 处理鼠标、触摸和键盘事件的统一接口
 */

import type { Point } from '@/types'

/**
 * 指针事件类型
 */
export enum PointerEventType {
  START = 'start',
  MOVE = 'move',
  END = 'end',
  CANCEL = 'cancel',
}

/**
 * 指针事件数据
 */
export interface PointerEventData {
  /** 事件类型 */
  type: PointerEventType
  /** 指针位置 */
  point: Point
  /** 指针ID（用于多点触控） */
  pointerId: number
  /** 是否为主指针 */
  isPrimary: boolean
  /** 压力值（0-1） */
  pressure: number
  /** 原始事件对象 */
  originalEvent: MouseEvent | TouchEvent | PointerEvent
  /** 时间戳 */
  timestamp: number
  /** 修饰键状态 */
  modifiers: {
    ctrl: boolean
    shift: boolean
    alt: boolean
    meta: boolean
  }
}

/**
 * 事件处理器回调函数
 */
export type EventHandlerCallback = (data: PointerEventData) => void

/**
 * 事件处理器配置
 */
export interface EventHandlerOptions {
  /** 是否启用鼠标事件 */
  enableMouse: boolean
  /** 是否启用触摸事件 */
  enableTouch: boolean
  /** 是否启用指针事件 */
  enablePointer: boolean
  /** 是否阻止默认行为 */
  preventDefault: boolean
  /** 是否阻止事件冒泡 */
  stopPropagation: boolean
  /** 是否启用被动监听 */
  passive: boolean
}

/**
 * 事件处理器类
 * 统一处理鼠标、触摸和指针事件
 */
export class EventHandler {
  /** 目标元素 */
  private element: HTMLElement

  /** 配置选项 */
  private options: EventHandlerOptions

  /** 事件回调映射 */
  private callbacks = new Map<PointerEventType, Set<EventHandlerCallback>>()

  /** 当前活动的指针 */
  private activePointers = new Map<number, PointerEventData>()

  /** 是否已绑定事件 */
  private bound = false

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: EventHandlerOptions = {
    enableMouse: true,
    enableTouch: true,
    enablePointer: true,
    preventDefault: true,
    stopPropagation: false,
    passive: false,
  }

  /**
   * 构造函数
   * @param element 目标元素
   * @param options 配置选项
   */
  constructor(element: HTMLElement, options: Partial<EventHandlerOptions> = {}) {
    this.element = element
    this.options = { ...EventHandler.DEFAULT_OPTIONS, ...options }
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param callback 回调函数
   */
  on(type: PointerEventType, callback: EventHandlerCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set())
    }
    this.callbacks.get(type)!.add(callback)

    // 首次添加监听器时绑定事件
    if (!this.bound) {
      this.bindEvents()
    }
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param callback 回调函数
   */
  off(type: PointerEventType, callback: EventHandlerCallback): void {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.callbacks.delete(type)
      }
    }

    // 没有监听器时解绑事件
    if (this.callbacks.size === 0 && this.bound) {
      this.unbindEvents()
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    this.callbacks.clear()
    if (this.bound) {
      this.unbindEvents()
    }
  }

  /**
   * 获取当前活动的指针数量
   */
  getActivePointerCount(): number {
    return this.activePointers.size
  }

  /**
   * 获取指定指针的数据
   * @param pointerId 指针ID
   */
  getPointerData(pointerId: number): PointerEventData | undefined {
    return this.activePointers.get(pointerId)
  }

  /**
   * 获取所有活动指针的数据
   */
  getAllPointerData(): PointerEventData[] {
    return Array.from(this.activePointers.values())
  }

  /**
   * 销毁事件处理器
   */
  destroy(): void {
    this.removeAllListeners()
    this.activePointers.clear()
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents(): void {
    if (this.bound) return

    const options = {
      passive: this.options.passive,
      capture: false,
    }

    // 优先使用 Pointer Events API
    if (this.options.enablePointer && 'onpointerdown' in window) {
      this.element.addEventListener('pointerdown', this.handlePointerDown, options)
      this.element.addEventListener('pointermove', this.handlePointerMove, options)
      this.element.addEventListener('pointerup', this.handlePointerUp, options)
      this.element.addEventListener('pointercancel', this.handlePointerCancel, options)
    } else {
      // 回退到鼠标和触摸事件
      if (this.options.enableMouse) {
        this.element.addEventListener('mousedown', this.handleMouseDown, options)
        document.addEventListener('mousemove', this.handleMouseMove, options)
        document.addEventListener('mouseup', this.handleMouseUp, options)
      }

      if (this.options.enableTouch) {
        this.element.addEventListener('touchstart', this.handleTouchStart, options)
        this.element.addEventListener('touchmove', this.handleTouchMove, options)
        this.element.addEventListener('touchend', this.handleTouchEnd, options)
        this.element.addEventListener('touchcancel', this.handleTouchCancel, options)
      }
    }

    this.bound = true
  }

  /**
   * 解绑事件监听器
   */
  private unbindEvents(): void {
    if (!this.bound) return

    // 移除 Pointer Events
    this.element.removeEventListener('pointerdown', this.handlePointerDown)
    this.element.removeEventListener('pointermove', this.handlePointerMove)
    this.element.removeEventListener('pointerup', this.handlePointerUp)
    this.element.removeEventListener('pointercancel', this.handlePointerCancel)

    // 移除鼠标事件
    this.element.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)

    // 移除触摸事件
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
    this.element.removeEventListener('touchcancel', this.handleTouchCancel)

    this.bound = false
  }

  /**
   * 处理指针按下事件
   */
  private handlePointerDown = (event: PointerEvent): void => {
    this.processEvent(event, PointerEventType.START)
  }

  /**
   * 处理指针移动事件
   */
  private handlePointerMove = (event: PointerEvent): void => {
    if (this.activePointers.has(event.pointerId)) {
      this.processEvent(event, PointerEventType.MOVE)
    }
  }

  /**
   * 处理指针抬起事件
   */
  private handlePointerUp = (event: PointerEvent): void => {
    this.processEvent(event, PointerEventType.END)
  }

  /**
   * 处理指针取消事件
   */
  private handlePointerCancel = (event: PointerEvent): void => {
    this.processEvent(event, PointerEventType.CANCEL)
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown = (event: MouseEvent): void => {
    this.processEvent(event, PointerEventType.START)
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (this.activePointers.has(0)) {
      this.processEvent(event, PointerEventType.MOVE)
    }
  }

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp = (event: MouseEvent): void => {
    this.processEvent(event, PointerEventType.END)
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart = (event: TouchEvent): void => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      this.processTouchEvent(event, touch, PointerEventType.START)
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove = (event: TouchEvent): void => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      if (this.activePointers.has(touch.identifier)) {
        this.processTouchEvent(event, touch, PointerEventType.MOVE)
      }
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      this.processTouchEvent(event, touch, PointerEventType.END)
    }
  }

  /**
   * 处理触摸取消事件
   */
  private handleTouchCancel = (event: TouchEvent): void => {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      this.processTouchEvent(event, touch, PointerEventType.CANCEL)
    }
  }

  /**
   * 处理事件
   * @param event 原始事件
   * @param type 事件类型
   */
  private processEvent(
    event: MouseEvent | PointerEvent,
    type: PointerEventType,
  ): void {
    const pointerId = 'pointerId' in event ? event.pointerId : 0
    const rect = this.element.getBoundingClientRect()

    const data: PointerEventData = {
      type,
      point: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      pointerId,
      isPrimary: 'isPrimary' in event ? event.isPrimary : true,
      pressure: 'pressure' in event ? event.pressure : 1,
      originalEvent: event,
      timestamp: Date.now(),
      modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey,
      },
    }

    this.handlePointerEvent(data)
  }

  /**
   * 处理触摸事件
   * @param event 触摸事件
   * @param touch 触摸点
   * @param type 事件类型
   */
  private processTouchEvent(
    event: TouchEvent,
    touch: Touch,
    type: PointerEventType,
  ): void {
    const rect = this.element.getBoundingClientRect()

    const data: PointerEventData = {
      type,
      point: {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      },
      pointerId: touch.identifier,
      isPrimary: touch.identifier === 0,
      pressure: 'force' in touch ? (touch as any).force : 1,
      originalEvent: event,
      timestamp: Date.now(),
      modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey,
      },
    }

    this.handlePointerEvent(data)
  }

  /**
   * 处理指针事件数据
   * @param data 事件数据
   */
  private handlePointerEvent(data: PointerEventData): void {
    // 处理事件前后的状态管理
    if (data.type === PointerEventType.START) {
      this.activePointers.set(data.pointerId, data)
    } else if (data.type === PointerEventType.END || data.type === PointerEventType.CANCEL) {
      this.activePointers.delete(data.pointerId)
    } else if (data.type === PointerEventType.MOVE) {
      this.activePointers.set(data.pointerId, data)
    }

    // 处理事件选项
    if (this.options.preventDefault) {
      data.originalEvent.preventDefault()
    }
    if (this.options.stopPropagation) {
      data.originalEvent.stopPropagation()
    }

    // 触发回调
    this.emit(data.type, data)
  }

  /**
   * 触发事件回调
   * @param type 事件类型
   * @param data 事件数据
   */
  private emit(type: PointerEventType, data: PointerEventData): void {
    const callbacks = this.callbacks.get(type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event handler callback:', error)
        }
      })
    }
  }
}
