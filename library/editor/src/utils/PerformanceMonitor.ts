/**
 * 性能监控工具
 * 监控编辑器性能指标，帮助优化性能问题
 */

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  fps: number
  eventCount: number
  pluginCount: number
  activePlugins: number
}

export interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  metadata?: Record<string, any>
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    eventCount: 0,
    pluginCount: 0,
    activePlugins: 0
  }
  
  private entries: PerformanceEntry[] = []
  private timers: Map<string, number> = new Map()
  private fpsFrames: number[] = []
  private lastFrameTime: number = 0
  private maxEntries: number = 1000
  
  constructor() {
    this.startFPSMonitoring()
    this.startMemoryMonitoring()
  }
  
  /**
   * 开始计时
   */
  start(name: string): void {
    this.timers.set(name, performance.now())
  }
  
  /**
   * 结束计时
   */
  end(name: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name)
    
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`)
      return 0
    }
    
    const duration = performance.now() - startTime
    this.timers.delete(name)
    
    this.addEntry({
      name,
      startTime,
      duration,
      metadata
    })
    
    return duration
  }
  
  /**
   * 测量函数执行时间
   */
  async measure<T>(name: string, fn: () => T | Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.start(name)
    try {
      const result = await fn()
      this.end(name, metadata)
      return result
    } catch (error) {
      this.end(name, { ...metadata, error: true })
      throw error
    }
  }
  
  /**
   * 记录性能条目
   */
  private addEntry(entry: PerformanceEntry): void {
    this.entries.push(entry)
    
    // 限制条目数量
    if (this.entries.length > this.maxEntries) {
      this.entries.shift()
    }
  }
  
  /**
   * 开始FPS监控
   */
  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime
        const fps = 1000 / delta
        this.fpsFrames.push(fps)
        
        // 保持最近60帧
        if (this.fpsFrames.length > 60) {
          this.fpsFrames.shift()
        }
        
        // 计算平均FPS
        this.metrics.fps = Math.round(
          this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length
        )
      }
      
      this.lastFrameTime = timestamp
      requestAnimationFrame(measureFPS)
    }
    
    requestAnimationFrame(measureFPS)
  }
  
  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory) {
          this.metrics.memoryUsage = Math.round(
            memory.usedJSHeapSize / 1048576 // 转换为MB
          )
        }
      }, 5000)
    }
  }
  
  /**
   * 更新指标
   */
  updateMetrics(updates: Partial<PerformanceMetrics>): void {
    Object.assign(this.metrics, updates)
  }
  
  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }
  
  /**
   * 获取性能条目
   */
  getEntries(name?: string): PerformanceEntry[] {
    if (name) {
      return this.entries.filter(e => e.name === name)
    }
    return [...this.entries]
  }
  
  /**
   * 获取统计信息
   */
  getStats(name?: string): {
    count: number
    total: number
    average: number
    min: number
    max: number
  } {
    const entries = name ? this.getEntries(name) : this.entries
    
    if (entries.length === 0) {
      return { count: 0, total: 0, average: 0, min: 0, max: 0 }
    }
    
    const durations = entries.map(e => e.duration)
    const total = durations.reduce((a, b) => a + b, 0)
    
    return {
      count: entries.length,
      total,
      average: total / entries.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    }
  }
  
  /**
   * 获取慢操作
   */
  getSlowOperations(threshold: number = 100): PerformanceEntry[] {
    return this.entries.filter(e => e.duration > threshold)
  }
  
  /**
   * 生成报告
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const stats = this.getStats()
    const slowOps = this.getSlowOperations()
    
    return `
性能报告
========

基础指标:
- 加载时间: ${metrics.loadTime.toFixed(2)}ms
- 渲染时间: ${metrics.renderTime.toFixed(2)}ms
- 内存使用: ${metrics.memoryUsage}MB
- FPS: ${metrics.fps}
- 事件数: ${metrics.eventCount}
- 插件总数: ${metrics.pluginCount}
- 活跃插件: ${metrics.activePlugins}

性能统计:
- 操作总数: ${stats.count}
- 总耗时: ${stats.total.toFixed(2)}ms
- 平均耗时: ${stats.average.toFixed(2)}ms
- 最小耗时: ${stats.min.toFixed(2)}ms
- 最大耗时: ${stats.max.toFixed(2)}ms

慢操作 (>100ms):
${slowOps.map(op => `- ${op.name}: ${op.duration.toFixed(2)}ms`).join('\n') || '无'}

建议:
${this.generateRecommendations()}
    `.trim()
  }
  
  /**
   * 生成优化建议
   */
  private generateRecommendations(): string {
    const recommendations: string[] = []
    const metrics = this.getMetrics()
    const slowOps = this.getSlowOperations()
    
    if (metrics.fps < 30) {
      recommendations.push('- FPS过低，考虑减少DOM操作或启用虚拟滚动')
    }
    
    if (metrics.memoryUsage > 100) {
      recommendations.push('- 内存使用较高，检查是否存在内存泄漏')
    }
    
    if (slowOps.length > 10) {
      recommendations.push('- 存在大量慢操作，考虑优化或使用Web Worker')
    }
    
    if (metrics.loadTime > 3000) {
      recommendations.push('- 加载时间较长，考虑代码分割和懒加载')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- 性能表现良好！')
    }
    
    return recommendations.join('\n')
  }
  
  /**
   * 清空数据
   */
  clear(): void {
    this.entries = []
    this.timers.clear()
    this.fpsFrames = []
  }
  
  /**
   * 导出数据
   */
  export(): {
    metrics: PerformanceMetrics
    entries: PerformanceEntry[]
    timestamp: number
  } {
    return {
      metrics: this.getMetrics(),
      entries: this.getEntries(),
      timestamp: Date.now()
    }
  }
}

// 全局单例
let globalMonitor: PerformanceMonitor | null = null

/**
 * 获取全局性能监控器
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor()
  }
  return globalMonitor
}

/**
 * 便捷函数：测量函数执行时间
 */
export async function measure<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  return getPerformanceMonitor().measure(name, fn)
}

/**
 * 便捷函数：开始计时
 */
export function startTimer(name: string): void {
  getPerformanceMonitor().start(name)
}

/**
 * 便捷函数：结束计时
 */
export function endTimer(name: string): number {
  return getPerformanceMonitor().end(name)
}






