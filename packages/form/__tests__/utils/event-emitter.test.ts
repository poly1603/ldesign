import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from '../../src/utils/event-emitter'

describe('eventEmitter', () => {
  let emitter: EventEmitter
  let mockListener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    emitter = new EventEmitter()
    mockListener = vi.fn()
  })

  describe('on/emit', () => {
    it('should add listener and emit events', () => {
      emitter.on('test', mockListener)
      emitter.emit('test', 'data')

      expect(mockListener).toHaveBeenCalledWith('data')
      expect(mockListener).toHaveBeenCalledTimes(1)
    })

    it('should support multiple listeners', () => {
      const listener2 = vi.fn()
      emitter.on('test', mockListener)
      emitter.on('test', listener2)

      emitter.emit('test', 'data')

      expect(mockListener).toHaveBeenCalledWith('data')
      expect(listener2).toHaveBeenCalledWith('data')
    })

    it('should return false when no listeners', () => {
      const result = emitter.emit('test', 'data')
      expect(result).toBe(false)
    })

    it('should return true when listeners exist', () => {
      emitter.on('test', mockListener)
      const result = emitter.emit('test', 'data')
      expect(result).toBe(true)
    })

    it('should return unsubscribe function', () => {
      const unsubscribe = emitter.on('test', mockListener)
      emitter.emit('test', 'data')
      expect(mockListener).toHaveBeenCalledTimes(1)

      unsubscribe()
      emitter.emit('test', 'data')
      expect(mockListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('once', () => {
    it('should execute listener only once', () => {
      emitter.once('test', mockListener)

      emitter.emit('test', 'data1')
      emitter.emit('test', 'data2')

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(mockListener).toHaveBeenCalledWith('data1')
    })

    it('should return unsubscribe function', () => {
      const unsubscribe = emitter.once('test', mockListener)
      unsubscribe()

      emitter.emit('test', 'data')
      expect(mockListener).not.toHaveBeenCalled()
    })
  })

  describe('off', () => {
    it('should remove specific listener', () => {
      const listener2 = vi.fn()
      emitter.on('test', mockListener)
      emitter.on('test', listener2)

      emitter.off('test', mockListener)
      emitter.emit('test', 'data')

      expect(mockListener).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('data')
    })

    it('should remove all listeners for event', () => {
      const listener2 = vi.fn()
      emitter.on('test', mockListener)
      emitter.on('test', listener2)

      emitter.off('test')
      emitter.emit('test', 'data')

      expect(mockListener).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      emitter.on('test1', mockListener)
      emitter.on('test2', mockListener)

      emitter.removeAllListeners('test1')

      expect(emitter.listenerCount('test1')).toBe(0)
      expect(emitter.listenerCount('test2')).toBe(1)
    })

    it('should remove all listeners for all events', () => {
      emitter.on('test1', mockListener)
      emitter.on('test2', mockListener)

      emitter.removeAllListeners()

      expect(emitter.listenerCount('test1')).toBe(0)
      expect(emitter.listenerCount('test2')).toBe(0)
    })
  })

  describe('priority', () => {
    it('should execute listeners in priority order', () => {
      const results: number[] = []
      const listener1 = () => results.push(1)
      const listener2 = () => results.push(2)
      const listener3 = () => results.push(3)

      emitter.on('test', listener1, { priority: 1 })
      emitter.on('test', listener2, { priority: 3 })
      emitter.on('test', listener3, { priority: 2 })

      emitter.emit('test', null)

      expect(results).toEqual([2, 3, 1]) // 按优先级排序：3, 2, 1
    })
  })

  describe('error handling', () => {
    it('should handle listener errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      const errorListener = () => {
        throw new Error('Test error')
      }
      const normalListener = vi.fn()

      emitter.on('test', errorListener)
      emitter.on('test', normalListener)

      emitter.emit('test', 'data')

      expect(consoleSpy).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalledWith('data')

      consoleSpy.mockRestore()
    })
  })

  describe('utility methods', () => {
    beforeEach(() => {
      emitter.on('test1', mockListener)
      emitter.on('test1', vi.fn())
      emitter.on('test2', vi.fn())
    })

    it('should return correct listener count', () => {
      expect(emitter.listenerCount('test1')).toBe(2)
      expect(emitter.listenerCount('test2')).toBe(1)
      expect(emitter.listenerCount('nonexistent')).toBe(0)
    })

    it('should return listeners array', () => {
      const listeners = emitter.listeners('test1')
      expect(listeners).toHaveLength(2)
      expect(listeners[0]).toBe(mockListener)
    })

    it('should return event names', () => {
      const eventNames = emitter.eventNames()
      expect(eventNames).toContain('test1')
      expect(eventNames).toContain('test2')
      expect(eventNames).toHaveLength(2)
    })

    it('should check if has listeners', () => {
      expect(emitter.hasListeners('test1')).toBe(true)
      expect(emitter.hasListeners('nonexistent')).toBe(false)
    })
  })

  describe('max listeners', () => {
    it('should warn when exceeding max listeners', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
      emitter.setMaxListeners(2)

      emitter.on('test', vi.fn())
      emitter.on('test', vi.fn())
      emitter.on('test', vi.fn()) // 第三个监听器应该触发警告

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should get/set max listeners', () => {
      expect(emitter.getMaxListeners()).toBe(10)
      emitter.setMaxListeners(5)
      expect(emitter.getMaxListeners()).toBe(5)
    })
  })

  describe('waitFor', () => {
    it('should resolve when event is emitted', async () => {
      setTimeout(() => {
        emitter.emit('test', 'result')
      }, 10)

      const result = await emitter.waitFor('test')
      expect(result).toBe('result')
    })

    it('should reject on timeout', async () => {
      await expect(emitter.waitFor('test', 10)).rejects.toThrow('timeout')
    })

    it('should work without timeout', async () => {
      setTimeout(() => {
        emitter.emit('test', 'result')
      }, 10)

      const result = await emitter.waitFor('test')
      expect(result).toBe('result')
    })
  })

  describe('destroy', () => {
    it('should clean up all listeners', () => {
      emitter.on('test1', mockListener)
      emitter.on('test2', mockListener)

      emitter.destroy()

      expect(emitter.listenerCount('test1')).toBe(0)
      expect(emitter.listenerCount('test2')).toBe(0)
      expect(emitter.eventNames()).toHaveLength(0)
    })
  })
})
