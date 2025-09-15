/**
 * 国际化管理器
 * 
 * 负责管理多语言资源和本地化功能
 */

import { EventEmitter } from 'events'
import type {
  I18nManager as II18nManager,
  I18nConfig,
  SupportedLocale,
  LocaleInfo,
  TranslationResource,
  TranslationKey,
  TranslationOptions,
  TranslationParams,
  DateTimeFormatOptions,
  CurrencyFormatOptions,
  ResourceLoader,
  LanguageDetector,
  MissingTranslationHandler,
  I18nEvent,
  I18nEventListener,
  I18nEventData
} from './types'

/**
 * 国际化管理器实现
 */
export class I18nManager extends EventEmitter implements II18nManager {
  private config: I18nConfig
  private currentLocale: SupportedLocale
  private resources: Map<string, TranslationResource> = new Map()
  private resourceLoaders: ResourceLoader[] = []
  private languageDetectors: LanguageDetector[] = []
  private missingHandlers: MissingTranslationHandler[] = []
  private formatters: Map<SupportedLocale, Intl.DateTimeFormat> = new Map()
  private numberFormatters: Map<string, Intl.NumberFormat> = new Map()
  private isInitialized: boolean = false

  constructor() {
    super()
  }

  /**
   * 初始化国际化管理器
   */
  async initialize(config: I18nConfig): Promise<void> {
    this.config = {
      defaultLocale: 'en-US',
      fallbackLocale: 'en-US',
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
        ttl: 30 * 60 * 1000 // 30分钟
      },
      preload: {
        enabled: false,
        locales: [],
        namespaces: []
      },
      lazyLoad: {
        enabled: true,
        threshold: 5
      },
      ...config
    }

    // 设置当前语言
    this.currentLocale = config.currentLocale || this.detectLanguage() || this.config.defaultLocale

    // 注册内置组件
    this.registerBuiltinComponents()

    // 预加载资源
    if (this.config.preload.enabled) {
      await this.preloadResources()
    }

    // 加载当前语言的默认命名空间
    await this.loadResource(this.currentLocale, this.config.defaultNamespace)

    this.isInitialized = true
    console.log(`国际化管理器初始化完成，当前语言: ${this.currentLocale}`)
  }

  /**
   * 获取当前语言
   */
  getCurrentLocale(): SupportedLocale {
    return this.currentLocale
  }

  /**
   * 设置当前语言
   */
  async setCurrentLocale(locale: SupportedLocale): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      throw new Error(`不支持的语言: ${locale}`)
    }

    const oldLocale = this.currentLocale
    this.currentLocale = locale

    // 加载新语言的默认命名空间
    await this.loadResource(locale, this.config.defaultNamespace)

    // 缓存语言设置
    this.cacheLanguageSetting(locale)

    // 触发语言变更事件
    this.emit('localeChanged', { oldLocale, newLocale: locale })

    console.log(`语言已切换: ${oldLocale} -> ${locale}`)
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLocales(): LocaleInfo[] {
    return this.config.supportedLocales.map(locale => this.getLocaleInfo(locale)!).filter(Boolean)
  }

  /**
   * 获取语言信息
   */
  getLocaleInfo(locale: SupportedLocale): LocaleInfo | null {
    const localeInfoMap: Record<SupportedLocale, LocaleInfo> = {
      'zh-CN': {
        code: 'zh-CN',
        name: '简体中文',
        englishName: 'Simplified Chinese',
        rtl: false,
        direction: 'ltr',
        country: 'CN',
        currency: 'CNY',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: '¥',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'zh-TW': {
        code: 'zh-TW',
        name: '繁體中文',
        englishName: 'Traditional Chinese',
        rtl: false,
        direction: 'ltr',
        country: 'TW',
        currency: 'TWD',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: 'NT$',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'en-US': {
        code: 'en-US',
        name: 'English',
        englishName: 'English (US)',
        rtl: false,
        direction: 'ltr',
        country: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'h:mm:ss A',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: '$',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'en-GB': {
        code: 'en-GB',
        name: 'English',
        englishName: 'English (UK)',
        rtl: false,
        direction: 'ltr',
        country: 'GB',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: '£',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'ja-JP': {
        code: 'ja-JP',
        name: '日本語',
        englishName: 'Japanese',
        rtl: false,
        direction: 'ltr',
        country: 'JP',
        currency: 'JPY',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 0,
          currencySymbol: '¥',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'ko-KR': {
        code: 'ko-KR',
        name: '한국어',
        englishName: 'Korean',
        rtl: false,
        direction: 'ltr',
        country: 'KR',
        currency: 'KRW',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 0,
          currencySymbol: '₩',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'fr-FR': {
        code: 'fr-FR',
        name: 'Français',
        englishName: 'French',
        rtl: false,
        direction: 'ltr',
        country: 'FR',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: ' ',
          decimalPlaces: 2,
          currencySymbol: '€',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'de-DE': {
        code: 'de-DE',
        name: 'Deutsch',
        englishName: 'German',
        rtl: false,
        direction: 'ltr',
        country: 'DE',
        currency: 'EUR',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: '.',
          decimalPlaces: 2,
          currencySymbol: '€',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'es-ES': {
        code: 'es-ES',
        name: 'Español',
        englishName: 'Spanish',
        rtl: false,
        direction: 'ltr',
        country: 'ES',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: '.',
          decimalPlaces: 2,
          currencySymbol: '€',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'it-IT': {
        code: 'it-IT',
        name: 'Italiano',
        englishName: 'Italian',
        rtl: false,
        direction: 'ltr',
        country: 'IT',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: '.',
          decimalPlaces: 2,
          currencySymbol: '€',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'pt-BR': {
        code: 'pt-BR',
        name: 'Português',
        englishName: 'Portuguese (Brazil)',
        rtl: false,
        direction: 'ltr',
        country: 'BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: '.',
          decimalPlaces: 2,
          currencySymbol: 'R$',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'ru-RU': {
        code: 'ru-RU',
        name: 'Русский',
        englishName: 'Russian',
        rtl: false,
        direction: 'ltr',
        country: 'RU',
        currency: 'RUB',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: ' ',
          decimalPlaces: 2,
          currencySymbol: '₽',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'ar-SA': {
        code: 'ar-SA',
        name: 'العربية',
        englishName: 'Arabic',
        rtl: true,
        direction: 'rtl',
        country: 'SA',
        currency: 'SAR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: 'ر.س',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'hi-IN': {
        code: 'hi-IN',
        name: 'हिन्दी',
        englishName: 'Hindi',
        rtl: false,
        direction: 'ltr',
        country: 'IN',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: '₹',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'th-TH': {
        code: 'th-TH',
        name: 'ไทย',
        englishName: 'Thai',
        rtl: false,
        direction: 'ltr',
        country: 'TH',
        currency: 'THB',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimalPlaces: 2,
          currencySymbol: '฿',
          currencyPosition: 'before'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      },
      'vi-VN': {
        code: 'vi-VN',
        name: 'Tiếng Việt',
        englishName: 'Vietnamese',
        rtl: false,
        direction: 'ltr',
        country: 'VN',
        currency: 'VND',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
          decimalSeparator: ',',
          thousandsSeparator: '.',
          decimalPlaces: 0,
          currencySymbol: '₫',
          currencyPosition: 'after'
        },
        loaded: this.isResourceLoaded(locale, this.config.defaultNamespace)
      }
    }

    return localeInfoMap[locale] || null
  }

  /**
   * 加载翻译资源
   */
  async loadResource(locale: SupportedLocale, namespace: string): Promise<void> {
    const resourceKey = this.getResourceKey(locale, namespace)
    
    if (this.resources.has(resourceKey)) {
      return // 资源已加载
    }

    try {
      // 尝试从各个加载器加载资源
      let resource: TranslationResource | null = null
      
      for (const loader of this.resourceLoaders) {
        try {
          const url = this.buildResourceUrl(locale, namespace)
          if (await loader.exists(url, locale, namespace)) {
            resource = await loader.load(url, locale, namespace)
            break
          }
        } catch (error) {
          if (this.config.debug) {
            console.warn(`加载器 ${loader.name} 加载失败:`, error)
          }
        }
      }

      if (!resource) {
        // 如果没有找到资源，创建空资源
        resource = {
          locale,
          namespace,
          translations: {},
          version: '1.0.0',
          lastUpdated: Date.now()
        }
      }

      this.resources.set(resourceKey, resource)
      
      // 触发资源加载事件
      this.emit('resourceLoaded', { locale, namespace, resource })
      
      if (this.config.debug) {
        console.log(`资源已加载: ${resourceKey}`)
      }
    } catch (error) {
      console.error(`加载资源失败: ${resourceKey}`, error)
      this.emit('error', { error, context: { locale, namespace } })
    }
  }

  /**
   * 卸载翻译资源
   */
  unloadResource(locale: SupportedLocale, namespace: string): void {
    const resourceKey = this.getResourceKey(locale, namespace)
    
    if (this.resources.delete(resourceKey)) {
      this.emit('resourceUnloaded', { locale, namespace })
      
      if (this.config.debug) {
        console.log(`资源已卸载: ${resourceKey}`)
      }
    }
  }

  /**
   * 检查资源是否已加载
   */
  isResourceLoaded(locale: SupportedLocale, namespace: string): boolean {
    const resourceKey = this.getResourceKey(locale, namespace)
    return this.resources.has(resourceKey)
  }

  /**
   * 翻译文本
   */
  t(key: TranslationKey, options: TranslationOptions = {}): string {
    const {
      defaultValue = key,
      params = {},
      count,
      context,
      namespace = this.config.defaultNamespace,
      escapeHtml = this.config.interpolation.escapeValue
    } = options

    try {
      // 构建完整的键路径
      let fullKey = key
      if (context) {
        fullKey += this.config.contextSeparator + context
      }
      if (count !== undefined) {
        const pluralForm = this.getPluralForm(count, this.currentLocale)
        fullKey += this.config.pluralSeparator + pluralForm
      }

      // 查找翻译
      let translation = this.findTranslation(fullKey, namespace, this.currentLocale)
      
      // 如果没找到，尝试回退语言
      if (translation === null && this.currentLocale !== this.config.fallbackLocale) {
        translation = this.findTranslation(fullKey, namespace, this.config.fallbackLocale)
      }

      // 如果还是没找到，使用缺失处理器
      if (translation === null) {
        translation = this.handleMissingTranslation(this.currentLocale, namespace, key, defaultValue)
      }

      // 处理插值
      if (translation && Object.keys(params).length > 0) {
        translation = this.interpolate(translation, params, escapeHtml)
      }

      return translation || defaultValue
    } catch (error) {
      console.error('翻译失败:', error)
      this.emit('error', { error, context: { key, options } })
      return defaultValue
    }
  }

  /**
   * 检查翻译是否存在
   */
  exists(key: TranslationKey, options: { namespace?: string } = {}): boolean {
    const namespace = options.namespace || this.config.defaultNamespace
    return this.findTranslation(key, namespace, this.currentLocale) !== null
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date, options: DateTimeFormatOptions = {}): string {
    const formatter = this.getDateTimeFormatter({ ...options, timeStyle: undefined })
    return formatter.format(date)
  }

  /**
   * 格式化时间
   */
  formatTime(date: Date, options: DateTimeFormatOptions = {}): string {
    const formatter = this.getDateTimeFormatter({ ...options, dateStyle: undefined })
    return formatter.format(date)
  }

  /**
   * 格式化日期时间
   */
  formatDateTime(date: Date, options: DateTimeFormatOptions = {}): string {
    const formatter = this.getDateTimeFormatter(options)
    return formatter.format(date)
  }

  /**
   * 格式化数字
   */
  formatNumber(number: number, options: Intl.NumberFormatOptions = {}): string {
    const formatter = this.getNumberFormatter(options)
    return formatter.format(number)
  }

  /**
   * 格式化货币
   */
  formatCurrency(amount: number, options: CurrencyFormatOptions): string {
    const formatter = this.getNumberFormatter({
      style: 'currency',
      currency: options.currency,
      currencyDisplay: options.currencyDisplay,
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits
    })
    return formatter.format(amount)
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const formatter = new Intl.RelativeTimeFormat(this.currentLocale)
    return formatter.format(value, unit)
  }

  /**
   * 复数处理
   */
  plural(key: TranslationKey, count: number, options: TranslationOptions = {}): string {
    return this.t(key, { ...options, count })
  }

  /**
   * 注册资源加载器
   */
  registerResourceLoader(loader: ResourceLoader): void {
    this.resourceLoaders.push(loader)
    console.log(`已注册资源加载器: ${loader.name}`)
  }

  /**
   * 注册语言检测器
   */
  registerLanguageDetector(detector: LanguageDetector): void {
    this.languageDetectors.push(detector)
    console.log(`已注册语言检测器: ${detector.name}`)
  }

  /**
   * 注册缺失翻译处理器
   */
  registerMissingTranslationHandler(handler: MissingTranslationHandler): void {
    this.missingHandlers.push(handler)
    console.log(`已注册缺失翻译处理器: ${handler.name}`)
  }

  /**
   * 注册内置组件
   */
  private registerBuiltinComponents(): void {
    // 注册内置资源加载器
    // 注册内置语言检测器
    // 注册内置缺失处理器
    console.log('注册内置组件...')
  }

  /**
   * 检测语言
   */
  private detectLanguage(): SupportedLocale | null {
    for (const detector of this.languageDetectors.sort((a, b) => b.priority - a.priority)) {
      const detected = detector.detect()
      if (detected && this.config.supportedLocales.includes(detected)) {
        return detected
      }
    }
    return null
  }

  /**
   * 预加载资源
   */
  private async preloadResources(): Promise<void> {
    const { locales, namespaces } = this.config.preload
    
    for (const locale of locales) {
      for (const namespace of namespaces) {
        try {
          await this.loadResource(locale, namespace)
        } catch (error) {
          console.warn(`预加载资源失败: ${locale}:${namespace}`, error)
        }
      }
    }
  }

  /**
   * 缓存语言设置
   */
  private cacheLanguageSetting(locale: SupportedLocale): void {
    for (const detector of this.languageDetectors) {
      try {
        detector.cache(locale)
      } catch (error) {
        console.warn('缓存语言设置失败:', error)
      }
    }
  }

  /**
   * 获取资源键
   */
  private getResourceKey(locale: SupportedLocale, namespace: string): string {
    return `${locale}${this.config.namespaceSeparator}${namespace}`
  }

  /**
   * 构建资源URL
   */
  private buildResourceUrl(locale: SupportedLocale, namespace: string): string {
    return this.config.resourcePath
      .replace('{{locale}}', locale)
      .replace('{{namespace}}', namespace)
  }

  /**
   * 查找翻译
   */
  private findTranslation(key: TranslationKey, namespace: string, locale: SupportedLocale): string | null {
    const resourceKey = this.getResourceKey(locale, namespace)
    const resource = this.resources.get(resourceKey)
    
    if (!resource) {
      return null
    }

    const keys = key.split(this.config.keySeparator)
    let current = resource.translations
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return null
      }
    }

    return typeof current === 'string' ? current : null
  }

  /**
   * 处理缺失的翻译
   */
  private handleMissingTranslation(
    locale: SupportedLocale,
    namespace: string,
    key: TranslationKey,
    defaultValue?: string
  ): string {
    // 触发缺失翻译事件
    this.emit('translationMissing', { locale, namespace, key, defaultValue })

    // 使用缺失处理器
    for (const handler of this.missingHandlers) {
      try {
        const result = handler.handle(locale, namespace, key, defaultValue)
        if (result) {
          return result
        }
      } catch (error) {
        console.warn(`缺失处理器 ${handler.name} 处理失败:`, error)
      }
    }

    return defaultValue || key
  }

  /**
   * 插值处理
   */
  private interpolate(template: string, params: TranslationParams, escapeHtml: boolean): string {
    const { prefix, suffix } = this.config.interpolation
    
    return template.replace(
      new RegExp(`${this.escapeRegex(prefix)}([^${this.escapeRegex(suffix)}]+)${this.escapeRegex(suffix)}`, 'g'),
      (match, key) => {
        const value = params[key.trim()]
        if (value === undefined || value === null) {
          return match
        }
        
        let result = String(value)
        if (escapeHtml) {
          result = this.escapeHtml(result)
        }
        
        return result
      }
    )
  }

  /**
   * 获取复数形式
   */
  private getPluralForm(count: number, locale: SupportedLocale): string {
    // 简化的复数规则，实际应该根据语言实现更复杂的规则
    if (locale.startsWith('zh')) {
      return 'other' // 中文没有复数形式
    }
    
    return count === 1 ? 'one' : 'other'
  }

  /**
   * 获取日期时间格式化器
   */
  private getDateTimeFormatter(options: DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${this.currentLocale}-${JSON.stringify(options)}`
    
    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.DateTimeFormat(this.currentLocale, options))
    }
    
    return this.formatters.get(key)!
  }

  /**
   * 获取数字格式化器
   */
  private getNumberFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `${this.currentLocale}-${JSON.stringify(options)}`
    
    if (!this.numberFormatters.has(key)) {
      this.numberFormatters.set(key, new Intl.NumberFormat(this.currentLocale, options))
    }
    
    return this.numberFormatters.get(key)!
  }

  /**
   * 转义正则表达式
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 转义HTML
   */
  private escapeHtml(str: string): string {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }
}
