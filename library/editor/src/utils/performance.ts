/**
 * Performance Monitoring and Optimization Utilities
 * 
 * Provides tools for measuring and optimizing editor performance.
 */

import { logger } from './logger';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  operationCount: number;
  fps: number;
  timestamp: number;
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsInterval: number | null = null;

  constructor() {
    this.startFPSMonitoring();
  }

  /**
   * Start performance measurement
   */
  startMeasurement(name: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      return duration;
    };
  }

  /**
   * Measure function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    const endMeasurement = this.startMeasurement(name);
    const result = fn();
    endMeasurement();
    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const endMeasurement = this.startMeasurement(name);
    const result = await fn();
    endMeasurement();
    return result;
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      renderTime: 0,
      updateTime: 0,
      memoryUsage: this.getMemoryUsage(),
      operationCount: 0,
      fps: this.getCurrentFPS(),
      timestamp: Date.now(),
      ...metrics
    };

    this.metrics.push(fullMetrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average metrics
   */
  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        renderTime: 0,
        updateTime: 0,
        memoryUsage: 0,
        operationCount: 0,
        fps: 0,
        timestamp: Date.now()
      };
    }

    const sum = this.metrics.reduce((acc, metric) => ({
      renderTime: acc.renderTime + metric.renderTime,
      updateTime: acc.updateTime + metric.updateTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      operationCount: acc.operationCount + metric.operationCount,
      fps: acc.fps + metric.fps,
      timestamp: acc.timestamp + metric.timestamp
    }));

    const count = this.metrics.length;
    return {
      renderTime: sum.renderTime / count,
      updateTime: sum.updateTime / count,
      memoryUsage: sum.memoryUsage / count,
      operationCount: sum.operationCount / count,
      fps: sum.fps / count,
      timestamp: sum.timestamp / count
    };
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    let lastTime = performance.now();
    
    const updateFPS = () => {
      const currentTime = performance.now();
      this.frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        this.lastFrameTime = this.frameCount;
        this.frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    requestAnimationFrame(updateFPS);
  }

  /**
   * Get current FPS
   */
  private getCurrentFPS(): number {
    return this.lastFrameTime;
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Destroy monitor
   */
  destroy(): void {
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
      this.fpsInterval = null;
    }
    this.clearMetrics();
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function
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
 * Request idle callback polyfill
 */
export function requestIdleCallback(
  callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void,
  options: { timeout?: number } = {}
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Polyfill
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      didTimeout: false
    });
  }, 1);
}

/**
 * Cancel idle callback polyfill
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Virtual scrolling utility
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop = 0;
  private renderCallback: (startIndex: number, endIndex: number) => void;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    renderCallback: (startIndex: number, endIndex: number) => void
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderCallback = renderCallback;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer
    this.totalCount = 0;

    this.setupScrollListener();
  }

  /**
   * Set total item count
   */
  setTotalCount(count: number): void {
    this.totalCount = count;
    this.updateVirtualHeight();
    this.updateVisibleItems();
  }

  /**
   * Update visible items
   */
  private updateVisibleItems(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.totalCount);
    
    this.renderCallback(startIndex, endIndex);
  }

  /**
   * Update virtual height
   */
  private updateVirtualHeight(): void {
    const totalHeight = this.totalCount * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;
  }

  /**
   * Setup scroll listener
   */
  private setupScrollListener(): void {
    const throttledUpdate = throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.updateVisibleItems();
    }, 16); // ~60fps

    this.container.addEventListener('scroll', throttledUpdate);
  }

  /**
   * Scroll to item
   */
  scrollToItem(index: number): void {
    const scrollTop = index * this.itemHeight;
    this.container.scrollTop = scrollTop;
  }

  /**
   * Destroy virtual scroller
   */
  destroy(): void {
    // Remove event listeners if needed
  }
}

/**
 * Lazy loading utility
 */
export class LazyLoader {
  private observer: IntersectionObserver;
  private loadCallback: (element: Element) => void;

  constructor(loadCallback: (element: Element) => void, options: IntersectionObserverInit = {}) {
    this.loadCallback = loadCallback;
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadCallback(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px',
      ...options
    });
  }

  /**
   * Observe element for lazy loading
   */
  observe(element: Element): void {
    this.observer.observe(element);
  }

  /**
   * Unobserve element
   */
  unobserve(element: Element): void {
    this.observer.unobserve(element);
  }

  /**
   * Destroy lazy loader
   */
  destroy(): void {
    this.observer.disconnect();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();
