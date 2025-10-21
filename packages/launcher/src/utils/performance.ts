/**
 * 性能监控工具函数
 * 
 * 提供性能监控、分析和优化建议的工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 内存使用情况 */
  memory: {
    used: number
    total: number
    percentage: number
    heapUsed: number
    heapTotal: number
    external: number
  }

  /** CPU 使用情况 */
  cpu: {
    usage: number
    loadAverage: number[]
    userTime: number
    systemTime: number
  }

  /** 启动时间 */
  startupTime: number

  /** 构建时间 */
  buildTime: number

  /** 热更新时间 */
  hmrTime: number

  /** 文件变更响应时间 */
  fileChangeResponseTime: number

  /** 事件循环延迟 */
  eventLoopDelay: number

  /** 垃圾回收统计 */
  gc?: {
    count: number
    totalTime: number
    averageTime: number
  }
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private startTime: number = Date.now()
  private metrics: PerformanceMetrics
  private intervals: NodeJS.Timeout[] = []
  private gcStats: { count: number; totalTime: number } = { count: 0, totalTime: 0 }

  constructor() {
    this.metrics = this.getInitialMetrics()
    this.setupGCMonitoring()
  }

  /**
   * 获取初始指标
   */
  private getInitialMetrics(): PerformanceMetrics {
    return {
      memory: { used: 0, total: 0, percentage: 0, heapUsed: 0, heapTotal: 0, external: 0 },
      cpu: { usage: 0, loadAverage: [], userTime: 0, systemTime: 0 },
      startupTime: 0,
      buildTime: 0,
      hmrTime: 0,
      fileChangeResponseTime: 0,
      eventLoopDelay: 0
    }
  }

  /**
   * 设置垃圾回收监控
   */
  private setupGCMonitoring(): void {
    try {
      // 尝试启用 GC 监控（需要 --expose-gc 标志）
      if (global.gc) {
        const originalGC = global.gc
          ; (global as any).gc = () => {
            const start = Date.now()
            originalGC()
            const duration = Date.now() - start

            this.gcStats.count++
            this.gcStats.totalTime += duration
          }
      }
    } catch (error) {
      // GC 监控不可用
    }
  }

  /**
   * 开始监控
   * 
   * @param interval - 监控间隔（毫秒）
   */
  start(interval: number = 1000): void {
    // 内存监控
    const memoryInterval = setInterval(() => {
      this.updateMemoryMetrics()
    }, interval)

    // CPU 监控
    const cpuInterval = setInterval(() => {
      this.updateCpuMetrics()
    }, interval)

    // 事件循环延迟监控
    const eventLoopInterval = setInterval(() => {
      this.updateEventLoopDelay()
    }, interval)

    this.intervals.push(memoryInterval, cpuInterval, eventLoopInterval)
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
  }

  /**
   * 更新内存指标
   */
  private updateMemoryMetrics(): void {
    const memUsage = process.memoryUsage()
    const totalMemory = require('os').totalmem()

    this.metrics.memory = {
      used: memUsage.rss,
      total: totalMemory,
      percentage: (memUsage.rss / totalMemory) * 100,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    }
  }

  /**
   * 更新 CPU 指标
   */
  private updateCpuMetrics(): void {
    const cpuUsage = process.cpuUsage()
    const loadAverage = require('os').loadavg()

    this.metrics.cpu = {
      usage: 0, // 需要计算差值
      loadAverage,
      userTime: cpuUsage.user,
      systemTime: cpuUsage.system
    }
  }

  /**
   * 更新事件循环延迟
   */
  private updateEventLoopDelay(): void {
    const start = process.hrtime.bigint()
    setImmediate(() => {
      const delay = Number(process.hrtime.bigint() - start) / 1000000 // 转换为毫秒
      this.metrics.eventLoopDelay = delay
    })
  }

  /**
   * 记录启动时间
   */
  recordStartupTime(): void {
    this.metrics.startupTime = Date.now() - this.startTime
  }

  /**
   * 记录构建时间
   * 
   * @param duration - 构建持续时间
   */
  recordBuildTime(duration: number): void {
    this.metrics.buildTime = duration
  }

  /**
   * 记录热更新时间
   * 
   * @param duration - 热更新持续时间
   */
  recordHmrTime(duration: number): void {
    this.metrics.hmrTime = duration
  }

  /**
   * 记录文件变更响应时间
   * 
   * @param duration - 响应时间
   */
  recordFileChangeResponseTime(duration: number): void {
    this.metrics.fileChangeResponseTime = duration
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    // 更新 GC 统计
    if (this.gcStats.count > 0) {
      this.metrics.gc = {
        count: this.gcStats.count,
        totalTime: this.gcStats.totalTime,
        averageTime: this.gcStats.totalTime / this.gcStats.count
      }
    }

    return { ...this.metrics }
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.startTime = Date.now()
    this.metrics = this.getInitialMetrics()
    this.gcStats = { count: 0, totalTime: 0 }
  }
}

/**
 * 测量函数执行时间
 * 
 * @param fn - 要测量的函数
 * @returns 执行结果和时间
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T> | T
): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start

  return { result, duration }
}

/**
 * 创建性能计时器
 * 
 * @param name - 计时器名称
 * @returns 计时器对象
 */
export function createTimer(name: string) {
  const start = Date.now()

  return {
    name,
    start,
    end(): number {
      const duration = Date.now() - start
      console.log(`⏱️  ${name}: ${duration}ms`)
      return duration
    },
    lap(label: string): number {
      const duration = Date.now() - start
      console.log(`⏱️  ${name} (${label}): ${duration}ms`)
      return duration
    }
  }
}

/**
 * 获取系统资源使用情况
 * 
 * @returns 系统资源信息
 */
export function getSystemResources(): {
  memory: {
    total: number
    free: number
    used: number
    percentage: number
  }
  cpu: {
    count: number
    model: string
    speed: number
    loadAverage: number[]
  }
  uptime: number
} {
  const os = require('os')
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const usedMemory = totalMemory - freeMemory

  const cpus = os.cpus()

  return {
    memory: {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      percentage: (usedMemory / totalMemory) * 100
    },
    cpu: {
      count: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      loadAverage: os.loadavg()
    },
    uptime: os.uptime()
  }
}

/**
 * 检查性能警告
 * 
 * @param metrics - 性能指标
 * @returns 警告列表
 */
export function checkPerformanceWarnings(metrics: PerformanceMetrics): Array<{
  type: 'memory' | 'cpu' | 'eventLoop' | 'gc'
  level: 'warning' | 'critical'
  message: string
  value: number
  threshold: number
}> {
  const warnings: Array<{
    type: 'memory' | 'cpu' | 'eventLoop' | 'gc'
    level: 'warning' | 'critical'
    message: string
    value: number
    threshold: number
  }> = []

  // 内存使用警告
  if (metrics.memory.percentage > 90) {
    warnings.push({
      type: 'memory',
      level: 'critical',
      message: '内存使用率过高',
      value: metrics.memory.percentage,
      threshold: 90
    })
  } else if (metrics.memory.percentage > 80) {
    warnings.push({
      type: 'memory',
      level: 'warning',
      message: '内存使用率较高',
      value: metrics.memory.percentage,
      threshold: 80
    })
  }

  // CPU 负载警告
  const avgLoad = metrics.cpu.loadAverage[0] || 0
  if (avgLoad > 2) {
    warnings.push({
      type: 'cpu',
      level: 'critical',
      message: 'CPU 负载过高',
      value: avgLoad,
      threshold: 2
    })
  } else if (avgLoad > 1) {
    warnings.push({
      type: 'cpu',
      level: 'warning',
      message: 'CPU 负载较高',
      value: avgLoad,
      threshold: 1
    })
  }

  // 事件循环延迟警告
  if (metrics.eventLoopDelay > 100) {
    warnings.push({
      type: 'eventLoop',
      level: 'critical',
      message: '事件循环延迟过高',
      value: metrics.eventLoopDelay,
      threshold: 100
    })
  } else if (metrics.eventLoopDelay > 50) {
    warnings.push({
      type: 'eventLoop',
      level: 'warning',
      message: '事件循环延迟较高',
      value: metrics.eventLoopDelay,
      threshold: 50
    })
  }

  // GC 频率警告
  if (metrics.gc && metrics.gc.averageTime > 50) {
    warnings.push({
      type: 'gc',
      level: 'warning',
      message: '垃圾回收时间过长',
      value: metrics.gc.averageTime,
      threshold: 50
    })
  }

  return warnings
}

/**
 * 生成性能报告
 * 
 * @param metrics - 性能指标
 * @returns 性能报告
 */
export function generatePerformanceReport(metrics: PerformanceMetrics): {
  summary: string
  details: Record<string, any>
  warnings: Array<any>
  recommendations: string[]
} {
  const warnings = checkPerformanceWarnings(metrics)
  const recommendations: string[] = []

  // 生成建议
  if (metrics.memory.percentage > 80) {
    recommendations.push('考虑增加系统内存或优化内存使用')
  }

  if (metrics.eventLoopDelay > 50) {
    recommendations.push('检查是否有阻塞事件循环的同步操作')
  }

  if (metrics.buildTime > 30000) {
    recommendations.push('考虑优化构建配置以提高构建速度')
  }

  if (metrics.hmrTime > 1000) {
    recommendations.push('优化热更新配置以提高开发体验')
  }

  const summary = `
性能概览:
- 内存使用: ${metrics.memory.percentage.toFixed(1)}%
- 启动时间: ${metrics.startupTime}ms
- 构建时间: ${metrics.buildTime}ms
- 事件循环延迟: ${metrics.eventLoopDelay.toFixed(1)}ms
- 警告数量: ${warnings.length}
  `.trim()

  return {
    summary,
    details: metrics,
    warnings,
    recommendations
  }
}

/**
 * 优化建议生成器
 * 
 * @param metrics - 性能指标
 * @returns 优化建议
 */
export function generateOptimizationSuggestions(metrics: PerformanceMetrics): Array<{
  category: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  impact: string
}> {
  const suggestions: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    suggestion: string
    impact: string
  }> = []

  // 内存优化建议
  if (metrics.memory.percentage > 80) {
    suggestions.push({
      category: '内存优化',
      priority: 'high',
      suggestion: '启用代码分割和懒加载',
      impact: '减少内存使用 20-40%'
    })
  }

  // 构建优化建议
  if (metrics.buildTime > 30000) {
    suggestions.push({
      category: '构建优化',
      priority: 'high',
      suggestion: '启用并行构建和缓存',
      impact: '提高构建速度 30-50%'
    })
  }

  // 热更新优化建议
  if (metrics.hmrTime > 1000) {
    suggestions.push({
      category: '开发体验',
      priority: 'medium',
      suggestion: '优化热更新范围和策略',
      impact: '提高开发响应速度 50-70%'
    })
  }

  return suggestions
}
