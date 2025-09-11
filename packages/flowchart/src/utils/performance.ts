/**
 * 性能优化工具类
 * 提供流程图编辑器的性能监控和优化功能
 */

/**
 * 防抖函数
 * 用于优化频繁触发的事件处理
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 * 用于限制函数执行频率
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 性能监控器
 * 用于监控关键操作的性能
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  /**
   * 开始性能测量
   */
  start(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`)
    }
  }
  
  /**
   * 结束性能测量
   */
  end(name: string): number {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const measure = performance.getEntriesByName(name, 'measure')[0]
      const duration = measure?.duration || 0
      
      // 记录性能数据
      if (!this.metrics.has(name)) {
        this.metrics.set(name, [])
      }
      this.metrics.get(name)!.push(duration)
      
      // 清理性能标记
      performance.clearMarks(`${name}-start`)
      performance.clearMarks(`${name}-end`)
      performance.clearMeasures(name)
      
      return duration
    }
    return 0
  }
  
  /**
   * 获取性能统计
   */
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const durations = this.metrics.get(name)
    if (!durations || durations.length === 0) {
      return null
    }
    
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    
    return { avg, min, max, count: durations.length }
  }
  
  /**
   * 清理性能数据
   */
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
  /**
   * 获取当前内存使用情况
   */
  static getMemoryUsage(): {
    used: number
    total: number
    percentage: number
  } | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }
    return null
  }
  
  /**
   * 监控内存泄漏
   */
  static startMemoryLeakDetection(interval = 5000): () => void {
    const initialMemory = this.getMemoryUsage()
    if (!initialMemory) {
      console.warn('Memory monitoring not supported in this environment')
      return () => {}
    }
    
    const timer = setInterval(() => {
      const currentMemory = this.getMemoryUsage()
      if (currentMemory) {
        const growth = currentMemory.used - initialMemory.used
        if (growth > 10 * 1024 * 1024) { // 10MB 增长
          console.warn(`Potential memory leak detected: ${(growth / 1024 / 1024).toFixed(2)}MB growth`)
        }
      }
    }, interval)
    
    return () => clearInterval(timer)
  }
}

/**
 * 虚拟化渲染优化
 * 用于大量节点的性能优化
 */
export class VirtualizationHelper {
  /**
   * 计算可视区域内的节点
   */
  static getVisibleNodes(
    nodes: Array<{ x: number; y: number; width: number; height: number; id: string }>,
    viewport: { x: number; y: number; width: number; height: number; scale: number }
  ): string[] {
    const visibleNodes: string[] = []
    
    for (const node of nodes) {
      // 转换节点坐标到屏幕坐标
      const screenX = (node.x - viewport.x) * viewport.scale
      const screenY = (node.y - viewport.y) * viewport.scale
      const screenWidth = node.width * viewport.scale
      const screenHeight = node.height * viewport.scale
      
      // 检查是否在可视区域内
      if (
        screenX + screenWidth >= 0 &&
        screenX <= viewport.width &&
        screenY + screenHeight >= 0 &&
        screenY <= viewport.height
      ) {
        visibleNodes.push(node.id)
      }
    }
    
    return visibleNodes
  }
}

/**
 * 批量操作优化
 */
export class BatchProcessor {
  private queue: Array<() => void> = []
  private isProcessing = false
  
  /**
   * 添加操作到批处理队列
   */
  add(operation: () => void): void {
    this.queue.push(operation)
    this.scheduleProcess()
  }
  
  /**
   * 调度批处理执行
   */
  private scheduleProcess(): void {
    if (this.isProcessing) return
    
    this.isProcessing = true
    requestAnimationFrame(() => {
      this.processBatch()
      this.isProcessing = false
    })
  }
  
  /**
   * 执行批处理
   */
  private processBatch(): void {
    const operations = this.queue.splice(0)
    for (const operation of operations) {
      try {
        operation()
      } catch (error) {
        console.error('Batch operation failed:', error)
      }
    }
  }
}

/**
 * 性能优化装饰器
 */
export function performanceTrack(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const monitor = PerformanceMonitor.getInstance()
    
    descriptor.value = function (...args: any[]) {
      monitor.start(`${name}.${propertyKey}`)
      const result = originalMethod.apply(this, args)
      monitor.end(`${name}.${propertyKey}`)
      return result
    }
    
    return descriptor
  }
}
