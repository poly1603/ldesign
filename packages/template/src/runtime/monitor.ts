/**
 * 性能监控器
 * 
 * 监控和统计模板加载性能
 */

import type { TemplateId, PerformanceMetrics } from '../types'
import { PERFORMANCE_THRESHOLDS } from '../utils/constants'

/**
 * 性能记录
 */
interface PerformanceRecord {
  id: TemplateId
  loadTime: number
  cached: boolean
  timestamp: number
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private records: PerformanceRecord[] = []
  private maxRecords: number
  private enabled: boolean

  constructor(options: { maxRecords?: number; enabled?: boolean } = {}) {
    this.maxRecords = options.maxRecords || 100
    this.enabled = options.enabled ?? true
  }

  /**
   * 记录加载时间
   */
  recordLoad(id: TemplateId, loadTime: number, cached: boolean): void {
    if (!this.enabled) return

    const record: PerformanceRecord = {
      id,
      loadTime,
      cached,
      timestamp: Date.now(),
    }

    this.records.push(record)

    // 限制记录数量
    if (this.records.length > this.maxRecords) {
      this.records.shift()
    }

    // 检查慢加载
    if (loadTime > PERFORMANCE_THRESHOLDS.SLOW_LOAD) {
      const level = loadTime > PERFORMANCE_THRESHOLDS.VERY_SLOW_LOAD ? 'error' : 'warn'
      console[level](
        `[Monitor] Slow template load detected: ${id} (${loadTime}ms)`
      )
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    if (this.records.length === 0) {
      return {
        loadCount: 0,
        avgLoadTime: 0,
        minLoadTime: 0,
        maxLoadTime: 0,
        cacheHitRate: 0,
        errorCount: 0,
      }
    }

    const loadTimes = this.records.map(r => r.loadTime)
    const cachedCount = this.records.filter(r => r.cached).length

    return {
      loadCount: this.records.length,
      avgLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      cacheHitRate: cachedCount / this.records.length,
      errorCount: 0, // 错误计数需要单独维护
    }
  }

  /**
   * 获取指定模板的性能记录
   */
  getRecords(id?: TemplateId): PerformanceRecord[] {
    if (id) {
      return this.records.filter(r => r.id === id)
    }
    return [...this.records]
  }

  /**
   * 获取最近的N条记录
   */
  getRecentRecords(count: number): PerformanceRecord[] {
    return this.records.slice(-count)
  }

  /**
   * 清空记录
   */
  clearRecords(): void {
    this.records = []
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * 获取监控状态
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 设置最大记录数
   */
  setMaxRecords(max: number): void {
    this.maxRecords = max
    // 如果当前记录超过新的最大值，删除旧记录
    while (this.records.length > this.maxRecords) {
      this.records.shift()
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const slowLoads = this.records.filter(
      r => r.loadTime > PERFORMANCE_THRESHOLDS.SLOW_LOAD
    )

    return `
Performance Report:
==================
Total Loads: ${metrics.loadCount}
Avg Load Time: ${metrics.avgLoadTime.toFixed(2)}ms
Min Load Time: ${metrics.minLoadTime}ms
Max Load Time: ${metrics.maxLoadTime}ms
Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%
Slow Loads: ${slowLoads.length} (${((slowLoads.length / metrics.loadCount) * 100).toFixed(2)}%)
    `.trim()
  }

  /**
   * 导出数据（用于分析）
   */
  exportData(): {
    metrics: PerformanceMetrics
    records: PerformanceRecord[]
    timestamp: number
  } {
    return {
      metrics: this.getMetrics(),
      records: [...this.records],
      timestamp: Date.now(),
    }
  }
}

// 单例实例
let instance: PerformanceMonitor | null = null

/**
 * 获取性能监控器实例
 */
export function getMonitor(): PerformanceMonitor {
  if (!instance) {
    instance = new PerformanceMonitor()
  }
  return instance
}

/**
 * 重置性能监控器
 */
export function resetMonitor(): void {
  if (instance) {
    instance.clearRecords()
    instance = null
  }
}
