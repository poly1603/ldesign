import { createApp } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'

// Mock 路由配置
const mockRoutes = [
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
]

describe('router Plugin Integration', () => {
  let engine: any

  beforeEach(() => {
    // 重置 DOM
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('should create router plugin successfully', async () => {
    const plugin = routerPlugin({
      routes: mockRoutes,
      mode: 'memory', // 使用内存模式避免浏览器历史记录问题
    })

    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('router')
    expect(plugin.version).toBe('1.0.0')
  })

  it('should integrate router plugin with engine', async () => {
    engine = createApp(App, {
      config: {
        debug: false, // 关闭调试避免控制台输出
      },
    })

    // 安装路由插件
    await engine.use(
      routerPlugin({
        routes: mockRoutes,
        mode: 'memory',
      }),
    )

    // 验证路由器已安装
    expect(engine.router).toBeDefined()
    expect(engine.router.push).toBeInstanceOf(Function)
    expect(engine.router.replace).toBeInstanceOf(Function)
    expect(engine.router.back).toBeInstanceOf(Function)
    expect(engine.router.forward).toBeInstanceOf(Function)
    expect(engine.router.go).toBeInstanceOf(Function)
    expect(engine.router.getCurrentRoute).toBeInstanceOf(Function)
    expect(engine.router.getRouter).toBeInstanceOf(Function)
  })

  it('should support different router modes', async () => {
    const modes = ['history', 'hash', 'memory']

    for (const mode of modes) {
      const plugin = routerPlugin({
        routes: mockRoutes,
        mode: mode as any,
      })

      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('router')
    }
  })

  it('should handle router navigation', async () => {
    engine = createApp(App, {
      config: { debug: false },
    })

    await engine.use(
      routerPlugin({
        routes: mockRoutes,
        mode: 'memory',
      }),
    )

    // 测试路由导航
    const router = engine.router.getRouter()
    expect(router).toBeDefined()

    // 测试当前路由
    const currentRoute = engine.router.getCurrentRoute()
    expect(currentRoute).toBeDefined()
    expect(currentRoute.value.path).toBe('/')
  })

  it('should support custom router options', async () => {
    const customScrollBehavior = vi.fn(() => ({ left: 0, top: 0 }))

    const plugin = routerPlugin({
      routes: mockRoutes,
      mode: 'memory',
      scrollBehavior: customScrollBehavior,
      base: '/app/',
    })

    expect(plugin).toBeDefined()
  })
})
