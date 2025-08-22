import type { RequestConfig } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FetchAdapter } from '@/adapters/fetch'

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock AbortController
globalThis.AbortController = vi.fn().mockImplementation(() => ({
  signal: {
    aborted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  abort: vi.fn(),
})) as any

describe('fetchAdapter', () => {
  let adapter: FetchAdapter

  beforeEach(() => {
    adapter = new FetchAdapter()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('isSupported', () => {
    it('should return true when fetch and AbortController are available', () => {
      expect(adapter.isSupported()).toBe(true)
    })
  })

  describe('request', () => {
    it('should make a successful GET request', async () => {
      const mockResponseData = { id: 1, name: 'Test' }
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        body: 'mock-body', // 添加body属性
        json: vi.fn().mockResolvedValue(mockResponseData),
        text: vi.fn().mockResolvedValue(JSON.stringify(mockResponseData)),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const config: RequestConfig = {
        url: 'https://api.example.com/users/1',
        method: 'GET',
      }

      const response = await adapter.request(config)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        {
          method: 'GET',
          headers: {},
          credentials: 'same-origin',
          signal: undefined,
        },
      )

      expect(response).toEqual({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: expect.any(Object),
        config: expect.objectContaining({
          url: 'https://api.example.com/users/1',
          method: 'GET',
          headers: {},
        }),
        raw: mockResponse,
      })
    })

    it('should make a successful POST request with JSON data', async () => {
      const requestData = { name: 'New User', email: 'user@example.com' }
      const mockResponseData = { id: 2, ...requestData }
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Map([['content-type', 'application/json']]),
        body: 'mock-body', // 添加body属性
        json: vi.fn().mockResolvedValue(mockResponseData),
        text: vi.fn().mockResolvedValue(JSON.stringify(mockResponseData)),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const config: RequestConfig = {
        url: 'https://api.example.com/users',
        method: 'POST',
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const response = await adapter.request(config)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'same-origin',
          signal: undefined,
        },
      )

      expect(response.data).toEqual(mockResponseData)
      expect(response.status).toBe(201)
    })

    it('should handle FormData correctly', async () => {
      const formData = new FormData()
      formData.append('name', 'Test File')
      formData.append('file', new Blob(['test content']))

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: vi.fn().mockResolvedValue({ success: true }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const config: RequestConfig = {
        url: 'https://api.example.com/upload',
        method: 'POST',
        data: formData,
      }

      await adapter.request(config)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData,
          // FormData 不应该设置 Content-Type
          headers: expect.not.objectContaining({
            'Content-Type': expect.any(String),
          }),
        }),
      )
    })

    it('should handle query parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: vi.fn().mockResolvedValue([]),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const config: RequestConfig = {
        url: 'https://api.example.com/users',
        method: 'GET',
        params: {
          page: 1,
          limit: 10,
          search: 'john',
        },
      }

      await adapter.request(config)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&search=john',
        expect.any(Object),
      )
    })

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        json: vi.fn().mockResolvedValue({ error: 'User not found' }),
      }

      mockFetch.mockResolvedValue(mockResponse)

      const config: RequestConfig = {
        url: 'https://api.example.com/users/999',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'))

      const config: RequestConfig = {
        url: 'https://api.example.com/users',
        method: 'GET',
      }

      await expect(adapter.request(config)).rejects.toThrow('Network Error')
    })

    it('should handle timeout', async () => {
      // 模拟超时
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('timeout')), 100)
          }),
      )

      const config: RequestConfig = {
        url: 'https://api.example.com/users',
        method: 'GET',
        timeout: 50,
      }

      await expect(adapter.request(config)).rejects.toThrow()
    })
  })
})
