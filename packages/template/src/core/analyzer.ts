/**
 * 模板分析工具
 */

import type { Template } from '../types'
import { reactive, ref } from 'vue'

/**
 * 模板使用统计
 */
export interface TemplateUsageStats {
  templateId: string
  templateName: string
  usageCount: number
  lastUsed: number
  firstUsed: number
  averageRenderTime: number
  errorCount: number
  successRate: number
  userPreference: number
}

/**
 * 模板依赖关系
 */
export interface TemplateDependency {
  templateId: string
  dependencies: string[]
  dependents: string[]
  depth: number
  circular: boolean
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  timestamp: number
  duration: number
  templates: {
    id: string
    name: string
    renderTime: number
    updateTime: number
    memoryUsage: number
    domNodes: number
    componentCount: number
  }[]
  summary: {
    totalRenderTime: number
    averageRenderTime: number
    slowestTemplate: string
    fastestTemplate: string
    totalMemoryUsage: number
    totalDomNodes: number
  }
}

/**
 * 复杂度指标
 */
export interface ComplexityMetrics {
  templateId: string
  cyclomaticComplexity: number
  cognitiveComplexity: number
  nestingDepth: number
  parameterCount: number
  lineCount: number
  maintainabilityIndex: number
}

/**
 * 模板统计分析器
 */
// 公共工具函数
const createStatsEntry = (): TemplateUsageStats => ({
  templateId: '',
  templateName: '',
  usageCount: 0,
  lastUsed: 0,
  firstUsed: 0,
  averageRenderTime: 0,
  errorCount: 0,
  successRate: 100,
  userPreference: 0
})

const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((a, b) => a + b, 0)
  return sum / numbers.length
}

const limitArraySize = <T>(arr: T[], maxSize: number): T[] => {
  while (arr.length > maxSize) {
    arr.shift()
  }
  return arr
}

export class TemplateStatisticsAnalyzer {
  private usageStats: Map<string, TemplateUsageStats> = new Map()
  private performanceData: Map<string, number[]> = new Map()
  private errorLogs: Map<string, any[]> = new Map()
  private readonly MAX_PERFORMANCE_ENTRIES = 1000
  private readonly MAX_ERROR_LOGS = 100
  private readonly MAX_STATS_ENTRIES = 500
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null
  
  /**
   * 记录模板使用
   */
  recordUsage(templateId: string, templateName: string) {
    const now = Date.now()
    let stats = this.usageStats.get(templateId)
    
    if (!stats) {
      stats = createStatsEntry()
      stats.templateId = templateId
      stats.templateName = templateName
      stats.firstUsed = now
      this.usageStats.set(templateId, stats)
    }
    
    stats.usageCount++
    stats.lastUsed = now
    
    // 触发定期清理
    this.scheduleCleanup()
  }
  
  /**
   * 记录渲染时间
   */
  recordRenderTime(templateId: string, time: number) {
    let times = this.performanceData.get(templateId)
    if (!times) {
      times = []
      this.performanceData.set(templateId, times)
    }
    
    times.push(time)
    limitArraySize(times, this.MAX_PERFORMANCE_ENTRIES)
    
    // 更新平均渲染时间
    const stats = this.usageStats.get(templateId)
    if (stats) {
      stats.averageRenderTime = calculateAverage(times)
    }
  }
  
  /**
   * 记录错误
   */
  recordError(templateId: string, error: any) {
    if (!this.errorLogs.has(templateId)) {
      this.errorLogs.set(templateId, [])
    }
    
    const errors = this.errorLogs.get(templateId)!
    errors.push({
      timestamp: Date.now(),
      error: error.message || String(error),
      stack: error.stack
    })
    
    // 限制错误日志大小
    limitArraySize(errors, this.MAX_ERROR_LOGS)
    
    // 更新错误统计
    const stats = this.usageStats.get(templateId)
    if (stats) {
      stats.errorCount++
      stats.successRate = ((stats.usageCount - stats.errorCount) / stats.usageCount) * 100
    }
  }
  
  /**
   * 获取使用统计
   */
  getUsageStats(templateId?: string): TemplateUsageStats[] | TemplateUsageStats | undefined {
    if (templateId) {
      return this.usageStats.get(templateId)
    }
    
    return Array.from(this.usageStats.values())
  }
  
  /**
   * 获取热门模板
   */
  getPopularTemplates(limit: number = 10): TemplateUsageStats[] {
    return Array.from(this.usageStats.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }
  
  /**
   * 获取性能差的模板
   */
  getSlowTemplates(limit: number = 10): TemplateUsageStats[] {
    return Array.from(this.usageStats.values())
      .filter(s => s.averageRenderTime > 0)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit)
  }
  
  /**
   * 获取错误率高的模板
   */
  getErrorProneTemplates(limit: number = 10): TemplateUsageStats[] {
    return Array.from(this.usageStats.values())
      .filter(s => s.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit)
  }
  
  /**
   * 生成使用报告
   */
  generateUsageReport(): any {
    const templates = Array.from(this.usageStats.values())
    const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0)
    const totalErrors = templates.reduce((sum, t) => sum + t.errorCount, 0)
    const avgRenderTime = templates.reduce((sum, t) => sum + t.averageRenderTime, 0) / templates.length
    
    return {
      timestamp: Date.now(),
      totalTemplates: templates.length,
      totalUsage,
      totalErrors,
      overallSuccessRate: ((totalUsage - totalErrors) / totalUsage) * 100,
      averageRenderTime: avgRenderTime,
      popularTemplates: this.getPopularTemplates(5),
      slowTemplates: this.getSlowTemplates(5),
      errorProneTemplates: this.getErrorProneTemplates(5)
    }
  }
  
  /**
   * 清空统计数据
   */
  clearStats(templateId?: string) {
    if (templateId) {
      this.usageStats.delete(templateId)
      this.performanceData.delete(templateId)
      this.errorLogs.delete(templateId)
    } else {
      this.usageStats.clear()
      this.performanceData.clear()
      this.errorLogs.clear()
    }
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
  
  /**
   * 定期清理调度
   */
  private scheduleCleanup(): void {
    if (this.cleanupTimer) return
    
    this.cleanupTimer = setTimeout(() => {
      // 清理过旧的统计数据
      if (this.usageStats.size > this.MAX_STATS_ENTRIES) {
        const sortedStats = Array.from(this.usageStats.entries())
          .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
        
        // 保留最近使用的
        const toKeep = sortedStats.slice(0, this.MAX_STATS_ENTRIES)
        this.usageStats.clear()
        toKeep.forEach(([id, stats]) => this.usageStats.set(id, stats))
      }
      
      this.cleanupTimer = null
    }, 60000) // 60秒后执行
  }
}

/**
 * 模板依赖分析器
 */
export class TemplateDependencyAnalyzer {
  private dependencies: Map<string, Set<string>> = new Map()
  private dependents: Map<string, Set<string>> = new Map()
  private readonly MAX_DEPENDENCIES = 1000
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null
  
  /**
   * 添加依赖关系
   */
  addDependency(templateId: string, dependsOn: string) {
    // 添加依赖
    if (!this.dependencies.has(templateId)) {
      this.dependencies.set(templateId, new Set())
    }
    this.dependencies.get(templateId)!.add(dependsOn)
    
    // 添加被依赖
    if (!this.dependents.has(dependsOn)) {
      this.dependents.set(dependsOn, new Set())
    }
    this.dependents.get(dependsOn)!.add(templateId)
    
    // 触发定期清理
    this.scheduleCleanup()
  }
  
  /**
   * 移除依赖关系
   */
  removeDependency(templateId: string, dependsOn: string) {
    const deps = this.dependencies.get(templateId)
    if (deps) {
      deps.delete(dependsOn)
      if (deps.size === 0) {
        this.dependencies.delete(templateId)
      }
    }
    
    const depts = this.dependents.get(dependsOn)
    if (depts) {
      depts.delete(templateId)
      if (depts.size === 0) {
        this.dependents.delete(dependsOn)
      }
    }
  }
  
  /**
   * 获取模板依赖
   */
  getDependencies(templateId: string): string[] {
    const deps = this.dependencies.get(templateId)
    return deps ? Array.from(deps) : []
  }
  
  /**
   * 获取依赖此模板的模板
   */
  getDependents(templateId: string): string[] {
    const depts = this.dependents.get(templateId)
    return depts ? Array.from(depts) : []
  }
  
  /**
   * 检测循环依赖
   */
  detectCircularDependencies(templateId: string): boolean {
    const visited = new Set<string>()
    const stack = new Set<string>()
    
    const hasCircular = (id: string): boolean => {
      if (stack.has(id)) return true
      if (visited.has(id)) return false
      
      visited.add(id)
      stack.add(id)
      
      const deps = this.dependencies.get(id)
      if (deps) {
        for (const dep of deps) {
          if (hasCircular(dep)) return true
        }
      }
      
      stack.delete(id)
      return false
    }
    
    return hasCircular(templateId)
  }
  
  /**
   * 计算依赖深度
   */
  calculateDepth(templateId: string): number {
    const visited = new Set<string>()
    
    const getDepth = (id: string): number => {
      if (visited.has(id)) return 0
      visited.add(id)
      
      const deps = this.dependencies.get(id)
      if (!deps || deps.size === 0) return 0
      
      let maxDepth = 0
      for (const dep of deps) {
        maxDepth = Math.max(maxDepth, getDepth(dep))
      }
      
      return maxDepth + 1
    }
    
    return getDepth(templateId)
  }
  
  /**
   * 生成依赖图
   */
  generateDependencyGraph(): Map<string, TemplateDependency> {
    const graph = new Map<string, TemplateDependency>()
    
    // 获取所有模板ID
    const allTemplates = new Set([
      ...this.dependencies.keys(),
      ...this.dependents.keys()
    ])
    
    for (const templateId of allTemplates) {
      graph.set(templateId, {
        templateId,
        dependencies: this.getDependencies(templateId),
        dependents: this.getDependents(templateId),
        depth: this.calculateDepth(templateId),
        circular: this.detectCircularDependencies(templateId)
      })
    }
    
    return graph
  }
  
  /**
   * 获取依赖链
   */
  getDependencyChain(templateId: string): string[] {
    const chain: string[] = []
    const visited = new Set<string>()
    
    const buildChain = (id: string) => {
      if (visited.has(id)) return
      
      visited.add(id)
      chain.push(id)
      
      const deps = this.dependencies.get(id)
      if (deps) {
        for (const dep of deps) {
          buildChain(dep)
        }
      }
    }
    
    buildChain(templateId)
    return chain
  }
  
  /**
   * 清空依赖数据
   */
  clearDependencies(templateId?: string) {
    if (templateId) {
      // 清理特定模板的依赖
      this.dependencies.delete(templateId)
      // 从被依赖中移除
      this.dependents.forEach((depts) => depts.delete(templateId))
      // 清理空的被依赖集合
      Array.from(this.dependents.entries()).forEach(([id, depts]) => {
        if (depts.size === 0) this.dependents.delete(id)
      })
    } else {
      this.dependencies.clear()
      this.dependents.clear()
    }
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
  
  /**
   * 定期清理旧依赖
   */
  private scheduleCleanup(): void {
    if (this.cleanupTimer) return
    
    this.cleanupTimer = setTimeout(() => {
      // 限制依赖图大小
      if (this.dependencies.size > this.MAX_DEPENDENCIES) {
        const entries = Array.from(this.dependencies.entries())
        const toRemove = entries.slice(this.MAX_DEPENDENCIES)
        
        toRemove.forEach(([id]) => {
          this.clearDependencies(id)
        })
      }
      
      this.cleanupTimer = null
    }, 90000) // 90秒后执行
  }
}

/**
 * 模板性能分析器
 */
export class TemplatePerformanceAnalyzer {
  private performanceReports: PerformanceReport[] = reactive([])
  private metricsCollector: Map<string, any[]> = new Map()
  private recording = ref(false)
  private startTime: number = 0
  private readonly MAX_REPORTS = 50
  private readonly MAX_METRICS_PER_TEMPLATE = 100
  
  /**
   * 开始记录
   */
  startRecording() {
    this.recording.value = true
    this.startTime = performance.now()
    this.metricsCollector.clear()
  }
  
  /**
   * 停止记录
   */
  stopRecording(): PerformanceReport {
    this.recording.value = false
    const duration = performance.now() - this.startTime
    
    const templates = Array.from(this.metricsCollector.entries()).map(([id, metrics]) => {
      const latestMetric = metrics[metrics.length - 1]
      return {
        id,
        name: latestMetric.name || id,
        renderTime: latestMetric.renderTime || 0,
        updateTime: latestMetric.updateTime || 0,
        memoryUsage: latestMetric.memoryUsage || 0,
        domNodes: latestMetric.domNodes || 0,
        componentCount: latestMetric.componentCount || 0
      }
    })
    
    const report: PerformanceReport = {
      timestamp: Date.now(),
      duration,
      templates,
      summary: {
        totalRenderTime: templates.reduce((sum, t) => sum + t.renderTime, 0),
        averageRenderTime: templates.length > 0 
          ? templates.reduce((sum, t) => sum + t.renderTime, 0) / templates.length 
          : 0,
        slowestTemplate: templates.length > 0
          ? templates.reduce((slowest, t) => 
              t.renderTime > (slowest?.renderTime || 0) ? t : slowest, templates[0]).id
          : '',
        fastestTemplate: templates.length > 0
          ? templates.reduce((fastest, t) => 
              t.renderTime < (fastest?.renderTime || Infinity) ? t : fastest, templates[0]).id
          : '',
        totalMemoryUsage: templates.reduce((sum, t) => sum + t.memoryUsage, 0),
        totalDomNodes: templates.reduce((sum, t) => sum + t.domNodes, 0)
      }
    }
    
    this.performanceReports.push(report)
    
    // 限制报告数量
    if (this.performanceReports.length > this.MAX_REPORTS) {
      this.performanceReports.splice(0, this.performanceReports.length - this.MAX_REPORTS)
    }
    
    return report
  }
  
  /**
   * 收集指标
   */
  collectMetrics(templateId: string, metrics: any) {
    if (!this.metricsCollector.has(templateId)) {
      this.metricsCollector.set(templateId, [])
    }
    const templateMetrics = this.metricsCollector.get(templateId)!
    templateMetrics.push({
      timestamp: Date.now(),
      ...metrics
    })
    
    // 限制每个模板的指标数量
    if (templateMetrics.length > this.MAX_METRICS_PER_TEMPLATE) {
      templateMetrics.splice(0, templateMetrics.length - this.MAX_METRICS_PER_TEMPLATE)
    }
  }
  
  /**
   * 获取性能报告
   */
  getReports(filter?: {
    startTime?: number
    endTime?: number
    templateId?: string
  }): PerformanceReport[] {
    let reports = [...this.performanceReports]
    
    if (filter) {
      if (filter.startTime) {
        reports = reports.filter(r => r.timestamp >= filter.startTime!)
      }
      if (filter.endTime) {
        reports = reports.filter(r => r.timestamp <= filter.endTime!)
      }
      if (filter.templateId) {
        reports = reports.map(r => ({
          ...r,
          templates: r.templates.filter(t => t.id === filter.templateId)
        }))
      }
    }
    
    return reports
  }
  
  /**
   * 分析性能趋势
   */
  analyzeTrends(templateId: string, metricType: 'renderTime' | 'memoryUsage' | 'domNodes'): {
    trend: 'improving' | 'degrading' | 'stable'
    percentage: number
    data: number[]
  } {
    const data: number[] = []
    
    for (const report of this.performanceReports) {
      const template = report.templates.find(t => t.id === templateId)
      if (template) {
        data.push(template[metricType])
      }
    }
    
    if (data.length < 2) {
      return { trend: 'stable', percentage: 0, data }
    }
    
    // 计算趋势
    const recentAvg = data.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, data.slice(-5).length)
    const previousAvg = data.slice(-10, -5).reduce((a, b) => a + b, 0) / Math.min(5, data.slice(-10, -5).length)
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100
    
    let trend: 'improving' | 'degrading' | 'stable'
    if (change < -5) {
      trend = 'improving'
    } else if (change > 5) {
      trend = 'degrading'
    } else {
      trend = 'stable'
    }
    
    return { trend, percentage: Math.abs(change), data }
  }
  
  /**
   * 生成性能建议
   */
  generateRecommendations(report: PerformanceReport): string[] {
    const recommendations: string[] = []
    
    // 渲染时间建议
    const slowTemplates = report.templates.filter(t => t.renderTime > 100)
    if (slowTemplates.length > 0) {
      recommendations.push(
        `优化慢速模板: ${slowTemplates.map(t => t.name).join(', ')} 的渲染时间超过100ms`
      )
    }
    
    // 内存使用建议
    const highMemoryTemplates = report.templates.filter(t => t.memoryUsage > 10 * 1024 * 1024)
    if (highMemoryTemplates.length > 0) {
      recommendations.push(
        `降低内存使用: ${highMemoryTemplates.map(t => t.name).join(', ')} 的内存使用超过10MB`
      )
    }
    
    // DOM节点建议
    const highDomTemplates = report.templates.filter(t => t.domNodes > 1000)
    if (highDomTemplates.length > 0) {
      recommendations.push(
        `减少DOM节点: ${highDomTemplates.map(t => t.name).join(', ')} 的DOM节点数超过1000`
      )
    }
    
    // 组件数量建议
    const highComponentTemplates = report.templates.filter(t => t.componentCount > 50)
    if (highComponentTemplates.length > 0) {
      recommendations.push(
        `优化组件结构: ${highComponentTemplates.map(t => t.name).join(', ')} 的组件数超过50`
      )
    }
    
    return recommendations
  }
}

/**
 * 模板复杂度分析器
 */
export class TemplateComplexityAnalyzer {
  /**
   * 计算圈复杂度
   */
  calculateCyclomaticComplexity(template: Template): number {
    // 简化的圈复杂度计算
    let complexity = 1
    
    const code = template.component?.toString() || ''
    
    // 统计条件语句
    complexity += (code.match(/if\s*\(/g) || []).length
    complexity += (code.match(/else\s+if\s*\(/g) || []).length
    complexity += (code.match(/\?[^:]+:/g) || []).length
    complexity += (code.match(/case\s+/g) || []).length
    complexity += (code.match(/for\s*\(/g) || []).length
    complexity += (code.match(/while\s*\(/g) || []).length
    complexity += (code.match(/catch\s*\(/g) || []).length
    
    return complexity
  }
  
  /**
   * 计算认知复杂度
   */
  calculateCognitiveComplexity(template: Template): number {
    // 简化的认知复杂度计算
    let complexity = 0
    const code = template.component?.toString() || ''
    
    // 嵌套深度影响
    let nestingLevel = 0
    const lines = code.split('\n')
    
    for (const line of lines) {
      if (line.includes('{')) nestingLevel++
      if (line.includes('}')) nestingLevel--
      
      if (line.match(/if\s*\(/) || line.match(/for\s*\(/) || line.match(/while\s*\(/)) {
        complexity += 1 + nestingLevel
      }
    }
    
    return complexity
  }
  
  /**
   * 计算嵌套深度
   */
  calculateNestingDepth(template: Template): number {
    const code = template.component?.toString() || ''
    let maxDepth = 0
    let currentDepth = 0
    
    for (const char of code) {
      if (char === '{') {
        currentDepth++
        maxDepth = Math.max(maxDepth, currentDepth)
      } else if (char === '}') {
        currentDepth--
      }
    }
    
    return maxDepth
  }
  
  /**
   * 计算参数数量
   */
  calculateParameterCount(template: Template): number {
    return Object.keys(template.config || {}).length
  }
  
  /**
   * 计算代码行数
   */
  calculateLineCount(template: Template): number {
    const code = template.component?.toString() || ''
    return code.split('\n').length
  }
  
  /**
   * 计算可维护性指数
   */
  calculateMaintainabilityIndex(metrics: ComplexityMetrics): number {
    // 简化的可维护性指数计算
    const { cyclomaticComplexity, lineCount } = metrics
    
    // Microsoft可维护性指数公式的简化版本
    const volume = lineCount * Math.log2(lineCount + 1)
    const index = Math.max(0, 
      (171 - 5.2 * Math.log(volume) - 0.23 * cyclomaticComplexity) * 100 / 171
    )
    
    return Math.round(index)
  }
  
  /**
   * 分析模板复杂度
   */
  analyzeTemplate(template: Template): ComplexityMetrics {
    const metrics: ComplexityMetrics = {
      templateId: template.id,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(template),
      cognitiveComplexity: this.calculateCognitiveComplexity(template),
      nestingDepth: this.calculateNestingDepth(template),
      parameterCount: this.calculateParameterCount(template),
      lineCount: this.calculateLineCount(template),
      maintainabilityIndex: 0
    }
    
    metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(metrics)
    
    return metrics
  }
  
  /**
   * 生成复杂度报告
   */
  generateComplexityReport(templates: Template[]): any {
    const metrics = templates.map(t => this.analyzeTemplate(t))
    
    return {
      timestamp: Date.now(),
      totalTemplates: templates.length,
      metrics,
      summary: {
        averageCyclomaticComplexity: metrics.reduce((sum, m) => sum + m.cyclomaticComplexity, 0) / metrics.length,
        averageCognitiveComplexity: metrics.reduce((sum, m) => sum + m.cognitiveComplexity, 0) / metrics.length,
        averageMaintainabilityIndex: metrics.reduce((sum, m) => sum + m.maintainabilityIndex, 0) / metrics.length,
        highComplexityTemplates: metrics.filter(m => m.cyclomaticComplexity > 10).map(m => m.templateId),
        lowMaintainabilityTemplates: metrics.filter(m => m.maintainabilityIndex < 50).map(m => m.templateId)
      }
    }
  }
}

/**
 * 模板分析管理器
 */
export class TemplateAnalyzer {
  private static instance: TemplateAnalyzer
  private statisticsAnalyzer: TemplateStatisticsAnalyzer
  private dependencyAnalyzer: TemplateDependencyAnalyzer
  private performanceAnalyzer: TemplatePerformanceAnalyzer
  private complexityAnalyzer: TemplateComplexityAnalyzer
  
  private constructor() {
    this.statisticsAnalyzer = new TemplateStatisticsAnalyzer()
    this.dependencyAnalyzer = new TemplateDependencyAnalyzer()
    this.performanceAnalyzer = new TemplatePerformanceAnalyzer()
    this.complexityAnalyzer = new TemplateComplexityAnalyzer()
  }
  
  static getInstance(): TemplateAnalyzer {
    if (!this.instance) {
      this.instance = new TemplateAnalyzer()
    }
    return this.instance
  }
  
  /**
   * 获取统计分析器
   */
  getStatisticsAnalyzer(): TemplateStatisticsAnalyzer {
    return this.statisticsAnalyzer
  }
  
  /**
   * 获取依赖分析器
   */
  getDependencyAnalyzer(): TemplateDependencyAnalyzer {
    return this.dependencyAnalyzer
  }
  
  /**
   * 获取性能分析器
   */
  getPerformanceAnalyzer(): TemplatePerformanceAnalyzer {
    return this.performanceAnalyzer
  }
  
  /**
   * 获取复杂度分析器
   */
  getComplexityAnalyzer(): TemplateComplexityAnalyzer {
    return this.complexityAnalyzer
  }
  
  /**
   * 生成综合报告
   */
  generateComprehensiveReport(templates: Template[]): any {
    return {
      timestamp: Date.now(),
      usage: this.statisticsAnalyzer.generateUsageReport(),
      dependencies: Array.from(this.dependencyAnalyzer.generateDependencyGraph().values()),
      performance: this.performanceAnalyzer.getReports(),
      complexity: this.complexityAnalyzer.generateComplexityReport(templates)
    }
  }
}

// 导出单例
export const templateAnalyzer = TemplateAnalyzer.getInstance()