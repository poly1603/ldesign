/**
 * 事件管理器
 * 负责PDF预览器的事件处理和分发
 */

import type { PdfViewerEvents } from './types'

/**
 * 事件监听器类型
 */
type EventListener<T = any> = (data: T) => void

/**
 * 事件管理器实现
 */
export class EventManager {
  private listeners = new Map<keyof PdfViewerEvents, Set<EventListener>>()

  /**
   * 添加事件监听器
   */
  on<K extends keyof PdfViewerEvents>(
    event: K,
    listener: PdfViewerEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as EventListener)
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof PdfViewerEvents>(
    event: K,
    listener: PdfViewerEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener as EventListener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof PdfViewerEvents>(
    event: K,
    listener: PdfViewerEvents[K]
  ): void {
    const onceListener = (data: any) => {
      this.off(event, onceListener as PdfViewerEvents[K])
      ;(listener as EventListener)(data)
    }
    this.on(event, onceListener as PdfViewerEvents[K])
  }

  /**
   * 触发事件
   */
  emit<K extends keyof PdfViewerEvents>(
    event: K,
    data: Parameters<PdfViewerEvents[K]>[0]
  ): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data)
        }
        catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error)
        }
      })
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: keyof PdfViewerEvents): void {
    if (event) {
      this.listeners.delete(event)
    }
    else {
      this.listeners.clear()
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: keyof PdfViewerEvents): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): Array<keyof PdfViewerEvents> {
    return Array.from(this.listeners.keys())
  }

  /**
   * 检查是否有监听器
   */
  hasListeners(event: keyof PdfViewerEvents): boolean {
    return this.listenerCount(event) > 0
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.listeners.clear()
  }
}
