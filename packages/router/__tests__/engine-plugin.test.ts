/**
 * Router Engine 插件集成测试
 */

import type { RouteRecordRaw } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDefaultRouterEnginePlugin,
  createRouterEnginePlugin,
  routerPlugin,
} from '../src/engine/plugin'

// Mock Vue 应用
const mockVueApp = {
  use: vi.fn(),
  provide: vi.fn(),
  component: vi.fn(),
}

// Mock Engine
const mockEngine = {
  getApp: vi.fn(() => mockVueApp),
  setRouter: vi.fn(),
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  state: {
    set: vi.fn(),
    delete: vi.fn(),
  },
  events: {
    emit: vi.fn(),
    once: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  router: null,
}

// Mock 路由配置
const mockRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: { template: '<div>Home</div>' },
    meta: { title: '首页' },
  },
  {
    path: '/about',
    name: 'About',
    component: { template: '<div>About</div>' },
    meta: { title: '关于' },
  },
]

describe('router Engine Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEngine.router = null
  })

  describe('createRouterEnginePlugin', () => {
    it('should create a valid engine plugin', () => {
      const plugin = createRouterEnginePlugin({
        routes: mockRoutes,
        mode: 'hash',
        base: '/',
      })

      expect(plugin).toHaveProperty('name', 'router')
      expect(plugin).toHaveProperty('version', '1.0.0')
      expect(plugin).toHaveProperty('install')
      expect(plugin).toHaveProperty('uninstall')
      expect(typeof plugin.install).toBe('function')
      expect(typeof plugin.uninstall).toBe('function')
    })

    it('should allow custom plugin name and version', () => {
      const plugin = createRouterEnginePlugin({
        name: 'custom-router',
        version: '2.0.0',
        routes: mockRoutes,
      })

      expect(plugin.name).toBe('custom-router')
      expect(plugin.version).toBe('2.0.0')
    })

    it('should install router to engine successfully', async () => {
      const plugin = createRouterEnginePlugin({
        routes: mockRoutes,
        mode: 'hash',
        base: '/',
      })

      await plugin.install(mockEngine)

      // 验证 Vue 应用提供了路由器注入
      expect(mockVueApp.provide).toHaveBeenCalled()

      // 验证路由器被设置到 engine
      expect(mockEngine.router).toBeDefined()

      // 验证状态管理
      expect(mockEngine.state.set).toHaveBeenCalledWith('router:mode', 'hash')
      expect(mockEngine.state.set).toHaveBeenCalledWith('router:base', '/')

      // 验证日志记录
      expect(mockEngine.logger.info).toHaveBeenCalledWith(
        'Installing router plugin...',
        expect.objectContaining({
          version: '1.0.0',
          mode: 'hash',
          base: '/',
          routesCount: 2,
        }),
      )
    })

    it('should handle different router modes', async () => {
      const modes = ['history', 'hash', 'memory'] as const

      for (const mode of modes) {
        const plugin = createRouterEnginePlugin({
          routes: mockRoutes,
          mode,
        })

        await plugin.install(mockEngine)

        expect(mockEngine.state.set).toHaveBeenCalledWith('router:mode', mode)
        vi.clearAllMocks()
      }
    })

    it('should wait for Vue app creation when app is not found', async () => {
      const plugin = createRouterEnginePlugin({
        routes: mockRoutes,
      })

      const engineWithoutApp = {
        ...mockEngine,
        getApp: vi.fn(() => null),
        logger: {
          info: vi.fn(),
          error: vi.fn(),
        },
      }

      // 插件安装应该成功（会等待 app:created 事件）
      await expect(plugin.install(engineWithoutApp)).resolves.toBeUndefined()

      // 验证日志记录
      expect(engineWithoutApp.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('plugin registered, waiting for Vue app creation'),
      )

      // 验证事件监听器被注册
      expect(engineWithoutApp.events.once).toHaveBeenCalledWith(
        'app:created',
        expect.any(Function),
      )
    })

    it('should uninstall plugin correctly', async () => {
      const plugin = createRouterEnginePlugin({
        routes: mockRoutes,
      })

      await plugin.uninstall!(mockEngine)

      // 验证状态清理
      expect(mockEngine.state.delete).toHaveBeenCalledWith(
        'router:currentRoute',
      )
      expect(mockEngine.state.delete).toHaveBeenCalledWith('router:mode')
      expect(mockEngine.state.delete).toHaveBeenCalledWith('router:base')

      // 验证事件触发
      expect(mockEngine.events.emit).toHaveBeenCalledWith(
        'plugin:router:uninstalled',
      )
    })
  })

  describe('routerPlugin', () => {
    it('should be an alias for createRouterEnginePlugin', () => {
      const options = {
        routes: mockRoutes,
        mode: 'hash' as const,
      }

      const plugin1 = createRouterEnginePlugin(options)
      const plugin2 = routerPlugin(options)

      expect(plugin1.name).toBe(plugin2.name)
      expect(plugin1.version).toBe(plugin2.version)
      expect(typeof plugin1.install).toBe(typeof plugin2.install)
    })
  })

  describe('createDefaultRouterEnginePlugin', () => {
    it('should create plugin with default options', () => {
      const plugin = createDefaultRouterEnginePlugin(mockRoutes)

      expect(plugin.name).toBe('router')
      expect(plugin.version).toBe('1.0.0')
      expect(typeof plugin.install).toBe('function')
    })

    it('should use history mode and base path by default', async () => {
      const plugin = createDefaultRouterEnginePlugin(mockRoutes)

      await plugin.install(mockEngine)

      expect(mockEngine.state.set).toHaveBeenCalledWith(
        'router:mode',
        'history',
      )
      expect(mockEngine.state.set).toHaveBeenCalledWith('router:base', '/')
    })
  })

  describe('plugin Integration', () => {
    it('should handle router options correctly', async () => {
      const plugin = createRouterEnginePlugin({
        routes: mockRoutes,
        mode: 'history',
        base: '/app',
        linkActiveClass: 'active',
        linkExactActiveClass: 'exact-active',
        scrollBehavior: () => ({ top: 0, left: 0 }),
      })

      await plugin.install(mockEngine)

      expect(mockEngine.state.set).toHaveBeenCalledWith(
        'router:mode',
        'history',
      )
      expect(mockEngine.state.set).toHaveBeenCalledWith('router:base', '/app')
    })

    it('should handle engine without optional features', async () => {
      const minimalEngine = {
        getApp: vi.fn(() => mockVueApp),
        logger: {
          info: vi.fn(),
          error: vi.fn(),
        },
      }

      const plugin = createRouterEnginePlugin({
        routes: mockRoutes,
      })

      // 应该不会抛出错误
      await expect(plugin.install(minimalEngine)).resolves.not.toThrow()
    })
  })
})
