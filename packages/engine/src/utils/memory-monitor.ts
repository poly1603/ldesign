/**
 * 内存监控器
 * 实时追踪和报告内存使用情况，帮助及早发现内存泄漏
 * 
 * @example
 * ```typescript
 * const monitor = new MemoryMonitor({
 *   onWarning: (info) => console.warn('Memory warning:', info),
 *   onError: (info) => console.error('Memory error:', info)
 * });
 * 
 * monitor.start();
 * 
 * // 稍后...
 * monitor.stop();
 * monitor.destroy();
 * ```
 */

export interface MemoryWarning {
  type: 'threshold' | 'growth' | 'leak';
  current: number;
  threshold?: number;
  growthRate?: number;
  message: string;
  timestamp: number;
}

export interface MemoryError {
  type: 'threshold' | 'critical';
  current: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export interface MemoryStats {
  current: number | null;
  history: number[];
  average: number;
  peak: number;
  minimum: number;
  growthRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface MemoryMonitorConfig {
  /** 检查间隔（毫秒），默认 30000 (30秒) */
  checkInterval?: number;
  
  /** 阈值配置 */
  thresholds?: {
    /** 警告阈值（字节），默认 50MB */
    warning?: number;
    /** 错误阈值（字节），默认 100MB */
    error?: number;
    /** 增长率阈值（百分比），默认 0.5 (50%) */
    growth?: number;
  };
  
  /** 警告回调 */
  onWarning?: (info: MemoryWarning) => void;
  
  /** 错误回调 */
  onError?: (info: MemoryError) => void;
  
  /** 是否自动启动，默认 false */
  autoStart?: boolean;
  
  /** 历史记录最大数量，默认 20 */
  maxHistorySize?: number;
}

export class MemoryMonitor {
  private checkInterval: number;
  private intervalId: number | null = null;
  private memoryHistory: number[] = [];
  private maxHistorySize: number;
  
  private onWarning?: (info: MemoryWarning) => void;
  private onError?: (info: MemoryError) => void;
  
  // 阈值配置
  private thresholds = {
    warning: 50 * 1024 * 1024,  // 50MB
    error: 100 * 1024 * 1024,   // 100MB
    growth: 0.5                  // 50% 增长率
  };
  
  private isRunning = false;
  private destroyed = false;

  constructor(config: MemoryMonitorConfig = {}) {
    this.checkInterval = config.checkInterval ?? 30000;
    this.maxHistorySize = config.maxHistorySize ?? 20;
    this.onWarning = config.onWarning;
    this.onError = config.onError;
    
    if (config.thresholds) {
      this.thresholds = { ...this.thresholds, ...config.thresholds };
    }
    
    if (config.autoStart) {
      this.start();
    }
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.destroyed) {
      throw new Error('MemoryMonitor has been destroyed');
    }
    
    if (this.isRunning) {
      return; // 已经在运行
    }

    // 立即检查一次
    this.check();

    // 开始定时检查
    this.intervalId = window.setInterval(() => {
      this.check();
    }, this.checkInterval);
    
    this.isRunning = true;
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * 立即执行一次检查
   */
  check(): void {
    const memory = this.getMemoryUsage();

    if (memory === null) {
      // 不支持内存 API，静默返回
      return;
    }

    // 记录到历史
    this.memoryHistory.push(memory);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // 检查阈值
    this.checkThresholds(memory);

    // 检查增长率
    if (this.memoryHistory.length >= 3) {
      this.checkGrowthRate(memory);
    }
    
    // 检查潜在泄漏
    if (this.memoryHistory.length >= 10) {
      this.checkPotentialLeak();
    }
  }

  /**
   * 检查阈值
   */
  private checkThresholds(memory: number): void {
    const now = Date.now();
    
    if (memory > this.thresholds.error) {
      this.onError?.({
        type: 'threshold',
        current: memory,
        threshold: this.thresholds.error,
        message: `Memory usage (${this.formatBytes(memory)}) exceeds error threshold (${this.formatBytes(this.thresholds.error)})`,
        timestamp: now
      });
    } else if (memory > this.thresholds.warning) {
      this.onWarning?.({
        type: 'threshold',
        current: memory,
        threshold: this.thresholds.warning,
        message: `Memory usage (${this.formatBytes(memory)}) exceeds warning threshold (${this.formatBytes(this.thresholds.warning)})`,
        timestamp: now
      });
    }
  }

  /**
   * 检查增长率
   */
  private checkGrowthRate(memory: number): void {
    const growthRate = this.calculateGrowthRate();
    
    if (growthRate > this.thresholds.growth) {
      this.onWarning?.({
        type: 'growth',
        current: memory,
        growthRate,
        message: `Memory growth rate (${(growthRate * 100).toFixed(1)}%) exceeds threshold (${(this.thresholds.growth * 100).toFixed(1)}%)`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 检查潜在内存泄漏
   * 如果内存持续增长且没有下降，可能存在泄漏
   */
  private checkPotentialLeak(): void {
    if (this.memoryHistory.length < 10) {
      return;
    }
    
    // 检查最近10次记录是否持续增长
    const recent = this.memoryHistory.slice(-10);
    let increasingCount = 0;
    
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i - 1]) {
        increasingCount++;
      }
    }
    
    // 如果80%以上的检查点都在增长，可能存在泄漏
    if (increasingCount >= 8) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const increase = last - first;
      const rate = increase / first;
      
      this.onWarning?.({
        type: 'leak',
        current: last,
        growthRate: rate,
        message: `Potential memory leak detected: consistent growth over 10 checks (${this.formatBytes(increase)} increase, ${(rate * 100).toFixed(1)}% growth)`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 获取当前内存使用（字节）
   */
  private getMemoryUsage(): number | null {
    if (typeof performance === 'undefined') {
      return null;
    }
    
    const memory = (performance as any).memory;
    if (!memory || typeof memory.usedJSHeapSize !== 'number') {
      return null;
    }
    
    return memory.usedJSHeapSize;
  }

  /**
   * 计算内存增长率
   * 返回从第一个记录到最后一个记录的增长率
   */
  private calculateGrowthRate(): number {
    if (this.memoryHistory.length < 2) {
      return 0;
    }

    const first = this.memoryHistory[0];
    const last = this.memoryHistory[this.memoryHistory.length - 1];

    if (first === 0) {
      return 0;
    }

    return (last - first) / first;
  }

  /**
   * 格式化字节数为可读字符串
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes.toFixed(0)  } B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)  } KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)  } MB`;
  }

  /**
   * 获取内存统计信息
   */
  getStats(): MemoryStats {
    const current = this.getMemoryUsage();
    const history = [...this.memoryHistory];
    
    if (history.length === 0) {
      return {
        current,
        history: [],
        average: 0,
        peak: 0,
        minimum: 0,
        growthRate: 0,
        trend: 'stable'
      };
    }
    
    const sum = history.reduce((a, b) => a + b, 0);
    const average = sum / history.length;
    const peak = Math.max(...history);
    const minimum = Math.min(...history);
    const growthRate = this.calculateGrowthRate();
    
    // 计算趋势
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (history.length >= 3) {
      const recent = history.slice(-3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const overall = history.slice(0, -3);
      const overallAvg = overall.reduce((a, b) => a + b, 0) / overall.length;
      
      if (recentAvg > overallAvg * 1.1) {
        trend = 'increasing';
      } else if (recentAvg < overallAvg * 0.9) {
        trend = 'decreasing';
      }
    }
    
    return {
      current,
      history,
      average,
      peak,
      minimum,
      growthRate,
      trend
    };
  }

  /**
   * 重置历史记录
   */
  resetHistory(): void {
    this.memoryHistory = [];
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MemoryMonitorConfig>): void {
    if (config.checkInterval !== undefined) {
      this.checkInterval = config.checkInterval;
      // 如果正在运行，重启以应用新间隔
      if (this.isRunning) {
        this.stop();
        this.start();
      }
    }
    
    if (config.thresholds) {
      this.thresholds = { ...this.thresholds, ...config.thresholds };
    }
    
    if (config.onWarning !== undefined) {
      this.onWarning = config.onWarning;
    }
    
    if (config.onError !== undefined) {
      this.onError = config.onError;
    }
    
    if (config.maxHistorySize !== undefined) {
      this.maxHistorySize = config.maxHistorySize;
      // 裁剪历史记录
      if (this.memoryHistory.length > this.maxHistorySize) {
        this.memoryHistory = this.memoryHistory.slice(-this.maxHistorySize);
      }
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    
    this.stop();
    this.memoryHistory = [];
    this.onWarning = undefined;
    this.onError = undefined;
    this.destroyed = true;
  }

  /**
   * 检查是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 检查是否正在运行
   */
  isMonitoring(): boolean {
    return this.isRunning;
  }
}

/**
 * 创建内存监控器实例
 */
export function createMemoryMonitor(config?: MemoryMonitorConfig): MemoryMonitor {
  return new MemoryMonitor(config);
}


