/**
 * @ldesign/color - Optimized Cache Utilities
 * 
 * High-performance LRU cache with minimal memory overhead
 */

/**
 * Optimized LRU Cache using Map's built-in ordering
 * Reduces memory overhead by leveraging native Map iteration order
 */
export class ColorCache<T = any> {
  private cache: Map<string, T>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get a value from the cache - Optimized O(1)
   */
  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end for LRU using Map's ordering
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  /**
   * Set a value in the cache - Optimized memory usage
   */
  set(key: string, value: T): void {
    // Delete existing to move to end if present
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first in Map)
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }
    
    this.cache.set(key, value);
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics - Minimal memory footprint
   */
  getStats(): { size: number; maxSize: number; utilization: number } {
    const size = this.cache.size;
    return {
      size,
      maxSize: this.maxSize,
      utilization: Math.round((size / this.maxSize) * 100)
    };
  }
}

/**
 * Global cache instance for shared caching - reduced size to save memory
 */
export const globalColorCache = new ColorCache(200); // Reduced from 1000

// 页面卸载时清理缓存 - 使用 beforeunload 更可靠
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalColorCache.clear();
  }, { once: true });
  
  // 页面隐藏时减少缓存大小
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && globalColorCache.size > 50) {
      // Keep only recent 50 items when page is hidden
      const currentSize = globalColorCache.size;
      const toRemove = currentSize - 50;
      const keys = Array.from((globalColorCache as any).cache.keys());
      for (let i = 0; i < toRemove; i++) {
        if (keys[i] !== undefined) {
          globalColorCache.delete(keys[i] as string);
        }
      }
    }
  });
}

/**
 * Optimized memoization decorator with WeakMap for automatic memory cleanup
 */
const memoCache = new WeakMap<Function, Map<string, any>>();

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
  maxSize = 20 // Reduced default size
): T {
  // Use WeakMap to allow garbage collection
  let cache = memoCache.get(fn);
  if (!cache) {
    cache = new Map<string, ReturnType<T>>();
    memoCache.set(fn, cache);
  }
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : args.length === 1 ? String(args[0]) : JSON.stringify(args);
    
    const cached = cache!.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Limit cache size with LRU eviction
    if (cache!.size >= maxSize) {
      const firstKey = cache!.keys().next().value;
      if (firstKey !== undefined) {
        cache!.delete(firstKey);
      }
    }
    
    const result = fn(...args);
    cache!.set(key, result);
    return result;
  }) as T;
  
  // 添加清理方法
  (memoized as any).clear = () => {
    cache?.clear();
  };
  
  return memoized;
}

/**
 * Create a cache key from multiple values
 */
export function createCacheKey(...values: any[]): string {
  return values.map(v => {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }).join('-');
}
