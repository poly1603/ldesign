import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createFunctionalStore,
  defineStore,
  defineStoreWithOptions,
} from '../core/FunctionalStore'

describe('functionalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('createFunctionalStore', () => {
    it('should create a functional store with basic state and actions', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0, name: 'test' }),
        actions: {
          increment: function (this: any) {
            this.count++
          },
          setName: function (this: any, newName: string) {
            this.name = newName
          },
        },
      })

      const store = useStore()

      expect(store.$id).toBe('test-store')
      expect(store.$state.count).toBe(0)
      expect(store.$state.name).toBe('test')
      expect(typeof store.$actions.increment).toBe('function')
      expect(typeof store.$actions.setName).toBe('function')
    })

    it('should create a functional store with getters', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 5 }),
        getters: {
          doubleCount: (state) => state.count * 2,
          isEven: (state) => state.count % 2 === 0,
        },
      })

      const store = useStore()

      expect(store.$getters.doubleCount).toBeDefined()
      expect(store.$getters.isEven).toBeDefined()
    })

    it('should support $patch with partial state', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0, name: 'test' }),
      })

      const store = useStore()
      store.$patch({ count: 5 })

      expect(store.$state.count).toBe(5)
      expect(store.$state.name).toBe('test')
    })

    it('should support $patch with mutator function', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0, name: 'test' }),
      })

      const store = useStore()
      store.$patch((state) => {
        state.count = 10
        state.name = 'updated'
      })

      expect(store.$state.count).toBe(10)
      expect(store.$state.name).toBe('updated')
    })

    it('should support $reset', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0, name: 'test' }),
      })

      const store = useStore()
      store.$patch({ count: 5, name: 'updated' })
      store.$reset()

      expect(store.$state.count).toBe(0)
      expect(store.$state.name).toBe('test')
    })

    it('should support $subscribe', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0 }),
        actions: {
          increment: function (this: any) {
            this.count++
          },
        },
      })

      const store = useStore()
      const callback = vi.fn()
      const unsubscribe = store.$subscribe(callback)

      // 通过 $patch 来触发订阅
      store.$patch({ count: 1 })

      expect(callback).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')

      unsubscribe()
    })

    it('should support $onAction', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0 }),
        actions: {
          increment: function (this: any) {
            this.count++
          },
        },
      })

      const store = useStore()
      const callback = vi.fn()
      const unsubscribe = store.$onAction(callback)

      // 直接调用 Pinia store 的 action 来触发订阅
      const piniaStore = store.getStore()
      piniaStore.increment()

      expect(callback).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')

      unsubscribe()
    })

    it('should support persistence', () => {
      const mockStorage = {
        getItem: vi.fn().mockReturnValue('{"count":5}'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      }

      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0 }),
        persist: { storage: mockStorage },
      })

      const store = useStore()

      // Should load persisted state
      expect(store.$state.count).toBe(5)

      // Test persistence methods
      store.$persist()
      expect(mockStorage.setItem).toHaveBeenCalled()

      store.$clearPersisted()
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test-store')
    })

    it('should support caching', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0 }),
        cache: { maxSize: 10, defaultTTL: 1000 },
      })

      const store = useStore()

      store.$setCache('test-key', 'test-value')
      expect(store.$getCache('test-key')).toBe('test-value')

      expect(store.$deleteCache('test-key')).toBe(true)
      expect(store.$getCache('test-key')).toBeUndefined()

      store.$setCache('key1', 'value1')
      store.$setCache('key2', 'value2')
      store.$clearCache()
      expect(store.$getCache('key1')).toBeUndefined()
      expect(store.$getCache('key2')).toBeUndefined()
    })

    it('should dispose resources properly', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0 }),
      })

      const store = useStore()
      const callback = vi.fn()

      store.$subscribe(callback)
      store.$onAction(callback)

      expect(() => store.$dispose()).not.toThrow()
    })

    it('should return store and store definition', () => {
      const useStore = createFunctionalStore({
        id: 'test-store',
        state: () => ({ count: 0 }),
      })

      const store = useStore()

      expect(store.getStore()).toBeDefined()
      expect(store.getStoreDefinition()).toBeDefined()
      expect(store.getStore().$id).toBe('test-store')
    })
  })

  describe('defineStore', () => {
    it('should create a simple functional store', () => {
      const useStore = defineStore(
        'simple-store',
        () => ({ count: 0 }),
        {
          increment: function (this: any) {
            this.count++
          },
        },
        {
          doubleCount: (state) => state.count * 2,
        }
      )

      const store = useStore()

      expect(store.$id).toBe('simple-store')
      expect(store.$state.count).toBe(0)
      expect(typeof store.$actions.increment).toBe('function')
      expect(store.$getters.doubleCount).toBeDefined()
    })
  })

  describe('defineStoreWithOptions', () => {
    it('should create a functional store with full options', () => {
      const useStore = defineStoreWithOptions({
        id: 'options-store',
        state: () => ({ count: 0 }),
        actions: {
          increment: function (this: any) {
            this.count++
          },
        },
        persist: true,
        cache: { maxSize: 5 },
        devtools: true,
      })

      const store = useStore()

      expect(store.$id).toBe('options-store')
      expect(store.$state.count).toBe(0)
      expect(typeof store.$actions.increment).toBe('function')
    })
  })

  describe('edge cases', () => {
    it('should handle empty actions and getters', () => {
      const useStore = createFunctionalStore({
        id: 'empty-store',
        state: () => ({ count: 0 }),
      })

      const store = useStore()

      expect(store.$actions).toEqual({})
      expect(store.$getters).toEqual({})
    })

    it('should handle subscribe with detached option', () => {
      const useStore = createFunctionalStore({
        id: 'detached-store',
        state: () => ({ count: 0 }),
      })

      const store = useStore()
      const callback = vi.fn()

      const unsubscribe = store.$subscribe(callback, { detached: true })

      expect(typeof unsubscribe).toBe('function')

      // Should not be cleaned up on dispose
      store.$dispose()
      unsubscribe()
    })

    it('should handle hydration without persistence', () => {
      const useStore = createFunctionalStore({
        id: 'no-persist-store',
        state: () => ({ count: 0 }),
      })

      const store = useStore()

      expect(() => store.$hydrate()).not.toThrow()
      expect(() => store.$persist()).not.toThrow()
    })
  })
})
