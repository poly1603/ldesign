/**
 * Vue I18n SSR (服务端渲染) 支持
 *
 * 提供：
 * - 服务端渲染支持
 * - 客户端水合 (Hydration)
 * - 同构渲染
 * - 语言检测
 * - SEO 优化
 */

import type { App } from 'vue'
import type { I18nInstance, I18nOptions } from '../core/types'
import { I18n } from '../core/i18n'

/**
 * SSR 配置选项
 */
export interface SSRConfig {
  /** 默认语言 */
  defaultLocale: string
  /** 支持的语言列表 */
  supportedLocales: string[]
  /** 语言检测策略 */
  detection?: {
    /** 从 Accept-Language 头检测 */
    acceptLanguage?: boolean
    /** 从 URL 路径检测 */
    path?: boolean
    /** 从查询参数检测 */
    query?: string
    /** 从 Cookie 检测 */
    cookie?: string
    /** 从子域名检测 */
    subdomain?: boolean
  }
  /** SEO 配置 */
  seo?: {
    /** 是否生成 hreflang 标签 */
    hreflang?: boolean
    /** 是否生成语言切换链接 */
    alternateLinks?: boolean
    /** 基础 URL */
    baseUrl?: string
  }
  /** 预加载配置 */
  preload?: {
    /** 是否预加载所有语言 */
    all?: boolean
    /** 预加载的语言列表 */
    locales?: string[]
  }
}

/**
 * SSR 上下文
 */
export interface SSRContext {
  /** 请求 URL */
  url: string
  /** 请求头 */
  headers: Record<string, string>
  /** 用户代理 */
  userAgent?: string
  /** 客户端 IP */
  ip?: string
  /** 检测到的语言 */
  detectedLocale?: string
  /** 是否为服务端 */
  isServer: boolean
}

/**
 * 语言检测器
 */
export class LocaleDetector {
  private config: SSRConfig

  constructor(config: SSRConfig) {
    this.config = config
  }

  /**
   * 检测语言
   */
  detect(context: SSRContext): string {
    const { detection = {} } = this.config
    let detectedLocale = this.config.defaultLocale

    // 从 URL 路径检测
    if (detection.path) {
      const pathLocale = this.detectFromPath(context.url)
      if (pathLocale) {
        detectedLocale = pathLocale
      }
    }

    // 从查询参数检测
    if (detection.query) {
      const queryLocale = this.detectFromQuery(context.url, detection.query)
      if (queryLocale) {
        detectedLocale = queryLocale
      }
    }

    // 从 Cookie 检测
    if (detection.cookie) {
      const cookieLocale = this.detectFromCookie(context.headers, detection.cookie)
      if (cookieLocale) {
        detectedLocale = cookieLocale
      }
    }

    // 从 Accept-Language 头检测
    if (detection.acceptLanguage) {
      const headerLocale = this.detectFromAcceptLanguage(context.headers)
      if (headerLocale) {
        detectedLocale = headerLocale
      }
    }

    // 从子域名检测
    if (detection.subdomain) {
      const subdomainLocale = this.detectFromSubdomain(context.url)
      if (subdomainLocale) {
        detectedLocale = subdomainLocale
      }
    }

    // 验证检测到的语言是否支持
    if (!this.config.supportedLocales.includes(detectedLocale)) {
      detectedLocale = this.config.defaultLocale
    }

    return detectedLocale
  }

  /**
   * 从 URL 路径检测语言
   */
  private detectFromPath(url: string): string | null {
    const urlObj = new URL(url, 'http://localhost')
    const pathSegments = urlObj.pathname.split('/').filter(Boolean)

    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0]
      if (this.config.supportedLocales.includes(firstSegment)) {
        return firstSegment
      }
    }

    return null
  }

  /**
   * 从查询参数检测语言
   */
  private detectFromQuery(url: string, queryParam: string): string | null {
    const urlObj = new URL(url, 'http://localhost')
    const locale = urlObj.searchParams.get(queryParam)

    if (locale && this.config.supportedLocales.includes(locale)) {
      return locale
    }

    return null
  }

  /**
   * 从 Cookie 检测语言
   */
  private detectFromCookie(headers: Record<string, string>, cookieName: string): string | null {
    const cookieHeader = headers.cookie || headers.Cookie
    if (!cookieHeader)
      return null

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const locale = cookies[cookieName]
    if (locale && this.config.supportedLocales.includes(locale)) {
      return locale
    }

    return null
  }

  /**
   * 从 Accept-Language 头检测语言
   */
  private detectFromAcceptLanguage(headers: Record<string, string>): string | null {
    const acceptLanguage = headers['accept-language'] || headers['Accept-Language']
    if (!acceptLanguage)
      return null

    // 解析 Accept-Language 头
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [locale, q = '1'] = lang.trim().split(';q=')
        return {
          locale: locale.toLowerCase(),
          quality: Number.parseFloat(q),
        }
      })
      .sort((a, b) => b.quality - a.quality)

    // 查找匹配的语言
    for (const { locale } of languages) {
      // 精确匹配
      if (this.config.supportedLocales.includes(locale)) {
        return locale
      }

      // 语言代码匹配 (例如 en-US -> en)
      const langCode = locale.split('-')[0]
      const matchedLocale = this.config.supportedLocales.find(supported =>
        supported.startsWith(langCode),
      )
      if (matchedLocale) {
        return matchedLocale
      }
    }

    return null
  }

  /**
   * 从子域名检测语言
   */
  private detectFromSubdomain(url: string): string | null {
    const urlObj = new URL(url, 'http://localhost')
    const subdomain = urlObj.hostname.split('.')[0]

    if (this.config.supportedLocales.includes(subdomain)) {
      return subdomain
    }

    return null
  }
}

/**
 * SEO 优化器
 */
export class SEOOptimizer {
  private config: SSRConfig

  constructor(config: SSRConfig) {
    this.config = config
  }

  /**
   * 生成 hreflang 标签
   */
  generateHreflangTags(currentLocale: string, currentPath: string): string[] {
    if (!this.config.seo?.hreflang || !this.config.seo?.baseUrl) {
      return []
    }

    const tags: string[] = []
    const baseUrl = this.config.seo.baseUrl.replace(/\/$/, '')

    // 为每个支持的语言生成 hreflang 标签
    for (const locale of this.config.supportedLocales) {
      const url = `${baseUrl}/${locale}${currentPath}`
      tags.push(`<link rel="alternate" hreflang="${locale}" href="${url}" />`)
    }

    // 添加 x-default
    const defaultUrl = `${baseUrl}/${this.config.defaultLocale}${currentPath}`
    tags.push(`<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`)

    return tags
  }

  /**
   * 生成语言切换链接
   */
  generateAlternateLinks(currentLocale: string, currentPath: string): Array<{
    locale: string
    url: string
    label: string
  }> {
    if (!this.config.seo?.alternateLinks || !this.config.seo?.baseUrl) {
      return []
    }

    const baseUrl = this.config.seo.baseUrl.replace(/\/$/, '')
    const links: Array<{ locale: string, url: string, label: string }> = []

    for (const locale of this.config.supportedLocales) {
      if (locale !== currentLocale) {
        const url = `${baseUrl}/${locale}${currentPath}`
        links.push({
          locale,
          url,
          label: this.getLocaleLabel(locale),
        })
      }
    }

    return links
  }

  /**
   * 获取语言标签
   */
  private getLocaleLabel(locale: string): string {
    const labels: Record<string, string> = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      'en': 'English',
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'ja': '日本語',
      'ko': '한국어',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
      'it': 'Italiano',
      'pt': 'Português',
      'ru': 'Русский',
      'ar': 'العربية',
    }

    return labels[locale] || locale
  }
}

/**
 * SSR I18n 管理器
 */
export class SSRManager {
  private config: SSRConfig
  private detector: LocaleDetector
  private seoOptimizer: SEOOptimizer
  private i18nInstances = new Map<string, I18nInstance>()

  constructor(config: SSRConfig) {
    this.config = config
    this.detector = new LocaleDetector(config)
    this.seoOptimizer = new SEOOptimizer(config)
  }

  /**
   * 创建 SSR I18n 实例
   */
  async createSSRI18n(
    context: SSRContext,
    i18nConfig: Omit<I18nOptions, 'defaultLocale'>,
  ): Promise<{
      i18n: I18nInstance
      locale: string
      hreflangTags: string[]
      alternateLinks: Array<{ locale: string, url: string, label: string }>
    }> {
    // 检测语言
    const detectedLocale = this.detector.detect(context)
    context.detectedLocale = detectedLocale

    // 创建或获取 I18n 实例
    let i18n = this.i18nInstances.get(detectedLocale)
    if (!i18n) {
      i18n = new I18n({
        ...i18nConfig,
        defaultLocale: detectedLocale,
      })
      this.i18nInstances.set(detectedLocale, i18n)
    }

    // 预加载语言包
    if (this.config.preload) {
      await this.preloadLocales(i18n, context)
    }

    // 生成 SEO 标签
    const urlObj = new URL(context.url, 'http://localhost')
    const currentPath = urlObj.pathname
    const hreflangTags = this.seoOptimizer.generateHreflangTags(detectedLocale, currentPath)
    const alternateLinks = this.seoOptimizer.generateAlternateLinks(detectedLocale, currentPath)

    return {
      i18n,
      locale: detectedLocale,
      hreflangTags,
      alternateLinks,
    }
  }

  /**
   * 预加载语言包
   */
  private async preloadLocales(i18n: I18nInstance, context: SSRContext): Promise<void> {
    const { preload } = this.config
    if (!preload)
      return

    const localesToPreload = preload.all
      ? this.config.supportedLocales
      : preload.locales || []

    // 在服务端预加载所有需要的语言包
    if (context.isServer) {
      await Promise.all(
        localesToPreload.map(locale =>
          i18n.preloadLanguage(locale).catch(() => {
            // 忽略加载失败的语言包
          }),
        ),
      )
    }
  }

  /**
   * 获取客户端水合数据
   */
  getHydrationData(locale: string): {
    locale: string
    supportedLocales: string[]
    defaultLocale: string
  } {
    return {
      locale,
      supportedLocales: this.config.supportedLocales,
      defaultLocale: this.config.defaultLocale,
    }
  }

  /**
   * 清理实例缓存
   */
  clearCache(): void {
    this.i18nInstances.clear()
  }
}

/**
 * 创建 SSR 管理器
 */
export function createSSRManager(config: SSRConfig): SSRManager {
  return new SSRManager(config)
}

/**
 * Vue SSR 插件
 */
export function createSSRPlugin(ssrManager: SSRManager, context: SSRContext) {
  return {
    install(app: App) {
      // 在服务端提供 SSR 上下文
      if (context.isServer) {
        app.provide('ssrContext', context)
        app.provide('ssrManager', ssrManager)
      }
    },
  }
}

/**
 * 客户端水合函数
 */
export function hydrateI18n(
  app: App,
  hydrationData: {
    locale: string
    supportedLocales: string[]
    defaultLocale: string
  },
): void {
  // 在客户端恢复 I18n 状态
  app.provide('hydrationData', hydrationData)

  // 设置客户端语言检测
  if (typeof window !== 'undefined') {
    // 监听语言变化
    window.addEventListener('languagechange', () => {
      // 处理系统语言变化
      console.warn('System language changed')
    })
  }
}
