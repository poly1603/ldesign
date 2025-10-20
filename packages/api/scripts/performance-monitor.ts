/**
 * 性能监控配置和工具
 * 用于生产环境的性能追踪和告警
 */

export interface PerformanceThreshold {
  /** 警告阈值 (毫秒) */
  warning: number
  /** 错误阈值 (毫秒) */
  error: number
  /** 临界阈值 (毫秒) */
  critical: number
}

export interface PerformanceMetric {
  /** 指标名称 */
  name: string
  /** 指标值 */
  value: number
  /** 单位 */
  unit: string
  /** 时间戳 */
  timestamp: number
  /** 标签 */
  tags?: Record<string, string>
}

export interface PerformanceAlert {
  /** 告警级别 */
  level: 'warning' | 'error' | 'critical'
  /** 告警消息 */
  message: string
  /** 指标名称 */
  metric: string
  /** 实际值 */
  value: number
  /** 阈值 */
  threshold: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 性能监控配置
 */
export const PerformanceConfig = {
  /** API 调用性能阈值 */
  apiCall: {
    warning: 1000,    // 1秒
    error: 3000,      // 3秒
    critical: 5000,   // 5秒
  } as PerformanceThreshold,

  /** 缓存操作性能阈值 */
  cacheOperation: {
    warning: 10,      // 10毫秒
    error: 50,        // 50毫秒
    critical: 100,    // 100毫秒
  } as PerformanceThreshold,

  /** 中间件执行性能阈值 */
  middleware: {
    warning: 50,      // 50毫秒
    error: 200,       // 200毫秒
    critical: 500,    // 500毫秒
  } as PerformanceThreshold,

  /** 内存使用阈值 (字节) */
  memory: {
    warning: 50 * 1024 * 1024,    // 50MB
    error: 100 * 1024 * 1024,     // 100MB
    critical: 200 * 1024 * 1024,  // 200MB
  } as PerformanceThreshold,

  /** 队列长度阈值 */
  queueLength: {
    warning: 50,
    error: 100,
    critical: 200,
  } as PerformanceThreshold,
}

/**
 * 性能监控器类
 */
export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = []
  private alerts: PerformanceAlert[] = []
  private maxMetrics = 1000
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = []

  /**
   * 记录性能指标
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // 限制指标数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // 检查阈值
    this.checkThreshold(metric)
  }

  /**
   * 检查阈值并生成告警
   */
  private checkThreshold(metric: PerformanceMetric): void {
    const thresholds = this.getThresholds(metric.name)
    if (!thresholds) return

    let alert: PerformanceAlert | null = null

    if (metric.value >= thresholds.critical) {
      alert = {
        level: 'critical',
        message: `Critical: ${metric.name} exceeded critical threshold`,
        metric: metric.name,
        value: metric.value,
        threshold: thresholds.critical,
        timestamp: Date.now(),
      }
    } else if (metric.value >= thresholds.error) {
      alert = {
        level: 'error',
        message: `Error: ${metric.name} exceeded error threshold`,
        metric: metric.name,
        value: metric.value,
        threshold: thresholds.error,
        timestamp: Date.now(),
      }
    } else if (metric.value >= thresholds.warning) {
      alert = {
        level: 'warning',
        message: `Warning: ${metric.name} exceeded warning threshold`,
        metric: metric.name,
        value: metric.value,
        threshold: thresholds.warning,
        timestamp: Date.now(),
      }
    }

    if (alert) {
      this.alerts.push(alert)
      this.notifyAlert(alert)
    }
  }

  /**
   * 获取指标的阈值配置
   */
  private getThresholds(metricName: string): PerformanceThreshold | null {
    if (metricName.includes('apiCall')) {
      return PerformanceConfig.apiCall
    }
    if (metricName.includes('cache')) {
      return PerformanceConfig.cacheOperation
    }
    if (metricName.includes('middleware')) {
      return PerformanceConfig.middleware
    }
    if (metricName.includes('memory')) {
      return PerformanceConfig.memory
    }
    if (metricName.includes('queue')) {
      return PerformanceConfig.queueLength
    }
    return null
  }

  /**
   * 通知告警
   */
  private notifyAlert(alert: PerformanceAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Error in alert callback:', error)
      }
    })
  }

  /**
   * 订阅告警
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * 获取最近的指标
   */
  getRecentMetrics(count: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-count)
  }

  /**
   * 获取最近的告警
   */
  getRecentAlerts(count: number = 50): PerformanceAlert[] {
    return this.alerts.slice(-count)
  }

  /**
   * 获取性能统计
   */
  getStatistics(metricName?: string): {
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
    count: number
  } | null {
    const filteredMetrics = metricName
      ? this.metrics.filter(m => m.name === metricName)
      : this.metrics

    if (filteredMetrics.length === 0) return null

    const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
      count: values.length,
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const report: string[] = []
    report.push('='.repeat(80))
    report.push('性能监控报告')
    report.push('='.repeat(80))
    report.push('')

    // 指标统计
    const metricNames = [...new Set(this.metrics.map(m => m.name))]
    report.push('📊 性能指标统计:')
    report.push('-'.repeat(80))

    metricNames.forEach(name => {
      const stats = this.getStatistics(name)
      if (stats) {
        report.push(`\n${name}:`)
        report.push(`  平均值: ${stats.avg.toFixed(2)}ms`)
        report.push(`  最小值: ${stats.min.toFixed(2)}ms`)
        report.push(`  最大值: ${stats.max.toFixed(2)}ms`)
        report.push(`  P50:    ${stats.p50.toFixed(2)}ms`)
        report.push(`  P95:    ${stats.p95.toFixed(2)}ms`)
        report.push(`  P99:    ${stats.p99.toFixed(2)}ms`)
        report.push(`  样本数: ${stats.count}`)
      }
    })

    // 告警统计
    report.push('\n')
    report.push('⚠️  告警统计:')
    report.push('-'.repeat(80))

    const alertsByLevel = {
      warning: this.alerts.filter(a => a.level === 'warning').length,
      error: this.alerts.filter(a => a.level === 'error').length,
      critical: this.alerts.filter(a => a.level === 'critical').length,
    }

    report.push(`  Warning:  ${alertsByLevel.warning}`)
    report.push(`  Error:    ${alertsByLevel.error}`)
    report.push(`  Critical: ${alertsByLevel.critical}`)
    report.push(`  总计:     ${this.alerts.length}`)

    // 最近的告警
    if (this.alerts.length > 0) {
      report.push('\n最近的告警 (最多显示 10 条):')
      report.push('-'.repeat(80))

      this.getRecentAlerts(10).forEach(alert => {
        const timestamp = new Date(alert.timestamp).toISOString()
        report.push(`[${timestamp}] ${alert.level.toUpperCase()}: ${alert.message}`)
        report.push(`  指标: ${alert.metric}, 值: ${alert.value}, 阈值: ${alert.threshold}`)
      })
    }

    report.push('\n' + '='.repeat(80))
    return report.join('\n')
  }

  /**
   * 清理旧数据
   */
  cleanup(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff)
  }

  /**
   * 重置监控器
   */
  reset(): void {
    this.metrics = []
    this.alerts = []
  }
}

/**
 * 全局性能监控实例
 */
export const globalPerformanceMonitor = new PerformanceMonitorService()

/**
 * 便捷的性能追踪装饰器
 */
export function trackPerformance(metricName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      try {
        const result = await originalMethod.apply(this, args)
        const duration = performance.now() - startTime

        globalPerformanceMonitor.recordMetric({
          name: metricName || `${target.constructor.name}.${propertyKey}`,
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime
        globalPerformanceMonitor.recordMetric({
          name: `${metricName || propertyKey}.error`,
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
        })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 性能追踪函数包装器
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  metricName: string,
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now()
    try {
      const result = await fn(...args)
      const duration = performance.now() - startTime

      globalPerformanceMonitor.recordMetric({
        name: metricName,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      })

      return result
    } catch (error) {
      const duration = performance.now() - startTime
      globalPerformanceMonitor.recordMetric({
        name: `${metricName}.error`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      })
      throw error
    }
  }) as T
}



