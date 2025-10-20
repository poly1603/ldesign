import type { ComputedRef } from 'vue'
import type { CacheStats, SerializableValue, SetOptions, UseCacheOptions } from '../types'

import { computed, inject, onUnmounted, ref, watch } from 'vue'
import { TIME_INTERVALS } from '../constants/performance'
import { CacheManager } from '../core/cache-manager'

import { CACHE_MANAGER_KEY } from './cache-provider'

/**
 * 响应式缓存返回类型
 */
export interface ReactiveCache<T extends SerializableValue = SerializableValue> {
  /** 缓存值 */
  value: ComputedRef<T | null>
  /** 是否正在加载 */
  loading: ComputedRef<boolean>
  /** 错误信息 */
  error: ComputedRef<Error | null>
  /** 是否存在 */
  exists: ComputedRef<boolean>
  /** 是否为空 */
  isEmpty: ComputedRef<boolean>
  /** 是否有效（非null/undefined） */
  isValid: ComputedRef<boolean>
  /** 是否有错误 */
  hasError: ComputedRef<boolean>
  /** 是否就绪（非加载中且无错误） */
  isReady: ComputedRef<boolean>
  /** 设置缓存值 */
  set: (value: T, options?: SetOptions) => Promise<void>
  /** 设置缓存值（带回调） */
  setWithCallback: (value: T, options?: SetOptions, onSuccess?: () => void, onError?: (error: Error) => void) => Promise<void>
  /** 刷新缓存 */
  refresh: () => Promise<void>
  /** 刷新缓存（带回调） */
  refreshWithCallback: (onSuccess?: () => void, onError?: (error: Error) => void) => Promise<void>
  /** 移除缓存 */
  remove: () => Promise<void>
  /** 启用自动保存，返回停止函数 */
  enableAutoSave: (options?: {
    ttl?: number
    throttle?: number
    debounce?: number
    immediate?: boolean
  }) => () => void
}

/**
 * useCache 返回类型
 *
 * 提供完整的缓存管理功能，包括基础操作、统计信息、状态管理和响应式缓存
 */
export interface UseCacheReturn {
  // 缓存操作方法
  /** 设置缓存项 */
  set: <T extends SerializableValue = SerializableValue>(key: string, value: T, options?: SetOptions) => Promise<void>
  /** 获取缓存项 */
  get: <T extends SerializableValue = SerializableValue>(key: string) => Promise<T | null>
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
  useReactiveCache: <T extends SerializableValue = SerializableValue>(key: string, defaultValue?: T) => ReactiveCache<T>

  // 便捷的组合式函数
  /** 简单值缓存 */
  useCacheValue: <T extends SerializableValue = SerializableValue>(
    key: string,
    defaultValue?: T,
    options?: { ttl?: number, immediate?: boolean }
  ) => {
    value: ComputedRef<T | null>
    loading: ComputedRef<boolean>
    error: ComputedRef<Error | null>
    exists: ComputedRef<boolean>
    isEmpty: ComputedRef<boolean>
    isValid: ComputedRef<boolean>
    set: (value: T) => Promise<void>
    refresh: () => Promise<void>
    remove: () => Promise<void>
  }

  /** 双向绑定缓存 */
  useCacheSync: <T extends SerializableValue = SerializableValue>(
    key: string,
    defaultValue?: T,
    options?: { ttl?: number, throttle?: number }
  ) => {
    value: ComputedRef<T | null>
    loading: ComputedRef<boolean>
    error: ComputedRef<Error | null>
    exists: ComputedRef<boolean>
    refresh: () => Promise<void>
    remove: () => Promise<void>
  }

  // 缓存管理器实例
  /** 缓存管理器实例 */
  manager: CacheManager
}

/**
 * Vue 3 缓存组合式函数
 */
export function useCache(options?: UseCacheOptions): UseCacheReturn {
  // 优先使用由 CacheProvider 注入的全局管理器；若不存在则本地创建
  const injectedManager = inject(CACHE_MANAGER_KEY, null as unknown as CacheManager | null)
  const cacheManager = injectedManager ?? new CacheManager(options)

  // 响应式状态
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const stats = ref<CacheStats | null>(null)

  /**
   * 设置缓存项
   */
  const set = async <T extends SerializableValue = SerializableValue>(
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
  const get = async <T extends SerializableValue = SerializableValue>(key: string): Promise<T | null> => {
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
   *  // 当前缓存值
   *  // 是否正在加载
   *
   * // 设置新值
   * await userCache.set({ name: 'John', age: 30 })
   *
   * // 刷新缓存
   * await userCache.refresh()
   * ```
   */
  const useReactiveCache = <T extends SerializableValue = SerializableValue>(key: string, defaultValue?: T): ReactiveCache<T> => {
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
     * 启用自动保存（带节流和防抖）
     */
    const enableAutoSave = (opts?: {
      ttl?: number
      throttle?: number
      debounce?: number
      immediate?: boolean
    }): (() => void) => {
      const throttleMs = opts?.throttle ?? TIME_INTERVALS.AUTO_SAVE_THROTTLE_DEFAULT
      const debounceMs = opts?.debounce ?? TIME_INTERVALS.AUTO_SAVE_DEBOUNCE_DEFAULT
      let pending = false
      let throttleTimer: ReturnType<typeof setTimeout> | undefined
      let debounceTimer: ReturnType<typeof setTimeout> | undefined
      let lastSaveTime = 0

      const performSave = async (val: T) => {
        try {
          await save(val, opts?.ttl ? { ttl: opts.ttl } : undefined)
          lastSaveTime = Date.now()
        }
        catch (error) {
          console.error('Auto-save failed:', error)
        }
        finally {
          pending = false
        }
      }

      const stop = watch(
        () => value.value,
        (val) => {
          if (val === null || pending) { return }

          // 清除之前的防抖定时器
          if (debounceTimer !== undefined) {
            clearTimeout(debounceTimer)
            debounceTimer = undefined
          }

          // 防抖：延迟执行
          debounceTimer = setTimeout(() => {
            const now = Date.now()
            const timeSinceLastSave = now - lastSaveTime

            // 节流：如果距离上次保存时间太短，延迟执行
            if (timeSinceLastSave < throttleMs) {
              if (throttleTimer !== undefined) {
                clearTimeout(throttleTimer)
              }
              throttleTimer = setTimeout(() => {
                pending = true
                performSave(val as T).catch(console.error)
              }, throttleMs - timeSinceLastSave)
            }
            else {
              // 立即执行
              pending = true
              performSave(val as T).catch(console.error)
            }
          }, debounceMs)
        },
        {
          deep: true,
          immediate: opts?.immediate ?? false,
        },
      )

      return () => {
        stop()
        if (throttleTimer !== undefined) {
          clearTimeout(throttleTimer)
          throttleTimer = undefined
        }
        if (debounceTimer !== undefined) {
          clearTimeout(debounceTimer)
          debounceTimer = undefined
        }
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

    // 扩展的计算属性
    const isEmptyComputed = computed(() => {
      const val = value.value
      if (val === null || val === undefined) { return true }
      if (typeof val === 'string') { return val === '' }
      if (Array.isArray(val)) { return val.length === 0 }
      if (typeof val === 'object') { return Object.keys(val).length === 0 }
      return false
    })

    const isValidComputed = computed(() => value.value !== null && value.value !== undefined)
    const hasErrorComputed = computed(() => cacheError.value !== null)
    const isReadyComputed = computed(() => !isLoading.value && cacheError.value === null)

    // 便捷方法
    const setWithCallback = async (newValue: T, options?: SetOptions, onSuccess?: () => void, onError?: (error: Error) => void) => {
      try {
        await save(newValue, options)
        onSuccess?.()
      }
      catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)))
        throw error
      }
    }

    const refreshWithCallback = async (onSuccess?: () => void, onError?: (error: Error) => void) => {
      try {
        await load()
        onSuccess?.()
      }
      catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)))
        throw error
      }
    }

    return {
      value: valueComputed,
      loading: loadingComputed,
      error: errorComputed,
      exists: existsComputed,
      isEmpty: isEmptyComputed,
      isValid: isValidComputed,
      hasError: hasErrorComputed,
      isReady: isReadyComputed,
      set: save,
      setWithCallback,
      refresh: load,
      refreshWithCallback,
      remove: removeValue,
      enableAutoSave,
    }
  }

  // 组件卸载时清理（仅在本地创建管理器时执行，避免销毁全局实例）
  const createdLocally = !injectedManager
  if (createdLocally && options?.cleanupOnUnmount !== false) {
    onUnmounted(async () => {
      try {
        await cacheManager.destroy()
      }
      catch (err) {
        console.error('Failed to cleanup cache manager:', err)
      }
    })
  }

  // 便捷的组合式函数
  /**
   * 简单值缓存 - 用于缓存单个值
   */
  const useCacheValue = <T extends SerializableValue = SerializableValue>(
    key: string,
    defaultValue?: T,
    options?: { ttl?: number, immediate?: boolean },
  ) => {
    const cache = useReactiveCache<T>(key, defaultValue)

    // 提供更简洁的API
    return {
      value: cache.value,
      loading: cache.loading,
      error: cache.error,
      exists: cache.exists,
      set: async (value: T) => cache.set(value, options?.ttl ? { ttl: options.ttl } : undefined),
      refresh: cache.refresh,
      remove: cache.remove,
      // 便捷的计算属性
      isEmpty: computed(() => {
        const val = cache.value.value
        return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)
      }),
      isValid: computed(() => cache.value.value !== null && cache.value.value !== undefined),
    }
  }

  /**
   * 双向绑定缓存 - 支持v-model
   */
  const useCacheSync = <T extends SerializableValue = SerializableValue>(
    key: string,
    defaultValue?: T,
    options?: { ttl?: number, throttle?: number },
  ) => {
    const cache = useReactiveCache<T>(key, defaultValue)
    const _throttleMs = options?.throttle ?? TIME_INTERVALS.AUTO_SAVE_THROTTLE_DEFAULT

    // 创建可写的计算属性用于双向绑定
    const syncValue = computed({
      get: () => cache.value.value,
      set: (newValue: T | null) => {
        if (newValue !== null) {
          // 使用节流避免频繁写入
          cache.set(newValue, options?.ttl ? { ttl: options.ttl } : undefined)
        }
      },
    })

    return {
      value: syncValue,
      loading: cache.loading,
      error: cache.error,
      exists: cache.exists,
      refresh: cache.refresh,
      remove: cache.remove,
    }
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

    // 便捷的组合式函数
    useCacheValue,
    useCacheSync,

    // 缓存管理器实例
    manager: cacheManager,
  }
}
