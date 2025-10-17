/**
 * Advanced Cache System
 * 
 * Provides sophisticated caching strategies including:
 * - LRU (Least Recently Used) cache
 * - LFU (Least Frequently Used) cache
 * - Tagged cache invalidation
 * - Pattern-based invalidation
 * - Distributed cache support
 */

import type { Logger } from '../types'
import { computed, type ComputedRef, ref, type Ref } from 'vue'

// Cache entry with metadata
export interface CacheEntry<T = unknown> {
  key: string
  value: T
  size: number
  createdAt: number
  accessedAt: number
  accessCount: number
  ttl?: number
  tags?: Set<string>
  dependencies?: Set<string>
}

// Cache statistics
export interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
  count: number
  hitRate: ComputedRef<number>
}

// Cache strategy types
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'fifo' | 'random'

// Cache options
export interface AdvancedCacheOptions {
  strategy?: CacheStrategy
  maxSize?: number
  maxEntries?: number
  ttl?: number
  onEvict?: (entry: CacheEntry) => void
  serialize?: (value: unknown) => string
  deserialize?: (value: string) => unknown
}

// Cache invalidation patterns
export interface InvalidationPattern {
  pattern: string | RegExp
  tags?: string[]
  callback?: () => void
}

/**
 * Base cache implementation
 */
abstract class BaseCache<T = unknown> {
  protected entries = new Map<string, CacheEntry<T>>()
  protected stats: CacheStats
  protected options: AdvancedCacheOptions
  
  constructor(options: AdvancedCacheOptions = {}, protected logger?: Logger) {
    this.options = {
      strategy: 'lru',
      maxSize: Infinity,
      maxEntries: 1000,
      ttl: 0,
      ...options
    }
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      count: 0,
      hitRate: computed(() => 
        this.stats.hits + this.stats.misses === 0 
          ? 0 
          : this.stats.hits / (this.stats.hits + this.stats.misses)
      )
    }
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | undefined {
    const entry = this.entries.get(key)
    
    if (!entry) {
      this.stats.misses++
      return undefined
    }
    
    // Check TTL
    if (this.isExpired(entry)) {
      this.delete(key)
      this.stats.misses++
      return undefined
    }
    
    // Update access metadata
    entry.accessedAt = Date.now()
    entry.accessCount++
    this.stats.hits++
    
    // Strategy-specific update
    this.onAccess(entry)
    
    return entry.value
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, options?: { ttl?: number; tags?: string[] }): void {
    const size = this.calculateSize(value)
    
    // Check if we need to evict
    if (this.shouldEvict(size)) {
      this.evict(size)
    }
    
    const entry: CacheEntry<T> = {
      key,
      value,
      size,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 1,
      ttl: options?.ttl || this.options.ttl,
      tags: options?.tags ? new Set(options.tags) : undefined,
      dependencies: new Set()
    }
    
    // Remove old entry if exists
    if (this.entries.has(key)) {
      const oldEntry = this.entries.get(key)!
      this.stats.size -= oldEntry.size
      this.stats.count--
    }
    
    this.entries.set(key, entry)
    this.stats.size += size
    this.stats.count++
    
    // Strategy-specific handling
    this.onSet(entry)
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    
    if (this.isExpired(entry)) {
      this.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    
    this.stats.size -= entry.size
    this.stats.count--
    
    if (this.options.onEvict) {
      this.options.onEvict(entry)
    }
    
    return this.entries.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.entries.clear()
    this.stats.size = 0
    this.stats.count = 0
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.entries.keys())
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.stats
  }

  /**
   * Invalidate by tags
   */
  invalidateByTags(tags: string[]): number {
    const tagSet = new Set(tags)
    let invalidated = 0
    
    for (const [key, entry] of this.entries) {
      if (entry.tags && Array.from(entry.tags).some(tag => tagSet.has(tag))) {
        this.delete(key)
        invalidated++
      }
    }
    
    return invalidated
  }

  /**
   * Invalidate by pattern
   */
  invalidateByPattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern) 
      : pattern
    
    let invalidated = 0
    
    for (const key of this.entries.keys()) {
      if (regex.test(key)) {
        this.delete(key)
        invalidated++
      }
    }
    
    return invalidated
  }

  // Abstract methods for strategy-specific behavior
  protected abstract onAccess(entry: CacheEntry<T>): void
  protected abstract onSet(entry: CacheEntry<T>): void
  protected abstract getEvictionCandidate(): CacheEntry<T> | undefined

  // Helper methods
  
  protected isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.ttl || entry.ttl === 0) return false
    return Date.now() > entry.createdAt + entry.ttl
  }

  protected calculateSize(value: T): number {
    if (this.options.serialize) {
      return this.options.serialize(value).length
    }
    return JSON.stringify(value).length
  }

  protected shouldEvict(newSize: number): boolean {
    return (
      this.stats.size + newSize > (this.options.maxSize || Infinity) ||
      this.stats.count >= (this.options.maxEntries || Infinity)
    )
  }

  protected evict(requiredSize: number): void {
    while (this.shouldEvict(requiredSize)) {
      const candidate = this.getEvictionCandidate()
      if (!candidate) break
      
      this.delete(candidate.key)
      this.stats.evictions++
    }
  }
}

/**
 * LRU (Least Recently Used) Cache
 */
export class LRUCache<T = unknown> extends BaseCache<T> {
  private accessOrder: string[] = []

  protected onAccess(entry: CacheEntry<T>): void {
    // Move to end of access order
    const index = this.accessOrder.indexOf(entry.key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(entry.key)
  }

  protected onSet(entry: CacheEntry<T>): void {
    this.accessOrder.push(entry.key)
  }

  protected getEvictionCandidate(): CacheEntry<T> | undefined {
    if (this.accessOrder.length === 0) return undefined
    
    const key = this.accessOrder[0]
    return this.entries.get(key)
  }

  delete(key: string): boolean {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    return super.delete(key)
  }

  clear(): void {
    this.accessOrder = []
    super.clear()
  }
}

/**
 * LFU (Least Frequently Used) Cache
 */
export class LFUCache<T = unknown> extends BaseCache<T> {
  private frequencyLists = new Map<number, Set<string>>()
  private keyFrequencies = new Map<string, number>()
  private minFrequency = 0

  protected onAccess(entry: CacheEntry<T>): void {
    this.updateFrequency(entry.key)
  }

  protected onSet(entry: CacheEntry<T>): void {
    this.keyFrequencies.set(entry.key, 1)
    
    if (!this.frequencyLists.has(1)) {
      this.frequencyLists.set(1, new Set())
    }
    this.frequencyLists.get(1)!.add(entry.key)
    
    this.minFrequency = 1
  }

  protected getEvictionCandidate(): CacheEntry<T> | undefined {
    const minFreqList = this.frequencyLists.get(this.minFrequency)
    if (!minFreqList || minFreqList.size === 0) {
      // Find next min frequency
      for (const [freq, list] of this.frequencyLists) {
        if (list.size > 0) {
          this.minFrequency = freq
          break
        }
      }
    }
    
    const list = this.frequencyLists.get(this.minFrequency)
    if (!list || list.size === 0) return undefined
    
    const key = list.values().next().value as string | undefined
    return key ? this.entries.get(key) : undefined
  }

  private updateFrequency(key: string): void {
    const currentFreq = this.keyFrequencies.get(key) || 0
    const newFreq = currentFreq + 1
    
    // Remove from current frequency list
    if (this.frequencyLists.has(currentFreq)) {
      this.frequencyLists.get(currentFreq)!.delete(key)
      
      if (this.frequencyLists.get(currentFreq)!.size === 0 && currentFreq === this.minFrequency) {
        this.minFrequency++
      }
    }
    
    // Add to new frequency list
    if (!this.frequencyLists.has(newFreq)) {
      this.frequencyLists.set(newFreq, new Set())
    }
    this.frequencyLists.get(newFreq)!.add(key)
    
    this.keyFrequencies.set(key, newFreq)
  }

  delete(key: string): boolean {
    const freq = this.keyFrequencies.get(key)
    if (freq !== undefined) {
      this.frequencyLists.get(freq)?.delete(key)
      this.keyFrequencies.delete(key)
    }
    return super.delete(key)
  }

  clear(): void {
    this.frequencyLists.clear()
    this.keyFrequencies.clear()
    this.minFrequency = 0
    super.clear()
  }
}

/**
 * Multi-tier cache with different strategies per tier
 */
export class MultiTierCache<T = unknown> {
  private tiers: BaseCache<T>[] = []
  
  constructor(
    tierConfigs: Array<{ strategy: CacheStrategy; options: AdvancedCacheOptions }>,
    private logger?: Logger
  ) {
    for (const config of tierConfigs) {
      const cache = this.createCache(config.strategy, config.options)
      this.tiers.push(cache)
    }
  }

  private createCache(strategy: CacheStrategy, options: AdvancedCacheOptions): BaseCache<T> {
    switch (strategy) {
      case 'lru':
        return new LRUCache(options, this.logger)
      case 'lfu':
        return new LFUCache(options, this.logger)
      default:
        return new LRUCache(options, this.logger)
    }
  }

  /**
   * Get from cache (checks all tiers)
   */
  get(key: string): T | undefined {
    for (let i = 0; i < this.tiers.length; i++) {
      const value = this.tiers[i].get(key)
      
      if (value !== undefined) {
        // Promote to higher tiers
        for (let j = 0; j < i; j++) {
          this.tiers[j].set(key, value)
        }
        return value
      }
    }
    
    return undefined
  }

  /**
   * Set in cache (sets in first tier)
   */
  set(key: string, value: T, options?: { ttl?: number; tags?: string[] }): void {
    if (this.tiers.length > 0) {
      this.tiers[0].set(key, value, options)
    }
  }

  /**
   * Invalidate across all tiers
   */
  invalidate(key: string): void {
    for (const tier of this.tiers) {
      tier.delete(key)
    }
  }

  /**
   * Get combined stats from all tiers
   */
  getStats(): Array<{ tier: number; stats: CacheStats }> {
    return this.tiers.map((tier, index) => ({
      tier: index,
      stats: tier.getStats()
    }))
  }
}

/**
 * Cache with dependency tracking
 */
export class DependencyCache<T = unknown> extends LRUCache<T> {
  private dependencies = new Map<string, Set<string>>()
  private dependents = new Map<string, Set<string>>()

  /**
   * Set a value with dependencies
   */
  setWithDependencies(
    key: string, 
    value: T, 
    dependencies: string[],
    options?: { ttl?: number; tags?: string[] }
  ): void {
    this.set(key, value, options)
    
    // Clear old dependencies
    this.clearDependencies(key)
    
    // Set new dependencies
    this.dependencies.set(key, new Set(dependencies))
    
    // Update dependents
    for (const dep of dependencies) {
      if (!this.dependents.has(dep)) {
        this.dependents.set(dep, new Set())
      }
      this.dependents.get(dep)!.add(key)
    }
  }

  /**
   * Invalidate a key and all its dependents
   */
  invalidateCascade(key: string): number {
    const invalidated = new Set<string>()
    const toInvalidate = [key]
    
    while (toInvalidate.length > 0) {
      const current = toInvalidate.pop()!
      if (invalidated.has(current)) continue
      
      invalidated.add(current)
      this.delete(current)
      
      // Add dependents to invalidation queue
      const deps = this.dependents.get(current)
      if (deps) {
        toInvalidate.push(...deps)
      }
    }
    
    return invalidated.size
  }

  private clearDependencies(key: string): void {
    const deps = this.dependencies.get(key)
    if (deps) {
      for (const dep of deps) {
        this.dependents.get(dep)?.delete(key)
      }
      this.dependencies.delete(key)
    }
  }

  delete(key: string): boolean {
    this.clearDependencies(key)
    return super.delete(key)
  }

  clear(): void {
    this.dependencies.clear()
    this.dependents.clear()
    super.clear()
  }
}

/**
 * Create an advanced cache instance
 */
export function createAdvancedCache<T = unknown>(
  strategy: CacheStrategy = 'lru',
  options?: AdvancedCacheOptions,
  logger?: Logger
): BaseCache<T> {
  switch (strategy) {
    case 'lru':
      return new LRUCache(options, logger)
    case 'lfu':
      return new LFUCache(options, logger)
    default:
      return new LRUCache(options, logger)
  }
}

/**
 * Vue composable for cache
 */
export function useAdvancedCache<T = unknown>(
  strategy: CacheStrategy = 'lru',
  options?: AdvancedCacheOptions
): {
  cache: BaseCache<T>
  get: (key: string) => T | undefined
  set: (key: string, value: T, opts?: { ttl?: number; tags?: string[] }) => void
  invalidate: (key: string) => boolean
  invalidateByTags: (tags: string[]) => number
  stats: Ref<{ hits: number; misses: number; evictions: number; size: number; count: number; hitRate: number }>
} {
  const cache = createAdvancedCache<T>(strategy, options)
  const stats = ref<{ hits: number; misses: number; evictions: number; size: number; count: number; hitRate: number }>({
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    evictions: cache.getStats().evictions,
    size: cache.getStats().size,
    count: cache.getStats().count,
    hitRate: cache.getStats().hitRate.value
  })
  
  // Update stats reactively
  const updateStats = () => {
    const currentStats = cache.getStats()
    stats.value = {
      hits: currentStats.hits,
      misses: currentStats.misses,
      evictions: currentStats.evictions,
      size: currentStats.size,
      count: currentStats.count,
      hitRate: currentStats.hitRate.value
    }
  }
  
  return {
    cache,
    get: (key: string) => {
      const value = cache.get(key)
      updateStats()
      return value
    },
    set: (key: string, value: T, opts?: { ttl?: number; tags?: string[] }) => {
      cache.set(key, value, opts)
      updateStats()
    },
    invalidate: (key: string) => {
      const result = cache.delete(key)
      updateStats()
      return result
    },
    invalidateByTags: (tags: string[]) => {
      const count = cache.invalidateByTags(tags)
      updateStats()
      return count
    },
    stats
  }
}
