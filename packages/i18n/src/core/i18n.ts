import type {
  BatchTranslationResult,
  Detector,
  I18nEventListener,
  I18nEventType,
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  Loader,
  LRUCache,
  NestedObject,
  Storage,
  TranslationOptions,
  TranslationParams,
} from './types'
import { hasInterpolation, interpolate } from '../utils/interpolation'
import { getNestedValue } from '../utils/path'
import { hasPluralExpression, processPluralization } from '../utils/pluralization'
import { createDetector } from './detector'
import { DefaultLoader } from './loader'
import { createStorage, LRUCacheImpl } from './storage'

/**
 * 默认配置选项
 */
const DEFAULT_OPTIONS: Required<Omit<I18nOptions, 'onLanguageChanged' | 'onLoadError'>> = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  storage: 'localStorage',
  storageKey: 'i18n-locale',
  autoDetect: true,
  preload: [],
  cache: {
    enabled: true,
    maxSize: 1000,
  },
}

/**
 * I18n 主类实现
 */
export class I18n implements I18nInstance {
  private options: Required<Omit<I18nOptions, 'onLanguageChanged' | 'onLoadError'>> & {
    onLanguageChanged?: (locale: string) => void
    onLoadError?: (locale: string, error: Error) => void
  }

  private currentLocale: string
  public loader: Loader
  private storage: Storage
  private detector: Detector
  private cache: LRUCache<string>
  private eventListeners = new Map<I18nEventType, Set<I18nEventListener>>()
  private isInitialized = false

  // 对象池，减少对象创建开销
  private readonly emptyParams: TranslationParams = Object.freeze({})
  private readonly emptyOptions: TranslationOptions = Object.freeze({})

  constructor(options: I18nOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.currentLocale = this.options.defaultLocale!

    // 初始化组件
    this.loader = new DefaultLoader()
    this.storage = createStorage(this.options.storage, this.options.storageKey)
    this.detector = createDetector('browser')
    this.cache = new LRUCacheImpl(this.options.cache.maxSize)

    // 绑定翻译函数的 this 上下文
    this.t = this.t.bind(this)
  }

  /**
   * 初始化 I18n 实例
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 确定初始语言
      let initialLocale = this.options.defaultLocale

      // 1. 从存储中获取
      if (this.options.storage !== 'none') {
        const storedLocale = this.storage.getLanguage()
        if (storedLocale) {
          initialLocale = storedLocale
        }
      }

      // 2. 自动检测浏览器语言
      if (this.options.autoDetect && !this.storage.getLanguage()) {
        const detectedLanguages = this.detector.detect()
        const availableLocales = (this.loader as Loader & { getAvailableLocales?: () => string[] }).getAvailableLocales?.() || []

        for (const detected of detectedLanguages) {
          if (availableLocales.includes(detected)) {
            initialLocale = detected
            break
          }

          // 尝试匹配主语言
          const mainLang = detected.split('-')[0]
          const match = availableLocales.find(locale => locale.startsWith(mainLang))
          if (match) {
            initialLocale = match
            break
          }
        }
      }

      // 预加载指定的语言
      if (this.options.preload.length > 0) {
        await Promise.all(
          this.options.preload.map(locale =>
            this.loader.preload(locale).catch((error) => {
              console.warn(`Failed to preload language '${locale}':`, error)
            }),
          ),
        )
      }

      // 切换到初始语言（强制加载）
      await this.forceChangeLanguage(initialLocale)

      this.isInitialized = true
    }
    catch (error) {
      console.error('Failed to initialize I18n:', error)
      throw error
    }
  }

  /**
   * 切换语言
   * @param locale 语言代码
   */
  async changeLanguage(locale: string): Promise<void> {
    if (locale === this.currentLocale) {
      return
    }

    await this.forceChangeLanguage(locale)
  }

  /**
   * 强制切换语言（即使是相同语言也会重新加载）
   * @param locale 语言代码
   */
  private async forceChangeLanguage(locale: string): Promise<void> {
    try {
      // 加载语言包
      await this.loader.load(locale)

      const previousLocale = this.currentLocale
      this.currentLocale = locale

      // 清除缓存
      if (this.options.cache.enabled) {
        this.cache.clear()
      }

      // 保存到存储
      if (this.options.storage !== 'none') {
        this.storage.setLanguage(locale)
      }

      // 触发事件
      this.emit('languageChanged', locale, previousLocale)

      // 调用回调
      if (this.options.onLanguageChanged) {
        this.options.onLanguageChanged(locale)
      }
    }
    catch (error) {
      // 触发错误事件
      this.emit('loadError', locale, error)

      // 调用错误回调
      if (this.options.onLoadError) {
        this.options.onLoadError(locale, error as Error)
      }

      throw error
    }
  }

  /**
   * 翻译函数
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  t<T = string>(
    key: string,
    params: TranslationParams = this.emptyParams,
    options: TranslationOptions = this.emptyOptions,
  ): T {
    // 快速路径：如果没有参数且没有特殊选项，直接查找简单翻译
    const hasParams = Object.keys(params).length > 0
    const hasOptions = Object.keys(options).length > 0

    if (!hasParams && !hasOptions && this.options.cache.enabled) {
      // 使用简化的缓存键
      const simpleCacheKey = `${this.currentLocale}:${key}`
      const cached = this.cache.get(simpleCacheKey)
      if (cached !== undefined) {
        return cached as T
      }

      // 快速翻译查找
      const text = this.getTranslationText(key, this.currentLocale)
      if (text !== undefined && !hasInterpolation(text) && !hasPluralExpression(text)) {
        this.cache.set(simpleCacheKey, text)
        return text as T
      }
    }

    // 标准路径：生成完整缓存键
    const cacheKey = this.generateCacheKey(key, params, options, this.currentLocale)

    // 尝试从缓存获取
    if (this.options.cache.enabled) {
      const cached = this.cache.get(cacheKey)
      if (cached !== undefined) {
        return cached as T
      }
    }

    // 执行翻译
    const result = this.performTranslation(key, params, options)

    // 缓存结果
    if (this.options.cache.enabled) {
      this.cache.set(cacheKey, result)
    }

    return result as T
  }

  /**
   * 批量翻译
   * @param keys 翻译键数组
   * @param params 插值参数
   * @returns 翻译结果对象
   */
  batchTranslate(keys: string[], params: TranslationParams = {}): BatchTranslationResult {
    const result: BatchTranslationResult = {}

    for (const key of keys) {
      result[key] = this.t(key, params)
    }

    return result
  }

  /**
   * 获取可用语言列表
   * @returns 语言信息数组
   */
  getAvailableLanguages(): LanguageInfo[] {
    const loaderWithMethods = this.loader as Loader & {
      getAvailableLocales?: () => string[]
      getLoadedPackage?: (locale: string) => { info: LanguageInfo } | undefined
    }
    const availableLocales = loaderWithMethods.getAvailableLocales?.() || []
    const languages: LanguageInfo[] = []

    for (const locale of availableLocales) {
      const packageData = loaderWithMethods.getLoadedPackage?.(locale)
      if (packageData) {
        languages.push(packageData.info)
      }
    }

    return languages
  }

  /**
   * 获取当前语言
   * @returns 当前语言代码
   */
  getCurrentLanguage(): string {
    return this.currentLocale
  }

  /**
   * 预加载语言
   * @param locale 语言代码
   */
  async preloadLanguage(locale: string): Promise<void> {
    await this.loader.preload(locale)
  }

  /**
   * 检查语言是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLanguageLoaded(locale: string): boolean {
    return this.loader.isLoaded(locale)
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.cache.clear()
    this.eventListeners.clear()
    this.isInitialized = false
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event: I18nEventType, listener: I18nEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event: I18nEventType, listener: I18nEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param args 事件参数
   */
  emit(event: I18nEventType, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args)
        }
        catch (error) {
          console.error(`Error in event listener for '${event}':`, error)
        }
      }
    }
  }

  /**
   * 执行翻译
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  private performTranslation(
    key: string,
    params: TranslationParams,
    options: TranslationOptions,
  ): string {
    // 获取翻译文本
    let text = this.getTranslationText(key, this.currentLocale)

    // 如果没有找到，尝试降级语言
    if (text === undefined && this.options.fallbackLocale && this.options.fallbackLocale !== this.currentLocale) {
      text = this.getTranslationText(key, this.options.fallbackLocale)
    }

    // 如果仍然没有找到，使用默认值或键名
    if (text === undefined) {
      text = options.defaultValue || key
    }

    // 处理复数
    if (hasPluralExpression(text)) {
      text = processPluralization(text, params, this.currentLocale)
    }

    // 处理插值
    if (hasInterpolation(text)) {
      text = interpolate(text, params, {
        escapeValue: options.escapeValue,
      })
    }

    return text
  }

  /**
   * 获取翻译文本
   * @param key 翻译键
   * @param locale 语言代码
   * @returns 翻译文本或 undefined
   */
  private getTranslationText(key: string, locale: string): string | undefined {
    const packageData = (this.loader as Loader & { getLoadedPackage?: (locale: string) => { translations: Record<string, unknown> } | undefined }).getLoadedPackage?.(locale)
    if (!packageData) {
      return undefined
    }

    return getNestedValue(packageData.translations as NestedObject, key)
  }

  /**
   * 生成缓存键
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @param locale 语言代码
   * @returns 缓存键
   */
  private generateCacheKey(
    key: string,
    params: TranslationParams,
    options: TranslationOptions,
    locale: string,
  ): string {
    // 优化：避免JSON.stringify的开销，使用更快的字符串拼接
    let cacheKey = `${locale}:${key}`

    const paramKeys = Object.keys(params)
    if (paramKeys.length > 0) {
      // 按键排序以确保一致性
      paramKeys.sort()
      cacheKey += ':p:'
      for (let i = 0; i < paramKeys.length; i++) {
        const k = paramKeys[i]
        cacheKey += `${k}=${params[k]}`
        if (i < paramKeys.length - 1) cacheKey += ','
      }
    }

    const optionKeys = Object.keys(options)
    if (optionKeys.length > 0) {
      optionKeys.sort()
      cacheKey += ':o:'
      for (let i = 0; i < optionKeys.length; i++) {
        const k = optionKeys[i]
        cacheKey += `${k}=${(options as Record<string, unknown>)[k]}`
        if (i < optionKeys.length - 1) cacheKey += ','
      }
    }

    return cacheKey
  }

  /**
   * 设置自定义加载器
   * @param loader 加载器实例
   */
  setLoader(loader: Loader): void {
    this.loader = loader
  }

  /**
   * 设置自定义存储
   * @param storage 存储实例
   */
  setStorage(storage: Storage): void {
    this.storage = storage
  }

  /**
   * 设置自定义检测器
   * @param detector 检测器实例
   */
  setDetector(detector: Detector): void {
    this.detector = detector
  }

  /**
   * 获取当前语言包信息
   * @returns 语言信息或 undefined
   */
  getCurrentLanguageInfo(): LanguageInfo | undefined {
    const packageData = (this.loader as Loader & { getLoadedPackage?: (locale: string) => { info: LanguageInfo } | undefined }).getLoadedPackage?.(this.currentLocale)
    return packageData?.info
  }

  /**
   * 检查翻译键是否存在
   * @param key 翻译键
   * @param locale 语言代码，默认为当前语言
   * @returns 是否存在
   */
  exists(key: string, locale?: string): boolean {
    const targetLocale = locale || this.currentLocale
    const text = this.getTranslationText(key, targetLocale)
    return text !== undefined
  }

  /**
   * 获取所有翻译键
   * @param locale 语言代码，默认为当前语言
   * @returns 翻译键数组
   */
  getKeys(locale?: string): string[] {
    const targetLocale = locale || this.currentLocale
    const packageData = (this.loader as Loader & { getLoadedPackage?: (locale: string) => { translations: Record<string, unknown> } | undefined }).getLoadedPackage?.(targetLocale)
    if (!packageData) {
      return []
    }

    return this.getAllKeysFromObject(packageData.translations)
  }

  /**
   * 从嵌套对象中获取所有键
   * @param obj 嵌套对象
   * @param prefix 键前缀
   * @returns 键数组
   */
  private getAllKeysFromObject(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'string') {
        keys.push(fullKey)
      }
      else if (typeof value === 'object' && value !== null) {
        keys.push(...this.getAllKeysFromObject(value as Record<string, unknown>, fullKey))
      }
    }

    return keys
  }
}
