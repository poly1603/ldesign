/**
 * 内存监控器
 * 实时监控Store和缓存的内存使用情况，并提供分析报告
 */

import type { BaseStore } from './BaseStore'
import { PerformanceMonitor } from './performance'
import { StorePool } from './storePool'

/**
 * 内存使用信息
 */
export interface MemoryUsageInfo {
  storeInstances: number
  cacheEntries: number
  estimatedSize: number
  timestamp: number
  details: {
    stores: Map<string, number>
    caches: Map<string, number>
  }
}

/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakDetection {
  suspected: boolean
  growthRate: number
  recommendations: string[]
  problematicStores: string[]
  problematicCaches: string[]
}

/**
 * 内存监控器配置
 */
export interface MemoryMonitorConfig {
  enabled?: boolean
  sampleInterval?: number // 采样间隔（毫秒）
  historySize?: number    // 历史记录大小
  alertThreshold?: number // 内存警报阈值（字节）
  autoCleanup?: boolean   // 自动清理
  gcInterval?: number     // 垃圾回收间隔（毫秒）
}

/**
 * 内存监控器
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private config: Required<MemoryMonitorConfig>
  private history: MemoryUsageInfo[] = []
  private monitoringTimer?: NodeJS.Timeout
  private gcTimer?: NodeJS.Timeout
  private storeReferences = new WeakSet<BaseStore>()
  private cacheReferences = new Map<object, number>()
  private performanceMonitor = PerformanceMonitor.getInstance()
  private listeners = new Set<(info: MemoryUsageInfo) => void>()

  private constructor(config: MemoryMonitorConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      sampleInterval: config.sampleInterval ?? 10000, // 10秒
      historySize: config.historySize ?? 100,
      alertThreshold: config.alertThreshold ?? 100 * 1024 * 1024, // 100MB
      autoCleanup: config.autoCleanup ?? true,
      gcInterval: config.gcInterval ?? 300000, // 5分钟
    }

    if (this.config.enabled) {
      this.start()
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: MemoryMonitorConfig): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor(config)
    }
    return MemoryMonitor.instance
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.monitoringTimer) return

    // 定期采样内存使用情况
    this.monitoringTimer = setInterval(() => {
      this.sample()
    }, this.config.sampleInterval)

    // 如果启用自动清理，定期执行垃圾回收
    if (this.config.autoCleanup) {
      this.gcTimer = setInterval(() => {
        this.performGarbageCollection()
      }, this.config.gcInterval)
    }

    // 立即采样一次
    this.sample()
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
      this.monitoringTimer = undefined
    }

    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = undefined
    }
  }

  /**
   * 注册Store实例
   */
  registerStore(store: BaseStore): void {
    this.storeReferences.add(store)
  }

  /**
   * 注册缓存实例
   */
  registerCache(cache: object, estimatedSize: number): void {
    this.cacheReferences.set(cache, estimatedSize)
  }

  /**
   * 采样内存使用情况
   */
  private sample(): void {
    const usage = this.collectMemoryUsage()
    
    // 添加到历史记录
    this.history.push(usage)
    if (this.history.length > this.config.historySize) {
      this.history.shift()
    }

    // 检查内存警报
    if (usage.estimatedSize > this.config.alertThreshold) {
      this.handleMemoryAlert(usage)
    }

    // 通知监听器
    this.notifyListeners(usage)

    // 更新性能监控器
    this.performanceMonitor.updateMemoryUsage(
      usage.storeInstances,
      usage.cacheEntries
    )
  }

  /**
   * 收集内存使用信息
   */
  private collectMemoryUsage(): MemoryUsageInfo {
    const storePool = StorePool.getInstance()
    const poolStats = storePool.getStats()
    
    // 收集Store信息
    const storeDetails = new Map<string, number>()
    for (const detail of poolStats.poolDetails) {
      storeDetails.set(detail.className, detail.poolSize + detail.activeInstances)
    }

    // 收集缓存信息
    const cacheDetails = new Map<string, number>()
    let totalCacheSize = 0
    for (const [cache, size] of this.cacheReferences) {
      if (cache) {
        const cacheName = cache.constructor.name
        cacheDetails.set(cacheName, (cacheDetails.get(cacheName) || 0) + size)
        totalCacheSize += size
      }
    }

    // 估算总内存大小
    const estimatedSize = this.estimateMemorySize(
      poolStats.totalInstances,
      totalCacheSize
    )

    return {
      storeInstances: poolStats.totalInstances,
      cacheEntries: cacheDetails.size,
      estimatedSize,
      timestamp: Date.now(),
      details: {
        stores: storeDetails,
        caches: cacheDetails,
      },
    }
  }

  /**
   * 估算内存大小
   */
  private estimateMemorySize(storeCount: number, cacheSize: number): number {
    // 每个Store实例平均占用5KB
    const storeMemory = storeCount * 5 * 1024
    // 缓存大小直接使用
    const cacheMemory = cacheSize
    // 其他开销估算为10%
    const overhead = (storeMemory + cacheMemory) * 0.1
    
    return Math.floor(storeMemory + cacheMemory + overhead)
  }

  /**
   * 处理内存警报
   */
  private handleMemoryAlert(usage: MemoryUsageInfo): void {
    console.warn('[MemoryMonitor] Memory usage alert:', {
      used: `${(usage.estimatedSize / 1024 / 1024).toFixed(2)}MB`,
      threshold: `${(this.config.alertThreshold / 1024 / 1024).toFixed(2)}MB`,
      stores: usage.storeInstances,
      caches: usage.cacheEntries,
    })

    // 如果启用自动清理，立即执行垃圾回收
    if (this.config.autoCleanup) {
      this.performGarbageCollection()
    }
  }

  /**
   * 执行垃圾回收
   */
  private performGarbageCollection(): void {
    const storePool = StorePool.getInstance()
    
    // 触发Store池的垃圾回收
    storePool.setOptions({ maxIdleTime: 60000 }) // 临时缩短空闲时间
    
    // 清理弱引用中已失效的对象
    const keysToDelete: object[] = []
    for (const [cache] of this.cacheReferences) {
      if (!cache) {
        keysToDelete.push(cache)
      }
    }
    keysToDelete.forEach(key => this.cacheReferences.delete(key))
    
    // 恢复原设置
    setTimeout(() => {
      storePool.setOptions({ maxIdleTime: 300000 })
    }, 1000)

    // 如果在Node.js环境，尝试触发V8的垃圾回收
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      try {
        (globalThis as any).gc()
      } catch {
        // 忽略错误
      }
    }
  }

  /**
   * 检测内存泄漏
   */
  detectMemoryLeak(): MemoryLeakDetection {
    if (this.history.length < 10) {
      return {
        suspected: false,
        growthRate: 0,
        recommendations: ['需要更多历史数据进行分析'],
        problematicStores: [],
        problematicCaches: [],
      }
    }

    // 计算内存增长率
    const recentHistory = this.history.slice(-10)
    const firstUsage = recentHistory[0].estimatedSize
    const lastUsage = recentHistory[recentHistory.length - 1].estimatedSize
    const growthRate = ((lastUsage - firstUsage) / firstUsage) * 100

    // 识别问题Store和缓存
    const problematicStores: string[] = []
    const problematicCaches: string[] = []
    
    const lastDetails = recentHistory[recentHistory.length - 1].details
    const firstDetails = recentHistory[0].details
    
    // 检查Store增长
    for (const [name, count] of lastDetails.stores) {
      const initialCount = firstDetails.stores.get(name) || 0
      if (count > initialCount * 2 && count > 10) {
        problematicStores.push(name)
      }
    }
    
    // 检查缓存增长
    for (const [name, size] of lastDetails.caches) {
      const initialSize = firstDetails.caches.get(name) || 0
      if (size > initialSize * 2 && size > 1024 * 1024) {
        problematicCaches.push(name)
      }
    }

    const suspected = growthRate > 50 || problematicStores.length > 0 || problematicCaches.length > 0

    const recommendations: string[] = []
    if (growthRate > 50) {
      recommendations.push(`内存增长率过高(${growthRate.toFixed(2)}%)，建议检查代码`)
    }
    if (problematicStores.length > 0) {
      recommendations.push(`Store实例增长异常：${problematicStores.join(', ')}`)
    }
    if (problematicCaches.length > 0) {
      recommendations.push(`缓存增长异常：${problematicCaches.join(', ')}`)
    }

    return {
      suspected,
      growthRate,
      recommendations,
      problematicStores,
      problematicCaches,
    }
  }

  /**
   * 获取内存使用报告
   */
  getMemoryReport(): {
    current: MemoryUsageInfo | null
    history: MemoryUsageInfo[]
    trend: 'stable' | 'growing' | 'shrinking'
    leakDetection: MemoryLeakDetection
  } {
    const current = this.history[this.history.length - 1] || null
    const trend = this.analyzeTrend()
    const leakDetection = this.detectMemoryLeak()

    return {
      current,
      history: [...this.history],
      trend,
      leakDetection,
    }
  }

  /**
   * 分析内存趋势
   */
  private analyzeTrend(): 'stable' | 'growing' | 'shrinking' {
    if (this.history.length < 3) return 'stable'

    const recent = this.history.slice(-3)
    const diffs = []
    for (let i = 1; i < recent.length; i++) {
      diffs.push(recent[i].estimatedSize - recent[i - 1].estimatedSize)
    }

    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length
    const threshold = this.config.alertThreshold * 0.01 // 1%的阈值

    if (avgDiff > threshold) return 'growing'
    if (avgDiff < -threshold) return 'shrinking'
    return 'stable'
  }

  /**
   * 订阅内存使用更新
   */
  subscribe(listener: (info: MemoryUsageInfo) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 通知监听器
   */
  private notifyListeners(info: MemoryUsageInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(info)
      } catch (error) {
        console.error('Memory monitor listener error:', error)
      }
    })
  }

  /**
   * 清理历史记录
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MemoryMonitorConfig>): void {
    Object.assign(this.config, config)
    
    // 重启监控以应用新配置
    if (this.config.enabled) {
      this.stop()
      this.start()
    }
  }

  /**
   * 销毁监控器
   */
  dispose(): void {
    this.stop()
    this.clearHistory()
    this.listeners.clear()
    this.storeReferences = new WeakSet()
    this.cacheReferences = new Map()
  }
}

/**
 * 获取内存监控器实例
 */
export function useMemoryMonitor(config?: MemoryMonitorConfig): MemoryMonitor {
  return MemoryMonitor.getInstance(config)
}