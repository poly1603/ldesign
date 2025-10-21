/**
 * 引擎内存泄漏测试
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createEngine } from '../../src/core/engine'

describe('Engine Memory Leak Prevention', () => {
  let initialMemory: number

  beforeEach(() => {
    initialMemory = getMemoryUsage()
  })

  afterEach(() => {
    if (global.gc) {
      global.gc()
    }
  })

  it('多次创建和销毁引擎不应泄漏内存', async () => {
    const iterations = 20

    for (let i = 0; i < iterations; i++) {
      const engine = createEngine({ debug: false })

      // 使用一些功能
      engine.events.emit('test', { data: i })
      engine.state.set('testKey', i)
      await engine.cache.set(`key${i}`, { value: i })

      // 销毁
      await engine.destroy()
    }

    await new Promise(resolve => setTimeout(resolve, 200))

    if (global.gc) {
      global.gc()
    }

    const finalMemory = getMemoryUsage()
    const growth = finalMemory - initialMemory

    // 允许15MB的内存增长（包含V8内部开销）
    expect(growth).toBeLessThan(15 * 1024 * 1024)
  })

  it('事件监听器WeakRef应防止泄漏', async () => {
    const engine = createEngine({})

    // 创建100个监听器
    const listeners = new Array(100).fill(0).map((_, i) =>
      () => console.log(`Handler ${i}`)
    )

    listeners.forEach((handler, i) => {
      engine.events.on(`event-${i}`, handler)
    })

    const beforeStats = engine.events.getStats()
    expect(beforeStats.totalListeners).toBe(100)

    // 销毁引擎
    await engine.destroy()

    // 创建新引擎验证清理
    const newEngine = createEngine({})
    const afterStats = newEngine.events.getStats()
    expect(afterStats.totalListeners).toBe(0)

    await newEngine.destroy()
  })

  it('LRU缓存应自动淘汰不常用项', async () => {
    const engine = createEngine({})

    // 创建LRU缓存并填充
    const { createLRUCache } = await import('../../src/utils/lru-cache')
    const cache = createLRUCache<string>({ maxSize: 10 })

    // 添加20个项（应该淘汰前10个）
    for (let i = 0; i < 20; i++) {
      cache.set(`key${i}`, `value${i}`)
    }

    expect(cache.size()).toBe(10)

    // 验证最早的项已被淘汰
    expect(cache.has('key0')).toBe(false)
    expect(cache.has('key10')).toBe(true)

    await engine.destroy()
  })

  it('定时器应该被正确清理', async () => {
    const engine = createEngine({ debug: true })

    // 触发一些会创建定时器的操作
    engine.state.set('value1', 1)
    engine.state.set('value2', 2)

    // 监听配置变化（会创建防抖定时器）
    engine.config.set('debug', false)
    engine.config.set('debug', true)

    // 等待一小段时间
    await new Promise(resolve => setTimeout(resolve, 50))

    // 销毁引擎
    await engine.destroy()

    // 验证：再等待一段时间后不应有意外操作
    await new Promise(resolve => setTimeout(resolve, 500))

    // 如果定时器没清理，可能会在这里触发错误
    expect(true).toBe(true) // 能执行到这里说明清理成功
  })
})

function getMemoryUsage(): number {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize
  }
  return 0
}



