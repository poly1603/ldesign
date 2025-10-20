/**
 * @ldesign/engine 内存管理工具集
 * 
 * 统一导出所有内存管理相关的工具
 */

// 内存监控与资源管理
import { MemoryMonitor } from './memory-monitor';
import { ResourceManager } from './resource-manager';

export { MemoryMonitor } from './memory-monitor';
export type {
  MemoryError,
  MemoryMonitorConfig,
  MemoryStats,
  MemoryWarning
} from './memory-monitor';
export { ResourceManager } from './resource-manager';

/**
 * 创建带资源管理的应用上下文
 */
export function createManagedContext() {
  const resources = new ResourceManager();
  const memoryMonitor = new MemoryMonitor({
    autoStart: true,
    onWarning: (info: any) => {
      console.warn('[Memory Warning]', info.message);
    },
    onError: (info: any) => {
      console.error('[Memory Error]', info.message);
    }
  });
  
  return {
    resources,
    memoryMonitor,
    
    /**
     * 清理所有资源
     */
    destroy() {
      memoryMonitor.destroy();
      resources.destroy();
    },
    
    /**
     * 获取统计信息
     */
    getStats() {
      return {
        memory: memoryMonitor.getStats(),
        resources: resources.getStats()
      };
    }
  };
}

/**
 * 全局资源管理器（可选使用）
 */
let globalContext: ReturnType<typeof createManagedContext> | null = null;

/**
 * 获取全局资源管理上下文
 */
export function getGlobalContext() {
  if (!globalContext) {
    globalContext = createManagedContext();
  }
  return globalContext;
}

/**
 * 销毁全局资源管理上下文
 */
export function destroyGlobalContext() {
  if (globalContext) {
    globalContext.destroy();
    globalContext = null;
  }
}





















