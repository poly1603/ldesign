import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePerformanceStore } from '../../src/stores/performance/PerformanceStore'

// Mock timers
vi.useFakeTimers()

describe('performanceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = usePerformanceStore()

      expect(store.searchQuery).toBe('')
      expect(store.debouncedQuery).toBe('')
      expect(store.throttledValue).toBe(0)
      expect(store.updateCount).toBe(0)
      expect(store.cache).toEqual({})
      expect(store.cacheStats).toMatchObject({
        hits: 0,
        misses: 0,
        size: 0
      })
      expect(store.largeDataset).toHaveLength(1000)
      expect(store.isProcessing).toBe(false)
    })

    it('应该生成正确的大数据集', () => {
      const store = usePerformanceStore()

      expect(store.largeDataset).toHaveLength(1000)
      expect(store.largeDataset[0]).toMatchObject({
        id: 1,
        name: expect.stringContaining('Item'),
        value: expect.any(Number),
        category: expect.stringMatching(/^([ABC])$/),
        timestamp: expect.any(Number)
      })
    })
  })

  describe('getters', () => {
    it('filteredData 应该根据防抖查询过滤数据', () => {
      const store = usePerformanceStore()

      store.debouncedQuery = 'Item 1'
      const filtered = store.filteredData

      expect(filtered.every(item => item.name.includes('Item 1'))).toBe(true)
    })

    it('sortedData 应该按值降序排序', () => {
      const store = usePerformanceStore()

      const sorted = store.sortedData

      for (let i = 1; i < Math.min(sorted.length, 10); i++) {
        expect(sorted[i].value).toBeLessThanOrEqual(sorted[i - 1].value)
      }
    })

    it('cacheHitRate 应该计算正确的命中率', () => {
      const store = usePerformanceStore()

      // 初始状态命中率应该是0
      expect(store.cacheHitRate).toBe(0)

      // 模拟缓存命中和未命中
      store.cacheStats.hits = 8
      store.cacheStats.misses = 2

      expect(store.cacheHitRate).toBe(80)
    })

    it('performanceMetrics 应该返回正确的性能指标', () => {
      const store = usePerformanceStore()

      const metrics = store.performanceMetrics

      expect(metrics).toMatchObject({
        totalItems: 1000,
        filteredItems: expect.any(Number),
        cacheSize: 0,
        hitRate: 0,
        updateCount: 0
      })
    })

    it('categoryStats 应该计算正确的分类统计', () => {
      const store = usePerformanceStore()

      const stats = store.categoryStats

      expect(stats).toHaveProperty('A')
      expect(stats).toHaveProperty('B')
      expect(stats).toHaveProperty('C')
      expect(stats.A + stats.B + stats.C).toBe(1000)
    })
  })

  describe('actions', () => {
    it('setSearchQuery 应该立即更新搜索查询', () => {
      const store = usePerformanceStore()

      store.setSearchQuery('test')
      expect(store.searchQuery).toBe('test')
    })

    it('debouncedSearch 应该延迟更新防抖查询', async () => {
      const store = usePerformanceStore()

      store.debouncedSearch('test')

      // 立即检查，防抖查询不应该更新
      expect(store.debouncedQuery).toBe('')

      // 快进时间
      vi.advanceTimersByTime(300)
      expect(store.debouncedQuery).toBe('test')
    })

    it('debouncedSearch 应该取消之前的防抖', async () => {
      const store = usePerformanceStore()

      store.debouncedSearch('test1')
      vi.advanceTimersByTime(200)

      store.debouncedSearch('test2')
      vi.advanceTimersByTime(300)

      expect(store.debouncedQuery).toBe('test2')
    })

    it('throttledUpdate 应该限制更新频率', () => {
      const store = usePerformanceStore()
      const initialValue = store.throttledValue

      // 快速调用多次
      store.throttledUpdate()
      store.throttledUpdate()
      store.throttledUpdate()

      // 应该只执行一次
      expect(store.throttledValue).toBe(initialValue + 1)

      // 快进时间后再次调用
      vi.advanceTimersByTime(100)
      store.throttledUpdate()

      expect(store.throttledValue).toBe(initialValue + 2)
    })

    it('getCachedData 应该返回缓存的数据', () => {
      const store = usePerformanceStore()
      const testData = { test: 'data' }

      // 第一次调用应该缓存数据
      const result1 = store.getCachedData('test', () => testData)
      expect(result1).toEqual(testData)
      expect(store.cacheStats.misses).toBe(1)
      expect(store.cacheStats.hits).toBe(0)

      // 第二次调用应该从缓存返回
      const result2 = store.getCachedData('test', () => ({ different: 'data' }))
      expect(result2).toEqual(testData)
      expect(store.cacheStats.hits).toBe(1)
      expect(store.cacheStats.misses).toBe(1)
    })

    it('clearCache 应该清空缓存', () => {
      const store = usePerformanceStore()

      // 添加一些缓存数据
      store.getCachedData('test1', () => ({ data: 1 }))
      store.getCachedData('test2', () => ({ data: 2 }))

      expect(store.cacheStats.size).toBe(2)

      store.clearCache()

      expect(store.cache).toEqual({})
      expect(store.cacheStats.size).toBe(0)
      expect(store.cacheStats.hits).toBe(0)
      expect(store.cacheStats.misses).toBe(0)
    })

    it('processLargeDataset 应该处理大数据集', async () => {
      const store = usePerformanceStore()

      expect(store.isProcessing).toBe(false)

      const promise = store.processLargeDataset()
      expect(store.isProcessing).toBe(true)

      // 快进时间完成处理
      vi.advanceTimersByTime(2000)
      await promise

      expect(store.isProcessing).toBe(false)
      expect(store.updateCount).toBeGreaterThan(0)
    })

    it('generateLargeDataset 应该生成新的数据集', () => {
      const store = usePerformanceStore()
      const originalDataset = [...store.largeDataset]

      store.generateLargeDataset()

      expect(store.largeDataset).toHaveLength(1000)
      expect(store.largeDataset).not.toEqual(originalDataset)
    })

    it('batchUpdate 应该批量更新数据', () => {
      const store = usePerformanceStore()
      const updates = [
        { id: 1, value: 999 },
        { id: 2, value: 888 }
      ]

      store.batchUpdate(updates)

      const item1 = store.largeDataset.find(item => item.id === 1)
      const item2 = store.largeDataset.find(item => item.id === 2)

      expect(item1?.value).toBe(999)
      expect(item2?.value).toBe(888)
    })

    it('optimizedFilter 应该使用缓存过滤数据', () => {
      const store = usePerformanceStore()

      // 第一次过滤
      const result1 = store.optimizedFilter('Item 1')
      expect(store.cacheStats.misses).toBe(1)

      // 第二次相同过滤应该使用缓存
      const result2 = store.optimizedFilter('Item 1')
      expect(result2).toEqual(result1)
      expect(store.cacheStats.hits).toBe(1)
    })

    it('memoizedCalculation 应该缓存计算结果', () => {
      const store = usePerformanceStore()

      // 第一次计算
      const result1 = store.memoizedCalculation(10)
      expect(store.cacheStats.misses).toBe(1)

      // 第二次相同输入应该使用缓存
      const result2 = store.memoizedCalculation(10)
      expect(result2).toBe(result1)
      expect(store.cacheStats.hits).toBe(1)

      // 不同输入应该重新计算
      const result3 = store.memoizedCalculation(20)
      expect(result3).not.toBe(result1)
      expect(store.cacheStats.misses).toBe(2)
    })
  })

  describe('性能优化', () => {
    it('防抖功能应该减少不必要的计算', () => {
      const store = usePerformanceStore()
      const spy = vi.fn()

      // 模拟快速输入
      for (let i = 0; i < 10; i++) {
        store.debouncedSearch(`query${i}`)
        vi.advanceTimersByTime(50)
      }

      // 只有最后一次应该生效
      vi.advanceTimersByTime(300)
      expect(store.debouncedQuery).toBe('query9')
    })

    it('节流功能应该限制执行频率', () => {
      const store = usePerformanceStore()
      const initialValue = store.throttledValue

      // 快速调用多次
      for (let i = 0; i < 10; i++) {
        store.throttledUpdate()
      }

      // 在节流期间只应该执行一次
      expect(store.throttledValue).toBe(initialValue + 1)
    })

    it('缓存应该提高重复查询的性能', () => {
      const store = usePerformanceStore()
      const expensiveOperation = vi.fn(() => ({ result: 'expensive' }))

      // 第一次调用
      store.getCachedData('expensive', expensiveOperation)
      expect(expensiveOperation).toHaveBeenCalledTimes(1)

      // 第二次调用应该使用缓存
      store.getCachedData('expensive', expensiveOperation)
      expect(expensiveOperation).toHaveBeenCalledTimes(1)
    })
  })

  describe('边界情况', () => {
    it('应该处理空搜索查询', () => {
      const store = usePerformanceStore()

      store.debouncedSearch('')
      vi.advanceTimersByTime(300)

      expect(store.filteredData).toHaveLength(1000)
    })

    it('应该处理不存在的缓存键', () => {
      const store = usePerformanceStore()

      const result = store.getCachedData('nonexistent', () => ({ data: 'new' }))
      expect(result).toEqual({ data: 'new' })
    })

    it('应该处理空的批量更新', () => {
      const store = usePerformanceStore()

      expect(() => store.batchUpdate([])).not.toThrow()
    })

    it('应该处理无效的数据项ID', () => {
      const store = usePerformanceStore()

      const updates = [{ id: 9999, value: 123 }]
      expect(() => store.batchUpdate(updates)).not.toThrow()
    })
  })
})
