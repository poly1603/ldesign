/**
 * 防抖和节流 Hooks
 * 
 * @description
 * 提供防抖和节流功能的 Vue 3 Hooks，用于优化性能和用户体验。
 * 支持响应式值的防抖处理和函数的防抖/节流包装。
 */

import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * 防抖值 Hook
 * 
 * @param value - 要防抖的响应式值
 * @param delay - 防抖延迟时间（毫秒）
 * @returns 防抖后的响应式值
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const searchQuery = ref('')
 *     const debouncedQuery = useDebounceValue(searchQuery, 300)
 *     
 *     // 监听防抖后的值
 *     watch(debouncedQuery, (newQuery) => {
 *       if (newQuery) {
 *         performSearch(newQuery)
 *       }
 *     })
 *     
 *     return {
 *       searchQuery,
 *       debouncedQuery
 *     }
 *   }
 * })
 * ```
 */
export function useDebounceValue<T>(value: Ref<T>, delay: number): Ref<T> {
  const debouncedValue = ref<T>(value.value)
  let timeoutId: NodeJS.Timeout | null = null

  const updateDebouncedValue = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      debouncedValue.value = value.value
      timeoutId = null
    }, delay)
  }

  // 监听原始值的变化
  const stopWatcher = watch(value, updateDebouncedValue, { immediate: false })

  // 组件卸载时清理
  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    stopWatcher()
  })

  return debouncedValue as Ref<T>
}

/**
 * 防抖函数 Hook
 * 
 * @param fn - 要防抖的函数
 * @param delay - 防抖延迟时间（毫秒）
 * @param immediate - 是否立即执行（默认为 false）
 * @returns 防抖后的函数和取消函数
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const [debouncedSave, cancelSave] = useDebounceFunction(
 *       (data: any) => {
 *         
 *         // 执行保存逻辑
 *       },
 *       1000
 *     )
 *     
 *     const handleInputChange = (value: string) => {
 *       debouncedSave({ content: value })
 *     }
 *     
 *     return {
 *       handleInputChange,
 *       cancelSave
 *     }
 *   }
 * })
 * ```
 */
export function useDebounceFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate = false
): [T, () => void] {
  let timeoutId: NodeJS.Timeout | null = null

  const debouncedFunction = ((...args: Parameters<T>) => {
    const callNow = immediate && !timeoutId

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      if (!immediate) {
        fn(...args)
      }
    }, delay)

    if (callNow) {
      fn(...args)
    }
  }) as T

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  // 组件卸载时清理
  onUnmounted(cancel)

  return [debouncedFunction, cancel]
}

/**
 * 节流值 Hook
 * 
 * @param value - 要节流的响应式值
 * @param delay - 节流延迟时间（毫秒）
 * @returns 节流后的响应式值
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const scrollPosition = ref(0)
 *     const throttledPosition = useThrottleValue(scrollPosition, 100)
 *     
 *     // 监听节流后的滚动位置
 *     watch(throttledPosition, (position) => {
 *       updateScrollIndicator(position)
 *     })
 *     
 *     return {
 *       scrollPosition,
 *       throttledPosition
 *     }
 *   }
 * })
 * ```
 */
export function useThrottleValue<T>(value: Ref<T>, delay: number): Ref<T> {
  const throttledValue = ref<T>(value.value)
  let lastExecTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  const updateThrottledValue = () => {
    const now = Date.now()
    
    if (now - lastExecTime >= delay) {
      throttledValue.value = value.value
      lastExecTime = now
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        throttledValue.value = value.value
        lastExecTime = Date.now()
        timeoutId = null
      }, delay - (now - lastExecTime))
    }
  }

  // 监听原始值的变化
  const stopWatcher = watch(value, updateThrottledValue, { immediate: false })

  // 组件卸载时清理
  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    stopWatcher()
  })

  return throttledValue as Ref<T>
}

/**
 * 节流函数 Hook
 * 
 * @param fn - 要节流的函数
 * @param delay - 节流延迟时间（毫秒）
 * @returns 节流后的函数
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const throttledScroll = useThrottleFunction(
 *       (event: Event) => {
 *         
 *         // 处理滚动事件
 *       },
 *       100
 *     )
 *     
 *     onMounted(() => {
 *       window.addEventListener('scroll', throttledScroll)
 *     })
 *     
 *     onUnmounted(() => {
 *       window.removeEventListener('scroll', throttledScroll)
 *     })
 *     
 *     return {
 *       throttledScroll
 *     }
 *   }
 * })
 * ```
 */
export function useThrottleFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let lastExecTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  const throttledFunction = ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastExecTime >= delay) {
      fn(...args)
      lastExecTime = now
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        fn(...args)
        lastExecTime = Date.now()
        timeoutId = null
      }, delay - (now - lastExecTime))
    }
  }) as T

  // 组件卸载时清理
  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  })

  return throttledFunction
}

/**
 * 组合防抖和节流 Hook
 * 
 * @param value - 要处理的响应式值
 * @param debounceDelay - 防抖延迟时间
 * @param throttleDelay - 节流延迟时间
 * @returns 处理后的响应式值
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const inputValue = ref('')
 *     
 *     // 先节流再防抖，适用于搜索输入框
 *     const processedValue = useDebounceThrottle(inputValue, 300, 100)
 *     
 *     watch(processedValue, (value) => {
 *       performSearch(value)
 *     })
 *     
 *     return {
 *       inputValue,
 *       processedValue
 *     }
 *   }
 * })
 * ```
 */
export function useDebounceThrottle<T>(
  value: Ref<T>,
  debounceDelay: number,
  throttleDelay: number
): Ref<T> {
  const throttledValue = useThrottleValue(value, throttleDelay)
  const debouncedValue = useDebounceValue(throttledValue, debounceDelay)
  
  return debouncedValue
}
