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
import { createMemoryHistory, createWebHashHistory, createWebHistory } from './history'
// 核心功能
// 导入用于默认导出
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

export { createMemoryHistory, createWebHashHistory, createWebHistory } from './history'

export { createRouterMatcher } from './matcher'

export { createRouter } from './router'

// 类型定义
export type {
  HistoryLocation,
  HistoryState,
  NavigationFailure,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
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
