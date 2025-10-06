/**
 * @ldesign/router 主入口文件
 *
 * 一个现代化、高性能、类型安全的 Vue 路由库
 * 完全独立于 vue-router，提供更好的开发体验和性能
 */

// ==================== 核心功能导出 ====================

// Vue 组件
export {
  DeviceUnsupported,
  ErrorBoundary,
  ErrorRecoveryStrategies,
  RouteErrorHandler,
  RouterLink,
  RouterView,
  withErrorBoundary,
} from './components'
// 组件类型
export type {
  DeviceUnsupportedProps,
  ErrorBoundaryProps,
  RouteErrorInfo,
} from './components'
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

// ==================== 性能优化工具 ====================

export {
  hoverPreload,
  lazyLoadComponent,
  lazyLoadRoutes,
  optimizeRoutes,
  preloadRoutes,
  SmartPreloader,
  splitChunk,
  visibilityPreload,
} from './utils/lazy-load'

export type { LazyLoadOptions } from './utils/lazy-load'

// ==================== 便捷创建函数 ====================

/**
 * 创建完整的路由器实例（包含所有插件）
 * 提供一个便捷的方式来创建包含所有常用插件的路由器
 */
export async function createFullRouter(options: {
  history: import('./types').RouterHistory
  routes: import('./types').RouteRecordRaw[]
  // 动画配置
  animation?: {
    enabled?: boolean
    defaultAnimation?: import('./core/constants').AnimationType
    customAnimations?: Record<string, import('./components/types').AnimationConfig>
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
  // 动态导入以支持代码分割
  const [vueRouter, animationPlugin, cachePlugin, performancePlugin, preloadPlugin] =
    await Promise.all([
      import('./core/router'),
      import('./plugins/animation'),
      import('./plugins/cache'),
      import('./plugins/performance'),
      import('./plugins/preload'),
    ])

  const { RouterLink, RouterView } = await import('./components')
  const { DEFAULT_LINK_ACTIVE_CLASS, DEFAULT_LINK_EXACT_ACTIVE_CLASS, AnimationType, CacheStrategy, PreloadStrategy } = await import('./core/constants')

  const routerOptions: import('./types').RouterOptions = {
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass || DEFAULT_LINK_ACTIVE_CLASS,
    linkExactActiveClass: options.linkExactActiveClass || DEFAULT_LINK_EXACT_ACTIVE_CLASS,
  }

  if (options.scrollBehavior) {
    routerOptions.scrollBehavior = options.scrollBehavior
  }

  const router = vueRouter.createRouter(routerOptions)
  const plugins: any[] = []

  // 动画插件
  if (options.animation?.enabled !== false) {
    plugins.push(
      animationPlugin.createAnimationPlugin({
        defaultAnimation: options.animation?.defaultAnimation || AnimationType.FADE,
        customAnimations: options.animation?.customAnimations || {},
      }),
    )
  }

  // 缓存插件（优化：减少默认缓存大小）
  if (options.cache?.enabled !== false) {
    plugins.push(
      cachePlugin.createCachePlugin({
        strategy: options.cache?.strategy || CacheStrategy.MEMORY,
        maxSize: options.cache?.maxSize || 5, // 优化：从10降低到5
      }),
    )
  }

  // 预加载插件
  if (options.preload?.enabled !== false) {
    plugins.push(
      preloadPlugin.createPreloadPlugin({
        strategy: options.preload?.strategy || PreloadStrategy.IDLE,
        autoPreloadRelated: options.preload?.autoPreloadRelated ?? false,
      }),
    )
  }

  // 性能监控插件
  if (options.performance?.enabled !== false) {
    plugins.push(
      performancePlugin.createPerformancePlugin({
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

      // 注册全局组件
      app.component('RouterLink', RouterLink)
      app.component('RouterView', RouterView)
      // 兼容 kebab-case
      app.component('router-link', RouterLink)
      app.component('router-view', RouterView)

      // 安装所有插件
      plugins.forEach((plugin) => {
        if (plugin.install) {
          plugin.install(app, router)
        }
      })
    },
  }
}

// ==================== 开发工具导出 ====================

export {
  // 开发调试工具
  createDevTools,
  DevToolsPanel,
  RouteInspector,
} from './debug/dev-tools'

export {
  // 测试工具
  RouterTestUtils,
  RouteAssertions,
  RoutePerformanceTester,
  createTestRouter,
  createRouteAssertions,
  createPerformanceTester,
  setupRouterTest,
  testRoutes,
} from './testing/test-utils'

// ==================== 功能扩展导出 ====================

export {
  // 中间件系统
  MiddlewareManager,
  middlewareManager,
  authMiddleware,
  permissionMiddleware,
  roleMiddleware,
  loggingMiddleware,
  titleMiddleware,
  progressMiddleware,
  createCacheMiddleware,
  createRateLimitMiddleware,
} from './middleware'

export type {
  MiddlewareFunction,
  MiddlewareContext,
  MiddlewareConfig,
} from './middleware'

export {
  // 路由状态管理
  RouteStateManager,
  createRouteStateManager,
  useRouteState,
} from './state/route-state'

export type {
  RouteHistoryItem,
  RouteState,
} from './state/route-state'

export {
  // 路由分析
  RouteAnalytics,
  createRouteAnalytics,
} from './analytics/route-analytics'

export type {
  RouteVisit,
  PerformanceMetrics,
  UserBehaviorEvent,
  AnalyticsConfig,
} from './analytics/route-analytics'

// ==================== 默认导出 ====================

// 注意：由于 ES 模块的限制，我们不提供默认导出
// 请使用命名导出：import { createRouter, ... } from '@ldesign/router'
