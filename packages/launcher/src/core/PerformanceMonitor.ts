/**
 * 性能监控和分析系统
 *
 * 提供构建性能分析、运行时监控、性能优化建议等功能
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import { performance, PerformanceObserver } from 'perf_hooks'
import { Logger } from '../utils/logger'
import { FileSystem } from '../utils/file-system'
import type {
  PerformanceMetrics,
  PerformanceReport,
  PerformanceScore,
  PerformanceRecommendation,
  PerformanceMonitorConfig,
  PerformanceEventType,
  PluginPerformanceStats
} from '../types/performance'

// 为了向后兼容，重新导出类型
export type {
  PerformanceMetrics,
  PerformanceReport,
  PerformanceScore,
  PerformanceRecommendation,
  PerformanceMonitorConfig
} from '../types/performance'

/**
 * 性能监控配置（内部使用）
 */
interface InternalMonitorConfig extends PerformanceMonitorConfig {
  /** 报告输出路径 */
  reportPath: string
  /** 采样间隔 */
  sampleInterval: number
  /** 内存警告阈值 */
  memoryWarningThreshold: number
}

/**
 * 旧版本兼容接口
 * @deprecated 使用 PerformanceReport 替代
 */
export interface PerformanceReportLegacy {
  /** 报告时间戳 */
  timestamp: number
  /** 项目信息 */
  projectInfo: {
    name: string
    size: number
    fileCount: number
  }
  /** 性能指标 */
  metrics: PerformanceMetrics
  /** 性能评分 */
  score: {
    overall: number
    buildSpeed: number
    bundleSize: number
    memoryUsage: number
  }
  /** 优化建议 */
  recommendations: PerformanceRecommendation[]
}

/**
 * 性能监控器
 */
export class PerformanceMonitor extends EventEmitter {
  private logger: Logger
  private metrics: Partial<PerformanceMetrics>
  private timers = new Map<string, number>()
  private observer: PerformanceObserver | null = null
  private isMonitoring = false

  constructor(logger?: Logger) {
    super()
    this.logger = logger || new Logger('PerformanceMonitor')
    this.metrics = {
      phases: {},
      fileSystemStats: {
        reads: 0,
        writes: 0,
        totalReadTime: 0,
        totalWriteTime: 0
      },
      pluginStats: [],
      hmrStats: {
        updateCount: 0,
        averageUpdateTime: 0,
        totalUpdateTime: 0
      }
    }
    this.setupPerformanceObserver()
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          this.processPerformanceEntry(entry)
        }
      })

      try {
        this.observer.observe({ entryTypes: ['measure', 'resource'] })
      } catch (error) {
        this.logger.warn('无法设置性能观察器', error)
      }
    }
  }

  /**
   * 处理性能条目
   */
  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'measure':
        this.metrics.phases![entry.name] = entry.duration
        break
      case 'resource':
        // 处理资源加载性能
        break
    }
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.metrics.buildStartTime = performance.now()

    this.logger.info('开始性能监控')
    this.emit('monitoring:start')
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    this.metrics.buildEndTime = performance.now()
    this.metrics.totalBuildTime = this.metrics.buildEndTime - (this.metrics.buildStartTime || 0)

    // 收集内存使用情况
    this.collectMemoryUsage()

    this.logger.info('性能监控结束', {
      totalTime: `${this.metrics.totalBuildTime?.toFixed(2)}ms`
    })
    
    this.emit('monitoring:stop', this.metrics)
  }

  /**
   * 开始计时器
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
    performance.mark(`${name}:start`)
  }

  /**
   * 结束计时器
   */
  endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      this.logger.warn(`计时器 ${name} 未启动`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    performance.mark(`${name}:end`)
    performance.measure(name, `${name}:start`, `${name}:end`)

    this.timers.delete(name)
    this.metrics.phases![name] = duration

    return duration
  }

  /**
   * 记录文件系统操作
   */
  recordFileOperation(type: 'read' | 'write', duration: number): void {
    const stats = this.metrics.fileSystemStats!
    
    if (type === 'read') {
      stats.reads++
      stats.totalReadTime += duration
    } else {
      stats.writes++
      stats.totalWriteTime += duration
    }
  }

  /**
   * 记录插件性能
   */
  recordPluginPerformance(name: string, phase: string, duration: number): void {
    let pluginStat = this.metrics.pluginStats!.find(p => p.name === name)
    
    if (!pluginStat) {
      pluginStat = {
        name,
        loadTime: 0,
        transformTime: 0,
        generateTime: 0
      }
      this.metrics.pluginStats!.push(pluginStat)
    }

    switch (phase) {
      case 'load':
        pluginStat.loadTime += duration
        break
      case 'transform':
        pluginStat.transformTime += duration
        break
      case 'generate':
        pluginStat.generateTime += duration
        break
    }
  }

  /**
   * 记录热更新
   */
  recordHmrUpdate(duration: number): void {
    const hmrStats = this.metrics.hmrStats!
    hmrStats.updateCount++
    hmrStats.totalUpdateTime += duration
    hmrStats.averageUpdateTime = hmrStats.totalUpdateTime / hmrStats.updateCount
  }

  /**
   * 设置缓存命中率
   */
  setCacheHitRate(rate: number): void {
    this.metrics.cacheHitRate = rate
  }

  /**
   * 收集内存使用情况
   */
  private collectMemoryUsage(): void {
    const memUsage = process.memoryUsage()
    this.metrics.memoryUsage = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  /**
   * 生成性能报告
   */
  async generateReport(projectInfo: {
    name: string
    size: number
    fileCount: number
  }): Promise<PerformanceReport> {
    const metrics = this.getMetrics() as PerformanceMetrics
    const score = this.calculatePerformanceScore(metrics)
    const recommendations = this.generateRecommendations(metrics, score)

    const report: PerformanceReport = {
      timestamp: Date.now(),
      projectInfo,
      metrics,
      score,
      recommendations
    }

    this.emit('report:generated', report)
    return report
  }

  /**
   * 计算性能评分
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): PerformanceScore {
    const buildSpeedScore = this.calculateBuildSpeedScore(metrics.totalBuildTime || 0)
    const bundleSizeScore = 85 // 简化计算
    const memoryUsageScore = this.calculateMemoryScore(metrics.memoryUsage)

    const overallScore = Math.round((buildSpeedScore + bundleSizeScore + memoryUsageScore) / 3)

    return {
      overall: overallScore,
      buildSpeed: buildSpeedScore,
      bundleSize: bundleSizeScore,
      memoryUsage: memoryUsageScore
    }
  }

  /**
   * 计算构建速度评分
   */
  private calculateBuildSpeedScore(buildTime: number): number {
    if (buildTime < 1000) return 100
    if (buildTime < 3000) return 90
    if (buildTime < 5000) return 80
    if (buildTime < 10000) return 70
    if (buildTime < 15000) return 60
    return 50
  }

  /**
   * 计算内存使用评分
   */
  private calculateMemoryScore(memoryUsage: PerformanceMetrics['memoryUsage']): number {
    if (!memoryUsage) return 100 // 如果没有内存数据，给满分

    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024

    if (heapUsedMB < 100) return 100
    if (heapUsedMB < 200) return 90
    if (heapUsedMB < 300) return 80
    if (heapUsedMB < 500) return 70
    if (heapUsedMB < 800) return 60
    return 50
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    metrics: PerformanceMetrics,
    score: PerformanceScore
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = []

    // 构建速度建议
    if (score.buildSpeed < 70 && metrics.totalBuildTime) {
      recommendations.push({
        type: 'warning',
        category: 'build-speed',
        title: '构建速度较慢',
        description: `构建时间 ${(metrics.totalBuildTime / 1000).toFixed(1)}s 超出建议值`,
        solution: '考虑启用增量构建、优化依赖预构建配置、使用更快的转译工具（如 esbuild）'
      })
    }

    // 内存使用建议
    if (score.memoryUsage < 70 && metrics.memoryUsage) {
      const heapUsedMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)
      recommendations.push({
        type: 'warning',
        category: 'memory',
        title: '内存使用过高',
        description: `堆内存使用 ${heapUsedMB}MB 过高`,
        solution: '检查是否有内存泄漏、减少同时处理的文件数量、增加 Node.js 内存限制'
      })
    }

    // 缓存建议
    if (metrics.cacheHitRate !== undefined && metrics.cacheHitRate < 0.8) {
      recommendations.push({
        type: 'info',
        category: 'cache',
        title: '缓存命中率较低',
        description: `缓存命中率 ${(metrics.cacheHitRate * 100).toFixed(1)}% 可以提升`,
        solution: '检查缓存配置、确保依赖版本稳定、避免频繁清理缓存'
      })
    }

    // 插件性能建议
    if (metrics.pluginStats && metrics.pluginStats.length > 0) {
      const slowPlugins = metrics.pluginStats.filter(p =>
        (p.loadTime + p.transformTime + p.generateTime) > 1000
      )

      if (slowPlugins.length > 0) {
        recommendations.push({
          type: 'warning',
          category: 'plugins',
          title: '插件性能问题',
          description: `发现 ${slowPlugins.length} 个较慢的插件`,
          solution: `检查插件配置和版本，考虑替代方案：${slowPlugins.map(p => p.name).join(', ')}`
        })
      }
    }

    // 热更新建议
    if (metrics.hmrStats && metrics.hmrStats.averageUpdateTime > 500) {
      recommendations.push({
        type: 'info',
        category: 'dependencies',
        title: '热更新速度可优化',
        description: `平均热更新时间 ${metrics.hmrStats.averageUpdateTime.toFixed(0)}ms`,
        solution: '减少热更新范围、优化模块依赖关系、考虑使用更细粒度的更新策略'
      })
    }

    return recommendations
  }

  /**
   * 保存性能报告
   */
  async saveReport(report: PerformanceReport, filePath?: string): Promise<string> {
    const defaultPath = filePath || `performance-report-${Date.now()}.json`
    
    try {
      await FileSystem.writeFile(defaultPath, JSON.stringify(report, null, 2))
      this.logger.success(`性能报告已保存: ${defaultPath}`)
      return defaultPath
    } catch (error) {
      this.logger.error('保存性能报告失败', error)
      throw error
    }
  }

  /**
   * 打印性能摘要
   */
  printSummary(report: PerformanceReport): void {
    const { metrics, score, recommendations } = report

    
    )

    
    if (metrics.totalBuildTime) {
      .toFixed(2)}s`)
    }

    if (metrics.phases && Object.keys(metrics.phases).length > 0) {
      
      Object.entries(metrics.phases)
        .filter(([, time]) => time !== undefined)
        .sort(([,a], [,b]) => (b || 0) - (a || 0))
        .slice(0, 5)
        .forEach(([phase, time]) => {
          if (time) {
            .toFixed(2)}s`)
          }
        })
    }

    if (metrics.memoryUsage) {
      
      const heapUsedMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024)
      
      if (metrics.memoryUsage.rss) {
        }MB`)
      }
    }

    
    
    
    
    

    if (recommendations.length > 0) {
      
      recommendations.forEach((rec, index) => {
        const icon = rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : 'ℹ️'
        
        
        
      })
    }

    
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.isMonitoring = false
    this.observer?.disconnect()
    this.removeAllListeners()
    this.logger.info('性能监控器已销毁')
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 便捷函数
export function startPerformanceMonitoring(): void {
  performanceMonitor.startMonitoring()
}

export function stopPerformanceMonitoring(): void {
  performanceMonitor.stopMonitoring()
}

export function measurePerformance<T>(name: string, fn: () => T): T {
  performanceMonitor.startTimer(name)
  try {
    return fn()
  } finally {
    performanceMonitor.endTimer(name)
  }
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  performanceMonitor.startTimer(name)
  try {
    return await fn()
  } finally {
    performanceMonitor.endTimer(name)
  }
}
