/**
 * @ldesign/cropper - 内存管理器
 * 
 * 管理图片裁剪器的内存使用和资源清理
 */

import { PERFORMANCE_THRESHOLDS } from '../constants';

/**
 * 缓存项
 */
interface CacheItem<T> {
  key: string;
  value: T;
  size: number;
  lastAccessed: number;
  accessCount: number;
}

/**
 * 内存统计
 */
export interface MemoryStats {
  /** 总缓存大小 (bytes) */
  totalCacheSize: number;
  /** 缓存项数量 */
  cacheItemCount: number;
  /** 最大缓存大小 (bytes) */
  maxCacheSize: number;
  /** 缓存命中率 */
  hitRate: number;
  /** 内存使用率 */
  memoryUsage: number;
}

/**
 * 内存管理器类
 * 
 * 提供智能缓存、内存监控和自动清理功能
 */
export class MemoryManager {
  private imageCache = new Map<string, CacheItem<HTMLImageElement>>();
  private canvasCache = new Map<string, CacheItem<HTMLCanvasElement>>();
  private dataCache = new Map<string, CacheItem<any>>();
  
  private maxCacheSize: number;
  private currentCacheSize = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isAutoCleanupEnabled = true;

  constructor(maxCacheSize: number = PERFORMANCE_THRESHOLDS.MAX_CACHE_SIZE) {
    this.maxCacheSize = maxCacheSize;
    this.startAutoCleanup();
  }

  /**
   * 开始自动清理
   */
  private startAutoCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      if (this.isAutoCleanupEnabled) {
        this.performCleanup();
      }
    }, 30000); // 每30秒检查一次
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 缓存图像
   */
  cacheImage(key: string, image: HTMLImageElement): void {
    const size = this.estimateImageSize(image);
    
    if (size > this.maxCacheSize * 0.5) {
      // 图像太大，不缓存
      return;
    }

    this.ensureSpace(size);
    
    const item: CacheItem<HTMLImageElement> = {
      key,
      value: image,
      size,
      lastAccessed: Date.now(),
      accessCount: 1
    };

    this.imageCache.set(key, item);
    this.currentCacheSize += size;
  }

  /**
   * 获取缓存的图像
   */
  getCachedImage(key: string): HTMLImageElement | null {
    const item = this.imageCache.get(key);
    
    if (item) {
      item.lastAccessed = Date.now();
      item.accessCount++;
      this.cacheHits++;
      return item.value;
    }
    
    this.cacheMisses++;
    return null;
  }

  /**
   * 缓存Canvas
   */
  cacheCanvas(key: string, canvas: HTMLCanvasElement): void {
    const size = this.estimateCanvasSize(canvas);
    
    if (size > this.maxCacheSize * 0.3) {
      // Canvas太大，不缓存
      return;
    }

    this.ensureSpace(size);
    
    const item: CacheItem<HTMLCanvasElement> = {
      key,
      value: canvas,
      size,
      lastAccessed: Date.now(),
      accessCount: 1
    };

    this.canvasCache.set(key, item);
    this.currentCacheSize += size;
  }

  /**
   * 获取缓存的Canvas
   */
  getCachedCanvas(key: string): HTMLCanvasElement | null {
    const item = this.canvasCache.get(key);
    
    if (item) {
      item.lastAccessed = Date.now();
      item.accessCount++;
      this.cacheHits++;
      return item.value;
    }
    
    this.cacheMisses++;
    return null;
  }

  /**
   * 缓存数据
   */
  cacheData<T>(key: string, data: T): void {
    const size = this.estimateDataSize(data);
    
    this.ensureSpace(size);
    
    const item: CacheItem<T> = {
      key,
      value: data,
      size,
      lastAccessed: Date.now(),
      accessCount: 1
    };

    this.dataCache.set(key, item);
    this.currentCacheSize += size;
  }

  /**
   * 获取缓存的数据
   */
  getCachedData<T>(key: string): T | null {
    const item = this.dataCache.get(key);
    
    if (item) {
      item.lastAccessed = Date.now();
      item.accessCount++;
      this.cacheHits++;
      return item.value;
    }
    
    this.cacheMisses++;
    return null;
  }

  /**
   * 确保有足够空间
   */
  private ensureSpace(requiredSize: number): void {
    while (this.currentCacheSize + requiredSize > this.maxCacheSize) {
      if (!this.evictLeastUsed()) {
        // 无法释放更多空间
        break;
      }
    }
  }

  /**
   * 驱逐最少使用的项
   */
  private evictLeastUsed(): boolean {
    let oldestItem: { cache: Map<string, CacheItem<any>>; key: string; item: CacheItem<any> } | null = null;
    let oldestTime = Date.now();

    // 查找最久未访问的项
    [this.imageCache, this.canvasCache, this.dataCache].forEach(cache => {
      cache.forEach((item, key) => {
        if (item.lastAccessed < oldestTime) {
          oldestTime = item.lastAccessed;
          oldestItem = { cache, key, item };
        }
      });
    });

    if (oldestItem) {
      this.currentCacheSize -= oldestItem.item.size;
      oldestItem.cache.delete(oldestItem.key);
      return true;
    }

    return false;
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5分钟

    // 清理过期项
    [this.imageCache, this.canvasCache, this.dataCache].forEach(cache => {
      cache.forEach((item, key) => {
        if (now - item.lastAccessed > maxAge) {
          this.currentCacheSize -= item.size;
          cache.delete(key);
        }
      });
    });

    // 如果缓存仍然过大，清理访问次数少的项
    if (this.currentCacheSize > this.maxCacheSize * 0.8) {
      this.cleanupLowAccessItems();
    }
  }

  /**
   * 清理低访问次数的项
   */
  private cleanupLowAccessItems(): void {
    const items: Array<{ cache: Map<string, CacheItem<any>>; key: string; item: CacheItem<any> }> = [];

    [this.imageCache, this.canvasCache, this.dataCache].forEach(cache => {
      cache.forEach((item, key) => {
        items.push({ cache, key, item });
      });
    });

    // 按访问次数排序
    items.sort((a, b) => a.item.accessCount - b.item.accessCount);

    // 删除访问次数最少的项，直到缓存大小合理
    for (const { cache, key, item } of items) {
      if (this.currentCacheSize <= this.maxCacheSize * 0.7) {
        break;
      }
      
      this.currentCacheSize -= item.size;
      cache.delete(key);
    }
  }

  /**
   * 估算图像大小
   */
  private estimateImageSize(image: HTMLImageElement): number {
    return image.naturalWidth * image.naturalHeight * 4; // RGBA
  }

  /**
   * 估算Canvas大小
   */
  private estimateCanvasSize(canvas: HTMLCanvasElement): number {
    return canvas.width * canvas.height * 4; // RGBA
  }

  /**
   * 估算数据大小
   */
  private estimateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // 粗略估算
    } catch {
      return 1024; // 默认1KB
    }
  }

  /**
   * 清理指定类型的缓存
   */
  clearCache(type?: 'image' | 'canvas' | 'data'): void {
    if (!type) {
      // 清理所有缓存
      this.imageCache.clear();
      this.canvasCache.clear();
      this.dataCache.clear();
      this.currentCacheSize = 0;
    } else {
      switch (type) {
        case 'image':
          this.imageCache.forEach(item => {
            this.currentCacheSize -= item.size;
          });
          this.imageCache.clear();
          break;
        case 'canvas':
          this.canvasCache.forEach(item => {
            this.currentCacheSize -= item.size;
          });
          this.canvasCache.clear();
          break;
        case 'data':
          this.dataCache.forEach(item => {
            this.currentCacheSize -= item.size;
          });
          this.dataCache.clear();
          break;
      }
    }
  }

  /**
   * 获取内存统计
   */
  getMemoryStats(): MemoryStats {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;
    
    return {
      totalCacheSize: this.currentCacheSize,
      cacheItemCount: this.imageCache.size + this.canvasCache.size + this.dataCache.size,
      maxCacheSize: this.maxCacheSize,
      hitRate,
      memoryUsage: this.currentCacheSize / this.maxCacheSize
    };
  }

  /**
   * 设置最大缓存大小
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    
    // 如果当前缓存超过新限制，执行清理
    if (this.currentCacheSize > this.maxCacheSize) {
      this.performCleanup();
    }
  }

  /**
   * 启用/禁用自动清理
   */
  setAutoCleanup(enabled: boolean): void {
    this.isAutoCleanupEnabled = enabled;
    
    if (enabled && !this.cleanupInterval) {
      this.startAutoCleanup();
    } else if (!enabled && this.cleanupInterval) {
      this.stopAutoCleanup();
    }
  }

  /**
   * 强制垃圾回收（如果支持）
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * 获取缓存详情
   */
  getCacheDetails(): {
    images: Array<{ key: string; size: number; lastAccessed: number; accessCount: number }>;
    canvases: Array<{ key: string; size: number; lastAccessed: number; accessCount: number }>;
    data: Array<{ key: string; size: number; lastAccessed: number; accessCount: number }>;
  } {
    const mapToArray = (cache: Map<string, CacheItem<any>>) => 
      Array.from(cache.entries()).map(([key, item]) => ({
        key,
        size: item.size,
        lastAccessed: item.lastAccessed,
        accessCount: item.accessCount
      }));

    return {
      images: mapToArray(this.imageCache),
      canvases: mapToArray(this.canvasCache),
      data: mapToArray(this.dataCache)
    };
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.clearCache();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}
