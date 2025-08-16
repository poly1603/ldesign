import type { LanguagePackage, Loader } from './types'

/**
 * 默认语言包加载器
 */
export class DefaultLoader implements Loader {
  private loadedPackages = new Map<string, LanguagePackage>()
  private loadingPromises = new Map<string, Promise<LanguagePackage>>()
  private availableLocales: string[]

  constructor(availableLocales: string[] = []) {
    this.availableLocales = availableLocales
  }

  /**
   * 加载语言包
   * @param locale 语言代码
   * @returns 语言包
   */
  async load(locale: string): Promise<LanguagePackage> {
    // 如果已经加载，直接返回
    if (this.loadedPackages.has(locale)) {
      return this.loadedPackages.get(locale)!
    }

    // 如果正在加载，返回加载中的 Promise
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)!
    }

    // 开始加载
    const loadingPromise = this.loadLanguagePackage(locale)
    this.loadingPromises.set(locale, loadingPromise)

    try {
      const languagePackage = await loadingPromise
      this.loadedPackages.set(locale, languagePackage)
      return languagePackage
    } finally {
      this.loadingPromises.delete(locale)
    }
  }

  /**
   * 预加载语言包
   * @param locale 语言代码
   */
  async preload(locale: string): Promise<void> {
    await this.load(locale)
  }

  /**
   * 检查语言包是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLoaded(locale: string): boolean {
    return this.loadedPackages.has(locale)
  }

  /**
   * 获取已加载的语言包
   * @param locale 语言代码
   * @returns 语言包或 undefined
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }

  /**
   * 清除已加载的语言包
   * @param locale 语言代码，如果不提供则清除所有
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.loadedPackages.delete(locale)
      this.loadingPromises.delete(locale)
    } else {
      this.loadedPackages.clear()
      this.loadingPromises.clear()
    }
  }

  /**
   * 实际加载语言包的方法（子类可以重写）
   * @param locale 语言代码
   * @returns 语言包
   */
  protected async loadLanguagePackage(
    locale: string
  ): Promise<LanguagePackage> {
    try {
      // 使用预定义的语言包映射，避免动态导入问题
      const localeMap: Record<
        string,
        () => Promise<{ default: LanguagePackage }>
      > = {
        en: () => import('../locales/en'),
        'zh-CN': () => import('../locales/zh-CN'),
        ja: () => import('../locales/ja'),
      }

      const loader = localeMap[locale]
      if (!loader) {
        throw new Error(`Language package for '${locale}' is not available`)
      }

      const localeModule = await loader()

      if (!localeModule.default) {
        throw new Error(
          `Language package for '${locale}' does not have a default export`
        )
      }

      return localeModule.default as LanguagePackage
    } catch (error) {
      throw new Error(
        `Failed to load language package for '${locale}': ${error}`
      )
    }
  }

  /**
   * 获取可用的语言列表
   * @returns 可用语言代码数组
   */
  getAvailableLocales(): string[] {
    return [...this.availableLocales]
  }

  /**
   * 添加可用语言
   * @param locale 语言代码
   */
  addAvailableLocale(locale: string): void {
    if (!this.availableLocales.includes(locale)) {
      this.availableLocales.push(locale)
    }
  }

  /**
   * 移除可用语言
   * @param locale 语言代码
   */
  removeAvailableLocale(locale: string): void {
    const index = this.availableLocales.indexOf(locale)
    if (index > -1) {
      this.availableLocales.splice(index, 1)
    }
  }
}

/**
 * 静态语言包加载器（用于预定义的语言包）
 */
export class StaticLoader implements Loader {
  private packages = new Map<string, LanguagePackage>()
  private loadedPackages = new Map<string, LanguagePackage>()

  /**
   * 注册语言包
   * @param locale 语言代码
   * @param packageData 语言包数据
   */
  registerPackage(locale: string, packageData: LanguagePackage): void {
    this.packages.set(locale, packageData)
  }

  /**
   * 批量注册语言包
   * @param packages 语言包映射
   */
  registerPackages(packages: Record<string, LanguagePackage>): void {
    for (const [locale, packageData] of Object.entries(packages)) {
      this.registerPackage(locale, packageData)
    }
  }

  /**
   * 加载语言包
   * @param locale 语言代码
   * @returns 语言包
   */
  async load(locale: string): Promise<LanguagePackage> {
    const packageData = this.packages.get(locale)
    if (!packageData) {
      throw new Error(`Language package for '${locale}' is not registered`)
    }

    // 缓存已加载的语言包
    this.loadedPackages.set(locale, packageData)
    return packageData
  }

  /**
   * 预加载语言包
   * @param locale 语言代码
   */
  async preload(locale: string): Promise<void> {
    await this.load(locale)
  }

  /**
   * 检查语言包是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLoaded(locale: string): boolean {
    return this.packages.has(locale)
  }

  /**
   * 获取可用的语言列表
   * @returns 可用语言代码数组
   */
  getAvailableLocales(): string[] {
    return Array.from(this.packages.keys())
  }

  /**
   * 获取已加载的语言包
   * @param locale 语言代码
   * @returns 语言包或 undefined
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }
}

/**
 * HTTP 语言包加载器（从远程服务器加载）
 */
export class HttpLoader implements Loader {
  private loadedPackages = new Map<string, LanguagePackage>()
  private loadingPromises = new Map<string, Promise<LanguagePackage>>()
  private baseUrl: string
  private fetchOptions: Record<string, unknown>

  constructor(baseUrl: string, fetchOptions: Record<string, unknown> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // 移除末尾的斜杠
    this.fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...((fetchOptions.headers as Record<string, string>) || {}),
      },
      ...fetchOptions,
    }
  }

  /**
   * 加载语言包
   * @param locale 语言代码
   * @returns 语言包
   */
  async load(locale: string): Promise<LanguagePackage> {
    // 如果已经加载，直接返回
    if (this.loadedPackages.has(locale)) {
      return this.loadedPackages.get(locale)!
    }

    // 如果正在加载，返回加载中的 Promise
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)!
    }

    // 开始加载
    const loadingPromise = this.fetchLanguagePackage(locale)
    this.loadingPromises.set(locale, loadingPromise)

    try {
      const languagePackage = await loadingPromise
      this.loadedPackages.set(locale, languagePackage)
      return languagePackage
    } finally {
      this.loadingPromises.delete(locale)
    }
  }

  /**
   * 预加载语言包
   * @param locale 语言代码
   */
  async preload(locale: string): Promise<void> {
    await this.load(locale)
  }

  /**
   * 检查语言包是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLoaded(locale: string): boolean {
    return this.loadedPackages.has(locale)
  }

  /**
   * 从远程服务器获取语言包
   * @param locale 语言代码
   * @returns 语言包
   */
  private async fetchLanguagePackage(locale: string): Promise<LanguagePackage> {
    const url = `${this.baseUrl}/${locale}.json`

    try {
      const response = await fetch(url, this.fetchOptions)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // 验证数据格式
      if (!this.isValidLanguagePackage(data)) {
        throw new Error('Invalid language package format')
      }

      return data as LanguagePackage
    } catch (error) {
      throw new Error(
        `Failed to fetch language package for '${locale}' from '${url}': ${error}`
      )
    }
  }

  /**
   * 验证语言包格式
   * @param data 数据对象
   * @returns 是否为有效的语言包
   */
  private isValidLanguagePackage(data: unknown): data is LanguagePackage {
    return (
      data !== null &&
      typeof data === 'object' &&
      'info' in data &&
      typeof (data as LanguagePackage).info === 'object' &&
      typeof (data as LanguagePackage).info.name === 'string' &&
      typeof (data as LanguagePackage).info.code === 'string' &&
      'translations' in data &&
      typeof (data as LanguagePackage).translations === 'object'
    )
  }

  /**
   * 获取已加载的语言包
   * @param locale 语言代码
   * @returns 语言包或 undefined
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }
}
