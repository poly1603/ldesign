/**
 * 核心模块导出
 *
 * 这个模块包含路由器的核心功能，包括：
 * - 路由器创建和配置
 * - 路由匹配器
 * - 历史管理
 * - 常量定义
 */

// 核心类型
export type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationFailure,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,
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
} from '../types'
export {
  DEFAULT_LINK_ACTIVE_CLASS,
  DEFAULT_LINK_EXACT_ACTIVE_CLASS,
  DEFAULT_VIEW_NAME,
  EMPTY_STRING,
  ErrorTypes,
  HASH_SEPARATOR,
  NavigationFailureType,
  OPTIONAL_PARAM_RE,
  PARAM_RE,
  PATH_SEPARATOR,
  QUERY_ITEM_SEPARATOR,
  QUERY_KV_SEPARATOR,
  QUERY_SEPARATOR,
  ROOT_PATH,
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
  ROUTER_VIEW_LOCATION_SYMBOL,
  START_LOCATION,
  WILDCARD_RE,
} from './constants'
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './history'
export { createRouterMatcher } from './matcher'
export type { RouterMatcher } from './matcher'

export { createRouter } from './router'
