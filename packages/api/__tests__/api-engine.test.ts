/**
 * API 引擎测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { systemApiPlugin } from '../src/plugins/systemApi'
import type { ApiEngine, ApiPlugin, ApiMethodConfig } from '../src/types'

describe('ApiEngine', () => {
  let apiEngine: ApiEngine

  beforeEach(() => {
    apiEngine = createApiEngine({
      debug: false,
      http: {
        baseURL: 'https://api.test.com',
        timeout: 5000,
      },
      cache: {
        enabled: true,
        ttl: 60000,
        maxSize: 10,
        storage: 'memory',
      },
      debounce: {
        enabled: true,
        delay: 100,
      },
      deduplication: {
        enabled: true,
      },
    })
  })

  afterEach(() => {
    apiEngine.destroy()
  })

  describe('基础功能', () => {
    it('应该正确创建 API 引擎实例', () => {
      expect(apiEngine).toBeDefined()
      expect(apiEngine.config).toBeDefined()
      expect(apiEngine.httpClient).toBeDefined()
      expect(apiEngine.plugins).toBeDefined()
      expect(apiEngine.methods).toBeDefined()
    })

    it('应该有正确的配置', () => {
      expect(apiEngine.config.http?.baseURL).toBe('https://api.test.com')
      expect(apiEngine.config.http?.timeout).toBe(5000)
      expect(apiEngine.config.cache?.enabled).toBe(true)
      expect(apiEngine.config.debounce?.enabled).toBe(true)
      expect(apiEngine.config.deduplication?.enabled).toBe(true)
    })
  })

  describe('插件系统', () => {
    it('应该能够注册插件', async () => {
      const testPlugin: ApiPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        apis: {
          testMethod: {
            name: 'testMethod',
            config: { method: 'GET', url: '/test' },
          },
        },
        install: vi.fn(),
      }

      await apiEngine.use(testPlugin)

      expect(apiEngine.plugins.has('test-plugin')).toBe(true)
      expect(apiEngine.hasMethod('testMethod')).toBe(true)
      expect(testPlugin.install).toHaveBeenCalledWith(apiEngine)
    })

    it('应该能够卸载插件', async () => {
      const testPlugin: ApiPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        apis: {
          testMethod: {
            name: 'testMethod',
            config: { method: 'GET', url: '/test' },
          },
        },
        uninstall: vi.fn(),
      }

      await apiEngine.use(testPlugin)
      expect(apiEngine.plugins.has('test-plugin')).toBe(true)

      await apiEngine.unuse('test-plugin')
      expect(apiEngine.plugins.has('test-plugin')).toBe(false)
      expect(apiEngine.hasMethod('testMethod')).toBe(false)
      expect(testPlugin.uninstall).toHaveBeenCalledWith(apiEngine)
    })

    it('应该检查插件依赖', async () => {
      const dependentPlugin: ApiPlugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        dependencies: ['non-existent-plugin'],
        apis: {},
      }

      await expect(apiEngine.use(dependentPlugin)).rejects.toThrow(
        'Plugin "dependent-plugin" depends on "non-existent-plugin", but it\'s not registered'
      )
    })
  })

  describe('方法注册', () => {
    it('应该能够注册单个方法', () => {
      const methodConfig: ApiMethodConfig = {
        name: 'testMethod',
        config: { method: 'GET', url: '/test' },
      }

      apiEngine.register('testMethod', methodConfig)

      expect(apiEngine.hasMethod('testMethod')).toBe(true)
      expect(apiEngine.methods.get('testMethod')).toBe(methodConfig)
    })

    it('应该能够批量注册方法', () => {
      const methods = {
        method1: {
          name: 'method1',
          config: { method: 'GET', url: '/method1' },
        },
        method2: {
          name: 'method2',
          config: { method: 'POST', url: '/method2' },
        },
      }

      apiEngine.registerBatch(methods)

      expect(apiEngine.hasMethod('method1')).toBe(true)
      expect(apiEngine.hasMethod('method2')).toBe(true)
    })

    it('应该能够取消注册方法', () => {
      const methodConfig: ApiMethodConfig = {
        name: 'testMethod',
        config: { method: 'GET', url: '/test' },
      }

      apiEngine.register('testMethod', methodConfig)
      expect(apiEngine.hasMethod('testMethod')).toBe(true)

      apiEngine.unregister('testMethod')
      expect(apiEngine.hasMethod('testMethod')).toBe(false)
    })
  })

  describe('API 调用', () => {
    beforeEach(() => {
      // Mock HTTP 客户端
      vi.spyOn(apiEngine.httpClient, 'request').mockResolvedValue({
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })
    })

    it('应该能够调用已注册的方法', async () => {
      apiEngine.register('testMethod', {
        name: 'testMethod',
        config: { method: 'GET', url: '/test' },
      })

      const result = await apiEngine.call('testMethod')
      expect(result).toEqual({ message: 'success' })
    })

    it('应该在调用不存在的方法时抛出错误', async () => {
      await expect(apiEngine.call('nonExistentMethod')).rejects.toThrow(
        'Method "nonExistentMethod" not found'
      )
    })

    it('应该支持参数化配置', async () => {
      apiEngine.register('parameterizedMethod', {
        name: 'parameterizedMethod',
        config: params => ({
          method: 'POST',
          url: '/test',
          data: params,
        }),
      })

      const params = { name: 'test' }
      await apiEngine.call('parameterizedMethod', params)

      expect(apiEngine.httpClient.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data: params,
      })
    })

    it('应该支持数据转换', async () => {
      apiEngine.register('transformMethod', {
        name: 'transformMethod',
        config: { method: 'GET', url: '/test' },
        transform: response => response.data.message.toUpperCase(),
      })

      const result = await apiEngine.call('transformMethod')
      expect(result).toBe('SUCCESS')
    })

    it('应该支持批量调用', async () => {
      apiEngine.register('method1', {
        name: 'method1',
        config: { method: 'GET', url: '/method1' },
      })
      apiEngine.register('method2', {
        name: 'method2',
        config: { method: 'GET', url: '/method2' },
      })

      const results = await apiEngine.callBatch([
        { methodName: 'method1' },
        { methodName: 'method2' },
      ])

      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({ message: 'success' })
      expect(results[1]).toEqual({ message: 'success' })
    })
  })

  describe('系统 API 插件', () => {
    it('应该能够注册系统 API 插件', async () => {
      await apiEngine.use(systemApiPlugin)

      expect(apiEngine.plugins.has('system-apis')).toBe(true)
      expect(apiEngine.hasMethod('login')).toBe(true)
      expect(apiEngine.hasMethod('getUserInfo')).toBe(true)
      expect(apiEngine.hasMethod('getMenus')).toBe(true)
    })
  })

  describe('销毁功能', () => {
    it('应该能够正确销毁引擎', async () => {
      const testPlugin: ApiPlugin = {
        name: 'test-plugin',
        apis: {
          testMethod: {
            name: 'testMethod',
            config: { method: 'GET', url: '/test' },
          },
        },
      }

      await apiEngine.use(testPlugin)
      apiEngine.register('testMethod', {
        name: 'testMethod',
        config: { method: 'GET', url: '/test' },
      })

      expect(apiEngine.plugins.size).toBeGreaterThan(0)
      expect(apiEngine.methods.size).toBeGreaterThan(0)

      apiEngine.destroy()

      expect(apiEngine.plugins.size).toBe(0)
      expect(apiEngine.methods.size).toBe(0)
    })

    it('应该在销毁后拒绝操作', () => {
      apiEngine.destroy()

      expect(() =>
        apiEngine.register('test', {
          name: 'test',
          config: { method: 'GET', url: '/test' },
        })
      ).toThrow('API Engine has been destroyed')

      expect(apiEngine.use(systemApiPlugin)).rejects.toThrow(
        'API Engine has been destroyed'
      )
    })
  })
})
