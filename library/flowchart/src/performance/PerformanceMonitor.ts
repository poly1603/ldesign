/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  renderTime: number;
  layoutTime: number;
  nodeCount: number;
  edgeCount: number;
  fps?: number;
  memoryUsage?: number;
}

/**
 * 性能监控器
 * 用于监控流程图的渲染性能
 */
export class PerformanceMonitor {
  private metrics: Map<string, number>;
  private enabled: boolean;

  constructor(enabled = false) {
    this.metrics = new Map();
    this.enabled = enabled;
  }

  /**
   * 启用性能监控
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用性能监控
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * 开始计时
   */
  public startMeasure(name: string): void {
    if (!this.enabled) {
      return;
    }
    this.metrics.set(`${name}_start`, performance.now());
  }

  /**
   * 结束计时
   */
  public endMeasure(name: string): number {
    if (!this.enabled) {
      return 0;
    }

    const startTime = this.metrics.get(`${name}_start`);
    if (startTime === undefined) {
      console.warn(`No start time found for measure: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.metrics.delete(`${name}_start`);

    return duration;
  }

  /**
   * 获取指标
   */
  public getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * 获取所有指标
   */
  public getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      if (!key.endsWith('_start')) {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * 清除所有指标
   */
  public clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * 获取内存使用情况（如果浏览器支持）
   */
  public getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return null;
  }

  /**
   * 记录性能标记
   */
  public mark(name: string): void {
    if (!this.enabled) {
      return;
    }
    performance.mark(name);
  }

  /**
   * 测量两个标记之间的时间
   */
  public measure(name: string, startMark: string, endMark: string): number {
    if (!this.enabled) {
      return 0;
    }

    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures.length > 0) {
        return measures[measures.length - 1].duration;
      }
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }

    return 0;
  }

  /**
   * 生成性能报告
   */
  public generateReport(): PerformanceMetrics {
    const renderTime = this.getMetric('render') || 0;
    const layoutTime = this.getMetric('layout') || 0;
    const nodeCount = this.getMetric('nodeCount') || 0;
    const edgeCount = this.getMetric('edgeCount') || 0;
    const memoryUsage = this.getMemoryUsage() || undefined;

    return {
      renderTime,
      layoutTime,
      nodeCount,
      edgeCount,
      memoryUsage
    };
  }

  /**
   * 打印性能报告
   */
  public logReport(): void {
    if (!this.enabled) {
      console.warn('Performance monitoring is disabled');
      return;
    }

    const report = this.generateReport();
    console.group('📊 Performance Report');
    console.table(report);
    console.groupEnd();
  }
}

