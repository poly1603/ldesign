import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AlovaAdapter } from '../../../src/adapters/alova'
import type { RequestConfig } from '../../../src/types'

// Mock alova
const mockAlova = {
  Get: vi.fn(),
  Post: vi.fn(),
  Put: vi.fn(),
  Delete: vi.fn(),
  Patch: vi.fn(),
  Head: vi.fn(),
  Options: vi.fn(),
}

const mockAlovaInstance = {
  Get: mockAlova.Get,
  Post: mockAlova.Post,
  Put: mockAlova.Put,
  Delete: mockAlova.Delete,
  Patch: mockAlova.Patch,
  Head: mockAlova.Head,
  Options: mockAlova.Options,
}

const mockMethod = {
  send: vi.fn(),
  abort: vi.fn(),
  onSuccess: vi.fn(),
  onError: vi.fn(),
  onComplete: vi.fn(),
}

vi.mock('alova', () => ({
  createAlova: vi.fn(() => mockAlovaInstance),
  GlobalFetch: vi.fn(),
}))

describe('AlovaAdapter', () => {
  let adapter: AlovaAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new AlovaAdapter(mockAlovaInstance)

    // 设置默认的 mock 返回值
    Object.values(mockAlova).forEach(method => {
      method.mockReturnValue(mockMethod)
    })
  })

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('alova')
    })

    it('should check if supported', () => {
      expect(adapter.isSupported()).toBe(true)
    })
  })

  describe('Request Handling', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { url: '/api/test' },
      }

      mockMethod.send.mockResolvedValueOnce(mockResponse.data)
      mockAlova.Get.mockReturnValue({
        ...mockMethod,
        config: { url: '/api/test' },
        response: mockResponse,
      })

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      const result = await adapter.request(config)

      expect(mockAlova.Get).toHaveBeenCalledWith('/api/test', expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
      expect(result.data).toEqual({ message: 'success' })
    })

    it('should make successful POST request with data', async () => {
      const requestData = { name: 'test' }
      const responseData = { id: 1, name: 'test' }

      mockMethod.send.mockResolvedValueOnce(responseData)
      mockAlova.Post.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: requestData,
        headers: { 'Content-Type': 'application/json' },
      }

      const result = await adapter.request(config)

      expect(mockAlova.Post).toHaveBeenCalledWith('/api/users', requestData, expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
      expect(result.data).toEqual(responseData)
    })

    it('should handle PUT request', async () => {
      const requestData = { name: 'updated' }
      const responseData = { id: 1, name: 'updated' }

      mockMethod.send.mockResolvedValueOnce(responseData)
      mockAlova.Put.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/users/1',
        method: 'PUT',
        data: requestData,
      }

      await adapter.request(config)

      expect(mockAlova.Put).toHaveBeenCalledWith('/api/users/1', requestData, expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
    })

    it('should handle DELETE request', async () => {
      mockMethod.send.mockResolvedValueOnce(null)
      mockAlova.Delete.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/users/1',
        method: 'DELETE',
      }

      const result = await adapter.request(config)

      expect(mockAlova.Delete).toHaveBeenCalledWith('/api/users/1', expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
      expect(result.data).toBeNull()
    })

    it('should handle PATCH request', async () => {
      const requestData = { name: 'patched' }
      const responseData = { id: 1, name: 'patched' }

      mockMethod.send.mockResolvedValueOnce(responseData)
      mockAlova.Patch.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/users/1',
        method: 'PATCH',
        data: requestData,
      }

      await adapter.request(config)

      expect(mockAlova.Patch).toHaveBeenCalledWith('/api/users/1', requestData, expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
    })

    it('should handle HEAD request', async () => {
      mockMethod.send.mockResolvedValueOnce(null)
      mockAlova.Head.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'HEAD',
      }

      await adapter.request(config)

      expect(mockAlova.Head).toHaveBeenCalledWith('/api/test', expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
    })

    it('should handle OPTIONS request', async () => {
      const responseData = { methods: ['GET', 'POST'] }

      mockMethod.send.mockResolvedValueOnce(responseData)
      mockAlova.Options.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'OPTIONS',
      }

      await adapter.request(config)

      expect(mockAlova.Options).toHaveBeenCalledWith('/api/test', expect.any(Object))
      expect(mockMethod.send).toHaveBeenCalled()
    })
  })

  describe('Configuration Handling', () => {
    it('should handle request with headers', async () => {
      mockMethod.send.mockResolvedValueOnce({ data: 'test' })
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json',
        },
      }

      await adapter.request(config)

      expect(mockAlova.Get).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        headers: {
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json',
        },
      }))
    })

    it('should handle request with params', async () => {
      mockMethod.send.mockResolvedValueOnce({ data: 'test' })
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        params: {
          page: 1,
          size: 10,
          filter: 'active',
        },
      }

      await adapter.request(config)

      expect(mockAlova.Get).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        params: {
          page: 1,
          size: 10,
          filter: 'active',
        },
      }))
    })

    it('should handle request with timeout', async () => {
      mockMethod.send.mockResolvedValueOnce({ data: 'test' })
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        timeout: 10000,
      }

      await adapter.request(config)

      expect(mockAlova.Get).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        timeout: 10000,
      }))
    })

    it('should handle request with baseURL', async () => {
      mockMethod.send.mockResolvedValueOnce({ data: 'test' })
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        baseURL: 'https://api.example.com',
      }

      await adapter.request(config)

      // baseURL 应该被合并到 URL 中
      expect(mockAlova.Get).toHaveBeenCalledWith('https://api.example.com/api/test', expect.any(Object))
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockMethod.send.mockRejectedValueOnce(networkError)
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toThrow('Network Error')
    })

    it('should handle HTTP errors', async () => {
      const httpError = {
        name: 'HttpError',
        message: 'Request failed with status code 404',
        status: 404,
        response: {
          data: { error: 'Not Found' },
          status: 404,
          statusText: 'Not Found',
        },
      }

      mockMethod.send.mockRejectedValueOnce(httpError)
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toMatchObject({
        message: 'Request failed with status code 404',
        status: 404,
      })
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      mockMethod.send.mockRejectedValueOnce(timeoutError)
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        timeout: 5000,
      }

      await expect(adapter.request(config)).rejects.toThrow('Request timeout')
    })

    it('should handle request cancellation', async () => {
      const cancelError = new Error('Request canceled')
      cancelError.name = 'AbortError'
      mockMethod.send.mockRejectedValueOnce(cancelError)
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toThrow('Request canceled')
    })
  })

  describe('Special Cases', () => {
    it('should handle unsupported method', async () => {
      const config: RequestConfig = {
        url: '/api/test',
        method: 'TRACE' as any, // 不支持的方法
      }

      await expect(adapter.request(config)).rejects.toThrow('Unsupported HTTP method: TRACE')
    })

    it('should handle FormData', async () => {
      const formData = new FormData()
      formData.append('file', new File(['content'], 'test.txt'))

      mockMethod.send.mockResolvedValueOnce({ success: true })
      mockAlova.Post.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/upload',
        method: 'POST',
        data: formData,
      }

      await adapter.request(config)

      expect(mockAlova.Post).toHaveBeenCalledWith('/api/upload', formData, expect.any(Object))
    })

    it('should handle AbortSignal', async () => {
      const controller = new AbortController()
      mockMethod.send.mockResolvedValueOnce({ data: 'test' })
      mockAlova.Get.mockReturnValue(mockMethod)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        signal: controller.signal,
      }

      await adapter.request(config)

      expect(mockAlova.Get).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        signal: controller.signal,
      }))
    })
  })
})
