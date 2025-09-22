/**
 * 性能优化工具
 * 提供性能监控、优化和分析功能
 */

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private enabled = true;

  /**
   * 开始性能监控
   */
  start(): void {
    this.enabled = true;
    this.setupObservers();
  }

  /**
   * 停止性能监控
   */
  stop(): void {
    this.enabled = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * 记录性能指标
   */
  mark(name: string): void {
    if (!this.enabled) return;
    
    const timestamp = performance.now();
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(timestamp);
    
    performance.mark(name);
  }

  /**
   * 测量性能
   */
  measure(name: string, startMark: string, endMark?: string): number {
    if (!this.enabled) return 0;
    
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      const lastEntry = entries[entries.length - 1];
      return lastEntry ? lastEntry.duration : 0;
    } catch (error) {
      console.warn('Performance measure failed:', error);
      return 0;
    }
  }

  /**
   * 获取性能统计
   */
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    total: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const count = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const total = values.reduce((sum, val) => sum + val, 0);
    const avg = total / count;

    return { count, min, max, avg, total };
  }

  /**
   * 清除性能数据
   */
  clear(): void {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  private setupObservers(): void {
    // 监控导航性能
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);

      // 监控资源加载性能
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordResourceMetrics(entry as PerformanceResourceTiming);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'nav:dns': entry.domainLookupEnd - entry.domainLookupStart,
      'nav:connect': entry.connectEnd - entry.connectStart,
      'nav:request': entry.responseStart - entry.requestStart,
      'nav:response': entry.responseEnd - entry.responseStart,
      'nav:dom': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      'nav:load': entry.loadEventEnd - entry.loadEventStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        if (!this.metrics.has(name)) {
          this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(value);
      }
    });
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    if (entry.name.includes('video') || entry.name.includes('mp4')) {
      const loadTime = entry.responseEnd - entry.startTime;
      if (!this.metrics.has('video:load')) {
        this.metrics.set('video:load', []);
      }
      this.metrics.get('video:load')!.push(loadTime);
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 请求动画帧节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
  private interval: NodeJS.Timeout | null = null;
  private callbacks: Array<(info: any) => void> = [];

  start(intervalMs = 5000): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      const memInfo = this.getMemoryInfo();
      this.callbacks.forEach(callback => callback(memInfo));
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  onUpdate(callback: (info: any) => void): void {
    this.callbacks.push(callback);
  }

  private getMemoryInfo(): any {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }
}

/**
 * 资源预加载器
 */
export class ResourcePreloader {
  private cache = new Map<string, Promise<any>>();

  /**
   * 预加载视频
   */
  preloadVideo(url: string): Promise<HTMLVideoElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const promise = new Promise<HTMLVideoElement>((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.addEventListener('loadedmetadata', () => resolve(video));
      video.addEventListener('error', reject);
      
      video.src = url;
    });

    this.cache.set(url, promise);
    return promise;
  }

  /**
   * 预加载图片
   */
  preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    this.cache.set(url, promise);
    return promise;
  }

  /**
   * 批量预加载
   */
  async preloadBatch(urls: string[]): Promise<any[]> {
    const promises = urls.map(url => {
      if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return this.preloadVideo(url);
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return this.preloadImage(url);
      }
      return Promise.resolve(null);
    });

    return Promise.all(promises);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * 虚拟滚动优化
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private startIndex = 0;
  private endIndex = 0;

  constructor(container: HTMLElement, itemHeight: number) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
  }

  /**
   * 更新可见范围
   */
  updateVisibleRange(scrollTop: number, totalItems: number): {
    startIndex: number;
    endIndex: number;
    offsetY: number;
  } {
    this.startIndex = Math.floor(scrollTop / this.itemHeight);
    this.endIndex = Math.min(this.startIndex + this.visibleCount, totalItems);
    
    const offsetY = this.startIndex * this.itemHeight;
    
    return {
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      offsetY
    };
  }

  /**
   * 获取总高度
   */
  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }
}

/**
 * 懒加载工具
 */
export class LazyLoader {
  private observer: IntersectionObserver;
  private targets = new Set<HTMLElement>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadTarget(entry.target as HTMLElement);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }

  /**
   * 观察元素
   */
  observe(element: HTMLElement): void {
    this.targets.add(element);
    this.observer.observe(element);
  }

  /**
   * 停止观察元素
   */
  unobserve(element: HTMLElement): void {
    this.targets.delete(element);
    this.observer.unobserve(element);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.observer.disconnect();
    this.targets.clear();
  }

  private loadTarget(element: HTMLElement): void {
    const src = element.dataset.src;
    if (src) {
      if (element.tagName === 'IMG') {
        (element as HTMLImageElement).src = src;
      } else if (element.tagName === 'VIDEO') {
        (element as HTMLVideoElement).src = src;
      }
      
      element.removeAttribute('data-src');
      this.unobserve(element);
    }
  }
}

/**
 * 图片优化器
 */
export class ImageOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * 压缩图片
   */
  public compressImage(
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx.drawImage(img, 0, 0, width, height);

        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 计算缩放后的尺寸
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }
}



/**
 * 全局性能监控实例
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * 全局内存监控实例
 */
export const memoryMonitor = new MemoryMonitor();

/**
 * 全局资源预加载器实例
 */
export const resourcePreloader = new ResourcePreloader();
