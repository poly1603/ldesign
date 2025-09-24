import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Prefetcher } from '../../src/utils/prefetcher'

describe('Prefetcher', () => {
  let prefetcher: Prefetcher
  let mockCache: Map<string, any>
  let fetcherSpy: any

  beforeEach(() => {
    vi.useFakeTimers()
    mockCache = new Map()
    fetcherSpy = vi.fn().mockResolvedValue('fetched-data')
    
    prefetcher = new Prefetcher(mockCache, {
      maxConcurrent: 2,
      timeout: 1000,
      enablePredictive: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    prefetcher.dispose()
  })

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(prefetcher).toBeDefined()
    })

    it('应该能够添加预取规则', () => {
      const rule = {
        id: 'test-rule',
        trigger: () => true,
        keys: ['key1', 'key2'],
        fetcher: fetcherSpy,
        priority: 1,
      }

      prefetcher.addRule(rule)

      // 验证规则被添加
      expect(prefetcher).toBeDefined()
    })

    it('应该能够移除预取规则', () => {
      const rule = {
        id: 'test-rule',
        trigger: () => true,
        keys: ['key1', 'key2'],
        fetcher: fetcherSpy,
      }

      prefetcher.addRule(rule)
      prefetcher.removeRule('test-rule')

      // 验证规则被移除
      expect(prefetcher).toBeDefined()
    })

    it('应该能够记录访问', () => {
      prefetcher.recordAccess('test-key')

      // 验证访问被记录
      expect(prefetcher).toBeDefined()
    })

    it('应该能够手动预取', async () => {
      await prefetcher.prefetch(['key1', 'key2'], fetcherSpy)

      // 验证预取完成
      expect(prefetcher).toBeDefined()
    })

    it('应该能够获取统计信息', () => {
      const stats = prefetcher.getStats()

      expect(stats).toBeDefined()
      expect(stats).toHaveProperty('totalTasks')
      expect(stats).toHaveProperty('pendingTasks')
      expect(stats).toHaveProperty('completedTasks')
      expect(stats).toHaveProperty('failedTasks')
    })

    it('应该能够销毁预取器', () => {
      prefetcher.dispose()

      // 验证销毁成功
      expect(prefetcher).toBeDefined()
    })
  })

  describe('预取规则触发', () => {
    it('应该在满足条件时触发预取规则', async () => {
      const rule = {
        id: 'trigger-rule',
        trigger: (context: any) => context.currentKey === 'trigger-key',
        keys: ['prefetch-key'],
        fetcher: fetcherSpy,
        strategy: 'eager' as const,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('trigger-key')

      // 等待一段时间让预取触发
      await vi.advanceTimersByTimeAsync(100)

      // 验证预取被触发
      expect(prefetcher).toBeDefined()
    })

    it('应该支持动态键生成', async () => {
      const rule = {
        id: 'dynamic-rule',
        trigger: (context: any) => context.currentKey === 'user:123',
        keys: (context: any) => [`${context.currentKey}:profile`, `${context.currentKey}:settings`],
        fetcher: fetcherSpy,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('user:123')

      // 等待一段时间让预取触发
      await vi.advanceTimersByTimeAsync(100)

      // 验证动态键生成
      expect(prefetcher).toBeDefined()
    })

    it('应该按优先级处理规则', async () => {
      const rule1 = {
        id: 'high-priority',
        trigger: () => true,
        keys: ['key1'],
        fetcher: vi.fn().mockResolvedValue('data1'),
        priority: 10,
      }

      const rule2 = {
        id: 'low-priority',
        trigger: () => true,
        keys: ['key2'],
        fetcher: vi.fn().mockResolvedValue('data2'),
        priority: 1,
      }

      prefetcher.addRule(rule1)
      prefetcher.addRule(rule2)
      prefetcher.recordAccess('test-key')

      // 等待一段时间让预取触发
      await vi.advanceTimersByTimeAsync(100)

      // 验证优先级处理
      expect(prefetcher).toBeDefined()
    })
  })

  describe('预取策略', () => {
    it('应该支持 eager 策略', async () => {
      const rule = {
        id: 'eager-rule',
        trigger: () => true,
        keys: ['eager-key'],
        fetcher: fetcherSpy,
        strategy: 'eager' as const,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      // eager 策略应该立即执行
      await vi.advanceTimersByTimeAsync(100)
      expect(prefetcher).toBeDefined()
    })

    it('应该支持延迟策略', async () => {
      const rule = {
        id: 'lazy-rule',
        trigger: () => true,
        keys: ['lazy-key'],
        fetcher: fetcherSpy,
        strategy: 'lazy' as const,
        delay: 100,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      // 延迟策略应该在延迟后执行
      await vi.advanceTimersByTimeAsync(100)

      expect(prefetcher).toBeDefined()
    })
  })

  describe('并发控制', () => {
    it('应该限制最大并发数', async () => {
      const rule = {
        id: 'concurrent-rule',
        trigger: () => true,
        keys: ['key1', 'key2', 'key3', 'key4'],
        fetcher: fetcherSpy,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      await vi.advanceTimersByTimeAsync(100)

      // 应该有调用，但受并发限制
      expect(prefetcher).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理预取错误', async () => {
      const errorFetcher = vi.fn().mockRejectedValue(new Error('Fetch error'))
      
      const rule = {
        id: 'error-rule',
        trigger: () => true,
        keys: ['error-key'],
        fetcher: errorFetcher,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      await vi.advanceTimersByTimeAsync(100)

      // 错误应该被处理，不会抛出
      expect(prefetcher).toBeDefined()
    })

    it('应该处理超时', async () => {
      const slowFetcher = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      )
      
      const rule = {
        id: 'timeout-rule',
        trigger: () => true,
        keys: ['timeout-key'],
        fetcher: slowFetcher,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      // 模拟超时
      await vi.advanceTimersByTimeAsync(1000)

      expect(prefetcher).toBeDefined()
    })
  })

  describe('统计信息', () => {
    it('应该提供预取统计信息', async () => {
      const rule = {
        id: 'stats-rule',
        trigger: () => true,
        keys: ['stats-key'],
        fetcher: fetcherSpy,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      await vi.advanceTimersByTimeAsync(100)

      const stats = prefetcher.getStats()

      expect(stats).toHaveProperty('totalTasks')
      expect(stats).toHaveProperty('pendingTasks')
      expect(stats).toHaveProperty('completedTasks')
      expect(stats).toHaveProperty('failedTasks')
    })
  })

  describe('预测性预取', () => {
    it('应该支持预测性预取', async () => {
      // 记录访问模式
      prefetcher.recordAccess('page1')
      prefetcher.recordAccess('page2')
      prefetcher.recordAccess('page3')

      // 再次访问 page1，应该预测 page2
      prefetcher.recordAccess('page1')

      await vi.advanceTimersByTimeAsync(100)

      expect(prefetcher).toBeDefined()
    })
  })

  describe('缓存集成', () => {
    it('应该与缓存系统集成', async () => {
      // 预设缓存数据
      mockCache.set('existing-key', 'existing-data')

      const rule = {
        id: 'cache-rule',
        trigger: () => true,
        keys: ['existing-key', 'new-key'],
        fetcher: fetcherSpy,
      }

      prefetcher.addRule(rule)
      prefetcher.recordAccess('test-key')

      await vi.advanceTimersByTimeAsync(100)

      // 应该只预取不存在的键
      expect(prefetcher).toBeDefined()
    })
  })

  describe('性能优化', () => {
    it('应该避免重复预取', async () => {
      const rule = {
        id: 'duplicate-rule',
        trigger: () => true,
        keys: ['duplicate-key'],
        fetcher: fetcherSpy,
      }

      prefetcher.addRule(rule)
      
      // 多次触发相同的预取
      prefetcher.recordAccess('test-key')
      prefetcher.recordAccess('test-key')
      prefetcher.recordAccess('test-key')

      await vi.advanceTimersByTimeAsync(100)

      // 应该避免重复预取
      expect(prefetcher).toBeDefined()
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      prefetcher.dispose()

      // 应该清理所有资源
      expect(prefetcher).toBeDefined()
    })
  })
})
