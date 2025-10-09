/**
 * @ldesign/router 测试工具
 *
 * 提供路由测试的辅助函数和工具
 */

import type { App } from 'vue'
import type { RouteLocationNormalized, Router, RouteRecordRaw } from '../types'
import { createApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from '../core'

/**
 * 测试路由器配置
 */
export interface TestRouterConfig {
  routes?: RouteRecordRaw[]
  initialRoute?: string
  history?: any
}

/**
 * 路由测试工具类
 */
export class RouterTestUtils {
  private router: Router
  private app: App | null = null

  constructor(config: TestRouterConfig = {}) {
    this.router = createRouter({
      history: config.history || createMemoryHistory(),
      routes: config.routes || [],
    })

    if (config.initialRoute) {
      this.router.push(config.initialRoute)
    }
  }

  /**
   * 获取路由器实例
   */
  getRouter(): Router {
    return this.router
  }

  /**
   * 创建测试应用
   */
  createApp(rootComponent: any): App {
    this.app = createApp(rootComponent)
    this.app.use(this.router)
    return this.app
  }

  /**
   * 导航到指定路由
   */
  async navigateTo(to: string | { name: string, params?: any, query?: any }): Promise<void> {
    await this.router.push(to)
    await nextTick()
  }

  /**
   * 等待路由导航完成
   */
  async waitForNavigation(): Promise<RouteLocationNormalized> {
    return new Promise((resolve) => {
      const unwatch = this.router.afterEach((to) => {
        unwatch()
        resolve(to)
      })
    })
  }

  /**
   * 模拟路由守卫
   */
  mockGuard(
    type: 'beforeEach' | 'beforeResolve' | 'afterEach',
    guard: (...args: any[]) => any,
  ): () => void {
    return this.router[type](guard)
  }

  /**
   * 获取当前路由
   */
  getCurrentRoute(): RouteLocationNormalized {
    return this.router.currentRoute.value
  }

  /**
   * 检查路由是否匹配
   */
  isRouteMatched(path: string): boolean {
    const current = this.getCurrentRoute()
    return current.path === path
  }

  /**
   * 获取路由参数
   */
  getRouteParams(): Record<string, any> {
    return this.getCurrentRoute().params
  }

  /**
   * 获取查询参数
   */
  getRouteQuery(): Record<string, any> {
    return this.getCurrentRoute().query
  }

  /**
   * 模拟路由错误
   */
  simulateError(error: Error): void {
    this.router.onError((err) => {
      if (err === error) {
        throw error
      }
    })
  }

  /**
   * 重置路由器状态
   */
  reset(): void {
    this.router.push('/')
  }

  /**
   * 销毁测试环境
   */
  destroy(): void {
    if (this.app) {
      this.app.unmount()
      this.app = null
    }
  }
}

/**
 * 创建测试路由器
 */
export function createTestRouter(config: TestRouterConfig = {}): RouterTestUtils {
  return new RouterTestUtils(config)
}

/**
 * 路由断言工具
 */
export class RouteAssertions {
  constructor(private utils: RouterTestUtils) {}

  /**
   * 断言当前路径
   */
  expectPath(expectedPath: string): void {
    const currentPath = this.utils.getCurrentRoute().path
    if (currentPath !== expectedPath) {
      throw new Error(`Expected path "${expectedPath}", but got "${currentPath}"`)
    }
  }

  /**
   * 断言路由名称
   */
  expectName(expectedName: string): void {
    const currentName = this.utils.getCurrentRoute().name
    if (currentName !== expectedName) {
      throw new Error(`Expected route name "${expectedName}", but got "${currentName}"`)
    }
  }

  /**
   * 断言路由参数
   */
  expectParams(expectedParams: Record<string, any>): void {
    const currentParams = this.utils.getRouteParams()

    for (const [key, value] of Object.entries(expectedParams)) {
      if (currentParams[key] !== value) {
        throw new Error(
          `Expected param "${key}" to be "${value}", but got "${currentParams[key]}"`,
        )
      }
    }
  }

  /**
   * 断言查询参数
   */
  expectQuery(expectedQuery: Record<string, any>): void {
    const currentQuery = this.utils.getRouteQuery()

    for (const [key, value] of Object.entries(expectedQuery)) {
      if (currentQuery[key] !== value) {
        throw new Error(
          `Expected query "${key}" to be "${value}", but got "${currentQuery[key]}"`,
        )
      }
    }
  }

  /**
   * 断言路由元信息
   */
  expectMeta(expectedMeta: Record<string, any>): void {
    const currentMeta = this.utils.getCurrentRoute().meta

    for (const [key, value] of Object.entries(expectedMeta)) {
      if (currentMeta[key] !== value) {
        throw new Error(
          `Expected meta "${key}" to be "${value}", but got "${currentMeta[key]}"`,
        )
      }
    }
  }

  /**
   * 断言路由匹配
   */
  expectMatched(expectedPaths: string[]): void {
    const matched = this.utils.getCurrentRoute().matched.map(record => record.path)

    if (matched.length !== expectedPaths.length) {
      throw new Error(
        `Expected ${expectedPaths.length} matched routes, but got ${matched.length}`,
      )
    }

    for (let i = 0; i < expectedPaths.length; i++) {
      if (matched[i] !== expectedPaths[i]) {
        throw new Error(
          `Expected matched route at index ${i} to be "${expectedPaths[i]}", but got "${matched[i]}"`,
        )
      }
    }
  }
}

/**
 * 性能测试工具
 */
export class RoutePerformanceTester {
  private measurements: Array<{
    route: string
    startTime: number
    endTime: number
    duration: number
  }> = []

  /**
   * 测量路由导航性能
   */
  async measureNavigation(
    utils: RouterTestUtils,
    to: string | { name: string, params?: any, query?: any },
  ): Promise<number> {
    const startTime = performance.now()

    await utils.navigateTo(to)

    const endTime = performance.now()
    const duration = endTime - startTime

    this.measurements.push({
      route: typeof to === 'string' ? to : to.name,
      startTime,
      endTime,
      duration,
    })

    return duration
  }

  /**
   * 获取性能统计
   */
  getStats() {
    if (this.measurements.length === 0) {
      return null
    }

    const durations = this.measurements.map(m => m.duration)
    const total = durations.reduce((sum, d) => sum + d, 0)
    const average = total / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)

    return {
      count: this.measurements.length,
      total,
      average,
      min,
      max,
      measurements: [...this.measurements],
    }
  }

  /**
   * 重置测量数据
   */
  reset(): void {
    this.measurements = []
  }
}

/**
 * 创建路由断言工具
 */
export function createRouteAssertions(utils: RouterTestUtils): RouteAssertions {
  return new RouteAssertions(utils)
}

/**
 * 创建性能测试工具
 */
export function createPerformanceTester(): RoutePerformanceTester {
  return new RoutePerformanceTester()
}

/**
 * 常用测试路由配置
 */
export const testRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: { template: '<div>Home</div>' },
  },
  {
    path: '/about',
    name: 'About',
    component: { template: '<div>About</div>' },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: { template: '<div>User {{ $route.params.id }}</div>' },
  },
  {
    path: '/nested',
    component: { template: '<div>Nested <router-view /></div>' },
    children: [
      {
        path: 'child',
        name: 'NestedChild',
        component: { template: '<div>Child</div>' },
      },
    ],
  },
]

/**
 * 快速创建测试环境
 */
export function setupRouterTest(routes: RouteRecordRaw[] = testRoutes) {
  const utils = createTestRouter({ routes })
  const assertions = createRouteAssertions(utils)
  const performance = createPerformanceTester()

  return {
    utils,
    assertions,
    performance,
    router: utils.getRouter(),
  }
}
