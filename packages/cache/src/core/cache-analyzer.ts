import type { CacheEvent, StorageEngine } from '../types'

import type { CacheManager } from './cache-manager'

/**
 * 缓存分析配置
 */
export interface AnalyzerConfig {
  /** 是否启用分析 */
  enabled?: boolean
  /** 采样率（0-1） */
  sampleRate?: number
  /** 分析间隔（毫秒） */
  interval?: number
  /** 最大记录数 */
  maxRecords?: number
  /** 是否记录值 */
  recordValues?: boolean
}

/**
 * 访问模式
 */
export interface AccessPattern {
  /** 键名 */
  key: string
  /** 访问次数 */
  accessCount: number
  /** 命中次数 */
  hitCount: number
  /** 未命中次数 */
  missCount: number
  /** 平均访问间隔（毫秒） */
  avgInterval: number
  /** 最后访问时间 */
  lastAccess: number
  /** 数据大小 */
  size?: number
  /** 存储引擎 */
  engine?: StorageEngine
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 操作类型 */
  operation: 'get' | 'set' | 'remove' | 'clear'
  /** 平均耗时（毫秒） */
  avgDuration: number
  /** 最小耗时 */
  minDuration: number
  /** 最大耗时 */
  maxDuration: number
  /** 操作次数 */
  count: number
  /** P95 耗时 */
  p95Duration: number
  /** P99 耗时 */
  p99Duration: number
}

/**
 * 存储分析
 */
export interface StorageAnalysis {
  /** 引擎名称 */
  engine: StorageEngine
  /** 使用率 */
  usage: number
  /** 项目数 */
  itemCount: number
  /** 总大小 */
  totalSize: number
  /** 平均项大小 */
  avgItemSize: number
  /** 最大项大小 */
  maxItemSize: number
  /** 过期项数 */
  expiredCount: number
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 类型 */
  type: 'performance' | 'storage' | 'strategy' | 'config'
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high'
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 建议操作 */
  recommendation: string
  /** 影响的键 */
  affectedKeys?: string[]
}

/**
 * 分析报告
 */
export interface AnalysisReport {
  /** 生成时间 */
  timestamp: number
  /** 分析周期 */
  period: {
    start: number
    end: number
    duration: number
  }
  /** 总体统计 */
  summary: {
    totalOperations: number
    hitRate: number
    avgResponseTime: number
    errorRate: number
  }
  /** 访问模式 */
  accessPatterns: {
    hot: AccessPattern[]
    cold: AccessPattern[]
    frequent: AccessPattern[]
  }
  /** 性能指标 */
  performance: PerformanceMetrics[]
  /** 存储分析 */
  storage: StorageAnalysis[]
  /** 优化建议 */
  suggestions: OptimizationSuggestion[]
}

/**
 * 缓存分析器
 * 
 * 提供缓存使用分析和优化建议
 */
export class CacheAnalyzer {
  private enabled: boolean
  private sampleRate: number
  private maxRecords: number
  private recordValues: boolean
  
  private accessRecords = new Map<string, AccessPattern>()
  private performanceRecords = new Map<string, number[]>()
  private errorRecords: Array<{ time: number, operation: string, error: Error }> = []
  private analysisTimer?: number
  private startTime = Date.now()
  
  constructor(
    private cache: CacheManager,
    config: AnalyzerConfig = {},
  ) {
    this.enabled = config.enabled ?? true
    this.sampleRate = config.sampleRate ?? 1
    this.maxRecords = config.maxRecords ?? 10000
    this.recordValues = config.recordValues ?? false
    
    if (this.enabled) {
      this.attachListeners()
      this.startAnalysis(config.interval ?? 60000)
    }
  }

  /**
   * 附加事件监听器
   */
  private attachListeners(): void {
    // 监听缓存事件
    this.cache.on('get', this.handleGet.bind(this))
    this.cache.on('set', this.handleSet.bind(this))
    this.cache.on('remove', this.handleRemove.bind(this))
    this.cache.on('error', this.handleError.bind(this))
  }

  /**
   * 处理 get 事件
   */
  private handleGet<T>(event: CacheEvent<T>): void {
    if (!this.shouldSample()) {
      return
    }
    
    const pattern = this.getOrCreatePattern(event.key)
    pattern.accessCount++
    
    if (event.value !== null && event.value !== undefined) {
      pattern.hitCount++
    }
    else {
      pattern.missCount++
    }
    
    this.updateAccessTime(pattern)
    this.recordPerformance('get', event.timestamp)
  }

  /**
   * 处理 set 事件
   */
  private handleSet<T>(event: CacheEvent<T>): void {
    if (!this.shouldSample()) {
      return
    }
    
    const pattern = this.getOrCreatePattern(event.key)
    pattern.engine = event.engine
    
    if (event.value !== null && event.value !== undefined && this.recordValues) {
      try {
        pattern.size = new Blob([JSON.stringify(event.value)]).size
      }
      catch {}
    }
    
    this.recordPerformance('set', event.timestamp)
  }

  /**
   * 处理 remove 事件
   */
  private handleRemove<T>(event: CacheEvent<T>): void {
    if (!this.shouldSample()) {
      return
    }
    this.recordPerformance('remove', event.timestamp)
  }

  /**
   * 处理错误事件
   */
  private handleError<T>(event: CacheEvent<T>): void {
    if (event.error) {
      this.errorRecords.push({
        time: event.timestamp,
        operation: event.type,
        error: event.error,
      })
      
      // 限制错误记录数
      if (this.errorRecords.length > 1000) {
        this.errorRecords = this.errorRecords.slice(-500)
      }
    }
  }

  /**
   * 是否应该采样
   */
  private shouldSample(): boolean {
    return this.enabled && Math.random() < this.sampleRate
  }

  /**
   * 获取或创建访问模式
   */
  private getOrCreatePattern(key: string): AccessPattern {
    let pattern = this.accessRecords.get(key)
    
    if (!pattern) {
      pattern = {
        key,
        accessCount: 0,
        hitCount: 0,
        missCount: 0,
        avgInterval: 0,
        lastAccess: Date.now(),
      }
      this.accessRecords.set(key, pattern)
      
      // 限制记录数
      if (this.accessRecords.size > this.maxRecords) {
        const oldestKey = this.accessRecords.keys().next().value
        if (typeof oldestKey === 'string') {
          this.accessRecords.delete(oldestKey)
        }
      }
    }
    
    return pattern
  }

  /**
   * 更新访问时间
   */
  private updateAccessTime(pattern: AccessPattern): void {
    const now = Date.now()
    const interval = now - pattern.lastAccess
    
    // 计算移动平均
    pattern.avgInterval = pattern.avgInterval === 0
      ? interval
      : pattern.avgInterval * 0.9 + interval * 0.1
    
    pattern.lastAccess = now
  }

  /**
   * 记录性能数据
   */
  private recordPerformance(operation: string, timestamp: number): void {
    const duration = Date.now() - timestamp
    
    let records = this.performanceRecords.get(operation)
    if (!records) {
      records = []
      this.performanceRecords.set(operation, records)
    }
    
    records.push(duration)
    
    // 限制记录数
    if (records.length > 1000) {
      this.performanceRecords.set(operation, records.slice(-500))
    }
  }

  /**
   * 开始定期分析
   */
  private startAnalysis(interval: number): void {
    const setIntervalFn = typeof window !== 'undefined' 
      ? window.setInterval 
      : globalThis.setInterval
    
    this.analysisTimer = setIntervalFn(() => {
      void this.performAnalysis()
    }, interval) as unknown as number
  }

  /**
   * 执行分析
   */
  private async performAnalysis(): Promise<void> {
    // 这里可以执行定期的分析任务
    // 例如：清理过期数据、生成报告等
  }

  /**
   * 生成分析报告
   */
  async generateReport(): Promise<AnalysisReport> {
    const now = Date.now()
    const stats = await this.cache.getStats()
    
    // 获取访问模式
    const patterns = Array.from(this.accessRecords.values())
    const hotKeys = this.identifyHotKeys(patterns)
    const coldKeys = this.identifyColdKeys(patterns)
    const frequentKeys = this.identifyFrequentKeys(patterns)
    
    // 计算性能指标
    const performance = this.calculatePerformanceMetrics()
    
    // 分析存储
    const storage = await this.analyzeStorage()
    
    // 生成优化建议
    const suggestions = this.generateSuggestions(
      patterns,
      performance,
      storage,
      stats as unknown as { hitRate: number, [key: string]: unknown },
    )
    
    // 计算总体统计
    const totalOps = patterns.reduce((sum, p) => sum + p.accessCount, 0)
    const totalHits = patterns.reduce((sum, p) => sum + p.hitCount, 0)
    const hitRate = totalOps > 0 ? totalHits / totalOps : 0
    const avgResponseTime = this.calculateAvgResponseTime()
    const errorRate = this.calculateErrorRate()
    
    return {
      timestamp: now,
      period: {
        start: this.startTime,
        end: now,
        duration: now - this.startTime,
      },
      summary: {
        totalOperations: totalOps,
        hitRate,
        avgResponseTime,
        errorRate,
      },
      accessPatterns: {
        hot: hotKeys,
        cold: coldKeys,
        frequent: frequentKeys,
      },
      performance,
      storage,
      suggestions,
    }
  }

  /**
   * 识别热键
   */
  private identifyHotKeys(patterns: AccessPattern[]): AccessPattern[] {
    const now = Date.now()
    const recentThreshold = 60000 // 1分钟
    
    return patterns
      .filter(p => now - p.lastAccess < recentThreshold)
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)
  }

  /**
   * 识别冷键
   */
  private identifyColdKeys(patterns: AccessPattern[]): AccessPattern[] {
    const now = Date.now()
    const coldThreshold = 3600000 // 1小时
    
    return patterns
      .filter(p => now - p.lastAccess > coldThreshold)
      .sort((a, b) => a.lastAccess - b.lastAccess)
      .slice(0, 10)
  }

  /**
   * 识别频繁访问键
   */
  private identifyFrequentKeys(patterns: AccessPattern[]): AccessPattern[] {
    return patterns
      .filter(p => p.avgInterval < 1000) // 平均间隔小于1秒
      .sort((a, b) => a.avgInterval - b.avgInterval)
      .slice(0, 10)
  }

  /**
   * 计算性能指标
   */
  private calculatePerformanceMetrics(): PerformanceMetrics[] {
    const metrics: PerformanceMetrics[] = []
    
    for (const [operation, durations] of this.performanceRecords) {
      if (durations.length === 0) {
        continue
      }
      
      const sorted = [...durations].sort((a, b) => a - b)
      const sum = sorted.reduce((a, b) => a + b, 0)
      
      metrics.push({
        operation: operation as 'get' | 'set' | 'remove' | 'clear',
        avgDuration: sum / sorted.length,
        minDuration: sorted[0] ?? 0,
        maxDuration: sorted[sorted.length - 1] ?? 0,
        count: sorted.length,
        p95Duration: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        p99Duration: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
      })
    }
    
    return metrics
  }

  /**
   * 分析存储
   */
  private async analyzeStorage(): Promise<StorageAnalysis[]> {
    const stats = await this.cache.getStats()
    const results: StorageAnalysis[] = []
    
    for (const [engine, engineStats] of Object.entries(stats.engines)) {
      const maxSize = 'maxSize' in engineStats && typeof engineStats.maxSize === 'number' 
        ? engineStats.maxSize 
        : Infinity
      
      results.push({
        engine: engine as StorageEngine,
        usage: maxSize !== Infinity ? engineStats.size / maxSize : 0,
        itemCount: engineStats.itemCount,
        totalSize: engineStats.size,
        avgItemSize: engineStats.itemCount > 0 
          ? engineStats.size / engineStats.itemCount 
          : 0,
        maxItemSize: 0, // 需要额外统计
        expiredCount: 0, // 需要额外统计
      })
    }
    
    return results
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(
    patterns: AccessPattern[],
    performance: PerformanceMetrics[],
    storage: StorageAnalysis[],
    stats: { hitRate: number, [key: string]: unknown },
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    
    // 检查命中率
    const hitRate = typeof stats.hitRate === 'number' ? stats.hitRate : 0
    if (hitRate < 0.7) {
      suggestions.push({
        type: 'performance',
        severity: 'high',
        title: '低缓存命中率',
        description: `当前缓存命中率为 ${(hitRate * 100).toFixed(1)}%，低于推荐值 70%`,
        recommendation: '考虑增加缓存容量或调整缓存策略',
      })
    }
    
    // 检查热键
    const hotKeys = patterns.filter(p => p.accessCount > 1000)
    if (hotKeys.length > 0) {
      suggestions.push({
        type: 'strategy',
        severity: 'medium',
        title: '检测到热键',
        description: `发现 ${hotKeys.length} 个频繁访问的键`,
        recommendation: '考虑将热键数据存储在内存引擎中以提高性能',
        affectedKeys: hotKeys.map(k => k.key),
      })
    }
    
    // 检查冷数据
    const now = Date.now()
    const coldData = patterns.filter(p => now - p.lastAccess > 86400000) // 1天
    if (coldData.length > patterns.length * 0.3) {
      suggestions.push({
        type: 'storage',
        severity: 'medium',
        title: '存在大量冷数据',
        description: `${(coldData.length / patterns.length * 100).toFixed(1)}% 的数据超过 1 天未访问`,
        recommendation: '考虑清理冷数据或使用 TTL 自动过期',
        affectedKeys: coldData.slice(0, 10).map(k => k.key),
      })
    }
    
    // 检查性能
    const slowOps = performance.filter(p => p.avgDuration > 100)
    if (slowOps.length > 0) {
      suggestions.push({
        type: 'performance',
        severity: 'high',
        title: '检测到慢操作',
        description: `${slowOps.map(o => o.operation).join(', ')} 操作平均耗时超过 100ms`,
        recommendation: '检查存储引擎性能或考虑使用批量操作',
      })
    }
    
    return suggestions
  }

  /**
   * 计算平均响应时间
   */
  private calculateAvgResponseTime(): number {
    const allDurations: number[] = []
    
    for (const durations of this.performanceRecords.values()) {
      allDurations.push(...durations)
    }
    
    if (allDurations.length === 0) {
      return 0
    }
    
    return allDurations.reduce((a, b) => a + b, 0) / allDurations.length
  }

  /**
   * 计算错误率
   */
  private calculateErrorRate(): number {
    const totalOps = Array.from(this.performanceRecords.values())
      .reduce((sum, records) => sum + records.length, 0)
    
    if (totalOps === 0) {
      return 0
    }
    
    return this.errorRecords.length / (totalOps + this.errorRecords.length)
  }

  /**
   * 重置分析数据
   */
  reset(): void {
    this.accessRecords.clear()
    this.performanceRecords.clear()
    this.errorRecords = []
    this.startTime = Date.now()
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    if (typeof this.analysisTimer === 'number') {
      const clearIntervalFn = typeof window !== 'undefined'
        ? window.clearInterval
        : globalThis.clearInterval

      clearIntervalFn(this.analysisTimer)
      this.analysisTimer = undefined
    }

    // 移除事件监听器
    this.cache.off('get', this.handleGet.bind(this))
    this.cache.off('set', this.handleSet.bind(this))
    this.cache.off('remove', this.handleRemove.bind(this))
    this.cache.off('error', this.handleError.bind(this))

    this.reset()
  }
}

/**
 * 创建缓存分析器
 */
export function createCacheAnalyzer(
  cache: CacheManager,
  config?: AnalyzerConfig,
): CacheAnalyzer {
  return new CacheAnalyzer(cache, config)
}
