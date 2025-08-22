/**
 * Vue 3 响应式系统增强
 *
 * 提供更强大的响应式集成功能：
 * - 深度响应式翻译
 * - 智能缓存失效
 * - 批量更新优化
 * - 内存泄漏防护
 * - 性能监控
 */

import type { I18nInstance, TranslationParams } from '../core/types'
import { computed, nextTick, reactive, ref, watch, watchEffect } from 'vue'

/**
 * 响应式翻译管理器
 */
export class ReactiveTranslationManager {
  private i18n: I18nInstance
  private translationCache = new Map<string, any>()
  private dependencyMap = new Map<string, Set<string>>()
  private updateQueue = new Set<string>()
  private isUpdating = false
  private cleanupFunctions = new Set<() => void>()

  constructor(i18n: I18nInstance) {
    this.i18n = i18n
    this.setupLanguageListener()
  }

  /**
   * 设置语言变更监听器
   */
  private setupLanguageListener(): void {
    const cleanup = this.i18n.on('languageChanged', () => {
      this.invalidateAllTranslations()
    })

    if (typeof cleanup === 'function') {
      this.cleanupFunctions.add(cleanup)
    }
  }

  /**
   * 创建响应式翻译
   */
  createReactiveTranslation(
    key: string | (() => string),
    params?: TranslationParams | (() => TranslationParams),
    options?: {
      immediate?: boolean
      deep?: boolean
      cache?: boolean
    },
  ) {
    const { immediate: _immediate = true, deep = true, cache = true } = options || {}

    const translationRef = ref('')
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    const updateTranslation = async () => {
      try {
        isLoading.value = true
        error.value = null

        const resolvedKey = typeof key === 'function' ? key() : key
        const resolvedParams = typeof params === 'function' ? params() : params

        const cacheKey = this.getCacheKey(resolvedKey, resolvedParams)

        if (cache && this.translationCache.has(cacheKey)) {
          translationRef.value = this.translationCache.get(cacheKey)
        }
        else {
          const result = this.i18n.t(resolvedKey, resolvedParams)
          translationRef.value = result

          if (cache) {
            this.translationCache.set(cacheKey, result)
            this.addDependency(resolvedKey, cacheKey)
          }
        }
      }
      catch (err) {
        error.value = err as Error
        translationRef.value = typeof key === 'function' ? key() : key
      }
      finally {
        isLoading.value = false
      }
    }

    // 监听依赖变化
    const stopWatcher = watchEffect(updateTranslation, {
      flush: 'sync',
    })

    // 如果参数是响应式的，需要深度监听
    if (typeof params === 'function' || (params && typeof params === 'object')) {
      const paramWatcher = watch(
        () => typeof params === 'function' ? params() : params,
        updateTranslation,
        { deep, immediate: false },
      )

      this.cleanupFunctions.add(() => paramWatcher())
    }

    this.cleanupFunctions.add(() => stopWatcher())

    return {
      value: translationRef,
      isLoading,
      error,
      refresh: updateTranslation,
    }
  }

  /**
   * 创建批量响应式翻译
   */
  createBatchReactiveTranslation(
    keys: string[] | (() => string[]),
    params?: TranslationParams | (() => TranslationParams),
  ) {
    const translations = reactive<Record<string, string>>({})
    const isLoading = ref(false)
    const errors = reactive<Record<string, Error>>({})

    const updateTranslations = async () => {
      try {
        isLoading.value = true

        const resolvedKeys = typeof keys === 'function' ? keys() : keys
        const resolvedParams = typeof params === 'function' ? params() : params

        // 批量翻译
        const results = await Promise.allSettled(
          resolvedKeys.map(async (key) => {
            try {
              const result = this.i18n.t(key, resolvedParams)
              return { key, result }
            }
            catch (error) {
              return { key, error: error as Error }
            }
          }),
        )

        // 更新结果
        for (const result of results) {
          if (result.status === 'fulfilled') {
            const { key, result: translation, error } = result.value
            if (error) {
              errors[key] = error
            }
            else {
              translations[key] = translation
              delete errors[key]
            }
          }
        }
      }
      finally {
        isLoading.value = false
      }
    }

    // 监听依赖变化
    const stopWatcher = watchEffect(updateTranslations)
    this.cleanupFunctions.add(() => stopWatcher())

    return {
      translations,
      isLoading,
      errors,
      refresh: updateTranslations,
    }
  }

  /**
   * 创建计算属性翻译
   */
  createComputedTranslation(
    keyGetter: () => string,
    paramsGetter?: () => TranslationParams,
    options?: {
      cache?: boolean
      onError?: (error: Error) => void
    },
  ) {
    const { cache = true, onError } = options || {}

    return computed(() => {
      try {
        const key = keyGetter()
        const params = paramsGetter?.()

        const cacheKey = this.getCacheKey(key, params)

        if (cache && this.translationCache.has(cacheKey)) {
          return this.translationCache.get(cacheKey)
        }

        const result = this.i18n.t(key, params)

        if (cache) {
          this.translationCache.set(cacheKey, result)
          this.addDependency(key, cacheKey)
        }

        return result
      }
      catch (error) {
        if (onError) {
          onError(error as Error)
        }
        return keyGetter()
      }
    })
  }

  /**
   * 创建响应式语言状态
   */
  createReactiveLocale() {
    const locale = ref(this.i18n.getCurrentLanguage())
    const isChanging = ref(false)

    const changeLanguage = async (newLocale: string) => {
      if (isChanging.value || locale.value === newLocale) {
        return
      }

      try {
        isChanging.value = true
        await this.i18n.changeLanguage(newLocale)
        locale.value = newLocale
      }
      finally {
        isChanging.value = false
      }
    }

    // 监听语言变更事件
    const cleanup = this.i18n.on('languageChanged', (newLocale: unknown) => {
      locale.value = newLocale as string
    })

    if (typeof cleanup === 'function') {
      this.cleanupFunctions.add(cleanup)
    }

    return {
      locale,
      isChanging,
      changeLanguage,
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(key: string, params?: TranslationParams): string {
    const locale = this.i18n.getCurrentLanguage()
    const paramStr = params ? JSON.stringify(params) : ''
    return `${locale}:${key}:${paramStr}`
  }

  /**
   * 添加依赖关系
   */
  private addDependency(translationKey: string, cacheKey: string): void {
    if (!this.dependencyMap.has(translationKey)) {
      this.dependencyMap.set(translationKey, new Set())
    }
    this.dependencyMap.get(translationKey)!.add(cacheKey)
  }

  /**
   * 使所有翻译失效
   */
  private async invalidateAllTranslations(): Promise<void> {
    if (this.isUpdating) {
      return
    }

    this.isUpdating = true
    this.translationCache.clear()
    this.dependencyMap.clear()

    // 在下一个 tick 中完成更新
    await nextTick()
    this.isUpdating = false
  }

  /**
   * 使特定翻译失效
   */
  invalidateTranslation(key: string): void {
    const dependencies = this.dependencyMap.get(key)
    if (dependencies) {
      for (const cacheKey of dependencies) {
        this.translationCache.delete(cacheKey)
      }
      this.dependencyMap.delete(key)
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      cacheSize: this.translationCache.size,
      dependencyCount: this.dependencyMap.size,
      isUpdating: this.isUpdating,
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    for (const cleanup of this.cleanupFunctions) {
      cleanup()
    }
    this.cleanupFunctions.clear()
    this.translationCache.clear()
    this.dependencyMap.clear()
  }
}

/**
 * 创建响应式翻译管理器
 */
export function createReactiveTranslationManager(i18n: I18nInstance): ReactiveTranslationManager {
  return new ReactiveTranslationManager(i18n)
}

/**
 * 响应式翻译选项
 */
export interface ReactiveTranslationOptions {
  immediate?: boolean
  deep?: boolean
  cache?: boolean
  onError?: (error: Error) => void
}

/**
 * 批量翻译选项
 */
export interface BatchTranslationOptions {
  cache?: boolean
  onError?: (key: string, error: Error) => void
}
