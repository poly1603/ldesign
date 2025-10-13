/**
 * @ldesign/i18n - Cache System
 * High-performance caching for translations and resources
 */

import type { Cache } from '../types';

/**
 * LRU Cache implementation
 */
export class LRUCache<K = string, V = any> implements Cache<K, V> {
  private maxSize: number;
  private cache: Map<K, { value: V; expires?: number }> = new Map();
  private accessOrder: K[] = [];
  private defaultTTL?: number;
  
  constructor(maxSize = 1000, defaultTTL?: number) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }
  
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
    
    // Update access order (move to end)
    this.updateAccessOrder(key);
    
    return item.value;
  }
  
  set(key: K, value: V, ttl?: number): void {
    // Remove oldest if at capacity
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    
    // Calculate expiration
    const effectiveTTL = ttl ?? this.defaultTTL;
    const expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
    
    // Set value
    this.cache.set(key, { value, expires });
    
    // Update access order
    this.updateAccessOrder(key);
  }
  
  has(key: K): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check expiration
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: K): boolean {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  get size(): number {
    // Clean up expired items before returning size
    this.cleanupExpired();
    return this.cache.size;
  }
  
  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }
  
  private cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: K[] = [];
    
    this.cache.forEach((item, key) => {
      if (item.expires && now > item.expires) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.delete(key));
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
    return {
      size: this.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for this
      missRate: 0
    };
  }
}

/**
 * Memory-efficient cache with weak references
 */
export class WeakCache<K extends object, V = any> {
  private cache: WeakMap<K, { value: V; expires?: number }> = new WeakMap();
  private timers: Map<K, NodeJS.Timeout> = new Map();
  
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
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(key);
    }
    
    // Calculate expiration
    const expires = ttl ? Date.now() + ttl : undefined;
    
    // Set value
    this.cache.set(key, { value, expires });
    
    // Set cleanup timer if TTL specified
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  delete(key: K): boolean {
    // Clear timer if any
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    
    return this.cache.delete(key);
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
    } catch (error) {
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