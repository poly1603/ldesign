/**
 * 优化功能测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { deepClone, shallowClone, hasCircularReference, getObjectDepth } from '../utils/clone'
import { ObjectPool, ObjectPoolManager } from '../utils/object-pool'
import { CoreEventManager } from '../events/event-manager'

describe('深拷贝优化', () => {
  it('应该正确克隆简单对象', () => {
    const original = { a: 1, b: 'test', c: true }
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  it('应该正确克隆嵌套对象', () => {
    const original = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3
        }
      }
    }
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned.b).not.toBe(original.b)
    expect(cloned.b.d).not.toBe(original.b.d)
  })

  it('应该正确克隆数组', () => {
    const original = [1, 2, [3, 4, [5, 6]]]
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned[2]).not.toBe(original[2])
  })

  it('应该正确克隆 Date 对象', () => {
    const original = new Date('2025-01-01')
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned.getTime()).toBe(original.getTime())
  })

  it('应该正确克隆 Map', () => {
    const original = new Map([['a', 1], ['b', 2]])
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  it('应该正确克隆 Set', () => {
    const original = new Set([1, 2, 3])
    const cloned = deepClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  it('应该检测循环引用', () => {
    const obj: any = { a: 1 }
    obj.self = obj

    expect(hasCircularReference(obj)).toBe(true)
  })

  it('应该处理循环引用 (ignoreCircular)', () => {
    const obj: any = { a: 1, b: { c: 2 } }
    obj.self = obj

    const cloned = deepClone(obj, { ignoreCircular: true, useNative: false })
    expect(cloned.a).toBe(1)
    expect(cloned.b.c).toBe(2)
    expect(cloned.self).toBeUndefined()
  })

  it('应该限制深度', () => {
    const deep = { a: { b: { c: { d: { e: 1 } } } } }

    expect(() => {
      deepClone(deep, { maxDepth: 3, useNative: false })
    }).toThrow()
  })

  it('应该计算对象深度', () => {
    expect(getObjectDepth({ a: 1 })).toBe(1)
    expect(getObjectDepth({ a: { b: 1 } })).toBe(2)
    expect(getObjectDepth({ a: { b: { c: 1 } } })).toBe(3)
  })

  it('浅拷贝应该只复制第一层', () => {
    const original = { a: 1, b: { c: 2 } }
    const cloned = shallowClone(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned.b).toBe(original.b) // 引用相同
  })
})

describe('对象池优化', () => {
  let pool: ObjectPool<{ value: number; data: any }>

  beforeEach(() => {
    pool = new ObjectPool({
      factory: () => ({ value: 0, data: null }),
      reset: (obj) => {
        obj.value = 0
        obj.data = null
      },
      initialSize: 5,
      maxSize: 20,
    })
  })

  afterEach(() => {
    pool.destroy()
  })

  it('应该预创建对象', () => {
    const stats = pool.getStats()
    expect(stats.poolSize).toBe(5)
    expect(stats.createCount).toBe(5)
  })

  it('应该复用对象', () => {
    const obj1 = pool.acquire()
    obj1.value = 100

    pool.release(obj1)

    const obj2 = pool.acquire()
    expect(obj2).toBe(obj1) // 同一个对象
    expect(obj2.value).toBe(0) // 已重置
  })

  it('应该跟踪统计信息', () => {
    pool.acquire()
    pool.acquire()
    const obj = pool.acquire()
    pool.release(obj)

    const stats = pool.getStats()
    expect(stats.acquireCount).toBe(3)
    expect(stats.releaseCount).toBe(1)
    expect(stats.inUseSize).toBe(2)
  })

  it('应该计算复用率', () => {
    // 获取 10 次,但只创建 5 个新对象
    for (let i = 0; i < 5; i++) {
      const obj = pool.acquire()
      pool.release(obj)
    }

    for (let i = 0; i < 5; i++) {
      pool.acquire()
    }

    const stats = pool.getStats()
    expect(stats.reuseRate).toBeGreaterThan(0)
  })

  it('应该限制池大小', () => {
    const objects = []
    for (let i = 0; i < 25; i++) {
      objects.push(pool.acquire())
    }

    objects.forEach(obj => pool.release(obj))

    const stats = pool.getStats()
    expect(stats.poolSize).toBeLessThanOrEqual(20) // maxSize
  })

  it('应该支持批量操作', () => {
    const objects = pool.acquireBatch(10)
    expect(objects.length).toBe(10)

    pool.releaseBatch(objects)
    const stats = pool.getStats()
    expect(stats.inUseSize).toBe(0)
  })
})

describe('对象池管理器', () => {
  let manager: ObjectPoolManager

  beforeEach(() => {
    manager = new ObjectPoolManager()
  })

  afterEach(() => {
    manager.destroyAll()
  })

  it('应该创建和获取对象池', () => {
    manager.createPool('test', {
      factory: () => ({ value: 0 }),
      reset: (obj) => { obj.value = 0 },
    })

    const pool = manager.getPool('test')
    expect(pool).toBeDefined()
  })

  it('应该防止重复创建', () => {
    manager.createPool('test', {
      factory: () => ({ value: 0 }),
      reset: (obj) => { obj.value = 0 },
    })

    expect(() => {
      manager.createPool('test', {
        factory: () => ({ value: 0 }),
        reset: (obj) => { obj.value = 0 },
      })
    }).toThrow()
  })

  it('应该删除对象池', () => {
    manager.createPool('test', {
      factory: () => ({ value: 0 }),
      reset: (obj) => { obj.value = 0 },
    })

    expect(manager.deletePool('test')).toBe(true)
    expect(manager.getPool('test')).toBeUndefined()
  })

  it('应该获取所有统计信息', () => {
    manager.createPool('pool1', {
      factory: () => ({ value: 0 }),
      reset: (obj) => { obj.value = 0 },
    })

    manager.createPool('pool2', {
      factory: () => ({ value: 0 }),
      reset: (obj) => { obj.value = 0 },
    })

    const stats = manager.getAllStats()
    expect(stats.size).toBe(2)
    expect(stats.has('pool1')).toBe(true)
    expect(stats.has('pool2')).toBe(true)
  })
})

describe('EventManager 所有者清理', () => {
  let eventManager: CoreEventManager

  beforeEach(() => {
    eventManager = new CoreEventManager()
  })

  afterEach(async () => {
    await eventManager.destroy()
  })

  it('应该支持所有者关联', () => {
    const owner = {}
    const handler = vi.fn()

    eventManager.on('test', handler, { owner })

    expect(eventManager.getListenerCount('test')).toBe(1)
  })

  it('应该清理所有者的所有监听器', () => {
    const owner = {}
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventManager.on('event1', handler1, { owner })
    eventManager.on('event2', handler2, { owner })

    expect(eventManager.getListenerCount('event1')).toBe(1)
    expect(eventManager.getListenerCount('event2')).toBe(1)

    const cleaned = eventManager.cleanupOwner(owner)
    expect(cleaned).toBe(2)
    expect(eventManager.getListenerCount('event1')).toBe(0)
    expect(eventManager.getListenerCount('event2')).toBe(0)
  })

  it('应该只清理指定所有者的监听器', () => {
    const owner1 = {}
    const owner2 = {}
    const handler = vi.fn()

    eventManager.on('test', handler, { owner: owner1 })
    eventManager.on('test', handler, { owner: owner2 })
    eventManager.on('test', handler) // 无所有者

    expect(eventManager.getListenerCount('test')).toBe(3)

    eventManager.cleanupOwner(owner1)
    expect(eventManager.getListenerCount('test')).toBe(2)
  })
})

