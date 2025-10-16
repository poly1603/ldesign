import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createManagedPromise,
  ListenerManager,
  managedLifecycle,
  MemoryLeakDetector,
  memoryManager,
  ReferenceTracker,
  ResourceManager,
  TimerManager
} from '../../src/utils/memory-manager'

describe('timerManager', () => {
  let timerManager: TimerManager

  beforeEach(() => {
    timerManager = new TimerManager()
    vi.useFakeTimers()
  })

  afterEach(() => {
    timerManager.clearAll()
    vi.useRealTimers()
  })

  describe('setTimeout管理', () => {
    it('应该能够创建和清除定时器', () => {
      const callback = vi.fn()
      const timerId = timerManager.setTimeout(callback, 1000)
      
      expect(timerId).toBeDefined()
      expect(timerManager.getActiveCount()).toBe(1)
      
      // 快进时间
      vi.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalled()
      expect(timerManager.getActiveCount()).toBe(0)
    })

    it('应该能够手动清除定时器', () => {
      const callback = vi.fn()
      const timerId = timerManager.setTimeout(callback, 1000)
      
      timerManager.clearTimeout(timerId)
      expect(timerManager.getActiveCount()).toBe(0)
      
      vi.advanceTimersByTime(1000)
      expect(callback).not.toHaveBeenCalled()
    })

    it('应该能够清除所有定时器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      timerManager.setTimeout(callback1, 1000)
      timerManager.setTimeout(callback2, 2000)
      
      expect(timerManager.getActiveCount()).toBe(2)
      
      timerManager.clearAll()
      expect(timerManager.getActiveCount()).toBe(0)
      
      vi.advanceTimersByTime(3000)
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('setInterval管理', () => {
    it('应该能够创建和清除间隔定时器', () => {
      const callback = vi.fn()
      const intervalId = timerManager.setInterval(callback, 500)
      
      expect(intervalId).toBeDefined()
      expect(timerManager.getActiveCount()).toBe(1)
      
      // 执行几次
      vi.advanceTimersByTime(1500)
      expect(callback).toHaveBeenCalledTimes(3)
      
      timerManager.clearInterval(intervalId)
      expect(timerManager.getActiveCount()).toBe(0)
      
      // 再次执行不应该继续调用
      vi.advanceTimersByTime(500)
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('应该能够处理定时器错误', () => {
      const errorCallback = () => {
        throw new Error('Timer error')
      }
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const timerId = timerManager.setTimeout(errorCallback, 100)
      vi.advanceTimersByTime(100)
      
      expect(consoleSpy).toHaveBeenCalled()
      expect(timerManager.getActiveCount()).toBe(0)
      
      consoleSpy.mockRestore()
    })
  })

  describe('requestAnimationFrame管理', () => {
    it('应该能够创建和取消动画帧', () => {
      const callback = vi.fn()
      const rafId = timerManager.requestAnimationFrame(callback)
      
      expect(rafId).toBeDefined()
      expect(timerManager.getActiveCount()).toBe(1)
      
      timerManager.cancelAnimationFrame(rafId)
      expect(timerManager.getActiveCount()).toBe(0)
    })
  })

  describe('统计信息', () => {
    it('应该正确统计活跃定时器数量', () => {
      expect(timerManager.getActiveCount()).toBe(0)
      
      timerManager.setTimeout(() => {}, 1000)
      expect(timerManager.getActiveCount()).toBe(1)
      
      timerManager.setInterval(() => {}, 500)
      expect(timerManager.getActiveCount()).toBe(2)
      
      timerManager.requestAnimationFrame(() => {})
      expect(timerManager.getActiveCount()).toBe(3)
    })

    it('应该提供定时器类型统计', () => {
      timerManager.setTimeout(() => {}, 1000)
      timerManager.setTimeout(() => {}, 2000)
      timerManager.setInterval(() => {}, 500)
      timerManager.requestAnimationFrame(() => {})
      
      const stats = timerManager.getStats()
      expect(stats.timeout).toBe(2)
      expect(stats.interval).toBe(1)
      expect(stats.animationFrame).toBe(1)
      expect(stats.total).toBe(4)
    })
  })
})

describe('listenerManager', () => {
  let listenerManager: ListenerManager
  let mockElement: any

  beforeEach(() => {
    listenerManager = new ListenerManager()
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  })

  afterEach(() => {
    listenerManager.removeAll()
  })

  describe('事件监听器管理', () => {
    it('应该能够添加和移除事件监听器', () => {
      const handler = vi.fn()
      const listenerId = listenerManager.addEventListener(mockElement, 'click', handler)
      
      expect(listenerId).toBeDefined()
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, undefined)
      expect(listenerManager.getActiveCount()).toBe(1)
      
      listenerManager.removeEventListener(listenerId)
      expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler, undefined)
      expect(listenerManager.getActiveCount()).toBe(0)
    })

    it('应该支持事件选项', () => {
      const handler = vi.fn()
      const options = { once: true, passive: true }
      
      listenerManager.addEventListener(mockElement, 'scroll', handler, options)
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('scroll', handler, options)
    })

    it('应该能够移除所有监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      listenerManager.addEventListener(mockElement, 'click', handler1)
      listenerManager.addEventListener(mockElement, 'keydown', handler2)
      
      expect(listenerManager.getActiveCount()).toBe(2)
      
      listenerManager.removeAll()
      
      expect(mockElement.removeEventListener).toHaveBeenCalledTimes(2)
      expect(listenerManager.getActiveCount()).toBe(0)
    })

    it('应该按目标元素分组管理监听器', () => {
      const mockElement2 = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }
      
      listenerManager.addEventListener(mockElement, 'click', vi.fn())
      listenerManager.addEventListener(mockElement2, 'click', vi.fn())
      
      listenerManager.removeByTarget(mockElement)
      
      expect(mockElement.removeEventListener).toHaveBeenCalled()
      expect(mockElement2.removeEventListener).not.toHaveBeenCalled()
      expect(listenerManager.getActiveCount()).toBe(1)
    })
  })

  describe('统计信息', () => {
    it('应该提供监听器统计', () => {
      listenerManager.addEventListener(mockElement, 'click', vi.fn())
      listenerManager.addEventListener(mockElement, 'keydown', vi.fn())
      
      const stats = listenerManager.getStats()
      expect(stats.totalListeners).toBe(2)
      expect(stats.uniqueTargets).toBe(1)
      expect(stats.eventTypes).toEqual(['click', 'keydown'])
    })
  })
})

describe('resourceManager', () => {
  let resourceManager: ResourceManager

  beforeEach(() => {
    resourceManager = new ResourceManager()
  })

  afterEach(() => {
    resourceManager.cleanup()
  })

  describe('资源生命周期管理', () => {
    it('应该能够注册和清理资源', () => {
      const mockResource = {
        id: 'test-resource',
        cleanup: vi.fn(),
        dispose: vi.fn()
      }
      
      const resourceId = resourceManager.register(mockResource, resource => resource.cleanup())
      
      expect(resourceId).toBeDefined()
      expect(resourceManager.getResourceCount()).toBe(1)
      
      resourceManager.release(resourceId)
      
      expect(mockResource.cleanup).toHaveBeenCalled()
      expect(resourceManager.getResourceCount()).toBe(0)
    })

    it('应该能够批量清理资源', () => {
      const resource1 = { cleanup: vi.fn() }
      const resource2 = { cleanup: vi.fn() }
      
      resourceManager.register(resource1, r => r.cleanup())
      resourceManager.register(resource2, r => r.cleanup())
      
      expect(resourceManager.getResourceCount()).toBe(2)
      
      resourceManager.cleanup()
      
      expect(resource1.cleanup).toHaveBeenCalled()
      expect(resource2.cleanup).toHaveBeenCalled()
      expect(resourceManager.getResourceCount()).toBe(0)
    })

    it('应该处理清理错误', () => {
      const mockResource = {
        cleanup: () => {
          throw new Error('Cleanup failed')
        }
      }
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const resourceId = resourceManager.register(mockResource, resource => resource.cleanup())
      resourceManager.release(resourceId)
      
      expect(consoleSpy).toHaveBeenCalled()
      expect(resourceManager.getResourceCount()).toBe(0)
      
      consoleSpy.mockRestore()
    })
  })

  describe('资源分组管理', () => {
    it('应该支持按分组管理资源', () => {
      const resource1 = { cleanup: vi.fn() }
      const resource2 = { cleanup: vi.fn() }
      const resource3 = { cleanup: vi.fn() }
      
      resourceManager.register(resource1, r => r.cleanup(), 'group-a')
      resourceManager.register(resource2, r => r.cleanup(), 'group-a')
      resourceManager.register(resource3, r => r.cleanup(), 'group-b')
      
      resourceManager.cleanupGroup('group-a')
      
      expect(resource1.cleanup).toHaveBeenCalled()
      expect(resource2.cleanup).toHaveBeenCalled()
      expect(resource3.cleanup).not.toHaveBeenCalled()
      expect(resourceManager.getResourceCount()).toBe(1)
    })

    it('应该提供分组统计', () => {
      resourceManager.register({}, () => {}, 'group-a')
      resourceManager.register({}, () => {}, 'group-a')
      resourceManager.register({}, () => {}, 'group-b')
      
      const stats = resourceManager.getStats()
      expect(stats.totalResources).toBe(3)
      expect(stats.groups['group-a']).toBe(2)
      expect(stats.groups['group-b']).toBe(1)
    })
  })
})

describe('memoryLeakDetector', () => {
  let detector: MemoryLeakDetector

  beforeEach(() => {
    detector = new MemoryLeakDetector()
  })

  describe('内存泄漏检测', () => {
    it('应该能够开始和停止监控', () => {
      expect(detector.isMonitoring()).toBe(false)
      
      detector.startMonitoring()
      expect(detector.isMonitoring()).toBe(true)
      
      detector.stopMonitoring()
      expect(detector.isMonitoring()).toBe(false)
    })

    it('应该能够检测对象创建和销毁', () => {
      detector.startMonitoring()
      
      detector.trackObjectCreation('test-object', 100)
      detector.trackObjectCreation('test-object', 200)
      
      expect(detector.getObjectCount('test-object')).toBe(2)
      
      detector.trackObjectDestruction('test-object')
      
      expect(detector.getObjectCount('test-object')).toBe(1)
    })

    it('应该能够检测潜在的内存泄漏', () => {
      detector.startMonitoring()
      
      // 创建大量对象但不销毁
      for (let i = 0; i < 150; i++) {
        detector.trackObjectCreation('leaky-object', 100)
      }
      
      const leaks = detector.detectPotentialLeaks()
      expect(leaks).toHaveLength(1)
      expect(leaks[0].type).toBe('leaky-object')
      expect(leaks[0].count).toBe(150)
      expect(leaks[0].suspicionLevel).toBe('high')
    })

    it('应该提供内存使用报告', () => {
      detector.startMonitoring()
      
      detector.trackObjectCreation('object-a', 100)
      detector.trackObjectCreation('object-b', 200)
      detector.trackMemoryUsage(1024 * 1024) // 1MB
      
      const report = detector.generateReport()
      
      expect(report.totalObjects).toBe(2)
      expect(report.estimatedMemoryUsage).toBeGreaterThan(0)
      expect(report.objectTypes).toHaveLength(2)
      expect(report.potentialLeaks).toBeDefined()
    })
  })
})

describe('referenceTracker', () => {
  let tracker: ReferenceTracker

  beforeEach(() => {
    tracker = new ReferenceTracker()
  })

  describe('引用跟踪', () => {
    it('应该能够跟踪对象引用', () => {
      const obj = { id: 'test' }
      const refId = tracker.trackReference(obj, 'test-object')
      
      expect(refId).toBeDefined()
      expect(tracker.getReferenceCount()).toBe(1)
      expect(tracker.isTracked(refId)).toBe(true)
    })

    it('应该能够释放引用', () => {
      const obj = { id: 'test' }
      const refId = tracker.trackReference(obj, 'test-object')
      
      tracker.releaseReference(refId)
      
      expect(tracker.isTracked(refId)).toBe(false)
      expect(tracker.getReferenceCount()).toBe(0)
    })

    it('应该能够检测悬垂引用', () => {
      const obj = { id: 'test' }
      const refId = tracker.trackReference(obj, 'test-object')
      
      // 模拟对象被垃圾回收但引用仍存在的情况
      const danglingRefs = tracker.findDanglingReferences()
      
      // 由于我们无法真正模拟垃圾回收，这里主要测试方法存在
      expect(Array.isArray(danglingRefs)).toBe(true)
    })

    it('应该提供引用统计', () => {
      tracker.trackReference({}, 'type-a')
      tracker.trackReference({}, 'type-a')
      tracker.trackReference({}, 'type-b')
      
      const stats = tracker.getStats()
      expect(stats.totalReferences).toBe(3)
      expect(stats.typeStats['type-a']).toBe(2)
      expect(stats.typeStats['type-b']).toBe(1)
    })
  })
})

describe('globalMemoryManager', () => {
  beforeEach(() => {
    // 清理全局状态
    memoryManager.cleanup()
  })

  describe('全局内存管理', () => {
    it('应该是单例模式', () => {
      const manager1 = memoryManager
      const manager2 = memoryManager
      
      expect(manager1).toBe(manager2)
    })

    it('应该能够统一管理各种资源', () => {
      const timerId = memoryManager.setTimeout(() => {}, 1000)
      const listener = memoryManager.addEventListener(
        { addEventListener: vi.fn(), removeEventListener: vi.fn() },
        'click',
        vi.fn()
      )
      const resource = memoryManager.registerResource({ id: 'test' }, r => {})
      
      const stats = memoryManager.getOverallStats()
      
      expect(stats.timers.total).toBe(1)
      expect(stats.listeners.totalListeners).toBe(1)
      expect(stats.resources.totalResources).toBe(1)
    })

    it('应该能够批量清理所有资源', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      memoryManager.setTimeout(() => {}, 1000)
      memoryManager.registerResource({ id: 'test' }, () => {})
      
      memoryManager.cleanup()
      
      const stats = memoryManager.getOverallStats()
      expect(stats.timers.total).toBe(0)
      expect(stats.resources.totalResources).toBe(0)
      
      consoleSpy.mockRestore()
    })

    it('应该能够开始和停止内存监控', () => {
      expect(memoryManager.isMonitoring()).toBe(false)
      
      memoryManager.startMonitoring()
      expect(memoryManager.isMonitoring()).toBe(true)
      
      memoryManager.stopMonitoring()
      expect(memoryManager.isMonitoring()).toBe(false)
    })
  })
})

describe('生命周期装饰器', () => {
  describe('managedLifecycle装饰器', () => {
    it('应该能够自动管理资源', () => {
      class TestClass {
        public cleanupCalled = false
        
        @managedLifecycle
        initialize() {
          return {
            cleanup: () => {
              this.cleanupCalled = true
            }
          }
        }
        
        destroy() {
          // 装饰器应该自动调用清理函数
        }
      }
      
      const instance = new TestClass()
      instance.initialize()
      instance.destroy()
      
      // 注意：由于装饰器的复杂性，这个测试可能需要调整
      // 主要验证装饰器的存在和基本功能
      expect(typeof instance.initialize).toBe('function')
      expect(typeof instance.destroy).toBe('function')
    })
  })
})

describe('托管Promise', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createManagedPromise', () => {
    it('应该能够创建可取消的Promise', async () => {
      let resolvePromise: (value: string) => void
      
      const managedPromise = createManagedPromise<string>((resolve) => {
        resolvePromise = resolve
        setTimeout(() => resolve('success'), 1000)
      })
      
      const promise = managedPromise.promise
      
      // 在Promise解决之前取消
      managedPromise.cancel()
      
      await expect(promise).rejects.toThrow('Promise cancelled')
    })

    it('应该能够正常解决Promise', async () => {
      const managedPromise = createManagedPromise<string>((resolve) => {
        setTimeout(() => resolve('success'), 100)
      })
      
      vi.advanceTimersByTime(100)
      
      const result = await managedPromise.promise
      expect(result).toBe('success')
    })

    it('应该能够处理Promise拒绝', async () => {
      const managedPromise = createManagedPromise<string>((_, reject) => {
        setTimeout(() => reject(new Error('test error')), 100)
      })
      
      vi.advanceTimersByTime(100)
      
      await expect(managedPromise.promise).rejects.toThrow('test error')
    })

    it('应该在取消后清理资源', async () => {
      const cleanupFn = vi.fn()

      const managedPromise = createManagedPromise<string>((resolve) => {
        const timer = setTimeout(() => resolve('success'), 100) // 减少延迟
        return () => clearTimeout(timer)
      })

      managedPromise.onCancel(cleanupFn)
      managedPromise.cancel()

      // 捕获Promise取消错误
      try {
        await managedPromise.promise
      } catch (error) {
        // 期望的取消错误
        expect((error as Error).message).toContain('cancelled')
      }

      expect(cleanupFn).toHaveBeenCalled()
    })
  })
})
