import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from '../../src/core/EventEmitter'

interface TestEvents {
  'user:login': { username: string, timestamp: number }
  'user:logout': { username: string }
  'data:load': string
  'data:save': string
  'system:*': any
  [key: string]: unknown
}

describe('eventEmitter Advanced Features', () => {
  let emitter: EventEmitter<TestEvents>

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>()
  })

  describe('监听器优先级', () => {
    it('应该按优先级顺序执行监听器', () => {
      const callOrder: number[] = []

      emitter.on('data:load', () => callOrder.push(1), { priority: 1 })
      emitter.on('data:load', () => callOrder.push(3), { priority: 3 })
      emitter.on('data:load', () => callOrder.push(2), { priority: 2 })

      emitter.emit('data:load', 'test')

      expect(callOrder).toEqual([3, 2, 1])
    })

    it('应该正确处理相同优先级的监听器', () => {
      const callOrder: string[] = []

      emitter.on('data:load', () => callOrder.push('a'), { priority: 1 })
      emitter.on('data:load', () => callOrder.push('b'), { priority: 1 })
      emitter.on('data:load', () => callOrder.push('c'), { priority: 1 })

      emitter.emit('data:load', 'test')

      // 相同优先级按添加顺序执行
      expect(callOrder).toEqual(['a', 'b', 'c'])
    })

    it('应该支持负优先级', () => {
      const callOrder: number[] = []

      emitter.on('data:load', () => callOrder.push(0), { priority: 0 })
      emitter.on('data:load', () => callOrder.push(-1), { priority: -1 })
      emitter.on('data:load', () => callOrder.push(1), { priority: 1 })

      emitter.emit('data:load', 'test')

      expect(callOrder).toEqual([1, 0, -1])
    })
  })

  describe('通配符事件', () => {
    it('应该支持通配符事件监听', () => {
      const listener = vi.fn()

      emitter.on('user:*', listener)
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })
      emitter.emit('user:logout', { username: 'test' })

      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('应该支持多级通配符', () => {
      const listener = vi.fn()

      emitter.on('*', listener)
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })
      emitter.emit('data:load', 'test')
      emitter.emit('system:*', {})

      expect(listener).toHaveBeenCalledTimes(3)
    })

    it('应该同时触发具体事件和通配符事件', () => {
      const specificListener = vi.fn()
      const wildcardListener = vi.fn()

      emitter.on('user:login', specificListener)
      emitter.on('user:*', wildcardListener)

      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      expect(specificListener).toHaveBeenCalledTimes(1)
      expect(wildcardListener).toHaveBeenCalledTimes(1)
    })

    it('应该移除通配符监听器', () => {
      const listener = vi.fn()

      emitter.on('user:*', listener)
      emitter.off('user:*', listener)
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('事件命名空间', () => {
    it('应该支持命名空间事件', () => {
      const userListener = vi.fn()
      const dataListener = vi.fn()

      emitter.on('user:login', userListener)
      emitter.on('data:load', dataListener)

      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      expect(userListener).toHaveBeenCalled()
      expect(dataListener).not.toHaveBeenCalled()
    })

    it('应该移除命名空间下的所有监听器', () => {
      const loginListener = vi.fn()
      const logoutListener = vi.fn()

      emitter.on('user:login', loginListener)
      emitter.on('user:logout', logoutListener)
      emitter.removeAllListeners('user:*')

      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })
      emitter.emit('user:logout', { username: 'test' })

      expect(loginListener).not.toHaveBeenCalled()
      expect(logoutListener).not.toHaveBeenCalled()
    })
  })

  describe('监听器元数据', () => {
    it('应该存储监听器的元数据', () => {
      const listener = vi.fn()

      emitter.on('data:load', listener, {
        priority: 1,
        metadata: { name: 'test-listener', version: '1.0' },
      })

      const listeners = emitter.listeners('data:load')
      expect(listeners).toHaveLength(1)
    })

    it('应该通过元数据查找监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('data:load', listener1, {
        metadata: { group: 'A' },
      })
      emitter.on('data:load', listener2, {
        metadata: { group: 'B' },
      })

      const listeners = emitter.listeners('data:load')
      expect(listeners).toHaveLength(2)
    })
  })

  describe('内存泄漏检测', () => {
    it('应该在监听器过多时发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      emitter.setMaxListeners(5)

      for (let i = 0; i < 6; i++) {
        emitter.on('data:load', vi.fn())
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Max listeners'),
      )

      consoleSpy.mockRestore()
    })

    it('应该检测未移除的监听器', () => {
      const listener = vi.fn()

      emitter.on('data:load', listener)
      expect(emitter.hasListeners('data:load')).toBe(true)

      emitter.off('data:load', listener)
      expect(emitter.hasListeners('data:load')).toBe(false)
    })

    it('应该提供监听器统计信息', () => {
      emitter.on('data:load', vi.fn())
      emitter.on('data:load', vi.fn())
      emitter.on('data:save', vi.fn())

      expect(emitter.listenerCount('data:load')).toBe(2)
      expect(emitter.listenerCount('data:save')).toBe(1)
      expect(emitter.eventNames()).toContain('data:load')
      expect(emitter.eventNames()).toContain('data:save')
    })
  })

  describe('事件拦截', () => {
    it('应该在触发事件前进行拦截', () => {
      const interceptor = vi.fn((event, data) => {
        return data // 允许继续
      })

      const listener = vi.fn()

      emitter.intercept(interceptor)
      emitter.on('data:load', listener)
      emitter.emit('data:load', 'test')

      expect(interceptor).toHaveBeenCalledWith('data:load', 'test')
      expect(listener).toHaveBeenCalled()
    })

    it('应该支持拦截器阻止事件', () => {
      const interceptor = vi.fn(() => {
        return false // 阻止事件
      })

      const listener = vi.fn()

      emitter.intercept(interceptor)
      emitter.on('data:load', listener)
      emitter.emit('data:load', 'test')

      expect(interceptor).toHaveBeenCalled()
      expect(listener).not.toHaveBeenCalled()
    })

    it('应该支持拦截器修改事件数据', () => {
      const interceptor = vi.fn((event, data) => {
        return data + '-modified'
      })

      const listener = vi.fn()

      emitter.intercept(interceptor)
      emitter.on('data:load', listener)
      emitter.emit('data:load', 'test')

      expect(listener).toHaveBeenCalledWith('test-modified')
    })
  })

  describe('事件管道', () => {
    it('应该支持事件管道处理', () => {
      const pipeline = [
        vi.fn((data: string) => data.toUpperCase()),
        vi.fn((data: string) => data + '!'),
      ]

      const listener = vi.fn()

      emitter.pipe('data:load', ...pipeline)
      emitter.on('data:load', listener)
      emitter.emit('data:load', 'hello')

      expect(pipeline[0]).toHaveBeenCalledWith('hello')
      expect(pipeline[1]).toHaveBeenCalledWith('HELLO')
      expect(listener).toHaveBeenCalledWith('HELLO!')
    })

    it('应该处理管道中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const pipeline = [
        vi.fn(() => {
          throw new Error('Pipeline error')
        }),
      ]

      const listener = vi.fn()

      emitter.pipe('data:load', ...pipeline)
      emitter.on('data:load', listener)
      emitter.emit('data:load', 'test')

      expect(consoleSpy).toHaveBeenCalled()
      expect(listener).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('批量操作', () => {
    it('应该支持批量添加监听器', () => {
      const listeners = {
        'data:load': vi.fn(),
        'data:save': vi.fn(),
        'user:login': vi.fn(),
      }

      emitter.onAll(listeners)

      emitter.emit('data:load', 'test')
      emitter.emit('data:save', 'test')
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      expect(listeners['data:load']).toHaveBeenCalled()
      expect(listeners['data:save']).toHaveBeenCalled()
      expect(listeners['user:login']).toHaveBeenCalled()
    })

    it('应该支持批量移除监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      emitter.on('data:load', listener1)
      emitter.on('data:save', listener2)
      emitter.on('user:login', listener3)

      emitter.offAll(['data:load', 'data:save'])

      emitter.emit('data:load', 'test')
      emitter.emit('data:save', 'test')
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
      expect(listener3).toHaveBeenCalled()
    })
  })

  describe('异步事件', () => {
    it('应该支持异步监听器', async () => {
      const asyncListener = vi.fn(async (data: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return data.toUpperCase()
      })

      emitter.on('data:load', asyncListener)
      await emitter.emitAsync('data:load', 'test')

      expect(asyncListener).toHaveBeenCalledWith('test')
    })

    it('应该等待所有异步监听器完成', async () => {
      const results: string[] = []

      const listener1 = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        results.push('first')
      })

      const listener2 = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 30))
        results.push('second')
      })

      emitter.on('data:load', listener1)
      emitter.on('data:load', listener2)

      await emitter.emitAsync('data:load', 'test')

      expect(results).toContain('first')
      expect(results).toContain('second')
    })

    it('应该处理异步监听器中的错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const errorListener = vi.fn(async () => {
        throw new Error('Async error')
      })

      const normalListener = vi.fn()

      emitter.on('data:load', errorListener)
      emitter.on('data:load', normalListener)

      await emitter.emitAsync('data:load', 'test')

      expect(consoleSpy).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('事件历史记录', () => {
    it('应该记录事件触发历史', () => {
      emitter.enableHistory(true)

      emitter.emit('data:load', 'test1')
      emitter.emit('data:save', 'test2')
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      const history = emitter.getHistory()
      expect(history).toHaveLength(3)
      expect(history[0]).toHaveProperty('event', 'data:load')
      expect(history[1]).toHaveProperty('event', 'data:save')
      expect(history[2]).toHaveProperty('event', 'user:login')
    })

    it('应该限制历史记录数量', () => {
      emitter.enableHistory(true, { maxSize: 2 })

      emitter.emit('data:load', 'test1')
      emitter.emit('data:save', 'test2')
      emitter.emit('user:login', { username: 'test', timestamp: Date.now() })

      const history = emitter.getHistory()
      expect(history.length).toBeLessThanOrEqual(2)
    })

    it('应该能够清除历史记录', () => {
      emitter.enableHistory(true)

      emitter.emit('data:load', 'test')
      expect(emitter.getHistory()).toHaveLength(1)

      emitter.clearHistory()
      expect(emitter.getHistory()).toHaveLength(0)
    })
  })

  describe('调试模式', () => {
    it('应该在调试模式下记录详细信息', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      emitter.enableDebug(true)
      emitter.on('data:load', vi.fn())
      emitter.emit('data:load', 'test')

      expect(consoleSpy).toHaveBeenCalled()

      emitter.enableDebug(false)
      consoleSpy.mockRestore()
    })
  })

  describe('性能优化', () => {
    it('应该高效处理大量事件', () => {
      const listener = vi.fn()
      emitter.on('data:load', listener)

      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        emitter.emit('data:load', `test${i}`)
      }
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // 应该在 100ms 内完成
      expect(listener).toHaveBeenCalledTimes(1000)
    })

    it('应该避免内存泄漏', () => {
      const listener = vi.fn()

      for (let i = 0; i < 100; i++) {
        emitter.on('data:load', listener)
        emitter.off('data:load', listener)
      }

      expect(emitter.listenerCount('data:load')).toBe(0)
    })
  })
})
