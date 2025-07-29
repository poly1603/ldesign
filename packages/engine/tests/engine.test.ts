import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createEngine } from '../src'
import type { Engine, Plugin } from '../src/types'

describe('Engine', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createEngine({
      config: {
        debug: true,
        appName: 'Test App'
      }
    })
  })

  describe('创建和配置', () => {
    it('应该创建引擎实例', () => {
      expect(engine).toBeDefined()
      expect(engine.config.appName).toBe('Test App')
      expect(engine.config.debug).toBe(true)
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
        install: vi.fn()
      }

      await engine.use(plugin)
      
      expect(engine.plugins.has('test-plugin')).toBe(true)
      expect(plugin.install).toHaveBeenCalledWith(engine)
    })

    it('应该处理插件依赖', async () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        version: '1.0.0',
        install: vi.fn()
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        install: vi.fn()
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
        install: vi.fn()
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
        })
      }

      engine.middleware.use(middleware)
      
      const context = { data: 'test' }
      const result = await engine.middleware.execute('test', context)
      
      expect(middleware.handler).toHaveBeenCalled()
      expect(result.processed).toBe(true)
    })

    it('应该按优先级执行中间件', async () => {
      const order: string[] = []
      
      engine.middleware.use({
        name: 'low-priority',
        priority: 1,
        handler: (ctx, next) => {
          order.push('low')
          return next()
        }
      })
      
      engine.middleware.use({
        name: 'high-priority',
        priority: 10,
        handler: (ctx, next) => {
          order.push('high')
          return next()
        }
      })
      
      await engine.middleware.execute('test', {})
      
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
        age: 30
      })
    })

    it('应该监听状态变化', () => {
      const listener = vi.fn()
      
      engine.state.watch('test.value', listener)
      engine.state.set('test.value', 'new value')
      
      expect(listener).toHaveBeenCalledWith('new value', undefined)
    })
  })

  describe('错误处理', () => {
    it('应该捕获和处理错误', () => {
      const handler = vi.fn()
      
      engine.errors.addHandler('test', handler)
      
      const error = new Error('Test error')
      engine.errors.captureError(error, { component: 'TestComponent' })
      
      expect(handler).toHaveBeenCalledWith(error, expect.any(Object))
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
      engine.logger.info('Info message')
      engine.logger.warn('Warning message')
      engine.logger.error('Error message')
      
      const logs = engine.logger.getLogs()
      expect(logs).toHaveLength(3)
      expect(logs[0].level).toBe('info')
      expect(logs[1].level).toBe('warn')
      expect(logs[2].level).toBe('error')
    })

    it('应该过滤日志级别', () => {
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
      const notification = engine.notifications.show({
        type: 'success',
        title: 'Success',
        message: 'Operation completed'
      })
      
      expect(notification).toBeDefined()
      expect(notification.type).toBe('success')
      
      const notifications = engine.notifications.getAll()
      expect(notifications).toHaveLength(1)
    })

    it('应该隐藏通知', () => {
      const notification = engine.notifications.show({
        type: 'info',
        message: 'Test notification'
      })
      
      engine.notifications.hide(notification.id)
      
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
        provide: vi.fn()
      }
      
      engine.install(mockApp as any)
      expect(mockApp.provide).toHaveBeenCalledWith('engine', engine)
      
      engine.mount('#app')
      expect(mockApp.mount).toHaveBeenCalledWith('#app')
      
      engine.unmount()
      expect(mockApp.unmount).toHaveBeenCalled()
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
        provide: vi.fn()
      }
      
      engine.install(mockApp as any)
      engine.mount('#app')
      expect(mountHandler).toHaveBeenCalled()
      
      engine.unmount()
      expect(unmountHandler).toHaveBeenCalled()
    })
  })

  describe('扩展适配器', () => {
    it('应该设置路由适配器', () => {
      const router = {
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        currentRoute: { value: { path: '/' } }
      }
      
      engine.setRouter(router)
      expect(engine.router).toBe(router)
    })

    it('应该设置状态适配器', () => {
      const store = {
        state: {},
        getters: {},
        commit: vi.fn(),
        dispatch: vi.fn()
      }
      
      engine.setStore(store)
      expect(engine.store).toBe(store)
    })
  })
})