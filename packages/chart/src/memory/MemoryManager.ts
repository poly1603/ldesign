/**
 * 内存管理器
 * 
 * 负责图表内存管理和优化，包括：
 * - 图表实例缓存
 * - 内存泄漏检测
 * - 资源清理
 * - 垃圾回收优化
 * - 内存使用监控
 */

import type { ECharts } from 'echarts'
import type { Chart } from '../core/Chart'

/**
 * 内存管理配置
 */
export interface MemoryConfig {
  /** 最大缓存图表数量 */
  maxCacheSize?: number
  /** 内存警告阈值 (MB) */
  memoryWarningThreshold?: number
  /** 内存清理阈值 (MB) */
  memoryCleanupThreshold?: number
  /** 是否启用自动清理 */
  enableAutoCleanup?: boolean
  /** 清理检查间隔 (ms) */
  cleanupInterval?: number
  /** 是否启用内存监控 */
  enableMemoryMonitoring?: boolean
}

/**
 * 图表缓存项
 */
interface ChartCacheItem {
  /** 图表实例 */
  chart: Chart
  /** 创建时间 */
  createTime: number
  /** 最后访问时间 */
  lastAccessTime: number
  /** 访问次数 */
  accessCount: number
  /** 内存使用量估算 */
  estimatedMemoryUsage: number
}

/**
 * 内存使用统计
 */
export interface MemoryStats {
  /** 缓存的图表数量 */
  cachedChartCount: number
  /** 估算的总内存使用量 */
  estimatedTotalMemory: number
  /** 系统内存信息 */
  systemMemory?: {
    used: number
    total: number
    available: number
  }
  /** 内存使用历史 */
  memoryHistory: number[]
}

/**
 * 内存管理器类
 */
export class MemoryManager {
  /** 内存管理配置 */
  private _config: MemoryConfig

  /** 图表缓存 */
  private _chartCache: Map<string, ChartCacheItem> = new Map()

  /** 清理定时器 */
  private _cleanupTimer: number | null = null

  /** 内存监控定时器 */
  private _monitoringTimer: number | null = null

  /** 内存使用历史 */
  private _memoryHistory: number[] = []

  /** 事件监听器 */
  private _listeners: Map<string, Function[]> = new Map()

  /**
   * 构造函数
   * @param config - 内存管理配置
   */
  constructor(config: MemoryConfig = {}) {
    this._config = {
      maxCacheSize: 50,
      memoryWarningThreshold: 100, // 100MB
      memoryCleanupThreshold: 150, // 150MB
      enableAutoCleanup: true,
      cleanupInterval: 30000, // 30秒
      enableMemoryMonitoring: true,
      ...config
    }

    if (this._config.enableAutoCleanup) {
      this._startAutoCleanup()
    }

    if (this._config.enableMemoryMonitoring) {
      this._startMemoryMonitoring()
    }
  }

  /**
   * 缓存图表实例
   * @param id - 图表ID
   * @param chart - 图表实例
   */
  cacheChart(id: string, chart: Chart): void {
    // 检查缓存大小限制
    if (this._chartCache.size >= this._config.maxCacheSize!) {
      this._evictLeastRecentlyUsed()
    }

    const now = Date.now()
    const estimatedMemory = this._estimateChartMemoryUsage(chart)

    this._chartCache.set(id, {
      chart,
      createTime: now,
      lastAccessTime: now,
      accessCount: 1,
      estimatedMemoryUsage: estimatedMemory
    })

    this._triggerEvent('chartCached', { id, estimatedMemory })
  }

  /**
   * 获取缓存的图表实例
   * @param id - 图表ID
   * @returns 图表实例或null
   */
  getCachedChart(id: string): Chart | null {
    const item = this._chartCache.get(id)
    if (!item) {
      return null
    }

    // 更新访问信息
    item.lastAccessTime = Date.now()
    item.accessCount++

    return item.chart
  }

  /**
   * 移除缓存的图表实例
   * @param id - 图表ID
   * @returns 是否成功移除
   */
  removeCachedChart(id: string): boolean {
    const item = this._chartCache.get(id)
    if (!item) {
      return false
    }

    // 清理图表资源
    this._cleanupChart(item.chart)

    this._chartCache.delete(id)
    this._triggerEvent('chartRemoved', { id, estimatedMemory: item.estimatedMemoryUsage })

    return true
  }

  /**
   * 清理所有缓存
   */
  clearCache(): void {
    for (const [id, item] of this._chartCache) {
      this._cleanupChart(item.chart)
    }

    const clearedCount = this._chartCache.size
    this._chartCache.clear()

    this._triggerEvent('cacheCleared', { clearedCount })
  }

  /**
   * 强制垃圾回收
   */
  forceGarbageCollection(): void {
    // 清理未使用的图表
    this._cleanupUnusedCharts()

    // 触发浏览器垃圾回收（如果支持）
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc()
        this._triggerEvent('garbageCollectionTriggered', {})
      } catch (error) {
        console.warn('无法触发垃圾回收:', error)
      }
    }
  }

  /**
   * 获取内存使用统计
   * @returns 内存统计信息
   */
  getMemoryStats(): MemoryStats {
    const cachedChartCount = this._chartCache.size
    let estimatedTotalMemory = 0

    for (const item of this._chartCache.values()) {
      estimatedTotalMemory += item.estimatedMemoryUsage
    }

    const stats: MemoryStats = {
      cachedChartCount,
      estimatedTotalMemory,
      memoryHistory: [...this._memoryHistory]
    }

    // 添加系统内存信息（如果可用）
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = performance.memory as any
      stats.systemMemory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize
      }
    }

    return stats
  }

  /**
   * 检查内存使用情况
   * @returns 内存检查结果
   */
  checkMemoryUsage(): {
    isWarning: boolean
    isCleanupNeeded: boolean
    currentUsage: number
    threshold: number
  } {
    const stats = this.getMemoryStats()
    const currentUsage = stats.systemMemory?.used || stats.estimatedTotalMemory
    const currentUsageMB = currentUsage / (1024 * 1024)

    return {
      isWarning: currentUsageMB > this._config.memoryWarningThreshold!,
      isCleanupNeeded: currentUsageMB > this._config.memoryCleanupThreshold!,
      currentUsage: currentUsageMB,
      threshold: this._config.memoryCleanupThreshold!
    }
  }

  /**
   * 监听内存事件
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  on(event: string, listener: Function): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, [])
    }
    this._listeners.get(event)!.push(listener)
  }

  /**
   * 移除内存事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  off(event: string, listener?: Function): void {
    if (!this._listeners.has(event)) return

    if (listener) {
      const listeners = this._listeners.get(event)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this._listeners.delete(event)
    }
  }

  /**
   * 销毁内存管理器
   */
  dispose(): void {
    // 清理所有缓存
    this.clearCache()

    // 清理定时器
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer)
      this._cleanupTimer = null
    }

    if (this._monitoringTimer) {
      clearInterval(this._monitoringTimer)
      this._monitoringTimer = null
    }

    // 清理事件监听器
    this._listeners.clear()

    // 清理历史数据
    this._memoryHistory = []
  }

  /**
   * 开始自动清理
   */
  private _startAutoCleanup(): void {
    this._cleanupTimer = (typeof window !== 'undefined' ? window.setInterval : setInterval)(() => {
      const memoryCheck = this.checkMemoryUsage()

      if (memoryCheck.isCleanupNeeded) {
        this._performCleanup()
      }
    }, this._config.cleanupInterval)
  }

  /**
   * 开始内存监控
   */
  private _startMemoryMonitoring(): void {
    this._monitoringTimer = (typeof window !== 'undefined' ? window.setInterval : setInterval)(() => {
      const stats = this.getMemoryStats()
      const currentUsage = stats.systemMemory?.used || stats.estimatedTotalMemory

      // 记录内存使用历史
      this._memoryHistory.push(currentUsage)
      if (this._memoryHistory.length > 100) {
        this._memoryHistory.shift()
      }

      // 检查内存警告
      const memoryCheck = this.checkMemoryUsage()
      if (memoryCheck.isWarning) {
        this._triggerEvent('memoryWarning', memoryCheck)
      }
    }, 5000) // 每5秒检查一次
  }

  /**
   * 执行清理操作
   */
  private _performCleanup(): void {
    const beforeCount = this._chartCache.size

    // 清理最少使用的图表
    this._evictLeastRecentlyUsed(Math.ceil(this._chartCache.size * 0.3))

    // 强制垃圾回收
    this.forceGarbageCollection()

    const afterCount = this._chartCache.size
    const cleanedCount = beforeCount - afterCount

    this._triggerEvent('cleanupPerformed', { cleanedCount, beforeCount, afterCount })
  }

  /**
   * 清理最少使用的图表
   * @param count - 要清理的数量
   */
  private _evictLeastRecentlyUsed(count: number = 1): void {
    const items = Array.from(this._chartCache.entries())

    // 按最后访问时间排序
    items.sort((a, b) => a[1].lastAccessTime - b[1].lastAccessTime)

    // 移除最少使用的图表
    for (let i = 0; i < Math.min(count, items.length); i++) {
      const [id] = items[i]
      this.removeCachedChart(id)
    }
  }

  /**
   * 清理未使用的图表
   */
  private _cleanupUnusedCharts(): void {
    const now = Date.now()
    const unusedThreshold = 5 * 60 * 1000 // 5分钟未使用

    for (const [id, item] of this._chartCache) {
      if (now - item.lastAccessTime > unusedThreshold) {
        this.removeCachedChart(id)
      }
    }
  }

  /**
   * 清理图表资源
   * @param chart - 图表实例
   */
  private _cleanupChart(chart: Chart): void {
    try {
      chart.dispose()
    } catch (error) {
      console.warn('清理图表资源时出错:', error)
    }
  }

  /**
   * 估算图表内存使用量
   * @param chart - 图表实例
   * @returns 估算的内存使用量（字节）
   */
  private _estimateChartMemoryUsage(chart: Chart): number {
    // 简化的内存估算
    const config = chart.getConfig()
    let estimatedSize = 1024 // 基础大小 1KB

    // 根据数据量估算
    if (Array.isArray(config.data)) {
      estimatedSize += config.data.length * 100 // 每个数据点约100字节
    }

    return estimatedSize
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param data - 事件数据
   */
  private _triggerEvent(event: string, data: any): void {
    const listeners = this._listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`内存事件监听器执行失败 (${event}):`, error)
        }
      })
    }
  }
}
