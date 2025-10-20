/**
 * 性能分析工具 (Performance Profiler)
 *
 * 通用的性能分析器，用于任意操作的性能监控和瓶颈识别
 *
 * **与 PerformanceMonitor 的区别：**
 * - PerformanceProfiler（本模块）：通用性能分析工具，可用于任何操作的性能测量
 * - PerformanceMonitor（core/performance-monitor.ts）：专门用于缓存操作的性能监控
 *
 * **使用场景：**
 * - 需要分析非缓存操作的性能时使用 PerformanceProfiler
 * - 需要监控缓存操作性能时使用 PerformanceMonitor
 * - 需要识别性能瓶颈和生成详细报告时使用 PerformanceProfiler
 *
 * **主要功能：**
 * - 详细的性能指标收集（P50/P95/P99 延迟）
 * - 性能瓶颈自动识别
 * - 格式化的性能报告生成
 * - 支持自动定期报告
 */

/**
 * 性能度量记录
 */
export interface PerformanceMetric {
  /** 操作名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 持续时间（毫秒） */
  duration?: number
  /** 调用次数 */
  count: number
  /** 标签 */
  tags?: Record<string, string>
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  /** 操作名称 */
  name: string
  /** 总调用次数 */
  totalCalls: number
  /** 总耗时 */
  totalDuration: number
  /** 平均耗时 */
  avgDuration: number
  /** 最小耗时 */
  minDuration: number
  /** 最大耗时 */
  maxDuration: number
  /** P50 延迟 */
  p50: number
  /** P95 延迟 */
  p95: number
  /** P99 延迟 */
  p99: number
  /** 每秒操作数 */
  opsPerSecond: number
}

/**
 * 性能分析器配置
 */
export interface ProfilerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大记录数 */
  maxRecords?: number
  /** 是否自动报告 */
  autoReport?: boolean
  /** 报告间隔（毫秒） */
  reportInterval?: number
  /** 是否记录详细信息 */
  verbose?: boolean
}

/**
 * 性能分析器类
 * 
 * @example
 * ```typescript
 * const profiler = new PerformanceProfiler({ enabled: true })
 * 
 * // 记录操作
 * const metric = profiler.start('cacheGet')
 * // ... 执行操作 ...
 * profiler.end(metric)
 * 
 * // 生成报告
 * )
 * ```
 */
export class PerformanceProfiler {
  /** 配置 */
  private config: Required<ProfilerConfig>
  /** 指标记录 */
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  /** 活动指标 */
  private activeMetrics: Set<PerformanceMetric> = new Set()
  /** 报告定时器 */
  private reportTimer?: NodeJS.Timeout

  constructor(config: ProfilerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxRecords: config.maxRecords ?? 1000,
      autoReport: config.autoReport ?? false,
      reportInterval: config.reportInterval ?? 60000,
      verbose: config.verbose ?? false,
    }

    if (this.config?.autoReport) {
      this.startAutoReport()
    }
  }

  /**
   * 开始记录操作
   * 
   * @param name - 操作名称
   * @param tags - 可选标签
   * @returns 性能度量对象
   */
  start(name: string, tags?: Record<string, string>): PerformanceMetric {
    if (!this.config?.enabled) {
      return { name, startTime: 0, count: 0 }
    }

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      count: 1,
      tags,
    }

    this.activeMetrics.add(metric)
    return metric
  }

  /**
   * 结束记录操作
   * 
   * @param metric - 性能度量对象
   */
  end(metric: PerformanceMetric): void {
    if (!this.config?.enabled) {
      return
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    this.activeMetrics.delete(metric)
    this.recordMetric(metric)
  }

  /**
   * 记录度量
   * 
   * @param metric - 性能度量
   */
  private recordMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }

    const records = this.metrics.get(metric.name)!
    records.push(metric)

    // 限制记录数
    if (records.length > this.config?.maxRecords) {
      records.shift()
    }
  }

  /**
   * 测量异步操作
   * 
   * @param name - 操作名称
   * @param fn - 要测量的函数
   * @param tags - 可选标签
   * @returns 函数返回值
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>,
  ): Promise<T> {
    const metric = this.start(name, tags)
    try {
      return await fn()
    }
    finally {
      this.end(metric)
    }
  }

  /**
   * 测量同步操作
   * 
   * @param name - 操作名称
   * @param fn - 要测量的函数
   * @param tags - 可选标签
   * @returns 函数返回值
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>,
  ): T {
    const metric = this.start(name, tags)
    try {
      return fn()
    }
    finally {
      this.end(metric)
    }
  }

  /**
   * 获取操作统计
   * 
   * @param name - 操作名称
   * @returns 统计信息，如果没有记录则返回 null
   */
  getStats(name: string): PerformanceStats | null {
    const records = this.metrics.get(name)
    if (!records || records.length === 0) {
      return null
    }

    const durations = records
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
      .sort((a, b) => a - b)

    if (durations.length === 0) {
      return null
    }

    const totalDuration = durations.reduce((sum, d) => sum + d, 0)
    const avgDuration = totalDuration / durations.length
    const minDuration = durations[0]
    const maxDuration = durations[durations.length - 1]

    // 计算百分位数
    const p50Index = Math.floor(durations.length * 0.5)
    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    const p50 = durations[p50Index] ?? 0
    const p95 = durations[p95Index] ?? 0
    const p99 = durations[p99Index] ?? 0

    // 计算 ops/sec
    const firstRecord = records[0]
    const lastRecord = records[records.length - 1]
    const timeSpan = (lastRecord.endTime ?? lastRecord.startTime) - firstRecord.startTime
    const opsPerSecond = timeSpan > 0 ? (records.length / timeSpan) * 1000 : 0

    return {
      name,
      totalCalls: records.length,
      totalDuration,
      avgDuration,
      minDuration,
      maxDuration,
      p50,
      p95,
      p99,
      opsPerSecond,
    }
  }

  /**
   * 获取所有统计
   */
  getAllStats(): PerformanceStats[] {
    const stats: PerformanceStats[] = []

    for (const name of this.metrics.keys()) {
      const stat = this.getStats(name)
      if (stat) {
        stats.push(stat)
      }
    }

    // 按总耗时排序
    return stats.sort((a, b) => b.totalDuration - a.totalDuration)
  }

  /**
   * 生成性能报告
   * 
   * @param topN - 显示前 N 个最慢的操作
   * @returns 报告字符串
   */
  generateReport(topN?: number): string {
    const allStats = this.getAllStats()
    const stats = topN ? allStats.slice(0, topN) : allStats

    if (stats.length === 0) {
      return '没有性能数据'
    }

    const lines: string[] = [
      '='.repeat(120),
      '性能分析报告',
      '='.repeat(120),
      '',
    ]

    // 摘要
    const totalCalls = stats.reduce((sum, s) => sum + s.totalCalls, 0)
    const totalDuration = stats.reduce((sum, s) => sum + s.totalDuration, 0)
    const avgOps = stats.reduce((sum, s) => sum + s.opsPerSecond, 0) / stats.length

    lines.push('摘要:')
    lines.push(`  总操作数: ${totalCalls.toLocaleString()}`)
    lines.push(`  总耗时: ${totalDuration.toFixed(2)} ms`)
    lines.push(`  平均吞吐量: ${avgOps.toFixed(0)} ops/sec`)
    lines.push(`  活动指标: ${this.activeMetrics.size}`)
    lines.push('')

    // 详细统计
    lines.push('详细统计:')
    lines.push('')

    for (const stat of stats) {
      lines.push(`操作: ${stat.name}`)
      lines.push(`  调用次数: ${stat.totalCalls.toLocaleString()}`)
      lines.push(`  总耗时: ${stat.totalDuration.toFixed(2)} ms`)
      lines.push(`  平均耗时: ${stat.avgDuration.toFixed(3)} ms`)
      lines.push(`  延迟范围: ${stat.minDuration.toFixed(3)} - ${stat.maxDuration.toFixed(3)} ms`)
      lines.push(`  P50: ${stat.p50.toFixed(3)} ms`)
      lines.push(`  P95: ${stat.p95.toFixed(3)} ms`)
      lines.push(`  P99: ${stat.p99.toFixed(3)} ms`)
      lines.push(`  吞吐量: ${stat.opsPerSecond.toFixed(0)} ops/sec`)
      lines.push('')
    }

    // 瓶颈识别
    const bottlenecks = this.identifyBottlenecks(stats)
    if (bottlenecks.length > 0) {
      lines.push('识别的性能瓶颈:')
      for (const bottleneck of bottlenecks) {
        lines.push(`  ⚠️  ${bottleneck}`)
      }
      lines.push('')
    }

    lines.push('='.repeat(120))

    return lines.join('\n')
  }

  /**
   * 识别性能瓶颈
   * 
   * @param stats - 统计信息数组
   * @returns 瓶颈描述数组
   */
  private identifyBottlenecks(stats: PerformanceStats[]): string[] {
    const bottlenecks: string[] = []

    for (const stat of stats) {
      // 高延迟操作
      if (stat.p99 > 100) {
        bottlenecks.push(
          `${stat.name}: P99 延迟过高 (${stat.p99.toFixed(2)} ms)`,
        )
      }

      // 低吞吐量操作
      if (stat.opsPerSecond < 100 && stat.totalCalls > 10) {
        bottlenecks.push(
          `${stat.name}: 吞吐量过低 (${stat.opsPerSecond.toFixed(0)} ops/sec)`,
        )
      }

      // 耗时占比过高
      const totalDuration = stats.reduce((sum, s) => sum + s.totalDuration, 0)
      const percentage = (stat.totalDuration / totalDuration) * 100
      if (percentage > 30) {
        bottlenecks.push(
          `${stat.name}: 耗时占比过高 (${percentage.toFixed(1)}%)`,
        )
      }

      // 延迟波动大
      const variance = stat.maxDuration - stat.minDuration
      if (variance > stat.avgDuration * 10) {
        bottlenecks.push(
          `${stat.name}: 性能不稳定 (延迟波动 ${variance.toFixed(2)} ms)`,
        )
      }
    }

    return bottlenecks
  }

  /**
   * 清除所有记录
   */
  clear(): void {
    this.metrics.clear()
    this.activeMetrics.clear()
  }

  /**
   * 导出数据为 JSON
   */
  exportData(): string {
    const data: Record<string, PerformanceMetric[]> = {}

    for (const [name, metrics] of this.metrics) {
      data[name] = metrics
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 启动自动报告
   */
  private startAutoReport(): void {
    if (this.reportTimer) {
      return
    }

    this.reportTimer = setInterval(() => {
      if (this.config?.verbose) {
        console.info(this.generateReport())
      }
    }, this.config?.reportInterval)
  }

  /**
   * 停止自动报告
   */
  stopAutoReport(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ProfilerConfig>): void {
    Object.assign(this.config, config)

    if (this.config?.autoReport && !this.reportTimer) {
      this.startAutoReport()
    }
    else if (!this.config?.autoReport && this.reportTimer) {
      this.stopAutoReport()
    }
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    this.stopAutoReport()
    this.clear()
  }
}

/**
 * 创建性能分析器
 * 
 * @param config - 配置选项
 * @returns 性能分析器实例
 */
export function createProfiler(config?: ProfilerConfig): PerformanceProfiler {
  return new PerformanceProfiler(config)
}

/**
 * 全局性能分析器实例
 */
export const globalProfiler = createProfiler({ enabled: false })

/**
 * 启用全局性能分析
 */
export function enableProfiling(): void {
  globalProfiler.updateConfig({ enabled: true })
}

/**
 * 禁用全局性能分析
 */
export function disableProfiling(): void {
  globalProfiler.updateConfig({ enabled: false })
}

/**
 * 生成全局性能报告
 */
export function generateGlobalReport(): string {
  return globalProfiler.generateReport()
}
