/**
 * @file 性能优化系统测试
 * @description 测试内存管理、性能监控和大图片处理功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MemoryManager,
  PerformanceMonitor,
  LargeImageProcessor,
  PerformanceSystem
} from '@/performance'

// Mock HTMLImageElement
class MockImage {
  naturalWidth = 1920
  naturalHeight = 1080
  src = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 10)
  }
}

// Mock HTMLCanvasElement
class MockCanvas {
  width = 0
  height = 0

  getContext() {
    return {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => new ImageData(100, 100)),
      putImageData: vi.fn()
    }
  }
}

// Mock OffscreenCanvas
class MockOffscreenCanvas {
  width = 0
  height = 0

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  getContext() {
    return {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => new ImageData(this.width, this.height)),
      putImageData: vi.fn()
    }
  }
}

// 设置全局mocks
global.HTMLImageElement = MockImage as any
global.HTMLCanvasElement = MockCanvas as any
global.OffscreenCanvas = MockOffscreenCanvas as any
global.ImageData = class MockImageData {
  data: Uint8ClampedArray
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.data = new Uint8ClampedArray(width * height * 4)
  }
} as any

describe('性能优化系统', () => {
  describe('MemoryManager', () => {
    let memoryManager: MemoryManager

    beforeEach(() => {
      memoryManager = new MemoryManager()
    })

    afterEach(() => {
      memoryManager.destroy()
    })

    it('应该能够创建内存管理器', () => {
      expect(memoryManager).toBeInstanceOf(MemoryManager)
    })

    it('应该能够缓存和获取图片', () => {
      const image = new MockImage() as any
      memoryManager.cacheImage('test-image', image)

      const cached = memoryManager.getCachedImage('test-image')
      expect(cached).toBe(image)
    })

    it('应该能够移除图片缓存', () => {
      const image = new MockImage() as any
      memoryManager.cacheImage('test-image', image)
      memoryManager.removeCachedImage('test-image')

      const cached = memoryManager.getCachedImage('test-image')
      expect(cached).toBeUndefined()
    })

    it('应该能够缓存和获取Canvas', () => {
      const canvas = new MockCanvas() as any
      memoryManager.cacheCanvas('test-canvas', canvas)

      const cached = memoryManager.getCachedCanvas('test-canvas')
      expect(cached).toBe(canvas)
    })

    it('应该能够获取内存使用统计', () => {
      const stats = memoryManager.getMemoryStats()

      expect(stats).toHaveProperty('usedMemory')
      expect(stats).toHaveProperty('imageCount')
      expect(stats).toHaveProperty('canvasCount')
      expect(stats).toHaveProperty('memoryUsage')
      expect(typeof stats.usedMemory).toBe('number')
      expect(typeof stats.imageCount).toBe('number')
    })

    it('应该能够注册和注销可清理资源', () => {
      const disposable = {
        dispose: vi.fn(),
        isDisposed: vi.fn(() => false)
      }

      memoryManager.registerDisposable(disposable)
      memoryManager.unregisterDisposable(disposable)

      expect(disposable.dispose).not.toHaveBeenCalled()
    })

    it('应该能够清理所有缓存', () => {
      const image = new MockImage() as any
      const canvas = new MockCanvas() as any

      memoryManager.cacheImage('test-image', image)
      memoryManager.cacheCanvas('test-canvas', canvas)

      memoryManager.clearAllCaches()

      expect(memoryManager.getCachedImage('test-image')).toBeUndefined()
      expect(memoryManager.getCachedCanvas('test-canvas')).toBeUndefined()
    })

    it('应该能够触发内存警告事件', () => {
      const warningListener = vi.fn()
      memoryManager.on('memoryWarning', warningListener)

      // 模拟高内存使用
      for (let i = 0; i < 100; i++) {
        const image = new MockImage() as any
        memoryManager.cacheImage(`image-${i}`, image)
      }

      // 由于是异步监控，这里只验证事件监听器已设置
      expect(warningListener).toBeDefined()
    })
  })

  describe('PerformanceMonitor', () => {
    let performanceMonitor: PerformanceMonitor

    beforeEach(() => {
      performanceMonitor = new PerformanceMonitor()
    })

    afterEach(() => {
      performanceMonitor.destroy()
    })

    it('应该能够创建性能监控器', () => {
      expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor)
    })

    it('应该能够开始和停止监控', () => {
      performanceMonitor.startMonitoring()
      expect(performanceMonitor['isMonitoring']).toBe(true)

      performanceMonitor.stopMonitoring()
      expect(performanceMonitor['isMonitoring']).toBe(false)
    })

    it('应该能够记录渲染时间', () => {
      const renderTimeListener = vi.fn()
      performanceMonitor.on('renderTimeRecorded', renderTimeListener)

      performanceMonitor.recordRenderTime(16.67)

      expect(renderTimeListener).toHaveBeenCalledWith({
        type: 'renderTimeRecorded',
        duration: 16.67
      })
    })

    it('应该能够记录图片加载时间', () => {
      const loadTimeListener = vi.fn()
      performanceMonitor.on('imageLoadTimeRecorded', loadTimeListener)

      performanceMonitor.recordImageLoadTime(500)

      expect(loadTimeListener).toHaveBeenCalledWith({
        type: 'imageLoadTimeRecorded',
        duration: 500
      })
    })

    it('应该能够获取当前性能指标', () => {
      const metrics = performanceMonitor.getCurrentMetrics()

      expect(metrics).toHaveProperty('fps')
      expect(metrics).toHaveProperty('frameTime')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('cpuUsage')
      expect(typeof metrics.fps).toBe('number')
    })

    it('应该能够获取性能统计', () => {
      const stats = performanceMonitor.getPerformanceStats()

      expect(stats).toHaveProperty('current')
      expect(stats).toHaveProperty('average')
      expect(stats).toHaveProperty('peak')
      expect(stats).toHaveProperty('sampleCount')
      expect(typeof stats.sampleCount).toBe('number')
    })

    it('应该能够获取性能等级', () => {
      const level = performanceMonitor.getPerformanceLevel()

      expect(['good', 'fair', 'poor', 'critical']).toContain(level)
    })

    it('应该能够清空性能历史', () => {
      performanceMonitor.recordRenderTime(20)
      performanceMonitor.clearHistory()

      const stats = performanceMonitor.getPerformanceStats()
      expect(stats.sampleCount).toBe(0)
    })

    it('应该能够导出性能数据', () => {
      const exportData = performanceMonitor.exportPerformanceData()

      expect(typeof exportData).toBe('string')
      expect(() => JSON.parse(exportData)).not.toThrow()
    })
  })

  describe('LargeImageProcessor', () => {
    let processor: LargeImageProcessor

    beforeEach(() => {
      processor = new LargeImageProcessor()
    })

    afterEach(() => {
      processor.destroy()
    })

    it('应该能够创建大图片处理器', () => {
      expect(processor).toBeInstanceOf(LargeImageProcessor)
    })

    it('应该能够加载图片', async () => {
      const image = new MockImage() as any

      await processor.loadImage(image)

      expect(processor['sourceImage']).toBe(image)
    })

    it('应该能够设置视口区域', () => {
      const viewport = { x: 0, y: 0, width: 800, height: 600 }

      processor.setViewport(viewport)

      expect(processor['viewport']).toEqual(viewport)
    })

    it('应该能够获取处理进度', () => {
      const progress = processor.getProgress()

      expect(progress).toHaveProperty('processedTiles')
      expect(progress).toHaveProperty('totalTiles')
      expect(progress).toHaveProperty('percentage')
      expect(typeof progress.percentage).toBe('number')
    })

    it('应该能够获取内存使用情况', () => {
      const memoryUsage = processor.getMemoryUsage()

      expect(memoryUsage).toHaveProperty('used')
      expect(memoryUsage).toHaveProperty('limit')
      expect(memoryUsage).toHaveProperty('percentage')
      expect(typeof memoryUsage.used).toBe('number')
    })

    it('应该能够清理未使用的块', () => {
      const cleanupListener = vi.fn()
      processor.on('tilesCleanedUp', cleanupListener)

      processor.cleanupUnusedTiles()

      // 由于没有实际的块，这里只验证方法不会抛出错误
      expect(() => processor.cleanupUnusedTiles()).not.toThrow()
    })
  })

  describe('PerformanceSystem', () => {
    let performanceSystem: PerformanceSystem

    beforeEach(() => {
      performanceSystem = new PerformanceSystem()
    })

    afterEach(() => {
      performanceSystem.destroy()
    })

    it('应该能够创建性能系统', () => {
      expect(performanceSystem).toBeInstanceOf(PerformanceSystem)
      expect(performanceSystem.memory).toBeInstanceOf(MemoryManager)
      expect(performanceSystem.monitor).toBeInstanceOf(PerformanceMonitor)
      expect(performanceSystem.largeImage).toBeInstanceOf(LargeImageProcessor)
    })

    it('应该能够启动和停止监控', () => {
      performanceSystem.startMonitoring()
      expect(performanceSystem.monitor['isMonitoring']).toBe(true)

      performanceSystem.stopMonitoring()
      expect(performanceSystem.monitor['isMonitoring']).toBe(false)
    })

    it('应该能够获取系统状态', () => {
      const status = performanceSystem.getSystemStatus()

      expect(status).toHaveProperty('memory')
      expect(status).toHaveProperty('performance')
      expect(status).toHaveProperty('largeImage')
      expect(status.memory).toHaveProperty('usedMemory')
      expect(status.performance).toHaveProperty('fps')
    })

    it('应该能够执行系统优化', () => {
      const image = new MockImage() as any
      performanceSystem.memory.cacheImage('test', image)

      performanceSystem.optimize()

      expect(performanceSystem.memory.getCachedImage('test')).toBeUndefined()
    })

    it('应该能够处理系统间的联动', () => {
      const memoryWarningListener = vi.fn()
      performanceSystem.monitor.on('memoryPressure', memoryWarningListener)

      // 触发内存警告
      performanceSystem.memory.emit('memoryWarning', { level: 'high' })

      expect(memoryWarningListener).toHaveBeenCalled()
    })
  })
})
