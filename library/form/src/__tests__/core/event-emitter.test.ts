/**
 * @ldesign/form - EventEmitter Tests
 * 事件发射器测试
 */

import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from '../../core/event-emitter'

describe('EventEmitter', () => {
  it('应该能够添加和触发事件', async () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    await emitter.emit('test', { data: 'test' })

    expect(handler).toHaveBeenCalledWith({ data: 'test' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('应该支持一次性监听器', async () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.once('test', handler)
    await emitter.emit('test', { data: '1' })
    await emitter.emit('test', { data: '2' })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ data: '1' })
  })

  it('应该支持事件优先级', async () => {
    const emitter = new EventEmitter()
    const order: number[] = []

    emitter.on('test', () => order.push(1), 1)
    emitter.on('test', () => order.push(3), 3)
    emitter.on('test', () => order.push(2), 2)

    await emitter.emit('test', {})

    expect(order).toEqual([3, 2, 1])
  })

  it('应该能够移除监听器', async () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    emitter.off('test', handler)
    await emitter.emit('test', {})

    expect(handler).not.toHaveBeenCalled()
  })

  it('应该能够移除所有监听器', async () => {
    const emitter = new EventEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('test', handler1)
    emitter.on('test', handler2)
    emitter.removeAllListeners('test')
    await emitter.emit('test', {})

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('应该能够获取监听器数量', () => {
    const emitter = new EventEmitter()

    emitter.on('test', () => {})
    emitter.on('test', () => {})

    expect(emitter.listenerCount('test')).toBe(2)
  })

  it('应该能够销毁', async () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    emitter.destroy()

    expect(() => emitter.on('test', handler)).toThrow()
    expect(emitter.isDestroyed).toBe(true)
  })

  it('应该支持同步触发事件', () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    emitter.emitSync('test', { data: 'test' })

    expect(handler).toHaveBeenCalledWith({ data: 'test' })
  })
})



