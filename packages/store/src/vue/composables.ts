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
} from '../types'
import { computed, inject, onUnmounted, ref, shallowRef, watch } from 'vue'
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
        value.value = (newValue as (prev: T) => T)(value.value)
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
  const data = shallowRef<ReturnType<T> | null>(null)

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
      if (serialized && serialized !== 'undefined' && serialized !== 'null') {
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

/**
 * 简化的 Store 使用 Hook
 * 提供更简单的 API 来使用 Store
 */
export function useSimpleStore<T extends Store = Store>(
  storeId: string,
  options: UseStoreOptions & {
    /** 是否自动持久化 */
    persist?: boolean
    /** 持久化存储键 */
    persistKey?: string
    /** 持久化存储 */
    persistStorage?: Storage
  } = {},
) {
  const storeHook = useStore<T>(storeId, options)

  // 可选的持久化功能
  const persistHook = options.persist
    ? usePersist(storeId, options.persistKey, options.persistStorage)
    : null

  return {
    ...storeHook,
    // 添加持久化方法（如果启用）
    ...(persistHook && {
      save: persistHook.save,
      load: persistHook.load,
      clear: persistHook.clear,
      isPersisted: persistHook.isPersisted,
    }),
  }
}

/**
 * 响应式状态 Hook
 * 提供更简单的状态管理
 */
export function useReactiveState<T = any>(
  storeId: string,
  stateKey: string,
  options: {
    defaultValue?: T
    transform?: (value: any) => T
    validate?: (value: T) => boolean
  } = {},
): StateHookReturn<T> & {
  isValid: Ref<boolean>
  error: Ref<string | null>
} {
  const baseHook = useState<T>(storeId, stateKey, options.defaultValue)

  const isValid = ref(true)
  const error = ref<string | null>(null)

  // 包装 setValue 以添加验证
  const originalSetValue = baseHook.setValue
  const setValue = (newValue: T | ((oldValue: T) => T)) => {
    const finalValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(baseHook.value.value)
      : newValue

    // 验证新值
    if (options.validate && !options.validate(finalValue)) {
      isValid.value = false
      error.value = `Invalid value for ${stateKey}`
      return
    }

    // 转换值
    const transformedValue = options.transform
      ? options.transform(finalValue)
      : finalValue

    isValid.value = true
    error.value = null
    originalSetValue(transformedValue)
  }

  return {
    ...baseHook,
    setValue,
    isValid,
    error,
  }
}

/**
 * 异步 Action Hook
 * 提供更好的异步操作体验
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  storeId: string,
  actionName: string,
  options: {
    /** 自动重试次数 */
    retries?: number
    /** 重试延迟（毫秒） */
    retryDelay?: number
    /** 超时时间（毫秒） */
    timeout?: number
    /** 成功回调 */
    onSuccess?: (result: Awaited<ReturnType<T>>) => void
    /** 错误回调 */
    onError?: (error: Error) => void
  } = {},
): ActionHookReturn<T> & {
  retry: () => Promise<ReturnType<T>>
  cancel: () => void
  isTimeout: Ref<boolean>
  retryCount: Ref<number>
} {
  const baseHook = useAction<T>(storeId, actionName)

  const isTimeout = ref(false)
  const retryCount = ref(0)
  let abortController: AbortController | null = null
  let timeoutId: NodeJS.Timeout | null = null

  const executeWithRetry = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    retryCount.value = 0
    isTimeout.value = false

    const attempt = async (): Promise<ReturnType<T>> => {
      try {
        // 创建取消控制器
        abortController = new AbortController()

        // 设置超时
        if (options.timeout) {
          timeoutId = setTimeout(() => {
            isTimeout.value = true
            abortController?.abort()
          }, options.timeout)
        }

        const result = await baseHook.execute(...args)

        // 清理超时
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // 成功回调
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // 清理超时
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // 如果是超时或取消，不重试
        if (isTimeout.value || abortController?.signal.aborted) {
          throw error
        }

        // 重试逻辑
        if (options.retries && retryCount.value < options.retries) {
          retryCount.value++

          if (options.retryDelay) {
            await new Promise(resolve => setTimeout(resolve, options.retryDelay))
          }

          return attempt()
        }

        // 错误回调
        options.onError?.(error instanceof Error ? error : new Error(String(error)))

        throw error
      }
    }

    return attempt()
  }

  const retry = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (baseHook.loading.value) {
      throw new Error('Action is already running')
    }

    // 重新执行参数
    return executeWithRetry(...args)
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return {
    ...baseHook,
    execute: executeWithRetry as T,
    retry,
    cancel,
    isTimeout,
    retryCount,
  }
}

/**
 * 计算属性 Hook
 * 提供更强大的计算属性功能
 */
export function useComputed<T = any>(
  storeId: string,
  getter: (store: Store) => T,
  options: {
    /** 是否缓存结果 */
    cache?: boolean
    /** 缓存时间（毫秒） */
    cacheTime?: number
    /** 依赖的状态键 */
    deps?: string[]
  } = {},
) {
  const { store } = useStore(storeId)

  let cachedValue: T | undefined
  let cacheTimestamp = 0

  const value = computed(() => {
    // 检查缓存
    if (options.cache && cachedValue !== undefined) {
      const now = Date.now()
      if (!options.cacheTime || (now - cacheTimestamp) < options.cacheTime) {
        return cachedValue
      }
    }

    // 计算新值
    const newValue = getter(store)

    // 更新缓存
    if (options.cache) {
      cachedValue = newValue
      cacheTimestamp = Date.now()
    }

    return newValue
  })

  const invalidateCache = () => {
    cachedValue = undefined
    cacheTimestamp = 0
  }

  return {
    value,
    invalidateCache,
  }
}
