/**
 * @ldesign/size - Performance Diagnostics
 * 
 * 性能监控和诊断工具集
 */

export interface PerformanceMark {
  name: string
  startTime: number
  duration?: number
  metadata?: Record<string, any>
}

export interface PerformanceSnapshot {
  timestamp: number
  marks: PerformanceMark[]
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
    percentage: number
  }
  caches: {
    size: Map<string, number>
    fluidSize: Map<string, number>
    conversion: Map<string, number>
    [key: string]: Map<string, number>
  }
  fps?: number
  longTasks?: number
}

/**
 * 性能诊断器
 */
export class PerformanceDiagnostics {
  private static instance: PerformanceDiagnostics
  private marks = new Map<string, PerformanceMark>()
  private snapshots: PerformanceSnapshot[] = []
  private maxSnapshots = 100
  private fpsHistory: number[] = []
  private lastFrameTime = 0
  private frameCount = 0
  private rafId: number | null = null
  private isMonitoring = false
  
  static getInstance(): PerformanceDiagnostics {
    if (!PerformanceDiagnostics.instance) {
      PerformanceDiagnostics.instance = new PerformanceDiagnostics()
    }
    return PerformanceDiagnostics.instance
  }
  
  /**
   * 开始性能标记
   */
  mark(name: string, metadata?: Record<string, any>): void {
    const mark: PerformanceMark = {
      name,
      startTime: performance.now(),
      metadata
    }
    this.marks.set(name, mark)
    
    // 使用原生 Performance API
    if (typeof performance.mark === 'function') {
      try {
        performance.mark(name)
      } catch {
        // 静默失败
      }
    }
  }
  
  /**
   * 结束性能标记并计算持续时间
   */
  measure(name: string): number | null {
    const mark = this.marks.get(name)
    if (!mark) {
      console.warn(`[PerformanceDiagnostics] No mark found for: ${name}`)
      return null
    }
    
    const duration = performance.now() - mark.startTime
    mark.duration = duration
    
    // 使用原生 Performance API
    if (typeof performance.measure === 'function') {
      try {
        performance.measure(`${name}-measure`, name)
      } catch {
        // 静默失败
      }
    }
    
    return duration
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): PerformanceSnapshot['memory'] | null {
    if (typeof performance === 'undefined') return null
    
    const memory = (performance as any).memory
    if (!memory) return null
    
    const used = memory.usedJSHeapSize
    const limit = memory.jsHeapSizeLimit
    
    return {
      usedJSHeapSize: used,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: limit,
      percentage: (used / limit) * 100
    }
  }
  
  /**
   * 开始 FPS 监控
   */
  startFPSMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    this.frameCount = 0
    
    const measureFPS = (currentTime: number) => {
      if (!this.isMonitoring) return
      
      this.frameCount++
      const deltaTime = currentTime - this.lastFrameTime
      
      // 每秒计算一次 FPS
      if (deltaTime >= 1000) {
        const fps = Math.round((this.frameCount / deltaTime) * 1000)
        this.fpsHistory.push(fps)
        
        // 只保留最近 60 个 FPS 值
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift()
        }
        
        this.frameCount = 0
        this.lastFrameTime = currentTime
      }
      
      this.rafId = requestAnimationFrame(measureFPS)
    }
    
    this.rafId = requestAnimationFrame(measureFPS)
  }
  
  /**
   * 停止 FPS 监控
   */
  stopFPSMonitoring(): void {
    this.isMonitoring = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
  
  /**
   * 获取平均 FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0
    return Math.round(
      this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
    )
  }
  
  /**
   * 创建性能快照
   */
  createSnapshot(caches?: Record<string, Map<string, any>>): PerformanceSnapshot {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      marks: Array.from(this.marks.values()),
      memory: this.getMemoryUsage() || undefined,
      caches: {
        size: new Map(),
        fluidSize: new Map(),
        conversion: new Map()
      },
      fps: this.getAverageFPS() || undefined
    }
    
    // 收集缓存统计
    if (caches) {
      Object.entries(caches).forEach(([name, cache]) => {
        if (cache instanceof Map) {
          const stats = new Map<string, number>()
          stats.set('size', cache.size)
          snapshot.caches[name] = stats
        }
      })
    }
    
    // 保存快照
    this.snapshots.push(snapshot)
    
    // LRU 策略
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }
    
    return snapshot
  }
  
  /**
   * 获取所有快照
   */
  getSnapshots(): PerformanceSnapshot[] {
    return [...this.snapshots]
  }
  
  /**
   * 清除所有数据
   */
  clear(): void {
    this.marks.clear()
    this.snapshots = []
    this.fpsHistory = []
    this.stopFPSMonitoring()
    
    // 清除原生 Performance API 标记
    if (typeof performance.clearMarks === 'function') {
      try {
        performance.clearMarks()
        performance.clearMeasures()
      } catch {
        // 静默失败
      }
    }
  }
  
  /**
   * 生成性能报告
   */
  generateReport(): string {
    const report: string[] = []
    
    report.push('='.repeat(60))
    report.push('          性能诊断报告')
    report.push('='.repeat(60))
    report.push('')
    
    // 内存使用
    const memory = this.getMemoryUsage()
    if (memory) {
      report.push('📊 内存使用情况:')
      report.push(`  已用内存: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
      report.push(`  总内存: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
      report.push(`  内存限制: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`)
      report.push(`  使用率: ${memory.percentage.toFixed(1)}%`)
      report.push('')
    }
    
    // FPS 统计
    const avgFPS = this.getAverageFPS()
    if (avgFPS > 0) {
      report.push('🎯 帧率统计:')
      report.push(`  平均 FPS: ${avgFPS}`)
      report.push(`  最低 FPS: ${Math.min(...this.fpsHistory)}`)
      report.push(`  最高 FPS: ${Math.max(...this.fpsHistory)}`)
      report.push('')
    }
    
    // 性能标记
    if (this.marks.size > 0) {
      report.push('⏱️  性能标记:')
      const sortedMarks = Array.from(this.marks.values())
        .filter(m => m.duration !== undefined)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      
      sortedMarks.forEach(mark => {
        report.push(`  ${mark.name}: ${mark.duration!.toFixed(2)}ms`)
      })
      report.push('')
    }
    
    // 快照统计
    if (this.snapshots.length > 0) {
      report.push('📸 快照统计:')
      report.push(`  总快照数: ${this.snapshots.length}`)
      const latest = this.snapshots[this.snapshots.length - 1]
      if (latest) {
        report.push(`  最新快照时间: ${new Date(latest.timestamp).toLocaleString()}`)
      }
      report.push('')
    }
    
    report.push('='.repeat(60))
    
    return report.join('\n')
  }
  
  /**
   * 控制台输出报告
   */
  logReport(): void {
    console.log(this.generateReport())
  }
  
  /**
   * 检测性能瓶颈
   */
  detectBottlenecks(): {
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
  }[] {
    const bottlenecks: ReturnType<typeof this.detectBottlenecks> = []
    
    // 检查内存使用
    const memory = this.getMemoryUsage()
    if (memory) {
      if (memory.percentage > 90) {
        bottlenecks.push({
          type: 'memory',
          severity: 'high',
          message: `内存使用率过高: ${memory.percentage.toFixed(1)}%`
        })
      } else if (memory.percentage > 70) {
        bottlenecks.push({
          type: 'memory',
          severity: 'medium',
          message: `内存使用率较高: ${memory.percentage.toFixed(1)}%`
        })
      }
    }
    
    // 检查 FPS
    const avgFPS = this.getAverageFPS()
    if (avgFPS > 0) {
      if (avgFPS < 30) {
        bottlenecks.push({
          type: 'fps',
          severity: 'high',
          message: `平均 FPS 过低: ${avgFPS}`
        })
      } else if (avgFPS < 50) {
        bottlenecks.push({
          type: 'fps',
          severity: 'medium',
          message: `平均 FPS 较低: ${avgFPS}`
        })
      }
    }
    
    // 检查慢操作
    const slowMarks = Array.from(this.marks.values())
      .filter(m => m.duration !== undefined && m.duration > 100)
    
    if (slowMarks.length > 0) {
      bottlenecks.push({
        type: 'slow-operation',
        severity: 'medium',
        message: `检测到 ${slowMarks.length} 个慢操作 (>100ms)`
      })
    }
    
    return bottlenecks
  }
}

// 导出便捷实例
export const perf = PerformanceDiagnostics.getInstance()

// 便捷方法
export const perfDiagnostics = {
  mark: (name: string, metadata?: Record<string, any>) => perf.mark(name, metadata),
  measure: (name: string) => perf.measure(name),
  startFPS: () => perf.startFPSMonitoring(),
  stopFPS: () => perf.stopFPSMonitoring(),
  snapshot: (caches?: Record<string, Map<string, any>>) => perf.createSnapshot(caches),
  report: () => perf.logReport(),
  bottlenecks: () => perf.detectBottlenecks(),
  clear: () => perf.clear()
}

