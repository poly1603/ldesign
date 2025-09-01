/**
 * 缓存系统测试
 */

import type { TemplateMetadata } from '../../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ComponentCache, LRUCache } from '../../src/utils/cache'

describe('lRUCache', () => {
  let cache: LRUCache<string>

  beforeEach(() => {
    cache = new LRUCache<string>({ maxSize: 3, ttl: 1000 })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该设置和获取值', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该返回undefined对于不存在的键', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('应该检查键是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('应该删除键', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)

      cache.delete('key1')
      expect(cache.has('key1')).toBe(false)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该清空缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)

      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该返回正确的大小', () => {
      expect(cache.size).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)

      cache.delete('key1')
      expect(cache.size).toBe(1)
    })
  })

  describe('lRU策略', () => {
    it('应该在达到最大容量时移除最久未使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.size).toBe(3)

      // 添加第四个项应该移除最久未使用的key1
      cache.set('key4', 'value4')
      expect(cache.size).toBe(3)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })

    it('应该在访问时更新项的使用顺序', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问key1，使其成为最近使用的
      cache.get('key1')

      // 添加新项应该移除key2（现在是最久未使用的）
      cache.set('key4', 'value4')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })

    it('应该在设置已存在的键时更新使用顺序', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 重新设置key1，使其成为最近使用的
      cache.set('key1', 'new_value1')

      // 添加新项应该移除key2
      cache.set('key4', 'value4')
      expect(cache.get('key1')).toBe('new_value1')
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })
  })

  describe('tTL功能', () => {
    it('应该在TTL过期后移除项', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')

      // 快进时间超过TTL
      vi.advanceTimersByTime(1500)

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.has('key1')).toBe(false)
    })

    it('应该在访问时重置TTL', () => {
      cache.set('key1', 'value1')

      // 在TTL过期前访问
      vi.advanceTimersByTime(500)
      expect(cache.get('key1')).toBe('value1')

      // 再次快进，但由于访问重置了TTL，项应该仍然存在
      vi.advanceTimersByTime(700)
      expect(cache.get('key1')).toBe('value1')

      // 现在快进超过新的TTL
      vi.advanceTimersByTime(1100)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该支持无TTL的缓存', () => {
      const noTtlCache = new LRUCache<string>({ maxSize: 3 })
      noTtlCache.set('key1', 'value1')

      // 快进很长时间
      vi.advanceTimersByTime(10000)

      expect(noTtlCache.get('key1')).toBe('value1')
    })
  })

  describe('统计信息', () => {
    it('应该跟踪命中和未命中', () => {
      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)

      cache.set('key1', 'value1')
      cache.get('key1') // 命中
      cache.get('nonexistent') // 未命中

      const newStats = cache.getStats()
      expect(newStats.hits).toBe(1)
      expect(newStats.misses).toBe(1)
    })

    it('应该计算命中率', () => {
      cache.set('key1', 'value1')
      cache.get('key1') // 命中
      cache.get('key1') // 命中
      cache.get('nonexistent') // 未命中

      const stats = cache.getStats()
      expect(stats.hitRate).toBe(2 / 3)
    })

    it('应该处理零访问的情况', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('事件监听', () => {
    it('应该触发设置事件', () => {
      const onSet = vi.fn()
      cache.on('set', onSet)

      cache.set('key1', 'value1')
      expect(onSet).toHaveBeenCalledWith('key1', 'value1')
    })

    it('应该触发获取事件', () => {
      const onGet = vi.fn()
      cache.on('get', onGet)

      cache.set('key1', 'value1')
      cache.get('key1')

      expect(onGet).toHaveBeenCalledWith('key1', 'value1')
    })

    it('应该触发删除事件', () => {
      const onDelete = vi.fn()
      cache.on('delete', onDelete)

      cache.set('key1', 'value1')
      cache.delete('key1')

      expect(onDelete).toHaveBeenCalledWith('key1', 'value1')
    })

    it('应该触发驱逐事件', () => {
      const onEvict = vi.fn()
      cache.on('evict', onEvict)

      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 应该驱逐key1

      expect(onEvict).toHaveBeenCalledWith('key1', 'value1', 'size')
    })

    it('应该触发过期事件', () => {
      const onExpire = vi.fn()
      cache.on('expire', onExpire)

      cache.set('key1', 'value1')
      vi.advanceTimersByTime(1500)
      cache.get('key1') // 触发过期检查

      expect(onExpire).toHaveBeenCalledWith('key1', 'value1')
    })
  })
})

describe('componentCache', () => {
  let componentCache: ComponentCache
  let mockComponent: any

  beforeEach(() => {
    componentCache = new ComponentCache({ maxSize: 5 })
    mockComponent = {
      name: 'TestComponent',
      setup: vi.fn(),
      render: vi.fn(),
    }
  })

  describe('基础功能', () => {
    it('应该缓存组件', () => {
      componentCache.setComponent('login', 'desktop', 'default', mockComponent)

      const cached = componentCache.getComponent('login', 'desktop', 'default')
      expect(cached).toBe(mockComponent)
    })

    it('应该为不存在的组件返回undefined', () => {
      const cached = componentCache.getComponent('nonexistent', 'desktop', 'default')
      expect(cached).toBeUndefined()
    })

    it('应该检查组件是否存在', () => {
      componentCache.setComponent('login', 'desktop', 'default', mockComponent)

      expect(componentCache.hasComponent('login', 'desktop', 'default')).toBe(true)
      expect(componentCache.hasComponent('nonexistent', 'desktop', 'default')).toBe(false)
    })

    it('应该删除组件', () => {
      componentCache.setComponent('login', 'desktop', 'default', mockComponent)
      expect(componentCache.hasComponent('login', 'desktop', 'default')).toBe(true)

      componentCache.deleteComponent('login', 'desktop', 'default')
      expect(componentCache.hasComponent('login', 'desktop', 'default')).toBe(false)
    })

    it('应该按分类删除组件', () => {
      componentCache.setComponent('login', 'desktop', 'default', mockComponent)
      componentCache.setComponent('login', 'mobile', 'default', mockComponent)
      componentCache.setComponent('dashboard', 'desktop', 'default', mockComponent)

      componentCache.deleteByCategory('login')

      expect(componentCache.hasComponent('login', 'desktop', 'default')).toBe(false)
      expect(componentCache.hasComponent('login', 'mobile', 'default')).toBe(false)
      expect(componentCache.hasComponent('dashboard', 'desktop', 'default')).toBe(true)
    })

    it('应该按设备删除组件', () => {
      componentCache.setComponent('login', 'desktop', 'default', mockComponent)
      componentCache.setComponent('dashboard', 'desktop', 'default', mockComponent)
      componentCache.setComponent('login', 'mobile', 'default', mockComponent)

      componentCache.deleteByDevice('desktop')

      expect(componentCache.hasComponent('login', 'desktop', 'default')).toBe(false)
      expect(componentCache.hasComponent('dashboard', 'desktop', 'default')).toBe(false)
      expect(componentCache.hasComponent('login', 'mobile', 'default')).toBe(true)
    })
  })

  describe('键生成', () => {
    it('应该生成正确的缓存键', () => {
      const key1 = componentCache.generateKey('login', 'desktop', 'default')
      const key2 = componentCache.generateKey('login', 'mobile', 'default')
      const key3 = componentCache.generateKey('dashboard', 'desktop', 'default')

      expect(key1).toBe('login:desktop:default')
      expect(key2).toBe('login:mobile:default')
      expect(key3).toBe('dashboard:desktop:default')

      expect(key1).not.toBe(key2)
      expect(key1).not.toBe(key3)
    })
  })

  describe('统计信息', () => {
    it('应该提供缓存统计', () => {
      componentCache.setComponent('login', 'desktop', 'default', mockComponent)
      componentCache.getComponent('login', 'desktop', 'default') // 命中
      componentCache.getComponent('nonexistent', 'desktop', 'default') // 未命中

      const stats = componentCache.getStats()
      expect(stats.size).toBe(1)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })
  })

  describe('预加载功能', () => {
    it('应该预加载组件', async () => {
      const mockLoader = vi.fn().mockResolvedValue(mockComponent)
      const mockTemplate: TemplateMetadata = {
        name: 'test-template',
        displayName: '测试模板',
        description: '测试描述',
        version: '1.0.0',
        author: 'test',
        category: 'login',
        device: 'desktop',
        componentPath: '/path/to/component',
        componentLoader: mockLoader,
        lastModified: Date.now(),
        isBuiltIn: false,
      }

      await componentCache.preloadComponent(mockTemplate)

      expect(mockLoader).toHaveBeenCalled()
      expect(componentCache.hasComponent('login', 'desktop', 'test-template')).toBe(true)
    })

    it('应该处理预加载错误', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Load failed'))
      const mockTemplate: TemplateMetadata = {
        name: 'test-template',
        displayName: '测试模板',
        description: '测试描述',
        version: '1.0.0',
        author: 'test',
        category: 'login',
        device: 'desktop',
        componentPath: '/path/to/component',
        componentLoader: mockLoader,
        lastModified: Date.now(),
        isBuiltIn: false,
      }

      await expect(componentCache.preloadComponent(mockTemplate)).rejects.toThrow('Load failed')
      expect(componentCache.hasComponent('login', 'desktop', 'test-template')).toBe(false)
    })
  })
})
