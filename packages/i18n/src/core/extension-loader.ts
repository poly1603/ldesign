/**
 * 翻译内容扩展加载器
 * 
 * 支持修改、扩展和添加自定义翻译内容
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type { Loader, LanguagePackage, NestedObject } from './types'
import { mergeLanguagePackages, MergeStrategy, type MergeOptions } from './merger'
import { I18nError, LanguageLoadError } from './errors'

/**
 * 翻译扩展类型
 */
export type TranslationExtension = {
  /** 扩展的翻译内容 */
  translations: NestedObject
  /** 扩展策略 */
  strategy?: ExtensionStrategy
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 扩展名称 */
  name?: string
  /** 扩展描述 */
  description?: string
}

/**
 * 扩展策略枚举
 */
export enum ExtensionStrategy {
  /** 覆盖现有翻译 */
  OVERRIDE = 'override',
  /** 合并翻译（深度合并） */
  MERGE = 'merge',
  /** 只添加不存在的翻译 */
  ADD_ONLY = 'add-only',
  /** 追加到现有翻译 */
  APPEND = 'append'
}

/**
 * 扩展加载器配置选项
 */
export interface ExtensionLoaderOptions {
  /** 基础加载器 */
  baseLoader?: Loader
  /** 全局扩展（应用于所有语言） */
  globalExtensions?: TranslationExtension[]
  /** 语言特定扩展 */
  languageExtensions?: Record<string, TranslationExtension[]>
  /** 默认扩展策略 */
  defaultStrategy?: ExtensionStrategy
  /** 合并选项 */
  mergeOptions?: MergeOptions
  /** 是否启用扩展验证 */
  enableValidation?: boolean
  /** 最大扩展数量限制 */
  maxExtensions?: number
}

/**
 * 翻译内容扩展加载器
 * 
 * 支持对翻译内容进行灵活的扩展和修改
 */
export class ExtensionLoader implements Loader {
  private baseLoader?: Loader
  private globalExtensions: TranslationExtension[] = []
  private languageExtensions: Map<string, TranslationExtension[]> = new Map()
  private defaultStrategy: ExtensionStrategy
  private mergeOptions: MergeOptions
  private enableValidation: boolean
  private maxExtensions: number
  private loadedPackages = new Map<string, LanguagePackage>()

  constructor(options: ExtensionLoaderOptions = {}) {
    this.baseLoader = options.baseLoader
    this.defaultStrategy = options.defaultStrategy || ExtensionStrategy.MERGE
    this.enableValidation = options.enableValidation !== false
    this.maxExtensions = options.maxExtensions || 100

    // 设置合并选项
    this.mergeOptions = {
      strategy: MergeStrategy.USER_FIRST,
      clone: true,
      ...options.mergeOptions
    }

    // 初始化扩展
    if (options.globalExtensions) {
      this.addGlobalExtensions(options.globalExtensions)
    }

    if (options.languageExtensions) {
      Object.entries(options.languageExtensions).forEach(([locale, extensions]) => {
        this.addLanguageExtensions(locale, extensions)
      })
    }
  }

  /**
   * 加载语言包
   */
  async load(locale: string): Promise<LanguagePackage> {
    // 检查缓存
    if (this.loadedPackages.has(locale)) {
      return this.loadedPackages.get(locale)!
    }

    try {
      // 1. 加载基础语言包
      let basePackage: LanguagePackage | undefined

      if (this.baseLoader) {
        basePackage = await this.baseLoader.load(locale)
      }

      // 2. 应用扩展
      const extendedPackage = await this.applyExtensions(locale, basePackage)

      if (!extendedPackage) {
        throw new I18nError(
          `No translation found for locale: ${locale}`,
          'TRANSLATION_NOT_FOUND',
          { context: { locale } }
        )
      }

      // 缓存结果
      this.loadedPackages.set(locale, extendedPackage)
      return extendedPackage

    } catch (error) {
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
   * 添加全局扩展
   * 
   * @param extensions 扩展列表
   */
  addGlobalExtensions(extensions: TranslationExtension[]): void {
    if (this.enableValidation) {
      this.validateExtensions(extensions)
    }

    this.globalExtensions.push(...extensions)
    this.sortExtensionsByPriority(this.globalExtensions)

    // 清除缓存
    this.clearCache()
  }

  /**
   * 添加语言特定扩展
   * 
   * @param locale 语言代码
   * @param extensions 扩展列表
   */
  addLanguageExtensions(locale: string, extensions: TranslationExtension[]): void {
    if (this.enableValidation) {
      this.validateExtensions(extensions)
    }

    const existing = this.languageExtensions.get(locale) || []
    existing.push(...extensions)
    this.sortExtensionsByPriority(existing)
    this.languageExtensions.set(locale, existing)

    // 清除特定语言的缓存
    this.loadedPackages.delete(locale)
  }

  /**
   * 添加单个翻译扩展
   * 
   * @param locale 语言代码（可选，如果不指定则为全局扩展）
   * @param translations 翻译内容
   * @param strategy 扩展策略
   * @param priority 优先级
   * @param name 扩展名称
   */
  addTranslationExtension(
    locale: string | undefined,
    translations: NestedObject,
    strategy?: ExtensionStrategy,
    priority?: number,
    name?: string
  ): void {
    const extension: TranslationExtension = {
      translations,
      strategy: strategy || this.defaultStrategy,
      priority: priority || 0,
      name: name || `Extension-${Date.now()}`
    }

    if (locale) {
      this.addLanguageExtensions(locale, [extension])
    } else {
      this.addGlobalExtensions([extension])
    }
  }

  /**
   * 覆盖翻译内容
   * 
   * @param locale 语言代码
   * @param translations 要覆盖的翻译内容
   * @param name 扩展名称
   */
  overrideTranslations(
    locale: string,
    translations: NestedObject,
    name?: string
  ): void {
    this.addTranslationExtension(
      locale,
      translations,
      ExtensionStrategy.OVERRIDE,
      1000, // 高优先级
      name || `Override-${locale}-${Date.now()}`
    )
  }

  /**
   * 移除扩展
   * 
   * @param locale 语言代码（可选，如果不指定则移除全局扩展）
   * @param name 扩展名称
   * @returns 是否成功移除
   */
  removeExtension(locale: string | undefined, name: string): boolean {
    if (locale) {
      const extensions = this.languageExtensions.get(locale)
      if (extensions) {
        const index = extensions.findIndex(ext => ext.name === name)
        if (index !== -1) {
          extensions.splice(index, 1)
          this.loadedPackages.delete(locale)
          return true
        }
      }
    } else {
      const index = this.globalExtensions.findIndex(ext => ext.name === name)
      if (index !== -1) {
        this.globalExtensions.splice(index, 1)
        this.clearCache()
        return true
      }
    }
    return false
  }

  /**
   * 清除所有扩展
   * 
   * @param locale 语言代码（可选，如果不指定则清除全局扩展）
   */
  clearExtensions(locale?: string): void {
    if (locale) {
      this.languageExtensions.delete(locale)
      this.loadedPackages.delete(locale)
    } else {
      this.globalExtensions = []
      this.languageExtensions.clear()
      this.clearCache()
    }
  }

  /**
   * 获取扩展列表
   * 
   * @param locale 语言代码（可选）
   * @returns 扩展列表
   */
  getExtensions(locale?: string): TranslationExtension[] {
    if (locale) {
      return [
        ...this.globalExtensions,
        ...(this.languageExtensions.get(locale) || [])
      ]
    }
    return [...this.globalExtensions]
  }

  /**
   * 应用扩展到语言包
   * 
   * @param locale 语言代码
   * @param basePackage 基础语言包
   * @returns 扩展后的语言包
   */
  private async applyExtensions(
    locale: string,
    basePackage?: LanguagePackage
  ): Promise<LanguagePackage | undefined> {
    // 获取所有适用的扩展
    const extensions = this.getExtensions(locale)

    if (extensions.length === 0) {
      return basePackage
    }

    // 如果没有基础包，创建一个空的包
    let currentPackage: LanguagePackage = basePackage || {
      info: {
        name: locale,
        nativeName: locale,
        code: locale,
        region: '',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
        flag: ''
      },
      translations: {}
    }

    // 按优先级应用扩展
    for (const extension of extensions) {
      currentPackage = this.applyExtension(currentPackage, extension)
    }

    return currentPackage
  }

  /**
   * 应用单个扩展
   *
   * @param package_ 当前语言包
   * @param extension 扩展
   * @returns 应用扩展后的语言包
   */
  private applyExtension(
    package_: LanguagePackage,
    extension: TranslationExtension
  ): LanguagePackage {
    const strategy = extension.strategy || this.defaultStrategy

    switch (strategy) {
      case ExtensionStrategy.OVERRIDE:
        return this.overridePackage(package_, extension.translations)

      case ExtensionStrategy.MERGE:
        return this.mergePackage(package_, extension.translations)

      case ExtensionStrategy.ADD_ONLY:
        return this.addOnlyPackage(package_, extension.translations)

      case ExtensionStrategy.APPEND:
        return this.appendPackage(package_, extension.translations)

      default:
        return this.mergePackage(package_, extension.translations)
    }
  }

  /**
   * 覆盖策略：直接覆盖现有翻译
   */
  private overridePackage(
    package_: LanguagePackage,
    translations: NestedObject
  ): LanguagePackage {
    return {
      ...package_,
      translations: {
        ...package_.translations,
        ...translations
      }
    }
  }

  /**
   * 合并策略：深度合并翻译
   */
  private mergePackage(
    package_: LanguagePackage,
    translations: NestedObject
  ): LanguagePackage {
    const extensionPackage: LanguagePackage = {
      info: package_.info,
      translations
    }

    return mergeLanguagePackages(package_, extensionPackage, this.mergeOptions)
  }

  /**
   * 仅添加策略：只添加不存在的翻译
   */
  private addOnlyPackage(
    package_: LanguagePackage,
    translations: NestedObject
  ): LanguagePackage {
    const result = { ...package_ }
    const resultTranslations = { ...result.translations } as Record<string, any>

    this.addOnlyRecursive(resultTranslations, translations)

    return {
      ...result,
      translations: resultTranslations as NestedObject
    }
  }

  /**
   * 递归添加不存在的翻译
   */
  private addOnlyRecursive(target: Record<string, any>, source: NestedObject): void {
    for (const [key, value] of Object.entries(source)) {
      if (!(key in target)) {
        target[key] = value
      } else if (
        typeof target[key] === 'object' &&
        target[key] !== null &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(target[key]) &&
        !Array.isArray(value)
      ) {
        this.addOnlyRecursive(target[key] as Record<string, any>, value as NestedObject)
      }
    }
  }

  /**
   * 追加策略：将新翻译追加到现有翻译
   */
  private appendPackage(
    package_: LanguagePackage,
    translations: NestedObject
  ): LanguagePackage {
    const result = { ...package_ }
    const resultTranslations = { ...result.translations } as Record<string, any>

    this.appendRecursive(resultTranslations, translations)

    return {
      ...result,
      translations: resultTranslations as NestedObject
    }
  }

  /**
   * 递归追加翻译
   */
  private appendRecursive(target: Record<string, any>, source: NestedObject): void {
    for (const [key, value] of Object.entries(source)) {
      if (key in target) {
        const targetValue = target[key]
        if (typeof targetValue === 'string' && typeof value === 'string') {
          target[key] = `${targetValue} ${value}`
        } else if (Array.isArray(targetValue) && Array.isArray(value)) {
          target[key] = [...targetValue, ...value]
        } else if (
          typeof targetValue === 'object' &&
          targetValue !== null &&
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(targetValue) &&
          !Array.isArray(value)
        ) {
          this.appendRecursive(targetValue as Record<string, any>, value as NestedObject)
        } else {
          target[key] = value
        }
      } else {
        target[key] = value
      }
    }
  }

  /**
   * 验证扩展
   */
  private validateExtensions(extensions: TranslationExtension[]): void {
    if (extensions.length > this.maxExtensions) {
      throw new I18nError(
        `Too many extensions: ${extensions.length}, maximum allowed: ${this.maxExtensions}`,
        'TOO_MANY_EXTENSIONS'
      )
    }

    for (const extension of extensions) {
      if (!extension.translations || typeof extension.translations !== 'object') {
        throw new I18nError(
          'Extension must have valid translations object',
          'INVALID_EXTENSION'
        )
      }
    }
  }

  /**
   * 按优先级排序扩展
   */
  private sortExtensionsByPriority(extensions: TranslationExtension[]): void {
    extensions.sort((a, b) => (a.priority || 0) - (b.priority || 0))
  }

  /**
   * 清除所有缓存
   */
  private clearCache(): void {
    this.loadedPackages.clear()
  }

  /**
   * 获取扩展统计信息
   */
  getExtensionStats(): {
    globalExtensions: number
    languageExtensions: number
    totalExtensions: number
    cachedPackages: number
  } {
    const languageExtensionsCount = Array.from(this.languageExtensions.values())
      .reduce((sum, extensions) => sum + extensions.length, 0)

    return {
      globalExtensions: this.globalExtensions.length,
      languageExtensions: languageExtensionsCount,
      totalExtensions: this.globalExtensions.length + languageExtensionsCount,
      cachedPackages: this.loadedPackages.size
    }
  }
}

/**
 * 创建扩展加载器的工厂函数
 *
 * @param options 配置选项
 * @returns 扩展加载器实例
 *
 * @example
 * ```typescript
 * // 基础用法
 * const loader = createExtensionLoader({
 *   baseLoader: builtInLoader,
 *   globalExtensions: [{
 *     translations: { common: { customMessage: 'Custom message' } },
 *     strategy: ExtensionStrategy.MERGE
 *   }]
 * })
 *
 * // 语言特定扩展
 * const loader = createExtensionLoader({
 *   languageExtensions: {
 *     'zh-CN': [{
 *       translations: { ui: { customButton: '自定义按钮' } }
 *     }],
 *     'en': [{
 *       translations: { ui: { customButton: 'Custom Button' } }
 *     }]
 *   }
 * })
 * ```
 */
export function createExtensionLoader(options?: ExtensionLoaderOptions): ExtensionLoader {
  return new ExtensionLoader(options)
}

/**
 * 默认导出扩展加载器类
 */
export default ExtensionLoader
