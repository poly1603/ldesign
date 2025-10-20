import type { ComputedRef, Ref } from 'vue'
import type {
  ActionDefinition,
  GetterDefinition,
  StateDefinition,
  UseStoreReturn,
} from '../types'
import { defineStore } from 'pinia'
import { computed, reactive, ref, shallowRef, watch } from 'vue'

/**
 * 创建 Store 的 Hook 工厂函数
 * 提供类似 React Hook 的使用方式
 */
export function createStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
>(
  id: string,
  setup: () => {
    state: TState
    actions: TActions
    getters: TGetters
  },
): () => UseStoreReturn<TState, TActions, TGetters> {
  // 创建 Pinia Store 定义
  const storeDefinition = defineStore(id, () => {
    const { state, actions, getters } = setup()

    // 将状态转换为响应式
    const reactiveState = reactive(state)

    // 创建计算属性
    const computedGetters = {} as TGetters
    Object.entries(getters).forEach(([key, getter]) => {
      if (typeof getter === 'function') {
        computedGetters[key as keyof TGetters] = computed(() =>
          getter(reactiveState),
        ) as any
      }
    })

    return {
      ...reactiveState,
      ...actions,
      ...computedGetters,
    }
  })

  // 返回 Hook 函数
  return function useCreatedStore(): UseStoreReturn<
    TState,
    TActions,
    TGetters
  > {
    const store = storeDefinition()

    // 创建响应式状态引用
    const state = ref(store.$state) as Ref<TState>

    // 监听状态变化
    watch(
      () => store.$state,
      (newState) => {
        state.value = newState as TState
      },
      { deep: true, immediate: true },
    )

    return {
      $id: store.$id,
      $state: store.$state as TState,
      $actions: {} as TActions, // 从 store 中提取
      $getters: {} as TGetters, // 从 store 中提取
      $reset: () => store.$reset(),
      $patch: (partialStateOrMutator: Partial<TState> | ((state: TState) => void)) => {
        if (typeof partialStateOrMutator === 'function') {
          ; (store as any).$patch(partialStateOrMutator)
        } else {
          ; (store as any).$patch((state: any) => {
            Object.assign(state, partialStateOrMutator)
          })
        }
      },
      $subscribe: callback => store.$subscribe(callback as any),
      $onAction: callback => store.$onAction(callback as any),

      // 生命周期方法
      $dispose: () => {
        // 清理订阅等资源
      },

      // 工具方法
      getStore: () => store as any,
      getStoreDefinition: () => undefined,

      // Hook 特有的属性
      state,
      getters: {} as TGetters, // 计算属性
      actions: {} as TActions, // 方法
    }
  }
}

/**
 * 创建简单状态的 Hook
 */
export function createState<T>(initialValue: T): () => {
  value: Ref<T>
  setValue: (newValue: T | ((oldValue: T) => T)) => void
  reset: () => void
} {
  return function useState() {
    const value = ref(initialValue) as Ref<T>

    const setValue = (newValue: T | ((oldValue: T) => T)) => {
      if (typeof newValue === 'function') {
        value.value = (newValue as (oldValue: T) => T)(value.value)
      }
      else {
        value.value = newValue
      }
    }

    const reset = () => {
      value.value = initialValue
    }

    return {
      value,
      setValue,
      reset,
    }
  }
}

/**
 * 创建计算属性的 Hook
 */
export function createComputed<T>(getter: () => T): () => {
  value: ComputedRef<T>
  refresh: () => void
} {
  return function useComputed() {
    const value = computed(getter)

    const refresh = () => {
      // 强制重新计算（通过触发依赖更新）
      // 这里可以根据具体需求实现
    }

    return {
      value,
      refresh,
    }
  }
}

/**
 * 创建异步 Action 的 Hook
 */
export function createAsyncAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
): () => {
  execute: T
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<Awaited<ReturnType<T>> | null>
  reset: () => void
} {
  return function useAsyncAction() {
    const loading = ref(false)
    const error = ref<Error | null>(null)
    const data = shallowRef<Awaited<ReturnType<T>> | null>(null)

    const execute = async (
      ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> => {
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
      execute: execute as T,
      loading,
      error,
      data,
      reset,
    }
  }
}

/**
 * 创建持久化状态的 Hook
 */
export function createPersistedState<T>(
  key: string,
  initialValue: T,
  storage: Storage = localStorage,
): () => {
  value: Ref<T>
  setValue: (newValue: T | ((oldValue: T) => T)) => void
  reset: () => void
  save: () => void
  load: () => void
  clear: () => void
} {
  return function usePersistedState() {
    const value = ref(initialValue) as Ref<T>

    // 从存储加载初始值
    const load = () => {
      try {
        const stored = storage.getItem(key)
        if (stored !== null) {
          value.value = JSON.parse(stored)
        }
      }
      catch (error) {
        console.error('Failed to load persisted state:', error)
      }
    }

    // 保存到存储
    const save = () => {
      try {
        storage.setItem(key, JSON.stringify(value.value))
      }
      catch (error) {
        console.error('Failed to save persisted state:', error)
      }
    }

    // 清除存储
    const clear = () => {
      try {
        storage.removeItem(key)
        value.value = initialValue
      }
      catch (error) {
        console.error('Failed to clear persisted state:', error)
      }
    }

    const setValue = (newValue: T | ((oldValue: T) => T)) => {
      if (typeof newValue === 'function') {
        value.value = (newValue as (oldValue: T) => T)(value.value)
      }
      else {
        value.value = newValue
      }
      save() // 自动保存
    }

    const reset = () => {
      value.value = initialValue
      save()
    }

    // 监听值变化，自动保存
    watch(value, save, { deep: true })

    // 初始加载
    load()

    return {
      value,
      setValue,
      reset,
      save,
      load,
      clear,
    }
  }
}
