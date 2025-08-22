import type { ApiEngine, ApiMethod, ApiPlugin } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApiEngine } from '../src/core/api-engine'

describe('apiEngine', () => {
  let apiEngine: ApiEngine

  beforeEach(() => {
    apiEngine = createApiEngine({
      debug: false,
      cache: { enabled: false }, // 禁用缓存以简化测试
      debounce: { enabled: false }, // 禁用防抖以简化测试
      deduplication: { enabled: false }, // 禁用去重以简化测试
    })
  })

  describe('基础功能', () => {
    it('应该能够创建 API 引擎实例', () => {
      expect(apiEngine).toBeDefined()
      expect(apiEngine.config).toBeDefined()
    })

    it('应该能够注册 API 方法', () => {
      const method: ApiMethod = {
        name: 'testMethod',
        config: {
          method: 'GET',
          url: '/test',
        },
      }

      apiEngine.register('testMethod', method)

      const registeredMethod = apiEngine.getMethod('testMethod')
      expect(registeredMethod).toEqual(method)
    })

    it('应该能够批量注册 API 方法', () => {
      const methods = {
        method1: {
          name: 'method1',
          config: { method: 'GET' as const, url: '/method1' },
        },
        method2: {
          name: 'method2',
          config: { method: 'POST' as const, url: '/method2' },
        },
      }

      apiEngine.registerBatch(methods)

      expect(apiEngine.getMethod('method1')).toBeDefined()
      expect(apiEngine.getMethod('method2')).toBeDefined()
    })

    it('应该能够获取所有 API 方法', () => {
      const methods = {
        method1: {
          name: 'method1',
          config: { method: 'GET' as const, url: '/method1' },
        },
        method2: {
          name: 'method2',
          config: { method: 'POST' as const, url: '/method2' },
        },
      }

      apiEngine.registerBatch(methods)

      const allMethods = apiEngine.getAllMethods()
      expect(Object.keys(allMethods)).toHaveLength(2)
      expect(allMethods.method1).toBeDefined()
      expect(allMethods.method2).toBeDefined()
    })
  })

  describe('插件系统', () => {
    it('应该能够注册插件', async () => {
      const plugin: ApiPlugin = {
        name: 'testPlugin',
        version: '1.0.0',
        install: vi.fn(),
        apis: {
          pluginMethod: {
            name: 'pluginMethod',
            config: { method: 'GET', url: '/plugin' },
          },
        },
      }

      await apiEngine.use(plugin)

      expect(plugin.install).toHaveBeenCalledWith(apiEngine)
      expect(apiEngine.getMethod('pluginMethod')).toBeDefined()
    })

    it('应该能够处理插件依赖', async () => {
      const basePlugin: ApiPlugin = {
        name: 'basePlugin',
        install: vi.fn(),
      }

      const dependentPlugin: ApiPlugin = {
        name: 'dependentPlugin',
        dependencies: ['basePlugin'],
        install: vi.fn(),
      }

      await apiEngine.use(basePlugin)
      await apiEngine.use(dependentPlugin)

      expect(basePlugin.install).toHaveBeenCalled()
      expect(dependentPlugin.install).toHaveBeenCalled()
    })

    it('应该在依赖不满足时抛出错误', async () => {
      const dependentPlugin: ApiPlugin = {
        name: 'dependentPlugin',
        dependencies: ['nonExistentPlugin'],
        install: vi.fn(),
      }

      await expect(apiEngine.use(dependentPlugin)).rejects.toThrow()
    })
  })

  describe('aPI 调用', () => {
    it('应该在调用不存在的方法时抛出错误', async () => {
      await expect(apiEngine.call('nonExistentMethod')).rejects.toThrow(
        'API method "nonExistentMethod" not found',
      )
    })

    it('应该能够处理数据转换', async () => {
      // Mock HTTP 客户端
      const mockHttpClient = {
        request: vi.fn().mockResolvedValue({
          data: { code: 200, data: 'raw data', message: 'success' },
        }),
      }

      // 替换内部的 HTTP 客户端（这里需要访问私有属性，实际测试中可能需要不同的方法）
      ;(apiEngine as any).httpClient = mockHttpClient

      const method: ApiMethod = {
        name: 'transformMethod',
        config: { method: 'GET', url: '/transform' },
        transform: data => data.data, // 提取 data 字段
      }

      apiEngine.register('transformMethod', method)

      const result = await apiEngine.call('transformMethod')
      expect(result).toBe('raw data')
    })

    it('应该能够处理数据验证', async () => {
      const mockHttpClient = {
        request: vi.fn().mockResolvedValue({
          data: { invalid: true },
        }),
      }

      ;(apiEngine as any).httpClient = mockHttpClient

      const method: ApiMethod = {
        name: 'validateMethod',
        config: { method: 'GET', url: '/validate' },
        validate: data => data.valid === true, // 验证 valid 字段
      }

      apiEngine.register('validateMethod', method)

      await expect(apiEngine.call('validateMethod')).rejects.toThrow(
        'API method "validateMethod" response validation failed',
      )
    })

    it('应该能够处理错误回调', async () => {
      const mockHttpClient = {
        request: vi.fn().mockRejectedValue(new Error('Network error')),
      }

      ;(apiEngine as any).httpClient = mockHttpClient

      const onError = vi.fn()
      const method: ApiMethod = {
        name: 'errorMethod',
        config: { method: 'GET', url: '/error' },
        onError,
      }

      apiEngine.register('errorMethod', method)

      await expect(apiEngine.call('errorMethod')).rejects.toThrow(
        'Network error',
      )
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('生命周期', () => {
    it('应该能够销毁引擎', () => {
      apiEngine.destroy()

      expect(() =>
        apiEngine.register('test', {
          name: 'test',
          config: { method: 'GET', url: '/test' },
        }),
      ).toThrow('API Engine has been destroyed')
    })

    it('销毁后不应该能够调用 API', async () => {
      apiEngine.destroy()

      await expect(apiEngine.call('test')).rejects.toThrow(
        'API Engine has been destroyed',
      )
    })
  })

  describe('配置', () => {
    it('应该使用默认配置', () => {
      const engine = createApiEngine()

      expect(engine.config.debug).toBe(false)
      expect(engine.config.cache?.enabled).toBe(true)
      expect(engine.config.debounce?.enabled).toBe(true)
      expect(engine.config.deduplication?.enabled).toBe(true)
    })

    it('应该能够覆盖默认配置', () => {
      const engine = createApiEngine({
        debug: true,
        cache: { enabled: false },
      })

      expect(engine.config.debug).toBe(true)
      expect(engine.config.cache?.enabled).toBe(false)
    })
  })
})
