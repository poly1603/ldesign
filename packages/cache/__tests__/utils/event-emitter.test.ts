import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from '../../src/utils/event-emitter'

describe('EventEmitter', () => {
  let emitter: EventEmitter

  beforeEach(() => {
    emitter = new EventEmitter()
  })

  describe('基础功能', () => {
    it('应该能够创建事件发射器实例', () => {
      expect(emitter).toBeInstanceOf(EventEmitter)
    })

    it('应该能够注册和触发事件', () => {
      const callback = vi.fn()
      
      emitter.on('test-event', callback)
      emitter.emit('test-event', 'test-data')
      
      expect(callback).toHaveBeenCalledWith('test-data')
    })

    it('应该能够注册多个监听器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      emitter.on('multi-event', callback1)
      emitter.on('multi-event', callback2)
      emitter.emit('multi-event', 'data')
      
      expect(callback1).toHaveBeenCalledWith('data')
      expect(callback2).toHaveBeenCalledWith('data')
    })

    it('应该能够移除事件监听器', () => {
      const callback = vi.fn()
      
      emitter.on('remove-event', callback)
      emitter.emit('remove-event', 'before-remove')
      
      emitter.off('remove-event', callback)
      emitter.emit('remove-event', 'after-remove')
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('before-remove')
    })

    it('应该能够注册一次性监听器', () => {
      const callback = vi.fn()
      
      emitter.once('once-event', callback)
      emitter.emit('once-event', 'first')
      emitter.emit('once-event', 'second')
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('first')
    })

    it('应该能够移除所有监听器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      emitter.on('clear-event', callback1)
      emitter.on('clear-event', callback2)
      emitter.removeAllListeners('clear-event')
      emitter.emit('clear-event', 'data')
      
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })

    it('应该能够获取监听器数量', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      expect(emitter.listenerCount('count-event')).toBe(0)
      
      emitter.on('count-event', callback1)
      expect(emitter.listenerCount('count-event')).toBe(1)
      
      emitter.on('count-event', callback2)
      expect(emitter.listenerCount('count-event')).toBe(2)
      
      emitter.off('count-event', callback1)
      expect(emitter.listenerCount('count-event')).toBe(1)
    })

    it('应该能够获取事件名列表', () => {
      emitter.on('event1', vi.fn())
      emitter.on('event2', vi.fn())
      emitter.on('event3', vi.fn())
      
      const eventNames = emitter.eventNames()
      expect(eventNames).toContain('event1')
      expect(eventNames).toContain('event2')
      expect(eventNames).toContain('event3')
      expect(eventNames).toHaveLength(3)
    })
  })

  describe('错误处理', () => {
    it('应该处理不存在的事件', () => {
      expect(() => {
        emitter.emit('non-existent-event', 'data')
      }).not.toThrow()
    })

    it('应该处理移除不存在的监听器', () => {
      const callback = vi.fn()
      
      expect(() => {
        emitter.off('non-existent-event', callback)
      }).not.toThrow()
    })

    it('应该处理监听器中的错误', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const normalCallback = vi.fn()
      
      emitter.on('error-event', errorCallback)
      emitter.on('error-event', normalCallback)
      
      expect(() => {
        emitter.emit('error-event', 'data')
      }).not.toThrow()
      
      // 正常的监听器应该仍然被调用
      expect(normalCallback).toHaveBeenCalledWith('data')
    })
  })

  describe('类型安全', () => {
    it('应该支持泛型类型约束', () => {
      interface TestEvent {
        type: string
        data: number
      }
      
      const typedEmitter = new EventEmitter<TestEvent>()
      const callback = vi.fn()
      
      typedEmitter.on('test', callback)
      typedEmitter.emit('test', { type: 'test', data: 123 })
      
      expect(callback).toHaveBeenCalledWith({ type: 'test', data: 123 })
    })
  })

  describe('内存管理', () => {
    it('应该能够清理所有监听器', () => {
      emitter.on('event1', vi.fn())
      emitter.on('event2', vi.fn())
      emitter.on('event3', vi.fn())
      
      expect(emitter.eventNames()).toHaveLength(3)
      
      emitter.removeAllListeners()
      
      expect(emitter.eventNames()).toHaveLength(0)
    })

    it('应该在移除监听器后释放内存', () => {
      const callback = vi.fn()
      
      emitter.on('memory-event', callback)
      expect(emitter.listenerCount('memory-event')).toBe(1)
      
      emitter.off('memory-event', callback)
      expect(emitter.listenerCount('memory-event')).toBe(0)
      
      // 事件名应该从列表中移除
      expect(emitter.eventNames()).not.toContain('memory-event')
    })
  })
})
