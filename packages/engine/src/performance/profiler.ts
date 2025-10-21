/**
 * 高级性能分析工具
 * 提供函数调用分析、组件渲染追踪和自动报告生成
 */

import type { Engine } from '../types'
import type { Logger } from '../types/logger'

// 函数调用记录
export interface FunctionCallRecord {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  args?: unknown[]
  result?: unknown
  error?: Error
  callStack?: string
  memoryBefore?: number
  memoryAfter?: number
}

// 组件渲染记录
export interface ComponentRenderRecord {
  componentName: string
  renderCount: number
  totalTime: number
  averageTime: number
  slowRenders: number // 慢渲染次数（>16ms）
  lastRenderTime: number
  props?: Record<string, unknown>
}

// 性能分析器配置
export interface ProfilerConfig {
  enableFunctionProfiling?: boolean
  enableComponentProfiling?: boolean
  enableMemoryProfiling?: boolean
  sampleRate?: number // 采样率（0-1）
  slowThreshold?: number // 慢函数阈值（ms）
  maxRecords?: number // 最大记录数
  autoReport?: boolean // 自动生成报告
  reportInterval?: number // 报告生成间隔（ms）
}

// 性能报告
export interface PerformanceProfileReport {
  timestamp: number
  duration: number
  summary: {
    totalFunctionCalls: number
    slowFunctions: number
    averageFunctionTime: number
    totalComponentRenders: number
    slowRenders: number
    averageRenderTime: number
    memoryGrowth: number
  }
  topSlowFunctions: Array<{ name: string; avgTime: number; calls: number }>
  topSlowComponents: Array<{ name: string; avgTime: number; renders: number }>
  recommendations: string[]
}

/**
 * 性能分析器实现
 */
export class Profiler {
  private functionCalls = new Map<string, FunctionCallRecord[]>()
  private componentRenders = new Map<string, ComponentRenderRecord>()
  private config: Required<ProfilerConfig>
  private enabled = false
  private startTimestamp = 0
  private reportTimer?: NodeJS.Timeout
  private currentCallId = 0

  constructor(
    config: ProfilerConfig = {},
    private engine?: Engine,
    private logger?: Logger
  ) {
    this.config = {
      enableFunctionProfiling: config.enableFunctionProfiling ?? true,
      enableComponentProfiling: config.enableComponentProfiling ?? true,
      enableMemoryProfiling: config.enableMemoryProfiling ?? true,
      sampleRate: config.sampleRate ?? 1.0, // 默认100%采样
      slowThreshold: config.slowThreshold || 100,
      maxRecords: config.maxRecords || 1000,
      autoReport: config.autoReport ?? false,
      reportInterval: config.reportInterval || 60000 // 1分钟
    }
  }

  /**
   * 开始分析
   */
  start(): void {
    if (this.enabled) {
      this.logger?.warn('Profiler already started')
      return
    }

    this.enabled = true
    this.startTimestamp = Date.now()

    if (this.config.autoReport) {
      this.startAutoReporting()
    }

    this.logger?.info('Performance profiler started')
  }

  /**
   * 停止分析
   */
  stop(): void {
    if (!this.enabled) {
      return
    }

    this.enabled = false

    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }

    this.logger?.info('Performance profiler stopped')
  }

  /**
   * 是否正在分析
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 记录函数调用开始
   */
  startFunctionCall(functionName: string, args?: unknown[]): number {
    if (!this.enabled || !this.config.enableFunctionProfiling) {
      return -1
    }

    // 采样率控制
    if (Math.random() > this.config.sampleRate) {
      return -1
    }

    const callId = ++this.currentCallId
    const record: FunctionCallRecord = {
      name: functionName,
      startTime: performance.now(),
      args,
      callStack: this.captureCallStack()
    }

    // 记录内存
    if (this.config.enableMemoryProfiling) {
      record.memoryBefore = this.getMemoryUsage()
    }

    // 存储记录
    const calls = this.functionCalls.get(functionName) || []
    calls.push(record)
    this.functionCalls.set(functionName, calls)

    // 限制记录数量
    if (calls.length > this.config.maxRecords) {
      calls.shift()
    }

    return callId
  }

  /**
   * 记录函数调用结束
   */
  endFunctionCall(functionName: string, callId: number, result?: unknown, error?: Error): void {
    if (callId === -1) {
      return
    }

    const calls = this.functionCalls.get(functionName)
    if (!calls) {
      return
    }

    const record = calls[calls.length - 1]
    if (!record) {
      return
    }

    record.endTime = performance.now()
    record.duration = record.endTime - record.startTime
    record.result = result
    record.error = error

    // 记录内存
    if (this.config.enableMemoryProfiling) {
      record.memoryAfter = this.getMemoryUsage()
    }

    // 检查是否为慢函数
    if (record.duration > this.config.slowThreshold) {
      this.logger?.warn(`Slow function detected: ${functionName}`, {
        duration: `${record.duration.toFixed(2)}ms`,
        threshold: `${this.config.slowThreshold}ms`
      })
    }
  }

  /**
   * 记录组件渲染
   */
  recordComponentRender(
    componentName: string,
    renderTime: number,
    props?: Record<string, unknown>
  ): void {
    if (!this.enabled || !this.config.enableComponentProfiling) {
      return
    }

    let record = this.componentRenders.get(componentName)

    if (!record) {
      record = {
        componentName,
        renderCount: 0,
        totalTime: 0,
        averageTime: 0,
        slowRenders: 0,
        lastRenderTime: Date.now()
      }
      this.componentRenders.set(componentName, record)
    }

    record.renderCount++
    record.totalTime += renderTime
    record.averageTime = record.totalTime / record.renderCount
    record.lastRenderTime = Date.now()

    if (props) {
      record.props = props
    }

    // 检查慢渲染（>16ms = 低于60fps）
    if (renderTime > 16) {
      record.slowRenders++
      this.logger?.warn(`Slow component render: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        slowRenderRate: `${((record.slowRenders / record.renderCount) * 100).toFixed(1)}%`
      })
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceProfileReport {
    const now = Date.now()
    const duration = now - this.startTimestamp

    // 汇总函数调用统计
    const functionStats = new Map<string, { totalTime: number; calls: number; slowCalls: number }>()

    for (const [name, calls] of this.functionCalls) {
      const completedCalls = calls.filter(c => c.duration !== undefined)
      const totalTime = completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
      const slowCalls = completedCalls.filter(c => (c.duration || 0) > this.config.slowThreshold).length

      functionStats.set(name, {
        totalTime,
        calls: completedCalls.length,
        slowCalls
      })
    }

    const totalFunctionCalls = Array.from(functionStats.values()).reduce((sum, s) => sum + s.calls, 0)
    const slowFunctions = Array.from(functionStats.values()).filter(s => s.slowCalls > 0).length
    const avgFunctionTime = totalFunctionCalls > 0
      ? Array.from(functionStats.values()).reduce((sum, s) => sum + s.totalTime, 0) / totalFunctionCalls
      : 0

    // 汇总组件渲染统计
    const components = Array.from(this.componentRenders.values())
    const totalComponentRenders = components.reduce((sum, c) => sum + c.renderCount, 0)
    const totalSlowRenders = components.reduce((sum, c) => sum + c.slowRenders, 0)
    const avgRenderTime = totalComponentRenders > 0
      ? components.reduce((sum, c) => sum + c.totalTime, 0) / totalComponentRenders
      : 0

    // 计算内存增长
    const memoryGrowth = this.calculateMemoryGrowth()

    // 生成 Top 慢函数列表
    const topSlowFunctions = Array.from(functionStats.entries())
      .map(([name, stats]) => ({
        name,
        avgTime: stats.totalTime / stats.calls,
        calls: stats.calls
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)

    // 生成 Top 慢组件列表
    const topSlowComponents = components
      .map(c => ({
        name: c.componentName,
        avgTime: c.averageTime,
        renders: c.renderCount
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)

    // 生成优化建议
    const recommendations = this.generateRecommendations(
      functionStats,
      components,
      memoryGrowth
    )

    return {
      timestamp: now,
      duration,
      summary: {
        totalFunctionCalls,
        slowFunctions,
        averageFunctionTime: avgFunctionTime,
        totalComponentRenders,
        slowRenders: totalSlowRenders,
        averageRenderTime: avgRenderTime,
        memoryGrowth
      },
      topSlowFunctions,
      topSlowComponents,
      recommendations
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    functionStats: Map<string, { totalTime: number; calls: number; slowCalls: number }>,
    components: ComponentRenderRecord[],
    memoryGrowth: number
  ): string[] {
    const recommendations: string[] = []

    // 分析慢函数
    const slowFunctions = Array.from(functionStats.entries())
      .filter(([, stats]) => stats.slowCalls > stats.calls * 0.1)

    if (slowFunctions.length > 0) {
      recommendations.push(`发现 ${slowFunctions.length} 个性能瓶颈函数，建议优化`)

      const slowest = slowFunctions
        .sort((a, b) => b[1].totalTime - a[1].totalTime)[0]

      if (slowest) {
        recommendations.push(`最慢函数: ${slowest[0]} (平均 ${(slowest[1].totalTime / slowest[1].calls).toFixed(2)}ms)`)
      }
    }

    // 分析慢组件
    const slowComponents = components.filter(c => c.averageTime > 16)
    if (slowComponents.length > 0) {
      recommendations.push(`发现 ${slowComponents.length} 个渲染慢的组件，建议优化`)

      const slowest = slowComponents.sort((a, b) => b.averageTime - a.averageTime)[0]
      if (slowest) {
        recommendations.push(
          `最慢组件: ${slowest.componentName} (平均 ${slowest.averageTime.toFixed(2)}ms, ${slowest.slowRenders}/${slowest.renderCount} 次慢渲染)`
        )
      }
    }

    // 分析内存增长
    if (memoryGrowth > 10 * 1024 * 1024) {
      recommendations.push(`内存增长 ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB，检查是否有内存泄漏`)
    }

    // 通用建议
    if (recommendations.length === 0) {
      recommendations.push('性能表现良好，继续保持')
    }

    return recommendations
  }

  /**
   * 计算内存增长
   */
  private calculateMemoryGrowth(): number {
    if (!this.config.enableMemoryProfiling) {
      return 0
    }

    // 收集所有函数调用的内存数据
    const memoryDiffs: number[] = []

    for (const calls of this.functionCalls.values()) {
      for (const call of calls) {
        if (call.memoryBefore !== undefined && call.memoryAfter !== undefined) {
          memoryDiffs.push(call.memoryAfter - call.memoryBefore)
        }
      }
    }

    if (memoryDiffs.length === 0) {
      return 0
    }

    // 返回平均增长
    return memoryDiffs.reduce((sum, diff) => sum + diff, 0) / memoryDiffs.length
  }

  /**
   * 获取当前内存使用
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * 捕获调用栈
   */
  private captureCallStack(): string {
    try {
      const stack = new Error().stack || ''
      // 移除前几行（Error构造和profiler本身）
      const lines = stack.split('\n').slice(3)
      return lines.join('\n')
    } catch {
      return ''
    }
  }

  /**
   * 启动自动报告
   */
  private startAutoReporting(): void {
    this.reportTimer = setInterval(() => {
      const report = this.generateReport()
      this.logger?.info('Performance Profile Report', report.summary)

      // 触发事件（如果有引擎）
      if (this.engine?.events) {
        this.engine.events.emit('profiler:report', report)
      }
    }, this.config.reportInterval) as any
  }

  /**
   * 清除记录
   */
  clearRecords(): void {
    this.functionCalls.clear()
    this.componentRenders.clear()
    this.logger?.debug('Profiler records cleared')
  }

  /**
   * 获取函数调用统计
   */
  getFunctionStats(): Map<string, { calls: number; totalTime: number; avgTime: number }> {
    const stats = new Map<string, { calls: number; totalTime: number; avgTime: number }>()

    for (const [name, calls] of this.functionCalls) {
      const completedCalls = calls.filter(c => c.duration !== undefined)
      const totalTime = completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
      const avgTime = completedCalls.length > 0 ? totalTime / completedCalls.length : 0

      stats.set(name, {
        calls: completedCalls.length,
        totalTime,
        avgTime
      })
    }

    return stats
  }

  /**
   * 获取组件统计
   */
  getComponentStats(): ComponentRenderRecord[] {
    return Array.from(this.componentRenders.values())
  }

  /**
   * 导出数据
   */
  exportData(): string {
    return JSON.stringify({
      functionCalls: Array.from(this.functionCalls.entries()),
      componentRenders: Array.from(this.componentRenders.entries()),
      startTimestamp: this.startTimestamp,
      config: this.config
    })
  }

  /**
   * 导入数据
   */
  importData(data: string): void {
    try {
      const parsed = JSON.parse(data)

      if (parsed.functionCalls) {
        this.functionCalls = new Map(parsed.functionCalls)
      }

      if (parsed.componentRenders) {
        this.componentRenders = new Map(parsed.componentRenders)
      }

      if (parsed.startTimestamp) {
        this.startTimestamp = parsed.startTimestamp
      }

      this.logger?.info('Profiler data imported')
    } catch (error) {
      this.logger?.error('Failed to import profiler data', error)
    }
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    this.stop()
    this.clearRecords()
  }
}

/**
 * 创建性能分析器
 */
export function createProfiler(
  config?: ProfilerConfig,
  engine?: Engine,
  logger?: Logger
): Profiler {
  return new Profiler(config, engine, logger)
}

/**
 * 性能分析装饰器
 * 自动追踪函数执行性能
 */
export function Profile(profiler?: Profiler) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const functionName = `${target.constructor?.name || 'Unknown'}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const prof = profiler || getGlobalProfiler()
      const callId = prof.startFunctionCall(functionName, args)

      try {
        const result = await originalMethod.apply(this, args)
        prof.endFunctionCall(functionName, callId, result)
        return result
      } catch (error) {
        prof.endFunctionCall(functionName, callId, undefined, error as Error)
        throw error
      }
    }

    return descriptor
  }
}

// 全局分析器实例
let globalProfiler: Profiler | undefined

export function getGlobalProfiler(): Profiler {
  if (!globalProfiler) {
    globalProfiler = createProfiler()
  }
  return globalProfiler
}

export function setGlobalProfiler(profiler: Profiler): void {
  globalProfiler = profiler
}




