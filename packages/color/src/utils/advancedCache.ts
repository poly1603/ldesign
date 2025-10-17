/**
 * @ldesign/color - Advanced Cache Utilities
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
  value: T;
  frequency: number;
  lastAccess: number;
  createdAt: number;
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
export class AdvancedColorCache<T = any> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;
  private strategy: CacheStrategy;
  private stats: { hits: number; misses: number };
  private persistKey?: string;
  // private prewarmed: boolean = false; // Kept for future use

  constructor(maxSize = 100, strategy: CacheStrategy = 'LRU', persistKey?: string) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.strategy = strategy;
    this.stats = { hits: 0, misses: 0 };
    this.persistKey = persistKey;
    
    // 尝试从持久化存储恢复缓存
    if (persistKey) {
      this.restore();
    }
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (item) {
      this.stats.hits++;
      item.frequency++;
      item.lastAccess = Date.now();
      
      // LRU: 移动到末尾
      if (this.strategy === 'LRU') {
        this.cache.delete(key);
        this.cache.set(key, item);
      }
      
      return item.value;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    const now = Date.now();
    
    // 如果缓存已满，根据策略移除项目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evict();
    }
    
    const existing = this.cache.get(key);
    const item: CacheItem<T> = {
      value,
      frequency: existing ? existing.frequency + 1 : 1,
      lastAccess: now,
      createdAt: existing ? existing.createdAt : now
    };
    
    this.cache.set(key, item);
    
    // 定期持久化
    if (this.persistKey && this.cache.size % 10 === 0) {
      this.persist();
    }
  }
  
  /**
   * 根据策略移除缓存项
   */
  private evict(): void {
    let keyToRemove: string | undefined;
    
    switch (this.strategy) {
      case 'LFU': // 最不经常使用
        let minFreq = Infinity;
        let oldestTime = Infinity;
        
        for (const [key, item] of this.cache.entries()) {
          if (item.frequency < minFreq || 
              (item.frequency === minFreq && item.lastAccess < oldestTime)) {
            minFreq = item.frequency;
            oldestTime = item.lastAccess;
            keyToRemove = key;
          }
        }
        break;
        
      case 'FIFO': // 先进先出
        let oldestCreate = Infinity;
        
        for (const [key, item] of this.cache.entries()) {
          if (item.createdAt < oldestCreate) {
            oldestCreate = item.createdAt;
            keyToRemove = key;
          }
        }
        break;
        
      case 'LRU': // 最近最少使用
      default:
        // Map保持插入顺序，第一个就是最旧的
        keyToRemove = this.cache.keys().next().value;
        break;
    }
    
    if (keyToRemove) {
      this.cache.delete(keyToRemove);
    }
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
    this.stats = { hits: 0, misses: 0 };
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
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100
    };
  }
  
  /**
   * 缓存预热
   */
  prewarm(data: Array<{ key: string; value: T }>): void {
    for (const { key, value } of data) {
      this.set(key, value);
    }
    // this.prewarmed = true;
  }
  
  /**
   * 持久化缓存到localStorage
   */
  persist(): void {
    if (!this.persistKey || typeof window === 'undefined') return;
    
    try {
      const data = Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        value: item.value,
        frequency: item.frequency,
        lastAccess: item.lastAccess,
        createdAt: item.createdAt
      }));
      
      localStorage.setItem(this.persistKey, JSON.stringify({
        data,
        stats: this.stats,
        strategy: this.strategy,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }
  
  /**
   * 从localStorage恢复缓存
   */
  restore(): void {
    if (!this.persistKey || typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.persistKey);
      if (!stored) return;
      
      const { data, stats, timestamp } = JSON.parse(stored);
      
      // 检查缓存是否过期（24小时）
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(this.persistKey);
        return;
      }
      
      // 恢复缓存数据
      this.cache.clear();
      for (const { key, value, frequency, lastAccess, createdAt } of data) {
        this.cache.set(key, {
          value,
          frequency,
          lastAccess,
          createdAt
        });
      }
      
      this.stats = stats;
      // this.prewarmed = true;
    } catch (error) {
      console.error('Failed to restore cache:', error);
    }
  }
  
  /**
   * 获取最常用的缓存项
   */
  getMostFrequent(count = 10): Array<{ key: string; value: T; frequency: number }> {
    return Array.from(this.cache.entries())
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, count)
      .map(([key, item]) => ({
        key,
        value: item.value,
        frequency: item.frequency
      }));
  }
  
  /**
   * 优化缓存大小
   */
  optimize(): void {
    // 移除使用频率低于平均值50%的项
    const frequencies = Array.from(this.cache.values()).map(item => item.frequency);
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const threshold = avgFrequency * 0.5;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.frequency < threshold) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * 设置缓存策略
   */
  setStrategy(strategy: CacheStrategy): void {
    this.strategy = strategy;
  }
  
  /**
   * 获取缓存快照
   */
  snapshot(): Array<{ key: string; value: T }> {
    return Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      value: item.value
    }));
  }
}

/**
 * Global cache instance with LFU strategy for shared caching
 */
export const globalColorCache = new AdvancedColorCache(1000, 'LFU', 'ldesign-color-cache');

/**
 * Cache decorator for memoizing function results with advanced caching
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    maxSize?: number;
    strategy?: CacheStrategy;
    getKey?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = new AdvancedColorCache<ReturnType<T>>(
    options?.maxSize || 100,
    options?.strategy || 'LRU'
  );
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = options?.getKey ? options.getKey(...args) : JSON.stringify(args);
    
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
