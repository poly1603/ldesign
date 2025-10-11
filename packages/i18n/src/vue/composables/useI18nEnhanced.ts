/**
 * 增强的 Vue I18n 组合式 API
 * 提供更智能的翻译功能，包括键名不存在时的自动提示
 */

import { computed, h, inject, ref, type VNode } from 'vue'
import TranslationMissing from '../components/TranslationMissing.vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 翻译选项接口
 */
export interface TranslationOptions {
  /** 翻译参数 */
  params?: Record<string, unknown>
  /** 指定语言 */
  locale?: string
  /** 降级文本 */
  fallback?: string
  /** 是否在键名不存在时显示警告组件 */
  showMissingWarning?: boolean
  /** 是否在控制台输出警告 */
  logWarning?: boolean
  /** 自定义缺失处理函数 */
  onMissing?: (key: string, locale: string) => string | VNode | null
}

/**
 * 翻译结果接口
 */
export interface TranslationResult {
  /** 翻译文本 */
  text: string
  /** 是否存在该键名 */
  exists: boolean
  /** 是否使用了降级 */
  fallback: boolean
  /** 警告组件（如果需要） */
  warningComponent?: VNode
}

/**
 * 增强的 useI18n 组合式 API
 *
 * @example
 * ```vue
 * <script setup>
 * import { useI18nEnhanced } from '@ldesign/i18n/vue'
 *
 * const { t, te, tSafe, tComponent } = useI18nEnhanced()
 *
 * // 基础翻译
 * const text = t('hello')
 *
 * // 安全翻译（自动处理缺失）
 * const safeText = tSafe('maybe.missing.key', { fallback: 'Default text' })
 *
 * // 组件翻译（返回 VNode）
 * const component = tComponent('missing.key')
 * </script>
 * ```
 */
export function useI18nEnhanced() {
  const i18n = inject(I18nInjectionKey)

  if (!i18n) {
    console.warn('useI18nEnhanced: I18n plugin not found. Make sure to install the i18n plugin.')
    return createFallbackEnhancedI18n()
  }

  /**
   * 基础翻译函数（与原版相同）
   */
  const t = (key: string, params?: Record<string, unknown>): string => {
    // 通过访问 locale.value 来触发响应式更新
    i18n.locale.value
    return i18n.t(key, params)
  }

  /**
   * 键存在检查函数（与原版相同）
   */
  const te = (key: string, locale?: string): boolean => {
    // 通过访问 locale.value 来触发响应式更新
    i18n.locale.value
    return i18n.te(key, locale)
  }

  /**
   * 安全翻译函数
   * 当键名不存在时，提供更好的降级处理
   */
  const tSafe = (key: string, options: TranslationOptions = {}): TranslationResult => {
    const {
      params,
      locale,
      fallback,
      showMissingWarning = true,
      logWarning = true,
      onMissing,
    } = options

    // 触发响应式更新
    i18n.locale.value

    const currentLocale = locale || i18n.locale.value
    const exists = i18n.te(key, currentLocale)

    if (exists) {
      return {
        text: i18n.t(key, params),
        exists: true,
        fallback: false,
      }
    }

    // 键名不存在的处理
    if (logWarning) {
      console.warn(`[I18n] Translation key not found: "${key}" (locale: ${currentLocale})`)
    }

    let resultText = fallback || key
    let warningComponent: VNode | undefined

    // 自定义缺失处理
    if (onMissing) {
      const customResult = onMissing(key, currentLocale)
      if (typeof customResult === 'string') {
        resultText = customResult
      }
      else if (customResult) {
        warningComponent = customResult
        resultText = key // 保持原键名作为文本降级
      }
    }

    // 创建警告组件
    if (showMissingWarning && !warningComponent) {
      warningComponent = h(TranslationMissing, {
        keypath: key,
        fallbackText: fallback,
        inline: true,
      })
    }

    return {
      text: resultText,
      exists: false,
      fallback: true,
      warningComponent,
    }
  }

  /**
   * 组件翻译函数
   * 返回 VNode，可以直接在模板中使用
   */
  const tComponent = (key: string, options: TranslationOptions = {}): VNode => {
    const result = tSafe(key, options)

    if (result.exists) {
      // 如果键名存在，返回简单的文本节点
      return h('span', result.text)
    }

    // 如果键名不存在，返回警告组件或降级文本
    return result.warningComponent || h('span', {
      class: 'translation-missing__fallback',
    }, result.text)
  }

  /**
   * 批量翻译函数
   */
  const tBatch = (keys: string[], options: TranslationOptions = {}): Record<string, TranslationResult> => {
    const results: Record<string, TranslationResult> = {}

    keys.forEach((key) => {
      results[key] = tSafe(key, options)
    })

    return results
  }

  /**
   * 响应式翻译函数
   * 返回一个计算属性，当语言或参数变化时自动更新
   */
  const tReactive = (
    key: string,
    params?: Record<string, unknown> | (() => Record<string, unknown>),
    options: TranslationOptions = {},
  ) => {
    return computed(() => {
      const resolvedParams = typeof params === 'function' ? params() : params
      return tSafe(key, { ...options, params: resolvedParams })
    })
  }

  /**
   * 获取翻译统计信息
   */
  const getTranslationStats = () => {
    const allKeys = i18n.getAvailableLanguages().flatMap(locale =>
      (i18n as any).getKeys?.(locale) || [],
    )

    return {
      totalKeys: allKeys.length,
      availableLocales: i18n.getAvailableLanguages(),
      currentLocale: i18n.locale.value,
    }
  }

  return {
    // 基础功能
    locale: i18n.locale,
    availableLocales: i18n.availableLocales,
    setLocale: i18n.setLocale,

    // 翻译函数
    t,
    te,
    tSafe,
    tComponent,
    tBatch,
    tReactive,

    // 工具函数
    getTranslationStats,
  }
}

/**
 * 创建降级的增强 I18n 对象
 */
function createFallbackEnhancedI18n() {
  const locale = ref('en')
  const availableLocales = computed(() => ['en'])

  const t = (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let result = key
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]))
      })
      return result
    }
    return key
  }

  const te = () => false

  const tSafe = (key: string, options: TranslationOptions = {}): TranslationResult => {
    return {
      text: options.fallback || key,
      exists: false,
      fallback: true,
      warningComponent: h(TranslationMissing, {
        keypath: key,
        fallbackText: options.fallback,
        inline: true,
      }),
    }
  }

  const tComponent = (key: string, options: TranslationOptions = {}): VNode => {
    return h(TranslationMissing, {
      keypath: key,
      fallbackText: options.fallback,
      inline: true,
    })
  }

  const tBatch = (keys: string[], options: TranslationOptions = {}) => {
    const results: Record<string, TranslationResult> = {}
    keys.forEach((key) => {
      results[key] = tSafe(key, options)
    })
    return results
  }

  const tReactive = (key: string, params?: any, options: TranslationOptions = {}) => {
    return computed(() => tSafe(key, { ...options, params }))
  }

  return {
    locale,
    availableLocales,
    setLocale: async () => console.warn('I18n plugin not available'),
    t,
    te,
    tSafe,
    tComponent,
    tBatch,
    tReactive,
    getTranslationStats: () => ({
      totalKeys: 0,
      availableLocales: ['en'],
      currentLocale: 'en',
    }),
  }
}

/**
 * 导出类型（已在核心类型中定义，这里不再重复导出）
 */
// export type {
//   TranslationOptions,
//   TranslationResult
// }
