/**
 * 国际化插件
 * 
 * 为LogicFlow编辑器提供多语言支持
 */

import { BasePlugin } from '../BasePlugin'
import { I18nManager } from '../../i18n/I18nManager'
import { HttpResourceLoader, StaticResourceLoader, LocalStorageResourceLoader } from '../../i18n/ResourceLoader'
import { 
  BrowserLanguageDetector, 
  LocalStorageLanguageDetector, 
  CookieLanguageDetector,
  UrlLanguageDetector 
} from '../../i18n/LanguageDetector'
import type LogicFlow from '@logicflow/core'
import type {
  I18nConfig,
  SupportedLocale,
  LocaleInfo,
  TranslationKey,
  TranslationOptions,
  DateTimeFormatOptions,
  CurrencyFormatOptions
} from '../../i18n/types'

/**
 * 国际化插件配置
 */
export interface I18nPluginConfig extends I18nConfig {
  /** 是否显示语言切换器 */
  showLanguageSwitcher?: boolean
  /** 语言切换器位置 */
  switcherPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 是否启用自动检测 */
  enableAutoDetection?: boolean
  /** 是否启用RTL支持 */
  enableRtlSupport?: boolean
  /** 自定义翻译资源 */
  customResources?: Record<string, Record<string, any>>
  /** 是否启用调试模式 */
  debugMode?: boolean
}

/**
 * 国际化插件
 */
export class I18nPlugin extends BasePlugin {
  static pluginName = 'I18nPlugin'
  
  private manager: I18nManager
  private config: I18nPluginConfig
  private switcherElement?: HTMLElement
  private isInitialized: boolean = false

  constructor(config: I18nPluginConfig) {
    super()
    
    this.config = {
      defaultLocale: 'en-US',
      fallbackLocale: 'en-US',
      supportedLocales: ['en-US', 'zh-CN'],
      resourcePath: '/locales/{{locale}}/{{namespace}}.json',
      defaultNamespace: 'flowchart',
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
        maxSize: 50,
        ttl: 30 * 60 * 1000
      },
      preload: {
        enabled: true,
        locales: ['en-US', 'zh-CN'],
        namespaces: ['flowchart', 'common']
      },
      lazyLoad: {
        enabled: true,
        threshold: 3
      },
      showLanguageSwitcher: true,
      switcherPosition: 'top-right',
      enableAutoDetection: true,
      enableRtlSupport: true,
      debugMode: false,
      ...config
    }

    this.manager = new I18nManager()
  }

  /**
   * 安装插件
   */
  async install(lf: LogicFlow): Promise<void> {
    super.install(lf)
    
    try {
      // 初始化国际化管理器
      await this.initializeManager()
      
      // 创建语言切换器
      if (this.config.showLanguageSwitcher) {
        this.createLanguageSwitcher()
      }
      
      // 设置RTL支持
      if (this.config.enableRtlSupport) {
        this.setupRtlSupport()
      }
      
      // 注册API方法
      this.registerApiMethods()
      
      // 监听语言变更事件
      this.setupEventListeners()
      
      this.isInitialized = true
      console.log('国际化插件已安装')
    } catch (error) {
      console.error('国际化插件安装失败:', error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  uninstall(): void {
    // 移除语言切换器
    if (this.switcherElement) {
      this.switcherElement.remove()
      this.switcherElement = undefined
    }
    
    // 移除事件监听器
    this.removeEventListeners()
    
    super.uninstall()
    console.log('国际化插件已卸载')
  }

  /**
   * 获取当前语言
   */
  getCurrentLocale(): SupportedLocale {
    return this.manager.getCurrentLocale()
  }

  /**
   * 设置当前语言
   */
  async setCurrentLocale(locale: SupportedLocale): Promise<void> {
    await this.manager.setCurrentLocale(locale)
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLocales(): LocaleInfo[] {
    return this.manager.getSupportedLocales()
  }

  /**
   * 翻译文本
   */
  t(key: TranslationKey, options?: TranslationOptions): string {
    return this.manager.t(key, options)
  }

  /**
   * 检查翻译是否存在
   */
  exists(key: TranslationKey, options?: { namespace?: string }): boolean {
    return this.manager.exists(key, options)
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date, options?: DateTimeFormatOptions): string {
    return this.manager.formatDate(date, options)
  }

  /**
   * 格式化时间
   */
  formatTime(date: Date, options?: DateTimeFormatOptions): string {
    return this.manager.formatTime(date, options)
  }

  /**
   * 格式化日期时间
   */
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string {
    return this.manager.formatDateTime(date, options)
  }

  /**
   * 格式化数字
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return this.manager.formatNumber(number, options)
  }

  /**
   * 格式化货币
   */
  formatCurrency(amount: number, options: CurrencyFormatOptions): string {
    return this.manager.formatCurrency(amount, options)
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return this.manager.formatRelativeTime(value, unit)
  }

  /**
   * 复数处理
   */
  plural(key: TranslationKey, count: number, options?: TranslationOptions): string {
    return this.manager.plural(key, count, options)
  }

  /**
   * 初始化国际化管理器
   */
  private async initializeManager(): Promise<void> {
    // 注册资源加载器
    const httpLoader = new HttpResourceLoader()
    const staticLoader = new StaticResourceLoader(this.config.customResources)
    const localStorageLoader = new LocalStorageResourceLoader()
    
    this.manager.registerResourceLoader(httpLoader)
    this.manager.registerResourceLoader(staticLoader)
    this.manager.registerResourceLoader(localStorageLoader)

    // 注册语言检测器
    if (this.config.enableAutoDetection) {
      const urlDetector = new UrlLanguageDetector()
      const localStorageDetector = new LocalStorageLanguageDetector()
      const cookieDetector = new CookieLanguageDetector()
      const browserDetector = new BrowserLanguageDetector()
      
      this.manager.registerLanguageDetector(urlDetector)
      this.manager.registerLanguageDetector(localStorageDetector)
      this.manager.registerLanguageDetector(cookieDetector)
      this.manager.registerLanguageDetector(browserDetector)
    }

    // 初始化管理器
    await this.manager.initialize(this.config)
  }

  /**
   * 创建语言切换器
   */
  private createLanguageSwitcher(): void {
    const container = this.lf?.getContainer()
    if (!container) return

    this.switcherElement = document.createElement('div')
    this.switcherElement.className = 'lf-i18n-switcher'
    this.switcherElement.style.cssText = this.getSwitcherStyles()

    // 创建语言选择下拉框
    const select = document.createElement('select')
    select.className = 'lf-i18n-select'
    
    // 添加语言选项
    const supportedLocales = this.getSupportedLocales()
    supportedLocales.forEach(locale => {
      const option = document.createElement('option')
      option.value = locale.code
      option.textContent = locale.name
      option.selected = locale.code === this.getCurrentLocale()
      select.appendChild(option)
    })

    // 监听选择变更
    select.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement
      const newLocale = target.value as SupportedLocale
      
      try {
        await this.setCurrentLocale(newLocale)
      } catch (error) {
        console.error('切换语言失败:', error)
        // 恢复原来的选择
        target.value = this.getCurrentLocale()
      }
    })

    this.switcherElement.appendChild(select)
    container.appendChild(this.switcherElement)
  }

  /**
   * 设置RTL支持
   */
  private setupRtlSupport(): void {
    const updateDirection = () => {
      const container = this.lf?.getContainer()
      if (!container) return

      const currentLocale = this.getCurrentLocale()
      const localeInfo = this.manager.getLocaleInfo(currentLocale)
      
      if (localeInfo) {
        container.style.direction = localeInfo.direction
        container.classList.toggle('lf-rtl', localeInfo.rtl)
        container.classList.toggle('lf-ltr', !localeInfo.rtl)
      }
    }

    // 初始设置
    updateDirection()

    // 监听语言变更
    this.manager.on('localeChanged', updateDirection)
  }

  /**
   * 注册API方法
   */
  private registerApiMethods(): void {
    if (!this.lf) return

    // 扩展LogicFlow实例的方法
    Object.assign(this.lf, {
      // 国际化方法
      t: this.t.bind(this),
      getCurrentLocale: this.getCurrentLocale.bind(this),
      setCurrentLocale: this.setCurrentLocale.bind(this),
      getSupportedLocales: this.getSupportedLocales.bind(this),
      
      // 格式化方法
      formatDate: this.formatDate.bind(this),
      formatTime: this.formatTime.bind(this),
      formatDateTime: this.formatDateTime.bind(this),
      formatNumber: this.formatNumber.bind(this),
      formatCurrency: this.formatCurrency.bind(this),
      formatRelativeTime: this.formatRelativeTime.bind(this),
      
      // 工具方法
      plural: this.plural.bind(this),
      exists: this.exists.bind(this)
    })
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听语言变更事件
    this.manager.on('localeChanged', (data) => {
      this.updateLanguageSwitcher()
      this.emit('localeChanged', data)
      
      if (this.config.debugMode) {
        console.log('语言已变更:', data)
      }
    })

    // 监听翻译缺失事件
    this.manager.on('translationMissing', (data) => {
      this.emit('translationMissing', data)
      
      if (this.config.debugMode) {
        console.warn('翻译缺失:', data)
      }
    })

    // 监听错误事件
    this.manager.on('error', (data) => {
      this.emit('i18nError', data)
      
      if (this.config.debugMode) {
        console.error('国际化错误:', data)
      }
    })
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    this.manager.removeAllListeners()
  }

  /**
   * 更新语言切换器
   */
  private updateLanguageSwitcher(): void {
    if (!this.switcherElement) return

    const select = this.switcherElement.querySelector('select') as HTMLSelectElement
    if (select) {
      select.value = this.getCurrentLocale()
    }
  }

  /**
   * 获取切换器样式
   */
  private getSwitcherStyles(): string {
    const position = this.config.switcherPosition || 'top-right'
    
    const baseStyles = `
      position: absolute;
      z-index: 1000;
      padding: 8px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `

    const positionStyles = {
      'top-left': 'top: 10px; left: 10px;',
      'top-right': 'top: 10px; right: 10px;',
      'bottom-left': 'bottom: 10px; left: 10px;',
      'bottom-right': 'bottom: 10px; right: 10px;'
    }

    return baseStyles + positionStyles[position]
  }
}

// 扩展LogicFlow类型定义
declare module '@logicflow/core' {
  interface LogicFlow {
    // 国际化方法
    t(key: TranslationKey, options?: TranslationOptions): string
    getCurrentLocale(): SupportedLocale
    setCurrentLocale(locale: SupportedLocale): Promise<void>
    getSupportedLocales(): LocaleInfo[]
    
    // 格式化方法
    formatDate(date: Date, options?: DateTimeFormatOptions): string
    formatTime(date: Date, options?: DateTimeFormatOptions): string
    formatDateTime(date: Date, options?: DateTimeFormatOptions): string
    formatNumber(number: number, options?: Intl.NumberFormatOptions): string
    formatCurrency(amount: number, options: CurrencyFormatOptions): string
    formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string
    
    // 工具方法
    plural(key: TranslationKey, count: number, options?: TranslationOptions): string
    exists(key: TranslationKey, options?: { namespace?: string }): boolean
  }
}
