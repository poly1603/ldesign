/**
 * EventManager 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createEventManager } from './event-manager'

describe('EventManager', () => {
  describe('基础事件操作', () => {
    it('应该能够监听和触发事件', async () => {
      const events = createEventManager()
      const handler = vi.fn()

      events.on('test', handler)
      await events.emit('test', 'data')

      expect(handler).toHaveBeenCalledWith('data')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该能够监听一次性事件', async () => {
      const events = createEventManager()
      const handler = vi.fn()

      events.once('test', handler)
      await events.emit('test', 'data1')
      await events.emit('test', 'data2')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('data1')
    })

    it('应该能够移除事件监听器', async () => {
      const events = createEventManager()
      const handler = vi.fn()

      events.on('test', handler)
      events.off('test', handler)
      await events.emit('test')

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该能够通过返回的函数取消订阅', async () => {
      const events = createEventManager()
      const handler = vi.fn()

      const unsubscribe = events.on('test', handler)
      unsubscribe()
      await events.emit('test')

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该能够移除所有监听器', async () => {
      const events = createEventManager()
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      events.on('test', handler1)
      events.on('test', handler2)
      events.removeAllListeners('test')
      await events.emit('test')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('优先级', () => {
    it('应该按照优先级顺序执行监听器', async () => {
      const events = createEventManager()
      const order: number[] = []

      events.on('test', () => order.push(1), { priority: 1 })
      events.on('test', () => order.push(3), { priority: 3 })
      events.on('test', () => order.push(2), { priority: 2 })

      await events.emit('test')

      expect(order).toEqual([3, 2, 1])
    })

    it('相同优先级应该按照注册顺序执行', async () => {
      const events = createEventManager()
      const order: string[] = []

      events.on('test', () => order.push('a'), { priority: 1 })
      events.on('test', () => order.push('b'), { priority: 1 })
      events.on('test', () => order.push('c'), { priority: 1 })

      await events.emit('test')

      expect(order).toEqual(['a', 'b', 'c'])
    })
  })

  describe('命名空间', () => {
    it('应该支持命名空间', async () => {
      const events = createEventManager()
      const handler = vi.fn()

      events.on('test', handler, { namespace: 'app' })
      await events.emit('test')

      expect(handler).toHaveBeenCalled()
    })

    it('应该能够移除命名空间下的所有监听器', async () => {
      const events = createEventManager()
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      events.on('event1', handler1, { namespace: 'app' })
      events.on('event2', handler2, { namespace: 'app' })
      events.on('event3', handler3, { namespace: 'other' })

      events.offNamespace?.('app')

      await events.emit('event1')
      await events.emit('event2')
      await events.emit('event3')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).toHaveBeenCalled()
    })
  })

  describe('同步触发', () => {
    it('应该能够同步触发事件', () => {
      const events = createEventManager()
      const handler = vi.fn()

      events.on('test', handler)
      events.emitSync('test', 'data')

      expect(handler).toHaveBeenCalledWith('data')
    })

    it('同步触发应该立即执行', () => {
      const events = createEventManager()
      let executed = false

      events.on('test', () => {
        executed = true
      })
      events.emitSync('test')

      expect(executed).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('监听器错误不应该中断其他监听器', async () => {
      const events = createEventManager()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

      const handler1 = vi.fn(() => {
        throw new Error('Handler 1 error')
      })
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      events.on('test', handler1)
      events.on('test', handler2)
      events.on('test', handler3)

      await events.emit('test')

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
      expect(handler3).toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe('监听器数量限制', () => {
    it('应该警告超过限制的监听器', () => {
      const events = createEventManager({
        maxListenersPerEvent: 2,
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { })

      events.on('test', () => { })
      events.on('test', () => { })
      events.on('test', () => { }) // 超过限制

      expect(consoleWarn).toHaveBeenCalled()
      expect(consoleWarn.mock.calls[0][0]).toContain('exceeding maximum')

      consoleWarn.mockRestore()
    })
  })

  describe('自动清理', () => {
    it('应该清理长时间未触发的事件', async () => {
      const events = createEventManager({
        autoCleanupThreshold: 100,
        autoCleanupInterval: 50,
      })

      const handler = vi.fn()
      events.on('test', handler)

      // 等待超过清理阈值
      await new Promise(resolve => setTimeout(resolve, 200))

      // 事件应该已经被清理
      expect(events.listenerCount('test')).toBe(0)
    })
  })

  describe('事件信息', () => {
    it('应该能够获取事件信息', () => {
      const events = createEventManager()

      events.on('test', () => { }, { namespace: 'app' })
      events.on('test', () => { })

      const info = events.getEventInfo('test')

      expect(info).toBeDefined()
      expect(info?.name).toBe('test')
      expect(info?.listenersCount).toBe(2)
      expect(info?.namespace).toContain('app')
      expect(info?.createdAt).toBeTypeOf('number')
    })

    it('应该能够获取所有事件统计', () => {
      const events = createEventManager()

      events.on('event1', () => { })
      events.on('event2', () => { })
      events.on('event2', () => { })

      const stats = events.getStats?.()

      expect(stats).toBeDefined()
      expect(stats?.totalEvents).toBe(2)
      expect(stats?.totalListeners).toBe(3)
      expect(stats?.events.length).toBe(2)
    })
  })

  describe('监听器计数', () => {
    it('应该能够获取监听器数量', () => {
      const events = createEventManager()

      events.on('test', () => { })
      events.on('test', () => { })
      events.on('test', () => { })

      expect(events.listenerCount('test')).toBe(3)
    })

    it('不存在的事件应该返回 0', () => {
      const events = createEventManager()
      expect(events.listenerCount('nonexistent')).toBe(0)
    })
  })

  describe('事件名称', () => {
    it('应该能够获取所有事件名称', () => {
      const events = createEventManager()

      events.on('event1', () => { })
      events.on('event2', () => { })
      events.on('event3', () => { })

      const names = events.eventNames()

      expect(names).toContain('event1')
      expect(names).toContain('event2')
      expect(names).toContain('event3')
      expect(names.length).toBe(3)
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化和销毁', async () => {
      const events = createEventManager()

      await events.init?.()

      events.on('test', () => { })
      expect(events.listenerCount('test')).toBe(1)

      await events.destroy?.()

      expect(events.listenerCount('test')).toBe(0)
    })
  })

  describe('异步处理', () => {
    it('应该按顺序等待异步监听器', async () => {
      const events = createEventManager()
      const order: number[] = []

      events.on('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        order.push(1)
      })
      events.on('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        order.push(2)
      })

      await events.emit('test')

      expect(order).toEqual([1, 2])
    })
  })
})

