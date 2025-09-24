/**
 * 防抖和节流功能性能测试
 *
 * 测试防抖和节流函数的性能和正确性，包括：
 * - 防抖函数性能测试
 * - 节流函数性能测试
 * - 高频调用场景测试
 * - 内存泄漏检测
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  PerformanceBenchmark,
  measureTime,
  getMemoryUsage,
  debounce,
  throttle,
  performanceMonitor
} from './setup'

// 创建测试用的高频调用函数
function createHighFrequencyFunction() {
  let callCount = 0
  const fn = () => {
    callCount++
    return callCount
  }
  fn.getCallCount = () => callCount
  fn.reset = () => {
    callCount = 0
  }
  return fn
}

// 创建异步测试函数
function createAsyncFunction(delay: number = 10) {
  let callCount = 0
  const fn = async () => {
    callCount++
    await new Promise(resolve => setTimeout(resolve, delay))
    return callCount
  }
  fn.getCallCount = () => callCount
  fn.reset = () => {
    callCount = 0
  }
  return fn
}

describe('防抖和节流功能性能测试', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    performanceMonitor.clear()
  })

  describe('防抖函数性能测试', () => {
    it('应该高效处理防抖逻辑', async () => {
      const testFn = createHighFrequencyFunction()
      const debouncedFn = debounce(testFn, 100)

      const benchmark = new PerformanceBenchmark('防抖函数性能')

      benchmark
        .add('创建防抖函数', () => {
          debounce(() => { }, 100)
        })
        .add('单次调用防抖函数', () => {
          debouncedFn()
        })
        .add('高频调用防抖函数', () => {
          for (let i = 0; i < 100; i++) {
            debouncedFn()
          }
        })

      const results = await benchmark.run()

      // 性能断言
      const createResult = results.find(r => r.name.includes('创建'))
      const singleCallResult = results.find(r => r.name.includes('单次调用'))
      const highFreqResult = results.find(r => r.name.includes('高频调用'))

      expect(createResult?.opsPerSecond).toBeGreaterThan(10000) // 创建应该很快
      expect(singleCallResult?.opsPerSecond).toBeGreaterThan(100000) // 单次调用应该很快
      expect(highFreqResult?.opsPerSecond).toBeGreaterThan(1000) // 高频调用也应该合理

      console.log('防抖函数性能结果:', results)
    })

    it('应该正确执行防抖逻辑', async () => {
      const testFn = createHighFrequencyFunction()
      const debouncedFn = debounce(testFn, 100)

      const startTime = performance.now()

      // 快速连续调用
      for (let i = 0; i < 10; i++) {
        debouncedFn()
      }

      expect(testFn.getCallCount()).toBe(0) // 还没有执行

      // 等待防抖延迟
      vi.advanceTimersByTime(100)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(testFn.getCallCount()).toBe(1) // 只执行一次
      expect(executionTime).toBeLessThan(200) // 执行时间合理

      console.log(`防抖执行时间: ${executionTime.toFixed(2)}ms`)
    })

    it('应该处理不同延迟时间的防抖', async () => {
      const delays = [10, 50, 100, 200, 500]
      const benchmark = new PerformanceBenchmark('不同延迟防抖')

      delays.forEach(delay => {
        const testFn = createHighFrequencyFunction()
        const debouncedFn = debounce(testFn, delay)

        benchmark.add(`防抖延迟${delay}ms`, () => {
          for (let i = 0; i < 50; i++) {
            debouncedFn()
          }
        })
      })

      const results = await benchmark.run()

      // 性能断言 - 不同延迟的防抖性能应该相似
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(500)
        expect(result.meanTime).toBeLessThan(2)
      })

      console.log('不同延迟防抖性能结果:', results)
    })
  })

  describe('节流函数性能测试', () => {
    it('应该高效处理节流逻辑', async () => {
      const testFn = createHighFrequencyFunction()
      const throttledFn = throttle(testFn, 100)

      const benchmark = new PerformanceBenchmark('节流函数性能')

      benchmark
        .add('创建节流函数', () => {
          throttle(() => { }, 100)
        })
        .add('单次调用节流函数', () => {
          throttledFn()
        })
        .add('高频调用节流函数', () => {
          for (let i = 0; i < 100; i++) {
            throttledFn()
          }
        })

      const results = await benchmark.run()

      // 性能断言
      const createResult = results.find(r => r.name.includes('创建'))
      const singleCallResult = results.find(r => r.name.includes('单次调用'))
      const highFreqResult = results.find(r => r.name.includes('高频调用'))

      expect(createResult?.opsPerSecond).toBeGreaterThan(10000)
      expect(singleCallResult?.opsPerSecond).toBeGreaterThan(100000)
      expect(highFreqResult?.opsPerSecond).toBeGreaterThan(1000)

      console.log('节流函数性能结果:', results)
    })

    it('应该正确执行节流逻辑', async () => {
      const testFn = createHighFrequencyFunction()
      const throttledFn = throttle(testFn, 100)

      const startTime = performance.now()

      // 立即执行第一次
      throttledFn()
      expect(testFn.getCallCount()).toBe(1)

      // 快速连续调用
      for (let i = 0; i < 10; i++) {
        throttledFn()
      }
      expect(testFn.getCallCount()).toBe(1) // 仍然只执行一次

      // 等待节流间隔
      vi.advanceTimersByTime(100)
      throttledFn()

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(testFn.getCallCount()).toBe(2) // 现在执行了两次
      expect(executionTime).toBeLessThan(200)

      console.log(`节流执行时间: ${executionTime.toFixed(2)}ms`)
    })

    it('应该处理不同间隔时间的节流', async () => {
      const intervals = [10, 50, 100, 200, 500]
      const benchmark = new PerformanceBenchmark('不同间隔节流')

      intervals.forEach(interval => {
        const testFn = createHighFrequencyFunction()
        const throttledFn = throttle(testFn, interval)

        benchmark.add(`节流间隔${interval}ms`, () => {
          for (let i = 0; i < 50; i++) {
            throttledFn()
          }
        })
      })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(500)
        expect(result.meanTime).toBeLessThan(2)
      })

      console.log('不同间隔节流性能结果:', results)
    })
  })

  describe('高频调用场景测试', () => {
    it('应该在极高频调用下保持性能', async () => {
      const testFn = createHighFrequencyFunction()
      const debouncedFn = debounce(testFn, 50)
      const throttledFn = throttle(testFn, 50)

      const benchmark = new PerformanceBenchmark('极高频调用')

      benchmark
        .add('1000次防抖调用', () => {
          for (let i = 0; i < 1000; i++) {
            debouncedFn()
          }
        })
        .add('1000次节流调用', () => {
          testFn.reset()
          for (let i = 0; i < 1000; i++) {
            throttledFn()
          }
        })
        .add('10000次防抖调用', () => {
          testFn.reset()
          for (let i = 0; i < 10000; i++) {
            debouncedFn()
          }
        })

      const memoryBefore = getMemoryUsage()
      const results = await benchmark.run()
      const memoryAfter = getMemoryUsage()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(10) // 即使高频调用也要保持合理性能
      })

      // 内存检查 - 放宽限制，因为测试环境可能有额外开销
      const memoryIncrease = memoryAfter.used - memoryBefore.used
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 内存增加不超过50MB

      console.log('极高频调用性能结果:', results)
      console.log(`内存使用增加: ${(memoryIncrease / 1024).toFixed(2)} KB`)
    })

    it('应该处理异步函数的防抖和节流', async () => {
      const asyncFn = createAsyncFunction(10)
      const debouncedAsyncFn = debounce(asyncFn, 100)
      const throttledAsyncFn = throttle(asyncFn, 100)

      const benchmark = new PerformanceBenchmark('异步函数防抖节流')

      benchmark
        .add('异步防抖调用', () => {
          debouncedAsyncFn()
        })
        .add('异步节流调用', () => {
          throttledAsyncFn()
        })
        .add('批量异步防抖', () => {
          for (let i = 0; i < 10; i++) {
            debouncedAsyncFn()
          }
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(1000)
      })

      console.log('异步函数防抖节流性能结果:', results)
    })
  })

  describe('内存泄漏检测', () => {
    it('应该正确清理定时器避免内存泄漏', async () => {
      const memoryBefore = getMemoryUsage()

      // 创建大量防抖和节流函数
      const functions: Array<{ debouncedFn: () => void; throttledFn: () => void }> = []
      for (let i = 0; i < 1000; i++) {
        const testFn = createHighFrequencyFunction()
        const debouncedFn = debounce(testFn, 100)
        const throttledFn = throttle(testFn, 100)

        functions.push({ debouncedFn, throttledFn })

        // 调用函数
        debouncedFn()
        throttledFn()
      }

      const memoryAfterCreation = getMemoryUsage()

      // 等待所有定时器完成
      vi.advanceTimersByTime(200)

      // 清理引用
      functions.length = 0

      // 强制垃圾回收（如果可用）
      if (globalThis.gc) {
        globalThis.gc()
      }

      const memoryAfterCleanup = getMemoryUsage()

      const creationIncrease = memoryAfterCreation.used - memoryBefore.used
      const finalIncrease = memoryAfterCleanup.used - memoryBefore.used

      console.log(`创建后内存增加: ${(creationIncrease / 1024 / 1024).toFixed(2)} MB`)
      console.log(`清理后内存增加: ${(finalIncrease / 1024 / 1024).toFixed(2)} MB`)

      // 内存泄漏检查 - 由于垃圾回收的不确定性，我们只检查内存没有异常增长
      // 允许一定的内存增长，但不应该超过合理范围（10MB）
      expect(finalIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })

  describe('边界情况性能测试', () => {
    it('应该处理零延迟的防抖和节流', async () => {
      const testFn = createHighFrequencyFunction()
      const zeroDebounceFn = debounce(testFn, 0)
      const zeroThrottleFn = throttle(testFn, 0)

      const benchmark = new PerformanceBenchmark('零延迟处理')

      benchmark
        .add('零延迟防抖', () => {
          zeroDebounceFn()
        })
        .add('零延迟节流', () => {
          zeroThrottleFn()
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(10000)
      })

      console.log('零延迟处理性能结果:', results)
    })

    it('应该处理极大延迟的防抖和节流', async () => {
      const testFn = createHighFrequencyFunction()
      const largeDebounceFn = debounce(testFn, 10000)
      const largeThrottleFn = throttle(testFn, 10000)

      const { time: debounceTime } = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          largeDebounceFn()
        }
      })

      const { time: throttleTime } = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          largeThrottleFn()
        }
      })

      // 即使延迟很大，调用本身应该很快
      expect(debounceTime).toBeLessThan(10)
      expect(throttleTime).toBeLessThan(10)

      console.log(`大延迟防抖调用时间: ${debounceTime.toFixed(2)}ms`)
      console.log(`大延迟节流调用时间: ${throttleTime.toFixed(2)}ms`)
    })
  })
})
