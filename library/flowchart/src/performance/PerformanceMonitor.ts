/**
 * 增强的性能指标接口
 */
export interface PerformanceMetrics {
  renderTime: number;
  layoutTime: number;
  nodeCount: number;
  edgeCount: number;
  fps?: number;
  memoryUsage?: number;
  averageRenderTime?: number;
  peakRenderTime?: number;
  frameDrops?: number;
  interactionLatency?: number;
  performanceScore?: number;
}

/**
 * 增强的性能监控器
 * 提供详细的性能监控、分析和优化建议
 */
export class PerformanceMonitor {
  private metrics: Map<string, number>;
  private enabled: boolean;
  private renderHistory: number[] = [];
  private frameTimestamps: number[] = [];
  private animationFrameId: number | null = null;
  private readonly maxHistorySize = 100;
  private interactionStartTime = 0;

  constructor(enabled = false) {
    this.metrics = new Map();
    this.enabled = enabled;
    if (enabled) {
      this.startFPSMonitoring();
    }
  }

  /**
   * 启用性能监控
   */
  public enable(): void {
    this.enabled = true;
    this.startFPSMonitoring();
  }

  /**
   * 禁用性能监控
   */
  public disable(): void {
    this.enabled = false;
    this.stopFPSMonitoring();
  }

  /**
   * FPS监控
   */
  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      this.frameTimestamps.push(timestamp);
      
      // 保持最近1秒的时间戳
      const oneSecondAgo = timestamp - 1000;
      this.frameTimestamps = this.frameTimestamps.filter(t => t > oneSecondAgo);
      
      // 计算FPS
      const fps = this.frameTimestamps.length;
      this.metrics.set('fps', fps);
      
      // 检测掉帧
      if (this.frameTimestamps.length > 1) {
        const lastInterval = timestamp - this.frameTimestamps[this.frameTimestamps.length - 2];
        if (lastInterval > 33) { // 超过33ms即认为掉帧
          const drops = this.metrics.get('frameDrops') || 0;
          this.metrics.set('frameDrops', drops + 1);
        }
      }
      
      if (this.enabled) {
        this.animationFrameId = requestAnimationFrame(measureFPS);
      }
    };
    
    this.animationFrameId = requestAnimationFrame(measureFPS);
  }

  private stopFPSMonitoring(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 开始计时
   */
  public startMeasure(name: string): void {
    if (!this.enabled) return;
    this.metrics.set(`${name}_start`, performance.now());
  }

  /**
   * 结束计时
   */
  public endMeasure(name: string): number {
    if (!this.enabled) return 0;

    const startTime = this.metrics.get(`${name}_start`);
    if (startTime === undefined) {
      console.warn(`No start time found for measure: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.metrics.delete(`${name}_start`);

    // 特殊处理渲染时间
    if (name === 'render') {
      this.recordRenderTime(duration);
    }

    return duration;
  }

  /**
   * 记录渲染时间历史
   */
  private recordRenderTime(time: number): void {
    this.renderHistory.push(time);
    if (this.renderHistory.length > this.maxHistorySize) {
      this.renderHistory.shift();
    }
    
    // 计算统计信息
    const avg = this.renderHistory.reduce((a, b) => a + b, 0) / this.renderHistory.length;
    const peak = Math.max(...this.renderHistory);
    
    this.metrics.set('averageRenderTime', avg);
    this.metrics.set('peakRenderTime', peak);
  }

  /**
   * 开始交互测量
   */
  public startInteraction(): void {
    if (this.enabled) {
      this.interactionStartTime = performance.now();
    }
  }

  /**
   * 结束交互测量
   */
  public endInteraction(): void {
    if (this.enabled && this.interactionStartTime > 0) {
      const latency = performance.now() - this.interactionStartTime;
      this.metrics.set('interactionLatency', latency);
      this.interactionStartTime = 0;
    }
  }

  /**
   * 设置节点数量
   */
  public setNodeCount(count: number): void {
    if (this.enabled) {
      this.metrics.set('nodeCount', count);
    }
  }

  /**
   * 设置边数量
   */
  public setEdgeCount(count: number): void {
    if (this.enabled) {
      this.metrics.set('edgeCount', count);
    }
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
    this.renderHistory = [];
    this.frameTimestamps = [];
    this.metrics.set('frameDrops', 0);
  }

  /**
   * 获取内存使用情况
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
    if (!this.enabled) return;
    performance.mark(name);
  }

  /**
   * 测量两个标记之间的时间
   */
  public measure(name: string, startMark: string, endMark: string): number {
    if (!this.enabled) return 0;

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
   * 计算性能评分 (0-100)
   */
  private calculatePerformanceScore(): number {
    let score = 100;
    
    const fps = this.metrics.get('fps') || 60;
    const avgRender = this.metrics.get('averageRenderTime') || 0;
    const peakRender = this.metrics.get('peakRenderTime') || 0;
    const frameDrops = this.metrics.get('frameDrops') || 0;
    const latency = this.metrics.get('interactionLatency') || 0;
    
    // 基于各项指标扣分
    if (fps < 60) score -= Math.min(20, (60 - fps) * 0.5);
    if (avgRender > 16.67) score -= Math.min(15, (avgRender - 16.67) * 0.5);
    if (peakRender > 33.33) score -= Math.min(15, (peakRender - 33.33) * 0.3);
    if (frameDrops > 10) score -= Math.min(20, frameDrops * 0.5);
    if (latency > 100) score -= Math.min(10, (latency - 100) * 0.05);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 生成性能报告
   */
  public generateReport(): PerformanceMetrics {
    const renderTime = this.getMetric('render') || 0;
    const layoutTime = this.getMetric('layout') || 0;
    const nodeCount = this.getMetric('nodeCount') || 0;
    const edgeCount = this.getMetric('edgeCount') || 0;
    const fps = this.getMetric('fps');
    const memoryUsage = this.getMemoryUsage() || undefined;
    const averageRenderTime = this.getMetric('averageRenderTime');
    const peakRenderTime = this.getMetric('peakRenderTime');
    const frameDrops = this.getMetric('frameDrops');
    const interactionLatency = this.getMetric('interactionLatency');
    const performanceScore = this.calculatePerformanceScore();

    return {
      renderTime,
      layoutTime,
      nodeCount,
      edgeCount,
      fps,
      memoryUsage,
      averageRenderTime,
      peakRenderTime,
      frameDrops,
      interactionLatency,
      performanceScore
    };
  }

  /**
   * 获取性能优化建议
   */
  private getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const report = this.generateReport();
    
    if (report.fps && report.fps < 60) {
      suggestions.push(`⚠️ FPS较低(${report.fps})，建议减少视觉复杂度`);
    }
    
    if (report.averageRenderTime && report.averageRenderTime > 16.67) {
      suggestions.push(`⚠️ 平均渲染时间过长(${report.averageRenderTime.toFixed(2)}ms)，建议优化渲染逻辑`);
    }
    
    if (report.nodeCount > 100) {
      suggestions.push(`⚠️ 节点数量较多(${report.nodeCount})，建议使用虚拟化技术`);
    }
    
    if (report.frameDrops && report.frameDrops > 10) {
      suggestions.push(`⚠️ 检测到掉帧(${report.frameDrops}次)，建议优化动画性能`);
    }
    
    if (report.memoryUsage && report.memoryUsage > 100) {
      suggestions.push(`⚠️ 内存使用较高(${report.memoryUsage.toFixed(2)}MB)，建议优化内存管理`);
    }
    
    return suggestions;
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
    const score = report.performanceScore || 0;
    const scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    
    console.group(`%c${scoreEmoji} 性能报告 (评分: ${score}/100)`,
      'background: #333; color: #fff; padding: 4px 8px; border-radius: 4px;');
    
    // 基础信息
    console.group('📊 基础指标');
    console.table({
      '渲染时间': `${report.renderTime.toFixed(2)}ms`,
      '布局时间': `${report.layoutTime.toFixed(2)}ms`,
      '节点数量': report.nodeCount,
      '边数量': report.edgeCount
    });
    console.groupEnd();
    
    // 性能指标
    console.group('⚡ 性能指标');
    console.table({
      'FPS': report.fps || 'N/A',
      '平均渲染': `${report.averageRenderTime?.toFixed(2) || 'N/A'}ms`,
      '峰值渲染': `${report.peakRenderTime?.toFixed(2) || 'N/A'}ms`,
      '掉帧次数': report.frameDrops || 0,
      '交互延迟': `${report.interactionLatency?.toFixed(2) || 'N/A'}ms`,
      '内存使用': `${report.memoryUsage?.toFixed(2) || 'N/A'}MB`
    });
    console.groupEnd();
    
    // 优化建议
    const suggestions = this.getOptimizationSuggestions();
    if (suggestions.length > 0) {
      console.group('💡 优化建议');
      suggestions.forEach(s => console.log(s));
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.stopFPSMonitoring();
    this.clearMetrics();
  }
}

