/**
 * @ldesign/i18n - Performance Monitor
 * 性能监控系统，实时跟踪和优化翻译性能
 */


/**
 * 性能指标
 */
export interface PerformanceMetrics {
  // 翻译性能
  translationCount: number;
  averageTranslationTime: number;
  slowestTranslation: { key: string; time: number };
  fastestTranslation: { key: string; time: number };
  
  // 缓存性能
  cacheHitRate: number;
  cacheSize: number;
  cacheMisses: number;
  cacheHits: number;
  
  // 加载性能
  loadedLocales: number;
  loadTime: Map<string, number>;
  averageLoadTime: number;
  totalLoadSize: number;
  
  // 内存性能
  memoryUsage: number;
  peakMemoryUsage: number;
  gcCount: number;
  memoryLeaks: number;
  
  // 实时性能
  fps: number;
  jank: number;
  renderTime: number;
  scriptTime: number;
}

/**
 * 性能事件
 */
export interface PerformanceEvent {
  type: 'translation' | 'load' | 'cache' | 'memory' | 'render';
  timestamp: number;
  duration: number;
  details: any;
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  metrics: PerformanceMetrics;
  events: PerformanceEvent[];
  recommendations: string[];
  timestamp: Date;
}

/**
 * 监控配置
 */
export interface MonitorConfig {
  enabled?: boolean;
  sampleRate?: number; // 采样率 (0-1)
  reportInterval?: number; // 报告间隔（毫秒）
  slowThreshold?: number; // 慢速阈值（毫秒）
  enableProfiling?: boolean;
  enableMemoryTracking?: boolean;
  enableNetworkTracking?: boolean;
  maxEvents?: number; // 最大事件数
  alertThresholds?: {
    translationTime?: number;
    cacheHitRate?: number;
    memoryUsage?: number;
    fps?: number;
  };
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private readonly config: MonitorConfig;
  private metrics: PerformanceMetrics;
  private events: PerformanceEvent[] = [];
  private readonly observers = new Map<string, PerformanceObserver>();
  private readonly timers = new Map<string, number>();
  private reportTimer?: NodeJS.Timeout;
  private memoryCheckTimer?: NodeJS.Timeout;
  private rafId?: number;
  private lastFrameTime = 0;
  private frameCount = 0;
  private jankCount = 0;
  private isDestroyed = false;

  constructor(config: MonitorConfig = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1,
      reportInterval: 60000, // 1 minute
      slowThreshold: 100, // 100ms
      enableProfiling: true,
      enableMemoryTracking: true,
      enableNetworkTracking: true,
      maxEvents: 1000,
      alertThresholds: {
        translationTime: 50,
        cacheHitRate: 0.8,
        memoryUsage: 100 * 1024 * 1024, // 100MB
        fps: 30
      },
      ...config
    };

    this.metrics = this.initMetrics();
    
    if (this.config?.enabled) {
      this.start();
    }
  }

  /**
   * 开始监控
   */
  start(): void {
    this.initializeObservers();
    this.startReporting();
    this.startFrameMonitoring();
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isDestroyed = true;
    
    // 清理观察器
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // 清理定时器
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }
    
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer);
      this.memoryCheckTimer = undefined;
    }
    
    // 清理动画帧
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    
    // 清理其他资源
    this.timers.clear();
    this.events = [];
  }

  /**
   * 记录翻译性能
   */
  recordTranslation(key: string, startTime: number): void {
    if (!this.shouldSample()) return;

    const duration = performance.now() - startTime;
    
    this.metrics.translationCount++;
    this.metrics.averageTranslationTime = 
      (this.metrics.averageTranslationTime * (this.metrics.translationCount - 1) + duration) / 
      this.metrics.translationCount;

    if (!this.metrics.slowestTranslation || duration > this.metrics.slowestTranslation.time) {
      this.metrics.slowestTranslation = { key, time: duration };
    }

    if (!this.metrics.fastestTranslation || duration < this.metrics.fastestTranslation.time) {
      this.metrics.fastestTranslation = { key, time: duration };
    }

    if (duration > this.config?.slowThreshold!) {
      this.addEvent({
        type: 'translation',
        timestamp: Date.now(),
        duration,
        details: { key, slow: true }
      });

      console.warn(`[PerformanceMonitor] Slow translation detected: "${key}" took ${duration.toFixed(2)}ms`);
    }

    this.checkAlerts('translation', duration);
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    this.metrics.cacheHits++;
    this.updateCacheHitRate();
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
    this.updateCacheHitRate();
  }

  /**
   * 记录加载性能
   */
  recordLoad(locale: string, size: number, duration: number): void {
    this.metrics.loadedLocales++;
    this.metrics.loadTime.set(locale, duration);
    this.metrics.totalLoadSize += size;
    
    const times = Array.from(this.metrics.loadTime.values());
    this.metrics.averageLoadTime = times.reduce((a, b) => a + b, 0) / times.length;

    this.addEvent({
      type: 'load',
      timestamp: Date.now(),
      duration,
      details: { locale, size }
    });
  }

  /**
   * 记录内存使用
   */
  recordMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
    
    if (usage > this.metrics.peakMemoryUsage) {
      this.metrics.peakMemoryUsage = usage;
    }

    this.checkAlerts('memory', usage);
  }

  /**
   * 开始计时
   */
  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  /**
   * 结束计时
   */
  endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    return duration;
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取性能报告
   */
  getReport(): PerformanceReport {
    return {
      metrics: this.getMetrics(),
      events: [...this.events],
      recommendations: this.generateRecommendations(),
      timestamp: new Date()
    };
  }

  /**
   * 生成优化建议
   */
  generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // 翻译性能建议
    if (this.metrics.averageTranslationTime > 10) {
      recommendations.push('Consider enabling more aggressive caching to reduce translation time');
    }

    // 缓存建议
    if (this.metrics.cacheHitRate < 0.8) {
      recommendations.push('Cache hit rate is low. Consider increasing cache size or TTL');
    }

    // 内存建议
    if (this.metrics.memoryUsage > 50 * 1024 * 1024) {
      recommendations.push('High memory usage detected. Enable compression for large translations');
    }

    // 加载建议
    if (this.metrics.averageLoadTime > 1000) {
      recommendations.push('Slow loading detected. Consider using CDN or enabling lazy loading');
    }

    // FPS建议
    if (this.metrics.fps < 30) {
      recommendations.push('Low FPS detected. Reduce translation frequency or use debouncing');
    }

    return recommendations;
  }

  /**
   * 导出性能数据
   */
  exportData(): string {
    const report = this.getReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = this.initMetrics();
    this.events = [];
  }

  /**
   * 初始化指标
   */
  private initMetrics(): PerformanceMetrics {
    return {
      translationCount: 0,
      averageTranslationTime: 0,
      slowestTranslation: { key: '', time: 0 },
      fastestTranslation: { key: '', time: Infinity },
      cacheHitRate: 0,
      cacheSize: 0,
      cacheMisses: 0,
      cacheHits: 0,
      loadedLocales: 0,
      loadTime: new Map(),
      averageLoadTime: 0,
      totalLoadSize: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      gcCount: 0,
      memoryLeaks: 0,
      fps: 60,
      jank: 0,
      renderTime: 0,
      scriptTime: 0
    };
  }

  /**
   * 初始化观察器
   */
  private initializeObservers(): void {
    // Performance Observer for navigation timing
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const nav = entry as PerformanceNavigationTiming;
              
            }
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (e) {
        console.warn('[PerformanceMonitor] Navigation observer not supported');
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('.json') || entry.name.includes('i18n')) {
              const resource = entry as PerformanceResourceTiming;
              this.recordLoad(
                entry.name,
                resource.encodedBodySize || 0,
                resource.responseEnd - resource.startTime
              );
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('[PerformanceMonitor] Resource observer not supported');
      }

      // Long task observer
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.jankCount++;
            this.addEvent({
              type: 'render',
              timestamp: Date.now(),
              duration: entry.duration,
              details: { type: 'longTask' }
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('[PerformanceMonitor] Long task observer not supported');
      }
    }

    // Memory monitoring
    if (this.config?.enableMemoryTracking) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      if (this.isDestroyed) return;
      
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        this.recordMemoryUsage(memory.usedJSHeapSize);
        
        // 检测潜在的内存泄漏
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('[PerformanceMonitor] Potential memory leak detected');
          this.metrics.memoryLeaks++;
        }
      }
    };

    this.memoryCheckTimer = setInterval(checkMemory, 10000); // 每10秒检查一次
    // In Node.js, avoid keeping the event loop alive
    if (typeof (this.memoryCheckTimer as any)?.unref === 'function') {
      (this.memoryCheckTimer as any).unref();
    }
  }

  /**
   * 开始帧率监控
   */
  private startFrameMonitoring(): void {
    const measureFrame = (timestamp: number) => {
      if (this.isDestroyed) return;
      
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        
        // 检测掉帧（> 33ms意味着低于30fps）
        if (delta > 33) {
          this.jankCount++;
        }

        this.frameCount++;
        
        // 每秒计算一次FPS
        if (this.frameCount >= 60) {
          this.metrics.fps = 1000 / (delta / this.frameCount);
          this.metrics.jank = this.jankCount;
          this.frameCount = 0;
          this.jankCount = 0;
        }
      }

      this.lastFrameTime = timestamp;
      
      if (!this.isDestroyed) {
        this.rafId = requestAnimationFrame(measureFrame);
      }
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  /**
   * 开始定期报告
   */
  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(this.reportTimer!);
        return;
      }
      
      const report = this.getReport();
      
      // 触发自定义事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('i18n:performance', { detail: report }));
      }
    }, this.config?.reportInterval!);
    // In Node.js, avoid keeping the event loop alive
    if (typeof (this.reportTimer as any)?.unref === 'function') {
      (this.reportTimer as any).unref();
    }
  }

  /**
   * 更新缓存命中率
   */
  private updateCacheHitRate(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total > 0) {
      this.metrics.cacheHitRate = this.metrics.cacheHits / total;
    }
  }

  /**
   * 添加事件
   */
  private addEvent(event: PerformanceEvent): void {
    // 限制事件数量
    if (this.events.length >= this.config?.maxEvents!) {
      this.events.shift();
    }
    
    this.events.push(event);
  }

  /**
   * 检查告警
   */
  private checkAlerts(type: string, value: number): void {
    const thresholds = this.config?.alertThresholds!;
    
    switch (type) {
      case 'translation':
        if (value > thresholds.translationTime!) {
          console.warn(`[PerformanceMonitor] Translation time exceeded threshold: ${value}ms`);
        }
        break;
      case 'memory':
        if (value > thresholds.memoryUsage!) {
          console.warn(`[PerformanceMonitor] Memory usage exceeded threshold: ${(value / 1024 / 1024).toFixed(2)}MB`);
        }
        break;
    }
  }

  /**
   * 是否应该采样
   */
  private shouldSample(): boolean {
    return Math.random() < this.config?.sampleRate!;
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(config?: MonitorConfig): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * 性能装饰器
 */
export function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const monitor = (this as any).performanceMonitor;
    if (monitor) {
      monitor.startTimer(propertyKey);
    }
    
    const result = await originalMethod.apply(this, args);
    
    if (monitor) {
      monitor.endTimer(propertyKey);
    }
    
    return result;
  };
  
  return descriptor;
}