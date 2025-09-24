import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RetryManager } from '../../src/utils/retry-manager'

describe('RetryManager', () => {
  let retryManager: RetryManager

  beforeEach(() => {
    retryManager = new RetryManager()
  })

  describe('基础功能', () => {
    it('应该能够创建重试管理器实例', () => {
      expect(retryManager).toBeInstanceOf(RetryManager)
    })

    it('应该能够执行成功的操作', async () => {
      const successFn = vi.fn().mockResolvedValue('success')
      
      const result = await retryManager.retry(successFn)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(1)
      expect(successFn).toHaveBeenCalledTimes(1)
    })

    it('应该能够重试失败的操作', async () => {
      const failThenSuccessFn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')
      
      const result = await retryManager.retry(failThenSuccessFn)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(3)
      expect(failThenSuccessFn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后失败', async () => {
      const alwaysFailFn = vi.fn().mockRejectedValue(new Error('Always fail'))
      
      const result = await retryManager.retry(alwaysFailFn, { maxAttempts: 3 })
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Always fail')
      expect(result.attempts).toBe(3)
      expect(alwaysFailFn).toHaveBeenCalledTimes(3)
    })

    it('应该支持自定义重试配置', async () => {
      const alwaysFailFn = vi.fn().mockRejectedValue(new Error('Custom fail'))
      
      const result = await retryManager.retry(alwaysFailFn, { maxAttempts: 5 })
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Custom fail')
      expect(result.attempts).toBe(5)
      expect(alwaysFailFn).toHaveBeenCalledTimes(5)
    })
  })

  describe('重试策略', () => {
    it('应该支持指数退避策略', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'))
      
      const result = await retryManager.retry(failFn, {
        maxAttempts: 3,
        strategy: 'exponential',
        initialDelay: 10,
        factor: 2,
        jitter: false, // 禁用抖动以便测试
      })
      
      expect(result.success).toBe(false)
      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('应该支持线性退避策略', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'))
      
      const result = await retryManager.retry(failFn, {
        maxAttempts: 3,
        strategy: 'linear',
        initialDelay: 10,
        jitter: false,
      })
      
      expect(result.success).toBe(false)
      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('应该支持固定延迟策略', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'))
      
      const result = await retryManager.retry(failFn, {
        maxAttempts: 3,
        strategy: 'fixed',
        initialDelay: 10,
        jitter: false,
      })
      
      expect(result.success).toBe(false)
      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('应该支持斐波那契退避策略', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'))
      
      const result = await retryManager.retry(failFn, {
        maxAttempts: 3,
        strategy: 'fibonacci',
        initialDelay: 10,
        jitter: false,
      })
      
      expect(result.success).toBe(false)
      expect(failFn).toHaveBeenCalledTimes(3)
    })

    it('应该限制最大延迟时间', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'))
      
      const result = await retryManager.retry(failFn, {
        maxAttempts: 5,
        strategy: 'exponential',
        initialDelay: 100,
        maxDelay: 200,
        factor: 3,
        jitter: false,
      })
      
      expect(result.success).toBe(false)
      expect(failFn).toHaveBeenCalledTimes(5)
    })
  })

  describe('重试条件', () => {
    it('应该支持自定义重试条件', async () => {
      // 可重试的错误
      const retryableFailFn = vi.fn().mockRejectedValue(new Error('retryable error'))
      const retryableResult = await retryManager.retry(retryableFailFn, {
        maxAttempts: 3,
        shouldRetry: (error) => error.message.includes('retryable'),
      })
      
      expect(retryableResult.success).toBe(false)
      expect(retryableFailFn).toHaveBeenCalledTimes(3)
      
      // 不可重试的错误
      const nonRetryableFailFn = vi.fn().mockRejectedValue(new Error('fatal error'))
      const nonRetryableResult = await retryManager.retry(nonRetryableFailFn, {
        maxAttempts: 3,
        shouldRetry: (error) => error.message.includes('retryable'),
      })
      
      expect(nonRetryableResult.success).toBe(false)
      expect(nonRetryableFailFn).toHaveBeenCalledTimes(1)
    })

    it('应该支持基于错误类型的重试', async () => {
      class RetryableError extends Error {}
      class FatalError extends Error {}
      
      // 可重试的错误类型
      const retryableFailFn = vi.fn().mockRejectedValue(new RetryableError('Retryable'))
      const retryableResult = await retryManager.retry(retryableFailFn, {
        maxAttempts: 3,
        shouldRetry: (error) => error instanceof RetryableError,
      })
      
      expect(retryableResult.success).toBe(false)
      expect(retryableFailFn).toHaveBeenCalledTimes(3)
      
      // 不可重试的错误类型
      const fatalFailFn = vi.fn().mockRejectedValue(new FatalError('Fatal'))
      const fatalResult = await retryManager.retry(fatalFailFn, {
        maxAttempts: 3,
        shouldRetry: (error) => error instanceof RetryableError,
      })
      
      expect(fatalResult.success).toBe(false)
      expect(fatalFailFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('回调和监控', () => {
    it('应该调用重试回调', async () => {
      const onRetry = vi.fn()
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'))
      
      await retryManager.retry(failFn, {
        maxAttempts: 3,
        onRetry,
      })
      
      expect(onRetry).toHaveBeenCalledTimes(2) // 3次尝试 = 2次重试
    })

    it('应该提供重试统计信息', async () => {
      const failThenSuccessFn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success')
      
      const result = await retryManager.retry(failThenSuccessFn)
      
      expect(result.attempts).toBe(3)
      expect(result.totalDuration).toBeGreaterThan(0)
      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
    })
  })

  describe('错误处理', () => {
    it('应该处理同步错误', async () => {
      const syncErrorFn = vi.fn().mockImplementation(() => {
        throw new Error('Sync error')
      })
      
      const result = await retryManager.retry(syncErrorFn, { maxAttempts: 3 })
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Sync error')
      expect(syncErrorFn).toHaveBeenCalledTimes(3)
    })

    it('应该处理非Error类型的异常', async () => {
      const stringErrorFn = vi.fn().mockRejectedValue('String error')
      
      const result = await retryManager.retry(stringErrorFn, { maxAttempts: 3 })
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('String error')
      expect(stringErrorFn).toHaveBeenCalledTimes(3)
    })

    it('应该处理超时', async () => {
      vi.useFakeTimers()

      const slowFn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return 'success'
      })

      const resultPromise = retryManager.retry(slowFn, {
        maxAttempts: 1,
        timeout: 100,
      })

      // 快进时间
      vi.advanceTimersByTime(300)

      const result = await resultPromise

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('timeout')

      vi.useRealTimers()
    })
  })

  describe('性能测试', () => {
    it('应该能够处理并发重试操作', async () => {
      const operations = Array.from({ length: 5 }, (_, i) => 
        vi.fn().mockResolvedValue(`result-${i}`)
      )
      
      const promises = operations.map((op, i) => 
        retryManager.retry(op)
      )
      
      const results = await Promise.all(promises)
      
      results.forEach((result, i) => {
        expect(result.success).toBe(true)
        expect(result.data).toBe(`result-${i}`)
      })
      
      operations.forEach(op => {
        expect(op).toHaveBeenCalledTimes(1)
      })
    })
  })
})
