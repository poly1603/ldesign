// 核心模块
export * from './core'

// 导航模块
export * from './navigation'

// 高级功能模块
export * from './advanced'

// 组件模块
export * from './components'

// 组合式 API 模块
export * from './composables'

// 工具模块
export * from './utils'

// 插件系统
export * from './plugins'

// 错误处理
export * from './errors'

// 配置管理
export * from './config'

// 向后兼容的导入
import { RouterLink, RouterView } from './components'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useLink,
  useRoute,
  useRouter,
} from './composables'
import { START_LOCATION } from './constants'
import {
  createGuardManager,
  isNavigationFailure,
  NavigationFailureType,
} from './guards'
import {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './history'
import { createRouter } from './router'

// 组件
export { RouterLink, RouterView } from './components'
// 组件类型
export type {
  RouterLinkProps,
  RouterLinkSlotProps,
  RouterViewProps,
  RouterViewSlotProps,
} from './components/types'
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

// 常量
export {
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
  ErrorTypes,
  NavigationFailureType as NavigationFailureTypeEnum,
  ROUTER_VIEW_LOCATION_SYMBOL,
  START_LOCATION,
} from './constants'

// 导航守卫
export {
  createGuardManager,
  createNavigationFailure,
  GuardManager,
  isNavigationFailure,
  NavigationFailureType,
} from './guards'

export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './history'

export { createRouterMatcher } from './matcher'

export { createRouter } from './router'

// 高级功能
export { createRoutePreloader } from './preloader'
export { createRouteCacheManager } from './cache'
export { createPerformanceMonitor } from './performance'

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
