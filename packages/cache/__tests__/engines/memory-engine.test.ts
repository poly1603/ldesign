import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryEngine } from '../../src/engines/memory-engine'

describe('memoryEngine', () => {
  let engine: MemoryEngine

  beforeEach(() => {
    engine = new MemoryEngine({
      maxSize: 1024 * 1024, // 1MB
      cleanupInterval: 1000, // 1秒
    })
  })

  afterEach(async () => {
    await engine.destroy()
  })

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(engine.name).toBe('memory')
      expect(engine.available).toBe(true)
      expect(engine.maxSize).toBe(1024 * 1024)
    })

    it('应该能够设置和获取数据', async () => {
      const key = 'test-key'
      const value = 'test-value'

      await engine.setItem(key, value)
      const result = await engine.getItem(key)

      expect(result).toBe(value)
    })

    it('应该能够删除数据', async () => {
      const key = 'test-remove'
      const value = 'to-be-removed'

      await engine.setItem(key, value)
      expect(await engine.getItem(key)).toBe(value)

      await engine.removeItem(key)
      expect(await engine.getItem(key)).toBeNull()
    })

    it('应该能够清空所有数据', async () => {
      await engine.setItem('key1', 'value1')
      await engine.setItem('key2', 'value2')

      expect(await engine.length()).toBe(2)

      await engine.clear()

      expect(await engine.length()).toBe(0)
    })

    it('应该能够获取所有键名', async () => {
      await engine.setItem('key1', 'value1')
      await engine.setItem('key2', 'value2')
      await engine.setItem('key3', 'value3')

      const keys = await engine.keys()

      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    it('应该能够检查键是否存在', async () => {
      const key = 'test-exists'
      const value = 'exists'

      expect(await engine.hasItem(key)).toBe(false)

      await engine.setItem(key, value)
      expect(await engine.hasItem(key)).toBe(true)

      await engine.removeItem(key)
      expect(await engine.hasItem(key)).toBe(false)
    })
  })

  describe('tTL 功能', () => {
    it('应该支持过期时间', async () => {
      const key = 'test-ttl'
      const value = 'expires-soon'
      const ttl = 100 // 100ms

      await engine.setItem(key, value, ttl)
      expect(await engine.getItem(key)).toBe(value)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(await engine.getItem(key)).toBeNull()
    })

    it('应该能够清理过期项', async () => {
      await engine.setItem('key1', 'value1', 50) // 50ms TTL
      await engine.setItem('key2', 'value2') // 无过期时间

      expect(await engine.length()).toBe(2)

      // 等待第一个项过期
      await new Promise(resolve => setTimeout(resolve, 100))

      await engine.cleanup()

      expect(await engine.length()).toBe(1)
      expect(await engine.getItem('key1')).toBeNull()
      expect(await engine.getItem('key2')).toBe('value2')
    })
  })

  describe('存储管理', () => {
    it('应该跟踪存储使用情况', async () => {
      const initialSize = engine.usedSize

      await engine.setItem('size-test', 'some data')

      expect(engine.usedSize).toBeGreaterThan(initialSize)
    })

    it('应该在存储空间不足时清理旧项', async () => {
      // 创建一个小容量的引擎
      const smallEngine = new MemoryEngine({ maxSize: 50 })

      try {
        // 填充一些小数据
        await smallEngine.setItem('key1', 'a')
        await smallEngine.setItem('key2', 'b')

        const initialKeys = await smallEngine.keys()
        expect(initialKeys.length).toBe(2)

        // 尝试添加大数据，应该触发清理
        await smallEngine.setItem(
          'key3',
          'this-is-a-much-larger-value-that-should-trigger-cleanup-of-old-items',
        )

        // 验证有项被清理（总数应该减少）
        const finalKeys = await smallEngine.keys()
        expect(finalKeys.length).toBeLessThan(3) // 不是所有3个项都能存储
        expect(finalKeys).toContain('key3') // 新项应该存在
      }
      finally {
        await smallEngine.destroy()
      }
    })

    it('应该提供存储统计信息', async () => {
      await engine.setItem('stats1', 'value1', 1000)
      await engine.setItem('stats2', 'value2')

      const stats = await engine.getStorageStats()

      expect(stats.totalItems).toBe(2)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.expiredItems).toBe(0)
      expect(stats.oldestItem).toBeDefined()
      expect(stats.newestItem).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的键名', async () => {
      // 测试空键名
      await expect(engine.setItem('', 'value')).resolves.not.toThrow()

      // 测试特殊字符键名
      await expect(
        engine.setItem('key with spaces', 'value'),
      ).resolves.not.toThrow()
      await expect(
        engine.setItem('key/with/slashes', 'value'),
      ).resolves.not.toThrow()
    })

    it('应该处理大数据', async () => {
      const largeValue = 'x'.repeat(10000) // 10KB 数据

      await expect(
        engine.setItem('large-key', largeValue),
      ).resolves.not.toThrow()

      const result = await engine.getItem('large-key')
      expect(result).toBe(largeValue)
    })
  })
})
