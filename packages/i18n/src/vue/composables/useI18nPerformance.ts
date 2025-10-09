/**
 * I18n 性能优化组合式 API
 * 提供缓存、批量翻译、预加载等性能优化功能
 */

import { computed, ref, watch, onMounted, onUnmounted, inject } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 性能优化选项
 */
export interface PerformanceOptions {
  /** 是否启用本地缓存 */
  enableLocalCache?: boolean
  /** 本地缓存大小限制 */
  localCacheSize?: number
  /** 是否启用批量翻译 */
  enableBatchTranslation?: boolean
  /** 批量翻译的延迟时间（毫秒） */
  batchDelay?: number
  /** 是否启用预加载 */
  enablePreload?: boolean
  /** 预加载的键名列表 */
  preloadKeys?: string[]
}

/**
 * 翻译缓存项
 */
interface CacheItem {
  value: string
  timestamp: number
  locale: string
  params?: Record<string, unknown>
}

/**
 * 批量翻译请求
 */
interface BatchRequest {
  key: string
  params?: Record<string, unknown>
  resolve: (value: string) => void
}

/**
 * 本地性能统计（用于 composable）
 */
interface LocalPerformanceMetrics {
  /** 缓存命中次数 */
  cacheHits: number
  /** 缓存未命中次数 */
  cacheMisses: number
  /** 批量翻译次数 */
  batchTranslations: number
  /** 预加载次数 */
  preloadCount: number
  /** 平均翻译时间 */
  averageTranslationTime: number
}

/**
 * I18n 性能优化组合式 API
 * 
 * @param options 性能优化选项
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useI18nPerformance } from '@ldesign/i18n/vue'
 * 
 * const { t, tBatch, preload, getMetrics } = useI18nPerformance({
 *   enableLocalCache: true,
 *   enableBatchTranslation: true,
 *   preloadKeys: ['common.hello', 'common.goodbye']
 * })
 * 
 * // 使用缓存的翻译
 * const hello = t('common.hello')
 * 
 * // 批量翻译
 * const translations = await tBatch(['key1', 'key2', 'key3'])
 * 
 * // 预加载翻译
 * await preload(['page.title', 'page.description'])
 * </script>
 * ```
 */
export function useI18nPerformance(options: PerformanceOptions = {}) {
  const {
    enableLocalCache = true,
    localCacheSize = 1000,
    enableBatchTranslation = true,
    batchDelay = 10,
    enablePreload = true,
    preloadKeys = []
  } = options

  const i18n = inject(I18nInjectionKey)
  
  if (!i18n) {
    console.warn('useI18nPerformance: I18n plugin not found. Make sure to install the i18n plugin.')
    return createFallbackPerformanceI18n()
  }

  // 本地缓存
  const localCache = ref(new Map<string, CacheItem>())
  
  // 批量翻译队列
  const batchQueue = ref<BatchRequest[]>([])
  let batchTimer: number | null = null
  
  // 性能统计
  const metrics = ref<LocalPerformanceMetrics>({
    cacheHits: 0,
    cacheMisses: 0,
    batchTranslations: 0,
    preloadCount: 0,
    averageTranslationTime: 0
  })

  /**
   * 生成缓存键
   */
  const generateCacheKey = (key: string, params?: Record<string, unknown>, locale?: string): string => {
    const currentLocale = locale || i18n.locale.value
    const paramsStr = params ? JSON.stringify(params) : ''
    return `${currentLocale}:${key}:${paramsStr}`
  }

  /**
   * 从缓存获取翻译
   */
  const getFromCache = (cacheKey: string): string | null => {
    if (!enableLocalCache) return null

    const item = localCache.value.get(cacheKey)
    if (!item) return null

    // 检查缓存是否过期（1小时）
    if (Date.now() - item.timestamp > 3600000) {
      localCache.value.delete(cacheKey)
      return null
    }

    metrics.value.cacheHits++
    return item.value
  }

  /**
   * 设置缓存
   */
  const setCache = (cacheKey: string, value: string, params?: Record<string, unknown>) => {
    if (!enableLocalCache) return

    // 如果缓存已满，删除最旧的项
    if (localCache.value.size >= localCacheSize) {
      const oldestKey = localCache.value.keys().next().value
      if (oldestKey !== undefined) {
        localCache.value.delete(oldestKey)
      }
    }

    localCache.value.set(cacheKey, {
      value,
      timestamp: Date.now(),
      locale: i18n.locale.value,
      params
    })
  }

  /**
   * 优化的翻译函数
   */
  const t = (key: string, params?: Record<string, unknown>): string => {
    const startTime = performance.now()
    
    // 尝试从缓存获取
    const cacheKey = generateCacheKey(key, params)
    const cached = getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    // 缓存未命中，执行翻译
    metrics.value.cacheMisses++
    const result = i18n.t(key, params)
    
    // 设置缓存
    setCache(cacheKey, result, params)
    
    // 更新性能统计
    const duration = performance.now() - startTime
    metrics.value.averageTranslationTime = 
      (metrics.value.averageTranslationTime + duration) / 2

    return result
  }

  /**
   * 批量翻译函数
   */
  const tBatch = (keys: string[], params?: Record<string, unknown>): Promise<Record<string, string>> => {
    return new Promise((resolve) => {
      if (!enableBatchTranslation) {
        // 如果不启用批量翻译，直接逐个翻译
        const results: Record<string, string> = {}
        keys.forEach(key => {
          results[key] = t(key, params)
        })
        resolve(results)
        return
      }

      const results: Record<string, string> = {}
      const pendingKeys: string[] = []

      // 先检查缓存
      keys.forEach(key => {
        const cacheKey = generateCacheKey(key, params)
        const cached = getFromCache(cacheKey)
        
        if (cached) {
          results[key] = cached
        } else {
          pendingKeys.push(key)
        }
      })

      // 如果所有键都在缓存中，直接返回
      if (pendingKeys.length === 0) {
        resolve(results)
        return
      }

      // 添加到批量队列
      let resolvedCount = 0
      pendingKeys.forEach(key => {
        batchQueue.value.push({
          key,
          params,
          resolve: (value: string) => {
            results[key] = value
            resolvedCount++
            if (resolvedCount === pendingKeys.length) {
              resolve(results)
            }
          }
        })
      })

      // 启动批量处理定时器
      if (!batchTimer) {
        batchTimer = window.setTimeout(processBatch, batchDelay)
      }
    })
  }

  /**
   * 处理批量翻译
   */
  const processBatch = () => {
    if (batchQueue.value.length === 0) {
      batchTimer = null
      return
    }

    const currentBatch = [...batchQueue.value]
    batchQueue.value = []
    batchTimer = null

    // 执行批量翻译
    currentBatch.forEach(request => {
      const result = i18n.t(request.key, request.params)
      const cacheKey = generateCacheKey(request.key, request.params)
      setCache(cacheKey, result, request.params)
      request.resolve(result)
    })

    metrics.value.batchTranslations++
  }

  /**
   * 预加载翻译
   */
  const preload = async (keys: string[], params?: Record<string, unknown>): Promise<void> => {
    if (!enablePreload) return

    const translations = await tBatch(keys, params)
    metrics.value.preloadCount += keys.length
    
    console.log(`[I18n Performance] 预加载了 ${keys.length} 个翻译键`)
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    localCache.value.clear()
    console.log('[I18n Performance] 缓存已清除')
  }

  /**
   * 获取性能统计
   */
  const getMetrics = () => {
    const cacheSize = localCache.value.size
    const hitRate = metrics.value.cacheHits / (metrics.value.cacheHits + metrics.value.cacheMisses) || 0
    
    return {
      ...metrics.value,
      cacheSize,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  /**
   * 监听语言变化，清除缓存
   */
  watch(() => i18n.locale.value, () => {
    clearCache()
  })

  /**
   * 组件挂载时预加载
   */
  onMounted(() => {
    if (preloadKeys.length > 0) {
      preload(preloadKeys)
    }
  })

  /**
   * 组件卸载时清理定时器
   */
  onUnmounted(() => {
    if (batchTimer) {
      clearTimeout(batchTimer)
      batchTimer = null
    }
  })

  return {
    // 翻译函数
    t,
    tBatch,
    
    // 性能功能
    preload,
    clearCache,
    getMetrics,
    
    // 响应式数据
    metrics: computed(() => getMetrics())
  }
}

/**
 * 创建降级的性能优化 I18n 对象
 */
function createFallbackPerformanceI18n() {
  const metrics = ref<LocalPerformanceMetrics>({
    cacheHits: 0,
    cacheMisses: 0,
    batchTranslations: 0,
    preloadCount: 0,
    averageTranslationTime: 0
  })

  const t = (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let result = key
      Object.keys(params).forEach(paramKey => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]))
      })
      return result
    }
    return key
  }

  const tBatch = async (keys: string[], params?: Record<string, unknown>) => {
    const results: Record<string, string> = {}
    keys.forEach(key => {
      results[key] = t(key, params)
    })
    return results
  }

  return {
    t,
    tBatch,
    preload: async () => {},
    clearCache: () => {},
    getMetrics: () => metrics.value,
    metrics: computed(() => metrics.value)
  }
}

/**
 * 导出类型
 */
export type {
  LocalPerformanceMetrics
}
