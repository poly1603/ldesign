import type { CacheStats, StorageEngine } from '../types'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatBytes } from '../utils'

import { useCacheManager } from './cache-provider'

/**
 * 缓存统计组合式函数
 */
export function useCacheStats(options?: {
  /** 自动刷新间隔（毫秒） */
  refreshInterval?: number
  /** 是否立即加载 */
  immediate?: boolean
}) {
  const cacheManager = useCacheManager()

  // 响应式状态
  const stats = ref<CacheStats | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let refreshTimer: number | undefined

  /**
   * 加载统计信息
   */
  const loadStats = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      stats.value = await cacheManager.getStats()
    }
    catch (err) {
      error.value = err as Error
      console.error('Failed to load cache stats:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 启动自动刷新
   */
  const startAutoRefresh = (interval: number): void => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }

    refreshTimer = window.setInterval(() => {
      loadStats().catch(console.error)
    }, interval)
  }

  /**
   * 停止自动刷新
   */
  const stopAutoRefresh = (): void => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = undefined
    }
  }

  // 计算属性
  const formattedStats = computed(() => {
    if (!stats.value) { return null }

    return {
      ...stats.value,
      totalSizeFormatted: formatBytes(stats.value.totalSize),
      hitRatePercentage: (stats.value.hitRate * 100).toFixed(2),
      engines: Object.fromEntries(
        Object.entries(stats.value.engines).map(([engine, engineStats]) => [
          engine,
          {
            ...engineStats,
            sizeFormatted: formatBytes(engineStats.size),
            hitRate:
              engineStats.hits + engineStats.misses > 0
                ? (
                  (engineStats.hits
                    / (engineStats.hits + engineStats.misses))
                  * 100
                ).toFixed(2)
                : '0.00',
          },
        ]),
      ),
    }
  })

  /**
   * 获取引擎使用情况
   */
  const engineUsage = computed(() => {
    if (!stats.value) { return [] }

    return Object.entries(stats.value.engines).map(([engine, engineStats]) => ({
      engine: engine as StorageEngine,
      itemCount: engineStats.itemCount,
      size: engineStats.size,
      sizeFormatted: formatBytes(engineStats.size),
      available: engineStats.available,
      usage:
        stats.value!.totalSize > 0
          ? ((engineStats.size / stats.value!.totalSize) * 100).toFixed(2)
          : '0.00',
    }))
  })

  /**
   * 获取性能指标
   */
  const performanceMetrics = computed(() => {
    if (!stats.value) { return null }

    const totalRequests = Object.values(stats.value.engines).reduce(
      (sum, engine) => sum + engine.hits + engine.misses,
      0,
    )

    return {
      totalRequests,
      hitRate: stats.value.hitRate,
      hitRatePercentage: (stats.value.hitRate * 100).toFixed(2),
      missRate: 1 - stats.value.hitRate,
      missRatePercentage: ((1 - stats.value.hitRate) * 100).toFixed(2),
      averageItemSize:
        stats.value.totalItems > 0
          ? formatBytes(stats.value.totalSize / stats.value.totalItems)
          : '0 Bytes',
    }
  })

  /**
   * 刷新统计信息
   */
  const refresh = async (): Promise<void> => {
    return loadStats()
  }

  /**
   * 清理过期项并刷新统计
   */
  const cleanupAndRefresh = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await cacheManager.cleanup()
      await loadStats()
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  // 生命周期
  onMounted(() => {
    if (options?.immediate !== false) {
      loadStats().catch(console.error)
    }

    if (options?.refreshInterval && options.refreshInterval > 0) {
      startAutoRefresh(options.refreshInterval)
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // 原始统计数据
    stats: computed(() => stats.value),

    // 格式化统计数据
    formattedStats,

    // 引擎使用情况
    engineUsage,

    // 性能指标
    performanceMetrics,

    // 状态
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 方法
    refresh,
    cleanupAndRefresh,
    startAutoRefresh,
    stopAutoRefresh,

    // 缓存管理器实例
    manager: cacheManager,
  }
}
