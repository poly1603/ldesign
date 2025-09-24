/**
 * 语言检测器
 * 
 * 负责检测用户的首选语言
 */

import type { LanguageDetector, SupportedLocale } from './types'

/**
 * 浏览器语言检测器
 */
export class BrowserLanguageDetector implements LanguageDetector {
  name = 'BrowserLanguageDetector'
  priority = 100

  /**
   * 检测语言
   */
  detect(): SupportedLocale | null {
    try {
      // 获取浏览器语言设置
      const languages = navigator.languages || [navigator.language]
      
      for (const lang of languages) {
        const normalized = this.normalizeLanguage(lang)
        if (this.isSupportedLocale(normalized)) {
          return normalized
        }
        
        // 尝试只使用语言代码部分
        const langCode = normalized.split('-')[0]
        const fallback = this.findFallbackLocale(langCode)
        if (fallback) {
          return fallback
        }
      }
    } catch (error) {
      console.warn('浏览器语言检测失败:', error)
    }
    
    return null
  }

  /**
   * 缓存语言设置
   */
  cache(locale: SupportedLocale): void {
    // 浏览器检测器不需要缓存
  }

  /**
   * 标准化语言代码
   */
  private normalizeLanguage(lang: string): string {
    // 将语言代码标准化为 xx-XX 格式
    const parts = lang.toLowerCase().split('-')
    if (parts.length === 1) {
      return parts[0]
    }
    
    return `${parts[0]}-${parts[1].toUpperCase()}`
  }

  /**
   * 检查是否为支持的语言
   */
  private isSupportedLocale(locale: string): locale is SupportedLocale {
    const supportedLocales: SupportedLocale[] = [
      'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
      'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
      'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
    ]
    
    return supportedLocales.includes(locale as SupportedLocale)
  }

  /**
   * 查找回退语言
   */
  private findFallbackLocale(langCode: string): SupportedLocale | null {
    const fallbackMap: Record<string, SupportedLocale> = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'th': 'th-TH',
      'vi': 'vi-VN'
    }
    
    return fallbackMap[langCode] || null
  }
}

/**
 * 本地存储语言检测器
 */
export class LocalStorageLanguageDetector implements LanguageDetector {
  name = 'LocalStorageLanguageDetector'
  priority = 200
  
  private storageKey: string

  constructor(storageKey: string = 'i18n_locale') {
    this.storageKey = storageKey
  }

  /**
   * 检测语言
   */
  detect(): SupportedLocale | null {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored && this.isSupportedLocale(stored)) {
        return stored
      }
    } catch (error) {
      console.warn('本地存储语言检测失败:', error)
    }
    
    return null
  }

  /**
   * 缓存语言设置
   */
  cache(locale: SupportedLocale): void {
    try {
      localStorage.setItem(this.storageKey, locale)
    } catch (error) {
      console.warn('缓存语言设置失败:', error)
    }
  }

  /**
   * 检查是否为支持的语言
   */
  private isSupportedLocale(locale: string): locale is SupportedLocale {
    const supportedLocales: SupportedLocale[] = [
      'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
      'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
      'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
    ]
    
    return supportedLocales.includes(locale as SupportedLocale)
  }
}

/**
 * Cookie语言检测器
 */
export class CookieLanguageDetector implements LanguageDetector {
  name = 'CookieLanguageDetector'
  priority = 150
  
  private cookieName: string

  constructor(cookieName: string = 'i18n_locale') {
    this.cookieName = cookieName
  }

  /**
   * 检测语言
   */
  detect(): SupportedLocale | null {
    try {
      const cookies = document.cookie.split(';')
      
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === this.cookieName && value && this.isSupportedLocale(value)) {
          return value
        }
      }
    } catch (error) {
      console.warn('Cookie语言检测失败:', error)
    }
    
    return null
  }

  /**
   * 缓存语言设置
   */
  cache(locale: SupportedLocale): void {
    try {
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1) // 1年后过期
      
      document.cookie = `${this.cookieName}=${locale}; expires=${expires.toUTCString()}; path=/`
    } catch (error) {
      console.warn('缓存语言设置到Cookie失败:', error)
    }
  }

  /**
   * 检查是否为支持的语言
   */
  private isSupportedLocale(locale: string): locale is SupportedLocale {
    const supportedLocales: SupportedLocale[] = [
      'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
      'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
      'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
    ]
    
    return supportedLocales.includes(locale as SupportedLocale)
  }
}

/**
 * URL参数语言检测器
 */
export class UrlLanguageDetector implements LanguageDetector {
  name = 'UrlLanguageDetector'
  priority = 300
  
  private paramName: string

  constructor(paramName: string = 'lang') {
    this.paramName = paramName
  }

  /**
   * 检测语言
   */
  detect(): SupportedLocale | null {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const lang = urlParams.get(this.paramName)
      
      if (lang && this.isSupportedLocale(lang)) {
        return lang
      }
    } catch (error) {
      console.warn('URL参数语言检测失败:', error)
    }
    
    return null
  }

  /**
   * 缓存语言设置
   */
  cache(locale: SupportedLocale): void {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set(this.paramName, locale)
      
      // 更新URL但不刷新页面
      window.history.replaceState({}, '', url.toString())
    } catch (error) {
      console.warn('缓存语言设置到URL失败:', error)
    }
  }

  /**
   * 检查是否为支持的语言
   */
  private isSupportedLocale(locale: string): locale is SupportedLocale {
    const supportedLocales: SupportedLocale[] = [
      'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
      'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
      'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
    ]
    
    return supportedLocales.includes(locale as SupportedLocale)
  }
}

/**
 * 路径语言检测器
 */
export class PathLanguageDetector implements LanguageDetector {
  name = 'PathLanguageDetector'
  priority = 250

  /**
   * 检测语言
   */
  detect(): SupportedLocale | null {
    try {
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      
      if (pathSegments.length > 0) {
        const firstSegment = pathSegments[0]
        if (this.isSupportedLocale(firstSegment)) {
          return firstSegment
        }
      }
    } catch (error) {
      console.warn('路径语言检测失败:', error)
    }
    
    return null
  }

  /**
   * 缓存语言设置
   */
  cache(locale: SupportedLocale): void {
    try {
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      
      // 如果第一个路径段是语言代码，替换它
      if (pathSegments.length > 0 && this.isSupportedLocale(pathSegments[0])) {
        pathSegments[0] = locale
      } else {
        // 否则在开头添加语言代码
        pathSegments.unshift(locale)
      }
      
      const newPath = '/' + pathSegments.join('/')
      window.history.replaceState({}, '', newPath + window.location.search + window.location.hash)
    } catch (error) {
      console.warn('缓存语言设置到路径失败:', error)
    }
  }

  /**
   * 检查是否为支持的语言
   */
  private isSupportedLocale(locale: string): locale is SupportedLocale {
    const supportedLocales: SupportedLocale[] = [
      'zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR',
      'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU',
      'ar-SA', 'hi-IN', 'th-TH', 'vi-VN'
    ]
    
    return supportedLocales.includes(locale as SupportedLocale)
  }
}

/**
 * 自定义语言检测器
 */
export class CustomLanguageDetector implements LanguageDetector {
  name = 'CustomLanguageDetector'
  priority: number
  
  private detectFn: () => SupportedLocale | null
  private cacheFn?: (locale: SupportedLocale) => void

  constructor(
    detectFn: () => SupportedLocale | null,
    priority: number = 50,
    cacheFn?: (locale: SupportedLocale) => void
  ) {
    this.detectFn = detectFn
    this.priority = priority
    this.cacheFn = cacheFn
  }

  /**
   * 检测语言
   */
  detect(): SupportedLocale | null {
    try {
      return this.detectFn()
    } catch (error) {
      console.warn('自定义语言检测失败:', error)
      return null
    }
  }

  /**
   * 缓存语言设置
   */
  cache(locale: SupportedLocale): void {
    if (this.cacheFn) {
      try {
        this.cacheFn(locale)
      } catch (error) {
        console.warn('自定义语言缓存失败:', error)
      }
    }
  }
}
