import type { I18nInstance, TranslationParams } from '../core/types'

import type { DebugLevel } from './debug'

import type {
  UseAsyncTranslationReturn,
  UseFormattedTranslationReturn,
  UseI18nReturn,
  UseTranslationCacheReturn,
  UseTranslationHistoryReturn,
  UseTranslationOptions,
  UseTranslationValidationReturn,
} from './types'
import { computed, inject, nextTick, onUnmounted, reactive, ref } from 'vue'
import { createDebugger } from './debug'
import { createPerformanceMonitor } from './performance'
import { createReactiveTranslationManager } from './reactivity'

// 手动定义Ref类型
interface Ref<T = any> {
  value: T
}

/**
 * I18n 注入键
 */
export const I18N_INJECTION_KEY = Symbol('i18n')

/**
 * Vue I18n 组合式 API
 * @returns I18n 相关的响应式状态和方法
 */
export function useI18n(): UseI18nReturn {
  // 从 Vue 应用中注入 I18n 实例
  const i18n = inject(I18N_INJECTION_KEY) as I18nInstance

  if (!i18n) {
    throw new Error(
      'useI18n() must be called within a component that has access to the I18n plugin. '
      + 'Make sure you have installed the I18n plugin using app.use(i18nPlugin).',
    )
  }

  // 创建响应式的当前语言
  const locale = ref<string>(i18n.getCurrentLanguage() || 'en')

  // 创建响应式的可用语言列表
  const availableLanguages = computed(() => i18n.getAvailableLanguages())

  // 语言变更监听器
  const handleLanguageChange = (...args: unknown[]) => {
    const newLocale = args[0] as string
    locale.value = newLocale
  }

  // 监听语言变更事件
  i18n.on('languageChanged', handleLanguageChange)

  // 组件卸载时清理监听器
  onUnmounted(() => {
    i18n.off('languageChanged', handleLanguageChange)
  })

  // 切换语言的方法
  const changeLanguage = async (newLocale: string) => {
    await i18n.changeLanguage(newLocale)
  }

  // 检查翻译键是否存在
  const exists = (key: string, targetLocale?: string) => {
    return i18n.exists(key, targetLocale)
  }

  // 获取所有翻译键
  const getKeys = (targetLocale?: string) => {
    return i18n.getKeys(targetLocale)
  }

  return {
    t: i18n.t.bind(i18n),
    locale,
    availableLanguages,
    changeLanguage,
    exists,
    getKeys,
    i18n,
  }
}

/**
 * 创建局部 I18n 实例的组合式 API
 * @param i18nInstance 自定义的 I18n 实例
 * @returns I18n 相关的响应式状态和方法
 */
export function useI18nWithInstance(i18nInstance: I18nInstance): UseI18nReturn {
  // 创建响应式的当前语言
  const locale = ref<string>(i18nInstance.getCurrentLanguage() || 'en')

  // 创建响应式的可用语言列表
  const availableLanguages = computed(() =>
    i18nInstance.getAvailableLanguages(),
  )

  // 语言变更监听器
  const handleLanguageChange = (...args: unknown[]) => {
    const newLocale = args[0] as string
    locale.value = newLocale
  }

  // 监听语言变更事件
  i18nInstance.on('languageChanged', handleLanguageChange)

  // 组件卸载时清理监听器
  onUnmounted(() => {
    i18nInstance.off('languageChanged', handleLanguageChange)
  })

  // 切换语言的方法
  const changeLanguage = async (newLocale: string) => {
    await i18nInstance.changeLanguage(newLocale)
  }

  // 检查翻译键是否存在
  const exists = (key: string, targetLocale?: string) => {
    return i18nInstance.exists(key, targetLocale)
  }

  // 获取所有翻译键
  const getKeys = (targetLocale?: string) => {
    return i18nInstance.getKeys(targetLocale)
  }

  return {
    t: i18nInstance.t.bind(i18nInstance),
    locale,
    availableLanguages,
    changeLanguage,
    exists,
    getKeys,
    i18n: i18nInstance,
  }
}

/**
 * 获取当前语言的组合式 API
 * @returns 当前语言的响应式引用
 */
export function useLocale() {
  const { locale } = useI18n()
  return locale
}

/**
 * 获取可用语言列表的组合式 API
 * @returns 可用语言列表的计算属性
 */
export function useAvailableLanguages() {
  const { availableLanguages } = useI18n()
  return availableLanguages
}

/**
 * 语言切换的组合式 API
 * @returns 语言切换相关的状态和方法
 */
export function useLanguageSwitcher() {
  const { locale, availableLanguages, changeLanguage } = useI18n()

  // 切换状态
  const isChanging = ref(false)

  // 切换语言的包装方法
  const switchLanguage = async (newLocale: string) => {
    if (isChanging.value || locale.value === newLocale) {
      return
    }

    try {
      isChanging.value = true
      await changeLanguage(newLocale)
    }
    finally {
      isChanging.value = false
    }
  }

  return {
    locale,
    availableLanguages,
    isChanging,
    switchLanguage,
  }
}

/**
 * 翻译函数的组合式 API
 * @returns 翻译函数
 */
export function useTranslation() {
  const { t } = useI18n()
  return t
}

/**
 * 批量翻译的组合式 API
 * @param keys 翻译键数组
 * @returns 翻译结果的计算属性
 */
export function useBatchTranslation(keys: string[]) {
  const { t } = useI18n()

  return computed(() => {
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = t(key)
    }
    return result
  })
}

/**
 * 条件翻译的组合式 API
 * @param condition 条件函数或响应式引用
 * @param trueKey 条件为真时的翻译键
 * @param falseKey 条件为假时的翻译键
 * @returns 翻译结果的计算属性
 */
export function useConditionalTranslation(
  condition: (() => boolean) | { value: boolean },
  trueKey: string,
  falseKey: string,
) {
  const { t } = useI18n()

  return computed(() => {
    const isTrue
      = typeof condition === 'function' ? condition() : condition.value
    return t(isTrue ? trueKey : falseKey)
  })
}

/**
 * 异步翻译的组合式 API
 * @param options 翻译选项
 * @returns 异步翻译的状态和方法
 */
export function useAsyncTranslation(options: UseTranslationOptions = {}): UseAsyncTranslationReturn {
  const { t } = useI18n()
  const { defaultValue = '', immediate = false, onError, onSuccess } = options

  const data = ref<string | null>(immediate ? null : defaultValue)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (key: string, params?: TranslationParams) => {
    if (loading.value)
      return

    try {
      loading.value = true
      error.value = null

      // 模拟异步翻译（实际可能涉及动态加载语言包）
      await nextTick()
      const result = t(key, params)

      data.value = result
      if (onSuccess) {
        onSuccess(result)
      }
    }
    catch (err) {
      const translationError = err as Error
      error.value = translationError
      data.value = defaultValue
      if (onError) {
        onError(translationError)
      }
    }
    finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = defaultValue
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * 格式化翻译的组合式 API
 * @param key 翻译键
 * @param initialParams 初始参数
 * @returns 格式化翻译的结果和方法
 */
export function useFormattedTranslation(
  key: string,
  initialParams: TranslationParams = {},
): UseFormattedTranslationReturn {
  const { t } = useI18n()
  const params = ref(initialParams)

  const raw = computed(() => t(key, params.value))

  const formatted = computed(() => {
    const result = raw.value
    // 可以在这里添加额外的格式化逻辑
    return result
  })

  const updateParams = (newParams: TranslationParams) => {
    params.value = { ...params.value, ...newParams }
  }

  return {
    formatted,
    raw,
    updateParams,
  }
}

/**
 * 翻译验证的组合式 API
 * @returns 翻译验证的状态和方法
 */
export function useTranslationValidation(): UseTranslationValidationReturn {
  const { exists } = useI18n()
  const validationKeys = ref<string[]>([])

  const isValid = computed(() => {
    return validationKeys.value.every(key => exists(key))
  })

  const errors = computed(() => {
    const errorList: string[] = []
    validationKeys.value.forEach((key) => {
      if (!exists(key)) {
        errorList.push(`Translation key "${key}" does not exist`)
      }
    })
    return errorList
  })

  const missingKeys = computed(() => {
    return validationKeys.value.filter(key => !exists(key))
  })

  const validate = (keys: string | string[]) => {
    validationKeys.value = Array.isArray(keys) ? keys : [keys]
  }

  return {
    isValid,
    errors,
    missingKeys,
    validate,
  }
}

/**
 * 翻译缓存的组合式 API
 * @returns 翻译缓存的状态和方法
 */
export function useTranslationCache(): UseTranslationCacheReturn {
  const { t } = useI18n()
  const cache = reactive<Record<string, string>>({})
  const stats = reactive({ hits: 0, misses: 0, size: 0 })

  const cached = computed(() => cache)

  const statsComputed = computed(() => ({ ...stats }))

  const clear = () => {
    Object.keys(cache).forEach((key) => {
      delete cache[key]
    })
    stats.hits = 0
    stats.misses = 0
    stats.size = 0
  }

  const preload = async (keys: string[]) => {
    for (const key of keys) {
      if (!(key in cache)) {
        try {
          const result = t(key)
          cache[key] = result
          stats.size++
        }
        catch {
          // 忽略翻译错误
        }
      }
    }
  }

  return {
    cached,
    stats: statsComputed,
    clear,
    preload,
  }
}

/**
 * 翻译历史的组合式 API
 * @param maxSize 最大历史记录数量
 * @returns 翻译历史的状态和方法
 */
export function useTranslationHistory(maxSize = 100): UseTranslationHistoryReturn {
  const historyList = ref<Array<{ key: string, result: string, timestamp: number }>>([])

  const history = computed(() => historyList.value)

  const addToHistory = (key: string, result: string) => {
    const entry = {
      key,
      result,
      timestamp: Date.now(),
    }

    historyList.value.unshift(entry)

    // 限制历史记录大小
    if (historyList.value.length > maxSize) {
      historyList.value = historyList.value.slice(0, maxSize)
    }
  }

  const clearHistory = () => {
    historyList.value = []
  }

  const getRecent = (count = 10) => {
    return historyList.value.slice(0, count)
  }

  return {
    history,
    addToHistory,
    clearHistory,
    getRecent,
  }
}

/**
 * 响应式翻译的组合式 API
 * @param key 翻译键（可以是响应式的）
 * @param params 翻译参数（可以是响应式的）
 * @returns 响应式的翻译结果
 */
export function useReactiveTranslation(
  key: Ref<string> | string,
  params?: Ref<TranslationParams> | TranslationParams,
) {
  const { t } = useI18n()

  return computed(() => {
    const resolvedKey = typeof key === 'string' ? key : key.value
    const resolvedParams = params
      ? (typeof params === 'object' && 'value' in params ? params.value : params)
      : undefined

    // 确保参数类型正确
    const finalParams = resolvedParams && typeof resolvedParams === 'object' && !Array.isArray(resolvedParams)
      ? resolvedParams as Record<string, unknown>
      : undefined

    return t(resolvedKey, finalParams as any)
  })
}

/**
 * 翻译性能监控的组合式 API
 * @returns 翻译性能监控的状态和方法
 */
export function useTranslationPerformance() {
  const metrics = reactive({
    totalTranslations: 0,
    averageTime: 0,
    slowTranslations: [] as Array<{ key: string, time: number }>,
  })

  const startTime = ref<number>(0)

  const startMeasure = () => {
    startTime.value = performance.now()
  }

  const endMeasure = (key: string) => {
    if (startTime.value === 0)
      return

    const duration = performance.now() - startTime.value
    metrics.totalTranslations++

    // 更新平均时间
    metrics.averageTime = (metrics.averageTime * (metrics.totalTranslations - 1) + duration) / metrics.totalTranslations

    // 记录慢翻译（超过10ms）
    if (duration > 10) {
      metrics.slowTranslations.push({ key, time: duration })
      // 只保留最近的10个慢翻译
      if (metrics.slowTranslations.length > 10) {
        metrics.slowTranslations.shift()
      }
    }

    startTime.value = 0
  }

  const reset = () => {
    metrics.totalTranslations = 0
    metrics.averageTime = 0
    metrics.slowTranslations = []
  }

  return {
    metrics: computed(() => ({ ...metrics })),
    startMeasure,
    endMeasure,
    reset,
  }
}

/**
 * 翻译表单验证的组合式 API
 * @returns 表单翻译验证的状态和方法
 */
export function useTranslationFormValidation() {
  const { t, exists } = useI18n()
  const errors = ref<Record<string, string[]>>({})

  const validateField = (fieldName: string, rules: Array<{ key: string, validator?: (value: any) => boolean }>) => {
    return (value: any) => {
      const fieldErrors: string[] = []

      for (const rule of rules) {
        if (!exists(rule.key)) {
          fieldErrors.push(`Translation key "${rule.key}" not found`)
          continue
        }

        if (rule.validator && !rule.validator(value)) {
          fieldErrors.push(t(rule.key))
        }
      }

      errors.value[fieldName] = fieldErrors
      return fieldErrors.length === 0
    }
  }

  const clearErrors = (fieldName?: string) => {
    if (fieldName) {
      delete errors.value[fieldName]
    }
    else {
      errors.value = {}
    }
  }

  const hasErrors = computed(() => {
    return Object.values(errors.value).some(fieldErrors => fieldErrors.length > 0)
  })

  return {
    errors: computed(() => errors.value),
    validateField,
    clearErrors,
    hasErrors,
  }
}

/**
 * 翻译主题的组合式 API
 * @param theme 主题名称
 * @returns 主题相关的翻译方法
 */
export function useTranslationTheme(theme: string) {
  const { t, exists } = useI18n()

  const themeT = (key: string, params?: TranslationParams) => {
    // 尝试主题特定的翻译键
    const themeKey = `themes.${theme}.${key}`
    if (exists(themeKey)) {
      return t(themeKey, params)
    }
    // 回退到默认翻译
    return t(key, params)
  }

  return {
    t: themeT,
    hasThemeTranslation: (key: string) => exists(`themes.${theme}.${key}`),
  }
}

/**
 * 翻译调试的组合式 API
 * @returns 翻译调试的状态和方法
 */
export function useTranslationDebug() {
  const { i18n } = useI18n()
  const debugMode = ref(false)
  const logs = ref<Array<{ key: string, result: string, timestamp: number, params?: TranslationParams }>>([])

  const originalT = i18n.t.bind(i18n)

  const debugT = (key: string, params?: TranslationParams) => {
    const result = originalT(key, params)

    if (debugMode.value) {
      logs.value.push({
        key,
        result,
        timestamp: Date.now(),
        params,
      })

      // 限制日志数量
      if (logs.value.length > 1000) {
        logs.value = logs.value.slice(-500)
      }

      // 使用console.warn代替console.log以符合ESLint规则
      console.warn(`[i18n] ${key}:`, result, params ? `(params: ${JSON.stringify(params)})` : '')
    }

    return result
  }

  const toggleDebug = () => {
    debugMode.value = !debugMode.value
  }

  const clearLogs = () => {
    logs.value = []
  }

  const exportLogs = () => {
    return JSON.stringify(logs.value, null, 2)
  }

  return {
    debugMode,
    logs: computed(() => logs.value),
    t: debugT,
    toggleDebug,
    clearLogs,
    exportLogs,
  }
}

/**
 * 深度响应式翻译的组合式 API
 * @param key 翻译键（可以是响应式的）
 * @param params 翻译参数（可以是响应式的）
 * @param options 选项
 * @returns 深度响应式的翻译结果
 */
export function useDeepReactiveTranslation(
  key: Ref<string> | string | (() => string),
  params?: Ref<TranslationParams> | TranslationParams | (() => TranslationParams),
  options: {
    immediate?: boolean
    deep?: boolean
    cache?: boolean
    onError?: (error: Error) => void
  } = {},
) {
  const { i18n } = useI18n()
  const manager = createReactiveTranslationManager(i18n)

  const keyGetter = typeof key === 'function'
    ? key
    : typeof key === 'string'
      ? () => key
      : () => key.value

  const paramsGetter = typeof params === 'function'
    ? () => {
      const result = params()
      return result && typeof result === 'object' && !Array.isArray(result)
        ? result as Record<string, unknown>
        : undefined
    }
    : typeof params === 'object' && params && 'value' in params
      ? () => {
        const value = params.value
        return value && typeof value === 'object' && !Array.isArray(value)
          ? value as Record<string, unknown>
          : undefined
      }
      : () => {
        const value = params
        return value && typeof value === 'object' && !Array.isArray(value)
          ? value as Record<string, unknown>
          : undefined
      }

  const result = manager.createReactiveTranslation(keyGetter, paramsGetter as any, options)

  // 组件卸载时清理
  onUnmounted(() => {
    manager.dispose()
  })

  return result
}

/**
 * 批量响应式翻译的组合式 API
 * @param keys 翻译键数组（可以是响应式的）
 * @param params 翻译参数（可以是响应式的）
 * @returns 批量响应式翻译结果
 */
export function useBatchReactiveTranslation(
  keys: Ref<string[]> | string[] | (() => string[]),
  params?: Ref<TranslationParams> | TranslationParams | (() => TranslationParams),
) {
  const { i18n } = useI18n()
  const manager = createReactiveTranslationManager(i18n)

  const keysGetter = typeof keys === 'function'
    ? keys
    : Array.isArray(keys)
      ? () => keys
      : () => keys.value

  const paramsGetter = typeof params === 'function'
    ? () => {
      const result = params()
      return result && typeof result === 'object' && !Array.isArray(result)
        ? result as Record<string, unknown>
        : undefined
    }
    : typeof params === 'object' && params && 'value' in params
      ? () => {
        const value = params.value
        return value && typeof value === 'object' && !Array.isArray(value)
          ? value as Record<string, unknown>
          : undefined
      }
      : () => {
        const value = params
        return value && typeof value === 'object' && !Array.isArray(value)
          ? value as Record<string, unknown>
          : undefined
      }

  const result = manager.createBatchReactiveTranslation(keysGetter, paramsGetter as any)

  // 组件卸载时清理
  onUnmounted(() => {
    manager.dispose()
  })

  return result
}

/**
 * 计算属性翻译的组合式 API
 * @param keyGetter 翻译键获取函数
 * @param paramsGetter 翻译参数获取函数
 * @param options 选项
 * @returns 计算属性翻译结果
 */
export function useComputedTranslation(
  keyGetter: () => string,
  paramsGetter?: () => TranslationParams,
  options?: {
    cache?: boolean
    onError?: (error: Error) => void
  },
) {
  const { i18n } = useI18n()
  const manager = createReactiveTranslationManager(i18n)

  const result = manager.createComputedTranslation(keyGetter, paramsGetter, options)

  // 组件卸载时清理
  onUnmounted(() => {
    manager.dispose()
  })

  return result
}

/**
 * 增强的响应式语言状态
 * @returns 增强的语言状态和方法
 */
export function useEnhancedLocale() {
  const { i18n } = useI18n()
  const manager = createReactiveTranslationManager(i18n)
  const result = manager.createReactiveLocale()

  // 组件卸载时清理
  onUnmounted(() => {
    manager.dispose()
  })

  return result
}

/**
 * 翻译缓存管理的组合式 API
 * @returns 缓存管理的状态和方法
 */
export function useTranslationCacheManager() {
  const { i18n } = useI18n()
  const manager = createReactiveTranslationManager(i18n)

  const stats = computed(() => manager.getCacheStats())

  const invalidateTranslation = (key: string) => {
    manager.invalidateTranslation(key)
  }

  const clearCache = () => {
    manager.dispose()
  }

  // 组件卸载时清理
  onUnmounted(() => {
    manager.dispose()
  })

  return {
    stats,
    invalidateTranslation,
    clearCache,
  }
}

/**
 * 性能监控的组合式 API
 * @param options 监控选项
 * @returns 性能监控的状态和方法
 */
export function useI18nPerformanceMonitor(options?: {
  enabled?: boolean
  slowThreshold?: number
  maxLogs?: number
  autoStart?: boolean
}) {
  const { i18n } = useI18n()
  const monitor = createPerformanceMonitor(i18n)

  const {
    enabled = false,
    slowThreshold = 10,
    maxLogs = 1000,
    autoStart = false,
  } = options || {}

  // 配置监控器
  if (slowThreshold) {
    monitor.setSlowThreshold(slowThreshold)
  }
  if (maxLogs) {
    monitor.setMaxLogs(maxLogs)
  }

  // 自动启动
  if (autoStart || enabled) {
    monitor.enable()
  }

  const state = monitor.getReactiveState()

  const start = () => monitor.enable()
  const stop = () => monitor.disable()
  const clear = () => monitor.clear()
  const exportReport = () => monitor.exportReport()
  const getRecommendations = () => monitor.getPerformanceRecommendations()

  // 组件卸载时清理
  onUnmounted(() => {
    monitor.disable()
  })

  return {
    ...state,
    start,
    stop,
    clear,
    exportReport,
    getRecommendations,
  }
}

/**
 * 调试工具的组合式 API
 * @param options 调试选项
 * @returns 调试工具的状态和方法
 */
export function useI18nDebugger(options?: {
  enabled?: boolean
  level?: DebugLevel
  maxMessages?: number
  trackCoverage?: boolean
  validateParams?: boolean
  checkMissingKeys?: boolean
  autoLog?: boolean
}) {
  const { i18n } = useI18n()
  const debuggerInstance = createDebugger(i18n)

  // 配置调试器
  if (options) {
    debuggerInstance.updateConfig(options)
  }

  const state = debuggerInstance.getReactiveState()

  const enable = () => debuggerInstance.enable()
  const disable = () => debuggerInstance.disable()
  const setLevel = (level: DebugLevel) => debuggerInstance.setLevel(level)
  const clearMessages = () => debuggerInstance.clearMessages()
  const exportReport = () => debuggerInstance.exportReport()
  const getCoverageReport = () => debuggerInstance.getCoverageReport()

  const logError = (message: string, error?: Error, context?: any) =>
    debuggerInstance.logError(message, error, context)
  const logWarn = (message: string, context?: any) =>
    debuggerInstance.logWarn(message, context)
  const logInfo = (message: string, context?: any) =>
    debuggerInstance.logInfo(message, context)
  const logDebug = (message: string, context?: any) =>
    debuggerInstance.logDebug(message, context)

  // 组件卸载时清理
  onUnmounted(() => {
    debuggerInstance.disable()
  })

  return {
    ...state,
    enable,
    disable,
    setLevel,
    clearMessages,
    exportReport,
    getCoverageReport,
    logError,
    logWarn,
    logInfo,
    logDebug,
  }
}

/**
 * 综合开发工具的组合式 API
 * @param options 开发工具选项
 * @returns 开发工具的状态和方法
 */
export function useI18nDevTools(options?: {
  performance?: {
    enabled?: boolean
    slowThreshold?: number
    maxLogs?: number
  }
  debug?: {
    enabled?: boolean
    level?: DebugLevel
    maxMessages?: number
    trackCoverage?: boolean
  }
}) {
  const performanceMonitor = useI18nPerformanceMonitor(options?.performance)
  const debuggerTool = useI18nDebugger(options?.debug)

  const isDevMode = computed(() => {
    return performanceMonitor.isEnabled.value || debuggerTool.config.value.enabled
  })

  const enableAll = () => {
    performanceMonitor.start()
    debuggerTool.enable()
  }

  const disableAll = () => {
    performanceMonitor.stop()
    debuggerTool.disable()
  }

  const clearAll = () => {
    performanceMonitor.clear()
    debuggerTool.clearMessages()
  }

  const exportAllReports = () => {
    return {
      performance: performanceMonitor.exportReport(),
      debug: debuggerTool.exportReport(),
      timestamp: new Date().toISOString(),
    }
  }

  const getHealthStatus = computed(() => {
    const perfMetrics = performanceMonitor.metrics.value
    const _debugState = debuggerTool.config.value

    return {
      performance: {
        status: perfMetrics.averageTranslationTime < 5 ? 'good' : 'warning',
        averageTime: perfMetrics.averageTranslationTime,
        slowTranslations: perfMetrics.slowTranslations.length,
      },
      debug: {
        status: debuggerTool.errorCount.value === 0 ? 'good' : 'error',
        errorCount: debuggerTool.errorCount.value,
        warningCount: debuggerTool.warningCount.value,
      },
      coverage: {
        rate: debuggerTool.coverage.value.coverageRate,
        status: debuggerTool.coverage.value.coverageRate > 0.8 ? 'good' : 'warning',
      },
    }
  })

  return {
    performance: performanceMonitor,
    debug: debuggerTool,
    isDevMode,
    enableAll,
    disableAll,
    clearAll,
    exportAllReports,
    healthStatus: getHealthStatus,
  }
}
