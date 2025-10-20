import type { DeckGLLayer } from './types';
import { Logger } from './Logger';

/**
 * 缓存项接口
 */
interface CacheEntry {
  layer: DeckGLLayer;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // 估算的内存大小（字节）
}

/**
 * 缓存策略
 */
export type CacheStrategy = 'LRU' | 'LFU' | 'FIFO';

/**
 * LayerCache - 图层缓存管理器
 * 提供图层缓存功能，优化性能
 */
export class LayerCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxMemory: number;
  private strategy: CacheStrategy;
  private currentMemory: number = 0;
  private logger = Logger.getInstance();

  constructor(
    maxSize: number = 100,
    maxMemory: number = 100 * 1024 * 1024, // 100MB
    strategy: CacheStrategy = 'LRU'
  ) {
    this.maxSize = maxSize;
    this.maxMemory = maxMemory;
    this.strategy = strategy;
  }

  /**
   * 添加图层到缓存
   */
  set(key: string, layer: DeckGLLayer): void {
    const size = this.estimateLayerSize(layer);

    // 检查是否需要清理缓存
    while (
      (this.cache.size >= this.maxSize || this.currentMemory + size > this.maxMemory) &&
      this.cache.size > 0
    ) {
      this.evict();
    }

    const entry: CacheEntry = {
      layer,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      size
    };

    this.cache.set(key, entry);
    this.currentMemory += size;

    this.logger.debug(`Layer cached: ${key}, size: ${size} bytes, total memory: ${this.currentMemory} bytes`);
  }

  /**
   * 从缓存获取图层
   */
  get(key: string): DeckGLLayer | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // 更新访问统计
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.logger.debug(`Layer cache hit: ${key}, access count: ${entry.accessCount}`);

    return entry.layer;
  }

  /**
   * 检查缓存是否包含指定键
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentMemory -= entry.size;
      this.cache.delete(key);
      this.logger.debug(`Layer cache deleted: ${key}`);
      return true;
    }
    return false;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.currentMemory = 0;
    this.logger.info('Layer cache cleared');
  }

  /**
   * 驱逐缓存项（根据策略）
   */
  private evict(): void {
    if (this.cache.size === 0) {
      return;
    }

    let keyToEvict: string | null = null;

    switch (this.strategy) {
      case 'LRU': // Least Recently Used
        keyToEvict = this.findLRUKey();
        break;
      case 'LFU': // Least Frequently Used
        keyToEvict = this.findLFUKey();
        break;
      case 'FIFO': // First In First Out
        keyToEvict = this.findFIFOKey();
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.logger.debug(`Layer evicted (${this.strategy}): ${keyToEvict}`);
    }
  }

  /**
   * 查找最久未使用的键 (LRU)
   */
  private findLRUKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  /**
   * 查找最少使用的键 (LFU)
   */
  private findLFUKey(): string | null {
    let leastUsedKey: string | null = null;
    let leastCount = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    });

    return leastUsedKey;
  }

  /**
   * 查找最早添加的键 (FIFO)
   */
  private findFIFOKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  /**
   * 估算图层大小
   */
  private estimateLayerSize(layer: DeckGLLayer): number {
    // 简单估算：基于数据量
    const baseSize = 1024; // 1KB 基础大小
    let dataSize = 0;

    if (layer.props.data) {
      const data = layer.props.data;

      if (Array.isArray(data)) {
        // 数组数据
        dataSize = data.length * 100; // 每条数据估算 100 字节
      } else if (typeof data === 'object') {
        // 对象数据（如 GeoJSON）
        try {
          dataSize = JSON.stringify(data).length;
        } catch (error) {
          dataSize = 10000; // 默认 10KB
        }
      }
    }

    return baseSize + dataSize;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    memory: number;
    maxMemory: number;
    hitRate: number;
    entries: Array<{
      key: string;
      size: number;
      accessCount: number;
      age: number;
    }>;
  } {
    const entries: Array<{
      key: string;
      size: number;
      accessCount: number;
      age: number;
    }> = [];

    const now = Date.now();
    this.cache.forEach((entry, key) => {
      entries.push({
        key,
        size: entry.size,
        accessCount: entry.accessCount,
        age: now - entry.timestamp
      });
    });

    // 计算命中率（简单实现）
    const totalAccess = entries.reduce((sum, e) => sum + e.accessCount, 0);
    const hitRate = entries.length > 0 ? totalAccess / entries.length : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memory: this.currentMemory,
      maxMemory: this.maxMemory,
      hitRate,
      entries
    };
  }

  /**
   * 设置缓存策略
   */
  setStrategy(strategy: CacheStrategy): void {
    this.strategy = strategy;
    this.logger.info(`Cache strategy changed to: ${strategy}`);
  }

  /**
   * 设置最大缓存大小
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;

    // 如果当前大小超过新的最大值，进行清理
    while (this.cache.size > maxSize) {
      this.evict();
    }
  }

  /**
   * 设置最大内存限制
   */
  setMaxMemory(maxMemory: number): void {
    this.maxMemory = maxMemory;

    // 如果当前内存超过新的最大值，进行清理
    while (this.currentMemory > maxMemory && this.cache.size > 0) {
      this.evict();
    }
  }

  /**
   * 获取缓存大小
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * 获取当前内存使用量
   */
  getMemoryUsage(): number {
    return this.currentMemory;
  }

  /**
   * 优化缓存（移除过期或很少使用的项）
   */
  optimize(): void {
    const threshold = Date.now() - 30 * 60 * 1000; // 30分钟

    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      // 删除超过30分钟未访问的项
      if (entry.lastAccessed < threshold) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.info(`Cache optimized: removed ${keysToDelete.length} stale entries`);
    }
  }
}

/**
 * 全局图层缓存实例
 */
export const globalLayerCache = new LayerCache();









