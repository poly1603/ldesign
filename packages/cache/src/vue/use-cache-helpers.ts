import type { SerializableValue } from '../types'
import { computed } from 'vue'

import { useCache } from './use-cache'

/**
 * 列表缓存组合式函数
 */
export function useCacheList<T extends SerializableValue = SerializableValue>(
  key: string,
  defaultValue: T[] = [],
  options?: { ttl?: number, immediate?: boolean },
) {
  const { useReactiveCache } = useCache()
  const cache = useReactiveCache<T[]>(key, defaultValue)
  
  return {
    list: cache.value,
    loading: cache.loading,
    error: cache.error,
    exists: cache.exists,
    
    // 列表操作方法
    add: async (item: T) => {
      const current = cache.value.value || []
      await cache.set([...current, item], options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    remove: async (index: number) => {
      const current = cache.value.value || []
      const newList = current.filter((_, i) => i !== index)
      await cache.set(newList, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    removeItem: async (item: T) => {
      const current = cache.value.value || []
      const newList = current.filter(i => i !== item)
      await cache.set(newList, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    update: async (index: number, item: T) => {
      const current = cache.value.value || []
      const newList = [...current]
      newList[index] = item
      await cache.set(newList, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    insert: async (index: number, item: T) => {
      const current = cache.value.value || []
      const newList = [...current]
      newList.splice(index, 0, item)
      await cache.set(newList, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    clear: async () => {
      await cache.set([], options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    refresh: cache.refresh,
    
    // 便捷的计算属性
    length: computed(() => cache.value.value?.length || 0),
    isEmpty: computed(() => (cache.value.value?.length || 0) === 0),
    first: computed(() => cache.value.value?.[0] || null),
    last: computed(() => {
      const list = cache.value.value
      return list && list.length > 0 ? list[list.length - 1] : null
    }),
  }
}

/**
 * 对象缓存组合式函数
 */
export function useCacheObject<T extends Record<string, SerializableValue> = Record<string, SerializableValue>>(
  key: string,
  defaultValue: T = {} as T,
  options?: { ttl?: number, immediate?: boolean },
) {
  const { useReactiveCache } = useCache()
  const cache = useReactiveCache<T>(key, defaultValue)
  
  return {
    object: cache.value,
    loading: cache.loading,
    error: cache.error,
    exists: cache.exists,
    
    // 对象操作方法
    setProperty: async <K extends keyof T>(prop: K, value: T[K]) => {
      const current = cache.value.value || {} as T
      const newObject = { ...current, [prop]: value }
      await cache.set(newObject, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    removeProperty: async <K extends keyof T>(prop: K) => {
      const current = cache.value.value || {} as T
      const newObject = { ...current }
      delete newObject[prop]
      await cache.set(newObject, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    merge: async (updates: Partial<T>) => {
      const current = cache.value.value || {} as T
      const newObject = { ...current, ...updates }
      await cache.set(newObject, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    clear: async () => {
      await cache.set({} as T, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    refresh: cache.refresh,
    
    // 便捷的计算属性
    keys: computed(() => Object.keys(cache.value.value || {})),
    values: computed(() => Object.values(cache.value.value || {})),
    entries: computed(() => Object.entries(cache.value.value || {})),
    isEmpty: computed(() => Object.keys(cache.value.value || {}).length === 0),
    size: computed(() => Object.keys(cache.value.value || {}).length),
  }
}

/**
 * 计数器缓存组合式函数
 */
export function useCacheCounter(
  key: string,
  defaultValue: number = 0,
  options?: { ttl?: number, immediate?: boolean, min?: number, max?: number },
) {
  const { useReactiveCache } = useCache()
  const cache = useReactiveCache<number>(key, defaultValue)
  
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = options || {}
  
  return {
    count: cache.value,
    loading: cache.loading,
    error: cache.error,
    exists: cache.exists,
    
    // 计数器操作方法
    increment: async (step: number = 1) => {
      const current = cache.value.value || 0
      const newValue = Math.min(max, current + step)
      await cache.set(newValue, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    decrement: async (step: number = 1) => {
      const current = cache.value.value || 0
      const newValue = Math.max(min, current - step)
      await cache.set(newValue, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    reset: async () => {
      await cache.set(defaultValue, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    set: async (value: number) => {
      const clampedValue = Math.max(min, Math.min(max, value))
      await cache.set(clampedValue, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    refresh: cache.refresh,
    
    // 便捷的计算属性
    isAtMin: computed(() => (cache.value.value || 0) <= min),
    isAtMax: computed(() => (cache.value.value || 0) >= max),
    isZero: computed(() => (cache.value.value || 0) === 0),
    isPositive: computed(() => (cache.value.value || 0) > 0),
    isNegative: computed(() => (cache.value.value || 0) < 0),
  }
}

/**
 * 布尔值缓存组合式函数
 */
export function useCacheBoolean(
  key: string,
  defaultValue: boolean = false,
  options?: { ttl?: number, immediate?: boolean },
) {
  const { useReactiveCache } = useCache()
  const cache = useReactiveCache<boolean>(key, defaultValue)
  
  return {
    value: cache.value,
    loading: cache.loading,
    error: cache.error,
    exists: cache.exists,
    
    // 布尔值操作方法
    toggle: async () => {
      const current = cache.value.value || false
      await cache.set(!current, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    setTrue: async () => {
      await cache.set(true, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    setFalse: async () => {
      await cache.set(false, options?.ttl ? { ttl: options.ttl } : undefined)
    },
    
    refresh: cache.refresh,
    
    // 便捷的计算属性
    isTrue: computed(() => cache.value.value === true),
    isFalse: computed(() => cache.value.value === false),
  }
}

/**
 * 异步数据缓存组合式函数
 */
export function useCacheAsync<T extends SerializableValue = SerializableValue>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { 
    ttl?: number
    immediate?: boolean
    refreshInterval?: number
    staleWhileRevalidate?: boolean
  },
) {
  const { useReactiveCache } = useCache()
  const cache = useReactiveCache<T>(key)
  
  let refreshTimer: number | undefined
  
  const fetchData = async (forceRefresh: boolean = false) => {
    try {
      // 如果启用了 stale-while-revalidate 且有缓存数据，先返回缓存数据
      if (options?.staleWhileRevalidate && !forceRefresh && cache.value.value !== null) {
        // 异步更新数据
        fetcher().then((data) => {
          cache.set(data, options?.ttl ? { ttl: options.ttl } : undefined)
        }).catch(console.error)
        return cache.value.value
      }
      
      const data = await fetcher()
      await cache.set(data, options?.ttl ? { ttl: options.ttl } : undefined)
      return data
    }
    catch (error) {
      console.error('Failed to fetch data:', error)
      throw error
    }
  }
  
  // 自动刷新
  if (options?.refreshInterval) {
    refreshTimer = window.setInterval(() => {
      fetchData(true).catch(console.error)
    }, options.refreshInterval)
  }
  
  // 初始加载
  if (options?.immediate !== false) {
    fetchData().catch(console.error)
  }
  
  return {
    data: cache.value,
    loading: cache.loading,
    error: cache.error,
    exists: cache.exists,
    
    // 异步操作方法
    fetch: async () => fetchData(true),
    refresh: async () => fetchData(true),
    
    // 清理函数
    cleanup: () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = undefined
      }
    },
  }
}
