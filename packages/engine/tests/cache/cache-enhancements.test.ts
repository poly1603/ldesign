import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CacheManagerImpl } from '../../src/cache/cache-manager'

describe('缓存管理器功能增强', () => {
  let cacheManager: CacheManagerImpl<string>

  beforeEach(() => {
    cacheManager = new CacheManagerImpl({ maxSize: 100 })
  })

  describe('智能预加载功能', () => {
    it('应该支持高优先级预加载', async () => {
      const loader = vi.fn().mockImplementation((key: string) => `value-${key}`)

      await cacheManager.preload(['key1', 'key2'], loader, { priority: 'high' })

      expect(loader).toHaveBeenCalledTimes(2)
      expect(cacheManager.get('key1')).toBe('value-key1')
      expect(cacheManager.get('key2')).toBe('value-key2')
    })

    it('应该支持低优先级预加载', async () => {
      const loader = vi.fn().mockImplementation((key: string) => `value-${key}`)

      // 低优先级预加载不会阻塞
      await cacheManager.preload(['key1', 'key2'], loader, { priority: 'low' })

      // 给异步操作一些时间
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(loader).toHaveBeenCalledTimes(2)
      expect(cacheManager.get('key1')).toBe('value-key1')
      expect(cacheManager.get('key2')).toBe('value-key2')
    })

    it('应该跳过已存在的缓存项', async () => {
      cacheManager.set('key1', 'existing-value')

      const loader = vi.fn().mockImplementation((key: string) => `value-${key}`)

      await cacheManager.preload(['key1', 'key2'], loader, { priority: 'high' })

      expect(loader).toHaveBeenCalledTimes(1)
      expect(loader).toHaveBeenCalledWith('key2')
      expect(cacheManager.get('key1')).toBe('existing-value')
      expect(cacheManager.get('key2')).toBe('value-key2')
    })

    it('应该处理预加载失败', async () => {
      const loader = vi.fn().mockImplementation((key: string) => {
        if (key === 'error-key') {
          throw new Error('Load failed')
        }
        return `value-${key}`
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      await cacheManager.preload(['key1', 'error-key', 'key2'], loader, { priority: 'high' })

      expect(loader).toHaveBeenCalledTimes(3)
      expect(cacheManager.get('key1')).toBe('value-key1')
      expect(cacheManager.get('error-key')).toBeUndefined()
      expect(cacheManager.get('key2')).toBe('value-key2')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to preload cache key: error-key',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('缓存预热功能', () => {
    it('应该支持缓存预热', async () => {
      const warmupData = [
        { key: 'key1', loader: () => 'value1', ttl: 1000 },
        { key: 'key2', loader: () => Promise.resolve('value2') },
        { key: 'key3', loader: async () => 'value3' }
      ]

      await cacheManager.warmup(warmupData)

      expect(cacheManager.get('key1')).toBe('value1')
      expect(cacheManager.get('key2')).toBe('value2')
      expect(cacheManager.get('key3')).toBe('value3')
    })

    it('应该处理预热失败', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const warmupData = [
        { key: 'key1', loader: () => 'value1' },
        { key: 'error-key', loader: () => { throw new Error('Warmup failed') } },
        { key: 'key2', loader: () => 'value2' }
      ]

      await cacheManager.warmup(warmupData)

      expect(cacheManager.get('key1')).toBe('value1')
      expect(cacheManager.get('error-key')).toBeUndefined()
      expect(cacheManager.get('key2')).toBe('value2')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to warmup cache key: error-key',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('增强的统计信息', () => {
    it('应该提供详细的统计信息', () => {
      // 重置统计信息
      cacheManager = new CacheManagerImpl({ maxSize: 100 })

      // 添加一些缓存项
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.set('key3', 'value3')

      // 触发一些命中和未命中
      cacheManager.get('key1') // 命中
      cacheManager.get('key2') // 命中
      cacheManager.get('nonexistent') // 未命中

      const stats = cacheManager.getStats()

      expect(stats.size).toBe(3)
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.67) // 2/3 ≈ 0.67
      expect(stats.memoryUsage).toBeGreaterThan(0)
      expect(stats.averageItemSize).toBeGreaterThan(0)
    })

    it('应该正确计算命中率', () => {
      // 重置统计信息
      cacheManager = new CacheManagerImpl({ maxSize: 100 })

      // 没有访问时命中率应该为 0
      let stats = cacheManager.getStats()
      expect(stats.hitRate).toBe(0)

      cacheManager.set('key1', 'value1')

      // 全部命中
      cacheManager.get('key1')
      cacheManager.get('key1')
      stats = cacheManager.getStats()
      expect(stats.hitRate).toBe(1)

      // 部分命中
      cacheManager.get('nonexistent')
      stats = cacheManager.getStats()
      expect(stats.hitRate).toBe(0.67) // 2/3
    })

    it('应该估算内存使用', () => {
      const stats1 = cacheManager.getStats()
      expect(stats1.memoryUsage).toBe(0)
      expect(stats1.averageItemSize).toBe(0)

      cacheManager.set('key1', 'short')
      cacheManager.set('key2', 'a much longer value that takes more memory')

      const stats2 = cacheManager.getStats()
      expect(stats2.memoryUsage).toBeGreaterThan(0)
      expect(stats2.averageItemSize).toBeGreaterThan(0)
      expect(stats2.averageItemSize).toBe(Math.round(stats2.memoryUsage / 2))
    })
  })

  describe('优化的 values 和 entries 方法', () => {
    it('应该高效地返回所有值', async () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2', 1) // 1ms TTL，会立即过期

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 10))

      const values = cacheManager.values()

      // 应该只包含未过期的值
      expect(values).toEqual(['value1'])
      expect(cacheManager.size()).toBe(1) // 过期项应该被清理
    })

    it('应该高效地返回所有条目', async () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2', 1) // 1ms TTL，会立即过期

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 10))

      const entries = cacheManager.entries()

      // 应该只包含未过期的条目
      expect(entries).toEqual([['key1', 'value1']])
      expect(cacheManager.size()).toBe(1) // 过期项应该被清理
    })
  })
})
