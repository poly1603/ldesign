import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { BaseStore } from '../core/BaseStore'
import { Action, Getter, State } from '../decorators'

// 测试用的 Store 类
class TestStore extends BaseStore {
  @State({ default: 'test' })
  name: string = 'test'

  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Action()
  setName(newName: string) {
    this.name = newName
  }

  @Getter()
  get displayName() {
    return `Name: ${this.name}`
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }
}

describe('baseStore', () => {
  beforeEach(() => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should create store with correct id', () => {
    const store = new TestStore('test-store')
    expect(store.$id).toBe('test-store')
  })

  it('should initialize state correctly', () => {
    const store = new TestStore('test-store')
    expect(store.$state.name).toBe('test')
    expect(store.$state.count).toBe(0)
  })

  it('should execute actions correctly', () => {
    const store = new TestStore('test-store')

    store.increment()
    expect(store.$state.count).toBe(1)

    store.setName('new name')
    expect(store.$state.name).toBe('new name')
  })

  it('should compute getters correctly', () => {
    const store = new TestStore('test-store')

    expect(store.displayName).toBe('Name: test')

    store.setName('Vue')
    expect(store.displayName).toBe('Name: Vue')

    expect(store.doubleCount).toBe(0)
    store.increment()
    expect(store.doubleCount).toBe(2)
  })

  it('should support $patch method', () => {
    const store = new TestStore('test-store')

    store.$patch({
      name: 'patched',
      count: 5,
    })

    expect(store.$state.name).toBe('patched')
    expect(store.$state.count).toBe(5)
  })

  it('should support $reset method', () => {
    const store = new TestStore('test-store')

    // 修改状态
    store.setName('modified')
    store.increment()

    // 重置状态
    store.$reset()

    expect(store.$state.name).toBe('test')
    expect(store.$state.count).toBe(0)
  })

  it('should support state subscription', () => {
    const store = new TestStore('test-store')
    const mutations: any[] = []

    const unsubscribe = store.$subscribe((mutation, state) => {
      mutations.push({ mutation, state })
    })

    store.increment()
    store.setName('subscribed')

    expect(mutations).toHaveLength(2)

    unsubscribe()
  })

  it('should support action subscription', () => {
    const store = new TestStore('test-store')
    const actions: any[] = []

    const unsubscribe = store.$onAction((context) => {
      actions.push(context)
    })

    // 通过 Pinia store 实例调用 action
    const piniaStore = store.getStore()
    if (piniaStore) {
      piniaStore.increment()
      piniaStore.setName('action test')
    }

    expect(actions).toHaveLength(2)

    unsubscribe()
  })

  it('should get store definition', () => {
    const store = new TestStore('test-store')
    const definition = store.getStoreDefinition()

    expect(definition).toBeDefined()
    expect(typeof definition).toBe('function')
  })

  it('should get pinia store instance', () => {
    const store = new TestStore('test-store')
    const piniaStore = store.getStore()

    expect(piniaStore).toBeDefined()
    expect(piniaStore?.$id).toBe('test-store')
  })
})
