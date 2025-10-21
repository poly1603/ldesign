/**
 * 对象池 - 复用对象减少 GC 压力，动态调整，性能统计
 */

/**
 * 对象池统计
 */
interface PoolStats {
  size: number;
  maxSize: number;
  acquired: number;
  released: number;
  created: number;
  hitRate: number;
}

/**
 * 对象池（优化版）
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;
  private minSize: number;

  // 统计信息
  private acquiredCount = 0;
  private releasedCount = 0;
  private createdCount = 0;
  private hitCount = 0;
  private missCount = 0;

  // 自适应配置
  private autoResize = true;
  private resizeThreshold = 0.8; // 使用率超过 80% 时扩容

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize = 10,
    maxSize = 100,
    minSize = 5
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    this.minSize = minSize;

    // 预创建对象
    this.warmup(initialSize);
  }

  /**
   * 获取对象（带统计）
   */
  acquire(): T {
    this.acquiredCount++;

    if (this.pool.length > 0) {
      this.hitCount++;
      return this.pool.pop()!;
    }

    this.missCount++;
    this.createdCount++;

    // 自适应扩容
    if (this.autoResize) {
      this.checkAndResize();
    }

    return this.factory();
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    this.releasedCount++;

    if (this.pool.length < this.maxSize) {
      try {
        this.reset(obj);
        this.pool.push(obj);
      } catch (error) {
        console.error('Failed to reset object:', error);
      }
    }
  }

  /**
   * 检查并调整池大小
   */
  private checkAndResize(): void {
    const hitRate = this.acquiredCount > 0 ? this.hitCount / this.acquiredCount : 0;

    // 命中率低于阈值，考虑扩容
    if (hitRate < (1 - this.resizeThreshold) && this.maxSize < 1000) {
      const newSize = Math.min(1000, Math.floor(this.maxSize * 1.5));
      this.maxSize = newSize;
    }

    // 命中率很高，考虑缩容
    if (hitRate > 0.95 && this.pool.length > this.minSize * 2) {
      const removeCount = Math.floor((this.pool.length - this.minSize) / 2);
      this.pool.splice(0, removeCount);
    }
  }

  /**
   * 批量释放
   */
  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * 获取池大小
   */
  size(): number {
    return this.pool.length;
  }

  /**
   * 预热对象池
   */
  warmup(count: number): void {
    const needed = count - this.pool.length;
    for (let i = 0; i < needed && this.pool.length < this.maxSize; i++) {
      this.pool.push(this.factory());
      this.createdCount++;
    }
  }

  /**
   * 获取统计信息
   */
  stats(): PoolStats {
    return {
      size: this.pool.length,
      maxSize: this.maxSize,
      acquired: this.acquiredCount,
      released: this.releasedCount,
      created: this.createdCount,
      hitRate: this.acquiredCount > 0 ? this.hitCount / this.acquiredCount : 0,
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.acquiredCount = 0;
    this.releasedCount = 0;
    this.createdCount = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * 设置自动调整
   */
  setAutoResize(enabled: boolean): void {
    this.autoResize = enabled;
  }

  /**
   * 设置调整阈值
   */
  setResizeThreshold(threshold: number): void {
    this.resizeThreshold = Math.max(0, Math.min(1, threshold));
  }
}

/**
 * 数组对象池
 */
export const arrayPool = new ObjectPool<any[]>(
  () => [],
  (arr) => (arr.length = 0),
  20,
  100,
  10
);

/**
 * 对象池（Object）
 */
export const objectPool = new ObjectPool<Record<string, any>>(
  () => ({}),
  (obj) => {
    for (const key in obj) {
      delete obj[key];
    }
  },
  20,
  100,
  10
);

/**
 * Set 对象池
 */
export const setPool = new ObjectPool<Set<any>>(
  () => new Set(),
  (set) => set.clear(),
  10,
  50,
  5
);

/**
 * Map 对象池
 */
export const mapPool = new ObjectPool<Map<any, any>>(
  () => new Map(),
  (map) => map.clear(),
  10,
  50,
  5
);

/**
 * 对象池工厂
 */
export class PoolFactory {
  private pools = new Map<string, ObjectPool<any>>();

  /**
   * 创建或获取对象池
   */
  getPool<T>(
    name: string,
    factory: () => T,
    reset: (obj: T) => void,
    initialSize?: number,
    maxSize?: number,
    minSize?: number
  ): ObjectPool<T> {
    if (!this.pools.has(name)) {
      this.pools.set(name, new ObjectPool(factory, reset, initialSize, maxSize, minSize));
    }
    return this.pools.get(name) as ObjectPool<T>;
  }

  /**
   * 清除所有对象池
   */
  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    this.pools.clear();
  }

  /**
   * 获取所有对象池的统计信息
   */
  getAllStats(): Map<string, PoolStats> {
    const stats = new Map<string, PoolStats>();
    for (const [name, pool] of this.pools.entries()) {
      stats.set(name, pool.stats());
    }
    return stats;
  }
}

// 全局对象池工厂
export const poolFactory = new PoolFactory();


