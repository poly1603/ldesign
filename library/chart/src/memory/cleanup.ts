/**
 * 自动清理机制 - 空闲时段清理、分级清理策略、内存压力检测
 */

/**
 * 清理级别
 */
export enum CleanupLevel {
  LIGHT = 'light',     // 轻度清理：清除过期缓存
  MEDIUM = 'medium',   // 中度清理：清除低优先级实例
  DEEP = 'deep',       // 深度清理：全面清理+GC
}

/**
 * 内存压力级别
 */
export enum MemoryPressure {
  LOW = 'low',         // 低压力
  MEDIUM = 'medium',   // 中等压力
  HIGH = 'high',       // 高压力
  CRITICAL = 'critical', // 临界压力
}

/**
 * 清理管理器（增强版）
 */
export class CleanupManager {
  private timers = new Set<ReturnType<typeof setInterval>>();
  private cleanupFunctions = new Map<string, () => void>();
  private instances = new WeakSet<any>();
  private idleCallbackId?: number;

  // 内存阈值（MB）
  private memoryThreshold = {
    low: 50,
    medium: 80,
    high: 100,
    critical: 120,
  };

  // 统计信息
  private cleanupCount = 0;
  private lastCleanupTime = 0;

  /**
   * 注册需要清理的实例
   */
  register(instance: any, cleanup: () => void, id?: string): () => void {
    this.instances.add(instance);

    const cleanupId = id || this.generateId();
    this.cleanupFunctions.set(cleanupId, cleanup);

    // 监听页面卸载
    const unloadHandler = () => {
      cleanup();
      this.cleanupFunctions.delete(cleanupId);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', unloadHandler);
    }

    // 返回取消注册函数
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', unloadHandler);
      }
      this.cleanupFunctions.delete(cleanupId);
    };
  }

  /**
   * 启动自动清理（增强版）
   */
  startAutoCleanup(interval = 60000): () => void {
    const timer = setInterval(() => {
      // 根据内存压力决定清理级别
      this.cleanupByPressure();
    }, interval);

    this.timers.add(timer);

    // 启用空闲时段清理
    this.scheduleIdleCleanup();

    return () => {
      clearInterval(timer);
      this.timers.delete(timer);
      this.stopIdleCleanup();
    };
  }

  /**
   * 调度空闲时段清理
   */
  private scheduleIdleCleanup(): void {
    if (typeof requestIdleCallback === 'undefined') return;

    const callback = (deadline: IdleDeadline) => {
      // 在空闲时段执行轻度清理
      if (deadline.timeRemaining() > 10) {
        this.runCleanup(CleanupLevel.LIGHT);
      }

      // 继续调度下一次
      this.scheduleIdleCleanup();
    };

    this.idleCallbackId = requestIdleCallback(callback, { timeout: 5000 });
  }

  /**
   * 停止空闲时段清理
   */
  private stopIdleCleanup(): void {
    if (this.idleCallbackId && typeof cancelIdleCallback !== 'undefined') {
      cancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = undefined;
    }
  }

  /**
   * 执行清理（分级策略）
   */
  private runCleanup(level: CleanupLevel): void {
    const startTime = performance.now();

    switch (level) {
      case CleanupLevel.LIGHT:
        this.cleanupInactive();
        break;
      case CleanupLevel.MEDIUM:
        this.cleanupInactive();
        this.cleanupLowPriority();
        break;
      case CleanupLevel.DEEP:
        this.cleanupAll();
        this.triggerGC();
        break;
    }

    this.cleanupCount++;
    this.lastCleanupTime = Date.now();

    const duration = performance.now() - startTime;
    if (duration > 100) {
      console.warn(`Cleanup (${level}) took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * 检测内存压力
   */
  private detectMemoryPressure(): MemoryPressure {
    // 尝试使用 Performance Memory API
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);

      if (usedMB > this.memoryThreshold.critical) {
        return MemoryPressure.CRITICAL;
      } else if (usedMB > this.memoryThreshold.high) {
        return MemoryPressure.HIGH;
      } else if (usedMB > this.memoryThreshold.medium) {
        return MemoryPressure.MEDIUM;
      }
    }

    return MemoryPressure.LOW;
  }

  /**
   * 根据内存压力执行清理
   */
  private cleanupByPressure(): void {
    const pressure = this.detectMemoryPressure();

    switch (pressure) {
      case MemoryPressure.CRITICAL:
        console.warn('Memory pressure critical, performing deep cleanup');
        this.runCleanup(CleanupLevel.DEEP);
        break;
      case MemoryPressure.HIGH:
        console.warn('Memory pressure high, performing medium cleanup');
        this.runCleanup(CleanupLevel.MEDIUM);
        break;
      case MemoryPressure.MEDIUM:
        this.runCleanup(CleanupLevel.LIGHT);
        break;
      case MemoryPressure.LOW:
        // 轻度清理
        this.runCleanup(CleanupLevel.LIGHT);
        break;
    }
  }

  /**
   * 清理低优先级实例
   */
  private cleanupLowPriority(): void {
    // 这里可以集成到实例管理器中
    // 由实例管理器负责清理低优先级实例
  }

  /**
   * 触发垃圾回收（如果可用）
   */
  private triggerGC(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      try {
        (global as any).gc();
      } catch (error) {
        // 忽略 GC 错误
      }
    }
  }

  /**
   * 清理不活跃的实例
   */
  private cleanupInactive(): void {
    const toDelete: string[] = [];

    for (const [id, cleanup] of this.cleanupFunctions.entries()) {
      try {
        // 尝试执行清理函数
        // 如果实例已经被回收，WeakSet 会自动处理
        cleanup();
      } catch (error) {
        console.warn(`清理实例 ${id} 时出错:`, error);
        toDelete.push(id);
      }
    }

    // 删除出错的清理函数
    for (const id of toDelete) {
      this.cleanupFunctions.delete(id);
    }
  }

  /**
   * 手动清理指定实例
   */
  cleanup(id: string): void {
    const cleanup = this.cleanupFunctions.get(id);
    if (cleanup) {
      cleanup();
      this.cleanupFunctions.delete(id);
    }
  }

  /**
   * 清理所有实例
   */
  cleanupAll(): void {
    for (const cleanup of this.cleanupFunctions.values()) {
      try {
        cleanup();
      } catch (error) {
        console.warn('清理实例时出错:', error);
      }
    }

    this.cleanupFunctions.clear();
  }

  /**
   * 停止所有定时器
   */
  stopAll(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  /**
   * 销毁管理器
   */
  dispose(): void {
    this.cleanupAll();
    this.stopAll();
  }

  /**
   * 获取统计信息
   */
  stats(): {
    registeredCount: number;
    timersCount: number;
    cleanupCount: number;
    lastCleanup: number;
    memoryPressure: MemoryPressure;
  } {
    return {
      registeredCount: this.cleanupFunctions.size,
      timersCount: this.timers.size,
      cleanupCount: this.cleanupCount,
      lastCleanup: this.lastCleanupTime,
      memoryPressure: this.detectMemoryPressure(),
    };
  }

  /**
   * 设置内存阈值
   */
  setMemoryThreshold(thresholds: Partial<typeof this.memoryThreshold>): void {
    Object.assign(this.memoryThreshold, thresholds);
  }

  /**
   * 手动触发指定级别的清理
   */
  manualCleanup(level: CleanupLevel = CleanupLevel.LIGHT): void {
    this.runCleanup(level);
  }

  /**
   * 生成清理 ID
   */
  private generateId(): string {
    return `cleanup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 全局清理管理器
export const cleanupManager = new CleanupManager();

// 页面卸载时清理所有实例
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupManager.cleanupAll();
  });
}

