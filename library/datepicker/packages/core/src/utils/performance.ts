/**
 * 性能优化工具
 */

/**
 * 请求动画帧节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): T {
  let rafId: number | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (rafId !== null) return;
    
    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  } as T;
}

/**
 * 空闲时执行
 */
export function runWhenIdle(callback: () => void, timeout = 2000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * 批处理更新
 */
export class BatchUpdater {
  private updates: Set<() => void> = new Set();
  private rafId: number | null = null;
  
  add(update: () => void): void {
    this.updates.add(update);
    this.scheduleFlush();
  }
  
  private scheduleFlush(): void {
    if (this.rafId !== null) return;
    
    this.rafId = requestAnimationFrame(() => {
      this.flush();
    });
  }
  
  private flush(): void {
    const updates = Array.from(this.updates);
    this.updates.clear();
    this.rafId = null;
    
    updates.forEach((update) => update());
  }
}

/**
 * 内存缓存
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移到最后（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项（第一个）
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

/**
 * 懒加载
 */
export function lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;
  
  return () => {
    if (!promise) {
      promise = loader();
    }
    return promise;
  };
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (start === undefined) return 0;
    
    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (end === undefined) return 0;
    
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  clear(): void {
    this.marks.clear();
  }
}




