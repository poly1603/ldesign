import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosAdapter } from '../../../src/adapters/axios'
import type { RequestConfig } from '../../../src/types'

// Mock axios
const mockAxios = {
  request: vi.fn(),
  defaults: {
    timeout: 5000,
    headers: {},
  },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: mockAxios,
}))

describe('AxiosAdapter', () => {
  let adapter: AxiosAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new AxiosAdapter(mockAxios)
  })

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('axios')
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

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      const result = await adapter.request(config)

      expect(mockAxios.request).toHaveBeenCalledWith({
        url: '/api/test',
        method: 'GET',
      })

      expect(result).toEqual({
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { url: '/api/test' },
      })
    })

    it('should make successful POST request with data', async () => {
      const mockResponse = {
        data: { id: 1, name: 'test' },
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        config: { url: '/api/users', method: 'POST' },
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'test' },
        headers: { 'Content-Type': 'application/json' },
      }

      const result = await adapter.request(config)

      expect(mockAxios.request).toHaveBeenCalledWith({
        url: '/api/users',
        method: 'POST',
        data: { name: 'test' },
        headers: { 'Content-Type': 'application/json' },
      })

      expect(result.status).toBe(201)
      expect(result.data).toEqual({ id: 1, name: 'test' })
    })

    it('should handle request with all config options', async () => {
      const mockResponse = {
        data: 'response data',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'PUT',
        headers: { 'Authorization': 'Bearer token' },
        params: { page: 1, size: 10 },
        data: { update: 'data' },
        timeout: 10000,
        baseURL: 'https://api.example.com',
        responseType: 'json',
        withCredentials: true,
      }

      await adapter.request(config)

      expect(mockAxios.request).toHaveBeenCalledWith({
        url: '/api/test',
        method: 'PUT',
        headers: { 'Authorization': 'Bearer token' },
        params: { page: 1, size: 10 },
        data: { update: 'data' },
        timeout: 10000,
        baseURL: 'https://api.example.com',
        responseType: 'json',
        withCredentials: true,
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      networkError.code = 'NETWORK_ERROR'
      mockAxios.request.mockRejectedValueOnce(networkError)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toThrow('Network Error')
    })

    it('should handle HTTP errors with response', async () => {
      const httpError = {
        response: {
          data: { error: 'Not Found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
        },
        config: { url: '/api/test' },
        message: 'Request failed with status code 404',
      }

      mockAxios.request.mockRejectedValueOnce(httpError)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toMatchObject({
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          data: { error: 'Not Found' },
        },
      })
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      mockAxios.request.mockRejectedValueOnce(timeoutError)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        timeout: 5000,
      }

      await expect(adapter.request(config)).rejects.toThrow('timeout of 5000ms exceeded')
    })

    it('should handle request cancellation', async () => {
      const cancelError = new Error('Request canceled')
      cancelError.name = 'CanceledError'
      mockAxios.request.mockRejectedValueOnce(cancelError)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toThrow('Request canceled')
    })
  })

  describe('Response Types', () => {
    it('should handle JSON response', async () => {
      const mockResponse = {
        data: { key: 'value' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/json',
        method: 'GET',
        responseType: 'json',
      }

      const result = await adapter.request(config)
      expect(result.data).toEqual({ key: 'value' })
    })

    it('should handle text response', async () => {
      const mockResponse = {
        data: 'plain text response',
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/plain' },
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/text',
        method: 'GET',
        responseType: 'text',
      }

      const result = await adapter.request(config)
      expect(result.data).toBe('plain text response')
    })

    it('should handle blob response', async () => {
      const mockBlob = new Blob(['file content'], { type: 'application/octet-stream' })
      const mockResponse = {
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/octet-stream' },
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/file',
        method: 'GET',
        responseType: 'blob',
      }

      const result = await adapter.request(config)
      expect(result.data).toBe(mockBlob)
    })
  })

  describe('Special Cases', () => {
    it('should handle empty response', async () => {
      const mockResponse = {
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/empty',
        method: 'DELETE',
      }

      const result = await adapter.request(config)
      expect(result.status).toBe(204)
      expect(result.data).toBeNull()
    })

    it('should handle request with AbortSignal', async () => {
      const controller = new AbortController()
      const mockResponse = {
        data: 'success',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/test',
        method: 'GET',
        signal: controller.signal,
      }

      const result = await adapter.request(config)
      expect(result.data).toBe('success')
    })

    it('should handle FormData', async () => {
      const formData = new FormData()
      formData.append('file', new File(['content'], 'test.txt'))
      formData.append('name', 'test')

      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }

      mockAxios.request.mockResolvedValueOnce(mockResponse)

      const config: RequestConfig = {
        url: '/api/upload',
        method: 'POST',
        data: formData,
      }

      await adapter.request(config)

      expect(mockAxios.request).toHaveBeenCalledWith({
        url: '/api/upload',
        method: 'POST',
        data: formData,
      })
    })
  })
})
