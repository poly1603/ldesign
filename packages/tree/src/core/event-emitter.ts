/**
 * 树形组件事件发射器实现
 * 
 * 提供完整的事件系统，支持事件监听、触发和管理
 */

import type { 
  TreeEventEmitter, 
  TreeEventMap, 
  TreeEventListener, 
  TreeEventListenerOptions 
} from '../types/tree-events'

/**
 * 事件监听器信息
 */
interface ListenerInfo<T extends keyof TreeEventMap> {
  listener: TreeEventListener<T>
  options: TreeEventListenerOptions
}

/**
 * 树形组件事件发射器实现类
 */
export class TreeEventEmitterImpl implements TreeEventEmitter {
  private listeners: Map<keyof TreeEventMap, Set<ListenerInfo<any>>> = new Map()

  /**
   * 添加事件监听器
   */
  on<T extends keyof TreeEventMap>(
    type: T,
    listener: TreeEventListener<T>,
    options: TreeEventListenerOptions = {}
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    
    const listenerSet = this.listeners.get(type)!
    listenerSet.add({ listener, options })
  }

  /**
   * 移除事件监听器
   */
  off<T extends keyof TreeEventMap>(
    type: T,
    listener: TreeEventListener<T>
  ): void {
    const listenerSet = this.listeners.get(type)
    if (!listenerSet) {
      return
    }
    
    for (const info of listenerSet) {
      if (info.listener === listener) {
        listenerSet.delete(info)
        break
      }
    }
    
    if (listenerSet.size === 0) {
      this.listeners.delete(type)
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once<T extends keyof TreeEventMap>(
    type: T,
    listener: TreeEventListener<T>
  ): void {
    this.on(type, listener, { once: true })
  }

  /**
   * 触发事件
   */
  emit<T extends keyof TreeEventMap>(
    type: T,
    event: TreeEventMap[T]
  ): boolean {
    const listenerSet = this.listeners.get(type)
    if (!listenerSet || listenerSet.size === 0) {
      return false
    }
    
    const listenersToRemove: ListenerInfo<T>[] = []
    
    for (const info of listenerSet) {
      try {
        // 检查事件是否已被取消
        if (event.cancelled) {
          break
        }
        
        // 执行监听器
        info.listener(event)
        
        // 如果是一次性监听器，标记为需要移除
        if (info.options.once) {
          listenersToRemove.push(info)
        }
      } catch (error) {
        console.error(`Error in event listener for ${String(type)}:`, error)
      }
    }
    
    // 移除一次性监听器
    for (const info of listenersToRemove) {
      listenerSet.delete(info)
    }
    
    if (listenerSet.size === 0) {
      this.listeners.delete(type)
    }
    
    return true
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(type?: keyof TreeEventMap): void {
    if (type) {
      this.listeners.delete(type)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(type: keyof TreeEventMap): number {
    const listenerSet = this.listeners.get(type)
    return listenerSet ? listenerSet.size : 0
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): (keyof TreeEventMap)[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners(type: keyof TreeEventMap): boolean {
    return this.listenerCount(type) > 0
  }

  /**
   * 创建事件对象
   */
  createEvent<T extends keyof TreeEventMap>(
    type: T,
    data: Omit<TreeEventMap[T], 'type' | 'timestamp' | 'cancelable' | 'cancelled' | 'preventDefault'>
  ): TreeEventMap[T] {
    let cancelled = false
    
    return {
      type,
      timestamp: Date.now(),
      cancelable: true,
      cancelled: false,
      preventDefault: () => {
        cancelled = true
        ;(data as any).cancelled = true
      },
      ...data,
    } as TreeEventMap[T]
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.listeners.clear()
  }
}
