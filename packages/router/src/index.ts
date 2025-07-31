// 核心功能
// 导入用于默认导出
import { createRouter } from './router'
import { createMemoryHistory, createWebHashHistory, createWebHistory } from './history'
import { RouterLink, RouterView } from './components'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useLink,
  useRoute,
  useRouter,
} from './composables'
import {
  NavigationFailureType,
  createGuardManager,
  isNavigationFailure,
} from './guards'
import { START_LOCATION } from './constants'

export { createRouter } from './router'
export { createWebHistory, createWebHashHistory, createMemoryHistory } from './history'
export { createRouterMatcher } from './matcher'

// 组件
export { RouterView, RouterLink } from './components'

// 组合式 API
export {
  useRouter,
  useRoute,
  useLink,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
} from './composables'

// 导航守卫
export {
  GuardManager,
  createGuardManager,
  NavigationFailureType,
  isNavigationFailure,
  createNavigationFailure,
} from './guards'

// 类型定义
export type {
  Router,
  RouteRecordRaw,
  RouteLocation,
  RouteLocationRaw,
  RouteLocationNormalized,
  RouteParams,
  RouteQuery,
  RouteMeta,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationFailure,
  RouterHistory,
  RouterOptions,
  UseRouterReturn,
  UseRouteReturn,
  RouteComponent,
  RouteRecordNormalized,
  HistoryLocation,
  HistoryState,
  ScrollPosition,
  ScrollBehavior,
} from './types'

// 组件类型
export type {
  RouterViewProps,
  RouterLinkProps,
  RouterViewSlotProps,
  RouterLinkSlotProps,
} from './components/types'

// 常量
export {
  START_LOCATION,
  NavigationFailureType as NavigationFailureTypeEnum,
  ErrorTypes,
  ROUTER_VIEW_LOCATION_SYMBOL,
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
} from './constants'

// 工具函数
export {
  parseURL,
  stringifyURL,
  parseQuery,
  stringifyQuery,
  normalizeParams,
  warn,
  assert,
  deepClone,
  merge,
  isSameRouteLocation,
  debounce,
  throttle,
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
