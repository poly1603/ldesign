import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ErrorHandler,
  ErrorType,
  ErrorAnalyzer,
  builtinRecoveryStrategies,
} from '../../../src/utils/error'
import type { HttpError, ErrorRecoveryStrategy } from '../../../src/types'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

describe('Enhanced Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ErrorHandler.resetStats()
    // 清理所有恢复策略
    const strategies = ErrorHandler.getRecoveryStrategies()
    strategies.forEach(strategy => {
      ErrorHandler.removeRecoveryStrategy(strategy.name)
    })
  })

  afterEach(() => {
    ErrorHandler.resetStats()
    // 清理所有恢复策略
    const strategies = ErrorHandler.getRecoveryStrategies()
    strategies.forEach(strategy => {
      ErrorHandler.removeRecoveryStrategy(strategy.name)
    })
  })

  describe('ErrorHandler Statistics', () => {
    it('should record error statistics correctly', () => {
      const networkError: HttpError = {
        name: 'NetworkError',
        message: 'Network failed',
        isNetworkError: true,
      }

      const httpError: HttpError = {
        name: 'HttpError',
        message: 'HTTP 404',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: null,
          headers: {},
          config: { url: '/api/test' },
        },
      }

      // 记录错误
      ErrorHandler.recordError(networkError)
      ErrorHandler.recordError(httpError)
      ErrorHandler.recordError(httpError) // 重复的HTTP错误

      const stats = ErrorHandler.getStats()

      expect(stats.total).toBe(3)
      expect(stats.byType[ErrorType.NETWORK]).toBe(1)
      expect(stats.byType[ErrorType.HTTP]).toBe(2)
      expect(stats.byStatus[404]).toBe(2)
      expect(stats.recent).toHaveLength(3)
      expect(stats.mostCommon).toEqual({
        type: ErrorType.HTTP,
        count: 2,
      })
    })

    it('should maintain recent errors list with limit', () => {
      // 创建15个错误（超过10个限制）
      for (let i = 0; i < 15; i++) {
        const error: HttpError = {
          name: 'TestError',
          message: `Error ${i}`,
          isNetworkError: true,
        }
        ErrorHandler.recordError(error)
      }

      const stats = ErrorHandler.getStats()
      expect(stats.recent).toHaveLength(10) // 应该限制在10个
      expect(stats.total).toBe(15) // 但总数应该是15
    })

    it('should calculate error rate correctly', () => {
      // 记录一些错误
      for (let i = 0; i < 5; i++) {
        const error: HttpError = {
          name: 'TestError',
          message: `Error ${i}`,
          isNetworkError: true,
        }
        ErrorHandler.recordError(error)
      }

      const stats = ErrorHandler.getStats()
      expect(stats.errorRate).toBe(5)
    })

    it('should reset statistics correctly', () => {
      const error: HttpError = {
        name: 'TestError',
        message: 'Test error',
        isNetworkError: true,
      }

      ErrorHandler.recordError(error)
      let stats = ErrorHandler.getStats()
      expect(stats.total).toBe(1)

      ErrorHandler.resetStats()
      stats = ErrorHandler.getStats()
      expect(stats.total).toBe(0)
      expect(stats.recent).toHaveLength(0)
    })
  })

  describe('Error Recovery Strategies', () => {
    it('should add and remove recovery strategies', () => {
      const testStrategy: ErrorRecoveryStrategy = {
        name: 'test-strategy',
        priority: 10,
        canHandle: () => true,
        recover: async () => true,
      }

      ErrorHandler.addRecoveryStrategy(testStrategy)
      let strategies = ErrorHandler.getRecoveryStrategies()
      expect(strategies).toHaveLength(1)
      expect(strategies[0].name).toBe('test-strategy')

      const removed = ErrorHandler.removeRecoveryStrategy('test-strategy')
      expect(removed).toBe(true)

      strategies = ErrorHandler.getRecoveryStrategies()
      expect(strategies).toHaveLength(0)
    })

    it('should try recovery strategies in priority order', async () => {
      const lowPriorityStrategy: ErrorRecoveryStrategy = {
        name: 'low-priority',
        priority: 1,
        canHandle: () => true,
        recover: vi.fn().mockResolvedValue(false),
      }

      const highPriorityStrategy: ErrorRecoveryStrategy = {
        name: 'high-priority',
        priority: 10,
        canHandle: () => true,
        recover: vi.fn().mockResolvedValue(true),
      }

      ErrorHandler.addRecoveryStrategy(lowPriorityStrategy)
      ErrorHandler.addRecoveryStrategy(highPriorityStrategy)

      const error: HttpError = {
        name: 'TestError',
        message: 'Test error',
        isNetworkError: true,
      }

      const recovered = await ErrorHandler.tryRecover(error)

      expect(recovered).toBe(true)
      expect(highPriorityStrategy.recover).toHaveBeenCalled()
      expect(lowPriorityStrategy.recover).not.toHaveBeenCalled()
    })

    it('should handle recovery strategy failures gracefully', async () => {
      const failingStrategy: ErrorRecoveryStrategy = {
        name: 'failing-strategy',
        priority: 10, // 高优先级，先执行
        canHandle: () => true,
        recover: vi.fn().mockRejectedValue(new Error('Recovery failed')),
      }

      const workingStrategy: ErrorRecoveryStrategy = {
        name: 'working-strategy',
        priority: 5, // 低优先级，后执行
        canHandle: () => true,
        recover: vi.fn().mockResolvedValue(true),
      }

      ErrorHandler.addRecoveryStrategy(failingStrategy)
      ErrorHandler.addRecoveryStrategy(workingStrategy)

      const error: HttpError = {
        name: 'TestError',
        message: 'Test error',
        isNetworkError: true,
      }

      const recovered = await ErrorHandler.tryRecover(error)

      expect(recovered).toBe(true)
      expect(failingStrategy.recover).toHaveBeenCalled() // 先执行但失败
      expect(workingStrategy.recover).toHaveBeenCalled() // 后执行并成功
    })
  })

  describe('Built-in Recovery Strategies', () => {
    it('should handle network reconnect strategy', async () => {
      const strategy = builtinRecoveryStrategies.networkReconnect

      const networkError: HttpError = {
        name: 'NetworkError',
        message: 'Network failed',
        isNetworkError: true,
      }

      expect(strategy.canHandle(networkError)).toBe(true)

      // Mock successful ping
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response)

      const recovered = await strategy.recover(networkError)
      expect(recovered).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/ping', expect.any(Object))
    })

    it('should handle auth refresh strategy', async () => {
      const strategy = builtinRecoveryStrategies.authRefresh

      const authError: HttpError = {
        name: 'AuthError',
        message: 'Unauthorized',
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: null,
          headers: {},
          config: { url: '/api/protected' },
        },
      }

      expect(strategy.canHandle(authError)).toBe(true)

      // Mock refresh token exists
      localStorageMock.getItem.mockReturnValue('refresh-token-123')

      // Mock successful token refresh
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      } as Response)

      const recovered = await strategy.recover(authError)
      expect(recovered).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token')
    })

    it('should handle service fallback strategy', async () => {
      const strategy = builtinRecoveryStrategies.serviceFallback

      const serviceError: HttpError = {
        name: 'ServiceError',
        message: 'Service unavailable',
        response: {
          status: 503,
          statusText: 'Service Unavailable',
          data: null,
          headers: {},
          config: { url: '/api/data' },
        },
        config: { url: '/api/data' },
      }

      expect(strategy.canHandle(serviceError)).toBe(true)

      // Mock successful fallback service
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response)

      const recovered = await strategy.recover(serviceError)
      expect(recovered).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/api-fallback/data', expect.any(Object))
    })

    it('should handle cache fallback strategy', async () => {
      const strategy = builtinRecoveryStrategies.cacheFailback

      const getError: HttpError = {
        name: 'GetError',
        message: 'Request failed',
        config: { method: 'GET', url: '/api/data' },
      }

      expect(strategy.canHandle(getError)).toBe(true)

      // Mock cached data
      const cachedData = {
        data: { test: 'data' },
        timestamp: Date.now() - 1000, // 1 second ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData))

      const recovered = await strategy.recover(getError)
      expect(recovered).toBe(true)
    })
  })

  describe('ErrorAnalyzer', () => {
    it('should analyze error patterns correctly', () => {
      const errors: HttpError[] = [
        { name: 'NetworkError', message: 'Network failed', isNetworkError: true },
        { name: 'NetworkError', message: 'Network failed', isNetworkError: true },
        { name: 'TimeoutError', message: 'Timeout', isTimeoutError: true },
        {
          name: 'AuthError',
          message: 'Unauthorized',
          response: { status: 401, statusText: 'Unauthorized', data: null, headers: {}, config: {} },
        },
        {
          name: 'ServerError',
          message: 'Internal error',
          response: { status: 500, statusText: 'Internal Error', data: null, headers: {}, config: {} },
        },
      ]

      const analysis = ErrorAnalyzer.analyzeErrorPatterns(errors)

      expect(analysis.patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'network_errors',
            count: 2,
            percentage: 40,
          }),
          expect.objectContaining({
            type: 'timeout_errors',
            count: 1,
            percentage: 20,
          }),
          expect.objectContaining({
            type: 'auth_errors',
            count: 1,
            percentage: 20,
          }),
          expect.objectContaining({
            type: 'server_errors',
            count: 1,
            percentage: 20,
          }),
        ])
      )

      expect(analysis.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('网络重连机制'),
        ])
      )
    })

    it('should generate appropriate recommendations', () => {
      // 创建大量网络错误
      const errors: HttpError[] = Array(10).fill(null).map(() => ({
        name: 'NetworkError',
        message: 'Network failed',
        isNetworkError: true,
      }))

      const analysis = ErrorAnalyzer.analyzeErrorPatterns(errors)

      expect(analysis.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('网络重连机制'),
        ])
      )
    })
  })
})
