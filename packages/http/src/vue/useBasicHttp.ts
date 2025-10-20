import type { MaybeRef, Ref } from 'vue'
import type { HttpClientConfig, RequestConfig } from '../types'
import { computed, getCurrentInstance, onUnmounted, ref, unref, watch } from 'vue'
import { createHttpClient } from '../factory'

/**
 * 基础HTTP请求选项
 */
export interface BasicHttpOptions<T = unknown> {
  /** 是否立即执行请求 */
  immediate?: boolean
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean
  /** 请求成功回调 */
  onSuccess?: (data: T) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
  /** 请求完成回调 */
  onFinally?: () => void
}

/**
 * 基础HTTP请求返回值
 */
export interface BasicHttpReturn<T, D = unknown> {
  /** 响应数据 */
  data: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 是否完成 */
  finished: Ref<boolean>
  /** 是否有错误 */
  hasError: Ref<boolean>
  /** 执行请求 */
  execute: (data?: D) => Promise<T | null>
  /** 重置状态 */
  reset: () => void
  /** 清除错误 */
  clearError: () => void
}

/**
 * 创建基础HTTP客户端
 */
function createBasicClient(config?: HttpClientConfig) {
  // 为相对URL提供默认的baseURL
  const defaultConfig: HttpClientConfig = {
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
    ...config,
  }
  return createHttpClient(defaultConfig)
}

/**
 * 通用HTTP请求hook工厂
 *
 * 这个内部函数用于创建所有HTTP方法的hooks,消除重复代码
 */
function createHttpHook<T = unknown, D = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: BasicHttpOptions<T> = {},
): BasicHttpReturn<T, D> {
  const client = createBasicClient()
  const responseData = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  const execute = async (requestData?: D): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      finished.value = false

      // 取消之前的请求
      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      const requestConfig = {
        ...unref(config),
        signal: abortController.signal,
      }

      let response
      switch (method) {
        case 'GET':
          response = await client.get<T>(unref(url), requestConfig)
          break
        case 'POST':
          response = await client.post<T>(unref(url), requestData, requestConfig)
          break
        case 'PUT':
          response = await client.put<T>(unref(url), requestData, requestConfig)
          break
        case 'PATCH':
          response = await client.patch<T>(unref(url), requestData, requestConfig)
          break
        case 'DELETE':
          response = await client.delete<T>(unref(url), requestConfig)
          break
      }

      responseData.value = response.data

      options.onSuccess?.(response.data)
      return response.data
    }
    catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      return null
    }
    finally {
      loading.value = false
      finished.value = true
      options.onFinally?.()
    }
  }

  const reset = () => {
    responseData.value = null
    loading.value = false
    error.value = null
    finished.value = false
  }

  const clearError = () => {
    error.value = null
  }

  // GET请求支持监听URL变化自动执行
  if (method === 'GET' && options.immediate !== false) {
    watch(() => unref(url), () => execute(), { immediate: true })
  }

  // 组件卸载时取消请求
  if (options.cancelOnUnmount !== false && getCurrentInstance()) {
    onUnmounted(() => {
      if (abortController) {
        abortController.abort()
      }
    })
  }

  return {
    data: responseData as Ref<T | null>,
    loading,
    error,
    finished,
    hasError,
    execute,
    reset,
    clearError,
  }
}

/**
 * 基础HTTP GET请求hook
 *
 * @example
 * ```ts
 * const { data, loading, error, execute } = useGet('/api/users')
 * ```
 */
export function useGet<T = any>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: BasicHttpOptions = {},
): BasicHttpReturn<T> {
  return createHttpHook<T>('GET', url, config, options)
}

/**
 * 基础HTTP POST请求hook
 *
 * @example
 * ```ts
 * const { data, loading, error, execute } = usePost('/api/users')
 * await execute({ name: 'John' })
 * ```
 */
export function usePost<T = unknown, D = unknown>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: BasicHttpOptions<T> = {},
): BasicHttpReturn<T, D> {
  return createHttpHook<T, D>('POST', url, config, options) as BasicHttpReturn<T, D>
}

/**
 * 基础HTTP PUT请求hook
 */
export function usePut<T = unknown, D = unknown>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: BasicHttpOptions<T> = {},
): BasicHttpReturn<T, D> {
  return createHttpHook<T, D>('PUT', url, config, options) as BasicHttpReturn<T, D>
}

/**
 * 基础HTTP DELETE请求hook
 */
export function useDelete<T = unknown>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: BasicHttpOptions<T> = {},
): BasicHttpReturn<T> {
  return createHttpHook<T>('DELETE', url, config, options)
}

/**
 * 基础HTTP PATCH请求hook
 */
export function usePatch<T = unknown, D = unknown>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: BasicHttpOptions<T> = {},
): BasicHttpReturn<T, D> {
  return createHttpHook<T, D>('PATCH', url, config, options) as BasicHttpReturn<T, D>
}
