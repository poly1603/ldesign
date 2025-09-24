/**
 * 事件发射器类
 * 用于处理Excel编辑器中的各种事件
 */

import type { ExcelEventType, ExcelEventListener, ExcelEventData } from '../types/index.js'

/**
 * 事件发射器类
 * 提供事件的注册、触发、移除等功能
 */
export class EventEmitter {
  /** 事件监听器映射表 */
  private listeners: Map<ExcelEventType, Set<ExcelEventListener>> = new Map()

  /**
   * 注册事件监听器
   * @param eventType 事件类型
   * @param listener 事件监听器函数
   * @returns 返回当前实例，支持链式调用
   */
  on(eventType: ExcelEventType, listener: ExcelEventListener): this {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    this.listeners.get(eventType)!.add(listener)
    return this
  }

  /**
   * 注册一次性事件监听器
   * @param eventType 事件类型
   * @param listener 事件监听器函数
   * @returns 返回当前实例，支持链式调用
   */
  once(eventType: ExcelEventType, listener: ExcelEventListener): this {
    const onceListener: ExcelEventListener = (data: ExcelEventData) => {
      listener(data)
      this.off(eventType, onceListener)
    }
    
    return this.on(eventType, onceListener)
  }

  /**
   * 移除事件监听器
   * @param eventType 事件类型
   * @param listener 要移除的事件监听器函数，如果不提供则移除该事件类型的所有监听器
   * @returns 返回当前实例，支持链式调用
   */
  off(eventType: ExcelEventType, listener?: ExcelEventListener): this {
    const listeners = this.listeners.get(eventType)
    if (!listeners) {
      return this
    }

    if (listener) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(eventType)
      }
    } else {
      this.listeners.delete(eventType)
    }

    return this
  }

  /**
   * 触发事件
   * @param eventType 事件类型
   * @param data 事件数据
   * @returns 返回当前实例，支持链式调用
   */
  emit(eventType: ExcelEventType, data: Omit<ExcelEventData, 'type'>): this {
    const listeners = this.listeners.get(eventType)
    if (!listeners || listeners.size === 0) {
      return this
    }

    const eventData: ExcelEventData = {
      type: eventType,
      ...data
    }

    // 异步触发所有监听器，避免阻塞主线程
    setTimeout(() => {
      listeners.forEach(listener => {
        try {
          listener(eventData)
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error)
          // 触发错误事件
          this.emit('error', { error: error as Error })
        }
      })
    }, 0)

    return this
  }

  /**
   * 获取指定事件类型的监听器数量
   * @param eventType 事件类型
   * @returns 监听器数量
   */
  listenerCount(eventType: ExcelEventType): number {
    const listeners = this.listeners.get(eventType)
    return listeners ? listeners.size : 0
  }

  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  eventNames(): ExcelEventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 移除所有事件监听器
   * @returns 返回当前实例，支持链式调用
   */
  removeAllListeners(): this {
    this.listeners.clear()
    return this
  }

  /**
   * 检查是否有指定事件类型的监听器
   * @param eventType 事件类型
   * @returns 是否有监听器
   */
  hasListeners(eventType: ExcelEventType): boolean {
    return this.listenerCount(eventType) > 0
  }
}
