/**
 * Vue 工具函数
 */
import type { ComputedRef, Ref } from 'vue'
import type { ApiEngine } from '../types'
import { computed, onUnmounted, ref, watch } from 'vue'

/**
 * IntersectionObserver 选项
 */
export interface UseIntersectionOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
}

/**
 * 简单的 IntersectionObserver 工具
 *
 * @param target 观察的目标元素 Ref
 * @param onIntersect 进入可视区域时触发的回调
 * @param options 观察选项
 * @returns stop 函数用于停止观察
 */
export function useIntersectionObserver(
  target: Ref<Element | null>,
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionOptions = {},
) {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return { stop: () => {} }
  }

  const root = options.root ?? null
  const rootMargin = options.rootMargin ?? '0px'
  const threshold = options.threshold ?? 0

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting && onIntersect(entry))
  }, { root, rootMargin, threshold })

  const start = () => {
    const el = target.value
    if (el)
      observer.observe(el)
  }

  start()
  const stopWatch = watch(target, (el, old) => {
    if (old)
      observer.unobserve(old)
    if (el)
      observer.observe(el)
  })

  onUnmounted(() => {
    observer.disconnect()
    stopWatch()
  })

  return { stop: () => { observer.disconnect(); stopWatch() } }
}

/**
 * 创建防抖的 ref
 *
 * @param initialValue 初始值
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖的 ref 和立即设置函数
 *
 * @example
 * ```typescript
 * import { useDebouncedRef } from '@ldesign/api/vue'
 *
 * const { debouncedValue, setValue } = useDebouncedRef('', 300)
 *
 * // 防抖更新
 * debouncedValue.value = 'new value'
 *
 * // 立即更新
 * setValue('immediate value')
 * ```
 */
export function useDebouncedRef<T>(
  initialValue: T,
  delay: number,
): {
    debouncedValue: Ref<T>
    setValue: (value: T) => void
  } {
  const debouncedValue = ref(initialValue)
  const setValue = (value: T) => {
    debouncedValue.value = value
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const updateValue = (newValue: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
      timeoutId = null
    }, delay)
  }

  // 监听值变化并应用防抖
  watch(
    () => debouncedValue.value,
    (newValue) => {
      if (timeoutId === null) {
        updateValue(newValue)
      }
    },
    { immediate: false },
  )

  return {
    debouncedValue: debouncedValue as Ref<T>,
    setValue,
  }
}

/**
 * 创建响应式的API方法调用器
 *
 * @param methodName API 方法名称
 * @returns 响应式的API调用函数
 *
 * @example
 * ```typescript
 * import { useApiMethod } from '@ldesign/api/vue'
 *
 * const getUserInfo = useApiMethod<UserInfo>('getUserInfo')
 * const userInfo = await getUserInfo({ userId: 123 })
 * ```
 */
export function useApiMethod<T = unknown>(methodName: string) {
  // 延迟导入以避免循环依赖
  let api: any = null
  
  return async (params?: unknown, options?: any) => {
    if (!api) {
      const module = await import('./composables')
      api = module.useApi()
    }
    return api.call(methodName, params, options) as Promise<T>
  }
}

/**
 * 创建计算属性，用于检查API引擎是否可用
 *
 * @returns 计算属性，表示API引擎是否可用
 *
 * @example
 * ```typescript
 * import { useApiAvailable } from '@ldesign/api/vue'
 *
 * const isApiAvailable = useApiAvailable()
 *
 * if (isApiAvailable.value) {
 *   // API 可用
 * }
 * ```
 */
export function useApiAvailable(): ComputedRef<boolean> {
  const available = ref(false)
  
  import('./composables').then((module) => {
    try {
      module.useApi()
      available.value = true
    }
    catch {
      available.value = false
    }
  }).catch(() => {
    available.value = false
  })
  
  return computed(() => available.value)
}

/**
 * 创建响应式的API状态检查器
 *
 * @returns API状态信息
 *
 * @example
 * ```typescript
 * import { useApiStatus } from '@ldesign/api/vue'
 *
 * const { isAvailable, engine, error } = useApiStatus()
 * ```
 */
export function useApiStatus() {
  const isAvailable = ref(false)
  const engine = ref<ApiEngine | null>(null)
  const error = ref<Error | null>(null)

  import('./composables').then((module) => {
    try {
      const apiEngine = module.useApi()
      isAvailable.value = true
      engine.value = apiEngine
      error.value = null
    }
    catch (err) {
      isAvailable.value = false
      engine.value = null
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }).catch((err) => {
    isAvailable.value = false
    engine.value = null
    error.value = err instanceof Error ? err : new Error(String(err))
  })

  return {
    isAvailable: computed(() => isAvailable.value),
    engine: computed(() => engine.value),
    error: computed(() => error.value),
  }
}
