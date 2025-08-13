/**
 * @ldesign/router 主入口文件
 *
 * 一个现代化、高性能、类型安全的 Vue 路由库
 * 完全独立于 vue-router，提供更好的开发体验和性能
 */

// ==================== 核心功能导出 ====================

// Vue 组件
export { RouterLink, RouterView } from './components'
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

// ==================== 组合式 API 导出 ====================

// 历史管理
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'

// 路由匹配
export { RouteMatcher } from './core/matcher'

// 路由器核心
export { createRouter } from './core/router'

export type { RouterImpl } from './core/router'

// Engine 插件
export {
  createDefaultRouterEnginePlugin,
  createRouterEnginePlugin,
  routerPlugin,
} from './engine'

// ==================== 插件系统导出 ====================

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

// ==================== 路由守卫导出 ====================

export type { PerformancePluginOptions } from './plugins/performance'

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

// ==================== 工具函数导出 ====================

export type { PreloadPluginOptions } from './plugins/preload'

// ==================== Engine 集成导出 ====================

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
