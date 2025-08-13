// HTTP Composable (独立版本，不需要依赖注入)
export { useHttp } from './composables/useHttp'
// Vue Plugin
export { HttpPlugin, install } from './plugin'
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

// Vue Types
export type * from '@/types/vue'
