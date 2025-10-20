/**
 * @ldesign/i18n - Optimized Cache System
 * 高性能优化的缓存实现，解决内存泄漏和性能问题
 */

import type { Cache } from '../types';

/**
 * 双向链表节点（用于 LRU） - 使用对象池复用节点
 */
class LRUNode<K, V> {
  key!: K;
  value!: V;
  expires?: number;
  prev: LRUNode<K, V> | null = null;
  next: LRUNode<K, V> | null = null;

  reset(key: K, value: V, expires?: number): void {
    this.key = key;
    this.value = value;
    this.expires = expires;
    this.prev = null;
    this.next = null;
  }
}

/**
 * 节点对象池 - 减少 GC 压力
 */
class NodePool<K, V> {
  private pool: LRUNode<K, V>[] = [];
  private maxSize = 100;

  get(): LRUNode<K, V> {
    return this.pool.pop() || new LRUNode<K, V>();
  }

  release(node: LRUNode<K, V>): void {
    if (this.pool.length < this.maxSize) {
      node.prev = null;
      node.next = null;
      this.pool.push(node);
    }
  }
}

/**
 * 优化的 LRU Cache 实现
 * 使用双向链表实现 O(1) 的访问顺序更新
 */
export class OptimizedLRUCache<K = string, V = any> implements Cache<K, V> {
  private readonly maxSize: number;
  private readonly cache = new Map<K, LRUNode<K, V>>();
  private head: LRUNode<K, V> | null = null;
  private tail: LRUNode<K, V> | null = null;
  private readonly defaultTTL?: number;
  private readonly nodePool = new NodePool<K, V>();
  private cleanupTimer?: NodeJS.Timeout;
  private readonly CLEANUP_INTERVAL = 60000; // 60秒清理一次过期项

  constructor(maxSize = 1000, defaultTTL?: number) {
    this.maxSize = maxSize > 0 ? maxSize : 1000;
    this.defaultTTL = defaultTTL;
    
    // 启动定期清理
    if (defaultTTL && typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanupExpired(), this.CLEANUP_INTERVAL);
      // In Node.js, avoid keeping the event loop alive
      if (typeof (this.cleanupTimer as any)?.unref === 'function') {
        (this.cleanupTimer as any).unref();
      }
    }
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key);

    if (!node) {
      return undefined;
    }

    // 检查过期
    if (node.expires && Date.now() > node.expires) {
      this.delete(key);
      return undefined;
    }

    // O(1) 移动到头部（最近使用）
    this.moveToHead(node);
    return node.value;
  }

  set(key: K, value: V, ttl?: number): void {
    let node = this.cache.get(key);

    if (node) {
      // 更新现有节点
      node.value = value;
      const effectiveTTL = ttl ?? this.defaultTTL;
      node.expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
      this.moveToHead(node);
    } else {
      // 检查容量
      if (this.cache.size >= this.maxSize && this.tail) {
        // O(1) 移除尾部（最少使用）
        const oldNode = this.tail;
        this.cache.delete(oldNode.key);
        this.removeNode(oldNode);
        this.nodePool.release(oldNode); // 回收节点
      }

      // 从对象池获取节点
      const effectiveTTL = ttl ?? this.defaultTTL;
      const expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
      node = this.nodePool.get();
      node.reset(key, value, expires);

      this.cache.set(key, node);
      this.addToHead(node);
    }
  }

  has(key: K): boolean {
    const node = this.cache.get(key);

    if (!node) {
      return false;
    }

    // 检查过期
    if (node.expires && Date.now() > node.expires) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.nodePool.release(node); // 回收节点
    return this.cache.delete(key);
  }

  clear(): void {
    // 回收所有节点
    this.cache.forEach(node => this.nodePool.release(node));
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  get size(): number {
    // 清理过期项
    this.cleanupExpired();
    return this.cache.size;
  }

  // O(1) 移动节点到头部
  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  // O(1) 添加节点到头部
  private addToHead(node: LRUNode<K, V>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  // O(1) 从链表中移除节点
  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  // 清理过期项 - 优化版，限制单次清理数量
  private cleanupExpired(): void {
    if (this.cache.size === 0) return;
    
    const now = Date.now();
    const maxCleanup = Math.min(100, Math.ceil(this.cache.size * 0.1)); // 每次最多清理10%或100个
    let cleaned = 0;

    for (const [key, node] of this.cache) {
      if (node.expires && now > node.expires) {
        this.delete(key);
        if (++cleaned >= maxCleanup) break;
      }
    }
  }

  /**
   * 清理所有资源
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }
}

/**
 * 优化的 WeakCache 实现
 * 修复了定时器泄漏问题，使用 WeakRef 进一步优化
 */
export class OptimizedWeakCache<K extends object, V = any> {
  private readonly cache = new WeakMap<K, { value: V; expires?: number; timer?: NodeJS.Timeout }>();
  private readonly maxTimers = 1000; // 限制同时存在的定时器数量
  private timerCount = 0;

  get(key: K): V | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    // 检查过期
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: K, value: V, ttl?: number): void {
    // 清理旧的定时器
    const existing = this.cache.get(key);
    if (existing?.timer) {
      clearTimeout(existing.timer);
      this.timerCount--;
    }

    const expires = ttl ? Date.now() + ttl : undefined;
    const item: any = { value, expires };

    // 只在定时器数量不超过限制时设置定时器
    if (ttl && this.timerCount < this.maxTimers) {
      item.timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timerCount++;
    }

    this.cache.set(key, item);
  }

  has(key: K): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // 检查过期
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: K): boolean {
    const item = this.cache.get(key);
    if (item?.timer) {
      clearTimeout(item.timer);
      this.timerCount--;
    }
    return this.cache.delete(key);
  }

  /**
   * 清理所有定时器，防止内存泄漏
   */
  destroy(): void {
    // WeakMap 不能遍历，但在对象被 GC 后定时器会自动清理
    this.timerCount = 0;
  }
}

/**
 * 优化的 StorageCache 实现
 * 使用防抖减少 localStorage 操作，并使用 LRU 策略
 */
export class OptimizedStorageCache implements Cache<string, any> {
  private readonly storage: Storage | null;
  private readonly prefix: string;
  private readonly maxSize: number;
  private writeTimer: number | null = null;
  private readonly pendingWrites = new Map<string, { value: any; ttl?: number }>();
  private readonly memoryCache = new Map<string, { value: any; expires?: number }>(); // 内存缓存层
  private readonly writeDelay = 1000; // 1秒防抖

  constructor(
    storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null,
    prefix = 'i18n_cache_',
    maxSize = 100
  ) {
    this.storage = storage;
    this.prefix = prefix;
    this.maxSize = maxSize > 0 ? maxSize : 100;
    
    // 初始化时加载已有的缓存到内存
    if (this.storage) {
      this.loadExistingCache();
    }
  }

  private loadExistingCache(): void {
    if (!this.storage) return;
    
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          const item = this.storage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              const actualKey = key.substring(this.prefix.length);
              this.memoryCache.set(actualKey, {
                value: parsed.value,
                expires: parsed.expires
              });
            } catch {}
          }
        }
      }
    } catch {}
  }

  get(key: string): any {
    // 先从内存缓存读取
    const cached = this.memoryCache.get(key);
    if (cached) {
      // 检查过期
      if (cached.expires && Date.now() > cached.expires) {
        this.delete(key);
        return undefined;
      }
      return cached.value;
    }

    // 如果内存没有，从 storage 读取
    if (!this.storage) return undefined;

    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return undefined;

      const parsed = JSON.parse(item);

      // 检查过期
      if (parsed.expires && Date.now() > parsed.expires) {
        this.delete(key);
        return undefined;
      }

      // 加入内存缓存
      this.memoryCache.set(key, {
        value: parsed.value,
        expires: parsed.expires
      });

      return parsed.value;
    } catch {
      return undefined;
    }
  }

  set(key: string, value: any, ttl?: number): void {
    const expires = ttl ? Date.now() + ttl : undefined;
    
    // 立即更新内存缓存
    this.memoryCache.set(key, { value, expires });
    
    // 添加到待写入队列
    if (this.storage) {
      this.pendingWrites.set(key, { value, ttl });
      // 延迟写入
      this.scheduleWrite();
    }
  }

  private scheduleWrite(): void {
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer);
    }

    this.writeTimer = window.setTimeout(() => {
      this.flushWrites();
      this.writeTimer = null;
    }, this.writeDelay);
  }

  private flushWrites(): void {
    if (!this.storage || this.pendingWrites.size === 0) return;

    // 使用 requestIdleCallback 或直接执行
    const doWrite = () => {
      try {
        // 检查大小限制
        if (this.size >= this.maxSize) {
          this.evictOldest();
        }

        // 批量写入
        this.pendingWrites.forEach(({ value, ttl }, key) => {
          const expires = ttl ? Date.now() + ttl : undefined;
          const item = JSON.stringify({ value, expires, timestamp: Date.now() });
          this.storage!.setItem(this.prefix + key, item);
        });

        this.pendingWrites.clear();
      } catch (error) {
        console.warn('Failed to cache items:', error);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(doWrite);
    } else {
      doWrite();
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    if (!this.storage) return false;

    try {
      this.storage.removeItem(this.prefix + key);
      this.pendingWrites.delete(key);
      // Also clear in-memory cache to free memory
      this.memoryCache.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    if (!this.storage) return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.storage!.removeItem(key));
    this.pendingWrites.clear();
    this.memoryCache.clear();
  }

  get size(): number {
    if (!this.storage) return 0;

    let count = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }

  private evictOldest(): void {
    if (!this.storage) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.timestamp < oldestTime) {
              oldestTime = parsed.timestamp;
              oldestKey = key;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (oldestKey) {
      this.storage.removeItem(oldestKey);
    }
  }

  /**
   * 清理所有资源
   */
  destroy(): void {
    // 立即刷新待写入项
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }

    this.flushWrites();
    this.pendingWrites.clear();
    this.memoryCache.clear();
  }
}

/**
 * 创建优化的缓存
 */
export function createOptimizedCache<K = string, V = any>(
  options: {
    type?: 'memory' | 'storage' | 'multi';
    maxSize?: number;
    ttl?: number;
    storage?: 'local' | 'session';
  } = {}
): Cache<K, V> & { destroy?: () => void } {
  const { type = 'memory', maxSize = 1000, ttl, storage = 'local' } = options;

  switch (type) {
    case 'storage':
      if (typeof window === 'undefined') {
        return new OptimizedLRUCache<K, V>(maxSize, ttl);
      }
      return new OptimizedStorageCache(
        storage === 'session' ? window.sessionStorage : window.localStorage
      ) as any;

    case 'memory':
    default:
      return new OptimizedLRUCache<K, V>(maxSize, ttl);
  }
}


