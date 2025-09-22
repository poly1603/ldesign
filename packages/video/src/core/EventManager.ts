/**
 * 事件管理器实现
 * 提供现代化的事件系统，支持类型安全的事件处理
 */

import type {
  EventManager as IEventManager,
  EventListener,
  EventMiddleware,
  EventFilter,
  EventTransformer,
  PlayerEventMap,
  CustomEvent
} from '../types/events';

/**
 * 现代化的事件管理器实现
 * 基于 EventTarget API，提供类型安全的事件处理
 */
export class EventManager implements IEventManager {
  private readonly eventTarget: EventTarget;
  private readonly _listeners: Map<string, Set<EventListener>>;
  private readonly _onceListeners: Map<string, Set<EventListener>>;
  private readonly wrappedListeners: Map<EventListener, EventListener>;
  private readonly middlewares: EventMiddleware[];
  private eventFilter?: EventFilter;
  private eventTransformer?: EventTransformer;
  private enabled: boolean;
  private stats: {
    totalEvents: number;
    eventCounts: Record<string, number>;
  };

  constructor() {
    this.eventTarget = new EventTarget();
    this._listeners = new Map();
    this._onceListeners = new Map();
    this.wrappedListeners = new Map();
    this.middlewares = [];
    this.enabled = true;
    this.stats = {
      totalEvents: 0,
      eventCounts: {}
    };
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    if (!this.enabled) return;

    const eventName = event as string;

    // 添加到监听器集合
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName)!.add(listener);

    // 创建包装函数处理中间件和过滤器
    const wrappedListener = this.createWrappedListener(eventName, listener);
    this.wrappedListeners.set(listener, wrappedListener);

    // 添加到 EventTarget
    this.eventTarget.addEventListener(eventName, wrappedListener);
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    const eventName = event as string;

    // 从监听器集合中移除
    const listeners = this._listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this._listeners.delete(eventName);
      }
    }

    // 从 EventTarget 中移除包装函数
    const wrappedListener = this.wrappedListeners.get(listener);
    if (wrappedListener) {
      this.eventTarget.removeEventListener(eventName, wrappedListener);
      this.wrappedListeners.delete(listener);
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof PlayerEventMap>(
    event: K,
    listener: EventListener<PlayerEventMap[K]>
  ): void {
    if (!this.enabled) return;

    const eventName = event as string;

    // 添加到一次性监听器集合
    if (!this._onceListeners.has(eventName)) {
      this._onceListeners.set(eventName, new Set());
    }
    this._onceListeners.get(eventName)!.add(listener);

    // 创建一次性包装函数
    const onceWrapper = (event: Event) => {
      this._onceListeners.get(eventName)?.delete(listener);
      const wrappedListener = this.createWrappedListener(eventName, listener);
      wrappedListener(event);
    };

    this.eventTarget.addEventListener(eventName, onceWrapper, { once: true });
  }

  /**
   * 发射事件
   */
  emit<K extends keyof PlayerEventMap>(
    event: K,
    data: PlayerEventMap[K]
  ): void {
    if (!this.enabled) return;

    const eventName = event as string;

    // 更新统计
    this.stats.totalEvents++;
    this.stats.eventCounts[eventName] = (this.stats.eventCounts[eventName] || 0) + 1;

    // 应用事件转换器
    let eventData = data;
    if (this.eventTransformer) {
      eventData = this.eventTransformer(eventName, data);
    }

    // 创建自定义事件
    const customEvent = new CustomEvent(eventName, {
      detail: eventData,
      bubbles: true,
      cancelable: true
    });

    // 分发事件
    this.eventTarget.dispatchEvent(customEvent);
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: keyof PlayerEventMap): void {
    if (event) {
      const eventName = event as string;
      this._listeners.delete(eventName);
      this._onceListeners.delete(eventName);
    } else {
      this._listeners.clear();
      this._onceListeners.clear();
    }
  }

  /**
   * 获取监听器数量
   */
  listenerCount(event: keyof PlayerEventMap): number {
    const eventName = event as string;
    const regularListeners = this._listeners.get(eventName)?.size || 0;
    const onceListeners = this._onceListeners.get(eventName)?.size || 0;
    return regularListeners + onceListeners;
  }

  /**
   * 获取事件的所有监听器
   */
  listeners<K extends keyof PlayerEventMap>(
    event: K
  ): EventListener<PlayerEventMap[K]>[] {
    const eventName = event as string;
    const regularListeners = Array.from(this._listeners.get(eventName) || []);
    const onceListeners = Array.from(this._onceListeners.get(eventName) || []);
    return [...regularListeners, ...onceListeners];
  }

  /**
   * 添加事件中间件
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * 设置事件过滤器
   */
  filter(filter: EventFilter): void {
    this.eventFilter = filter;
  }

  /**
   * 设置事件转换器
   */
  transform(transformer: EventTransformer): void {
    this.eventTransformer = transformer;
  }

  /**
   * 设置事件过滤器（别名）
   */
  setFilter(filter: EventFilter): void {
    this.filter(filter);
  }

  /**
   * 设置事件转换器（别名）
   */
  setTransformer(transformer: EventTransformer): void {
    this.transform(transformer);
  }

  /**
   * 获取事件统计信息
   */
  getStats() {
    return {
      totalEvents: this.stats.totalEvents,
      eventCounts: { ...this.stats.eventCounts },
      listenerCounts: this.getListenerCounts()
    };
  }

  /**
   * 清除所有事件和监听器
   */
  clear(): void {
    this.removeAllListeners();
    this.middlewares.length = 0;
    this.eventFilter = undefined;
    this.eventTransformer = undefined;
    this.stats.totalEvents = 0;
    this.stats.eventCounts = {};
  }

  /**
   * 启用事件系统
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用事件系统
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 创建包装监听器
   */
  private createWrappedListener(eventName: string, listener: EventListener): EventListener {
    return (event: Event) => {
      // 应用事件过滤器
      if (this.eventFilter && !this.eventFilter(eventName, event)) {
        return;
      }

      // 应用中间件
      let index = 0;
      const next = () => {
        if (index < this.middlewares.length) {
          const middleware = this.middlewares[index++];
          middleware(eventName, event, next);
        } else {
          // 调用原始监听器，传递事件数据而不是 CustomEvent 对象
          const eventData = (event as CustomEvent).detail || event;
          listener(eventData);
        }
      };

      next();
    };
  }

  /**
   * 获取监听器数量统计
   */
  private getListenerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const [event, listeners] of this._listeners) {
      counts[event] = listeners.size;
    }

    for (const [event, listeners] of this._onceListeners) {
      counts[event] = (counts[event] || 0) + listeners.size;
    }

    return counts;
  }
}