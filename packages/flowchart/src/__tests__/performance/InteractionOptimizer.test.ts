/**
 * 交互性能优化器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  InteractionOptimizer,
  AsyncRenderManager,
  SmartUpdateManager,
  DragOptimizer,
  ZoomOptimizer,
  debounce,
  throttle
} from '../../performance/InteractionOptimizer'

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该延迟执行函数', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('应该取消之前的调用', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('first')
    debouncedFn('second')
    
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('second')
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该限制函数执行频率', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, 100)

    throttledFn('first')
    expect(mockFn).toHaveBeenCalledWith('first')

    throttledFn('second')
    expect(mockFn).toHaveBeenCalledTimes(1) // 不应该立即执行

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('second')
  })
})

describe('AsyncRenderManager', () => {
  let manager: AsyncRenderManager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new AsyncRenderManager(3) // 小批次便于测试
  })

  describe('基础功能', () => {
    it('应该能够创建异步渲染管理器', () => {
      expect(manager).toBeDefined()
      expect(manager.getQueueSize()).toBe(0)
    })

    it('应该能够添加渲染任务', () => {
      const task = vi.fn()
      manager.addRenderTask(task)
      expect(manager.getQueueSize()).toBe(1)
    })

    it('应该能够清空队列', () => {
      manager.addRenderTask(vi.fn())
      manager.addRenderTask(vi.fn())
      expect(manager.getQueueSize()).toBe(2)

      manager.clear()
      expect(manager.getQueueSize()).toBe(0)
    })

    it('应该批量处理渲染任务', async () => {
      const tasks = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()]
      tasks.forEach(task => manager.addRenderTask(task))

      // 等待异步处理
      await new Promise(resolve => setTimeout(resolve, 50))

      tasks.forEach(task => {
        expect(task).toHaveBeenCalled()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理任务执行错误', async () => {
      const errorTask = vi.fn(() => { throw new Error('测试错误') })
      const normalTask = vi.fn()

      manager.addRenderTask(errorTask)
      manager.addRenderTask(normalTask)

      // 等待异步处理
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(errorTask).toHaveBeenCalled()
      expect(normalTask).toHaveBeenCalled()
    })
  })
})

describe('SmartUpdateManager', () => {
  let manager: SmartUpdateManager

  beforeEach(() => {
    manager = new SmartUpdateManager(100) // 100像素阈值
  })

  describe('基础功能', () => {
    it('应该能够创建智能更新管理器', () => {
      expect(manager).toBeDefined()
      expect(manager.getUpdateRegionCount()).toBe(0)
    })

    it('应该能够标记更新区域', () => {
      manager.markUpdateRegion(50, 50, 100, 100)
      expect(manager.getUpdateRegionCount()).toBe(1)
    })

    it('应该能够检查是否需要更新', () => {
      manager.markUpdateRegion(50, 50, 100, 100)
      
      expect(manager.shouldUpdate(75, 75)).toBe(true) // 在更新区域内
      expect(manager.shouldUpdate(200, 200)).toBe(false) // 在更新区域外
    })

    it('应该能够清空更新区域', () => {
      manager.markUpdateRegion(50, 50, 100, 100)
      expect(manager.getUpdateRegionCount()).toBe(1)

      manager.clearUpdateRegions()
      expect(manager.getUpdateRegionCount()).toBe(0)
    })

    it('应该记录上次更新时间', () => {
      const beforeTime = Date.now()
      manager.clearUpdateRegions()
      const afterTime = Date.now()

      const lastUpdateTime = manager.getLastUpdateTime()
      expect(lastUpdateTime).toBeGreaterThanOrEqual(beforeTime)
      expect(lastUpdateTime).toBeLessThanOrEqual(afterTime)
    })
  })
})

describe('DragOptimizer', () => {
  let optimizer: DragOptimizer

  beforeEach(() => {
    optimizer = new DragOptimizer()
  })

  describe('基础功能', () => {
    it('应该能够创建拖拽优化器', () => {
      expect(optimizer).toBeDefined()
      expect(optimizer.isDragActive()).toBe(false)
    })

    it('应该能够开始和结束拖拽', () => {
      optimizer.startDrag(100, 100)
      expect(optimizer.isDragActive()).toBe(true)

      const stats = optimizer.endDrag()
      expect(optimizer.isDragActive()).toBe(false)
      expect(stats).toBeDefined()
      expect(typeof stats.duration).toBe('number')
      expect(typeof stats.distance).toBe('number')
      expect(typeof stats.avgSpeed).toBe('number')
    })

    it('未开始拖拽时结束应该返回零值', () => {
      const stats = optimizer.endDrag()
      expect(stats.duration).toBe(0)
      expect(stats.distance).toBe(0)
      expect(stats.avgSpeed).toBe(0)
    })

    it('应该能够优化拖拽处理器', () => {
      const handler = vi.fn()
      const optimizedHandler = optimizer.optimizeDragHandler(handler)
      
      expect(optimizedHandler).toBeDefined()
      expect(typeof optimizedHandler).toBe('function')
    })
  })
})

describe('ZoomOptimizer', () => {
  let optimizer: ZoomOptimizer

  beforeEach(() => {
    optimizer = new ZoomOptimizer()
  })

  describe('基础功能', () => {
    it('应该能够创建缩放优化器', () => {
      expect(optimizer).toBeDefined()
      expect(optimizer.getZoomLevel()).toBe(1)
    })

    it('应该能够设置和获取缩放级别', () => {
      optimizer.setZoomLevel(1.5)
      expect(optimizer.getZoomLevel()).toBe(1.5)
    })

    it('应该能够获取缩放统计', () => {
      optimizer.setZoomLevel(1.2)
      optimizer.setZoomLevel(1.5)
      
      const stats = optimizer.getZoomStats()
      expect(stats.currentLevel).toBe(1.5)
      expect(stats.historyCount).toBeGreaterThan(0)
      expect(stats.avgZoomLevel).toBeGreaterThan(0)
      expect(stats.lastZoomTime).toBeGreaterThan(0)
    })

    it('应该能够优化缩放处理器', () => {
      const handler = vi.fn()
      const optimizedHandler = optimizer.optimizeZoomHandler(handler)
      
      expect(optimizedHandler).toBeDefined()
      expect(typeof optimizedHandler).toBe('function')
    })
  })
})

describe('InteractionOptimizer', () => {
  let optimizer: InteractionOptimizer

  beforeEach(() => {
    optimizer = new InteractionOptimizer({
      enabled: true,
      debounceDelay: 50,
      throttleInterval: 16,
      asyncRenderBatchSize: 5
    })
  })

  afterEach(() => {
    optimizer.clear()
  })

  describe('基础功能', () => {
    it('应该能够创建交互优化器', () => {
      expect(optimizer).toBeDefined()
    })

    it('应该能够优化拖拽处理器', () => {
      const handler = vi.fn()
      const optimizedHandler = optimizer.optimizeDragHandler(handler)
      
      expect(optimizedHandler).toBeDefined()
      expect(typeof optimizedHandler).toBe('function')
    })

    it('应该能够优化缩放处理器', () => {
      const handler = vi.fn()
      const optimizedHandler = optimizer.optimizeZoomHandler(handler)
      
      expect(optimizedHandler).toBeDefined()
      expect(typeof optimizedHandler).toBe('function')
    })

    it('应该能够添加异步渲染任务', () => {
      const task = vi.fn()
      optimizer.addAsyncRenderTask(task)
      
      const stats = optimizer.getInteractionStats()
      expect(stats.asyncRenderQueueSize).toBeGreaterThan(0)
    })

    it('应该能够标记更新区域', () => {
      optimizer.markUpdateRegion(100, 100, 50, 50)
      
      const stats = optimizer.getInteractionStats()
      expect(stats.updateRegionCount).toBeGreaterThan(0)
    })

    it('应该能够检查是否需要更新', () => {
      optimizer.markUpdateRegion(100, 100, 50, 50)
      
      expect(optimizer.shouldUpdate(125, 125)).toBe(true)
      expect(optimizer.shouldUpdate(300, 300)).toBe(false)
    })
  })

  describe('拖拽功能', () => {
    it('应该能够管理拖拽状态', () => {
      optimizer.startDrag(100, 100)
      
      const stats1 = optimizer.getInteractionStats()
      expect(stats1.dragStats).toBeNull() // 拖拽进行中

      const dragStats = optimizer.endDrag()
      expect(dragStats).toBeDefined()
      expect(dragStats.duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('缩放功能', () => {
    it('应该能够管理缩放状态', () => {
      optimizer.setZoomLevel(1.5)
      
      const stats = optimizer.getInteractionStats()
      expect(stats.zoomStats.currentLevel).toBe(1.5)
    })
  })

  describe('工具函数', () => {
    it('应该能够创建防抖函数', () => {
      const mockFn = vi.fn()
      const debouncedFn = optimizer.createDebounced(mockFn)
      
      expect(debouncedFn).toBeDefined()
      expect(typeof debouncedFn).toBe('function')
    })

    it('应该能够创建节流函数', () => {
      const mockFn = vi.fn()
      const throttledFn = optimizer.createThrottled(mockFn)
      
      expect(throttledFn).toBeDefined()
      expect(typeof throttledFn).toBe('function')
    })
  })

  describe('统计信息', () => {
    it('应该能够获取交互统计', () => {
      const stats = optimizer.getInteractionStats()
      
      expect(stats).toBeDefined()
      expect(typeof stats.asyncRenderQueueSize).toBe('number')
      expect(typeof stats.updateRegionCount).toBe('number')
      expect(stats.zoomStats).toBeDefined()
      expect(typeof stats.lastUpdateTime).toBe('number')
    })
  })

  describe('清理功能', () => {
    it('应该能够清空所有状态', () => {
      optimizer.addAsyncRenderTask(vi.fn())
      optimizer.markUpdateRegion(100, 100, 50, 50)
      
      optimizer.clear()
      
      const stats = optimizer.getInteractionStats()
      expect(stats.asyncRenderQueueSize).toBe(0)
      expect(stats.updateRegionCount).toBe(0)
    })
  })

  describe('禁用状态', () => {
    it('禁用时应该直接执行原函数', () => {
      const disabledOptimizer = new InteractionOptimizer({ enabled: false })
      
      const handler = vi.fn()
      const optimizedHandler = disabledOptimizer.optimizeDragHandler(handler)
      
      expect(optimizedHandler).toBe(handler) // 应该返回原函数
    })

    it('禁用时应该直接执行异步任务', () => {
      const disabledOptimizer = new InteractionOptimizer({ enabled: false })
      
      const task = vi.fn()
      disabledOptimizer.addAsyncRenderTask(task)
      
      expect(task).toHaveBeenCalled() // 应该立即执行
    })
  })
})
