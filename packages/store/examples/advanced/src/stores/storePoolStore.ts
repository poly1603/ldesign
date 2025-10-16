import {
  Action,
  BaseStore,
  PooledStore,
  State,
  useStorePool,
} from '@ldesign/store'

// 测试用的池化Store
@PooledStore({ maxSize: 10, maxIdleTime: 300000 })
class TestPooledStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: '' })
  data: string = ''

  constructor(id: string) {
    super(id)
    this.data = `Store ${id} created at ${new Date().toISOString()}`
  }

  @Action()
  increment(): void {
    this.count++
  }

  @Action()
  setData(data: string): void {
    this.data = data
  }

  @Action()
  reset(): void {
    this.count = 0
    this.data = `Store ${this.$id} reset at ${new Date().toISOString()}`
  }
}

// 普通Store用于性能对比
class RegularStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: '' })
  data: string = ''

  constructor(id: string) {
    super(id)
    this.data = `Regular Store ${id} created at ${new Date().toISOString()}`
  }

  @Action()
  increment(): void {
    this.count++
  }
}

export class StorePoolDemoStore extends BaseStore {
  @State({ default: new Map() })
  activeInstances: Map<string, TestPooledStore> = new Map()

  @State({ default: 0 })
  instanceCounter: number = 0

  private pool = useStorePool({
    maxSize: 20,
    maxIdleTime: 600000, // 10分钟
    enableGC: true,
  })

  constructor() {
    super('store-pool-demo')
  }

  @Action()
  initializePool(): void {
    
    // 预热池
    this.pool.warmUp(TestPooledStore, 3, 'warmup')
  }

  @Action()
  createPooledInstance(): TestPooledStore {
    this.instanceCounter++
    const id = `pooled-${this.instanceCounter}`

    const instance = this.pool.getStore(TestPooledStore, id)
    this.activeInstances.set(id, instance)

    return instance
  }

  @Action()
  returnInstanceToPool(instanceId: string): void {
    const instance = this.activeInstances.get(instanceId)
    if (instance) {
      // 重置实例状态
      instance.reset()

      // 归还到池中
      this.pool.returnStore(instance)

      // 从活跃实例中移除
      this.activeInstances.delete(instanceId)
    }
  }

  @Action()
  incrementInstance(instanceId: string): void {
    const instance = this.activeInstances.get(instanceId)
    if (instance) {
      instance.increment()
    }
  }

  @Action()
  warmUpPool(count: number): void {
    this.pool.warmUp(TestPooledStore, count, 'warmup')
  }

  @Action()
  clearPool(): void {
    // 归还所有活跃实例
    for (const [, instance] of this.activeInstances) {
      this.pool.returnStore(instance)
    }
    this.activeInstances.clear()

    // 清空池
    this.pool.clear()
  }

  @Action()
  async testTraditionalCreation(
    count: number,
  ): Promise<{ time: number, memory: number }> {
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()

    // 创建大量实例
    const instances: RegularStore[] = []
    for (let i = 0; i < count; i++) {
      const instance = new RegularStore(`regular-${i}`)
      instance.increment()
      instances.push(instance)
    }

    // 模拟使用
    await new Promise(resolve => setTimeout(resolve, 10))

    // 清理实例
    instances.forEach(instance => instance.$dispose())

    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()

    return {
      time: endTime - startTime,
      memory: Math.max(0, endMemory - startMemory),
    }
  }

  @Action()
  async testPooledCreation(
    count: number,
  ): Promise<{ time: number, memory: number }> {
    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()

    // 使用池创建实例
    const instances: TestPooledStore[] = []
    for (let i = 0; i < count; i++) {
      const instance = this.pool.getStore(TestPooledStore, `pooled-test-${i}`)
      instance.increment()
      instances.push(instance)
    }

    // 模拟使用
    await new Promise(resolve => setTimeout(resolve, 10))

    // 归还实例到池
    instances.forEach((instance) => {
      instance.reset()
      this.pool.returnStore(instance)
    })

    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()

    return {
      time: endTime - startTime,
      memory: Math.max(0, endMemory - startMemory),
    }
  }

  get poolStats() {
    return this.pool.getStats()
  }

  private getMemoryUsage(): number {
    // 在浏览器环境中，我们无法直接获取内存使用情况
    // 这里返回一个模拟值
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }

    // 模拟内存使用情况
    return Math.random() * 10 + 50
  }
}

// 导出Hook式用法
export function useStorePoolDemo() {
  return new StorePoolDemoStore()
}
