/**
 * 事件发射器测试
 */

import { describe, expect, it, vi } from 'vitest'
import { createEventEmitter, EventEmitterImpl } from '../src/utils/event-emitter'

describe('eventEmitterImpl', () => {
  describe('基本功能', () => {
    it('应该创建事件发射器', () => {
      const emitter = new EventEmitterImpl()
      expect(emitter).toBeDefined()
    })

    it('应该添加和触发事件监听器', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      emitter.on('theme-changed', mockListener)
      emitter.emit('theme-changed', { theme: 'dark', mode: 'dark' })

      expect(mockListener).toHaveBeenCalledWith({ theme: 'dark', mode: 'dark' })
    })

    it('应该移除事件监听器', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      emitter.on('theme-changed', mockListener)
      emitter.off('theme-changed', mockListener)
      emitter.emit('theme-changed', { theme: 'dark' })

      expect(mockListener).not.toHaveBeenCalled()
    })

    it('应该支持一次性监听器', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      emitter.once('theme-changed', mockListener)
      emitter.emit('theme-changed', { theme: 'dark' })
      emitter.emit('theme-changed', { theme: 'light' })

      expect(mockListener).toHaveBeenCalledTimes(1)
      expect(mockListener).toHaveBeenCalledWith({ theme: 'dark' })
    })

    it('应该处理多个监听器', () => {
      const emitter = new EventEmitterImpl()
      const mockListener1 = vi.fn()
      const mockListener2 = vi.fn()

      emitter.on('theme-changed', mockListener1)
      emitter.on('theme-changed', mockListener2)
      emitter.emit('theme-changed', { theme: 'dark' })

      expect(mockListener1).toHaveBeenCalledWith({ theme: 'dark' })
      expect(mockListener2).toHaveBeenCalledWith({ theme: 'dark' })
    })

    it('应该获取监听器数量', () => {
      const emitter = new EventEmitterImpl()
      const mockListener1 = vi.fn()
      const mockListener2 = vi.fn()

      expect(emitter.listenerCount('theme-changed')).toBe(0)

      emitter.on('theme-changed', mockListener1)
      expect(emitter.listenerCount('theme-changed')).toBe(1)

      emitter.on('theme-changed', mockListener2)
      expect(emitter.listenerCount('theme-changed')).toBe(2)

      emitter.off('theme-changed', mockListener1)
      expect(emitter.listenerCount('theme-changed')).toBe(1)
    })

    it('应该获取所有事件名称', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      expect(emitter.eventNames()).toEqual([])

      emitter.on('theme-changed', mockListener)
      emitter.on('mode-changed', mockListener)

      const eventNames = emitter.eventNames()
      expect(eventNames).toContain('theme-changed')
      expect(eventNames).toContain('mode-changed')
      expect(eventNames).toHaveLength(2)
    })

    it('应该移除所有监听器', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      emitter.on('theme-changed', mockListener)
      emitter.on('mode-changed', mockListener)

      expect(emitter.listenerCount('theme-changed')).toBe(1)
      expect(emitter.listenerCount('mode-changed')).toBe(1)

      emitter.removeAllListeners()

      expect(emitter.listenerCount('theme-changed')).toBe(0)
      expect(emitter.listenerCount('mode-changed')).toBe(0)
      expect(emitter.eventNames()).toEqual([])
    })

    it('应该移除指定事件的所有监听器', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      emitter.on('theme-changed', mockListener)
      emitter.on('mode-changed', mockListener)

      emitter.removeAllListeners('theme-changed')

      expect(emitter.listenerCount('theme-changed')).toBe(0)
      expect(emitter.listenerCount('mode-changed')).toBe(1)
    })
  })

  describe('错误处理', () => {
    it('应该处理监听器中的错误', () => {
      const emitter = new EventEmitterImpl()
      const errorListener = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalListener = vi.fn()

      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      emitter.on('theme-changed', errorListener)
      emitter.on('theme-changed', normalListener)

      emitter.emit('theme-changed', { theme: 'dark' })

      expect(errorListener).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalled() // 应该仍然被调用
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for theme-changed:',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('内存管理', () => {
    it('移除监听器后应该清理空的事件映射', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      emitter.on('theme-changed', mockListener)
      expect(emitter.eventNames()).toContain('theme-changed')

      emitter.off('theme-changed', mockListener)
      expect(emitter.eventNames()).not.toContain('theme-changed')
    })

    it('应该处理不存在的事件移除', () => {
      const emitter = new EventEmitterImpl()
      const mockListener = vi.fn()

      expect(() => {
        emitter.off('nonexistent-event' as any, mockListener)
      }).not.toThrow()
    })
  })
})

describe('工厂函数', () => {
  it('createEventEmitter应该返回事件发射器实例', () => {
    const emitter = createEventEmitter()
    expect(emitter).toBeInstanceOf(EventEmitterImpl)
  })
})
