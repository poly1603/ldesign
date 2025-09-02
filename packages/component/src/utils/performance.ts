/**
 * 性能监控工具
 * 
 * 提供组件性能监控和优化工具
 */

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private enabled: boolean = true;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 启用/禁用性能监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 开始计时
   */
  startTiming(name: string): void {
    if (!this.enabled) return;
    
    this.metrics.set(name, performance.now());
    
    // 使用 Performance API 标记
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * 结束计时
   */
  endTiming(name: string): number {
    if (!this.enabled) return 0;
    
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(name);
      
      // 使用 Performance API 测量
      if (performance.mark && performance.measure) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
      
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }

  /**
   * 测量函数执行时间
   */
  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>) => {
      this.startTiming(name);
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.endTiming(name);
        });
      } else {
        this.endTiming(name);
        return result;
      }
    }) as T;
  }

  /**
   * 测量组件渲染时间
   */
  measureComponentRender(componentName: string, renderFn: () => void): void {
    if (!this.enabled) {
      renderFn();
      return;
    }
    
    this.startTiming(`${componentName}-render`);
    renderFn();
    this.endTiming(`${componentName}-render`);
  }

  /**
   * 监控长任务
   */
  observeLongTasks(): void {
    if (!this.enabled || !window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('Long task observation not supported');
    }
  }

  /**
   * 监控内存使用
   */
  observeMemory(): void {
    if (!this.enabled || !(performance as any).memory) return;
    
    const memory = (performance as any).memory;
    console.log(`💾 Memory usage:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  /**
   * 监控 FPS
   */
  observeFPS(callback?: (fps: number) => void): () => void {
    if (!this.enabled) return () => {};
    
    let frames = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        console.log(`🎯 FPS: ${fps}`);
        
        if (callback) {
          callback(fps);
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    const entries = performance.getEntriesByType('measure');
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      measures: entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime,
      })),
      navigation: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
      } : null,
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : null,
    };
  }

  /**
   * 获取首次绘制时间
   */
  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

  /**
   * 清理所有观察器
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  measures: Array<{
    name: string;
    duration: number;
    startTime: number;
  }>;
  navigation: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number | null;
    firstContentfulPaint: number | null;
  } | null;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
}

/**
 * 性能装饰器
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      return monitor.measureFunction(measureName, originalMethod).apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
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
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 懒加载工具
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private callbacks: Map<Element, () => void> = new Map();

  constructor(options?: IntersectionObserverInit) {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      }, options);
    }
  }

  /**
   * 观察元素
   */
  observe(element: Element, callback: () => void): void {
    if (!this.observer) {
      // 降级处理：直接执行回调
      callback();
      return;
    }
    
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  /**
   * 停止观察元素
   */
  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.callbacks.delete(element);
  }

  /**
   * 销毁观察器
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callbacks.clear();
  }
}

/**
 * 虚拟滚动工具
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop: number = 0;
  private startIndex: number = 0;
  private endIndex: number = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    visibleCount: number,
    totalCount: number
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.totalCount = totalCount;
    
    this.updateVisibleRange();
    this.setupScrollListener();
  }

  /**
   * 更新可见范围
   */
  private updateVisibleRange(): void {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    this.endIndex = Math.min(
      this.startIndex + this.visibleCount + 1,
      this.totalCount
    );
  }

  /**
   * 设置滚动监听器
   */
  private setupScrollListener(): void {
    const handleScroll = throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.updateVisibleRange();
      this.render();
    }, 16); // 60fps
    
    this.container.addEventListener('scroll', handleScroll);
  }

  /**
   * 渲染可见项
   */
  private render(): void {
    // 这里应该由具体的组件实现
    console.log(`Rendering items ${this.startIndex} to ${this.endIndex}`);
  }

  /**
   * 获取可见范围
   */
  getVisibleRange(): { start: number; end: number } {
    return {
      start: this.startIndex,
      end: this.endIndex,
    };
  }

  /**
   * 更新总数量
   */
  updateTotalCount(count: number): void {
    this.totalCount = count;
    this.updateVisibleRange();
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();
