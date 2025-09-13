/**
 * 属性面板更新诊断工具
 * 用于调试和监控属性面板更新过程中的问题
 */

import type { ApprovalNodeConfig, ApprovalEdgeConfig } from '../types'

export interface PropertyUpdateEvent {
  timestamp: number
  elementId: string
  elementType: 'node' | 'edge'
  updates: Record<string, any>
  source: 'property-panel' | 'enhanced-property-panel' | 'direct-api'
  success: boolean
  error?: Error
  duration?: number
}

export interface DiagnosticReport {
  totalUpdates: number
  successfulUpdates: number
  failedUpdates: number
  averageUpdateTime: number
  updatesBySource: Record<string, number>
  commonErrors: Array<{ error: string; count: number }>
  recentEvents: PropertyUpdateEvent[]
}

/**
 * 属性面板更新诊断器
 */
export class PropertyPanelDiagnostics {
  private events: PropertyUpdateEvent[] = []
  private maxEventHistory: number = 100
  private isEnabled: boolean = false

  constructor(maxEventHistory = 100) {
    this.maxEventHistory = maxEventHistory
  }

  /**
   * 启用诊断
   */
  enable(): void {
    this.isEnabled = true
    console.log('🔍 属性面板诊断已启用')
  }

  /**
   * 禁用诊断
   */
  disable(): void {
    this.isEnabled = false
    console.log('⏸️ 属性面板诊断已禁用')
  }

  /**
   * 清理历史记录
   */
  clearHistory(): void {
    this.events = []
    console.log('🧹 诊断历史记录已清理')
  }

  /**
   * 记录更新事件
   */
  recordUpdateEvent(
    elementId: string,
    elementType: 'node' | 'edge',
    updates: Record<string, any>,
    source: 'property-panel' | 'enhanced-property-panel' | 'direct-api',
    success: boolean,
    error?: Error,
    duration?: number
  ): void {
    if (!this.isEnabled) return

    const event: PropertyUpdateEvent = {
      timestamp: Date.now(),
      elementId,
      elementType,
      updates: { ...updates },
      source,
      success,
      error,
      duration
    }

    this.events.push(event)

    // 保持历史记录在限制内
    if (this.events.length > this.maxEventHistory) {
      this.events = this.events.slice(-this.maxEventHistory)
    }

    // 输出诊断信息
    this.logEvent(event)
  }

  /**
   * 记录成功的更新
   */
  recordSuccess(
    elementId: string,
    elementType: 'node' | 'edge',
    updates: Record<string, any>,
    source: 'property-panel' | 'enhanced-property-panel' | 'direct-api',
    duration?: number
  ): void {
    this.recordUpdateEvent(elementId, elementType, updates, source, true, undefined, duration)
  }

  /**
   * 记录失败的更新
   */
  recordFailure(
    elementId: string,
    elementType: 'node' | 'edge',
    updates: Record<string, any>,
    source: 'property-panel' | 'enhanced-property-panel' | 'direct-api',
    error: Error,
    duration?: number
  ): void {
    this.recordUpdateEvent(elementId, elementType, updates, source, false, error, duration)
  }

  /**
   * 生成诊断报告
   */
  generateReport(): DiagnosticReport {
    const totalUpdates = this.events.length
    const successfulUpdates = this.events.filter(e => e.success).length
    const failedUpdates = totalUpdates - successfulUpdates

    // 计算平均更新时间
    const eventsWithDuration = this.events.filter(e => e.duration !== undefined)
    const averageUpdateTime = eventsWithDuration.length > 0
      ? eventsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0) / eventsWithDuration.length
      : 0

    // 按来源统计更新次数
    const updatesBySource: Record<string, number> = {}
    this.events.forEach(e => {
      updatesBySource[e.source] = (updatesBySource[e.source] || 0) + 1
    })

    // 统计常见错误
    const errorCounts: Record<string, number> = {}
    this.events.filter(e => e.error).forEach(e => {
      const errorMessage = e.error!.message
      errorCounts[errorMessage] = (errorCounts[errorMessage] || 0) + 1
    })

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // 取前10个最常见的错误

    return {
      totalUpdates,
      successfulUpdates,
      failedUpdates,
      averageUpdateTime,
      updatesBySource,
      commonErrors,
      recentEvents: this.events.slice(-20) // 最近20个事件
    }
  }

  /**
   * 打印诊断报告
   */
  printReport(): void {
    const report = this.generateReport()

    console.group('📊 属性面板更新诊断报告')
    
    console.log(`📈 总更新次数: ${report.totalUpdates}`)
    console.log(`✅ 成功更新: ${report.successfulUpdates}`)
    console.log(`❌ 失败更新: ${report.failedUpdates}`)
    
    if (report.totalUpdates > 0) {
      const successRate = ((report.successfulUpdates / report.totalUpdates) * 100).toFixed(1)
      console.log(`📊 成功率: ${successRate}%`)
    }

    if (report.averageUpdateTime > 0) {
      console.log(`⏱️ 平均更新时间: ${report.averageUpdateTime.toFixed(2)}ms`)
    }

    if (Object.keys(report.updatesBySource).length > 0) {
      console.group('📍 按来源统计:')
      Object.entries(report.updatesBySource).forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`)
      })
      console.groupEnd()
    }

    if (report.commonErrors.length > 0) {
      console.group('⚠️ 常见错误:')
      report.commonErrors.forEach(({ error, count }) => {
        console.log(`  ${error}: ${count}次`)
      })
      console.groupEnd()
    }

    if (report.recentEvents.length > 0) {
      console.group('🕒 最近事件:')
      report.recentEvents.forEach(event => {
        const status = event.success ? '✅' : '❌'
        const time = new Date(event.timestamp).toLocaleTimeString()
        console.log(`  ${status} [${time}] ${event.elementType}(${event.elementId}) - ${event.source}`)
        if (event.error) {
          console.log(`    ❌ ${event.error.message}`)
        }
      })
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * 输出事件日志
   */
  private logEvent(event: PropertyUpdateEvent): void {
    const time = new Date(event.timestamp).toLocaleTimeString()
    const status = event.success ? '✅' : '❌'
    const duration = event.duration ? ` (${event.duration.toFixed(2)}ms)` : ''
    
    console.log(
      `${status} [${time}] 属性面板更新 ${event.elementType}(${event.elementId}) 来源: ${event.source}${duration}`
    )

    if (event.error) {
      console.error(`  错误: ${event.error.message}`)
    }

    if (Object.keys(event.updates).length > 0) {
      console.log(`  更新内容:`, event.updates)
    }
  }

  /**
   * 检查潜在问题
   */
  checkForIssues(): string[] {
    const issues: string[] = []
    const report = this.generateReport()

    // 检查成功率
    if (report.totalUpdates > 0 && report.successfulUpdates / report.totalUpdates < 0.9) {
      issues.push(`更新成功率较低: ${((report.successfulUpdates / report.totalUpdates) * 100).toFixed(1)}%`)
    }

    // 检查更新时间
    if (report.averageUpdateTime > 100) {
      issues.push(`平均更新时间过长: ${report.averageUpdateTime.toFixed(2)}ms`)
    }

    // 检查频繁的错误
    if (report.commonErrors.length > 0) {
      const topError = report.commonErrors[0]
      if (topError.count > report.totalUpdates * 0.1) {
        issues.push(`频繁出现错误: ${topError.error} (${topError.count}次)`)
      }
    }

    // 检查最近的连续失败
    const recentFailures = report.recentEvents.slice(-5).filter(e => !e.success)
    if (recentFailures.length >= 3) {
      issues.push('最近连续多次更新失败')
    }

    return issues
  }

  /**
   * 监控特定元素的更新
   */
  monitorElement(elementId: string): PropertyUpdateEvent[] {
    return this.events.filter(e => e.elementId === elementId)
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    fastUpdates: number
    slowUpdates: number
    averageTime: number
    maxTime: number
    minTime: number
  } {
    const eventsWithDuration = this.events.filter(e => e.duration !== undefined && e.success)
    
    if (eventsWithDuration.length === 0) {
      return {
        fastUpdates: 0,
        slowUpdates: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: 0
      }
    }

    const durations = eventsWithDuration.map(e => e.duration!)
    const averageTime = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const maxTime = Math.max(...durations)
    const minTime = Math.min(...durations)

    const fastUpdates = durations.filter(d => d < 50).length // 小于50ms算快速
    const slowUpdates = durations.filter(d => d > 200).length // 大于200ms算慢速

    return {
      fastUpdates,
      slowUpdates,
      averageTime,
      maxTime,
      minTime
    }
  }
}

// 创建全局诊断实例
export const propertyPanelDiagnostics = new PropertyPanelDiagnostics()

/**
 * 属性面板更新包装器
 * 用于自动记录更新事件的包装函数
 */
export function withDiagnostics<T extends (...args: any[]) => any>(
  originalFn: T,
  elementId: string,
  elementType: 'node' | 'edge',
  source: 'property-panel' | 'enhanced-property-panel' | 'direct-api'
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now()
    
    try {
      const result = originalFn(...args)
      const duration = performance.now() - startTime
      
      // 如果是Promise，等待完成
      if (result && typeof result.then === 'function') {
        return result
          .then((res: any) => {
            propertyPanelDiagnostics.recordSuccess(
              elementId,
              elementType,
              args[1] || {}, // 通常第二个参数是updates
              source,
              duration
            )
            return res
          })
          .catch((error: Error) => {
            propertyPanelDiagnostics.recordFailure(
              elementId,
              elementType,
              args[1] || {},
              source,
              error,
              duration
            )
            throw error
          })
      }
      
      // 同步函数
      propertyPanelDiagnostics.recordSuccess(
        elementId,
        elementType,
        args[1] || {},
        source,
        duration
      )
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      propertyPanelDiagnostics.recordFailure(
        elementId,
        elementType,
        args[1] || {},
        source,
        error as Error,
        duration
      )
      throw error
    }
  }) as T
}

/**
 * 开发者工具扩展
 * 在浏览器控制台中暴露诊断功能
 */
if (typeof window !== 'undefined') {
  ;(window as any).__flowchartDiagnostics = {
    enable: () => propertyPanelDiagnostics.enable(),
    disable: () => propertyPanelDiagnostics.disable(),
    report: () => propertyPanelDiagnostics.printReport(),
    clear: () => propertyPanelDiagnostics.clearHistory(),
    issues: () => propertyPanelDiagnostics.checkForIssues(),
    performance: () => propertyPanelDiagnostics.getPerformanceStats(),
    monitor: (id: string) => propertyPanelDiagnostics.monitorElement(id)
  }
  
  console.log('🔧 流程图诊断工具已加载，使用 window.__flowchartDiagnostics 访问')
}
