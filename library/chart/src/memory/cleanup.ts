/**
 * 自动清理机制
 */

/**
 * 清理管理器
 */
export class CleanupManager {
  private timers = new Set<ReturnType<typeof setInterval>>();
  private cleanupFunctions = new Map<string, () => void>();
  private instances = new WeakSet<any>();

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
   * 启动自动清理
   */
  startAutoCleanup(interval = 60000): () => void {
    const timer = setInterval(() => {
      this.cleanupInactive();
    }, interval);

    this.timers.add(timer);

    return () => {
      clearInterval(timer);
      this.timers.delete(timer);
    };
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
  } {
    return {
      registeredCount: this.cleanupFunctions.size,
      timersCount: this.timers.size,
    };
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

