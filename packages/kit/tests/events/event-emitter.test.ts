/**
 * EventEmitter 测试
 */

import { vi } from 'vitest'
import { EventEmitter } from '../../src/events/event-emitter'

describe('eventEmitter', () => {
  let emitter: EventEmitter

  beforeEach(() => {
    emitter = new EventEmitter({
      maxListeners: 10,
      enableStats: true,
    })
  })

  afterEach(() => {
    emitter.removeAllListeners()
  })

  describe('基本事件操作', () => {
    it('应该注册和触发事件监听器', () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.emit('test', 'data')

      expect(listener).toHaveBeenCalledWith('data')
    })

    it('应该支持多个监听�?, () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.emit('test', 'data')

      expect(listener1).toHaveBeenCalledWith('data')
      expect(listener2).toHaveBeenCalledWith('data')
    })

    it('应该移除事件监听�?, () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.off('test', listener)
      emitter.emit('test', 'data')

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该支持一次性监听器', () => {
      const listener = vi.fn()

      emitter.once('test', listener)
      emitter.emit('test', 'data1')
      emitter.emit('test', 'data2')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('data1')
    })

    it('应该移除所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test1', listener1)
      emitter.on('test2', listener2)
      emitter.removeAllListeners()

      emitter.emit('test1', 'data')
      emitter.emit('test2', 'data')

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('优先�?, () => {
    it('应该按优先级顺序执行监听�?, () => {
      const order: number[] = []

      emitter.on('test', () => order.push(1), { priority: 1 })
      emitter.on('test', () => order.push(3), { priority: 3 })
      emitter.on('test', () => order.push(2), { priority: 2 })

      emitter.emit('test')

      expect(order).toEqual([3, 2, 1])
    })

    it('应该处理相同优先级的监听�?, () => {
      const order: number[] = []

      emitter.on('test', () => order.push(1), { priority: 1 })
      emitter.on('test', () => order.push(2), { priority: 1 })

      emitter.emit('test')

      expect(order).toEqual([1, 2])
    })
  })

  describe('命名空间', () => {
    it('应该支持命名空间', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1, { namespace: 'ns1' })
      emitter.on('test', listener2, { namespace: 'ns2' })

      emitter.emit('test', 'data')

      expect(listener1).toHaveBeenCalledWith('data')
      expect(listener2).toHaveBeenCalledWith('data')
    })

    it('应该按命名空间移除监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1, { namespace: 'ns1' })
      emitter.on('test', listener2, { namespace: 'ns2' })

      emitter.removeListenersByNamespace('ns1')
      emitter.emit('test', 'data')

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('data')
    })

    it('应该获取所有命名空�?, () => {
      emitter.on('test1', () => { }, { namespace: 'ns1' })
      emitter.on('test2', () => { }, { namespace: 'ns2' })
      emitter.on('test3', () => { }, { namespace: 'ns1' })

      const namespaces = emitter.getNamespaces()

      expect(namespaces).toContain('ns1')
      expect(namespaces).toContain('ns2')
      expect(namespaces).toHaveLength(2)
    })
  })

  describe('标签', () => {
    it('应该支持标签', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1, { tags: ['tag1', 'tag2'] })
      emitter.on('test', listener2, { tags: ['tag2', 'tag3'] })

      emitter.emit('test', 'data')

      expect(listener1).toHaveBeenCalledWith('data')
      expect(listener2).toHaveBeenCalledWith('data')
    })

    it('应该按标签移除监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1, { tags: ['tag1'] })
      emitter.on('test', listener2, { tags: ['tag2'] })

      emitter.removeListenersByTag('tag1')
      emitter.emit('test', 'data')

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('data')
    })
  })

  describe('异步事件', () => {
    it('应该支持异步事件发射', async () => {
      const results: string[] = []

      emitter.on('test', async (data) => {
        await global.testUtils.sleep(10)
        results.push(`async1-${data}`)
        return `result1-${data}`
      })

      emitter.on('test', async (data) => {
        await global.testUtils.sleep(5)
        results.push(`async2-${data}`)
        return `result2-${data}`
      })

      const responses = await emitter.emitAsync('test', 'data')

      expect(results).toContain('async1-data')
      expect(results).toContain('async2-data')
      expect(responses).toContain('result1-data')
      expect(responses).toContain('result2-data')
    })

    it('应该处理异步监听器中的错�?, async () => {
      const errorSpy = vi.fn()
      emitter.on('error', errorSpy)

      emitter.on('test', async () => {
        throw new Error('Async error')
      })

      emitter.on('test', async () => {
        return 'success'
      })

      const results = await emitter.emitAsync('test')

      expect(errorSpy).toHaveBeenCalled()
      expect(results).toContain('success')
    })
  })

  describe('统计信息', () => {
    it('应该跟踪事件统计', () => {
      emitter.on('test', () => { })

      emitter.emit('test', 'data1')
      emitter.emit('test', 'data2')

      const stats = emitter.getEventStats('test')

      expect(stats).toBeDefined()
      expect(stats!.emitCount).toBe(2)
      expect(stats!.listenerCount).toBe(1)
      expect(stats!.lastEmittedAt).toBeInstanceOf(Date)
    })

    it('应该计算平均执行时间', async () => {
      emitter.on('test', async () => {
        await global.testUtils.sleep(10)
      })

      await emitter.emitAsync('test')
      await emitter.emitAsync('test')

      const stats = emitter.getEventStats('test')

      expect(stats!.averageExecutionTime).toBeGreaterThan(0)
      expect(stats!.totalExecutionTime).toBeGreaterThan(0)
    })

    it('应该重置统计信息', () => {
      emitter.on('test', () => { })
      emitter.emit('test')

      emitter.resetStats('test')

      const stats = emitter.getEventStats('test')
      expect(stats!.emitCount).toBe(0)
      expect(stats!.lastEmittedAt).toBeUndefined()
    })

    it('应该获取所有事件统�?, () => {
      emitter.on('test1', () => { })
      emitter.on('test2', () => { })

      emitter.emit('test1')
      emitter.emit('test2')

      const allStats = emitter.getEventStats()

      expect(allStats).toBeInstanceOf(Map)
      expect(allStats.has('test1')).toBe(true)
      expect(allStats.has('test2')).toBe(true)
    })
  })

  describe('监听器信�?, () => {
    it('应该获取监听器信�?, () => {
      const listener = () => { }

      emitter.on('test', listener, {
        priority: 5,
        namespace: 'ns1',
        tags: ['tag1', 'tag2'],
      })

      const info = emitter.getListenerInfo('test')

      expect(info).toHaveLength(1)
      expect(info[0].listener).toBe(listener)
      expect(info[0].priority).toBe(5)
      expect(info[0].namespace).toBe('ns1')
      expect(info[0].tags).toEqual(['tag1', 'tag2'])
      expect(info[0].createdAt).toBeInstanceOf(Date)
      expect(info[0].callCount).toBe(0)
    })

    it('应该跟踪监听器调用次�?, () => {
      emitter.on('test', () => { })

      emitter.emit('test')
      emitter.emit('test')

      const info = emitter.getListenerInfo('test')

      expect(info[0].callCount).toBe(2)
      expect(info[0].lastCalledAt).toBeInstanceOf(Date)
    })
  })

  describe('工具方法', () => {
    it('应该获取事件名称列表', () => {
      emitter.on('test1', () => { })
      emitter.on('test2', () => { })

      const eventNames = emitter.getEventNames()

      expect(eventNames).toContain('test1')
      expect(eventNames).toContain('test2')
    })

    it('应该获取监听器数�?, () => {
      emitter.on('test', () => { })
      emitter.on('test', () => { })

      expect(emitter.getListenerCount('test')).toBe(2)
      expect(emitter.getListenerCount()).toBe(2)
    })

    it('应该检查是否有监听�?, () => {
      expect(emitter.hasListeners('test')).toBe(false)

      emitter.on('test', () => { })

      expect(emitter.hasListeners('test')).toBe(true)
    })
  })

  describe('等待事件', () => {
    it('应该等待事件发生', async () => {
      setTimeout(() => {
        emitter.emit('test', 'delayed-data')
      }, 50)

      const args = await emitter.waitFor('test')

      expect(args).toEqual(['delayed-data'])
    })

    it('应该在超时时拒绝', async () => {
      await expect(emitter.waitFor('test', 50)).rejects.toThrow('Timeout')
    })

    it('应该在事件发生时立即解决', async () => {
      const promise = emitter.waitFor('test')

      emitter.emit('test', 'immediate-data')

      const args = await promise
      expect(args).toEqual(['immediate-data'])
    })
  })

  describe('错误处理', () => {
    it('应该处理监听器中的同步错�?, () => {
      const errorSpy = vi.fn()
      emitter.on('error', errorSpy)

      emitter.on('test', () => {
        throw new Error('Sync error')
      })

      expect(() => emitter.emit('test')).not.toThrow()
      // 注意：同步错误通常会被Node.js的EventEmitter处理
    })

    it('应该继续执行其他监听器即使有错误', async () => {
      const successSpy = vi.fn()
      const errorSpy = vi.fn()
      emitter.on('error', errorSpy)

      emitter.on('test', async () => {
        throw new Error('Error in listener')
      })

      emitter.on('test', successSpy)

      await emitter.emitAsync('test')

      expect(errorSpy).toHaveBeenCalled()
      expect(successSpy).toHaveBeenCalled()
    })
  })

  describe('内存管理', () => {
    it('应该正确清理监听�?, () => {
      const listener = () => { }

      emitter.on('test', listener)
      expect(emitter.getListenerCount('test')).toBe(1)

      emitter.off('test', listener)
      expect(emitter.getListenerCount('test')).toBe(0)
    })

    it('应该清理命名空间监听�?, () => {
      emitter.on('test1', () => { }, { namespace: 'ns1' })
      emitter.on('test2', () => { }, { namespace: 'ns1' })
      emitter.on('test3', () => { }, { namespace: 'ns2' })

      emitter.removeListenersByNamespace('ns1')

      expect(emitter.getListenerCount('test1')).toBe(0)
      expect(emitter.getListenerCount('test2')).toBe(0)
      expect(emitter.getListenerCount('test3')).toBe(1)
    })
  })
})



