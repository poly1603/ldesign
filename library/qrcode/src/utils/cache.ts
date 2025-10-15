/**
 * QR Code Cache Manager with LRU strategy
 */

export interface CachedQRCode {
 dataURL: string;
 timestamp: number;
 hits: number;
 ttl?: number;
}

export interface CacheStats {
 size: number;
 maxSize: number;
 hits: number;
 misses: number;
 hitRate: number;
}

/**
 * LRU Cache Manager for QR Codes
 */
export class QRCodeCacheManager {
 private cache: Map<string, CachedQRCode> = new Map();
 private lruQueue: string[] = [];
 private maxSize: number;
 private defaultTTL: number;
 private hits = 0;
 private misses = 0;

 constructor(maxSize: number = 100, defaultTTL: number = 60 * 60 * 1000) {
  this.maxSize = maxSize;
  this.defaultTTL = defaultTTL;
 }

 /**
  * Generate cache key from config
  */
 private generateKey(config: any): string {
  return JSON.stringify(config);
 }

 /**
  * Get cached QR code
  */
 get(config: any): string | null {
  const key = this.generateKey(config);
  const cached = this.cache.get(key);

  if (!cached) {
   this.misses++;
   return null;
  }

  // Check TTL
  const now = Date.now();
  const age = now - cached.timestamp;
  const ttl = cached.ttl || this.defaultTTL;

  if (age > ttl) {
   this.cache.delete(key);
   this.lruQueue = this.lruQueue.filter(k => k !== key);
   this.misses++;
   return null;
  }

  // Update LRU
  this.lruQueue = this.lruQueue.filter(k => k !== key);
  this.lruQueue.push(key);

  // Update stats
  cached.hits++;
  this.hits++;

  return cached.dataURL;
 }

 /**
  * Set cached QR code
  */
 set(config: any, dataURL: string, ttl?: number): void {
  const key = this.generateKey(config);

  // Remove oldest if at capacity
  if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
   const oldest = this.lruQueue.shift();
   if (oldest) {
    this.cache.delete(oldest);
   }
  }

  // Add to cache
  this.cache.set(key, {
   dataURL,
   timestamp: Date.now(),
   hits: 0,
   ttl,
  });

  // Update LRU
  this.lruQueue = this.lruQueue.filter(k => k !== key);
  this.lruQueue.push(key);
 }

 /**
  * Clear all cache
  */
 clear(): void {
  this.cache.clear();
  this.lruQueue = [];
  this.hits = 0;
  this.misses = 0;
 }

 /**
  * Remove expired entries
  */
 cleanExpired(): number {
  const now = Date.now();
  let removed = 0;

  for (const [key, cached] of this.cache.entries()) {
   const age = now - cached.timestamp;
   const ttl = cached.ttl || this.defaultTTL;

   if (age > ttl) {
    this.cache.delete(key);
    this.lruQueue = this.lruQueue.filter(k => k !== key);
    removed++;
   }
  }

  return removed;
 }

 /**
  * Get cache statistics
  */
 getStats(): CacheStats {
  const total = this.hits + this.misses;
  return {
   size: this.cache.size,
   maxSize: this.maxSize,
   hits: this.hits,
   misses: this.misses,
   hitRate: total > 0 ? (this.hits / total) * 100 : 0,
  };
 }

 /**
  * Check if key exists in cache
  */
 has(config: any): boolean {
  const key = this.generateKey(config);
  return this.cache.has(key);
 }

 /**
  * Get current cache size
  */
 size(): number {
  return this.cache.size;
 }
}

// Global cache instance
const globalCache = new QRCodeCacheManager();

export function enableCache(enabled: boolean = true): void {
 if (!enabled) {
  globalCache.clear();
 }
}

export function clearCache(): void {
 globalCache.clear();
}

export function getCacheStats(): CacheStats {
 return globalCache.getStats();
}

export { globalCache as cache };
export default QRCodeCacheManager;
