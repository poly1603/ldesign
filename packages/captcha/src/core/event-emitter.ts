/**
 * 事件发射器类
 * 提供事件的注册、移除和触发功能
 */

import type { CaptchaEventType, CaptchaEventListener, CaptchaEventData } from '../types'

export class EventEmitter {
  /** 事件监听器映射表 */
  private listeners: Map<CaptchaEventType, Set<CaptchaEventListener>> = new Map()
  
  /** 是否启用调试模式 */
  private debug: boolean = false

  constructor(debug: boolean = false) {
    this.debug = debug
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event: CaptchaEventType, listener: CaptchaEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    const eventListeners = this.listeners.get(event)!
    eventListeners.add(listener)
    
    if (this.debug) {
      console.log(`[EventEmitter] 添加监听器: ${event}, 当前监听器数量: ${eventListeners.size}`)
    }
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event: CaptchaEventType, listener: CaptchaEventListener): void {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) {
      return
    }
    
    eventListeners.delete(listener)
    
    // 如果没有监听器了，删除整个事件类型
    if (eventListeners.size === 0) {
      this.listeners.delete(event)
    }
    
    if (this.debug) {
      console.log(`[EventEmitter] 移除监听器: ${event}, 剩余监听器数量: ${eventListeners.size}`)
    }
  }

  /**
   * 移除指定事件的所有监听器
   * @param event 事件类型
   */
  removeAllListeners(event?: CaptchaEventType): void {
    if (event) {
      this.listeners.delete(event)
      if (this.debug) {
        console.log(`[EventEmitter] 移除所有监听器: ${event}`)
      }
    } else {
      this.listeners.clear()
      if (this.debug) {
        console.log('[EventEmitter] 移除所有监听器')
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   */
  emit(event: CaptchaEventType, data?: any): void {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.size === 0) {
      if (this.debug) {
        console.log(`[EventEmitter] 没有监听器: ${event}`)
      }
      return
    }

    const eventData: CaptchaEventData = {
      type: event,
      data,
      timestamp: Date.now()
    }

    if (this.debug) {
      console.log(`[EventEmitter] 触发事件: ${event}`, eventData)
    }

    // 异步触发所有监听器，避免阻塞
    eventListeners.forEach(listener => {
      try {
        // 使用 setTimeout 确保异步执行
        setTimeout(() => {
          listener(eventData)
        }, 0)
      } catch (error) {
        console.error(`[EventEmitter] 监听器执行错误 (${event}):`, error)
      }
    })
  }

  /**
   * 一次性事件监听器
   * 监听器只会被触发一次，然后自动移除
   * @param event 事件类型
   * @param listener 监听器函数
   */
  once(event: CaptchaEventType, listener: CaptchaEventListener): void {
    const onceListener: CaptchaEventListener = (data) => {
      this.off(event, onceListener)
      listener(data)
    }
    
    this.on(event, onceListener)
  }

  /**
   * 获取指定事件的监听器数量
   * @param event 事件类型
   * @returns 监听器数量
   */
  listenerCount(event: CaptchaEventType): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  eventNames(): CaptchaEventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 检查是否有指定事件的监听器
   * @param event 事件类型
   * @returns 是否有监听器
   */
  hasListeners(event: CaptchaEventType): boolean {
    return this.listenerCount(event) > 0
  }

  /**
   * 设置调试模式
   * @param debug 是否启用调试
   */
  setDebug(debug: boolean): void {
    this.debug = debug
  }

  /**
   * 销毁事件发射器
   * 清除所有监听器
   */
  destroy(): void {
    this.removeAllListeners()
    if (this.debug) {
      console.log('[EventEmitter] 事件发射器已销毁')
    }
  }
}
