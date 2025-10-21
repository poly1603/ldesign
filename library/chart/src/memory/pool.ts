/**
 * 对象池 - 复用对象减少 GC 压力
 */

/**
 * 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize = 10,
    maxSize = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
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
    }
  }
}

/**
 * 数组对象池
 */
export const arrayPool = new ObjectPool<any[]>(
  () => [],
  (arr) => (arr.length = 0),
  20,
  100
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
    reset: (obj: T) => void
  ): ObjectPool<T> {
    if (!this.pools.has(name)) {
      this.pools.set(name, new ObjectPool(factory, reset));
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
}

// 全局对象池工厂
export const poolFactory = new PoolFactory();

