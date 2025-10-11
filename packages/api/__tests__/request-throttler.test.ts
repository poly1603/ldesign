import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRequestThrottler, RequestThrottler } from '../src/utils/RequestThrottler'

describe('requestThrottler', () => {
  let throttler: RequestThrottler

  beforeEach(() => {
    throttler = createRequestThrottler({
      requestsPerSecond: 10,
      maxBurst: 20,
      refillRate: 100,
    })
  })

  it('should create throttler with default config', () => {
    const defaultThrottler = createRequestThrottler()
    expect(defaultThrottler).toBeInstanceOf(RequestThrottler)
  })

  it('should allow immediate requests when tokens available', async () => {
    const start = Date.now()
    await throttler.acquire()
    const duration = Date.now() - start

    expect(duration).toBeLessThan(50) // Should be immediate
  })

  it('should execute function with throttling', async () => {
    const mockFn = vi.fn().mockResolvedValue('result')

    const result = await throttler.execute(mockFn)

    expect(result).toBe('result')
    expect(mockFn).toHaveBeenCalledOnce()
  })

  it('should return correct stats', async () => {
    await throttler.acquire()
    await throttler.acquire()

    const stats = throttler.getStats()

    expect(stats.totalRequests).toBe(2)
    expect(stats.currentTokens).toBeLessThan(20)
    expect(stats.throttledRequests).toBe(0)
    expect(stats.pendingRequests).toBe(0)
  })

  it('should queue requests when no tokens available', async () => {
    // Exhaust all tokens
    const promises: Promise<void>[] = []
    for (let i = 0; i < 21; i++) {
      promises.push(throttler.acquire())
    }

    // This request should be queued
    const queuedPromise = throttler.acquire()

    const stats = throttler.getStats()
    expect(stats.pendingRequests).toBeGreaterThan(0)

    await Promise.all([...promises, queuedPromise])
  })

  it('should update config dynamically', () => {
    throttler.updateConfig({
      requestsPerSecond: 20,
      maxBurst: 50,
    })

    const stats = throttler.getStats()
    expect(stats.maxTokens).toBe(50)
  })

  it('should reset throttler state', async () => {
    await throttler.acquire()
    await throttler.acquire()

    throttler.reset()

    const stats = throttler.getStats()
    expect(stats.totalRequests).toBe(0)
    expect(stats.throttledRequests).toBe(0)
    expect(stats.currentTokens).toBe(20) // Back to maxBurst
  })

  it('should clear stale requests', async () => {
    // Exhaust tokens to create pending requests
    const promises: Promise<void>[] = []
    for (let i = 0; i < 25; i++) {
      promises.push(throttler.acquire().catch(() => {}))
    }

    // Clear stale requests with very short timeout
    await new Promise(resolve => setTimeout(resolve, 100))
    throttler.clearStaleRequests(50)

    const stats = throttler.getStats()
    expect(stats.pendingRequests).toBeLessThan(5)
  })

  it('should destroy throttler cleanly', async () => {
    // Exhaust all tokens first to create a pending request
    for (let i = 0; i < 20; i++) {
      throttler.acquire()
    }

    // This will be queued
    const promise = throttler.acquire()
    
    // Give it a moment to be queued
    await new Promise(resolve => setTimeout(resolve, 50))
    
    throttler.destroy()

    // All pending requests should be rejected
    await expect(promise).rejects.toThrow('Throttler destroyed')
  })

  it('should not throttle when disabled', async () => {
    const disabledThrottler = createRequestThrottler({
      enabled: false,
    })

    const start = Date.now()

    // Should all execute immediately
    await Promise.all([
      disabledThrottler.acquire(),
      disabledThrottler.acquire(),
      disabledThrottler.acquire(),
    ])

    const duration = Date.now() - start
    expect(duration).toBeLessThan(100) // All immediate
  })
})
