import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { BaseStore } from '../core/BaseStore'
import {
  Action,
  AsyncAction,
  CachedAction,
  CachedGetter,
  DebouncedAction,
  DependentGetter,
  Getter,
  MemoizedGetter,
  PersistentState,
  ReactiveState,
  ReadonlyState,
  State,
  ThrottledAction,
} from '../decorators'

describe('decorators', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('state Decorators', () => {
    class StateTestStore extends BaseStore {
      @State({ default: 'default' })
      normalState: string = 'default'

      @ReactiveState({ default: { nested: 'value' } })
      reactiveState: { nested: string } = { nested: 'value' }

      @PersistentState({ default: 'persistent' })
      persistentState: string = 'persistent'
    }

    class ReadonlyStateTestStore extends BaseStore {
      @ReadonlyState({ value: 'readonly' })
      readonlyState!: string

      constructor(id: string) {
        super(id)
      }
    }

    it('should handle normal state', () => {
      const store = new StateTestStore('state-test')

      expect(store.normalState).toBe('default')

      store.normalState = 'updated'
      expect(store.normalState).toBe('updated')
    })

    it('should handle reactive state', () => {
      const store = new StateTestStore('state-test')

      expect(store.reactiveState.nested).toBe('value')

      store.reactiveState.nested = 'updated'
      expect(store.reactiveState.nested).toBe('updated')
    })

    it('should handle readonly state', () => {
      const store = new ReadonlyStateTestStore('readonly-test')

      expect(store.readonlyState).toBe('readonly')

      expect(() => {
        store.readonlyState = 'should fail'
      }).toThrow()
    })
  })

  describe('action Decorators', () => {
    class ActionTestStore extends BaseStore {
      @State({ default: 0 })
      count: number = 0

      @Action()
      increment() {
        this.count++
      }

      @AsyncAction()
      async asyncIncrement() {
        await new Promise(resolve => setTimeout(resolve, 10))
        this.count++
        return this.count
      }

      @CachedAction(1000)
      cachedAction(value: number) {
        return value * 2
      }

      @DebouncedAction(100)
      debouncedAction() {
        this.count++
      }

      @ThrottledAction(100)
      throttledAction() {
        this.count++
      }
    }

    it('should handle normal actions', () => {
      const store = new ActionTestStore('action-test')

      expect(store.count).toBe(0)
      store.increment()
      expect(store.count).toBe(1)
    })

    it('should handle async actions', async () => {
      const store = new ActionTestStore('action-test')

      const result = await store.asyncIncrement()
      expect(result).toBe(1)
      expect(store.count).toBe(1)
    })

    it('should handle cached actions', () => {
      const store = new ActionTestStore('action-test')

      const result1 = store.cachedAction(5)
      const result2 = store.cachedAction(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
    })

    it('should handle debounced actions', async () => {
      const store = new ActionTestStore('action-test')

      // 快速调用多次
      store.debouncedAction()
      store.debouncedAction()
      store.debouncedAction()

      // 应该还是 0，因为被防抖了
      expect(store.count).toBe(0)

      // 等待防抖时间
      await new Promise(resolve => setTimeout(resolve, 150))

      // 现在应该只执行了一次
      expect(store.count).toBe(1)
    })
  })

  describe('getter Decorators', () => {
    class GetterTestStore extends BaseStore {
      @State({ default: 'John' })
      firstName: string = 'John'

      @State({ default: 'Doe' })
      lastName: string = 'Doe'

      @State({ default: 0 })
      count: number = 0

      @Getter()
      get fullName() {
        return `${this.firstName} ${this.lastName}`
      }

      @CachedGetter(['count'])
      get expensiveComputation() {
        // 模拟昂贵的计算
        return this.count * 1000
      }

      @DependentGetter(['firstName', 'lastName'])
      get dependentName() {
        return `${this.firstName}-${this.lastName}`
      }

      @MemoizedGetter(['count'])
      get memoizedValue() {
        return this.count * 2
      }
    }

    it('should handle normal getters', () => {
      const store = new GetterTestStore('getter-test')

      expect(store.fullName).toBe('John Doe')

      store.firstName = 'Jane'
      expect(store.fullName).toBe('Jane Doe')
    })

    it('should handle cached getters', () => {
      const store = new GetterTestStore('getter-test')

      const result1 = store.expensiveComputation
      const result2 = store.expensiveComputation

      expect(result1).toBe(0)
      expect(result2).toBe(0)

      store.count = 5
      const result3 = store.expensiveComputation
      expect(result3).toBe(5000)
    })

    it('should handle dependent getters', () => {
      const store = new GetterTestStore('getter-test')

      expect(store.dependentName).toBe('John-Doe')

      store.firstName = 'Jane'
      expect(store.dependentName).toBe('Jane-Doe')
    })

    it('should handle memoized getters', () => {
      const store = new GetterTestStore('getter-test')

      expect(store.memoizedValue).toBe(0)

      store.count = 10
      expect(store.memoizedValue).toBe(20)
    })
  })
})
