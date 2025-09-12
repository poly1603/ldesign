/**
 * 事件管理器
 * 负责管理地图的所有事件监听和分发
 */

import type { 
  EventData, 
  EventListener, 
  EventListenerOptions, 
  IEventManager,
  MapEventType 
} from '../types';

/**
 * 事件监听器信息
 */
interface ListenerInfo<T extends EventData = EventData> {
  listener: EventListener<T>;
  options: EventListenerOptions;
  id: string;
}

/**
 * 事件管理器实现类
 * 提供完整的事件系统功能
 */
export class EventManager implements IEventManager {
  private listeners: Map<string, ListenerInfo[]> = new Map();
  private listenerIdCounter = 0;

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   * @param options 监听器选项
   */
  on<T extends EventData>(
    type: MapEventType | string,
    listener: EventListener<T>,
    options: EventListenerOptions = {}
  ): void {
    const eventType = type.toString();
    
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listenerInfo: ListenerInfo<T> = {
      listener: listener as EventListener,
      options,
      id: `listener_${++this.listenerIdCounter}`
    };

    const eventListeners = this.listeners.get(eventType)!;
    
    // 根据优先级插入监听器
    const priority = options.priority || 0;
    let insertIndex = eventListeners.length;
    
    for (let i = 0; i < eventListeners.length; i++) {
      const existingPriority = eventListeners[i].options.priority || 0;
      if (priority > existingPriority) {
        insertIndex = i;
        break;
      }
    }
    
    eventListeners.splice(insertIndex, 0, listenerInfo);
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  off<T extends EventData>(
    type: MapEventType | string,
    listener: EventListener<T>
  ): void {
    const eventType = type.toString();
    const eventListeners = this.listeners.get(eventType);
    
    if (!eventListeners) {
      return;
    }

    const index = eventListeners.findIndex(info => info.listener === listener);
    if (index !== -1) {
      eventListeners.splice(index, 1);
      
      // 如果没有监听器了，删除该事件类型
      if (eventListeners.length === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * 添加一次性事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  once<T extends EventData>(
    type: MapEventType | string,
    listener: EventListener<T>
  ): void {
    this.on(type, listener, { once: true });
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   */
  emit<T extends EventData>(type: MapEventType | string, data: T): void {
    const eventType = type.toString();
    const eventListeners = this.listeners.get(eventType);
    
    if (!eventListeners || eventListeners.length === 0) {
      return;
    }

    // 创建事件监听器的副本，避免在执行过程中被修改
    const listenersToExecute = [...eventListeners];
    const listenersToRemove: string[] = [];

    for (const listenerInfo of listenersToExecute) {
      try {
        // 检查是否应该在捕获阶段执行
        if (listenerInfo.options.capture && !this.isCapturingPhase(data)) {
          continue;
        }

        // 执行监听器
        listenerInfo.listener(data);

        // 如果是一次性监听器，标记为需要移除
        if (listenerInfo.options.once) {
          listenersToRemove.push(listenerInfo.id);
        }

        // 检查是否阻止了事件传播
        if (data.stopPropagation) {
          break;
        }
      } catch (error) {
        console.error(`[EventManager] 事件监听器执行错误:`, error);
      }
    }

    // 移除一次性监听器
    if (listenersToRemove.length > 0) {
      const currentListeners = this.listeners.get(eventType);
      if (currentListeners) {
        const filteredListeners = currentListeners.filter(
          info => !listenersToRemove.includes(info.id)
        );
        
        if (filteredListeners.length === 0) {
          this.listeners.delete(eventType);
        } else {
          this.listeners.set(eventType, filteredListeners);
        }
      }
    }
  }

  /**
   * 获取事件监听器数量
   * @param type 事件类型
   * @returns 监听器数量
   */
  listenerCount(type: MapEventType | string): number {
    const eventType = type.toString();
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 移除所有事件监听器
   * @param type 可选的事件类型，如果不提供则移除所有
   */
  removeAllListeners(type?: MapEventType | string): void {
    if (type) {
      const eventType = type.toString();
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 检查是否处于捕获阶段
   * @param data 事件数据
   * @returns 是否处于捕获阶段
   * @private
   */
  private isCapturingPhase(data: EventData): boolean {
    // 这里可以根据具体的事件类型来判断是否处于捕获阶段
    // 目前简单返回 false，表示都在冒泡阶段
    return false;
  }

  /**
   * 获取事件监听器信息（用于调试）
   * @param type 事件类型
   * @returns 监听器信息数组
   */
  getListenerInfo(type: MapEventType | string): Array<{
    id: string;
    options: EventListenerOptions;
  }> {
    const eventType = type.toString();
    const eventListeners = this.listeners.get(eventType);
    
    if (!eventListeners) {
      return [];
    }

    return eventListeners.map(info => ({
      id: info.id,
      options: info.options
    }));
  }

  /**
   * 检查是否有指定类型的监听器
   * @param type 事件类型
   * @returns 是否有监听器
   */
  hasListeners(type: MapEventType | string): boolean {
    const eventType = type.toString();
    return this.listeners.has(eventType) && this.listeners.get(eventType)!.length > 0;
  }

  /**
   * 暂停事件分发
   * @param type 可选的事件类型，如果不提供则暂停所有事件
   */
  pause(type?: MapEventType | string): void {
    // 实现事件暂停逻辑
    // 这里可以添加一个暂停标记，在 emit 时检查
  }

  /**
   * 恢复事件分发
   * @param type 可选的事件类型，如果不提供则恢复所有事件
   */
  resume(type?: MapEventType | string): void {
    // 实现事件恢复逻辑
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.listeners.clear();
    this.listenerIdCounter = 0;
  }

  /**
   * 获取统计信息
   * @returns 统计信息
   */
  getStats(): {
    totalEventTypes: number;
    totalListeners: number;
    eventTypes: Array<{
      type: string;
      listenerCount: number;
    }>;
  } {
    const eventTypes: Array<{ type: string; listenerCount: number }> = [];
    let totalListeners = 0;

    for (const [type, listeners] of this.listeners) {
      eventTypes.push({
        type,
        listenerCount: listeners.length
      });
      totalListeners += listeners.length;
    }

    return {
      totalEventTypes: this.listeners.size,
      totalListeners,
      eventTypes
    };
  }
}
