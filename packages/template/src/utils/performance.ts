/**
 * 简化的性能工具
 */

/**
 * 简单性能监控
 */
export class SimplePerformanceMonitor {
  private startTimes = new Map<string, number>()

  /**
   * 开始计时
   */
  startTimer(name: string): void {
    this.startTimes.set(name, performance.now())
  }

  /**
   * 结束计时并返回耗时
   */
  endTimer(name: string): number {
    const startTime = this.startTimes.get(name)
    if (!startTime) return 0
    
    const endTime = performance.now()
    const duration = endTime - startTime
    this.startTimes.delete(name)
    
    return duration
  }

  /**
   * 清理所有计时器
   */
  clear(): void {
    this.startTimes.clear()
  }
}

// 已移除复杂的预加载和观察器功能，简化库体积

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = window.setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 空闲时执行
 */
export function runWhenIdle(callback: () => void, timeout = 5000): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout })
  }
  else {
    setTimeout(callback, 0)
  }
}

/**
 * 全局简单性能监控实例
 */
export const simplePerformanceMonitor = new SimplePerformanceMonitor()

/**
 * 性能优化工具函数
 */
export const performanceUtils = {
  /**
   * 监控函数执行时间
   */
  measureTime: <T extends (...args: any[]) => any>(
    name: string,
    func: T,
  ): T => {
    return ((...args: Parameters<T>) => {
      simplePerformanceMonitor.startTimer(name)
      const result = func(...args)
      const duration = simplePerformanceMonitor.endTimer(name)
      
      if (duration > 100) {
        console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`)
      }

      return result
    }) as T
  },

  /**
   * 异步函数执行时间监控
   */
  measureAsyncTime: <T extends (...args: any[]) => Promise<any>>(
    name: string,
    func: T,
  ): T => {
    return (async (...args: Parameters<T>) => {
      simplePerformanceMonitor.startTimer(name)
      const result = await func(...args)
      const duration = simplePerformanceMonitor.endTimer(name)
      
      if (duration > 100) {
        console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`)
      }

      return result
    }) as T
  },

  /**
   * 获取基础性能信息
   */
  getPerformanceReport: () => {
    return {
      memory: typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance
        // @ts-ignore
        ? window.performance.memory
        : null,
    }
  },
}
