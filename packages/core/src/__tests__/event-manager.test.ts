/**
 * 事件管理器测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEventManager } from '../events'
import type { EventManager } from '../types'

describe('EventManager', () => {
  let eventManager: EventManager

  beforeEach(() => {
    eventManager = createEventManager()
  })

  describe('基础功能', () => {
    it('应该创建事件管理器实例', () => {
      expect(eventManager).toBeDefined()
      expect(eventManager.on).toBeInstanceOf(Function)
      expect(eventManager.emit).toBeInstanceOf(Function)
      expect(eventManager.off).toBeInstanceOf(Function)
    })

    it('应该注册和触发事件', async () => {
      const handler = vi.fn()
      eventManager.on('test-event', handler)
      await eventManager.emit('test-event', { data: 'test' })
      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该返回取消订阅函数', async () => {
      const handler = vi.fn()
      const unsubscribe = eventManager.on('test-event', handler)
      
      unsubscribe()
      await eventManager.emit('test-event', { data: 'test' })
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('应该支持多个监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      eventManager.on('multi-event', handler1)
      eventManager.on('multi-event', handler2)
      eventManager.on('multi-event', handler3)

      await eventManager.emit('multi-event', { data: 'test' })

      expect(handler1).toHaveBeenCalledWith({ data: 'test' })
      expect(handler2).toHaveBeenCalledWith({ data: 'test' })
      expect(handler3).toHaveBeenCalledWith({ data: 'test' })
    })
  })

  describe('优先级', () => {
    it('应该按优先级顺序执行监听器', async () => {
      const order: number[] = []

      eventManager.on('priority-event', () => order.push(1), { priority: 1 })
      eventManager.on('priority-event', () => order.push(10), { priority: 10 })
      eventManager.on('priority-event', () => order.push(5), { priority: 5 })
      eventManager.on('priority-event', () => order.push(0), { priority: 0 })

      await eventManager.emit('priority-event')

      expect(order).toEqual([10, 5, 1, 0])
    })

    it('应该支持负优先级', async () => {
      const order: number[] = []

      eventManager.on('negative-priority', () => order.push(5), { priority: 5 })
      eventManager.on('negative-priority', () => order.push(-5), { priority: -5 })
      eventManager.on('negative-priority', () => order.push(0), { priority: 0 })

      await eventManager.emit('negative-priority')

      expect(order).toEqual([5, 0, -5])
    })

    it('应该为未指定优先级的监听器使用默认优先级0', async () => {
      const order: string[] = []

      eventManager.on('default-priority', () => order.push('high'), { priority: 10 })
      eventManager.on('default-priority', () => order.push('default'))
      eventManager.on('default-priority', () => order.push('low'), { priority: -10 })

      await eventManager.emit('default-priority')

      expect(order).toEqual(['high', 'default', 'low'])
    })
  })

  describe('once 监听器', () => {
    it('应该只触发一次', async () => {
      const handler = vi.fn()
      eventManager.once('once-event', handler)

      await eventManager.emit('once-event', { data: 'first' })
      await eventManager.emit('once-event', { data: 'second' })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ data: 'first' })
    })

    it('应该使用 once 方法注册一次性监听器', async () => {
      const handler = vi.fn()
      eventManager.once('once-method', handler)

      await eventManager.emit('once-method')
      await eventManager.emit('once-method')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该在触发后自动移除', async () => {
      eventManager.once('auto-remove', vi.fn())
      await eventManager.emit('auto-remove')
      
      expect(eventManager.listenerCount('auto-remove')).toBe(0)
    })
  })

  describe('事件移除', () => {
    it('应该移除特定的监听器', async () => {
      const handler = vi.fn()
      eventManager.on('remove-specific', handler)
      
      eventManager.off('remove-specific', handler)
      await eventManager.emit('remove-specific')
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('应该移除事件的所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      eventManager.on('remove-all', handler1)
      eventManager.on('remove-all', handler2)
      
      eventManager.off('remove-all')
      await eventManager.emit('remove-all')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('应该移除所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      eventManager.on('event1', handler1)
      eventManager.on('event2', handler2)
      
      eventManager.removeAllListeners()
      
      await eventManager.emit('event1')
      await eventManager.emit('event2')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('同步触发', () => {
    it('应该同步触发事件', () => {
      const handler = vi.fn()
      eventManager.on('sync-event', handler)
      
      eventManager.emitSync('sync-event', { data: 'test' })
      
      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该按优先级同步触发', () => {
      const order: number[] = []
      
      eventManager.on('sync-priority', () => order.push(1), { priority: 1 })
      eventManager.on('sync-priority', () => order.push(10), { priority: 10 })
      eventManager.on('sync-priority', () => order.push(5), { priority: 5 })
      
      eventManager.emitSync('sync-priority')
      
      expect(order).toEqual([10, 5, 1])
    })
  })

  describe('命名空间', () => {
    it('应该支持命名空间', async () => {
      const appHandler = vi.fn()
      const systemHandler = vi.fn()
      
      eventManager.on('event', appHandler, { namespace: 'app' })
      eventManager.on('event', systemHandler, { namespace: 'system' })
      
      await eventManager.emitNamespace('app', 'event')
      
      expect(appHandler).toHaveBeenCalled()
      expect(systemHandler).not.toHaveBeenCalled()
    })

    it('应该移除命名空间下的所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      
      eventManager.on('event1', handler1, { namespace: 'app' })
      eventManager.on('event2', handler2, { namespace: 'app' })
      eventManager.on('event3', handler3, { namespace: 'system' })
      
      eventManager.offNamespace('app')
      
      await eventManager.emit('event1')
      await eventManager.emit('event2')
      await eventManager.emit('event3')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).toHaveBeenCalled()
    })

    it('应该获取命名空间下的事件列表', () => {
      eventManager.on('event1', vi.fn(), { namespace: 'app' })
      eventManager.on('event2', vi.fn(), { namespace: 'app' })
      eventManager.on('event3', vi.fn(), { namespace: 'system' })
      
      const appEvents = eventManager.getNamespaceEvents('app')
      
      expect(appEvents).toContain('event1')
      expect(appEvents).toContain('event2')
      expect(appEvents).not.toContain('event3')
    })

    it('应该获取命名空间的监听器数量', () => {
      eventManager.on('event1', vi.fn(), { namespace: 'app' })
      eventManager.on('event2', vi.fn(), { namespace: 'app' })
      eventManager.on('event3', vi.fn(), { namespace: 'app' })
      
      const count = eventManager.getNamespaceListenerCount('app')
      
      expect(count).toBe(3)
    })

    it('应该获取所有命名空间', () => {
      eventManager.on('event1', vi.fn(), { namespace: 'app' })
      eventManager.on('event2', vi.fn(), { namespace: 'system' })
      eventManager.on('event3', vi.fn(), { namespace: 'core' })
      
      const namespaces = eventManager.getAllNamespaces()
      
      expect(namespaces).toContain('app')
      expect(namespaces).toContain('system')
      expect(namespaces).toContain('core')
    })

    it('应该获取命名空间的详细信息', () => {
      eventManager.on('event1', vi.fn(), { namespace: 'app' })
      eventManager.on('event1', vi.fn(), { namespace: 'app' })
      eventManager.on('event2', vi.fn(), { namespace: 'app' })
      
      const info = eventManager.getNamespaceInfo('app')
      
      expect(info).toBeDefined()
      expect(info!.namespace).toBe('app')
      expect(info!.eventCount).toBe(2)
      expect(info!.listenerCount).toBe(3)
    })
  })

  describe('统计信息', () => {
    it('应该获取监听器数量', () => {
      eventManager.on('count-event', vi.fn())
      eventManager.on('count-event', vi.fn())
      eventManager.on('count-event', vi.fn())
      
      expect(eventManager.listenerCount('count-event')).toBe(3)
    })

    it('应该获取所有事件名称', () => {
      eventManager.on('event1', vi.fn())
      eventManager.on('event2', vi.fn())
      eventManager.on('event3', vi.fn())
      
      const names = eventManager.eventNames()
      
      expect(names).toContain('event1')
      expect(names).toContain('event2')
      expect(names).toContain('event3')
    })

    it('应该获取事件信息', () => {
      eventManager.on('info-event', vi.fn())
      
      const info = eventManager.getEventInfo('info-event')
      
      expect(info).toBeDefined()
      expect(info!.name).toBe('info-event')
      expect(info!.listenersCount).toBe(1)
      expect(info!.triggerCount).toBe(0)
    })

    it('应该获取所有事件统计信息', () => {
      eventManager.on('event1', vi.fn())
      eventManager.on('event2', vi.fn())
      eventManager.on('event2', vi.fn())
      
      const stats = eventManager.getStats()
      
      expect(stats.totalEvents).toBe(2)
      expect(stats.totalListeners).toBe(3)
      expect(stats.events).toHaveLength(2)
    })

    it('应该在触发事件后更新触发计数', async () => {
      eventManager.on('trigger-count', vi.fn())
      
      await eventManager.emit('trigger-count')
      await eventManager.emit('trigger-count')
      await eventManager.emit('trigger-count')
      
      const info = eventManager.getEventInfo('trigger-count')
      expect(info!.triggerCount).toBe(3)
    })
  })

  describe('错误处理', () => {
    it('应该捕获监听器中的错误并继续执行其他监听器', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      const normalHandler = vi.fn()
      
      eventManager.on('error-event', errorHandler)
      eventManager.on('error-event', normalHandler)
      
      // 应该不会抛出错误
      await eventManager.emit('error-event')
      
      expect(errorHandler).toHaveBeenCalled()
      expect(normalHandler).toHaveBeenCalled()
    })

    it('应该在同步触发时捕获错误', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Sync error')
      })
      const normalHandler = vi.fn()
      
      eventManager.on('sync-error', errorHandler)
      eventManager.on('sync-error', normalHandler)
      
      eventManager.emitSync('sync-error')
      
      expect(errorHandler).toHaveBeenCalled()
      expect(normalHandler).toHaveBeenCalled()
    })
  })

  describe('所有者清理', () => {
    it('应该清理所有者的所有监听器', () => {
      const owner = {}
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      eventManager.on('event1', handler1, { owner })
      eventManager.on('event2', handler2, { owner })
      
      const cleaned = eventManager.cleanupOwner(owner)
      
      expect(cleaned).toBe(2)
      expect(eventManager.listenerCount('event1')).toBe(0)
      expect(eventManager.listenerCount('event2')).toBe(0)
    })

    it('应该只清理指定所有者的监听器', () => {
      const owner1 = {}
      const owner2 = {}
      
      eventManager.on('event', vi.fn(), { owner: owner1 })
      eventManager.on('event', vi.fn(), { owner: owner2 })
      
      eventManager.cleanupOwner(owner1)
      
      expect(eventManager.listenerCount('event')).toBe(1)
    })
  })

  describe('边界情况', () => {
    it('应该处理不存在的事件触发', async () => {
      await expect(eventManager.emit('non-existent')).resolves.not.toThrow()
    })

    it('应该处理空数据触发', async () => {
      const handler = vi.fn()
      eventManager.on('empty-data', handler)
      
      await eventManager.emit('empty-data')
      
      expect(handler).toHaveBeenCalledWith(undefined)
    })

    it('应该处理移除不存在的监听器', () => {
      expect(() => {
        eventManager.off('non-existent', vi.fn())
      }).not.toThrow()
    })

    it('应该处理移除不存在的命名空间', () => {
      expect(() => {
        eventManager.offNamespace('non-existent')
      }).not.toThrow()
    })

    it('应该处理大量监听器', async () => {
      const handlers = Array.from({ length: 1000 }, () => vi.fn())
      
      handlers.forEach(handler => {
        eventManager.on('mass-event', handler)
      })
      
      await eventManager.emit('mass-event')
      
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalled()
      })
    })
  })

  describe('生命周期', () => {
    it('应该初始化事件管理器', async () => {
      await expect(eventManager.init()).resolves.not.toThrow()
    })

    it('应该销毁事件管理器', async () => {
      eventManager.on('event1', vi.fn())
      eventManager.on('event2', vi.fn())
      
      await eventManager.destroy()
      
      expect(eventManager.eventNames()).toHaveLength(0)
    })

    it('应该在销毁后清理所有资源', async () => {
      eventManager.on('event', vi.fn())
      
      await eventManager.destroy()
      
      const stats = eventManager.getStats()
      expect(stats.totalEvents).toBe(0)
      expect(stats.totalListeners).toBe(0)
    })
  })

  describe('性能', () => {
    it('应该高效处理大量事件触发', async () => {
      const handler = vi.fn()
      eventManager.on('perf-event', handler)
      
      const start = Date.now()
      
      for (let i = 0; i < 10000; i++) {
        await eventManager.emit('perf-event', { count: i })
      }
      
      const duration = Date.now() - start
      
      expect(handler).toHaveBeenCalledTimes(10000)
      // 10000次触发应该在合理时间内完成（这是一个宽松的检查）
      expect(duration).toBeLessThan(5000)
    })
  })
})
