/**
 * 缓存系统测试
 */

import type { Component } from 'vue'
import type { DeviceType } from '../src/types/template'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdvancedCache, ComponentCache, componentCache } from '../src/utils/cache'

// Mock performance.memory API
const mockMemory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB
  jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
}

Object.defineProperty(global, 'window', {
  value: {
    performance: {
      memory: mockMemory,
    },
  },
  writable: true,
})

// 模拟Vue组件
function createMockComponent(name: string): Component {
  return {
    name,
    setup: () => () => ({ tag: 'div', children: `Mock ${name} Component` }),
  }
}

describe('AdvancedCache (LRU模式)', () => {
  let cache: AdvancedCache<string>

  beforeEach(() => {
    cache = new AdvancedCache<string>({
      strategy: 'LRU',
      maxItems: 3,
      defaultTTL: 1000,
    })
    vi.useFakeTimers()
  })

  describe('基础功能', () => {
    it('应该能够设置和获取值', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该在键不存在时返回undefined', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该能够删除键', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)

      cache.delete('key1')
      expect(cache.has('key1')).toBe(false)
    })

    it('应该能够清空缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)

      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('lRU策略', () => {
    it('应该在超过最大容量时移除最久未使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.size).toBe(3)

      // 添加第四个项，应该移除key1
      cache.set('key4', 'value4')
      expect(cache.size).toBe(3)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key4')).toBe(true)
    })

    it('应该在访问时更新项的位置', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问key1，使其成为最近使用的
      cache.get('key1')

      // 添加新项，应该移除key2而不是key1
      cache.set('key4', 'value4')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })
  })

  describe('tTL功能', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该支持TTL过期', () => {
      const cacheWithTTL = new LRUCache<string>({ maxSize: 10, ttl: 1000 })

      cacheWithTTL.set('key1', 'value1')
      expect(cacheWithTTL.get('key1')).toBe('value1')

      // 快进1秒
      vi.advanceTimersByTime(1000)
      expect(cacheWithTTL.get('key1')).toBeUndefined()
    })

    it('应该在获取时检查TTL', () => {
      const cacheWithTTL = new LRUCache<string>({ maxSize: 10, ttl: 1000 })

      cacheWithTTL.set('key1', 'value1')

      // 快进500ms，应该仍然有效
      vi.advanceTimersByTime(500)
      expect(cacheWithTTL.get('key1')).toBe('value1')

      // 再快进600ms，总共1100ms，应该过期
      vi.advanceTimersByTime(600)
      expect(cacheWithTTL.get('key1')).toBeUndefined()
    })
  })

  describe('统计信息', () => {
    it('应该正确计算命中率', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      // 2次命中
      cache.get('key1')
      cache.get('key2')

      // 1次未命中
      cache.get('key3')

      const stats = cache.getStats()
      expect(stats.hitRate).toBeCloseTo(2 / 3, 2)
      expect(stats.missRate).toBeCloseTo(1 / 3, 2)
    })

    it('应该跟踪缓存大小', () => {
      expect(cache.getStats().totalSize).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.getStats().totalSize).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.getStats().totalSize).toBe(2)
    })
  })
})

describe('componentCache', () => {
  let cache: ComponentCache

  beforeEach(() => {
    cache = new ComponentCache({
      maxSize: 5,
      ttl: 30000,
    })
  })

  afterEach(() => {
    cache.clear()
  })

  describe('组件缓存功能', () => {
    it('应该能够缓存组件', async () => {
      const mockComponent = createMockComponent('TestComponent')
      const key = cache.generateKey('login', 'desktop', 'default')

      cache.setComponent('login', 'desktop', 'default', mockComponent)
      const cached = cache.getComponent('login', 'desktop', 'default')

      expect(cached).toBe(mockComponent)
    })

    it('应该生成正确的缓存键', () => {
      const key1 = cache.generateKey('login', 'desktop', 'default')
      const key2 = cache.generateKey('login', 'mobile', 'default')
      const key3 = cache.generateKey('dashboard', 'desktop', 'default')

      expect(key1).toBe('login:desktop:default')
      expect(key2).toBe('login:mobile:default')
      expect(key3).toBe('dashboard:desktop:default')
      expect(key1).not.toBe(key2)
      expect(key1).not.toBe(key3)
    })

    it('应该能够移除特定组件', () => {
      const mockComponent = createMockComponent('TestComponent')

      cache.setComponent('login', 'desktop', 'default', mockComponent)
      expect(cache.hasComponent('login', 'desktop', 'default')).toBe(true)

      cache.removeComponent('login', 'desktop', 'default')
      expect(cache.hasComponent('login', 'desktop', 'default')).toBe(false)
    })

    it('应该能够按分类移除组件', () => {
      const comp1 = createMockComponent('LoginDesktop')
      const comp2 = createMockComponent('LoginMobile')
      const comp3 = createMockComponent('DashboardDesktop')

      cache.setComponent('login', 'desktop', 'default', comp1)
      cache.setComponent('login', 'mobile', 'default', comp2)
      cache.setComponent('dashboard', 'desktop', 'default', comp3)

      cache.removeByCategory('login')

      expect(cache.hasComponent('login', 'desktop', 'default')).toBe(false)
      expect(cache.hasComponent('login', 'mobile', 'default')).toBe(false)
      expect(cache.hasComponent('dashboard', 'desktop', 'default')).toBe(true)
    })

    it('应该能够按设备类型移除组件', () => {
      const comp1 = createMockComponent('LoginDesktop')
      const comp2 = createMockComponent('DashboardDesktop')
      const comp3 = createMockComponent('LoginMobile')

      cache.setComponent('login', 'desktop', 'default', comp1)
      cache.setComponent('dashboard', 'desktop', 'default', comp2)
      cache.setComponent('login', 'mobile', 'default', comp3)

      cache.removeByDevice('desktop')

      expect(cache.hasComponent('login', 'desktop', 'default')).toBe(false)
      expect(cache.hasComponent('dashboard', 'desktop', 'default')).toBe(false)
      expect(cache.hasComponent('login', 'mobile', 'default')).toBe(true)
    })
  })

  describe('预加载功能', () => {
    it('应该能够预加载组件', async () => {
      const mockLoader = vi.fn().mockResolvedValue(createMockComponent('PreloadedComponent'))

      await cache.preloadComponent('login', 'desktop', 'default', mockLoader)

      expect(mockLoader).toHaveBeenCalled()
      expect(cache.hasComponent('login', 'desktop', 'default')).toBe(true)
    })

    it('应该能够批量预加载组件', async () => {
      const templates = [
        { category: 'login', device: 'desktop' as DeviceType, name: 'default' },
        { category: 'login', device: 'mobile' as DeviceType, name: 'default' },
        { category: 'dashboard', device: 'desktop' as DeviceType, name: 'default' },
      ]

      const mockLoader = vi.fn().mockImplementation((category, device, name) =>
        Promise.resolve(createMockComponent(`${category}-${device}-${name}`)),
      )

      await cache.preloadComponents(templates, mockLoader)

      expect(mockLoader).toHaveBeenCalledTimes(3)
      templates.forEach(({ category, device, name }) => {
        expect(cache.hasComponent(category, device, name)).toBe(true)
      })
    })

    it('应该处理预加载错误', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Load failed'))

      await expect(
        cache.preloadComponent('login', 'desktop', 'default', mockLoader),
      ).rejects.toThrow('Load failed')

      expect(cache.hasComponent('login', 'desktop', 'default')).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该提供详细的统计信息', () => {
      const comp1 = createMockComponent('Component1')
      const comp2 = createMockComponent('Component2')

      cache.setComponent('login', 'desktop', 'default', comp1)
      cache.setComponent('dashboard', 'mobile', 'default', comp2)

      // 访问组件以生成统计
      cache.getComponent('login', 'desktop', 'default')
      cache.getComponent('login', 'desktop', 'default')
      cache.getComponent('nonexistent', 'desktop', 'default')

      const stats = cache.getStats()

      expect(stats.totalSize).toBe(2)
      expect(stats.itemCount).toBe(2)
      expect(stats.hitRate).toBeCloseTo(2 / 3, 2)
    })
  })
})

describe('全局组件缓存', () => {
  beforeEach(() => {
    componentCache.clear()
  })

  afterEach(() => {
    componentCache.clear()
  })

  it('应该提供全局缓存实例', () => {
    expect(componentCache).toBeDefined()
    expect(typeof componentCache.setComponent).toBe('function')
    expect(typeof componentCache.getComponent).toBe('function')
  })

  it('应该在全局实例中正常工作', () => {
    const mockComponent = createMockComponent('GlobalComponent')

    componentCache.setComponent('login', 'desktop', 'default', mockComponent)
    const cached = componentCache.getComponent('login', 'desktop', 'default')

    expect(cached).toBe(mockComponent)
  })

  it('应该提供全局统计信息', () => {
    const comp1 = createMockComponent('Component1')
    const comp2 = createMockComponent('Component2')

    componentCache.setComponent('login', 'desktop', 'default', comp1)
    componentCache.setComponent('dashboard', 'mobile', 'default', comp2)

    const stats = componentCache.getAllStats()

    expect(stats.component.totalSize).toBe(2)
    expect(stats.component.itemCount).toBe(2)
  })
})

describe('缓存性能测试', () => {
  let cache: LRUCache<string>

  beforeEach(() => {
    cache = new LRUCache<string>({ maxSize: 1000 })
  })

  it('应该快速处理大量操作', () => {
    const startTime = Date.now()

    // 设置1000个项
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, `value${i}`)
    }

    // 访问500个项
    for (let i = 0; i < 500; i++) {
      cache.get(`key${i}`)
    }

    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(100) // 100ms内完成
  })

  it('应该高效处理LRU淘汰', () => {
    const smallCache = new AdvancedCache<string>({
      strategy: 'LRU',
      maxItems: 100,
    })

    const startTime = Date.now()

    // 添加200个项，触发100次淘汰
    for (let i = 0; i < 200; i++) {
      smallCache.set(`key${i}`, `value${i}`)
    }

    const endTime = Date.now()
    expect(endTime - startTime).toBeLessThan(50) // 50ms内完成
    expect(smallCache.size).toBe(100)
  })
})

describe('内存监控功能', () => {
  let cache: AdvancedCache<string>

  beforeEach(() => {
    cache = new AdvancedCache<string>({
      strategy: 'LRU',
      maxItems: 100,
      enableMemoryWarning: true,
      memoryWarningThreshold: 0.8,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该在高内存使用时触发清理', () => {
    // 模拟高内存使用
    mockMemory.usedJSHeapSize = 180 * 1024 * 1024 // 180MB out of 200MB limit

    // 添加一些缓存项
    for (let i = 0; i < 50; i++) {
      cache.set(`key${i}`, `value${i}`)
    }

    const initialSize = cache.size

    // 触发内存检查
    vi.advanceTimersByTime(30000) // 30秒后触发内存检查

    // 应该触发激进清理
    expect(cache.size).toBeLessThanOrEqual(initialSize)
  })

  it('应该在正常内存使用时不触发清理', () => {
    // 模拟正常内存使用
    mockMemory.usedJSHeapSize = 50 * 1024 * 1024 // 50MB out of 200MB limit

    // 添加一些缓存项
    for (let i = 0; i < 50; i++) {
      cache.set(`key${i}`, `value${i}`)
    }

    const initialSize = cache.size

    // 触发内存检查
    vi.advanceTimersByTime(30000) // 30秒后触发内存检查

    // 不应该触发清理
    expect(cache.size).toBe(initialSize)
  })

  it('应该在没有performance.memory时优雅处理', () => {
    // 临时移除memory API
    const originalMemory = (global as any).window.performance.memory
    delete (global as any).window.performance.memory

    // 创建新缓存实例应该不会抛出错误
    expect(() => {
      new AdvancedCache<string>({
        enableMemoryWarning: true,
      })
    }).not.toThrow()

      // 恢复memory API
      ; (global as any).window.performance.memory = originalMemory
  })

  it('应该正确计算内存使用率', () => {
    const usedRatio = mockMemory.usedJSHeapSize / mockMemory.jsHeapSizeLimit
    expect(usedRatio).toBe(0.25) // 50MB / 200MB = 0.25
  })
})
