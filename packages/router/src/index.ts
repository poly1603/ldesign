/**
 * @ldesign/router 主入口文件
 *
 * 一个现代化、高性能、类型安全的 Vue 路由库
 * 完全独立于 vue-router，提供更好的开发体验和性能
 */

// ==================== 核心功能导出 ====================

// Vue 组件
export { DeviceUnsupported, RouterLink, RouterView } from './components'
import { RouterLink, RouterView } from './components'
// 设备适配组件类型
export type { DeviceUnsupportedProps } from './components'
// 组件类型
export type {
  AnimationConfig,
  CacheConfig,
  AnimationType as ComponentAnimationType,
  CacheStrategy as ComponentCacheStrategy,
  PreloadStrategy as ComponentPreloadStrategy,
  ComponentSize,
  LinkVariant,
  PerformanceConfig,
  PerformanceMetrics,
  PreloadConfig,
  RouterLinkProps,
  RouterLinkSlotProps,
  RouterViewProps,
  RouterViewSlotProps,
} from './components/types'

// 核心 Hooks
export { useLink, useNavigation, useRoute, useRouter } from './composables'

// 参数 Hooks
export {
  useHash,
  useMatched,
  useMeta,
  useParams,
  useQuery,
} from './composables'

// 守卫 Hooks
export { onBeforeRouteLeave, onBeforeRouteUpdate } from './composables'

// ==================== 类型定义导出 ====================

// 工具 Hooks
export { hasRoute, hasRouter } from './composables'

// 设备适配 Hooks
export { useDeviceComponent, useDeviceRoute } from './composables'
export type {
  // UseDeviceComponentOptions,
  // UseDeviceComponentReturn,
  UseDeviceRouteOptions,
  UseDeviceRouteReturn,
} from './composables'

// ==================== 组件导出 ====================

// 组合式 API 类型
export type { UseLinkOptions, UseLinkReturn } from './composables'

// 常量
export {
  AnimationType,
  CacheStrategy,
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
  DEFAULT_VIEW_NAME,
  ErrorTypes,
  NavigationFailureType,
  PreloadStrategy,
  START_LOCATION,
} from './core/constants'

// 历史管理
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'

// ==================== 组合式 API 导出 ====================

// 路由匹配
export { RouteMatcher } from './core/matcher'

// 路由器核心
export { createRouter } from './core/router'

export type { RouterImpl } from './core/router'

// 设备适配核心功能
export {
  createDeviceRouterPlugin,
  DeviceComponentResolver,
  DeviceRouteGuard,
  TemplateRouteResolver,
} from './device'

// 设备适配工具函数
export {
  checkDeviceSupport,
  createUnsupportedDeviceRoute,
  resolveDeviceComponent,
} from './device/utils'

// ==================== 插件系统导出 ====================

// ==================== Engine集成导出 ====================

// Engine插件（用于Engine集成）
export {
  createDefaultRouterEnginePlugin,
  createRouterEnginePlugin,
  routerPlugin,
} from './engine'

export type { RouterEnginePluginOptions } from './engine'

export {
  combineGuards,
  createAuthGuard,
  createLoadingGuard,
  createPermissionGuard,
  createProgressGuard,
  createScrollGuard,
  createTitleGuard,
} from './guards'

export type {
  AuthChecker,
  AuthGuardOptions,
  LoadingGuardOptions,
  PermissionChecker,
  PermissionGuardOptions,
  ProgressGuardOptions,
  ScrollGuardOptions,
  TitleGuardOptions,
} from './guards'
// 动画插件
export {
  ANIMATION_PRESETS,
  AnimationManager,
  createAnimationConfig,
  createAnimationPlugin,
  getAnimationDuration,
  supportsAnimations,
} from './plugins/animation'
export type { AnimationPluginOptions } from './plugins/animation'

// 缓存插件
export {
  CacheManager,
  createCacheConfig,
  createCachePlugin,
  supportsCaching,
} from './plugins/cache'
export type { CachePluginOptions } from './plugins/cache'

// ==================== 路由守卫导出 ====================

// 性能监控插件
export {
  createPerformanceConfig,
  createPerformancePlugin,
  getPagePerformance,
  PerformanceEventType,
  PerformanceManager,
  supportsPerformanceAPI,
  withPerformanceMonitoring,
} from './plugins/performance'

export type { PerformancePluginOptions } from './plugins/performance'

// ==================== 工具函数导出 ====================

// 预加载插件
export {
  createPreloadConfig,
  createPreloadPlugin,
  HoverPreloadStrategy,
  IdlePreloadStrategy,
  PreloadManager,
  supportsPreload,
  VisibilityPreloadStrategy,
} from './plugins/preload'

// ==================== Engine 集成导出 ====================

export type { PreloadPluginOptions } from './plugins/preload'

// ==================== 设备适配功能 ====================

// 核心类型
export type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationFailure,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationInformation,
  NavigationType,
  RouteComponent,
  RouteLocationBase,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  Router,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouterHistory,
  RouterOptions,
  ScrollBehavior,
  ScrollPosition,
  UseRouteReturn,
  UseRouterReturn,
} from './types'

// 设备适配类型
export type {
  DeviceComponentResolution,
  DeviceGuardOptions,
  DeviceRouteConfig,
  DeviceRouterPluginOptions,
  TemplateRouteConfig,
} from './types'

export {
  buildPath,
  // 工具函数
  cloneRouteLocation,
  // 导航失败处理
  createNavigationFailure,
  extractParams,
  getRouteDepth,
  isChildRoute,
  isNavigationFailure,
  isSameRouteLocation,
  joinPaths,

  // 路由匹配
  matchPath,
  mergeQuery,
  // 路由位置处理
  normalizeParams,

  // 路径处理
  normalizePath,
  parsePathParams,

  // 查询参数处理
  parseQuery,
  // URL 处理
  parseURL,
  resolveRouteLocation,
  stringifyQuery,
  stringifyURL,
} from './utils'

// ==================== 便捷创建函数 ====================

/**
 * 创建完整的路由器实例（包含所有插件）
 */
export async function createFullRouter(options: {
  history: import('./types').RouterHistory
  routes: import('./types').RouteRecordRaw[]
  // 动画配置
  animation?: {
    enabled?: boolean
    defaultAnimation?: import('./core/constants').AnimationType
    customAnimations?: Record<
      string,
      import('./components/types').AnimationConfig
    >
  }
  // 缓存配置
  cache?: {
    enabled?: boolean
    strategy?: import('./core/constants').CacheStrategy
    maxSize?: number
  }
  // 预加载配置
  preload?: {
    enabled?: boolean
    strategy?: import('./core/constants').PreloadStrategy
    autoPreloadRelated?: boolean
  }
  // 性能监控配置
  performance?: {
    enabled?: boolean
    warningThreshold?: number
    errorThreshold?: number
  }
  // 其他路由器选项
  linkActiveClass?: string
  linkExactActiveClass?: string
  scrollBehavior?: import('./types').ScrollBehavior
}) {
  const { createRouter: createVueRouter } = await import('./core/router')
  // 导入插件函数
  const { createAnimationPlugin } = await import('./plugins/animation')
  const { createCachePlugin } = await import('./plugins/cache')
  const { createPerformancePlugin } = await import('./plugins/performance')
  const { createPreloadPlugin } = await import('./plugins/preload')

  const routerOptions: any = {
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass || 'router-link-active',
    linkExactActiveClass: options.linkExactActiveClass || 'router-link-exact-active',
  }
  if (options.scrollBehavior) {
    routerOptions.scrollBehavior = options.scrollBehavior
  }
  const router = createVueRouter(routerOptions)

  const plugins: any[] = []

  // 动画插件
  if (options.animation?.enabled !== false) {
    plugins.push(
      createAnimationPlugin({
        defaultAnimation: options.animation?.defaultAnimation || 'fade',
        customAnimations: options.animation?.customAnimations || {},
      }),
    )
  }

  // 缓存插件
  if (options.cache?.enabled !== false) {
    plugins.push(
      createCachePlugin({
        strategy: options.cache?.strategy || 'memory',
        maxSize: options.cache?.maxSize || 10,
      }),
    )
  }

  // 预加载插件
  if (options.preload?.enabled !== false) {
    plugins.push(
      createPreloadPlugin({
        strategy: options.preload?.strategy || 'idle',
        autoPreloadRelated: options.preload?.autoPreloadRelated || false,
      }),
    )
  }

  // 性能监控插件
  if (options.performance?.enabled !== false) {
    plugins.push(
      createPerformancePlugin({
        warningThreshold: options.performance?.warningThreshold || 1000,
        errorThreshold: options.performance?.errorThreshold || 3000,
      }),
    )
  }

  return {
    router,
    plugins,
    install(app: any) {
      app.use(router)

      // 注册 Router 组件
      app.component('router-link', RouterLink)
      app.component('router-view', RouterView)

      plugins.forEach((plugin) => {
        if (plugin.install) {
          plugin.install(app, router)
        }
      })
    },
  }
}

// ==================== 默认导出 ====================

// 注意：由于 ES 模块的限制，我们不提供默认导出
// 请使用命名导出：import { createRouter, ... } from '@ldesign/router'
