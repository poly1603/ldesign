/**
 * 构建性能分析器
 * 
 * 提供详细的构建性能分析、瓶颈识别和优化建议
 */

import { Logger } from './logger'
import { PerformanceMonitor } from '../core/PerformanceMonitor'

/**
 * 构建阶段
 */
export type BuildPhase =
  | 'initialization'
  | 'dependency-resolution'
  | 'file-scanning'
  | 'compilation'
  | 'bundling'
  | 'optimization'
  | 'output-generation'
  | 'validation'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  duration: number
  memoryUsage: {
    peak: number
    average: number
    final: number
  }
  cpuUsage?: {
    user: number
    system: number
  }
  fileOperations: {
    reads: number
    writes: number
    totalSize: number
  }
  cacheHits: number
  cacheMisses: number
}

/**
 * 阶段性能数据
 */
export interface PhasePerformance {
  phase: BuildPhase
  startTime: number
  endTime: number
  duration: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    peak: number
    average: number
    final: number
  }
  metrics: PerformanceMetrics
  subPhases?: PhasePerformance[]
  warnings: string[]
  bottlenecks: string[]
}

/**
 * 性能瓶颈
 */
export interface PerformanceBottleneck {
  type: 'memory' | 'cpu' | 'io' | 'cache' | 'dependency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: string
  suggestion: string
  phase: BuildPhase
  metrics: {
    value: number
    threshold: number
    unit: string
  }
}

/**
 * 性能分析结果
 */
export interface BuildPerformanceAnalysis {
  totalDuration: number
  phases: PhasePerformance[]
  bottlenecks: {
    slowestPhase: string | null
    slowestDuration: number
    memoryPeak: number
    issues: string[]
  }
  recommendations: string[]
  comparison?: {
    previousBuild?: BuildPerformanceAnalysis
    baseline?: BuildPerformanceAnalysis
    improvement: number
  }
  summary: {
    averagePhaseTime: number
    memoryEfficiency: number
    cacheHitRate: number
    parallelizationOpportunities: string[]
  }
  detailedMetrics?: {
    cpuUsage: { user: number; system: number }
    memoryPeak: number
    diskIO: { reads: number; writes: number }
    networkRequests: number
  }
}

/**
 * 分析选项
 */
export interface AnalysisOptions {
  /** 是否启用详细分析 */
  detailed?: boolean
  /** 是否包含详细指标 */
  includeDetailedMetrics?: boolean
  /** 是否包含建议 */
  includeRecommendations?: boolean
  /** 性能阈值配置 */
  thresholds?: {
    slowPhase: number // 毫秒
    highMemory: number // 字节
    lowCacheHit: number // 百分比
  }
  /** 是否与历史数据比较 */
  compareWithHistory?: boolean
  /** 历史数据保留数量 */
  historyLimit?: number
}

/**
 * 构建性能分析器
 */
export class BuildPerformanceAnalyzer {
  private logger: Logger
  private performanceMonitor: PerformanceMonitor
  private currentAnalysis: Partial<BuildPerformanceAnalysis> = {}
  private phaseStack: PhasePerformance[] = []
  private history: BuildPerformanceAnalysis[] = []

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ level: 'info' })
    this.performanceMonitor = new PerformanceMonitor()
  }

  /**
   * 开始性能分析
   */
  startAnalysis(): void {
    this.currentAnalysis = {
      phases: [],
      bottlenecks: {
        slowestPhase: null,
        slowestDuration: 0,
        memoryPeak: 0,
        issues: []
      },
      recommendations: []
    }
    this.phaseStack = []
    this.logger.debug('开始构建性能分析')
  }

  /**
   * 开始阶段
   */
  startPhase(phase: BuildPhase): void {
    this.performanceMonitor.startSession(`phase-${phase}`)

    const memUsage = process.memoryUsage()
    const phaseData: PhasePerformance = {
      phase,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        peak: memUsage.heapUsed,
        average: memUsage.heapUsed,
        final: memUsage.heapUsed
      },
      metrics: {
        duration: 0,
        memoryUsage: { peak: memUsage.heapUsed, average: memUsage.heapUsed, final: memUsage.heapUsed },
        fileOperations: { reads: 0, writes: 0, totalSize: 0 },
        cacheHits: 0,
        cacheMisses: 0
      },
      warnings: [],
      bottlenecks: []
    }

    this.phaseStack.push(phaseData)
    this.logger.debug(`开始阶段: ${phase}`)
  }

  /**
   * 结束阶段
   */
  endPhase(phase: BuildPhase): PhasePerformance | null {
    // 查找指定阶段
    const phaseIndex = this.phaseStack.findIndex(p => p.phase === phase)

    if (phaseIndex === -1) {
      this.logger.warn(`阶段不匹配: 期望 ${phase}, 实际 ${this.phaseStack.length > 0 ? this.phaseStack[this.phaseStack.length - 1].phase : 'undefined'}`)
      this.logger.debug(`当前阶段栈: [${this.phaseStack.map(p => p.phase).join(', ')}]`)
      return null
    }

    // 移除指定阶段
    const currentPhase = this.phaseStack.splice(phaseIndex, 1)[0]
    this.logger.debug(`结束阶段 ${phase}, 剩余阶段: [${this.phaseStack.map(p => p.phase).join(', ')}]`)

    currentPhase.endTime = Date.now()
    currentPhase.duration = currentPhase.endTime - currentPhase.startTime
    currentPhase.metrics.duration = currentPhase.duration

    // 获取性能指标
    this.performanceMonitor.endSession(`phase-${phase}`)
    const memUsage = process.memoryUsage()

    // 更新内存使用信息
    currentPhase.memoryUsage = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      peak: Math.max(currentPhase.memoryUsage.peak, memUsage.heapUsed),
      average: (currentPhase.memoryUsage.heapUsed + memUsage.heapUsed) / 2,
      final: memUsage.heapUsed
    }

    currentPhase.metrics.memoryUsage = {
      peak: currentPhase.memoryUsage.peak,
      average: currentPhase.memoryUsage.average,
      final: currentPhase.memoryUsage.final
    }

    // 检测阶段瓶颈
    this.detectPhaseBottlenecks(currentPhase)

    // 添加到当前分析
    if (!this.currentAnalysis.phases) {
      this.currentAnalysis.phases = []
    }
    this.currentAnalysis.phases.push(currentPhase)

    this.logger.info(`构建监控完成: phase-${phase} (${currentPhase.metrics.duration}ms)`)
    return currentPhase
  }

  /**
   * 记录文件操作
   */
  recordFileOperation(type: 'read' | 'write', size: number): void {
    const currentPhase = this.phaseStack[this.phaseStack.length - 1]
    if (currentPhase) {
      if (type === 'read') {
        currentPhase.metrics.fileOperations.reads++
      } else {
        currentPhase.metrics.fileOperations.writes++
      }
      currentPhase.metrics.fileOperations.totalSize += size
    }
  }

  /**
   * 记录缓存操作
   */
  recordCacheOperation(hit: boolean): void {
    const currentPhase = this.phaseStack[this.phaseStack.length - 1]
    if (currentPhase) {
      if (hit) {
        currentPhase.metrics.cacheHits++
      } else {
        currentPhase.metrics.cacheMisses++
      }
    }
  }

  /**
   * 完成分析
   */
  finishAnalysis(options: AnalysisOptions = {}): BuildPerformanceAnalysis {
    if (!this.currentAnalysis.phases || this.currentAnalysis.phases.length === 0) {
      // 如果没有阶段数据，返回空的分析结果而不是抛出错误
      const analysis: BuildPerformanceAnalysis = {
        totalDuration: 0,
        phases: [],
        bottlenecks: {
          slowestPhase: null,
          slowestDuration: 0,
          memoryPeak: 0,
          issues: []
        },
        recommendations: [],
        summary: {
          averagePhaseTime: 0,
          memoryEfficiency: 100,
          cacheHitRate: 0,
          parallelizationOpportunities: []
        }
      }

      if (options.includeDetailedMetrics) {
        analysis.detailedMetrics = {
          cpuUsage: { user: 0, system: 0 },
          memoryPeak: 0,
          diskIO: { reads: 0, writes: 0 },
          networkRequests: 0
        }
      }

      return analysis
    }

    const totalDuration = this.currentAnalysis.phases.reduce(
      (sum, phase) => sum + phase.metrics.duration,
      0
    )

    // 检测全局瓶颈
    const bottlenecks = this.detectGlobalBottlenecks(this.currentAnalysis.phases, options)

    // 生成建议（如果请求）
    const recommendations = options.includeRecommendations
      ? this.generateRecommendations(this.currentAnalysis.phases, bottlenecks.issues)
      : []

    // 生成摘要
    const summary = this.generateSummary(this.currentAnalysis.phases)

    const analysis: BuildPerformanceAnalysis = {
      totalDuration,
      phases: this.currentAnalysis.phases,
      bottlenecks,
      recommendations,
      summary
    }

    // 添加详细指标（如果请求）
    if (options.includeDetailedMetrics) {
      analysis.detailedMetrics = {
        cpuUsage: { user: 0, system: 0 },
        memoryPeak: Math.max(...this.currentAnalysis.phases.map(p => p.metrics.memoryUsage?.peak || 0)),
        diskIO: {
          reads: this.currentAnalysis.phases.reduce((sum, p) => sum + p.metrics.fileOperations.reads, 0),
          writes: this.currentAnalysis.phases.reduce((sum, p) => sum + p.metrics.fileOperations.writes, 0)
        },
        networkRequests: 0
      }
    }

    // 与历史数据比较
    if (options.compareWithHistory && this.history.length > 0) {
      const previousBuild = this.history[this.history.length - 1]
      analysis.comparison = {
        previousBuild,
        improvement: ((previousBuild.totalDuration - totalDuration) / previousBuild.totalDuration) * 100
      }
    }

    // 保存到历史
    this.history.push(analysis)
    if (options.historyLimit && this.history.length > options.historyLimit) {
      this.history.shift()
    }

    this.logger.info(`构建性能分析完成，总耗时: ${totalDuration}ms`)
    return analysis
  }

  /**
   * 检测阶段瓶颈
   */
  private detectPhaseBottlenecks(phase: PhasePerformance): void {
    const thresholds = {
      slowPhase: 5000, // 5秒
      highMemory: 500 * 1024 * 1024, // 500MB
      lowCacheHit: 50 // 50%
    }

    // 检查耗时
    if (phase.metrics.duration > thresholds.slowPhase) {
      phase.bottlenecks.push(`阶段 ${phase.phase} 耗时过长: ${phase.metrics.duration}ms`)
    }

    // 检查内存使用
    if (phase.metrics.memoryUsage.peak > thresholds.highMemory) {
      phase.bottlenecks.push(`阶段 ${phase.phase} 内存使用过高: ${Math.round(phase.metrics.memoryUsage.peak / 1024 / 1024)}MB`)
    }

    // 检查缓存命中率
    const totalCacheOps = phase.metrics.cacheHits + phase.metrics.cacheMisses
    if (totalCacheOps > 0) {
      const hitRate = (phase.metrics.cacheHits / totalCacheOps) * 100
      if (hitRate < thresholds.lowCacheHit) {
        phase.bottlenecks.push(`阶段 ${phase.phase} 缓存命中率过低: ${hitRate.toFixed(1)}%`)
      }
    }
  }

  /**
   * 检测全局瓶颈
   */
  private detectGlobalBottlenecks(phases: PhasePerformance[], options: AnalysisOptions) {
    const issues: string[] = []
    const thresholds = options.thresholds || {
      slowPhase: 5000,
      highMemory: 500 * 1024 * 1024,
      lowCacheHit: 50
    }

    let slowestPhase: string | null = null
    let slowestDuration = 0
    let memoryPeak = 0

    phases.forEach(phase => {
      if (phase.duration > slowestDuration) {
        slowestDuration = phase.duration
        slowestPhase = phase.phase
      }

      const phaseMemoryPeak = phase.memoryUsage?.peak || 0
      if (phaseMemoryPeak > memoryPeak) {
        memoryPeak = phaseMemoryPeak
      }

      if (phase.duration > thresholds.slowPhase) {
        issues.push(`阶段 ${phase.phase} 耗时过长: ${phase.duration}ms`)
      }

      if (phaseMemoryPeak > thresholds.highMemory) {
        issues.push(`阶段 ${phase.phase} 内存使用过高: ${Math.round(phaseMemoryPeak / 1024 / 1024)}MB`)
      }
    })

    return {
      slowestPhase,
      slowestDuration,
      memoryPeak,
      issues
    }

    // 移除这部分代码，因为它与函数的返回类型不匹配
    // 这个函数应该只返回简单的瓶颈信息对象
  }

  /**
   * 生成建议
   */
  private generateRecommendations(phases: PhasePerformance[], issues: string[]): string[] {
    const recommendations: string[] = []

    // 基于问题生成建议
    recommendations.push(...issues)

    // 基于整体分析生成建议
    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0)
    const slowestPhase = phases.reduce((slowest, phase) =>
      phase.duration > slowest.duration ? phase : slowest
    )

    if (slowestPhase.duration > totalDuration * 0.5) {
      recommendations.push(`${slowestPhase.phase} 阶段占用了超过50%的构建时间，建议重点优化此阶段`)
      recommendations.push(this.getSuggestionForSlowPhase(slowestPhase.phase))
    }

    // 内存使用建议
    phases.forEach(phase => {
      const memoryPeak = phase.memoryUsage?.peak || 0
      const memoryThreshold = 10 * 1024 * 1024 // 10MB - 更适合前端构建工具

      if (memoryPeak > memoryThreshold) {
        recommendations.push(`${phase.phase} 阶段内存使用过高 (${Math.round(memoryPeak / 1024 / 1024)}MB)`)
        recommendations.push(this.getSuggestionForHighMemory(phase.phase))
      }
    })

    // 缓存相关建议
    const totalCacheOps = phases.reduce((sum, phase) =>
      sum + phase.metrics.cacheHits + phase.metrics.cacheMisses, 0
    )
    const totalCacheHits = phases.reduce((sum, phase) => sum + phase.metrics.cacheHits, 0)

    if (totalCacheOps > 0) {
      const overallHitRate = (totalCacheHits / totalCacheOps) * 100
      if (overallHitRate < 70) {
        recommendations.push(`整体缓存命中率为 ${overallHitRate.toFixed(1)}%，建议优化缓存策略`)
      }
    }

    return [...new Set(recommendations)] // 去重
  }

  /**
   * 生成摘要
   */
  private generateSummary(phases: PhasePerformance[]) {
    if (phases.length === 0) {
      return {
        averagePhaseTime: 0,
        memoryEfficiency: 100,
        cacheHitRate: 0,
        parallelizationOpportunities: []
      }
    }

    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0)
    const averagePhaseTime = totalDuration / phases.length

    const totalCacheOps = phases.reduce((sum, phase) =>
      sum + phase.metrics.cacheHits + phase.metrics.cacheMisses, 0
    )
    const totalCacheHits = phases.reduce((sum, phase) => sum + phase.metrics.cacheHits, 0)
    const cacheHitRate = totalCacheOps > 0 ? (totalCacheHits / totalCacheOps) * 100 : 0

    // 计算内存效率（优化计算逻辑）
    const memoryUsages = phases.map(phase => phase.metrics.memoryUsage?.peak || 0).filter(m => m > 0)
    const memoryEfficiency = this.calculateMemoryEfficiency(memoryUsages)

    // 识别并行化机会
    const parallelizationOpportunities: string[] = []
    const longPhases = phases.filter(phase => phase.duration > averagePhaseTime * 1.5)
    if (longPhases.length > 0) {
      parallelizationOpportunities.push(`可以并行化的阶段: ${longPhases.map(p => p.phase).join(', ')}`)
    }

    return {
      averagePhaseTime,
      memoryEfficiency,
      cacheHitRate,
      parallelizationOpportunities
    }
  }

  /**
   * 获取慢阶段的建议
   */
  private getSuggestionForSlowPhase(phase: BuildPhase): string {
    const suggestions = {
      'initialization': '考虑减少初始化时的配置验证和插件加载',
      'dependency-resolution': '使用依赖缓存或减少不必要的依赖',
      'file-scanning': '优化文件扫描模式，使用更精确的 glob 模式',
      'compilation': '启用增量编译或使用更快的编译器',
      'bundling': '考虑代码分割或并行打包',
      'optimization': '调整优化级别或使用更快的压缩算法',
      'output-generation': '优化输出文件写入，使用流式写入',
      'validation': '减少验证规则或使用并行验证'
    }

    return suggestions[phase] || '考虑优化此阶段的实现逻辑'
  }

  /**
   * 获取高内存使用的建议
   */
  private getSuggestionForHighMemory(phase: BuildPhase): string {
    const suggestions: Record<BuildPhase, string> = {
      'initialization': '优化初始化过程，延迟加载非必要模块',
      'dependency-resolution': '使用流式依赖解析，避免一次性加载所有依赖',
      'file-scanning': '使用流式文件读取，避免一次性加载大文件',
      'compilation': '启用增量编译，避免一次性编译大量文件',
      'bundling': '使用流式处理，避免将所有内容加载到内存',
      'optimization': '分批处理优化任务，释放中间结果',
      'output-generation': '使用流式输出生成，避免在内存中缓存大量数据',
      'validation': '分批验证，避免同时验证所有文件'
    }

    return suggestions[phase] || '考虑使用流式处理和及时释放内存'
  }

  /**
   * 获取历史分析数据
   */
  getHistory(): BuildPerformanceAnalysis[] {
    return [...this.history]
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 计算内存效率
   */
  private calculateMemoryEfficiency(memoryUsages: number[]): number {
    if (memoryUsages.length === 0) return 100

    const maxMemoryUsage = Math.max(...memoryUsages)
    const memoryUsageGB = maxMemoryUsage / (1024 * 1024 * 1024)

    // 基于内存使用量计算效率分数
    // 1GB以下为100分，每增加1GB减少10分
    return Math.max(0, 100 - memoryUsageGB * 10)
  }
}
