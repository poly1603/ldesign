import type { HttpAdapter } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpClientImpl } from '@/client'
import { createMockError, createMockResponse } from '../setup'

// 创建模拟适配器
function createMockAdapter(): HttpAdapter {
  return {
    name: 'mock',
    isSupported: () => true,
    request: vi.fn(),
  }
}

describe('httpClientImpl', () => {
  let client: HttpClientImpl
  let mockAdapter: HttpAdapter

  beforeEach(() => {
    mockAdapter = createMockAdapter()
    client = new HttpClientImpl({}, mockAdapter)
  })

  describe('constructor', () => {
    it('should create client with default config', () => {
      expect(client).toBeInstanceOf(HttpClientImpl)
      expect(client.getConfig()).toEqual(
        expect.objectContaining({
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )
    })

    it('should merge custom config with defaults', () => {
      const customConfig = {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: {
          Authorization: 'Bearer token',
        },
      }

      const customClient = new HttpClientImpl(customConfig, mockAdapter)
      const config = customClient.getConfig()

      expect(config.baseURL).toBe('https://api.example.com')
      expect(config.timeout).toBe(5000)
      expect(config.headers).toEqual({
        Authorization: 'Bearer token',
      })
    })

    it('should throw error if no adapter provided', () => {
      expect(() => new HttpClientImpl()).toThrow('HTTP adapter is required')
    })
  })

  describe('request methods', () => {
    beforeEach(() => {
      vi.mocked(mockAdapter.request).mockResolvedValue(
        createMockResponse({ success: true }),
      )
    })

    it('should make GET request', async () => {
      await client.get('/users')

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/users',
        }),
      )
    })

    it('should make POST request with data', async () => {
      const data = { name: 'John', email: 'john@example.com' }
      await client.post('/users', data)

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          data,
        }),
      )
    })

    it('should make PUT request', async () => {
      const data = { name: 'John Updated' }
      await client.put('/users/1', data)

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/users/1',
          data,
        }),
      )
    })

    it('should make DELETE request', async () => {
      await client.delete('/users/1')

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/users/1',
        }),
      )
    })

    it('should make PATCH request', async () => {
      const data = { name: 'John Patched' }
      await client.patch('/users/1', data)

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/users/1',
          data,
        }),
      )
    })

    it('should make HEAD request', async () => {
      await client.head('/users/1')

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'HEAD',
          url: '/users/1',
        }),
      )
    })

    it('should make OPTIONS request', async () => {
      await client.options('/users')

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'OPTIONS',
          url: '/users',
        }),
      )
    })
  })

  describe('interceptors', () => {
    it('should execute request interceptors', async () => {
      const requestInterceptor = vi.fn((config) => {
        config.headers = { ...config.headers, 'X-Custom': 'test' }
        return config
      })

      client.interceptors.request.use(requestInterceptor)

      vi.mocked(mockAdapter.request).mockResolvedValue(
        createMockResponse({ success: true }),
      )

      await client.get('/test')

      expect(requestInterceptor).toHaveBeenCalled()
      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'test',
          }),
        }),
      )
    })

    it('should execute response interceptors', async () => {
      const responseInterceptor = vi.fn((response) => {
        response.data = { ...response.data, intercepted: true }
        return response
      })

      client.interceptors.response.use(responseInterceptor)

      vi.mocked(mockAdapter.request).mockResolvedValue(
        createMockResponse({ success: true }),
      )

      const response = await client.get('/test')

      expect(responseInterceptor).toHaveBeenCalled()
      expect(response.data).toEqual({
        success: true,
        intercepted: true,
      })
    })

    it('should execute error interceptors', async () => {
      const errorInterceptor = vi.fn((error) => {
        error.message = `Intercepted: ${error.message}`
        return error
      })

      client.interceptors.error.use(errorInterceptor)

      const mockError = createMockError('Original error')
      vi.mocked(mockAdapter.request).mockRejectedValue(mockError)

      await expect(client.get('/test')).rejects.toThrow(
        'Intercepted: Original error',
      )
      expect(errorInterceptor).toHaveBeenCalled()
    })
  })

  describe('config merging', () => {
    it('should merge global and request configs', async () => {
      const globalConfig = {
        baseURL: 'https://api.example.com',
        headers: {
          Authorization: 'Bearer token',
        },
      }

      const clientWithConfig = new HttpClientImpl(globalConfig, mockAdapter)

      vi.mocked(mockAdapter.request).mockResolvedValue(
        createMockResponse({ success: true }),
      )

      await clientWithConfig.get('/users', {
        headers: {
          'X-Custom': 'test',
        },
      })

      expect(mockAdapter.request).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
          headers: {
            'Authorization': 'Bearer token',
            'X-Custom': 'test',
          },
          method: 'GET',
          timeout: 10000,
          url: '/users',
        }),
      )
    })
  })

  describe('utility methods', () => {
    it('should cancel all requests', () => {
      // 测试方法存在且可调用
      expect(() => client.cancelAll('Test cancellation')).not.toThrow()
    })

    it('should clear cache', async () => {
      await client.clearCache()
      // 缓存清理的具体逻辑在 CacheManager 中测试
    })

    it('should get active request count', () => {
      const count = client.getActiveRequestCount()
      expect(typeof count).toBe('number')
    })

    it('should get concurrency status', () => {
      const status = client.getConcurrencyStatus()
      expect(status).toHaveProperty('activeCount')
      expect(status).toHaveProperty('queuedCount')
      expect(status).toHaveProperty('maxConcurrent')
      expect(status).toHaveProperty('maxQueueSize')
    })
  })
})
