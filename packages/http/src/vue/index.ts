/**
 * ===================
 * 核心类型导出
 * ===================
 */
export type {
  HttpPluginOptions,
  RequestState,
  UseMutationOptions,
  UseMutationReturn,
  UseQueryOptions,
  UseQueryReturn,
  UseRequestOptions,
  UseRequestReturn,
} from '../types/vue'

/**
 * ===================
 * 基础 HTTP Composables
 * ===================
 */

// 独立 HTTP 客户端 (推荐: 最简单的使用方式,无需配置)
export { useHttp } from './useHttpStandalone'

// 依赖注入版本 (适用于需要全局配置的场景)
export {
  HTTP_CLIENT_KEY,
  HTTP_CONFIG_KEY,
  injectHttpClient,
  injectHttpConfig,
  provideHttpClient,
  useHttp as useInjectedHttp,
} from './useHttp'

// Vue Plugin (安装后可使用 useInjectedHttp)
export { HttpPlugin, install } from './plugin'

/**
 * ===================
 * REST API Composables
 * ===================
 */

// 简单的 HTTP 方法 hooks (推荐: 最直观的使用方式)
export {
  useGet,
  usePost,
  usePut,
  useDelete,
  usePatch,
} from './useSimpleHttp'

// 传统的 Mutation hooks (适用于熟悉 react-query 的用户)
export {
  useMutation,
} from './useMutation'

// Query hook (适用于数据获取场景)
export { useQuery } from './useQuery'

// 通用请求 hook
export { useAsyncRequest, useRequest } from './useRequest'

/**
 * ===================
 * 资源管理
 * ===================
 */

// 资源管理 hook (推荐: 完整的 CRUD 操作)
export { useResource } from './useResource'

// 分页 hook
export { usePagination } from './useHttp'

// 表单管理 hook
export { useForm } from './useForm'

/**
 * ===================
 * 高级功能
 * ===================
 */

// 防抖和节流
export {
  useDebouncedRequest,
  useThrottledRequest,
} from './useThrottledRequest'

// 请求队列
export {
  useRequestQueue,
} from './useRequestQueue'

// 乐观更新
export {
  useOptimisticUpdate,
  useOptimisticList,
} from './useOptimisticUpdate'

// 高级功能类型
export type {
  ThrottleOptions,
} from './useThrottledRequest'

export type {
  RequestQueueConfig,
} from './useRequestQueue'

export type {
  OptimisticUpdateOptions,
} from './useOptimisticUpdate'

/**
 * ===================
 * 新增便捷功能
 * ===================
 */

// 网络状态监听
export {
  useNetworkStatus,
} from './useNetworkStatus'

export type {
  UseNetworkStatusReturn,
} from './useNetworkStatus'

// 智能轮询
export {
  usePolling,
  usePollingTimes,
  usePollingUntil,
} from './usePolling'

export type {
  PollingConfig,
  UsePollingReturn,
} from './usePolling'
