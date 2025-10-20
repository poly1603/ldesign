/**
 * 高级事件发射器
 * 提供更强大的事件管理功能
 */

import { Callback, AsyncCallback, Optional } from '../types/advanced';

/**
 * 事件监听器配置
 */
export interface ListenerConfig {
  once?: boolean;
  priority?: number;
  async?: boolean;
  context?: any;
}

/**
 * 事件监听器
 */
interface EventListener {
  callback: Callback<any> | AsyncCallback<any>;
  config: ListenerConfig;
  id: string;
}

/**
 * 事件数据
 */
export interface EventData<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source?: any;
  cancelled?: boolean;
}

/**
 * 高级事件发射器
 */
export class AdvancedEventEmitter {
  private events: Map<string, EventListener[]> = new Map();
  private eventHistory: EventData[] = [];
  private maxHistorySize = 100;
  private globalListeners: EventListener[] = [];
  private eventCounter = 0;
  private paused = false;
  private queuedEvents: EventData[] = [];

  /**
   * 注册事件监听器
   */
  public on<T = any>(
    event: string,
    callback: Callback<T> | AsyncCallback<T>,
    config?: ListenerConfig
  ): string {
    const id = this.generateListenerId();
    const listener: EventListener = {
      callback: callback as any,
      config: config || {},
      id
    };

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    
    // 按优先级插入
    const priority = config?.priority || 0;
    const insertIndex = listeners.findIndex(l => (l.config.priority || 0) < priority);
    
    if (insertIndex === -1) {
      listeners.push(listener);
    } else {
      listeners.splice(insertIndex, 0, listener);
    }

    return id;
  }

  /**
   * 注册一次性监听器
   */
  public once<T = any>(
    event: string,
    callback: Callback<T> | AsyncCallback<T>
  ): string {
    return this.on(event, callback, { once: true });
  }

  /**
   * 移除事件监听器
   */
  public off(event?: string, idOrCallback?: string | Function): void {
    if (!event) {
      // 清除所有事件
      this.events.clear();
      return;
    }

    const listeners = this.events.get(event);
    if (!listeners) return;

    if (!idOrCallback) {
      // 清除该事件的所有监听器
      this.events.delete(event);
      return;
    }

    // 根据ID或回调函数移除
    const filtered = listeners.filter(listener => {
      if (typeof idOrCallback === 'string') {
        return listener.id !== idOrCallback;
      } else {
        return listener.callback !== idOrCallback;
      }
    });

    if (filtered.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, filtered);
    }
  }

  /**
   * 触发事件
   */
  public async emit<T = any>(
    event: string,
    data: T,
    source?: any
  ): Promise<void> {
    const eventData: EventData<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source,
      cancelled: false
    };

    // 如果暂停，加入队列
    if (this.paused) {
      this.queuedEvents.push(eventData);
      return;
    }

    // 记录历史
    this.recordEvent(eventData);

    // 执行全局监听器
    await this.executeListeners(this.globalListeners, eventData);

    // 执行特定事件监听器
    const listeners = this.events.get(event);
    if (listeners) {
      await this.executeListeners([...listeners], eventData);
      
      // 移除一次性监听器
      const remaining = listeners.filter(l => !l.config.once);
      if (remaining.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, remaining);
      }
    }
  }

  /**
   * 同步触发事件
   */
  public emitSync<T = any>(event: string, data: T, source?: any): void {
    const eventData: EventData<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source,
      cancelled: false
    };

    if (this.paused) {
      this.queuedEvents.push(eventData);
      return;
    }

    this.recordEvent(eventData);

    // 执行监听器（只执行同步的）
    const listeners = this.events.get(event);
    if (listeners) {
      const syncListeners = listeners.filter(l => !l.config.async);
      syncListeners.forEach(listener => {
        try {
          if (listener.config.context) {
            (listener.callback as Function).call(listener.config.context, eventData.data);
          } else {
            (listener.callback as Callback<T>)(eventData.data);
          }
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });

      // 移除一次性监听器
      const remaining = listeners.filter(l => !l.config.once);
      if (remaining.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, remaining);
      }
    }
  }

  /**
   * 执行监听器
   */
  private async executeListeners(
    listeners: EventListener[],
    eventData: EventData
  ): Promise<void> {
    for (const listener of listeners) {
      if (eventData.cancelled) break;

      try {
        const callback = listener.callback;
        
        if (listener.config.async) {
          if (listener.config.context) {
            await (callback as Function).call(listener.config.context, eventData.data);
          } else {
            await (callback as AsyncCallback)(eventData.data);
          }
        } else {
          if (listener.config.context) {
            (callback as Function).call(listener.config.context, eventData.data);
          } else {
            (callback as Callback)(eventData.data);
          }
        }
      } catch (error) {
        console.error(`Error in event listener:`, error);
      }
    }
  }

  /**
   * 记录事件
   */
  private recordEvent(eventData: EventData): void {
    this.eventHistory.push(eventData);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * 生成监听器ID
   */
  private generateListenerId(): string {
    return `listener_${++this.eventCounter}_${Date.now()}`;
  }

  /**
   * 暂停事件处理
   */
  public pause(): void {
    this.paused = true;
  }

  /**
   * 恢复事件处理
   */
  public async resume(): Promise<void> {
    this.paused = false;
    
    // 处理队列中的事件
    const events = [...this.queuedEvents];
    this.queuedEvents = [];
    
    for (const event of events) {
      await this.emit(event.type, event.data, event.source);
    }
  }

  /**
   * 注册全局监听器
   */
  public onAll(
    callback: Callback<EventData> | AsyncCallback<EventData>,
    config?: ListenerConfig
  ): string {
    const id = this.generateListenerId();
    const listener: EventListener = {
      callback: callback as any,
      config: config || {},
      id
    };
    
    this.globalListeners.push(listener);
    return id;
  }

  /**
   * 获取事件历史
   */
  public getHistory(event?: string): EventData[] {
    if (event) {
      return this.eventHistory.filter(e => e.type === event);
    }
    return [...this.eventHistory];
  }

  /**
   * 清除事件历史
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 获取监听器数量
   */
  public listenerCount(event?: string): number {
    if (event) {
      return this.events.get(event)?.length || 0;
    }
    
    let count = this.globalListeners.length;
    this.events.forEach(listeners => {
      count += listeners.length;
    });
    return count;
  }

  /**
   * 获取所有事件名
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * 等待事件
   */
  public waitFor<T = any>(
    event: string,
    timeout?: number
  ): Promise<Optional<T>> {
    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout | undefined;
      
      const listenerId = this.once(event, (data: T) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(data);
      });
      
      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listenerId);
          resolve(undefined);
        }, timeout);
      }
    });
  }

  /**
   * 管道事件到另一个发射器
   */
  public pipe(
    target: AdvancedEventEmitter,
    events?: string[]
  ): void {
    const eventsToPipe = events || this.eventNames();
    
    eventsToPipe.forEach(event => {
      this.on(event, (data) => {
        target.emit(event, data);
      });
    });
  }

  /**
   * 创建事件代理
   */
  public createProxy(prefix: string): AdvancedEventEmitter {
    const proxy = new AdvancedEventEmitter();
    
    proxy.onAll((eventData) => {
      this.emit(`${prefix}:${eventData.type}`, eventData.data);
    });
    
    return proxy;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.events.clear();
    this.globalListeners = [];
    this.eventHistory = [];
    this.queuedEvents = [];
    this.paused = false;
    this.eventCounter = 0;
  }
}

/**
 * 创建类型安全的事件发射器
 */
export function createTypedEventEmitter<T extends Record<string, any>>() {
  const emitter = new AdvancedEventEmitter();
  
  return {
    on<K extends keyof T>(
      event: K,
      callback: Callback<T[K]>,
      config?: ListenerConfig
    ): string {
      return emitter.on(event as string, callback, config);
    },
    
    once<K extends keyof T>(
      event: K,
      callback: Callback<T[K]>
    ): string {
      return emitter.once(event as string, callback);
    },
    
    off<K extends keyof T>(
      event?: K,
      idOrCallback?: string | Function
    ): void {
      emitter.off(event as string, idOrCallback);
    },
    
    emit<K extends keyof T>(
      event: K,
      data: T[K],
      source?: any
    ): Promise<void> {
      return emitter.emit(event as string, data, source);
    },
    
    emitSync<K extends keyof T>(
      event: K,
      data: T[K],
      source?: any
    ): void {
      emitter.emitSync(event as string, data, source);
    },
    
    waitFor<K extends keyof T>(
      event: K,
      timeout?: number
    ): Promise<Optional<T[K]>> {
      return emitter.waitFor(event as string, timeout);
    },
    
    destroy(): void {
      emitter.destroy();
    }
  };
}