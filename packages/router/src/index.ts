/**
 * @ldesign/router 主入口文件
 *
 * 一个现代化、高性能、类型安全的 Vue 路由库
 * 完全独立于 vue-router，提供更好的开发体验和性能
 */

// ==================== 核心功能导出 ====================

export {
  ABTestManager,
  ABTestPlugin,
  GoogleAnalyticsAdapter,
  useABTest
} from './ab-testing'
export type {
  ABTestExperiment,
  ABTestResult,
  ABTestVariant,
  AnalyticsAdapter,
  ExperimentGoal,
  TargetingRule,
  UserSegment,
  VariantStats
} from './ab-testing'
export {
  createRouteAnalytics,
  // 路由分析
  RouteAnalytics,
} from './analytics/route-analytics'

export type {
  AnalyticsConfig,
  PerformanceMetrics as AnalyticsPerformanceMetrics,
  RouteVisit,
  UserBehaviorEvent,
} from './analytics/route-analytics'

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

// ==================== 类型定义导出 ====================

export {
  LocaleSwitcher,
} from './components/LocaleSwitcher'

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

// ==================== 组件导出 ====================

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

// 工具 Hooks
export { hasRoute, hasRouter } from './composables'

// ==================== 组合式 API 导出 ====================

// 设备适配 Hooks
export { useDeviceComponent, useDeviceRoute } from './composables'

export type {
  // UseDeviceComponentOptions,
  // UseDeviceComponentReturn,
  UseDeviceRouteOptions,
  UseDeviceRouteReturn,
} from './composables'

// 组合式 API 类型
export type { UseLinkOptions, UseLinkReturn } from './composables'

export {
  FormRoutePlugin,
  useFormRoute,
  useMultiStepForm
} from './composables/useFormRoute'


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

// ==================== 插件系统导出 ====================

// ==================== Engine集成导出 ====================

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
export {
  // 开发调试工具
  createDevTools,
  DevToolsPanel,
  RouteInspector,
} from './debug/dev-tools'
// ==================== 路由调试器导出 ====================
export {
  getRouteDebugger,
  RouteDebugger,
  setupRouteDebugger,
} from './debug/RouteDebugger'

export type {
  DebugConfig,
} from './debug/RouteDebugger'
// 设备适配核心功能
export {
  createDeviceRouterPlugin,
  DeviceComponentResolver,
  DeviceRouteGuard,
} from './device'

// ==================== 路由守卫导出 ====================

// 设备适配工具函数
export {
  checkDeviceSupport,
  createUnsupportedDeviceRoute,
  resolveDeviceComponent,
} from './device/utils'

// Engine插件（用于Engine集成）
export {
  createDefaultRouterEnginePlugin,
  createRouterEnginePlugin,
  routerPlugin,
} from './engine'

// ==================== 工具函数导出 ====================

export type { RouterEnginePluginOptions } from './engine'

// ==================== Engine 集成导出 ====================

// ==================== 智能代码分割导出 ====================
export {
  CodeSplittingManager,
  CodeSplittingPlugin,
  createCodeSplittingManager,
} from './features/code-splitting'

// ==================== 设备适配功能 ====================

export type {
  ChunkInfo,
  ChunkPriority,
  LoadingMetrics as CodeSplittingMetrics,
  PreloadStrategy as CodeSplittingPreloadStrategy,
  ComponentLoadState,
  SplittingAnalysis,
  SplittingConfig,
  SplittingStrategy,
} from './features/code-splitting'

export {
  DataFetchingManager,
  DataFetchingPlugin,
  defineAsyncComponent,
  defineLoader,
  setupDataFetching,
  useRouteData,
} from './features/data-fetching'

export type {
  DataFetchingOptions,
  DataFetchingState,
  DataLoader,
  DataResolver,
} from './features/data-fetching'

// ==================== 性能优化工具 ====================

export {
  getI18nManager,
  I18nRouteManager,
  I18nRouterPlugin,
  setupI18nRouter,
  useI18nRoute,
} from './features/i18n'

export type {
  I18nRouteConfig,
} from './features/i18n'

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
  const [vueRouter, animationPlugin, cachePlugin, performancePlugin, preloadPlugin]
    = await Promise.all([
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

  // 缓存插件（优化：使用性能优化配置）
  if (options.cache?.enabled !== false) {
    plugins.push(
      cachePlugin.createCachePlugin({
        strategy: options.cache?.strategy || CacheStrategy.MEMORY,
        maxSize: options.cache?.maxSize || 3, // 优化：降低到 3MB
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

  // 性能监控插件（优化：更严格的阈值）
  if (options.performance?.enabled !== false) {
    plugins.push(
      performancePlugin.createPerformancePlugin({
        warningThreshold: options.performance?.warningThreshold || 500, // 优化：降低到 500ms
        errorThreshold: options.performance?.errorThreshold || 2000, // 优化：降低到 2000ms
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

// ==================== 路由性能分析器导出 ====================
export {
  generatePerformanceReport,
  getPerformanceAnalyzer,
  getPerformanceSuggestions,
  RoutePerformanceAnalyzer,
  setupPerformanceAnalyzer,
} from './features/RoutePerformanceAnalyzer'

export type {
  AnalyzerConfig,
  OptimizationSuggestion,
  PerformanceMetric,
  PerformanceReport,
} from './features/RoutePerformanceAnalyzer'

// ==================== 功能扩展导出 ====================

// ==================== 安全功能导出 ====================
export {
  AuthManager,
  checkPermission,
  CSRFProtection,
  getCurrentUser,
  isAuthenticated,
  PermissionManager,
  RouteSecurityManager,
  sanitizeContent,
  setupRouteSecurity,
  XSSProtection,
} from './features/RouteSecurity'

export type {
  SecurityConfig,
} from './features/RouteSecurity'

// ==================== 路由版本控制导出 ====================
export {
  createRouteVersion,
  getVersionControl,
  restoreRouteVersion,
  RouteVersionControl,
  setupRouteVersionControl,
} from './features/RouteVersionControl'

export type {
  RouteVersion,
  VersionControlConfig,
  VersionDiff,
} from './features/RouteVersionControl'

export {
  createScrollBehavior,
  getScrollManager,
  ScrollBehaviorManager,
  ScrollBehaviorPlugin,
} from './features/ScrollBehavior'

export type {
  ScrollBehaviorOptions,
} from './features/ScrollBehavior'

// ==================== 智能路由管理导出 ====================
export {
  addDynamicRoute,
  AutoRouteGenerator,
  DynamicRouteLoader,
  getRouteStatistics,
  NestedRouteOptimizer,
  RouteGroupManager,
  setupSmartRouteManager,
  SmartRouteManager,
} from './features/SmartRouteManager'

export type {
  RouteGroup,
  SmartRouteConfig,
} from './features/SmartRouteManager'

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

export {
  FormRouteManager
} from './managers/FormRouteManager'

export type {
  FormRouteConfig
} from './managers/FormRouteManager'

// 测试工具已移除

export {
  MicroFrontendPlugin,
  MicroFrontendRouter,
  useMicroFrontend
} from './micro-frontend'

export type {
  GlobalLifeCycles,
  MicroApp,
  MicroAppState,
  MicroFrontendConfig,
  SandboxConfig
} from './micro-frontend'

export {
  authMiddleware,
  createCacheMiddleware,
  createRateLimitMiddleware,
  loggingMiddleware,
  // 中间件系统
  MiddlewareManager,
  middlewareManager,
  permissionMiddleware,
  progressMiddleware,
  roleMiddleware,
  titleMiddleware,
} from './middleware'

// 懒加载功能已集成到其他模块中

// ==================== 性能监控导出 ====================

export type {
  MiddlewareConfig,
  MiddlewareContext,
  MiddlewareFunction,
} from './middleware'

// 动画插件
export {
  ANIMATION_PRESETS,
  AnimationManager,
  createAnimationConfig,
  createAnimationPlugin,
  getAnimationDuration,
  supportsAnimations,
} from './plugins/animation'

// ==================== 国际化功能导出 ====================

export type { AnimationPluginOptions } from './plugins/animation'

// 缓存插件
export {
  CacheManager,
  createCacheConfig,
  createCachePlugin,
  supportsCaching,
} from './plugins/cache'

export type { CachePluginOptions } from './plugins/cache'

// ==================== 数据预取功能导出 ====================

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

// ==================== 滚动行为功能导出 ====================

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

export type { PreloadPluginOptions } from './plugins/preload'

// ==================== 路由类型生成器导出 ====================
// 注意：类型生成器是构建时工具，不应该在浏览器代码中使用
// 如需使用，请直接导入：import { RouteTypeGenerator } from '@ldesign/router/features/type-generator'
// export {
//   generateRouteTypes,
//   RouteTypeGenerator,
//   RouteTypeGenerator as RouteTypesGenerator, // 别名兼容
//   RouteTypeGenerator as RouteTypesGeneratorPlugin, // 别名兼容
//   vitePluginRouteTypes as ViteRouteTypesPlugin,
//   WebpackPluginRouteTypes as WebpackRouteTypesPlugin
// } from './features/type-generator'

// export type {
//   TypeGeneratorOptions as RouteTypesGeneratorOptions,
//   RouteTypeInfo as RouteInfo
// } from './features/type-generator'

// ==================== 表单路由管理导出 ====================

export {
  createRouteStateManager,
  // 路由状态管理
  RouteStateManager,
  useRouteState,
} from './state/route-state'

export type {
  RouteHistoryItem,
  RouteState,
} from './state/route-state'

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
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  Router,
  RouteRecord,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouterHistory,
  RouterOptions,
  ScrollBehavior,
  ScrollPosition,
  UseRouteReturn,
  UseRouterReturn,
} from './types'

// ==================== 微前端路由集成导出 ====================

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

// ==================== A/B测试功能导出 ====================

// ==================== 内存管理器导出 ====================
export {
  cacheGet,
  CachePriority,
  cacheSet,
  cleanupMemory,
  getMemoryManager,
  UnifiedMemoryManager,
} from './utils/unified-memory-manager'

export type {
  CacheItem,
  MemoryStats,
  UnifiedMemoryConfig,
} from './utils/unified-memory-manager'

// ==================== 默认导出 ====================

// 注意：由于 ES 模块的限制，我们不提供默认导出
// 请使用命名导出：import { createRouter, ... } from '@ldesign/router'
