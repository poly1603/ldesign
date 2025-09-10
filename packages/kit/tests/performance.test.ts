/**
 * Performance 模块测试
 */


import { vi } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PerformanceMonitor, PerformanceUtils } from '../src/performance'

// Mock performance hooks
vi.mock('node:perf_hooks', () => ({
  performance: {
    now: vi.fn(),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  PerformanceObserver: vi.fn(),
}))

// Mock process
vi.mock('node:process', () => ({
  memoryUsage: vi.fn(),
  cpuUsage: vi.fn(),
}))

describe('performanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      maxMetrics: 100,
      enableMemory: true,
      enableCPU: true,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    monitor.stopMonitoring()
  })

  describe('计时器功�?, () => {
    it('应该能够开始和结束计时', async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount === 1 ? 1000 : 1100 // 100ms 差异
      })

      monitor.startTimer('test-timer')
      const duration = monitor.endTimer('test-timer')

      expect(duration).toBe(100)
      expect(performance.mark).toHaveBeenCalledWith('test-timer-start')
      expect(performance.mark).toHaveBeenCalledWith('test-timer-end')
      expect(performance.measure).toHaveBeenCalledWith(
        'test-timer',
        'test-timer-start',
        'test-timer-end',
      )
    })

    it('应该在计时器不存在时抛出错误', () => {
      expect(() => monitor.endTimer('non-existent')).toThrow('Timer "non-existent" not found')
    })

    it('应该能够测量函数执行时间', async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount === 1 ? 1000 : 1050 // 50ms 差异
      })

      const testFunction = vi.fn().mockReturnValue('result')
      const result = await monitor.measureFunction('test-func', testFunction)

      expect(result.result).toBe('result')
      expect(result.duration).toBe(50)
      expect(testFunction).toHaveBeenCalled()
    })

    it('应该能够测量异步函数执行时间', async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount === 1 ? 1000 : 1075 // 75ms 差异
      })

      const asyncFunction = vi.fn().mockResolvedValue('async-result')
      const result = await monitor.measureFunction('async-func', asyncFunction)

      expect(result.result).toBe('async-result')
      expect(result.duration).toBe(75)
    })

    it('应该在函数抛出错误时仍然结束计时', async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount * 1000
      })

      const errorFunction = vi.fn().mockRejectedValue(new Error('Test error'))

      await expect(monitor.measureFunction('error-func', errorFunction)).rejects.toThrow(
        'Test error',
      )

      // 验证计时器已被清�?      expect(() => monitor.endTimer('error-func')).toThrow()
    })
  })

  describe('内存监控', () => {
    it('应该能够获取内存快照', async () => {
      const { memoryUsage } = await import('node:process')
      vi.mocked(memoryUsage).mockReturnValue({
        rss: 100 * 1024 * 1024,
        heapTotal: 50 * 1024 * 1024,
        heapUsed: 30 * 1024 * 1024,
        external: 5 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024,
      })

      const snapshot = monitor.getMemorySnapshot()

      expect(snapshot.rss).toBe(100 * 1024 * 1024)
      expect(snapshot.heapUsed).toBe(30 * 1024 * 1024)
      expect(snapshot.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('cPU 监控', () => {
    it('应该能够获取 CPU 快照', async () => {
      const { cpuUsage } = await import('node:process')
      vi.mocked(cpuUsage).mockReturnValue({
        user: 1000000, // 1 �?        system: 500000, // 0.5 �?      })

      const snapshot = monitor.getCPUSnapshot()

      expect(snapshot.user).toBe(1000000)
      expect(snapshot.system).toBe(500000)
      expect(snapshot.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('基准测试', () => {
    it('应该能够运行基准测试', async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount * 10 // 每次调用增加 10ms
      })

      const testFunction = vi.fn()
      const result = await monitor.benchmark('test-benchmark', testFunction, {
        iterations: 5,
        warmup: 2,
      })

      expect(result.name).toBe('test-benchmark')
      expect(result.iterations).toBe(5)
      expect(result.averageTime).toBeGreaterThan(0)
      expect(result.minTime).toBeGreaterThan(0)
      expect(result.maxTime).toBeGreaterThan(0)
      expect(result.opsPerSecond).toBeGreaterThan(0)
      expect(testFunction).toHaveBeenCalledTimes(7) // 2 warmup + 5 iterations
    })

    it('应该在超时时抛出错误', async () => {
      const { performance } = await import('node:perf_hooks')
      vi.mocked(performance.now).mockImplementation(() => Date.now())

      const slowFunction = () => new Promise(resolve => setTimeout(resolve, 100))

      await expect(
        monitor.benchmark('timeout-test', slowFunction, {
          iterations: 1,
          timeout: 50,
        }),
      ).rejects.toThrow('Benchmark timeout')
    })
  })

  describe('基准测试比较', () => {
    it('应该能够比较基准测试结果', () => {
      const baseline = {
        name: 'test',
        iterations: 1000,
        totalTime: 1000,
        averageTime: 1.0,
        minTime: 0.5,
        maxTime: 2.0,
        medianTime: 1.0,
        p95Time: 1.8,
        p99Time: 1.95,
        standardDeviation: 0.3,
        opsPerSecond: 1000,
        timestamp: new Date(),
      }

      const current = {
        ...baseline,
        averageTime: 0.8, // 20% 改进
        opsPerSecond: 1250,
      }

      const comparison = monitor.compareBenchmarks(baseline, current)

      expect(comparison.improvement).toBeCloseTo(0.2, 2)
      expect(comparison.regression).toBe(false)
      expect(comparison.significant).toBe(true)
    })
  })

  describe('性能报告', () => {
    it('应该能够生成性能报告', async () => {
      // 添加一些模拟指�?      const { performance } = await import('node:perf_hooks')
      vi.mocked(performance.now).mockReturnValue(1000)

      monitor.startTimer('test1')
      monitor.endTimer('test1')
      monitor.startTimer('test2')
      monitor.endTimer('test2')

      const report = monitor.getReport()

      expect(report.summary.totalMetrics).toBeGreaterThan(0)
      expect(report.timers).toHaveLength(2)
      expect(report.timers[0].name).toBe('test1')
      expect(report.timers[1].name).toBe('test2')
    })

    it('应该能够按时间范围过滤报�?, async () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

      const report = monitor.getReport({
        start: oneHourAgo,
        end: now,
      })

      expect(report.summary.timeRange.start).toEqual(oneHourAgo)
      expect(report.summary.timeRange.end).toEqual(now)
    })
  })

  describe('指标管理', () => {
    it('应该能够清空指标', async () => {
      const { performance } = await import('node:perf_hooks')
      vi.mocked(performance.now).mockReturnValue(1000)

      monitor.startTimer('test')
      monitor.endTimer('test')

      let report = monitor.getReport()
      expect(report.summary.totalMetrics).toBeGreaterThan(0)

      monitor.clearMetrics()

      report = monitor.getReport()
      expect(report.summary.totalMetrics).toBe(0)
    })
  })
})

describe('performanceUtils', () => {
  describe('快速计�?, () => {
    it('应该能够快速计时同步函�?, async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount === 1 ? 1000 : 1025 // 25ms 差异
      })

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const testFunction = vi.fn().mockReturnValue('result')

      const result = PerformanceUtils.time('test-func', testFunction)

      expect(result).toBe('result')
      expect(consoleSpy).toHaveBeenCalledWith('test-func: 25.00ms')

      consoleSpy.mockRestore()
    })

    it('应该能够快速计时异步函�?, async () => {
      const { performance } = await import('node:perf_hooks')
      let callCount = 0
      vi.mocked(performance.now).mockImplementation(() => {
        callCount++
        return callCount === 1 ? 1000 : 1040 // 40ms 差异
      })

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const asyncFunction = vi.fn().mockResolvedValue('async-result')

      const result = await PerformanceUtils.timeAsync('async-func', asyncFunction)

      expect(result).toBe('async-result')
      expect(consoleSpy).toHaveBeenCalledWith('async-func: 40.00ms')

      consoleSpy.mockRestore()
    })
  })

  describe('内存分析', () => {
    it('应该能够分析内存使用', async () => {
      const mockMemoryUsage = vi.fn().mockReturnValue({
        rss: 100 * 1024 * 1024,
        heapTotal: 50 * 1024 * 1024,
        heapUsed: 30 * 1024 * 1024,
        external: 5 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024,
      })

      // Mock process.memoryUsage
      Object.defineProperty(process, 'memoryUsage', {
        value: mockMemoryUsage,
        configurable: true,
      })

      const analysis = PerformanceUtils.analyzeMemoryUsage()

      expect(analysis.current.rss).toBe(100 * 1024 * 1024)
      expect(analysis.formatted.rss).toBe('100.00 MB')
      expect(analysis.formatted.heapUsagePercent).toBe(60) // 30/50 * 100
    })
  })

  describe('cPU 分析', () => {
    it('应该能够分析 CPU 使用', () => {
      const mockCpuUsage = vi.fn().mockReturnValue({
        user: 1000000, // 1 �?        system: 500000, // 0.5 �?      })

      // Mock process.cpuUsage
      Object.defineProperty(process, 'cpuUsage', {
        value: mockCpuUsage,
        configurable: true,
      })

      const analysis = PerformanceUtils.analyzeCPUUsage()

      expect(analysis.current.user).toBe(1000000)
      expect(analysis.current.system).toBe(500000)
      expect(analysis.percentage).toBeUndefined() // 没有 previousUsage
    })

    it('应该能够计算 CPU 使用百分�?, () => {
      const mockCpuUsage = vi
        .fn()
        .mockReturnValueOnce({ user: 500000, system: 250000 })
        .mockReturnValueOnce({ user: 1000000, system: 500000 })

      Object.defineProperty(process, 'cpuUsage', {
        value: mockCpuUsage,
        configurable: true,
      })

      const previousUsage = { user: 500000, system: 250000 }
      const analysis = PerformanceUtils.analyzeCPUUsage(previousUsage)

      expect(analysis.percentage).toBeDefined()
      expect(analysis.percentage!.user).toBeCloseTo(66.67, 1)
      expect(analysis.percentage!.system).toBeCloseTo(33.33, 1)
    })
  })

  describe('快速基准测�?, () => {
    it('应该能够运行快速基准测�?, async () => {
      // Mock PerformanceMonitor
      const mockBenchmark = vi.fn().mockResolvedValue({
        name: 'quick-test',
        iterations: 1000,
        averageTime: 1.5,
        minTime: 1.0,
        maxTime: 2.0,
        opsPerSecond: 666.67,
      })

      vi.spyOn(PerformanceMonitor.prototype, 'benchmark').mockImplementation(mockBenchmark)

      const testFunction = vi.fn()
      const result = await PerformanceUtils.quickBenchmark('quick-test', testFunction, 1000)

      expect(result.name).toBe('quick-test')
      expect(result.iterations).toBe(1000)
      expect(mockBenchmark).toHaveBeenCalledWith('quick-test', testFunction, { iterations: 1000 })
    })
  })

  describe('函数性能比较', () => {
    it('应该能够比较多个函数的性能', async () => {
      const mockBenchmark = vi
        .fn()
        .mockResolvedValueOnce({
          name: 'func1',
          averageTime: 2.0,
          iterations: 1000,
          totalTime: 2000,
          minTime: 1.5,
          maxTime: 3.0,
          medianTime: 2.0,
          p95Time: 2.8,
          p99Time: 2.95,
          standardDeviation: 0.3,
          opsPerSecond: 500,
          timestamp: new Date(),
        })
        .mockResolvedValueOnce({
          name: 'func2',
          averageTime: 1.0,
          iterations: 1000,
          totalTime: 1000,
          minTime: 0.8,
          maxTime: 1.5,
          medianTime: 1.0,
          p95Time: 1.4,
          p99Time: 1.48,
          standardDeviation: 0.15,
          opsPerSecond: 1000,
          timestamp: new Date(),
        })

      vi.spyOn(PerformanceUtils, 'quickBenchmark').mockImplementation(mockBenchmark)

      const functions = [
        { name: 'func1', fn: () => {} },
        { name: 'func2', fn: () => {} },
      ]

      const results = await PerformanceUtils.compareFunctions(functions, 1000)

      expect(results).toHaveLength(2)
      expect(results[0].name).toBe('func2') // 更快的函数排在前�?      expect(results[0].rank).toBe(1)
      expect(results[1].name).toBe('func1')
      expect(results[1].rank).toBe(2)
    })
  })
})



