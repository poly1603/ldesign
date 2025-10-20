/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** FPS（每秒帧数） */
  fps: number
  /** 内存使用（MB） */
  memory: {
    used: number
    total: number
    percentage: number
  }
  /** 执行时间（毫秒） */
  executionTime: Record<string, number>
  /** 调用次数 */
  callCount: Record<string, number>
  /** 平均执行时间（毫秒） */
  averageTime: Record<string, number>
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  /** 报告生成时间 */
  timestamp: number
  /** 性能指标 */
  metrics: PerformanceMetrics
  /** 性能警告 */
  warnings: string[]
  /** 优化建议 */
  suggestions: string[]
}

/**
 * PerformanceMonitor 配置选项
 */
export interface PerformanceMonitorOptions {
  /** 是否启用 */
  enabled?: boolean
  /** FPS 监控间隔（毫秒） */
  fpsInterval?: number
  /** 内存监控间隔（毫秒） */
  memoryInterval?: number
  /** 性能警告阈值 */
  thresholds?: {
    fps?: number // FPS 低于此值时发出警告
    memory?: number // 内存使用率超过此值时发出警告（百分比）
    executionTime?: number // 执行时间超过此值时发出警告（毫秒）
  }
}

/**
 * 高性能监控工具
 *
 * 特性：
 * - FPS 监控
 * - 内存使用监控
 * - 函数执行时间统计
 * - 性能警告和建议
 * - 性能报告生成
 *
 * @example
 * ```typescript
 * // 创建性能监控实例
 * const monitor = new PerformanceMonitor({
 *   enabled: true,
 *   thresholds: {
 *     fps: 30,
 *     memory: 80,
 *     executionTime: 100
 *   }
 * })
 *
 * // 开始监控
 * monitor.start()
 *
 * // 测量函数执行时间
 * monitor.measure('myFunction', () => {
 *   // 代码执行
 * })
 *
 * // 获取性能报告
 * const report = monitor.getReport()
 *
 * // 停止监控
 * monitor.stop()
 * ```
 */
export class PerformanceMonitor {
  private options: Required<PerformanceMonitorOptions>
  private isRunning = false
  private memoryTimer: NodeJS.Timeout | null = null

  // 性能指标
  private metrics: PerformanceMetrics = {
    fps: 60,
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
    executionTime: {},
    callCount: {},
    averageTime: {},
  }

  // 性能警告
  private warnings: string[] = []

  // 计时器存储
  private timers: Map<string, number> = new Map()

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      enabled: true,
      fpsInterval: 1000,
      memoryInterval: 5000,
      thresholds: {
        fps: 30,
        memory: 80,
        executionTime: 100,
        ...options.thresholds,
      },
      ...options,
    }
  }

  /**
   * 启动性能监控
   */
  start(): void {
    if (!this.options.enabled || this.isRunning)
      return

    this.isRunning = true
    this.startFPSMonitoring()
    this.startMemoryMonitoring()
  }

  /**
   * 停止性能监控
   */
  stop(): void {
    if (!this.isRunning)
      return

    this.isRunning = false
    this.stopFPSMonitoring()
    this.stopMemoryMonitoring()
  }

  /**
   * 测量函数执行时间
   *
   * @param name - 函数名称
   * @param fn - 要执行的函数
   * @returns 执行时间（毫秒）
   */
  measure<T>(name: string, fn: () => T): number {
    if (!this.options.enabled) {
      fn()
      return 0
    }

    const startTime = performance.now()
    fn()
    const endTime = performance.now()
    const duration = endTime - startTime

    this.recordExecutionTime(name, duration)

    return duration
  }

  /**
   * 测量异步函数执行时间
   *
   * @param name - 函数名称
   * @param fn - 要执行的异步函数
   * @returns Promise<执行时间（毫秒）>
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<number> {
    if (!this.options.enabled) {
      await fn()
      return 0
    }

    const startTime = performance.now()
    await fn()
    const endTime = performance.now()
    const duration = endTime - startTime

    this.recordExecutionTime(name, duration)

    return duration
  }

  /**
   * 开始计时
   *
   * @param name - 计时器名称
   */
  startTimer(name: string): void {
    if (!this.options.enabled)
      return

    this.timers.set(name, performance.now())
  }

  /**
   * 结束计时
   *
   * @param name - 计时器名称
   * @returns 执行时间（毫秒）
   */
  endTimer(name: string): number {
    if (!this.options.enabled)
      return 0

    const startTime = this.timers.get(name)
    if (startTime === undefined) {
      console.warn(`Timer "${name}" was not started`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    this.timers.delete(name)
    this.recordExecutionTime(name, duration)

    return duration
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.metrics.fps,
      memory: { ...this.metrics.memory },
      executionTime: { ...this.metrics.executionTime },
      callCount: { ...this.metrics.callCount },
      averageTime: { ...this.metrics.averageTime },
    }
  }

  /**
   * 获取性能报告
   */
  getReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      warnings: [...this.warnings],
      suggestions: this.generateSuggestions(),
    }
  }

  /**
   * 清除所有统计数据
   */
  clear(): void {
    this.metrics = {
      fps: 60,
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      executionTime: {},
      callCount: {},
      averageTime: {},
    }
    this.warnings = []
    this.timers.clear()
  }

  /**
   * 导出性能数据（JSON 格式）
   */
  export(): string {
    return JSON.stringify(this.getReport(), null, 2)
  }

  /**
   * 启动 FPS 监控
   */
  private startFPSMonitoring(): void {
    if (typeof window === 'undefined')
      return

    let lastTime = performance.now()
    let frames = 0

    const measureFPS = () => {
      if (!this.isRunning)
        return

      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime

      frames++

      if (deltaTime >= this.options.fpsInterval) {
        this.metrics.fps = Math.round((frames * 1000) / deltaTime)
        frames = 0
        lastTime = currentTime

        // 检查 FPS 警告
        if (this.options.thresholds.fps && this.metrics.fps < this.options.thresholds.fps) {
          this.addWarning(`Low FPS detected: ${this.metrics.fps}`)
        }
      }

      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)
  }

  /**
   * 停止 FPS 监控
   */
  private stopFPSMonitoring(): void {
    // FPS 监控使用 requestAnimationFrame，会自动停止
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !(performance as unknown as { memory?: unknown }).memory)
      return

    this.memoryTimer = setInterval(() => {
      if (!this.isRunning)
        return

      const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      if (memory) {
        this.metrics.memory = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round(
            (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          ),
        }

        // 检查内存警告
        if (this.options.thresholds.memory && this.metrics.memory.percentage > this.options.thresholds.memory) {
          this.addWarning(
            `High memory usage: ${this.metrics.memory.percentage}%`,
          )
        }
      }
    }, this.options.memoryInterval)
  }

  /**
   * 停止内存监控
   */
  private stopMemoryMonitoring(): void {
    if (this.memoryTimer) {
      clearInterval(this.memoryTimer)
      this.memoryTimer = null
    }
  }

  /**
   * 记录执行时间
   */
  private recordExecutionTime(name: string, duration: number): void {
    // 更新调用次数
    this.metrics.callCount[name] = (this.metrics.callCount[name] || 0) + 1

    // 更新执行时间
    this.metrics.executionTime[name] = duration

    // 计算平均执行时间
    const count = this.metrics.callCount[name]
    const oldAverage = this.metrics.averageTime[name] || 0
    this.metrics.averageTime[name]
      = (oldAverage * (count - 1) + duration) / count

    // 检查执行时间警告
    if (this.options.thresholds.executionTime && duration > this.options.thresholds.executionTime) {
      this.addWarning(
        `Slow execution detected for "${name}": ${duration.toFixed(2)}ms`,
      )
    }
  }

  /**
   * 添加警告
   */
  private addWarning(warning: string): void {
    // 避免重复警告（保留最近 10 条）
    if (!this.warnings.includes(warning)) {
      this.warnings.push(warning)
      if (this.warnings.length > 10) {
        this.warnings.shift()
      }
    }
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(): string[] {
    const suggestions: string[] = []

    // FPS 优化建议
    if (this.metrics.fps < 30) {
      suggestions.push(
        'Consider optimizing animations and reducing DOM manipulations',
      )
    }

    // 内存优化建议
    if (this.metrics.memory.percentage > 80) {
      suggestions.push(
        'High memory usage detected. Check for memory leaks and unnecessary object retention',
      )
    }

    // 执行时间优化建议
    const slowFunctions = Object.entries(this.metrics.averageTime)
      .filter(([_, time]) => this.options.thresholds.executionTime ? time > this.options.thresholds.executionTime : false)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    if (slowFunctions.length > 0) {
      suggestions.push(
        `Optimize slow functions: ${slowFunctions.map(([name, time]) => `${name} (${time.toFixed(2)}ms)`).join(', ')}`,
      )
    }

    return suggestions
  }
}

/**
 * 创建默认 PerformanceMonitor 实例
 */
export const defaultPerformanceMonitor = new PerformanceMonitor({
  // eslint-disable-next-line node/prefer-global/process
  enabled: typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development',
  thresholds: {
    fps: 30,
    memory: 80,
    executionTime: 100,
  },
})

/**
 * 便捷方法导出
 */
export const startMonitoring = () => defaultPerformanceMonitor.start()
export const stopMonitoring = () => defaultPerformanceMonitor.stop()
export function measure<T>(name: string, fn: () => T): number {
  return defaultPerformanceMonitor.measure(name, fn)
}
export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<number> {
  return defaultPerformanceMonitor.measureAsync(name, fn)
}
export const getPerformanceReport = () => defaultPerformanceMonitor.getReport()
