/**
 * @ldesign/color - Memory Management Utilities
 * 
 * Central memory management for preventing memory leaks and optimizing usage
 */

import { Color } from '../core/Color';
import { globalColorCache as advancedCache } from './advancedCache';
import { globalColorCache as basicCache } from './cache';

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  colorPoolSize: number;
  colorCacheSize: number;
  advancedCacheSize: number;
  totalCacheItems: number;
  estimatedMemoryMB: number;
}

/**
 * Memory manager for color library
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupInterval: number | null = null;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly MAX_MEMORY_MB = 50; // Maximum memory usage in MB
  private memoryCheckTimer: number | null = null;
  
  private constructor() {
    // Initialize automatic cleanup
    this.startAutoCleanup();
    
    // Monitor page visibility
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.cleanup.bind(this), { once: true });
    }
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, reduce memory usage
      this.reduceMemoryUsage();
    }
  }
  
  /**
   * Start automatic cleanup interval
   */
  private startAutoCleanup(): void {
    if (this.cleanupInterval !== null) return;
    
    if (typeof window !== 'undefined') {
      this.cleanupInterval = window.setInterval(() => {
        this.performAutoCleanup();
      }, this.CLEANUP_INTERVAL) as any;
    }
  }
  
  /**
   * Stop automatic cleanup interval
   */
  private stopAutoCleanup(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Perform automatic cleanup
   */
  private performAutoCleanup(): void {
    const stats = this.getMemoryStats();
    
    // If memory usage is too high, perform aggressive cleanup
    if (stats.estimatedMemoryMB > this.MAX_MEMORY_MB) {
      this.aggressiveCleanup();
    } else if (stats.estimatedMemoryMB > this.MAX_MEMORY_MB * 0.8) {
      // If approaching limit, perform moderate cleanup
      this.moderateCleanup();
    }
  }
  
  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats {
    const colorPoolSize = (Color as any).pool?.length || 0;
    const colorCacheSize = basicCache.size;
    const advancedCacheSize = advancedCache.size;
    const totalCacheItems = colorCacheSize + advancedCacheSize;
    
    // Estimate memory usage (rough approximation)
    // Each Color object ~100 bytes, each cache entry ~200 bytes
    const estimatedMemoryBytes = 
      (colorPoolSize * 100) + 
      (totalCacheItems * 200);
    
    return {
      colorPoolSize,
      colorCacheSize,
      advancedCacheSize,
      totalCacheItems,
      estimatedMemoryMB: estimatedMemoryBytes / (1024 * 1024)
    };
  }
  
  /**
   * Reduce memory usage when page is hidden
   */
  reduceMemoryUsage(): void {
    // Clear half of the color pool
    const pool = (Color as any).pool;
    if (pool && pool.length > 10) {
      pool.length = Math.floor(pool.length / 2);
    }
    
    // Optimize caches
    if (advancedCache.optimize) {
      advancedCache.optimize();
    }
    
    // Reduce basic cache size
    if (basicCache.size > 50) {
      const keysToRemove = Math.floor(basicCache.size / 2);
      const cache = (basicCache as any).cache;
      if (cache && cache.keys) {
        const keys = Array.from(cache.keys());
        for (let i = 0; i < keysToRemove; i++) {
          basicCache.delete(keys[i] as string);
        }
      }
    }
  }
  
  /**
   * Perform moderate cleanup
   */
  moderateCleanup(): void {
    // Clear 25% of color pool
    const pool = (Color as any).pool;
    if (pool && pool.length > 5) {
      const toRemove = Math.floor(pool.length * 0.25);
      pool.splice(0, toRemove);
    }
    
    // Optimize advanced cache
    if (advancedCache.optimize) {
      advancedCache.optimize();
    }
  }
  
  /**
   * Perform aggressive cleanup
   */
  aggressiveCleanup(): void {
    // Clear most of the color pool
    const pool = (Color as any).pool;
    if (pool) {
      pool.length = Math.min(5, pool.length);
    }
    
    // Clear caches significantly
    if (basicCache.size > 20) {
      const cache = (basicCache as any).cache;
      if (cache && cache.keys) {
        const keys = Array.from(cache.keys());
        const toKeep = 20;
        for (let i = toKeep; i < keys.length; i++) {
          basicCache.delete(keys[i] as string);
        }
      }
    }
    
    if (advancedCache.size > 20) {
      // Keep only most frequent items
      const topItems = advancedCache.getMostFrequent(20);
      advancedCache.clear();
      topItems.forEach(item => {
        advancedCache.set(item.key, item.value);
      });
    }
  }
  
  /**
   * Manual cleanup - call this to free memory
   */
  cleanup(): void {
    // Stop auto cleanup
    this.stopAutoCleanup();
    
    // Clear color static resources
    if (Color.cleanup) {
      Color.cleanup();
    }
    
    // Clear all caches
    basicCache.clear();
    advancedCache.destroy();
    
    // Clear timer
    if (this.memoryCheckTimer !== null) {
      clearTimeout(this.memoryCheckTimer);
      this.memoryCheckTimer = null;
    }
  }
  
  /**
   * Reset all caches and pools
   */
  reset(): void {
    // Clear color pool
    const pool = (Color as any).pool;
    if (pool) {
      pool.length = 0;
    }
    
    // Clear caches
    basicCache.clear();
    advancedCache.clear();
    
    // Reset statistics
    const stats = (advancedCache as any).stats;
    if (stats) {
      stats.hits = 0;
      stats.misses = 0;
    }
  }
  
  /**
   * Set maximum memory limit
   */
  setMemoryLimit(limitMB: number): void {
    (this as any).MAX_MEMORY_MB = Math.max(10, limitMB);
  }
  
  /**
   * Enable/disable auto cleanup
   */
  setAutoCleanup(enabled: boolean): void {
    if (enabled) {
      this.startAutoCleanup();
    } else {
      this.stopAutoCleanup();
    }
  }
  
  /**
   * Perform garbage collection hint (if available)
   */
  requestGarbageCollection(): void {
    // This is a hint to the browser to perform GC
    // Note: This is not guaranteed and depends on the browser
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
      } catch {
        // GC not available or failed
      }
    }
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// Export convenience functions
export function cleanupMemory(): void {
  memoryManager.cleanup();
}

export function resetMemory(): void {
  memoryManager.reset();
}

export function getMemoryStats(): MemoryStats {
  return memoryManager.getMemoryStats();
}

export function setMemoryLimit(limitMB: number): void {
  memoryManager.setMemoryLimit(limitMB);
}

export function setAutoCleanup(enabled: boolean): void {
  memoryManager.setAutoCleanup(enabled);
}