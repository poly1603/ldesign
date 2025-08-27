import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withRetry } from '../../../src/features/retry'
import type { RequestConfig, ResponseData, HttpError } from '../../../src/types'

describe('Retry Feature', () => {
  let mockNext: ReturnType<typeof vi.fn>
  let mockConfig: RequestConfig
  let mockResponse: ResponseData
  let mockError: HttpError

  beforeEach(() => {
    mockNext = vi.fn()
    mockConfig = {
      url: '/api/test',
      method: 'GET',
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

  describe('Basic Retry', () => {
    it('should not retry on successful request', async () => {
      mockNext.mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
      })
      
      const result = await retryFeature(mockConfig, mockNext)
      
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse)
    })

    it('should retry on failed request', async () => {
      mockNext
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
        delay: 10, // 短延迟以加快测试
      })
      
      const result = await retryFeature(mockConfig, mockNext)
      
      expect(mockNext).toHaveBeenCalledTimes(3) // 1 次原始 + 2 次重试
      expect(result).toEqual(mockResponse)
    })

    it('should fail after max attempts', async () => {
      mockNext.mockRejectedValue(mockError)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 2,
        delay: 10,
      })
      
      await expect(retryFeature(mockConfig, mockNext)).rejects.toEqual(mockError)
      expect(mockNext).toHaveBeenCalledTimes(2) // 1 次原始 + 1 次重试
    })
  })

  describe('Retry Conditions', () => {
    it('should only retry retryable errors by default', async () => {
      const networkError: HttpError = {
        name: 'NetworkError',
        message: 'Network failed',
        config: mockConfig,
        isNetworkError: true,
      }
      
      const clientError: HttpError = {
        name: 'HttpError',
        message: 'Bad request',
        config: mockConfig,
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { error: 'Invalid input' },
          headers: {},
          config: mockConfig,
        },
      }
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
        delay: 10,
      })
      
      // 网络错误应该重试
      mockNext.mockRejectedValueOnce(networkError).mockResolvedValueOnce(mockResponse)
      const result1 = await retryFeature(mockConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)
      expect(result1).toEqual(mockResponse)
      
      // 重置 mock
      mockNext.mockClear()
      
      // 客户端错误不应该重试
      mockNext.mockRejectedValue(clientError)
      await expect(retryFeature(mockConfig, mockNext)).rejects.toEqual(clientError)
      expect(mockNext).toHaveBeenCalledTimes(1) // 只调用一次，不重试
    })

    it('should use custom retry condition', async () => {
      const customCondition = vi.fn((error: HttpError) => {
        return error.response?.status === 503 // 只重试 503 错误
      })
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
        delay: 10,
        condition: customCondition,
      })
      
      const serviceError: HttpError = {
        ...mockError,
        response: {
          ...mockError.response!,
          status: 503,
          statusText: 'Service Unavailable',
        },
      }
      
      mockNext.mockRejectedValueOnce(serviceError).mockResolvedValueOnce(mockResponse)
      
      const result = await retryFeature(mockConfig, mockNext)
      
      expect(customCondition).toHaveBeenCalledWith(serviceError)
      expect(mockNext).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Retry Delays', () => {
    it('should use fixed delay', async () => {
      mockNext.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 2,
        delay: 100,
      })
      
      const startTime = Date.now()
      await retryFeature(mockConfig, mockNext)
      const endTime = Date.now()
      
      // 应该至少等待了延迟时间
      expect(endTime - startTime).toBeGreaterThanOrEqual(90) // 允许一些误差
    })

    it('should use exponential backoff', async () => {
      mockNext
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
        delay: 50,
        backoff: 'exponential',
      })
      
      const startTime = Date.now()
      await retryFeature(mockConfig, mockNext)
      const endTime = Date.now()
      
      // 指数退避：50ms + 100ms = 150ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(140)
    })

    it('should use linear backoff', async () => {
      mockNext
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
        delay: 50,
        backoff: 'linear',
      })
      
      const startTime = Date.now()
      await retryFeature(mockConfig, mockNext)
      const endTime = Date.now()
      
      // 线性退避：50ms + 100ms = 150ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(140)
    })

    it('should use custom delay function', async () => {
      const customDelay = vi.fn((attempt: number) => attempt * 30)
      
      mockNext.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 2,
        delayFn: customDelay,
      })
      
      await retryFeature(mockConfig, mockNext)
      
      expect(customDelay).toHaveBeenCalledWith(1) // 第一次重试
    })
  })

  describe('Request-level Configuration', () => {
    it('should respect request-level retry disable', async () => {
      mockNext.mockRejectedValue(mockError)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
      })
      
      const noRetryConfig = {
        ...mockConfig,
        retry: { enabled: false },
      }
      
      await expect(retryFeature(noRetryConfig, mockNext)).rejects.toEqual(mockError)
      expect(mockNext).toHaveBeenCalledTimes(1) // 不重试
    })

    it('should respect request-level max attempts override', async () => {
      mockNext.mockRejectedValue(mockError)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 5, // 默认 5 次
        delay: 10,
      })
      
      const customRetryConfig = {
        ...mockConfig,
        retry: { maxAttempts: 2 }, // 覆盖为 2 次
      }
      
      await expect(retryFeature(customRetryConfig, mockNext)).rejects.toEqual(mockError)
      expect(mockNext).toHaveBeenCalledTimes(2) // 只重试 2 次
    })
  })

  describe('Disabled Retry', () => {
    it('should not retry when disabled', async () => {
      mockNext.mockRejectedValue(mockError)
      
      const retryFeature = withRetry({
        enabled: false,
      })
      
      await expect(retryFeature(mockConfig, mockNext)).rejects.toEqual(mockError)
      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero max attempts', async () => {
      mockNext.mockRejectedValue(mockError)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 0,
      })
      
      await expect(retryFeature(mockConfig, mockNext)).rejects.toEqual(mockError)
      expect(mockNext).toHaveBeenCalledTimes(1) // 只调用一次，不重试
    })

    it('should handle negative max attempts', async () => {
      mockNext.mockRejectedValue(mockError)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: -1,
      })
      
      await expect(retryFeature(mockConfig, mockNext)).rejects.toEqual(mockError)
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should handle zero delay', async () => {
      mockNext.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockResponse)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 2,
        delay: 0,
      })
      
      const startTime = Date.now()
      await retryFeature(mockConfig, mockNext)
      const endTime = Date.now()
      
      // 零延迟应该立即重试
      expect(endTime - startTime).toBeLessThan(50)
      expect(mockNext).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Propagation', () => {
    it('should propagate the last error after all retries fail', async () => {
      const error1 = { ...mockError, message: 'Error 1' }
      const error2 = { ...mockError, message: 'Error 2' }
      const error3 = { ...mockError, message: 'Error 3' }
      
      mockNext
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockRejectedValueOnce(error3)
      
      const retryFeature = withRetry({
        enabled: true,
        maxAttempts: 3,
        delay: 10,
      })
      
      await expect(retryFeature(mockConfig, mockNext)).rejects.toEqual(error3)
    })
  })
})
