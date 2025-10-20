/**
 * @ldesign/size - Performance Monitor
 * 
 * Tracks and reports performance metrics for optimization
 */

export interface PerformanceMetrics {
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  cacheStats: {
    sizePoolHitRate: number;
    cssCache: number;
    fluidSizeCache: number;
  };
  timing: {
    cssGeneration: number;
    sizeCalculation: number;
    viewportUpdate: number;
  };
  counts: {
    domNodes: number;
    cssRules: number;
    listeners: number;
    pooledObjects: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Start timing an operation
   */
  startTiming(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }
  
  /**
   * End timing and record the duration
   */
  endTiming(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (startTime === undefined) {
      console.warn(`[PerformanceMonitor] No start time for operation: ${operation}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.metrics.set(operation, duration);
    this.startTimes.delete(operation);
    
    return duration;
  }
  
  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }
  
  /**
   * Get memory usage information
   */
  private getMemoryUsage(): PerformanceMetrics['memoryUsage'] | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  /**
   * Count DOM nodes
   */
  private countDOMNodes(): number {
    if (typeof document === 'undefined') return 0;
    return document.querySelectorAll('*').length;
  }
  
  /**
   * Count CSS rules
   */
  private countCSSRules(): number {
    if (typeof document === 'undefined') return 0;
    
    let count = 0;
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        count += sheet.cssRules?.length || 0;
      } catch {
        // Cross-origin stylesheets
      }
    });
    
    return count;
  }
  
  /**
   * Get comprehensive performance report
   */
  getReport(): PerformanceMetrics {
    const memory = this.getMemoryUsage();
    
    // Import size pool stats
    const SizePool = (globalThis as any).__sizePool;
    const poolStats = SizePool?.getStats?.() || { hitRate: 0 };
    
    return {
      memoryUsage: memory || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      },
      cacheStats: {
        sizePoolHitRate: poolStats.hitRate,
        cssCache: this.metrics.get('cssCacheSize') || 0,
        fluidSizeCache: this.metrics.get('fluidCacheSize') || 0
      },
      timing: {
        cssGeneration: this.metrics.get('cssGeneration') || 0,
        sizeCalculation: this.metrics.get('sizeCalculation') || 0,
        viewportUpdate: this.metrics.get('viewportUpdate') || 0
      },
      counts: {
        domNodes: this.countDOMNodes(),
        cssRules: this.countCSSRules(),
        listeners: this.metrics.get('listenerCount') || 0,
        pooledObjects: poolStats.poolSize || 0
      }
    };
  }
  
  /**
   * Log performance report to console
   */
  logReport(): void {
    const report = this.getReport();
    
    console.group('🚀 Performance Report');
    
    if (report.memoryUsage) {
      console.group('Memory Usage');
      console.log(`Used Heap: ${(report.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Total Heap: ${(report.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Heap Limit: ${(report.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      console.groupEnd();
    }
    
    console.group('Cache Performance');
    console.log(`Size Pool Hit Rate: ${(report.cacheStats.sizePoolHitRate * 100).toFixed(1)}%`);
    console.log(`CSS Cache Entries: ${report.cacheStats.cssCache}`);
    console.log(`Fluid Size Cache: ${report.cacheStats.fluidSizeCache}`);
    console.groupEnd();
    
    console.group('Timing Metrics');
    console.log(`CSS Generation: ${report.timing.cssGeneration.toFixed(2)}ms`);
    console.log(`Size Calculation: ${report.timing.sizeCalculation.toFixed(2)}ms`);
    console.log(`Viewport Update: ${report.timing.viewportUpdate.toFixed(2)}ms`);
    console.groupEnd();
    
    console.group('Resource Counts');
    console.log(`DOM Nodes: ${report.counts.domNodes}`);
    console.log(`CSS Rules: ${report.counts.cssRules}`);
    console.log(`Active Listeners: ${report.counts.listeners}`);
    console.log(`Pooled Objects: ${report.counts.pooledObjects}`);
    console.groupEnd();
    
    console.groupEnd();
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
  
  /**
   * Compare two performance snapshots
   */
  static compareSnapshots(before: PerformanceMetrics, after: PerformanceMetrics): void {
    console.group('📊 Performance Comparison');
    
    if (before.memoryUsage && after.memoryUsage) {
      const memoryDiff = after.memoryUsage.usedJSHeapSize - before.memoryUsage.usedJSHeapSize;
      const sign = memoryDiff > 0 ? '+' : '';
      console.log(`Memory Change: ${sign}${(memoryDiff / 1024 / 1024).toFixed(2)} MB`);
    }
    
    const hitRateDiff = after.cacheStats.sizePoolHitRate - before.cacheStats.sizePoolHitRate;
    console.log(`Cache Hit Rate Change: ${hitRateDiff > 0 ? '+' : ''}${(hitRateDiff * 100).toFixed(1)}%`);
    
    const timingDiff = {
      css: after.timing.cssGeneration - before.timing.cssGeneration,
      size: after.timing.sizeCalculation - before.timing.sizeCalculation,
      viewport: after.timing.viewportUpdate - before.timing.viewportUpdate
    };
    
    console.log(`CSS Generation: ${timingDiff.css > 0 ? '+' : ''}${timingDiff.css.toFixed(2)}ms`);
    console.log(`Size Calculation: ${timingDiff.size > 0 ? '+' : ''}${timingDiff.size.toFixed(2)}ms`);
    console.log(`Viewport Update: ${timingDiff.viewport > 0 ? '+' : ''}${timingDiff.viewport.toFixed(2)}ms`);
    
    console.groupEnd();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Convenience functions
export const perf = {
  start: (operation: string) => performanceMonitor.startTiming(operation),
  end: (operation: string) => performanceMonitor.endTiming(operation),
  record: (name: string, value: number) => performanceMonitor.recordMetric(name, value),
  report: () => performanceMonitor.getReport(),
  log: () => performanceMonitor.logReport(),
  reset: () => performanceMonitor.reset()
};