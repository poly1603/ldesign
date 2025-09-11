/**
 * 事件管理器
 *
 * 统一管理图表的交互事件，提供事件注册、注销和触发功能
 */

import type { ECharts } from 'echarts'
import type { ChartEventType, EventHandler } from '../core/types'
import { CHART_EVENT_TYPES, MOUSE_EVENT_TYPES, INTERACTION_EVENT_TYPES } from '../core/constants'
import { debounce, throttle } from '../utils/helpers'

/**
 * 基础事件发射器
 */
export class EventEmitter {
  private _listeners: Map<string, Function[]> = new Map()

  /**
   * 监听事件
   * @param event - 事件名称
   * @param listener - 监听器
   */
  on(event: string, listener: Function): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, [])
    }
    this._listeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   * @param event - 事件名称
   * @param listener - 监听器
   */
  off(event: string, listener?: Function): void {
    if (!this._listeners.has(event)) return

    if (listener) {
      const listeners = this._listeners.get(event)!
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    } else {
      this._listeners.delete(event)
    }
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param args - 参数
   */
  emit(event: string, ...args: any[]): void {
    const listeners = this._listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`事件监听器执行错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 一次性监听事件
   * @param event - 事件名称
   * @param listener - 监听器
   */
  once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      listener(...args)
      this.off(event, onceListener)
    }
    this.on(event, onceListener)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this._listeners.clear()
  }
}

/**
 * 事件监听器信息
 */
interface EventListener {
  /** 事件类型 */
  type: ChartEventType
  /** 处理函数 */
  handler: EventHandler
  /** 原始处理函数（用于移除监听器） */
  originalHandler: EventHandler
  /** 是否只执行一次 */
  once?: boolean
  /** 防抖延迟 */
  debounce?: number
  /** 节流延迟 */
  throttle?: number
}

/**
 * 事件管理器类
 * 
 * 提供统一的事件管理接口，支持防抖、节流、一次性监听等功能
 */
export class EventManager {
  /** ECharts 实例 */
  private _echarts: ECharts | null = null

  /** 事件监听器列表 */
  private _listeners: Map<string, EventListener[]> = new Map()

  /** 事件 ID 计数器 */
  private _eventIdCounter = 0

  /**
   * 设置 ECharts 实例
   * @param echarts - ECharts 实例
   */
  setECharts(echarts: ECharts): void {
    // 如果已有实例，先清理旧的监听器
    if (this._echarts) {
      this._removeAllEChartsListeners()
    }

    this._echarts = echarts

    // 重新注册所有监听器
    this._reregisterAllListeners()
  }

  /**
   * 注册事件监听器
   * @param eventType - 事件类型
   * @param handler - 事件处理函数
   * @param options - 监听器选项
   * @returns 监听器 ID
   */
  on(
    eventType: ChartEventType,
    handler: EventHandler,
    options: EventListenerOptions = {}
  ): string {
    this._validateEventType(eventType)

    const listenerId = this._generateListenerId()
    const listener = this._createListener(eventType, handler, options)

    // 添加到监听器列表
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, [])
    }
    this._listeners.get(eventType)!.push(listener)

    // 注册到 ECharts
    if (this._echarts) {
      this._registerEChartsListener(listener)
    }

    return listenerId
  }

  /**
   * 注册一次性事件监听器
   * @param eventType - 事件类型
   * @param handler - 事件处理函数
   * @param options - 监听器选项
   * @returns 监听器 ID
   */
  once(
    eventType: ChartEventType,
    handler: EventHandler,
    options: EventListenerOptions = {}
  ): string {
    return this.on(eventType, handler, { ...options, once: true })
  }

  /**
   * 移除事件监听器
   * @param eventType - 事件类型
   * @param handler - 事件处理函数（可选）
   */
  off(eventType?: ChartEventType, handler?: EventHandler): void {
    if (!eventType) {
      // 移除所有监听器
      this._removeAllListeners()
      return
    }

    const listeners = this._listeners.get(eventType)
    if (!listeners) return

    if (!handler) {
      // 移除指定事件类型的所有监听器
      this._removeEventTypeListeners(eventType)
      return
    }

    // 移除指定的监听器
    const index = listeners.findIndex(l => l.originalHandler === handler)
    if (index !== -1) {
      const listener = listeners[index]
      this._removeEChartsListener(listener)
      listeners.splice(index, 1)

      if (listeners.length === 0) {
        this._listeners.delete(eventType)
      }
    }
  }

  /**
   * 触发事件
   * @param eventType - 事件类型
   * @param params - 事件参数
   */
  emit(eventType: ChartEventType, params: any): void {
    const listeners = this._listeners.get(eventType)
    if (!listeners) return

    // 创建事件对象
    const event = {
      type: eventType,
      target: this._echarts,
      params,
      timestamp: Date.now(),
    }

    // 执行监听器
    for (let i = listeners.length - 1; i >= 0; i--) {
      const listener = listeners[i]

      try {
        listener.handler(event)

        // 如果是一次性监听器，执行后移除
        if (listener.once) {
          this._removeEChartsListener(listener)
          listeners.splice(i, 1)
        }
      } catch (error) {
        console.error(`事件处理器执行失败 (${eventType}):`, error)
      }
    }

    // 如果监听器列表为空，清理
    if (listeners.length === 0) {
      this._listeners.delete(eventType)
    }
  }

  /**
   * 获取事件监听器数量
   * @param eventType - 事件类型（可选）
   * @returns 监听器数量
   */
  getListenerCount(eventType?: ChartEventType): number {
    if (eventType) {
      return this._listeners.get(eventType)?.length || 0
    }

    let total = 0
    for (const listeners of this._listeners.values()) {
      total += listeners.length
    }
    return total
  }

  /**
   * 获取所有已注册的事件类型
   * @returns 事件类型数组
   */
  getRegisteredEventTypes(): ChartEventType[] {
    return Array.from(this._listeners.keys())
  }

  /**
   * 清理所有监听器
   */
  dispose(): void {
    this._removeAllListeners()
    this._echarts = null
  }

  /**
   * 创建监听器对象
   * @param eventType - 事件类型
   * @param handler - 处理函数
   * @param options - 选项
   * @returns 监听器对象
   */
  private _createListener(
    eventType: ChartEventType,
    handler: EventHandler,
    options: EventListenerOptions
  ): EventListener {
    let processedHandler = handler

    // 应用防抖
    if (options.debounce && options.debounce > 0) {
      processedHandler = debounce(handler, options.debounce)
    }

    // 应用节流
    if (options.throttle && options.throttle > 0) {
      processedHandler = throttle(handler, options.throttle)
    }

    return {
      type: eventType,
      handler: processedHandler,
      originalHandler: handler,
      once: options.once,
      debounce: options.debounce,
      throttle: options.throttle,
    }
  }

  /**
   * 注册 ECharts 监听器
   * @param listener - 监听器对象
   */
  private _registerEChartsListener(listener: EventListener): void {
    if (!this._echarts) return

    if (this._isEChartsEvent(listener.type)) {
      this._echarts.on(listener.type, listener.handler)
    }
  }

  /**
   * 移除 ECharts 监听器
   * @param listener - 监听器对象
   */
  private _removeEChartsListener(listener: EventListener): void {
    if (!this._echarts) return

    if (this._isEChartsEvent(listener.type)) {
      this._echarts.off(listener.type, listener.handler)
    }
  }

  /**
   * 重新注册所有监听器
   */
  private _reregisterAllListeners(): void {
    for (const listeners of this._listeners.values()) {
      for (const listener of listeners) {
        this._registerEChartsListener(listener)
      }
    }
  }

  /**
   * 移除所有 ECharts 监听器
   */
  private _removeAllEChartsListeners(): void {
    if (!this._echarts) return

    for (const listeners of this._listeners.values()) {
      for (const listener of listeners) {
        this._removeEChartsListener(listener)
      }
    }
  }

  /**
   * 移除所有监听器
   */
  private _removeAllListeners(): void {
    this._removeAllEChartsListeners()
    this._listeners.clear()
  }

  /**
   * 移除指定事件类型的所有监听器
   * @param eventType - 事件类型
   */
  private _removeEventTypeListeners(eventType: ChartEventType): void {
    const listeners = this._listeners.get(eventType)
    if (!listeners) return

    for (const listener of listeners) {
      this._removeEChartsListener(listener)
    }

    this._listeners.delete(eventType)
  }

  /**
   * 验证事件类型
   * @param eventType - 事件类型
   */
  private _validateEventType(eventType: ChartEventType): void {
    if (!CHART_EVENT_TYPES.includes(eventType)) {
      throw new Error(`不支持的事件类型: ${eventType}`)
    }
  }

  /**
   * 检查是否为 ECharts 事件
   * @param eventType - 事件类型
   * @returns 是否为 ECharts 事件
   */
  private _isEChartsEvent(eventType: ChartEventType): boolean {
    return MOUSE_EVENT_TYPES.includes(eventType) ||
      INTERACTION_EVENT_TYPES.includes(eventType)
  }

  /**
   * 生成监听器 ID
   * @returns 监听器 ID
   */
  private _generateListenerId(): string {
    return `listener-${++this._eventIdCounter}`
  }
}

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 事件监听器选项
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
  /** 节流延迟（毫秒） */
  throttle?: number
}

/**
 * 创建事件管理器实例
 * @returns 事件管理器实例
 */
export function createEventManager(): EventManager {
  return new EventManager()
}
