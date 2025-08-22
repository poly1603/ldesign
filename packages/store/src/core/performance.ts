/**
 * 性能监控工具
 * 用于监控和优化 Store 性能
 */

export interface PerformanceMetrics {
  actionExecutionTime: Map<string, number[]>
  getterComputationTime: Map<string, number[]>
  stateUpdateCount: Map<string, number>
  memoryUsage: {
    storeCount: number
    cacheSize: number
  }
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics = {
    actionExecutionTime: new Map(),
    getterComputationTime: new Map(),
    stateUpdateCount: new Map(),
    memoryUsage: {
      storeCount: 0,
      cacheSize: 0,
    },
  }

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 记录 Action 执行时间
   */
  recordActionTime(actionName: string, executionTime: number): void {
    if (!this.metrics.actionExecutionTime.has(actionName)) {
      this.metrics.actionExecutionTime.set(actionName, [])
    }
    const times = this.metrics.actionExecutionTime.get(actionName)!
    times.push(executionTime)

    // 保持最近100次记录
    if (times.length > 100) {
      times.shift()
    }
  }

  /**
   * 记录 Getter 计算时间
   */
  recordGetterTime(getterName: string, computationTime: number): void {
    if (!this.metrics.getterComputationTime.has(getterName)) {
      this.metrics.getterComputationTime.set(getterName, [])
    }
    const times = this.metrics.getterComputationTime.get(getterName)!
    times.push(computationTime)

    // 保持最近100次记录
    if (times.length > 100) {
      times.shift()
    }
  }

  /**
   * 记录状态更新次数
   */
  recordStateUpdate(stateName: string): void {
    const count = this.metrics.stateUpdateCount.get(stateName) || 0
    this.metrics.stateUpdateCount.set(stateName, count + 1)
  }

  /**
   * 更新内存使用情况
   */
  updateMemoryUsage(storeCount: number, cacheSize: number): void {
    this.metrics.memoryUsage.storeCount = storeCount
    this.metrics.memoryUsage.cacheSize = cacheSize
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    slowActions: Array<{ name: string, avgTime: number, maxTime: number }>
    slowGetters: Array<{ name: string, avgTime: number, maxTime: number }>
    frequentUpdates: Array<{ name: string, count: number }>
    memoryUsage: PerformanceMetrics['memoryUsage']
  } {
    const slowActions = Array.from(this.metrics.actionExecutionTime.entries())
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        maxTime: Math.max(...times),
      }))
      .filter(action => action.avgTime > 10) // 超过10ms的Action
      .sort((a, b) => b.avgTime - a.avgTime)

    const slowGetters = Array.from(this.metrics.getterComputationTime.entries())
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        maxTime: Math.max(...times),
      }))
      .filter(getter => getter.avgTime > 5) // 超过5ms的Getter
      .sort((a, b) => b.avgTime - a.avgTime)

    const frequentUpdates = Array.from(this.metrics.stateUpdateCount.entries())
      .map(([name, count]) => ({ name, count }))
      .filter(update => update.count > 100) // 超过100次更新的状态
      .sort((a, b) => b.count - a.count)

    return {
      slowActions,
      slowGetters,
      frequentUpdates,
      memoryUsage: this.metrics.memoryUsage,
    }
  }

  /**
   * 清理性能数据
   */
  clearMetrics(): void {
    this.metrics.actionExecutionTime.clear()
    this.metrics.getterComputationTime.clear()
    this.metrics.stateUpdateCount.clear()
    this.metrics.memoryUsage = {
      storeCount: 0,
      cacheSize: 0,
    }
  }

  /**
   * 创建性能装饰器
   */
  createPerformanceDecorator(type: 'action' | 'getter') {
    return function (
      _target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const originalMethod = descriptor.value || descriptor.get
      const monitor = PerformanceMonitor.getInstance()

      if (type === 'action' && descriptor.value) {
        descriptor.value = function (...args: any[]) {
          const startTime = performance.now()
          const result = originalMethod.apply(this, args)

          // 处理异步方法
          if (result && typeof result.then === 'function') {
            return result.finally(() => {
              const endTime = performance.now()
              monitor.recordActionTime(propertyKey, endTime - startTime)
            })
          }
          else {
            const endTime = performance.now()
            monitor.recordActionTime(propertyKey, endTime - startTime)
            return result
          }
        }
      }
      else if (type === 'getter' && descriptor.get) {
        descriptor.get = function () {
          const startTime = performance.now()
          const result = originalMethod.call(this)
          const endTime = performance.now()
          monitor.recordGetterTime(propertyKey, endTime - startTime)
          return result
        }
      }

      return descriptor
    }
  }
}

/**
 * 性能监控装饰器
 */
export const MonitorAction
  = PerformanceMonitor.getInstance().createPerformanceDecorator('action')
export const MonitorGetter
  = PerformanceMonitor.getInstance().createPerformanceDecorator('getter')

/**
 * 获取性能监控实例
 */
export function usePerformanceMonitor() {
  return PerformanceMonitor.getInstance()
}

/**
 * 性能优化建议
 */
export function getOptimizationSuggestions(
  report: ReturnType<PerformanceMonitor['getPerformanceReport']>,
): string[] {
  const suggestions: string[] = []

  if (report.slowActions.length > 0) {
    suggestions.push(
      `发现 ${report.slowActions.length} 个慢速 Action，建议使用 @CachedAction 或 @DebouncedAction 优化`,
    )
  }

  if (report.slowGetters.length > 0) {
    suggestions.push(
      `发现 ${report.slowGetters.length} 个慢速 Getter，建议使用 @CachedGetter 或 @MemoizedGetter 优化`,
    )
  }

  if (report.frequentUpdates.length > 0) {
    suggestions.push(
      `发现 ${report.frequentUpdates.length} 个频繁更新的状态，建议使用 @ThrottledAction 限制更新频率`,
    )
  }

  if (report.memoryUsage.cacheSize > 1000) {
    suggestions.push('缓存大小过大，建议设置缓存过期时间或限制缓存大小')
  }

  if (report.memoryUsage.storeCount > 50) {
    suggestions.push('Store 实例过多，建议合并相关的 Store 或使用 Store 池管理')
  }

  return suggestions
}
