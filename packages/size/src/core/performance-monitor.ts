/**
 * 性能监控模块
 * 用于监控尺寸管理器的性能指标
 */

export interface PerformanceMetrics {
  /** CSS 注入次数 */
  cssInjectionCount: number
  /** CSS 注入总耗时（毫秒） */
  cssInjectionTime: number
  /** 模式切换次数 */
  modeSwitchCount: number
  /** 模式切换总耗时（毫秒） */
  modeSwitchTime: number
  /** 事件触发次数 */
  eventEmitCount: number
  /** 内存使用估算（字节） */
  estimatedMemoryUsage: number
  /** 最后一次操作时间戳 */
  lastOperationTimestamp: number
}

export interface PerformanceEntry {
  /** 操作类型 */
  type: 'css-injection' | 'mode-switch' | 'event-emit'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间 */
  duration: number
  /** 额外数据 */
  metadata?: Record<string, any>
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cssInjectionCount: 0,
    cssInjectionTime: 0,
    modeSwitchCount: 0,
    modeSwitchTime: 0,
    eventEmitCount: 0,
    estimatedMemoryUsage: 0,
    lastOperationTimestamp: 0,
  }

  private entries: PerformanceEntry[] = []
  private maxEntries = 100
  private enabled = true

  /**
   * 启用性能监控
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用性能监控
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 开始测量操作
   */
  startMeasure(type: PerformanceEntry['type'], metadata?: Record<string, any>): () => void {
    if (!this.enabled) {
      return () => {}
    }

    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordEntry({
        type,
        startTime,
        endTime,
        duration,
        metadata,
      })

      this.updateMetrics(type, duration)
    }
  }

  /**
   * 记录性能条目
   */
  private recordEntry(entry: PerformanceEntry): void {
    this.entries.push(entry)

    // 限制条目数量
    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }
  }

  /**
   * 更新指标
   */
  private updateMetrics(type: PerformanceEntry['type'], duration: number): void {
    this.metrics.lastOperationTimestamp = Date.now()

    switch (type) {
      case 'css-injection':
        this.metrics.cssInjectionCount++
        this.metrics.cssInjectionTime += duration
        break
      case 'mode-switch':
        this.metrics.modeSwitchCount++
        this.metrics.modeSwitchTime += duration
        break
      case 'event-emit':
        this.metrics.eventEmitCount++
        break
    }

    // 估算内存使用
    this.estimateMemoryUsage()
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): void {
    // 简单估算：每个条目约 200 字节
    const entriesSize = this.entries.length * 200
    // 指标对象约 100 字节
    const metricsSize = 100
    this.metrics.estimatedMemoryUsage = entriesSize + metricsSize
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.metrics }
  }

  /**
   * 获取性能条目
   */
  getEntries(type?: PerformanceEntry['type']): readonly PerformanceEntry[] {
    if (type) {
      return this.entries.filter(entry => entry.type === type)
    }
    return [...this.entries]
  }

  /**
   * 获取平均性能
   */
  getAveragePerformance(): {
    avgCssInjectionTime: number
    avgModeSwitchTime: number
  } {
    return {
      avgCssInjectionTime: this.metrics.cssInjectionCount > 0
        ? this.metrics.cssInjectionTime / this.metrics.cssInjectionCount
        : 0,
      avgModeSwitchTime: this.metrics.modeSwitchCount > 0
        ? this.metrics.modeSwitchTime / this.metrics.modeSwitchCount
        : 0,
    }
  }

  /**
   * 获取性能报告
   */
  getReport(): {
    metrics: PerformanceMetrics
    averages: {
      avgCssInjectionTime: number
      avgModeSwitchTime: number
    }
    recentEntries: PerformanceEntry[]
  } {
    return {
      metrics: this.getMetrics(),
      averages: this.getAveragePerformance(),
      recentEntries: this.entries.slice(-10),
    }
  }

  /**
   * 清空性能数据
   */
  clear(): void {
    this.metrics = {
      cssInjectionCount: 0,
      cssInjectionTime: 0,
      modeSwitchCount: 0,
      modeSwitchTime: 0,
      eventEmitCount: 0,
      estimatedMemoryUsage: 0,
      lastOperationTimestamp: 0,
    }
    this.entries = []
  }

  /**
   * 设置最大条目数
   */
  setMaxEntries(max: number): void {
    this.maxEntries = Math.max(10, max)
    // 如果当前条目超过新的最大值，进行裁剪
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries)
    }
  }

  /**
   * 导出性能数据为 JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      metrics: this.metrics,
      entries: this.entries,
      timestamp: Date.now(),
    }, null, 2)
  }

  /**
   * 打印性能报告到控制台
   */
  printReport(): void {
    const report = this.getReport()
    console.group('📊 Size Manager Performance Report')
    console.log('Metrics:', report.metrics)
    console.log('Averages:', report.averages)
    console.log('Recent Entries:', report.recentEntries)
    console.groupEnd()
  }
}

/**
 * 全局性能监控器实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor()

