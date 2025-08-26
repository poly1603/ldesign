import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BaseStore } from '../core/BaseStore'
import {
  StoreFactory,
  StoreType,
  createClassStore,
  createStore,
  createCompositionStoreFactory,
  defineStore,
} from '../core/StoreFactory'

// Test Store class
class TestStore extends BaseStore<
  { count: number; name: string },
  { increment: () => void; setName: (name: string) => void },
  { doubleCount: (state: { count: number; name: string }) => number }
> {
  constructor(id: string) {
    super(id, {
      state: () => ({ count: 0, name: 'test' }),
      actions: {
        increment: function (this: any) {
          this.count++
        },
        setName: function (this: any, name: string) {
          this.name = name
        },
      },
      getters: {
        doubleCount: (state: any) => state.count * 2,
      },
    })
  }
}

describe('storeFactory', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    StoreFactory.clear()
  })

  describe('create', () => {
    it('should create a class store', () => {
      const storeFactory = StoreFactory.create({
        type: StoreType.CLASS,
        id: 'test-class-store',
        storeClass: TestStore,
      })

      const store = storeFactory()

      expect(store).toBeInstanceOf(TestStore)
      expect(store.$id).toBe('test-class-store')
      expect(store.$state.count).toBe(0)
      expect(store.$state.name).toBe('test')
    })

    it('should create a functional store', () => {
      const storeFactory = StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'test-functional-store',
        state: () => ({ count: 0 }),
        actions: {
          increment: function (this: any) {
            this.count++
          },
        },
      })

      const store = storeFactory()

      expect(store.$id).toBe('test-functional-store')
      expect(store.$state.count).toBe(0)
      expect(typeof store.$actions.increment).toBe('function')
    })

    it('should create a composition store', () => {
      const storeFactory = StoreFactory.create({
        type: StoreType.COMPOSITION,
        id: 'test-composition-store',
        setup: ({ state }) => {
          const count = state(0)
          return { count }
        },
      })

      const store = storeFactory()

      expect(store.$id).toBe('test-composition-store')
      expect(store.$state.count.value).toBe(0)
    })

    it('should throw error for unknown store type', () => {
      expect(() => {
        StoreFactory.create({
          type: 'unknown' as any,
          id: 'test-store',
          state: () => ({}),
        } as any)
      }).toThrow('Unknown store type: unknown')
    })

    it('should throw error for missing id', () => {
      expect(() => {
        StoreFactory.create({
          type: StoreType.FUNCTIONAL,
        } as any)
      }).toThrow('Store id is required')
    })

    it('should warn and return existing definition for duplicate id', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const factory1 = StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'duplicate-store',
        state: () => ({ count: 0 }),
      })

      const factory2 = StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'duplicate-store',
        state: () => ({ count: 1 }),
      })

      expect(factory1).toBe(factory2)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Store with id "duplicate-store" already exists. Returning existing definition.'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('get', () => {
    it('should get existing store definition', () => {
      const factory = StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'get-test-store',
        state: () => ({ count: 0 }),
      })

      expect(StoreFactory.get('get-test-store')).toBe(factory)
      expect(StoreFactory.get('nonexistent')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should check if store exists', () => {
      StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'has-test-store',
        state: () => ({ count: 0 }),
      })

      expect(StoreFactory.has('has-test-store')).toBe(true)
      expect(StoreFactory.has('nonexistent')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete store and dispose instance', () => {
      const factory = StoreFactory.create({
        type: StoreType.CLASS,
        id: 'delete-test-store',
        storeClass: TestStore,
      })

      const store = factory()
      const disposeSpy = vi.spyOn(store, '$dispose')

      expect(StoreFactory.delete('delete-test-store')).toBe(true)
      expect(StoreFactory.has('delete-test-store')).toBe(false)
      expect(disposeSpy).toHaveBeenCalled()

      expect(StoreFactory.delete('nonexistent')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all stores and dispose instances', () => {
      const factory1 = StoreFactory.create({
        type: StoreType.CLASS,
        id: 'clear-test-store-1',
        storeClass: TestStore,
      })

      const factory2 = StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'clear-test-store-2',
        state: () => ({ count: 0 }),
      })

      const store1 = factory1()
      const disposeSpy = vi.spyOn(store1, '$dispose')

      StoreFactory.clear()

      expect(StoreFactory.has('clear-test-store-1')).toBe(false)
      expect(StoreFactory.has('clear-test-store-2')).toBe(false)
      expect(disposeSpy).toHaveBeenCalled()
    })
  })

  describe('getIds', () => {
    it('should return all store ids', () => {
      StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'ids-test-store-1',
        state: () => ({ count: 0 }),
      })

      StoreFactory.create({
        type: StoreType.FUNCTIONAL,
        id: 'ids-test-store-2',
        state: () => ({ count: 0 }),
      })

      const ids = StoreFactory.getIds()
      expect(ids).toContain('ids-test-store-1')
      expect(ids).toContain('ids-test-store-2')
      expect(ids).toHaveLength(2)
    })
  })

  describe('getStats', () => {
    it('should return store statistics', () => {
      const factory = StoreFactory.create({
        type: StoreType.CLASS,
        id: 'stats-test-store',
        storeClass: TestStore,
      })

      factory() // Create instance

      const stats = StoreFactory.getStats()
      expect(stats.totalStores).toBe(1)
      expect(stats.activeInstances).toBe(1)
      expect(stats.storeIds).toContain('stats-test-store')
    })
  })
})

describe('convenience functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    StoreFactory.clear()
  })

  describe('createClassStore', () => {
    it('should create a class store', () => {
      const useStore = createClassStore('class-store', TestStore)
      const store = useStore()

      expect(store).toBeInstanceOf(TestStore)
      expect(store.$id).toBe('class-store')
    })
  })

  describe('createStore', () => {
    it('should create a functional store', () => {
      const useStore = createStore({
        id: 'functional-store',
        state: () => ({ count: 0 }),
        actions: {
          increment: function (this: any) {
            this.count++
          },
        },
      })

      const store = useStore()

      expect(store.$id).toBe('functional-store')
      expect(store.$state.count).toBe(0)
    })
  })

  describe('createCompositionStoreFactory', () => {
    it('should create a composition store', () => {
      const useStore = createCompositionStoreFactory(
        'composition-store',
        ({ state }) => {
          const count = state(0)
          return { count }
        }
      )

      const store = useStore()

      expect(store.$id).toBe('composition-store')
      expect(store.$state.count.value).toBe(0)
    })
  })

  describe('defineStore', () => {
    it('should create stores based on options type', () => {
      const classStore = defineStore({
        type: StoreType.CLASS,
        id: 'define-class-store',
        storeClass: TestStore,
      })

      const functionalStore = defineStore({
        type: StoreType.FUNCTIONAL,
        id: 'define-functional-store',
        state: () => ({ count: 0 }),
      })

      const compositionStore = defineStore({
        type: StoreType.COMPOSITION,
        id: 'define-composition-store',
        setup: ({ state }) => ({ count: state(0) }),
      })

      expect(classStore()).toBeInstanceOf(TestStore)
      expect(functionalStore().$id).toBe('define-functional-store')
      expect(compositionStore().$id).toBe('define-composition-store')
    })
  })
})
