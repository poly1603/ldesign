/**
 * @file 性能优化模块统一导出
 * @description 导出所有性能优化相关的类和接口
 */

// 导入所有管理器
import { MemoryManager } from './memory-manager'
import { PerformanceMonitor } from './performance-monitor'
import { LargeImageProcessor } from './large-image-processor'

// 导出所有管理器
export { MemoryManager } from './memory-manager'
export type {
  MemoryStats,
  Disposable,
  MemoryWarningLevel
} from './memory-manager'

export { PerformanceMonitor } from './performance-monitor'
export type {
  PerformanceMetrics,
  PerformanceStats,
  PerformanceWarningLevel
} from './performance-monitor'

export { LargeImageProcessor } from './large-image-processor'
export type {
  ImageTile,
  LargeImageConfig,
  ProcessingProgress
} from './large-image-processor'

/**
 * 性能优化系统集成类
 */
export class PerformanceSystem {
  /** 内存管理器 */
  public readonly memory: MemoryManager

  /** 性能监控器 */
  public readonly monitor: PerformanceMonitor

  /** 大图片处理器 */
  public readonly largeImage: LargeImageProcessor

  /**
   * 构造函数
   * @param options 初始化选项
   */
  constructor(options: {
    memory?: any
    monitor?: any
    largeImage?: any
  } = {}) {
    this.memory = new MemoryManager(options.memory)
    this.monitor = new PerformanceMonitor(options.monitor)
    this.largeImage = new LargeImageProcessor(options.largeImage)

    // 设置系统间的联动
    this.setupInteractions()
  }

  /**
   * 设置系统间的交互
   */
  private setupInteractions(): void {
    // 内存警告时触发性能监控
    this.memory.on('memoryWarning', (event) => {
      this.monitor.emit('memoryPressure', event)
    })

    // 性能警告时触发内存清理
    this.monitor.on('performanceWarning', (event) => {
      if (event.level === 'critical') {
        this.memory.forceGarbageCollection()
      }
    })

    // 大图片处理时监控内存使用
    this.largeImage.on('tileLoaded', () => {
      const memoryStats = this.memory.getMemoryStats()
      if (memoryStats.memoryUsage > 0.8) {
        this.largeImage.cleanupUnusedTiles()
      }
    })
  }

  /**
   * 启动性能监控
   */
  startMonitoring(): void {
    this.monitor.startMonitoring()
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.monitor.stopMonitoring()
  }

  /**
   * 获取系统状态
   */
  getSystemStatus(): {
    memory: MemoryStats
    performance: PerformanceMetrics
    largeImage: { used: number; limit: number; percentage: number }
  } {
    return {
      memory: this.memory.getMemoryStats(),
      performance: this.monitor.getCurrentMetrics(),
      largeImage: this.largeImage.getMemoryUsage()
    }
  }

  /**
   * 执行系统优化
   */
  optimize(): void {
    // 清理内存
    this.memory.clearAllCaches()
    this.memory.forceGarbageCollection()

    // 清理大图片缓存
    this.largeImage.cleanupUnusedTiles()

    // 清理性能历史
    this.monitor.clearHistory()
  }

  /**
   * 销毁性能系统
   */
  destroy(): void {
    this.memory.destroy()
    this.monitor.destroy()
    this.largeImage.destroy()
  }
}
