import { computed, type ComputedRef, onUnmounted, ref, type Ref, watch } from 'vue'

/**
 * 防抖组合式函数
 *
 * @param value 要防抖的值
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖后的值
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDebounce } from '@ldesign/engine'
 *
 * const searchQuery = ref('')
 * const debouncedQuery = useDebounce(searchQuery, 300)
 *
 * // 监听防抖后的值
 * watch(debouncedQuery, (newQuery) => {
 *   if (newQuery) {
 *     // 执行搜索
 *     console.log('搜索:', newQuery)
 *   }
 * })
 * </script>
 *
 * <template>
 *   <input v-model="searchQuery" placeholder="搜索..." />
 * </template>
 * ```
 */
export function useDebounce<T>(value: Ref<T>, delay = 300): ComputedRef<T> {
  const debouncedValue = ref<T>(value.value)
  let timeoutId: number | null = null

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay) as any
  }, { immediate: true })

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return computed(() => debouncedValue.value as T)
}

/**
 * 节流组合式函数
 *
 * @param value 要节流的值
 * @param limit 节流间隔（毫秒）
 * @returns 节流后的值
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useThrottle } from '@ldesign/engine'
 *
 * const scrollY = ref(0)
 * const throttledScrollY = useThrottle(scrollY, 100)
 *
 * function handleScroll() {
 *   scrollY.value = window.scrollY
 * }
 *
 * onMounted(() => {
 *   window.addEventListener('scroll', handleScroll)
 * })
 * </script>
 * ```
 */
export function useThrottle<T>(value: Ref<T>, limit = 300): ComputedRef<T> {
  const throttledValue = ref<T>(value.value)
  let lastUpdate = 0

  watch(value, (newValue) => {
    const now = Date.now()

    if (now - lastUpdate >= limit) {
      throttledValue.value = newValue
      lastUpdate = now
    }
  }, { immediate: true })

  return computed(() => throttledValue.value as T)
}

/**
 * 防抖函数组合式函数
 *
 * @param fn 要防抖的函数
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDebounceFn } from '@ldesign/engine'
 *
 * const debouncedSearch = useDebounceFn((query: string) => {
 *   console.log('搜索:', query)
 *   // 执行搜索逻辑
 * }, 300)
 *
 * function handleInput(event) {
 *   debouncedSearch(event.target.value)
 * }
 * </script>
 *
 * <template>
 *   <input @input="handleInput" placeholder="搜索..." />
 * </template>
 * ```
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay) as any
  }

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return debouncedFn
}

/**
 * 节流函数组合式函数
 *
 * @param fn 要节流的函数
 * @param limit 节流间隔（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThrottleFn } from '@ldesign/engine'
 *
 * const throttledScroll = useThrottleFn(() => {
 *   console.log('滚动位置:', window.scrollY)
 * }, 100)
 *
 * onMounted(() => {
 *   window.addEventListener('scroll', throttledScroll)
 * })
 * </script>
 * ```
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  limit = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= limit) {
      lastCall = now
      fn(...args)
    }
  }

  return throttledFn
}

/**
 * 计数器组合式函数
 *
 * @param initialValue 初始值
 * @param options 选项
 * @returns 计数器工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCounter } from '@ldesign/engine'
 *
 * const { count, increment, decrement, reset, set } = useCounter(0, {
 *   min: 0,
 *   max: 100
 * })
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="decrement">-</button>
 *     <span>{{ count }}</span>
 *     <button @click="increment">+</button>
 *     <button @click="reset">重置</button>
 *   </div>
 * </template>
 * ```
 */
export function useCounter(
  initialValue = 0,
  options: { min?: number; max?: number; step?: number } = {}
) {
  const { min, max, step = 1 } = options
  const count = ref(initialValue)

  const increment = (delta = step) => {
    const newValue = count.value + delta
    count.value = max !== undefined ? Math.min(newValue, max) : newValue
  }

  const decrement = (delta = step) => {
    const newValue = count.value - delta
    count.value = min !== undefined ? Math.max(newValue, min) : newValue
  }

  const set = (value: number) => {
    let newValue = value
    if (min !== undefined) newValue = Math.max(newValue, min)
    if (max !== undefined) newValue = Math.min(newValue, max)
    count.value = newValue
  }

  const reset = () => {
    count.value = initialValue
  }

  return {
    count: computed(() => count.value),
    increment,
    decrement,
    set,
    reset
  }
}

/**
 * 切换状态组合式函数
 *
 * @param initialValue 初始值
 * @returns 切换工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useToggle } from '@ldesign/engine'
 *
 * const [isVisible, toggle, setVisible] = useToggle(false)
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="toggle">{{ isVisible ? '隐藏' : '显示' }}</button>
 *     <div v-if="isVisible">内容</div>
 *   </div>
 * </template>
 * ```
 */
export function useToggle(
  initialValue = false
): [ComputedRef<boolean>, () => void, (value: boolean) => void] {
  const state = ref(initialValue)

  const toggle = () => {
    state.value = !state.value
  }

  const setState = (value: boolean) => {
    state.value = value
  }

  return [computed(() => state.value), toggle, setState]
}

/**
 * 数组管理组合式函数
 *
 * @param initialArray 初始数组
 * @returns 数组管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useArray } from '@ldesign/engine'
 *
 * const { array, push, remove, clear, filter, find } = useArray([1, 2, 3])
 *
 * function addItem() {
 *   push(array.value.length + 1)
 * }
 *
 * function removeItem(item) {
 *   remove(item)
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="addItem">添加</button>
 *     <button @click="clear">清空</button>
 *     <ul>
 *       <li v-for="item in array" :key="item">
 *         {{ item }}
 *         <button @click="removeItem(item)">删除</button>
 *       </li>
 *     </ul>
 *   </div>
 * </template>
 * ```
 */
export function useArray<T>(initialArray: T[] = []) {
  const array = ref([...initialArray])

  const push = (...items: T[]) => {
    ;(array.value as T[]).push(...items)
  }

  const pop = (): T | undefined => {
    return (array.value as T[]).pop()
  }

  const shift = (): T | undefined => {
    return (array.value as T[]).shift()
  }

  const unshift = (...items: T[]) => {
    ;(array.value as T[]).unshift(...items)
  }

  const remove = (item: T) => {
    const index = (array.value as T[]).indexOf(item)
    if (index > -1) {
      array.value.splice(index, 1)
    }
  }

  const removeAt = (index: number) => {
    array.value.splice(index, 1)
  }

  const insert = (index: number, ...items: T[]) => {
    array.value.splice(index, 0, ...(items as any[]))
  }

  const clear = () => {
    array.value.length = 0
  }

  const filter = (predicate: (item: T, index: number) => boolean) => {
    array.value = (array.value as T[]).filter(predicate as any)
  }

  const find = (predicate: (item: T, index: number) => boolean): T | undefined => {
    return (array.value as T[]).find(predicate as any)
  }

  const findIndex = (predicate: (item: T, index: number) => boolean): number => {
    return (array.value as T[]).findIndex(predicate as any)
  }

  const sort = (compareFn?: (a: T, b: T) => number) => {
    ;(array.value as T[]).sort(compareFn as any)
  }

  const reverse = () => {
    array.value.reverse()
  }

  return {
    array: computed(() => array.value as T[]),
    push,
    pop,
    shift,
    unshift,
    remove,
    removeAt,
    insert,
    clear,
    filter,
    find,
    findIndex,
    sort,
    reverse
  }
}

/**
 * 时间格式化组合式函数
 *
 * @param timestamp 时间戳或日期
 * @param format 格式化选项
 * @returns 格式化后的时间
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTimeFormat } from '@ldesign/engine'
 *
 * const timestamp = ref(Date.now())
 * const formattedTime = useTimeFormat(timestamp, {
 *   year: 'numeric',
 *   month: 'long',
 *   day: 'numeric',
 *   hour: '2-digit',
 *   minute: '2-digit'
 * })
 * </script>
 *
 * <template>
 *   <div>{{ formattedTime }}</div>
 * </template>
 * ```
 */
export function useTimeFormat(
  timestamp: Ref<number | Date>,
  format: Intl.DateTimeFormatOptions = {},
  locale = 'zh-CN'
): ComputedRef<string> {
  return computed(() => {
    const date = typeof timestamp.value === 'number'
      ? new Date(timestamp.value)
      : timestamp.value

    return new Intl.DateTimeFormat(locale, format).format(date)
  })
}

/**
 * 相对时间组合式函数
 *
 * @param timestamp 时间戳或日期
 * @param options 选项
 * @returns 相对时间字符串
 *
 * @example
 * ```vue
 * <script setup>
 * import { useRelativeTime } from '@ldesign/engine'
 *
 * const timestamp = ref(Date.now() - 60000) // 1分钟前
 * const relativeTime = useRelativeTime(timestamp)
 * </script>
 *
 * <template>
 *   <div>{{ relativeTime }}</div> <!-- "1分钟前" -->
 * </template>
 * ```
 */
export function useRelativeTime(
  timestamp: Ref<number | Date>,
  options: { updateInterval?: number; locale?: string } = {}
): ComputedRef<string> {
  const { updateInterval = 60000, locale = 'zh-CN' } = options
  const now = ref(Date.now())

  // 定期更新当前时间
  let intervalId: number

  if (updateInterval > 0) {
    intervalId = setInterval(() => {
      now.value = Date.now()
    }, updateInterval) as any
  }

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  return computed(() => {
    const date = typeof timestamp.value === 'number'
      ? new Date(timestamp.value)
      : timestamp.value

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const diff = date.getTime() - now.value
    const absDiff = Math.abs(diff)

    if (absDiff < 60000) { // 小于1分钟
      return rtf.format(Math.round(diff / 1000), 'second')
    } else if (absDiff < 3600000) { // 小于1小时
      return rtf.format(Math.round(diff / 60000), 'minute')
    } else if (absDiff < 86400000) { // 小于1天
      return rtf.format(Math.round(diff / 3600000), 'hour')
    } else if (absDiff < 2592000000) { // 小于30天
      return rtf.format(Math.round(diff / 86400000), 'day')
    } else if (absDiff < 31536000000) { // 小于1年
      return rtf.format(Math.round(diff / 2592000000), 'month')
    } else {
      return rtf.format(Math.round(diff / 31536000000), 'year')
    }
  })
}
