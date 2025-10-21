/**
 * 事件管理器 - 自动清理事件监听器，防止内存泄漏
 */

/**
 * 事件监听器记录
 */
interface EventListener {
  target: EventTarget;
  event: string;
  handler: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

/**
 * 事件管理器
 */
export class EventManager {
  private listeners: EventListener[] = [];
  private weakListeners = new WeakMap<object, EventListener[]>();

  /**
   * 添加事件监听器（会自动记录）
   */
  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);

    this.listeners.push({
      target,
      event,
      handler,
      options,
    });
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.removeEventListener(event, handler, options);

    const index = this.listeners.findIndex(
      (listener) =>
        listener.target === target &&
        listener.event === event &&
        listener.handler === handler
    );

    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 添加弱引用监听器（对象销毁时自动清理）
   */
  addWeakListener(
    owner: object,
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);

    if (!this.weakListeners.has(owner)) {
      this.weakListeners.set(owner, []);
    }

    this.weakListeners.get(owner)!.push({
      target,
      event,
      handler,
      options,
    });
  }

  /**
   * 清理对象的所有监听器
   */
  clearObjectListeners(owner: object): void {
    const listeners = this.weakListeners.get(owner);
    if (!listeners) return;

    for (const listener of listeners) {
      listener.target.removeEventListener(
        listener.event,
        listener.handler,
        listener.options
      );
    }

    this.weakListeners.delete(owner);
  }

  /**
   * 清理所有监听器
   */
  clearAll(): void {
    for (const listener of this.listeners) {
      try {
        listener.target.removeEventListener(
          listener.event,
          listener.handler,
          listener.options
        );
      } catch (error) {
        // 忽略清理错误
      }
    }

    this.listeners = [];
  }

  /**
   * 获取监听器数量
   */
  getListenerCount(): number {
    return this.listeners.length;
  }

  /**
   * 检测潜在的内存泄漏
   */
  detectLeaks(): { hasLeaks: boolean; count: number; warning: string } {
    const count = this.listeners.length;
    const hasLeaks = count > 100; // 超过 100 个监听器可能有泄漏

    return {
      hasLeaks,
      count,
      warning: hasLeaks
        ? `检测到 ${count} 个事件监听器，可能存在内存泄漏`
        : '',
    };
  }
}

/**
 * 循环引用检测器
 */
export class CircularReferenceDetector {
  /**
   * 检测对象中的循环引用
   */
  static detect(obj: any, seen = new WeakSet()): boolean {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }

    if (seen.has(obj)) {
      return true; // 发现循环引用
    }

    seen.add(obj);

    try {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (this.detect(obj[key], seen)) {
            return true;
          }
        }
      }
    } catch (error) {
      // 忽略访问错误
    }

    return false;
  }

  /**
   * 移除循环引用（返回清理后的副本）
   */
  static remove(obj: any, seen = new WeakMap()): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular]';
    }

    const copy: any = Array.isArray(obj) ? [] : {};
    seen.set(obj, copy);

    try {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          copy[key] = this.remove(obj[key], seen);
        }
      }
    } catch (error) {
      // 忽略访问错误
    }

    return copy;
  }
}

/**
 * 内存清理调度器
 */
export class CleanupScheduler {
  private cleanupTasks: Array<() => void> = [];
  private timer?: ReturnType<typeof setInterval>;

  /**
   * 注册清理任务
   */
  register(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  /**
   * 启动定时清理
   */
  start(interval = 60000): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.runCleanup();
    }, interval);
  }

  /**
   * 停止定时清理
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * 执行清理
   */
  runCleanup(): void {
    for (const task of this.cleanupTasks) {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    }
  }

  /**
   * 清空任务
   */
  clear(): void {
    this.cleanupTasks = [];
  }
}

// 全局实例
export const eventManager = new EventManager();
export const cleanupScheduler = new CleanupScheduler();

// 启动定时清理（每分钟）
cleanupScheduler.start(60000);

