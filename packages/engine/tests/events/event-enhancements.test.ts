import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventManagerImpl } from '../../src/events/event-manager'

describe('事件管理器功能增强', () => {
  let eventManager: EventManagerImpl

  beforeEach(() => {
    eventManager = new EventManagerImpl()
  })

  describe('命名空间功能', () => {
    it('应该支持事件命名空间', () => {
      const namespace = eventManager.namespace('test')
      const handler = vi.fn()

      namespace.on('event', handler)
      namespace.emit('event', { data: 'test' })

      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该隔离不同命名空间的事件', () => {
      const ns1 = eventManager.namespace('ns1')
      const ns2 = eventManager.namespace('ns2')
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      ns1.on('event', handler1)
      ns2.on('event', handler2)

      ns1.emit('event', 'data1')
      expect(handler1).toHaveBeenCalledWith('data1')
      expect(handler2).not.toHaveBeenCalled()

      ns2.emit('event', 'data2')
      expect(handler2).toHaveBeenCalledWith('data2')
      expect(handler1).toHaveBeenCalledTimes(1)
    })

    it('应该支持清理命名空间', () => {
      const namespace = eventManager.namespace('test')
      const handler = vi.fn()

      namespace.on('event1', handler)
      namespace.on('event2', handler)
      namespace.clear()

      namespace.emit('event1', 'data')
      namespace.emit('event2', 'data')

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('批量事件操作', () => {
    it('应该支持批量添加监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventManager.addListeners([
        { event: 'event1', handler: handler1 },
        { event: 'event2', handler: handler2, options: { once: true } }
      ])

      eventManager.emit('event1', 'data1')
      eventManager.emit('event2', 'data2')
      eventManager.emit('event2', 'data3') // 第二次触发，应该被忽略

      expect(handler1).toHaveBeenCalledWith('data1')
      expect(handler2).toHaveBeenCalledWith('data2')
      expect(handler2).toHaveBeenCalledTimes(1)
    })
  })

  describe('事件管道', () => {
    it('应该支持事件管道转换', () => {
      const handler = vi.fn()

      eventManager.pipe('source', 'target', (data: any) => ({ transformed: data }))
      eventManager.on('target', handler)

      eventManager.emit('source', 'original')

      expect(handler).toHaveBeenCalledWith({ transformed: 'original' })
    })

    it('应该支持无转换的事件管道', () => {
      const handler = vi.fn()

      eventManager.pipe('source', 'target')
      eventManager.on('target', handler)

      eventManager.emit('source', 'data')

      expect(handler).toHaveBeenCalledWith('data')
    })
  })

  describe('条件事件监听', () => {
    it('应该只在满足条件时触发监听器', () => {
      const handler = vi.fn()

      eventManager.onWhen(
        'test',
        (data: any) => data.value > 10,
        handler
      )

      eventManager.emit('test', { value: 5 })
      expect(handler).not.toHaveBeenCalled()

      eventManager.emit('test', { value: 15 })
      expect(handler).toHaveBeenCalledWith({ value: 15 })
    })
  })

  describe('事件防抖', () => {
    it('应该在延迟时间内只触发一次', async () => {
      const handler = vi.fn()
      eventManager.on('debounced', handler)

      const debouncer = eventManager.debounce('debounced', 100)

      // 快速连续触发
      debouncer.emit('data1')
      debouncer.emit('data2')
      debouncer.emit('data3')

      // 立即检查，应该还没有触发
      expect(handler).not.toHaveBeenCalled()

      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 150))

      // 应该只触发一次，使用最后的数据
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('data3')
    })

    it('应该支持取消防抖', async () => {
      const handler = vi.fn()
      eventManager.on('debounced', handler)

      const debouncer = eventManager.debounce('debounced', 100)

      debouncer.emit('data')
      debouncer.cancel()

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(handler).not.toHaveBeenCalled()
    })

    it('应该支持立即刷新防抖', () => {
      const handler = vi.fn()
      eventManager.on('debounced', handler)

      const debouncer = eventManager.debounce('debounced', 100)

      debouncer.emit('data')
      debouncer.flush()

      expect(handler).toHaveBeenCalledWith('data')
    })
  })

  describe('事件节流', () => {
    it('应该在时间间隔内限制触发频率', async () => {
      const handler = vi.fn()
      eventManager.on('throttled', handler)

      const throttler = eventManager.throttle('throttled', 100)

      // 快速连续触发
      throttler.emit('data1')
      throttler.emit('data2')
      throttler.emit('data3')

      // 第一次应该立即触发
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('data1')

      // 等待节流间隔
      await new Promise(resolve => setTimeout(resolve, 150))

      // 应该触发最后一次
      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenLastCalledWith('data3')
    })

    it('应该支持取消节流', async () => {
      const handler = vi.fn()
      eventManager.on('throttled', handler)

      const throttler = eventManager.throttle('throttled', 100)

      throttler.emit('data1')
      throttler.emit('data2')
      throttler.cancel()

      await new Promise(resolve => setTimeout(resolve, 150))

      // 只应该触发第一次
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('data1')
    })
  })
})
