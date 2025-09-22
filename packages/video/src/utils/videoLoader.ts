/**
 * 视频加载优化工具
 * 实现渐进式加载、预加载优化、缓存策略等
 */

export interface VideoSource {
  url: string;
  quality: string;
  size?: number;
  type?: string;
}

export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTime: number; // seconds
}

export interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  quality: string;
}

export interface VideoLoaderConfig {
  chunkSize: number; // 分块大小
  maxCacheSize: number; // 最大缓存大小（字节）
  maxCacheAge: number; // 缓存过期时间（毫秒）
  preloadSize: number; // 预加载大小（字节）
  enableCache: boolean;
  enablePreload: boolean;
  enableProgressiveLoad: boolean;
}

export class VideoLoader {
  private config: VideoLoaderConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private activeLoads: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (progress: LoadingProgress) => void> = new Map();

  constructor(config: Partial<VideoLoaderConfig> = {}) {
    this.config = {
      chunkSize: 1024 * 1024, // 1MB
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      maxCacheAge: 30 * 60 * 1000, // 30分钟
      preloadSize: 5 * 1024 * 1024, // 5MB
      enableCache: true,
      enablePreload: true,
      enableProgressiveLoad: true,
      ...config
    };

    // 定期清理过期缓存
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000); // 5分钟
  }

  /**
   * 加载视频
   */
  public async loadVideo(
    source: VideoSource,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<Blob> {
    const { url } = source;

    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.getFromCache(url);
      if (cached) {
        return cached.blob;
      }
    }

    // 取消之前的加载
    this.cancelLoad(url);

    // 创建新的加载控制器
    const controller = new AbortController();
    this.activeLoads.set(url, controller);

    if (onProgress) {
      this.progressCallbacks.set(url, onProgress);
    }

    try {
      let blob: Blob;

      if (this.config.enableProgressiveLoad && source.size && source.size > this.config.chunkSize) {
        blob = await this.loadProgressively(source, controller.signal);
      } else {
        blob = await this.loadDirectly(source, controller.signal);
      }

      // 添加到缓存
      if (this.config.enableCache) {
        this.addToCache(url, blob, source.quality || 'unknown');
      }

      return blob;
    } finally {
      this.activeLoads.delete(url);
      this.progressCallbacks.delete(url);
    }
  }

  /**
   * 预加载视频
   */
  public async preloadVideo(source: VideoSource): Promise<void> {
    if (!this.config.enablePreload) {
      return;
    }

    const { url } = source;

    // 检查是否已在缓存中
    if (this.getFromCache(url)) {
      return;
    }

    // 只预加载一部分
    try {
      await this.loadPartial(source, this.config.preloadSize);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }

  /**
   * 取消加载
   */
  public cancelLoad(url: string): void {
    const controller = this.activeLoads.get(url);
    if (controller) {
      controller.abort();
      this.activeLoads.delete(url);
      this.progressCallbacks.delete(url);
    }
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存状态
   */
  public getCacheStatus(): {
    size: number;
    count: number;
    maxSize: number;
    usage: number;
  } {
    const size = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);

    return {
      size,
      count: this.cache.size,
      maxSize: this.config.maxCacheSize,
      usage: size / this.config.maxCacheSize
    };
  }

  /**
   * 渐进式加载
   */
  private async loadProgressively(source: VideoSource, signal: AbortSignal): Promise<Blob> {
    const { url, size = 0 } = source;
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    const startTime = Date.now();

    for (let start = 0; start < size; start += this.config.chunkSize) {
      if (signal.aborted) {
        throw new Error('Load aborted');
      }

      const end = Math.min(start + this.config.chunkSize - 1, size - 1);
      const chunk = await this.loadRange(url, start, end, signal);

      chunks.push(new Uint8Array(chunk));
      loaded += chunk.byteLength;

      // 更新进度
      this.updateProgress(url, loaded, size, startTime);
    }

    return new Blob(chunks);
  }

  /**
   * 直接加载
   */
  private async loadDirectly(source: VideoSource, signal: AbortSignal): Promise<Blob> {
    const { url } = source;
    const startTime = Date.now();

    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`Failed to load video: ${response.status}`);
    }

    const total = parseInt(response.headers.get('content-length') || '0', 10);
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        if (signal.aborted) {
          throw new Error('Load aborted');
        }

        chunks.push(value);
        loaded += value.length;

        this.updateProgress(url, loaded, total, startTime);
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks);
  }

  /**
   * 加载指定范围
   */
  private async loadRange(url: string, start: number, end: number, signal: AbortSignal): Promise<ArrayBuffer> {
    const response = await fetch(url, {
      headers: {
        'Range': `bytes=${start}-${end}`
      },
      signal
    });

    if (!response.ok) {
      throw new Error(`Failed to load range ${start}-${end}: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  /**
   * 部分加载（用于预加载）
   */
  private async loadPartial(source: VideoSource, size: number): Promise<void> {
    const { url } = source;

    try {
      const response = await fetch(url, {
        headers: {
          'Range': `bytes=0-${size - 1}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        this.addToCache(url, blob, source.quality || 'unknown', true);
      }
    } catch (error) {
      // 忽略预加载错误
    }
  }

  /**
   * 更新加载进度
   */
  private updateProgress(url: string, loaded: number, total: number, startTime: number): void {
    const callback = this.progressCallbacks.get(url);
    if (!callback) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const speed = loaded / elapsed;
    const remaining = total - loaded;
    const estimatedTime = remaining / speed;

    const progress: LoadingProgress = {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 0,
      speed,
      estimatedTime: isFinite(estimatedTime) ? estimatedTime : 0
    };

    callback(progress);
  }

  /**
   * 从缓存获取
   */
  private getFromCache(url: string): CacheEntry | null {
    const entry = this.cache.get(url);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.config.maxCacheAge) {
      this.cache.delete(url);
      return null;
    }

    return entry;
  }

  /**
   * 添加到缓存
   */
  private addToCache(url: string, blob: Blob, quality: string, isPartial = false): void {
    if (!this.config.enableCache) {
      return;
    }

    // 检查缓存大小限制
    const currentSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);

    if (currentSize + blob.size > this.config.maxCacheSize) {
      this.evictCache(blob.size);
    }

    const entry: CacheEntry = {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
      quality
    };

    this.cache.set(url, entry);
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();

    for (const [url, entry] of this.cache) {
      if (now - entry.timestamp > this.config.maxCacheAge) {
        this.cache.delete(url);
      }
    }
  }

  /**
   * 缓存淘汰（LRU策略）
   */
  private evictCache(requiredSize: number): void {
    const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

    let freedSize = 0;

    for (const [url, entry] of entries) {
      this.cache.delete(url);
      freedSize += entry.size;

      if (freedSize >= requiredSize) {
        break;
      }
    }
  }

  /**
   * 清理所有资源
   */
  cleanup(): void {
    // 取消所有正在进行的加载
    for (const controller of this.activeLoads.values()) {
      controller.abort();
    }
    this.activeLoads.clear();

    // 清理缓存
    this.cache.clear();

    // 清理回调
    this.progressCallbacks.clear();
  }
}

// 全局视频加载器实例
export const globalVideoLoader = new VideoLoader();
