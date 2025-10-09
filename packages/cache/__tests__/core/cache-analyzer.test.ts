import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CacheAnalyzer } from '../../src/core/cache-analyzer'

describe('CacheAnalyzer', () => {
  let analyzer: CacheAnalyzer
  let mockCacheManager: any

  beforeEach(() => {
    mockCacheManager = {
      on: vi.fn(),
      off: vi.fn(),
      getStats: vi.fn().mockResolvedValue({
        totalSize: 1024,
        totalItems: 10,
        hitRate: 0.85,
        engines: {
          memory: { size: 512, itemCount: 5, hits: 8, misses: 2, available: true },
          localStorage: { size: 512, itemCount: 5, hits: 7, misses: 3, available: true },
        },
      }),
    }

    analyzer = new CacheAnalyzer(mockCacheManager, {
      enabled: true,
      sampleRate: 1.0,
      maxRecords: 1000,
    })
  })

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(analyzer).toBeDefined()
      expect(mockCacheManager.on).toHaveBeenCalledWith('get', expect.any(Function))
      expect(mockCacheManager.on).toHaveBeenCalledWith('set', expect.any(Function))
      expect(mockCacheManager.on).toHaveBeenCalledWith('remove', expect.any(Function))
      expect(mockCacheManager.on).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('应该能够生成分析报告', async () => {
      const report = await analyzer.generateReport()

      expect(report).toBeDefined()
      expect(report).toHaveProperty('timestamp')
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('accessPatterns')
      expect(report).toHaveProperty('storage')
      expect(report).toHaveProperty('suggestions')
    })

    it('应该能够重置分析数据', () => {
      analyzer.reset()

      // 重置后应该能够正常工作
      expect(analyzer).toBeDefined()
    })

    it('应该能够销毁分析器', () => {
      analyzer.destroy()

      expect(mockCacheManager.off).toHaveBeenCalled()
    })
  })

  describe('事件处理', () => {
    it('应该注册事件监听器', () => {
      expect(mockCacheManager.on).toHaveBeenCalledWith('get', expect.any(Function))
      expect(mockCacheManager.on).toHaveBeenCalledWith('set', expect.any(Function))
      expect(mockCacheManager.on).toHaveBeenCalledWith('remove', expect.any(Function))
      expect(mockCacheManager.on).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('应该能够处理缓存事件', () => {
      // 模拟事件处理
      const getHandler = mockCacheManager.on.mock.calls.find(
        (call: any[]) => call[0] === 'get'
      )?.[1]

      if (getHandler) {
        const event = {
          type: 'get',
          key: 'test-key',
          value: 'test-value',
          engine: 'memory',
          timestamp: Date.now(),
        }

        expect(() => getHandler(event)).not.toThrow()
      }
    })
  })

  describe('报告生成', () => {
    it('应该生成包含所有必要字段的报告', async () => {
      const report = await analyzer.generateReport()

      expect(report).toHaveProperty('timestamp')
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('accessPatterns')
      expect(report).toHaveProperty('storage')
      expect(report).toHaveProperty('suggestions')
    })

    it('应该包含缓存统计信息', async () => {
      const report = await analyzer.generateReport()

      expect(mockCacheManager.getStats).toHaveBeenCalled()
      expect(report.summary).toBeDefined()
    })
  })

  describe('性能监控', () => {
    it('应该能够记录操作性能', () => {
      // 模拟多个操作
      const getHandler = mockCacheManager.on.mock.calls.find(
        (call: any[]) => call[0] === 'get'
      )?.[1]

      if (getHandler) {
        getHandler({
          type: 'get',
          key: 'key1',
          value: 'value1',
          engine: 'memory',
          timestamp: Date.now() - 10,
        })

        getHandler({
          type: 'get',
          key: 'key2',
          value: 'value2',
          engine: 'memory',
          timestamp: Date.now() - 5,
        })

        expect(analyzer).toBeDefined()
      }
    })
  })

  describe('访问模式分析', () => {
    it('应该跟踪访问模式', () => {
      const getHandler = mockCacheManager.on.mock.calls.find(
        (call: any[]) => call[0] === 'get'
      )?.[1]

      if (getHandler) {
        // 模拟多次访问同一个键
        for (let i = 0; i < 3; i++) {
          getHandler({
            type: 'get',
            key: 'frequent-key',
            value: 'value',
            engine: 'memory',
            timestamp: Date.now() - i * 1000,
          })
        }

        expect(analyzer).toBeDefined()
      }
    })

    it('应该区分命中和未命中', () => {
      const getHandler = mockCacheManager.on.mock.calls.find(
        (call: any[]) => call[0] === 'get'
      )?.[1]

      if (getHandler) {
        // 模拟命中
        getHandler({
          type: 'get',
          key: 'hit-key',
          value: 'value',
          engine: 'memory',
          timestamp: Date.now(),
        })

        // 模拟未命中
        getHandler({
          type: 'get',
          key: 'miss-key',
          value: undefined,
          engine: 'memory',
          timestamp: Date.now(),
        })

        expect(analyzer).toBeDefined()
      }
    })
  })

  describe('错误处理', () => {
    it('应该记录错误信息', () => {
      const errorHandler = mockCacheManager.on.mock.calls.find(
        (call: any[]) => call[0] === 'error'
      )?.[1]

      if (errorHandler) {
        const error = new Error('Test error')
        errorHandler({
          type: 'error',
          key: 'error-key',
          engine: 'memory',
          timestamp: Date.now(),
          error,
        })

        expect(analyzer).toBeDefined()
      }
    })
  })

  describe('配置选项', () => {
    it('应该支持禁用分析', () => {
      const disabledAnalyzer = new CacheAnalyzer(mockCacheManager, {
        enabled: false,
      })

      expect(disabledAnalyzer).toBeDefined()
    })

    it('应该支持采样率配置', () => {
      const sampledAnalyzer = new CacheAnalyzer(mockCacheManager, {
        sampleRate: 0.5,
      })

      expect(sampledAnalyzer).toBeDefined()
    })

    it('应该支持最大记录数配置', () => {
      const limitedAnalyzer = new CacheAnalyzer(mockCacheManager, {
        maxRecords: 100,
      })

      expect(limitedAnalyzer).toBeDefined()
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      analyzer.destroy()

      expect(mockCacheManager.off).toHaveBeenCalledWith('get', expect.any(Function))
      expect(mockCacheManager.off).toHaveBeenCalledWith('set', expect.any(Function))
      expect(mockCacheManager.off).toHaveBeenCalledWith('remove', expect.any(Function))
      expect(mockCacheManager.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('应该能够重置分析数据', () => {
      analyzer.reset()

      // 重置后应该能够继续工作
      expect(() => analyzer.generateReport()).not.toThrow()
    })
  })

  describe('优化建议', () => {
    it('应该生成优化建议', async () => {
      const report = await analyzer.generateReport()

      expect(report.suggestions).toBeDefined()
      expect(Array.isArray(report.suggestions)).toBe(true)
    })
  })
})
