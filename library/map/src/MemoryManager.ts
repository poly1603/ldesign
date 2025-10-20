/**
 * MemoryManager - 内存管理器
 * 自动监控和优化内存使用，防止内存泄漏
 */

import { Logger } from './Logger';

export interface MemoryManagerOptions {
  maxMemoryMB?: number;
  checkInterval?: number;
  autoCleanup?: boolean;
  gcThreshold?: number; // 垃圾回收阈值（百分比）
  onMemoryWarning?: (usage: number) => void;
  onMemoryError?: (usage: number) => void;
}

export class MemoryManager {
  private options: MemoryManagerOptions;
  private logger = Logger.getInstance();
  private checkTimer: number | null = null;
  private cleanupCallbacks: Set<() => void> = new Set();
  private memoryHistory: number[] = [];
  private isMonitoring = false;

  constructor(options: MemoryManagerOptions = {}) {
    this.options = {
      maxMemoryMB: 500,
      checkInterval: 5000, // 每5秒检查一次
      autoCleanup: true,
      gcThreshold: 75, // 75%时触发清理
      ...options
    };
  }

  /**
   * 开始监控内存
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.logger.info('Memory monitoring started');

    const check = () => {
      this.checkMemory();
      this.checkTimer = window.setTimeout(check, this.options.checkInterval);
    };

    this.checkTimer = window.setTimeout(check, this.options.checkInterval);
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      this.checkTimer = null;
    }
    this.isMonitoring = false;
    this.logger.info('Memory monitoring stopped');
  }

  /**
   * 检查内存使用
   */
  private checkMemory(): void {
    const memory = this.getMemoryUsage();
    
    if (!memory) {
      return;
    }

    const usagePercent = (memory.used / this.options.maxMemoryMB!) * 100;

    // 记录历史
    this.memoryHistory.push(memory.used);
    if (this.memoryHistory.length > 60) {
      this.memoryHistory.shift();
    }

    // 检查阈值
    if (usagePercent >= 90) {
      this.logger.error('Memory critical', { usage: usagePercent, memory });
      this.options.onMemoryError?.(usagePercent);
      
      if (this.options.autoCleanup) {
        this.performEmergencyCleanup();
      }
    } else if (usagePercent >= this.options.gcThreshold!) {
      this.logger.warn('Memory warning', { usage: usagePercent, memory });
      this.options.onMemoryWarning?.(usagePercent);
      
      if (this.options.autoCleanup) {
        this.performCleanup();
      }
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if ((performance as any).memory) {
      const mem = (performance as any).memory;
      return {
        used: Math.round(mem.usedJSHeapSize / 1048576),
        total: Math.round(mem.totalJSHeapSize / 1048576),
        limit: Math.round(mem.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }

  /**
   * 注册清理回调
   */
  registerCleanupCallback(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);
    return () => {
      this.cleanupCallbacks.delete(callback);
    };
  }

  /**
   * 执行清理
   */
  performCleanup(): void {
    this.logger.info('Performing memory cleanup');

    // 执行所有清理回调
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        this.logger.error('Cleanup callback failed', error);
      }
    });

    // 建议垃圾回收（仅在支持的环境）
    if (global.gc) {
      global.gc();
      this.logger.info('Manual GC triggered');
    }
  }

  /**
   * 紧急清理
   */
  private performEmergencyCleanup(): void {
    this.logger.warn('Performing emergency cleanup');
    this.performCleanup();

    // 清理历史记录
    this.memoryHistory = this.memoryHistory.slice(-10);
  }

  /**
   * 获取内存趋势
   */
  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 5) {
      return 'stable';
    }

    const recent = this.memoryHistory.slice(-5);
    const older = this.memoryHistory.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 10) return 'increasing';
    if (diff < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * 获取内存统计
   */
  getStats(): {
    current: number;
    average: number;
    min: number;
    max: number;
    trend: string;
  } {
    if (this.memoryHistory.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        trend: 'stable'
      };
    }

    const current = this.memoryHistory[this.memoryHistory.length - 1];
    const average = this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;
    const min = Math.min(...this.memoryHistory);
    const max = Math.max(...this.memoryHistory);

    return {
      current: Math.round(current),
      average: Math.round(average),
      min: Math.round(min),
      max: Math.round(max),
      trend: this.getMemoryTrend()
    };
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.memoryHistory = [];
  }

  /**
   * 检查是否有内存泄漏
   */
  detectMemoryLeak(): boolean {
    if (this.memoryHistory.length < 20) {
      return false;
    }

    // 检查最近20个记录是否持续增长
    const recent = this.memoryHistory.slice(-20);
    let increasingCount = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i - 1]) {
        increasingCount++;
      }
    }

    // 如果80%以上都在增长，可能有内存泄漏
    return increasingCount / recent.length > 0.8;
  }

  /**
   * 获取内存报告
   */
  getReport(): string {
    const stats = this.getStats();
    const current = this.getMemoryUsage();
    const leak = this.detectMemoryLeak();

    return `
Memory Report:
- Current: ${stats.current}MB
- Average: ${stats.average}MB
- Min: ${stats.min}MB
- Max: ${stats.max}MB
- Trend: ${stats.trend}
- Leak detected: ${leak ? 'YES ⚠️' : 'NO ✓'}
${current ? `- Total Available: ${current.limit}MB` : ''}
    `.trim();
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopMonitoring();
    this.cleanupCallbacks.clear();
    this.memoryHistory = [];
  }
}

/**
 * 全局内存管理器实例
 */
export const globalMemoryManager = new MemoryManager({
  maxMemoryMB: 500,
  autoCleanup: true,
  gcThreshold: 75
});





