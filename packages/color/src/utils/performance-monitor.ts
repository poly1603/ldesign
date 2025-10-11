/**
 * 性能监控工具
 * 用于监控和分析颜色库的性能指标
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 操作名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 持续时间（毫秒） */
  duration?: number
  /** 内存使用（字节） */
  memory?: {
    used: number
    total: number
    limit: number
  }
  /** 自定义数据 */
  data?: Record<string, any>
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 总操作数 */
  totalOperations: number
  /** 总耗时 */
  totalDuration: number
  /** 平均耗时 */
  averageDuration: number
  /** 最小耗时 */
  minDuration: number
  /** 最大耗时 */
  maxDuration: number
  /** 操作详情 */
  operations: PerformanceMetrics[]
  /** 内存统计 */
  memoryStats?: {
    average: number
    peak: number
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private history: PerformanceMetrics[] = []
  private maxHistorySize: number

  constructor(maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize
  }

  /**
   * 开始监控
   */
  start(name: string, data?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      data,
    }

    // 记录内存使用（如果支持）
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory
      metric.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      }
    }

    this.metrics.set(name, metric)
  }

  /**
   * 结束监控
   */
  end(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`性能监控: 未找到名为 "${name}" 的监控项`)
      return null
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // 更新内存使用
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory
      if (metric.memory) {
        metric.memory.used = memory.usedJSHeapSize - metric.memory.used
      }
    }

    // 添加到历史记录
    this.history.push({ ...metric })
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }

    this.metrics.delete(name)
    return metric
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    data?: Record<string, any>,
  ): Promise<{ result: T, metrics: PerformanceMetrics }> {
    this.start(name, data)

    try {
      const result = await fn()
      const metrics = this.end(name)!
      return { result, metrics }
    }
    catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * 获取性能报告
   */
  getReport(filterName?: string): PerformanceReport {
    const operations = filterName
      ? this.history.filter(m => m.name === filterName)
      : this.history

    if (operations.length === 0) {
      return {
        totalOperations: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        operations: [],
      }
    }

    const durations = operations.map(m => m.duration || 0)
    const totalDuration = durations.reduce((sum, d) => sum + d, 0)

    const report: PerformanceReport = {
      totalOperations: operations.length,
      totalDuration,
      averageDuration: totalDuration / operations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      operations,
    }

    // 计算内存统计
    const memoryMetrics = operations.filter(m => m.memory)
    if (memoryMetrics.length > 0) {
      const memoryUsages = memoryMetrics.map(m => m.memory!.used)
      report.memoryStats = {
        average: memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length,
        peak: Math.max(...memoryUsages),
      }
    }

    return report
  }

  /**
   * 清除历史记录
   */
  clear(): void {
    this.history = []
    this.metrics.clear()
  }

  /**
   * 获取当前正在监控的项目
   */
  getActive(): string[] {
    return Array.from(this.metrics.keys())
  }

  /**
   * 导出性能数据
   */
  export(): string {
    return JSON.stringify({
      history: this.history,
      timestamp: new Date().toISOString(),
    }, null, 2)
  }

  /**
   * 打印性能报告
   */
  printReport(filterName?: string): void {
    const report = this.getReport(filterName)

    console.group(`性能报告${filterName ? ` - ${filterName}` : ''}`)
    console.log(`总操作数: ${report.totalOperations}`)
    console.log(`总耗时: ${report.totalDuration.toFixed(2)}ms`)
    console.log(`平均耗时: ${report.averageDuration.toFixed(2)}ms`)
    console.log(`最小耗时: ${report.minDuration.toFixed(2)}ms`)
    console.log(`最大耗时: ${report.maxDuration.toFixed(2)}ms`)

    if (report.memoryStats) {
      console.log(`平均内存: ${(report.memoryStats.average / 1024 / 1024).toFixed(2)}MB`)
      console.log(`峰值内存: ${(report.memoryStats.peak / 1024 / 1024).toFixed(2)}MB`)
    }

    console.groupEnd()
  }
}

/**
 * 全局性能监控器实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor()

/**
 * 性能监控装饰器
 */
export function monitored(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value
    const monitorName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return globalPerformanceMonitor.measure(
        monitorName,
        () => originalMethod.apply(this, args),
        { args },
      ).then(({ result }) => result)
    }

    return descriptor
  }
}

/**
 * 便捷函数：测量函数执行时间
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  const { result } = await globalPerformanceMonitor.measure(name, fn)
  return result
}

/**
 * 便捷函数：获取性能报告
 */
export function getPerformanceReport(filterName?: string): PerformanceReport {
  return globalPerformanceMonitor.getReport(filterName)
}

/**
 * 便捷函数：打印性能报告
 */
export function printPerformanceReport(filterName?: string): void {
  globalPerformanceMonitor.printReport(filterName)
}

/**
 * 便捷函数：清除性能数据
 */
export function clearPerformanceData(): void {
  globalPerformanceMonitor.clear()
}

/**
 * 性能基准测试
 */
export async function benchmark(
  name: string,
  fn: () => any | Promise<any>,
  iterations = 100,
): Promise<PerformanceReport> {
  const monitor = new PerformanceMonitor()

  for (let i = 0; i < iterations; i++) {
    await monitor.measure(`${name}-${i}`, fn)
  }

  return monitor.getReport()
}

/**
 * 比较两个函数的性能
 */
export async function comparePerformance(
  fn1: { name: string, fn: () => any | Promise<any> },
  fn2: { name: string, fn: () => any | Promise<any> },
  iterations = 100,
): Promise<{
  fn1: PerformanceReport
  fn2: PerformanceReport
  winner: string
  improvement: number
}> {
  const report1 = await benchmark(fn1.name, fn1.fn, iterations)
  const report2 = await benchmark(fn2.name, fn2.fn, iterations)

  const winner = report1.averageDuration < report2.averageDuration ? fn1.name : fn2.name
  const improvement = Math.abs(
    ((report1.averageDuration - report2.averageDuration) / Math.max(report1.averageDuration, report2.averageDuration)) * 100,
  )

  return {
    fn1: report1,
    fn2: report2,
    winner,
    improvement,
  }
}

/**
 * 内存使用信息
 */
export interface MemoryUsage {
  /** 已使用内存（字节） */
  used: number
  /** 总内存（字节） */
  total: number
  /** 内存限制（字节） */
  limit: number
  /** 使用率（百分比） */
  usagePercent: number
}

/**
 * 内存监控事件类型
 */
export type MemoryEventType = 'warning' | 'critical' | 'normal'

/**
 * 内存监控回调
 */
export type MemoryCallback = (type: MemoryEventType, usage: MemoryUsage) => void

/**
 * 实时内存监控器
 * 
 * 特性：
 * - 实时监控内存使用情况
 * - 自动预警机制（75% 警告，90% 严重）
 * - 支持自定义阈值
 * - 提供内存使用趋势分析
 * 
 * @example
 * ```ts
 * const monitor = new MemoryMonitor()
 * 
 * monitor.on('warning', (usage) => {
 *   console.warn(`内存使用率达到 ${usage.usagePercent.toFixed(2)}%`)
 * })
 * 
 * monitor.on('critical', (usage) => {
 *   console.error(`内存严重不足: ${usage.usagePercent.toFixed(2)}%`)
 *   // 执行清理操作
 *   cleanupCache()
 * })
 * 
 * monitor.start(5000) // 每5秒检查一次
 * ```
 */
export class MemoryMonitor {
  private checkInterval: NodeJS.Timeout | null = null
  private listeners: Map<MemoryEventType, Set<MemoryCallback>> = new Map()
  private history: Array<{ timestamp: number, usage: MemoryUsage }> = []
  private maxHistorySize = 100
  private lastState: MemoryEventType = 'normal'
  
  private thresholds = {
    warning: 0.75,   // 75% 使用率警告
    critical: 0.9,   // 90% 使用率严重
  }
  
  /**
   * 创建内存监控器
   */
  constructor(options?: {
    warningThreshold?: number
    criticalThreshold?: number
    maxHistorySize?: number
  }) {
    if (options?.warningThreshold) {
      this.thresholds.warning = options.warningThreshold
    }
    if (options?.criticalThreshold) {
      this.thresholds.critical = options.criticalThreshold
    }
    if (options?.maxHistorySize) {
      this.maxHistorySize = options.maxHistorySize
    }
    
    // 初始化监听器映射
    this.listeners.set('normal', new Set())
    this.listeners.set('warning', new Set())
    this.listeners.set('critical', new Set())
  }
  
  /**
   * 启动内存监控
   * @param intervalMs 检查间隔（毫秒），默认 5000ms
   */
  start(intervalMs: number = 5000): void {
    if (this.checkInterval) {
      console.warn('Memory monitor is already running')
      return
    }
    
    if (!this.isMemoryAPIAvailable()) {
      console.warn('Memory API is not available in this environment')
      return
    }
    
    this.checkInterval = setInterval(() => {
      this.check()
    }, intervalMs)
    
    // 允许进程退出
    if (typeof process !== 'undefined' && this.checkInterval.unref) {
      this.checkInterval.unref()
    }
    
    // 立即执行一次检查
    this.check()
  }
  
  /**
   * 停止内存监控
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
  
  /**
   * 执行一次内存检查
   */
  check(): void {
    const usage = this.getMemoryUsage()
    const usageRatio = usage.used / usage.limit
    
    // 记录历史
    this.addToHistory(usage)
    
    // 判断状态
    let currentState: MemoryEventType = 'normal'
    if (usageRatio >= this.thresholds.critical) {
      currentState = 'critical'
    } else if (usageRatio >= this.thresholds.warning) {
      currentState = 'warning'
    }
    
    // 状态变化时触发事件
    if (currentState !== this.lastState || currentState !== 'normal') {
      this.emit(currentState, usage)
      this.lastState = currentState
    }
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsage {
    if (!this.isMemoryAPIAvailable()) {
      return {
        used: 0,
        total: 0,
        limit: 0,
        usagePercent: 0,
      }
    }
    
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    }
  }
  
  /**
   * 获取内存使用趋势
   */
  getTrend(): {
    isIncreasing: boolean
    averageUsage: number
    peakUsage: number
    recentChange: number
  } {
    if (this.history.length < 2) {
      return {
        isIncreasing: false,
        averageUsage: 0,
        peakUsage: 0,
        recentChange: 0,
      }
    }
    
    const usages = this.history.map(h => h.usage.usagePercent)
    const average = usages.reduce((sum, u) => sum + u, 0) / usages.length
    const peak = Math.max(...usages)
    
    // 计算最近的变化趋势（最近10个数据点）
    const recentCount = Math.min(10, this.history.length)
    const recent = this.history.slice(-recentCount)
    const firstRecent = recent[0].usage.usagePercent
    const lastRecent = recent[recent.length - 1].usage.usagePercent
    const recentChange = lastRecent - firstRecent
    
    return {
      isIncreasing: recentChange > 0,
      averageUsage: average,
      peakUsage: peak,
      recentChange,
    }
  }
  
  /**
   * 获取内存历史记录
   */
  getHistory(): Array<{ timestamp: number, usage: MemoryUsage }> {
    return [...this.history]
  }
  
  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = []
  }
  
  /**
   * 监听内存事件
   */
  on(type: MemoryEventType, callback: MemoryCallback): void {
    this.listeners.get(type)?.add(callback)
  }
  
  /**
   * 移除监听器
   */
  off(type: MemoryEventType, callback: MemoryCallback): void {
    this.listeners.get(type)?.delete(callback)
  }
  
  /**
   * 触发事件
   */
  private emit(type: MemoryEventType, usage: MemoryUsage): void {
    this.listeners.get(type)?.forEach(callback => {
      try {
        callback(type, usage)
      } catch (error) {
        console.error('Memory monitor callback error:', error)
      }
    })
  }
  
  /**
   * 添加到历史记录
   */
  private addToHistory(usage: MemoryUsage): void {
    this.history.push({
      timestamp: Date.now(),
      usage,
    })
    
    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }
  }
  
  /**
   * 检查 Memory API 是否可用
   */
  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && typeof (performance as any).memory !== 'undefined'
  }
  
  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stop()
    this.listeners.clear()
    this.history = []
  }
}

/**
 * 全局内存监控器实例
 */
export const globalMemoryMonitor = new MemoryMonitor()

/**
 * 便捷函数：获取当前内存使用情况
 */
export function getMemoryUsage(): MemoryUsage {
  return globalMemoryMonitor.getMemoryUsage()
}

/**
 * 便捷函数：获取内存使用趋势
 */
export function getMemoryTrend() {
  return globalMemoryMonitor.getTrend()
}

/**
 * 便捷函数：打印内存使用报告
 */
export function printMemoryReport(): void {
  const usage = getMemoryUsage()
  const trend = getMemoryTrend()
  
  console.group('内存使用报告')
  console.log(`当前使用: ${(usage.used / 1024 / 1024).toFixed(2)}MB`)
  console.log(`总内存: ${(usage.total / 1024 / 1024).toFixed(2)}MB`)
  console.log(`内存限制: ${(usage.limit / 1024 / 1024).toFixed(2)}MB`)
  console.log(`使用率: ${usage.usagePercent.toFixed(2)}%`)
  console.log(`平均使用率: ${trend.averageUsage.toFixed(2)}%`)
  console.log(`峰值使用率: ${trend.peakUsage.toFixed(2)}%`)
  console.log(`趋势: ${trend.isIncreasing ? '↑ 增长' : '↓ 下降'} (${trend.recentChange.toFixed(2)}%)`)
  console.groupEnd()
}

