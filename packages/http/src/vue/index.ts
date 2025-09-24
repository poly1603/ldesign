// Vue Types
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
// HTTP Composable (独立版本，不需要依赖注入)
export { useHttp } from './composables/useHttp'
// Vue Plugin
export { HttpPlugin, install } from './plugin'
// 表单管理hook
export { useForm } from './useForm'

export {
  HTTP_CLIENT_KEY,
  HTTP_CONFIG_KEY,
  injectHttpClient,
  injectHttpConfig,
  provideHttpClient,
  useHttp as useHttpWithInjection,
  usePagination,
  useResource,
} from './useHttp'

export {
  useDelete,
  useMutation,
  usePatch,
  usePost,
  usePut,
} from './useMutation'

export { useQuery } from './useQuery'

// Vue Composition API Hooks
export { useAsyncRequest, useRequest } from './useRequest'

// 资源管理hook
export { useResource as useSimpleResource } from './useResource'

// 简化的HTTP hooks
export {
  useGet,
  useDelete as useSimpleDelete,
  usePatch as useSimplePatch,
  usePost as useSimplePost,
  usePut as useSimplePut,
} from './useSimpleHttp'
