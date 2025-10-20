/**
 * @ldesign/router 路由国际化（i18n）支持
 * 
 * 提供多语言路由功能，支持路径本地化、自动语言检测等
 */

import type { RouteLocationNormalized, Router, RouteRecordRaw } from '../../types'
import { computed, ref } from 'vue'
import { logger } from '../../utils/logger'

// ==================== 类型定义 ====================

export interface I18nRouteConfig {
  /**
   * 默认语言
   */
  defaultLocale: string
  
  /**
   * 支持的语言列表
   */
  locales: string[]
  
  /**
   * 是否自动检测浏览器语言
   */
  detectBrowserLanguage?: boolean
  
  /**
   * URL 语言前缀策略
   * - 'always': 总是添加语言前缀
   * - 'never': 从不添加语言前缀
   * - 'non-default': 仅非默认语言添加前缀
   */
  strategy?: 'always' | 'never' | 'non-default'
  
  /**
   * 语言切换时是否保持当前路由
   */
  preserveRouteOnLocaleChange?: boolean
  
  /**
   * 路径本地化映射
   */
  pathLocalization?: Record<string, Record<string, string>>
  
  /**
   * 语言存储键名
   */
  storageKey?: string
  
  /**
   * 语言切换回调
   */
  onLocaleChange?: (newLocale: string, oldLocale: string) => void
  
  /**
   * 404 页面路径
   */
  fallbackRoute?: string
}

// ==================== i18n 路由管理器 ====================

export class I18nRouteManager {
  private router: Router
  private config: Required<I18nRouteConfig>
  private currentLocale = ref<string>('')
  private originalRoutes: RouteRecordRaw[] = []
  private localizedRoutes = new Map<string, RouteRecordRaw[]>()
  
  constructor(router: Router, config: I18nRouteConfig) {
    this.router = router
    this.config = {
      detectBrowserLanguage: true,
      strategy: 'non-default',
      preserveRouteOnLocaleChange: true,
      pathLocalization: {},
      storageKey: 'router-locale',
      onLocaleChange: () => {},
      fallbackRoute: '/404',
      ...config,
    }
    
    // 保存原始路由
    this.originalRoutes = [...router.getRoutes().map(r => this.routeToRaw(r))]
    
    // 初始化语言
    this.initializeLocale()
    
    // 生成本地化路由
    this.generateLocalizedRoutes()
    
    // 设置路由守卫
    this.setupNavigationGuards()
  }
  
  /**
   * 初始化语言设置
   */
  private initializeLocale(): void {
    let locale = this.config.defaultLocale
    
    // 从存储中获取语言
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.config.storageKey)
      if (stored && this.config.locales.includes(stored)) {
        locale = stored
      }
    }
    
    // 自动检测浏览器语言
    if (this.config.detectBrowserLanguage && !localStorage.getItem(this.config.storageKey)) {
      const browserLang = this.detectBrowserLanguage()
      if (browserLang && this.config.locales.includes(browserLang)) {
        locale = browserLang
      }
    }
    
    this.currentLocale.value = locale
  }
  
  /**
   * 检测浏览器语言
   */
  private detectBrowserLanguage(): string | null {
    if (typeof navigator === 'undefined') return null
    
    // 优先使用 navigator.language
    const lang = navigator.language?.toLowerCase()
    
    // 精确匹配
    if (this.config.locales.includes(lang)) {
      return lang
    }
    
    // 语言代码匹配（如 en-US -> en）
    const shortLang = lang?.split('-')[0]
    if (shortLang && this.config.locales.includes(shortLang)) {
      return shortLang
    }
    
    // 检查 navigator.languages
    if (navigator.languages) {
      for (const l of navigator.languages) {
        const lower = l.toLowerCase()
        if (this.config.locales.includes(lower)) {
          return lower
        }
        const short = lower.split('-')[0]
        if (short && this.config.locales.includes(short)) {
          return short
        }
      }
    }
    
    return null
  }
  
  /**
   * 生成本地化路由
   */
  private generateLocalizedRoutes(): void {
    for (const locale of this.config.locales) {
      const routes = this.createLocalizedRoutes(this.originalRoutes, locale)
      this.localizedRoutes.set(locale, routes)
    }
    
    // 应用当前语言的路由
    this.applyLocalizedRoutes(this.currentLocale.value)
  }
  
  /**
   * 创建特定语言的路由
   */
  private createLocalizedRoutes(routes: RouteRecordRaw[], locale: string): RouteRecordRaw[] {
    return routes.map(route => {
      const localizedRoute = { ...route }
      
      // 处理路径本地化
      if (localizedRoute.path) {
        localizedRoute.path = this.localizePath(localizedRoute.path, locale)
      }
      
      // 添加语言前缀
      if (this.shouldAddPrefix(locale) && !localizedRoute.path.startsWith(`/${locale}`)) {
        localizedRoute.path = `/${locale}${localizedRoute.path}`
      }
      
      // 处理别名
      if (localizedRoute.alias) {
        const aliases = Array.isArray(localizedRoute.alias) 
          ? localizedRoute.alias 
          : [localizedRoute.alias]
        
        localizedRoute.alias = aliases.map(alias => {
          const localized = this.localizePath(alias, locale)
          return this.shouldAddPrefix(locale) ? `/${locale}${localized}` : localized
        })
      }
      
      // 处理重定向
      if (localizedRoute.redirect) {
        if (typeof localizedRoute.redirect === 'string') {
          const localized = this.localizePath(localizedRoute.redirect, locale)
          localizedRoute.redirect = this.shouldAddPrefix(locale) 
            ? `/${locale}${localized}` 
            : localized
        }
      }
      
      // 添加语言元信息
      localizedRoute.meta = {
        ...localizedRoute.meta,
        locale,
      }
      
      // 递归处理子路由
      if (localizedRoute.children) {
        localizedRoute.children = this.createLocalizedRoutes(localizedRoute.children, locale)
      }
      
      return localizedRoute
    })
  }
  
  /**
   * 本地化路径
   */
  private localizePath(path: string, locale: string): string {
    // 查找路径映射
    const pathMap = this.config.pathLocalization[path]
    if (pathMap && pathMap[locale]) {
      return pathMap[locale]
    }
    
    // 处理动态段
    const segments = path.split('/')
    const localizedSegments = segments.map(segment => {
      // 保留动态参数
      if (segment.startsWith(':') || segment === '*') {
        return segment
      }
      
      // 查找段映射
      const segmentMap = this.config.pathLocalization[`/${segment}`]
      if (segmentMap && segmentMap[locale]) {
        return segmentMap[locale].substring(1) // 移除开头的 /
      }
      
      return segment
    })
    
    return localizedSegments.join('/')
  }
  
  /**
   * 是否应该添加语言前缀
   */
  private shouldAddPrefix(locale: string): boolean {
    switch (this.config.strategy) {
      case 'always':
        return true
      case 'never':
        return false
      case 'non-default':
        return locale !== this.config.defaultLocale
      default:
        return false
    }
  }
  
  /**
   * 应用本地化路由
   */
  private applyLocalizedRoutes(locale: string): void {
    // 清除现有路由
    const currentRoutes = this.router.getRoutes()
    currentRoutes.forEach(route => {
      if (route.name) {
        this.router.removeRoute(route.name)
      }
    })
    
    // 添加新的本地化路由
    const localizedRoutes = this.localizedRoutes.get(locale) || []
    localizedRoutes.forEach(route => {
      this.router.addRoute(route)
    })
    
    logger.info(`Applied routes for locale: ${locale}`)
  }
  
  /**
   * 设置导航守卫
   */
  private setupNavigationGuards(): void {
    this.router.beforeEach((to, _from, next) => {
      // 从 URL 中提取语言
      const urlLocale = this.extractLocaleFromPath(to.path)
      
      // 如果 URL 中有语言且与当前语言不同，切换语言
      if (urlLocale && urlLocale !== this.currentLocale.value) {
        this.setLocale(urlLocale)
      }
      
      // 如果需要添加语言前缀但路径中没有
      if (this.shouldAddPrefix(this.currentLocale.value) && !urlLocale) {
        const newPath = `/${this.currentLocale.value}${to.path}`
        next(newPath)
        return
      }
      
      next()
    })
  }
  
  /**
   * 从路径中提取语言
   */
  private extractLocaleFromPath(path: string): string | null {
    const segments = path.split('/').filter(Boolean)
    const firstSegment = segments[0]
    if (segments.length > 0 && firstSegment && this.config.locales.includes(firstSegment)) {
      return firstSegment
    }
    return null
  }
  
  /**
   * 路由记录转换为原始格式
   */
  private routeToRaw(route: any): RouteRecordRaw {
    return {
      path: route.path,
      name: route.name,
      component: route.component,
      components: route.components,
      redirect: route.redirect,
      alias: route.alias,
      meta: route.meta,
      beforeEnter: route.beforeEnter,
      props: route.props,
      children: route.children,
    }
  }
  
  // ==================== 公共 API ====================
  
  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale.value
  }
  
  /**
   * 设置语言
   */
  setLocale(locale: string): void {
    if (!this.config.locales.includes(locale)) {
      logger.warn(`Locale "${locale}" is not supported`)
      return
    }
    
    const oldLocale = this.currentLocale.value
    if (locale === oldLocale) return
    
    // 保存当前路由信息
    const currentRoute = this.router.currentRoute.value
    const routeWithoutLocale = this.removeLocaleFromRoute(currentRoute)
    
    // 更新语言
    this.currentLocale.value = locale
    
    // 保存到存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.config.storageKey, locale)
    }
    
    // 应用新的路由配置
    this.applyLocalizedRoutes(locale)
    
    // 如果需要保持当前路由，导航到相应的本地化版本
    if (this.config.preserveRouteOnLocaleChange) {
      const newPath = this.localizeCurrentPath(routeWithoutLocale, locale)
      this.router.push(newPath).catch(() => {
        // 如果导航失败，回退到首页
        const homePath = this.shouldAddPrefix(locale) ? `/${locale}/` : '/'
        this.router.push(homePath)
      })
    }
    
    // 触发回调
    this.config.onLocaleChange(locale, oldLocale)
    
    logger.info(`Locale changed from ${oldLocale} to ${locale}`)
  }
  
  /**
   * 移除路由中的语言信息
   */
  private removeLocaleFromRoute(route: RouteLocationNormalized): string {
    const locale = this.extractLocaleFromPath(route.path)
    if (locale) {
      return route.path.substring(locale.length + 1) || '/'
    }
    return route.path
  }
  
  /**
   * 本地化当前路径
   */
  private localizeCurrentPath(path: string, locale: string): string {
    const localizedPath = this.localizePath(path, locale)
    return this.shouldAddPrefix(locale) 
      ? `/${locale}${localizedPath}` 
      : localizedPath
  }
  
  /**
   * 获取本地化路径
   */
  getLocalizedPath(path: string, locale?: string): string {
    const targetLocale = locale || this.currentLocale.value
    const localizedPath = this.localizePath(path, targetLocale)
    return this.shouldAddPrefix(targetLocale)
      ? `/${targetLocale}${localizedPath}`
      : localizedPath
  }
  
  /**
   * 获取所有语言的路径
   */
  getAllLocalizedPaths(path: string): Record<string, string> {
    const result: Record<string, string> = {}
    for (const locale of this.config.locales) {
      result[locale] = this.getLocalizedPath(path, locale)
    }
    return result
  }
  
  /**
   * 切换到下一个语言
   */
  nextLocale(): void {
    const currentIndex = this.config.locales.indexOf(this.currentLocale.value)
    const nextIndex = (currentIndex + 1) % this.config.locales.length
    const nextLocale = this.config.locales[nextIndex]
    if (nextLocale) this.setLocale(nextLocale)
  }
  
  /**
   * 获取语言切换链接
   */
  getLocaleSwitchLinks(): Array<{ locale: string; path: string; active: boolean }> {
    const currentRoute = this.router.currentRoute.value
    const pathWithoutLocale = this.removeLocaleFromRoute(currentRoute)
    
    return this.config.locales.map(locale => ({
      locale,
      path: this.localizeCurrentPath(pathWithoutLocale, locale),
      active: locale === this.currentLocale.value,
    }))
  }
}

// ==================== Vue 组合式 API ====================

let i18nManager: I18nRouteManager | null = null

/**
 * 设置 i18n 路由管理器
 */
export function setupI18nRouter(router: Router, config: I18nRouteConfig): I18nRouteManager {
  i18nManager = new I18nRouteManager(router, config)
  return i18nManager
}

/**
 * 获取 i18n 管理器实例
 */
export function getI18nManager(): I18nRouteManager | null {
  return i18nManager
}

/**
 * 使用 i18n 路由
 */
export function useI18nRoute() {
  if (!i18nManager) {
    throw new Error('I18n router not initialized. Call setupI18nRouter first.')
  }
  
  const currentLocale = computed(() => i18nManager!.getLocale())
  
  return {
    // 当前语言
    locale: currentLocale,
    
    // 设置语言
    setLocale: (locale: string) => i18nManager!.setLocale(locale),
    
    // 切换到下一个语言
    nextLocale: () => i18nManager!.nextLocale(),
    
    // 获取本地化路径
    localizePath: (path: string, locale?: string) => 
      i18nManager!.getLocalizedPath(path, locale),
    
    // 获取所有语言的路径
    getAllPaths: (path: string) => 
      i18nManager!.getAllLocalizedPaths(path),
    
    // 获取语言切换链接
    getSwitchLinks: () => 
      i18nManager!.getLocaleSwitchLinks(),
    
    // 支持的语言列表
    locales: (i18nManager as any).config.locales,
    
    // 默认语言
    defaultLocale: (i18nManager as any).config.defaultLocale,
  }
}

// ==================== Vue 插件 ====================

export const I18nRouterPlugin = {
  install(app: any, options: { router: Router; config: I18nRouteConfig }) {
    const manager = setupI18nRouter(options.router, options.config)
    
    // 全局属性
    app.config.globalProperties.$i18n = manager
    
    // 提供给子组件
    app.provide('i18nRouter', manager)
  },
}