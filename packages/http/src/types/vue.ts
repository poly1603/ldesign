import type { ComputedRef, Ref } from 'vue'
import type {
  HttpClient,
  HttpError,
  RequestConfig,
  ResponseData,
} from './index'

// 重新导出核心类型
export type { HttpClient, HttpError, RequestConfig, ResponseData }

/**
 * 请求状态接口
 */
export interface RequestState<T = any> {
  /** 响应数据 */
  data: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<HttpError | null>
  /** 是否已完成（成功或失败） */
  finished: Ref<boolean>
}

/**
 * useRequest 配置选项
 */
export interface UseRequestOptions<T = any> extends RequestConfig {
  /** 是否立即执行请求 */
  immediate?: boolean
  /** 初始数据 */
  initialData?: T
  /** 成功回调 */
  onSuccess?: (data: T, response: ResponseData<T>) => void
  /** 错误回调 */
  onError?: (error: HttpError) => void
  /** 完成回调（无论成功或失败） */
  onFinally?: () => void
  /** 响应数据转换函数 */
  transform?: (data: any) => T
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean
}

/**
 * useRequest 返回值
 */
export interface UseRequestReturn<T = any> extends RequestState<T> {
  /** 执行请求 */
  execute: (config?: RequestConfig) => Promise<ResponseData<T>>
  /** 刷新请求 */
  refresh: () => Promise<ResponseData<T>>
  /** 取消请求 */
  cancel: () => void
  /** 重置状态 */
  reset: () => void
  /** 是否可以取消 */
  canCancel: ComputedRef<boolean>
}

/**
 * useQuery 配置选项
 */
export interface UseQueryOptions<T = any> extends UseRequestOptions<T> {
  /** 查询键 */
  queryKey?: string | (() => string)
  /** 是否启用缓存 */
  enabled?: boolean | Ref<boolean>
  /** 缓存时间（毫秒） */
  staleTime?: number
  /** 缓存过期时间（毫秒） */
  cacheTime?: number
  /** 重新获取数据的条件 */
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchInterval?: number
  /** 重试配置 */
  retry?:
    | boolean
    | number
    | ((failureCount: number, error: HttpError) => boolean)
  retryDelay?: number | ((retryAttempt: number) => number)
}

/**
 * useQuery 返回值
 */
export interface UseQueryReturn<T = any> extends UseRequestReturn<T> {
  /** 是否来自缓存 */
  isStale: Ref<boolean>
  /** 是否正在后台更新 */
  isFetching: Ref<boolean>
  /** 上次更新时间 */
  dataUpdatedAt: Ref<number>
  /** 失败次数 */
  failureCount: Ref<number>
  /** 使缓存失效 */
  invalidate: () => void
}

/**
 * useMutation 配置选项
 */
export interface UseMutationOptions<T = any, V = any> {
  /** 成功回调 */
  onSuccess?: (data: T, variables: V, response: ResponseData<T>) => void
  /** 错误回调 */
  onError?: (error: HttpError, variables: V) => void
  /** 开始回调 */
  onMutate?: (variables: V) => void
  /** 完成回调 */
  onSettled?: (
    data: T | undefined,
    error: HttpError | null,
    variables: V
  ) => void
}

/**
 * useMutation 返回值
 */
export interface UseMutationReturn<T = any, V = any> extends RequestState<T> {
  /** 执行变更 */
  mutate: (variables: V, config?: RequestConfig) => Promise<ResponseData<T>>
  /** 异步执行变更 */
  mutateAsync: (
    variables: V,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  /** 重置状态 */
  reset: () => void
}

/**
 * Vue 插件配置选项
 */
export interface HttpPluginOptions {
  /** HTTP 客户端实例 */
  client?: HttpClient
  /** 全局配置 */
  globalConfig?: RequestConfig
  /** 插件名称（用于全局属性） */
  globalProperty?: string
}

/**
 * Vue 应用实例扩展
 */
declare module 'vue' {
  interface ComponentCustomProperties {
    $http: HttpClient
  }
}
