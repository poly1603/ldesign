/**
 * @file 事件发射器
 * @description 实现事件系统的核心功能
 */

import type { CropperEventType, EventListener, CropperEvent } from '../types'

/**
 * 事件发射器类
 * 提供事件的注册、触发、移除等功能
 */
export class EventEmitter {
  /** 事件监听器映射 */
  private listeners: Map<CropperEventType, Set<EventListener>> = new Map()

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  on(type: CropperEventType, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  /**
   * 添加一次性事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  once(type: CropperEventType, listener: EventListener): void {
    const onceListener: EventListener = (event) => {
      listener(event)
      this.off(type, onceListener)
    }
    this.on(type, onceListener)
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  off(type: CropperEventType, listener?: EventListener): void {
    if (!this.listeners.has(type)) {
      return
    }

    const typeListeners = this.listeners.get(type)!
    
    if (listener) {
      typeListeners.delete(listener)
    } else {
      typeListeners.clear()
    }

    if (typeListeners.size === 0) {
      this.listeners.delete(type)
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   * @returns 是否成功触发
   */
  emit(type: CropperEventType, data?: any): boolean {
    if (!this.listeners.has(type)) {
      return false
    }

    const event: CropperEvent = {
      type,
      data,
      timestamp: Date.now(),
      cancelable: true,
      cancelled: false
    }

    const typeListeners = this.listeners.get(type)!
    
    for (const listener of typeListeners) {
      try {
        listener(event)
        
        // 如果事件被取消，停止传播
        if (event.cancelled) {
          break
        }
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error)
      }
    }

    return true
  }

  /**
   * 获取指定类型的监听器数量
   * @param type 事件类型
   * @returns 监听器数量
   */
  listenerCount(type: CropperEventType): number {
    return this.listeners.get(type)?.size || 0
  }

  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  eventNames(): CropperEventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    this.listeners.clear()
  }

  /**
   * 检查是否有指定类型的监听器
   * @param type 事件类型
   * @returns 是否有监听器
   */
  hasListeners(type: CropperEventType): boolean {
    return this.listenerCount(type) > 0
  }
}
