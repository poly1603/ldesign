import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PerformanceMonitor } from '../../src/core/performance-monitor'
import type { PerformanceMetrics } from '../../src/core/performance-monitor'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor
  
  beforeEach(() => {
    vi.useFakeTimers()
    monitor = new PerformanceMonitor()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该能够创建性能监控器', () => {
      expect(monitor).toBeDefined()
      expect(monitor).toBeInstanceOf(PerformanceMonitor)
    })

    it('应该能够使用自定义配置', () => {
      const customMonitor = new PerformanceMonitor({
        enabled: false,
        slowThreshold: 200,
        maxRecords: 500,
        samplingRate: 0.5,
        detailed: true
      })
      
      expect(customMonitor).toBeDefined()
    })

    it('应该能够记录性能指标', () => {
      const metrics: PerformanceMetrics = {
        operation: 'get',
        engine: 'memory',
        key: 'test-key',
        duration: 10,
        dataSize: 100,
        success: true,
        timestamp: Date.now()
      }

      monitor.record(metrics)
      const stats = monitor.getStats()
      
      expect(stats.totalOperations).toBe(1)
      expect(stats.successCount).toBe(1)
      expect(stats.failureCount).toBe(0)
    })

    it('应该能够清空记录', () => {
      const metrics: PerformanceMetrics = {
        operation: 'set',
        duration: 15,
        success: true,
        timestamp: Date.now()
      }

      monitor.record(metrics)
      expect(monitor.getStats().totalOperations).toBe(1)
      
      monitor.clear()
      expect(monitor.getStats().totalOperations).toBe(0)
    })
  })

  describe('测量功能', () => {
    it('应该能够开始和结束测量', () => {
      const measurement = monitor.startMeasure()
      
      // 模拟一些时间流逝
      vi.advanceTimersByTime(50)
      
      measurement.end(true)
      
      const stats = monitor.getStats()
      expect(stats.totalOperations).toBe(1)
      expect(stats.successCount).toBe(1)
    })

    it('应该能够测量失败的操作', () => {
      const measurement = monitor.startMeasure()
      
      vi.advanceTimersByTime(30)
      
      measurement.end(false, new Error('Test error'))
      
      const stats = monitor.getStats()
      expect(stats.totalOperations).toBe(1)
      expect(stats.failureCount).toBe(1)
    })

    it('应该能够测量异步操作', async () => {
      const asyncOperation = vi.fn().mockResolvedValue('result')
      
      const result = await monitor.measure('async-test', asyncOperation, {
        key: 'test-key',
        engine: 'memory',
        dataSize: 200
      })
      
      expect(result).toBe('result')
      expect(asyncOperation).toHaveBeenCalled()
      
      const stats = monitor.getStats()
      expect(stats.totalOperations).toBe(1)
      expect(stats.successCount).toBe(1)
    })

    it('应该能够测量失败的异步操作', async () => {
      const error = new Error('Async error')
      const asyncOperation = vi.fn().mockRejectedValue(error)
      
      await expect(monitor.measure('async-fail', asyncOperation)).rejects.toThrow('Async error')
      
      const stats = monitor.getStats()
      expect(stats.totalOperations).toBe(1)
      expect(stats.failureCount).toBe(1)
    })
  })

  describe('统计功能', () => {
    beforeEach(() => {
      // 添加一些测试数据
      monitor.record({
        operation: 'get',
        engine: 'memory',
        duration: 10,
        success: true,
        timestamp: Date.now()
      })
      
      monitor.record({
        operation: 'set',
        engine: 'localStorage',
        duration: 25,
        success: true,
        timestamp: Date.now()
      })
      
      monitor.record({
        operation: 'get',
        engine: 'memory',
        duration: 150,
        success: false,
        error: 'Not found',
        timestamp: Date.now()
      })
    })

    it('应该能够获取基本统计信息', () => {
      const stats = monitor.getStats()
      
      expect(stats.totalOperations).toBe(3)
      expect(stats.successCount).toBe(2)
      expect(stats.failureCount).toBe(1)
      expect(stats.averageDuration).toBeCloseTo(61.67, 1)
      expect(stats.minDuration).toBe(10)
      expect(stats.maxDuration).toBe(150)
    })

    it('应该能够按操作类型过滤统计', () => {
      const getStats = monitor.getStats({ operation: 'get' })
      
      expect(getStats.totalOperations).toBe(2)
      expect(getStats.successCount).toBe(1)
      expect(getStats.failureCount).toBe(1)
    })

    it('应该能够按引擎过滤统计', () => {
      const memoryStats = monitor.getStats({ engine: 'memory' })
      
      expect(memoryStats.totalOperations).toBe(2)
      expect(memoryStats.engineDistribution.memory).toBe(2)
    })

    it('应该能够按时间过滤统计', () => {
      const now = Date.now()
      const futureStats = monitor.getStats({ since: now + 1000 })
      
      expect(futureStats.totalOperations).toBe(0)
    })
  })

  describe('配置选项', () => {
    it('应该在禁用时不记录指标', () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false })
      
      disabledMonitor.record({
        operation: 'test',
        duration: 10,
        success: true,
        timestamp: Date.now()
      })
      
      expect(disabledMonitor.getStats().totalOperations).toBe(0)
    })

    it('应该限制最大记录数', () => {
      const limitedMonitor = new PerformanceMonitor({ maxRecords: 2 })
      
      // 添加3条记录
      for (let i = 0; i < 3; i++) {
        limitedMonitor.record({
          operation: `test-${i}`,
          duration: 10,
          success: true,
          timestamp: Date.now()
        })
      }
      
      expect(limitedMonitor.getStats().totalOperations).toBe(2)
    })

    it('应该识别慢操作', () => {
      const slowMonitor = new PerformanceMonitor({ slowThreshold: 50 })
      
      slowMonitor.record({
        operation: 'slow-op',
        duration: 100,
        success: true,
        timestamp: Date.now()
      })
      
      const stats = slowMonitor.getStats()
      expect(stats.slowOperations).toHaveLength(1)
      expect(stats.slowOperations[0].operation).toBe('slow-op')
    })
  })

  describe('事件发射', () => {
    it('应该发射性能指标事件', () => {
      const listener = vi.fn()
      monitor.on('metrics', listener)

      const metrics: PerformanceMetrics = {
        operation: 'test',
        duration: 10,
        success: true,
        timestamp: Date.now()
      }

      monitor.record(metrics)

      expect(listener).toHaveBeenCalledWith(metrics)
    })

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn()
      monitor.on('metrics', listener)
      monitor.off('metrics', listener)

      monitor.record({
        operation: 'test',
        duration: 10,
        success: true,
        timestamp: Date.now()
      })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('报告生成', () => {
    it('应该能够生成性能报告', () => {
      monitor.record({
        operation: 'test',
        duration: 50,
        success: true,
        timestamp: Date.now()
      })
      
      const report = monitor.generateReport()
      
      expect(report).toContain('缓存性能报告')
      expect(report).toContain('总操作数: 1')
      expect(report).toContain('成功率: 100.00%')
    })

    it('应该能够导出指标数据', () => {
      monitor.record({
        operation: 'export-test',
        duration: 30,
        success: true,
        timestamp: Date.now()
      })
      
      const exported = monitor.export()
      
      expect(exported).toHaveLength(1)
      expect(exported[0].operation).toBe('export-test')
    })
  })

  describe('百分位数计算', () => {
    it('应该能够计算百分位数', () => {
      // 添加一系列持续时间数据
      const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      
      durations.forEach((duration, index) => {
        monitor.record({
          operation: `test-${index}`,
          duration,
          success: true,
          timestamp: Date.now()
        })
      })
      
      const percentiles = monitor.getPercentiles()
      
      expect(percentiles.p50).toBe(50) // 中位数
      expect(percentiles.p95).toBe(90) // 95百分位
      expect(percentiles.p99).toBe(100) // 99百分位
    })
  })
})
