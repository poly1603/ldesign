import type { InjectionKey, Ref } from 'vue'
import type { HttpClient, RequestConfig } from '../types'
import { computed, inject, provide, ref } from 'vue'
import {
  useDelete,
  useMutation,
  usePatch,
  usePost,
  usePut,
} from './useMutation'
import { useQuery } from './useQuery'
import { useRequest } from './useRequest'

/**
 * HTTP 客户端注入键
 */
export const HTTP_CLIENT_KEY: InjectionKey<HttpClient> = Symbol('http-client')

/**
 * 全局配置注入键
 */
export const HTTP_CONFIG_KEY: InjectionKey<Ref<RequestConfig>>
  = Symbol('http-config')

/**
 * 提供 HTTP 客户端
 */
export function provideHttpClient(
  client: HttpClient,
  globalConfig?: RequestConfig,
): void {
  provide(HTTP_CLIENT_KEY, client)
  if (globalConfig) {
    provide(HTTP_CONFIG_KEY, ref(globalConfig))
  }
}

/**
 * 注入 HTTP 客户端
 */
export function injectHttpClient(): HttpClient {
  const client = inject(HTTP_CLIENT_KEY)
  if (!client) {
    throw new Error(
      'HTTP client not provided. Please use provideHttpClient() in a parent component.',
    )
  }
  return client as HttpClient
}

/**
 * 注入全局配置
 */
export function injectHttpConfig(): Ref<RequestConfig> {
  return inject(HTTP_CONFIG_KEY, ref({})) as Ref<RequestConfig>
}

/**
 * 主要的 HTTP Hook
 * 自动注入客户端和全局配置
 */
export function useHttp() {
  const client = injectHttpClient()
  const globalConfig = injectHttpConfig()

  /**
   * 合并全局配置
   */
  const mergeConfig = (config: RequestConfig = {}): RequestConfig => {
    return {
      ...globalConfig.value,
      ...config,
      headers: {
        ...globalConfig.value.headers,
        ...config.headers,
      },
    }
  }

  return {
    client,
    globalConfig,

    // 基础请求方法
    request: <T = any>(config: RequestConfig) =>
      client.request<T>(mergeConfig(config)),

    get: <T = any>(url: string, config?: RequestConfig) =>
      client.get<T>(url, mergeConfig(config)),

    post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      client.post<T>(url, data, mergeConfig(config)),

    put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      client.put<T>(url, data, mergeConfig(config)),

    delete: <T = any>(url: string, config?: RequestConfig) =>
      client.delete<T>(url, mergeConfig(config)),

    patch: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      client.patch<T>(url, data, mergeConfig(config)),

    head: <T = any>(url: string, config?: RequestConfig) =>
      client.head<T>(url, mergeConfig(config)),

    options: <T = any>(url: string, config?: RequestConfig) =>
      client.options<T>(url, mergeConfig(config)),

    // Composition API hooks
    useRequest: <T = any>(config: RequestConfig, options?: any) =>
      useRequest<T>(client, ref(mergeConfig(config)), options),

    useQuery: <T = any>(queryKey: any, config: RequestConfig, options?: any) =>
      useQuery<T>(client, queryKey, ref(mergeConfig(config)), options),

    useMutation: <T = any, V = any>(mutationFn: any, options?: any) =>
      useMutation<T, V>(client, mutationFn, options),

    usePost: <T = any, D = any>(url: string, options?: any) =>
      usePost<T, D>(client, url, options),

    usePut: <T = any, D = any>(url: string, options?: any) =>
      usePut<T, D>(client, url, options),

    usePatch: <T = any, D = any>(url: string, options?: any) =>
      usePatch<T, D>(client, url, options),

    useDelete: <T = any>(url: string, options?: any) =>
      useDelete<T>(client, url, options),

    // 客户端控制方法
    cancelAll: (reason?: string) => client.cancelAll(reason),
    clearCache: () => client.clearCache(),
    getActiveRequestCount: () => client.getActiveRequestCount(),
    getConcurrencyStatus: () => client.getConcurrencyStatus(),
  }
}

/**
 * 创建资源 Hook
 * 用于 RESTful API 操作
 *
 * 注意: 这是一个轻量级的资源hook,用于依赖注入场景
 * 如需更完整的功能(loading状态、error处理等),请使用 useResource from './useResource'
 */
export function useResource<T = any>(baseUrl: string) {
  const {
    get,
    post,
    put,
    patch,
    delete: del,
    useQuery,
    useMutation,
  } = useHttp()

  return {
    // 查询操作
    useList: (params?: Record<string, any>, options?: any) =>
      useQuery(
        ['resource-list', baseUrl, params],
        { url: baseUrl, params },
        options,
      ),

    useDetail: (id: string | number, options?: any) =>
      useQuery(
        ['resource-detail', baseUrl, id],
        { url: `${baseUrl}/${id}` },
        options,
      ),

    // 变更操作
    useCreate: (options?: any) =>
      useMutation((data: T) => post<T>(`${baseUrl}`, data), options),

    useUpdate: (options?: any) =>
      useMutation(
        ({ id, data }: { id: string | number, data: Partial<T> }) =>
          put<T>(`${baseUrl}/${id}`, data),
        options,
      ),

    usePatch: (options?: any) =>
      useMutation(
        ({ id, data }: { id: string | number, data: Partial<T> }) =>
          patch<T>(`${baseUrl}/${id}`, data),
        options,
      ),

    useDelete: (options?: any) =>
      useMutation((id: string | number) => del(`${baseUrl}/${id}`), options),

    // 直接调用方法
    list: (params?: Record<string, any>) => get<T[]>(baseUrl, { params }),
    detail: (id: string | number) => get<T>(`${baseUrl}/${id}`),
    create: (data: T) => post<T>(baseUrl, data),
    update: (id: string | number, data: Partial<T>) =>
      put<T>(`${baseUrl}/${id}`, data),
    patch: (id: string | number, data: Partial<T>) =>
      patch<T>(`${baseUrl}/${id}`, data),
    remove: (id: string | number) => del(`${baseUrl}/${id}`),
  }
}

/**
 * 分页查询 Hook
 */
export function usePagination<T = any>(
  baseUrl: string,
  initialPage = 1,
  initialPageSize = 10,
) {
  const page = ref<number>(initialPage)
  const pageSize = ref<number>(initialPageSize)
  const total = ref<number>(0)

  const { useQuery } = useHttp()

  const queryKey = computed(() => [
    'pagination',
    baseUrl,
    page.value,
    pageSize.value,
  ])
  const config = computed(() => ({
    url: baseUrl,
    params: {
      page: page.value,
      pageSize: pageSize.value,
    },
  }))

  const query = useQuery<{
    data: T[]
    total: number
    page: number
    pageSize: number
  }>(queryKey, config.value, {
    onSuccess: (data: {
      data: T[]
      total: number
      page: number
      pageSize: number
    }) => {
      total.value = data.total
    },
  })

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  const nextPage = () => {
    if (hasNextPage.value) {
      page.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      page.value--
    }
  }

  const goToPage = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages.value) {
      page.value = targetPage
    }
  }

  const setPageSize = (newPageSize: number) => {
    pageSize.value = newPageSize
    page.value = 1 // 重置到第一页
  }

  return {
    // 查询状态
    ...query,

    // 分页数据
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,

    // 操作方法
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
  }
}
