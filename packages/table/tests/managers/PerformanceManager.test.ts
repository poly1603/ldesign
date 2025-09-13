/**
 * PerformanceManager单元测试
 * 
 * 测试性能优化管理器功能
 * 确保增量更新、懒加载、缓存等功能正常工作
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PerformanceManager } from '@/managers/PerformanceManager'
import { createTestData } from '../setup'

describe('PerformanceManager', () => {
  let performanceManager: PerformanceManager
  let testData: any[]

  beforeEach(() => {
    performanceManager = new PerformanceManager({
      enableIncrementalUpdate: true,
      enableLazyLoading: true,
      enableDataCache: true,
      enableRenderCache: true,
      batchUpdateSize: 5,
      maxCacheSize: 10,
      lazyLoadThreshold: 100,
      debounceDelay: 50,
      throttleInterval: 16
    })

    testData = createTestData(20)
  })

  afterEach(() => {
    performanceManager.destroy()
  })

  describe('数据缓存', () => {
    it('应该能缓存数据', () => {
      const key = 'test-data'
      performanceManager.cacheData(key, testData)

      const cached = performanceManager.getCachedData(key)
      expect(cached).toEqual(testData)
      expect(cached).not.toBe(testData) // 应该是深拷贝
    })

    it('应该在缓存未命中时返回null', () => {
      const cached = performanceManager.getCachedData('non-existent')
      expect(cached).toBeNull()
    })

    it('应该在缓存满时清除最少使用的项', () => {
      // 填满缓存
      for (let i = 0; i < 12; i++) {
        performanceManager.cacheData(`key-${i}`, [{ id: i }])
      }

      // 访问一些缓存项
      performanceManager.getCachedData('key-5')
      performanceManager.getCachedData('key-8')

      // 添加新项，应该清除最少使用的
      performanceManager.cacheData('new-key', [{ id: 'new' }])

      // 被访问过的应该还在
      expect(performanceManager.getCachedData('key-5')).not.toBeNull()
      expect(performanceManager.getCachedData('key-8')).not.toBeNull()
      expect(performanceManager.getCachedData('new-key')).not.toBeNull()
    })
  })

  describe('渲染缓存', () => {
    it('应该能缓存渲染结果', () => {
      const key = 'test-render'
      const html = '<div>test content</div>'
      
      performanceManager.cacheRender(key, html)

      const cached = performanceManager.getCachedRender(key)
      expect(cached).toBe(html)
    })

    it('应该在渲染缓存未命中时返回null', () => {
      const cached = performanceManager.getCachedRender('non-existent')
      expect(cached).toBeNull()
    })
  })

  describe('批量更新', () => {
    it('应该能添加批量更新任务', () => {
      const updateSpy = vi.fn()
      
      performanceManager.addBatchUpdate(updateSpy)
      
      // 任务应该被添加但还未执行
      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('应该在达到批量大小时立即执行', () => {
      const updateSpies = Array.from({ length: 5 }, () => vi.fn())
      
      updateSpies.forEach(spy => {
        performanceManager.addBatchUpdate(spy)
      })

      // 所有任务应该被执行
      updateSpies.forEach(spy => {
        expect(spy).toHaveBeenCalled()
      })
    })

    it('应该在延迟后执行批量更新', async () => {
      const updateSpy = vi.fn()
      
      performanceManager.addBatchUpdate(updateSpy)
      
      // 等待延迟时间
      await new Promise(resolve => setTimeout(resolve, 60))
      
      expect(updateSpy).toHaveBeenCalled()
    })

    it('应该触发批量更新完成事件', () => {
      const eventSpy = vi.fn()
      performanceManager.on('batch-update-complete', eventSpy)

      const updateSpies = Array.from({ length: 5 }, () => vi.fn())
      updateSpies.forEach(spy => {
        performanceManager.addBatchUpdate(spy)
      })

      expect(eventSpy).toHaveBeenCalledWith({
        updateCount: 5,
        duration: expect.any(Number)
      })
    })
  })

  describe('懒加载', () => {
    it('应该能懒加载数据', async () => {
      const loader = vi.fn().mockResolvedValue(testData.slice(0, 5))
      
      const result = await performanceManager.lazyLoadData(loader, 0, 5)
      
      expect(loader).toHaveBeenCalledWith(0, 5)
      expect(result).toEqual(testData.slice(0, 5))
    })

    it('应该缓存懒加载的数据', async () => {
      const loader = vi.fn().mockResolvedValue(testData.slice(0, 5))
      
      // 第一次加载
      await performanceManager.lazyLoadData(loader, 0, 5)
      
      // 第二次加载应该使用缓存
      const result = await performanceManager.lazyLoadData(loader, 0, 5)
      
      expect(loader).toHaveBeenCalledTimes(1)
      expect(result).toEqual(testData.slice(0, 5))
    })

    it('应该在懒加载失败时抛出错误', async () => {
      const error = new Error('加载失败')
      const loader = vi.fn().mockRejectedValue(error)
      
      await expect(performanceManager.lazyLoadData(loader, 0, 5))
        .rejects.toThrow('加载失败')
    })

    it('应该触发懒加载完成事件', async () => {
      const eventSpy = vi.fn()
      performanceManager.on('lazy-load-complete', eventSpy)

      const loader = vi.fn().mockResolvedValue(testData.slice(0, 5))
      await performanceManager.lazyLoadData(loader, 0, 5)

      expect(eventSpy).toHaveBeenCalledWith({
        offset: 0,
        limit: 5,
        dataCount: 5
      })
    })
  })

  describe('数据变更记录', () => {
    it('应该能记录数据变更', () => {
      const keys = ['1', '2', '3']
      const data = testData.slice(0, 3)
      
      performanceManager.recordDataChange('add', keys, data)
      
      const updates = performanceManager.getIncrementalUpdates(0)
      expect(updates).toHaveLength(1)
      expect(updates[0]).toMatchObject({
        type: 'add',
        keys,
        data
      })
    })

    it('应该能获取指定时间后的增量更新', () => {
      const timestamp = Date.now()
      
      // 添加一些变更
      performanceManager.recordDataChange('add', ['1'], [testData[0]])
      
      // 等待一段时间
      setTimeout(() => {
        performanceManager.recordDataChange('update', ['2'], [testData[1]])
      }, 10)
      
      setTimeout(() => {
        const updates = performanceManager.getIncrementalUpdates(timestamp + 5)
        expect(updates).toHaveLength(1)
        expect(updates[0].type).toBe('update')
      }, 20)
    })

    it('应该限制变更记录数量', () => {
      // 添加大量变更记录
      for (let i = 0; i < 1200; i++) {
        performanceManager.recordDataChange('add', [`${i}`], [{ id: i }])
      }
      
      const updates = performanceManager.getIncrementalUpdates(0)
      expect(updates.length).toBeLessThanOrEqual(500) // 应该被限制
    })
  })

  describe('性能指标', () => {
    it('应该能获取性能指标', () => {
      performanceManager.updateMetrics(1000)
      
      const metrics = performanceManager.getMetrics()
      
      expect(metrics).toMatchObject({
        totalDataCount: 1000,
        cacheHitRate: expect.any(Number),
        averageRenderTime: expect.any(Number),
        incrementalUpdateCount: expect.any(Number),
        lazyLoadCount: expect.any(Number),
        memoryUsage: expect.any(Number)
      })
    })

    it('应该正确计算缓存命中率', () => {
      // 缓存一些数据
      performanceManager.cacheData('key1', testData)
      performanceManager.cacheData('key2', testData)
      
      // 命中缓存
      performanceManager.getCachedData('key1')
      performanceManager.getCachedData('key2')
      
      // 未命中缓存
      performanceManager.getCachedData('key3')
      
      performanceManager.updateMetrics(100)
      const metrics = performanceManager.getMetrics()
      
      expect(metrics.cacheHitRate).toBeCloseTo(2/3, 2)
    })
  })

  describe('缓存清理', () => {
    it('应该能清除所有缓存', () => {
      performanceManager.cacheData('key1', testData)
      performanceManager.cacheRender('render1', '<div>test</div>')
      
      performanceManager.clearCache()
      
      expect(performanceManager.getCachedData('key1')).toBeNull()
      expect(performanceManager.getCachedRender('render1')).toBeNull()
    })

    it('应该能清除过期缓存', () => {
      performanceManager.cacheData('key1', testData)
      
      // 模拟时间流逝
      vi.useFakeTimers()
      vi.advanceTimersByTime(400000) // 6分钟
      
      performanceManager.clearExpiredCache(300000) // 5分钟过期
      
      expect(performanceManager.getCachedData('key1')).toBeNull()
      
      vi.useRealTimers()
    })
  })

  describe('事件系统', () => {
    it('应该能添加和移除事件监听器', () => {
      const listener = vi.fn()
      
      performanceManager.on('test-event', listener)
      performanceManager.eventManager.emit('test-event', { data: 'test' })
      
      expect(listener).toHaveBeenCalledWith({ data: 'test' })
      
      performanceManager.off('test-event', listener)
      performanceManager.eventManager.emit('test-event', { data: 'test2' })
      
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('销毁', () => {
    it('应该能正确销毁管理器', () => {
      performanceManager.cacheData('key1', testData)
      performanceManager.addBatchUpdate(() => {})
      
      performanceManager.destroy()
      
      expect(performanceManager.getCachedData('key1')).toBeNull()
      // 销毁后应该清理所有资源
    })
  })
})
