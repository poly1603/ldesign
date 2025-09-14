/**
 * EventEmitter 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from '@/core/event-emitter'

describe('EventEmitter', () => {
  let emitter: EventEmitter
  
  beforeEach(() => {
    emitter = new EventEmitter()
  })

  describe('基础功能', () => {
    it('应该能够创建实例', () => {
      expect(emitter).toBeInstanceOf(EventEmitter)
      expect(emitter.listenerCount()).toBe(0)
    })

    it('应该能够注册和触发事件', async () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      
      await emitter.emit('test', 'data')
      
      expect(handler).toHaveBeenCalledWith('data')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该能够注册多个监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      
      await emitter.emit('test', 'data')
      
      expect(handler1).toHaveBeenCalledWith('data')
      expect(handler2).toHaveBeenCalledWith('data')
      expect(emitter.listenerCount('test')).toBe(2)
    })

    it('应该能够移除监听器', async () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.off('test', handler)
      
      await emitter.emit('test', 'data')
      
      expect(handler).not.toHaveBeenCalled()
      expect(emitter.listenerCount('test')).toBe(0)
    })

    it('应该能够移除所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      emitter.on('test1', handler1)
      emitter.on('test2', handler2)
      
      emitter.removeAllListeners()
      
      await emitter.emit('test1', 'data1')
      await emitter.emit('test2', 'data2')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(emitter.listenerCount()).toBe(0)
    })

    it('应该能够移除特定事件的所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      
      emitter.on('test1', handler1)
      emitter.on('test1', handler2)
      emitter.on('test2', handler3)
      
      emitter.removeAllListeners('test1')
      
      await emitter.emit('test1', 'data1')
      await emitter.emit('test2', 'data2')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).toHaveBeenCalledWith('data2')
      expect(emitter.listenerCount('test1')).toBe(0)
      expect(emitter.listenerCount('test2')).toBe(1)
    })
  })

  describe('once 方法', () => {
    it('应该只触发一次', async () => {
      const handler = vi.fn()
      emitter.once('test', handler)
      
      await emitter.emit('test', 'data1')
      await emitter.emit('test', 'data2')
      
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('data1')
      expect(emitter.listenerCount('test')).toBe(0)
    })

    it('应该能够在触发前移除', async () => {
      const handler = vi.fn()
      emitter.once('test', handler)
      emitter.off('test', handler)
      
      await emitter.emit('test', 'data')
      
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('异步处理', () => {
    it('应该能够处理异步监听器', async () => {
      const handler = vi.fn(async (data) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return `processed-${data}`
      })
      
      emitter.on('test', handler)
      
      await emitter.emit('test', 'data')
      
      expect(handler).toHaveBeenCalledWith('data')
    })

    it('应该能够等待所有异步监听器完成', async () => {
      const results: string[] = []
      
      const handler1 = vi.fn(async (data) => {
        await new Promise(resolve => setTimeout(resolve, 20))
        results.push(`handler1-${data}`)
      })
      
      const handler2 = vi.fn(async (data) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        results.push(`handler2-${data}`)
      })
      
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      
      await emitter.emit('test', 'data')
      
      expect(results).toHaveLength(2)
      expect(results).toContain('handler1-data')
      expect(results).toContain('handler2-data')
    })
  })

  describe('错误处理', () => {
    it('应该能够处理监听器中的错误', async () => {
      const errorHandler = vi.fn()
      const normalHandler = vi.fn()
      
      emitter.on('error', errorHandler)
      emitter.on('test', () => {
        throw new Error('Test error')
      })
      emitter.on('test', normalHandler)
      
      await emitter.emit('test', 'data')
      
      expect(errorHandler).toHaveBeenCalled()
      expect(normalHandler).toHaveBeenCalledWith('data')
    })

    it('应该能够处理异步监听器中的错误', async () => {
      const errorHandler = vi.fn()
      const normalHandler = vi.fn()
      
      emitter.on('error', errorHandler)
      emitter.on('test', async () => {
        throw new Error('Async test error')
      })
      emitter.on('test', normalHandler)
      
      await emitter.emit('test', 'data')
      
      expect(errorHandler).toHaveBeenCalled()
      expect(normalHandler).toHaveBeenCalledWith('data')
    })
  })

  describe('调试模式', () => {
    it('应该在调试模式下输出日志', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const debugEmitter = new EventEmitter(true)
      const handler = vi.fn()
      
      debugEmitter.on('test', handler)
      await debugEmitter.emit('test', 'data')
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('内存管理', () => {
    it('应该能够正确清理资源', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      emitter.on('test1', handler1)
      emitter.on('test2', handler2)
      
      expect(emitter.listenerCount()).toBe(2)
      
      emitter.destroy()
      
      expect(emitter.listenerCount()).toBe(0)
    })

    it('销毁后不应该能够添加新的监听器', () => {
      emitter.destroy()
      
      expect(() => {
        emitter.on('test', vi.fn())
      }).toThrow('EventEmitter已销毁')
    })

    it('销毁后不应该能够触发事件', async () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.destroy()
      
      await emitter.emit('test', 'data')
      
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('边界情况', () => {
    it('应该能够处理不存在的事件', async () => {
      await expect(emitter.emit('nonexistent', 'data')).resolves.not.toThrow()
    })

    it('应该能够处理空的监听器列表', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0)
    })

    it('应该能够处理重复移除同一个监听器', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      
      emitter.off('test', handler)
      emitter.off('test', handler) // 重复移除
      
      expect(emitter.listenerCount('test')).toBe(0)
    })

    it('应该能够处理移除不存在的监听器', () => {
      const handler = vi.fn()
      
      expect(() => {
        emitter.off('test', handler)
      }).not.toThrow()
    })
  })
})
