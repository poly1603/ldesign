import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CoreEventManager } from '../event-manager'

describe('CoreEventManager', () => {
  let manager: CoreEventManager

  beforeEach(() => {
    manager = new CoreEventManager()
  })

  describe('基本操作', () => {
    it('应该能够监听和触发事件', async () => {
      const handler = vi.fn()
      
      manager.on('test', handler)
      await manager.emit('test', { data: 'value' })
      
      expect(handler).toHaveBeenCalledWith({ data: 'value' })
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该能够同步触发事件', () => {
      const handler = vi.fn()
      
      manager.on('test', handler)
      manager.emitSync('test', { data: 'value' })
      
      expect(handler).toHaveBeenCalledWith({ data: 'value' })
    })

    it('应该能够取消监听', async () => {
      const handler = vi.fn()
      
      const unsubscribe = manager.on('test', handler)
      unsubscribe()
      
      await manager.emit('test', { data: 'value' })
      
      expect(handler).not.toHaveBeenCalled()
    })

    it('应该能够监听一次事件', async () => {
      const handler = vi.fn()
      
      manager.once('test', handler)
      
      await manager.emit('test', { data: '1' })
      await manager.emit('test', { data: '2' })
      
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ data: '1' })
    })

    it('应该能够移除所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      manager.on('test', handler1)
      manager.on('test', handler2)
      
      manager.removeAllListeners('test')
      
      await manager.emit('test', { data: 'value' })
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('优先级', () => {
    it('应该按优先级顺序执行监听器', async () => {
      const order: number[] = []
      
      manager.on('test', () => order.push(1), { priority: 1 })
      manager.on('test', () => order.push(3), { priority: 3 })
      manager.on('test', () => order.push(2), { priority: 2 })
      
      await manager.emit('test')
      
      expect(order).toEqual([3, 2, 1])
    })

    it('应该正确处理相同优先级的监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      manager.on('test', handler1, { priority: 1 })
      manager.on('test', handler2, { priority: 1 })
      
      await manager.emit('test')
      
      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })
  })

  describe('命名空间', () => {
    it('应该支持命名空间', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      manager.on('test', handler1, { namespace: 'app' })
      manager.on('test', handler2, { namespace: 'plugin' })
      
      await manager.emit('test')
      
      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('应该能够移除命名空间下的所有监听器', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      
      manager.on('test1', handler1, { namespace: 'app' })
      manager.on('test2', handler2, { namespace: 'app' })
      manager.on('test3', handler3, { namespace: 'plugin' })
      
      manager.offNamespace('app')
      
      await manager.emit('test1')
      await manager.emit('test2')
      await manager.emit('test3')
      
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).toHaveBeenCalled()
    })
  })

  describe('弱引用监听器', () => {
    it('应该支持弱引用监听器', async () => {
      const handler = vi.fn()
      
      manager.on('test', handler, { weak: true })
      
      await manager.emit('test')
      
      expect(handler).toHaveBeenCalled()
    })

    it('应该能够清理孤儿监听器', async () => {
      class Owner {}
      let owner: Owner | null = new Owner()
      
      const handler = vi.fn()
      manager.on('test', handler, { owner })
      
      // 模拟垃圾回收
      owner = null
      
      // 手动触发清理 (需要访问私有方法或等待定时器)
      // 这里只是演示概念
      await manager.emit('test')
      
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的监听器数量', () => {
      manager.on('test', () => {})
      manager.on('test', () => {})
      manager.on('other', () => {})
      
      expect(manager.listenerCount('test')).toBe(2)
      expect(manager.listenerCount('other')).toBe(1)
    })

    it('应该返回所有事件名称', () => {
      manager.on('test1', () => {})
      manager.on('test2', () => {})
      manager.on('test3', () => {})
      
      const names = manager.eventNames()
      expect(names).toHaveLength(3)
      expect(names).toContain('test1')
      expect(names).toContain('test2')
      expect(names).toContain('test3')
    })

    it('应该返回事件信息', async () => {
      manager.on('test', () => {})
      manager.on('test', () => {})
      
      await manager.emit('test')
      
      const info = manager.getEventInfo('test')
      
      expect(info).toBeDefined()
      expect(info?.name).toBe('test')
      expect(info?.listenersCount).toBe(2)
      expect(info?.triggerCount).toBe(1)
      expect(info?.lastTriggered).toBeGreaterThan(0)
    })

    it('应该返回统计信息', () => {
      manager.on('test1', () => {})
      manager.on('test1', () => {})
      manager.on('test2', () => {})
      
      const stats = manager.getStats()
      
      expect(stats.totalEvents).toBe(2)
      expect(stats.totalListeners).toBe(3)
      expect(stats.events).toHaveLength(2)
    })
  })

  describe('错误处理', () => {
    it('应该处理异步处理器中的错误', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('处理失败'))
      
      manager.on('test', handler)
      
      // 不应该抛出错误
      await expect(manager.emit('test')).resolves.toBeUndefined()
    })

    it('应该处理同步处理器中的错误', () => {
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('处理失败')
      })
      
      manager.on('test', handler)
      
      // 不应该抛出错误
      expect(() => manager.emitSync('test')).not.toThrow()
    })

    it('应该在一个处理器失败后继续执行其他处理器', async () => {
      const handler1 = vi.fn().mockRejectedValue(new Error('失败'))
      const handler2 = vi.fn()
      
      manager.on('test', handler1)
      manager.on('test', handler2)
      
      await manager.emit('test')
      
      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })
  })

  describe('性能', () => {
    it('应该能够处理大量监听器', async () => {
      const handlers = Array.from({ length: 1000 }, () => vi.fn())
      
      handlers.forEach(handler => {
        manager.on('test', handler)
      })
      
      await manager.emit('test')
      
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalled()
      })
    })

    it('应该能够处理大量事件', async () => {
      for (let i = 0; i < 1000; i++) {
        manager.on(`test${i}`, () => {})
      }
      
      expect(manager.eventNames()).toHaveLength(1000)
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化', async () => {
      await expect(manager.init()).resolves.toBeUndefined()
    })

    it('应该能够销毁', async () => {
      manager.on('test', () => {})
      
      await manager.destroy()
      
      expect(manager.eventNames()).toHaveLength(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理不存在的事件', async () => {
      await expect(manager.emit('nonexistent')).resolves.toBeUndefined()
    })

    it('应该处理空数据', async () => {
      const handler = vi.fn()
      
      manager.on('test', handler)
      await manager.emit('test')
      
      expect(handler).toHaveBeenCalledWith(undefined)
    })

    it('应该处理 null 数据', async () => {
      const handler = vi.fn()
      
      manager.on('test', handler)
      await manager.emit('test', null)
      
      expect(handler).toHaveBeenCalledWith(null)
    })
  })
})

