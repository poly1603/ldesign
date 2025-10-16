/**
 * 缓存 Hook
 * 
 * @description
 * 提供缓存功能，支持内存缓存、LRU缓存、函数缓存等。
 * 适用于数据缓存、计算结果缓存、API响应缓存等场景。
 */

import { ref, computed, onUnmounted, getCurrentInstance, type Ref, type ComputedRef } from 'vue'
import { MemoryCache, LRUCache, memoize, type CacheOptions } from '../utils/cache'

/**
 * 缓存 Hook 配置
 */
export interface UseCacheOptions extends CacheOptions {
  /** 缓存键前缀 */
  keyPrefix?: string
  /** 是否自动清理过期缓存 */
  autoCleanup?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 缓存 Hook 返回值
 */
export interface UseCacheReturn<T = any> {
  /** 缓存实例 */
  cache: MemoryCache<T>
  /** 缓存大小 */
  size: ComputedRef<number>
  /** 设置缓存 */
  set: (key: string, value: T, ttl?: number) => void
  /** 获取缓存 */
  get: (key: string) => T | undefined
  /** 检查缓存是否存在 */
  has: (key: string) => boolean
  /** 删除缓存 */
  delete: (key: string) => boolean
  /** 清空缓存 */
  clear: () => void
  /** 获取所有缓存键 */
  keys: () => string[]
  /** 获取所有缓存值 */
  values: () => T[]
  /** 清理过期缓存 */
  cleanup: () => void
  /** 获取缓存统计信息 */
  stats: () => ReturnType<MemoryCache<T>['stats']>
}

/**
 * 缓存 Hook
 * 
 * @param options 配置选项
 * @returns 缓存操作方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useCache } from '@ldesign/shared'
 * 
 * const { set, get, has, clear, size } = useCache({
 *   defaultTTL: 5 * 60 * 1000, // 5分钟
 *   maxSize: 100,
 *   autoCleanup: true
 * })
 * 
 * // 设置缓存
 * set('user:1', { id: 1, name: 'John' })
 * 
 * // 获取缓存
 * const user = get('user:1')
 * 
 * // 检查缓存
 * if (has('user:1')) {
 *    * }
 * 
 * // 缓存大小
 *  * </script>
 * ```
 */
export function useCache<T = any>(options: UseCacheOptions = {}): UseCacheReturn<T> {
  const {
    keyPrefix = '',
    autoCleanup = false,
    cleanupInterval = 5 * 60 * 1000, // 5分钟
    ...cacheOptions
  } = options
  
  const cache = new MemoryCache<T>(cacheOptions)
  const size = computed(() => cache.size())
  
  // 自动清理定时器
  let cleanupTimer: NodeJS.Timeout | null = null
  
  if (autoCleanup) {
    cleanupTimer = setInterval(() => {
      cache.cleanup()
    }, cleanupInterval)
  }
  
  // 组件卸载时清理定时器
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (cleanupTimer) {
        clearInterval(cleanupTimer)
        cleanupTimer = null
      }
    })
  }
  
  // 包装方法，添加键前缀
  const addPrefix = (key: string) => keyPrefix ? `${keyPrefix}:${key}` : key
  
  return {
    cache,
    size,
    set: (key: string, value: T, ttl?: number) => cache.set(addPrefix(key), value, ttl),
    get: (key: string) => cache.get(addPrefix(key)),
    has: (key: string) => cache.has(addPrefix(key)),
    delete: (key: string) => cache.delete(addPrefix(key)),
    clear: () => cache.clear(),
    keys: () => cache.keys().map(key => keyPrefix ? key.replace(`${keyPrefix}:`, '') : key),
    values: () => cache.values(),
    cleanup: () => cache.cleanup(),
    stats: () => cache.stats(),
  }
}

/**
 * LRU 缓存 Hook
 * 
 * @param maxSize 最大缓存数量
 * @param defaultTTL 默认过期时间
 * @returns LRU 缓存操作方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useLRUCache } from '@ldesign/shared'
 * 
 * const { set, get, size } = useLRUCache(50, 10 * 60 * 1000) // 最多50个，10分钟过期
 * 
 * // 使用方式与 useCache 相同
 * set('key1', 'value1')
 * const value = get('key1')
 * </script>
 * ```
 */
export function useLRUCache<T = any>(
  maxSize: number = 100,
  defaultTTL?: number
): UseCacheReturn<T> {
  return useCache<T>({
    maxSize,
    defaultTTL,
    enableLRU: true,
  })
}

/**
 * 函数缓存 Hook
 * 
 * @param fn 要缓存的函数
 * @param options 缓存配置
 * @returns 缓存后的函数
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useMemoize } from '@ldesign/shared'
 * 
 * // 缓存计算结果
 * const expensiveCalculation = (a: number, b: number) => {
 *    *   return a * b + Math.random()
 * }
 * 
 * const memoizedFn = useMemoize(expensiveCalculation, {
 *   ttl: 60 * 1000, // 1分钟
 *   maxSize: 10
 * })
 * 
 * // 第一次调用会执行函数
 * const result1 = memoizedFn(2, 3)
 * // 第二次调用相同参数会返回缓存结果
 * const result2 = memoizedFn(2, 3)
 * </script>
 * ```
 */
export function useMemoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    key?: (...args: Parameters<T>) => string
    ttl?: number
    maxSize?: number
  } = {}
): T {
  return memoize(fn, options)
}

/**
 * 异步函数缓存 Hook
 * 
 * @param asyncFn 要缓存的异步函数
 * @param options 缓存配置
 * @returns 缓存后的异步函数和缓存控制方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncMemoize } from '@ldesign/shared'
 * 
 * const fetchUser = async (id: number) => {
 *   const response = await fetch(`/api/users/${id}`)
 *   return response.json()
 * }
 * 
 * const { memoizedFn: getCachedUser, invalidate, clear } = useAsyncMemoize(fetchUser, {
 *   ttl: 5 * 60 * 1000, // 5分钟
 *   key: (id) => `user:${id}`
 * })
 * 
 * // 使用缓存的异步函数
 * const user = await getCachedUser(1)
 * 
 * // 清除特定缓存
 * invalidate(1)
 * 
 * // 清除所有缓存
 * clear()
 * </script>
 * ```
 */
export function useAsyncMemoize<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: {
    key?: (...args: Parameters<T>) => string
    ttl?: number
    maxSize?: number
  } = {}
): {
  memoizedFn: T
  invalidate: (...args: Parameters<T>) => void
  clear: () => void
  cache: MemoryCache
} {
  const cache = new MemoryCache({
    defaultTTL: options.ttl,
    maxSize: options.maxSize || 100,
  })
  
  const keyGenerator = options.key || ((...args) => JSON.stringify(args))
  
  const memoizedFn = (async (...args: Parameters<T>) => {
    const cacheKey = keyGenerator(...args)
    
    // 尝试从缓存获取
    const cachedResult = cache.get(cacheKey)
    if (cachedResult !== undefined) {
      return cachedResult
    }
    
    // 执行异步函数
    try {
      const result = await asyncFn(...args)
      cache.set(cacheKey, result)
      return result
    } catch (error) {
      // 不缓存错误结果
      throw error
    }
  }) as T
  
  const invalidate = (...args: Parameters<T>) => {
    const cacheKey = keyGenerator(...args)
    cache.delete(cacheKey)
  }
  
  const clear = () => {
    cache.clear()
  }
  
  return {
    memoizedFn,
    invalidate,
    clear,
    cache,
  }
}

/**
 * 响应式缓存 Hook
 * 
 * @param key 缓存键
 * @param defaultValue 默认值
 * @param options 配置选项
 * @returns 响应式缓存值和操作方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useReactiveCache } from '@ldesign/shared'
 * 
 * const { value, set, remove, exists } = useReactiveCache('user-settings', {
 *   theme: 'light',
 *   language: 'zh-CN'
 * })
 * 
 * // 响应式的缓存值
 *  // 'light'
 * 
 * // 更新缓存
 * set({ theme: 'dark', language: 'en-US' })
 * 
 * // 检查缓存是否存在
 * if (exists.value) {
 *    * }
 * </script>
 * ```
 */
export function useReactiveCache<T>(
  key: string,
  defaultValue: T,
  options: UseCacheOptions = {}
): {
  value: Ref<T>
  set: (newValue: T, ttl?: number) => void
  remove: () => void
  exists: ComputedRef<boolean>
  cache: MemoryCache<T>
} {
  const { cache } = useCache<T>(options)
  
  const value = ref<T>(cache.get(key) ?? defaultValue) as Ref<T>
  const exists = computed(() => cache.has(key))
  
  const set = (newValue: T, ttl?: number) => {
    cache.set(key, newValue, ttl)
    value.value = newValue
  }
  
  const remove = () => {
    cache.delete(key)
    value.value = defaultValue
  }
  
  return {
    value,
    set,
    remove,
    exists,
    cache,
  }
}
