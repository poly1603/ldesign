/**
 * 增强管理器单元测试
 */

import type { Engine } from '../../src/types/engine'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type BatchOptions,
  BatchProcessor,
  EnhancedManager,
} from '../../src/core/enhanced-manager'

// 测试用的管理器实现
class TestManager extends EnhancedManager<
  { enabled: boolean },
  { count: number; status: string }
> {
  protected async onInitialize() {
    this.log('info', '测试管理器初始化')
  }

  protected async onDestroy() {
    this.log('info', '测试管理器销毁')
  }

  // 公开batch方法用于测试
  public async testBatch<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options?: BatchOptions
  ) {
    return this.batch(items, processor, options)
  }

  // 公开事件方法用于测试
  public testEmit<T>(event: string, data?: T) {
    this.emitEvent(event, data)
  }

  public testOn<T>(
    event: string,
    handler: (data: T) => void,
    options?: any
  ) {
    return this.onEvent(event, handler, options)
  }

  public testOff(event: string, id: string) {
    this.offEvent(event, id)
  }

  public testOnce<T>(event: string, handler: (data: T) => void) {
    return this.onceEvent(event, handler)
  }

  public testWaitFor<T>(event: string, timeout?: number) {
    return this.waitForEvent<T>(event, timeout)
  }

  public testSetState(updates: Partial<{ count: number; status: string }>) {
    this.setState(updates)
  }
}

// 模拟Engine
const mockEngine = {
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  events: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
} as unknown as Engine

describe('enhancedManager', () => {
  let manager: TestManager

  beforeEach(() => {
    manager = new TestManager(
      mockEngine,
      'test',
      { enabled: true },
      { count: 0, status: 'idle' }
    )
  })

  afterEach(async () => {
    await manager.destroy()
  })

  describe('状态管理', () => {
    it('应该能获取初始状态', () => {
      const state = manager.state
      expect(state.count).toBe(0)
      expect(state.status).toBe('idle')
    })

    it('应该能更新状态', () => {
      manager.testSetState({ count: 5 })
      expect(manager.state.count).toBe(5)
      expect(manager.state.status).toBe('idle')
    })

    it('应该记录状态历史', () => {
      manager.testSetState({ count: 1 })
      manager.testSetState({ count: 2 })
      manager.testSetState({ status: 'active' })

      const history = manager.getStateHistory()
      expect(history).toHaveLength(3)
      expect(history[0].changes).toEqual({ count: 1 })
      expect(history[1].changes).toEqual({ count: 2 })
      expect(history[2].changes).toEqual({ status: 'active' })
    })

    it('应该能清空状态历史', () => {
      manager.testSetState({ count: 1 })
      manager.testSetState({ count: 2 })
      expect(manager.getStateHistory()).toHaveLength(2)

      manager.clearStateHistory()
      expect(manager.getStateHistory()).toHaveLength(0)
    })

    it('应该在状态变化时触发事件', () => {
      const handler = vi.fn()
      manager.testOn('state:changed', handler)

      manager.testSetState({ count: 10 })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          changes: { count: 10 },
        })
      )
    })

    it('状态应该是只读的', () => {
      const state = manager.state
      expect(() => {
        ;(state as any).count = 999
      }).toThrow()
    })
  })

  describe('事件系统', () => {
    it('应该能监听和触发事件', () => {
      const handler = vi.fn()
      manager.testOn('test:event', handler)

      manager.testEmit('test:event', { message: 'hello' })

      expect(handler).toHaveBeenCalledWith({ message: 'hello' })
    })

    it('应该能移除事件监听器', () => {
      const handler = vi.fn()
      const id = manager.testOn('test:event', handler)

      manager.testEmit('test:event')
      expect(handler).toHaveBeenCalledTimes(1)

      manager.testOff('test:event', id)
      manager.testEmit('test:event')
      expect(handler).toHaveBeenCalledTimes(1) // 不应该再被调用
    })

    it('应该支持once监听器', () => {
      const handler = vi.fn()
      manager.testOnce('test:event', handler)

      manager.testEmit('test:event')
      manager.testEmit('test:event')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该按优先级排序监听器', () => {
      const order: number[] = []

      manager.testOn('test:event', () => order.push(1), { priority: 1 })
      manager.testOn('test:event', () => order.push(3), { priority: 3 })
      manager.testOn('test:event', () => order.push(2), { priority: 2 })

      manager.testEmit('test:event')

      expect(order).toEqual([3, 2, 1])
    })

    it('应该支持异步监听器', async () => {
      const handler = vi.fn()
      manager.testOn('test:event', handler, { async: true })

      manager.testEmit('test:event')

      // 异步监听器不会阻塞
      expect(handler).toHaveBeenCalled()

      await new Promise((resolve) => setTimeout(resolve, 10))
    })

    it('应该能等待事件', async () => {
      setTimeout(() => {
        manager.testEmit('test:event', { data: 'test' })
      }, 50)

      const data = await manager.testWaitFor<{ data: string }>('test:event')
      expect(data.data).toBe('test')
    })

    it('等待事件应该支持超时', async () => {
      await expect(
        manager.testWaitFor('test:event', 100)
      ).rejects.toThrow('超时')
    })

    it('应该能获取事件监听器数量', () => {
      expect(manager.getEventListenerCount()).toBe(0)

      manager.testOn('event1', () => {})
      manager.testOn('event1', () => {})
      manager.testOn('event2', () => {})

      expect(manager.getEventListenerCount()).toBe(3)
      expect(manager.getEventListenerCount('event1')).toBe(2)
      expect(manager.getEventListenerCount('event2')).toBe(1)
    })
  })

  describe('批处理', () => {
    it('应该能批量处理数组（串行）', async () => {
      const items = [1, 2, 3, 4, 5]
      const result = await manager.testBatch(
        items,
        async (item) => item * 2,
        { batchSize: 2, parallel: false }
      )

      expect(result.successCount).toBe(5)
      expect(result.failCount).toBe(0)
      expect(result.successful.map((s) => s.result)).toEqual([2, 4, 6, 8, 10])
    })

    it('应该能批量处理数组（并行）', async () => {
      const items = [1, 2, 3, 4, 5]
      const result = await manager.testBatch(
        items,
        async (item) => item * 2,
        { batchSize: 2, parallel: true }
      )

      expect(result.successCount).toBe(5)
      expect(result.failCount).toBe(0)
    })

    it('应该正确处理错误', async () => {
      const items = [1, 2, 3, 4, 5]
      const result = await manager.testBatch(
        items,
        async (item) => {
          if (item === 3) throw new Error('Error at 3')
          return item * 2
        },
        { continueOnError: true }
      )

      expect(result.successCount).toBe(4)
      expect(result.failCount).toBe(1)
      expect(result.failed[0].item).toBe(3)
    })

    it('应该在错误时停止（continueOnError: false）', async () => {
      const items = [1, 2, 3, 4, 5]

      await expect(
        manager.testBatch(
          items,
          async (item) => {
            if (item === 3) throw new Error('Error at 3')
            return item * 2
          },
          { continueOnError: false }
        )
      ).rejects.toThrow('Error at 3')
    })

    it('应该调用进度回调', async () => {
      const items = [1, 2, 3, 4, 5]
      const progress: number[] = []

      await manager.testBatch(
        items,
        async (item) => item * 2,
        {
          onProgress: (completed, total) => {
            progress.push(completed)
          },
        }
      )

      expect(progress).toEqual([1, 2, 3, 4, 5])
    })

    it('应该调用错误回调', async () => {
      const items = [1, 2, 3]
      const errors: any[] = []

      await manager.testBatch(
        items,
        async (item) => {
          if (item === 2) throw new Error('Error')
          return item
        },
        {
          continueOnError: true,
          onError: (error, item, index) => {
            errors.push({ error, item, index })
          },
        }
      )

      expect(errors).toHaveLength(1)
      expect(errors[0].item).toBe(2)
    })

    it('应该支持批处理延迟', async () => {
      const items = [1, 2, 3]
      const start = Date.now()

      await manager.testBatch(items, async (item) => item, {
        batchSize: 1,
        delay: 50,
      })

      const duration = Date.now() - start
      expect(duration).toBeGreaterThanOrEqual(100) // 至少2个50ms延迟
    })
  })

  describe('销毁管理器', () => {
    it('应该清理所有事件监听器', async () => {
      manager.testOn('event1', () => {})
      manager.testOn('event2', () => {})

      expect(manager.getEventListenerCount()).toBe(2)

      await manager.destroy()

      expect(manager.getEventListenerCount()).toBe(0)
    })

    it('应该清空状态历史', async () => {
      manager.testSetState({ count: 1 })
      expect(manager.getStateHistory()).toHaveLength(1)

      await manager.destroy()

      expect(manager.getStateHistory()).toHaveLength(0)
    })
  })

  describe('统计信息', () => {
    it('应该返回增强的统计信息', () => {
      manager.testOn('event1', () => {})
      manager.testSetState({ count: 5 })

      const stats = manager.getEnhancedStats()

      expect(stats).toHaveProperty('name', 'test')
      expect(stats).toHaveProperty('state')
      expect(stats).toHaveProperty('eventListenerCount')
      expect(stats).toHaveProperty('events')
      expect(stats.eventListenerCount).toBe(1)
      expect(stats.state.count).toBe(5)
    })
  })
})

describe('batchProcessor', () => {
  describe('processArray', () => {
    it('应该批量处理数组', async () => {
      const items = [1, 2, 3, 4, 5]
      const result = await BatchProcessor.processArray(
        items,
        async (item) => item * 2,
        { batchSize: 2 }
      )

      expect(result.successCount).toBe(5)
      expect(result.successful.map((s) => s.result)).toEqual([2, 4, 6, 8, 10])
    })

    it('应该支持并行处理', async () => {
      const items = Array.from({ length: 10 }, (_, i) => i)
      const result = await BatchProcessor.processArray(
        items,
        async (item) => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return item * 2
        },
        { batchSize: 5, parallel: true, maxConcurrency: 3 }
      )

      expect(result.successCount).toBe(10)
    })

    it('应该处理错误', async () => {
      const items = [1, 2, 3]
      const result = await BatchProcessor.processArray(
        items,
        async (item) => {
          if (item === 2) throw new Error('Error')
          return item
        },
        { continueOnError: true }
      )

      expect(result.successCount).toBe(2)
      expect(result.failCount).toBe(1)
    })
  })

  describe('processMap', () => {
    it('应该批量处理Map', async () => {
      const map = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])

      const result = await BatchProcessor.processMap(
        map,
        async (key, value) => `${key}:${value * 2}`,
        { batchSize: 2 }
      )

      expect(result.successCount).toBe(3)
      expect(result.successful.map((s) => s.result)).toEqual([
        'a:2',
        'b:4',
        'c:6',
      ])
    })
  })

  describe('processSet', () => {
    it('应该批量处理Set', async () => {
      const set = new Set([1, 2, 3, 4, 5])

      const result = await BatchProcessor.processSet(
        set,
        async (item) => item * 2,
        { batchSize: 2 }
      )

      expect(result.successCount).toBe(5)
    })
  })
})

describe('性能测试', () => {
  it('批处理应该比顺序处理更快（并行）', async () => {
    const items = Array.from({ length: 20 }, (_, i) => i)

    // 顺序处理
    const start1 = Date.now()
    await BatchProcessor.processArray(
      items,
      async (item) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return item
      },
      { parallel: false }
    )
    const duration1 = Date.now() - start1

    // 并行处理
    const start2 = Date.now()
    await BatchProcessor.processArray(
      items,
      async (item) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return item
      },
      { parallel: true, maxConcurrency: 10 }
    )
    const duration2 = Date.now() - start2

    expect(duration2).toBeLessThan(duration1)
  })

  it('事件系统应该高效处理大量监听器', () => {
    const mockEngine = {
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      events: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
    } as unknown as Engine

    const manager = new TestManager(mockEngine, 'test')

    const start = Date.now()

    // 注册100个监听器
    for (let i = 0; i < 100; i++) {
      manager.testOn('test:event', () => {})
    }

    // 触发1000次事件
    for (let i = 0; i < 1000; i++) {
      manager.testEmit('test:event', { data: i })
    }

    const duration = Date.now() - start

    expect(duration).toBeLessThan(1000) // 应该在1秒内完成
  })
})
