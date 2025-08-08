// 核心模块
// 向后兼容的导入
import { RouterLink, RouterView } from './components'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useLink,
  useRoute,
  useRouter,
} from './composables'
import { START_LOCATION } from './core/constants'
import {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'
import { createRouter } from './core/router'
import {
  createGuardManager,
  isNavigationFailure,
  NavigationFailureType,
} from './guards'

// 高级功能模块
export * from './advanced'

export { createRouteCacheManager } from './advanced/cache'

export { createPerformanceMonitor } from './advanced/performance'

// 高级功能
export { createRoutePreloader } from './advanced/preloader'

// 组件模块
export * from './components'

// 组件
export { RouterLink, RouterView } from './components'

// 组件类型
export type {
  RouterLinkProps,
  RouterLinkSlotProps,
  RouterViewProps,
  RouterViewSlotProps,
} from './components/types'

// 组合式 API 模块
export * from './composables'

// 组合式 API
export {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useHash,
  useLink,
  useMatched,
  useMeta,
  useParams,
  useQuery,
  useRoute,
  useRouter,
} from './composables'

export * from './core'
// 常量
export {
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
  ErrorTypes,
  NavigationFailureType as NavigationFailureTypeEnum,
  ROUTER_VIEW_LOCATION_SYMBOL,
  START_LOCATION,
} from './core/constants'
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'

export { createRouterMatcher } from './core/matcher'

export { createRouter } from './core/router'

// 错误处理
export * from './errors'

// 导航守卫
export * from './guards'

// 导航守卫
export {
  createGuardManager,
  createNavigationFailure,
  GuardManager,
  isNavigationFailure,
  NavigationFailureType,
} from './guards'

// 插件系统
export * from './plugins'
// 类型定义
export * from './types'
// 类型定义
export type {
  HistoryLocation,
  HistoryState,
  NavigationFailure,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
  PreloadStrategy,
  RouteCacheConfig,
  RouteComponent,
  RouteLocation,
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
  RouteTransition,
  ScrollBehavior,
  ScrollPosition,
  UseRouteReturn,
  UseRouterReturn,
} from './types'

// 工具模块
export * from './utils'

// 工具函数
export {
  assert,
  debounce,
  deepClone,
  isSameRouteLocation,
  merge,
  normalizeParams,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
  throttle,
  warn,
} from './utils'

// 默认导出
export default {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
  RouterView,
  RouterLink,
  useRouter,
  useRoute,
  useLink,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  NavigationFailureType,
  isNavigationFailure,
  START_LOCATION,
  createGuardManager,
}
