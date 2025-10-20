import type { MaybeRef, Ref } from 'vue'
import type {
  HttpClient,
  HttpError,
  RequestConfig,
  ResponseData,
} from '../types'
import type { UseRequestOptions, UseRequestReturn } from '../types/vue'
import { computed, onUnmounted, ref, unref, watch } from 'vue'
import { createCancelTokenSource, isCancelError } from '../utils/cancel'

/**
 * useRequest Hook
 * 用于处理 HTTP 请求的 Vue 3 Composition API Hook
 */
export function useRequest<T = any>(
  client: HttpClient,
  config: MaybeRef<RequestConfig>,
  options: UseRequestOptions<T> = {},
): UseRequestReturn<T> {
  // 响应式状态
  const data = ref<T | null>(options.initialData ?? null)
  const loading = ref<boolean>(false)
  const error = ref<HttpError | null>(null)
  const finished = ref<boolean>(false)

  // 取消控制
  let cancelTokenSource = createCancelTokenSource()

  // 计算属性
  const canCancel = computed(() => loading.value)

  /**
   * 执行请求
   */
  const execute = async (
    overrideConfig?: RequestConfig,
  ): Promise<ResponseData<T>> => {
    // 重置状态
    loading.value = true
    error.value = null
    finished.value = false

    // 创建新的取消令牌
    cancelTokenSource = createCancelTokenSource()

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
      if (typeof options.transform === 'function') {
        responseData = options.transform(response.data)
      }

      // 更新状态
      data.value = responseData
      finished.value = true

      // 调用成功回调
      if (typeof options.onSuccess === 'function') {
        options.onSuccess(responseData, response)
      }

      return response
    }
    catch (err) {
      const httpError = err as HttpError

      // 如果不是取消错误，更新错误状态
      if (!isCancelError(httpError)) {
        error.value = httpError
        finished.value = true

        // 调用错误回调
      if (typeof options.onError === 'function') {
        options.onError(httpError)
      }
      }

      throw httpError
    }
    finally {
      loading.value = false

      // 调用完成回调
      if (typeof options.onFinally === 'function') {
        options.onFinally()
      }
    }
  }

  /**
   * 刷新请求
   */
  const refresh = (): Promise<ResponseData<T>> => {
    return execute()
  }

  /**
   * 取消请求
   */
  const cancel = (): void => {
    if (canCancel.value) {
      cancelTokenSource.cancel('Request cancelled by user')
    }
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    data.value = (options.initialData as T | null) ?? null
    loading.value = false
    error.value = null
    finished.value = false
  }

  // 监听配置变化
  if (options.immediate !== false) {
    watch(
      () => unref(config),
      () => {
        execute()
      },
      { immediate: true, deep: true },
    )
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
    execute,
    refresh,
    cancel,
    reset,
    canCancel,
  }
}

/**
 * 简化的 useRequest Hook，用于单次请求
 */
export function useAsyncRequest<T = any>(
  _client: HttpClient,
  requestFn: () => Promise<ResponseData<T>>,
  options: Omit<UseRequestOptions<T>, 'immediate'> = {},
): UseRequestReturn<T> {
  const data = ref<T | null>((options.initialData as T | null) ?? null)
  const loading = ref<boolean>(false)
  const error = ref<HttpError | null>(null)
  const finished = ref<boolean>(false)

  let cancelTokenSource = createCancelTokenSource()

  const canCancel = computed(() => loading.value)

  const execute = async (): Promise<ResponseData<T>> => {
    loading.value = true
    error.value = null
    finished.value = false

    cancelTokenSource = createCancelTokenSource()

    try {
      const response = await requestFn()

      let responseData = response.data
      if (typeof options.transform === 'function') {
        responseData = options.transform(response.data)
      }

      data.value = responseData
      finished.value = true

      if (typeof options.onSuccess === 'function') {
        options.onSuccess(responseData, response)
      }

      return response
    }
    catch (err) {
      const httpError = err as HttpError

      if (!isCancelError(httpError)) {
        error.value = httpError
        finished.value = true

        if (typeof options.onError === 'function') {
          options.onError(httpError)
        }
      }

      throw httpError
    }
    finally {
      loading.value = false

      if (typeof options.onFinally === 'function') {
        options.onFinally()
      }
    }
  }

  const refresh = execute
  const cancel = (): void => {
    if (canCancel.value) {
      cancelTokenSource.cancel('Request cancelled by user')
    }
  }

  const reset = (): void => {
    data.value = (options.initialData as T | null) ?? null
    loading.value = false
    error.value = null
    finished.value = false
  }

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
    execute,
    refresh,
    cancel,
    reset,
    canCancel,
  }
}
