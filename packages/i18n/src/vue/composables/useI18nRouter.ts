/**
 * useI18nRouter - 路由国际化组合式API
 * 
 * 提供路由相关的国际化功能，包括：
 * - 路由标题翻译
 * - 面包屑翻译
 * - 路由参数本地化
 * - 多语言路由切换
 */

import { computed, inject, ref, watch } from 'vue'
import { I18nInjectionKey } from '../plugin'

/**
 * 路由配置接口
 */
export interface RouteConfig {
  /** 路由名称 */
  name: string
  /** 路由路径 */
  path: string
  /** 标题翻译键 */
  titleKey?: string
  /** 描述翻译键 */
  descriptionKey?: string
  /** 关键词翻译键 */
  keywordsKey?: string
  /** 面包屑翻译键 */
  breadcrumbKey?: string
  /** 父路由名称 */
  parent?: string
  /** 是否在面包屑中隐藏 */
  hiddenInBreadcrumb?: boolean
  /** 路由元数据 */
  meta?: Record<string, unknown>
}

/**
 * 面包屑项目
 */
export interface BreadcrumbItem {
  name: string
  title: string
  path: string
  active: boolean
}

/**
 * 路由国际化选项
 */
export interface RouterI18nOptions {
  /** 默认标题键前缀 */
  titlePrefix?: string
  /** 默认描述键前缀 */
  descriptionPrefix?: string
  /** 默认面包屑键前缀 */
  breadcrumbPrefix?: string
  /** 是否自动设置页面标题 */
  autoSetPageTitle?: boolean
  /** 页面标题模板 */
  titleTemplate?: string
  /** 是否启用路由参数本地化 */
  localizeParams?: boolean
}

/**
 * 路由国际化组合式API
 */
export function useI18nRouter(options: RouterI18nOptions = {}) {
  const i18n = inject(I18nInjectionKey)!
  if (!i18n) {
    console.warn('useI18nRouter: I18n plugin not found. Make sure to install the i18n plugin.')
    return createFallbackRouter()
  }

  const {
    titlePrefix = 'routes.titles',
    descriptionPrefix = 'routes.descriptions',
    breadcrumbPrefix = 'routes.breadcrumbs',
    autoSetPageTitle = true,
    titleTemplate = '{title} - {siteName}',
    localizeParams = false
  } = options

  // 路由配置存储
  const routeConfigs = ref<Map<string, RouteConfig>>(new Map())
  
  // 当前路由信息
  const currentRoute = ref<RouteConfig | null>(null)

  /**
   * 注册路由配置
   */
  function registerRoute(config: RouteConfig) {
    routeConfigs.value.set(config.name, config)
  }

  /**
   * 批量注册路由配置
   */
  function registerRoutes(configs: RouteConfig[]) {
    configs.forEach(config => registerRoute(config))
  }

  /**
   * 设置当前路由
   */
  function setCurrentRoute(routeName: string) {
    const config = routeConfigs.value.get(routeName)
    if (config) {
      currentRoute.value = config
      
      if (autoSetPageTitle) {
        updatePageTitle()
      }
    }
  }

  /**
   * 获取路由标题
   */
  function getRouteTitle(routeName: string, params?: Record<string, unknown>): string {
    const config = routeConfigs.value.get(routeName)
    
    if (config?.titleKey) {
      return i18n.t(config.titleKey, params)
    }
    
    // 自动生成标题键
    const titleKey = `${titlePrefix}.${routeName}`
    const title = i18n.t(titleKey, params)
    
    // 如果翻译不存在，使用路由名的友好格式
    if (title === titleKey) {
      return routeName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }
    
    return title
  }

  /**
   * 获取路由描述
   */
  function getRouteDescription(routeName: string, params?: Record<string, unknown>): string {
    const config = routeConfigs.value.get(routeName)
    
    if (config?.descriptionKey) {
      return i18n.t(config.descriptionKey, params)
    }
    
    const descriptionKey = `${descriptionPrefix}.${routeName}`
    const description = i18n.t(descriptionKey, params)
    
    return description === descriptionKey ? '' : description
  }

  /**
   * 获取路由关键词
   */
  function getRouteKeywords(routeName: string, params?: Record<string, unknown>): string {
    const config = routeConfigs.value.get(routeName)
    
    if (config?.keywordsKey) {
      return i18n.t(config.keywordsKey, params)
    }
    
    return ''
  }

  /**
   * 获取面包屑标题
   */
  function getBreadcrumbTitle(routeName: string, params?: Record<string, unknown>): string {
    const config = routeConfigs.value.get(routeName)
    
    if (config?.breadcrumbKey) {
      return i18n.t(config.breadcrumbKey, params)
    }
    
    // 使用路由标题作为面包屑标题
    return getRouteTitle(routeName, params)
  }

  /**
   * 生成面包屑
   */
  function generateBreadcrumbs(routeName: string, params?: Record<string, unknown>): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    const visited = new Set<string>()
    
    function buildBreadcrumb(name: string) {
      if (visited.has(name)) {
        return // 防止循环引用
      }
      
      visited.add(name)
      const config = routeConfigs.value.get(name)
      
      if (!config || config.hiddenInBreadcrumb) {
        return
      }
      
      // 递归构建父级面包屑
      if (config.parent) {
        buildBreadcrumb(config.parent)
      }
      
      breadcrumbs.push({
        name,
        title: getBreadcrumbTitle(name, params),
        path: config.path,
        active: name === routeName
      })
    }
    
    buildBreadcrumb(routeName)
    return breadcrumbs
  }

  /**
   * 本地化路由参数
   */
  function localizeRouteParams(params: Record<string, unknown>): Record<string, unknown> {
    if (!localizeParams) {
      return params
    }
    
    const localizedParams: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // 尝试翻译参数值
        const translationKey = `params.${key}.${value}`
        const translated = i18n.t(translationKey)
        localizedParams[key] = translated === translationKey ? value : translated
      } else {
        localizedParams[key] = value
      }
    }
    
    return localizedParams
  }

  /**
   * 更新页面标题
   */
  function updatePageTitle() {
    if (!currentRoute.value) {
      return
    }

    const title = getRouteTitle(currentRoute.value.name)
    const siteNameTranslation = i18n.t('site.name')
    const siteName = siteNameTranslation === 'site.name' ? 'Site' : siteNameTranslation

    const fullTitle = titleTemplate
      .replace('{title}', title)
      .replace('{siteName}', siteName)

    if (typeof document !== 'undefined') {
      document.title = fullTitle
    }
  }

  /**
   * 更新页面元数据
   */
  function updatePageMeta(routeName: string, params?: Record<string, unknown>) {
    if (typeof document === 'undefined') {
      return
    }
    
    const description = getRouteDescription(routeName, params)
    const keywords = getRouteKeywords(routeName, params)
    
    // 更新描述
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }
    
    // 更新关键词
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }
  }

  /**
   * 生成多语言路由链接
   */
  function generateLocalizedRoutes(routeName: string, params?: Record<string, unknown>): Record<string, string> {
    const routes: Record<string, string> = {}
    const availableLocales = i18n.getAvailableLanguages()
    const currentLocale = i18n.getCurrentLanguage()
    
    availableLocales.forEach(locale => {
      if (locale !== currentLocale) {
        // 这里可以根据实际路由结构生成本地化路由
        // 简单示例：在路径前添加语言代码
        const config = routeConfigs.value.get(routeName)
        if (config) {
          routes[locale] = `/${locale}${config.path}`
        }
      }
    })
    
    return routes
  }

  // 监听语言变化，更新页面信息
  watch(() => i18n.getCurrentLanguage(), () => {
    if (currentRoute.value && autoSetPageTitle) {
      updatePageTitle()
      updatePageMeta(currentRoute.value.name)
    }
  })

  /**
   * 当前路由标题
   */
  const currentTitle = computed(() => {
    return currentRoute.value ? getRouteTitle(currentRoute.value.name) : ''
  })

  /**
   * 当前路由描述
   */
  const currentDescription = computed(() => {
    return currentRoute.value ? getRouteDescription(currentRoute.value.name) : ''
  })

  /**
   * 当前路由面包屑
   */
  const currentBreadcrumbs = computed(() => {
    return currentRoute.value ? generateBreadcrumbs(currentRoute.value.name) : []
  })

  return {
    // 路由管理
    registerRoute,
    registerRoutes,
    setCurrentRoute,
    
    // 信息获取
    getRouteTitle,
    getRouteDescription,
    getRouteKeywords,
    getBreadcrumbTitle,
    
    // 面包屑
    generateBreadcrumbs,
    
    // 参数本地化
    localizeRouteParams,
    
    // 页面更新
    updatePageTitle,
    updatePageMeta,
    
    // 多语言路由
    generateLocalizedRoutes,
    
    // 响应式状态
    currentRoute: computed(() => currentRoute.value),
    currentTitle,
    currentDescription,
    currentBreadcrumbs,
    
    // 路由配置
    routeConfigs: computed(() => routeConfigs.value)
  }
}

/**
 * 创建降级路由功能
 */
function createFallbackRouter() {
  return {
    registerRoute: () => {},
    registerRoutes: () => {},
    setCurrentRoute: () => {},
    getRouteTitle: (routeName: string) => routeName,
    getRouteDescription: () => '',
    getRouteKeywords: () => '',
    getBreadcrumbTitle: (routeName: string) => routeName,
    generateBreadcrumbs: () => [],
    localizeRouteParams: (params: Record<string, unknown>) => params,
    updatePageTitle: () => {},
    updatePageMeta: () => {},
    generateLocalizedRoutes: () => ({}),
    currentRoute: computed(() => null),
    currentTitle: computed(() => ''),
    currentDescription: computed(() => ''),
    currentBreadcrumbs: computed(() => []),
    routeConfigs: computed(() => new Map())
  }
}
