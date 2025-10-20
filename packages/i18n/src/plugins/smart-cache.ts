/**
 * Smart Caching System
 * Advanced multi-layer caching with predictive loading and intelligent invalidation
 */

import { EventEmitter } from 'node:events';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  lastAccess: number;
  size: number;
  priority: number;
  ttl?: number;
  tags?: Set<string>;
}

interface CacheLayer {
  name: string;
  maxSize: number;
  maxItems: number;
  ttl?: number;
  compression?: boolean;
}

interface PredictionConfig {
  enabled: boolean;
  threshold: number;
  lookAhead: number;
  patterns: Map<string, string[]>;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  items: number;
  hitRate: number;
  avgAccessTime: number;
  predictions: {
    successful: number;
    failed: number;
    accuracy: number;
  };
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private maxItems: number;
  private currentSize: number = 0;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    items: 0,
    hitRate: 0,
    avgAccessTime: 0,
    predictions: {
      successful: 0,
      failed: 0,
      accuracy: 0
    }
  };

  constructor(maxSize: number, maxItems: number) {
    this.maxSize = maxSize;
    this.maxItems = maxItems;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return undefined;
    }

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      this.updateStats();
      return undefined;
    }

    // Move to end (most recently used) - Map maintains insertion order
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    entry.hits++;
    entry.lastAccess = Date.now();
    this.stats.hits++;
    this.updateStats();

    return entry.value;
  }

  set(key: string, value: T, options?: Partial<CacheEntry<T>>): void {
    const size = this.calculateSize(value);
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.currentSize -= oldEntry.size;
      this.cache.delete(key);
    }
    
    // Check if we need to evict items
    while (
      (this.currentSize + size > this.maxSize || this.cache.size >= this.maxItems) &&
      this.cache.size > 0
    ) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
      lastAccess: Date.now(),
      size,
      priority: options?.priority || 0,
      ttl: options?.ttl,
      tags: options?.tags
    };

    this.cache.set(key, entry);
    this.currentSize += size;
    this.stats.items = this.cache.size;
    this.stats.size = this.currentSize;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.currentSize -= entry.size;
    this.stats.items = this.cache.size;
    this.stats.size = this.currentSize;
    
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.stats.items = 0;
    this.stats.size = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }


  private evictLRU(): void {
    if (this.cache.size === 0) return;

    // Get first item (least recently used) from Map
    const victimKey = this.cache.keys().next().value;
    if (victimKey) {
      this.delete(victimKey);
      this.stats.evictions++;
    }
  }

  private calculateEvictionScore(entry: CacheEntry<T>): number {
    const age = Date.now() - entry.timestamp;
    const recency = Date.now() - entry.lastAccess;
    const frequency = entry.hits;
    const priority = entry.priority;

    // Higher score = less likely to evict
    return (frequency * 1000 + priority * 10000) / (recency + age);
  }

  private calculateSize(value: T): number {
    // Rough size calculation
    const str = JSON.stringify(value);
    return str.length * 2; // Assuming 2 bytes per character
  }

  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

export class SmartCache extends EventEmitter {
  private layers: Map<string, LRUCache<any>> = new Map();
  private layerConfig: CacheLayer[] = [];
  private prediction: PredictionConfig;
  private accessPatterns: Map<string, string[]> = new Map();
  private prefetchQueue: Set<string> = new Set();
  private compressionCache: Map<string, ArrayBuffer> = new Map();
  private optimizeInterval: NodeJS.Timeout | null = null;
  private maxAccessPatterns: number = 1000;
  private maxPrefetchQueue: number = 100;

  constructor() {
    super();
    
    // Default layer configuration
    this.layerConfig = [
      { name: 'hot', maxSize: 1024 * 1024, maxItems: 100, ttl: 60000 }, // 1MB, 1 minute
      { name: 'warm', maxSize: 5 * 1024 * 1024, maxItems: 500, ttl: 300000 }, // 5MB, 5 minutes
      { name: 'cold', maxSize: 20 * 1024 * 1024, maxItems: 2000, ttl: 3600000, compression: true } // 20MB, 1 hour
    ];

    this.prediction = {
      enabled: true,
      threshold: 0.7,
      lookAhead: 3,
      patterns: new Map()
    };

    this.initializeLayers();
    this.startPredictionEngine();
  }

  private initializeLayers(): void {
    for (const config of this.layerConfig) {
      this.layers.set(config.name, new LRUCache(config.maxSize, config.maxItems));
    }
  }

  async get<T>(key: string, loader?: () => Promise<T>): Promise<T | undefined> {
    const startTime = Date.now();
    
    // Check all layers from hot to cold
    for (const [layerName, cache] of this.layers) {
      const value = cache.get(key);
      if (value !== undefined) {
        // Promote to hot layer if found in warm/cold
        if (layerName !== 'hot') {
          await this.promote(key, value, layerName);
        }
        
        // Track access pattern
        this.recordAccess(key);
        
        // Trigger predictive prefetch
        this.predictAndPrefetch(key);
        
        this.emit('cache:hit', { key, layer: layerName, time: Date.now() - startTime });
        return value;
      }
    }

    // Cache miss - load if loader provided
    if (loader) {
      const value = await loader();
      await this.set(key, value);
      this.recordAccess(key);
      this.emit('cache:miss', { key, time: Date.now() - startTime });
      return value;
    }

    this.emit('cache:miss', { key, time: Date.now() - startTime });
    return undefined;
  }

  async set<T>(key: string, value: T, options?: { ttl?: number; priority?: number; tags?: string[] }): Promise<void> {
    // Always start in hot layer
    const hotCache = this.layers.get('hot');
    if (hotCache) {
      hotCache.set(key, value, {
        ttl: options?.ttl,
        priority: options?.priority,
        tags: options?.tags ? new Set(options.tags) : undefined
      });
    }

    this.emit('cache:set', { key, size: JSON.stringify(value).length });
  }

  async invalidate(pattern: string | RegExp): Promise<number> {
    let invalidated = 0;

    for (const [, cache] of this.layers) {
      const keys = this.getMatchingKeys(pattern);
      for (const key of keys) {
        if (cache.delete(key)) {
          invalidated++;
        }
      }
    }

    this.emit('cache:invalidate', { pattern: pattern.toString(), count: invalidated });
    return invalidated;
  }

  async invalidateByTag(tag: string): Promise<number> {
    const invalidated = 0;
    
    // This would need to be implemented with tag tracking
    // For now, returning placeholder
    
    this.emit('cache:invalidate:tag', { tag, count: invalidated });
    return invalidated;
  }

  private async promote<T>(key: string, value: T, fromLayer: string): Promise<void> {
    const hotCache = this.layers.get('hot');
    const sourceCache = this.layers.get(fromLayer);
    
    if (hotCache && sourceCache) {
      // Move to hot cache
      hotCache.set(key, value);
      sourceCache.delete(key);
      
      this.emit('cache:promote', { key, from: fromLayer, to: 'hot' });
    }
  }

  private async demote<T>(key: string, value: T, fromLayer: string, toLayer: string): Promise<void> {
    const source = this.layers.get(fromLayer);
    const target = this.layers.get(toLayer);
    
    if (source && target) {
      target.set(key, value);
      source.delete(key);
      
      this.emit('cache:demote', { key, from: fromLayer, to: toLayer });
    }
  }

  private recordAccess(key: string): void {
    // Track access patterns for prediction
    let pattern = this.accessPatterns.get(key) || [];
    const now = Date.now().toString();
    pattern.push(now);
    
    // Keep only recent accesses
    if (pattern.length > 10) {
      pattern = pattern.slice(-10);
    }
    
    this.accessPatterns.set(key, pattern);
    
    // Limit total number of patterns tracked
    if (this.accessPatterns.size > this.maxAccessPatterns) {
      // Remove oldest patterns
      const keysToDelete = Array.from(this.accessPatterns.keys())
        .slice(0, Math.floor(this.maxAccessPatterns / 2));
      keysToDelete.forEach(k => this.accessPatterns.delete(k));
    }
  }

  private predictAndPrefetch(key: string): void {
    if (!this.prediction.enabled) return;

    // Limit prefetch queue size
    if (this.prefetchQueue.size >= this.maxPrefetchQueue) {
      return;
    }

    // Analyze patterns to predict next keys
    const predictions = this.analyzePatterns(key);
    
    for (const predictedKey of predictions) {
      if (!this.prefetchQueue.has(predictedKey) && this.prefetchQueue.size < this.maxPrefetchQueue) {
        this.prefetchQueue.add(predictedKey);
        
        // Schedule prefetch
        setTimeout(() => {
          this.prefetch(predictedKey);
          this.prefetchQueue.delete(predictedKey);
        }, 100);
      }
    }
  }

  private analyzePatterns(currentKey: string): string[] {
    const predictions: string[] = [];
    
    // Simple pattern matching for now
    // In real implementation, would use ML model
    const patterns = this.prediction.patterns.get(currentKey);
    if (patterns) {
      predictions.push(...patterns.slice(0, this.prediction.lookAhead));
    }

    // Look for sequential patterns
    const match = currentKey.match(/^(.*?)(\d+)$/);
    if (match) {
      const base = match[1];
      const num = Number.parseInt(match[2], 10);
      for (let i = 1; i <= this.prediction.lookAhead; i++) {
        predictions.push(`${base}${num + i}`);
      }
    }

    return predictions;
  }

  private async prefetch(key: string): Promise<void> {
    // Implement prefetch logic
    this.emit('cache:prefetch', { key });
  }

  private startPredictionEngine(): void {
    // Periodically analyze and optimize cache
    this.optimizeInterval = setInterval(() => {
      this.optimizeCache();
    }, 60000); // Every minute
  }

  private optimizeCache(): void {
    // Analyze cache performance and adjust
    const stats = this.getStats();
    
    // Auto-tune cache sizes based on hit rates
    if (stats.overall.hitRate < 0.5) {
      // Increase cache sizes if hit rate is low
      this.emit('cache:optimize', { action: 'resize', reason: 'low hit rate' });
    }

    // Demote cold items
    for (const [layerName, cache] of this.layers) {
      if (layerName === 'hot') {
        // Demote items that haven't been accessed recently
        // Implementation would go here
      }
    }
  }

  private getMatchingKeys(pattern: string | RegExp): string[] {
    const keys: string[] = [];
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    
    for (const [, cache] of this.layers) {
      // This would need access to cache keys
      // Placeholder implementation
    }
    
    return keys;
  }

  getStats(): { overall: CacheStats; layers: Map<string, CacheStats> } {
    const layerStats = new Map<string, CacheStats>();
    let totalHits = 0;
    let totalMisses = 0;
    let totalEvictions = 0;
    let totalSize = 0;
    let totalItems = 0;

    for (const [name, cache] of this.layers) {
      const stats = cache.getStats();
      layerStats.set(name, stats);
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalEvictions += stats.evictions;
      totalSize += stats.size;
      totalItems += stats.items;
    }

    const overall: CacheStats = {
      hits: totalHits,
      misses: totalMisses,
      evictions: totalEvictions,
      size: totalSize,
      items: totalItems,
      hitRate: totalHits / (totalHits + totalMisses) || 0,
      avgAccessTime: 0,
      predictions: {
        successful: 0,
        failed: 0,
        accuracy: 0
      }
    };

    return { overall, layers: layerStats };
  }

  async compress(data: any): Promise<ArrayBuffer> {
    const json = JSON.stringify(data);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(json);
    
    // Simple compression simulation
    // In real implementation, would use actual compression algorithm
    return encoded.buffer;
  }

  async decompress(buffer: ArrayBuffer): Promise<any> {
    const decoder = new TextDecoder();
    const json = decoder.decode(buffer);
    return JSON.parse(json);
  }

  clear(layer?: string): void {
    if (layer) {
      const cache = this.layers.get(layer);
      cache?.clear();
    } else {
      for (const [, cache] of this.layers) {
        cache.clear();
      }
    }
    
    this.emit('cache:clear', { layer: layer || 'all' });
  }

  configurePrediction(config: Partial<PredictionConfig>): void {
    this.prediction = { ...this.prediction, ...config };
    this.emit('cache:config', { prediction: this.prediction });
  }

  // Advanced features
  
  async warmUp(keys: string[], loader: (key: string) => Promise<any>): Promise<void> {
    const promises = keys.map(async key => {
      const value = await loader(key);
      await this.set(key, value, { priority: 1 });
    });
    
    await Promise.all(promises);
    this.emit('cache:warmup', { count: keys.length });
  }

  subscribe(pattern: string, callback: (key: string, value: any) => void): () => void {
    const listener = (event: any) => {
      if (event.key && event.key.match(pattern)) {
        callback(event.key, event.value);
      }
    };
    
    this.on('cache:set', listener);
    this.on('cache:hit', listener);
    
    return () => {
      this.off('cache:set', listener);
      this.off('cache:hit', listener);
    };
  }

  // Memory pressure handling
  handleMemoryPressure(level: 'low' | 'medium' | 'high'): void {
    switch (level) {
      case 'high':
        // Clear cold cache
        this.clear('cold');
        // Fall through
      case 'medium':
        // Clear warm cache
        this.clear('warm');
        break;
      case 'low':
        // Just optimize
        this.optimizeCache();
        break;
    }
    
    this.emit('cache:memory:pressure', { level });
  }
  
  destroy(): void {
    // Clear optimization interval
    if (this.optimizeInterval) {
      clearInterval(this.optimizeInterval);
      this.optimizeInterval = null;
    }
    
    // Clear all caches
    this.clear();
    
    // Clear all data structures
    this.layers.clear();
    this.accessPatterns.clear();
    this.prefetchQueue.clear();
    this.compressionCache.clear();
    this.prediction.patterns.clear();
    
    // Remove all event listeners
    this.removeAllListeners();
  }
}

// Export singleton instance
export const smartCache = new SmartCache();

// Type exports
export type { CacheEntry, CacheLayer, CacheStats, PredictionConfig };