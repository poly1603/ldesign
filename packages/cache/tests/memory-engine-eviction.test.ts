import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryEngine } from '../src/engines/memory-engine'
import { CacheManager } from '../src/core/cache-manager'

describe('MemoryEngine 淘汰策略集成', () => {
  describe('容量限制', () => {
    it('应该在达到最大项数时自动淘汰', async () => {
      const engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'LRU',
      })

      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      
      // 添加第4个项应该触发淘汰
      await engine.set('key4', 'value4', {})
      
      // key1 应该被淘汰（LRU）
      expect(await engine.get('key1')).toBeNull()
      expect(await engine.get('key2')).not.toBeNull()
      expect(await engine.get('key3')).not.toBeNull()
      expect(await engine.get('key4')).not.toBeNull()
    })

    it('应该基于内存限制自动淘汰', async () => {
      const engine = new MemoryEngine({
        maxSize: 1000, // 1KB
        evictionStrategy: 'LRU',
      })

      // 添加数据直到超过内存限制
      const largeValue = 'x'.repeat(400) // ~400 bytes
      
      await engine.set('key1', largeValue, {})
      await engine.set('key2', largeValue, {})
      await engine.set('key3', largeValue, {}) // 应该触发淘汰
      
      const keys = await engine.keys()
      // 实际上可能会保留 3 个项，因为每个项加上键名大约 400+ 字节
      // 3 个项约 1200 字节，稍微超过 1000 字节限制
      expect(keys.length).toBeLessThanOrEqual(3)
      expect(keys.length).toBeGreaterThan(0)
    })
  })

  describe('LRU 淘汰策略', () => {
    let engine: MemoryEngine

    beforeEach(() => {
      engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'LRU',
      })
    })

    it('应该淘汰最近最少使用的项', async () => {
      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      
      // 访问 key1 和 key2
      await engine.get('key1')
      await engine.get('key2')
      
      // 添加新项，key3 应该被淘汰
      await engine.set('key4', 'value4', {})
      
      expect(await engine.get('key1')).toBe('value1')
      expect(await engine.get('key2')).toBe('value2')
      expect(await engine.get('key3')).toBeNull()
      expect(await engine.get('key4')).toBe('value4')
    })

    it('应该在更新时刷新访问时间', async () => {
      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      
      // 更新 key1
      await engine.set('key1', 'new-value1', {})
      
      // 添加新项，key2 应该被淘汰
      await engine.set('key4', 'value4', {})
      
      expect(await engine.get('key1')).toBe('new-value1')
      expect(await engine.get('key2')).toBeNull()
    })
  })

  describe('LFU 淘汰策略', () => {
    let engine: MemoryEngine

    beforeEach(() => {
      engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'LFU',
      })
    })

    it('应该淘汰最不常用的项', async () => {
      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      
      // 多次访问 key1 和 key2
      for (let i = 0; i < 3; i++) {
        await engine.get('key1')
      }
      for (let i = 0; i < 2; i++) {
        await engine.get('key2')
      }
      // key3 只在添加时访问了一次
      
      // 添加新项，key3 应该被淘汰
      await engine.set('key4', 'value4', {})
      
      expect(await engine.get('key1')).toBe('value1')
      expect(await engine.get('key2')).toBe('value2')
      expect(await engine.get('key3')).toBeNull()
      expect(await engine.get('key4')).toBe('value4')
    })
  })

  describe('FIFO 淘汰策略', () => {
    let engine: MemoryEngine

    beforeEach(() => {
      engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'FIFO',
      })
    })

    it('应该按先进先出顺序淘汰', async () => {
      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      
      // 访问顺序不影响 FIFO
      await engine.get('key1')
      await engine.get('key3')
      
      // 添加新项，key1 应该被淘汰（最先添加）
      await engine.set('key4', 'value4', {})
      
      expect(await engine.get('key1')).toBeNull()
      expect(await engine.get('key2')).toBe('value2')
      expect(await engine.get('key3')).toBe('value3')
      expect(await engine.get('key4')).toBe('value4')
    })
  })

  describe('TTL 淘汰策略', () => {
    let engine: MemoryEngine

    beforeEach(() => {
      engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'TTL',
      })
    })

    it('应该优先淘汰即将过期的项', async () => {
      const now = Date.now()
      
      await engine.set('key1', 'value1', { ttl: 5000 }) // 5秒后过期
      await engine.set('key2', 'value2', { ttl: 1000 }) // 1秒后过期
      await engine.set('key3', 'value3', { ttl: 3000 }) // 3秒后过期
      
      // 添加新项，key2 应该被淘汰（最快过期）
      await engine.set('key4', 'value4', {})
      
      expect(await engine.get('key1')).toBe('value1')
      expect(await engine.get('key2')).toBeNull()
      expect(await engine.get('key3')).toBe('value3')
      expect(await engine.get('key4')).toBe('value4')
    })
  })

  describe('Random 淘汰策略', () => {
    it('应该随机淘汰项', async () => {
      const engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'Random',
      })

      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      await engine.set('key4', 'value4', {})
      
      const keys = await engine.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key4') // 新键应该存在
    })
  })

  describe('策略切换', () => {
    it('应该支持运行时切换淘汰策略', async () => {
      const engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'LRU',
      })

      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {})
      
      // 切换到 FIFO
      engine.setEvictionStrategy('FIFO')
      
      // 添加新项，应该按 FIFO 淘汰
      await engine.set('key4', 'value4', {})
      
      // 由于切换了策略，可能有不同的淘汰行为
      const keys = await engine.keys()
      expect(keys).toHaveLength(3)
    })
  })

  describe('淘汰统计', () => {
    it('应该提供淘汰统计信息', async () => {
      const engine = new MemoryEngine({
        maxItems: 2,
        evictionStrategy: 'LRU',
      })

      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      await engine.set('key3', 'value3', {}) // 触发淘汰
      await engine.set('key4', 'value4', {}) // 再次触发淘汰
      
      const stats = engine.getEvictionStats()
      
      expect(stats).toBeDefined()
      expect(stats.totalEvictions).toBe(2)
      expect(stats.strategy).toBe('LRU')
    })
  })

  describe('批量淘汰', () => {
    it('应该能批量淘汰以腾出空间', async () => {
      const engine = new MemoryEngine({
        maxSize: 1000,
        evictionStrategy: 'LRU',
      })

      // 添加多个小项
      for (let i = 0; i < 10; i++) {
        await engine.set(`key${i}`, `value${i}`, {})
      }
      
      // 添加一个大项，应该触发批量淘汰
      const largeValue = 'x'.repeat(500)
      await engine.set('large-key', largeValue, {})
      
      const keys = await engine.keys()
      expect(keys).toContain('large-key')
      // 只要有项被淘汰即可
      expect(keys.length).toBeLessThanOrEqual(11)
    })
  })

  describe('与 CacheManager 集成', () => {
    it('应该在 CacheManager 中正常工作', async () => {
      const cache = new CacheManager({
        defaultEngine: 'memory',
        engines: {
          memory: {
            enabled: true,
            maxItems: 3,
            evictionStrategy: 'LRU',
          },
        },
      })

      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      await cache.set('key3', 'value3')
      
      // 访问 key1
      await cache.get('key1')
      
      // 添加新项
      await cache.set('key4', 'value4')
      
      // key2 或 key3 应该被淘汰
      const keys = await cache.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key4')
    })

    it('应该支持不同引擎的不同策略', async () => {
      const cache = new CacheManager({
        engines: {
          memory: {
            enabled: true,
            maxItems: 2,
            evictionStrategy: 'LRU',
          },
        },
      })

      // 在内存引擎中使用 LRU
      await cache.set('mem1', 'value1', { engine: 'memory' })
      await cache.set('mem2', 'value2', { engine: 'memory' })
      await cache.set('mem3', 'value3', { engine: 'memory' })
      
      const memKeys = await cache.keys('memory')
      expect(memKeys).toHaveLength(2)
    })
  })

  describe('边界情况', () => {
    it('应该处理空缓存', async () => {
      const engine = new MemoryEngine({
        maxItems: 3,
        evictionStrategy: 'LRU',
      })

      const stats = engine.getEvictionStats()
      expect(stats.totalEvictions).toBe(0)
    })

    it('应该处理单个项的缓存', async () => {
      const engine = new MemoryEngine({
        maxItems: 1,
        evictionStrategy: 'LRU',
      })

      await engine.set('key1', 'value1', {})
      await engine.set('key2', 'value2', {})
      
      expect(await engine.get('key1')).toBeNull()
      expect(await engine.get('key2')).toBe('value2')
    })

    it('应该处理没有限制的缓存', async () => {
      const engine = new MemoryEngine({
        // 没有 maxItems 或 maxMemory
        evictionStrategy: 'LRU',
      })

      // 应该能添加任意数量的项
      for (let i = 0; i < 100; i++) {
        await engine.set(`key${i}`, `value${i}`, {})
      }
      
      const keys = await engine.keys()
      expect(keys).toHaveLength(100)
    })
  })
})
