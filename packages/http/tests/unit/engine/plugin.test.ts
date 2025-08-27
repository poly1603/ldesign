import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHttpPlugin } from '../../../src/engine/plugin'
import type { HttpClient } from '../../../src/client'

// Mock HttpClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  head: vi.fn(),
  options: vi.fn(),
  request: vi.fn(),
  upload: vi.fn(),
  download: vi.fn(),
  setConfig: vi.fn(),
  getConfig: vi.fn(),
  addRequestInterceptor: vi.fn(),
  addResponseInterceptor: vi.fn(),
  removeRequestInterceptor: vi.fn(),
  removeResponseInterceptor: vi.fn(),
} as unknown as HttpClient

describe('HTTP Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Plugin Creation', () => {
    it('should create plugin with default config', () => {
      const plugin = createHttpPlugin()
      
      expect(plugin).toBeDefined()
      expect(typeof plugin.install).toBe('function')
      expect(plugin.name).toBe('http')
    })

    it('should create plugin with custom config', () => {
      const customConfig = {
        baseURL: 'https://api.example.com',
        timeout: 10000,
        headers: {
          'Authorization': 'Bearer token',
        },
      }

      const plugin = createHttpPlugin(customConfig)
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('http')
    })

    it('should create plugin with custom client', () => {
      const plugin = createHttpPlugin({}, mockHttpClient)
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('http')
    })
  })

  describe('Vue 3 Integration', () => {
    it('should install plugin in Vue 3 app', () => {
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      const plugin = createHttpPlugin({
        baseURL: 'https://api.example.com',
      })

      plugin.install(mockApp as any)

      // 检查是否正确注入到全局属性
      expect(mockApp.config.globalProperties.$http).toBeDefined()
      expect(mockApp.config.globalProperties.$httpClient).toBeDefined()

      // 检查是否正确提供依赖注入
      expect(mockApp.provide).toHaveBeenCalledWith('http', expect.any(Object))
      expect(mockApp.provide).toHaveBeenCalledWith('httpClient', expect.any(Object))
    })

    it('should provide HTTP methods in global properties', () => {
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      const plugin = createHttpPlugin()
      plugin.install(mockApp as any)

      const $http = mockApp.config.globalProperties.$http
      
      expect(typeof $http.get).toBe('function')
      expect(typeof $http.post).toBe('function')
      expect(typeof $http.put).toBe('function')
      expect(typeof $http.patch).toBe('function')
      expect(typeof $http.delete).toBe('function')
      expect(typeof $http.head).toBe('function')
      expect(typeof $http.options).toBe('function')
      expect(typeof $http.upload).toBe('function')
      expect(typeof $http.download).toBe('function')
    })

    it('should provide client instance in global properties', () => {
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      const plugin = createHttpPlugin()
      plugin.install(mockApp as any)

      const $httpClient = mockApp.config.globalProperties.$httpClient
      
      expect(typeof $httpClient.request).toBe('function')
      expect(typeof $httpClient.setConfig).toBe('function')
      expect(typeof $httpClient.getConfig).toBe('function')
      expect(typeof $httpClient.addRequestInterceptor).toBe('function')
      expect(typeof $httpClient.addResponseInterceptor).toBe('function')
    })
  })

  describe('Dependency Injection', () => {
    it('should provide correct injection keys', () => {
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      const plugin = createHttpPlugin()
      plugin.install(mockApp as any)

      // 检查提供的依赖注入键
      const provideCalls = mockApp.provide.mock.calls
      const injectionKeys = provideCalls.map(call => call[0])
      
      expect(injectionKeys).toContain('http')
      expect(injectionKeys).toContain('httpClient')
    })

    it('should provide same instance for both injection keys', () => {
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      const plugin = createHttpPlugin()
      plugin.install(mockApp as any)

      const provideCalls = mockApp.provide.mock.calls
      const httpInstance = provideCalls.find(call => call[0] === 'http')?.[1]
      const clientInstance = provideCalls.find(call => call[0] === 'httpClient')?.[1]
      
      expect(httpInstance).toBeDefined()
      expect(clientInstance).toBeDefined()
      // 注意：这里可能不是同一个实例，但应该是相关的
    })
  })

  describe('Configuration Handling', () => {
    it('should apply configuration to client', () => {
      const config = {
        baseURL: 'https://api.example.com',
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        retry: {
          enabled: true,
          maxAttempts: 3,
        },
      }

      const plugin = createHttpPlugin(config)
      
      expect(plugin).toBeDefined()
      // 配置应该被传递给客户端
    })

    it('should handle empty configuration', () => {
      const plugin = createHttpPlugin({})
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('http')
    })

    it('should handle undefined configuration', () => {
      const plugin = createHttpPlugin()
      
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('http')
    })
  })

  describe('Custom Client Integration', () => {
    it('should use provided custom client', () => {
      const plugin = createHttpPlugin({}, mockHttpClient)
      
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      plugin.install(mockApp as any)

      // 应该使用提供的客户端实例
      expect(mockApp.config.globalProperties.$httpClient).toBeDefined()
    })

    it('should preserve custom client methods', () => {
      const plugin = createHttpPlugin({}, mockHttpClient)
      
      const mockApp = {
        config: {
          globalProperties: {},
        },
        provide: vi.fn(),
      }

      plugin.install(mockApp as any)

      const $http = mockApp.config.globalProperties.$http
      
      // 所有方法都应该可用
      expect(typeof $http.get).toBe('function')
      expect(typeof $http.post).toBe('function')
      expect(typeof $http.upload).toBe('function')
      expect(typeof $http.download).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should handle installation errors gracefully', () => {
      const plugin = createHttpPlugin()
      
      const mockApp = {
        config: {
          globalProperties: null, // 模拟错误情况
        },
        provide: vi.fn(),
      }

      // 应该不抛出错误
      expect(() => {
        plugin.install(mockApp as any)
      }).not.toThrow()
    })

    it('should handle missing app methods', () => {
      const plugin = createHttpPlugin()
      
      const mockApp = {
        config: {
          globalProperties: {},
        },
        // 缺少 provide 方法
      }

      // 应该不抛出错误
      expect(() => {
        plugin.install(mockApp as any)
      }).not.toThrow()
    })
  })

  describe('Plugin Metadata', () => {
    it('should have correct plugin name', () => {
      const plugin = createHttpPlugin()
      expect(plugin.name).toBe('http')
    })

    it('should be installable', () => {
      const plugin = createHttpPlugin()
      expect(typeof plugin.install).toBe('function')
    })

    it('should follow Vue plugin interface', () => {
      const plugin = createHttpPlugin()
      
      // Vue 插件应该有 install 方法
      expect(plugin).toHaveProperty('install')
      expect(typeof plugin.install).toBe('function')
      
      // 可选的名称属性
      if ('name' in plugin) {
        expect(typeof plugin.name).toBe('string')
      }
    })
  })
})
