/**
 * 全局实例管理器
 */

import type { ChartInstance } from '../types';

/**
 * 图表实例管理器
 */
export class ChartInstanceManager {
  private instances = new Map<string, ChartInstance>();
  private activeCount = 0;
  private maxInstances: number;

  constructor(maxInstances = 50) {
    this.maxInstances = maxInstances;
  }

  /**
   * 注册实例
   */
  register(id: string, instance: ChartInstance): void {
    // 超过最大数量，清理最旧的实例
    if (this.instances.size >= this.maxInstances) {
      const oldestId = this.getOldestId();
      if (oldestId) {
        this.dispose(oldestId);
      }
    }

    this.instances.set(id, instance);
    this.activeCount++;
  }

  /**
   * 获取实例
   */
  get(id: string): ChartInstance | undefined {
    return this.instances.get(id);
  }

  /**
   * 销毁实例
   */
  dispose(id: string): void {
    const instance = this.instances.get(id);
    if (instance) {
      instance.dispose();
      this.instances.delete(id);
      this.activeCount--;
    }
  }

  /**
   * 销毁所有实例
   */
  disposeAll(): void {
    for (const instance of this.instances.values()) {
      instance.dispose();
    }
    this.instances.clear();
    this.activeCount = 0;
  }

  /**
   * 获取最旧的实例 ID
   */
  private getOldestId(): string | undefined {
    return this.instances.keys().next().value;
  }

  /**
   * 获取统计信息
   */
  stats(): {
    total: number;
    active: number;
    ids: string[];
    maxInstances: number;
  } {
    return {
      total: this.instances.size,
      active: this.activeCount,
      ids: Array.from(this.instances.keys()),
      maxInstances: this.maxInstances,
    };
  }

  /**
   * 设置最大实例数
   */
  setMaxInstances(max: number): void {
    this.maxInstances = max;

    // 如果当前实例数超过新的最大值，清理超出的实例
    while (this.instances.size > max) {
      const oldestId = this.getOldestId();
      if (oldestId) {
        this.dispose(oldestId);
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
}

// 全局实例管理器
export const instanceManager = new ChartInstanceManager();

