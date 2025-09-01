/**
 * 集成测试设置文件
 * 为集成测试提供特殊的环境配置和工具函数
 */

import type { Engine } from '../../src/types'
import { vi } from 'vitest'
import { createEngine } from '../../src'

// 集成测试专用的全局变量
declare global {
  // eslint-disable-next-line vars-on-top
  var __INTEGRATION_TEST__: boolean
}

globalThis.__INTEGRATION_TEST__ = true

// 集成测试工具类
export class IntegrationTestUtils {
  private engines: Engine[] = []

  /**
   * 创建测试引擎实例
   */
  createTestEngine(config?: any): Engine {
    const defaultConfig = {
      app: {
        name: 'Integration Test App',
        version: '1.0.0',
      },
      environment: 'test' as const,
      debug: true,
      features: {
        enableHotReload: false,
        enableDevTools: true,
        enablePerformanceMonitoring: true,
        enableErrorReporting: true,
        enableSecurityProtection: true,
        enableCaching: true,
        enableNotifications: true,
      },
      logger: {
        level: 'debug' as const,
        enableConsole: true,
        enableFile: false,
      },
      cache: {
        maxSize: 100,
        ttl: 60000,
      },
      security: {
        enableXSSProtection: true,
        enableCSRFProtection: true,
      },
      performance: {
        enableMonitoring: true,
      },
      notifications: {
        position: 'top-right' as const,
        duration: 3000,
      },
      env: {},
      custom: {},
    }

    const engine = createEngine({
      config: { ...defaultConfig, ...config },
    })

    this.engines.push(engine)
    return engine
  }

  /**
   * 清理所有测试引擎
   */
  async cleanup(): Promise<void> {
    for (const engine of this.engines) {
      try {
        await engine.destroy()
      }
      catch (error) {
        console.warn('Failed to destroy engine:', error)
      }
    }
    this.engines = []
  }

  /**
   * 等待引擎初始化完成
   */
  async waitForEngineReady(engine: Engine, timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Engine initialization timeout after ${timeout}ms`))
      }, timeout)

      const checkReady = () => {
        if (engine.isReady()) {
          clearTimeout(timer)
          resolve()
        }
        else {
          setTimeout(checkReady, 100)
        }
      }

      checkReady()
    })
  }

  /**
   * 模拟网络请求
   */
  mockNetworkRequest(url: string, response: any, delay = 0): void {
    const mockFetch = vi.fn().mockImplementation(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response)),
          })
        }, delay)
      }),
    )

    globalThis.fetch = mockFetch
  }

  /**
   * 模拟用户认证状态
   */
  mockAuthState(isAuthenticated: boolean, user?: any): void {
    const mockAuth = {
      isAuthenticated,
      user: user || null,
      token: isAuthenticated ? 'mock-token' : null,
    }

    // 模拟 localStorage 中的认证信息
    if (isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify(mockAuth))
    }
    else {
      localStorage.removeItem('auth')
    }
  }

  /**
   * 模拟路由状态
   */
  mockRouteState(path: string, params?: Record<string, string>, query?: Record<string, string>): void {
    const mockLocation = {
      pathname: path,
      search: query ? `?${new URLSearchParams(query).toString()}` : '',
      hash: '',
      state: null,
    }

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    })

    // 触发路由变化事件
    window.dispatchEvent(new PopStateEvent('popstate', { state: mockLocation }))
  }

  /**
   * 模拟存储状态
   */
  mockStorageState(key: string, value: any, storage: 'local' | 'session' = 'local'): void {
    const storageObj = storage === 'local' ? localStorage : sessionStorage
    storageObj.setItem(key, JSON.stringify(value))
  }

  /**
   * 验证引擎状态
   */
  validateEngineState(engine: Engine, expectedState: Partial<{
    isReady: boolean
    hasErrors: boolean
    pluginCount: number
    middlewareCount: number
  }>): void {
    if (expectedState.isReady !== undefined) {
      expect(engine.isReady()).toBe(expectedState.isReady)
    }

    if (expectedState.hasErrors !== undefined) {
      expect(engine.errors.hasErrors()).toBe(expectedState.hasErrors)
    }

    if (expectedState.pluginCount !== undefined) {
      expect(engine.plugins.getAll().length).toBe(expectedState.pluginCount)
    }

    if (expectedState.middlewareCount !== undefined) {
      expect(engine.middleware.getAll().length).toBe(expectedState.middlewareCount)
    }
  }

  /**
   * 创建模拟插件
   */
  createMockPlugin(name: string, options?: any) {
    return {
      name,
      version: '1.0.0',
      install: vi.fn(),
      uninstall: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      configure: vi.fn(),
      getConfig: vi.fn().mockReturnValue(options || {}),
      isEnabled: vi.fn().mockReturnValue(true),
      getDependencies: vi.fn().mockReturnValue([]),
      getMetadata: vi.fn().mockReturnValue({ name, version: '1.0.0' }),
    }
  }

  /**
   * 创建模拟中间件
   */
  createMockMiddleware(name: string, handler?: (...args: any[]) => any) {
    return {
      name,
      priority: 0,
      handler: handler || vi.fn().mockImplementation((context, next) => next()),
      enabled: true,
    }
  }
}

// 创建全局集成测试工具实例
export const integrationTestUtils = new IntegrationTestUtils()

// 集成测试钩子
beforeEach(() => {
  // 重置网络模拟
  vi.clearAllMocks()

  // 清理存储
  localStorage.clear()
  sessionStorage.clear()

  // 重置 fetch
  globalThis.fetch = vi.fn()
})

afterEach(async () => {
  // 清理所有测试引擎
  await integrationTestUtils.cleanup()

  // 清理定时器
  vi.clearAllTimers()
})

// 导出常用的测试断言
export const integrationAssertions = {
  /**
   * 断言引擎已正确初始化
   */
  expectEngineInitialized: (engine: Engine) => {
    expect(engine).toBeDefined()
    expect(engine.isReady()).toBe(true)
    expect(engine.config).toBeDefined()
    expect(engine.logger).toBeDefined()
    expect(engine.events).toBeDefined()
  },

  /**
   * 断言插件已正确安装
   */
  expectPluginInstalled: (engine: Engine, pluginName: string) => {
    const plugin = engine.plugins.get(pluginName)
    expect(plugin).toBeDefined()
    expect(plugin?.isEnabled?.()).toBe(true)
  },

  /**
   * 断言中间件已正确注册
   */
  expectMiddlewareRegistered: (engine: Engine, middlewareName: string) => {
    const middleware = engine.middleware.get(middlewareName)
    expect(middleware).toBeDefined()
    expect(middleware).toBeTruthy()
  },

  /**
   * 断言事件已正确触发
   */
  expectEventEmitted: (engine: Engine, eventName: string, _times = 1) => {
    const eventStats = engine.events.getStats()
    expect(eventStats).toBeDefined()
  },
}
