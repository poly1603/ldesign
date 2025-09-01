import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CacheStrategy, createCacheManager } from '../src/cache/cache-manager'

describe('cacheManager', () => {
  let cacheManager: ReturnType<typeof createCacheManager>

  beforeEach(() => {
    cacheManager = createCacheManager()
  })

  describe('基本操作', () => {
    it('应该设置和获取缓存值', () => {
      cacheManager.set('key1', 'value1')
      expect(cacheManager.get('key1')).toBe('value1')
    })

    it('应该检查键是否存在', () => {
      cacheManager.set('key1', 'value1')
      expect(cacheManager.has('key1')).toBe(true)
      expect(cacheManager.has('key2')).toBe(false)
    })

    it('应该删除缓存项', () => {
      cacheManager.set('key1', 'value1')
      expect(cacheManager.delete('key1')).toBe(true)
      expect(cacheManager.has('key1')).toBe(false)
      expect(cacheManager.delete('key1')).toBe(false)
    })

    it('应该清空所有缓存', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.clear()
      expect(cacheManager.size()).toBe(0)
    })

    it('应该返回正确的大小', () => {
      expect(cacheManager.size()).toBe(0)
      cacheManager.set('key1', 'value1')
      expect(cacheManager.size()).toBe(1)
      cacheManager.set('key2', 'value2')
      expect(cacheManager.size()).toBe(2)
    })
  })

  describe('tTL 过期', () => {
    it('应该支持 TTL 过期', async () => {
      cacheManager.set('key1', 'value1', 100) // 100ms TTL
      expect(cacheManager.get('key1')).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(cacheManager.get('key1')).toBeUndefined()
    })

    it('应该在过期后自动删除项', async () => {
      cacheManager.set('key1', 'value1', 50)
      expect(cacheManager.size()).toBe(1)

      await new Promise(resolve => setTimeout(resolve, 100))
      const result = cacheManager.get('key1') // 触发清理
      expect(result).toBeUndefined() // 过期项应该返回 undefined

      // 手动触发清理队列处理
      ; (cacheManager as any).forceCleanup()
      expect(cacheManager.size()).toBe(0)
    })
  })

  describe('lRU 策略', () => {
    beforeEach(() => {
      cacheManager = createCacheManager({
        maxSize: 3,
        strategy: CacheStrategy.LRU,
      })
    })

    it('应该在达到最大容量时淘汰最久未使用的项', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.set('key3', 'value3')
      cacheManager.set('key4', 'value4') // 应该淘汰 key1

      expect(cacheManager.has('key1')).toBe(false)
      expect(cacheManager.has('key2')).toBe(true)
      expect(cacheManager.has('key3')).toBe(true)
      expect(cacheManager.has('key4')).toBe(true)
    })

    it('应该在访问时更新项的位置', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')
      cacheManager.set('key3', 'value3')

      // 访问 key1，使其成为最近使用的
      cacheManager.get('key1')

      cacheManager.set('key4', 'value4') // 应该淘汰 key2

      expect(cacheManager.has('key1')).toBe(true)
      expect(cacheManager.has('key2')).toBe(false)
      expect(cacheManager.has('key3')).toBe(true)
      expect(cacheManager.has('key4')).toBe(true)
    })
  })

  describe('统计信息', () => {
    it('应该跟踪缓存统计', () => {
      const stats = cacheManager.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.sets).toBe(0)

      cacheManager.set('key1', 'value1')
      cacheManager.get('key1') // hit
      cacheManager.get('key2') // miss

      const newStats = cacheManager.getStats()
      expect(newStats.hits).toBe(1)
      expect(newStats.misses).toBe(1)
      expect(newStats.sets).toBe(1)
      expect(newStats.hitRate).toBe(0.5)
    })

    it('应该重置统计信息', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.get('key1')

      cacheManager.resetStats()
      const stats = cacheManager.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.sets).toBe(0)
    })
  })

  describe('命名空间', () => {
    it('应该创建独立的命名空间', () => {
      const ns1 = cacheManager.namespace('ns1')
      const ns2 = cacheManager.namespace('ns2')

      ns1.set('key1', 'value1')
      ns2.set('key1', 'value2')

      expect(ns1.get('key1')).toBe('value1')
      expect(ns2.get('key1')).toBe('value2')
    })

    it('命名空间应该相互隔离', () => {
      const ns1 = cacheManager.namespace('ns1')
      const ns2 = cacheManager.namespace('ns2')

      ns1.set('key1', 'value1')
      expect(ns2.has('key1')).toBe(false)
    })
  })

  describe('键值操作', () => {
    it('应该返回所有键', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')

      const keys = cacheManager.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toHaveLength(2)
    })

    it('应该返回所有值', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')

      const values = cacheManager.values()
      expect(values).toContain('value1')
      expect(values).toContain('value2')
      expect(values).toHaveLength(2)
    })

    it('应该返回所有键值对', () => {
      cacheManager.set('key1', 'value1')
      cacheManager.set('key2', 'value2')

      const entries = cacheManager.entries()
      expect(entries).toContainEqual(['key1', 'value1'])
      expect(entries).toContainEqual(['key2', 'value2'])
      expect(entries).toHaveLength(2)
    })
  })

  describe('配置选项', () => {
    it('应该使用默认 TTL', () => {
      const manager = createCacheManager({ defaultTTL: 100 })
      manager.set('key1', 'value1') // 使用默认 TTL

      setTimeout(() => {
        expect(manager.get('key1')).toBeUndefined()
      }, 150)
    })

    it('应该调用淘汰回调', () => {
      const onEvict = vi.fn()
      const manager = createCacheManager({
        maxSize: 2,
        onEvict,
      })

      manager.set('key1', 'value1')
      manager.set('key2', 'value2')
      manager.set('key3', 'value3') // 应该触发淘汰

      expect(onEvict).toHaveBeenCalled()
    })
  })

  describe('类型安全', () => {
    it('应该支持泛型类型', () => {
      interface User {
        id: number
        name: string
      }

      const user: User = { id: 1, name: 'John' }
      cacheManager.set<User>('user', user)

      const retrieved = cacheManager.get<User>('user')
      expect(retrieved).toEqual(user)
      expect(retrieved?.id).toBe(1)
      expect(retrieved?.name).toBe('John')
    })
  })
})
