/**
 * 智能缓存系统 - 使用弱引用减少内存占用，LRU 策略，命中率统计
 */

/**
 * 缓存项
 */
interface CacheItem {
  ref: WeakRef<any>;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccess: number;
  size?: number;
}

/**
 * 缓存统计
 */
interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  totalAccess: number;
  memoryUsage: number;
}

/**
 * 高性能哈希函数
 */
function fastHash(obj: any): string {
  if (typeof obj === 'string') return obj;

  // 使用快速哈希算法替代 JSON.stringify
  const type = typeof obj;
  if (type === 'number' || type === 'boolean') return String(obj);
  if (type === 'undefined') return 'undefined';
  if (obj === null) return 'null';

  if (Array.isArray(obj)) {
    // 对数组进行采样哈希（大数组时）
    const len = obj.length;
    if (len > 100) {
      // 采样：首、中、尾 + 长度
      const samples = [
        obj[0],
        obj[Math.floor(len / 2)],
        obj[len - 1],
        len
      ];
      return `arr:${samples.map(v => fastHash(v)).join(',')}`;
    }
    return `arr:${obj.map(v => fastHash(v)).join(',')}`;
  }

  if (type === 'object') {
    const keys = Object.keys(obj).sort();
    const parts = keys.slice(0, 20).map(k => `${k}:${fastHash(obj[k])}`);
    return `obj:{${parts.join(',')}}`;
  }

  return String(obj);
}

/**
 * 图表缓存管理器 - LRU 策略
 */
export class ChartCache {
  private cache = new Map<string, CacheItem>();
  private registry = new FinalizationRegistry<string>((key) => {
    this.cache.delete(key);
  });
  private maxSize: number;
  private defaultTTL: number;

  // 统计信息
  private hits = 0;
  private misses = 0;
  private memoryUsage = 0;

  // 自适应配置
  private autoResize = true;
  private targetHitRate = 0.7;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;

    // 定期清理和自适应调整
    this.startAutoMaintenance();
  }

  /**
   * 设置缓存（使用弱引用和 LRU 策略）
   */
  set(key: string, value: any, ttl?: number): void {
    // 清理过期缓存
    this.cleanup();

    // 如果超过最大数量，使用 LRU 策略删除
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.getLRUKey();
      if (lruKey) {
        this.delete(lruKey);
      }
    }

    const now = Date.now();
    const size = this.estimateSize(value);

    const ref = new WeakRef(value);
    const item: CacheItem = {
      ref,
      timestamp: now,
      lastAccess: now,
      accessCount: 0,
      ttl: ttl ?? this.defaultTTL,
      size,
    };

    this.cache.set(key, item);
    this.registry.register(value, key);
    this.memoryUsage += size;
  }

  /**
   * 获取缓存（带 LRU 更新）
   */
  get<T = any>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return undefined;
    }

    // 检查是否过期
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      this.misses++;
      return undefined;
    }

    // 尝试解引用
    const value = item.ref.deref();
    if (!value) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // 更新 LRU 信息
    item.lastAccess = Date.now();
    item.accessCount++;
    this.hits++;

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
    const item = this.cache.get(key);
    if (item && item.size) {
      this.memoryUsage -= item.size;
    }
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.memoryUsage = 0;
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
        if (item.size) this.memoryUsage -= item.size;
        continue;
      }

      // 检查引用是否还存在
      if (!item.ref.deref()) {
        keysToDelete.push(key);
        if (item.size) this.memoryUsage -= item.size;
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * 获取 LRU 键（最近最少使用）
   */
  private getLRUKey(): string | undefined {
    let lruKey: string | undefined;
    let lruScore = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // LRU 评分：考虑最后访问时间和访问频率
      const timeSinceAccess = Date.now() - item.lastAccess;
      const score = timeSinceAccess / Math.max(1, item.accessCount);

      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }

    return lruKey;
  }

  /**
   * 估算对象大小（字节）
   */
  private estimateSize(obj: any): number {
    const type = typeof obj;

    if (type === 'string') return obj.length * 2; // UTF-16
    if (type === 'number') return 8;
    if (type === 'boolean') return 4;
    if (obj === null || obj === undefined) return 0;

    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.estimateSize(item), 24);
    }

    if (type === 'object') {
      return Object.keys(obj).reduce(
        (sum, key) => sum + key.length * 2 + this.estimateSize(obj[key]),
        40
      );
    }

    return 8;
  }

  /**
   * 启动自动维护
   */
  private maintenanceTimer?: ReturnType<typeof setInterval>;

  private startAutoMaintenance(): void {
    // 每 30 秒进行一次清理和自适应调整
    this.maintenanceTimer = setInterval(() => {
      this.cleanup();
      this.adaptiveResize();
    }, 30000);
  }

  /**
   * 自适应调整缓存大小
   */
  private adaptiveResize(): void {
    if (!this.autoResize) return;

    const totalAccess = this.hits + this.misses;
    if (totalAccess < 100) return; // 数据量不足

    const hitRate = this.hits / totalAccess;

    // 如果命中率低于目标，增加缓存大小
    if (hitRate < this.targetHitRate && this.maxSize < 500) {
      this.maxSize = Math.min(500, Math.floor(this.maxSize * 1.2));
    }
    // 如果命中率很高且内存使用率低，可以适当减小
    else if (hitRate > 0.9 && this.cache.size < this.maxSize * 0.5) {
      this.maxSize = Math.max(50, Math.floor(this.maxSize * 0.9));
    }
  }

  /**
   * 获取缓存统计信息
   */
  stats(): CacheStats {
    const totalAccess = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalAccess > 0 ? this.hits / totalAccess : 0,
      totalAccess,
      memoryUsage: this.memoryUsage,
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 设置最大缓存数量
   */
  setMaxSize(size: number): void {
    this.maxSize = size;
    this.cleanup();

    // 如果当前大小超过新的限制，清理超出部分
    while (this.cache.size > this.maxSize) {
      const lruKey = this.getLRUKey();
      if (lruKey) this.delete(lruKey);
    }
  }

  /**
   * 设置默认 TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  /**
   * 启用/禁用自动调整
   */
  setAutoResize(enabled: boolean): void {
    this.autoResize = enabled;
  }

  /**
   * 设置目标命中率
   */
  setTargetHitRate(rate: number): void {
    this.targetHitRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
      this.maintenanceTimer = undefined;
    }
    this.clear();
  }

  /**
   * 生成缓存键（使用高性能哈希）
   */
  static generateKey(obj: any): string {
    return fastHash(obj);
  }
}

// 全局缓存实例
export const chartCache = new ChartCache();

// 导出哈希函数供外部使用
export { fastHash };

