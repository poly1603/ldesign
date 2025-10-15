import type { MaybeRef, Ref } from 'vue'
import type { HttpClient, RequestConfig } from '../types'
import { ref, unref } from 'vue'

/**
 * 防抖/节流请求选项
 */
export interface ThrottleOptions {
  /** 延迟时间（毫秒） */
  delay?: number
  /** 是否使用防抖（false为节流） */
  debounce?: boolean
  /** 是否在前沿触发 */
  leading?: boolean
  /** 是否在后沿触发 */
  trailing?: boolean
}

/**
 * 防抖请求 Hook
 *
 * 防止用户快速点击导致的重复请求
 *
 * @example
 * ```typescript
 * const { execute, loading, data } = useDebouncedRequest(
 *   client,
 *   { url: '/api/search' },
 *   { delay: 300 }
 * )
 *
 * // 用户输入时调用,300ms内只发送最后一次请求
 * watch(searchQuery, (query) => {
 *   execute({ params: { q: query } })
 * })
 * ```
 */
export function useDebouncedRequest<T = any>(
  client: HttpClient,
  baseConfig: MaybeRef<RequestConfig>,
  options: ThrottleOptions = {},
) {
  const { delay = 300 } = options
  const loading = ref(false)
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const execute = async (config?: RequestConfig): Promise<T | null> => {
    // 取消之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          loading.value = true
          error.value = null

          const mergedConfig = {
            ...unref(baseConfig),
            ...config,
          }

          const response = await client.request<T>(mergedConfig)
          data.value = response.data

          resolve(response.data)
        }
        catch (err) {
          error.value = err as Error
          reject(err)
        }
        finally {
          loading.value = false
          timeoutId = null
        }
      }, delay)
    })
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return {
    execute,
    cancel,
    loading,
    data: data as Ref<T | null>,
    error,
  }
}

/**
 * 节流请求 Hook
 *
 * 限制请求频率,在指定时间内最多执行一次
 *
 * @example
 * ```typescript
 * const { execute, loading } = useThrottledRequest(
 *   client,
 *   { url: '/api/save' },
 *   { delay: 1000 }
 * )
 *
 * // 1秒内多次调用只执行第一次
 * button.addEventListener('click', () => execute())
 * ```
 */
export function useThrottledRequest<T = any>(
  client: HttpClient,
  baseConfig: MaybeRef<RequestConfig>,
  options: ThrottleOptions = {},
) {
  const { delay = 1000, leading = true, trailing = false } = options
  const loading = ref(false)
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)

  let lastExecuteTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: RequestConfig | undefined

  const execute = async (config?: RequestConfig): Promise<T | null> => {
    const now = Date.now()
    const elapsed = now - lastExecuteTime

    lastArgs = config

    const doExecute = async () => {
      try {
        loading.value = true
        error.value = null

        const mergedConfig = {
          ...unref(baseConfig),
          ...lastArgs,
        }

        const response = await client.request<T>(mergedConfig)
        data.value = response.data

        lastExecuteTime = Date.now()
        return response.data
      }
      catch (err) {
        error.value = err as Error
        throw err
      }
      finally {
        loading.value = false
      }
    }

    // Leading edge
    if (leading && elapsed > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      return doExecute()
    }

    // Trailing edge
    if (trailing) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await doExecute()
            resolve(result)
          }
          catch (err) {
            reject(err)
          }
          finally {
            timeoutId = null
          }
        }, delay - elapsed)
      })
    }

    return null
  }

  return {
    execute,
    loading,
    data: data as Ref<T | null>,
    error,
  }
}
