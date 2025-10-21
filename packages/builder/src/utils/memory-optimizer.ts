/**
 * 内存优化器
 * 监控和优化构建过程中的内存使用
 */

import { performance } from 'perf_hooks'
import v8 from 'v8'
import { Logger } from './logger'

export interface MemoryStats {
  heapUsed: number
  heapTotal: number
  external: number
  arrayBuffers: number
  rss: number
  percentUsed: number
  timestamp: number
}

export interface MemoryConfig {
  maxHeapUsage?: number // 最大堆内存使用量（MB）
  gcThreshold?: number // 触发GC的阈值（MB）
  monitorInterval?: number // 监控间隔（ms）
  enableAutoGC?: boolean // 是否启用自动GC
  enableCompression?: boolean // 是否启用压缩
}

export class MemoryOptimizer {
  private config: Required<MemoryConfig>
  private logger: Logger
  private monitorTimer?: NodeJS.Timeout
  private peakMemory: number = 0
  private memoryHistory: MemoryStats[] = []
  private gcCount: number = 0

  constructor(config: MemoryConfig = {}, logger?: Logger) {
    this.config = {
      maxHeapUsage: config.maxHeapUsage || 1024, // 默认1GB
      gcThreshold: config.gcThreshold || 512, // 默认512MB
      monitorInterval: config.monitorInterval || 1000, // 默认1秒
      enableAutoGC: config.enableAutoGC ?? true,
      enableCompression: config.enableCompression ?? true
    }
    this.logger = logger || new Logger({ prefix: '[Memory]' })
  }

  /**
   * 开始内存监控
   */
  startMonitoring(): void {
    if (this.monitorTimer) {
      return
    }

    this.monitorTimer = setInterval(() => {
      const stats = this.getMemoryStats()
      this.memoryHistory.push(stats)
      
      // 保留最近100条记录
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift()
      }

      // 更新峰值内存
      if (stats.heapUsed > this.peakMemory) {
        this.peakMemory = stats.heapUsed
      }

      // 检查内存使用情况
      this.checkMemoryUsage(stats)
    }, this.config.monitorInterval)
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = undefined
    }
  }

  /**
   * 获取当前内存统计
   */
  getMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage()
    const heapStats = v8.getHeapStatistics()
    
    return {
      heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
      heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
      external: memUsage.external / 1024 / 1024, // MB
      arrayBuffers: memUsage.arrayBuffers / 1024 / 1024, // MB
      rss: memUsage.rss / 1024 / 1024, // MB
      percentUsed: (memUsage.heapUsed / heapStats.heap_size_limit) * 100,
      timestamp: Date.now()
    }
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(stats: MemoryStats): void {
    // 如果超过阈值，触发GC
    if (this.config.enableAutoGC && stats.heapUsed > this.config.gcThreshold) {
      this.logger.debug(`内存使用超过阈值 (${stats.heapUsed.toFixed(2)}MB)，触发垃圾回收`)
      this.forceGC()
    }

    // 如果接近最大限制，发出警告
    if (stats.heapUsed > this.config.maxHeapUsage * 0.9) {
      this.logger.warn(`内存使用接近限制: ${stats.heapUsed.toFixed(2)}MB / ${this.config.maxHeapUsage}MB`)
    }
  }

  /**
   * 强制垃圾回收
   */
  forceGC(): void {
    if (global.gc) {
      const before = this.getMemoryStats()
      global.gc()
      const after = this.getMemoryStats()
      const freed = before.heapUsed - after.heapUsed
      this.gcCount++
      
      if (freed > 0) {
        this.logger.debug(`垃圾回收完成，释放 ${freed.toFixed(2)}MB 内存`)
      }
    }
  }

  /**
   * 优化大型数组或对象
   */
  optimizeLargeData<T>(data: T[], chunkSize: number = 1000): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    // 清理require缓存
    Object.keys(require.cache).forEach(key => {
      if (!key.includes('node_modules')) {
        delete require.cache[key]
      }
    })
    
    // 手动触发GC
    this.forceGC()
  }

  /**
   * 获取内存报告
   */
  getMemoryReport(): {
    current: MemoryStats
    peak: number
    average: number
    gcCount: number
    trend: 'increasing' | 'stable' | 'decreasing'
  } {
    const current = this.getMemoryStats()
    const average = this.memoryHistory.reduce((sum, s) => sum + s.heapUsed, 0) / (this.memoryHistory.length || 1)
    
    // 计算趋势
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (this.memoryHistory.length > 10) {
      const recent = this.memoryHistory.slice(-10)
      const older = this.memoryHistory.slice(-20, -10)
      const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length
      const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length
      
      if (recentAvg > olderAvg * 1.1) {
        trend = 'increasing'
      } else if (recentAvg < olderAvg * 0.9) {
        trend = 'decreasing'
      }
    }

    return {
      current,
      peak: this.peakMemory,
      average,
      gcCount: this.gcCount,
      trend
    }
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.peakMemory = 0
    this.memoryHistory = []
    this.gcCount = 0
  }
}

// 全局内存优化器实例
let globalMemoryOptimizer: MemoryOptimizer | null = null

export function getGlobalMemoryOptimizer(config?: MemoryConfig): MemoryOptimizer {
  if (!globalMemoryOptimizer) {
    globalMemoryOptimizer = new MemoryOptimizer(config)
  }
  return globalMemoryOptimizer
}