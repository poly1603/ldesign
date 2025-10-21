/**
 * 性能优化集成测试
 */

import { describe, expect, it, beforeEach } from 'vitest'
import { createEngine } from '../../src/core/engine'

describe('Performance Optimization Integration', () => {
  let engine: ReturnType<typeof createEngine>

  beforeEach(() => {
    engine = createEngine({
      debug: false,
      cache: { maxSize: 200 },
      performance: { enabled: true }
    })
  })

  afterEach(async () => {
    if (engine) {
      await engine.destroy()
    }
  })

  it('懒加载管理器应减少初始化时间', () => {
    const startTime = performance.now()
    const testEngine = createEngine({ debug: false })
    const initTime = performance.now() - startTime

    // 未访问任何管理器时，初始化应该很快（<10ms）
    expect(initTime).toBeLessThan(10)

    // 访问管理器会触发懒加载
    const eventsAccess = performance.now()
    const _ = testEngine.events
    const eventsTime = performance.now() - eventsAccess

    expect(eventsTime).toBeLessThan(5) // 单个管理器初始化应该很快

    testEngine.destroy()
  })

  it('LRU缓存应提升状态读取性能', () => {
    // 设置100个状态
    const setStart = performance.now()
    for (let i = 0; i < 100; i++) {
      engine.state.set(`key${i}`, { value: i })
    }
    const setTime = performance.now() - setStart

    // 读取这100个状态（应命中LRU缓存）
    const getStart = performance.now()
    for (let i = 0; i < 100; i++) {
      engine.state.get(`key${i}`)
    }
    const getTime = performance.now() - getStart

    // 读取应该比写入快（因为有缓存）
    expect(getTime).toBeLessThan(setTime * 0.5)

    // 再次读取应该更快（完全命中缓存）
    const getStart2 = performance.now()
    for (let i = 0; i < 100; i++) {
      engine.state.get(`key${i}`)
    }
    const getTime2 = performance.now() - getStart2

    expect(getTime2).toBeLessThan(getTime)
  })

  it('缓存分片应支持大量数据', async () => {
    // 创建大缓存（应启用分片）
    const largeEngine = createEngine({
      cache: { maxSize: 500 }
    })

    const start = performance.now()

    // 写入500个项
    for (let i = 0; i < 500; i++) {
      await largeEngine.cache.set(`key${i}`, { data: `value${i}` })
    }

    const writeTime = performance.now() - start

    // 读取500个项
    const readStart = performance.now()
    for (let i = 0; i < 500; i++) {
      await largeEngine.cache.get(`key${i}`)
    }
    const readTime = performance.now() - readStart

    // 分片应该使写入和读取都保持高性能
    expect(writeTime).toBeLessThan(1000) // <1秒
    expect(readTime).toBeLessThan(500) // <0.5秒

    await largeEngine.destroy()
  })

  it('自适应内存监控应检测内存压力', async () => {
    const perfEngine = createEngine({
      performance: { enabled: true }
    })

    perfEngine.performance.startMonitoring()

    // 模拟内存密集操作
    const largeData = new Array(1000).fill(0).map((_, i) => ({
      id: i,
      data: new Array(100).fill(i)
    }))

    await perfEngine.cache.set('largeData', largeData)

    // 等待内存采样
    await new Promise(resolve => setTimeout(resolve, 100))

    const memoryInfo = perfEngine.performance.getMemoryInfo()
    expect(memoryInfo).toBeDefined()

    if (memoryInfo) {
      expect(memoryInfo.used).toBeGreaterThan(0)
      expect(memoryInfo.limit).toBeGreaterThan(memoryInfo.used)
    }

    perfEngine.performance.stopMonitoring()
    await perfEngine.destroy()
  })

  it('深度克隆优化应处理复杂对象', () => {
    const complexObject = {
      array: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })),
      nested: {
        level1: {
          level2: {
            level3: {
              data: new Array(50).fill('test')
            }
          }
        }
      },
      date: new Date(),
      regex: /test/g,
      map: new Map([['key1', 'value1'], ['key2', 'value2']]),
      set: new Set([1, 2, 3, 4, 5])
    }

    const start = performance.now()
    engine.state.set('complex', complexObject)
    const snapshot = engine.state.getSnapshot()
    const cloneTime = performance.now() - start

    // 优化的克隆应该很快（<50ms）
    expect(cloneTime).toBeLessThan(50)

    // 验证克隆正确性
    expect(snapshot).toHaveProperty('complex')
    expect((snapshot.complex as any).array).toHaveLength(100)
    expect((snapshot.complex as any).date).toBeInstanceOf(Date)
  })

  it('Worker智能调度应优化任务分配', async () => {
    const { createWorkerPool } = await import('../../src/workers/worker-pool')

    const pool = createWorkerPool({
      minWorkers: 2,
      maxWorkers: 4,
      enableSmartScheduling: true,
      enablePreheating: true
    })

    // 等待预热
    await new Promise(resolve => setTimeout(resolve, 200))

    const start = performance.now()

    // 执行混合任务类型
    const tasks = [
      { id: '1', type: 'compute', data: { iterations: 1000 } },
      { id: '2', type: 'transform', data: { data: 'test' } },
      { id: '3', type: 'compute', data: { iterations: 1000 } },
      { id: '4', type: 'transform', data: { data: 'test2' } }
    ]

    await pool.executeBatch(tasks)

    const smartTime = performance.now() - start

    // 智能调度应该合理分配任务
    const status = pool.getStatus()
    expect(status.metrics.completedTasks).toBe(4)

    pool.terminate()

    // 验证性能在合理范围内
    expect(smartTime).toBeLessThan(5000)
  }, { timeout: 10000 })

  it('管理器统计应提供有用信息', () => {
    const stats = engine.getManagerStats()

    expect(stats).toBeDefined()
    expect(stats).toHaveProperty('initialized')
    expect(stats).toHaveProperty('total')
  })
})

function getMemoryUsage(): number {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize
  }
  return 0
}



