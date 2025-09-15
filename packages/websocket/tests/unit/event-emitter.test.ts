/**
 * 事件发射器单元测试
 * 
 * 测试 WebSocketEventEmitter 类的事件处理功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WebSocketEventEmitter } from '@/core/event-emitter'

interface TestEventMap {
  test: string
  data: { value: number }
  error: Error
  empty: void
}

describe('WebSocketEventEmitter', () => {
  let emitter: WebSocketEventEmitter<TestEventMap>

  beforeEach(() => {
    emitter = new WebSocketEventEmitter<TestEventMap>()
  })

  describe('基础事件功能', () => {
    it('应该添加和触发事件监听器', () => {
      const listener = vi.fn()
      
      emitter.on('test', listener)
      emitter.emit('test', 'hello')
      
      expect(listener).toHaveBeenCalledWith('hello')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('应该支持多个监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.emit('test', 'hello')
      
      expect(listener1).toHaveBeenCalledWith('hello')
      expect(listener2).toHaveBeenCalledWith('hello')
    })

    it('应该支持一次性监听器', () => {
      const listener = vi.fn()
      
      emitter.once('test', listener)
      emitter.emit('test', 'hello')
      emitter.emit('test', 'world')
      
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('hello')
    })

    it('应该移除指定的监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.off('test', listener1)
      emitter.emit('test', 'hello')
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('hello')
    })

    it('应该移除所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test', listener1)
      emitter.on('data', listener2)
      emitter.removeAllListeners()
      emitter.emit('test', 'hello')
      emitter.emit('data', { value: 42 })
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })

    it('应该移除特定事件的所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()
      
      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.on('data', listener3)
      emitter.removeAllListeners('test')
      
      emitter.emit('test', 'hello')
      emitter.emit('data', { value: 42 })
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
      expect(listener3).toHaveBeenCalledWith({ value: 42 })
    })
  })

  describe('监听器管理', () => {
    it('应该返回正确的监听器数量', () => {
      expect(emitter.listenerCount('test')).toBe(0)
      
      emitter.on('test', () => {})
      expect(emitter.listenerCount('test')).toBe(1)
      
      emitter.on('test', () => {})
      expect(emitter.listenerCount('test')).toBe(2)
    })

    it('应该返回监听器列表', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test', listener1)
      emitter.on('test', listener2)
      
      const listeners = emitter.listeners('test')
      expect(listeners).toHaveLength(2)
      expect(listeners[0].listener).toBe(listener1)
      expect(listeners[1].listener).toBe(listener2)
    })

    it('应该设置和获取最大监听器数量', () => {
      expect(emitter.getMaxListeners()).toBe(10)
      
      emitter.setMaxListeners(20)
      expect(emitter.getMaxListeners()).toBe(20)
    })

    it('应该按优先级排序监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()
      
      emitter.on('test', listener1, { priority: 1 })
      emitter.on('test', listener2, { priority: 3 })
      emitter.on('test', listener3, { priority: 2 })
      
      const listeners = emitter.listeners('test')
      expect(listeners[0].listener).toBe(listener2) // 优先级 3
      expect(listeners[1].listener).toBe(listener3) // 优先级 2
      expect(listeners[2].listener).toBe(listener1) // 优先级 1
    })
  })

  describe('高级功能', () => {
    it('应该支持事件过滤器', () => {
      const listener = vi.fn()
      
      emitter.filter('test', (event, data) => data.includes('allow'))
      emitter.on('test', listener)
      
      emitter.emit('test', 'allow this')
      emitter.emit('test', 'block this')
      
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('allow this')
    })

    it('应该支持事件转换器', () => {
      const listener = vi.fn()
      
      emitter.transform('test', (event, data) => data.toUpperCase())
      emitter.on('test', listener)
      
      emitter.emit('test', 'hello')
      
      expect(listener).toHaveBeenCalledWith('HELLO')
    })

    it('应该支持事件中间件', async () => {
      const listener = vi.fn()
      const middleware = vi.fn((event, data, next) => {
        // 修改数据
        next()
      })
      
      emitter.use(middleware)
      emitter.on('test', listener)
      
      emitter.emit('test', 'hello')
      
      // 等待异步执行完成
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(middleware).toHaveBeenCalled()
      expect(listener).toHaveBeenCalledWith('hello')
    })

    it('应该支持等待事件', async () => {
      const promise = emitter.waitFor('test')
      
      setTimeout(() => {
        emitter.emit('test', 'hello')
      }, 10)
      
      const result = await promise
      expect(result).toBe('hello')
    })

    it('应该支持等待事件超时', async () => {
      const promise = emitter.waitFor('test', 10)
      
      await expect(promise).rejects.toThrow('等待事件 "test" 超时')
    })

    it('应该支持批量发射事件', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      emitter.on('test', listener1)
      emitter.on('data', listener2)
      
      const results = emitter.emitBatch([
        { event: 'test', data: 'hello' },
        { event: 'data', data: { value: 42 } }
      ])
      
      expect(results).toEqual([true, true])
      expect(listener1).toHaveBeenCalledWith('hello')
      expect(listener2).toHaveBeenCalledWith({ value: 42 })
    })

    it('应该支持延迟发射事件', async () => {
      const listener = vi.fn()
      emitter.on('test', listener)
      
      const promise = emitter.emitAfter('test', 'hello', 20)
      
      expect(listener).not.toHaveBeenCalled()
      
      const result = await promise
      expect(result).toBe(true)
      expect(listener).toHaveBeenCalledWith('hello')
    })
  })

  describe('事件统计', () => {
    it('应该记录事件统计信息', () => {
      emitter.on('test', () => {})
      emitter.on('test', () => {})
      emitter.emit('test', 'hello')
      
      const stats = emitter.getEventStats()
      expect(stats.test).toBeDefined()
      expect(stats.test.listenerCount).toBe(2)
      expect(stats.test.emitCount).toBe(1)
      expect(stats.test.lastEmitAt).toBeGreaterThan(0)
    })

    it('应该清除事件统计信息', () => {
      emitter.on('test', () => {})
      emitter.emit('test', 'hello')
      
      let stats = emitter.getEventStats()
      expect(stats.test.emitCount).toBe(1)
      
      emitter.clearEventStats()
      
      stats = emitter.getEventStats()
      expect(stats.test.emitCount).toBe(0)
      expect(stats.test.lastEmitAt).toBeNull()
    })
  })

  describe('错误处理', () => {
    it('应该处理监听器中的错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalListener = vi.fn()
      
      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      emitter.on('test', errorListener)
      emitter.on('test', normalListener)
      
      emitter.emit('test', 'hello')
      
      expect(consoleSpy).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalledWith('hello')
      
      consoleSpy.mockRestore()
    })

    it('应该处理异步监听器中的错误', async () => {
      const errorListener = vi.fn(async () => {
        throw new Error('Async test error')
      })
      const normalListener = vi.fn()
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      emitter.on('test', errorListener)
      emitter.on('test', normalListener)
      
      emitter.emit('test', 'hello')
      
      // 等待异步执行完成
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(consoleSpy).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalledWith('hello')
      
      consoleSpy.mockRestore()
    })
  })
})
