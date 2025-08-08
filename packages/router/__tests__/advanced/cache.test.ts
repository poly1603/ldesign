/**
 * 路由缓存管理器测试
 */

import type { RouteLocationNormalized } from '../../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RouteCacheManager } from '../../src/advanced/cache'

// 模拟路由
const mockRoute: RouteLocationNormalized = {
  path: '/test',
  name: 'test',
  params: {},
  query: {},
  hash: '',
  fullPath: '/test',
  href: '/test',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
}

const mockRoute2: RouteLocationNormalized = {
  path: '/test2',
  name: 'test2',
  params: {},
  query: {},
  hash: '',
  fullPath: '/test2',
  href: '/test2',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
}

describe('routeCacheManager', () => {
  let cacheManager: RouteCacheManager

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    cacheManager = new RouteCacheManager({
      max: 3,
      ttl: 5000,
      include: [],
      exclude: [],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    cacheManager.destroy()
  })

  describe('基础功能', () => {
    it('应该能够创建缓存管理器', () => {
      expect(cacheManager).toBeDefined()
    })

    it('应该能够设置和获取缓存', () => {
      cacheManager.set(mockRoute, 'component', 'data')
      const cached = cacheManager.getByRoute(mockRoute)

      expect(cached).toBeDefined()
      expect(cached?.route).toEqual(mockRoute)
      expect(cached?.component).toBe('component')
      expect(cached?.data).toBe('data')
    })

    it('应该能够通过键获取缓存', () => {
      cacheManager.set(mockRoute)
      const cached = cacheManager.get('/test')

      expect(cached).toBeDefined()
      expect(cached?.route).toEqual(mockRoute)
    })

    it('不存在的缓存应该返回 null', () => {
      const cached = cacheManager.get('/nonexistent')
      expect(cached).toBeNull()
    })
  })

  describe('lRU 策略', () => {
    it('应该在达到最大容量时驱逐最少使用的项', () => {
      const route1 = { ...mockRoute, path: '/route1' }
      const route2 = { ...mockRoute, path: '/route2' }
      const route3 = { ...mockRoute, path: '/route3' }
      const route4 = { ...mockRoute, path: '/route4' }

      // 添加到最大容量
      cacheManager.set(route1)
      cacheManager.set(route2)
      cacheManager.set(route3)

      // 访问 route1 使其成为最近使用的
      cacheManager.getByRoute(route1)

      // 添加新项应该驱逐 route2（最少使用的）
      cacheManager.set(route4)

      expect(cacheManager.get('/route1')).toBeDefined()
      expect(cacheManager.get('/route2')).toBeNull()
      expect(cacheManager.get('/route3')).toBeDefined()
      expect(cacheManager.get('/route4')).toBeDefined()
    })

    it('访问缓存项应该更新其位置', () => {
      const route1 = { ...mockRoute, path: '/route1' }
      const route2 = { ...mockRoute, path: '/route2' }
      const route3 = { ...mockRoute, path: '/route3' }

      cacheManager.set(route1)
      cacheManager.set(route2)
      cacheManager.set(route3)

      // 访问 route1
      cacheManager.getByRoute(route1)

      const stats = cacheManager.getStats()
      expect(stats.totalHits).toBe(1)
    })
  })

  describe('tTL 策略', () => {
    it('过期的缓存项应该被自动清除', () => {
      cacheManager.set(mockRoute)

      // 快进时间超过 TTL
      vi.advanceTimersByTime(6000)

      const cached = cacheManager.getByRoute(mockRoute)
      expect(cached).toBeNull()
    })

    it('未过期的缓存项应该仍然可用', () => {
      cacheManager.set(mockRoute)

      // 快进时间但不超过 TTL
      vi.advanceTimersByTime(3000)

      const cached = cacheManager.getByRoute(mockRoute)
      expect(cached).toBeDefined()
    })

    it('应该定期清理过期缓存', () => {
      cacheManager.set(mockRoute)

      // 快进时间超过 TTL
      vi.advanceTimersByTime(6000)

      // 触发定期清理
      vi.advanceTimersByTime(60000)

      const stats = cacheManager.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('缓存条件', () => {
    it('应该根据包含规则缓存', () => {
      const manager = new RouteCacheManager({
        include: ['/test'],
      })

      manager.set(mockRoute)
      manager.set(mockRoute2)

      expect(manager.getByRoute(mockRoute)).toBeDefined()
      expect(manager.getByRoute(mockRoute2)).toBeNull()

      manager.destroy()
    })

    it('应该根据排除规则不缓存', () => {
      const manager = new RouteCacheManager({
        exclude: ['/test'],
      })

      manager.set(mockRoute)
      manager.set(mockRoute2)

      expect(manager.getByRoute(mockRoute)).toBeNull()
      expect(manager.getByRoute(mockRoute2)).toBeDefined()

      manager.destroy()
    })

    it('应该根据正则表达式匹配', () => {
      const manager = new RouteCacheManager({
        include: [/^\/test/],
      })

      manager.set(mockRoute)
      manager.set({ ...mockRoute, path: '/other' })

      expect(manager.getByRoute(mockRoute)).toBeDefined()
      expect(manager.get('/other')).toBeNull()

      manager.destroy()
    })

    it('应该根据 meta.cache 决定是否缓存', () => {
      const noCacheRoute = {
        ...mockRoute,
        meta: { cache: false },
      }

      cacheManager.set(noCacheRoute)
      expect(cacheManager.getByRoute(noCacheRoute)).toBeNull()
    })
  })

  describe('事件系统', () => {
    it('应该触发缓存设置事件', () => {
      const setHandler = vi.fn()
      cacheManager.on('cache:set', setHandler)

      cacheManager.set(mockRoute)
      expect(setHandler).toHaveBeenCalledWith('/test', expect.any(Object))
    })

    it('应该触发缓存命中事件', () => {
      const hitHandler = vi.fn()
      cacheManager.on('cache:hit', hitHandler)

      cacheManager.set(mockRoute)
      cacheManager.getByRoute(mockRoute)

      expect(hitHandler).toHaveBeenCalledWith('/test', expect.any(Object))
    })

    it('应该触发缓存未命中事件', () => {
      const missHandler = vi.fn()
      cacheManager.on('cache:miss', missHandler)

      cacheManager.get('/nonexistent')
      expect(missHandler).toHaveBeenCalledWith('/nonexistent')
    })

    it('应该触发缓存驱逐事件', () => {
      const evictHandler = vi.fn()
      cacheManager.on('cache:evict', evictHandler)

      // 填满缓存
      const route1 = { ...mockRoute, path: '/1', fullPath: '/1' }
      const route2 = { ...mockRoute, path: '/2', fullPath: '/2' }
      const route3 = { ...mockRoute, path: '/3', fullPath: '/3' }
      const route4 = { ...mockRoute, path: '/4', fullPath: '/4' }

      cacheManager.set(route1)
      cacheManager.set(route2)
      cacheManager.set(route3)
      cacheManager.set(route4) // 触发驱逐

      expect(evictHandler).toHaveBeenCalledWith('/1', 'lru')
    })

    it('应该能够移除事件监听器', () => {
      const handler = vi.fn()
      cacheManager.on('cache:hit', handler)
      cacheManager.off('cache:hit', handler)

      cacheManager.set(mockRoute)
      cacheManager.getByRoute(mockRoute)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      cacheManager.set(mockRoute)
      cacheManager.getByRoute(mockRoute) // 命中
      cacheManager.get('/nonexistent') // 未命中

      const stats = cacheManager.getStats()
      expect(stats.size).toBe(1)
      expect(stats.totalHits).toBe(1)
      expect(stats.totalMisses).toBe(1)
      expect(stats.totalRequests).toBe(2)
      expect(stats.hitRate).toBe(50)
    })

    it('应该计算内存使用情况', () => {
      cacheManager.set(mockRoute, 'large component data')

      const stats = cacheManager.getStats()
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('空缓存应该返回零统计', () => {
      const stats = cacheManager.getStats()
      expect(stats.size).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.totalHits).toBe(0)
      expect(stats.totalMisses).toBe(0)
    })
  })

  describe('缓存条目管理', () => {
    it('应该返回所有缓存条目', () => {
      cacheManager.set(mockRoute)
      cacheManager.set(mockRoute2)

      const entries = cacheManager.getEntries()
      expect(entries).toHaveLength(2)
      expect(entries[0].key).toBe('/test')
      expect(entries[1].key).toBe('/test2')
    })

    it('应该能够删除特定缓存项', () => {
      cacheManager.set(mockRoute)
      const deleted = cacheManager.delete('/test')

      expect(deleted).toBe(true)
      expect(cacheManager.get('/test')).toBeNull()
    })

    it('删除不存在的项应该返回 false', () => {
      const deleted = cacheManager.delete('/nonexistent')
      expect(deleted).toBe(false)
    })
  })

  describe('清理和销毁', () => {
    it('应该能够清空所有缓存', () => {
      cacheManager.set(mockRoute)
      cacheManager.set(mockRoute2)

      cacheManager.clear()

      const stats = cacheManager.getStats()
      expect(stats.size).toBe(0)
    })

    it('清空缓存应该触发事件', () => {
      const clearHandler = vi.fn()
      cacheManager.on('cache:clear', clearHandler)

      cacheManager.clear()
      expect(clearHandler).toHaveBeenCalled()
    })

    it('应该能够销毁缓存管理器', () => {
      cacheManager.set(mockRoute)
      cacheManager.destroy()

      const stats = cacheManager.getStats()
      expect(stats.size).toBe(0)
    })
  })
})
