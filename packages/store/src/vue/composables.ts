import type { Store } from 'pinia'
import type { Ref } from 'vue'
import type {
  ActionHookReturn,
  BatchHookReturn,
  GetterHookReturn,
  PersistHookReturn,
  StateHookReturn,
  StoreHookReturn,
  UseStoreOptions,
} from '@/types'
import { computed, inject, onUnmounted, ref, watch } from 'vue'
import { STORE_PROVIDER_KEY } from '../types/provider'

/**
 * 使用 Store 的组合式函数
 */
export function useStore<T extends Store = Store>(
  storeId: string,
  options: UseStoreOptions = {},
): StoreHookReturn<T> {
  const context = inject(STORE_PROVIDER_KEY)

  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }

  // 获取 Store 实例
  const store = context.getStore<T>(storeId)

  if (!store) {
    throw new Error(`Store "${storeId}" not found`)
  }

  // 创建响应式状态引用
  const state = ref(store.$state) as Ref<T['$state']>

  // 监听状态变化
  const unsubscribe = store.$subscribe((_mutation, newState) => {
    state.value = newState
  })

  // 清理函数
  const cleanup = () => {
    unsubscribe()
  }

  // 自动清理
  if (options.autoCleanup !== false) {
    onUnmounted(cleanup)
  }

  return {
    store,
    state,
    reset: () => store.$reset(),
    patch: partialState => store.$patch(partialState),
    subscribe: callback => store.$subscribe(callback),
    onAction: callback => store.$onAction(callback),
  }
}

/**
 * 使用状态的组合式函数
 */
export function useState<T = any>(
  storeId: string,
  stateKey: string,
  defaultValue?: T,
): StateHookReturn<T> {
  const { store, state } = useStore(storeId)

  // 创建计算属性
  const value = computed({
    get: () => (state.value as any)[stateKey] ?? defaultValue,
    set: (newValue) => {
      store.$patch({ [stateKey]: newValue } as any)
    },
  })

  return {
    value,
    setValue: (newValue) => {
      if (typeof newValue === 'function') {
        value.value = (newValue as Function)(value.value)
      }
      else {
        value.value = newValue
      }
    },
    reset: () => {
      if (defaultValue !== undefined) {
        value.value = defaultValue
      }
    },
  }
}

/**
 * 使用 Action 的组合式函数
 */
export function useAction<T extends (...args: any[]) => any>(
  storeId: string,
  actionName: string,
): ActionHookReturn<T> {
  const { store } = useStore(storeId)

  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<ReturnType<T> | null>(null)

  const execute = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    loading.value = true
    error.value = null

    try {
      const action = (store as any)[actionName]
      if (typeof action !== 'function') {
        throw new TypeError(
          `Action "${actionName}" not found in store "${storeId}"`,
        )
      }

      const result = await action(...args)
      data.value = result
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    execute: execute as T,
    loading,
    error,
    data,
    reset,
  }
}

/**
 * 使用 Getter 的组合式函数
 */
export function useGetter<T = any>(
  storeId: string,
  getterName: string,
): GetterHookReturn<T> {
  const { store } = useStore(storeId)

  const computing = ref(false)

  const value = computed(() => {
    computing.value = true
    try {
      const getter = (store as any)[getterName]
      if (typeof getter === 'function') {
        return getter()
      }
      return getter
    }
    finally {
      computing.value = false
    }
  })

  const refresh = () => {
    // 强制重新计算
    store.$patch({})
  }

  return {
    value,
    computing,
    refresh,
  }
}

/**
 * 批量操作的组合式函数
 */
export function useBatch(storeId: string): BatchHookReturn {
  const { store } = useStore(storeId)

  const isBatching = ref(false)
  let batchedUpdates: Record<string, any> = {}

  const startBatch = () => {
    isBatching.value = true
    batchedUpdates = {}
  }

  const endBatch = () => {
    if (isBatching.value && Object.keys(batchedUpdates).length > 0) {
      store.$patch(batchedUpdates)
      batchedUpdates = {}
    }
    isBatching.value = false
  }

  // 重写 patch 方法以支持批量更新
  const originalPatch = store.$patch
  store.$patch = (partialState: any) => {
    if (isBatching.value) {
      Object.assign(batchedUpdates, partialState)
    }
    else {
      originalPatch.call(store, partialState)
    }
  }

  return {
    startBatch,
    endBatch,
    isBatching,
  }
}

/**
 * 持久化的组合式函数
 */
export function usePersist(
  storeId: string,
  key?: string,
  storage: Storage = localStorage,
): PersistHookReturn {
  const { store, state } = useStore(storeId)

  const storageKey = key || `store:${storeId}`
  const isPersisted = ref(false)

  const save = () => {
    try {
      const serialized = JSON.stringify(state.value)
      storage.setItem(storageKey, serialized)
      isPersisted.value = true
    }
    catch (error) {
      console.error('Failed to save store state:', error)
      isPersisted.value = false
    }
  }

  const load = () => {
    try {
      const serialized = storage.getItem(storageKey)
      if (serialized) {
        const parsed = JSON.parse(serialized)
        store.$patch(parsed)
        isPersisted.value = true
      }
    }
    catch (error) {
      console.error('Failed to load store state:', error)
      isPersisted.value = false
    }
  }

  const clear = () => {
    try {
      storage.removeItem(storageKey)
      isPersisted.value = false
    }
    catch (error) {
      console.error('Failed to clear store state:', error)
    }
  }

  // 自动保存状态变化
  watch(
    state,
    () => {
      save()
    },
    { deep: true },
  )

  // 初始加载
  load()

  return {
    save,
    load,
    clear,
    isPersisted,
  }
}
