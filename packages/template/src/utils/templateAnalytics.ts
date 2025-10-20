import { computed, onUnmounted, readonly } from 'vue'

/**
 * 模板使用统计
 */
export interface TemplateUsage {
  templateId: string
  templateName: string
  loadCount: number // 加载次数
  renderCount: number // 渲染次数
  errorCount: number // 错误次数
  totalLoadTime: number // 总加载时间
  averageLoadTime: number // 平均加载时间
  totalRenderTime: number // 总渲染时间
  averageRenderTime: number // 平均渲染时间
  lastUsedAt: number // 最后使用时间
  firstUsedAt: number // 首次使用时间
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  templateId: string
  metric: 'load' | 'render' | 'interaction'
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * 用户交互事件
 */
export interface InteractionEvent {
  templateId: string
  eventType: string
  timestamp: number
  data?: any
}

/**
 * 分析报告
 */
export interface AnalyticsReport {
  totalTemplates: number
  totalUsage: number
  mostUsedTemplates: TemplateUsage[]
  leastUsedTemplates: TemplateUsage[]
  slowestTemplates: TemplateUsage[]
  errorProneTemplates: TemplateUsage[]
  performanceScore: number
  recommendations: string[]
}

/**
 * 模板分析器配置
 */
export interface AnalyticsConfig {
  enabled?: boolean
  sampleRate?: number // 采样率 (0-1)
  maxEvents?: number // 最大事件数
  enablePerformanceTracking?: boolean
  enableErrorTracking?: boolean
  enableInteractionTracking?: boolean
}

/**
 * 模板分析器类
 */
export class TemplateAnalytics {
  private config: Required<AnalyticsConfig>
  private usageMap = new Map<string, TemplateUsage>()
  private performanceMetrics: PerformanceMetrics[] = []
  private interactionEvents: InteractionEvent[] = []
  private sessionStartTime = Date.now()
  private disposed = false
  private cleanupTimer: ReturnType<typeof setTimeout> | null = null

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      sampleRate: config.sampleRate ?? 1,
      maxEvents: config.maxEvents ?? 1000,
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
      enableErrorTracking: config.enableErrorTracking ?? true,
      enableInteractionTracking: config.enableInteractionTracking ?? true,
    }
    
    // 定期清理老旧数据
    this.scheduleCleanup()
  }

  /**
   * 判断是否应该记录事件（基于采样率）
   */
  private shouldRecord(): boolean {
    if (this.disposed || !this.config.enabled) return false
    return Math.random() < this.config.sampleRate
  }

  /**
   * 记录模板加载
   */
  trackLoad(templateId: string, templateName: string, duration: number) {
    if (!this.shouldRecord()) return

    const usage = this.getOrCreateUsage(templateId, templateName)
    usage.loadCount++
    usage.totalLoadTime += duration
    usage.averageLoadTime = usage.totalLoadTime / usage.loadCount
    usage.lastUsedAt = Date.now()

    if (this.config.enablePerformanceTracking) {
      this.recordPerformanceMetric({
        templateId,
        metric: 'load',
        duration,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 记录模板渲染
   */
  trackRender(templateId: string, templateName: string, duration: number) {
    if (!this.shouldRecord()) return

    const usage = this.getOrCreateUsage(templateId, templateName)
    usage.renderCount++
    usage.totalRenderTime += duration
    usage.averageRenderTime = usage.totalRenderTime / usage.renderCount
    usage.lastUsedAt = Date.now()

    if (this.config.enablePerformanceTracking) {
      this.recordPerformanceMetric({
        templateId,
        metric: 'render',
        duration,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 记录模板错误
   */
  trackError(templateId: string, templateName: string, error: Error) {
    if (this.disposed || !this.config.enableErrorTracking) return

    const usage = this.getOrCreateUsage(templateId, templateName)
    usage.errorCount++
    usage.lastUsedAt = Date.now()

if (import.meta.env.DEV) {
      console.warn(`Template error tracked: ${templateId}`, error)
    }
  }

  /**
   * 记录用户交互
   */
  trackInteraction(templateId: string, eventType: string, data?: any) {
    if (this.disposed || !this.config.enableInteractionTracking || !this.shouldRecord()) return

    const event: InteractionEvent = {
      templateId,
      eventType,
      timestamp: Date.now(),
      data,
    }

    this.interactionEvents.push(event)

    // 限制事件数量
    if (this.interactionEvents.length > this.config.maxEvents) {
      this.interactionEvents.shift()
    }
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(metric: PerformanceMetrics) {
    this.performanceMetrics.push(metric)

    // 限制指标数量
    if (this.performanceMetrics.length > this.config.maxEvents) {
      this.performanceMetrics.shift()
    }
  }

  /**
   * 获取或创建模板使用统计
   */
  private getOrCreateUsage(templateId: string, templateName: string): TemplateUsage {
    let usage = this.usageMap.get(templateId)
    
    if (!usage) {
      usage = {
        templateId,
        templateName,
        loadCount: 0,
        renderCount: 0,
        errorCount: 0,
        totalLoadTime: 0,
        averageLoadTime: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastUsedAt: Date.now(),
        firstUsedAt: Date.now(),
      }
      this.usageMap.set(templateId, usage)
    }

    return usage
  }

  /**
   * 获取所有使用统计
   */
  getAllUsage(): TemplateUsage[] {
    return Array.from(this.usageMap.values())
  }

  /**
   * 获取特定模板的统计
   */
  getUsage(templateId: string): TemplateUsage | undefined {
    return this.usageMap.get(templateId)
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(templateId?: string): PerformanceMetrics[] {
    if (templateId) {
      return this.performanceMetrics.filter((m) => m.templateId === templateId)
    }
    return this.performanceMetrics
  }

  /**
   * 获取交互事件
   */
  getInteractionEvents(templateId?: string): InteractionEvent[] {
    if (templateId) {
      return this.interactionEvents.filter((e) => e.templateId === templateId)
    }
    return this.interactionEvents
  }

  /**
   * 生成分析报告
   */
  generateReport(): AnalyticsReport {
    const allUsage = this.getAllUsage()
    const totalUsage = allUsage.reduce((sum, u) => sum + u.renderCount, 0)

    // 优化: 使用部分排序减少不必要的排序操作
    const partialSort = <T>(arr: T[], compareFn: (a: T, b: T) => number, k: number): T[] => {
      if (arr.length <= k) return [...arr].sort(compareFn)
      
      const result = arr.slice(0, k)
      result.sort(compareFn)
      
      for (let i = k; i < arr.length; i++) {
        const item = arr[i]
        if (compareFn(item, result[k - 1]) < 0) {
          result[k - 1] = item
          result.sort(compareFn)
        }
      }
      return result
    }

    // 最常用的模板
    const mostUsed = partialSort(
      allUsage,
      (a, b) => b.renderCount - a.renderCount,
      5
    )

    // 最少使用的模板
    const leastUsed = partialSort(
      allUsage,
      (a, b) => a.renderCount - b.renderCount,
      5
    )

    // 最慢的模板
    const slowest = partialSort(
      allUsage,
      (a, b) => b.averageRenderTime - a.averageRenderTime,
      5
    )

    // 错误最多的模板
    const errorProne = partialSort(
      allUsage.filter((u) => u.errorCount > 0),
      (a, b) => b.errorCount - a.errorCount,
      5
    )

    // 性能评分 (0-100)
    const averageLoadTime =
      allUsage.reduce((sum, u) => sum + u.averageLoadTime, 0) / allUsage.length || 0
    const averageRenderTime =
      allUsage.reduce((sum, u) => sum + u.averageRenderTime, 0) / allUsage.length || 0
    const errorRate = allUsage.reduce((sum, u) => sum + u.errorCount, 0) / totalUsage || 0

    let performanceScore = 100
    if (averageLoadTime > 1000) performanceScore -= 20
    if (averageLoadTime > 2000) performanceScore -= 20
    if (averageRenderTime > 100) performanceScore -= 15
    if (averageRenderTime > 200) performanceScore -= 15
    if (errorRate > 0.01) performanceScore -= 15
    if (errorRate > 0.05) performanceScore -= 15

    performanceScore = Math.max(0, performanceScore)

    // 生成建议
    const recommendations: string[] = []
    
    if (averageLoadTime > 1000) {
      recommendations.push('Consider implementing lazy loading for templates')
    }
    
    if (averageRenderTime > 100) {
      recommendations.push('Optimize template rendering performance')
    }
    
    if (errorRate > 0.01) {
      recommendations.push('Investigate and fix templates with high error rates')
    }
    
    if (leastUsed.length > 0 && leastUsed[0].renderCount === 0) {
      recommendations.push('Remove unused templates to reduce bundle size')
    }
    
    slowest.forEach((template) => {
      if (template.averageRenderTime > 200) {
        recommendations.push(`Optimize ${template.templateName} - slow rendering detected`)
      }
    })

    return {
      totalTemplates: allUsage.length,
      totalUsage,
      mostUsedTemplates: mostUsed,
      leastUsedTemplates: leastUsed,
      slowestTemplates: slowest,
      errorProneTemplates: errorProne,
      performanceScore,
      recommendations,
    }
  }

  /**
   * 导出数据
   */
  exportData(): {
    usage: TemplateUsage[]
    metrics: PerformanceMetrics[]
    interactions: InteractionEvent[]
    sessionDuration: number
  } {
    return {
      usage: this.getAllUsage(),
      metrics: this.getPerformanceMetrics(),
      interactions: this.getInteractionEvents(),
      sessionDuration: Date.now() - this.sessionStartTime,
    }
  }

  /**
   * 清除所有数据
   */
  clear() {
    this.usageMap.clear()
    this.performanceMetrics.length = 0
    this.interactionEvents.length = 0
    this.sessionStartTime = Date.now()
  }

  /**
   * 销毁分析器实例
   */
  dispose() {
    this.disposed = true
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
    this.usageMap.clear()
  }
  
  /**
   * 定期清理老旧数据
   */
  private scheduleCleanup() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
    }
    
    // 每10分钟清理一次老旧数据
    this.cleanupTimer = setTimeout(() => {
      if (!this.disposed) {
        const now = Date.now()
        const maxAge = 30 * 60 * 1000 // 30分钟
        
        // 清理老旧的性能指标
        this.performanceMetrics = this.performanceMetrics.filter(
          m => (now - m.timestamp) < maxAge
        )
        
        // 清理老旧的交互事件
        this.interactionEvents = this.interactionEvents.filter(
          e => (now - e.timestamp) < maxAge
        )
        
        // 递归调度下次清理
        this.scheduleCleanup()
      }
    }, 10 * 60 * 1000)
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AnalyticsConfig>) {
    Object.assign(this.config, config)
  }

  /**
   * 启用分析
   */
  enable() {
    this.config.enabled = true
  }

  /**
   * 禁用分析
   */
  disable() {
    this.config.enabled = false
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<Required<AnalyticsConfig>> {
    return readonly(this.config)
  }
}

// 全局分析器实例 - 使用懒加载
let _globalAnalytics: TemplateAnalytics | null = null

export function getGlobalAnalytics(): TemplateAnalytics {
  if (!_globalAnalytics) {
    _globalAnalytics = new TemplateAnalytics()
  }
  return _globalAnalytics
}

// 清理全局实例
export function destroyGlobalAnalytics() {
  if (_globalAnalytics) {
    _globalAnalytics.dispose()
    _globalAnalytics = null
  }
}

// 使用getter延迟加载，避免立即创建实例
let _globalAnalyticsProxy: TemplateAnalytics | null = null
export const globalAnalytics = new Proxy({} as TemplateAnalytics, {
  get(target, prop) {
    if (!_globalAnalyticsProxy) {
      _globalAnalyticsProxy = getGlobalAnalytics()
    }
    return (_globalAnalyticsProxy as any)[prop]
  }
})

/**
 * 使用模板分析 (组合式函数)
 */
export function useTemplateAnalytics(config?: AnalyticsConfig) {
  // Create a dedicated instance if config is provided
  const analytics = config ? new TemplateAnalytics(config) : getGlobalAnalytics()
  const isCustomInstance = !!config

  const allUsage = computed(() => analytics.getAllUsage())
  const report = computed(() => analytics.generateReport())

  const trackLoad = (templateId: string, templateName: string, duration: number) => {
    analytics.trackLoad(templateId, templateName, duration)
  }

  const trackRender = (templateId: string, templateName: string, duration: number) => {
    analytics.trackRender(templateId, templateName, duration)
  }

  const trackError = (templateId: string, templateName: string, error: Error) => {
    analytics.trackError(templateId, templateName, error)
  }

  const trackInteraction = (templateId: string, eventType: string, data?: any) => {
    analytics.trackInteraction(templateId, eventType, data)
  }

  const getUsage = (templateId: string) => {
    return analytics.getUsage(templateId)
  }

  const getPerformanceMetrics = (templateId?: string) => {
    return analytics.getPerformanceMetrics(templateId)
  }

  const exportData = () => {
    return analytics.exportData()
  }

  const clear = () => {
    analytics.clear()
  }

  // Cleanup custom instance on unmount
  if (isCustomInstance) {
    onUnmounted(() => {
      analytics.dispose()
    })
  }

  return {
    allUsage,
    report,
    trackLoad,
    trackRender,
    trackError,
    trackInteraction,
    getUsage,
    getPerformanceMetrics,
    exportData,
    clear,
  }
}

/**
 * 性能监控装饰器
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  templateId: string,
  metric: 'load' | 'render' | 'interaction'
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = fn(...args)
      
      // 处理异步函数
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime
          // Use private method through a workaround
          ;(globalAnalytics as any).recordPerformanceMetric({
            templateId,
            metric,
            duration,
            timestamp: Date.now(),
          })
        })
      }
      
      const duration = performance.now() - startTime
      // Use private method through a workaround
      ;(globalAnalytics as any).recordPerformanceMetric({
        templateId,
        metric,
        duration,
        timestamp: Date.now(),
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      // Use private method through a workaround
      ;(globalAnalytics as any).recordPerformanceMetric({
        templateId,
        metric,
        duration,
        timestamp: Date.now(),
        metadata: { error: true },
      })
      throw error
    }
  }) as T
}
