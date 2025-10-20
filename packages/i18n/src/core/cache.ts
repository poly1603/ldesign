/**
 * @ldesign/i18n - Cache System
 * High-performance caching for translations and resources
 */

import type { Cache } from '../types';

/**
 * Optimized LRU Cache implementation with O(1) operations
 * Using doubly linked list for efficient access order management
 */
class LRUNode<K, V> {
  key: K;
  value: V;
  expires?: number;
  prev: LRUNode<K, V> | null = null;
  next: LRUNode<K, V> | null = null;

  constructor(key: K, value: V, expires?: number) {
    this.key = key;
    this.value = value;
    this.expires = expires;
  }
}

export class LRUCache<K = string, V = any> implements Cache<K, V> {
  private readonly maxSize: number;
  private readonly cache = new Map<K, LRUNode<K, V>>();
  private head: LRUNode<K, V> | null = null;
  private tail: LRUNode<K, V> | null = null;
  private defaultTTL?: number;
  private cleanupTimer?: NodeJS.Timeout;
  private hits = 0;
  private misses = 0;
  
  constructor(maxSize = 1000, defaultTTL?: number) {
    this.maxSize = maxSize > 0 ? maxSize : 1000;
    this.defaultTTL = defaultTTL;
    
    // Setup periodic cleanup for expired items
    if (defaultTTL && typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanupExpired(), 60000);
      if (typeof (this.cleanupTimer as any)?.unref === 'function') {
        (this.cleanupTimer as any).unref();
      }
    }
  }
  
  get(key: K): V | undefined {
    const node = this.cache.get(key);
    
    if (!node) {
      this.misses++;
      return undefined;
    }
    
    // Check expiration
    if (node.expires && Date.now() > node.expires) {
      this.delete(key);
      this.misses++;
      return undefined;
    }
    
    // Move to head (most recently used) - O(1)
    this.moveToHead(node);
    this.hits++;
    
    return node.value;
  }
  
  set(key: K, value: V, ttl?: number): void {
    let node = this.cache.get(key);
    
    if (node) {
      // Update existing node
      node.value = value;
      const effectiveTTL = ttl ?? this.defaultTTL;
      node.expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
      this.moveToHead(node);
    } else {
      // Check capacity
      if (this.cache.size >= this.maxSize && this.tail) {
        // Remove least recently used (tail) - O(1)
        this.cache.delete(this.tail.key);
        this.removeNode(this.tail);
      }
      
      // Create new node
      const effectiveTTL = ttl ?? this.defaultTTL;
      const expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
      node = new LRUNode(key, value, expires);
      
      this.cache.set(key, node);
      this.addToHead(node);
    }
  }
  
  has(key: K): boolean {
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }
    
    // Check expiration
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
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
  }
  
  get size(): number {
    return this.cache.size;
  }
  
  // O(1) move node to head
  private moveToHead(node: LRUNode<K, V>): void {
    if (this.head === node) return;
    this.removeNode(node);
    this.addToHead(node);
  }
  
  // O(1) add node to head
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
  
  // O(1) remove node from list
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
    
    node.prev = null;
    node.next = null;
  }
  
  private cleanupExpired(): void {
    if (this.cache.size === 0) return;
    
    const now = Date.now();
    const maxCleanup = Math.min(100, Math.ceil(this.cache.size * 0.1));
    let cleaned = 0;
    
    for (const [key, node] of this.cache) {
      if (node.expires && now > node.expires) {
        this.delete(key);
        if (++cleaned >= maxCleanup) break;
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0
    };
  }
  
  /**
   * Clean up resources
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
 * WeakRef polyfill for environments that don't support it
 */
declare global {
  interface WeakRef<T extends object> {
    deref: () => T | undefined;
  }
  interface WeakRefConstructor {
    new<T extends object>(target: T): WeakRef<T>;
  }
}

/**
 * Memory-efficient cache with weak references
 * Fixed memory leak from timers and added resource limits
 */
export class WeakCache<K extends object, V = any> {
  private readonly cache = new WeakMap<K, { value: V; expires?: number; timerId?: number }>();
  private readonly timerRefs = typeof globalThis !== 'undefined' && typeof globalThis.WeakRef !== 'undefined' 
    ? new WeakMap<K, WeakRef<K>>() 
    : undefined;
  private readonly maxTimers = 1000;
  private timerCount = 0;
  
  get(key: K): V | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    // Check expiration
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  set(key: K, value: V, ttl?: number): void {
    // Clear existing timer if any
    const existing = this.cache.get(key);
    if (existing?.timerId) {
      clearTimeout(existing.timerId);
      this.timerCount--;
    }
    
    const expires = ttl ? Date.now() + ttl : undefined;
    const item: any = { value, expires };
    
    // Only set timer if under limit and ttl specified
    if (ttl && this.timerCount < this.maxTimers && typeof globalThis?.WeakRef !== 'undefined' && this.timerRefs) {
      const weakRef = new globalThis.WeakRef(key);
      this.timerRefs.set(key, weakRef);
      
      item.timerId = setTimeout(() => {
        const keyRef = weakRef.deref();
        if (keyRef) {
          this.delete(keyRef);
        }
        this.timerCount--;
      }, ttl) as unknown as number;
      
      this.timerCount++;
    }
    
    this.cache.set(key, item);
  }
  
  has(key: K): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check expiration
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: K): boolean {
    const item = this.cache.get(key);
    if (item?.timerId) {
      clearTimeout(item.timerId);
      this.timerCount--;
    }
    
    this.timerRefs?.delete(key);
    return this.cache.delete(key);
  }
  
  /**
   * Clean up all timers
   */
  destroy(): void {
    // WeakMap can't be iterated, but timers will be GC'd with objects
    this.timerCount = 0;
  }
}

/**
 * Storage-based cache (localStorage/sessionStorage)
 */
export class StorageCache implements Cache<string, any> {
  private storage: Storage;
  private prefix: string;
  private maxSize: number;
  
  constructor(
    storage: Storage = typeof window !== 'undefined' ? window.localStorage : null!,
    prefix = 'i18n_cache_',
    maxSize = 100
  ) {
    this.storage = storage;
    this.prefix = prefix;
    this.maxSize = maxSize;
  }
  
  get(key: string): any {
    if (!this.storage) return undefined;
    
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return undefined;
      
      const parsed = JSON.parse(item);
      
      // Check expiration
      if (parsed.expires && Date.now() > parsed.expires) {
        this.delete(key);
        return undefined;
      }
      
      return parsed.value;
    } catch {
      return undefined;
    }
  }
  
  set(key: string, value: any, ttl?: number): void {
    if (!this.storage) return;
    
    try {
      // Check size limit
      if (this.size >= this.maxSize) {
        this.evictOldest();
      }
      
      const expires = ttl ? Date.now() + ttl : undefined;
      const item = JSON.stringify({ value, expires, timestamp: Date.now() });
      
      this.storage.setItem(this.prefix + key, item);
    } catch (error) {
      // Storage might be full or disabled
      console.warn('Failed to cache item:', error);
    }
  }
  
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  
  delete(key: string): boolean {
    if (!this.storage) return false;
    
    try {
      this.storage.removeItem(this.prefix + key);
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
    
    keysToRemove.forEach(key => this.storage.removeItem(key));
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
}

/**
 * Multi-tier cache system
 */
export class MultiTierCache<K = string, V = any> implements Cache<K, V> {
  private tiers: Cache<K, V>[] = [];
  
  constructor(...tiers: Cache<K, V>[]) {
    this.tiers = tiers;
  }
  
  get(key: K): V | undefined {
    for (let i = 0; i < this.tiers.length; i++) {
      const value = this.tiers[i].get(key);
      if (value !== undefined) {
        // Promote to higher tiers
        for (let j = 0; j < i; j++) {
          this.tiers[j].set(key, value);
        }
        return value;
      }
    }
    return undefined;
  }
  
  set(key: K, value: V, ttl?: number): void {
    // Set in all tiers
    this.tiers.forEach(tier => tier.set(key, value, ttl));
  }
  
  has(key: K): boolean {
    return this.tiers.some(tier => tier.has(key));
  }
  
  delete(key: K): boolean {
    let deleted = false;
    this.tiers.forEach(tier => {
      if (tier.delete(key)) {
        deleted = true;
      }
    });
    return deleted;
  }
  
  clear(): void {
    this.tiers.forEach(tier => tier.clear());
  }
  
  get size(): number {
    // Return size of the first tier (primary cache)
    return this.tiers[0]?.size || 0;
  }
}

/**
 * Create appropriate cache based on environment
 */
export function createCache<K = string, V = any>(
  options: {
    type?: 'memory' | 'storage' | 'multi';
    maxSize?: number;
    ttl?: number;
    storage?: 'local' | 'session';
  } = {}
): Cache<K, V> {
  const { type = 'memory', maxSize = 1000, ttl, storage = 'local' } = options;
  
  switch (type) {
    case 'storage':
      if (typeof window === 'undefined') {
        // Fallback to memory cache in non-browser environments
        return new LRUCache<K, V>(maxSize, ttl);
      }
      return new StorageCache(
        storage === 'session' ? window.sessionStorage : window.localStorage
      ) as any;
    
    case 'multi':
      if (typeof window === 'undefined') {
        return new LRUCache<K, V>(maxSize, ttl);
      }
      return new MultiTierCache<K, V>(
        new LRUCache<K, V>(maxSize / 2, ttl),
        new StorageCache(window.localStorage) as any
      );
    
    case 'memory':
    default:
      return new LRUCache<K, V>(maxSize, ttl);
  }
}