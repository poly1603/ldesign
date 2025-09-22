/**
 * 内存监控和泄漏检测工具
 * 用于监控播放器的内存使用情况，检测潜在的内存泄漏
 */

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  customMetrics?: Record<string, number>;
}

export interface MemoryLeak {
  type: 'growth' | 'threshold' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  snapshots: MemorySnapshot[];
  detectedAt: number;
}

export interface MemoryMonitorConfig {
  interval: number; // 监控间隔（毫秒）
  maxSnapshots: number; // 最大快照数量
  growthThreshold: number; // 内存增长阈值（字节）
  leakThreshold: number; // 泄漏检测阈值（字节）
  enabled: boolean;
}

export class MemoryMonitor {
  private config: MemoryMonitorConfig;
  private snapshots: MemorySnapshot[] = [];
  private intervalId: number | null = null;
  private leaks: MemoryLeak[] = [];
  private customMetrics: Map<string, () => number> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<MemoryMonitorConfig> = {}) {
    this.config = {
      interval: 5000, // 5秒
      maxSnapshots: 100,
      growthThreshold: 10 * 1024 * 1024, // 10MB
      leakThreshold: 50 * 1024 * 1024, // 50MB
      enabled: true,
      ...config
    };
  }

  /**
   * 开始监控
   */
  public start(): void {
    if (!this.config.enabled || this.intervalId !== null) {
      return;
    }

    // 立即拍摄一次快照
    this.takeSnapshot();

    // 设置定时器
    this.intervalId = window.setInterval(() => {
      this.takeSnapshot();
      this.detectLeaks();
    }, this.config.interval);

    this.emit('started');
  }

  /**
   * 停止监控
   */
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit('stopped');
  }

  /**
   * 拍摄内存快照
   */
  public takeSnapshot(): MemorySnapshot {
    const memory = this.getMemoryInfo();
    const customMetrics: Record<string, number> = {};

    // 收集自定义指标
    for (const [name, getter] of this.customMetrics) {
      try {
        customMetrics[name] = getter();
      } catch (error) {
        console.warn(`Failed to collect custom metric ${name}:`, error);
      }
    }

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      customMetrics
    };

    this.snapshots.push(snapshot);

    // 限制快照数量
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
    }

    this.emit('snapshot', snapshot);
    return snapshot;
  }

  /**
   * 检测内存泄漏
   */
  public detectLeaks(): MemoryLeak[] {
    if (this.snapshots.length < 3) {
      return [];
    }

    const newLeaks: MemoryLeak[] = [];

    // 检测持续增长
    const growthLeak = this.detectGrowthLeak();
    if (growthLeak) {
      newLeaks.push(growthLeak);
    }

    // 检测阈值超标
    const thresholdLeak = this.detectThresholdLeak();
    if (thresholdLeak) {
      newLeaks.push(thresholdLeak);
    }

    // 检测异常模式
    const patternLeak = this.detectPatternLeak();
    if (patternLeak) {
      newLeaks.push(patternLeak);
    }

    // 添加新发现的泄漏
    for (const leak of newLeaks) {
      this.leaks.push(leak);
      this.emit('leak-detected', leak);
    }

    return newLeaks;
  }

  /**
   * 添加自定义指标
   */
  public addCustomMetric(name: string, getter: () => number): void {
    this.customMetrics.set(name, getter);
  }

  /**
   * 移除自定义指标
   */
  public removeCustomMetric(name: string): void {
    this.customMetrics.delete(name);
  }

  /**
   * 获取当前内存使用情况
   */
  public getCurrentMemory(): MemorySnapshot {
    return this.takeSnapshot();
  }

  /**
   * 获取所有快照
   */
  public getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * 获取检测到的泄漏
   */
  public getLeaks(): MemoryLeak[] {
    return [...this.leaks];
  }

  /**
   * 清除历史数据
   */
  public clear(): void {
    this.snapshots = [];
    this.leaks = [];
    this.emit('cleared');
  }

  /**
   * 生成内存报告
   */
  public generateReport(): string {
    const latest = this.snapshots[this.snapshots.length - 1];
    const oldest = this.snapshots[0];

    let report = '# 内存监控报告\n\n';
    report += `生成时间: ${new Date().toLocaleString()}\n`;
    report += `监控时长: ${this.snapshots.length > 1 ? Math.round((latest.timestamp - oldest.timestamp) / 1000) : 0}秒\n`;
    report += `快照数量: ${this.snapshots.length}\n\n`;

    if (latest) {
      report += '## 当前内存状态\n';
      report += `- 已用堆内存: ${this.formatBytes(latest.usedJSHeapSize)}\n`;
      report += `- 总堆内存: ${this.formatBytes(latest.totalJSHeapSize)}\n`;
      report += `- 堆内存限制: ${this.formatBytes(latest.jsHeapSizeLimit)}\n`;
      report += `- 内存使用率: ${((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100).toFixed(2)}%\n\n`;
    }

    if (this.snapshots.length > 1) {
      const growth = latest.usedJSHeapSize - oldest.usedJSHeapSize;
      report += '## 内存变化\n';
      report += `- 总增长: ${this.formatBytes(growth)}\n`;
      report += `- 平均增长率: ${this.formatBytes(growth / this.snapshots.length)}/快照\n\n`;
    }

    if (this.leaks.length > 0) {
      report += '## 检测到的内存泄漏\n';
      for (const leak of this.leaks) {
        report += `- ${leak.type} (${leak.severity}): ${leak.description}\n`;
      }
      report += '\n';
    }

    return report;
  }

  /**
   * 添加事件监听器
   */
  public on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  public off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in memory monitor listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * 获取内存信息
   */
  private getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    
    // 降级方案
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }

  /**
   * 检测持续增长泄漏
   */
  private detectGrowthLeak(): MemoryLeak | null {
    if (this.snapshots.length < 5) return null;

    const recent = this.snapshots.slice(-5);
    const growth = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;

    if (growth > this.config.growthThreshold) {
      return {
        type: 'growth',
        severity: growth > this.config.growthThreshold * 2 ? 'high' : 'medium',
        description: `内存在最近5次快照中增长了 ${this.formatBytes(growth)}`,
        snapshots: recent,
        detectedAt: Date.now()
      };
    }

    return null;
  }

  /**
   * 检测阈值超标泄漏
   */
  private detectThresholdLeak(): MemoryLeak | null {
    const latest = this.snapshots[this.snapshots.length - 1];
    
    if (latest.usedJSHeapSize > this.config.leakThreshold) {
      return {
        type: 'threshold',
        severity: 'high',
        description: `内存使用量超过阈值 ${this.formatBytes(this.config.leakThreshold)}`,
        snapshots: [latest],
        detectedAt: Date.now()
      };
    }

    return null;
  }

  /**
   * 检测异常模式泄漏
   */
  private detectPatternLeak(): MemoryLeak | null {
    if (this.snapshots.length < 10) return null;

    const recent = this.snapshots.slice(-10);
    let increasingCount = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].usedJSHeapSize > recent[i - 1].usedJSHeapSize) {
        increasingCount++;
      }
    }

    // 如果90%的时间都在增长，可能存在泄漏
    if (increasingCount >= 8) {
      return {
        type: 'pattern',
        severity: 'medium',
        description: `内存在最近10次快照中持续增长 ${increasingCount}/9 次`,
        snapshots: recent,
        detectedAt: Date.now()
      };
    }

    return null;
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 全局内存监控实例
export const globalMemoryMonitor = new MemoryMonitor();
