/**
 * 国际化配置
 * 
 * 集成 @ldesign/i18n 到应用中
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { createI18nPlugin as createI18nCore } from '@ldesign/i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'

// 语言包配置
export const messages = {
  'zh-CN': zhCN,
  'en': en,
}

// 支持的语言列表
export const supportedLocales = [
  {
    code: 'zh-CN',
    name: '中文',
    flag: '🇨🇳',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
]

// 默认语言
export const defaultLocale = 'zh-CN'

// 降级语言
export const fallbackLocale = 'en'

/**
 * 创建国际化 Engine 插件
 * 
 * 使用 SPA 预设配置，适合单页应用
 */
export function createI18nPlugin() {
  return createI18nCore({
    locale: defaultLocale,
    fallbackLocale,
    messages,

    // 自动检测浏览器语言
    autoDetect: true,

    // 缓存配置
    cache: {
      enabled: true,
      maxSize: 1000,
      defaultTTL: 60 * 60 * 1000 // 1小时
    },

    // 存储配置
    storage: 'localStorage',
    storageKey: 'ldesign-app-locale',

    // 回调函数
    onLanguageChanged: (locale: string) => {
      console.log('🌐 语言已切换到:', locale)
      document.documentElement.lang = locale

      // 通知语言管理器
      languageManager.setLocale(locale)
    },

    onLoadError: (locale: string) => {
      console.error('❌ 语言包加载失败:', locale)
    }
  })
}

/**
 * 获取浏览器首选语言
 */
export function getBrowserLocale(): string {
  if (typeof navigator === 'undefined') {
    return defaultLocale
  }

  const browserLang = navigator.language || (navigator as any).userLanguage

  // 检查是否支持完整的语言代码
  if (supportedLocales.some(locale => locale.code === browserLang)) {
    return browserLang
  }

  // 检查是否支持语言的主要部分（如 'en' 匹配 'en-US'）
  const mainLang = browserLang.split('-')[0]
  const matchedLocale = supportedLocales.find(locale =>
    locale.code.startsWith(mainLang)
  )

  return matchedLocale?.code || defaultLocale
}

/**
 * 检查语言是否受支持
 */
export function isLocaleSupported(locale: string): boolean {
  return supportedLocales.some(supportedLocale => supportedLocale.code === locale)
}

/**
 * 获取语言显示名称
 */
export function getLocaleName(locale: string): string {
  const supportedLocale = supportedLocales.find(l => l.code === locale)
  return supportedLocale?.name || locale
}

/**
 * 获取语言旗帜图标
 */
export function getLocaleFlag(locale: string): string {
  const supportedLocale = supportedLocales.find(l => l.code === locale)
  return supportedLocale?.flag || '🌐'
}

/**
 * 语言切换工具函数
 */
export class LanguageManager {
  private static instance: LanguageManager
  private currentLocale: string = defaultLocale
  private listeners: Array<(locale: string) => void> = []

  static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager()
    }
    return LanguageManager.instance
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: string): void {
    if (!isLocaleSupported(locale)) {
      console.warn(`Locale "${locale}" is not supported`)
      return
    }

    this.currentLocale = locale

    // 保存到本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ldesign-app-locale', locale)
    }

    // 通知监听器
    this.listeners.forEach(listener => listener(locale))
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale
  }

  /**
   * 初始化语言设置
   */
  init(): void {
    // 从本地存储读取
    let savedLocale = defaultLocale
    if (typeof localStorage !== 'undefined') {
      savedLocale = localStorage.getItem('ldesign-app-locale') || defaultLocale
    }

    // 如果本地存储中没有，则使用浏览器语言
    if (savedLocale === defaultLocale) {
      savedLocale = getBrowserLocale()
    }

    this.setLocale(savedLocale)
  }

  /**
   * 添加语言变化监听器
   */
  onLocaleChange(listener: (locale: string) => void): () => void {
    this.listeners.push(listener)

    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 切换到下一个语言
   */
  switchToNext(): void {
    const currentIndex = supportedLocales.findIndex(
      locale => locale.code === this.currentLocale
    )
    const nextIndex = (currentIndex + 1) % supportedLocales.length
    this.setLocale(supportedLocales[nextIndex].code)
  }

  /**
   * 获取所有支持的语言
   */
  getSupportedLocales() {
    return supportedLocales
  }
}

// 导出单例实例
export const languageManager = LanguageManager.getInstance()

// 默认导出
export default {
  createI18nPlugin,
  messages,
  supportedLocales,
  defaultLocale,
  fallbackLocale,
  getBrowserLocale,
  isLocaleSupported,
  getLocaleName,
  getLocaleFlag,
  languageManager,
}
