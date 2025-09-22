import type { MaybeRef, Ref } from 'vue'
import type { HttpClientConfig, RequestConfig } from '../types'
import { computed, ref, unref, watch, onUnmounted, getCurrentInstance } from 'vue'
import { createHttpClient } from '../factory'

/**
 * 简化的HTTP请求选项
 */
export interface SimpleHttpOptions {
  /** 是否立即执行请求 */
  immediate?: boolean
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean
  /** 请求成功回调 */
  onSuccess?: (data: any) => void
  /** 请求失败回调 */
  onError?: (error: Error) => void
  /** 请求完成回调 */
  onFinally?: () => void
}

/**
 * 简化的HTTP请求返回值
 */
export interface SimpleHttpReturn<T> {
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
  execute: () => Promise<T | null>
  /** 重置状态 */
  reset: () => void
  /** 清除错误 */
  clearError: () => void
}

/**
 * 创建简化的HTTP客户端
 */
function createSimpleClient(config?: HttpClientConfig) {
  // 为相对URL提供默认的baseURL
  const defaultConfig: HttpClientConfig = {
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
    ...config
  }
  return createHttpClient(defaultConfig)
}

/**
 * 简化的HTTP GET请求hook
 * 
 * @example
 * ```ts
 * const { data, loading, error, execute } = useGet('/api/users')
 * ```
 */
export function useGet<T = any>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: SimpleHttpOptions = {}
): SimpleHttpReturn<T> {
  const client = createSimpleClient()
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  const execute = async (): Promise<T | null> => {
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

      const response = await client.get<T>(unref(url), requestConfig)
      data.value = response.data

      options.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      return null
    } finally {
      loading.value = false
      finished.value = true
      options.onFinally?.()
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
    finished.value = false
  }

  const clearError = () => {
    error.value = null
  }

  // 监听URL变化自动执行
  if (options.immediate !== false) {
    watch(() => unref(url), execute, { immediate: true })
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
    data: data as Ref<T | null>,
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
 * 简化的HTTP POST请求hook
 * 
 * @example
 * ```ts
 * const { data, loading, error, execute } = usePost('/api/users')
 * await execute({ name: 'John' })
 * ```
 */
export function usePost<T = any, D = any>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: SimpleHttpOptions = {}
): SimpleHttpReturn<T> & { execute: (data?: D) => Promise<T | null> } {
  const client = createSimpleClient()
  const responseData = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  const execute = async (postData?: D): Promise<T | null> => {
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

      const response = await client.post<T>(unref(url), postData, requestConfig)
      responseData.value = response.data

      options.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      return null
    } finally {
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
 * 简化的HTTP PUT请求hook
 */
export function usePut<T = any, D = any>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: SimpleHttpOptions = {}
): SimpleHttpReturn<T> & { execute: (data?: D) => Promise<T | null> } {
  const client = createSimpleClient()
  const responseData = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  const execute = async (putData?: D): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      finished.value = false

      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      const requestConfig = {
        ...unref(config),
        signal: abortController.signal,
      }

      const response = await client.put<T>(unref(url), putData, requestConfig)
      responseData.value = response.data

      options.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      return null
    } finally {
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
 * 简化的HTTP DELETE请求hook
 */
export function useDelete<T = any>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: SimpleHttpOptions = {}
): SimpleHttpReturn<T> {
  const client = createSimpleClient()
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  const execute = async (): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      finished.value = false

      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      const requestConfig = {
        ...unref(config),
        signal: abortController.signal,
      }

      const response = await client.delete<T>(unref(url), requestConfig)
      data.value = response.data

      options.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      return null
    } finally {
      loading.value = false
      finished.value = true
      options.onFinally?.()
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
    finished.value = false
  }

  const clearError = () => {
    error.value = null
  }

  if (options.cancelOnUnmount !== false && getCurrentInstance()) {
    onUnmounted(() => {
      if (abortController) {
        abortController.abort()
      }
    })
  }

  return {
    data: data as Ref<T | null>,
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
 * 简化的HTTP PATCH请求hook
 */
export function usePatch<T = any, D = any>(
  url: MaybeRef<string>,
  config?: MaybeRef<RequestConfig>,
  options: SimpleHttpOptions = {}
): SimpleHttpReturn<T> & { execute: (data?: D) => Promise<T | null> } {
  const client = createSimpleClient()
  const responseData = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  const hasError = computed(() => error.value !== null)

  let abortController: AbortController | null = null

  const execute = async (patchData?: D): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      finished.value = false

      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      const requestConfig = {
        ...unref(config),
        signal: abortController.signal,
      }

      const response = await client.patch<T>(unref(url), patchData, requestConfig)
      responseData.value = response.data

      options.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      return null
    } finally {
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
