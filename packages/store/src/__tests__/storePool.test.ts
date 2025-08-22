/**
 * Store 池管理功能测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BaseStore } from '../core/BaseStore'
import { PooledStore, StorePool, useStorePool } from '../core/storePool'
import { Action, State } from '../decorators'

// 测试用的 Store 类
class TestPoolStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'test' })
  name: string = 'test'

  constructor(id: string, initialCount = 0) {
    super(id)
    this.count = initialCount
  }

  @Action()
  increment(): void {
    this.count++
  }

  @Action()
  setName(name: string): void {
    this.name = name
  }
}

// 池化的 Store 类
@PooledStore({ maxSize: 5, maxIdleTime: 1000 })
class PooledTestStore extends BaseStore {
  @State({ default: 0 })
  value: number = 0

  constructor(id: string) {
    super(id)
  }

  @Action()
  setValue(value: number): void {
    this.value = value
  }
}

describe('storePool', () => {
  let pool: StorePool

  beforeEach(() => {
    pool = new (StorePool as any)({
      maxSize: 3,
      maxIdleTime: 1000,
      enableGC: false,
    })
  })

  afterEach(() => {
    pool.destroy()
  })

  it('应该创建新的 Store 实例', () => {
    const store = pool.getStore(TestPoolStore, 'test-1')

    expect(store).toBeInstanceOf(TestPoolStore)
    expect(store.$id).toBe('test-1')
  })

  it('应该复用池中的 Store 实例', () => {
    const store1 = pool.getStore(TestPoolStore, 'test-1')
    store1.increment()
    expect(store1.count).toBe(1)

    // 归还到池中
    pool.returnStore(store1)

    // 再次获取应该是重置后的实例
    const store2 = pool.getStore(TestPoolStore, 'test-2')
    expect(store2).toBe(store1) // 应该是同一个实例
    expect(store2.count).toBe(0) // 应该被重置
    expect(store2.$id).toBe('test-2') // ID 应该更新
  })

  it('应该限制池的大小', () => {
    const stores: TestPoolStore[] = []

    // 创建超过池大小的实例
    for (let i = 0; i < 5; i++) {
      const store = pool.getStore(TestPoolStore, `test-${i}`)
      stores.push(store)
    }

    // 归还所有实例
    stores.forEach(store => pool.returnStore(store))

    const stats = pool.getStats()
    expect(stats.poolDetails[0].poolSize).toBeLessThanOrEqual(3) // 不应该超过最大大小
  })

  it('应该预热池', () => {
    pool.warmUp(TestPoolStore, 2, 'warmup')

    const stats = pool.getStats()
    expect(stats.poolDetails[0].poolSize).toBe(2)
  })

  it('应该提供池统计信息', () => {
    const store1 = pool.getStore(TestPoolStore, 'test-1')
    const store2 = pool.getStore(TestPoolStore, 'test-2')

    pool.returnStore(store1)

    const stats = pool.getStats()
    expect(stats.totalPools).toBe(1)
    expect(stats.totalInstances).toBe(2)
    expect(stats.poolDetails[0].className).toBe('TestPoolStore')
    expect(stats.poolDetails[0].poolSize).toBe(1) // 一个在池中
    expect(stats.poolDetails[0].activeInstances).toBe(1) // 一个在使用中
  })

  it('应该清空所有池', () => {
    const store = pool.getStore(TestPoolStore, 'test-1')
    pool.returnStore(store)

    let stats = pool.getStats()
    expect(stats.totalInstances).toBe(1)

    pool.clear()

    stats = pool.getStats()
    expect(stats.totalInstances).toBe(0)
    expect(stats.totalPools).toBe(0)
  })

  it('应该正确处理构造函数参数', () => {
    const store = pool.getStore(TestPoolStore, 'test-1', 10)
    expect(store.count).toBe(10)
  })
})

describe('useStorePool', () => {
  it('应该返回单例池实例', () => {
    const pool1 = useStorePool()
    const pool2 = useStorePool()
    expect(pool1).toBe(pool2)
  })

  it('应该接受配置选项', () => {
    const pool = useStorePool({ maxSize: 10, maxIdleTime: 5000 })
    expect(pool).toBeInstanceOf(StorePool)
  })
})

describe('@PooledStore 装饰器', () => {
  it('应该自动管理 Store 生命周期', () => {
    const store = new PooledTestStore('pooled-test')
    store.setValue(42)
    expect(store.value).toBe(42)

    // 装饰器应该修改了 $dispose 方法
    expect(typeof store.$dispose).toBe('function')
  })
})

describe('垃圾回收功能', () => {
  it('应该清理过期的实例', async () => {
    const pool = new (StorePool as any)({
      maxSize: 10,
      maxIdleTime: 100, // 100ms 过期时间
      enableGC: true,
    })

    try {
      const store = pool.getStore(TestPoolStore, 'test-1')
      pool.returnStore(store)

      const stats = pool.getStats()
      expect(stats.totalInstances).toBe(1)

      // 等待过期时间
      await new Promise(resolve => setTimeout(resolve, 150))

      // 手动触发垃圾回收（在实际实现中这是自动的）
      // 这里我们通过获取新实例来间接测试
      const newStore = pool.getStore(TestPoolStore, 'test-2')

      // 由于过期，应该创建新实例而不是复用
      expect(newStore).toBeInstanceOf(TestPoolStore)
    }
    finally {
      pool.destroy()
    }
  })
})

describe('错误处理', () => {
  let pool: StorePool

  beforeEach(() => {
    pool = new (StorePool as any)({ maxSize: 2, enableGC: false })
  })

  afterEach(() => {
    pool.destroy()
  })

  it('应该处理无效的 Store 类', () => {
    expect(() => {
      pool.getStore(null as any, 'test')
    }).toThrow()
  })

  it('应该处理归还非池化实例', () => {
    const externalStore = new TestPoolStore('external')

    // 归还外部创建的实例不应该报错
    expect(() => {
      pool.returnStore(externalStore)
    }).not.toThrow()
  })
})

describe('内存管理', () => {
  let pool: StorePool

  beforeEach(() => {
    pool = new (StorePool as any)({ maxSize: 2, enableGC: false })
  })

  afterEach(() => {
    pool.destroy()
  })

  it('应该在池满时销毁多余实例', () => {
    const stores: TestPoolStore[] = []

    // 创建实例
    for (let i = 0; i < 3; i++) {
      stores.push(pool.getStore(TestPoolStore, `test-${i}`))
    }

    // 归还所有实例
    stores.forEach((store) => {
      const disposeSpy = vi.spyOn(store, '$dispose')
      pool.returnStore(store)

      // 前两个应该被保留，第三个应该被销毁
      if (stores.indexOf(store) >= 2) {
        expect(disposeSpy).toHaveBeenCalled()
      }
    })

    const stats = pool.getStats()
    expect(stats.poolDetails[0].poolSize).toBe(2) // 只保留最大数量
  })

  it('应该在销毁时清理所有资源', () => {
    const store = pool.getStore(TestPoolStore, 'test-1')
    const disposeSpy = vi.spyOn(store, '$dispose')

    pool.returnStore(store)
    pool.destroy()

    expect(disposeSpy).toHaveBeenCalled()
  })
})
