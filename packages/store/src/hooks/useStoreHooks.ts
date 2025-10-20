import type { Store } from 'pinia'
import type { ComputedRef, Ref } from 'vue'
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'

/**
 * 通用 Store Hook
 * 提供对任意 Pinia Store 的 Hook 式访问
 */
export function useStoreHook<T extends Store>(store: T) {
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

  onUnmounted(cleanup)

  return {
    store,
    state,
    reset: () => store.$reset(),
    patch: (partialState: Partial<T['$state']>) => store.$patch(partialState),
    subscribe: (callback: (mutation: any, state: T['$state']) => void) =>
      store.$subscribe(callback),
    onAction: (callback: (context: any) => void) => store.$onAction(callback),
    cleanup, // 手动清理函数
  }
}

/**
 * 状态选择器 Hook
 * 从 Store 中选择特定的状态片段
 */
export function useSelector<T extends Store, R>(
  store: T,
  selector: (state: T['$state']) => R,
): ComputedRef<R> {
  return computed(() => selector(store.$state))
}

/**
 * 状态变化监听 Hook
 */
export function useStateWatch<T extends Store>(
  store: T,
  callback: (newState: T['$state'], oldState: T['$state']) => void,
  options?: {
    deep?: boolean
    immediate?: boolean
  },
) {
  const stopWatcher = watch(() => store.$state, callback as any, {
    deep: options?.deep ?? true,
    immediate: options?.immediate ?? false,
  })

  onUnmounted(() => {
    stopWatcher()
  })

  return stopWatcher
}

/**
 * Action 执行状态 Hook
 */
export function useActionState<T extends (...args: any[]) => any>(
  action: T,
): {
    loading: Ref<boolean>
    error: Ref<Error | null>
    data: Ref<ReturnType<T> | null>
    execute: (...args: Parameters<T>) => Promise<ReturnType<T>>
    reset: () => void
  } {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = shallowRef<ReturnType<T> | null>(null)

  const execute = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    loading.value = true
    error.value = null

    try {
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
    execute,
    loading,
    error,
    data,
    reset,
  }
}

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: Ref<T>, delay: number): ComputedRef<T> {
  const debouncedValue = ref(value.value) as Ref<T>

  watch(value, (newValue) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)

    return () => clearTimeout(timer)
  })

  return computed(() => debouncedValue.value)
}

/**
 * 节流 Hook
 */
export function useThrottle<T>(
  value: Ref<T>,
  interval: number,
): ComputedRef<T> {
  const throttledValue = ref(value.value) as Ref<T>
  let lastUpdate = 0

  watch(value, (newValue) => {
    const now = Date.now()
    if (now - lastUpdate >= interval) {
      throttledValue.value = newValue
      lastUpdate = now
    }
  })

  return computed(() => throttledValue.value)
}

/**
 * 本地存储同步 Hook
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): {
    value: Ref<T>
    save: () => void
    load: () => void
    remove: () => void
  } {
  const value = ref(defaultValue) as Ref<T>

  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(value.value))
    }
    catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const load = () => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        value.value = JSON.parse(stored)
      }
    }
    catch (error) {
      console.error('Failed to load from localStorage:', error)
      value.value = defaultValue
    }
  }

  const remove = () => {
    try {
      localStorage.removeItem(key)
      value.value = defaultValue
    }
    catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }

  // 自动保存
  watch(value, save, { deep: true })

  // 初始加载
  load()

  return {
    value,
    save,
    load,
    remove,
  }
}

/**
 * 会话存储同步 Hook
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
): {
    value: Ref<T>
    save: () => void
    load: () => void
    remove: () => void
  } {
  const value = ref(defaultValue) as Ref<T>

  const save = () => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value.value))
    }
    catch (error) {
      console.error('Failed to save to sessionStorage:', error)
    }
  }

  const load = () => {
    try {
      const stored = sessionStorage.getItem(key)
      if (stored !== null) {
        value.value = JSON.parse(stored)
      }
    }
    catch (error) {
      console.error('Failed to load from sessionStorage:', error)
      value.value = defaultValue
    }
  }

  const remove = () => {
    try {
      sessionStorage.removeItem(key)
      value.value = defaultValue
    }
    catch (error) {
      console.error('Failed to remove from sessionStorage:', error)
    }
  }

  // 自动保存
  watch(value, save, { deep: true })

  // 初始加载
  load()

  return {
    value,
    save,
    load,
    remove,
  }
}
