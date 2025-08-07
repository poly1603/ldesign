/**
 * 核心模块导出
 *
 * 这个模块包含路由器的核心功能，包括：
 * - 路由器创建和配置
 * - 路由匹配器
 * - 历史管理
 * - 常量定义
 */

export { createRouter } from '../router'
export { createRouterMatcher } from '../matcher'
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from '../history'
export { START_LOCATION, NavigationFailureType, ErrorTypes } from '../constants'

// 核心类型
export type {
  Router,
  RouterOptions,
  RouteRecordRaw,
  RouteRecordNormalized,
  RouteLocation,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  RouterHistory,
  HistoryLocation,
  HistoryState,
} from '../types'
