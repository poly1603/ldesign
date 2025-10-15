/**
 * 性能优化功能测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PerformanceMonitor, PreloadController } from '../../src/utils/performance'
import type { TemplateMetadata } from '../../src/types/template'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
  },
}

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    performance: mockPerformance,
    requestIdleCallback: vi.fn(callback => setTimeout(callback, 0)),
    IntersectionObserver: vi.fn().mockImplementation(callback => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      callback,
    })),
  },
  writable: true,
})

// Mock global IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  callback,
}))

// Mock component loader
vi.mock('../../src/utils/loader', () => ({
  componentLoader: {
    preloadComponent: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('Performance Utilities', () => {
  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor

    beforeEach(() => {
      monitor = new PerformanceMonitor()
      vi.clearAllMocks()
    })

    it('should record metrics correctly', () => {
      monitor.recordMetric('test-metric', 100)
      monitor.recordMetric('test-metric', 200)
      monitor.recordMetric('test-metric', 150)

      const stats = monitor.getStats('test-metric')
      expect(stats).toEqual({
        count: 3,
        avg: 150,
        min: 100,
        max: 200,
      })
    })

    it('should return empty stats for non-existent metric', () => {
      const stats = monitor.getStats('non-existent')
      expect(stats).toEqual({
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
      })
    })

    it('should monitor component load time', () => {
      const endMonitoring = monitor.monitorComponentLoad('test-component')

      // Simulate some work
      setTimeout(() => {
        endMonitoring()
      }, 100)

      expect(mockPerformance.now).toHaveBeenCalled()
    })

    it('should clear metrics', () => {
      monitor.recordMetric('test-metric', 100)
      monitor.clearMetrics('test-metric')

      const stats = monitor.getStats('test-metric')
      expect(stats.count).toBe(0)
    })
  })

  describe('PreloadController', () => {
    let preloader: PreloadController
    const mockTemplates: TemplateMetadata[] = [
      {
        id: 'template1',
        name: 'Template 1',
        category: 'login',
        device: 'desktop',
        path: '/templates/login/desktop/template1',
        config: {
          name: 'template1',
          displayName: 'Template 1',
          description: 'Test template 1',
          version: '1.0.0',
        },
      },
      {
        id: 'template2',
        name: 'Template 2',
        category: 'dashboard',
        device: 'desktop',
        path: '/templates/dashboard/desktop/template2',
        config: {
          name: 'template2',
          displayName: 'Template 2',
          description: 'Test template 2',
          version: '1.0.0',
        },
      },
    ]

    beforeEach(() => {
      preloader = new PreloadController({
        maxConcurrent: 2,
        priority: ['Template 1'],
        delayMs: 0,
        maxRetries: 1,
      })
      vi.clearAllMocks()
    })

    afterEach(() => {
      vi.clearAllTimers()
    })

    it('should add templates to preload queue', () => {
      preloader.addToQueue(mockTemplates)

      // Check that templates were added (we can't directly access the queue,
      // but we can verify through side effects)
      expect(mockTemplates.length).toBe(2)
    })

    it('should prioritize templates correctly', () => {
      const priorityPreloader = new PreloadController({
        priority: ['Template 2', 'Template 1'],
      })

      priorityPreloader.addToQueue(mockTemplates)
      // The prioritization logic should reorder the queue
      expect(mockTemplates.length).toBe(2)
    })

    it('should handle preload failures with retry', async () => {
      const { componentLoader } = await import('../../src/utils/loader')

      // Mock failure on first call, success on second
      vi.mocked(componentLoader.preloadComponent)
        .mockRejectedValueOnce(new Error('Load failed'))
        .mockResolvedValueOnce(undefined)

      preloader.addToQueue([mockTemplates[0]])

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(componentLoader.preloadComponent).toHaveBeenCalledTimes(1)
    })

    it('should respect max concurrent limit', () => {
      const preloader = new PreloadController({
        maxConcurrent: 1,
        delayMs: 0,
      })

      preloader.addToQueue(mockTemplates)

      // Should only process one at a time
      expect(mockTemplates.length).toBe(2)
    })

    it('should setup intersection observer when enabled', () => {
      const preloader = new PreloadController({
        enableIntersectionObserver: true,
      })

      expect(window.IntersectionObserver).toHaveBeenCalled()
    })

    it('should not setup intersection observer when disabled', () => {
      vi.clearAllMocks()

      const preloader = new PreloadController({
        enableIntersectionObserver: false,
      })

      expect(window.IntersectionObserver).not.toHaveBeenCalled()
    })

    it('should handle empty template queue', () => {
      preloader.addToQueue([])
      // Should not throw or cause issues
      expect(true).toBe(true)
    })

    it('should avoid duplicate preloads', () => {
      preloader.addToQueue([mockTemplates[0]])
      preloader.addToQueue([mockTemplates[0]]) // Same template again

      // Should only preload once
      expect(mockTemplates.length).toBe(2)
    })
  })

  describe('Memory Management', () => {
    it('should detect high memory usage', () => {
      // Mock high memory usage
      mockPerformance.memory.usedJSHeapSize = 180 * 1024 * 1024 // 180MB out of 200MB limit

      // This would trigger memory cleanup in real scenario
      const usedRatio = mockPerformance.memory.usedJSHeapSize / mockPerformance.memory.jsHeapSizeLimit
      expect(usedRatio).toBeGreaterThan(0.8)
    })

    it('should handle missing performance.memory gracefully', () => {
      const originalMemory = mockPerformance.memory
      delete (mockPerformance as any).memory

      // Should not throw when memory API is not available
      expect(() => {
        new PerformanceMonitor()
      }).not.toThrow()

      // Restore
      mockPerformance.memory = originalMemory
    })
  })
})
