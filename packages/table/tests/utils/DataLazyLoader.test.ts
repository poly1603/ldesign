/**
 * DataLazyLoader单元测试
 * 
 * 测试数据懒加载器功能
 * 确保分页加载、缓存、预加载等功能正常工作
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { DataLazyLoader } from '@/utils/DataLazyLoader'
import { createTestData } from '../setup'

describe('DataLazyLoader', () => {
  let lazyLoader: DataLazyLoader
  let testData: any[]
  let mockLoader: any

  beforeEach(() => {
    testData = createTestData(100)

    mockLoader = vi.fn().mockImplementation((offset: number, limit: number) => {
      const data = testData.slice(offset, offset + limit)
      return Promise.resolve({
        data,
        total: testData.length,
        hasMore: offset + limit < testData.length
      })
    })

    lazyLoader = new DataLazyLoader(mockLoader, {
      pageSize: 10,
      preloadPages: 1,
      cachePages: 5,
      enablePreload: false, // 在大部分测试中禁用预加载以避免额外调用
      enableCache: true,
      timeout: 5000
    })
  })

  afterEach(() => {
    lazyLoader.destroy()
  })

  describe('基础数据加载', () => {
    it('应该能加载指定范围的数据', async () => {
      const result = await lazyLoader.getData(0, 15)

      expect(result).toHaveLength(16) // 0-15 包含16个元素
      expect(result).toEqual(testData.slice(0, 16))
      expect(mockLoader).toHaveBeenCalledWith(0, 10) // 第一页
      expect(mockLoader).toHaveBeenCalledWith(10, 10) // 第二页
    })

    it('应该能加载跨页数据', async () => {
      const result = await lazyLoader.getData(5, 25)

      expect(result).toHaveLength(21) // 5-25 包含21个元素
      expect(result).toEqual(testData.slice(5, 26))
    })

    it('应该能处理边界情况', async () => {
      const result = await lazyLoader.getData(95, 105)

      expect(result).toHaveLength(5) // 只有95-99存在
      expect(result).toEqual(testData.slice(95, 100))
    })
  })

  describe('缓存机制', () => {
    it('应该缓存已加载的页面', async () => {
      // 第一次加载
      await lazyLoader.getData(0, 9)
      expect(mockLoader).toHaveBeenCalledTimes(1)

      // 第二次加载相同范围应该使用缓存
      await lazyLoader.getData(0, 9)
      expect(mockLoader).toHaveBeenCalledTimes(1)
    })

    it('应该在缓存满时清除最少使用的页面', async () => {
      // 加载多个页面填满缓存
      for (let i = 0; i < 7; i++) {
        await lazyLoader.getData(i * 10, i * 10 + 5)
      }

      // 访问第一页增加其使用频率
      await lazyLoader.getData(0, 5)

      // 加载新页面，应该清除最少使用的页面
      await lazyLoader.getData(70, 75)

      const stats = lazyLoader.getCacheStats()
      expect(stats.cachedPages).toBeLessThanOrEqual(5)
    })

    it('应该能获取缓存统计信息', async () => {
      await lazyLoader.getData(0, 15)

      const stats = lazyLoader.getCacheStats()
      expect(stats).toMatchObject({
        totalPages: expect.any(Number),
        loadingPages: expect.any(Number),
        cachedPages: expect.any(Number),
        memoryUsage: expect.any(Number)
      })
    })
  })

  describe('预加载机制', () => {
    it('应该预加载相邻页面', async () => {
      // 为预加载测试创建单独的实例
      const preloadLoader = new DataLazyLoader(mockLoader, {
        pageSize: 10,
        preloadPages: 1,
        cachePages: 5,
        enablePreload: true,
        enableCache: true,
        timeout: 5000
      })

      await preloadLoader.getData(10, 19)

      // 等待预加载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 预加载应该已经加载了相邻页面
      expect(mockLoader).toHaveBeenCalledWith(0, 10) // 前一页
      expect(mockLoader).toHaveBeenCalledWith(20, 10) // 后一页

      preloadLoader.destroy()
    })

    it('应该在禁用预加载时不预加载', async () => {
      const noPreloadLoader = new DataLazyLoader(mockLoader, {
        pageSize: 10,
        enablePreload: false
      })

      await noPreloadLoader.getData(10, 19)

      // 只应该加载必需的页面
      expect(mockLoader).toHaveBeenCalledWith(10, 10)
      expect(mockLoader).not.toHaveBeenCalledWith(0, 10)
      expect(mockLoader).not.toHaveBeenCalledWith(20, 10)

      noPreloadLoader.destroy()
    })
  })

  describe('加载状态管理', () => {
    it('应该正确报告加载状态', async () => {
      const loadingPromise = lazyLoader.getData(0, 9)

      // 等待一小段时间确保加载状态被设置
      await new Promise(resolve => setTimeout(resolve, 10))

      const loadingState = lazyLoader.getLoadingState()
      expect(loadingState.isLoading).toBe(true)
      expect(loadingState.loadingPages.size).toBeGreaterThan(0)

      await loadingPromise

      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 10))

      const completedState = lazyLoader.getLoadingState()
      expect(completedState.isLoading).toBe(false)
      expect(completedState.loadingPages.size).toBe(0)
    })

    it('应该触发加载状态变更事件', async () => {
      const stateChangeSpy = vi.fn()
      lazyLoader.on('loading-state-change', stateChangeSpy)

      await lazyLoader.getData(0, 9)

      expect(stateChangeSpy).toHaveBeenCalledWith({
        isLoading: expect.any(Boolean),
        loadingPages: expect.any(Array)
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理加载错误', async () => {
      const errorLoader = vi.fn().mockRejectedValue(new Error('加载失败'))
      const errorLazyLoader = new DataLazyLoader(errorLoader)

      await expect(errorLazyLoader.getData(0, 9))
        .rejects.toThrow('加载失败')

      errorLazyLoader.destroy()
    })

    it('应该触发加载错误事件', async () => {
      const errorSpy = vi.fn()
      const errorLoader = vi.fn().mockRejectedValue(new Error('加载失败'))
      const errorLazyLoader = new DataLazyLoader(errorLoader)

      errorLazyLoader.on('load-error', errorSpy)

      try {
        await errorLazyLoader.getData(0, 9)
      } catch (error) {
        // 忽略错误
      }

      expect(errorSpy).toHaveBeenCalledWith({
        page: 0,
        error: expect.any(Error)
      })

      errorLazyLoader.destroy()
    })

    it('应该处理加载超时', async () => {
      const slowLoader = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 6000))
      )

      const timeoutLoader = new DataLazyLoader(slowLoader, {
        timeout: 1000
      })

      await expect(timeoutLoader.getData(0, 9))
        .rejects.toThrow('加载超时')

      timeoutLoader.destroy()
    })
  })

  describe('数据刷新', () => {
    it('应该能刷新指定页面', async () => {
      // 初始加载
      await lazyLoader.getData(0, 9)
      expect(mockLoader).toHaveBeenCalledTimes(1)

      // 刷新页面
      await lazyLoader.refreshPage(0)
      expect(mockLoader).toHaveBeenCalledTimes(2)
    })

    it('应该能刷新所有缓存', async () => {
      await lazyLoader.getData(0, 19)

      const initialTotal = lazyLoader.getTotalCount()

      // 修改mock数据
      testData = createTestData(150)
      mockLoader.mockImplementation((offset: number, limit: number) => {
        const data = testData.slice(offset, offset + limit)
        return Promise.resolve({
          data,
          total: testData.length,
          hasMore: offset + limit < testData.length
        })
      })

      await lazyLoader.refreshAll()

      // 重新加载数据
      await lazyLoader.getData(0, 9)

      expect(lazyLoader.getTotalCount()).toBe(150)
      expect(lazyLoader.getTotalCount()).not.toBe(initialTotal)
    })
  })

  describe('事件系统', () => {
    it('应该触发页面加载完成事件', async () => {
      const pageLoadedSpy = vi.fn()
      lazyLoader.on('page-loaded', pageLoadedSpy)

      await lazyLoader.getData(0, 9)

      expect(pageLoadedSpy).toHaveBeenCalledWith({
        page: 0,
        data: expect.any(Array),
        total: 100,
        hasMore: true
      })
    })

    it('应该能移除事件监听器', () => {
      const listener = vi.fn()

      lazyLoader.on('page-loaded', listener)
      lazyLoader.off('page-loaded', listener)

      // 触发事件不应该调用监听器
      lazyLoader.eventManager.emit('page-loaded', {})
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('数据状态', () => {
    it('应该正确报告总数据量', async () => {
      await lazyLoader.getData(0, 9)

      expect(lazyLoader.getTotalCount()).toBe(100)
    })

    it('应该正确报告是否有更多数据', async () => {
      await lazyLoader.getData(0, 9)
      expect(lazyLoader.getHasMoreData()).toBe(true)

      await lazyLoader.getData(90, 99)
      expect(lazyLoader.getHasMoreData()).toBe(false)
    })
  })

  describe('销毁', () => {
    it('应该能正确销毁懒加载器', () => {
      const stats = lazyLoader.getCacheStats()
      expect(stats.totalPages).toBeGreaterThanOrEqual(0)

      lazyLoader.destroy()

      // 销毁后应该清理所有资源
      expect(() => lazyLoader.getCacheStats()).not.toThrow()
    })
  })
})
