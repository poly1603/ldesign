import { computed, onUnmounted, ref, type Ref } from 'vue'
import { useApi } from './index'

/**
 * API 调用状态
 */
export interface ApiCallState<T = any> {
  /** 响应数据 */
  data: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 是否已完成（成功或失败） */
  finished: Ref<boolean>
  /** 执行 API 调用 */
  execute: (params?: any) => Promise<T>
  /** 重置状态 */
  reset: () => void
  /** 取消请求 */
  cancel: () => void
}

/**
 * API 调用选项
 */
export interface UseApiCallOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 默认参数 */
  defaultParams?: any
  /** 成功回调 */
  onSuccess?: (data: any) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调 */
  onFinally?: () => void
}

/**
 * 使用 API 调用的组合式函数
 */
export function useApiCall<T = any, P = any>(
  methodName: string,
  options: UseApiCallOptions = {}
): ApiCallState<T> {
  const {
    immediate = false,
    defaultParams,
    onSuccess,
    onError,
    onFinally,
  } = options

  const apiEngine = useApi()

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)

  let cancelFlag = false

  const execute = async (params?: P): Promise<T> => {
    if (loading.value) {
      return data.value as T
    }

    loading.value = true
    error.value = null
    finished.value = false
    cancelFlag = false

    try {
      const result = await apiEngine.call<T, P>(methodName, params)

      if (cancelFlag) {
        throw new Error('Request cancelled')
      }

      data.value = result
      finished.value = true

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      if (cancelFlag) {
        return data.value as T
      }

      const apiError = err instanceof Error ? err : new Error(String(err))
      error.value = apiError
      finished.value = true

      if (onError) {
        onError(apiError)
      }

      throw apiError
    } finally {
      if (!cancelFlag) {
        loading.value = false

        if (onFinally) {
          onFinally()
        }
      }
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
    finished.value = false
    cancelFlag = false
  }

  const cancel = () => {
    cancelFlag = true
    loading.value = false
  }

  // 立即执行
  if (immediate) {
    execute(defaultParams)
  }

  // 组件卸载时取消请求
  onUnmounted(() => {
    cancel()
  })

  return {
    data,
    loading,
    error,
    finished,
    execute,
    reset,
    cancel,
  }
}

/**
 * 使用系统 API 的组合式函数
 */
export function useSystemApi() {
  const apiEngine = useApi()

  return {
    // 验证码相关
    getCaptcha: () => useApiCall('getCaptcha'),

    // 认证相关
    login: (options?: UseApiCallOptions) => useApiCall('login', options),
    logout: (options?: UseApiCallOptions) => useApiCall('logout', options),
    getSession: (options?: UseApiCallOptions) =>
      useApiCall('getSession', options),
    refreshToken: (options?: UseApiCallOptions) =>
      useApiCall('refreshToken', options),

    // 用户相关
    getUserInfo: (options?: UseApiCallOptions) =>
      useApiCall('getUserInfo', options),
    changePassword: (options?: UseApiCallOptions) =>
      useApiCall('changePassword', options),
    getPermissions: (options?: UseApiCallOptions) =>
      useApiCall('getPermissions', options),

    // 菜单相关
    getMenus: (options?: UseApiCallOptions) => useApiCall('getMenus', options),

    // 直接调用 API 引擎
    call: apiEngine.call.bind(apiEngine),
    register: apiEngine.register.bind(apiEngine),
    getMethod: apiEngine.getMethod.bind(apiEngine),
  }
}

/**
 * 使用 API 统计信息的组合式函数
 */
export function useApiStats() {
  const apiEngine = useApi() as any

  const stats = computed(() => {
    const cacheStats = apiEngine.cacheManager?.getStats?.() || {}
    const debounceStats = apiEngine.debounceManager?.getStats?.() || {}
    const deduplicationStats =
      apiEngine.deduplicationManager?.getStats?.() || {}

    return {
      cache: cacheStats,
      debounce: debounceStats,
      deduplication: deduplicationStats,
    }
  })

  return {
    stats,
    clearCache: () => apiEngine.cacheManager?.clear?.(),
    cancelAllDebounce: () => apiEngine.debounceManager?.cancelAll?.(),
    cancelAllDeduplication: () => apiEngine.deduplicationManager?.cancelAll?.(),
  }
}

/**
 * 批量 API 调用的组合式函数
 */
export function useBatchApiCall<T = any>(
  methodNames: string[],
  options: UseApiCallOptions = {}
) {
  const apiEngine = useApi()

  const data = ref<Record<string, T>>({})
  const loading = ref(false)
  const errors = ref<Record<string, Error>>({})
  const finished = ref(false)

  const execute = async (params?: Record<string, any>) => {
    loading.value = true
    errors.value = {}
    finished.value = false

    try {
      const promises = methodNames.map(async methodName => {
        try {
          const result = await apiEngine.call<T>(
            methodName,
            params?.[methodName]
          )
          return { methodName, result, error: null }
        } catch (error) {
          return { methodName, result: null, error: error as Error }
        }
      })

      const results = await Promise.all(promises)

      const newData: Record<string, T> = {}
      const newErrors: Record<string, Error> = {}

      results.forEach(({ methodName, result, error }) => {
        if (error) {
          newErrors[methodName] = error
        } else if (result !== null) {
          newData[methodName] = result
        }
      })

      data.value = newData
      errors.value = newErrors
      finished.value = true

      return newData
    } catch (error) {
      finished.value = true
      throw error
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = {}
    loading.value = false
    errors.value = {}
    finished.value = false
  }

  return {
    data,
    loading,
    errors,
    finished,
    execute,
    reset,
  }
}
