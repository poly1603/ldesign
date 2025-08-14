import { ref, computed, onUnmounted, watch } from 'vue'
import type { UseCacheOptions, SetOptions, CacheStats } from '../types'
import { CacheManager } from '../core/cache-manager'

/**
 * Vue 3 缓存组合式函数
 */
export function useCache(options?: UseCacheOptions) {
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
    setOptions?: SetOptions
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await cacheManager.set(key, value, setOptions)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
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
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
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
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空缓存
   */
  const clear = async (
    engine?: import('../types').StorageEngine
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await cacheManager.clear(engine)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查键是否存在
   */
  const has = async (key: string): Promise<boolean> => {
    try {
      return await cacheManager.has(key)
    } catch (err) {
      error.value = err as Error
      return false
    }
  }

  /**
   * 获取所有键名
   */
  const keys = async (
    engine?: import('../types').StorageEngine
  ): Promise<string[]> => {
    try {
      return await cacheManager.keys(engine)
    } catch (err) {
      error.value = err as Error
      return []
    }
  }

  /**
   * 获取缓存统计
   */
  const getStats = async (): Promise<void> => {
    try {
      stats.value = await cacheManager.getStats()
    } catch (err) {
      error.value = err as Error
    }
  }

  /**
   * 清理过期项
   */
  const cleanup = async (): Promise<void> => {
    try {
      await cacheManager.cleanup()
      await getStats() // 更新统计信息
    } catch (err) {
      error.value = err as Error
    }
  }

  /**
   * 响应式缓存值
   */
  const useReactiveCache = <T = any>(key: string, defaultValue?: T) => {
    const value = ref<T | null>(defaultValue || null)
    const isLoading = ref(false)
    const cacheError = ref<Error | null>(null)

    // 初始加载
    const load = async () => {
      isLoading.value = true
      cacheError.value = null

      try {
        const cached = await get<T>(key)
        value.value = cached !== null ? cached : defaultValue || null
      } catch (err) {
        cacheError.value = err as Error
        value.value = defaultValue || null
      } finally {
        isLoading.value = false
      }
    }

    // 保存值
    const save = async (newValue: T, setOptions?: SetOptions) => {
      isLoading.value = true
      cacheError.value = null

      try {
        await set(key, newValue, setOptions)
        value.value = newValue
      } catch (err) {
        cacheError.value = err as Error
        throw err
      } finally {
        isLoading.value = false
      }
    }

    // 删除值
    const removeValue = async () => {
      isLoading.value = true
      cacheError.value = null

      try {
        await remove(key)
        value.value = defaultValue || null
      } catch (err) {
        cacheError.value = err as Error
        throw err
      } finally {
        isLoading.value = false
      }
    }

    // 监听值变化自动保存
    const enableAutoSave = (setOptions?: SetOptions) => {
      return watch(
        value,
        async (newValue, oldValue) => {
          // 跳过初始值设置
          if (oldValue === undefined) return

          if (newValue !== null && newValue !== undefined) {
            try {
              await set(key, newValue, setOptions)
            } catch (err) {
              cacheError.value = err as Error
            }
          }
        },
        { deep: true, flush: 'post' }
      )
    }

    // 初始化时加载数据
    if (options?.immediate !== false) {
      load().catch(console.error)
    }

    return {
      value,
      isLoading,
      error: cacheError,
      load,
      save,
      remove: removeValue,
      enableAutoSave,
    }
  }

  // 组件卸载时清理
  if (options?.cleanupOnUnmount !== false) {
    onUnmounted(async () => {
      try {
        await cacheManager.destroy()
      } catch (err) {
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
