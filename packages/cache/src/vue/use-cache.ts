import type { ComputedRef } from 'vue'
import type { CacheStats, SetOptions, UseCacheOptions } from '../types'
import { computed, onUnmounted, ref } from 'vue'
import { CacheManager } from '../core/cache-manager'

/**
 * 响应式缓存返回类型
 */
export interface ReactiveCache<T> {
  /** 缓存值 */
  value: ComputedRef<T | null>
  /** 是否正在加载 */
  loading: ComputedRef<boolean>
  /** 错误信息 */
  error: ComputedRef<Error | null>
  /** 设置缓存值 */
  set: (value: T, options?: SetOptions) => Promise<void>
  /** 刷新缓存 */
  refresh: () => Promise<void>
  /** 移除缓存 */
  remove: () => Promise<void>
  /** 是否存在 */
  exists: ComputedRef<boolean>
}

/**
 * useCache 返回类型
 *
 * 提供完整的缓存管理功能，包括基础操作、统计信息、状态管理和响应式缓存
 */
export interface UseCacheReturn {
  // 缓存操作方法
  /** 设置缓存项 */
  set: <T = unknown>(key: string, value: T, options?: SetOptions) => Promise<void>
  /** 获取缓存项 */
  get: <T = unknown>(key: string) => Promise<T | null>
  /** 移除缓存项 */
  remove: (key: string) => Promise<void>
  /** 清空所有缓存 */
  clear: () => Promise<void>
  /** 检查缓存项是否存在 */
  has: (key: string) => Promise<boolean>
  /** 获取所有缓存键 */
  keys: () => Promise<string[]>
  /** 清理过期缓存 */
  cleanup: () => Promise<void>

  // 统计信息
  /** 获取缓存统计信息 */
  getStats: () => Promise<CacheStats>
  /** 刷新统计信息 */
  refreshStats: () => Promise<void>
  /** 响应式统计信息 */
  stats: ComputedRef<CacheStats | null>

  // 状态管理
  /** 是否正在加载 */
  loading: ComputedRef<boolean>
  /** 错误信息 */
  error: ComputedRef<Error | null>
  /** 是否已准备就绪 */
  isReady: ComputedRef<boolean>
  /** 是否有错误 */
  hasError: ComputedRef<boolean>

  // 响应式缓存
  /** 创建响应式缓存 */
  useReactiveCache: <T = unknown>(key: string, defaultValue?: T) => ReactiveCache<T>

  // 缓存管理器实例
  /** 缓存管理器实例 */
  manager: CacheManager
}

/**
 * Vue 3 缓存组合式函数
 */
export function useCache(options?: UseCacheOptions): UseCacheReturn {
  // 创建缓存管理器实例
  const cacheManager = new CacheManager(options)

  // 响应式状态
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const stats = ref<CacheStats | null>(null)

  /**
   * 设置缓存项
   */
  const set = async <T = any>(
    key: string,
    value: T,
    setOptions?: SetOptions,
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await cacheManager.set(key, value, setOptions)
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 获取缓存项
   */
  const get = async <T = any>(key: string): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      return await cacheManager.get<T>(key)
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 删除缓存项
   */
  const remove = async (key: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await cacheManager.remove(key)
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 清空缓存
   */
  const clear = async (
    engine?: import('../types').StorageEngine,
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await cacheManager.clear(engine)
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 检查键是否存在
   */
  const has = async (key: string): Promise<boolean> => {
    try {
      return await cacheManager.has(key)
    }
    catch (err) {
      error.value = err as Error
      return false
    }
  }

  /**
   * 获取所有键名
   */
  const keys = async (
    engine?: import('../types').StorageEngine,
  ): Promise<string[]> => {
    try {
      return await cacheManager.keys(engine)
    }
    catch (err) {
      error.value = err as Error
      return []
    }
  }

  /**
   * 获取缓存统计
   */
  const getStats = async (): Promise<CacheStats> => {
    try {
      const result = await cacheManager.getStats()
      stats.value = result
      return result
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
  }

  /**
   * 刷新统计信息
   */
  const refreshStats = async (): Promise<void> => {
    try {
      stats.value = await cacheManager.getStats()
    }
    catch (err) {
      error.value = err as Error
    }
  }

  /**
   * 清理过期项
   */
  const cleanup = async (): Promise<void> => {
    try {
      await cacheManager.cleanup()
      await refreshStats() // 更新统计信息
    }
    catch (err) {
      error.value = err as Error
    }
  }

  /**
   * 创建响应式缓存
   *
   * 提供响应式的缓存值管理，支持自动加载、保存和错误处理
   *
   * @template T - 缓存值的类型
   * @param key - 缓存键
   * @param defaultValue - 默认值
   * @returns 响应式缓存对象
   *
   * @example
   * ```typescript
   * const userCache = useReactiveCache<User>('user:123', { name: '', age: 0 })
   *
   * // 响应式访问缓存值
   * console.log(userCache.value.value) // 当前缓存值
   * console.log(userCache.loading.value) // 是否正在加载
   *
   * // 设置新值
   * await userCache.set({ name: 'John', age: 30 })
   *
   * // 刷新缓存
   * await userCache.refresh()
   * ```
   */
  const useReactiveCache = <T = unknown>(key: string, defaultValue?: T): ReactiveCache<T> => {
    const value = ref<T | null>(defaultValue ?? null)
    const isLoading = ref(false)
    const cacheError = ref<Error | null>(null)

    /**
     * 从缓存加载数据
     */
    const load = async (): Promise<void> => {
      isLoading.value = true
      cacheError.value = null

      try {
        const cached = await get<T>(key)
        value.value = cached !== null ? cached : (defaultValue ?? null)
      }
      catch (err) {
        cacheError.value = err instanceof Error ? err : new Error(String(err))
        value.value = defaultValue ?? null
      }
      finally {
        isLoading.value = false
      }
    }

    /**
     * 保存值到缓存
     */
    const save = async (newValue: T, setOptions?: SetOptions): Promise<void> => {
      isLoading.value = true
      cacheError.value = null

      try {
        await set(key, newValue, setOptions)
        value.value = newValue
      }
      catch (err) {
        cacheError.value = err instanceof Error ? err : new Error(String(err))
        throw err
      }
      finally {
        isLoading.value = false
      }
    }

    /**
     * 从缓存中移除值
     */
    const removeValue = async (): Promise<void> => {
      isLoading.value = true
      cacheError.value = null

      try {
        await remove(key)
        value.value = defaultValue ?? null
      }
      catch (err) {
        cacheError.value = err instanceof Error ? err : new Error(String(err))
        throw err
      }
      finally {
        isLoading.value = false
      }
    }

    // 初始化时加载数据
    if (options?.immediate !== false) {
      load().catch(console.error)
    }

    // 计算属性
    const valueComputed = computed(() => value.value)
    const loadingComputed = computed(() => isLoading.value)
    const errorComputed = computed(() => cacheError.value)
    const existsComputed = computed(() => value.value !== null && value.value !== undefined)

    return {
      value: valueComputed,
      loading: loadingComputed,
      error: errorComputed,
      set: save,
      refresh: load,
      remove: removeValue,
      exists: existsComputed,
    }
  }

  // 组件卸载时清理
  if (options?.cleanupOnUnmount !== false) {
    onUnmounted(async () => {
      try {
        await cacheManager.destroy()
      }
      catch (err) {
        console.error('Failed to cleanup cache manager:', err)
      }
    })
  }

  // 计算属性
  const isReady = computed(() => !loading.value && !error.value)
  const hasError = computed(() => error.value !== null)

  return {
    // 基础方法
    set,
    get,
    remove,
    clear,
    has,
    keys,
    cleanup,

    // 统计信息
    getStats,
    refreshStats,
    stats: computed(() => stats.value),

    // 状态
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isReady,
    hasError,

    // 响应式缓存
    useReactiveCache,

    // 缓存管理器实例
    manager: cacheManager,
  }
}
