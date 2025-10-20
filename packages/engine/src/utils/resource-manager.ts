/**
 * 统一资源管理器
 * 用于追踪和清理所有需要手动释放的资源
 * 
 * @example
 * ```typescript
 * const resources = new ResourceManager();
 * 
 * // 注册资源
 * const timerId = resources.registerTimeout(setTimeout(() => {}, 1000));
 * resources.registerListener(element, 'click', handler);
 * 
 * // 自动清理所有资源
 * resources.destroy();
 * ```
 */

// WeakRef 类型定义（兼容旧环境）
declare global {
  interface WeakRef<T extends object> {
    deref: () => T | undefined;
  }
  const WeakRef: {
    new <T extends object>(target: T): WeakRef<T>;
  };
}

// 使用兼容类型
type WeakRefType<T extends object> = typeof WeakRef extends undefined ? any : WeakRef<T>;

export class ResourceManager {
  // 定时器集合
  private timers = new Set<number>();
  private intervals = new Set<number>();
  
  // 观察器集合
  private observers = new Set<ResizeObserver | MutationObserver | IntersectionObserver>();
  
  // 事件监听器集合
  private listeners = new Map<EventTarget, Map<string, Set<EventListener>>>();
  
  // 动画帧集合
  private animationFrames = new Set<number>();
  
  // 弱引用集合（用于追踪，但不阻止 GC）
  private weakRefs = new Set<WeakRefType<any>>();
  
  // 自定义清理函数
  private cleanupFunctions = new Set<() => void>();
  
  // 是否已销毁
  private destroyed = false;

  /**
   * 注册定时器
   * @returns 定时器 ID
   */
  registerTimeout(id: number): number {
    this.checkDestroyed();
    this.timers.add(id);
    return id;
  }

  /**
   * 注销定时器
   */
  unregisterTimeout(id: number): void {
    clearTimeout(id);
    this.timers.delete(id);
  }

  /**
   * 注册间隔器
   * @returns 间隔器 ID
   */
  registerInterval(id: number): number {
    this.checkDestroyed();
    this.intervals.add(id);
    return id;
  }

  /**
   * 注销间隔器
   */
  unregisterInterval(id: number): void {
    clearInterval(id);
    this.intervals.delete(id);
  }

  /**
   * 注册观察器
   * @returns 观察器实例
   */
  registerObserver<T extends ResizeObserver | MutationObserver | IntersectionObserver>(
    observer: T
  ): T {
    this.checkDestroyed();
    this.observers.add(observer);
    return observer;
  }

  /**
   * 注销观察器
   */
  unregisterObserver<T extends ResizeObserver | MutationObserver | IntersectionObserver>(
    observer: T
  ): void {
    observer.disconnect();
    this.observers.delete(observer);
  }

  /**
   * 注册事件监听器
   */
  registerListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    this.checkDestroyed();
    
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }
    
    const eventMap = this.listeners.get(target)!;
    if (!eventMap.has(event)) {
      eventMap.set(event, new Set());
    }
    
    eventMap.get(event)!.add(listener);
    target.addEventListener(event, listener, options);
  }

  /**
   * 注销事件监听器
   */
  unregisterListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): void {
    const eventMap = this.listeners.get(target);
    if (!eventMap) return;
    
    const listeners = eventMap.get(event);
    if (!listeners) return;
    
    listeners.delete(listener);
    target.removeEventListener(event, listener, options);
    
    // 清理空集合
    if (listeners.size === 0) {
      eventMap.delete(event);
    }
    if (eventMap.size === 0) {
      this.listeners.delete(target);
    }
  }

  /**
   * 注册动画帧
   * @returns 动画帧 ID
   */
  registerAnimationFrame(id: number): number {
    this.checkDestroyed();
    this.animationFrames.add(id);
    return id;
  }

  /**
   * 注销动画帧
   */
  unregisterAnimationFrame(id: number): void {
    cancelAnimationFrame(id);
    this.animationFrames.delete(id);
  }

  /**
   * 注册弱引用
   * 用于追踪对象，但不阻止垃圾回收
   */
  registerWeakRef<T extends object>(ref: WeakRefType<T>): WeakRefType<T> {
    this.checkDestroyed();
    this.weakRefs.add(ref);
    return ref;
  }

  /**
   * 注册自定义清理函数
   */
  registerCleanup(fn: () => void): void {
    this.checkDestroyed();
    this.cleanupFunctions.add(fn);
  }

  /**
   * 注销自定义清理函数
   */
  unregisterCleanup(fn: () => void): void {
    this.cleanupFunctions.delete(fn);
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('ResourceManager has been destroyed');
    }
  }

  /**
   * 获取资源统计信息
   */
  getStats() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      observers: this.observers.size,
      listenerTargets: this.listeners.size,
      totalListeners: Array.from(this.listeners.values()).reduce(
        (sum, map) => sum + Array.from(map.values()).reduce((s, set) => s + set.size, 0),
        0
      ),
      animationFrames: this.animationFrames.size,
      weakRefs: this.weakRefs.size,
      cleanupFunctions: this.cleanupFunctions.size,
      destroyed: this.destroyed
    };
  }

  /**
   * 清理所有资源
   * 应在不再需要时调用
   */
  destroy(): void {
    if (this.destroyed) {
      return; // 避免重复销毁
    }

    // 清理定时器
    this.timers.forEach(id => clearTimeout(id));
    this.timers.clear();

    // 清理间隔器
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // 断开观察器
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect observer:', error);
      }
    });
    this.observers.clear();

    // 移除事件监听器
    this.listeners.forEach((eventMap, target) => {
      eventMap.forEach((listeners, event) => {
        listeners.forEach(listener => {
          try {
            target.removeEventListener(event, listener);
          } catch (error) {
            console.warn('Failed to remove event listener:', error);
          }
        });
      });
    });
    this.listeners.clear();

    // 取消动画帧
    this.animationFrames.forEach(id => {
      try {
        cancelAnimationFrame(id);
      } catch (error) {
        console.warn('Failed to cancel animation frame:', error);
      }
    });
    this.animationFrames.clear();

    // 执行自定义清理函数
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Failed to execute cleanup function:', error);
      }
    });
    this.cleanupFunctions.clear();

    // 清理弱引用集合（虽然不影响 GC，但释放集合本身）
    this.weakRefs.clear();

    // 标记为已销毁
    this.destroyed = true;
  }

  /**
   * 检查是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }
}

/**
 * 创建资源管理器实例
 */
export function createResourceManager(): ResourceManager {
  return new ResourceManager();
}

