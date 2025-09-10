/**
 * 内置翻译加载器
 * 
 * 负责加载内置翻译并与用户翻译合并
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type { Loader, LanguagePackage, NestedObject, LanguageInfo } from './types'
import { getBuiltInTranslation, hasBuiltInTranslation } from '../locales'
import { mergeLanguagePackages, MergeStrategy, type MergeOptions } from './merger'
import { I18nError, LanguageLoadError } from './errors'
import { LanguageRegistry, type LanguageConfig, type LanguageFilter } from './language-config'

/**
 * 内置加载器配置选项
 */
export interface BuiltInLoaderOptions {
  /** 用户自定义翻译 */
  userMessages?: Record<string, Record<string, any>>
  /** 自定义加载器（用于加载用户翻译） */
  customLoader?: Loader
  /** 合并选项 */
  mergeOptions?: MergeOptions
  /** 是否使用内置翻译 */
  useBuiltIn?: boolean
  /** 是否优先使用内置翻译 */
  preferBuiltIn?: boolean
  /** 降级到内置翻译 */
  fallbackToBuiltIn?: boolean
  /** 内置翻译的命名空间 */
  builtInNamespace?: string
  /** 语言配置 - 新增 */
  languageConfig?: LanguageConfig
  /** 启用的语言过滤器 - 新增 */
  enabledLanguages?: LanguageFilter
  /** 是否严格模式（只加载启用的语言） - 新增 */
  strictMode?: boolean
}

/**
 * 内置翻译加载器
 * 
 * 整合内置翻译和用户自定义翻译的加载器
 */
export class BuiltInLoader implements Loader {
  private loadedPackages = new Map<string, LanguagePackage>()
  private userMessages: Record<string, Record<string, any>>
  private customLoader?: Loader
  private mergeOptions: MergeOptions
  private useBuiltIn: boolean
  private preferBuiltIn: boolean
  private fallbackToBuiltIn: boolean
  private builtInNamespace?: string
  private languageRegistry: LanguageRegistry
  private strictMode: boolean

  constructor(options: BuiltInLoaderOptions = {}) {
    this.userMessages = options.userMessages || {}
    this.customLoader = options.customLoader
    this.useBuiltIn = options.useBuiltIn !== false
    this.preferBuiltIn = options.preferBuiltIn || false
    this.fallbackToBuiltIn = options.fallbackToBuiltIn !== false
    this.builtInNamespace = options.builtInNamespace
    this.strictMode = options.strictMode || false

    // 初始化语言注册表
    this.languageRegistry = new LanguageRegistry(options.languageConfig)

    // 如果指定了启用的语言过滤器，更新注册表配置
    if (options.enabledLanguages) {
      this.languageRegistry.updateConfig({
        enabled: options.enabledLanguages
      })
    }

    // 设置默认合并选项
    this.mergeOptions = {
      strategy: this.preferBuiltIn ? MergeStrategy.BUILTIN_FIRST : MergeStrategy.USER_FIRST,
      clone: true,
      ...options.mergeOptions
    }
  }

  /**
   * 加载语言包
   */
  async load(locale: string): Promise<LanguagePackage> {
    // 检查语言是否启用（严格模式下）
    if (this.strictMode && !this.languageRegistry.isLanguageEnabled(locale)) {
      throw new I18nError(
        `Language '${locale}' is not enabled in strict mode`,
        'LANGUAGE_NOT_ENABLED',
        { context: { locale, custom: { enabledLanguages: this.languageRegistry.getEnabledLanguages() } } }
      )
    }

    // 检查缓存
    if (this.loadedPackages.has(locale)) {
      return this.loadedPackages.get(locale)!
    }

    let finalPackage: LanguagePackage | undefined

    try {
      // 1. 加载内置翻译（考虑语言启用状态）
      const builtInPackage = this.useBuiltIn && this.shouldLoadBuiltIn(locale)
        ? await this.loadBuiltIn(locale)
        : undefined

      // 2. 加载用户翻译
      const userPackage = await this.loadUser(locale)

      // 3. 合并翻译
      if (builtInPackage && userPackage) {
        // 两者都存在，进行合并
        finalPackage = this.mergePackages(builtInPackage, userPackage)
      } else if (userPackage) {
        // 只有用户翻译
        finalPackage = userPackage
      } else if (builtInPackage && this.fallbackToBuiltIn) {
        // 只有内置翻译且允许降级
        finalPackage = builtInPackage
      }

      if (!finalPackage) {
        throw new I18nError(
          `No translation found for locale: ${locale}`,
          'TRANSLATION_NOT_FOUND',
          { context: { locale } }
        )
      }

      // 缓存结果
      this.loadedPackages.set(locale, finalPackage)
      return finalPackage

    } catch (error) {
      // 错误处理
      if (error instanceof I18nError) {
        throw error
      }

      throw new LanguageLoadError(locale, error as Error)
    }
  }

  /**
   * 预加载语言包
   */
  async preload(locale: string): Promise<void> {
    await this.load(locale)
  }

  /**
   * 检查语言包是否已加载
   */
  isLoaded(locale: string): boolean {
    return this.loadedPackages.has(locale)
  }

  /**
   * 获取已加载的语言包
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }

  /**
   * 加载内置翻译
   */
  private async loadBuiltIn(locale: string): Promise<LanguagePackage | undefined> {
    const builtIn = getBuiltInTranslation(locale)

    if (!builtIn) {
      // 尝试降级到基础语言（如 zh-CN -> zh）
      const baseLang = locale.split('-')[0]
      if (baseLang !== locale) {
        return this.loadBuiltIn(baseLang)
      }
      return undefined
    }

    // 如果设置了命名空间，将内置翻译放入命名空间
    if (this.builtInNamespace) {
      return {
        info: builtIn.info,
        translations: {
          [this.builtInNamespace]: builtIn.translations as unknown as NestedObject
        } as NestedObject
      }
    }

    return {
      info: builtIn.info,
      translations: builtIn.translations as unknown as NestedObject
    }
  }

  /**
   * 加载用户翻译
   */
  private async loadUser(locale: string): Promise<LanguagePackage | undefined> {
    // 1. 从用户提供的静态翻译中加载
    if (this.userMessages[locale]) {
      return this.createPackageFromMessages(locale, this.userMessages[locale])
    }

    // 2. 使用自定义加载器加载
    if (this.customLoader) {
      try {
        return await this.customLoader.load(locale)
      } catch (error) {
        // 自定义加载器失败，继续尝试其他方式
        console.warn(`Custom loader failed for locale ${locale}:`, error)
      }
    }

    // 3. 尝试降级到基础语言
    const baseLang = locale.split('-')[0]
    if (baseLang !== locale) {
      if (this.userMessages[baseLang]) {
        return this.createPackageFromMessages(baseLang, this.userMessages[baseLang])
      }

      if (this.customLoader) {
        try {
          return await this.customLoader.load(baseLang)
        } catch (error) {
          console.warn(`Custom loader failed for base locale ${baseLang}:`, error)
        }
      }
    }

    return undefined
  }

  /**
   * 从消息对象创建语言包
   */
  private createPackageFromMessages(
    locale: string,
    messages: Record<string, any>
  ): LanguagePackage {
    // 尝试从内置翻译获取语言信息
    const builtIn = getBuiltInTranslation(locale)
    const info: LanguageInfo = builtIn?.info || {
      name: locale,
      nativeName: locale,
      code: locale,
      direction: 'ltr',
      dateFormat: 'YYYY-MM-DD'
    }

    return {
      info,
      translations: messages as NestedObject
    }
  }

  /**
   * 合并语言包
   */
  private mergePackages(
    builtIn: LanguagePackage,
    user: LanguagePackage
  ): LanguagePackage {
    return mergeLanguagePackages(builtIn, user, this.mergeOptions)
  }

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.loadedPackages.delete(locale)
    } else {
      this.loadedPackages.clear()
    }
  }

  /**
   * 更新用户翻译
   */
  updateUserMessages(locale: string, messages: Record<string, any>): void {
    this.userMessages[locale] = messages
    // 清除该语言的缓存，以便下次重新加载
    this.clearCache(locale)
  }

  /**
   * 批量更新用户翻译
   */
  updateAllUserMessages(messages: Record<string, Record<string, any>>): void {
    this.userMessages = messages
    // 清除所有缓存
    this.clearCache()
  }

  /**
   * 获取所有已加载的语言列表
   */
  getLoadedLocales(): string[] {
    return Array.from(this.loadedPackages.keys())
  }

  /**
   * 获取可用的语言列表
   */
  async getAvailableLocales(): Promise<string[]> {
    const locales = new Set<string>()



    // 添加内置语言
    if (this.useBuiltIn) {
      try {
        const builtInLocales = await import('../locales').then(m => m.getBuiltInLocales())
        builtInLocales.forEach(locale => locales.add(locale))
      } catch (error) {
        console.warn('[BuiltInLoader] Failed to load built-in locales:', error)
      }
    }

    // 添加用户语言
    Object.keys(this.userMessages).forEach(locale => locales.add(locale))

    // 如果有自定义加载器，可能还有其他语言
    // 这里无法确定，所以只返回已知的

    return Array.from(locales)
  }

  /**
   * 检查是否有指定语言的翻译
   */
  async hasTranslation(locale: string): Promise<boolean> {
    // 检查缓存
    if (this.isLoaded(locale)) {
      return true
    }

    // 检查内置翻译
    if (this.useBuiltIn && hasBuiltInTranslation(locale)) {
      return true
    }

    // 检查用户翻译
    if (this.userMessages[locale]) {
      return true
    }

    // 检查自定义加载器
    if (this.customLoader) {
      try {
        await this.customLoader.load(locale)
        return true
      } catch {
        // 加载失败
      }
    }

    // 尝试基础语言
    const baseLang = locale.split('-')[0]
    if (baseLang !== locale) {
      return this.hasTranslation(baseLang)
    }

    return false
  }

  /**
   * 获取语言包的统计信息
   */
  async getStats(locale: string): Promise<{
    hasBuiltIn: boolean
    hasUser: boolean
    builtInKeys?: number
    userKeys?: number
    totalKeys?: number
  }> {
    const stats: any = {
      hasBuiltIn: false,
      hasUser: false
    }

    // 检查内置翻译
    const builtIn = this.useBuiltIn ? await this.loadBuiltIn(locale) : undefined
    if (builtIn) {
      stats.hasBuiltIn = true
      stats.builtInKeys = this.countKeys(builtIn.translations)
    }

    // 检查用户翻译
    const user = await this.loadUser(locale)
    if (user) {
      stats.hasUser = true
      stats.userKeys = this.countKeys(user.translations)
    }

    // 如果已加载，获取总键数
    const loaded = this.getLoadedPackage(locale)
    if (loaded) {
      stats.totalKeys = this.countKeys(loaded.translations)
    }

    return stats
  }

  /**
   * 计算翻译键的数量
   */
  private countKeys(obj: NestedObject, count = 0): number {
    for (const key in obj) {
      const value = obj[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count = this.countKeys(value as NestedObject, count)
      } else {
        count++
      }
    }
    return count
  }

  /**
   * 检查是否应该加载内置翻译
   *
   * @param locale 语言代码
   * @returns 是否应该加载
   */
  private shouldLoadBuiltIn(locale: string): boolean {
    // 如果不是严格模式，总是尝试加载内置翻译
    if (!this.strictMode) {
      return true
    }

    // 严格模式下，只加载启用的语言
    return this.languageRegistry.isLanguageEnabled(locale)
  }

  /**
   * 获取启用的语言列表
   *
   * @returns 启用的语言列表
   */
  getEnabledLanguages(): string[] {
    return this.languageRegistry.getEnabledLanguages()
  }

  /**
   * 获取所有可用语言列表
   *
   * @returns 可用语言列表
   */
  getAvailableLanguages(): string[] {
    return this.languageRegistry.getAvailableLanguages()
  }

  /**
   * 检查语言是否启用
   *
   * @param locale 语言代码
   * @returns 是否启用
   */
  isLanguageEnabled(locale: string): boolean {
    return this.languageRegistry.isLanguageEnabled(locale)
  }

  /**
   * 启用语言
   *
   * @param locale 语言代码
   * @returns 是否成功启用
   */
  enableLanguage(locale: string): boolean {
    const result = this.languageRegistry.enableLanguage(locale)
    if (result) {
      // 清除缓存，强制重新加载
      this.loadedPackages.delete(locale)
    }
    return result
  }

  /**
   * 禁用语言
   *
   * @param locale 语言代码
   * @returns 是否成功禁用
   */
  disableLanguage(locale: string): boolean {
    const result = this.languageRegistry.disableLanguage(locale)
    if (result) {
      // 清除缓存
      this.loadedPackages.delete(locale)
    }
    return result
  }

  /**
   * 批量启用语言
   *
   * @param locales 语言代码列表
   * @returns 成功启用的语言列表
   */
  enableLanguages(locales: string[]): string[] {
    const enabled: string[] = []
    for (const locale of locales) {
      if (this.enableLanguage(locale)) {
        enabled.push(locale)
      }
    }
    return enabled
  }

  /**
   * 批量禁用语言
   *
   * @param locales 语言代码列表
   * @returns 成功禁用的语言列表
   */
  disableLanguages(locales: string[]): string[] {
    const disabled: string[] = []
    for (const locale of locales) {
      if (this.disableLanguage(locale)) {
        disabled.push(locale)
      }
    }
    return disabled
  }

  /**
   * 过滤语言列表
   *
   * 根据当前配置过滤语言列表，只返回启用的语言
   *
   * @param locales 要过滤的语言列表
   * @returns 过滤后的语言列表
   */
  filterLanguages(locales: string[]): string[] {
    if (!this.strictMode) {
      return locales
    }

    return locales.filter(locale => this.languageRegistry.isLanguageEnabled(locale))
  }

  /**
   * 更新语言配置
   *
   * @param config 新的语言配置
   */
  updateLanguageConfig(config: LanguageConfig): void {
    this.languageRegistry.updateConfig(config)

    // 清除所有缓存，强制重新加载
    this.loadedPackages.clear()
  }

  /**
   * 获取语言注册表
   *
   * @returns 语言注册表实例
   */
  getLanguageRegistry(): LanguageRegistry {
    return this.languageRegistry
  }
}

/**
 * 创建内置加载器的工厂函数
 */
export function createBuiltInLoader(options?: BuiltInLoaderOptions): BuiltInLoader {
  return new BuiltInLoader(options)
}
