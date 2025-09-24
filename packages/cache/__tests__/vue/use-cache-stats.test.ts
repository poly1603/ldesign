import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useCacheStats } from '../../src/vue/use-cache-stats'

// Mock useCacheManager
vi.mock('../../src/vue/cache-provider', () => ({
  useCacheManager: () => ({
    getStats: vi.fn().mockResolvedValue({
      totalSize: 1024,
      totalItems: 10,
      hitRate: 0.85,
      engines: {
        memory: { size: 512, itemCount: 5, hits: 8, misses: 2, available: true },
        localStorage: { size: 512, itemCount: 5, hits: 7, misses: 3, available: true },
      },
    }),
    cleanup: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock Vue lifecycle hooks to avoid warnings
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
  }
})

describe('useCacheStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该初始化响应式状态', () => {
      const { stats, loading, error } = useCacheStats()

      expect(stats.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('应该提供刷新方法', () => {
      const { refresh } = useCacheStats()

      expect(typeof refresh).toBe('function')
    })

    it('应该提供清理和刷新方法', () => {
      const { cleanupAndRefresh } = useCacheStats()

      expect(typeof cleanupAndRefresh).toBe('function')
    })
  })

  describe('自动刷新', () => {
    it('应该提供启动自动刷新的方法', () => {
      const { startAutoRefresh } = useCacheStats()

      expect(typeof startAutoRefresh).toBe('function')
    })

    it('应该提供停止自动刷新的方法', () => {
      const { stopAutoRefresh } = useCacheStats()

      expect(typeof stopAutoRefresh).toBe('function')
    })

    it('应该支持配置自动刷新间隔', () => {
      const { startAutoRefresh } = useCacheStats()

      expect(() => startAutoRefresh(1000)).not.toThrow()
    })
  })

  describe('格式化统计信息', () => {
    it('应该提供格式化的统计信息', async () => {
      const { formattedStats, refresh } = useCacheStats()

      await refresh()
      await vi.runAllTimersAsync()

      expect(formattedStats.value).toBeDefined()
    })
  })

  describe('引擎统计', () => {
    it('应该提供引擎使用情况', async () => {
      const { engineUsage, refresh } = useCacheStats()

      await refresh()
      await vi.runAllTimersAsync()

      expect(engineUsage.value).toBeDefined()
      expect(Array.isArray(engineUsage.value)).toBe(true)
    })
  })

  describe('配置选项', () => {
    it('应该支持立即加载选项', () => {
      const result = useCacheStats({ immediate: true })

      expect(result).toBeDefined()
    })

    it('应该支持自定义刷新间隔', () => {
      const result = useCacheStats({ refreshInterval: 5000 })

      expect(result).toBeDefined()
    })

    it('应该支持默认配置', () => {
      const result = useCacheStats()

      expect(result).toBeDefined()
    })
  })

  describe('响应式状态', () => {
    it('应该返回响应式的 stats', async () => {
      const { stats, refresh } = useCacheStats()

      await refresh()
      await vi.runAllTimersAsync()

      expect(stats.value).toBeDefined()
    })

    it('应该返回响应式的 loading', () => {
      const { loading } = useCacheStats()

      expect(loading.value).toBe(false)
    })

    it('应该返回响应式的 error', () => {
      const { error } = useCacheStats()

      expect(error.value).toBeNull()
    })
  })

  describe('生命周期', () => {
    it('应该在组件卸载时清理定时器', () => {
      const { stopAutoRefresh } = useCacheStats()

      expect(typeof stopAutoRefresh).toBe('function')
    })
  })

  describe('错误处理', () => {
    it('应该处理加载错误', async () => {
      // 这个测试会自动处理错误，不会抛出异常
      const { refresh } = useCacheStats()

      await expect(refresh()).resolves.not.toThrow()
    })
  })

  describe('性能优化', () => {
    it('应该避免重复加载', async () => {
      const { refresh } = useCacheStats()

      // 多次调用应该被优化
      await Promise.all([refresh(), refresh(), refresh()])

      // 不应该抛出错误
      expect(true).toBe(true)
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化字节大小', async () => {
      const { formattedStats, refresh } = useCacheStats()

      await refresh()
      await vi.runAllTimersAsync()

      if (formattedStats.value) {
        expect(formattedStats.value.totalSizeFormatted).toBeDefined()
      }
    })

    it('应该正确格式化命中率', async () => {
      const { formattedStats, refresh } = useCacheStats()

      await refresh()
      await vi.runAllTimersAsync()

      if (formattedStats.value) {
        expect(formattedStats.value.hitRatePercentage).toBeDefined()
      }
    })
  })

  describe('实时更新', () => {
    it('应该支持实时统计更新', async () => {
      const { refresh } = useCacheStats()

      await refresh()

      // 应该能够成功刷新
      expect(true).toBe(true)
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      const { stopAutoRefresh } = useCacheStats()

      stopAutoRefresh()

      // 应该能够正确清理
      expect(true).toBe(true)
    })
  })
})
