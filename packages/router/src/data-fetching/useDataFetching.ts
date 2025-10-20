/**
 * 数据预取组合式API
 * @module useDataFetching
 */

import type {
  ComputedRef,
  Ref,
  WatchStopHandle
} from 'vue';
import type { RouteLocationNormalizedLoaded } from '../types'
import type {
  DataFetchConfig, 
  DataFetchingManager, 
  DataFetchState} from './DataFetchingManager';
import { 
  computed, 
  inject, 
  onMounted, 
  onUnmounted, 
  ref, 
  watch
} from 'vue'
import { useRoute } from '../composables'
import {
  DATA_FETCHING_KEY 
} from './DataFetchingManager'

/**
 * 数据预取钩子选项
 */
export interface UseDataFetchingOptions extends Partial<DataFetchConfig> {
  /** 是否立即获取 */
  immediate?: boolean
  /** 是否监听路由变化 */
  watchRoute?: boolean
  /** 是否监听查询参数变化 */
  watchQuery?: boolean
  /** 是否监听路径参数变化 */
  watchParams?: boolean
  /** 自定义参数 */
  params?: Record<string, any>
  /** 转换函数 */
  transform?: (data: any) => any
  /** 默认值 */
  defaultValue?: any
  /** 是否保持之前的数据 */
  keepPreviousData?: boolean
}

/**
 * 数据预取返回值
 */
export interface UseDataFetchingReturn<T = any> {
  /** 数据 */
  data: Ref<T | null>
  /** 是否加载中 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 是否从缓存加载 */
  fromCache: Ref<boolean>
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 清除缓存 */
  clearCache: () => void
  /** 预获取 */
  prefetch: (route?: RouteLocationNormalizedLoaded) => Promise<void>
  /** 获取状态 */
  getState: () => DataFetchState | undefined
  /** 是否准备就绪 */
  isReady: ComputedRef<boolean>
  /** 是否有错误 */
  hasError: ComputedRef<boolean>
  /** 是否为空 */
  isEmpty: ComputedRef<boolean>
}

/**
 * 使用数据预取
 */
export function useDataFetching<T = any>(
  key: string,
  fetcher: (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => Promise<T>,
  options: UseDataFetchingOptions = {}
): UseDataFetchingReturn<T> {
  const route = useRoute()
  const manager = inject<DataFetchingManager>(DATA_FETCHING_KEY)

  if (!manager) {
    throw new Error('DataFetchingManager not found. Did you forget to install the plugin?')
  }

  // 响应式状态
  const data = ref<T | null>(options.defaultValue ?? null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const fromCache = ref(false)
  const previousData = ref<T | null>(null)

  // 计算属性
  const isReady = computed(() => !loading.value && !error.value && data.value !== null)
  const hasError = computed(() => error.value !== null)
  const isEmpty = computed(() => {
    if (data.value === null || data.value === undefined) {
      return true
    }
    if (Array.isArray(data.value)) {
      return data.value.length === 0
    }
    if (typeof data.value === 'object') {
      return Object.keys(data.value).length === 0
    }
    return false
  })

  // 注册数据获取配置
  const registerConfig = () => {
    const config: DataFetchConfig = {
      fetcher: async (route, params) => {
        const result = await fetcher(route as RouteLocationNormalizedLoaded, params)
        return options.transform ? options.transform(result) : result
      },
      cacheKey: options.cacheKey,
      cacheDuration: options.cacheDuration,
      fetchOnClient: options.fetchOnClient,
      fetchOnServer: options.fetchOnServer,
      retryCount: options.retryCount,
      retryDelay: options.retryDelay,
      timeout: options.timeout,
      parallel: options.parallel,
      dependencies: options.dependencies,
      onError: (err, route) => {
        error.value = err
        if (options.onError) {
          options.onError(err, route)
        }
      },
      onSuccess: (result, route) => {
        // 保存之前的数据
        if (options.keepPreviousData && data.value !== null) {
          previousData.value = data.value
        }
        
        data.value = result
        error.value = null
        
        if (options.onSuccess) {
          options.onSuccess(result, route)
        }
      }
    }

    manager.register(key, config)
  }

  // 获取数据
  const fetchData = async (customRoute?: RouteLocationNormalizedLoaded) => {
    const targetRoute = customRoute || route
    loading.value = true
    error.value = null

    try {
      const result = await manager.fetch<T>(key, targetRoute, options.params)
      
      // 获取状态
      const state = manager.getState(key)
      if (state) {
        fromCache.value = state.fromCache
      }

      // 应用转换
      if (options.transform) {
        data.value = options.transform(result)
      } else {
        data.value = result
      }
    } catch (err) {
      error.value = err as Error
      
      // 如果启用了保持之前的数据，恢复
      if (options.keepPreviousData && previousData.value !== null) {
        data.value = previousData.value
      }
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const refresh = async () => {
    await manager.refresh(key, route, options.params)
    await fetchData()
  }

  // 清除缓存
  const clearCache = () => {
    manager.clearCache(key)
  }

  // 预获取
  const prefetch = async (customRoute?: RouteLocationNormalizedLoaded) => {
    const targetRoute = customRoute || route
    await manager.prefetch(key, targetRoute, options.params)
  }

  // 获取状态
  const getState = () => {
    return manager.getState(key)
  }

  // 监听器列表
  const watchers: WatchStopHandle[] = []

  // 设置监听器
  const setupWatchers = () => {
    // 监听路由变化
    if (options.watchRoute !== false) {
      const routeWatcher = watch(
        () => route.path,
        () => {
          fetchData()
        }
      )
      watchers.push(routeWatcher)
    }

    // 监听查询参数变化
    if (options.watchQuery) {
      const queryWatcher = watch(
        () => route.query,
        () => {
          fetchData()
        },
        { deep: true }
      )
      watchers.push(queryWatcher)
    }

    // 监听路径参数变化
    if (options.watchParams) {
      const paramsWatcher = watch(
        () => route.params,
        () => {
          fetchData()
        },
        { deep: true }
      )
      watchers.push(paramsWatcher)
    }

    // 监听自定义参数变化
    if (options.params) {
      const customParamsWatcher = watch(
        () => options.params,
        () => {
          fetchData()
        },
        { deep: true }
      )
      watchers.push(customParamsWatcher)
    }
  }

  // 组件挂载时
  onMounted(() => {
    registerConfig()
    
    if (options.immediate !== false) {
      fetchData()
    }

    setupWatchers()
  })

  // 组件卸载时
  onUnmounted(() => {
    // 停止所有监听器
    watchers.forEach(stop => stop())
  })

  return {
    data,
    loading,
    error,
    fromCache,
    refresh,
    clearCache,
    prefetch,
    getState,
    isReady,
    hasError,
    isEmpty
  }
}

/**
 * 使用多个数据预取
 */
export function useMultipleDataFetching(
  configs: Record<string, {
    fetcher: (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => Promise<any>
    options?: UseDataFetchingOptions
  }>
): Record<string, UseDataFetchingReturn> {
  const results: Record<string, UseDataFetchingReturn> = {}

  Object.entries(configs).forEach(([key, config]) => {
    results[key] = useDataFetching(key, config.fetcher, config.options || {})
  })

  return results
}

/**
 * 使用延迟数据预取
 */
export function useLazyDataFetching<T = any>(
  key: string,
  fetcher: (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => Promise<T>,
  options: UseDataFetchingOptions = {}
): UseDataFetchingReturn<T> & { execute: () => Promise<void> } {
  const result = useDataFetching(key, fetcher, {
    ...options,
    immediate: false
  })

  const execute = async () => {
    await result.refresh()
  }

  return {
    ...result,
    execute
  }
}

/**
 * 使用分页数据预取
 */
export interface UsePaginatedDataFetchingOptions extends UseDataFetchingOptions {
  /** 初始页码 */
  initialPage?: number
  /** 每页数量 */
  pageSize?: number
  /** 总数字段名 */
  totalField?: string
  /** 数据字段名 */
  dataField?: string
}

export function usePaginatedDataFetching<T = any>(
  key: string,
  fetcher: (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => Promise<{
    data: T[]
    total: number
    page: number
    pageSize: number
  }>,
  options: UsePaginatedDataFetchingOptions = {}
): UseDataFetchingReturn<T[]> & {
  /** 当前页码 */
  page: Ref<number>
  /** 每页数量 */
  pageSize: Ref<number>
  /** 总数 */
  total: Ref<number>
  /** 总页数 */
  totalPages: ComputedRef<number>
  /** 是否有下一页 */
  hasNextPage: ComputedRef<boolean>
  /** 是否有上一页 */
  hasPreviousPage: ComputedRef<boolean>
  /** 下一页 */
  nextPage: () => Promise<void>
  /** 上一页 */
  previousPage: () => Promise<void>
  /** 跳转到页 */
  goToPage: (page: number) => Promise<void>
  /** 设置每页数量 */
  setPageSize: (size: number) => Promise<void>
} {
  const page = ref(options.initialPage || 1)
  const pageSize = ref(options.pageSize || 20)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPreviousPage = computed(() => page.value > 1)

  const paginatedFetcher = async (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => {
    const result = await fetcher(route, {
      ...params,
      page: page.value,
      pageSize: pageSize.value
    })

    total.value = result.total
    return result.data
  }

  const result = useDataFetching<T[]>(key, paginatedFetcher, options)

  const nextPage = async () => {
    if (hasNextPage.value) {
      page.value++
      await result.refresh()
    }
  }

  const previousPage = async () => {
    if (hasPreviousPage.value) {
      page.value--
      await result.refresh()
    }
  }

  const goToPage = async (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages.value) {
      page.value = targetPage
      await result.refresh()
    }
  }

  const setPageSize = async (size: number) => {
    pageSize.value = size
    page.value = 1
    await result.refresh()
  }

  return {
    ...result,
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    setPageSize
  }
}

/**
 * 使用无限滚动数据预取
 */
export interface UseInfiniteDataFetchingOptions extends UseDataFetchingOptions {
  /** 初始页码 */
  initialPage?: number
  /** 每页数量 */
  pageSize?: number
  /** 是否反向（从底部加载） */
  reverse?: boolean
}

export function useInfiniteDataFetching<T = any>(
  key: string,
  fetcher: (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => Promise<{
    data: T[]
    hasMore: boolean
    nextCursor?: string | number
  }>,
  options: UseInfiniteDataFetchingOptions = {}
): UseDataFetchingReturn<T[]> & {
  /** 加载更多 */
  loadMore: () => Promise<void>
  /** 是否有更多 */
  hasMore: Ref<boolean>
  /** 是否加载中 */
  loadingMore: Ref<boolean>
  /** 重置 */
  reset: () => Promise<void>
  /** 所有项目 */
  items: Ref<T[]>
} {
  const items = ref<T[]>([])
  const hasMore = ref(true)
  const loadingMore = ref(false)
  const nextCursor = ref<string | number | undefined>()

  const infiniteFetcher = async (route: RouteLocationNormalizedLoaded, params?: Record<string, any>) => {
    const result = await fetcher(route, {
      ...params,
      cursor: nextCursor.value
    })

    hasMore.value = result.hasMore
    nextCursor.value = result.nextCursor

    if (options.reverse) {
      items.value = [...result.data, ...items.value]
    } else {
      items.value = [...items.value, ...result.data]
    }

    return items.value
  }

  const result = useDataFetching<T[]>(key, infiniteFetcher, {
    ...options,
    defaultValue: []
  })

  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value) {
      return
    }

    loadingMore.value = true
    try {
      await result.refresh()
    } finally {
      loadingMore.value = false
    }
  }

  const reset = async () => {
    items.value = []
    hasMore.value = true
    nextCursor.value = undefined
    await result.refresh()
  }

  return {
    ...result,
    loadMore,
    hasMore,
    loadingMore,
    reset,
    items: computed(() => items.value)
  }
}