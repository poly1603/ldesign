import { computed, onUnmounted, ref } from 'vue'

import { useEngine } from './useEngine'

/**
 * 异步操作状态接口
 */
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  success: boolean
}

/**
 * 异步操作组合式函数
 *
 * @param asyncFn 异步函数
 * @param immediate 是否立即执行
 * @returns 异步状态和控制函数
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncOperation } from '@ldesign/engine'
 *
 * const { data, loading, error, execute, reset } = useAsyncOperation(
 *   async (id: string) => {
 *     const response = await fetch(`/api/users/${id}`)
 *     return response.json()
 *   }
 * )
 *
 * function loadUser(id: string) {
 *   execute(id)
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <div v-if="loading">Loading...</div>
 *     <div v-else-if="error">Error: {{ error.message }}</div>
 *     <div v-else-if="data">{{ data }}</div>
 *   </div>
 * </template>
 * ```
 */
export function useAsyncOperation<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  immediate = false
) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let currentPromise: Promise<T> | null = null

  const execute = async (...args: Args): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      currentPromise = asyncFn(...args)
      const result = await currentPromise

      // 检查是否是最新的请求
      if (currentPromise === asyncFn(...args)) {
        data.value = result
        return result
      }

      return null
    } catch (err) {
      // 只有在是最新请求时才设置错误
      if (currentPromise === asyncFn(...args)) {
        error.value = err as Error
      }
      throw err
    } finally {
      if (currentPromise === asyncFn(...args)) {
        loading.value = false
      }
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
    currentPromise = null
  }

  const cancel = () => {
    currentPromise = null
    loading.value = false
  }

  // 立即执行
  if (immediate) {
    execute(...([] as unknown as Args))
  }

  // 组件卸载时取消请求
  onUnmounted(() => {
    cancel()
  })

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    success: computed(() => !loading.value && !error.value && data.value !== null),
    execute,
    reset,
    cancel
  }
}

/**
 * 重试机制组合式函数
 *
 * @param asyncFn 异步函数
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试延迟（毫秒）
 * @returns 带重试的异步操作
 *
 * @example
 * ```vue
 * <script setup>
 * import { useRetry } from '@ldesign/engine'
 *
 * const { data, loading, error, execute, retryCount } = useRetry(
 *   async () => {
 *     const response = await fetch('/api/data')
 *     if (!response.ok) throw new Error('Failed to fetch')
 *     return response.json()
 *   },
 *   3, // 最大重试3次
 *   1000 // 每次重试延迟1秒
 * )
 * </script>
 * ```
 */
export function useRetry<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
) {
  const retryCount = ref(0)
  const isRetrying = ref(false)

  const retryableFn = async (...args: Args): Promise<T> => {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        retryCount.value = attempt
        isRetrying.value = attempt > 0

        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }

        const result = await asyncFn(...args)
        retryCount.value = 0
        isRetrying.value = false
        return result
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          retryCount.value = 0
          isRetrying.value = false
          throw lastError
        }
      }
    }

    throw new Error(lastError?.message || 'Retry failed')
  }

  const asyncOperation = useAsyncOperation(retryableFn)

  return {
    ...asyncOperation,
    retryCount: computed(() => retryCount.value),
    isRetrying: computed(() => isRetrying.value),
    maxRetries
  }
}

/**
 * Promise管理组合式函数
 *
 * @returns Promise管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePromiseManager } from '@ldesign/engine'
 *
 * const { createManagedPromise, cancelAll, activeCount } = usePromiseManager()
 *
 * function loadData() {
 *   const promise = createManagedPromise(
 *     fetch('/api/data').then(r => r.json()),
 *     5000 // 5秒超时
 *   )
 *
 *   promise.then(data => {
 *     logger.debug('Data loaded:', data)
 *   }).catch(error => {
 *     if (error.name === 'AbortError') {
 *       logger.debug('Request was cancelled')
 *     }
 *   })
 * }
 * </script>
 * ```
 */
export function usePromiseManager() {
  const engine = useEngine()
  // Use the global memory manager instead of engine.memory
  const memoryManager = (globalThis as any).GlobalMemoryManager || (engine as any).memory

  const activePromises = ref(new Set<Promise<any>>())

  const createManagedPromise = <T>(
    promise: Promise<T>,
    timeout?: number
  ): Promise<T> => {
    // Fallback implementation if memory manager doesn't have createManagedPromise
    let managedPromise: Promise<T>

    if (memoryManager && typeof memoryManager.createManagedPromise === 'function') {
      managedPromise = memoryManager.createManagedPromise(promise, timeout)
    } else {
      // Simple timeout implementation
      managedPromise = timeout
        ? Promise.race([
            promise,
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ])
        : promise
    }

    activePromises.value.add(managedPromise)

    managedPromise.finally(() => {
      activePromises.value.delete(managedPromise)
    })

    return managedPromise
  }

  const cancelAll = () => {
    activePromises.value.forEach(promise => {
      if ('cancel' in promise && typeof promise.cancel === 'function') {
        (promise as any).cancel()
      }
    })
    activePromises.value.clear()
  }

  // 组件卸载时取消所有Promise
  onUnmounted(() => {
    cancelAll()
  })

  return {
    createManagedPromise,
    cancelAll,
    activeCount: computed(() => activePromises.value.size)
  }
}

/**
 * 防抖异步操作组合式函数
 *
 * @param asyncFn 异步函数
 * @param delay 防抖延迟
 * @returns 防抖的异步操作
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDebouncedAsync } from '@ldesign/engine'
 *
 * const { data, loading, execute } = useDebouncedAsync(
 *   async (query: string) => {
 *     const response = await fetch(`/api/search?q=${query}`)
 *     return response.json()
 *   },
 *   300
 * )
 *
 * function handleSearch(query: string) {
 *   execute(query) // 自动防抖
 * }
 * </script>
 * ```
 */
export function useDebouncedAsync<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  delay = 300
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = (...args: Args): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncFn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }

  const asyncOperation = useAsyncOperation(debouncedFn)

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return asyncOperation
}

/**
 * 并发控制组合式函数
 *
 * @param asyncFn 异步函数
 * @param concurrency 最大并发数
 * @returns 并发控制的异步操作
 *
 * @example
 * ```vue
 * <script setup>
 * import { useConcurrentAsync } from '@ldesign/engine'
 *
 * const { execute, queue, activeCount } = useConcurrentAsync(
 *   async (url: string) => {
 *     const response = await fetch(url)
 *     return response.json()
 *   },
 *   3 // 最多同时3个请求
 * )
 *
 * // 这些请求会被自动排队和限制并发
 * execute('/api/data1')
 * execute('/api/data2')
 * execute('/api/data3')
 * execute('/api/data4') // 会等待前面的请求完成
 * </script>
 * ```
 */
export function useConcurrentAsync<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  concurrency = 3
) {
  const queue = ref<Array<{ args: any[]; resolve: (value: T) => void; reject: (error: Error) => void }>>([])
  const activeCount = ref(0)

  const processQueue = async () => {
    if (activeCount.value >= concurrency || queue.value.length === 0) {
      return
    }

    const item = queue.value.shift()
    if (!item) return

    activeCount.value++

    try {
      const result = await asyncFn(...(item.args as Args))
      item.resolve(result)
    } catch (error) {
      item.reject(error as Error)
    } finally {
      activeCount.value--
      // 处理下一个队列项
      processQueue()
    }
  }

  const execute = (...args: Args): Promise<T> => {
    return new Promise((resolve, reject) => {
      queue.value.push({ args: [...args], resolve, reject })
      processQueue()
    })
  }

  return {
    execute,
    queue: computed(() => queue.value.length),
    activeCount: computed(() => activeCount.value)
  }
}
