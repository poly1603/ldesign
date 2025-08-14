import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js'
import { ApiMethod } from '../types/index.js'
import {
  Ref,
  ComputedRef,
} from '../node_modules/.pnpm/@vue_reactivity@3.5.18/node_modules/@vue/reactivity/dist/reactivity.d.js'

/**
 * API 调用状态
 */
interface ApiCallState<T = unknown> {
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
interface UseApiCallOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 默认参数 */
  defaultParams?: unknown
  /** 成功回调 */
  onSuccess?: (data: unknown) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调 */
  onFinally?: () => void
}
/**
 * 使用 API 调用的组合式函数
 */
declare function useApiCall<
  T = unknown,
  P extends Record<string, unknown> | undefined = Record<string, unknown>
>(methodName: string, options?: UseApiCallOptions): ApiCallState<T>
/**
 * 使用系统 API 的组合式函数
 */
declare function useSystemApi(): {
  getCaptcha: () => ApiCallState<unknown>
  login: (options?: UseApiCallOptions) => ApiCallState<unknown>
  logout: (options?: UseApiCallOptions) => ApiCallState<unknown>
  getSession: (options?: UseApiCallOptions) => ApiCallState<unknown>
  refreshToken: (options?: UseApiCallOptions) => ApiCallState<unknown>
  getUserInfo: (options?: UseApiCallOptions) => ApiCallState<unknown>
  changePassword: (options?: UseApiCallOptions) => ApiCallState<unknown>
  getPermissions: (options?: UseApiCallOptions) => ApiCallState<unknown>
  getMenus: (options?: UseApiCallOptions) => ApiCallState<unknown>
  call: <
    T = unknown,
    P extends Record<string, unknown> | undefined = Record<string, unknown>
  >(
    name: string,
    params?: P
  ) => Promise<T>
  register: (name: string, method: ApiMethod) => void
  getMethod: (name: string) => ApiMethod | undefined
}
/**
 * 使用 API 统计信息的组合式函数
 */
declare function useApiStats(): {
  stats: ComputedRef<{
    cache: any
    debounce: any
    deduplication: any
  }>
  clearCache: () => any
  cancelAllDebounce: () => any
  cancelAllDeduplication: () => any
}
/**
 * 批量 API 调用的组合式函数
 */
declare function useBatchApiCall<T = unknown>(
  methodNames: string[],
  _options?: UseApiCallOptions
): {
  data: Ref<Record<string, T>, Record<string, T>>
  loading: Ref<boolean, boolean>
  errors: Ref<Record<string, Error>, Record<string, Error>>
  finished: Ref<boolean, boolean>
  execute: (params?: Record<string, any>) => Promise<Record<string, T>>
  reset: () => void
}

export { useApiCall, useApiStats, useBatchApiCall, useSystemApi }
export type { ApiCallState, UseApiCallOptions }
