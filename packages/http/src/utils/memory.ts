/**
 * 内存监控和管理功能
 * 监控内存使用情况，防止内存泄漏
 */
import process from 'node:process'

/**
 * 内存监控配置
 */
export interface MemoryMonitorConfig {
  /** 是否启用监控 */
  enabled?: boolean
  /** 监控间隔（毫秒） */
  interval?: number
  /** 内存警告阈值（MB） */
  warningThreshold?: number
  /** 内存危险阈值（MB） */
  dangerThreshold?: number
  /** 自动清理 */
  autoCleanup?: boolean
  /** 清理回调 */
  onCleanup?: () => void
  /** 警告回调 */
  onWarning?: (usage: MemoryUsage) => void
  /** 危险回调 */
  onDanger?: (usage: MemoryUsage) => void
}

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  /** 已使用内存（MB） */
  used: number
  /** 总内存（MB） */
  total: number
  /** 使用率 */
  percentage: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 内存统计
 */
export interface MemoryStats {
  /** 当前内存使用 */
  current: MemoryUsage
  /** 峰值内存使用 */
  peak: MemoryUsage
  /** 平均内存使用 */
  average: number
  /** 警告次数 */
  warningCount: number
  /** 危险次数 */
  dangerCount: number
  /** 清理次数 */
  cleanupCount: number
}

/**
 * 内存监控管理器
 * 
 * 功能：
 * 1. 实时监控内存使用
 * 2. 内存使用预警
 * 3. 自动清理机制
 * 4. 内存使用统计
 */
export class MemoryMonitor {
  private config: Required<Omit<MemoryMonitorConfig, 'onCleanup' | 'onWarning' | 'onDanger'>> & Pick<MemoryMonitorConfig, 'onCleanup' | 'onWarning' | 'onDanger'>
  private monitorTimer?: ReturnType<typeof setInterval>
  private usageHistory: MemoryUsage[] = []
  private stats: MemoryStats = {
    current: { used: 0, total: 0, percentage: 0, timestamp: Date.now() },
    peak: { used: 0, total: 0, percentage: 0, timestamp: Date.now() },
    average: 0,
    warningCount: 0,
    dangerCount: 0,
    cleanupCount: 0,
  }

  constructor(config: MemoryMonitorConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      interval: config.interval ?? 10000, // 10秒
      warningThreshold: config.warningThreshold ?? 100, // 100MB
      dangerThreshold: config.dangerThreshold ?? 200, // 200MB
      autoCleanup: config.autoCleanup ?? true,
      onCleanup: config.onCleanup,
      onWarning: config.onWarning,
      onDanger: config.onDanger,
    }

    if (this.config?.enabled) {
      this.start()
    }
  }

  /**
   * 启动监控
   */
  start(): void {
    if (this.monitorTimer) {
      return
    }

    this.monitorTimer = setInterval(() => {
      this.check()
    }, this.config?.interval)

    // 立即执行一次检查
    this.check()
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = undefined
    }
  }

  /**
   * 检查内存使用
   */
  private check(): void {
    const usage = this.getMemoryUsage()
    
    // 更新当前使用情况
    this.stats.current = usage

    // 更新峰值
    if (usage.used > this.stats.peak.used) {
      this.stats.peak = usage
    }

    // 记录历史
    this.usageHistory.push(usage)
    if (this.usageHistory.length > 100) {
      this.usageHistory.shift()
    }

    // 计算平均值
    this.stats.average = this.usageHistory.reduce((sum, u) => sum + u.used, 0) / this.usageHistory.length

    // 检查阈值
    if (usage.used >= this.config?.dangerThreshold) {
      this.stats.dangerCount++
      this.config?.onDanger?.(usage)
      
      if (this.config?.autoCleanup) {
        this.cleanup()
      }
    }
    else if (usage.used >= this.config?.warningThreshold) {
      this.stats.warningCount++
      this.config?.onWarning?.(usage)
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): MemoryUsage {
    let used = 0
    let total = 0

    // 浏览器环境
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      used = memory.usedJSHeapSize / 1024 / 1024 // 转换为 MB
      total = memory.totalJSHeapSize / 1024 / 1024
    }
    // Node.js 环境
    else if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage()
      used = memory.heapUsed / 1024 / 1024
      total = memory.heapTotal / 1024 / 1024
    }

    return {
      used,
      total,
      percentage: total > 0 ? (used / total) * 100 : 0,
      timestamp: Date.now(),
    }
  }

  /**
   * 执行清理
   */
  private cleanup(): void {
    this.stats.cleanupCount++
    this.config?.onCleanup?.()

    // 触发垃圾回收（如果可用）
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      try {
        (globalThis as any).gc()
      }
      catch {
        // 忽略错误
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): MemoryStats {
    return { ...this.stats }
  }

  /**
   * 获取使用历史
   */
  getHistory(): MemoryUsage[] {
    return [...this.usageHistory]
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      current: this.stats.current,
      peak: { used: 0, total: 0, percentage: 0, timestamp: Date.now() },
      average: 0,
      warningCount: 0,
      dangerCount: 0,
      cleanupCount: 0,
    }
    this.usageHistory = []
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stop()
    this.usageHistory = []
  }
}

/**
 * 创建内存监控器
 */
export function createMemoryMonitor(config?: MemoryMonitorConfig): MemoryMonitor {
  return new MemoryMonitor(config)
}

/**
 * 全局内存监控器实例
 */
export const globalMemoryMonitor = createMemoryMonitor({
  enabled: false, // 默认禁用，需要手动启用
})

/**
 * 内存清理工具
 */
export class MemoryCleaner {
  private cleanupHandlers: Array<() => void> = []

  /**
   * 注册清理处理器
   */
  register(handler: () => void): () => void {
    this.cleanupHandlers.push(handler)
    
    // 返回取消注册函数
    return () => {
      const index = this.cleanupHandlers.indexOf(handler)
      if (index > -1) {
        this.cleanupHandlers.splice(index, 1)
      }
    }
  }

  /**
   * 执行所有清理处理器
   */
  cleanup(): void {
    this.cleanupHandlers.forEach((handler) => {
      try {
        handler()
      }
      catch (error) {
        console.error('Cleanup handler error:', error)
      }
    })
  }

  /**
   * 清空所有处理器
   */
  clear(): void {
    this.cleanupHandlers = []
  }
}

/**
 * 全局内存清理器实例
 */
export const globalMemoryCleaner = new MemoryCleaner()

