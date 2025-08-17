import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createPerformanceManager,
  PerformanceEventType,
} from '../src/performance/performance-manager'

describe('performanceManager', () => {
  let performanceManager: ReturnType<typeof createPerformanceManager>

  beforeEach(() => {
    performanceManager = createPerformanceManager()
  })

  describe('性能事件', () => {
    it('应该开始和结束性能事件', () => {
      const eventId = performanceManager.startEvent(
        PerformanceEventType.CUSTOM,
        'test-event',
      )
      expect(eventId).toBeDefined()

      performanceManager.endEvent(eventId)

      const events = performanceManager.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].name).toBe('test-event')
      expect(events[0].type).toBe(PerformanceEventType.CUSTOM)
      expect(events[0].duration).toBeGreaterThanOrEqual(0)
    })

    it('应该记录事件元数据', () => {
      const metadata = { userId: '123', action: 'click' }
      const eventId = performanceManager.startEvent(
        PerformanceEventType.USER_INTERACTION,
        'button-click',
        metadata,
      )
      performanceManager.endEvent(eventId)

      const events = performanceManager.getEvents()
      expect(events[0].metadata).toEqual(metadata)
    })

    it('应该处理事件结束时的错误信息', () => {
      const eventId = performanceManager.startEvent(
        PerformanceEventType.API_CALL,
        'api-request',
      )
      performanceManager.endEvent(eventId, { error: 'Request failed' })

      const events = performanceManager.getEvents()
      expect(events[0].metadata?.error).toBe('Request failed')
    })

    it('应该直接记录完整事件', () => {
      const event = {
        type: PerformanceEventType.COMPONENT_RENDER,
        name: 'component-render',
        startTime: 100,
        endTime: 150,
        duration: 50,
      }

      const eventId = performanceManager.recordEvent(event)
      expect(eventId).toBeDefined()

      const events = performanceManager.getEvents()
      expect(events[0].duration).toBe(50)
    })
  })

  describe('性能指标', () => {
    it('应该收集性能指标', () => {
      const metrics = performanceManager.collectMetrics()

      expect(metrics.timestamp).toBeDefined()
      expect(typeof metrics.timestamp).toBe('number')
    })

    it('应该记录自定义指标', () => {
      const customMetrics = {
        timestamp: Date.now(),
        duration: 100,
        custom: {
          loadTime: 500,
          renderTime: 200,
        },
      }

      performanceManager.recordMetrics(customMetrics)

      const allMetrics = performanceManager.getMetrics()
      expect(allMetrics).toHaveLength(1)
      expect(allMetrics[0].custom?.loadTime).toBe(500)
    })

    it('应该限制存储的指标数量', () => {
      // 记录大量指标
      for (let i = 0; i < 1200; i++) {
        performanceManager.recordMetrics({
          timestamp: Date.now() + i,
          duration: i,
        })
      }

      const metrics = performanceManager.getMetrics()
      expect(metrics.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('性能监控', () => {
    it('应该开始和停止监控', () => {
      expect(performanceManager.isMonitoring()).toBe(false)

      performanceManager.startMonitoring()
      expect(performanceManager.isMonitoring()).toBe(true)

      performanceManager.stopMonitoring()
      expect(performanceManager.isMonitoring()).toBe(false)
    })

    it('应该注册指标回调', () => {
      const callback = vi.fn()
      performanceManager.onMetrics(callback)

      performanceManager.recordMetrics({
        timestamp: Date.now(),
        duration: 100,
      })

      expect(callback).toHaveBeenCalled()
    })

    it('应该移除指标回调', () => {
      const callback = vi.fn()
      const unsubscribe = (performanceManager as any).onMetrics(callback)

      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }

      performanceManager.recordMetrics({
        timestamp: Date.now(),
        duration: 100,
      })

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('性能阈值', () => {
    it('应该检测阈值违规', () => {
      const thresholds = {
        responseTime: { good: 100, poor: 1000 },
      }
      const manager = createPerformanceManager(thresholds)

      const violationCallback = vi.fn()
      manager.onViolation(violationCallback)

      // 记录一个超过阈值的事件
      manager.recordEvent({
        type: PerformanceEventType.API_CALL,
        name: 'slow-api',
        startTime: 0,
        endTime: 1500,
        duration: 1500,
      })

      expect(violationCallback).toHaveBeenCalled()
    })

    it('应该更新性能阈值', () => {
      const newThresholds = {
        responseTime: { good: 50, poor: 500 },
      };

      (performanceManager as any).updateThresholds(newThresholds)

      const thresholds = performanceManager.getThresholds()
      expect(thresholds.responseTime?.good).toBe(50)
      expect(thresholds.responseTime?.poor).toBe(500)
    })
  })

  describe('性能报告', () => {
    it('应该生成性能报告', () => {
      // 添加一些测试数据
      performanceManager.recordEvent({
        type: PerformanceEventType.API_CALL,
        name: 'api-call',
        startTime: 0,
        endTime: 100,
        duration: 100,
      })

      performanceManager.recordMetrics({
        timestamp: Date.now(),
        duration: 100,
        memory: {
          used: 50 * 1024 * 1024,
          total: 100 * 1024 * 1024,
          limit: 200 * 1024 * 1024,
        },
      })

      const report = (performanceManager as any).generateReport()

      expect(report.summary).toBeDefined()
      expect(report.events).toHaveLength(1)
      expect(report.metrics).toHaveLength(1)
      expect(report.recommendations).toBeDefined()
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('应该生成性能建议', () => {
      // 添加慢操作
      performanceManager.recordEvent({
        type: PerformanceEventType.CUSTOM,
        name: 'slow-operation',
        startTime: 0,
        endTime: 2000,
        duration: 2000,
      })

      // 添加高内存使用
      performanceManager.recordMetrics({
        timestamp: Date.now(),
        duration: 100,
        memory: {
          used: 150 * 1024 * 1024,
          total: 200 * 1024 * 1024,
          limit: 200 * 1024 * 1024,
        },
      })

      const report = (performanceManager as any).generateReport()

      expect(report.recommendations.length).toBeGreaterThan(0)
      expect(report.recommendations.some((r: any) => r.includes('慢操作'))).toBe(true)
      expect(report.recommendations.some((r: any) => r.includes('内存'))).toBe(true)
    })
  })

  describe('性能标记', () => {
    it('应该创建性能标记', () => {
      ; (performanceManager as any).mark('start-render')
      ; (performanceManager as any).mark('end-render')

      const marks = (performanceManager as any).getMarks()
      expect(marks).toHaveLength(2)
      expect(marks.map((m: any) => m.name)).toContain('start-render')
      expect(marks.map((m: any) => m.name)).toContain('end-render')
    })

    it('应该测量性能区间', async () => {
      (performanceManager as any).mark('start')

      // 模拟一些工作
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          ; (performanceManager as any).mark('end')
          ; (performanceManager as any).measure('operation', 'start', 'end')

          const measures = (performanceManager as any).getMeasures()
          expect(measures).toHaveLength(1)
          expect(measures[0].name).toBe('operation')
          expect(measures[0].duration).toBeGreaterThan(0)
          resolve()
        }, 10)
      })
    })
  })

  describe('清理和重置', () => {
    it('应该清空事件历史', () => {
      performanceManager.recordEvent({
        type: PerformanceEventType.CUSTOM,
        name: 'test-event',
        startTime: 0,
        endTime: 100,
        duration: 100,
      });

      (performanceManager as any).clearEvents()
      expect(performanceManager.getEvents()).toHaveLength(0)
    })

    it('应该清空指标历史', () => {
      performanceManager.recordMetrics({
        timestamp: Date.now(),
        duration: 100,
      });

      (performanceManager as any).clearMetrics()
      expect(performanceManager.getMetrics()).toHaveLength(0)
    })

    it('应该清空标记和测量', () => {
      ; (performanceManager as any).mark('test-mark')
      ; (performanceManager as any).clearMarks()
      expect((performanceManager as any).getMarks()).toHaveLength(0)

      // 先创建标记，然后测量
      ; (performanceManager as any).mark('start')
      ; (performanceManager as any).mark('end')
      ; (performanceManager as any).measure('test-measure', 'start', 'end')
      ; (performanceManager as any).clearMeasures()
      expect((performanceManager as any).getMeasures()).toHaveLength(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的事件ID', () => {
      expect(() => {
        performanceManager.endEvent('invalid-id')
      }).not.toThrow()
    })

    it('应该处理指标回调中的错误', () => {
      const faultyCallback = vi.fn(() => {
        throw new Error('Callback error')
      })

      performanceManager.onMetrics(faultyCallback)

      expect(() => {
        performanceManager.recordMetrics({
          timestamp: Date.now(),
          duration: 100,
        })
      }).not.toThrow()
    })
  })
})
