/**
 * 增强版性能监控器
 * 
 * 新增功能：
 * - 内存压力感知
 * - 实时性能指标收集
 * - 历史数据追踪
 * - 性能仪表板数据
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { PerformanceMonitor } from './PerformanceMonitor'
import type { PerformanceMetrics } from '../types'

/**
 * 内存压力级别
 */
export type MemoryPressureLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * 内存压力信息
 */
export interface MemoryPressure {
  /** 已使用堆内存 (MB) */
  heapUsed: number
  /** 总堆内存 (MB) */
  heapTotal: number
  /** 外部内存 (MB) */
  external: number
  /** RSS - 常驻集大小 (MB) */
  rss: number
  /** 压力级别 */
  pressure: MemoryPressureLevel
  /** 压力百分比 */
  pressurePercent: number
  /** 建议采取的行动 */
  recommendation?: string
}

/**
 * 实时性能指标
 */
export interface RealtimeMetrics {
  /** 每秒请求数 */
  requestsPerSecond: number
  /** 活跃连接数 */
  activeConnections: number
  /** 当前内存使用 */
  memoryUsage: MemoryPressure
  /** CPU 使用率 (0-100) */
  cpuUsage: number
  /** 最近的构建时间 (ms) */
  lastBuildTime?: number
  /** 最近的启动时间 (ms) */
  lastStartupTime?: number
}

/**
 * 历史性能数据
 */
export interface HistoricalMetrics {
  /** 构建时间历史 (最近 100 次) */
  buildTimes: number[]
  /** 启动时间历史 (最近 100 次) */
  startupTimes: number[]
  /** 内存快照历史 (最近 100 次) */
  memorySnapshots: MemoryPressure[]
  /** 记录时间戳 */
  timestamps: number[]
}

/**
 * 性能仪表板数据
 */
export interface DashboardMetrics {
  /** 实时指标 */
  realtime: RealtimeMetrics
  /** 历史数据 */
  historical: HistoricalMetrics
  /** 统计信息 */
  statistics: {
    averageBuildTime: number
    averageStartupTime: number
    averageMemoryUsage: number
    peakMemoryUsage: number
    totalBuilds: number
    totalStartups: number
  }
}

/**
 * 增强版性能监控器配置
 */
export interface EnhancedMonitorConfig {
  /** 是否启用内存压力监控 */
  enableMemoryPressureMonitoring?: boolean
  /** 内存压力检查间隔 (ms) */
  memoryPressureCheckInterval?: number
  /** 历史数据保留数量 */
  historyLimit?: number
  /** 是否启用实时指标收集 */
  enableRealtimeMetrics?: boolean
}

/**
 * 增强版性能监控器
 */
export class PerformanceMonitorEnhanced extends PerformanceMonitor {
  private config: Required<EnhancedMonitorConfig>
  private historicalData: HistoricalMetrics
  private memoryPressureTimer?: NodeJS.Timeout
  private realtimeData: Partial<RealtimeMetrics>

  constructor(config: EnhancedMonitorConfig = {}) {
    super()
    
    this.config = {
      enableMemoryPressureMonitoring: config.enableMemoryPressureMonitoring ?? true,
      memoryPressureCheckInterval: config.memoryPressureCheckInterval ?? 5000,
      historyLimit: config.historyLimit ?? 100,
      enableRealtimeMetrics: config.enableRealtimeMetrics ?? true
    }

    this.historicalData = {
      buildTimes: [],
      startupTimes: [],
      memorySnapshots: [],
      timestamps: []
    }

    this.realtimeData = {
      requestsPerSecond: 0,
      activeConnections: 0,
      cpuUsage: 0
    }

    if (this.config?.enableMemoryPressureMonitoring) {
      this.startMemoryPressureMonitoring()
    }
  }

  /**
   * 获取当前内存压力信息
   */
  getMemoryPressure(): MemoryPressure {
    const memUsage = process.memoryUsage()
    
    // 转换为 MB
    const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024)
    const external = Math.round(memUsage.external / 1024 / 1024)
    const rss = Math.round(memUsage.rss / 1024 / 1024)
    
    // 计算压力百分比
    const pressurePercent = Math.round((heapUsed / heapTotal) * 100)
    
    // 判断压力级别
    let pressure: MemoryPressureLevel
    let recommendation: string | undefined
    
    if (pressurePercent < 50) {
      pressure = 'low'
    } else if (pressurePercent < 70) {
      pressure = 'medium'
      recommendation = '建议关注内存使用情况'
    } else if (pressurePercent < 85) {
      pressure = 'high'
      recommendation = '建议清理缓存或减少并发任务'
    } else {
      pressure = 'critical'
      recommendation = '警告：内存压力过高，建议立即清理缓存并重启服务'
    }
    
    return {
      heapUsed,
      heapTotal,
      external,
      rss,
      pressure,
      pressurePercent,
      recommendation
    }
  }

  /**
   * 开始内存压力监控
   */
  private startMemoryPressureMonitoring(): void {
    this.memoryPressureTimer = setInterval(() => {
      const pressure = this.getMemoryPressure()
      
      // 记录到历史数据
      this.addMemorySnapshot(pressure)
      
      // 如果压力过高，发出警告
      if (pressure.pressure === 'critical' || pressure.pressure === 'high') {
        console.warn(`⚠️  内存压力: ${pressure.pressure} (${pressure.pressurePercent}%)`)
        if (pressure.recommendation) {
          console.warn(`   ${pressure.recommendation}`)
        }
      }
      
      // 更新实时数据
      this.realtimeData.memoryUsage = pressure
    }, this.config?.memoryPressureCheckInterval)
  }

  /**
   * 停止内存压力监控
   */
  stopMemoryPressureMonitoring(): void {
    if (this.memoryPressureTimer) {
      clearInterval(this.memoryPressureTimer)
      this.memoryPressureTimer = undefined
    }
  }

  /**
   * 添加内存快照到历史数据
   */
  private addMemorySnapshot(snapshot: MemoryPressure): void {
    this.historicalData.memorySnapshots.push(snapshot)
    this.historicalData.timestamps.push(Date.now())
    
    // 限制历史数据数量
    if (this.historicalData.memorySnapshots.length > this.config?.historyLimit) {
      this.historicalData.memorySnapshots.shift()
      this.historicalData.timestamps.shift()
    }
  }

  /**
   * 记录构建时间
   */
  recordBuildTime(duration: number): void {
    this.historicalData.buildTimes.push(duration)
    this.realtimeData.lastBuildTime = duration
    
    if (this.historicalData.buildTimes.length > this.config?.historyLimit) {
      this.historicalData.buildTimes.shift()
    }
  }

  /**
   * 记录启动时间
   */
  recordStartupTime(duration: number): void {
    this.historicalData.startupTimes.push(duration)
    this.realtimeData.lastStartupTime = duration
    
    if (this.historicalData.startupTimes.length > this.config?.historyLimit) {
      this.historicalData.startupTimes.shift()
    }
  }

  /**
   * 更新实时指标
   */
  updateRealtimeMetrics(metrics: Partial<RealtimeMetrics>): void {
    Object.assign(this.realtimeData, metrics)
  }

  /**
   * 获取仪表板数据
   */
  getDashboardMetrics(): DashboardMetrics {
    const buildTimes = this.historicalData.buildTimes
    const startupTimes = this.historicalData.startupTimes
    const memorySnapshots = this.historicalData.memorySnapshots
    
    // 计算平均值
    const avgBuildTime = buildTimes.length > 0 
      ? Math.round(buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length)
      : 0
    
    const avgStartupTime = startupTimes.length > 0
      ? Math.round(startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length)
      : 0
    
    const avgMemory = memorySnapshots.length > 0
      ? Math.round(memorySnapshots.reduce((a, b) => a + b.heapUsed, 0) / memorySnapshots.length)
      : 0
    
    const peakMemory = memorySnapshots.length > 0
      ? Math.max(...memorySnapshots.map(s => s.heapUsed))
      : 0
    
    return {
      realtime: {
        requestsPerSecond: this.realtimeData.requestsPerSecond || 0,
        activeConnections: this.realtimeData.activeConnections || 0,
        memoryUsage: this.realtimeData.memoryUsage || this.getMemoryPressure(),
        cpuUsage: this.realtimeData.cpuUsage || 0,
        lastBuildTime: this.realtimeData.lastBuildTime,
        lastStartupTime: this.realtimeData.lastStartupTime
      },
      historical: this.historicalData,
      statistics: {
        averageBuildTime: avgBuildTime,
        averageStartupTime: avgStartupTime,
        averageMemoryUsage: avgMemory,
        peakMemoryUsage: peakMemory,
        totalBuilds: buildTimes.length,
        totalStartups: startupTimes.length
      }
    }
  }

  /**
   * 获取性能报告（文本格式）
   */
  getPerformanceReport(): string {
    const dashboard = this.getDashboardMetrics()
    const { realtime, statistics } = dashboard
    
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 性能监控报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【实时指标】
  💾 内存使用: ${realtime.memoryUsage.heapUsed}MB / ${realtime.memoryUsage.heapTotal}MB (${realtime.memoryUsage.pressurePercent}%)
  🎯 压力级别: ${this.getPressureEmoji(realtime.memoryUsage.pressure)} ${realtime.memoryUsage.pressure.toUpperCase()}
  📈 CPU 使用: ${realtime.cpuUsage.toFixed(1)}%
  🔌 活跃连接: ${realtime.activeConnections}
  ⚡ 每秒请求: ${realtime.requestsPerSecond}

【统计信息】
  🏗️  总构建次数: ${statistics.totalBuilds}
  ⏱️  平均构建时间: ${statistics.averageBuildTime}ms
  🚀 总启动次数: ${statistics.totalStartups}
  ⏱️  平均启动时间: ${statistics.averageStartupTime}ms
  💾 平均内存: ${statistics.averageMemoryUsage}MB
  📊 峰值内存: ${statistics.peakMemoryUsage}MB

${realtime.memoryUsage.recommendation ? `【建议】\n  ℹ️  ${realtime.memoryUsage.recommendation}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim()
  }

  /**
   * 获取压力级别对应的 emoji
   */
  private getPressureEmoji(pressure: MemoryPressureLevel): string {
    switch (pressure) {
      case 'low': return '✅'
      case 'medium': return '⚠️'
      case 'high': return '🔴'
      case 'critical': return '🚨'
    }
  }

  /**
   * 导出性能数据（JSON 格式）
   */
  exportMetrics(): string {
    return JSON.stringify(this.getDashboardMetrics(), null, 2)
  }

  /**
   * 清理并销毁监控器
   */
  destroy(): void {
    this.stopMemoryPressureMonitoring()
  }
}

/**
 * 创建增强版性能监控器实例
 */
export function createEnhancedMonitor(config?: EnhancedMonitorConfig): PerformanceMonitorEnhanced {
  return new PerformanceMonitorEnhanced(config)
}
