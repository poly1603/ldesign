/**
 * 智能缓存系统 - 使用弱引用减少内存占用
 */

/**
 * 缓存项
 */
interface CacheItem {
  ref: WeakRef<any>;
  timestamp: number;
  ttl?: number;
}

/**
 * 图表缓存管理器
 */
export class ChartCache {
  private cache = new Map<string, CacheItem>();
  private registry = new FinalizationRegistry<string>((key) => {
    this.cache.delete(key);
  });
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * 设置缓存（使用弱引用）
   */
  set(key: string, value: any, ttl?: number): void {
    // 清理过期缓存
    this.cleanup();

    // 如果超过最大数量，删除最旧的缓存
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    const ref = new WeakRef(value);
    const item: CacheItem = {
      ref,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    };

    this.cache.set(key, item);
    this.registry.register(value, key);
  }

  /**
   * 获取缓存
   */
  get<T = any>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // 检查是否过期
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return undefined;
    }

    // 尝试解引用
    const value = item.ref.deref();
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }

    return value;
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      // 检查是否过期
      if (item.ttl && now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
        continue;
      }

      // 检查引用是否还存在
      if (!item.ref.deref()) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * 获取最旧的缓存键
   */
  private getOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * 获取缓存统计信息
   */
  stats(): {
    size: number;
    maxSize: number;
    keys: string[];
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 设置最大缓存数量
   */
  setMaxSize(size: number): void {
    this.maxSize = size;
    this.cleanup();
  }

  /**
   * 设置默认 TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

// 全局缓存实例
export const chartCache = new ChartCache();

