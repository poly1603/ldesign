import type { MaybeRef, Ref } from 'vue'
import type {
  HttpClient,
  HttpError,
  RequestConfig,
  ResponseData,
} from '../types'
import type { UseQueryOptions, UseQueryReturn } from '../types/vue'
import { computed, onUnmounted, ref, unref, watch } from 'vue'
import { createCancelTokenSource, isCancelError } from '../utils/cancel'

/**
 * 查询缓存管理器
 */
class QueryCache {
  private cache = new Map<
    string,
    {
      data: any
      timestamp: number
      staleTime: number
    }
  >()

  get(key: string, staleTime: number): any {
    const item = this.cache.get(key)
    if (!item)
      return null

    const isStale = Date.now() - item.timestamp > staleTime
    return isStale ? null : item.data
  }

  set(key: string, data: any, staleTime: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    })
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

const globalQueryCache = new QueryCache()

/**
 * useQuery Hook
 * 用于处理带缓存的查询请求
 */
export function useQuery<T = any>(
  client: HttpClient,
  queryKey: MaybeRef<string | (() => string)>,
  config: MaybeRef<RequestConfig>,
  options: UseQueryOptions<T> = {},
): UseQueryReturn<T> {
  // 响应式状态
  const data = ref<T | null>(options.initialData ?? null)
  const loading = ref<boolean>(false)
  const error = ref<HttpError | null>(null)
  const finished = ref<boolean>(false)
  const isStale = ref<boolean>(false)
  const isFetching = ref<boolean>(false)
  const dataUpdatedAt = ref<number>(0)
  const failureCount = ref<number>(0)

  // 配置选项
  const staleTime = options.staleTime ?? 300000 // 5 分钟
  // const cacheTime = options.cacheTime ?? 600000 // 10 分钟 (暂未使用)
  const retry = options.retry ?? 3
  const retryDelay = options.retryDelay ?? 1000

  // 取消控制
  let cancelTokenSource = createCancelTokenSource()

  // 计算属性
  const canCancel = computed(() => loading.value || isFetching.value)
  const enabled = computed(() => {
    const enabledValue = unref(options.enabled)
    return enabledValue !== false
  })

  /**
   * 获取查询键
   */
  const getQueryKey = (): string => {
    const key = unref(queryKey)
    return typeof key === 'function' ? (key as () => string)() : (key as string)
  }

  /**
   * 执行查询
   */
  const execute = async (
    overrideConfig?: RequestConfig,
  ): Promise<ResponseData<T>> => {
    if (!enabled.value) {
      throw new Error('Query is disabled')
    }

    const key = getQueryKey()

    // 检查缓存
    const cachedData = globalQueryCache.get(key, staleTime)
    if (cachedData && !overrideConfig) {
      data.value = cachedData
      isStale.value = false
      finished.value = true
      return { data: cachedData } as ResponseData<T>
    }

    // 设置加载状态
    if (!data.value) {
      loading.value = true
    }
    else {
      isFetching.value = true
      isStale.value = true
    }

    error.value = null
    finished.value = false

    // 创建新的取消令牌
    cancelTokenSource = createCancelTokenSource()

    let currentRetry = 0
    const maxRetries
      = typeof retry === 'number' ? retry : retry === true ? 3 : 0

    while (currentRetry <= maxRetries) {
      try {
        // 合并配置
        const requestConfig: RequestConfig = {
          ...unref(config),
          ...overrideConfig,
          signal: cancelTokenSource.token.promise as any,
        }

        // 发送请求
        const response = await client.request<T>(requestConfig)

        // 转换数据
        let responseData = response.data
        if (options.transform) {
          responseData = options.transform(response.data)
        }

        // 更新状态
        data.value = responseData
        isStale.value = false
        finished.value = true
        dataUpdatedAt.value = Date.now()
        failureCount.value = 0

        // 缓存数据
        globalQueryCache.set(key, responseData, staleTime)

        // 调用成功回调
        if (options.onSuccess) {
          options.onSuccess(responseData, response)
        }

        return response
      }
      catch (err) {
        const httpError = err as HttpError

        // 如果是取消错误，直接抛出
        if (isCancelError(httpError)) {
          throw httpError
        }

        currentRetry++
        failureCount.value = currentRetry

        // 如果还有重试次数，等待后重试
        if (currentRetry <= maxRetries) {
          const shouldRetry
            = typeof retry === 'function' ? retry(currentRetry, httpError) : true

          if (shouldRetry) {
            const delay
              = typeof retryDelay === 'function'
                ? retryDelay(currentRetry)
                : retryDelay * 2 ** (currentRetry - 1)

            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }

        // 更新错误状态
        error.value = httpError
        finished.value = true

        // 调用错误回调
        if (options.onError) {
          options.onError(httpError)
        }

        throw httpError
      }
      finally {
        loading.value = false
        isFetching.value = false

        // 调用完成回调
        if (options.onFinally) {
          options.onFinally()
        }
      }
    }

    throw error.value || new Error('Unknown error')
  }

  /**
   * 刷新查询
   */
  const refresh = (): Promise<ResponseData<T>> => {
    return execute()
  }

  /**
   * 取消查询
   */
  const cancel = (): void => {
    if (canCancel.value) {
      cancelTokenSource.cancel('Query cancelled by user')
    }
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    data.value = options.initialData ?? null
    loading.value = false
    error.value = null
    finished.value = false
    isStale.value = false
    isFetching.value = false
    dataUpdatedAt.value = 0
    failureCount.value = 0
  }

  /**
   * 使缓存失效
   */
  const invalidate = (): void => {
    const key = getQueryKey()
    globalQueryCache.invalidate(key)
    isStale.value = true
  }

  // 监听查询键和配置变化
  watch(
    [() => getQueryKey(), () => unref(config), enabled],
    () => {
      if (enabled.value && options.immediate !== false) {
        execute()
      }
    },
    { immediate: options.immediate !== false, deep: true },
  )

  // 窗口焦点重新获取
  if (options.refetchOnWindowFocus) {
    const handleFocus = () => {
      if (enabled.value && data.value) {
        execute()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      onUnmounted(() => {
        window.removeEventListener('focus', handleFocus)
      })
    }
  }

  // 网络重连重新获取
  if (options.refetchOnReconnect) {
    const handleOnline = () => {
      if (enabled.value && data.value) {
        execute()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      onUnmounted(() => {
        window.removeEventListener('online', handleOnline)
      })
    }
  }

  // 定时重新获取
  if (options.refetchInterval && options.refetchInterval > 0) {
    const interval = setInterval(() => {
      if (enabled.value && data.value) {
        execute()
      }
    }, options.refetchInterval)

    onUnmounted(() => {
      clearInterval(interval)
    })
  }

  // 组件卸载时取消请求
  if (options.cancelOnUnmount !== false) {
    onUnmounted(() => {
      cancel()
    })
  }

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    finished,
    isStale,
    isFetching,
    dataUpdatedAt,
    failureCount,
    execute,
    refresh,
    cancel,
    reset,
    invalidate,
    canCancel,
  }
}
