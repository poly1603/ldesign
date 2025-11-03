/**
 * 核心引擎测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCoreEngine, CoreEngineImpl } from '../core-engine'
import type { CoreEngine, CoreEngineConfig, Plugin } from '../types'

describe('CoreEngine', () => {
  let engine: CoreEngine

  beforeEach(() => {
    engine = createCoreEngine()
  })

  describe('创建引擎', () => {
    it('应该成功创建引擎实例', () => {
      expect(engine).toBeInstanceOf(CoreEngineImpl)
      expect(engine.plugins).toBeDefined()
      expect(engine.middleware).toBeDefined()
      expect(engine.lifecycle).toBeDefined()
      expect(engine.events).toBeDefined()
      expect(engine.state).toBeDefined()
      expect(engine.cache).toBeDefined()
      expect(engine.logger).toBeDefined()
      expect(engine.config).toBeDefined()
      expect(engine.di).toBeDefined()
    })

    it('应该使用自定义配置创建引擎', () => {
      const config: CoreEngineConfig = {
        name: 'TestEngine',
        debug: true,
        logger: {
          level: 'debug',
          enabled: true,
        },
      }

      const customEngine = createCoreEngine(config)
      expect(customEngine).toBeInstanceOf(CoreEngineImpl)
    })

    it('应该创建默认配置的引擎', () => {
      const defaultEngine = createCoreEngine()
      expect(defaultEngine).toBeDefined()
    })
  })

  describe('初始化引擎', () => {
    it('应该成功初始化引擎', async () => {
      await engine.init()
      const status = engine.getStatus()
      expect(status.initialized).toBe(true)
      expect(status.destroyed).toBe(false)
    })

    it('应该避免重复初始化', async () => {
      await engine.init()
      await engine.init() // 第二次初始化应该被忽略
      const status = engine.getStatus()
      expect(status.initialized).toBe(true)
    })

    it('应该在初始化失败时抛出错误', async () => {
      // 创建一个会导致初始化失败的引擎
      const badEngine = createCoreEngine()
      
      // 模拟插件初始化失败
      const badPlugin: Plugin = {
        name: 'bad-plugin',
        version: '1.0.0',
        install: vi.fn().mockRejectedValue(new Error('Plugin init failed')),
      }
      
      await badEngine.init()
      await expect(badEngine.use(badPlugin)).rejects.toThrow()
    })

    it('应该执行生命周期钩子', async () => {
      const beforeInitSpy = vi.fn()
      const afterInitSpy = vi.fn()

      engine.lifecycle.on('beforeInit', beforeInitSpy)
      engine.lifecycle.on('afterInit', afterInitSpy)

      await engine.init()

      expect(beforeInitSpy).toHaveBeenCalled()
      expect(beforeInitSpy.mock.calls[0][0]).toHaveProperty('engine', engine)
      expect(afterInitSpy).toHaveBeenCalled()
      expect(afterInitSpy.mock.calls[0][0]).toHaveProperty('engine', engine)
    })
  })

  describe('销毁引擎', () => {
    it('应该成功销毁引擎', async () => {
      await engine.init()
      await engine.destroy()
      const status = engine.getStatus()
      expect(status.destroyed).toBe(true)
      expect(status.initialized).toBe(false)
    })

    it('应该避免重复销毁', async () => {
      await engine.init()
      await engine.destroy()
      await engine.destroy() // 第二次销毁应该被忽略
      const status = engine.getStatus()
      expect(status.destroyed).toBe(true)
    })

    it('应该执行销毁生命周期钩子', async () => {
      const beforeDestroySpy = vi.fn()
      const afterDestroySpy = vi.fn()

      engine.lifecycle.on('beforeDestroy', beforeDestroySpy)
      engine.lifecycle.on('afterDestroy', afterDestroySpy)

      await engine.init()
      await engine.destroy()

      expect(beforeDestroySpy).toHaveBeenCalled()
      expect(beforeDestroySpy.mock.calls[0][0]).toHaveProperty('engine', engine)
      expect(afterDestroySpy).toHaveBeenCalled()
      expect(afterDestroySpy.mock.calls[0][0]).toHaveProperty('engine', engine)
    })

    it('不应该初始化已销毁的引擎', async () => {
      await engine.init()
      await engine.destroy()
      await expect(engine.init()).rejects.toThrow('Cannot initialize destroyed engine')
    })
  })

  describe('插件管理', () => {
    it('应该注册插件', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
      }

      await engine.use(plugin)
      
      const status = engine.getStatus()
      expect(status.pluginCount).toBe(1)
      expect(plugin.install).toHaveBeenCalled()
    })

    it('应该在未初始化时自动初始化', async () => {
      const plugin: Plugin = {
        name: 'auto-init-plugin',
        version: '1.0.0',
        install: vi.fn(),
      }

      await engine.use(plugin)
      
      const status = engine.getStatus()
      expect(status.initialized).toBe(true)
    })

    it('应该注册多个插件', async () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        version: '1.0.0',
        install: vi.fn(),
      }

      const plugin2: Plugin = {
        name: 'plugin-2',
        version: '1.0.0',
        install: vi.fn(),
      }

      await engine.use(plugin1)
      await engine.use(plugin2)

      const status = engine.getStatus()
      expect(status.pluginCount).toBe(2)
    })
  })

  describe('引擎状态', () => {
    it('应该返回正确的初始状态', () => {
      const status = engine.getStatus()
      expect(status.initialized).toBe(false)
      expect(status.destroyed).toBe(false)
      expect(status.pluginCount).toBe(0)
      expect(status.middlewareCount).toBe(0)
    })

    it('应该在初始化后更新状态', async () => {
      await engine.init()
      const status = engine.getStatus()
      expect(status.initialized).toBe(true)
      expect(status.destroyed).toBe(false)
    })

    it('应该在销毁后更新状态', async () => {
      await engine.init()
      await engine.destroy()
      const status = engine.getStatus()
      expect(status.initialized).toBe(false)
      expect(status.destroyed).toBe(true)
    })

    it('应该跟踪插件数量', async () => {
      await engine.init()
      
      const plugin: Plugin = {
        name: 'count-plugin',
        version: '1.0.0',
        install: vi.fn(),
      }

      await engine.use(plugin)
      
      const status = engine.getStatus()
      expect(status.pluginCount).toBe(1)
    })
  })

  describe('集成测试', () => {
    it('应该完整执行生命周期', async () => {
      const lifecycle: string[] = []

      engine.lifecycle.on('beforeInit', () => lifecycle.push('beforeInit'))
      engine.lifecycle.on('init', () => lifecycle.push('init'))
      engine.lifecycle.on('afterInit', () => lifecycle.push('afterInit'))
      engine.lifecycle.on('beforeDestroy', () => lifecycle.push('beforeDestroy'))
      engine.lifecycle.on('destroy', () => lifecycle.push('destroy'))
      engine.lifecycle.on('afterDestroy', () => lifecycle.push('afterDestroy'))

      await engine.init()
      await engine.destroy()

      expect(lifecycle).toEqual([
        'beforeInit',
        'init',
        'afterInit',
        'beforeDestroy',
        'destroy',
        'afterDestroy',
      ])
    })

    it('应该与插件系统集成', async () => {
      const installOrder: string[] = []

      const plugin1: Plugin = {
        name: 'plugin-1',
        version: '1.0.0',
        install: () => installOrder.push('plugin-1'),
      }

      const plugin2: Plugin = {
        name: 'plugin-2',
        version: '1.0.0',
        install: () => installOrder.push('plugin-2'),
      }

      await engine.use(plugin1)
      await engine.use(plugin2)

      expect(installOrder).toEqual(['plugin-1', 'plugin-2'])
    })

    it('应该支持事件通信', async () => {
      await engine.init()

      const handler = vi.fn()
      engine.events.on('test-event', handler)

      engine.events.emit('test-event', { data: 'test' })

      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该支持状态管理', async () => {
      await engine.init()

      engine.state.set('test-key', 'test-value')
      expect(engine.state.get('test-key')).toBe('test-value')
    })

    it('应该支持缓存管理', async () => {
      await engine.init()

      engine.cache.set('cache-key', 'cache-value')
      expect(engine.cache.get('cache-key')).toBe('cache-value')
    })
  })

  describe('错误处理', () => {
    it('应该处理初始化错误', async () => {
      const errorEngine = createCoreEngine()
      const errorHandler = vi.fn()

      errorEngine.lifecycle.on('error', errorHandler)

      // 模拟初始化过程中的错误
      vi.spyOn(errorEngine.plugins, 'init').mockRejectedValue(new Error('Init error'))

      await expect(errorEngine.init()).rejects.toThrow()
      expect(errorHandler).toHaveBeenCalled()
    })

    it('应该优雅处理管理器销毁错误', async () => {
      await engine.init()

      // 模拟销毁过程中的错误（但不应该阻止其他管理器销毁）
      vi.spyOn(engine.plugins, 'destroy').mockRejectedValue(new Error('Destroy error'))

      await engine.destroy() // 不应该抛出错误
      const status = engine.getStatus()
      expect(status.destroyed).toBe(true)
    })
  })

  describe('配置管理', () => {
    it('应该使用自定义名称', () => {
      const namedEngine = createCoreEngine({ name: 'CustomEngine' })
      expect(namedEngine).toBeDefined()
    })

    it('应该启用调试模式', () => {
      const debugEngine = createCoreEngine({ debug: true })
      expect(debugEngine).toBeDefined()
    })

    it('应该配置日志器', () => {
      const logEngine = createCoreEngine({
        logger: {
          level: 'debug',
          enabled: true,
        },
      })
      expect(logEngine.logger).toBeDefined()
    })

    it('应该配置缓存选项', () => {
      const cacheEngine = createCoreEngine({
        cache: {
          maxSize: 100,
          ttl: 5000,
        },
      })
      expect(cacheEngine.cache).toBeDefined()
    })
  })
})
