/**
 * 性能监控工具
 * 提供API调用性能监控、内存使用监控和性能分析功能
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 方法名 */
  methodName: string
  /** 调用次数 */
  callCount: number
  /** 总耗时 (毫秒) */
  totalTime: number
  /** 平均耗时 (毫秒) */
  averageTime: number
  /** 最小耗时 (毫秒) */
  minTime: number
  /** 最大耗时 (毫秒) */
  maxTime: number
  /** 成功次数 */
  successCount: number
  /** 失败次数 */
  errorCount: number
  /** 成功率 */
  successRate: number
  /** 最近调用时间 */
  lastCallTime: number
}

/**
 * 内存使用信息
 */
export interface MemoryUsage {
  /** 已使用内存 (字节) */
  used: number
  /** 总内存 (字节) */
  total: number
  /** 使用率 */
  usage: number
  /** 垃圾回收次数 */
  gcCount?: number
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 监控时间范围 */
  timeRange: {
    start: number
    end: number
    duration: number
  }
  /** 总体统计 */
  overall: {
    totalCalls: number
    totalTime: number
    averageTime: number
    errorRate: number
  }
  /** 各方法性能指标 */
  methods: PerformanceMetrics[]
  /** 内存使用情况 */
  memory: MemoryUsage
  /** 性能建议 */
  recommendations: string[]
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled: boolean
  /** 是否收集详细指标 */
  collectDetailedMetrics: boolean
  /** 最大保存的调用记录数 */
  maxRecords: number
  /** 性能报告生成间隔 (毫秒) */
  reportInterval: number
  /** 慢查询阈值 (毫秒) */
  slowQueryThreshold: number
  /** 是否在控制台输出性能警告 */
  logWarnings: boolean
}

/**
 * 调用记录
 */
interface CallRecord {
  methodName: string
  startTime: number
  endTime: number
  duration: number
  success: boolean
  error?: Error
  params?: unknown
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private config: Required<PerformanceMonitorConfig>
  private metrics = new Map<string, PerformanceMetrics>()
  private callRecords: CallRecord[] = []
  private startTime = Date.now()
  private reportTimer?: NodeJS.Timeout

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      enabled: true,
      collectDetailedMetrics: true,
      maxRecords: 1000,
      reportInterval: 60000, // 1分钟
      slowQueryThreshold: 1000, // 1秒
      logWarnings: true,
      ...config,
    }

    if (this.config?.enabled && this.config?.reportInterval > 0) {
      this.startReporting()
    }
  }

  /**
   * 开始监控API调用
   */
  startCall(methodName: string, params?: unknown): (error?: Error) => void {
    if (!this.config?.enabled) {
      return () => {}
    }

    const startTime = performance.now()

    return (error?: Error) => {
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordCall({
        methodName,
        startTime,
        endTime,
        duration,
        success: !error,
        error,
        params: this.config?.collectDetailedMetrics ? params : undefined,
      })
    }
  }

  /**
   * 记录调用结果
   */
  private recordCall(record: CallRecord): void {
    // 更新方法指标
    this.updateMethodMetrics(record)

    // 保存调用记录
    if (this.config?.collectDetailedMetrics) {
      this.callRecords.push(record)
      if (this.callRecords.length > this.config?.maxRecords) {
        this.callRecords.shift()
      }
    }

    // 检查慢查询
    if (record.duration > this.config?.slowQueryThreshold && this.config?.logWarnings) {
      console.warn(
        `🐌 Slow API call detected: ${record.methodName} took ${record.duration.toFixed(2)}ms`,
        record.params ? { params: record.params } : '',
      )
    }

    // 检查错误
    if (!record.success && this.config?.logWarnings) {
      console.warn(
        `❌ API call failed: ${record.methodName}`,
        record.error,
      )
    }
  }

  /**
   * 更新方法性能指标
   */
  private updateMethodMetrics(record: CallRecord): void {
    const existing = this.metrics.get(record.methodName)

    if (existing) {
      existing.callCount++
      existing.totalTime += record.duration
      existing.averageTime = existing.totalTime / existing.callCount
      existing.minTime = Math.min(existing.minTime, record.duration)
      existing.maxTime = Math.max(existing.maxTime, record.duration)
      existing.lastCallTime = Date.now()

      if (record.success) {
        existing.successCount++
      }
      else {
        existing.errorCount++
      }

      existing.successRate = existing.successCount / existing.callCount
    }
    else {
      this.metrics.set(record.methodName, {
        methodName: record.methodName,
        callCount: 1,
        totalTime: record.duration,
        averageTime: record.duration,
        minTime: record.duration,
        maxTime: record.duration,
        successCount: record.success ? 1 : 0,
        errorCount: record.success ? 0 : 1,
        successRate: record.success ? 1 : 0,
        lastCallTime: Date.now(),
      })
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(methodName?: string): PerformanceMetrics[] {
    if (methodName) {
      const metric = this.metrics.get(methodName)
      return metric ? [metric] : []
    }
    return Array.from(this.metrics.values())
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsage {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        usage: memory.usedJSHeapSize / memory.totalJSHeapSize,
      }
    }

    // Node.js环境
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage()
      return {
        used: memory.heapUsed,
        total: memory.heapTotal,
        usage: memory.heapUsed / memory.heapTotal,
      }
    }

    // 无法获取内存信息
    return {
      used: 0,
      total: 0,
      usage: 0,
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const now = Date.now()
    const methods = this.getMetrics()
    const memory = this.getMemoryUsage()

    // 计算总体统计
    const totalCalls = methods.reduce((sum, m) => sum + m.callCount, 0)
    const totalTime = methods.reduce((sum, m) => sum + m.totalTime, 0)
    const totalErrors = methods.reduce((sum, m) => sum + m.errorCount, 0)

    const overall = {
      totalCalls,
      totalTime,
      averageTime: totalCalls > 0 ? totalTime / totalCalls : 0,
      errorRate: totalCalls > 0 ? totalErrors / totalCalls : 0,
    }

    // 生成性能建议
    const recommendations = this.generateRecommendations(methods, memory, overall)

    return {
      timeRange: {
        start: this.startTime,
        end: now,
        duration: now - this.startTime,
      },
      overall,
      methods: methods.sort((a, b) => b.averageTime - a.averageTime), // 按平均耗时排序
      memory,
      recommendations,
    }
  }

  /**
   * 生成性能建议
   */
  private generateRecommendations(
    methods: PerformanceMetrics[],
    memory: MemoryUsage,
    overall: any,
  ): string[] {
    const recommendations: string[] = []

    // 检查慢方法
    const slowMethods = methods.filter(m => m.averageTime > this.config?.slowQueryThreshold)
    if (slowMethods.length > 0) {
      recommendations.push(
        `发现 ${slowMethods.length} 个慢方法，建议优化: ${slowMethods.map(m => m.methodName).join(', ')}`,
      )
    }

    // 检查错误率
    const highErrorMethods = methods.filter(m => m.errorCount > 0 && m.successRate < 0.95)
    if (highErrorMethods.length > 0) {
      recommendations.push(
        `发现高错误率方法，建议检查: ${highErrorMethods.map(m => `${m.methodName}(${(m.successRate * 100).toFixed(1)}%)`).join(', ')}`,
      )
    }

    // 检查内存使用
    if (memory.usage > 0.8) {
      recommendations.push('内存使用率较高，建议检查内存泄漏或优化缓存策略')
    }

    // 检查总体性能
    if (overall.averageTime > 500) {
      recommendations.push('API平均响应时间较长，建议优化网络请求或服务器性能')
    }

    if (overall.errorRate > 0.05) {
      recommendations.push('API错误率较高，建议检查网络连接和服务器状态')
    }

    // 检查调用频率
    const highFrequencyMethods = methods.filter(m => m.callCount > 100)
    if (highFrequencyMethods.length > 0) {
      recommendations.push(
        `高频调用方法建议启用缓存: ${highFrequencyMethods.map(m => m.methodName).join(', ')}`,
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好，无需特别优化')
    }

    return recommendations
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.metrics.clear()
    this.callRecords = []
    this.startTime = Date.now()
  }

  /**
   * 启动定期报告
   */
  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      const report = this.generateReport()
      console.group('📊 API Performance Report')
      console.log(`Time Range: ${new Date(report.timeRange.start)} - ${new Date(report.timeRange.end)}`)
      console.log(`Total Calls: ${report.overall.totalCalls}`)
      console.log(`Average Time: ${report.overall.averageTime.toFixed(2)}ms`)
      console.log(`Error Rate: ${(report.overall.errorRate * 100).toFixed(1)}%`)
      console.groupEnd()
    }, this.config?.reportInterval)
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }
    this.reset()
  }
}

/**
 * 全局性能监控器实例
 */
let globalMonitor: PerformanceMonitor | null = null

/**
 * 获取全局性能监控器
 */
export function getGlobalPerformanceMonitor(): PerformanceMonitor | null {
  return globalMonitor
}

/**
 * 设置全局性能监控器
 */
export function setGlobalPerformanceMonitor(monitor: PerformanceMonitor | null): void {
  globalMonitor = monitor
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(config?: Partial<PerformanceMonitorConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config)
}
