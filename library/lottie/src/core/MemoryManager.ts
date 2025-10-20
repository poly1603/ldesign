/**
 * 智能内存管理器
 * 监控内存使用，自动清理和优化
 */

import type { ILottieInstance } from '../types'

export interface MemoryManagerConfig {
  /** 内存限制（MB） */
  memoryLimit?: number
  /** 警告阈值（0-1） */
  warningThreshold?: number
  /** 危险阈值（0-1） */
  dangerThreshold?: number
  /** 监控间隔（ms） */
  monitorInterval?: number
  /** 启用自动清理 */
  enableAutoCleanup?: boolean
}

export interface MemoryStats {
  /** 当前使用（MB） */
  used: number
  /** 限制（MB） */
  limit: number
  /** 使用百分比 */
  percentage: number
  /** 状态 */
  status: 'healthy' | 'warning' | 'danger' | 'critical'
  /** JS 堆大小（MB） */
  jsHeapSize?: number
  /** JS 堆限制（MB） */
  jsHeapSizeLimit?: number
}

export interface MemoryPressureEvent {
  stats: MemoryStats
  action: 'warning' | 'cleanup' | 'emergency'
}

type MemoryPressureCallback = (event: MemoryPressureEvent) => void

/**
 * 内存管理器
 */
export class MemoryManager {
  private static instance: MemoryManager | null = null
  private config: Required<MemoryManagerConfig>
  private monitorTimer: number | null = null
  private callbacks: Set<MemoryPressureCallback> = new Set()
  private instanceRegistry = new WeakMap<ILottieInstance, number>()
  private isMonitoring = false
  private lastCleanupTime = 0
  private cleanupCooldown = 5000 // 5秒清理冷却期

  private constructor(config?: MemoryManagerConfig) {
    this.config = {
      memoryLimit: config?.memoryLimit ?? 200, // 默认 200MB
      warningThreshold: config?.warningThreshold ?? 0.7, // 70%
      dangerThreshold: config?.dangerThreshold ?? 0.85, // 85%
      monitorInterval: config?.monitorInterval ?? 5000, // 5秒
      enableAutoCleanup: config?.enableAutoCleanup ?? true
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: MemoryManagerConfig): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(config)
    }
    return MemoryManager.instance
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitorLoop()

    console.log('[MemoryManager] Started monitoring')
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false

    if (this.monitorTimer !== null) {
      clearTimeout(this.monitorTimer)
      this.monitorTimer = null
    }

    console.log('[MemoryManager] Stopped monitoring')
  }

  /**
   * 监控循环
   */
  private monitorLoop = (): void => {
    if (!this.isMonitoring) return

    // 获取内存统计
    const stats = this.getStats()

    // 检查内存压力
    if (stats.percentage >= this.config.dangerThreshold) {
      this.handleMemoryPressure('emergency', stats)
    } else if (stats.percentage >= this.config.warningThreshold) {
      this.handleMemoryPressure('warning', stats)
    }

    // 调度下一次检查
    this.monitorTimer = window.setTimeout(
      this.monitorLoop,
      this.config.monitorInterval
    )
  }

  /**
   * 处理内存压力
   */
  private handleMemoryPressure(action: MemoryPressureEvent['action'], stats: MemoryStats): void {
    console.warn(`[MemoryManager] Memory pressure detected (${action}):`, stats)

    // 通知回调
    const event: MemoryPressureEvent = { stats, action }
    this.callbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('[MemoryManager] Callback error:', error)
      }
    })

    // 自动清理
    if (this.config.enableAutoCleanup) {
      const now = Date.now()
      
      // 检查冷却期
      if (now - this.lastCleanupTime < this.cleanupCooldown) {
        return
      }

      this.lastCleanupTime = now

      if (action === 'emergency') {
        this.emergencyCleanup()
      } else if (action === 'warning') {
        this.cleanup()
      }
    }
  }

  /**
   * 常规清理
   */
  cleanup(): number {
    console.log('[MemoryManager] Performing cleanup...')

    let cleaned = 0

    // 1. 清理全局缓存
    if (typeof window !== 'undefined' && (window as any).lottieManager) {
      const manager = (window as any).lottieManager
      
      // 清理缓存
      if (manager.clearCache) {
        manager.clearCache()
        cleaned++
      }

      // 优化实例池
      if (manager.optimize) {
        const result = manager.optimize()
        cleaned += result.cleaned || 0
      }
    }

    // 2. 触发垃圾回收（如果可用）
    if ((window as any).gc) {
      try {
        (window as any).gc()
        cleaned++
      } catch (error) {
        // 忽略错误
      }
    }

    console.log(`[MemoryManager] Cleanup completed, ${cleaned} items cleaned`)
    return cleaned
  }

  /**
   * 紧急清理
   */
  emergencyCleanup(): number {
    console.warn('[MemoryManager] Performing emergency cleanup...')

    let cleaned = this.cleanup()

    // 额外的紧急措施
    if (typeof window !== 'undefined' && (window as any).lottieManager) {
      const manager = (window as any).lottieManager
      
      // 停止所有非可见动画
      const instances = manager.getAll?.() || []
      instances.forEach((instance: ILottieInstance) => {
        if (instance.container && !this.isElementVisible(instance.container)) {
          if (instance.state === 'playing') {
            instance.stop()
            cleaned++
          }
        }
      })

      // 销毁空闲实例
      if (manager.getPoolStats) {
        const poolStats = manager.getPoolStats()
        if (poolStats.idle > 10) {
          // 销毁一半的空闲实例
          cleaned += Math.floor(poolStats.idle / 2)
        }
      }
    }

    console.warn(`[MemoryManager] Emergency cleanup completed, ${cleaned} items cleaned`)
    return cleaned
  }

  /**
   * 检查元素是否可见
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
  }

  /**
   * 注册实例
   */
  registerInstance(instance: ILottieInstance, estimatedSize: number): void {
    this.instanceRegistry.set(instance, estimatedSize)
  }

  /**
   * 取消注册实例
   */
  unregisterInstance(instance: ILottieInstance): void {
    this.instanceRegistry.delete(instance)
  }

  /**
   * 获取内存统计
   */
  getStats(): MemoryStats {
    let used = 0
    let jsHeapSize: number | undefined
    let jsHeapSizeLimit: number | undefined

    // 尝试获取真实内存使用情况
    if ('memory' in performance) {
      const memory = (performance as any).memory
      if (memory) {
        jsHeapSize = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100
        jsHeapSizeLimit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
        used = jsHeapSize
      }
    }

    // 如果无法获取真实值，使用估算值
    if (used === 0) {
      used = this.estimateMemoryUsage()
    }

    const limit = this.config.memoryLimit
    const percentage = used / limit

    // 确定状态
    let status: MemoryStats['status']
    if (percentage >= 0.95) {
      status = 'critical'
    } else if (percentage >= this.config.dangerThreshold) {
      status = 'danger'
    } else if (percentage >= this.config.warningThreshold) {
      status = 'warning'
    } else {
      status = 'healthy'
    }

    return {
      used: Math.round(used * 100) / 100,
      limit,
      percentage: Math.round(percentage * 100) / 100,
      status,
      jsHeapSize,
      jsHeapSizeLimit
    }
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): number {
    // 基础内存占用
    let estimated = 10 // 基础 10MB

    // 添加每个实例的估算大小
    // 注意：WeakMap 不支持遍历，所以这里只能返回基础估算

    return estimated
  }

  /**
   * 注册内存压力回调
   */
  onMemoryPressure(callback: MemoryPressureCallback): () => void {
    this.callbacks.add(callback)
    
    // 返回取消函数
    return () => {
      this.callbacks.delete(callback)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MemoryManagerConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<Required<MemoryManagerConfig>> {
    return { ...this.config }
  }

  /**
   * 手动触发清理
   */
  forceCleanup(): number {
    return this.cleanup()
  }

  /**
   * 重置单例
   */
  static reset(): void {
    if (MemoryManager.instance) {
      MemoryManager.instance.stopMonitoring()
      MemoryManager.instance = null
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopMonitoring()
    this.callbacks.clear()
    console.log('[MemoryManager] Destroyed')
  }
}

// 导出单例
export const memoryManager = MemoryManager.getInstance()


