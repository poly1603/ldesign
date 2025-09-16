/**
 * 性能监控器
 * 
 * 负责监控构建过程的性能指标
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import type {
  PerformanceMetrics,
  PerformanceReport,
  MemoryUsage,
  CacheStats,
  FileProcessingStats,
  SystemResourceUsage
} from '../types/performance'
import { Logger } from '../utils/logger'

/**
 * 性能监控器选项
 */
export interface PerformanceMonitorOptions {
  logger?: Logger
  enabled?: boolean
  sampleInterval?: number
  maxSamples?: number
}

/**
 * 构建会话
 */
interface BuildSession {
  buildId: string
  startTime: number
  endTime?: number
  memorySnapshots: MemoryUsage[]
  fileStats: FileProcessingStats
  errors: Error[]
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor extends EventEmitter {
  private logger: Logger
  private options: PerformanceMonitorOptions
  private sessions: Map<string, BuildSession> = new Map()
  private globalStats: {
    totalBuilds: number
    totalTime: number
    averageTime: number
    cacheStats: CacheStats
  }

  constructor(options: PerformanceMonitorOptions = {}) {
    super()

    this.options = {
      enabled: true,
      sampleInterval: 1000,
      maxSamples: 100,
      ...options
    }

    this.logger = options.logger || new Logger()

    this.globalStats = {
      totalBuilds: 0,
      totalTime: 0,
      averageTime: 0,
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        entries: 0,
        timeSaved: 0
      }
    }
  }

  /**
   * 开始会话监控（别名）
   */
  startSession(sessionId: string): string {
    this.startBuild(sessionId)
    return sessionId
  }

  /**
   * 结束会话监控（别名）
   */
  endSession(sessionId: string): PerformanceMetrics & { duration: number, cpuUsage?: number } {
    const metrics = this.endBuild(sessionId)
    return {
      ...metrics,
      duration: metrics.buildTime,
      cpuUsage: metrics.systemResources.cpuUsage
    }
  }

  /**
   * 获取全局统计信息
   */
  getGlobalStats() {
    return this.globalStats
  }

  /**
   * 开始构建监控
   */
  startBuild(buildId: string): void {
    if (!this.options.enabled) return

    const session: BuildSession = {
      buildId,
      startTime: Date.now(),
      memorySnapshots: [],
      fileStats: {
        totalFiles: 0,
        filesByType: {},
        averageProcessingTime: 0,
        slowestFiles: [],
        processingRate: 0
      },
      errors: []
    }

    this.sessions.set(buildId, session)

    // 开始内存监控
    this.startMemoryMonitoring(buildId)

    this.logger.debug(`开始监控构建: ${buildId}`)
    this.emit('build:start', { buildId, timestamp: session.startTime })
  }

  /**
   * 结束构建监控
   */
  endBuild(buildId: string): PerformanceMetrics {
    if (!this.options.enabled) {
      return this.createEmptyMetrics()
    }

    const session = this.sessions.get(buildId)
    if (!session) {
      this.logger.warn(`构建会话不存在: ${buildId}`)
      return this.createEmptyMetrics()
    }

    session.endTime = Date.now()
    const buildTime = session.endTime - session.startTime

    // 更新全局统计
    this.globalStats.totalBuilds++
    this.globalStats.totalTime += buildTime
    this.globalStats.averageTime = this.globalStats.totalTime / this.globalStats.totalBuilds

    // 生成性能指标
    const metrics = this.generateMetrics(session, buildTime)

    this.logger.info(`构建监控完成: ${buildId} (${buildTime}ms)`)
    this.emit('build:end', { buildId, metrics, timestamp: session.endTime })

    // 清理会话
    this.sessions.delete(buildId)

    return metrics
  }

  /**
   * 记录错误
   */
  recordError(buildId: string, error: Error): void {
    const session = this.sessions.get(buildId)
    if (session) {
      session.errors.push(error)
    }
  }

  /**
   * 记录文件处理
   */
  recordFileProcessing(buildId: string, filePath: string, processingTime: number): void {
    const session = this.sessions.get(buildId)
    if (!session) return

    session.fileStats.totalFiles++

    // 按类型统计
    const ext = this.getFileExtension(filePath)
    session.fileStats.filesByType[ext] = (session.fileStats.filesByType[ext] || 0) + 1

    // 记录慢文件
    if (session.fileStats.slowestFiles.length < 10) {
      session.fileStats.slowestFiles.push({
        path: filePath,
        processingTime,
        size: 0, // TODO: 获取文件大小
        phases: []
      })
    } else {
      // 替换最快的文件
      const slowest = session.fileStats.slowestFiles
      const minIndex = slowest.findIndex(f => f.processingTime === Math.min(...slowest.map(f => f.processingTime)))
      if (processingTime > slowest[minIndex].processingTime) {
        slowest[minIndex] = {
          path: filePath,
          processingTime,
          size: 0,
          phases: []
        }
      }
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(saved: boolean, timeSaved: number = 0): void {
    if (saved) {
      this.globalStats.cacheStats.hits++
      this.globalStats.cacheStats.timeSaved += timeSaved
    } else {
      this.globalStats.cacheStats.misses++
    }

    const total = this.globalStats.cacheStats.hits + this.globalStats.cacheStats.misses
    this.globalStats.cacheStats.hitRate = this.globalStats.cacheStats.hits / total
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    const timestamp = Date.now()

    return {
      timestamp,
      buildSummary: {
        bundler: 'rollup', // TODO: 从配置获取
        mode: 'production',
        entryCount: 1,
        outputCount: 1,
        totalSize: 0,
        buildTime: this.globalStats.averageTime
      },
      metrics: this.createEmptyMetrics(), // TODO: 实现
      recommendations: [],
      analysis: {
        bottlenecks: [],
        resourceAnalysis: {
          cpuEfficiency: 0.8,
          memoryEfficiency: 0.7,
          ioEfficiency: 0.9,
          wastePoints: []
        },
        cacheAnalysis: {
          overallEfficiency: this.globalStats.cacheStats.hitRate,
          strategyRecommendations: [],
          configOptimizations: {}
        },
        parallelizationOpportunities: []
      }
    }
  }

  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(buildId: string): void {
    const session = this.sessions.get(buildId)
    if (!session) return

    const interval = setInterval(() => {
      if (!this.sessions.has(buildId)) {
        clearInterval(interval)
        return
      }

      const memoryUsage = this.getCurrentMemoryUsage()
      session.memorySnapshots.push(memoryUsage)

      // 限制快照数量
      if (session.memorySnapshots.length > (this.options.maxSamples || 100)) {
        session.memorySnapshots.shift()
      }
    }, this.options.sampleInterval)
  }

  /**
   * 获取当前内存使用情况
   */
  private getCurrentMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage()

    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      peak: Math.max(usage.heapUsed, usage.heapTotal),
      trend: []
    }
  }

  /**
   * 生成性能指标
   */
  private generateMetrics(session: BuildSession, buildTime: number): PerformanceMetrics {
    const memoryUsage = this.calculateMemoryUsage(session.memorySnapshots)

    return {
      buildTime,
      memoryUsage,
      cacheStats: this.globalStats.cacheStats,
      fileStats: session.fileStats,
      pluginPerformance: [], // TODO: 实现插件性能统计
      systemResources: this.getSystemResources()
    }
  }

  /**
   * 计算内存使用情况
   */
  private calculateMemoryUsage(snapshots: MemoryUsage[]): MemoryUsage {
    if (snapshots.length === 0) {
      return this.getCurrentMemoryUsage()
    }

    const latest = snapshots[snapshots.length - 1]
    const peak = Math.max(...snapshots.map(s => s.heapUsed))

    return {
      ...latest,
      peak,
      trend: snapshots.map((snapshot, index) => ({
        timestamp: Date.now() - (snapshots.length - index) * (this.options.sampleInterval || 1000),
        usage: snapshot.heapUsed,
        phase: 'building'
      }))
    }
  }

  /**
   * 获取系统资源使用情况
   */
  private getSystemResources(): SystemResourceUsage {
    // TODO: 实现系统资源监控
    return {
      cpuUsage: 0,
      availableMemory: 0,
      diskUsage: {
        total: 0,
        used: 0,
        available: 0,
        usagePercent: 0
      }
    }
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filePath: string): string {
    const ext = filePath.split('.').pop()
    return ext ? `.${ext}` : 'unknown'
  }

  /**
   * 创建空的性能指标
   */
  private createEmptyMetrics(): PerformanceMetrics {
    return {
      buildTime: 0,
      memoryUsage: this.getCurrentMemoryUsage(),
      cacheStats: this.globalStats.cacheStats,
      fileStats: {
        totalFiles: 0,
        filesByType: {},
        averageProcessingTime: 0,
        slowestFiles: [],
        processingRate: 0
      },
      pluginPerformance: [],
      systemResources: this.getSystemResources()
    }
  }
}
