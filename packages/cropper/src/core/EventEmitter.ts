/**
 * @ldesign/cropper - 事件发射器
 * 
 * 提供事件监听和触发功能的基础类
 */

import type { CropperEventType, CropperEventListener, CropperEventMap } from '../types';

/**
 * 事件发射器类
 * 
 * 提供事件的注册、移除和触发功能
 */
export class EventEmitter {
  private listeners: Map<string, Set<CropperEventListener>> = new Map();

  /**
   * 注册事件监听器
   * 
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on<K extends keyof CropperEventMap>(
    event: K,
    listener: (data: CropperEventMap[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener as CropperEventListener);
  }

  /**
   * 注册一次性事件监听器
   * 
   * @param event 事件类型
   * @param listener 监听器函数
   */
  once<K extends keyof CropperEventMap>(
    event: K,
    listener: (data: CropperEventMap[K]) => void
  ): void {
    const onceListener = (data: CropperEventMap[K]) => {
      listener(data);
      this.off(event, onceListener);
    };
    
    this.on(event, onceListener);
  }

  /**
   * 移除事件监听器
   * 
   * @param event 事件类型
   * @param listener 监听器函数，如果不提供则移除该事件的所有监听器
   */
  off<K extends keyof CropperEventMap>(
    event: K,
    listener?: (data: CropperEventMap[K]) => void
  ): void {
    const eventListeners = this.listeners.get(event);
    
    if (!eventListeners) {
      return;
    }
    
    if (listener) {
      eventListeners.delete(listener as CropperEventListener);
      
      // 如果没有监听器了，删除整个事件
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    } else {
      // 移除该事件的所有监听器
      this.listeners.delete(event);
    }
  }

  /**
   * 触发事件
   * 
   * @param event 事件类型
   * @param data 事件数据
   */
  emit<K extends keyof CropperEventMap>(
    event: K,
    data: CropperEventMap[K]
  ): void {
    const eventListeners = this.listeners.get(event);
    
    if (!eventListeners) {
      return;
    }
    
    // 复制监听器列表，避免在触发过程中修改导致的问题
    const listeners = Array.from(eventListeners);
    
    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }

  /**
   * 检查是否有指定事件的监听器
   * 
   * @param event 事件类型
   * @returns 是否有监听器
   */
  hasListeners(event: CropperEventType): boolean {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size > 0 : false;
  }

  /**
   * 获取指定事件的监听器数量
   * 
   * @param event 事件类型
   * @returns 监听器数量
   */
  getListenerCount(event: CropperEventType): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * 获取所有事件类型
   * 
   * @returns 事件类型数组
   */
  getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.removeAllListeners();
  }
}
