/**
 * 国际化模块入口
 */

// 核心类型
export type {
  SupportedLocale,
  LocaleInfo,
  TranslationResource,
  TranslationKey,
  TranslationOptions,
  TranslationParams,
  DateTimeFormatOptions,
  CurrencyFormatOptions,
  NumberFormatOptions,
  PluralRule,
  ResourceLoader,
  ResourceMetadata,
  LanguageDetector,
  MissingTranslationHandler,
  InterpolationProcessor,
  PostProcessor,
  I18nMiddleware,
  I18nContext,
  TranslationValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TranslationStats,
  LocaleStats,
  NamespaceStats,
  I18nConfig,
  I18nManager as II18nManager,
  I18nEvent,
  I18nEventListener,
  I18nEventData
} from './types'

// 核心管理器
export { I18nManager } from './I18nManager'

// 资源加载器
export {
  HttpResourceLoader,
  StaticResourceLoader,
  LocalStorageResourceLoader,
  CacheResourceLoader
} from './ResourceLoader'

// 语言检测器
export {
  BrowserLanguageDetector,
  LocalStorageLanguageDetector,
  CookieLanguageDetector,
  UrlLanguageDetector,
  PathLanguageDetector,
  CustomLanguageDetector
} from './LanguageDetector'

// 插件
export { I18nPlugin } from '../plugins/builtin/I18nPlugin'
export type { I18nPluginConfig } from '../plugins/builtin/I18nPlugin'

// 工具函数
export const I18nUtils = {
  /**
   * 标准化语言代码
   */
  normalizeLocale(locale: string): string {
    const parts = locale.toLowerCase().split('-')
    if (parts.length === 1) {
      return parts[0]
    }
    return `${parts[0]}-${parts[1].toUpperCase()}`
  },

  /**
   * 检查是否为RTL语言
   */
  isRtlLocale(locale: SupportedLocale): boolean {
    const rtlLocales: SupportedLocale[] = ['ar-SA']
    return rtlLocales.includes(locale)
  },

  /**
   * 获取语言的显示名称
   */
  getDisplayName(locale: SupportedLocale, displayLocale?: SupportedLocale): string {
    try {
      const displayNames = new Intl.DisplayNames([displayLocale || locale], { type: 'language' })
      return displayNames.of(locale) || locale
    } catch (error) {
      return locale
    }
  },

  /**
   * 获取语言的本地化名称
   */
  getNativeName(locale: SupportedLocale): string {
    const nativeNames: Record<SupportedLocale, string> = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      'en-US': 'English',
      'en-GB': 'English (UK)',
      'ja-JP': '日本語',
      'ko-KR': '한국어',
      'fr-FR': 'Français',
      'de-DE': 'Deutsch',
      'es-ES': 'Español',
      'it-IT': 'Italiano',
      'pt-BR': 'Português',
      'ru-RU': 'Русский',
      'ar-SA': 'العربية',
      'hi-IN': 'हिन्दी',
      'th-TH': 'ไทย',
      'vi-VN': 'Tiếng Việt'
    }

    return nativeNames[locale] || locale
  },

  /**
   * 获取语言的方向
   */
  getDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
    return this.isRtlLocale(locale) ? 'rtl' : 'ltr'
  },

  /**
   * 解析Accept-Language头
   */
  parseAcceptLanguage(acceptLanguage: string): SupportedLocale[] {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, q = '1'] = lang.trim().split(';q=')
        return {
          locale: this.normalizeLocale(locale),
          quality: parseFloat(q)
        }
      })
      .sort((a, b) => b.quality - a.quality)
      .map(item => item.locale)

    return languages.filter(this.isSupportedLocale) as SupportedLocale[]
  },

  /**
   * 检查是否为支持的语言
   */
  isSupportedLocale(locale: string): locale is SupportedLocale {
    const supportedLocales: SupportedLocale[] = [
      'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
      'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
      'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
    ]

    return supportedLocales.includes(locale as SupportedLocale)
  },

  /**
   * 获取回退语言
   */
  getFallbackLocale(locale: SupportedLocale): SupportedLocale {
    const fallbackMap: Record<SupportedLocale, SupportedLocale> = {
      'zh-CN': 'en-US',
      'zh-TW': 'zh-CN',
      'en-US': 'en-US',
      'en-GB': 'en-US',
      'ja-JP': 'en-US',
      'ko-KR': 'en-US',
      'fr-FR': 'en-US',
      'de-DE': 'en-US',
      'es-ES': 'en-US',
      'it-IT': 'en-US',
      'pt-BR': 'en-US',
      'ru-RU': 'en-US',
      'ar-SA': 'en-US',
      'hi-IN': 'en-US',
      'th-TH': 'en-US',
      'vi-VN': 'en-US'
    }

    return fallbackMap[locale] || 'en-US'
  },

  /**
   * 格式化翻译键
   */
  formatKey(namespace: string, key: string, separator: string = ':'): string {
    return `${namespace}${separator}${key}`
  },

  /**
   * 解析翻译键
   */
  parseKey(fullKey: string, separator: string = ':'): { namespace: string; key: string } {
    const parts = fullKey.split(separator)
    if (parts.length === 1) {
      return { namespace: 'common', key: parts[0] }
    }
    return { namespace: parts[0], key: parts.slice(1).join(separator) }
  },

  /**
   * 深度合并翻译对象
   */
  mergeTranslations(target: any, source: any): any {
    const result = { ...target }

    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeTranslations(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    })

    return result
  },

  /**
   * 扁平化翻译对象
   */
  flattenTranslations(obj: any, prefix: string = '', separator: string = '.'): Record<string, string> {
    const result: Record<string, string> = {}

    Object.keys(obj).forEach(key => {
      const newKey = prefix ? `${prefix}${separator}${key}` : key
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(result, this.flattenTranslations(obj[key], newKey, separator))
      } else {
        result[newKey] = String(obj[key])
      }
    })

    return result
  },

  /**
   * 验证翻译完整性
   */
  validateTranslations(
    baseTranslations: Record<string, any>,
    targetTranslations: Record<string, any>
  ): { missing: string[]; extra: string[] } {
    const baseKeys = Object.keys(this.flattenTranslations(baseTranslations))
    const targetKeys = Object.keys(this.flattenTranslations(targetTranslations))

    const missing = baseKeys.filter(key => !targetKeys.includes(key))
    const extra = targetKeys.filter(key => !baseKeys.includes(key))

    return { missing, extra }
  },

  /**
   * 计算翻译完成率
   */
  calculateCompletionRate(
    baseTranslations: Record<string, any>,
    targetTranslations: Record<string, any>
  ): number {
    const baseKeys = Object.keys(this.flattenTranslations(baseTranslations))
    const targetKeys = Object.keys(this.flattenTranslations(targetTranslations))

    if (baseKeys.length === 0) return 100

    const completedKeys = baseKeys.filter(key => targetKeys.includes(key))
    return (completedKeys.length / baseKeys.length) * 100
  },

  /**
   * 生成翻译统计报告
   */
  generateTranslationReport(translations: Record<SupportedLocale, Record<string, any>>): TranslationStats {
    const locales = Object.keys(translations) as SupportedLocale[]
    const baseLocale = locales[0]
    const baseTranslations = translations[baseLocale]
    const baseKeys = Object.keys(this.flattenTranslations(baseTranslations))

    const byLocale: Record<SupportedLocale, LocaleStats> = {}
    const byNamespace: Record<string, NamespaceStats> = {}

    let totalTranslated = 0

    locales.forEach(locale => {
      const localeTranslations = translations[locale]
      const localeKeys = Object.keys(this.flattenTranslations(localeTranslations))
      const translatedCount = baseKeys.filter(key => localeKeys.includes(key)).length
      const missingCount = baseKeys.length - translatedCount

      byLocale[locale] = {
        locale,
        totalTranslations: baseKeys.length,
        translatedCount,
        missingCount,
        completionRate: (translatedCount / baseKeys.length) * 100
      }

      totalTranslated += translatedCount
    })

    return {
      totalTranslations: baseKeys.length,
      translatedCount: Math.round(totalTranslated / locales.length),
      missingCount: baseKeys.length - Math.round(totalTranslated / locales.length),
      completionRate: (totalTranslated / (baseKeys.length * locales.length)) * 100,
      byLocale,
      byNamespace
    }
  }
}

// 常量
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
  'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
  'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
]

export const RTL_LOCALES: SupportedLocale[] = ['ar-SA']

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'

export const DEFAULT_FALLBACK_LOCALE: SupportedLocale = 'en-US'

// 默认配置
export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLocale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  supportedLocales: ['en-US', 'zh-CN'],
  resourcePath: '/locales/{{locale}}/{{namespace}}.json',
  defaultNamespace: 'common',
  namespaceSeparator: ':',
  keySeparator: '.',
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    escapeValue: true
  },
  pluralSeparator: '_',
  contextSeparator: '_',
  debug: false,
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 30 * 60 * 1000
  },
  preload: {
    enabled: false,
    locales: [],
    namespaces: []
  },
  lazyLoad: {
    enabled: true,
    threshold: 5
  }
}

// 导入类型
import type { SupportedLocale, TranslationStats, LocaleStats, NamespaceStats, I18nConfig } from './types'
