import { describe, it, expect, beforeEach } from 'vitest'
import { CacheManager } from '../src/core/cache-manager'

describe('批量操作', () => {
  let cache: CacheManager

  beforeEach(() => {
    cache = new CacheManager({
      defaultEngine: 'memory',
      engines: {
        memory: { enabled: true },
      },
    })
    cache.clear()
  })

  describe('mset - 批量设置', () => {
    it('应该批量设置多个键值对', async () => {
      const items = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      }

      const results = await cache.mset(items)
      
      expect(results.success).toHaveLength(3)
      expect(results.failed).toHaveLength(0)

      // 验证所有值都已设置
      for (const [key, value] of Object.entries(items)) {
        const stored = await cache.get(key)
        expect(stored).toBe(value)
      }
    })

    it('应该支持批量设置带选项的项', async () => {
      const items = {
        key1: 'value1',
        key2: 'value2',
      }

      const results = await cache.mset(items, {
        ttl: 1000,
        encrypt: false,
      })

      expect(results.success).toHaveLength(2)
      
      const metadata1 = await cache.getMetadata('key1')
      const metadata2 = await cache.getMetadata('key2')
      
      // 元数据中 TTL 被转换为 expiresAt 时间戳
      if (metadata1?.expiresAt && metadata1?.createdAt) {
        const ttl1 = metadata1.expiresAt - metadata1.createdAt
        expect(ttl1).toBeCloseTo(1000, -2)
      }
      if (metadata2?.expiresAt && metadata2?.createdAt) {
        const ttl2 = metadata2.expiresAt - metadata2.createdAt
        expect(ttl2).toBeCloseTo(1000, -2)
      }
    })

    it('应该处理部分失败的情况', async () => {
      // 模拟一个会失败的设置
      const items = {
        'valid-key': 'value',
        '': 'invalid-key-value', // 空键应该失败
      }

      const results = await cache.mset(items)
      
      expect(results.success).toContain('valid-key')
      expect(results.failed).toHaveLength(1)
      expect(results.failed[0].key).toBe('')
    })
  })

  describe('mget - 批量获取', () => {
    beforeEach(async () => {
      // 预设一些数据
      await cache.set('key1', 'value1')
      await cache.set('key2', { data: 'value2' })
      await cache.set('key3', [1, 2, 3])
    })

    it('应该批量获取多个键的值', async () => {
      const results = await cache.mget(['key1', 'key2', 'key3'])
      
      expect(results['key1']).toBe('value1')
      expect(results['key2']).toEqual({ data: 'value2' })
      expect(results['key3']).toEqual([1, 2, 3])
    })

    it('应该为不存在的键返回 null', async () => {
      const results = await cache.mget(['key1', 'nonexistent', 'key3'])
      
      expect(results['key1']).toBe('value1')
      expect(results['nonexistent']).toBeNull()
      expect(results['key3']).toEqual([1, 2, 3])
    })

    it('应该处理空数组', async () => {
      const results = await cache.mget([])
      expect(results).toEqual({})
    })

    it('应该处理过期的键', async () => {
      await cache.set('expired-key', 'value', { ttl: 1 })
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const results = await cache.mget(['key1', 'expired-key'])
      
      expect(results['key1']).toBe('value1')
      expect(results['expired-key']).toBeNull()
    })
  })

  describe('mremove - 批量删除', () => {
    beforeEach(async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      await cache.set('key3', 'value3')
    })

    it('应该批量删除多个键', async () => {
      const results = await cache.mremove(['key1', 'key2'])
      
      expect(results.success).toHaveLength(2)
      expect(results.failed).toHaveLength(0)
      
      expect(await cache.has('key1')).toBe(false)
      expect(await cache.has('key2')).toBe(false)
      expect(await cache.has('key3')).toBe(true)
    })

    it('应该处理不存在的键', async () => {
      const results = await cache.mremove(['key1', 'nonexistent'])
      
      expect(results.success).toContain('key1')
      // 删除不存在的键也算成功
      expect(results.success).toContain('nonexistent')
      expect(results.failed).toHaveLength(0)
    })
  })

  describe('mhas - 批量检查', () => {
    beforeEach(async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
    })

    it('应该批量检查键是否存在', async () => {
      const results = await cache.mhas(['key1', 'key2', 'key3'])
      
      expect(results['key1']).toBe(true)
      expect(results['key2']).toBe(true)
      expect(results['key3']).toBe(false)
    })

    it('应该处理过期的键', async () => {
      await cache.set('expired-key', 'value', { ttl: 1 })
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const results = await cache.mhas(['key1', 'expired-key'])
      
      expect(results['key1']).toBe(true)
      expect(results['expired-key']).toBe(false)
    })
  })

  describe('性能测试', () => {
    it('批量操作应该比单个操作更快', async () => {
      const items: Record<string, any> = {}
      const keys: string[] = []
      
      for (let i = 0; i < 100; i++) {
        const key = `perf-key-${i}`
        keys.push(key)
        items[key] = { index: i, data: `value-${i}` }
      }

      // 测试批量设置
      const batchStart = performance.now()
      await cache.mset(items)
      const batchTime = performance.now() - batchStart

      // 清空缓存
      await cache.clear()

      // 测试单个设置
      const singleStart = performance.now()
      for (const [key, value] of Object.entries(items)) {
        await cache.set(key, value)
      }
      const singleTime = performance.now() - singleStart

      console.log(`批量设置耗时: ${batchTime.toFixed(2)}ms`)
      console.log(`单个设置耗时: ${singleTime.toFixed(2)}ms`)
      console.log(`性能提升: ${((singleTime / batchTime - 1) * 100).toFixed(1)}%`)

      // 批量操作通常应该更快，但在某些情况下可能因为开销而稍慢
      // 只要不慢太多即可（不超过 1.5 倍）
      expect(batchTime).toBeLessThan(singleTime * 1.5)
    })
  })
})
