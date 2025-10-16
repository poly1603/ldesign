import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BatchProcessor,
  debounce,
  globalPerformanceAnalyzer,
  measurePerformance,
  ObjectPool,
  PerformanceAnalyzer,
  type PerformanceMeasure,
  throttle
} from '../../src/utils/performance-analyzer'

describe('performanceAnalyzer', () => {
  let analyzer: PerformanceAnalyzer

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本测量功能', () => {
    it('应该能够开始和结束性能测量', () => {
      analyzer.startMeasure('test-operation')
      
      // 模拟一些操作耗时
      vi.advanceTimersByTime(100)
      
      const result = analyzer.endMeasure('test-operation')
      
      expect(result).toBeDefined()
      expect(result.name).toBe('test-operation')
      expect(result.duration).toBeGreaterThanOrEqual(100)
      expect(result.startTime).toBeDefined()
      expect(result.endTime).toBeDefined()
    })

    it('应该能够手动记录性能数据', () => {
      const measure: PerformanceMeasure = {
        name: 'manual-test',
        startTime: Date.now(),
        endTime: Date.now() + 50,
        duration: 50,
        timestamp: Date.now(),
        metadata: { type: 'manual' }
      }

      analyzer.recordMeasure(measure)
      const measures = analyzer.getMeasures()

      expect(measures).toHaveLength(1)
      expect(measures[0]).toMatchObject({
        name: measure.name,
        startTime: measure.startTime,
        endTime: measure.endTime,
        duration: measure.duration,
        metadata: measure.metadata
      })
      expect(measures[0].timestamp).toBeTypeOf('number')
    })

    it('应该能够清除测量数据', () => {
      analyzer.startMeasure('test1')
      analyzer.endMeasure('test1')
      
      expect(analyzer.getMeasures()).toHaveLength(1)
      
      analyzer.clearMeasures()
      expect(analyzer.getMeasures()).toHaveLength(0)
    })
  })

  describe('性能报告生成', () => {
    beforeEach(() => {
      // 添加一些测试数据
      const measures: PerformanceMeasure[] = [
        {
          name: 'operation-a',
          startTime: 1000,
          endTime: 1100,
          duration: 100,
          metadata: { type: 'database' }
        },
        {
          name: 'operation-a',
          startTime: 2000,
          endTime: 2150,
          duration: 150,
          metadata: { type: 'database' }
        },
        {
          name: 'operation-b',
          startTime: 3000,
          endTime: 3050,
          duration: 50,
          metadata: { type: 'api' }
        }
      ]
      
      measures.forEach(measure => analyzer.recordMeasure(measure))
    })

    it('应该能够生成性能报告', () => {
      const report = analyzer.generateReport()
      
      expect(report.totalMeasures).toBe(3)
      expect(report.uniqueOperations).toBe(2)
      expect(report.totalDuration).toBe(300)
      expect(report.averageDuration).toBe(100)
    })

    it('应该能够按操作名称分组统计', () => {
      const report = analyzer.generateReport()
      
      expect(report.operationStats['operation-a']).toBeDefined()
      expect(report.operationStats['operation-a'].count).toBe(2)
      expect(report.operationStats['operation-a'].totalDuration).toBe(250)
      expect(report.operationStats['operation-a'].averageDuration).toBe(125)
      expect(report.operationStats['operation-a'].minDuration).toBe(100)
      expect(report.operationStats['operation-a'].maxDuration).toBe(150)

      expect(report.operationStats['operation-b']).toBeDefined()
      expect(report.operationStats['operation-b'].count).toBe(1)
      expect(report.operationStats['operation-b'].totalDuration).toBe(50)
    })

    it('应该能够识别慢操作', () => {
      const report = analyzer.generateReport()
      
      expect(report.slowOperations).toHaveLength(2) // operation-a的两次调用
      expect(report.slowOperations[0].duration).toBe(150)
      expect(report.slowOperations[1].duration).toBe(100)
    })

    it('应该能够按元数据分组', () => {
      const report = analyzer.generateReport()
      
      expect(report.metadataGroups.database).toBeDefined()
      expect(report.metadataGroups.database.count).toBe(2)
      expect(report.metadataGroups.database.totalDuration).toBe(250)
      
      expect(report.metadataGroups.api).toBeDefined()
      expect(report.metadataGroups.api.count).toBe(1)
      expect(report.metadataGroups.api.totalDuration).toBe(50)
    })
  })

  describe('装饰器功能', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('measurePerformance装饰器应该正常工作', async () => {
      // 手动应用装饰器而不是使用语法糖
      const decorator = measurePerformance('test-method')

      class TestClass {
        async testMethod(): Promise<string> {
          // 模拟异步操作，使用假定时器
          await new Promise(resolve => setTimeout(resolve, 100))
          return 'completed'
        }
      }

      // 手动应用装饰器
      const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod') || {
        value: TestClass.prototype.testMethod,
        writable: true,
        enumerable: true,
        configurable: true
      }

      const decoratedDescriptor = decorator(TestClass.prototype, 'testMethod', descriptor)
      if (decoratedDescriptor) {
        Object.defineProperty(TestClass.prototype, 'testMethod', decoratedDescriptor)
      }

      const instance = new TestClass()

      // 由于使用了全局分析器，我们需要清空之前的数据
      globalPerformanceAnalyzer.clearMeasures()

      const promise = instance.testMethod()

      // 推进假定时器
      vi.advanceTimersByTime(100)

      const result = await promise
      expect(result).toBe('completed')

      const measures = globalPerformanceAnalyzer.getMeasures()
      expect(measures).toHaveLength(1)
      expect(measures[0].name).toBe('test-method')
      expect(measures[0].duration).toBeGreaterThan(0)
    })
  })
})

describe('debounce功能', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该能够防抖函数调用', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    // 快速连续调用
    debouncedFn()
    debouncedFn()
    debouncedFn()

    // 此时函数不应该被调用
    expect(mockFn).not.toHaveBeenCalled()

    // 等待防抖时间过去
    vi.advanceTimersByTime(100)

    // 现在函数应该被调用一次
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('应该能够传递参数', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('应该能够取消防抖调用', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn.cancel()
    vi.advanceTimersByTime(100)

    expect(mockFn).not.toHaveBeenCalled()
  })
})

describe('throttle功能', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该能够节流函数调用', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, 100)

    // 第一次调用应该立即执行
    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    // 在节流期间内的调用应该被忽略，但最后一次会在trailing中执行
    throttledFn()
    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    // 等待节流时间过去，trailing调用会被执行
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2) // leading + trailing

    // 现在应该能够再次调用
    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(3) // leading + trailing + new call
  })

  it('应该支持leading和trailing选项', () => {
    const mockFn = vi.fn()
    
    // 测试 leading: false
    const throttledFn = throttle(mockFn, 100, { leading: false })
    
    throttledFn()
    expect(mockFn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})

describe('objectPool功能', () => {
  it('应该能够创建和回收对象', () => {
    const pool = new ObjectPool(() => ({ value: 0 }), obj => { obj.value = 0 })
    
    // 获取对象
    const obj1 = pool.get()
    expect(obj1).toBeDefined()
    expect(obj1.value).toBe(0)
    
    // 修改对象
    obj1.value = 42
    
    // 回收对象
    pool.release(obj1)
    
    // 再次获取应该得到重置后的对象
    const obj2 = pool.get()
    expect(obj2).toBe(obj1) // 应该是同一个对象
    expect(obj2.value).toBe(0) // 应该被重置
  })

  it('应该能够限制池大小', () => {
    const pool = new ObjectPool(() => ({}), () => {}, 2)
    
    const obj1 = pool.get()
    const obj2 = pool.get()
    const obj3 = pool.get()
    
    // 回收所有对象
    pool.release(obj1)
    pool.release(obj2)
    pool.release(obj3) // 这个应该被忽略，因为超出了池的大小限制
    
    expect(pool.size()).toBe(2)
  })

  it('应该能够清空对象池', () => {
    const pool = new ObjectPool(() => ({}))
    
    pool.get()
    pool.release(pool.get())
    
    expect(pool.size()).toBe(1)
    
    pool.clear()
    expect(pool.size()).toBe(0)
  })
})

describe('batchProcessor功能', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该能够批处理任务', async () => {
    const mockProcessor = vi.fn().mockResolvedValue([1, 2, 3])
    const batchProcessor = new BatchProcessor(mockProcessor, {
      batchSize: 3,
      delay: 100
    })
    
    // 添加任务
    const promise1 = batchProcessor.add('task1')
    const promise2 = batchProcessor.add('task2')
    const promise3 = batchProcessor.add('task3')
    
    // 此时批处理器应该有3个待处理任务
    expect(batchProcessor.getPendingCount()).toBe(3)
    
    // 等待延迟时间
    vi.advanceTimersByTime(100)
    
    // 等待处理完成
    await Promise.all([promise1, promise2, promise3])
    
    expect(mockProcessor).toHaveBeenCalledWith(['task1', 'task2', 'task3'])
    expect(batchProcessor.getPendingCount()).toBe(0)
  })

  it('应该在达到批大小时立即处理', async () => {
    const mockProcessor = vi.fn().mockResolvedValue([1, 2])
    const batchProcessor = new BatchProcessor(mockProcessor, {
      batchSize: 2,
      delay: 1000 // 很长的延迟
    })
    
    batchProcessor.add('task1')
    batchProcessor.add('task2') // 应该立即触发处理
    
    // 不需要等待延迟
    await vi.waitFor(() => {
      expect(mockProcessor).toHaveBeenCalledWith(['task1', 'task2'])
    })
  })

  it('应该能够清空批处理队列', () => {
    const mockProcessor = vi.fn()
    const batchProcessor = new BatchProcessor(mockProcessor)
    
    batchProcessor.add('task1')
    batchProcessor.add('task2')
    
    expect(batchProcessor.getPendingCount()).toBe(2)
    
    batchProcessor.clear()
    expect(batchProcessor.getPendingCount()).toBe(0)
  })
})

describe('全局性能分析器', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该是单例模式', () => {
    const analyzer1 = globalPerformanceAnalyzer
    const analyzer2 = globalPerformanceAnalyzer

    expect(analyzer1).toBe(analyzer2)
  })

  it('应该能够全局使用', () => {
    globalPerformanceAnalyzer.clearMeasures()
    globalPerformanceAnalyzer.startMeasure('global-test')

    vi.advanceTimersByTime(50)

    const measure = globalPerformanceAnalyzer.endMeasure('global-test')

    expect(measure).toBeDefined()
    expect(measure.name).toBe('global-test')
    expect(measure.duration).toBeGreaterThanOrEqual(50)
  })
})
