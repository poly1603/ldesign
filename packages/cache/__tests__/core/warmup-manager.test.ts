import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WarmupManager, createWarmupManager } from '../../src/core/warmup-manager'
import { CacheManager } from '../../src/core/cache-manager'
import type { WarmupItem } from '../../src/core/warmup-manager'

describe('WarmupManager', () => {
  let cacheManager: CacheManager
  let warmupManager: WarmupManager
  
  beforeEach(() => {
    vi.useFakeTimers()
    cacheManager = new CacheManager()
    warmupManager = new WarmupManager(cacheManager)
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该能够创建预热管理器', () => {
      expect(warmupManager).toBeDefined()
      expect(warmupManager).toBeInstanceOf(WarmupManager)
    })

    it('应该能够使用工厂函数创建', () => {
      const manager = createWarmupManager(cacheManager, {
        concurrency: 5,
        timeout: 5000
      })
      
      expect(manager).toBeInstanceOf(WarmupManager)
    })

    it('应该能够注册单个预热项', () => {
      const item: WarmupItem = {
        key: 'test-key',
        fetcher: () => 'test-value'
      }
      
      warmupManager.register(item)
      
      const status = warmupManager.getStatus()
      expect(status.itemCount).toBe(1)
      expect(status.items[0].key).toBe('test-key')
    })

    it('应该能够注册多个预热项', () => {
      const items: WarmupItem[] = [
        { key: 'key1', fetcher: () => 'value1' },
        { key: 'key2', fetcher: () => 'value2' },
        { key: 'key3', fetcher: () => 'value3' }
      ]
      
      warmupManager.register(items)
      
      const status = warmupManager.getStatus()
      expect(status.itemCount).toBe(3)
    })

    it('应该能够注销预热项', () => {
      warmupManager.register([
        { key: 'key1', fetcher: () => 'value1' },
        { key: 'key2', fetcher: () => 'value2' }
      ])
      
      warmupManager.unregister('key1')
      
      const status = warmupManager.getStatus()
      expect(status.itemCount).toBe(1)
      expect(status.items[0].key).toBe('key2')
    })

    it('应该能够注销多个预热项', () => {
      warmupManager.register([
        { key: 'key1', fetcher: () => 'value1' },
        { key: 'key2', fetcher: () => 'value2' },
        { key: 'key3', fetcher: () => 'value3' }
      ])
      
      warmupManager.unregister(['key1', 'key3'])
      
      const status = warmupManager.getStatus()
      expect(status.itemCount).toBe(1)
      expect(status.items[0].key).toBe('key2')
    })

    it('应该能够清空所有预热项', () => {
      warmupManager.register([
        { key: 'key1', fetcher: () => 'value1' },
        { key: 'key2', fetcher: () => 'value2' }
      ])
      
      warmupManager.clear()
      
      const status = warmupManager.getStatus()
      expect(status.itemCount).toBe(0)
    })
  })

  describe('预热执行', () => {
    it('应该能够执行基本预热', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('value1')
      const fetcher2 = vi.fn().mockResolvedValue('value2')
      
      warmupManager.register([
        { key: 'key1', fetcher: fetcher1 },
        { key: 'key2', fetcher: fetcher2 }
      ])
      
      const result = await warmupManager.warmup()
      
      expect(result.successful).toEqual(['key1', 'key2'])
      expect(result.failed).toHaveLength(0)
      expect(result.stats.total).toBe(2)
      expect(result.stats.success).toBe(2)
      expect(result.stats.failed).toBe(0)
      
      expect(fetcher1).toHaveBeenCalled()
      expect(fetcher2).toHaveBeenCalled()
    })

    it('应该能够执行指定键的预热', async () => {
      const fetcher1 = vi.fn().mockResolvedValue('value1')
      const fetcher2 = vi.fn().mockResolvedValue('value2')
      const fetcher3 = vi.fn().mockResolvedValue('value3')
      
      warmupManager.register([
        { key: 'key1', fetcher: fetcher1 },
        { key: 'key2', fetcher: fetcher2 },
        { key: 'key3', fetcher: fetcher3 }
      ])
      
      const result = await warmupManager.warmup(['key1', 'key3'])
      
      expect(result.successful).toContain('key1')
      expect(result.successful).toContain('key3')
      expect(result.stats.total).toBe(2)
      
      expect(fetcher1).toHaveBeenCalled()
      expect(fetcher2).not.toHaveBeenCalled()
      expect(fetcher3).toHaveBeenCalled()
    })

    it('应该按优先级排序执行', async () => {
      const executionOrder: string[] = []
      
      warmupManager.register([
        { 
          key: 'low-priority', 
          fetcher: () => { executionOrder.push('low-priority'); return 'value1' },
          priority: 1
        },
        { 
          key: 'high-priority', 
          fetcher: () => { executionOrder.push('high-priority'); return 'value2' },
          priority: 10
        },
        { 
          key: 'medium-priority', 
          fetcher: () => { executionOrder.push('medium-priority'); return 'value3' },
          priority: 5
        }
      ])
      
      await warmupManager.warmup()
      
      expect(executionOrder).toEqual(['high-priority', 'medium-priority', 'low-priority'])
    })

    it('应该处理依赖关系', async () => {
      const executionOrder: string[] = []
      
      warmupManager.register([
        { 
          key: 'dependent', 
          fetcher: () => { executionOrder.push('dependent'); return 'value1' },
          dependencies: ['dependency']
        },
        { 
          key: 'dependency', 
          fetcher: () => { executionOrder.push('dependency'); return 'value2' }
        }
      ])
      
      await warmupManager.warmup()
      
      expect(executionOrder).toEqual(['dependency', 'dependent'])
    })

    it('应该检测循环依赖', async () => {
      warmupManager.register([
        { 
          key: 'key1', 
          fetcher: () => 'value1',
          dependencies: ['key2']
        },
        { 
          key: 'key2', 
          fetcher: () => 'value2',
          dependencies: ['key1']
        }
      ])
      
      await expect(warmupManager.warmup()).rejects.toThrow('Circular dependency detected')
    })
  })

  describe('错误处理', () => {
    it('应该处理预热失败', async () => {
      const error = new Error('Fetch failed')
      const failingFetcher = vi.fn().mockRejectedValue(error)
      const successFetcher = vi.fn().mockResolvedValue('success')
      
      warmupManager.register([
        { key: 'failing-key', fetcher: failingFetcher },
        { key: 'success-key', fetcher: successFetcher }
      ])
      
      const result = await warmupManager.warmup()
      
      expect(result.successful).toEqual(['success-key'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].key).toBe('failing-key')
      expect(result.failed[0].error).toBe(error)
    })

    it('应该支持重试机制', async () => {
      let attempts = 0
      const retryFetcher = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success-after-retry'
      })
      
      const retryManager = new WarmupManager(cacheManager, {
        retries: 3,
        retryDelay: 100
      })
      
      retryManager.register({
        key: 'retry-key',
        fetcher: retryFetcher
      })
      
      const result = await retryManager.warmup()
      
      expect(result.successful).toEqual(['retry-key'])
      expect(retryFetcher).toHaveBeenCalledTimes(3)
    })

    it('应该支持超时处理', async () => {
      const slowFetcher = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      )
      
      const timeoutManager = new WarmupManager(cacheManager, {
        timeout: 1000
      })
      
      timeoutManager.register({
        key: 'slow-key',
        fetcher: slowFetcher
      })
      
      const result = await timeoutManager.warmup()
      
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].key).toBe('slow-key')
    })

    it('应该防止并发预热', async () => {
      warmupManager.register({
        key: 'test-key',
        fetcher: () => new Promise(resolve => setTimeout(resolve, 1000))
      })
      
      const firstWarmup = warmupManager.warmup()
      
      await expect(warmupManager.warmup()).rejects.toThrow('Warmup is already running')
      
      await firstWarmup
    })
  })

  describe('并发控制', () => {
    it('应该限制并发数', async () => {
      let concurrentCount = 0
      let maxConcurrent = 0
      
      const concurrentFetcher = vi.fn().mockImplementation(async () => {
        concurrentCount++
        maxConcurrent = Math.max(maxConcurrent, concurrentCount)
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        concurrentCount--
        return 'value'
      })
      
      const concurrencyManager = new WarmupManager(cacheManager, {
        concurrency: 2
      })
      
      // 注册5个项目
      for (let i = 0; i < 5; i++) {
        concurrencyManager.register({
          key: `key-${i}`,
          fetcher: concurrentFetcher
        })
      }
      
      await concurrencyManager.warmup()
      
      expect(maxConcurrent).toBeLessThanOrEqual(2)
      expect(concurrentFetcher).toHaveBeenCalledTimes(5)
    })
  })

  describe('状态管理', () => {
    it('应该能够获取状态信息', () => {
      warmupManager.register([
        { key: 'key1', fetcher: () => 'value1', priority: 5 },
        { key: 'key2', fetcher: () => 'value2', priority: 10 }
      ])
      
      const status = warmupManager.getStatus()
      
      expect(status.running).toBe(false)
      expect(status.itemCount).toBe(2)
      expect(status.items).toHaveLength(2)
      expect(status.items.find(item => item.key === 'key1')?.priority).toBe(5)
      expect(status.items.find(item => item.key === 'key2')?.priority).toBe(10)
    })

    it('应该在预热期间显示运行状态', async () => {
      warmupManager.register({
        key: 'test-key',
        fetcher: () => new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const warmupPromise = warmupManager.warmup()
      
      // 在预热期间检查状态
      expect(warmupManager.getStatus().running).toBe(true)
      
      await warmupPromise
      
      // 预热完成后检查状态
      expect(warmupManager.getStatus().running).toBe(false)
    })
  })

  describe('缓存集成', () => {
    it('应该将数据存储到缓存中', async () => {
      const setSpy = vi.spyOn(cacheManager, 'set')
      
      warmupManager.register({
        key: 'cache-key',
        fetcher: () => 'cache-value',
        options: { ttl: 3600, engine: 'memory' }
      })
      
      await warmupManager.warmup()
      
      expect(setSpy).toHaveBeenCalledWith(
        'cache-key',
        'cache-value',
        { ttl: 3600, engine: 'memory' }
      )
    })

    it('应该支持异步 fetcher', async () => {
      const asyncFetcher = vi.fn().mockResolvedValue('async-value')
      
      warmupManager.register({
        key: 'async-key',
        fetcher: asyncFetcher
      })
      
      const result = await warmupManager.warmup()
      
      expect(result.successful).toEqual(['async-key'])
      expect(asyncFetcher).toHaveBeenCalled()
    })
  })
})
