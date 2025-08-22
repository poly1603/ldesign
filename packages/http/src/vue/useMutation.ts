import type { Ref } from 'vue'
import type {
  HttpClient,
  HttpError,
  RequestConfig,
  ResponseData,
} from '../types'
import type { UseMutationOptions, UseMutationReturn } from '../types/vue'
import { onUnmounted, ref } from 'vue'
import { createCancelTokenSource, isCancelError } from '../utils/cancel'

/**
 * useMutation Hook
 * 用于处理变更操作（POST、PUT、DELETE 等）
 */
export function useMutation<T = any, V = any>(
  _client: HttpClient,
  mutationFn: (
    variables: V,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>,
  options: UseMutationOptions<T, V> = {},
): UseMutationReturn<T, V> {
  // 响应式状态
  const data = ref<T | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<HttpError | null>(null)
  const finished = ref<boolean>(false)

  // 取消控制
  let cancelTokenSource = createCancelTokenSource()

  /**
   * 执行变更
   */
  const mutate = async (
    variables: V,
    config?: RequestConfig,
  ): Promise<ResponseData<T>> => {
    // 重置状态
    loading.value = true
    error.value = null
    finished.value = false

    // 创建新的取消令牌
    cancelTokenSource = createCancelTokenSource()

    try {
      // 调用开始回调
      if (options.onMutate) {
        options.onMutate(variables)
      }

      // 执行变更
      const response = await mutationFn(variables, {
        ...config,
        signal: cancelTokenSource.token.promise as any,
      })

      // 更新状态
      data.value = response.data
      finished.value = true

      // 调用成功回调
      if (options.onSuccess) {
        options.onSuccess(response.data, variables, response)
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
        if (options.onError) {
          options.onError(httpError, variables)
        }
      }

      throw httpError
    }
    finally {
      loading.value = false

      // 调用完成回调
      if (options.onSettled) {
        options.onSettled(data.value ?? undefined, error.value, variables)
      }
    }
  }

  /**
   * 异步执行变更
   */
  const mutateAsync = mutate

  /**
   * 重置状态
   */
  const reset = (): void => {
    data.value = null
    loading.value = false
    error.value = null
    finished.value = false
  }

  // 组件卸载时取消请求
  onUnmounted(() => {
    if (loading.value) {
      cancelTokenSource.cancel('Mutation cancelled due to component unmount')
    }
  })

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    finished,
    mutate,
    mutateAsync,
    reset,
  }
}

/**
 * 简化的变更 Hook，用于特定的 HTTP 方法
 */
export function usePost<T = any, D = any>(
  client: HttpClient,
  url: string,
  options?: UseMutationOptions<T, D>,
): UseMutationReturn<T, D> {
  return useMutation(
    client,
    (data: D, config?: RequestConfig) => client.post<T>(url, data, config),
    options,
  )
}

export function usePut<T = any, D = any>(
  client: HttpClient,
  url: string,
  options?: UseMutationOptions<T, D>,
): UseMutationReturn<T, D> {
  return useMutation(
    client,
    (data: D, config?: RequestConfig) => client.put<T>(url, data, config),
    options,
  )
}

export function usePatch<T = any, D = any>(
  client: HttpClient,
  url: string,
  options?: UseMutationOptions<T, D>,
): UseMutationReturn<T, D> {
  return useMutation(
    client,
    (data: D, config?: RequestConfig) => client.patch<T>(url, data, config),
    options,
  )
}

export function useDelete<T = any>(
  client: HttpClient,
  url: string,
  options?: UseMutationOptions<T, void>,
): UseMutationReturn<T, void> {
  return useMutation(
    client,
    (_, config?: RequestConfig) => client.delete<T>(url, config),
    options,
  )
}
