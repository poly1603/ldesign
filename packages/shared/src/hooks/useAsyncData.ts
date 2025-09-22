/**
 * 异步数据管理 Hook
 * 
 * @description
 * 提供异步数据的获取、缓存、刷新、错误处理等功能。
 * 支持依赖追踪、自动重新获取、数据转换等高级特性。
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'

/**
 * 异步数据获取函数
 */
export type AsyncDataFetcher<T, P extends any[] = any[]> = (...params: P) => Promise<T>

/**
 * 异步数据配置
 */
export interface AsyncDataConfig<T, P extends any[] = any[]> {
  /** 默认数据 */
  defaultValue?: T
  /** 是否立即执行 */
  immediate?: boolean
  /** 依赖项（当依赖变化时重新获取数据） */
  dependencies?: Ref<any>[]
  /** 数据转换函数 */
  transform?: (data: T) => T
  /** 错误处理函数 */
  onError?: (error: Error) => void
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 重试次数 */
  retry?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 缓存时间（毫秒），0 表示不缓存 */
  cacheTime?: number
  /** 缓存键 */
  cacheKey?: string
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
}

/**
 * 异步数据状态
 */
export interface AsyncDataState<T> {
  /** 数据 */
  data: T | null
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 是否已完成 */
  finished: boolean
  /** 是否被取消 */
  aborted: boolean
  /** 最后更新时间 */
  lastUpdated: Date | null
  /** 是否来自缓存 */
  fromCache: boolean
}

/**
 * 缓存项
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

// 全局缓存
const cache = new Map<string, CacheItem<any>>()

/**
 * 清理过期缓存
 */
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key)
    }
  }
}

// 定期清理缓存
setInterval(cleanExpiredCache, 60000) // 每分钟清理一次

/**
 * 异步数据管理 Hook
 * 
 * @param fetcher - 数据获取函数
 * @param config - 配置选项
 * @returns 异步数据状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const userId = ref(1)
 *     
 *     // 基础用法
 *     const { state, execute, refresh } = useAsyncData(
 *       async () => {
 *         const response = await fetch(`/api/users/${userId.value}`)
 *         return response.json()
 *       },
 *       {
 *         immediate: true,
 *         dependencies: [userId],
 *         cacheTime: 5 * 60 * 1000, // 5分钟缓存
 *         cacheKey: () => `user-${userId.value}`
 *       }
 *     )
 *     
 *     // 带参数的数据获取
 *     const { state: searchState, execute: search } = useAsyncData(
 *       async (query: string, page: number) => {
 *         const response = await fetch(`/api/search?q=${query}&page=${page}`)
 *         return response.json()
 *       },
 *       {
 *         defaultValue: { results: [], total: 0 },
 *         transform: (data) => ({
 *           ...data,
 *           results: data.results.map(item => ({ ...item, processed: true }))
 *         })
 *       }
 *     )
 *     
 *     const handleSearch = (query: string) => {
 *       search(query, 1)
 *     }
 *     
 *     return {
 *       state,
 *       refresh,
 *       searchState,
 *       handleSearch
 *     }
 *   }
 * })
 * ```
 */
export function useAsyncData<T, P extends any[] = any[]>(
  fetcher: AsyncDataFetcher<T, P>,
  config: AsyncDataConfig<T, P> = {}
) {
  const {
    defaultValue = null,
    immediate = false,
    dependencies = [],
    transform,
    onError,
    onSuccess,
    retry = 0,
    retryDelay = 1000,
    cacheTime = 0,
    cacheKey,
    cancelOnUnmount = true,
    debounce = 0,
  } = config

  // 状态
  const data = ref<T | null>(defaultValue)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const finished = ref(false)
  const aborted = ref(false)
  const lastUpdated = ref<Date | null>(null)
  const fromCache = ref(false)

  // 请求控制
  let abortController: AbortController | null = null
  let debounceTimer: NodeJS.Timeout | null = null

  /**
   * 生成缓存键
   */
  const getCacheKey = (...params: P): string => {
    if (typeof cacheKey === 'function') {
      return (cacheKey as any)(...params)
    }
    if (typeof cacheKey === 'string') {
      return cacheKey
    }
    return `async-data-${JSON.stringify(params)}`
  }

  /**
   * 从缓存获取数据
   */
  const getFromCache = (key: string): T | null => {
    if (cacheTime <= 0) return null
    
    const item = cache.get(key)
    if (!item) return null
    
    const now = Date.now()
    if (now > item.expiry) {
      cache.delete(key)
      return null
    }
    
    return item.data
  }

  /**
   * 设置缓存
   */
  const setCache = (key: string, value: T): void => {
    if (cacheTime <= 0) return
    
    cache.set(key, {
      data: value,
      timestamp: Date.now(),
      expiry: Date.now() + cacheTime,
    })
  }

  /**
   * 执行数据获取
   */
  const execute = async (...params: P): Promise<T | null> => {
    // 清除防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    // 如果设置了防抖，延迟执行
    if (debounce > 0) {
      return new Promise((resolve) => {
        debounceTimer = setTimeout(async () => {
          const result = await executeImmediate(...params)
          resolve(result)
        }, debounce)
      })
    }

    return executeImmediate(...params)
  }

  /**
   * 立即执行数据获取
   */
  const executeImmediate = async (...params: P): Promise<T | null> => {
    if (loading.value) return null

    // 检查缓存
    const key = getCacheKey(...params)
    const cachedData = getFromCache(key)
    if (cachedData) {
      data.value = cachedData
      fromCache.value = true
      lastUpdated.value = new Date()
      return cachedData
    }

    // 重置状态
    loading.value = true
    error.value = null
    finished.value = false
    aborted.value = false
    fromCache.value = false

    // 创建新的 AbortController
    abortController = new AbortController()

    let lastError: Error | null = null
    let attempt = 0

    while (attempt <= retry) {
      try {
        // 执行数据获取
        let result = await fetcher(...params)

        // 检查是否被取消
        if (abortController.signal.aborted) {
          aborted.value = true
          return null
        }

        // 数据转换
        if (transform) {
          result = transform(result) as Awaited<T>
        }

        // 更新状态
        data.value = result
        lastUpdated.value = new Date()
        finished.value = true

        // 设置缓存
        setCache(key, result)

        // 执行成功回调
        onSuccess?.(result)

        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        
        // 如果是取消错误，直接返回
        if (lastError.name === 'AbortError') {
          aborted.value = true
          return null
        }

        attempt++
        
        // 如果还有重试次数，等待后重试
        if (attempt <= retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    // 如果所有重试都失败了
    if (lastError) {
      error.value = lastError
      finished.value = true
      onError?.(lastError)
    }

    loading.value = false
    abortController = null
    return null
  }

  /**
   * 刷新数据
   */
  const refresh = async (...params: P): Promise<T | null> => {
    // 清除缓存
    if (cacheKey) {
      const key = getCacheKey(...params)
      cache.delete(key)
    }
    
    return execute(...params)
  }

  /**
   * 取消请求
   */
  const abort = (): void => {
    if (abortController) {
      abortController.abort()
      aborted.value = true
      loading.value = false
    }
    
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  /**
   * 清除数据
   */
  const clear = (): void => {
    data.value = defaultValue
    error.value = null
    finished.value = false
    lastUpdated.value = null
    fromCache.value = false
  }

  /**
   * 设置数据
   */
  const setData = (newData: T): void => {
    data.value = newData
    lastUpdated.value = new Date()
  }

  // 监听依赖变化
  if (dependencies.length > 0) {
    watch(
      dependencies,
      () => {
        if (finished.value || loading.value) {
          execute(...([] as unknown as P))
        }
      },
      { deep: true }
    )
  }

  // 组件挂载时执行
  if (immediate) {
    onMounted(() => {
      execute(...([] as unknown as P))
    })
  }

  // 组件卸载时取消请求
  if (cancelOnUnmount) {
    onUnmounted(() => {
      abort()
    })
  }

  // 计算状态
  const state = computed<AsyncDataState<T>>(() => ({
    data: data.value,
    loading: loading.value,
    error: error.value,
    finished: finished.value,
    aborted: aborted.value,
    lastUpdated: lastUpdated.value,
    fromCache: fromCache.value,
  }))

  return {
    state: state as Ref<AsyncDataState<T>>,
    execute,
    refresh,
    abort,
    clear,
    setData,
  }
}

/**
 * 清除所有缓存
 */
export const clearAllCache = (): void => {
  cache.clear()
}

/**
 * 清除指定缓存
 */
export const clearCache = (key: string): void => {
  cache.delete(key)
}

/**
 * 获取缓存信息
 */
export const getCacheInfo = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  }
}
