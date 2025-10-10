/**
 * 缓存管理器
 */

import type { CacheConfig } from '../types';

interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

export class CacheManager {
  private _config: Required<CacheConfig>;
  private _cache: Map<string, CacheItem<any>> = new Map();
  private _accessOrder: string[] = [];

  constructor(config: CacheConfig = {}) {
    this._config = {
      enabled: config.enabled !== false,
      maxPages: config.maxPages || 50,
      strategy: config.strategy || 'lru',
      preloadPages: config.preloadPages || 3,
    };
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, value: T): void {
    if (!this._config.enabled) return;

    // 检查容量
    if (this._cache.size >= this._config.maxPages) {
      this._evict();
    }

    const now = Date.now();
    this._cache.set(key, {
      key,
      value,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
    });

    this._updateAccessOrder(key);
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    if (!this._config.enabled) return null;

    const item = this._cache.get(key);
    if (!item) return null;

    // 更新访问信息
    item.accessCount++;
    item.lastAccess = Date.now();
    this._updateAccessOrder(key);

    return item.value as T;
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this._cache.has(key);
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this._cache.delete(key);
    this._accessOrder = this._accessOrder.filter((k) => k !== key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this._cache.clear();
    this._accessOrder = [];
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this._cache.size;
  }

  /**
   * 更新访问顺序
   */
  private _updateAccessOrder(key: string): void {
    // 移除旧位置
    this._accessOrder = this._accessOrder.filter((k) => k !== key);
    // 添加到末尾
    this._accessOrder.push(key);
  }

  /**
   * 驱逐策略
   */
  private _evict(): void {
    switch (this._config.strategy) {
      case 'lru':
        this._evictLRU();
        break;
      case 'fifo':
        this._evictFIFO();
        break;
      case 'lfu':
        this._evictLFU();
        break;
    }
  }

  /**
   * LRU驱逐（最近最少使用）
   */
  private _evictLRU(): void {
    if (this._accessOrder.length === 0) return;

    const keyToEvict = this._accessOrder[0];
    this.delete(keyToEvict);
  }

  /**
   * FIFO驱逐（先进先出）
   */
  private _evictFIFO(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this._cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * LFU驱逐（最不经常使用）
   */
  private _evictLFU(): void {
    let lfuKey: string | null = null;
    let minCount = Infinity;

    for (const [key, item] of this._cache.entries()) {
      if (item.accessCount < minCount) {
        minCount = item.accessCount;
        lfuKey = key;
      }
    }

    if (lfuKey) {
      this.delete(lfuKey);
    }
  }
}
