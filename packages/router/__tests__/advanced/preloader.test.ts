/**
 * 路由预加载器测试
 */

import type { RouteRecordNormalized } from '../../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RoutePreloader } from '../../src/advanced/preloader'

// 模拟组件
const mockComponent = vi.fn().mockResolvedValue({ default: 'MockComponent' })
const mockAsyncComponent = vi
  .fn()
  .mockResolvedValue({ default: 'AsyncComponent' })

// 模拟路由记录
const mockRoute: RouteRecordNormalized = {
  path: '/test',
  name: 'test',
  components: {
    default: mockComponent,
  },
  meta: {},
  children: [],
  beforeEnter: undefined,
  props: {},
  redirect: undefined,
  aliasOf: undefined,
}

const mockAsyncRoute: RouteRecordNormalized = {
  path: '/async',
  name: 'async',
  components: {
    default: mockAsyncComponent,
  },
  meta: {},
  children: [],
  beforeEnter: undefined,
  props: {},
  redirect: undefined,
  aliasOf: undefined,
}

// 模拟 IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.prototype.observe = vi.fn()
mockIntersectionObserver.prototype.unobserve = vi.fn()
mockIntersectionObserver.prototype.disconnect = vi.fn()

// 模拟 requestIdleCallback
const mockRequestIdleCallback = vi.fn(callback => {
  setTimeout(callback, 0)
})

describe('routePreloader', () => {
  let preloader: RoutePreloader

  beforeEach(() => {
    vi.clearAllMocks()
    global.IntersectionObserver = mockIntersectionObserver
    global.requestIdleCallback = mockRequestIdleCallback as any

    preloader = new RoutePreloader('none', {
      routes: [mockRoute, mockAsyncRoute],
    })
  })

  afterEach(() => {
    preloader.destroy()
  })

  describe('基础功能', () => {
    it('应该能够创建预加载器', () => {
      expect(preloader).toBeDefined()
      expect(preloader.getStats().strategy).toBe('none')
    })

    it('应该能够设置预加载策略', () => {
      preloader.setStrategy('immediate')
      expect(preloader.getStats().strategy).toBe('immediate')
    })

    it('应该能够设置路由列表', () => {
      const newRoutes = [mockRoute]
      preloader.setRoutes(newRoutes)
      expect(preloader.getStats()).toBeDefined()
    })
  })

  describe('路由预加载', () => {
    it('应该能够预加载单个路由', async () => {
      await preloader.preloadRoute(mockRoute)
      expect(mockComponent).toHaveBeenCalled()
    })

    it('应该能够通过路径预加载路由', async () => {
      await preloader.preloadRoute('/test')
      expect(mockComponent).toHaveBeenCalled()
    })

    it('应该能够预加载多个路由', async () => {
      await preloader.preloadRoutes([mockRoute, mockAsyncRoute])
      expect(mockComponent).toHaveBeenCalled()
      expect(mockAsyncComponent).toHaveBeenCalled()
    })

    it('不应该重复预加载同一路由', async () => {
      await preloader.preloadRoute(mockRoute)
      await preloader.preloadRoute(mockRoute)
      expect(mockComponent).toHaveBeenCalledTimes(1)
    })

    it('应该能够获取预加载的组件', async () => {
      await preloader.preloadRoute(mockRoute)
      const component = preloader.getPreloadedComponent(mockRoute)
      expect(component).toBeDefined()
    })

    it('应该处理预加载错误', async () => {
      const errorRoute: RouteRecordNormalized = {
        ...mockRoute,
        path: '/error',
        components: {
          default: vi.fn().mockRejectedValue(new Error('Load failed')),
        },
      }

      // 不应该抛出错误
      await expect(preloader.preloadRoute(errorRoute)).resolves.toBeUndefined()
    })
  })

  describe('预加载策略', () => {
    it('immediate 策略应该立即预加载', () => {
      preloader.setStrategy('immediate')
      preloader.handleNavigation({} as any)
      // 由于需要路由列表，这里主要测试不会报错
      expect(() => preloader.handleNavigation({} as any)).not.toThrow()
    })

    it('idle 策略应该在空闲时预加载', () => {
      preloader.setStrategy('idle')
      preloader.handleNavigation({} as any)
      expect(mockRequestIdleCallback).toHaveBeenCalled()
    })

    it('visible 策略应该观察元素', () => {
      preloader.setStrategy('visible')
      const element = document.createElement('div')
      preloader.observeLink(element, mockRoute)
      expect(mockIntersectionObserver.prototype.observe).toHaveBeenCalledWith(
        element
      )
    })

    it('应该能够停止观察元素', () => {
      preloader.setStrategy('visible')
      const element = document.createElement('div')
      preloader.observeLink(element, mockRoute)
      preloader.unobserveLink(element)
      expect(mockIntersectionObserver.prototype.unobserve).toHaveBeenCalledWith(
        element
      )
    })
  })

  describe('悬停预加载', () => {
    beforeEach(() => {
      preloader.setStrategy('hover')
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该在悬停时延迟预加载', async () => {
      const element = document.createElement('div')
      preloader.handleHover(element, mockRoute)

      // 延迟未到，不应该预加载
      expect(mockComponent).not.toHaveBeenCalled()

      // 快进时间
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()

      expect(mockComponent).toHaveBeenCalled()
    })

    it('应该能够取消悬停预加载', () => {
      const element = document.createElement('div')
      preloader.handleHover(element, mockRoute)
      preloader.cancelHover(mockRoute)

      vi.advanceTimersByTime(200)
      expect(mockComponent).not.toHaveBeenCalled()
    })
  })

  describe('事件系统', () => {
    it('应该触发预加载开始事件', async () => {
      const startHandler = vi.fn()
      preloader.on('preload:start', startHandler)

      await preloader.preloadRoute(mockRoute)
      expect(startHandler).toHaveBeenCalledWith('/test', 'none')
    })

    it('应该触发预加载完成事件', async () => {
      const completeHandler = vi.fn()
      preloader.on('preload:complete', completeHandler)

      await preloader.preloadRoute(mockRoute)
      expect(completeHandler).toHaveBeenCalledWith(
        '/test',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('应该触发缓存命中事件', async () => {
      const cacheHitHandler = vi.fn()
      preloader.on('preload:cache-hit', cacheHitHandler)

      await preloader.preloadRoute(mockRoute)
      await preloader.preloadRoute(mockRoute) // 第二次应该命中缓存

      expect(cacheHitHandler).toHaveBeenCalledWith('/test')
    })

    it('应该能够移除事件监听器', async () => {
      const handler = vi.fn()
      preloader.on('preload:start', handler)
      preloader.off('preload:start', handler)

      await preloader.preloadRoute(mockRoute)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的统计信息', async () => {
      await preloader.preloadRoute(mockRoute)
      await preloader.preloadRoute(mockRoute) // 缓存命中

      const stats = preloader.getStats()
      expect(stats.preloadedCount).toBe(1)
      expect(stats.cacheHits).toBe(1)
      expect(stats.totalPreloads).toBe(1)
    })

    it('应该计算平均持续时间', async () => {
      // 模拟时间流逝
      let timeCounter = 0
      vi.spyOn(global.performance, 'now').mockImplementation(() => {
        return (timeCounter += 50) // 每次调用增加50ms
      })

      await preloader.preloadRoute(mockRoute)
      await preloader.preloadRoute(mockAsyncRoute)

      const stats = preloader.getStats()
      expect(stats.averageDuration).toBeGreaterThan(0)
    })
  })

  describe('预加载条件', () => {
    it('应该根据条件决定是否预加载', async () => {
      const condition = vi.fn().mockReturnValue(false)
      preloader.setCondition(condition)

      await preloader.preloadRoute(mockRoute)
      expect(condition).toHaveBeenCalledWith(mockRoute)
      expect(mockComponent).not.toHaveBeenCalled()
    })

    it('条件为真时应该预加载', async () => {
      const condition = vi.fn().mockReturnValue(true)
      preloader.setCondition(condition)

      await preloader.preloadRoute(mockRoute)
      expect(condition).toHaveBeenCalledWith(mockRoute)
      expect(mockComponent).toHaveBeenCalled()
    })
  })

  describe('清理和销毁', () => {
    it('应该能够清理缓存', async () => {
      await preloader.preloadRoute(mockRoute)
      preloader.clear()

      const stats = preloader.getStats()
      expect(stats.preloadedCount).toBe(0)
    })

    it('应该能够销毁预加载器', () => {
      preloader.destroy()
      expect(mockIntersectionObserver.prototype.disconnect).toHaveBeenCalled()
    })
  })
})
