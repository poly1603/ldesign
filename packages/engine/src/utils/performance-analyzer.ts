/**
 * 性能分析工具
 * 
 * 提供详细的性能监控、分析和报告功能
 */

export interface PerformanceMeasure {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface PerformanceReport {
  measures: Record<string, {
    count: number
    average: number
    min: number
    max: number
    total: number
    exceedsThreshold: boolean
    p95: number
    p99: number
  }>
  warnings: string[]
  memoryUsage?: {
    used: number
    total: number
    percentage: number
  }
  timestamp: number
}

/**
 * 性能监控工具增强
 */
export class PerformanceAnalyzer {
  private measures = new Map<string, number[]>()
  private marks = new Map<string, number>()
  private thresholds = new Map<string, number>()
  private warnings: string[] = []
  private metadata = new Map<string, Record<string, unknown>>()
  
  // 配置选项
  private maxMeasures = 1000 // 每个指标最大保留的测量数据
  private maxWarnings = 50   // 最大警告数量
  
  /**
   * 开始计时
   */
  start(name: string, metadata?: Record<string, unknown>): void {
    this.marks.set(name, performance.now())
    if (metadata) {
      this.metadata.set(name, metadata)
    }
  }
  
  /**
   * 结束计时并记录
   */
  end(name: string, threshold?: number): number {
    const startMark = this.marks.get(name)
    if (startMark === undefined) {
      console.warn(`No start mark found for "${name}"`)
      return 0
    }
    
    const endTime = performance.now()
    const duration = endTime - startMark
    
    // 记录测量结果
    const measures = this.measures.get(name) || []
    measures.push(duration)
    
    // 限制数据量
    if (measures.length > this.maxMeasures) {
      measures.shift() // 移除最旧的数据
    }
    
    this.measures.set(name, measures)
    
    // 设置阈值
    if (threshold !== undefined) {
      this.thresholds.set(name, threshold)
    }
    
    // 检查是否超过阈值
    const existingThreshold = this.thresholds.get(name)
    if (existingThreshold !== undefined && duration > existingThreshold) {
      const warning = `Performance warning: "${name}" took ${duration.toFixed(2)}ms, exceeding threshold of ${existingThreshold}ms`
      this.addWarning(warning)
    }
    
    // 清理标记和元数据
    this.marks.delete(name)
    this.metadata.delete(name)
    
    return duration
  }
  
  /**
   * 设置性能阈值
   */
  setThreshold(name: string, threshold: number): void {
    this.thresholds.set(name, threshold)
  }
  
  /**
   * 添加警告
   */
  private addWarning(warning: string): void {
    this.warnings.push(warning)
    
    // 限制警告数量
    if (this.warnings.length > this.maxWarnings) {
      this.warnings.shift()
    }
    
    console.warn(warning)
  }
  
  /**
   * 计算百分位数
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)] || 0
  }
  
  /**
   * 获取性能报告
   */
  getReport(): PerformanceReport {
    const result: Record<string, any> = {}
    
    for (const [name, durations] of this.measures.entries()) {
      if (durations.length === 0) continue
      
      const total = durations.reduce((sum, d) => sum + d, 0)
      const average = total / durations.length
      const min = Math.min(...durations)
      const max = Math.max(...durations)
      const threshold = this.thresholds.get(name)
      
      result[name] = {
        count: durations.length,
        average: Math.round(average * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        total: Math.round(total * 100) / 100,
        exceedsThreshold: threshold !== undefined && max > threshold,
        p95: Math.round(this.calculatePercentile(durations, 95) * 100) / 100,
        p99: Math.round(this.calculatePercentile(durations, 99) * 100) / 100,
      }
    }
    
    // 获取内存使用信息（如果可用）
    let memoryUsage: PerformanceReport['memoryUsage']
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      }
    }
    
    return {
      measures: result,
      warnings: [...this.warnings],
      memoryUsage,
      timestamp: Date.now(),
    }
  }
  
  /**
   * 清除所有测量数据
   */
  clear(): void {
    this.measures.clear()
    this.marks.clear()
    this.warnings = []
    this.metadata.clear()
  }
  
  /**
   * 清除特定指标的数据
   */
  clearMetric(name: string): void {
    this.measures.delete(name)
    this.marks.delete(name)
    this.thresholds.delete(name)
    this.metadata.delete(name)
  }
  
  /**
   * 获取指标概要
   */
  getSummary(): {
    totalMetrics: number
    totalMeasures: number
    activeMarks: number
    averagePerformance: number
    slowestMetric?: string
  } {
    let totalMeasures = 0
    let totalDuration = 0
    let slowestMetric: string | undefined
    let slowestTime = 0
    
    for (const [name, durations] of this.measures.entries()) {
      totalMeasures += durations.length
      const total = durations.reduce((sum, d) => sum + d, 0)
      totalDuration += total
      
      const max = Math.max(...durations)
      if (max > slowestTime) {
        slowestTime = max
        slowestMetric = name
      }
    }
    
    return {
      totalMetrics: this.measures.size,
      totalMeasures,
      activeMarks: this.marks.size,
      averagePerformance: totalMeasures > 0 ? totalDuration / totalMeasures : 0,
      slowestMetric,
    }
  }
  
  /**
   * 生成性能分析HTML报告
   */
  generateHtmlReport(): string {
    const report = this.getReport()
    const summary = this.getSummary()
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Performance Analysis Report</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 20px; 
            background: #f5f5f5;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 2px solid #007acc;
            margin-bottom: 20px;
            padding-bottom: 10px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .summary-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #007acc;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px;
          }
          th, td { 
            padding: 12px 8px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
          }
          th {
            background: #007acc;
            color: white;
            font-weight: 600;
          }
          tr:hover { 
            background-color: #f5f5f5; 
          }
          .warning { 
            color: #d73502; 
            font-weight: 600;
          }
          .good { 
            color: #28a745; 
          }
          .memory-info {
            background: #e9ecef;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .warnings-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .warnings-section h3 {
            color: #856404;
            margin-top: 0;
          }
          .warning-item {
            background: white;
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
            border-left: 4px solid #d73502;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Performance Analysis Report</h1>
            <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Metrics</h3>
              <div class="value">${summary.totalMetrics}</div>
            </div>
            <div class="summary-card">
              <h3>Total Measures</h3>
              <div class="value">${summary.totalMeasures}</div>
            </div>
            <div class="summary-card">
              <h3>Average Time</h3>
              <div class="value">${summary.averagePerformance.toFixed(2)}ms</div>
            </div>
            <div class="summary-card">
              <h3>Active Marks</h3>
              <div class="value">${summary.activeMarks}</div>
            </div>
          </div>
          
          ${report.memoryUsage ? `
            <div class="memory-info">
              <h3>💾 Memory Usage</h3>
              <p><strong>Used:</strong> ${report.memoryUsage.used}MB</p>
              <p><strong>Total:</strong> ${report.memoryUsage.total}MB</p>
              <p><strong>Usage:</strong> <span class="${report.memoryUsage.percentage > 80 ? 'warning' : 'good'}">${report.memoryUsage.percentage}%</span></p>
            </div>
          ` : ''}
          
          <h2>📊 Performance Metrics</h2>
          <table>
            <tr>
              <th>Metric Name</th>
              <th>Count</th>
              <th>Average (ms)</th>
              <th>Min (ms)</th>
              <th>Max (ms)</th>
              <th>P95 (ms)</th>
              <th>P99 (ms)</th>
              <th>Total (ms)</th>
              <th>Status</th>
            </tr>
            ${Object.entries(report.measures).map(([name, data]) => `
              <tr ${data.exceedsThreshold ? 'class="warning"' : ''}>
                <td><strong>${name}</strong></td>
                <td>${data.count}</td>
                <td>${data.average}</td>
                <td>${data.min}</td>
                <td>${data.max}</td>
                <td>${data.p95}</td>
                <td>${data.p99}</td>
                <td>${data.total}</td>
                <td>
                  ${data.exceedsThreshold 
                    ? '<span class="warning">⚠️ Slow</span>' 
                    : '<span class="good">✅ Good</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </table>
          
          ${report.warnings.length > 0 ? `
            <div class="warnings-section">
              <h3>⚠️ Performance Warnings</h3>
              ${report.warnings.map(warning => `
                <div class="warning-item">${warning}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * 装饰器：自动监控方法性能
   */
  static monitor(analyzer: PerformanceAnalyzer, threshold?: number) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value
      
      descriptor.value = function(...args: any[]) {
        const methodName = `${target.constructor.name}.${propertyKey}`
        analyzer.start(methodName)
        
        try {
          const result = originalMethod.apply(this, args)
          
          // 处理异步方法
          if (result instanceof Promise) {
            return result.finally(() => {
              analyzer.end(methodName, threshold)
            })
          } else {
            analyzer.end(methodName, threshold)
            return result
          }
        } catch (error) {
          analyzer.end(methodName, threshold)
          throw error
        }
      }
      
      return descriptor
    }
  }
}

// 全局性能分析器实例
export const globalPerformanceAnalyzer = new PerformanceAnalyzer()

/**
 * 便捷的性能监控函数
 */
export function measurePerformance<T>(
  name: string, 
  fn: () => T | Promise<T>,
  threshold?: number
): T | Promise<T> {
  globalPerformanceAnalyzer.start(name)
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        globalPerformanceAnalyzer.end(name, threshold)
      }) as Promise<T>
    } else {
      globalPerformanceAnalyzer.end(name, threshold)
      return result
    }
  } catch (error) {
    globalPerformanceAnalyzer.end(name, threshold)
    throw error
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number
  
  constructor(
    createFn: () => T, 
    resetFn?: (obj: T) => void, 
    maxSize: number = 100
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }
  
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }
  
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj)
      }
      this.pool.push(obj)
    }
  }
  
  clear(): void {
    this.pool.length = 0
  }
  
  size(): number {
    return this.pool.length
  }
}

/**
 * 批处理器
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private processor: (items: T[]) => void | Promise<void>
  private batchSize: number
  private flushTimeout?: NodeJS.Timeout
  private flushInterval: number
  
  constructor(
    processor: (items: T[]) => void | Promise<void>,
    batchSize: number = 100,
    flushInterval: number = 1000
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.flushInterval = flushInterval
  }
  
  add(item: T): void {
    this.queue.push(item)
    
    if (this.queue.length >= this.batchSize) {
      this.flush()
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flush()
      }, this.flushInterval)
    }
  }
  
  async flush(): Promise<void> {
    if (this.queue.length === 0) return
    
    const items = this.queue.splice(0)
    
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = undefined
    }
    
    try {
      await this.processor(items)
    } catch (error) {
      console.error('Batch processor error:', error)
    }
  }
  
  destroy(): void {
    this.flush()
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = undefined
    }
  }
}
