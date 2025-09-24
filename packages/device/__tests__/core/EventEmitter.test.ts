import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from '../../src/core/EventEmitter'

interface TestEvents {
  test: string
  number: number
  object: { value: string }
  error: Error
  [key: string]: unknown
}

describe('eventEmitter', () => {
  let emitter: EventEmitter<TestEvents>

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>()
  })

  describe('事件监听', () => {
    it('应该添加事件监听器', () => {
      const listener = vi.fn()

      emitter.on('test', listener)

      expect(emitter.listenerCount('test')).toBe(1)
    })

    it('应该支持链式调用', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      const result = emitter.on('test', listener1).on('number', listener2)

      expect(result).toBe(emitter)
      expect(emitter.listenerCount('test')).toBe(1)
      expect(emitter.listenerCount('number')).toBe(1)
    })

    it('应该添加一次性监听器', () => {
      const listener = vi.fn()

      emitter.once('test', listener)

      expect(emitter.listenerCount('test')).toBe(1)
    })

    it('应该在达到最大监听器数量时发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
      emitter.setMaxListeners(2)

      emitter.on('test', vi.fn())
      emitter.on('test', vi.fn())
      emitter.on('test', vi.fn()) // 第三个监听器应该触发警告

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Max listeners (2) exceeded for event: test'),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('事件触发', () => {
    it('应该触发事件监听器', () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.emit('test', 'hello')

      expect(listener).toHaveBeenCalledWith('hello')
    })

    it('应该触发多个监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.emit('test', 'hello')

      expect(listener1).toHaveBeenCalledWith('hello')
      expect(listener2).toHaveBeenCalledWith('hello')
    })

    it('应该只触发一次性监听器一次', () => {
      const listener = vi.fn()

      emitter.once('test', listener)
      emitter.emit('test', 'first')
      emitter.emit('test', 'second')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('first')
      expect(emitter.listenerCount('test')).toBe(0)
    })

    it('应该处理不存在的事件', () => {
      expect(() => {
        emitter.emit('test', 'hello')
      }).not.toThrow()
    })

    it('应该支持链式调用', () => {
      const result = emitter.emit('test', 'hello')
      expect(result).toBe(emitter)
    })
  })

  describe('错误处理', () => {
    it('应该捕获监听器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      const errorListener = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalListener = vi.fn()

      emitter.on('test', errorListener)
      emitter.on('test', normalListener)
      emitter.emit('test', 'hello')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event listener for "test"'),
        expect.any(Error),
      )
      expect(normalListener).toHaveBeenCalledWith('hello')

      consoleSpy.mockRestore()
    })

    it('应该使用自定义错误处理器', () => {
      const errorHandler = vi.fn()
      emitter.setErrorHandler(errorHandler)

      const errorListener = vi.fn(() => {
        throw new Error('Test error')
      })

      emitter.on('test', errorListener)
      emitter.emit('test', 'hello')

      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        'test',
      )
    })

    it('应该处理非 Error 对象的异常', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      const errorListener = vi.fn(() => {
        throw new Error('String error')
      })

      emitter.on('test', errorListener)
      emitter.emit('test', 'hello')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event listener for "test"'),
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('监听器移除', () => {
    it('应该移除指定的监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.off('test', listener1)

      expect(emitter.listenerCount('test')).toBe(1)

      emitter.emit('test', 'hello')
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('hello')
    })

    it('应该移除所有指定事件的监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.removeAllListeners('test')

      expect(emitter.listenerCount('test')).toBe(0)
    })

    it('应该移除所有事件的监听器', () => {
      emitter.on('test', vi.fn())
      emitter.on('number', vi.fn())
      emitter.removeAllListeners()

      expect(emitter.listenerCount('test')).toBe(0)
      expect(emitter.listenerCount('number')).toBe(0)
      expect(emitter.eventNames()).toHaveLength(0)
    })

    it('应该处理移除不存在的监听器', () => {
      const listener = vi.fn()

      expect(() => {
        emitter.off('test', listener)
      }).not.toThrow()
    })
  })

  describe('监听器查询', () => {
    it('应该返回正确的监听器数量', () => {
      expect(emitter.listenerCount('test')).toBe(0)

      emitter.on('test', vi.fn())
      expect(emitter.listenerCount('test')).toBe(1)

      emitter.on('test', vi.fn())
      expect(emitter.listenerCount('test')).toBe(2)
    })

    it('应该返回所有事件名称', () => {
      emitter.on('test', vi.fn())
      emitter.on('number', vi.fn())

      const eventNames = emitter.eventNames()
      expect(eventNames).toContain('test')
      expect(eventNames).toContain('number')
      expect(eventNames).toHaveLength(2)
    })

    it('应该检查是否有监听器', () => {
      expect(emitter.hasListeners('test')).toBe(false)

      emitter.on('test', vi.fn())
      expect(emitter.hasListeners('test')).toBe(true)

      emitter.removeAllListeners('test')
      expect(emitter.hasListeners('test')).toBe(false)
    })
  })

  describe('性能优化', () => {
    it('应该高效处理大量监听器', () => {
      // 为性能测试临时增加最大监听器数量
      emitter.setMaxListeners(2000)

      const listeners = Array.from({ length: 1000 }, () => vi.fn())

      // 添加大量监听器
      listeners.forEach((listener) => {
        emitter.on('test', listener)
      })

      expect(emitter.listenerCount('test')).toBe(1000)

      // 触发事件应该很快
      const start = performance.now()
      emitter.emit('test', 'hello')
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // 应该在 100ms 内完成

      // 所有监听器都应该被调用
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalledWith('hello')
      })
    })

    it('应该避免在触发事件时创建不必要的对象', () => {
      const listener = vi.fn()
      emitter.on('test', listener)

      // 多次触发相同事件
      for (let i = 0; i < 100; i++) {
        emitter.emit('test', 'hello')
      }

      expect(listener).toHaveBeenCalledTimes(100)
    })
  })
})
