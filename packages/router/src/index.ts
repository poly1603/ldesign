/**
 * @ldesign/router - 简化的Vue路由解决方案
 *
 * 提供与LDesign Engine完美集成的路由功能
 */

// ==================== 主要API ====================

// 路由插件（推荐的集成方式）
// ==================== 默认导出 ====================

import { RouterLink, RouterView } from './components'
import {
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
import { START_LOCATION } from './core/constants'
import {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'
import { createRouter } from './core/router'
import { isNavigationFailure, NavigationFailureType } from './guards'
import { routerPlugin } from './plugin'

// Vue组件
export { RouterLink, RouterView } from './components'
export type {
  RouterLinkProps,
  RouterLinkSlotProps,
  RouterViewProps,
  RouterViewSlotProps,
} from './components/types'

// ==================== 核心功能 ====================

// 组合式API
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
export { START_LOCATION } from './core/constants'

export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from './core/history'
// 路由器创建
export { createRouter } from './core/router'

// 导航守卫
export { isNavigationFailure, NavigationFailureType } from './guards'

export { routerPlugin } from './plugin'

export type { RouterPluginOptions } from './plugin'

// ==================== 插件系统 ====================

export {
  EnhancedComponentsPlugin,
  RouterPerformancePlugin,
  RouterCachePlugin,
  createPerformancePlugin,
  createCachePlugin,
  createEnhancementConfig,
} from './plugins'

export type {
  ComponentEnhancementConfig,
  PerformanceConfig,
  PerformanceData,
  CacheConfig,
  CacheStrategy,
} from './plugins'

// ==================== 类型定义 ====================

export type {
  HistoryLocation,
  HistoryState,
  // 导航
  NavigationFailure,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardReturn,
  NavigationHookAfter,

  // 路由组件
  RouteComponent,
  RouteLocation,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  // 核心类型
  Router,
  RouteRecordNormalized,
  RouteRecordRaw,
  // 历史记录
  RouterHistory,
  RouterOptions,

  // 滚动行为
  ScrollBehavior,
  ScrollPosition,
  UseRouteReturn,
  // 组合式API返回类型
  UseRouterReturn,
} from './types'

// ==================== 工具函数 ====================

export {
  isSameRouteLocation,
  normalizeParams,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
} from './utils'

export default {
  // 推荐API
  routerPlugin,

  // 核心API
  createRouter,
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,

  // 组件
  RouterView,
  RouterLink,

  // 组合式API
  useRouter,
  useRoute,
  useLink,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,

  // 工具
  isNavigationFailure,
  NavigationFailureType,
  START_LOCATION,
}
