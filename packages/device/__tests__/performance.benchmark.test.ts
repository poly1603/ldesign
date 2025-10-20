/**
 * 性能基准测试套件
 * 
 * 测试目标：
 * - 内存使用情况
 * - 事件处理性能
 * - 模块加载性能
 * - 缓存效率
 * - GC压力测试
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { DeviceDetector } from '../src/core/DeviceDetector'
import { EventEmitter } from '../src/core/EventEmitter'
import { ModuleLoader } from '../src/core/ModuleLoader'
import { memoryManager, ObjectPool } from '../src/utils/MemoryManager'
import { PerformanceMonitor } from '../src/utils/PerformanceMonitor'

// 性能监控器
const perfMonitor = new PerformanceMonitor({
  enabled: true,
  thresholds: {
    fps: 30,
    memory: 80,
    executionTime: 100
  }
})

describe('性能基准测试', () => {
  beforeAll(() => {
    perfMonitor.start()
  })

  afterAll(() => {
    perfMonitor.stop()
    const report = perfMonitor.getReport()
    console.log('性能报告:', JSON.stringify(report, null, 2))
  })

  describe('DeviceDetector 性能测试', () => {
    it('设备检测性能 - 1000次检测', async () => {
      const detector = new DeviceDetector()
      const startMemory = getMemoryUsage()
      
      const duration = await perfMonitor.measureAsync('device-detection-1000', async () => {
        for (let i = 0; i < 1000; i++) {
          detector.getDeviceInfo()
        }
      })

      const endMemory = getMemoryUsage()
      const memoryIncrease = endMemory - startMemory

      expect(duration).toBeLessThan(100) // 应在100ms内完成
      expect(memoryIncrease).toBeLessThan(5) // 内存增长不超过5MB
      
      await detector.destroy()
    })

    it('事件触发性能 - 10000次事件', async () => {
      const detector = new DeviceDetector()
      let eventCount = 0

      detector.on('deviceChange', () => {
        eventCount++
      })

      const duration = await perfMonitor.measureAsync('event-emit-10000', async () => {
        for (let i = 0; i < 10000; i++) {
          detector['emit']('deviceChange', detector.getDeviceInfo())
        }
      })

      expect(eventCount).toBe(10000)
      expect(duration).toBeLessThan(200) // 应在200ms内完成
      
      await detector.destroy()
    })

    it('模块加载性能 - 并发加载', async () => {
      const detector = new DeviceDetector()
      
      const duration = await perfMonitor.measureAsync('module-load-concurrent', async () => {
        await Promise.all([
          detector.loadModule('network'),
          detector.loadModule('battery'),
          detector.loadModule('performance')
        ])
      })

      expect(duration).toBeLessThan(500) // 应在500ms内完成
      expect(detector.getLoadedModules()).toHaveLength(3)
      
      await detector.destroy()
    })
  })

  describe('EventEmitter 性能测试', () => {
    it('大量监听器性能 - 1000个监听器', () => {
      const emitter = new EventEmitter()
      const listeners: Array<() => void> = []

      // 添加1000个监听器
      const addDuration = perfMonitor.measure('add-1000-listeners', () => {
        for (let i = 0; i < 1000; i++) {
          const listener = () => { /* noop */ }
          listeners.push(listener)
          emitter.on('test', listener)
        }
      })

      expect(addDuration).toBeLessThan(50) // 添加应在50ms内完成

      // 触发事件
      const emitDuration = perfMonitor.measure('emit-to-1000-listeners', () => {
        emitter.emit('test', {})
      })

      expect(emitDuration).toBeLessThan(10) // 触发应在10ms内完成

      // 清理
      listeners.forEach(l => emitter.off('test', l))
    })

    it('优先级排序性能', () => {
      const emitter = new EventEmitter()
      const results: number[] = []

      // 添加不同优先级的监听器
      const addDuration = perfMonitor.measure('priority-listeners', () => {
        for (let i = 0; i < 100; i++) {
          const priority = Math.random() * 100
          emitter.on('test', () => results.push(priority), { priority })
        }
      })

      expect(addDuration).toBeLessThan(20)

      // 触发事件
      emitter.emit('test', {})

      // 验证按优先级执行
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]).toBeGreaterThanOrEqual(results[i])
      }
    })
  })

  describe('内存管理器性能测试', () => {
    it('对象池性能 - 10000次获取/释放', () => {
      const pool = new ObjectPool({
        maxSize: 100,
        createFn: () => ({ data: new Array(100).fill(0) }),
        resetFn: (obj) => { obj.data.fill(0) }
      })

      const duration = perfMonitor.measure('object-pool-10000', () => {
        for (let i = 0; i < 10000; i++) {
          const obj = pool.acquire()
          // 使用对象
          obj.data[0] = i
          pool.release(obj)
        }
      })

      expect(duration).toBeLessThan(100) // 应在100ms内完成
      
      const stats = pool.getStats()
      expect(stats.poolSize).toBeGreaterThan(0)
      expect(stats.poolSize).toBeLessThanOrEqual(100)
    })

    it('内存压力测试', async () => {
      const startMemory = getMemoryUsage()
      const objects: any[] = []

      // 创建大量对象
      for (let i = 0; i < 1000; i++) {
        objects.push({
          data: new Array(1000).fill(Math.random()),
          nested: {
            deep: {
              value: Math.random()
            }
          }
        })
      }

      const peakMemory = getMemoryUsage()
      const memoryIncrease = peakMemory - startMemory

      // 触发GC建议
      memoryManager.suggestGC()

      // 清理
      objects.length = 0

      // 等待一段时间让GC运行
      await new Promise(resolve => setTimeout(resolve, 100))

      const endMemory = getMemoryUsage()
      const memoryRecovered = peakMemory - endMemory

      console.log(`内存测试: 峰值增加 ${memoryIncrease.toFixed(2)}MB, 回收 ${memoryRecovered.toFixed(2)}MB`)
      
      expect(memoryRecovered).toBeGreaterThan(memoryIncrease * 0.5) // 至少回收50%
    })
  })

  describe('缓存性能测试', () => {
    it('缓存命中率测试', async () => {
      const detector = new DeviceDetector()
      const iterations = 10000
      let cacheHits = 0

      // 预热缓存
      detector.getDeviceInfo()

      const duration = await perfMonitor.measureAsync('cache-hit-test', async () => {
        for (let i = 0; i < iterations; i++) {
          const info = detector['detectDevice']()
          // 检查是否使用了缓存（通过检测时间判断）
          if (detector['detectionMetrics'].lastDetectionDuration < 1) {
            cacheHits++
          }
        }
      })

      const hitRate = (cacheHits / iterations) * 100
      console.log(`缓存命中率: ${hitRate.toFixed(2)}%`)

      expect(hitRate).toBeGreaterThan(90) // 命中率应大于90%
      expect(duration).toBeLessThan(100) // 应在100ms内完成

      await detector.destroy()
    })
  })

  describe('并发性能测试', () => {
    it('并发事件处理', async () => {
      const detector = new DeviceDetector()
      const results: number[] = []

      // 添加多个监听器
      for (let i = 0; i < 10; i++) {
        detector.on('deviceChange', () => {
          results.push(Date.now())
        })
      }

      const duration = await perfMonitor.measureAsync('concurrent-events', async () => {
        // 并发触发多个事件
        await Promise.all(
          Array(100).fill(0).map(() => 
            new Promise<void>(resolve => {
              detector['emit']('deviceChange', detector.getDeviceInfo())
              resolve()
            })
          )
        )
      })

      expect(results.length).toBe(1000) // 10个监听器 × 100个事件
      expect(duration).toBeLessThan(500)

      await detector.destroy()
    })
  })
})

/**
 * 获取内存使用量（MB）
 */
function getMemoryUsage(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed / 1024 / 1024
  }
  
  if (typeof window !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024
  }
  
  return 0
}

/**
 * 模拟GC压力
 */
function createGCPressure(size = 1000000): void {
  const arrays: any[] = []
  for (let i = 0; i < 100; i++) {
    arrays.push(new Array(size / 100).fill(Math.random()))
  }
  // 立即释放引用
  arrays.length = 0
}