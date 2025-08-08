/**
 * 内置插件集合
 */

import type { RouteLocationNormalized } from '../types'
import type {
  AnalyticsPluginOptions,
  BreadcrumbPluginOptions,
  CachePluginOptions,
  PermissionPluginOptions,
  PluginContext,
  ProgressPluginOptions,
  RouterPlugin,
  TitlePluginOptions,
} from './types'

/**
 * 分析插件
 */
export const analyticsPlugin: RouterPlugin = {
  name: 'analytics',
  version: '1.0.0',
  description: '路由分析和统计插件',

  install(context: PluginContext, options: AnalyticsPluginOptions = {}) {
    const {
      trackingId,
      enablePageViews = true,
      enableTiming = true,
      enableErrors = true,
      customDimensions = {},
      trackPageView,
      trackTiming,
      trackError,
    } = options

    // 初始化分析服务
    if (trackingId && typeof (globalThis as any).gtag !== 'undefined') {
      ;(globalThis as any).gtag('config', trackingId, customDimensions)
    }

    // 页面浏览追踪
    if (enablePageViews) {
      context.router.afterEach((to, _from) => {
        if (trackPageView) {
          trackPageView(to)
        } else if (typeof (globalThis as any).gtag !== 'undefined') {
          ;(globalThis as any).gtag('event', 'page_view', {
            page_title: to.meta.title || to.name,
            page_location: window.location.href,
            page_path: to.fullPath,
          })
        } else {
          console.log(`[Analytics] Page view: ${to.path}`)
        }
      })
    }

    // 性能追踪
    if (enableTiming) {
      let navigationStart = 0

      context.router.beforeEach((_to, _from, next) => {
        navigationStart = performance.now()
        next()
      })

      context.router.afterEach((to, _from) => {
        const duration = performance.now() - navigationStart

        if (trackTiming) {
          trackTiming('navigation', duration, to)
        } else if (typeof (globalThis as any).gtag !== 'undefined') {
          ;(globalThis as any).gtag('event', 'timing_complete', {
            name: 'navigation',
            value: Math.round(duration),
            event_category: 'performance',
            event_label: to.path,
          })
        } else {
          console.log(
            `[Analytics] Navigation timing: ${to.path} - ${duration}ms`
          )
        }
      })
    }

    // 错误追踪
    if (enableErrors) {
      context.router.onError((error, to, from) => {
        if (trackError) {
          trackError(error, to)
        } else if (typeof (globalThis as any).gtag !== 'undefined') {
          ;(globalThis as any).gtag('event', 'exception', {
            description: error.message,
            fatal: false,
            custom_map: {
              to_path: to.path,
              from_path: from.path,
            },
          })
        } else {
          console.error(`[Analytics] Router error:`, error)
        }
      })
    }
  },
}

/**
 * 权限插件
 */
export const permissionPlugin: RouterPlugin = {
  name: 'permission',
  version: '1.0.0',
  description: '路由权限控制插件',

  install(context: PluginContext, options: PermissionPluginOptions) {
    const {
      getUser,
      loginPath = '/login',
      forbiddenPath = '/403',
      unauthorizedPath = '/401',
      checkRole,
      checkPermission,
    } = options

    context.router.beforeEach(async (to, _from, next) => {
      try {
        const user = await getUser()

        // 检查是否需要认证
        if (to.meta.requiresAuth && !user) {
          return next({
            path: loginPath,
            query: { redirect: to.fullPath },
          })
        }

        // 检查角色权限
        if (to.meta.roles && user) {
          const requiredRoles = Array.isArray(to.meta.roles)
            ? to.meta.roles
            : [to.meta.roles]
          const hasRole = requiredRoles.some(role => {
            if (checkRole) {
              return checkRole(role, user)
            }
            return user.roles?.includes(role)
          })

          if (!hasRole) {
            return next(forbiddenPath)
          }
        }

        // 检查具体权限
        if (to.meta.permissions && user) {
          const requiredPermissions = Array.isArray(to.meta.permissions)
            ? to.meta.permissions
            : [to.meta.permissions]

          const hasPermission = requiredPermissions.every(permission => {
            if (checkPermission) {
              return checkPermission(permission, user)
            }
            return user.permissions?.includes(permission)
          })

          if (!hasPermission) {
            return next(unauthorizedPath)
          }
        }

        next()
      } catch (error) {
        console.error('[Permission] Error checking permissions:', error)
        next(loginPath)
      }
    })

    // 添加权限检查方法到路由器
    Object.assign(context.router, {
      hasPermission: async (permission: string) => {
        try {
          const user = await getUser()
          if (checkPermission) {
            return checkPermission(permission, user)
          }
          return user?.permissions?.includes(permission) || false
        } catch {
          return false
        }
      },

      hasRole: async (role: string) => {
        try {
          const user = await getUser()
          if (checkRole) {
            return checkRole(role, user)
          }
          return user?.roles?.includes(role) || false
        } catch {
          return false
        }
      },
    })
  },
}

/**
 * 缓存插件
 */
export const cachePlugin: RouterPlugin = {
  name: 'cache',
  version: '1.0.0',
  description: '路由组件缓存插件',

  install(context: PluginContext, options: CachePluginOptions = {}) {
    const {
      maxSize = 20,
      ttl = 5 * 60 * 1000,
      include = [],
      exclude = [],
      condition,
    } = options

    const cache = new Map<string, any>()

    // 缓存键生成
    const getCacheKey = (route: RouteLocationNormalized) => {
      return `${route.path}?${JSON.stringify(route.query)}`
    }

    // 检查是否应该缓存
    const shouldCache = (route: RouteLocationNormalized) => {
      // 自定义条件
      if (condition && !condition(route)) {
        return false
      }

      // 检查排除规则
      if (
        exclude.some(pattern => {
          if (typeof pattern === 'string') return route.path === pattern
          if (pattern instanceof RegExp) return pattern.test(route.path)
          return false
        })
      ) {
        return false
      }

      // 检查包含规则
      if (include.length > 0) {
        return include.some(pattern => {
          if (typeof pattern === 'string') return route.path === pattern
          if (pattern instanceof RegExp) return pattern.test(route.path)
          return false
        })
      }

      return route.meta.cache !== false
    }

    // 缓存组件
    context.router.beforeResolve((to, _from, next) => {
      if (shouldCache(to)) {
        const cacheKey = getCacheKey(to)
        const cached = cache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < ttl) {
          to.meta.cachedComponent = cached.component
          console.log(`[Cache] Using cached component for: ${to.path}`)
        }
      }
      next()
    })

    // 保存组件到缓存
    context.router.afterEach((to, _from) => {
      if (shouldCache(to) && to.matched.length > 0) {
        const cacheKey = getCacheKey(to)
        const component = to.matched[to.matched.length - 1]?.components?.default

        if (component) {
          // 检查缓存大小
          if (cache.size >= maxSize) {
            const oldestKey = cache.keys().next().value
            if (oldestKey) {
              cache.delete(oldestKey)
            }
          }

          cache.set(cacheKey, {
            component,
            timestamp: Date.now(),
            route: to.path,
          })

          console.log(`[Cache] Cached component for: ${to.path}`)
        }
      }
    })

    // 添加缓存管理方法
    Object.assign(context.router, {
      clearCache: (pattern?: string | RegExp) => {
        if (!pattern) {
          cache.clear()
          return
        }

        for (const [key, value] of cache.entries()) {
          if (typeof pattern === 'string' && value.route === pattern) {
            cache.delete(key)
          } else if (pattern instanceof RegExp && pattern.test(value.route)) {
            cache.delete(key)
          }
        }
      },

      getCacheStats: () => {
        return {
          size: cache.size,
          maxSize,
          entries: Array.from(cache.entries()).map(([key, value]) => ({
            key,
            route: value.route,
            timestamp: value.timestamp,
            age: Date.now() - value.timestamp,
          })),
        }
      },
    })
  },
}

/**
 * 面包屑插件
 */
export const breadcrumbPlugin: RouterPlugin = {
  name: 'breadcrumb',
  version: '1.0.0',
  description: '面包屑导航插件',

  install(context: PluginContext, options: BreadcrumbPluginOptions = {}) {
    const {
      homeText = '首页',
      homePath = '/',
      maxItems = 10,
      showHome = true,
      generateText,
    } = options

    // 生成面包屑数据
    const generateBreadcrumbs = (route: RouteLocationNormalized) => {
      const breadcrumbs: any[] = []

      // 添加首页
      if (showHome && route.path !== homePath) {
        breadcrumbs.push({
          text: homeText,
          path: homePath,
          name: 'Home',
        })
      }

      // 添加路由层级
      route.matched.forEach((record, index) => {
        if (record.meta?.breadcrumb !== false) {
          const text = generateText
            ? generateText(route)
            : record.meta?.title || record.name || record.path

          if (text) {
            breadcrumbs.push({
              text,
              path: record.path,
              name: record.name,
              isLast: index === route.matched.length - 1,
            })
          }
        }
      })

      // 限制数量
      if (breadcrumbs.length > maxItems) {
        breadcrumbs.splice(1, breadcrumbs.length - maxItems)
        breadcrumbs.splice(1, 0, { text: '...', path: null, isEllipsis: true })
      }

      return breadcrumbs
    }

    // 更新面包屑
    context.router.afterEach(to => {
      const breadcrumbs = generateBreadcrumbs(to)

      // 触发面包屑更新事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('breadcrumb-update', {
            detail: { breadcrumbs, route: to },
          })
        )
      }

      // 存储到路由元信息
      to.meta.breadcrumbs = breadcrumbs
    })

    // 添加面包屑方法
    Object.assign(context.router, {
      getBreadcrumbs: (route?: RouteLocationNormalized) => {
        return route ? generateBreadcrumbs(route) : []
      },
    })
  },
}

/**
 * 进度条插件
 */
export const progressPlugin: RouterPlugin = {
  name: 'progress',
  version: '1.0.0',
  description: '路由导航进度条插件',

  install(context: PluginContext, options: ProgressPluginOptions = {}) {
    const {
      color = '#1890ff',
      height = 3,
      duration = 300,
      showSpinner = false,
      start,
      finish,
      error,
    } = options

    let progressElement: HTMLElement | null = null
    // @ts-expect-error: isLoading is used in conditional branches
    let _isLoading = false

    // 创建进度条元素
    const createProgressBar = () => {
      if (typeof document === 'undefined') return

      progressElement = document.createElement('div')
      progressElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: ${height}px;
        background: ${color};
        z-index: 9999;
        transition: width ${duration}ms ease;
      `
      document.body.appendChild(progressElement)

      if (showSpinner) {
        const spinner = document.createElement('div')
        spinner.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          border: 2px solid ${color};
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          z-index: 9999;
        `
        document.body.appendChild(spinner)
      }
    }

    // 开始进度
    const startProgress = () => {
      if (start) {
        start()
      } else {
        _isLoading = true
        if (!progressElement) createProgressBar()
        if (progressElement) {
          progressElement.style.width = '30%'
        }
      }
    }

    // 完成进度
    const finishProgress = () => {
      if (finish) {
        finish()
      } else {
        _isLoading = false
        if (progressElement) {
          progressElement.style.width = '100%'
          setTimeout(() => {
            if (progressElement) {
              progressElement.remove()
              progressElement = null
            }
          }, duration)
        }
      }
    }

    // 错误处理
    const errorProgress = () => {
      if (error) {
        error()
      } else {
        _isLoading = false
        if (progressElement) {
          progressElement.style.background = '#f5222d'
          progressElement.style.width = '100%'
          setTimeout(() => {
            if (progressElement) {
              progressElement.remove()
              progressElement = null
            }
          }, duration)
        }
      }
    }

    context.router.beforeEach((_to, _from, next) => {
      startProgress()
      next()
    })

    context.router.afterEach(() => {
      finishProgress()
    })

    context.router.onError(() => {
      errorProgress()
    })
  },
}

/**
 * 标题插件
 */
export const titlePlugin: RouterPlugin = {
  name: 'title',
  version: '1.0.0',
  description: '页面标题管理插件',

  install(context: PluginContext, options: TitlePluginOptions = {}) {
    const { suffix = '', separator = ' - ', template, generateTitle } = options

    context.router.afterEach(to => {
      if (typeof document === 'undefined') return

      let title: string

      if (generateTitle) {
        title = generateTitle(to)
      } else if (template) {
        title = template
          .replace('{title}', (to.meta.title as string) || '')
          .replace('{name}', (to.name as string) || '')
          .replace('{path}', to.path)
      } else {
        const routeTitle = to.meta.title as string
        if (routeTitle) {
          title = suffix ? `${routeTitle}${separator}${suffix}` : routeTitle
        } else {
          title = suffix || document.title
        }
      }

      if (title) {
        document.title = title
      }
    })
  },
}

/**
 * 所有内置插件
 */
export const builtinPlugins = {
  analytics: analyticsPlugin,
  permission: permissionPlugin,
  cache: cachePlugin,
  breadcrumb: breadcrumbPlugin,
  progress: progressPlugin,
  title: titlePlugin,
}
