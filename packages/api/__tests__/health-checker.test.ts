import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHealthChecker, HealthChecker } from '../src/utils/HealthChecker'

describe('healthChecker', () => {
  let healthChecker: HealthChecker

  beforeEach(() => {
    healthChecker = createHealthChecker({
      enabled: false, // Disable auto-checking in tests
      interval: 1000,
      timeoutThreshold: 5000,
      errorRateThreshold: 0.1,
      memoryThreshold: 100 * 1024 * 1024,
    })
  })

  it('should create health checker with default config', () => {
    const defaultChecker = createHealthChecker()
    expect(defaultChecker).toBeInstanceOf(HealthChecker)
    defaultChecker.destroy()
  })

  it('should record request metrics', () => {
    healthChecker.requestStart()
    healthChecker.requestSuccess(100)

    const metrics = healthChecker.getMetrics()
    expect(metrics.totalRequests).toBe(1)
    expect(metrics.successfulRequests).toBe(1)
    expect(metrics.failedRequests).toBe(0)
    expect(metrics.activeRequests).toBe(0)
  })

  it('should record failed requests', () => {
    healthChecker.requestStart()
    healthChecker.requestFailure(200)

    const metrics = healthChecker.getMetrics()
    expect(metrics.failedRequests).toBe(1)
    expect(metrics.successfulRequests).toBe(0)
  })

  it('should record cache metrics', () => {
    healthChecker.cacheHit()
    healthChecker.cacheHit()
    healthChecker.cacheMiss()

    const metrics = healthChecker.getMetrics()
    expect(metrics.cacheHits).toBe(2)
    expect(metrics.cacheMisses).toBe(1)
  })

  it('should check health status as healthy', () => {
    // Add some successful requests
    healthChecker.requestStart()
    healthChecker.requestSuccess(1000)
    healthChecker.requestStart()
    healthChecker.requestSuccess(2000)

    const status = healthChecker.check()

    expect(status.status).toBe('healthy')
    expect(status.issues).toHaveLength(0)
    expect(status.details.avgResponseTime).toBeLessThan(5000)
    expect(status.details.errorRate).toBe(0)
  })

  it('should detect high response time', () => {
    // Add slow requests
    healthChecker.requestStart()
    healthChecker.requestSuccess(6000)

    const status = healthChecker.check()

    expect(status.issues.length).toBeGreaterThan(0)
    const responseTimeIssue = status.issues.find(i => i.metric === 'avgResponseTime')
    expect(responseTimeIssue).toBeDefined()
    expect(responseTimeIssue?.severity).toBe('warning')
  })

  it('should detect high error rate', () => {
    // Add mostly failed requests
    for (let i = 0; i < 10; i++) {
      healthChecker.requestStart()
      if (i < 5) {
        healthChecker.requestFailure(100)
      }
      else {
        healthChecker.requestSuccess(100)
      }
    }

    const status = healthChecker.check()

    const errorRateIssue = status.issues.find(i => i.metric === 'errorRate')
    expect(errorRateIssue).toBeDefined()
    expect(errorRateIssue?.value).toBeGreaterThan(0.1)
  })

  it('should generate health report', () => {
    healthChecker.requestStart()
    healthChecker.requestSuccess(100)

    const report = healthChecker.generateReport()

    expect(report).toHaveProperty('summary')
    expect(report).toHaveProperty('status')
    expect(report).toHaveProperty('recommendations')
    expect(Array.isArray(report.recommendations)).toBe(true)
  })

  it('should notify status change listeners', () => {
    const listener = vi.fn()
    healthChecker.onStatusChange(listener)

    healthChecker.check()

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.any(String),
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should allow removing listeners', () => {
    const listener = vi.fn()
    const unsubscribe = healthChecker.onStatusChange(listener)

    healthChecker.check()
    expect(listener).toHaveBeenCalledOnce()

    listener.mockClear()
    unsubscribe()

    healthChecker.check()
    expect(listener).not.toHaveBeenCalled()
  })

  it('should reset metrics', () => {
    healthChecker.requestStart()
    healthChecker.requestSuccess(100)

    healthChecker.resetMetrics()

    const metrics = healthChecker.getMetrics()
    expect(metrics.totalRequests).toBe(0)
    expect(metrics.successfulRequests).toBe(0)
    expect(metrics.failedRequests).toBe(0)
  })

  it('should update config dynamically', () => {
    healthChecker.updateConfig({
      timeoutThreshold: 3000,
      errorRateThreshold: 0.05,
    })

    // Trigger a check with updated thresholds
    healthChecker.requestStart()
    healthChecker.requestSuccess(4000)

    const status = healthChecker.check()
    const issue = status.issues.find(i => i.metric === 'avgResponseTime')

    expect(issue).toBeDefined()
    expect(issue?.threshold).toBe(3000)
  })

  it('should start and stop health check', () => {
    const autoChecker = createHealthChecker({
      enabled: true,
      interval: 100,
    })

    expect(autoChecker).toBeInstanceOf(HealthChecker)

    autoChecker.stopHealthCheck()
    autoChecker.destroy()
  })

  it('should destroy cleanly', () => {
    const listener = vi.fn()
    healthChecker.onStatusChange(listener)

    healthChecker.requestStart()
    healthChecker.requestSuccess(100)

    healthChecker.destroy()

    const metrics = healthChecker.getMetrics()
    expect(metrics.totalRequests).toBe(0)
  })

  it('should calculate cache hit rate correctly', () => {
    healthChecker.cacheHit()
    healthChecker.cacheHit()
    healthChecker.cacheHit()
    healthChecker.cacheMiss()

    const status = healthChecker.check()

    expect(status.details.cacheHitRate).toBe(0.75) // 3/4
  })

  it('should track active requests', () => {
    healthChecker.requestStart()
    healthChecker.requestStart()
    healthChecker.requestStart()

    expect(healthChecker.getMetrics().activeRequests).toBe(3)

    healthChecker.requestSuccess(100)

    expect(healthChecker.getMetrics().activeRequests).toBe(2)
  })
})
