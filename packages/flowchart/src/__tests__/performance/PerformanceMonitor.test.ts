/**
 * 性能监控器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PerformanceMonitor } from '../../performance/PerformanceMonitor'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10 // 10MB
  }
}

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16) // 60fps
  return 1
})

const mockCancelAnimationFrame = vi.fn()

// Mock MutationObserver
const mockMutationObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}))

// Setup mocks
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
})

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
})

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true
})

Object.defineProperty(global, 'MutationObserver', {
  value: mockMutationObserver,
  writable: true
})

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    body: {},
    querySelectorAll: vi.fn(() => ({ length: 100 }))
  },
  writable: true
})

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    vi.clearAllMocks()
    monitor = new PerformanceMonitor({
      enabled: true,
      sampleInterval: 100, // 快速采样用于测试
      maxHistorySize: 10,
      monitorMemory: true,
      monitorFPS: true
    })
  })

  afterEach(() => {
    monitor.stop()
  })

  describe('基础功能', () => {
    it('应该能够创建性能监控器实例', () => {
      expect(monitor).toBeDefined()
      expect(monitor).toBeInstanceOf(PerformanceMonitor)
    })

    it('应该能够启动和停止监控', () => {
      expect(() => monitor.start()).not.toThrow()
      expect(() => monitor.stop()).not.toThrow()
    })

    it('应该能够获取当前性能指标', () => {
      const metrics = monitor.getCurrentMetrics()
      
      expect(metrics).toBeDefined()
      expect(typeof metrics.renderTime).toBe('number')
      expect(typeof metrics.memoryUsage).toBe('number')
      expect(typeof metrics.domNodeCount).toBe('number')
      expect(typeof metrics.eventListenerCount).toBe('number')
      expect(typeof metrics.flowchartNodeCount).toBe('number')
      expect(typeof metrics.flowchartEdgeCount).toBe('number')
      expect(typeof metrics.fps).toBe('number')
      expect(typeof metrics.timestamp).toBe('number')
    })
  })

  describe('渲染时间监控', () => {
    it('应该能够标记渲染开始和结束', () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1050)
      
      monitor.markRenderStart()
      monitor.markRenderEnd()
      
      expect(mockPerformance.now).toHaveBeenCalledTimes(2)
    })

    it('应该能够记录渲染时间', () => {
      mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1050)
      
      monitor.markRenderStart()
      monitor.markRenderEnd()
      
      // 渲染时间应该被记录
      expect(mockPerformance.now).toHaveBeenCalled()
    })
  })

  describe('事件监听器监控', () => {
    it('应该能够记录事件监听器数量变化', () => {
      monitor.recordEventListener(5)
      monitor.recordEventListener(-2)
      
      const metrics = monitor.getCurrentMetrics()
      expect(metrics.eventListenerCount).toBe(3)
    })
  })

  describe('性能报告', () => {
    it('应该能够生成性能报告', () => {
      const report = monitor.getReport()
      
      expect(report).toBeDefined()
      expect(Array.isArray(report.metrics)).toBe(true)
      expect(typeof report.avgRenderTime).toBe('number')
      expect(typeof report.maxRenderTime).toBe('number')
      expect(typeof report.avgMemoryUsage).toBe('number')
      expect(typeof report.maxMemoryUsage).toBe('number')
      expect(typeof report.avgFPS).toBe('number')
      expect(typeof report.minFPS).toBe('number')
      expect(['excellent', 'good', 'fair', 'poor']).toContain(report.performanceGrade)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('空数据时应该返回默认报告', () => {
      const report = monitor.getReport()
      
      expect(report.metrics).toHaveLength(0)
      expect(report.avgRenderTime).toBe(0)
      expect(report.maxRenderTime).toBe(0)
      expect(report.performanceGrade).toBe('excellent')
      expect(report.recommendations).toContain('暂无性能数据')
    })
  })

  describe('数据管理', () => {
    it('应该能够清空历史数据', () => {
      // 添加一些数据
      monitor.recordEventListener(5)
      
      monitor.clear()
      
      const report = monitor.getReport()
      expect(report.metrics).toHaveLength(0)
    })

    it('应该能够导出性能数据', () => {
      const exportData = monitor.exportData()
      
      expect(typeof exportData).toBe('string')
      expect(() => JSON.parse(exportData)).not.toThrow()
      
      const parsed = JSON.parse(exportData)
      expect(parsed).toHaveProperty('metrics')
      expect(parsed).toHaveProperty('performanceGrade')
      expect(parsed).toHaveProperty('recommendations')
    })

    it('应该限制历史记录数量', () => {
      const maxSize = 5
      const limitedMonitor = new PerformanceMonitor({
        maxHistorySize: maxSize,
        sampleInterval: 10
      })

      // 模拟添加超过限制的数据
      for (let i = 0; i < maxSize + 3; i++) {
        const metrics = limitedMonitor.getCurrentMetrics()
        limitedMonitor['addMetrics'](metrics)
      }

      const report = limitedMonitor.getReport()
      expect(report.metrics.length).toBeLessThanOrEqual(maxSize)
      
      limitedMonitor.stop()
    })
  })

  describe('性能等级评估', () => {
    it('应该正确评估优秀性能', () => {
      const excellentMonitor = new PerformanceMonitor()
      
      // 模拟优秀的性能数据
      const mockMetrics = {
        renderTime: 10, // 低渲染时间
        memoryUsage: 20, // 低内存使用
        domNodeCount: 100,
        eventListenerCount: 10,
        flowchartNodeCount: 5,
        flowchartEdgeCount: 4,
        fps: 60, // 高帧率
        timestamp: Date.now()
      }

      excellentMonitor['addMetrics'](mockMetrics)
      
      const report = excellentMonitor.getReport()
      expect(report.performanceGrade).toBe('excellent')
      
      excellentMonitor.stop()
    })

    it('应该正确评估较差性能', () => {
      const poorMonitor = new PerformanceMonitor()
      
      // 模拟较差的性能数据
      const mockMetrics = {
        renderTime: 150, // 高渲染时间
        memoryUsage: 120, // 高内存使用
        domNodeCount: 1000,
        eventListenerCount: 100,
        flowchartNodeCount: 100,
        flowchartEdgeCount: 200,
        fps: 25, // 低帧率
        timestamp: Date.now()
      }

      poorMonitor['addMetrics'](mockMetrics)
      
      const report = poorMonitor.getReport()
      expect(report.performanceGrade).toBe('poor')
      expect(report.recommendations.length).toBeGreaterThan(1)
      
      poorMonitor.stop()
    })
  })

  describe('配置选项', () => {
    it('应该支持禁用监控', () => {
      const disabledMonitor = new PerformanceMonitor({
        enabled: false
      })

      disabledMonitor.start()
      
      // 禁用时不应该启动监控
      expect(mockMutationObserver).not.toHaveBeenCalled()
      
      disabledMonitor.stop()
    })

    it('应该支持自定义采样间隔', () => {
      const customMonitor = new PerformanceMonitor({
        sampleInterval: 2000
      })

      expect(customMonitor).toBeDefined()
      customMonitor.stop()
    })

    it('应该支持禁用内存监控', () => {
      const noMemoryMonitor = new PerformanceMonitor({
        monitorMemory: false
      })

      const metrics = noMemoryMonitor.getCurrentMetrics()
      expect(metrics.memoryUsage).toBe(0)
      
      noMemoryMonitor.stop()
    })
  })

  describe('FPS计数器', () => {
    it('应该能够启动和停止FPS监控', () => {
      monitor.start()
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
      
      monitor.stop()
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    it('应该能够获取FPS值', () => {
      const metrics = monitor.getCurrentMetrics()
      expect(typeof metrics.fps).toBe('number')
      expect(metrics.fps).toBeGreaterThanOrEqual(0)
    })
  })
})
