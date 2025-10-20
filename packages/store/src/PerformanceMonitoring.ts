/**
 * Performance Monitoring and Analysis System
 * 提供高级性能监控、分析和优化建议
 */

import { EventEmitter } from './utils/event-emitter'

// ============= Performance Metrics Types =============
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceReport {
  startTime: number;
  endTime: number;
  duration: number;
  metrics: PerformanceMetric[];
  suggestions: string[];
  warnings: string[];
}

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  customMetrics?: Record<string, number>;
}

// ============= Performance Monitor =============
export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private timers: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private memorySnapshots: MemorySnapshot[] = [];
  private isRecording = false;
  private recordingStartTime = 0;
  private maxMetricsPerKey = 1000;
  private slowThreshold = 16; // 16ms for 60fps

  constructor(private options: {
    autoStart?: boolean;
    slowThreshold?: number;
    maxMetricsPerKey?: number;
    memoryInterval?: number;
  } = {}) {
    super();
    this.slowThreshold = options.slowThreshold ?? this.slowThreshold;
    this.maxMetricsPerKey = options.maxMetricsPerKey ?? this.maxMetricsPerKey;

    if (options.autoStart) {
      this.startRecording();
    }

    if (options.memoryInterval) {
      this.startMemoryMonitoring(options.memoryInterval);
    }
  }

  // 开始记录
  startRecording(): void {
    this.isRecording = true;
    this.recordingStartTime = performance.now();
    this.emit('recording:start');
  }

  // 停止记录
  stopRecording(): PerformanceReport {
    this.isRecording = false;
    const endTime = performance.now();
    const report = this.generateReport(this.recordingStartTime, endTime);
    this.emit('recording:stop', report);
    return report;
  }

  // 开始计时
  startTimer(name: string): void {
    if (!this.isRecording) return;
    this.timers.set(name, performance.now());
  }

  // 结束计时
  endTimer(name: string, tags?: Record<string, string>): number {
    if (!this.isRecording) return 0;

    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name: `timer.${name}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags
    });

    // 检测慢操作
    if (duration > this.slowThreshold) {
      this.emit('slow:operation', { name, duration, tags });
    }

    return duration;
  }

  // 记录计数器
  increment(name: string, value = 1): void {
    if (!this.isRecording) return;

    const current = this.counters.get(name) || 0;
    const newValue = current + value;
    this.counters.set(name, newValue);

    this.recordMetric({
      name: `counter.${name}`,
      value: newValue,
      unit: 'count',
      timestamp: Date.now()
    });
  }

  // 记录度量
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isRecording) return;

    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);

    // 限制存储的指标数量
    if (metrics.length > this.maxMetricsPerKey) {
      metrics.shift();
    }

    this.metrics.set(metric.name, metrics);
    this.emit('metric:recorded', metric);
  }

  // 记录内存快照
  takeMemorySnapshot(): MemorySnapshot {
    // Web环境中使用performance.memory API（如果可用）
    const memUsage = (performance as any).memory
      ? {
          heapUsed: (performance as any).memory.usedJSHeapSize || 0,
          heapTotal: (performance as any).memory.totalJSHeapSize || 0,
          external: 0,
          arrayBuffers: 0
        }
      : {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          arrayBuffers: 0
        };

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    };

    this.memorySnapshots.push(snapshot);

    // 限制快照数量
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots.shift();
    }

    return snapshot;
  }

  // 开始内存监控
  private memoryMonitorTimer?: NodeJS.Timeout;
  startMemoryMonitoring(interval = 1000): void {
    if (this.memoryMonitorTimer) return;

    this.memoryMonitorTimer = setInterval(() => {
      const snapshot = this.takeMemorySnapshot();
      this.emit('memory:snapshot', snapshot);

      // 检测内存泄漏
      if (this.memorySnapshots.length > 10) {
        const recentSnapshots = this.memorySnapshots.slice(-10);
        const avgGrowth = this.calculateMemoryGrowth(recentSnapshots);

        if (avgGrowth > 1024 * 1024) { // 1MB/s growth
          this.emit('memory:leak:suspected', {
            growth: avgGrowth,
            snapshots: recentSnapshots
          });
        }
      }
    }, interval);
  }

  // 停止内存监控
  stopMemoryMonitoring(): void {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer);
      this.memoryMonitorTimer = undefined;
    }
  }

  // 计算内存增长率
  private calculateMemoryGrowth(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 1000; // seconds
    const memDiff = last.heapUsed - first.heapUsed;

    return memDiff / timeDiff; // bytes per second
  }

  // 生成性能报告
  private generateReport(startTime: number, endTime: number): PerformanceReport {
    const duration = endTime - startTime;
    const allMetrics: PerformanceMetric[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // 收集所有指标
    this.metrics.forEach((metrics) => {
      allMetrics.push(...metrics);
    });

    // 分析并生成建议
    this.analyzeMetrics(allMetrics, suggestions, warnings);

    return {
      startTime,
      endTime,
      duration,
      metrics: allMetrics,
      suggestions,
      warnings
    };
  }

  // 分析指标并生成建议
  private analyzeMetrics(
    metrics: PerformanceMetric[],
    suggestions: string[],
    warnings: string[]
  ): void {
    // 分析计时器
    const timerMetrics = metrics.filter(m => m.name.startsWith('timer.'));
    const slowOperations = timerMetrics.filter(m => m.value > this.slowThreshold);

    if (slowOperations.length > 0) {
      warnings.push(`Found ${slowOperations.length} slow operations (>${this.slowThreshold}ms)`);
      slowOperations.forEach(op => {
        suggestions.push(`Optimize '${op.name.replace('timer.', '')}': ${op.value.toFixed(2)}ms`);
      });
    }

    // 分析计数器
    const counterMetrics = metrics.filter(m => m.name.startsWith('counter.'));
    counterMetrics.forEach(counter => {
      if (counter.value > 1000) {
        suggestions.push(`High count for '${counter.name.replace('counter.', '')}': ${counter.value}`);
      }
    });

    // 分析内存
    if (this.memorySnapshots.length > 0) {
      const avgMemory = this.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.memorySnapshots.length;
      if (avgMemory > 100 * 1024 * 1024) { // 100MB
        warnings.push(`High memory usage: ${(avgMemory / 1024 / 1024).toFixed(2)}MB average`);
      }
    }
  }

  // 清理数据
  clear(): void {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
    this.memorySnapshots = [];
  }

  // 获取当前指标
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }

    const allMetrics: PerformanceMetric[] = [];
    this.metrics.forEach(metrics => allMetrics.push(...metrics));
    return allMetrics;
  }

  // 获取统计信息
  getMetricStats(metricName: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return null;

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count,
      min: values[0],
      max: values[count - 1],
      avg: sum / count,
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99)
    };
  }

  // 计算百分位数
  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  // 销毁监控器
  destroy(): void {
    this.stopMemoryMonitoring();
    this.clear();
    this.removeAllListeners();
  }
}

// ============= 性能追踪装饰器 =============
export function measurePerformance(monitor: PerformanceMonitor) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timerName = `${target.constructor.name}.${propertyKey}`;
      monitor.startTimer(timerName);

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        monitor.endTimer(timerName);
      }
    };

    return descriptor;
  };
}

// ============= 自动性能分析器 =============
export class AutoPerformanceAnalyzer {
  private monitor: PerformanceMonitor;
  private analysisInterval?: NodeJS.Timeout;
  private thresholds = {
    slowOperation: 50, // ms
    highMemory: 200 * 1024 * 1024, // 200MB
    memoryGrowth: 10 * 1024 * 1024, // 10MB/min
  };

  constructor(private options: {
    analysisInterval?: number;
    autoFix?: boolean;
    thresholds?: Partial<typeof AutoPerformanceAnalyzer.prototype.thresholds>;
  } = {}) {
    this.monitor = new PerformanceMonitor({
      autoStart: true,
      memoryInterval: 5000
    });

    if (options.thresholds) {
      Object.assign(this.thresholds, options.thresholds);
    }

    this.setupListeners();

    if (options.analysisInterval) {
      this.startAutoAnalysis(options.analysisInterval);
    }
  }

  private setupListeners(): void {
    // 监听慢操作
    this.monitor.on('slow:operation', ({ name, duration }: { name: string; duration: number }) => {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);

      if (this.options.autoFix) {
        this.suggestOptimization(name, duration);
      }
    });

    // 监听内存泄漏
    this.monitor.on('memory:leak:suspected', ({ growth }: { growth: number }) => {
      const growthMB = (growth / 1024 / 1024).toFixed(2);
      console.error(`🚨 Memory leak suspected: ${growthMB}MB/s growth rate`);

      if (this.options.autoFix) {
        this.attemptMemoryCleanup();
      }
    });
  }

  // 启动自动分析
  private startAutoAnalysis(interval: number): void {
    this.analysisInterval = setInterval(() => {
      this.analyze();
    }, interval);
  }

  // 执行分析
  analyze(): void {
    const report = this.monitor.stopRecording();

    // 输出分析结果
    console.log(`📊 Performance Analysis Report`);
    console.log(`Duration: ${report.duration.toFixed(2)}ms`);
    console.log(`Total Metrics: ${report.metrics.length}`);

    if (report.warnings.length > 0) {
      console.warn('⚠️ Warnings:');
      report.warnings.forEach(w => console.warn(`  - ${w}`));
    }

    if (report.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      report.suggestions.forEach(s => console.log(`  - ${s}`));
    }

    // 重新开始记录
    this.monitor.startRecording();
  }

  // 建议优化
  private suggestOptimization(operation: string, _duration: number): void {
    const suggestions = [
      'Consider using memoization for expensive computations',
      'Batch multiple operations together',
      'Use virtual scrolling for large lists',
      'Implement lazy loading for heavy components',
      'Consider using Web Workers for CPU-intensive tasks'
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    console.log(`💡 Suggestion for ${operation}: ${randomSuggestion}`);
  }

  // 尝试内存清理
  private attemptMemoryCleanup(): void {
    if ((globalThis as any).gc) {
      console.log('🧹 Attempting garbage collection...');
      (globalThis as any).gc();
    } else {
      console.warn('⚠️ Manual garbage collection not available. Run Node with --expose-gc flag.');
    }
  }

  // 获取性能监控器
  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }

  // 销毁分析器
  destroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    this.monitor.destroy();
  }
}

// ============= 导出便捷函数 =============
let defaultMonitor: PerformanceMonitor | null = null;

export function getDefaultMonitor(): PerformanceMonitor {
  if (!defaultMonitor) {
    defaultMonitor = new PerformanceMonitor({ autoStart: true });
  }
  return defaultMonitor;
}

export function startTimer(name: string): void {
  getDefaultMonitor().startTimer(name);
}

export function endTimer(name: string, tags?: Record<string, string>): number {
  return getDefaultMonitor().endTimer(name, tags);
}

export function recordMetric(metric: PerformanceMetric): void {
  getDefaultMonitor().recordMetric(metric);
}

export function getPerformanceStats(metricName: string) {
  return getDefaultMonitor().getMetricStats(metricName);
}
