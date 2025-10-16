import type { ApiCallOptions } from '../../types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, ApiErrorType } from '../../utils/ApiError'
import { useApi } from '../provider'

/**
 * React API 调用选项
 */
export interface UseApiCallOptions<T = unknown> extends ApiCallOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 错误回调 */
  onError?: (error: ApiError) => void
  /** 完成回调 */
  onFinally?: () => void
  /** 默认数据 */
  defaultData?: T
}

/**
 * API 调用状态
 */
export interface ApiCallState<T = unknown> {
  /** 响应数据 */
  data: T | null
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: ApiError | null
  /** 执行函数 */
  execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>
  /** 重置状态 */
  reset: () => void
  /** 是否已完成 */
  isFinished: boolean
  /** 是否成功 */
  isSuccess: boolean
  /** 是否失败 */
  isError: boolean
}

/**
 * useApiCall（React 版）
 * 与 Vue 版行为保持一致：data/loading/error/execute/reset + immediate
 *
 * @param methodName API 方法名称
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useApiCall } from '@ldesign/api/react'
 *
 * // 基础用法
 * const { data, loading, error, execute } = useApiCall<UserInfo>('getUserInfo', {
 *   immediate: true,
 *   onSuccess: (data) => ,
 *   onError: (error) => console.error('Error:', error),
 * })
 *
 * // 带默认数据
 * const { data } = useApiCall<User[]>('getUsers', {
 *   defaultData: [],
 *   immediate: true,
 * })
 * ```
 */
export function useApiCall<T = unknown>(
  methodName: string,
  options: UseApiCallOptions<T> = {},
): ApiCallState<T> {
  const api = useApi()
  const [data, setData] = useState<T | null>(options.defaultData ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  // 使用 ref 存储 options，避免每次都创建新的 execute 函数
  const optionsRef = useRef(options)

  // 更新 ref（不触发重新渲染）
  useEffect(() => {
    optionsRef.current = options
  })

  const execute = useCallback(async (params?: unknown, callOpts?: ApiCallOptions) => {
    setLoading(true)
    setError(null)
    try {
      const currentOptions = optionsRef.current
      const res = await api.call<T>(methodName, params, { ...currentOptions, ...callOpts })
      setData(res)
      currentOptions?.onSuccess?.(res)
      return res
    }
    catch (e) {
      const err = e instanceof ApiError ? e : (e instanceof Error ? e : new Error(String(e)))
      const apiError = err instanceof ApiError
        ? err
        : new ApiError({
          type: ApiErrorType.UNKNOWN_ERROR,
          message: err.message,
          originalError: err,
          context: { methodName, params },
        })
      setError(apiError)
      optionsRef.current?.onError?.(apiError)
      throw apiError
    }
    finally {
      setLoading(false)
      optionsRef.current?.onFinally?.()
    }
  }, [api, methodName])

  useEffect(() => {
    if (options.immediate)
      void execute().catch(() => {})
  }, [])

  const reset = useCallback(() => {
    setData(options.defaultData ?? null)
    setLoading(false)
    setError(null)
  }, [options.defaultData])

  const isFinished = !loading
  const isSuccess = !loading && !error && data !== null
  const isError = !loading && !!error

  return { data, loading, error, execute, reset, isFinished, isSuccess, isError }
}

/**
 * 简化的API调用钩子，自动推断类型
 *
 * @param methodName API 方法名称
 * @param params 请求参数
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useRequest } from '@ldesign/api/react'
 *
 * // 自动执行
 * const { data, loading, error } = useRequest<UserInfo>('getUserInfo')
 *
 * // 带参数
 * const { data, loading, error, execute } = useRequest<User[]>('getUsers', { page: 1 })
 *
 * // 手动执行
 * const { data, loading, error, execute } = useRequest<User>('createUser', null, { immediate: false })
 * ```
 */
export function useRequest<T = unknown>(
  methodName: string,
  params?: unknown,
  options: UseApiCallOptions<T> = {},
): ApiCallState<T> {
  const { immediate = params !== null, ...restOptions } = options

  const state = useApiCall<T>(methodName, {
    ...restOptions,
    immediate: false,
  })

  // 如果需要立即执行且有参数
  // 只依赖 execute 函数，避免 state 整体变化导致的无限循环
  useEffect(() => {
    if (immediate) {
      state.execute(params).catch(() => {})
    }
  }, [immediate, params, state.execute])

  return {
    ...state,
    execute: useCallback((newParams = params, executeOptions?: ApiCallOptions) =>
      state.execute(newParams, executeOptions), [params, state]),
  }
}
