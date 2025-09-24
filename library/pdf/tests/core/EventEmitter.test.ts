/**
 * EventEmitter 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from '../../src/core/EventEmitter'

interface TestEvents {
  'test-event': string
  'number-event': number
  'object-event': { id: number; name: string }
  'no-data-event': void
}

describe('EventEmitter', () => {
  let emitter: EventEmitter<TestEvents>

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>()
  })

  describe('事件注册和触发', () => {
    it('应该能够注册和触发事件', () => {
      const listener = vi.fn()
      emitter.on('test-event', listener)
      
      emitter.emit('test-event', 'hello')
      
      expect(listener).toHaveBeenCalledWith('hello')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('应该能够注册多个监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test-event', listener1)
      emitter.on('test-event', listener2)
      
      emitter.emit('test-event', 'hello')
      
      expect(listener1).toHaveBeenCalledWith('hello')
      expect(listener2).toHaveBeenCalledWith('hello')
    })

    it('应该支持不同类型的事件数据', () => {
      const stringListener = vi.fn()
      const numberListener = vi.fn()
      const objectListener = vi.fn()
      
      emitter.on('test-event', stringListener)
      emitter.on('number-event', numberListener)
      emitter.on('object-event', objectListener)
      
      emitter.emit('test-event', 'hello')
      emitter.emit('number-event', 42)
      emitter.emit('object-event', { id: 1, name: 'test' })
      
      expect(stringListener).toHaveBeenCalledWith('hello')
      expect(numberListener).toHaveBeenCalledWith(42)
      expect(objectListener).toHaveBeenCalledWith({ id: 1, name: 'test' })
    })
  })

  describe('一次性事件监听', () => {
    it('应该只触发一次', () => {
      const listener = vi.fn()
      emitter.once('test-event', listener)
      
      emitter.emit('test-event', 'first')
      emitter.emit('test-event', 'second')
      
      expect(listener).toHaveBeenCalledWith('first')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('应该在触发后自动移除', () => {
      const listener = vi.fn()
      emitter.once('test-event', listener)
      
      expect(emitter.listenerCount('test-event')).toBe(1)
      
      emitter.emit('test-event', 'hello')
      
      expect(emitter.listenerCount('test-event')).toBe(0)
    })
  })

  describe('事件移除', () => {
    it('应该能够移除指定的监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test-event', listener1)
      emitter.on('test-event', listener2)
      
      emitter.off('test-event', listener1)
      emitter.emit('test-event', 'hello')
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('hello')
    })

    it('应该能够移除所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test-event', listener1)
      emitter.on('test-event', listener2)
      
      emitter.off('test-event')
      emitter.emit('test-event', 'hello')
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })

    it('应该能够移除所有事件的所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test-event', listener1)
      emitter.on('number-event', listener2)
      
      emitter.removeAllListeners()
      
      emitter.emit('test-event', 'hello')
      emitter.emit('number-event', 42)
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('监听器计数和检查', () => {
    it('应该正确计算监听器数量', () => {
      expect(emitter.listenerCount('test-event')).toBe(0)
      
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test-event', listener1)
      expect(emitter.listenerCount('test-event')).toBe(1)
      
      emitter.on('test-event', listener2)
      expect(emitter.listenerCount('test-event')).toBe(2)
      
      emitter.off('test-event', listener1)
      expect(emitter.listenerCount('test-event')).toBe(1)
    })

    it('应该正确检查是否有监听器', () => {
      expect(emitter.hasListeners('test-event')).toBe(false)
      
      const listener = vi.fn()
      emitter.on('test-event', listener)
      
      expect(emitter.hasListeners('test-event')).toBe(true)
      
      emitter.off('test-event', listener)
      
      expect(emitter.hasListeners('test-event')).toBe(false)
    })

    it('应该返回所有事件名称', () => {
      const listener = vi.fn()
      
      emitter.on('test-event', listener)
      emitter.on('number-event', listener)
      
      const eventNames = emitter.eventNames()
      
      expect(eventNames).toContain('test-event')
      expect(eventNames).toContain('number-event')
      expect(eventNames).toHaveLength(2)
    })
  })

  describe('错误处理', () => {
    it('应该捕获监听器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorListener = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalListener = vi.fn()
      
      emitter.on('test-event', errorListener)
      emitter.on('test-event', normalListener)
      
      emitter.emit('test-event', 'hello')
      
      expect(consoleSpy).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalledWith('hello')
      
      consoleSpy.mockRestore()
    })
  })

  describe('链式调用', () => {
    it('应该支持链式调用', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      const result = emitter
        .on('test-event', listener1)
        .on('number-event', listener2)
        .emit('test-event', 'hello')
        .emit('number-event', 42)
      
      expect(result).toBe(emitter)
      expect(listener1).toHaveBeenCalledWith('hello')
      expect(listener2).toHaveBeenCalledWith(42)
    })
  })
})
