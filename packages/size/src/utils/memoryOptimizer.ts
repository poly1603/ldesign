/**
 * @ldesign/size - Memory Optimizer
 * 
 * 使用 WeakMap 和 WeakRef 优化内存占用
 */

// TypeScript 类型定义
declare global {
  interface WeakRefConstructor {
    new <T extends object>(target: T): WeakRef<T>
  }
  
  interface WeakRef<T extends object> {
    deref: () => T | undefined
  }
  
  interface FinalizationRegistryConstructor {
    new <T>(cleanupCallback: (heldValue: T) => void): FinalizationRegistry<T>
  }
  
  interface FinalizationRegistry<T> {
    register: (target: object, heldValue: T, unregisterToken?: object) => void
    unregister: (unregisterToken: object) => void
  }
  
  const WeakRef: WeakRefConstructor
  const FinalizationRegistry: FinalizationRegistryConstructor
}

/**
 * WeakRef 缓存管理器
 * 使用 WeakRef 避免强引用导致的内存泄漏
 */
export class WeakRefCache<K, V extends object> {
  private cache = new Map<K, WeakRef<V>>();
  private finalizationRegistry?: FinalizationRegistry<K>;
  
  constructor() {
    // 使用 FinalizationRegistry 自动清理失效的 WeakRef
    if (typeof globalThis !== 'undefined' && 'FinalizationRegistry' in globalThis) {
      this.finalizationRegistry = new FinalizationRegistry((key: K) => {
        this.cache.delete(key);
      });
    }
  }
  
  set(key: K, value: V): void {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    
    // 注册清理回调
    if (this.finalizationRegistry) {
      this.finalizationRegistry.register(value, key);
    }
  }
  
  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    if (!ref) return undefined;
    
    const value = ref.deref();
    // 如果对象已被回收，删除缓存项
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }
    
    return value;
  }
  
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  get size(): number {
    // 清理已失效的引用
    this.cleanup();
    return this.cache.size;
  }
  
  private cleanup(): void {
    const keysToDelete: K[] = [];
    
    for (const [key, ref] of this.cache.entries()) {
      if (!ref.deref()) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }
}

/**
 * 对象关联的弱映射缓存
 * 当对象被回收时，相关缓存会自动清理
 */
export class ObjectAssociatedCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  
  set(key: K, value: V): void {
    this.cache.set(key, value);
  }
  
  get(key: K): V | undefined {
    return this.cache.get(key);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

/**
 * 自动过期的缓存
 * 结合 WeakRef 和 TTL 策略
 */
export class ExpiringCache<K, V extends object> {
  private cache = new Map<K, { ref: WeakRef<V>; expires: number }>();
  private defaultTTL: number;
  private cleanupInterval: number;
  private cleanupTimer?: ReturnType<typeof setInterval>;
  
  constructor(ttl = 60000, cleanupInterval = 30000) {
    this.defaultTTL = ttl;
    this.cleanupInterval = cleanupInterval;
    this.startCleanup();
  }
  
  set(key: K, value: V, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    const ref = new WeakRef(value);
    this.cache.set(key, { ref, expires });
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // 检查是否过期
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    // 尝试解引用
    const value = entry.ref.deref();
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }
    
    return value;
  }
  
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private startCleanup(): void {
    if (typeof setInterval === 'undefined') return;
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
    
    // 确保在 Node.js 环境中不会阻止退出
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: K[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      // 检查过期
      if (now > entry.expires) {
        keysToDelete.push(key);
        continue;
      }
      
      // 检查弱引用
      if (!entry.ref.deref()) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }
  
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.cache.clear();
  }
}

/**
 * 双层缓存：强引用 + 弱引用
 * 热数据使用强引用，冷数据降级为弱引用
 */
export class TieredCache<K, V extends object> {
  private hotCache = new Map<K, V>();
  private coldCache = new Map<K, WeakRef<V>>();
  private maxHotSize: number;
  private accessCount = new Map<K, number>();
  private readonly PROMOTION_THRESHOLD = 3;
  
  constructor(maxHotSize = 100) {
    this.maxHotSize = maxHotSize;
  }
  
  set(key: K, value: V): void {
    // 新数据先放入冷缓存
    this.coldCache.set(key, new WeakRef(value));
    this.accessCount.set(key, 1);
  }
  
  get(key: K): V | undefined {
    // 先检查热缓存
    let value = this.hotCache.get(key);
    if (value) {
      this.incrementAccessCount(key);
      return value;
    }
    
    // 检查冷缓存
    const ref = this.coldCache.get(key);
    if (ref) {
      value = ref.deref();
      if (value) {
        this.incrementAccessCount(key);
        
        // 如果访问次数达到阈值，提升到热缓存
        const count = this.accessCount.get(key) ?? 0;
        if (count >= this.PROMOTION_THRESHOLD) {
          this.promoteToHot(key, value);
        }
        
        return value;
      } else {
        // 弱引用已失效
        this.coldCache.delete(key);
        this.accessCount.delete(key);
      }
    }
    
    return undefined;
  }
  
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  
  delete(key: K): boolean {
    this.accessCount.delete(key);
    const hot = this.hotCache.delete(key);
    const cold = this.coldCache.delete(key);
    return hot || cold;
  }
  
  clear(): void {
    this.hotCache.clear();
    this.coldCache.clear();
    this.accessCount.clear();
  }
  
  private incrementAccessCount(key: K): void {
    const count = this.accessCount.get(key) ?? 0;
    this.accessCount.set(key, count + 1);
  }
  
  private promoteToHot(key: K, value: V): void {
    // 如果热缓存已满，降级最少访问的项
    if (this.hotCache.size >= this.maxHotSize) {
      this.demoteLeastAccessed();
    }
    
    this.coldCache.delete(key);
    this.hotCache.set(key, value);
  }
  
  private demoteLeastAccessed(): void {
    let minKey: K | undefined;
    let minCount = Infinity;
    
    for (const key of this.hotCache.keys()) {
      const count = this.accessCount.get(key) ?? 0;
      if (count < minCount) {
        minCount = count;
        minKey = key;
      }
    }
    
    if (minKey !== undefined) {
      const value = this.hotCache.get(minKey);
      if (value) {
        this.hotCache.delete(minKey);
        this.coldCache.set(minKey, new WeakRef(value));
        // 重置访问计数
        this.accessCount.set(minKey, 0);
      }
    }
  }
  
  getStats(): {
    hotSize: number;
    coldSize: number;
    totalAccessCount: number;
  } {
    const coldSize = Array.from(this.coldCache.values())
      .filter(ref => ref.deref())
      .length;
    
    const totalAccessCount = Array.from(this.accessCount.values())
      .reduce((sum, count) => sum + count, 0);
    
    return {
      hotSize: this.hotCache.size,
      coldSize,
      totalAccessCount
    };
  }
}

// 导出便捷实例
export const memoryOptimizer = {
  createWeakRefCache: <K, V extends object>() => new WeakRefCache<K, V>(),
  createObjectCache: <K extends object, V>() => new ObjectAssociatedCache<K, V>(),
  createExpiringCache: <K, V extends object>(ttl?: number) => new ExpiringCache<K, V>(ttl),
  createTieredCache: <K, V extends object>(maxHotSize?: number) => new TieredCache<K, V>(maxHotSize)
};


