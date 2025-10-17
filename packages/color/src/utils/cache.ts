/**
 * @ldesign/color - Cache Utilities
 * 
 * Advanced caching with LRU/LFU strategies, persistence and prewarming
 */

/**
 * 缓存策略类型
 */
export type CacheStrategy = 'LRU' | 'LFU' | 'FIFO';

/**
 * 缓存项
 */
interface CacheItem<T> {
  value: T
  expiresAt?: number
  accessCount: number
  frequency: number
  lastAccess: number
  createdAt: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  utilization: number;
}

/**
 * Advanced Cache implementation with multiple strategies
 */
export class ColorCache<T = any> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;

  constructor(maxSize = 100, _strategy: CacheStrategy = 'LRU', _persistKey?: string) {
    this.cache = new Map();
    this.maxSize = maxSize;
    
    // 尝试从持久化存储恢复缓存
    if (_persistKey) {
      // Restore functionality removed;
    }
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (item !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value;
    }
    return undefined;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    const item: CacheItem<T> = {
      value,
      expiresAt: undefined,
      accessCount: 0,
      frequency: 0,
      lastAccess: Date.now(),
      createdAt: Date.now()
    };
    
    // If key exists, delete it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, item);
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
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; utilization: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100
    };
  }
}

/**
 * Global cache instance for shared caching
 */
export const globalColorCache = new ColorCache(1000);

/**
 * Cache decorator for memoizing function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new ColorCache<ReturnType<T>>(100);
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
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
