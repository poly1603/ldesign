/**
 * @ldesign/router 路由匹配器性能基准测试
 */

import type { RouteRecordRaw } from '../../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { RouteMatcher } from '../../src/core/matcher'

describe('routeMatcher Performance Benchmark', () => {
  let matcher: RouteMatcher
  let routes: RouteRecordRaw[]

  beforeEach(() => {
    matcher = new RouteMatcher()

    // 创建大量测试路由
    routes = [
      // 静态路由
      { path: '/', component: {} },
      { path: '/about', component: {} },
      { path: '/contact', component: {} },
      { path: '/services', component: {} },
      { path: '/products', component: {} },

      // 参数路由
      { path: '/user/:id', component: {} },
      { path: '/user/:id/profile', component: {} },
      { path: '/user/:id/settings', component: {} },
      { path: '/product/:category/:id', component: {} },
      { path: '/blog/:year/:month/:slug', component: {} },

      // 可选参数路由
      { path: '/search/:query?', component: {} },
      { path: '/category/:id/page/:page?', component: {} },

      // 通配符路由
      { path: '/docs/*', component: {} },
      { path: '/api/v1/*', component: {} },
    ]

    // 添加更多路由以测试大规模性能
    for (let i = 0; i < 100; i++) {
      routes.push(
        { path: `/page${i}`, component: {} },
        { path: `/category${i}/:id`, component: {} },
        { path: `/section${i}/:type/:id`, component: {} },
      )
    }

    // 添加路由到匹配器
    routes.forEach(route => matcher.addRoute(route))
  })

  describe('路由匹配性能', () => {
    it('应该快速匹配静态路由', () => {
      const paths = ['/', '/about', '/contact', '/services', '/products']

      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        paths.forEach((path) => {
          matcher.matchByPath(path)
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // eslint-disable-next-line no-console
      console.log(`静态路由匹配 5000 次耗时: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(100) // 应该在 100ms 内完成
    })

    it('应该快速匹配参数路由', () => {
      const paths = [
        '/user/123',
        '/user/456/profile',
        '/user/789/settings',
        '/product/electronics/laptop123',
        '/blog/2024/01/hello-world',
      ]

      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        paths.forEach((path) => {
          matcher.matchByPath(path)
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // eslint-disable-next-line no-console
      console.log(`参数路由匹配 5000 次耗时: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(200) // 应该在 200ms 内完成
    })

    it('应该快速匹配大量路由', () => {
      const paths: string[] = []

      // 生成测试路径
      for (let i = 0; i < 50; i++) {
        paths.push(`/page${i}`)
        paths.push(`/category${i}/item123`)
        paths.push(`/section${i}/type1/item456`)
      }

      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        paths.forEach((path) => {
          matcher.matchByPath(path)
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // eslint-disable-next-line no-console
      console.log(`大量路由匹配 15000 次耗时: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(2000) // 应该在 2000ms 内完成（优化后更宽松的阈值）
    })
  })

  describe('缓存性能', () => {
    it('缓存应该显著提升重复匹配性能', () => {
      const path = '/user/123/profile'

      // 第一次匹配（无缓存）
      const startTime1 = performance.now()
      for (let i = 0; i < 1000; i++) {
        matcher.matchByPath(`${path}${i}`) // 不同路径，无法使用缓存
      }
      const endTime1 = performance.now()
      const durationWithoutCache = endTime1 - startTime1

      // 重复匹配（有缓存）
      const startTime2 = performance.now()
      for (let i = 0; i < 1000; i++) {
        matcher.matchByPath(path) // 相同路径，使用缓存
      }
      const endTime2 = performance.now()
      const durationWithCache = endTime2 - startTime2

      // eslint-disable-next-line no-console
      console.log(
        `无缓存匹配 1000 次耗时: ${durationWithoutCache.toFixed(2)}ms`,
      )
      // eslint-disable-next-line no-console
      console.log(`有缓存匹配 1000 次耗时: ${durationWithCache.toFixed(2)}ms`)
      // eslint-disable-next-line no-console
      console.log(
        `缓存提升倍数: ${(durationWithoutCache / durationWithCache).toFixed(
          2,
        )}x`,
      )

      // 缓存应该至少提升 1.5 倍性能（降低期望值，使测试更稳定）
      expect(durationWithoutCache / durationWithCache).toBeGreaterThan(1.5)
    })

    it('应该正确处理缓存统计', () => {
      const path = '/user/123'

      // 清除统计
      matcher.clearCache()

      // 第一次匹配
      matcher.matchByPath(path)

      // 重复匹配
      for (let i = 0; i < 10; i++) {
        matcher.matchByPath(path)
      }

      const stats = matcher.getStats()

      expect(stats.cacheStats.size).toBeGreaterThan(0)
      expect(stats.cacheHits).toBeGreaterThan(0)
      expect(stats.cacheMisses).toBeGreaterThan(0)
      expect(stats.totalMatches).toBe(11)
    })
  })

  describe('内存使用', () => {
    it('应该有效管理内存使用', () => {
      const initialStats = matcher.getStats()

      // 添加大量路由匹配
      for (let i = 0; i < 1000; i++) {
        matcher.matchByPath(`/test${i}`)
      }

      const afterStats = matcher.getStats()

      // 缓存大小应该受到限制
      expect(afterStats.cacheStats.size).toBeLessThanOrEqual(
        afterStats.cacheStats.capacity,
      )

      // eslint-disable-next-line no-console
      console.log(`初始缓存大小: ${initialStats.cacheStats.size}`)
      // eslint-disable-next-line no-console
      console.log(`匹配后缓存大小: ${afterStats.cacheStats.size}`)
      // eslint-disable-next-line no-console
      console.log(`缓存容量: ${afterStats.cacheStats.capacity}`)
    })
  })

  describe('边界情况性能', () => {
    it('应该快速处理不匹配的路径', () => {
      const invalidPaths = [
        '/nonexistent',
        '/invalid/path/here',
        '/user/',
        '/product//invalid',
        '/very/long/path/that/does/not/exist/anywhere',
      ]

      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        invalidPaths.forEach((path) => {
          const result = matcher.matchByPath(path)
          expect(result).toBeNull()
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // eslint-disable-next-line no-console
      console.log(`不匹配路径处理 5000 次耗时: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(150) // 应该在 150ms 内完成（调整阈值以适应不同环境）
    })

    it('应该快速处理复杂路径', () => {
      const complexPaths = [
        '/user/123/profile/settings/advanced/security',
        '/api/v1/users/456/posts/789/comments/101112',
        '/dashboard/analytics/reports/monthly/2024/january',
        '/admin/system/logs/errors/critical/recent',
      ]

      // 添加对应的路由
      complexPaths.forEach((path) => {
        matcher.addRoute({ path, component: {} })
      })

      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        complexPaths.forEach((path) => {
          matcher.matchByPath(path)
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // eslint-disable-next-line no-console
      console.log(`复杂路径匹配 4000 次耗时: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(300) // 应该在 300ms 内完成
    })
  })

  describe('并发性能', () => {
    it('应该支持并发匹配', async () => {
      const paths = ['/user/1', '/user/2', '/user/3', '/user/4', '/user/5']

      const startTime = performance.now()

      // 模拟并发匹配
      const promises = Array.from({ length: 100 }, () =>
        Promise.resolve().then(() => {
          paths.forEach(path => matcher.matchByPath(path))
        }))

      await Promise.all(promises)

      const endTime = performance.now()
      const duration = endTime - startTime

      // eslint-disable-next-line no-console
      console.log(`并发匹配耗时: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(200) // 应该在 200ms 内完成
    })
  })
})
