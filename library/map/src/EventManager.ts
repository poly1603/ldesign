/**
 * 事件类型定义
 */
export type MapEventType =
  | 'viewStateChange'
  | 'zoomStart'
  | 'zoomEnd'
  | 'panStart'
  | 'panEnd'
  | 'rotateStart'
  | 'rotateEnd'
  | 'click'
  | 'dblclick'
  | 'hover'
  | 'drag'
  | 'dragStart'
  | 'dragEnd'
  | 'layerAdd'
  | 'layerRemove'
  | 'load'
  | 'error';

/**
 * 事件处理函数类型
 */
export type EventHandler = (event: MapEvent) => void;

/**
 * 地图事件接口
 */
export interface MapEvent {
  type: MapEventType;
  data?: any;
  timestamp: number;
  target?: any;
}

/**
 * EventManager - 事件管理器
 * 提供事件监听和触发功能
 */
export class EventManager {
  private listeners: Map<MapEventType, Set<EventHandler>> = new Map();
  private eventHistory: MapEvent[] = [];
  private maxHistorySize = 100;

  /**
   * 添加事件监听器
   */
  on(eventType: MapEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const handlers = this.listeners.get(eventType)!;
    handlers.add(handler);

    // 返回移除函数
    return () => {
      handlers.delete(handler);
    };
  }

  /**
   * 添加一次性事件监听器
   */
  once(eventType: MapEventType, handler: EventHandler): () => void {
    const wrappedHandler: EventHandler = (event) => {
      handler(event);
      this.off(eventType, wrappedHandler);
    };

    return this.on(eventType, wrappedHandler);
  }

  /**
   * 移除事件监听器
   */
  off(eventType: MapEventType, handler?: EventHandler): void {
    if (!handler) {
      // 移除该事件类型的所有监听器
      this.listeners.delete(eventType);
      return;
    }

    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * 触发事件
   */
  emit(eventType: MapEventType, data?: any, target?: any): void {
    const event: MapEvent = {
      type: eventType,
      data,
      target,
      timestamp: Date.now()
    };

    // 记录事件历史
    this.addToHistory(event);

    // 触发监听器
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * 获取监听器数量
   */
  getListenerCount(eventType?: MapEventType): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }

    let total = 0;
    this.listeners.forEach((handlers) => {
      total += handlers.size;
    });
    return total;
  }

  /**
   * 检查是否有监听器
   */
  hasListeners(eventType: MapEventType): boolean {
    const handlers = this.listeners.get(eventType);
    return handlers ? handlers.size > 0 : false;
  }

  /**
   * 获取所有事件类型
   */
  getEventTypes(): MapEventType[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 添加到事件历史
   */
  private addToHistory(event: MapEvent): void {
    this.eventHistory.push(event);

    // 保持历史记录大小限制
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * 获取事件历史
   */
  getEventHistory(eventType?: MapEventType, limit?: number): MapEvent[] {
    let history = eventType
      ? this.eventHistory.filter((e) => e.type === eventType)
      : this.eventHistory;

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * 清除事件历史
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 设置事件历史最大大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;

    // 调整现有历史记录
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
  }
}

/**
 * 创建事件管理器实例
 */
export function createEventManager(): EventManager {
  return new EventManager();
}









