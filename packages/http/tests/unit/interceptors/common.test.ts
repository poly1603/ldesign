import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  authInterceptor,
  loggingInterceptor,
  errorHandlingInterceptor,
  timeoutInterceptor,
  retryInterceptor,
  cacheInterceptor,
} from '../../../src/interceptors/common'
import type { RequestConfig, ResponseData, HttpError } from '../../../src/types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock console
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}
global.console = consoleMock as any

describe('Common Interceptors', () => {
  let mockConfig: RequestConfig
  let mockResponse: ResponseData
  let mockError: HttpError

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfig = {
      url: '/api/test',
      method: 'GET',
      headers: {},
    }
    mockResponse = {
      data: { message: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: mockConfig,
    }
    mockError = {
      name: 'HttpError',
      message: 'Request failed',
      config: mockConfig,
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        data: { error: 'Server error' },
        headers: {},
        config: mockConfig,
      },
    }
  })

  describe('Auth Interceptor', () => {
    it('should add authorization header from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const interceptor = authInterceptor()
      const result = interceptor.request!(mockConfig)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken')
      expect(result.headers).toEqual({
        Authorization: 'Bearer test-token',
      })
    })

    it('should not add header if no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const interceptor = authInterceptor()
      const result = interceptor.request!(mockConfig)
      
      expect(result.headers).toEqual({})
    })

    it('should use custom token key', () => {
      localStorageMock.getItem.mockReturnValue('custom-token')
      
      const interceptor = authInterceptor({
        tokenKey: 'customToken',
      })
      interceptor.request!(mockConfig)
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('customToken')
    })

    it('should use custom header name', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const interceptor = authInterceptor({
        headerName: 'X-Auth-Token',
      })
      const result = interceptor.request!(mockConfig)
      
      expect(result.headers).toEqual({
        'X-Auth-Token': 'Bearer test-token',
      })
    })

    it('should use custom token prefix', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const interceptor = authInterceptor({
        tokenPrefix: 'Token',
      })
      const result = interceptor.request!(mockConfig)
      
      expect(result.headers).toEqual({
        Authorization: 'Token test-token',
      })
    })

    it('should handle 401 response by clearing token', () => {
      const authError: HttpError = {
        ...mockError,
        response: {
          ...mockError.response!,
          status: 401,
          statusText: 'Unauthorized',
        },
      }
      
      const interceptor = authInterceptor()
      interceptor.responseError!(authError)
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
    })
  })

  describe('Logging Interceptor', () => {
    it('should log request', () => {
      const interceptor = loggingInterceptor()
      interceptor.request!(mockConfig)
      
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('Request:'),
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
        })
      )
    })

    it('should log successful response', () => {
      const interceptor = loggingInterceptor()
      interceptor.response!(mockResponse)
      
      expect(consoleMock.log).toHaveBeenCalledWith(
        expect.stringContaining('Response:'),
        expect.objectContaining({
          status: 200,
          data: { message: 'success' },
        })
      )
    })

    it('should log error response', () => {
      const interceptor = loggingInterceptor()
      interceptor.responseError!(mockError)
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Error:'),
        expect.objectContaining({
          message: 'Request failed',
        })
      )
    })

    it('should respect log level configuration', () => {
      const interceptor = loggingInterceptor({
        level: 'error',
      })
      
      // 请求和响应不应该被记录
      interceptor.request!(mockConfig)
      interceptor.response!(mockResponse)
      
      expect(consoleMock.log).not.toHaveBeenCalled()
      
      // 错误应该被记录
      interceptor.responseError!(mockError)
      expect(consoleMock.error).toHaveBeenCalled()
    })

    it('should use custom logger', () => {
      const customLogger = {
        log: vi.fn(),
        error: vi.fn(),
      }
      
      const interceptor = loggingInterceptor({
        logger: customLogger,
      })
      
      interceptor.request!(mockConfig)
      interceptor.responseError!(mockError)
      
      expect(customLogger.log).toHaveBeenCalled()
      expect(customLogger.error).toHaveBeenCalled()
    })
  })

  describe('Error Handling Interceptor', () => {
    it('should handle network errors', () => {
      const networkError: HttpError = {
        ...mockError,
        isNetworkError: true,
      }
      
      const interceptor = errorHandlingInterceptor()
      const result = interceptor.responseError!(networkError)
      
      expect(result).toEqual(expect.objectContaining({
        userMessage: '网络连接失败，请检查网络设置',
      }))
    })

    it('should handle timeout errors', () => {
      const timeoutError: HttpError = {
        ...mockError,
        isTimeoutError: true,
      }
      
      const interceptor = errorHandlingInterceptor()
      const result = interceptor.responseError!(timeoutError)
      
      expect(result).toEqual(expect.objectContaining({
        userMessage: '请求超时，请重试',
      }))
    })

    it('should handle HTTP status errors', () => {
      const interceptor = errorHandlingInterceptor()
      const result = interceptor.responseError!(mockError)
      
      expect(result).toEqual(expect.objectContaining({
        userMessage: '服务器内部错误',
      }))
    })

    it('should use custom error handler', () => {
      const customHandler = vi.fn((error: HttpError) => ({
        ...error,
        customHandled: true,
      }))
      
      const interceptor = errorHandlingInterceptor({
        customHandler,
      })
      
      interceptor.responseError!(mockError)
      expect(customHandler).toHaveBeenCalledWith(mockError)
    })
  })

  describe('Timeout Interceptor', () => {
    it('should add timeout to request', () => {
      const interceptor = timeoutInterceptor({
        timeout: 5000,
      })
      
      const result = interceptor.request!(mockConfig)
      expect(result.timeout).toBe(5000)
    })

    it('should not override existing timeout', () => {
      const configWithTimeout = {
        ...mockConfig,
        timeout: 10000,
      }
      
      const interceptor = timeoutInterceptor({
        timeout: 5000,
      })
      
      const result = interceptor.request!(configWithTimeout)
      expect(result.timeout).toBe(10000) // 保持原有超时
    })

    it('should handle timeout errors', () => {
      const timeoutError: HttpError = {
        ...mockError,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      }
      
      const interceptor = timeoutInterceptor()
      const result = interceptor.responseError!(timeoutError)
      
      expect(result).toEqual(expect.objectContaining({
        isTimeoutError: true,
      }))
    })
  })

  describe('Retry Interceptor', () => {
    it('should add retry configuration to request', () => {
      const interceptor = retryInterceptor({
        maxAttempts: 3,
        delay: 1000,
      })
      
      const result = interceptor.request!(mockConfig)
      expect(result.retry).toEqual({
        maxAttempts: 3,
        delay: 1000,
      })
    })

    it('should not override existing retry config', () => {
      const configWithRetry = {
        ...mockConfig,
        retry: {
          maxAttempts: 5,
          delay: 2000,
        },
      }
      
      const interceptor = retryInterceptor({
        maxAttempts: 3,
        delay: 1000,
      })
      
      const result = interceptor.request!(configWithRetry)
      expect(result.retry).toEqual({
        maxAttempts: 5,
        delay: 2000,
      })
    })
  })

  describe('Cache Interceptor', () => {
    it('should add cache configuration to request', () => {
      const interceptor = cacheInterceptor({
        enabled: true,
        ttl: 300000,
      })
      
      const result = interceptor.request!(mockConfig)
      expect(result.cache).toEqual({
        enabled: true,
        ttl: 300000,
      })
    })

    it('should not override existing cache config', () => {
      const configWithCache = {
        ...mockConfig,
        cache: {
          enabled: false,
          ttl: 60000,
        },
      }
      
      const interceptor = cacheInterceptor({
        enabled: true,
        ttl: 300000,
      })
      
      const result = interceptor.request!(configWithCache)
      expect(result.cache).toEqual({
        enabled: false,
        ttl: 60000,
      })
    })

    it('should only cache GET requests by default', () => {
      const interceptor = cacheInterceptor({
        enabled: true,
      })
      
      // GET 请求应该被缓存
      const getResult = interceptor.request!({ ...mockConfig, method: 'GET' })
      expect(getResult.cache?.enabled).toBe(true)
      
      // POST 请求不应该被缓存
      const postResult = interceptor.request!({ ...mockConfig, method: 'POST' })
      expect(postResult.cache?.enabled).toBe(false)
    })

    it('should respect custom cacheable methods', () => {
      const interceptor = cacheInterceptor({
        enabled: true,
        methods: ['GET', 'POST'],
      })
      
      // POST 请求现在应该被缓存
      const postResult = interceptor.request!({ ...mockConfig, method: 'POST' })
      expect(postResult.cache?.enabled).toBe(true)
    })
  })
})
