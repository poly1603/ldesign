/**
 * @ldesign/router 主入口文件
 *
 * 一个现代化、高性能、类型安全的 Vue 路由库
 * 完全独立于 vue-router，提供更好的开发体验和性能
 */

// ==================== 核心功能导出 ====================

// 路由器核心
export { createRouter } from './core/router'
export type { RouterImpl } from './core/router'

// 历史管理
export {
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
} from './core/history'

// 路由匹配
export { RouteMatcher } from './core/matcher'

// 常量
export {
  START_LOCATION,
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
  DEFAULT_VIEW_NAME,
  NavigationFailureType,
  ErrorTypes,
  AnimationType,
  PreloadStrategy,
  CacheStrategy,
} from './core/constants'

// ==================== 类型定义导出 ====================

// 核心类型
export type {
  Router,
  RouterOptions,
  RouterHistory,
  RouteRecordRaw,
  RouteRecordNormalized,
  RouteLocationRaw,
  RouteLocationNormalized,
  RouteLocationBase,
  RouteParams,
  RouteQuery,
  RouteMeta,
  RouteComponent,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationFailure,
  NavigationCallback,
  NavigationInformation,
  NavigationType,
  NavigationDirection,
  HistoryLocation,
  HistoryState,
  ScrollBehavior,
  ScrollPosition,
  UseRouteReturn,
  UseRouterReturn,
} from './types'

// ==================== 组件导出 ====================

// Vue 组件
export { RouterLink, RouterView } from './components'

// 组件类型
export type {
  RouterLinkProps,
  RouterLinkSlotProps,
  RouterViewProps,
  RouterViewSlotProps,
  ComponentSize,
  LinkVariant,
  PreloadStrategy as ComponentPreloadStrategy,
  AnimationType as ComponentAnimationType,
  CacheStrategy as ComponentCacheStrategy,
  AnimationConfig,
  CacheConfig,
  PreloadConfig,
  PerformanceConfig,
  PerformanceMetrics,
} from './components/types'

// ==================== 组合式 API 导出 ====================

// 核心 Hooks
export { useRouter, useRoute, useNavigation, useLink } from './composables'

// 参数 Hooks
export {
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
} from './composables'

// 守卫 Hooks
export { onBeforeRouteUpdate, onBeforeRouteLeave } from './composables'

// 工具 Hooks
export { hasRouter, hasRoute } from './composables'

// 组合式 API 类型
export type { UseLinkOptions, UseLinkReturn } from './composables'

// ==================== 插件系统导出 ====================

// 动画插件
export {
  createAnimationPlugin,
  AnimationManager,
  ANIMATION_PRESETS,
  createAnimationConfig,
  supportsAnimations,
  getAnimationDuration,
} from './plugins/animation'
export type { AnimationPluginOptions } from './plugins/animation'

// 缓存插件
export {
  createCachePlugin,
  CacheManager,
  createCacheConfig,
  supportsCaching,
} from './plugins/cache'
export type { CachePluginOptions } from './plugins/cache'

// 预加载插件
export {
  createPreloadPlugin,
  PreloadManager,
  HoverPreloadStrategy,
  VisibilityPreloadStrategy,
  IdlePreloadStrategy,
  createPreloadConfig,
  supportsPreload,
} from './plugins/preload'
export type { PreloadPluginOptions } from './plugins/preload'

// 性能监控插件
export {
  createPerformancePlugin,
  PerformanceManager,
  PerformanceEventType,
  withPerformanceMonitoring,
  createPerformanceConfig,
  supportsPerformanceAPI,
  getPagePerformance,
} from './plugins/performance'
export type { PerformancePluginOptions } from './plugins/performance'

// ==================== 路由守卫导出 ====================

export {
  createPermissionGuard,
  createAuthGuard,
  createLoadingGuard,
  createTitleGuard,
  createScrollGuard,
  createProgressGuard,
  combineGuards,
} from './guards'

export type {
  PermissionChecker,
  PermissionGuardOptions,
  AuthChecker,
  AuthGuardOptions,
  LoadingGuardOptions,
  TitleGuardOptions,
  ScrollGuardOptions,
  ProgressGuardOptions,
} from './guards'

// ==================== 工具函数导出 ====================

export {
  // 路径处理
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,

  // 查询参数处理
  parseQuery,
  stringifyQuery,
  mergeQuery,

  // URL 处理
  parseURL,
  stringifyURL,

  // 路由位置处理
  normalizeParams,
  isSameRouteLocation,
  resolveRouteLocation,

  // 导航失败处理
  createNavigationFailure,
  isNavigationFailure,

  // 路由匹配
  matchPath,
  extractParams,

  // 工具函数
  cloneRouteLocation,
  getRouteDepth,
  isChildRoute,
} from './utils'

// ==================== Engine 集成导出 ====================

// Engine 插件
export {
  createRouterEnginePlugin,
  routerPlugin,
  createDefaultRouterEnginePlugin,
} from './engine'
export type { RouterEnginePluginOptions } from './engine'

// ==================== 便捷创建函数 ====================

/**
 * 创建完整的路由器实例（包含所有插件）
 */
export function createFullRouter(options: {
  history: RouterHistory
  routes: RouteRecordRaw[]
  // 动画配置
  animation?: {
    enabled?: boolean
    defaultAnimation?: AnimationType
    customAnimations?: Record<string, AnimationConfig>
  }
  // 缓存配置
  cache?: {
    enabled?: boolean
    strategy?: CacheStrategy
    maxSize?: number
  }
  // 预加载配置
  preload?: {
    enabled?: boolean
    strategy?: PreloadStrategy
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
  scrollBehavior?: ScrollBehavior
}) {
  const router = createRouter({
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass,
    linkExactActiveClass: options.linkExactActiveClass,
    scrollBehavior: options.scrollBehavior,
  })

  const plugins = []

  // 动画插件
  if (options.animation?.enabled !== false) {
    plugins.push(
      createAnimationPlugin({
        defaultAnimation: options.animation?.defaultAnimation,
        customAnimations: options.animation?.customAnimations,
      })
    )
  }

  // 缓存插件
  if (options.cache?.enabled !== false) {
    plugins.push(
      createCachePlugin({
        strategy: options.cache?.strategy,
        maxSize: options.cache?.maxSize,
      })
    )
  }

  // 预加载插件
  if (options.preload?.enabled !== false) {
    plugins.push(
      createPreloadPlugin({
        strategy: options.preload?.strategy,
        autoPreloadRelated: options.preload?.autoPreloadRelated,
      })
    )
  }

  // 性能监控插件
  if (options.performance?.enabled !== false) {
    plugins.push(
      createPerformancePlugin({
        warningThreshold: options.performance?.warningThreshold,
        errorThreshold: options.performance?.errorThreshold,
      })
    )
  }

  return {
    router,
    plugins,
    install(app: any) {
      app.use(router)
      plugins.forEach(plugin => {
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
