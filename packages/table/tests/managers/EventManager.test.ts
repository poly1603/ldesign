/**
 * EventManager单元测试
 * 
 * 测试事件管理器功能
 * 确保事件系统正常工作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventManager } from '@/managers/EventManager'

describe('EventManager', () => {
  let eventManager: EventManager

  beforeEach(() => {
    eventManager = new EventManager()
  })

  describe('基础事件功能', () => {
    it('应该正确绑定和触发事件', () => {
      const handler = vi.fn()
      eventManager.on('test-event', handler)

      eventManager.emit('test-event', { data: 'test' })

      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该支持多个事件监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventManager.on('test-event', handler1)
      eventManager.on('test-event', handler2)

      eventManager.emit('test-event', { data: 'test' })

      expect(handler1).toHaveBeenCalledWith({ data: 'test' })
      expect(handler2).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该正确移除事件监听器', () => {
      const handler = vi.fn()
      eventManager.on('test-event', handler)
      eventManager.off('test-event', handler)

      eventManager.emit('test-event', { data: 'test' })

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该正确移除所有事件监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventManager.on('test-event1', handler1)
      eventManager.on('test-event2', handler2)

      eventManager.off()

      eventManager.emit('test-event1', { data: 'test1' })
      eventManager.emit('test-event2', { data: 'test2' })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('应该正确移除指定事件的所有监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      eventManager.on('test-event', handler1)
      eventManager.on('test-event', handler2)
      eventManager.on('other-event', handler3)

      eventManager.off('test-event')

      eventManager.emit('test-event', { data: 'test' })
      eventManager.emit('other-event', { data: 'other' })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).toHaveBeenCalledWith({ data: 'other' })
    })
  })

  describe('一次性事件监听器', () => {
    it('应该正确处理一次性事件监听器', () => {
      const handler = vi.fn()
      eventManager.once('test-event', handler)

      eventManager.emit('test-event', { data: 'test1' })
      eventManager.emit('test-event', { data: 'test2' })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ data: 'test1' })
    })

    it('一次性监听器应该自动移除', () => {
      const handler = vi.fn()
      eventManager.once('test-event', handler)

      eventManager.emit('test-event', { data: 'test' })

      expect(eventManager.hasListeners('test-event')).toBe(false)
    })
  })

  describe('事件优先级', () => {
    it('应该按优先级顺序执行监听器', () => {
      const results: number[] = []

      eventManager.on('test-event', () => results.push(1), { priority: 1 })
      eventManager.on('test-event', () => results.push(3), { priority: 3 })
      eventManager.on('test-event', () => results.push(2), { priority: 2 })

      eventManager.emit('test-event')

      expect(results).toEqual([3, 2, 1])
    })

    it('相同优先级应该按添加顺序执行', () => {
      const results: string[] = []

      eventManager.on('test-event', () => results.push('first'), { priority: 1 })
      eventManager.on('test-event', () => results.push('second'), { priority: 1 })
      eventManager.on('test-event', () => results.push('third'), { priority: 1 })

      eventManager.emit('test-event')

      expect(results).toEqual(['first', 'second', 'third'])
    })
  })

  describe('事件传播控制', () => {
    it('应该支持停止事件传播', () => {
      const handler1 = vi.fn().mockImplementation((data, context) => {
        context.stopPropagation()
      })
      const handler2 = vi.fn()

      eventManager.on('test-event', handler1, { priority: 2 })
      eventManager.on('test-event', handler2, { priority: 1 })

      eventManager.emitWithContext('test-event', { data: 'test' })

      expect(handler1).toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('应该支持阻止默认行为', () => {
      const handler = vi.fn().mockImplementation((data, context) => {
        context.preventDefault()
      })

      eventManager.on('test-event', handler)

      const result = eventManager.emitWithContext('test-event', { data: 'test' })

      expect(result.defaultPrevented).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该捕获监听器中的错误', () => {
      const errorHandler = vi.fn()
      const normalHandler = vi.fn()

      eventManager.on('test-event', () => {
        throw new Error('Test error')
      })
      eventManager.on('test-event', normalHandler)
      eventManager.on('error', errorHandler)

      eventManager.emit('test-event', { data: 'test' })

      expect(normalHandler).toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalledWith({
        error: expect.any(Error),
        event: 'test-event',
        data: { data: 'test' }
      })
    })

    it('错误不应该阻止其他监听器执行', () => {
      const handler1 = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      eventManager.on('test-event', handler1)
      eventManager.on('test-event', handler2)
      eventManager.on('test-event', handler3)

      eventManager.emit('test-event', { data: 'test' })

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
      expect(handler3).toHaveBeenCalled()
    })
  })

  describe('工具方法', () => {
    it('应该正确检查是否有监听器', () => {
      expect(eventManager.hasListeners('test-event')).toBe(false)

      eventManager.on('test-event', vi.fn())
      expect(eventManager.hasListeners('test-event')).toBe(true)

      eventManager.off('test-event')
      expect(eventManager.hasListeners('test-event')).toBe(false)
    })

    it('应该正确获取监听器数量', () => {
      expect(eventManager.getListenerCount('test-event')).toBe(0)

      eventManager.on('test-event', vi.fn())
      eventManager.on('test-event', vi.fn())
      expect(eventManager.getListenerCount('test-event')).toBe(2)

      eventManager.off('test-event')
      expect(eventManager.getListenerCount('test-event')).toBe(0)
    })

    it('应该正确获取所有事件名称', () => {
      eventManager.on('event1', vi.fn())
      eventManager.on('event2', vi.fn())
      eventManager.on('event3', vi.fn())

      const eventNames = eventManager.getEventNames()
      expect(eventNames).toContain('event1')
      expect(eventNames).toContain('event2')
      expect(eventNames).toContain('event3')
    })
  })

  describe('销毁功能', () => {
    it('应该正确销毁事件管理器', () => {
      const handler = vi.fn()
      eventManager.on('test-event', handler)

      eventManager.destroy()

      eventManager.emit('test-event', { data: 'test' })
      expect(handler).not.toHaveBeenCalled()
      expect(eventManager.getEventNames()).toHaveLength(0)
    })

    it('销毁后不应该能添加新的监听器', () => {
      eventManager.destroy()

      const handler = vi.fn()
      eventManager.on('test-event', handler)

      eventManager.emit('test-event', { data: 'test' })
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量监听器', () => {
      const handlers = Array.from({ length: 1000 }, () => vi.fn())

      handlers.forEach(handler => {
        eventManager.on('test-event', handler)
      })

      const startTime = performance.now()
      eventManager.emit('test-event', { data: 'test' })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成

      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledWith({ data: 'test' })
      })
    })

    it('应该能处理频繁的事件触发', () => {
      const handler = vi.fn()
      eventManager.on('test-event', handler)

      const startTime = performance.now()
      for (let i = 0; i < 10000; i++) {
        eventManager.emit('test-event', { data: i })
      }
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
      expect(handler).toHaveBeenCalledTimes(10000)
    })
  })
})
