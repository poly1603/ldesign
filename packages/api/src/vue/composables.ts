/**
 * Vue 组合式 API
 * 提供 Vue 3 组合式 API 钩子函数
 */

import type { ComputedRef, Ref } from 'vue'
import type {
  ApiCallOptions,
  ApiEngine,
  LoginResult,
  MenuItem,
  UserInfo,
} from '../types'
import { computed, getCurrentInstance, inject, onUnmounted, ref } from 'vue'
import { SYSTEM_API_METHODS } from '../types'
import { API_ENGINE_INJECTION_KEY } from './plugin'

/**
 * API 调用状态
 */
export interface ApiCallState<T = unknown> {
  /** 响应数据 */
  data: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 执行函数 */
  execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>
  /** 重置状态 */
  reset: () => void
  /** 是否已完成 */
  isFinished: ComputedRef<boolean>
  /** 是否成功 */
  isSuccess: ComputedRef<boolean>
  /** 是否失败 */
  isError: ComputedRef<boolean>
}

/**
 * API 调用选项
 */
export interface UseApiCallOptions extends ApiCallOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 成功回调 */
  onSuccess?: (data: unknown) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调 */
  onFinally?: () => void
}

/**
 * 获取 API 引擎实例
 *
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { useApi } from '@ldesign/api/vue'
 *
 * const apiEngine = useApi()
 * const result = await apiEngine.call('getUserInfo')
 * ```
 */
export function useApi(): ApiEngine {
  // 尝试从依赖注入获取
  const injectedEngine = inject<ApiEngine>(API_ENGINE_INJECTION_KEY)
  if (injectedEngine) {
    return injectedEngine
  }

  // 尝试从全局属性获取
  const instance = getCurrentInstance()
  if (instance?.appContext.app.config.globalProperties.$api) {
    return instance.appContext.app.config.globalProperties.$api
  }

  throw new Error('API Engine not found. Please install ApiVuePlugin first.')
}

/**
 * API 调用钩子
 *
 * @param methodName API 方法名称
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useApiCall } from '@ldesign/api/vue'
 *
 * const { data, loading, error, execute } = useApiCall('getUserInfo', {
 *   immediate: true,
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error),
 * })
 * ```
 */
export function useApiCall<T = unknown>(
  methodName: string,
  options: UseApiCallOptions = {},
): ApiCallState<T> {
  const apiEngine = useApi()

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isFinished = computed(() => !loading.value)
  const isSuccess = computed(
    () => !loading.value && !error.value && data.value !== null,
  )
  const isError = computed(() => !loading.value && error.value !== null)

  const execute = async (
    params?: unknown,
    executeOptions?: ApiCallOptions,
  ): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiEngine.call<T>(methodName, params, {
        ...options,
        ...executeOptions,
      })

      data.value = result

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    }
    catch (err) {
      const apiError = err instanceof Error ? err : new Error(String(err))
      error.value = apiError

      if (options.onError) {
        options.onError(apiError)
      }

      throw apiError
    }
    finally {
      loading.value = false

      if (options.onFinally) {
        options.onFinally()
      }
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  // 立即执行
  if (options.immediate) {
    execute()
  }

  return {
    data: data as unknown as Ref<T | null>,
    loading,
    error,
    execute,
    reset,
    isFinished,
    isSuccess,
    isError,
  }
}

/**
 * 批量 API 调用钩子
 *
 * @param calls API 调用配置数组
 * @param options 调用选项
 * @returns 批量调用状态
 *
 * @example
 * ```typescript
 * import { useBatchApiCall } from '@ldesign/api/vue'
 *
 * const { data, loading, errors, execute } = useBatchApiCall([
 *   { methodName: 'getUserInfo' },
 *   { methodName: 'getMenus' },
 *   { methodName: 'getPermissions' },
 * ])
 * ```
 */
export function useBatchApiCall<T = unknown>(
  calls: Array<{ methodName: string, params?: unknown, options?: ApiCallOptions }>,
  options: Omit<UseApiCallOptions, 'onSuccess' | 'onError'> & {
    onSuccess?: (results: T[]) => void
    onError?: (errors: (Error | null)[]) => void
  } = {},
): {
    data: Ref<T[]>
    loading: Ref<boolean>
    errors: Ref<(Error | null)[]>
    execute: () => Promise<T[]>
    reset: () => void
    isFinished: ComputedRef<boolean>
    isSuccess: ComputedRef<boolean>
    hasErrors: ComputedRef<boolean>
  } {
  const apiEngine = useApi()

  const data = ref<T[]>([])
  const loading = ref(false)
  const errors = ref<(Error | null)[]>([])

  const isFinished = computed(() => !loading.value)
  const isSuccess = computed(
    () => !loading.value && errors.value.every(err => err === null),
  )
  const hasErrors = computed(() => errors.value.some(err => err !== null))

  const execute = async (): Promise<T[]> => {
    loading.value = true
    errors.value = []
    data.value = []

    try {
      const results = await Promise.allSettled(
        calls.map(({ methodName, params, options: callOptions }) =>
          apiEngine.call<T>(methodName, params, { ...options, ...callOptions }),
        ),
      )

      const successResults: T[] = []
      const errorResults: (Error | null)[] = []

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successResults.push(result.value)
          errorResults.push(null)
        }
        else {
          successResults.push(null as unknown as T)
          errorResults.push(
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
          )
        }
      })

      data.value = successResults
      errors.value = errorResults

      if (options.onSuccess) {
        options.onSuccess(successResults)
      }

      return successResults
    }
    catch (err) {
      const apiError = err instanceof Error ? err : new Error(String(err))

      if (options.onError) {
        options.onError([apiError])
      }

      throw apiError
    }
    finally {
      loading.value = false

      if (options.onFinally) {
        options.onFinally()
      }
    }
  }

  const reset = () => {
    data.value = []
    loading.value = false
    errors.value = []
  }

  // 立即执行
  if (options.immediate) {
    execute()
  }

  return {
    data: data as unknown as Ref<T[]>,
    loading,
    errors,
    execute,
    reset,
    isFinished,
    isSuccess,
    hasErrors,
  }
}

/**
 * 系统 API 钩子
 *
 * @returns 系统 API 方法对象
 *
 * @example
 * ```typescript
 * import { useSystemApi } from '@ldesign/api/vue'
 *
 * const systemApi = useSystemApi()
 *
 * const { data: userInfo, loading, execute: fetchUserInfo } = systemApi.getUserInfo({
 *   immediate: true,
 * })
 *
 * const { execute: login } = systemApi.login({
 *   onSuccess: (result) => console.log('登录成功:', result),
 * })
 * ```
 */
export function useSystemApi() {
  return {
    /**
     * 获取验证码
     */
    getCaptcha: (options: UseApiCallOptions = {}) =>
      useApiCall<import('../types').CaptchaInfo>(
        SYSTEM_API_METHODS.GET_CAPTCHA,
      options,
      ),

    /**
     * 用户登录
     */
    login: (options: UseApiCallOptions = {}) =>
      useApiCall<LoginResult>(SYSTEM_API_METHODS.LOGIN, options),

    /**
     * 用户登出
     */
    logout: (options: UseApiCallOptions = {}) =>
      useApiCall<void>(SYSTEM_API_METHODS.LOGOUT, options),

    /**
     * 获取用户信息
     */
    getUserInfo: (options: UseApiCallOptions = {}) =>
      useApiCall<UserInfo>(SYSTEM_API_METHODS.GET_USER_INFO, options),

    /**
     * 更新用户信息
     */
    updateUserInfo: (options: UseApiCallOptions = {}) =>
      useApiCall<UserInfo>(SYSTEM_API_METHODS.UPDATE_USER_INFO, options),

    /**
     * 获取系统菜单
     */
    getMenus: (options: UseApiCallOptions = {}) =>
      useApiCall<MenuItem[]>(SYSTEM_API_METHODS.GET_MENUS, options),

    /**
     * 获取用户权限
     */
    getPermissions: (options: UseApiCallOptions = {}) =>
      useApiCall<string[]>(SYSTEM_API_METHODS.GET_PERMISSIONS, options),

    /**
     * 刷新令牌
     */
    refreshToken: (options: UseApiCallOptions = {}) =>
      useApiCall<LoginResult>(SYSTEM_API_METHODS.REFRESH_TOKEN, options),

    /**
     * 修改密码
     */
    changePassword: (options: UseApiCallOptions = {}) =>
      useApiCall<void>(SYSTEM_API_METHODS.CHANGE_PASSWORD, options),

    /**
     * 获取系统配置
     */
    getSystemConfig: (options: UseApiCallOptions = {}) =>
      useApiCall<unknown>(SYSTEM_API_METHODS.GET_SYSTEM_CONFIG, options),
  }
}

/**
 * 清理钩子，在组件卸载时自动清理资源
 */
export function useApiCleanup(): void {
  // 这里可以按需获取引擎进行清理：const api = useApi()
  onUnmounted(() => {
    // 可以在这里添加清理逻辑
    // 例如：取消正在进行的请求、清理缓存等
  })
}
