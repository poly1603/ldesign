/**
 * EventManager 事件管理器
 * 提供事件监听、触发和管理功能
 */

/**
 * 事件监听器类型
 */
type EventListener<T = unknown> = (...args: T[]) => void;

/**
 * 事件监听器信息
 */
interface EventListenerInfo<T = unknown> {
  /** 监听器函数 */
  listener: EventListener<T>;
  /** 是否只执行一次 */
  once: boolean;
  /** 优先级 */
  priority: number;
  /** 监听器ID */
  id: string;
}

/**
 * 事件管理器配置
 */
interface EventManagerOptions {
  /** 最大监听器数量 */
  maxListeners?: number;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 是否启用性能监控 */
  performance?: boolean;
}

/**
 * 事件管理器类
 * 提供完整的事件系统功能
 */
export class EventManager {
  /** 事件监听器映射 */
  private listeners: Map<string, EventListenerInfo[]> = new Map();

  /** 配置选项 */
  private options: Required<EventManagerOptions>;

  /** 监听器计数器 */
  private listenerIdCounter = 0;

  /** 性能统计 */
  private performanceStats: Map<string, { count: number; totalTime: number }> = new Map();

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: EventManagerOptions = {}) {
    this.options = {
      maxListeners: options.maxListeners ?? 100,
      debug: options.debug ?? false,
      performance: options.performance ?? false
    };
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 选项
   * @returns 监听器ID
   */
  on<T = unknown>(
    event: string,
    listener: EventListener<T>,
    options: { once?: boolean; priority?: number } = {}
  ): string {
    const { once = false, priority = 0 } = options;

    // 检查监听器数量限制
    const eventListeners = this.listeners.get(event) || [];
    if (eventListeners.length >= this.options.maxListeners) {
      throw new Error(`Maximum number of listeners (${this.options.maxListeners}) exceeded for event: ${event}`);
    }

    // 生成监听器ID
    const id = `listener_${++this.listenerIdCounter}`;

    // 创建监听器信息
    const listenerInfo: EventListenerInfo<T> = {
      listener,
      once,
      priority,
      id
    };

    // 添加到监听器列表
    eventListeners.push(listenerInfo as EventListenerInfo);

    // 按优先级排序（优先级高的先执行）
    eventListeners.sort((a, b) => b.priority - a.priority);

    this.listeners.set(event, eventListeners);

    if (this.options.debug) {
      console.log(`[EventManager] Added listener for event: ${event}, ID: ${id}, Priority: ${priority}`);
    }

    return id;
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param priority 优先级
   * @returns 监听器ID
   */
  once<T = unknown>(event: string, listener: EventListener<T>, priority = 0): string {
    return this.on(event, listener, { once: true, priority });
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listenerOrId 监听器函数或ID
   * @returns 是否成功移除
   */
  off(event: string, listenerOrId?: EventListener | string): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return false;

    if (!listenerOrId) {
      // 移除所有监听器
      this.listeners.delete(event);
      if (this.options.debug) {
        console.log(`[EventManager] Removed all listeners for event: ${event}`);
      }
      return true;
    }

    // 查找要移除的监听器
    const index = eventListeners.findIndex(info => {
      if (typeof listenerOrId === 'string') {
        return info.id === listenerOrId;
      } else {
        return info.listener === listenerOrId;
      }
    });

    if (index === -1) return false;

    // 移除监听器
    const removedListener = eventListeners.splice(index, 1)[0];

    // 如果没有监听器了，删除事件
    if (eventListeners.length === 0) {
      this.listeners.delete(event);
    }

    if (this.options.debug) {
      console.log(`[EventManager] Removed listener for event: ${event}, ID: ${removedListener?.id}`);
    }

    return true;
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   * @returns 是否有监听器处理了事件
   */
  emit<T = unknown>(event: string, ...args: T[]): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      if (this.options.debug) {
        console.log(`[EventManager] No listeners for event: ${event}`);
      }
      return false;
    }

    const startTime = this.options.performance ? performance.now() : 0;

    // 复制监听器列表，避免在执行过程中被修改
    const listenersToExecute = [...eventListeners];
    const onceListeners: string[] = [];

    // 执行监听器
    for (const listenerInfo of listenersToExecute) {
      try {
        listenerInfo.listener(...args);

        // 记录一次性监听器
        if (listenerInfo.once) {
          onceListeners.push(listenerInfo.id);
        }
      } catch (error) {
        console.error(`[EventManager] Error in listener for event: ${event}`, error);
      }
    }

    // 移除一次性监听器
    for (const listenerId of onceListeners) {
      this.off(event, listenerId);
    }

    // 性能统计
    if (this.options.performance) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const stats = this.performanceStats.get(event) || { count: 0, totalTime: 0 };
      stats.count++;
      stats.totalTime += duration;
      this.performanceStats.set(event, stats);
    }

    if (this.options.debug) {
      console.log(`[EventManager] Emitted event: ${event}, Listeners: ${listenersToExecute.length}`);
    }

    return true;
  }

  /**
   * 检查是否有指定事件的监听器
   * @param event 事件名称
   * @returns 是否有监听器
   */
  hasListeners(event: string): boolean {
    const eventListeners = this.listeners.get(event);
    return eventListeners !== undefined && eventListeners.length > 0;
  }

  /**
   * 获取指定事件的监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  getListenerCount(event: string): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 获取总监听器数量
   * @returns 总监听器数量
   */
  getTotalListenerCount(): number {
    let total = 0;
    for (const eventListeners of this.listeners.values()) {
      total += eventListeners.length;
    }
    return total;
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear();
    this.performanceStats.clear();

    if (this.options.debug) {
      console.log('[EventManager] Cleared all listeners');
    }
  }

  /**
   * 获取性能统计信息
   * @returns 性能统计信息
   */
  getPerformanceStats(): Record<string, { count: number; totalTime: number; averageTime: number }> {
    const stats: Record<string, { count: number; totalTime: number; averageTime: number }> = {};

    for (const [event, stat] of this.performanceStats.entries()) {
      stats[event] = {
        count: stat.count,
        totalTime: stat.totalTime,
        averageTime: stat.count > 0 ? stat.totalTime / stat.count : 0
      };
    }

    return stats;
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats(): void {
    this.performanceStats.clear();
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.clear();
    this.listenerIdCounter = 0;
  }
}
