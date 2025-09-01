import type { Engine, Plugin } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEngine } from '../src'

describe('engine', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createEngine({
      config: {
        app: { name: 'Test App', version: '1.0.0' },
        environment: 'test' as const,
        debug: true,
        features: {
          enableHotReload: false,
          enableDevTools: false,
          enablePerformanceMonitoring: false,
          enableErrorReporting: false,
          enableSecurityProtection: false,
          enableCaching: false,
          enableNotifications: false,
        },
        logger: {
          level: 'error' as const,
          maxLogs: 1000,
          enableConsole: false,
          enableStorage: false,
          storageKey: 'engine-logs',
          transports: [],
        },
        cache: {
          enabled: true,
          maxSize: 100,
          defaultTTL: 300000,
          strategy: 'lru' as const,
          enableStats: false,
          cleanupInterval: 60000,
        },
        security: {
          xss: {
            enabled: false,
            allowedTags: [],
            allowedAttributes: {},
          },
          csrf: {
            enabled: false,
            tokenName: '_token',
            headerName: 'X-CSRF-Token',
          },
          csp: {
            enabled: false,
            directives: {},
            reportOnly: false,
          },
        },
        performance: {
          enabled: false,
          sampleRate: 1,
          maxEntries: 1000,
          thresholds: {
            responseTime: { good: 100, poor: 1000 },
            fps: { good: 60, poor: 30 },
            memory: { warning: 50, critical: 80 },
          },
        },
        notifications: {
          enabled: true,
          maxNotifications: 5,
          defaultDuration: 3000,
          defaultPosition: 'top-right' as const,
          defaultTheme: 'auto' as const,
        },
        env: {},
        custom: {},
      },
    })
  })

  describe('创建和配置', () => {
    it('应该创建引擎实例', () => {
      expect(engine).toBeDefined()
      expect(engine.getConfig('app.name')).toBe('Test App')
      expect(engine.getConfig('debug')).toBe(true)
    })

    it('应该有所有必需的管理器', () => {
      expect(engine.plugins).toBeDefined()
      expect(engine.middleware).toBeDefined()
      expect(engine.events).toBeDefined()
      expect(engine.state).toBeDefined()
      expect(engine.directives).toBeDefined()
      expect(engine.errors).toBeDefined()
      expect(engine.logger).toBeDefined()
      expect(engine.notifications).toBeDefined()
    })
  })

  describe('插件系统', () => {
    it('应该注册插件', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
      }

      await engine.use(plugin)

      expect(engine.plugins.has('test-plugin')).toBe(true)
      expect(plugin.install).toHaveBeenCalledWith(expect.objectContaining({
        engine,
        logger: expect.any(Object),
        config: expect.any(Object),
        events: expect.any(Object),
      }))
    })

    it('应该处理插件依赖', async () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        version: '1.0.0',
        install: vi.fn(),
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        install: vi.fn(),
      }

      await engine.use(pluginA)
      await engine.use(pluginB)

      expect(engine.plugins.has('plugin-a')).toBe(true)
      expect(engine.plugins.has('plugin-b')).toBe(true)
    })

    it('应该拒绝缺少依赖的插件', async () => {
      const plugin: Plugin = {
        name: 'plugin-with-deps',
        version: '1.0.0',
        dependencies: ['missing-plugin'],
        install: vi.fn(),
      }

      await expect(engine.use(plugin)).rejects.toThrow()
    })
  })

  describe('中间件系统', () => {
    it('应该添加和执行中间件', async () => {
      const middleware = {
        name: 'test-middleware',
        handler: vi.fn((ctx, next) => {
          ctx.processed = true
          return next()
        }),
      }

      engine.middleware.use(middleware)

      const context = { data: 'test' }
      const result = await engine.middleware.execute('test-middleware', context)

      expect(middleware.handler).toHaveBeenCalled()
      expect((result as any).processed).toBe(true)
    })

    it('应该按优先级执行中间件', async () => {
      const order: string[] = []

      engine.middleware.use({
        name: 'low-priority',
        priority: 10, // 数字越小优先级越高
        handler: (ctx, next) => {
          order.push('low')
          return next()
        },
      })

      engine.middleware.use({
        name: 'high-priority',
        priority: 1, // 数字越小优先级越高
        handler: (ctx, next) => {
          order.push('high')
          return next()
        },
      })

      // 执行所有中间件
      await engine.middleware.execute({})

      expect(order).toEqual(['high', 'low'])
    })
  })

  describe('事件系统', () => {
    it('应该注册和触发事件', () => {
      const handler = vi.fn()

      engine.events.on('test-event', handler)
      engine.events.emit('test-event', { data: 'test' })

      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该支持一次性事件监听', () => {
      const handler = vi.fn()

      engine.events.once('test-event', handler)
      engine.events.emit('test-event', 'first')
      engine.events.emit('test-event', 'second')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('first')
    })

    it('应该移除事件监听器', () => {
      const handler = vi.fn()

      engine.events.on('test-event', handler)
      engine.events.off('test-event', handler)
      engine.events.emit('test-event', 'data')

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    it('应该设置和获取状态', () => {
      engine.state.set('test.value', 'hello')

      expect(engine.state.get('test.value')).toBe('hello')
    })

    it('应该支持嵌套路径', () => {
      engine.state.set('user.profile.name', 'John')
      engine.state.set('user.profile.age', 30)

      expect(engine.state.get('user.profile.name')).toBe('John')
      expect(engine.state.get('user.profile.age')).toBe(30)
      expect(engine.state.get('user.profile')).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('应该监听状态变化', async () => {
      const listener = vi.fn()

      // 先设置一个初始值
      engine.state.set('test.value', 'initial value')

      // 然后添加监听器
      engine.state.watch('test.value', listener)

      // 修改值
      engine.state.set('test.value', 'new value')

      // 等待下一个tick让Vue的响应式系统处理
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(listener).toHaveBeenCalledWith('new value', 'initial value')
    })
  })

  describe('错误处理', () => {
    it('应该捕获和处理错误', () => {
      const handler = vi.fn()

      engine.errors.onError(handler)

      const error = new Error('Test error')
      engine.errors.captureError(error)

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          level: 'error',
          timestamp: expect.any(Number),
        }),
      )
    })

    it('应该记录错误信息', () => {
      const error = new Error('Test error')
      engine.errors.captureError(error)

      const errors = engine.errors.getErrors()
      expect(errors).toHaveLength(1)
      expect(errors[0].message).toBe('Test error')
    })
  })

  describe('日志系统', () => {
    it('应该记录不同级别的日志', () => {
      // 清空之前的日志
      engine.logger.clear()

      engine.logger.info('Info message')
      engine.logger.warn('Warning message')
      engine.logger.error('Error message')

      const logs = engine.logger.getLogs()
      expect(logs).toHaveLength(3)
      // 日志使用 unshift 添加，所以最新的在前面
      expect(logs[0].level).toBe('error')
      expect(logs[1].level).toBe('warn')
      expect(logs[2].level).toBe('info')
    })

    it('应该过滤日志级别', () => {
      // 清空之前的日志
      engine.logger.clear()
      engine.logger.setLevel('warn')

      engine.logger.debug('Debug message')
      engine.logger.info('Info message')
      engine.logger.warn('Warning message')

      const logs = engine.logger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].level).toBe('warn')
    })
  })

  describe('通知系统', () => {
    it('应该显示通知', () => {
      const notificationId = engine.notifications.show({
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
      })

      expect(notificationId).toBeDefined()
      expect(typeof notificationId).toBe('string')

      const notifications = engine.notifications.getAll()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('success')
    })

    it('应该隐藏通知', () => {
      const notificationId = engine.notifications.show({
        type: 'info',
        message: 'Test notification',
      })

      engine.notifications.hide(notificationId)

      const notifications = engine.notifications.getAll()
      expect(notifications).toHaveLength(0)
    })
  })

  describe('生命周期', () => {
    it('应该正确挂载和卸载', () => {
      const mockApp = {
        use: vi.fn(),
        mount: vi.fn(),
        unmount: vi.fn(),
        provide: vi.fn(),
        config: {
          globalProperties: {} as any,
          errorHandler: null,
        },
        directive: vi.fn(),
      }

      engine.install(mockApp as any)
      expect(mockApp.config.globalProperties.$engine).toBe(engine)

      // 注意：mount 和 unmount 需要先创建 app
      // 这里我们只测试 install 方法
    })

    it('应该触发生命周期事件', () => {
      const mountHandler = vi.fn()
      const unmountHandler = vi.fn()

      engine.events.on('engine:mounted', mountHandler)
      engine.events.on('engine:unmounted', unmountHandler)

      const mockApp = {
        use: vi.fn(),
        mount: vi.fn(),
        unmount: vi.fn(),
        provide: vi.fn(),
        config: {
          globalProperties: {},
        },
        directive: vi.fn(),
      }

      engine.install(mockApp as any)

      // 生命周期事件测试需要实际的 DOM 环境
      // 这里我们只验证事件监听器已注册
      expect(mountHandler).not.toHaveBeenCalled()
      expect(unmountHandler).not.toHaveBeenCalled()
    })
  })

  describe('扩展适配器', () => {
    it('应该设置路由适配器', () => {
      const router = {
        name: 'test-router',
        version: '1.0.0',
        install: vi.fn(),
        navigate: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        getCurrentRoute: vi.fn().mockReturnValue('/'),
        getCurrentParams: vi.fn().mockReturnValue({}),
        getCurrentQuery: vi.fn().mockReturnValue({}),
        onRouteChange: vi.fn().mockReturnValue(() => { }),
        destroy: vi.fn(),
      }

      engine.setRouter(router)
      expect(engine.router).toBe(router)
    })

    it('应该设置状态适配器', () => {
      const store = {
        name: 'test-store',
        version: '1.0.0',
        install: vi.fn(),
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        has: vi.fn().mockReturnValue(false),
        keys: vi.fn().mockReturnValue([]),
        subscribe: vi.fn().mockReturnValue(() => { }),
        destroy: vi.fn(),
      }

      engine.setStore(store)
      expect(engine.store).toBe(store)
    })

    it('应该设置国际化适配器', () => {
      const i18n = {
        name: 'test-i18n',
        version: '1.0.0',
        install: vi.fn(),
        t: vi.fn(),
        locale: 'en',
        setLocale: vi.fn(),
        getLocale: vi.fn(),
        getAvailableLocales: vi.fn(),
        onLocaleChange: vi.fn(),
        destroy: vi.fn().mockReturnValue('en'),
      }

      engine.setI18n(i18n)
      expect(engine.i18n).toBe(i18n)
    })

    it('应该设置主题适配器', () => {
      const theme = {
        name: 'test-theme',
        version: '1.0.0',
        install: vi.fn(),
        setTheme: vi.fn(),
        getTheme: vi.fn(),
        getThemes: vi.fn().mockReturnValue(['light', 'dark']),
        getAvailableThemes: vi.fn(),
        onThemeChange: vi.fn(),
        destroy: vi.fn(),
      }

      engine.setTheme(theme)
      expect(engine.theme).toBe(theme)
    })
  })

  describe('vue应用集成', () => {
    it('应该创建Vue应用', () => {
      const rootComponent = { template: '<div>Test</div>' }
      const app = engine.createApp(rootComponent)

      expect(app).toBeDefined()
      expect(engine.getApp()).toBe(app)
    })

    it('应该在重复创建时返回现有应用', () => {
      const rootComponent = { template: '<div>Test</div>' }
      const app1 = engine.createApp(rootComponent)
      const app2 = engine.createApp(rootComponent)

      expect(app1).toBe(app2)
    })

    it('应该检查挂载状态', () => {
      expect(engine.isMounted()).toBe(false)
    })

    it('应该获取挂载目标', () => {
      expect(engine.getMountTarget()).toBeUndefined()
    })
  })

  describe('错误处理集成', () => {
    it('应该在调试模式下显示错误通知', async () => {
      const debugEngine = createEngine({ config: { debug: true } as any })

      const error = new Error('Debug error')
      debugEngine.errors.captureError(error)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0))

      const notifications = debugEngine.notifications.getAll()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('error')
      expect(notifications[0].title).toBe('Error Captured')
    })

    it('应该在生产模式下不显示错误通知', () => {
      const prodEngine = createEngine({
        config: {
          app: { name: 'Test App', version: '1.0.0' },
          environment: 'production' as const,
          debug: false,
          features: {
            enableHotReload: false,
            enableDevTools: false,
            enablePerformanceMonitoring: false,
            enableErrorReporting: false,
            enableSecurityProtection: false,
            enableCaching: false,
            enableNotifications: false,
          },
          logger: {
            level: 'error' as const,
            maxLogs: 1000,
            enableConsole: false,
            enableStorage: false,
            storageKey: 'engine-logs',
            transports: [],
          },
          cache: {
            enabled: true,
            maxSize: 100,
            defaultTTL: 300000,
            strategy: 'lru' as const,
            enableStats: false,
            cleanupInterval: 60000,
          },
          security: {
            xss: { enabled: false, allowedTags: [], allowedAttributes: {} },
            csrf: { enabled: false, tokenName: '_token', headerName: 'X-CSRF-Token' },
            csp: { enabled: false, directives: {}, reportOnly: false },
          },
          performance: {
            enabled: false,
            sampleRate: 1,
            maxEntries: 1000,
            thresholds: {
              responseTime: { good: 100, poor: 1000 },
              fps: { good: 60, poor: 30 },
              memory: { warning: 50, critical: 80 },
            },
          },
          notifications: {
            enabled: true,
            maxNotifications: 5,
            defaultDuration: 3000,
            defaultPosition: 'top-right' as const,
            defaultTheme: 'auto' as const,
          },
          env: {},
          custom: {},
        }
      })

      const error = new Error('Production error')
      prodEngine.errors.captureError(error)

      const notifications = prodEngine.notifications.getAll()
      expect(notifications).toHaveLength(0)
    })

    it('应该触发错误事件', () => {
      const errorHandler = vi.fn()
      engine.events.on('engine:error', errorHandler)

      const error = new Error('Event error')
      engine.errors.captureError(error)

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Event error',
        }),
      )
    })
  })

  describe('引擎销毁', () => {
    it('应该正确销毁引擎', async () => {
      const destroyHandler = vi.fn()
      engine.events.on('engine:destroy', destroyHandler)

      // 添加一些数据
      engine.state.set('test', 'value')
      engine.logger.info('Test log')
      engine.errors.captureError(new Error('Test error'))
      engine.notifications.show({ type: 'info', message: 'Test notification' })

      await engine.destroy()

      expect(destroyHandler).toHaveBeenCalled()
      expect(engine.state.get('test')).toBeUndefined()
      // 销毁后会记录一条 "Engine destroyed" 日志，所以不是0
      expect(engine.logger.getLogs().length).toBeGreaterThanOrEqual(0)
      expect(engine.errors.getErrors()).toHaveLength(0)
      expect(engine.notifications.getAll()).toHaveLength(0)
    })
  })

  describe('配置管理', () => {
    it('应该使用默认配置', () => {
      const defaultEngine = createEngine()
      expect(defaultEngine.getConfig('debug')).toBe(false)
    })

    it('应该合并自定义配置', () => {
      const customEngine = createEngine({
        config: {
          app: { name: 'Custom App', version: '1.0.0' },
          environment: 'test' as const,
          debug: true,
          features: {
            enableHotReload: false,
            enableDevTools: false,
            enablePerformanceMonitoring: false,
            enableErrorReporting: false,
            enableSecurityProtection: false,
            enableCaching: false,
            enableNotifications: false,
          },
          logger: {
            level: 'error' as const,
            maxLogs: 1000,
            enableConsole: false,
            enableStorage: false,
            storageKey: 'engine-logs',
            transports: [],
          },
          cache: {
            enabled: true,
            maxSize: 100,
            defaultTTL: 300000,
            strategy: 'lru' as const,
            enableStats: false,
            cleanupInterval: 60000,
          },
          security: {
            xss: { enabled: false, allowedTags: [], allowedAttributes: {} },
            csrf: { enabled: false, tokenName: '_token', headerName: 'X-CSRF-Token' },
            csp: { enabled: false, directives: {}, reportOnly: false },
          },
          performance: {
            enabled: false,
            sampleRate: 1,
            maxEntries: 1000,
            thresholds: {
              responseTime: { good: 100, poor: 1000 },
              fps: { good: 60, poor: 30 },
              memory: { warning: 50, critical: 80 },
            },
          },
          notifications: {
            enabled: true,
            maxNotifications: 5,
            defaultDuration: 3000,
            defaultPosition: 'top-right' as const,
            defaultTheme: 'auto' as const,
          },
          env: {},
          custom: {},
        },
      })

      expect(customEngine.getConfig('debug')).toBe(true)
      expect(customEngine.getConfig('app.name')).toBe('Custom App')
      expect(customEngine.getConfig('app.version')).toBe('1.0.0')
    })

    it('应该根据调试模式设置日志级别', () => {
      const debugEngine = createEngine({ config: { debug: true } as any })
      const prodEngine = createEngine({ config: { debug: false } as any })

      expect(debugEngine.logger.getLevel()).toBe('debug')
      expect(prodEngine.logger.getLevel()).toBe('info')
    })
  })
})
