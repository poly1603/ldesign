/**
 * 全局实例管理器 - LRU 策略，访问频率跟踪，优先级管理
 */

import type { ChartInstance } from '../types';

/**
 * 实例元数据
 */
interface InstanceMetadata {
  instance: ChartInstance;
  createdAt: number;
  lastAccess: number;
  accessCount: number;
  priority: number; // 0-10，数字越大优先级越高
  memoryUsage?: number;
}

/**
 * 实例统计信息
 */
interface InstanceStats {
  total: number;
  active: number;
  ids: string[];
  maxInstances: number;
  memoryUsage: number;
  avgAccessCount: number;
}

/**
 * 图表实例管理器 - LRU 策略
 */
export class ChartInstanceManager {
  private instances = new Map<string, InstanceMetadata>();
  private maxInstances: number;
  private memoryThreshold: number; // MB
  private memoryWarningCallback?: (usage: number) => void;

  constructor(maxInstances = 50, memoryThreshold = 100) {
    this.maxInstances = maxInstances;
    this.memoryThreshold = memoryThreshold;

    // 启动内存监控
    this.startMemoryMonitoring();
  }

  /**
   * 注册实例（带优先级）
   */
  register(id: string, instance: ChartInstance, priority = 5): void {
    // 超过最大数量，使用 LRU 策略清理
    if (this.instances.size >= this.maxInstances) {
      const lruId = this.getLRUInstance();
      if (lruId) {
        this.dispose(lruId);
      }
    }

    const now = Date.now();
    const metadata: InstanceMetadata = {
      instance,
      createdAt: now,
      lastAccess: now,
      accessCount: 0,
      priority,
      memoryUsage: 0,
    };

    this.instances.set(id, metadata);
  }

  /**
   * 获取实例（更新访问信息）
   */
  get(id: string): ChartInstance | undefined {
    const metadata = this.instances.get(id);
    if (!metadata) return undefined;

    // 更新访问信息
    metadata.lastAccess = Date.now();
    metadata.accessCount++;

    return metadata.instance;
  }

  /**
   * 销毁实例
   */
  dispose(id: string): void {
    const metadata = this.instances.get(id);
    if (metadata) {
      metadata.instance.dispose();
      this.instances.delete(id);
    }
  }

  /**
   * 销毁所有实例
   */
  disposeAll(): void {
    for (const metadata of this.instances.values()) {
      metadata.instance.dispose();
    }
    this.instances.clear();
  }

  /**
   * 获取 LRU 实例 ID（考虑优先级）
   */
  private getLRUInstance(): string | undefined {
    let lruId: string | undefined;
    let lruScore = Infinity;

    for (const [id, metadata] of this.instances.entries()) {
      // 高优先级实例（≥8）不参与 LRU 淘汰
      if (metadata.priority >= 8) continue;

      // LRU 评分：时间 + 访问频率 - 优先级权重
      const timeSinceAccess = Date.now() - metadata.lastAccess;
      const accessWeight = Math.max(1, metadata.accessCount);
      const priorityWeight = Math.pow(2, metadata.priority);

      const score = (timeSinceAccess / accessWeight) / priorityWeight;

      if (score > lruScore) {
        lruScore = score;
        lruId = id;
      }
    }

    return lruId;
  }

  /**
   * 获取统计信息
   */
  stats(): InstanceStats {
    let totalMemory = 0;
    let totalAccessCount = 0;

    for (const metadata of this.instances.values()) {
      totalMemory += metadata.memoryUsage || 0;
      totalAccessCount += metadata.accessCount;
    }

    return {
      total: this.instances.size,
      active: this.instances.size,
      ids: Array.from(this.instances.keys()),
      maxInstances: this.maxInstances,
      memoryUsage: totalMemory,
      avgAccessCount: this.instances.size > 0 ? totalAccessCount / this.instances.size : 0,
    };
  }

  /**
   * 设置最大实例数
   */
  setMaxInstances(max: number): void {
    this.maxInstances = max;

    // 如果当前实例数超过新的最大值，清理超出的实例
    while (this.instances.size > max) {
      const lruId = this.getLRUInstance();
      if (lruId) {
        this.dispose(lruId);
      } else {
        break; // 所有实例都是高优先级
      }
    }
  }

  /**
   * 检查实例是否存在
   */
  has(id: string): boolean {
    return this.instances.has(id);
  }

  /**
   * 获取所有实例ID
   */
  getAllIds(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * 获取实例数量
   */
  size(): number {
    return this.instances.size;
  }

  /**
   * 设置实例优先级
   */
  setPriority(id: string, priority: number): void {
    const metadata = this.instances.get(id);
    if (metadata) {
      metadata.priority = Math.max(0, Math.min(10, priority));
    }
  }

  /**
   * 获取实例优先级
   */
  getPriority(id: string): number | undefined {
    return this.instances.get(id)?.priority;
  }

  /**
   * 更新实例内存使用
   */
  updateMemoryUsage(id: string, usage: number): void {
    const metadata = this.instances.get(id);
    if (metadata) {
      metadata.memoryUsage = usage;
    }
  }

  /**
   * 启动内存监控
   */
  private monitoringTimer?: ReturnType<typeof setInterval>;

  private startMemoryMonitoring(): void {
    // 每 10 秒检查一次内存使用
    this.monitoringTimer = setInterval(() => {
      this.checkMemoryUsage();
    }, 10000);
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): void {
    const stats = this.stats();
    const memoryMB = stats.memoryUsage / (1024 * 1024);

    // 如果超过阈值，触发警告
    if (memoryMB > this.memoryThreshold) {
      if (this.memoryWarningCallback) {
        this.memoryWarningCallback(memoryMB);
      }

      // 自动清理低优先级实例
      this.autoCleanup();
    }
  }

  /**
   * 自动清理低优先级实例
   */
  private autoCleanup(): void {
    // 清理优先级 <= 3 的实例
    const lowPriorityIds = Array.from(this.instances.entries())
      .filter(([_, metadata]) => metadata.priority <= 3)
      .map(([id]) => id);

    for (const id of lowPriorityIds) {
      if (this.instances.size <= this.maxInstances * 0.5) break;
      this.dispose(id);
    }
  }

  /**
   * 设置内存警告回调
   */
  onMemoryWarning(callback: (usage: number) => void): void {
    this.memoryWarningCallback = callback;
  }

  /**
   * 设置内存阈值（MB）
   */
  setMemoryThreshold(threshold: number): void {
    this.memoryThreshold = threshold;
  }

  /**
   * 手动触发垃圾回收（如果可用）
   */
  triggerGC(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
    this.disposeAll();
  }
}

// 全局实例管理器
export const instanceManager = new ChartInstanceManager();

