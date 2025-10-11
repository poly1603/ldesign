import type { StateManager } from '../../types'
import { computed, type ComputedRef, onUnmounted, ref, type Ref, watch } from 'vue'

import { useEngine } from './useEngine'

/**
 * 响应式状态管理组合式函数
 *
 * @param key 状态键名
 * @param defaultValue 默认值
 * @returns 响应式状态值和设置函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { useEngineState } from '@ldesign/engine'
 *
 * const [count, setCount] = useEngineState('counter', 0)
 *
 * function increment() {
 *   setCount(count.value + 1)
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <p>Count: {{ count }}</p>
 *     <button @click="increment">+1</button>
 *   </div>
 * </template>
 * ```
 */
export function useEngineState<T>(
  key: string,
  defaultValue?: T
): [Ref<T>, (value: T) => void, () => void] {
  const engine = useEngine()
  const state = engine.state

  // 创建响应式引用
  const currentValue = state.get(key)
  const stateRef = ref(currentValue !== undefined && currentValue !== null ? currentValue : defaultValue) as Ref<T>

  // 设置状态函数
  const setState = (value: T) => {
    state.set(key, value)
    stateRef.value = value
  }

  // 删除状态函数
  const removeState = () => {
    if (typeof (state as any).delete === 'function') {
      ;(state as any).delete(key)
    } else {
      state.set(key, undefined as any)
    }
    stateRef.value = defaultValue as T
  }

  // 监听引擎状态变化（如果支持）
  let unsubscribe: (() => void) | undefined
  if (typeof (state as any).subscribe === 'function') {
    unsubscribe = (state as any).subscribe(key, (newValue: T) => {
      stateRef.value = newValue
    })
  }

  // 组件卸载时清理订阅
  onUnmounted(() => {
    unsubscribe?.()
  })

  return [stateRef, setState, removeState]
}

/**
 * 批量状态管理组合式函数
 *
 * @param keys 状态键名数组
 * @returns 状态对象和批量更新函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { useBatchState } from '@ldesign/engine'
 *
 * const [states, updateStates] = useBatchState(['user', 'settings', 'theme'])
 *
 * function updateUser(userData) {
 *   updateStates({ user: userData })
 * }
 * </script>
 * ```
 */
export function useBatchState<T extends Record<string, unknown>>(
  keys: (keyof T)[]
): [ComputedRef<T>, (updates: Partial<T>) => void] {
  const engine = useEngine()
  const state = engine.state

  // 创建响应式状态对象
  const stateRefs = keys.reduce((acc, key) => {
    acc[key] = ref(state.get(key as string))
    return acc
  }, {} as Record<keyof T, Ref>)

  // 计算属性返回状态值
  const states = computed(() => {
    return keys.reduce((acc, key) => {
      acc[key] = stateRefs[key].value
      return acc
    }, {} as T)
  })

  // 批量更新函数
  const updateStates = (updates: Partial<T>) => {
    Object.entries(updates).forEach(([key, value]) => {
      if (keys.includes(key)) {
        state.set(key, value)
        stateRefs[key].value = value
      }
    })
  }

  // 监听状态变化（如果支持）
  const unsubscribes = keys.map(key => {
    if (typeof (state as any).subscribe === 'function') {
      return (state as any).subscribe(key as string, (newValue: unknown) => {
        stateRefs[key].value = newValue
      })
    }
    return undefined
  }).filter(Boolean)

  // 组件卸载时清理订阅
  onUnmounted(() => {
    unsubscribes.forEach(unsubscribe => unsubscribe?.())
  })

  return [states, updateStates]
}

/**
 * 计算状态组合式函数
 *
 * @param getter 计算函数
 * @param dependencies 依赖的状态键
 * @returns 计算属性
 *
 * @example
 * ```vue
 * <script setup>
 * import { useComputedState } from '@ldesign/engine'
 *
 * const fullName = useComputedState(
 *   (state) => `${state.get('firstName')} ${state.get('lastName')}`,
 *   ['firstName', 'lastName']
 * )
 * </script>
 * ```
 */
export function useComputedState<T>(
  getter: (state: StateManager) => T,
  dependencies: string[] = []
): ComputedRef<T> {
  const engine = useEngine()
  const state = engine.state

  // 创建依赖的响应式引用
  const depRefs = dependencies.map(key => {
    const depRef = ref(state.get(key))

    // 监听依赖变化（如果支持）
    let unsubscribe: (() => void) | undefined
    if (typeof (state as any).subscribe === 'function') {
      unsubscribe = (state as any).subscribe(key, (newValue: unknown) => {
        depRef.value = newValue
      })
    }

    onUnmounted(() => {
      unsubscribe?.()
    })

    return depRef
  })

  // 返回计算属性
  return computed(() => {
    // 触发依赖更新
    depRefs.forEach(depRef => depRef.value)
    return getter(state)
  })
}

/**
 * 状态持久化组合式函数
 *
 * @param key 状态键名
 * @param defaultValue 默认值
 * @param storage 存储方式 ('localStorage' | 'sessionStorage')
 * @returns 持久化状态
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePersistentState } from '@ldesign/engine'
 *
 * const [theme, setTheme] = usePersistentState('theme', 'light', 'localStorage')
 * </script>
 * ```
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): [Ref<T>, (value: T) => void] {
  const engine = useEngine()
  const state = engine.state

  // 从存储中读取初始值
  const getStoredValue = (): T => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = window[storage].getItem(`engine:${key}`)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }

  // 初始化状态
  const initialValue = getStoredValue()
  state.set(key, initialValue)

  const [stateRef, setState] = useEngineState(key, initialValue)

  // 包装设置函数以支持持久化
  const setPersistentState = (value: T) => {
    setState(value)

    if (typeof window !== 'undefined') {
      try {
        window[storage].setItem(`engine:${key}`, JSON.stringify(value))
      } catch (error) {
        logger.warn(`Failed to persist state for key "${key}":`, error)
      }
    }
  }

  return [stateRef, setPersistentState]
}

/**
 * 状态历史记录组合式函数
 *
 * @param key 状态键名
 * @param maxHistory 最大历史记录数
 * @returns 状态、历史记录和操作函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { useStateHistory } from '@ldesign/engine'
 *
 * const [value, history, { undo, redo, canUndo, canRedo }] = useStateHistory('editor', '', 50)
 * </script>
 * ```
 */
export function useStateHistory<T>(
  key: string,
  defaultValue: T,
  maxHistory = 20
): [
  Ref<T>,
  ComputedRef<T[]>,
  {
    undo: () => void
    redo: () => void
    canUndo: ComputedRef<boolean>
    canRedo: ComputedRef<boolean>
    clear: () => void
  }
] {
  const [stateRef, setState] = useEngineState(key, defaultValue)

  const history = ref<T[]>([defaultValue])
  const currentIndex = ref(0)

  // 监听状态变化，添加到历史记录
  watch(stateRef, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      // 移除当前位置之后的历史记录
      history.value = history.value.slice(0, currentIndex.value + 1)

      // 添加新值
      history.value.push(newValue as any)
      currentIndex.value = history.value.length - 1

      // 限制历史记录长度
      if (history.value.length > maxHistory) {
        history.value = history.value.slice(-maxHistory)
        currentIndex.value = history.value.length - 1
      }
    }
  })

  const undo = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      setState(history.value[currentIndex.value] as T)
    }
  }

  const redo = () => {
    if (currentIndex.value < history.value.length - 1) {
      currentIndex.value++
      setState(history.value[currentIndex.value] as T)
    }
  }

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  const clear = () => {
    history.value = [stateRef.value]
    currentIndex.value = 0
  }

  return [
    stateRef,
    computed(() => [...history.value] as T[]),
    { undo, redo, canUndo, canRedo, clear }
  ]
}
